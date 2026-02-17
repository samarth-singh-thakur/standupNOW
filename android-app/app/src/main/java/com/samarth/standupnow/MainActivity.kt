package com.samarth.standupnow

import android.os.Bundle
import android.view.Menu
import android.view.MenuItem
import android.view.View
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.samarth.standupnow.databinding.ActivityMainBinding

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private val items = mutableListOf<UserItem>()
    private lateinit var adapter: ItemAdapter
    private lateinit var recyclerView: RecyclerView
    private lateinit var emptyText: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setSupportActionBar(binding.toolbar)

        // Find views from the included layout
        recyclerView = findViewById(R.id.recycler_view)
        emptyText = findViewById(R.id.empty_text)

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
                val newItem = UserItem(text = text)
                adapter.addItem(newItem)
                updateEmptyState()
            }
        }
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
}