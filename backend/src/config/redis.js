// backend/src/config/redis.js
// Redis configuration for distributed rate limiting
// Install: npm install redis rate-limit-redis

const redis = require('redis');

let redisClient = null;
let isRedisEnabled = false;

/**
 * Initialize Redis connection
 * Falls back gracefully if Redis is not available
 */
async function initializeRedis() {
    // Check if Redis is configured
    const REDIS_URL = process.env.REDIS_URL || process.env.REDIS_CONNECTION_STRING;
    
    if (!REDIS_URL) {
        console.log('⚠️  Redis not configured - using in-memory rate limiting');
        console.log('💡 For production with multiple instances, set REDIS_URL environment variable');
        return null;
    }

    try {
        console.log('🔄 Connecting to Redis...');
        
        redisClient = redis.createClient({
            url: REDIS_URL,
            socket: {
                connectTimeout: 5000,
                reconnectStrategy: (retries) => {
                    if (retries > 10) {
                        console.error('❌ Redis reconnection failed after 10 attempts');
                        return new Error('Redis reconnection limit reached');
                    }
                    const delay = Math.min(retries * 100, 3000);
                    console.log(`⏳ Redis reconnecting in ${delay}ms (attempt ${retries})`);
                    return delay;
                }
            }
        });

        redisClient.on('error', (err) => {
            console.error('❌ Redis error:', err.message);
            isRedisEnabled = false;
        });

        redisClient.on('connect', () => {
            console.log('✅ Redis connected');
            isRedisEnabled = true;
        });

        redisClient.on('disconnect', () => {
            console.warn('⚠️  Redis disconnected');
            isRedisEnabled = false;
        });

        redisClient.on('reconnecting', () => {
            console.log('🔄 Redis reconnecting...');
        });

        await redisClient.connect();
        
        // Test connection
        await redisClient.ping();
        console.log('✅ Redis connection successful');
        
        return redisClient;
    } catch (error) {
        console.error('❌ Failed to connect to Redis:', error.message);
        console.log('⚠️  Falling back to in-memory rate limiting');
        redisClient = null;
        isRedisEnabled = false;
        return null;
    }
}

/**
 * Get Redis client
 */
function getRedisClient() {
    return redisClient;
}

/**
 * Check if Redis is available
 */
function isRedisAvailable() {
    return isRedisEnabled && redisClient && redisClient.isOpen;
}

/**
 * Close Redis connection
 */
async function closeRedis() {
    if (redisClient) {
        try {
            await redisClient.quit();
            console.log('✅ Redis connection closed');
        } catch (err) {
            console.error('❌ Error closing Redis:', err.message);
        }
    }
}

/**
 * Get Redis stats for monitoring
 */
async function getRedisStats() {
    if (!isRedisAvailable()) {
        return { status: 'disconnected' };
    }

    try {
        const info = await redisClient.info();
        return {
            status: 'connected',
            connected_clients: info.match(/connected_clients:(\d+)/)?.[1] || 'unknown',
            used_memory: info.match(/used_memory_human:(.+)/)?.[1] || 'unknown',
            uptime: info.match(/uptime_in_seconds:(\d+)/)?.[1] || 'unknown'
        };
    } catch (err) {
        return {
            status: 'error',
            error: err.message
        };
    }
}

module.exports = {
    initializeRedis,
    getRedisClient,
    isRedisAvailable,
    closeRedis,
    getRedisStats
};
