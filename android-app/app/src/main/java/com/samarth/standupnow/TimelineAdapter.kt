package com.samarth.standupnow

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView

class TimelineAdapter(private val items: MutableList<TimelineItem>) : 
    RecyclerView.Adapter<RecyclerView.ViewHolder>() {

    companion object {
        private const val VIEW_TYPE_DATE_HEADER = 0
        private const val VIEW_TYPE_ENTRY = 1
    }

    class DateHeaderViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val dateText: TextView = view.findViewById(R.id.date_header_text)
    }

    class EntryViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val timeGapText: TextView = view.findViewById(R.id.time_gap_text)
        val entryTime: TextView = view.findViewById(R.id.entry_time)
        val entryText: TextView = view.findViewById(R.id.entry_text)
    }

    override fun getItemViewType(position: Int): Int {
        return when (items[position]) {
            is TimelineItem.DateHeader -> VIEW_TYPE_DATE_HEADER
            is TimelineItem.Entry -> VIEW_TYPE_ENTRY
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RecyclerView.ViewHolder {
        return when (viewType) {
            VIEW_TYPE_DATE_HEADER -> {
                val view = LayoutInflater.from(parent.context)
                    .inflate(R.layout.item_date_header, parent, false)
                DateHeaderViewHolder(view)
            }
            VIEW_TYPE_ENTRY -> {
                val view = LayoutInflater.from(parent.context)
                    .inflate(R.layout.component_entry_card, parent, false)
                EntryViewHolder(view)
            }
            else -> throw IllegalArgumentException("Unknown view type: $viewType")
        }
    }

    override fun onBindViewHolder(holder: RecyclerView.ViewHolder, position: Int) {
        when (val item = items[position]) {
            is TimelineItem.DateHeader -> {
                (holder as DateHeaderViewHolder).dateText.text = item.dateText
            }
            is TimelineItem.Entry -> {
                holder as EntryViewHolder
                
                // Set time
                holder.entryTime.text = TimelineUtils.formatTime(item.userItem.timestamp)
                
                // Set entry text
                holder.entryText.text = item.userItem.text
                
                // Set time gap if available
                if (item.timeGapText != null) {
                    holder.timeGapText.text = item.timeGapText
                    holder.timeGapText.visibility = View.VISIBLE
                } else {
                    holder.timeGapText.visibility = View.GONE
                }
            }
        }
    }

    override fun getItemCount(): Int = items.size

    /**
     * Update the entire timeline with new items
     */
    fun updateTimeline(newItems: List<TimelineItem>) {
        items.clear()
        items.addAll(newItems)
        notifyDataSetChanged()
    }

    /**
     * Add a new entry at the top (for newly created entries)
     */
    fun addEntry(userItem: UserItem) {
        // Check if we need to add a date header
        val dateHeader = TimelineUtils.getDateHeaderText(userItem.timestamp)
        val needsHeader = items.isEmpty() || 
            (items.first() as? TimelineItem.DateHeader)?.dateText != dateHeader
        
        var insertPosition = 0
        
        if (needsHeader) {
            items.add(0, TimelineItem.DateHeader(dateHeader, userItem.timestamp))
            notifyItemInserted(0)
            insertPosition = 1
        }
        
        // Calculate time gap to next entry if exists
        val nextEntry = items.getOrNull(insertPosition) as? TimelineItem.Entry
        val timeGap = nextEntry?.let { 
            TimelineUtils.calculateTimeGap(userItem.timestamp, it.userItem.timestamp)
        }
        
        items.add(insertPosition, TimelineItem.Entry(userItem, null))
        notifyItemInserted(insertPosition)
        
        // Update next entry's time gap if needed
        if (timeGap != null && nextEntry != null) {
            val nextPosition = insertPosition + 1
            items[nextPosition] = TimelineItem.Entry(nextEntry.userItem, timeGap)
            notifyItemChanged(nextPosition)
        }
    }
}

// Made with Bob