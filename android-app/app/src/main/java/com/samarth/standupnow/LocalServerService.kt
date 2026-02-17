package com.samarth.standupnow

import android.content.Context
import android.net.wifi.WifiManager
import android.util.Log
import org.json.JSONArray
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.io.PrintWriter
import java.net.ServerSocket
import java.net.Socket
import java.text.SimpleDateFormat
import java.util.*
import java.util.concurrent.Executors
import kotlin.concurrent.thread

class LocalServerService(
    private val context: Context,
    private val repository: EntryRepository,
    private val onEntriesChanged: (() -> Unit)? = null
) {
    private var serverSocket: ServerSocket? = null
    private var isRunning = false
    private val executor = Executors.newCachedThreadPool()
    private var serverThread: Thread? = null
    
    companion object {
        private const val TAG = "LocalServerService"
        const val DEFAULT_PORT = 8080
    }
    
    fun start(port: Int = DEFAULT_PORT): Boolean {
        if (isRunning) {
            Log.w(TAG, "Server is already running")
            return false
        }
        
        return try {
            serverSocket = ServerSocket(port)
            isRunning = true
            
            serverThread = thread {
                Log.i(TAG, "Server started on port $port")
                while (isRunning && serverSocket?.isClosed == false) {
                    try {
                        val clientSocket = serverSocket?.accept()
                        clientSocket?.let {
                            executor.execute { handleClient(it) }
                        }
                    } catch (e: Exception) {
                        if (isRunning) {
                            Log.e(TAG, "Error accepting client connection", e)
                        }
                    }
                }
            }
            true
        } catch (e: Exception) {
            Log.e(TAG, "Failed to start server", e)
            isRunning = false
            false
        }
    }
    
    fun stop() {
        isRunning = false
        try {
            serverSocket?.close()
            executor.shutdown()
            serverThread?.interrupt()
            Log.i(TAG, "Server stopped")
        } catch (e: Exception) {
            Log.e(TAG, "Error stopping server", e)
        }
    }
    
    fun isRunning(): Boolean = isRunning
    
    fun getPort(): Int = serverSocket?.localPort ?: -1
    
    private fun handleClient(socket: Socket) {
        try {
            val reader = BufferedReader(InputStreamReader(socket.getInputStream()))
            val writer = PrintWriter(socket.getOutputStream(), true)
            
            // Read the request line
            val requestLine = reader.readLine() ?: return
            Log.d(TAG, "Request: $requestLine")
            
            // Parse the request
            val parts = requestLine.split(" ")
            if (parts.size < 2) return
            
            val method = parts[0]
            val path = parts[1]
            
            // Read headers and get Content-Length
            var contentLength = 0
            var line: String?
            do {
                line = reader.readLine()
                if (line?.startsWith("Content-Length:", ignoreCase = true) == true) {
                    contentLength = line.substringAfter(":").trim().toIntOrNull() ?: 0
                }
            } while (!line.isNullOrEmpty())
            
            // Handle the request
            when {
                method == "OPTIONS" -> {
                    handleOptions(writer)
                }
                method == "GET" && path == "/api/ping" -> {
                    handlePing(writer)
                }
                method == "POST" && path == "/api/sync" -> {
                    handleSync(reader, writer, contentLength)
                }
                method == "GET" && path.startsWith("/allentries") -> {
                    handleAllEntries(writer)
                }
                method == "GET" && path == "/" -> {
                    handleRoot(writer)
                }
                else -> {
                    handle404(writer)
                }
            }
            
            writer.flush()
            socket.close()
        } catch (e: Exception) {
            Log.e(TAG, "Error handling client", e)
        }
    }
    
    private fun handleOptions(writer: PrintWriter) {
        writer.println("HTTP/1.1 204 No Content")
        writer.println("Access-Control-Allow-Origin: *")
        writer.println("Access-Control-Allow-Methods: GET, POST, OPTIONS")
        writer.println("Access-Control-Allow-Headers: Content-Type")
        writer.println("Access-Control-Max-Age: 86400")
        writer.println()
    }
    
    private fun handlePing(writer: PrintWriter) {
        val response = JSONObject().apply {
            put("status", "ok")
        }.toString()
        
        writer.println("HTTP/1.1 200 OK")
        writer.println("Content-Type: application/json")
        writer.println("Content-Length: ${response.length}")
        writer.println("Access-Control-Allow-Origin: *")
        writer.println("Access-Control-Allow-Methods: GET, POST, OPTIONS")
        writer.println("Access-Control-Allow-Headers: Content-Type")
        writer.println()
        writer.println(response)
    }
    private fun handleSync(reader: BufferedReader, writer: PrintWriter, contentLength: Int) {
        try {
            // Read request body based on Content-Length
            val requestBody = if (contentLength > 0) {
                val buffer = CharArray(contentLength)
                var totalRead = 0
                while (totalRead < contentLength) {
                    val read = reader.read(buffer, totalRead, contentLength - totalRead)
                    if (read == -1) break
                    totalRead += read
                }
                String(buffer, 0, totalRead)
            } else {
                ""
            }
            
            Log.d(TAG, "Received sync request body: $requestBody")
            
            if (requestBody.isEmpty()) {
                sendError(writer, 400, "Empty request body")
                return
            }
            
            val requestJson = JSONObject(requestBody)
            val lastSync = requestJson.optString("lastSync", "1970-01-01T00:00:00.000Z")
            val incomingEntries = requestJson.optJSONArray("entries") ?: JSONArray()
            
            // Parse incoming entries
            val entriesToMerge = mutableListOf<UserItem>()
            for (i in 0 until incomingEntries.length()) {
                val entryJson = incomingEntries.getJSONObject(i)
                entriesToMerge.add(parseEntry(entryJson))
            }
            
            // Merge incoming entries (phone wins conflicts)
            if (entriesToMerge.isNotEmpty()) {
                repository.mergeEntries(entriesToMerge)
                // Notify UI of changes
                onEntriesChanged?.invoke()
            }
            
            // Get phone's entries updated since lastSync
            val phoneEntries = repository.getEntriesUpdatedSince(lastSync)
            
            // Build response
            val responseJson = JSONObject().apply {
                put("entries", JSONArray().apply {
                    phoneEntries.forEach { entry ->
                        put(entryToJson(entry))
                    }
                })
                put("serverTime", UserItem.getCurrentISOTime())
            }
            
            val response = responseJson.toString()
            
            writer.println("HTTP/1.1 200 OK")
            writer.println("Content-Type: application/json")
            writer.println("Content-Length: ${response.length}")
            writer.println("Access-Control-Allow-Origin: *")
            writer.println("Access-Control-Allow-Methods: GET, POST, OPTIONS")
            writer.println("Access-Control-Allow-Headers: Content-Type")
            writer.println()
            writer.println(response)
            
            Log.d(TAG, "Sync completed: received ${entriesToMerge.size}, sent ${phoneEntries.size}")
        } catch (e: Exception) {
            Log.e(TAG, "Error handling sync", e)
            sendError(writer, 500, "Sync failed: ${e.message}")
        }
    }
    
    private fun handleAllEntries(writer: PrintWriter) {
        val entries = repository.getAllEntries()
        val jsonArray = JSONArray()
        val dateFormat = SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault())
        
        entries.forEach { item ->
            val jsonObject = JSONObject().apply {
                put("id", item.id)
                put("uuid", item.uuid)
                put("time", item.time)
                put("note", item.note)
                put("text", item.text)
                put("timestamp", item.timestamp)
                put("date", dateFormat.format(Date(item.timestamp)))
                put("createdAt", item.createdAt)
                put("updatedAt", item.updatedAt)
                put("version", item.version)
                put("deleted", item.deleted)
            }
            jsonArray.put(jsonObject)
        }
        
        val response = jsonArray.toString(2)
        
        writer.println("HTTP/1.1 200 OK")
        writer.println("Content-Type: application/json")
        writer.println("Content-Length: ${response.length}")
        writer.println("Access-Control-Allow-Origin: *")
        writer.println("Access-Control-Allow-Methods: GET, POST, OPTIONS")
        writer.println("Access-Control-Allow-Headers: Content-Type")
        writer.println()
        writer.println(response)
    }
    
    private fun entryToJson(entry: UserItem): JSONObject {
        return JSONObject().apply {
            put("id", entry.id)
            put("time", entry.time)
            put("note", entry.note)
            put("createdAt", entry.createdAt)
            put("updatedAt", entry.updatedAt)
            put("version", entry.version)
            put("deleted", entry.deleted)
        }
    }
    
    private fun parseEntry(json: JSONObject): UserItem {
        return UserItem(
            id = json.optString("id", ""),
            time = json.optString("time", UserItem.getCurrentISOTime()),
            note = json.optString("note", ""),
            createdAt = json.optString("createdAt", UserItem.getCurrentISOTime()),
            updatedAt = json.optString("updatedAt", UserItem.getCurrentISOTime()),
            version = json.optInt("version", 1),
            deleted = json.optBoolean("deleted", false)
        )
    }
    
    private fun sendError(writer: PrintWriter, code: Int, message: String) {
        val errorJson = JSONObject().apply {
            put("error", message)
        }.toString()
        
        writer.println("HTTP/1.1 $code ${getStatusText(code)}")
        writer.println("Content-Type: application/json")
        writer.println("Content-Length: ${errorJson.length}")
        writer.println("Access-Control-Allow-Origin: *")
        writer.println("Access-Control-Allow-Methods: GET, POST, OPTIONS")
        writer.println("Access-Control-Allow-Headers: Content-Type")
        writer.println()
        writer.println(errorJson)
    }
    
    private fun getStatusText(code: Int): String {
        return when (code) {
            400 -> "Bad Request"
            404 -> "Not Found"
            500 -> "Internal Server Error"
            else -> "Error"
        }
    }
    
    private fun handleRoot(writer: PrintWriter) {
        val html = """
            <!DOCTYPE html>
            <html>
            <head>
                <title>StandUp Now - Server</title>
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        max-width: 800px;
                        margin: 0 auto;
                        padding: 20px;
                        background: #1a1a1a;
                        color: #e0e0e0;
                    }
                    h1 { color: #ffd700; }
                    .endpoint {
                        background: #2a2a2a;
                        padding: 15px;
                        margin: 10px 0;
                        border-radius: 8px;
                        border-left: 4px solid #ffd700;
                    }
                    code {
                        background: #3a3a3a;
                        padding: 2px 6px;
                        border-radius: 4px;
                        color: #ffd700;
                    }
                    a {
                        color: #ffd700;
                        text-decoration: none;
                    }
                    a:hover { text-decoration: underline; }
                </style>
            </head>
            <body>
                <h1>🎯 StandUp Now - Local Server</h1>
                <p>Server is running! Total entries: ${repository.getAllEntries().size}</p>
                
                <div class="endpoint">
                    <h3>🔄 Sync Endpoint</h3>
                    <p><code>POST /api/sync</code></p>
                    <p>Bidirectional sync with Chrome Extension</p>
                </div>
                
                <div class="endpoint">
                    <h3>🏓 Ping</h3>
                    <p><code>GET /api/ping</code></p>
                    <p><a href="/api/ping">Test Connection</a></p>
                </div>
                
                <div class="endpoint">
                    <h3>📋 All Entries</h3>
                    <p><code>GET /allentries</code></p>
                    <p><a href="/allentries">View All Entries (JSON)</a></p>
                </div>
                
                <p style="margin-top: 30px; color: #888;">
                    Access this server from any device on the same WiFi network.
                </p>
            </body>
            </html>
        """.trimIndent()
        
        writer.println("HTTP/1.1 200 OK")
        writer.println("Content-Type: text/html; charset=UTF-8")
        writer.println("Content-Length: ${html.length}")
        writer.println()
        writer.println(html)
    }
    
    private fun handle404(writer: PrintWriter) {
        val html = """
            <!DOCTYPE html>
            <html>
            <head>
                <title>404 - Not Found</title>
                <style>
                    body {
                        font-family: sans-serif;
                        text-align: center;
                        padding: 50px;
                        background: #1a1a1a;
                        color: #e0e0e0;
                    }
                    h1 { color: #ffd700; }
                </style>
            </head>
            <body>
                <h1>404 - Not Found</h1>
                <p><a href="/" style="color: #ffd700;">Go to Home</a></p>
            </body>
            </html>
        """.trimIndent()
        
        writer.println("HTTP/1.1 404 Not Found")
        writer.println("Content-Type: text/html; charset=UTF-8")
        writer.println("Content-Length: ${html.length}")
        writer.println()
        writer.println(html)
    }
    
    fun getLocalIpAddress(context: Context): String? {
        try {
            val wifiManager = context.applicationContext.getSystemService(Context.WIFI_SERVICE) as WifiManager
            val wifiInfo = wifiManager.connectionInfo
            val ipInt = wifiInfo.ipAddress
            
            return String.format(
                Locale.getDefault(),
                "%d.%d.%d.%d",
                ipInt and 0xff,
                ipInt shr 8 and 0xff,
                ipInt shr 16 and 0xff,
                ipInt shr 24 and 0xff
            )
        } catch (e: Exception) {
            Log.e(TAG, "Error getting IP address", e)
            return null
        }
    }
}

// Made with Bob
