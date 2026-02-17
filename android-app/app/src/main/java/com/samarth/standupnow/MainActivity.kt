package com.samarth.standupnow

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.os.Bundle
import android.view.Menu
import android.view.MenuItem
import android.view.View
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.cardview.widget.CardView
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.google.android.material.button.MaterialButton
import com.samarth.standupnow.databinding.ActivityMainBinding

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private val items = mutableListOf<UserItem>()
    private lateinit var adapter: ItemAdapter
    private lateinit var recyclerView: RecyclerView
    private lateinit var emptyText: TextView
    private lateinit var repository: EntryRepository
    private var localServer: LocalServerService? = null
    
    // Server UI elements
    private lateinit var btnStartServer: MaterialButton
    private lateinit var serverInfoCard: CardView
    private lateinit var tvServerAddress: TextView
    private lateinit var tvServerPort: TextView
    private lateinit var btnCopyUrl: MaterialButton
    private lateinit var btnHideServer: MaterialButton

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setSupportActionBar(binding.toolbar)

        // Initialize repository
        repository = EntryRepository(this)

        // Find views from the included layout
        recyclerView = findViewById(R.id.recycler_view)
        emptyText = findViewById(R.id.empty_text)
        
        // Find server UI elements
        btnStartServer = findViewById(R.id.btn_start_server)
        serverInfoCard = findViewById(R.id.server_info_card)
        tvServerAddress = findViewById(R.id.tv_server_address)
        tvServerPort = findViewById(R.id.tv_server_port)
        btnCopyUrl = findViewById(R.id.btn_copy_url)
        btnHideServer = findViewById(R.id.btn_hide_server)
        
        // Setup server button listeners
        btnStartServer.setOnClickListener {
            toggleServer()
        }
        
        btnHideServer.setOnClickListener {
            hideServerInfo()
        }
        
        btnCopyUrl.setOnClickListener {
            val ipAddress = localServer?.getLocalIpAddress(this)
            val port = localServer?.getPort() ?: LocalServerService.DEFAULT_PORT
            if (ipAddress != null) {
                val url = "http://$ipAddress:$port"
                copyToClipboard(url)
            }
        }

        // Load entries from repository
        loadEntries()

        // Setup RecyclerView
        adapter = ItemAdapter(items)
        recyclerView.apply {
            layoutManager = LinearLayoutManager(this@MainActivity)
            adapter = this@MainActivity.adapter
        }

        updateEmptyState()

        binding.fab.setOnClickListener {
            val dialog = AddItemDialogFragment()
            dialog.show(supportFragmentManager, AddItemDialogFragment.TAG)
        }

        // Listen for new items from dialog
        supportFragmentManager.setFragmentResultListener("add_item_request", this) { _, bundle ->
            val text = bundle.getString("item_text")
            if (!text.isNullOrEmpty()) {
                val newItem = UserItem(note = text)
                repository.addEntry(newItem)
                loadEntries()
                adapter.notifyDataSetChanged()
                updateEmptyState()
            }
        }
    }

    private fun loadEntries() {
        items.clear()
        items.addAll(repository.getAllEntries())
    }
    
    private fun updateEmptyState() {
        if (items.isEmpty()) {
            emptyText.visibility = View.VISIBLE
            recyclerView.visibility = View.GONE
        } else {
            emptyText.visibility = View.GONE
            recyclerView.visibility = View.VISIBLE
        }
    }
    
    private fun refreshEntries() {
        loadEntries()
        adapter.notifyDataSetChanged()
        updateEmptyState()
    }
    
    override fun onCreateOptionsMenu(menu: Menu): Boolean {
        menuInflater.inflate(R.menu.menu_main, menu)
        return true
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        return when (item.itemId) {
            R.id.action_settings -> true
            else -> super.onOptionsItemSelected(item)
        }
    }
    
    private fun toggleServer() {
        if (localServer?.isRunning() == true) {
            stopServer()
        } else {
            startServer()
        }
    }
    
    private fun startServer() {
        localServer = LocalServerService(this, repository) {
            // Callback when entries are synced
            runOnUiThread {
                refreshEntries()
            }
        }
        val started = localServer?.start(LocalServerService.DEFAULT_PORT) ?: false
        
        if (started) {
            val ipAddress = localServer?.getLocalIpAddress(this)
            val port = localServer?.getPort() ?: LocalServerService.DEFAULT_PORT
            
            if (ipAddress != null) {
                showServerInfo(ipAddress, port)
                Toast.makeText(this, "Server started successfully", Toast.LENGTH_SHORT).show()
            } else {
                Toast.makeText(this, R.string.server_error, Toast.LENGTH_SHORT).show()
                stopServer()
            }
        } else {
            Toast.makeText(this, R.string.server_error, Toast.LENGTH_SHORT).show()
        }
    }
    
    private fun stopServer() {
        localServer?.stop()
        localServer = null
        hideServerInfo()
        Toast.makeText(this, R.string.server_stopped, Toast.LENGTH_SHORT).show()
    }
    
    private fun showServerInfo(ipAddress: String, port: Int) {
        tvServerAddress.text = ipAddress
        tvServerPort.text = port.toString()
        serverInfoCard.visibility = View.VISIBLE
        btnStartServer.visibility = View.GONE
    }
    
    private fun hideServerInfo() {
        if (localServer?.isRunning() == true) {
            stopServer()
        }
        serverInfoCard.visibility = View.GONE
        btnStartServer.visibility = View.VISIBLE
    }
    
    private fun copyToClipboard(text: String) {
        val clipboard = getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
        val clip = ClipData.newPlainText("Server URL", text)
        clipboard.setPrimaryClip(clip)
        Toast.makeText(this, R.string.url_copied, Toast.LENGTH_SHORT).show()
    }
    
    override fun onDestroy() {
        super.onDestroy()
        stopServer()
    }
}