package com.samarth.standupnow

import android.Manifest
import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.pm.PackageManager
import android.graphics.Rect
import android.os.Build
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.KeyEvent
import android.view.Menu
import android.view.MenuItem
import android.view.View
import android.view.ViewTreeObserver
import android.view.animation.AnimationUtils
import android.view.inputmethod.EditorInfo
import android.widget.EditText
import android.widget.ImageButton
import android.widget.LinearLayout
import android.widget.RelativeLayout
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.coordinatorlayout.widget.CoordinatorLayout
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import com.google.android.material.chip.Chip
import com.samarth.standupnow.databinding.ActivityMainBinding
import java.util.concurrent.TimeUnit

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private val items = mutableListOf<UserItem>()
    private val allItems = mutableListOf<UserItem>()
    private lateinit var adapter: TimelineAdapter
    private lateinit var recyclerView: RecyclerView
    private lateinit var emptyText: TextView
    private lateinit var repository: EntryRepository
    private var localServer: LocalServerService? = null
    private lateinit var notificationHelper: NotificationHelper
    
    companion object {
        private const val NOTIFICATION_PERMISSION_REQUEST_CODE = 1001
    }
    
    // View state
    private var isComposerMode = true  // Start in composer mode
    private lateinit var composerView: LinearLayout
    private lateinit var listView: LinearLayout
    
    // UI elements
    private lateinit var toolbarServerUrl: TextView
    private lateinit var entriesCountText: TextView
    private lateinit var searchIconButton: ImageButton
    private lateinit var menuIconButton: ImageButton
    private lateinit var restartServerButton: ImageButton
    private lateinit var searchBarContainer: LinearLayout
    private lateinit var searchInput: EditText
    private lateinit var chipAll: Chip
    private lateinit var chipToday: Chip
    private lateinit var chipYesterday: Chip
    private lateinit var chipThisWeek: Chip
    private lateinit var chipCustomRange: Chip
    private lateinit var quickJotContainer: RelativeLayout
    private lateinit var composerContainer: LinearLayout
    private lateinit var quickJotInput: EditText
    private lateinit var saveEntryButton: ImageButton
    private lateinit var deleteDraftButton: ImageButton
    
    // Search state
    private var isSearchVisible = false
    
    // Draft management
    private val PREFS_NAME = "StandupNowPrefs"
    private val DRAFT_KEY = "draft_entry"
    
    // Filter state
    private var currentFilter: FilterType = FilterType.ALL
    private var currentFilterMenuItem: MenuItem? = null
    private var searchQuery: String = ""
    private var customStartDate: Long? = null
    private var customEndDate: Long? = null
    
    enum class FilterType {
        ALL, TODAY, YESTERDAY, THIS_WEEK, DAYS_3, DAYS_7, DAYS_30, CUSTOM_RANGE
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Initialize repository and notification helper
        repository = EntryRepository(this)
        notificationHelper = NotificationHelper(this)
        
        // Find view containers
        composerView = findViewById(R.id.composer_view)
        listView = findViewById(R.id.list_view)
        
        // Find UI elements (these are in list view)
        toolbarServerUrl = findViewById(R.id.toolbar_server_url)
        entriesCountText = findViewById(R.id.toolbar_entries_count)
        searchIconButton = findViewById(R.id.search_icon_button)
        menuIconButton = findViewById(R.id.menu_icon_button)
        restartServerButton = findViewById(R.id.restart_server_button)
        searchBarContainer = findViewById(R.id.search_bar_container)
        searchInput = findViewById(R.id.search_input)
        chipAll = findViewById(R.id.chip_all)
        chipToday = findViewById(R.id.chip_today)
        chipYesterday = findViewById(R.id.chip_yesterday)
        chipThisWeek = findViewById(R.id.chip_this_week)
        chipCustomRange = findViewById(R.id.chip_custom_range)
        // Find composer elements (in fullscreen composer view)
        quickJotContainer = findViewById(R.id.entry_composer_fullscreen)
        composerContainer = quickJotContainer.findViewById(R.id.composer_container)
        quickJotInput = quickJotContainer.findViewById(R.id.composer_input)
        saveEntryButton = quickJotContainer.findViewById(R.id.save_entry_button)
        deleteDraftButton = quickJotContainer.findViewById(R.id.delete_draft_button)

        // Find views from the list view
        recyclerView = findViewById(R.id.recycler_view)
        emptyText = findViewById(R.id.empty_state_text)

        // Load entries from repository
        loadEntries()
        
        // Populate demo entries if empty
        if (items.isEmpty()) {
            populateDemoEntries()
        }

        // Setup RecyclerView with timeline adapter
        adapter = TimelineAdapter(mutableListOf())
        recyclerView.apply {
            layoutManager = LinearLayoutManager(this@MainActivity)
            adapter = this@MainActivity.adapter
        }

        applyFiltersAndSearch()
        
        // Setup focus listener for glow animation
        setupComposerFocusAnimation()
        
        // Setup save and delete buttons
        saveEntryButton.setOnClickListener {
            saveQuickJot()
        }
        
        deleteDraftButton.setOnClickListener {
            deleteDraft()
        }
        
        // Load draft if exists
        loadDraft()
        
        // Watch input for action buttons visibility
        quickJotInput.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: Editable?) {
                val text = s?.toString()?.trim() ?: ""
                saveEntryButton.visibility = if (text.isNotEmpty()) View.VISIBLE else View.GONE
                deleteDraftButton.visibility = if (text.isNotEmpty()) View.VISIBLE else View.GONE
            }
        })
        
        quickJotInput.setOnEditorActionListener { _, actionId, event ->
            if (actionId == EditorInfo.IME_ACTION_DONE ||
                (event?.action == KeyEvent.ACTION_DOWN && event.keyCode == KeyEvent.KEYCODE_ENTER && event.isCtrlPressed)) {
                saveQuickJot()
                true
            } else {
                false
            }
        }
        
        // Setup search icon toggle
        searchIconButton.setOnClickListener {
            toggleSearchBar()
        }
        
        // Setup restart server button
        restartServerButton.setOnClickListener {
            restartServer()
        }
        
        // Setup menu icon with popup menu
        menuIconButton.setOnClickListener { view ->
            showPopupMenu(view)
        }
        
        // Setup search
        searchInput.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: Editable?) {
                searchQuery = s?.toString() ?: ""
                applyFiltersAndSearch()
            }
        })
        
        // Setup filter chips
        chipAll.setOnClickListener { setFilter(FilterType.ALL) }
        chipToday.setOnClickListener { setFilter(FilterType.TODAY) }
        chipYesterday.setOnClickListener { setFilter(FilterType.YESTERDAY) }
        chipThisWeek.setOnClickListener { setFilter(FilterType.THIS_WEEK) }
        chipCustomRange.setOnClickListener { showDateRangePicker() }

        // FAB toggles between composer and list views
        binding.fab.setOnClickListener {
            toggleView()
        }
        
        // Setup keyboard listener for FAB positioning
        setupKeyboardListener()
        
        // Start in composer mode with keyboard ready
        showComposerView()

        // Listen for new items from dialog
        supportFragmentManager.setFragmentResultListener("add_item_request", this) { _, bundle ->
            val text = bundle.getString("item_text")
            if (!text.isNullOrEmpty()) {
                val newItem = UserItem(note = text)
                repository.addEntry(newItem)
                loadEntries()
                applyFiltersAndSearch()
            }
        }
        
        // Auto-start server
        startServer()
        
        // Request notification permission (Android 13+)
        requestNotificationPermission()
        
        // Schedule periodic reminders
        scheduleReminders()
    }

    private fun toggleView() {
        if (isComposerMode) {
            showListView()
        } else {
            showComposerView()
        }
    }
    
    private fun showComposerView() {
        isComposerMode = true
        composerView.visibility = View.VISIBLE
        listView.visibility = View.GONE
        
        // Load draft if exists
        loadDraft()
        
        // Update save button visibility based on current text
        val text = quickJotInput.text.toString().trim()
        saveEntryButton.visibility = if (text.isNotEmpty()) View.VISIBLE else View.GONE
        
        // Focus on input and show keyboard
        quickJotInput.requestFocus()
        quickJotInput.postDelayed({
            val imm = getSystemService(Context.INPUT_METHOD_SERVICE) as android.view.inputmethod.InputMethodManager
            imm.showSoftInput(quickJotInput, android.view.inputmethod.InputMethodManager.SHOW_IMPLICIT)
        }, 100)
        
        // Update FAB icon
        binding.fab.setImageResource(android.R.drawable.ic_menu_view)
    }
    
    private fun showListView() {
        isComposerMode = false
        composerView.visibility = View.GONE
        listView.visibility = View.VISIBLE
        
        // Hide keyboard
        val imm = getSystemService(Context.INPUT_METHOD_SERVICE) as android.view.inputmethod.InputMethodManager
        imm.hideSoftInputFromWindow(quickJotInput.windowToken, 0)
        
        // Update FAB icon
        binding.fab.setImageResource(android.R.drawable.ic_input_add)
        
        // Refresh list
        loadEntries()
        applyFiltersAndSearch()
    }
    
    private fun saveQuickJot() {
        val text = quickJotInput.text.toString().trim()
        if (text.isNotEmpty()) {
            val newItem = UserItem(note = text)
            repository.addEntry(newItem)
            
            // Clear input and draft
            quickJotInput.text.clear()
            clearDraft()
            Toast.makeText(this, "Entry saved! ✓", Toast.LENGTH_SHORT).show()
            
            // Auto-switch to list view to show the saved entry
            showListView()
        } else {
            Toast.makeText(this, "Please enter some text", Toast.LENGTH_SHORT).show()
        }
    }
    
    private fun saveDraft() {
        val text = quickJotInput.text.toString().trim()
        if (text.isNotEmpty()) {
            val prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            prefs.edit().putString(DRAFT_KEY, text).apply()
            deleteDraftButton.visibility = View.VISIBLE
        } else {
            clearDraft()
        }
    }
    
    private fun loadDraft() {
        val prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val draft = prefs.getString(DRAFT_KEY, null)
        if (!draft.isNullOrEmpty()) {
            quickJotInput.setText(draft)
            quickJotInput.setSelection(draft.length) // Move cursor to end
            deleteDraftButton.visibility = View.VISIBLE
        } else {
            deleteDraftButton.visibility = View.GONE
        }
    }
    
    private fun clearDraft() {
        val prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit().remove(DRAFT_KEY).apply()
        deleteDraftButton.visibility = View.GONE
    }
    
    private fun deleteDraft() {
        quickJotInput.text.clear()
        clearDraft()
        Toast.makeText(this, "Draft deleted", Toast.LENGTH_SHORT).show()
    }
    
    private fun toggleSearchBar() {
        isSearchVisible = !isSearchVisible
        searchBarContainer.visibility = if (isSearchVisible) View.VISIBLE else View.GONE
        
        if (isSearchVisible) {
            searchInput.requestFocus()
            val imm = getSystemService(Context.INPUT_METHOD_SERVICE) as android.view.inputmethod.InputMethodManager
            imm.showSoftInput(searchInput, android.view.inputmethod.InputMethodManager.SHOW_IMPLICIT)
        } else {
            searchInput.text.clear()
            val imm = getSystemService(Context.INPUT_METHOD_SERVICE) as android.view.inputmethod.InputMethodManager
            imm.hideSoftInputFromWindow(searchInput.windowToken, 0)
        }
    }
    
    private fun setupKeyboardListener() {
        val rootView = findViewById<View>(android.R.id.content)
        rootView.viewTreeObserver.addOnGlobalLayoutListener(object : ViewTreeObserver.OnGlobalLayoutListener {
            private var wasKeyboardOpen = false
            
            override fun onGlobalLayout() {
                val rect = Rect()
                rootView.getWindowVisibleDisplayFrame(rect)
                val screenHeight = rootView.height
                val keypadHeight = screenHeight - rect.bottom
                
                val isKeyboardOpen = keypadHeight > screenHeight * 0.15
                
                if (isKeyboardOpen != wasKeyboardOpen) {
                    wasKeyboardOpen = isKeyboardOpen
                    adjustFabPosition(isKeyboardOpen, keypadHeight)
                }
            }
        })
    }
    
    private fun adjustFabPosition(keyboardOpen: Boolean, keyboardHeight: Int) {
        val params = binding.fab.layoutParams as CoordinatorLayout.LayoutParams
        
        if (keyboardOpen) {
            // Move FAB above keyboard
            params.bottomMargin = keyboardHeight + 24.dpToPx()
        } else {
            // Reset to default position
            params.bottomMargin = 24.dpToPx()
        }
        
        binding.fab.layoutParams = params
    }
    
    private fun Int.dpToPx(): Int {
        return (this * resources.displayMetrics.density).toInt()
    }
    
    private fun loadEntries() {
        allItems.clear()
        allItems.addAll(repository.getAllEntries())
        items.clear()
        items.addAll(allItems)
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
        applyFiltersAndSearch()
    }
    
    private fun applyFiltersAndSearch() {
        // Start with all items
        var filteredEntries = allItems.toList()
        
        // Apply date filter
        filteredEntries = when (currentFilter) {
            FilterType.ALL -> filteredEntries
            FilterType.TODAY -> TimelineUtils.getTodayEntries(filteredEntries)
            FilterType.YESTERDAY -> getYesterdayEntries(filteredEntries)
            FilterType.THIS_WEEK -> getThisWeekEntries(filteredEntries)
            FilterType.DAYS_3 -> TimelineUtils.filterByDays(filteredEntries, 3)
            FilterType.DAYS_7 -> TimelineUtils.filterByDays(filteredEntries, 7)
            FilterType.DAYS_30 -> TimelineUtils.filterByDays(filteredEntries, 30)
            FilterType.CUSTOM_RANGE -> {
                val start = customStartDate
                val end = customEndDate
                if (start != null && end != null) {
                    filteredEntries.filter { it.timestamp in start..end }
                } else {
                    filteredEntries
                }
            }
        }
        
        // Apply search filter
        if (searchQuery.isNotEmpty()) {
            filteredEntries = filteredEntries.filter {
                it.text.contains(searchQuery, ignoreCase = true)
            }
        }
        
        // Update items list
        items.clear()
        items.addAll(filteredEntries)
        
        // Create timeline items with headers and gaps
        val timelineItems = TimelineUtils.createTimelineItems(filteredEntries)
        
        // Update adapter
        adapter.updateTimeline(timelineItems)
        
        // Update entries count
        entriesCountText.text = "${filteredEntries.size}"
        
        // Update empty state
        if (timelineItems.isEmpty()) {
            emptyText.text = if (searchQuery.isNotEmpty()) {
                "No entries found for \"$searchQuery\""
            } else {
                "No items yet.\nTap the + button to add one!"
            }
            emptyText.visibility = View.VISIBLE
            recyclerView.visibility = View.GONE
        } else {
            emptyText.visibility = View.GONE
            recyclerView.visibility = View.VISIBLE
        }
    }
    
    private fun getYesterdayEntries(entries: List<UserItem>): List<UserItem> {
        val yesterday = java.util.Calendar.getInstance().apply {
            add(java.util.Calendar.DAY_OF_YEAR, -1)
            set(java.util.Calendar.HOUR_OF_DAY, 0)
            set(java.util.Calendar.MINUTE, 0)
            set(java.util.Calendar.SECOND, 0)
            set(java.util.Calendar.MILLISECOND, 0)
        }.timeInMillis
        
        val yesterdayEnd = yesterday + (24 * 60 * 60 * 1000)
        
        return entries.filter { it.timestamp in yesterday until yesterdayEnd }
    }
    
    private fun getThisWeekEntries(entries: List<UserItem>): List<UserItem> {
        val weekStart = java.util.Calendar.getInstance().apply {
            set(java.util.Calendar.DAY_OF_WEEK, java.util.Calendar.MONDAY)
            set(java.util.Calendar.HOUR_OF_DAY, 0)
            set(java.util.Calendar.MINUTE, 0)
            set(java.util.Calendar.SECOND, 0)
            set(java.util.Calendar.MILLISECOND, 0)
        }.timeInMillis
        
        return entries.filter { it.timestamp >= weekStart }
    }
    
    private fun setFilter(filterType: FilterType) {
        currentFilter = filterType
        
        // Update chip states
        chipAll.isChecked = filterType == FilterType.ALL
        chipToday.isChecked = filterType == FilterType.TODAY
        chipYesterday.isChecked = filterType == FilterType.YESTERDAY
        chipThisWeek.isChecked = filterType == FilterType.THIS_WEEK
        chipCustomRange.isChecked = filterType == FilterType.CUSTOM_RANGE
        
        // Apply filters
        applyFiltersAndSearch()
    }
    
    private fun showDateRangePicker() {
        val dialog = DateRangePickerDialog.newInstance { startDate, endDate ->
            customStartDate = startDate
            customEndDate = endDate
            setFilter(FilterType.CUSTOM_RANGE)
        }
        dialog.show(supportFragmentManager, "DateRangePicker")
    }
    
    private fun populateDemoEntries() {
        val now = System.currentTimeMillis()
        val oneHour = 60 * 60 * 1000L
        val oneDay = 24 * oneHour
        
        // Today's entries (spread across different times)
        val todayEntries = listOf(
            Pair("Completed API integration for user authentication", now - (2 * oneHour)),
            Pair("Fixed bug in payment processing module", now - (4 * oneHour)),
            Pair("Reviewed pull requests from team members", now - (6 * oneHour)),
            Pair("Updated documentation for new features", now - (8 * oneHour))
        )
        
        // Yesterday's entries
        val yesterdayEntries = listOf(
            Pair("Attended sprint planning meeting", now - oneDay - (3 * oneHour)),
            Pair("Optimized database queries for better performance", now - oneDay - (5 * oneHour)),
            Pair("Implemented dark mode support", now - oneDay - (7 * oneHour))
        )
        
        // 2 days ago
        val twoDaysAgoEntries = listOf(
            Pair("Refactored legacy code in core module", now - (2 * oneDay) - (4 * oneHour)),
            Pair("Added unit tests for new features", now - (2 * oneDay) - (6 * oneHour))
        )
        
        // 3 days ago
        val threeDaysAgoEntries = listOf(
            Pair("Deployed hotfix to production", now - (3 * oneDay) - (2 * oneHour)),
            Pair("Conducted code review session", now - (3 * oneDay) - (5 * oneHour))
        )
        
        // 5 days ago
        val fiveDaysAgoEntries = listOf(
            Pair("Migrated database to new schema", now - (5 * oneDay) - (3 * oneHour)),
            Pair("Fixed memory leak in background service", now - (5 * oneDay) - (7 * oneHour))
        )
        
        // 7 days ago
        val sevenDaysAgoEntries = listOf(
            Pair("Implemented new analytics dashboard", now - (7 * oneDay) - (4 * oneHour)),
            Pair("Resolved security vulnerability", now - (7 * oneDay) - (6 * oneHour))
        )
        
        // Combine all entries
        val allEntries = todayEntries + yesterdayEntries + twoDaysAgoEntries +
                        threeDaysAgoEntries + fiveDaysAgoEntries + sevenDaysAgoEntries
        
        // Add entries with custom timestamps
        allEntries.forEach { (note, timestamp) ->
            val isoTime = UserItem.Companion.getCurrentISOTime()
            val formatter = java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", java.util.Locale.US).apply {
                timeZone = java.util.TimeZone.getTimeZone("UTC")
            }
            val customTime = formatter.format(java.util.Date(timestamp))
            
            val entry = UserItem(
                note = note,
                time = customTime,
                createdAt = customTime,
                updatedAt = customTime
            )
            repository.addEntry(entry)
        }
        
        loadEntries()
        applyFiltersAndSearch()
    }
    
    override fun onCreateOptionsMenu(menu: Menu): Boolean {
        menuInflater.inflate(R.menu.menu_main, menu)
        return true
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        return when (item.itemId) {
            R.id.action_copy_today -> {
                copyTodayEntries()
                true
            }
            R.id.filter_all -> {
                setFilter(FilterType.ALL, item)
                true
            }
            R.id.filter_today -> {
                setFilter(FilterType.TODAY, item)
                true
            }
            R.id.filter_3_days -> {
                setFilter(FilterType.DAYS_3, item)
                true
            }
            R.id.filter_7_days -> {
                setFilter(FilterType.DAYS_7, item)
                true
            }
            R.id.filter_30_days -> {
                setFilter(FilterType.DAYS_30, item)
                true
            }
            R.id.action_settings -> true
            else -> super.onOptionsItemSelected(item)
        }
    }
    
    private fun setFilter(filterType: FilterType, menuItem: MenuItem) {
        currentFilter = filterType
        
        // Update menu item checked state
        currentFilterMenuItem?.isChecked = false
        menuItem.isChecked = true
        currentFilterMenuItem = menuItem
        
        // Update timeline with new filter
        applyFiltersAndSearch()
        
        val filterName = when (filterType) {
            FilterType.ALL -> "All Entries"
            FilterType.TODAY -> "Today"
            FilterType.YESTERDAY -> "Yesterday"
            FilterType.THIS_WEEK -> "This Week"
            FilterType.DAYS_3 -> "Last 3 Days"
            FilterType.DAYS_7 -> "Last 7 Days"
            FilterType.DAYS_30 -> "Last 30 Days"
            FilterType.CUSTOM_RANGE -> "Custom Range"
        }
        Toast.makeText(this, "Filter: $filterName", Toast.LENGTH_SHORT).show()
    }
    
    private fun copyTodayEntries() {
        val todayEntries = TimelineUtils.getTodayEntries(items)
        
        if (todayEntries.isEmpty()) {
            Toast.makeText(this, "No entries for today", Toast.LENGTH_SHORT).show()
            return
        }
        
        val formattedText = TimelineUtils.formatEntriesForCopy(todayEntries)
        copyToClipboard(formattedText)
        Toast.makeText(this, "Copied ${todayEntries.size} entries", Toast.LENGTH_SHORT).show()
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
                val url = "http://$ipAddress:$port"
                updateToolbarUrl(url, true)
                Toast.makeText(this, "Server: $url", Toast.LENGTH_SHORT).show()
            } else {
                updateToolbarUrl(null, false)
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
        updateToolbarUrl(null, false)
        Toast.makeText(this, R.string.server_stopped, Toast.LENGTH_SHORT).show()
    }
    
    private fun updateToolbarUrl(url: String?, isConnected: Boolean) {
        if (isConnected && url != null) {
            toolbarServerUrl.text = "🌐 $url"
            toolbarServerUrl.setTextColor(0xFF00FF00.toInt()) // Bright green
        } else {
            toolbarServerUrl.text = "⚠️ Server Offline"
            toolbarServerUrl.setTextColor(0xFFFF0000.toInt()) // Red
        }
        toolbarServerUrl.visibility = View.VISIBLE
    }
    
    private fun copyToClipboard(text: String) {
        val clipboard = getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
        val clip = ClipData.newPlainText("Standup Entries", text)
        clipboard.setPrimaryClip(clip)
    }
    
    override fun onPause() {
        super.onPause()
        // Auto-save draft when app goes to background
        if (isComposerMode) {
            saveDraft()
        }
    }
    
    private fun requestNotificationPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(
                    this,
                    Manifest.permission.POST_NOTIFICATIONS
                ) != PackageManager.PERMISSION_GRANTED
            ) {
                ActivityCompat.requestPermissions(
                    this,
                    arrayOf(Manifest.permission.POST_NOTIFICATIONS),
                    NOTIFICATION_PERMISSION_REQUEST_CODE
                )
            }
        }
    }
    
    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        
        if (requestCode == NOTIFICATION_PERMISSION_REQUEST_CODE) {
            if (grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                Toast.makeText(this, "Notifications enabled", Toast.LENGTH_SHORT).show()
                scheduleReminders()
            } else {
                Toast.makeText(this, "Notifications disabled", Toast.LENGTH_SHORT).show()
            }
        }
    }
    
    private fun scheduleReminders() {
        val intervalMinutes = notificationHelper.getReminderInterval()
        
        val reminderRequest = PeriodicWorkRequestBuilder<ReminderWorker>(
            intervalMinutes, TimeUnit.MINUTES
        ).build()
        
        WorkManager.getInstance(this).enqueueUniquePeriodicWork(
            "standup_reminders",
            ExistingPeriodicWorkPolicy.KEEP,
            reminderRequest
        )
    }
    
    private fun showPopupMenu(view: View) {
        val popup = android.widget.PopupMenu(this, view)
        popup.menuInflater.inflate(R.menu.menu_main, popup.menu)
        
        popup.setOnMenuItemClickListener { item ->
            when (item.itemId) {
                R.id.action_copy_today -> {
                    copyTodayEntries()
                    true
                }
                R.id.action_settings -> {
                    showReminderSettings()
                    true
                }
                else -> false
            }
        }
        
        popup.show()
    }
    
    private fun showReminderSettings() {
        val intervals = arrayOf("15 minutes", "30 minutes", "1 hour", "2 hours", "4 hours")
        val intervalValues = longArrayOf(15, 30, 60, 120, 240)
        
        val currentInterval = notificationHelper.getReminderInterval()
        val currentIndex = intervalValues.indexOf(currentInterval).takeIf { it >= 0 } ?: 2
        
        android.app.AlertDialog.Builder(this)
            .setTitle("Reminder Interval")
            .setSingleChoiceItems(intervals, currentIndex) { dialog, which ->
                notificationHelper.setReminderInterval(intervalValues[which])
                
                // Reschedule reminders with new interval
                WorkManager.getInstance(this).cancelUniqueWork("standup_reminders")
                scheduleReminders()
                
                Toast.makeText(this, "Reminder set to ${intervals[which]}", Toast.LENGTH_SHORT).show()
                dialog.dismiss()
            }
            .setNegativeButton("Cancel", null)
            .show()
    }
    
    private fun restartServer() {
        // Animate the restart button
        restartServerButton.animate()
            .rotationBy(360f)
            .setDuration(500)
            .start()
        
        // Stop and restart server
        stopServer()
        android.os.Handler(android.os.Looper.getMainLooper()).postDelayed({
            startServer()
        }, 500)
    }
    
    private fun setupComposerFocusAnimation() {
        val glowAnimation = AnimationUtils.loadAnimation(this, R.anim.glow_pulse)
        
        quickJotInput.setOnFocusChangeListener { _, hasFocus ->
            if (hasFocus) {
                // Start glow animation when focused
                composerContainer.startAnimation(glowAnimation)
            } else {
                // Stop animation when focus lost
                composerContainer.clearAnimation()
            }
        }
    }
    
    override fun onDestroy() {
        super.onDestroy()
        stopServer()
    }
}