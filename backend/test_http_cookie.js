// Test script untuk HTTP-only cookie implementation
// Run: node backend/test_http_cookie.js

const http = require('http');

const API_BASE = 'http://localhost:5000';

// Helper untuk parse cookies dari response header
function parseCookies(setCookieHeader) {
    if (!setCookieHeader) return {};
    const cookies = {};
    if (Array.isArray(setCookieHeader)) {
        setCookieHeader.forEach(cookieStr => {
            const parts = cookieStr.split(';');
            const [nameValue] = parts;
            const [name, value] = nameValue.split('=');
            cookies[name.trim()] = {
                value: value,
                raw: cookieStr
            };
        });
    }
    return cookies;
}

// Helper untuk make HTTP request
function makeRequest(options, postData = null) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    body: data,
                    cookies: parseCookies(res.headers['set-cookie'])
                });
            });
        });
        
        req.on('error', reject);
        
        if (postData) {
            req.write(postData);
        }
        
        req.end();
    });
}

async function testHttpOnlyCookie() {
    console.log('🧪 Testing HTTP-only Cookie Implementation\n');
    
    try {
        // Test 1: Login dan pastikan cookie ter-set
        console.log('📝 Test 1: Login dengan admin credentials');
        const loginData = JSON.stringify({
            username: 'admin',
            password: 'admin123',
            user_type: 'admin'
        });
        
        const loginOptions = {
            hostname: 'localhost',
            port: 5000,
            path: '/api/auth/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(loginData)
            }
        };
        
        const loginResponse = await makeRequest(loginOptions, loginData);
        console.log(`   Status: ${loginResponse.statusCode}`);
        
        if (loginResponse.statusCode === 200) {
            console.log('   ✅ Login successful');
            
            const loginBody = JSON.parse(loginResponse.body);
            console.log(`   User: ${loginBody.user.username} (${loginBody.user.role})`);
            
            // Check if token is in response body
            if (loginBody.token) {
                console.log('   ❌ WARNING: Token masih ada di response body!');
            } else {
                console.log('   ✅ Token TIDAK ada di response body (Good!)');
            }
            
            // Check if cookie is set
            if (loginResponse.cookies.authToken) {
                console.log('   ✅ Cookie "authToken" ter-set');
                console.log(`   Cookie details: ${loginResponse.cookies.authToken.raw}`);
                
                // Verify HttpOnly flag
                if (loginResponse.cookies.authToken.raw.includes('HttpOnly')) {
                    console.log('   ✅ HttpOnly flag: ENABLED');
                } else {
                    console.log('   ❌ HttpOnly flag: MISSING!');
                }
                
                // Verify SameSite
                if (loginResponse.cookies.authToken.raw.includes('SameSite')) {
                    console.log('   ✅ SameSite flag: ENABLED');
                } else {
                    console.log('   ⚠️  SameSite flag: MISSING');
                }
                
                // Test 2: Use cookie to access protected endpoint
                console.log('\n📝 Test 2: Akses protected endpoint dengan cookie');
                
                const cookieValue = loginResponse.cookies.authToken.value;
                
                const meOptions = {
                    hostname: 'localhost',
                    port: 5000,
                    path: '/api/auth/me',
                    method: 'GET',
                    headers: {
                        'Cookie': `authToken=${cookieValue}`
                    }
                };
                
                const meResponse = await makeRequest(meOptions);
                console.log(`   Status: ${meResponse.statusCode}`);
                
                if (meResponse.statusCode === 200) {
                    console.log('   ✅ Protected endpoint accessible with cookie');
                    const meBody = JSON.parse(meResponse.body);
                    console.log(`   User verified: ${meBody.user.username}`);
                } else {
                    console.log('   ❌ Failed to access protected endpoint');
                    console.log(`   Response: ${meResponse.body}`);
                }
                
                // Test 3: Logout dan verify cookie di-clear
                console.log('\n📝 Test 3: Logout dan verify cookie cleared');
                
                const logoutOptions = {
                    hostname: 'localhost',
                    port: 5000,
                    path: '/api/auth/logout',
                    method: 'POST',
                    headers: {
                        'Cookie': `authToken=${cookieValue}`
                    }
                };
                
                const logoutResponse = await makeRequest(logoutOptions);
                console.log(`   Status: ${logoutResponse.statusCode}`);
                
                if (logoutResponse.statusCode === 200) {
                    console.log('   ✅ Logout successful');
                    
                    // Check if cookie is cleared
                    if (logoutResponse.headers['set-cookie']) {
                        const clearCookie = logoutResponse.headers['set-cookie'].find(c => c.includes('authToken'));
                        if (clearCookie && clearCookie.includes('Max-Age=0')) {
                            console.log('   ✅ Cookie cleared (Max-Age=0)');
                        } else {
                            console.log('   ⚠️  Cookie clearing unclear');
                        }
                    }
                } else {
                    console.log('   ❌ Logout failed');
                }
                
                // Test 4: Try to access protected endpoint after logout
                console.log('\n📝 Test 4: Akses protected endpoint SETELAH logout');
                
                const meAfterLogoutResponse = await makeRequest(meOptions);
                console.log(`   Status: ${meAfterLogoutResponse.statusCode}`);
                
                if (meAfterLogoutResponse.statusCode === 401) {
                    console.log('   ✅ Protected endpoint correctly returns 401 Unauthorized');
                } else {
                    console.log('   ❌ WARNING: Protected endpoint masih accessible!');
                }
                
            } else {
                console.log('   ❌ Cookie "authToken" TIDAK ter-set!');
            }
        } else {
            console.log(`   ❌ Login failed: ${loginResponse.body}`);
        }
        
        console.log('\n✅ Testing complete!\n');
        
    } catch (error) {
        console.error('❌ Test error:', error);
    }
}

// Run tests
testHttpOnlyCookie();
