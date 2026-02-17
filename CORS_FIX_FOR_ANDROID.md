# Fix CORS Error in Android Server

## The Problem

```
Access to fetch at 'http://192.168.1.5:8080/api/sync' has been blocked by CORS policy
```

Chrome extension cannot access your Android server due to missing CORS headers.

## The Solution

Add these headers to your Android server responses:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

## Implementation Examples

### Option 1: Ktor (Kotlin)

```kotlin
import io.ktor.server.application.*
import io.ktor.server.plugins.cors.routing.*
import io.ktor.http.*

fun Application.module() {
    install(CORS) {
        anyHost() // Allow any origin
        allowMethod(HttpMethod.Options)
        allowMethod(HttpMethod.Get)
        allowMethod(HttpMethod.Post)
        allowHeader(HttpHeaders.ContentType)
        allowHeader(HttpHeaders.Accept)
    }
    
    // Your routes here
}
```

### Option 2: Express (Node.js)

```javascript
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors()); // Enable CORS for all routes
app.use(express.json());

app.get('/api/ping', (req, res) => {
    res.json({ status: 'ok' });
});

app.post('/api/sync', (req, res) => {
    // Your sync logic
});

app.listen(8080);
```

### Option 3: Manual Headers (Any Framework)

Add these headers to EVERY response:

```kotlin
// Before sending response
response.headers.append("Access-Control-Allow-Origin", "*")
response.headers.append("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
response.headers.append("Access-Control-Allow-Headers", "Content-Type")
```

### Option 4: Handle OPTIONS Preflight

Chrome sends an OPTIONS request first. Handle it:

```kotlin
// Add OPTIONS handler
options("/api/sync") {
    call.response.headers.append("Access-Control-Allow-Origin", "*")
    call.response.headers.append("Access-Control-Allow-Methods", "POST, OPTIONS")
    call.response.headers.append("Access-Control-Allow-Headers", "Content-Type")
    call.respond(HttpStatusCode.OK)
}

post("/api/sync") {
    // Add CORS headers to POST response too
    call.response.headers.append("Access-Control-Allow-Origin", "*")
    
    // Your sync logic
    val request = call.receive<SyncRequest>()
    // ...
    call.respond(syncResponse)
}
```

## Quick Test

After adding CORS headers, test with curl:

```bash
# Test OPTIONS (preflight)
curl -X OPTIONS http://192.168.1.5:8080/api/sync \
  -H "Origin: chrome-extension://ebhcodnkmanlighinjmfgmkckdkdgcbg" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v

# Should see these headers in response:
# Access-Control-Allow-Origin: *
# Access-Control-Allow-Methods: POST, OPTIONS
# Access-Control-Allow-Headers: Content-Type
```

## Complete Ktor Example

```kotlin
import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.plugins.cors.routing.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.http.*

fun main() {
    embeddedServer(Netty, port = 8080) {
        // Install CORS
        install(CORS) {
            anyHost()
            allowMethod(HttpMethod.Options)
            allowMethod(HttpMethod.Get)
            allowMethod(HttpMethod.Post)
            allowHeader(HttpHeaders.ContentType)
            allowHeader(HttpHeaders.Accept)
        }
        
        // Install JSON
        install(ContentNegotiation) {
            json()
        }
        
        routing {
            get("/api/ping") {
                call.respond(mapOf("status" to "ok"))
            }
            
            post("/api/sync") {
                val request = call.receive<SyncRequest>()
                
                // Your sync logic here
                val response = SyncResponse(
                    entries = listOf(),
                    serverTime = System.currentTimeMillis().toString()
                )
                
                call.respond(response)
            }
        }
    }.start(wait = true)
}
```

## Verify CORS is Working

1. **Add CORS headers** to your server
2. **Restart server**
3. **In extension**, click sync button
4. **Connect** to `192.168.1.5:8080`
5. **Check console** - should see successful sync!

## If Still Not Working

### Check Response Headers

```bash
curl -X POST http://192.168.1.5:8080/api/sync \
  -H "Content-Type: application/json" \
  -d '{"lastSync":"1970-01-01T00:00:00.000Z","entries":[]}' \
  -v

# Look for these in response:
# < Access-Control-Allow-Origin: *
```

### Common Mistakes

1. ❌ Only added headers to POST, not OPTIONS
2. ❌ Headers not added to error responses
3. ❌ Typo in header names
4. ❌ Server not restarted after changes

### Debug Checklist

- [ ] CORS middleware/plugin installed
- [ ] OPTIONS handler added
- [ ] Headers added to all responses
- [ ] Server restarted
- [ ] Tested with curl -v
- [ ] Extension console shows no CORS error

---

**Once CORS is fixed, sync will work immediately!**