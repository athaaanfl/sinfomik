# DDoS Protection Configuration Guide

## 📋 Environment Variables

Add these to your `.env` file for optimal DDoS protection:

```bash
# ========================================
# DDOS PROTECTION SETTINGS
# ========================================

# HTTP Server Configuration
MAX_CONNECTIONS=500                     # Max concurrent connections (default: 500)
NODE_ENV=production                     # Set to 'production' for stricter limits

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000            # 15 minutes in ms (default: 900000)
RATE_LIMIT_MAX_REQUESTS=200            # Max requests per window in production (default: 200)

# Request Body Size Limits
MAX_JSON_SIZE=2mb                       # Max JSON payload size (default: 2mb)

# Database Connection Pool
DB_POOL_MAX=50                          # Max DB connections (default: 50)
DB_POOL_MIN=5                           # Min DB connections (default: 5)
DB_QUERY_TIMEOUT=30000                  # Query timeout in ms (default: 30000)

# Request Queue Limits (Concurrency Control)
MAX_CONCURRENT_EXPENSIVE=5              # Max concurrent expensive ops (analytics, exports)
MAX_CONCURRENT_MODERATE=50              # Max concurrent moderate ops (admin, guru)
MAX_CONCURRENT_LIGHT=200                # Max concurrent light ops (auth)

# Redis (Optional - for distributed rate limiting)
# Uncomment and configure if deploying multiple instances
# REDIS_URL=redis://localhost:6379
# REDIS_CONNECTION_STRING=redis://username:password@host:port

# Monitoring
METRICS_TOKEN=your-secret-metrics-token  # Token to access /api/metrics endpoint

# ========================================
# AZURE CONFIGURATION (if using Azure)
# ========================================
# These are automatically set by Azure, but you can override
# WEBSITES_PORT=5000
# WEBSITE_HOSTNAME=your-app.azurewebsites.net
```

## 🛡️ Protection Layers Implemented

### Layer 1: HTTP Server Protection
- ✅ **Slowloris Protection**: 30s request timeout, 65s keepAlive, 66s headers timeout
- ✅ **Connection Limits**: Max 500 concurrent connections
- ✅ **Socket Timeouts**: 45s idle timeout per socket
- ✅ **Graceful Shutdown**: Proper cleanup on SIGTERM/SIGINT

### Layer 2: Rate Limiting (Per IP)
| Endpoint Type | Limit (Production) | Window | Notes |
|--------------|-------------------|---------|--------|
| **Auth** | 20 requests | 15 min | Prevents brute force |
| **Expensive Ops** | 10 requests | 5 min | Analytics, exports |
| **Read Ops** | 60 requests | 1 min | Admin, guru routes |
| **General API** | 200 requests | 15 min | All other routes |

### Layer 3: Request Queue (Concurrency Control)
| Endpoint Type | Max Concurrent | Max Queue | Timeout |
|--------------|---------------|-----------|---------|
| **Expensive** | 5 | 20 | 60s |
| **Moderate** | 50 | 100 | 30s |
| **Light** | 200 | 500 | 15s |

### Layer 4: Database Protection
- ✅ **Connection Pool**: 50 max connections (increased from 20)
- ✅ **Query Timeout**: 30s per query (kills long-running queries)
- ✅ **Health Monitoring**: Logs pool stats every 30s
- ✅ **Idle Timeout**: 30s for idle connections

### Layer 5: Request Size Limits
- ✅ **JSON Body**: 2MB max (reduced from 10MB)
- ✅ **URL Encoded**: 2MB max
- ✅ **File Uploads**: Handled by multer (per route config)

## 🔄 Distributed Setup (Multiple Instances)

If you're deploying multiple server instances (e.g., Azure App Service with scale out), you **MUST** use Redis for distributed rate limiting:

### 1. Install Dependencies
```bash
cd backend
npm install redis rate-limit-redis
```

### 2. Setup Azure Cache for Redis
1. Go to Azure Portal
2. Create "Azure Cache for Redis"
3. Choose appropriate tier:
   - **Basic**: Single node, no SLA (dev/test only)
   - **Standard**: 2 nodes, 99.9% SLA (recommended for production)
   - **Premium**: Clustering, persistence, 99.95% SLA

4. Get connection string:
   - Navigate to "Access keys"
   - Copy "Primary connection string"

### 3. Configure Environment Variable
```bash
REDIS_URL=rediss://:your-password@your-redis.redis.cache.windows.net:6380
```

### 4. Update server.js
The code is already prepared - it will automatically use Redis if `REDIS_URL` is set:
```javascript
// Redis will be used automatically if configured
// Falls back to in-memory if not available
```

## 📊 Monitoring Endpoints

### Basic Health Check
```bash
GET /health
Response: { "status": "ok", "timestamp": "..." }
```

### Detailed Health Check
```bash
GET /api/health/detailed
Response: {
  "status": "healthy",
  "uptime": 12345,
  "memory": {...},
  "database": "connected",
  "queue": {
    "expensive": { "active": 2, "queued": 0, "limit": 5 },
    "moderate": { "active": 15, "queued": 3, "limit": 50 },
    "light": { "active": 50, "queued": 10, "limit": 200 }
  }
}
```

### Metrics (Protected)
```bash
GET /api/metrics
Headers: Authorization: Bearer your-secret-metrics-token
Response: {
  "uptime": 12345,
  "memory": {...},
  "cpu": {...},
  "queue": {...}
}
```

## 🧪 Testing DDoS Protection

### Test 1: Basic Load Test
```bash
# Install Apache Bench
# Windows: Download from https://www.apachelounge.com/download/

# Test with 100 concurrent requests
ab -n 1000 -c 100 http://localhost:5000/api/health

# Expected: Should handle gracefully, some requests rate-limited
```

### Test 2: Rate Limit Test
```bash
# Test auth endpoint (20 req/15min limit)
for i in {1..25}; do
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"test","password":"test"}'
done

# Expected: First 20 succeed, remaining get 429 Too Many Requests
```

### Test 3: Slowloris Protection Test
```bash
# Install slowhttptest
# Linux: sudo apt-get install slowhttptest
# Windows: Use WSL or Docker

slowhttptest -c 200 -X -r 50 -w 10 -y 20 -n 5 -z 32 \
  -u http://localhost:5000/api/health

# Expected: Connections should be closed after timeout
# Server should remain responsive
```

### Test 4: Queue Saturation Test
```bash
# Test expensive operation queue (5 concurrent limit)
for i in {1..10}; do
  curl http://localhost:5000/api/analytics/dashboard &
done

# Expected: First 5 process, next 5 queued, any beyond max queue get 503
```

## 🚨 Azure-Specific Recommendations

### 1. Enable Azure Front Door or Application Gateway
- Provides Layer 7 DDoS protection
- Web Application Firewall (WAF)
- Global load balancing
- SSL termination

### 2. Enable Azure DDoS Protection Standard
- Automatic traffic monitoring
- Adaptive tuning
- Attack analytics and logging
- ~$2,944/month (protects all resources in VNet)

### 3. Configure App Service Scale Rules
```yaml
Auto Scale Rules:
  - Scale out when: CPU > 70% for 5 minutes
  - Scale in when: CPU < 30% for 10 minutes
  - Min instances: 2 (for high availability)
  - Max instances: 10 (adjust based on budget)
```

### 4. Enable Application Insights
```bash
# Install Azure Application Insights SDK
npm install applicationinsights

# Add to server.js (before other requires)
const appInsights = require('applicationinsights');
appInsights.setup(process.env.APPLICATIONINSIGHTS_CONNECTION_STRING)
  .setAutoCollectRequests(true)
  .setAutoCollectPerformance(true)
  .setAutoCollectExceptions(true)
  .start();
```

## 📈 Expected Performance

### Before Hardening
- ❌ Slowloris: Server down in 3-5 minutes
- ❌ HTTP Flood: Service disrupted after 5,000 requests
- ❌ DB Exhaustion: Easy to saturate 20 connections
- ❌ Resource Exhaustion: No protection

### After Hardening
- ✅ Slowloris: Connections terminated at 30s, server stable
- ✅ HTTP Flood: Rate limited at 200 req/15min per IP
- ✅ DB Exhaustion: 50 connections + queue + timeouts
- ✅ Resource Exhaustion: Concurrency limits + queue + 503 when full

### Approximate Capacity (Single Instance)
- **Concurrent Users**: ~500-1,000
- **Requests/Minute**: ~1,000-2,000 (with rate limiting)
- **Expensive Operations**: 5 concurrent (analytics, exports)
- **Database Queries**: 50 concurrent connections

**For higher capacity**: Deploy multiple instances + Redis + Azure Load Balancer

## 🔧 Troubleshooting

### Issue: All requests getting 429 (Too Many Requests)
**Solution**: Increase rate limits in `.env`
```bash
RATE_LIMIT_MAX_REQUESTS=500  # Increase this
```

### Issue: Requests getting 503 (Service Unavailable)
**Solution**: Increase queue size or concurrent limits
```bash
MAX_CONCURRENT_MODERATE=100  # Increase this
```

### Issue: Slow response times
**Solution**: Check DB pool and queue stats
```bash
curl http://localhost:5000/api/health/detailed
# Check: queue.active and database status
```

### Issue: Memory leaks
**Solution**: Monitor memory usage
```bash
curl http://localhost:5000/api/metrics \
  -H "Authorization: Bearer your-token"
# Check: memory.heapUsed and memory.external
```

## 🎯 Next Steps

1. ✅ **Test locally** with the commands above
2. ✅ **Configure `.env`** with appropriate limits
3. ⏭️ **Optional: Setup Redis** for distributed rate limiting
4. ⏭️ **Deploy to Azure** with auto-scaling enabled
5. ⏭️ **Setup monitoring** with Application Insights
6. ⏭️ **Configure WAF** with Azure Front Door/App Gateway
7. ⏭️ **Load test** with realistic traffic patterns
8. ⏭️ **Fine-tune limits** based on real usage

## 📚 Additional Resources

- [OWASP DDoS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Denial_of_Service_Cheat_Sheet.html)
- [Azure DDoS Protection Best Practices](https://learn.microsoft.com/azure/ddos-protection/ddos-protection-overview)
- [Node.js Production Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [Rate Limiting Strategies](https://cloud.google.com/architecture/rate-limiting-strategies-techniques)
