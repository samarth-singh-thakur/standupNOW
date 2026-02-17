package com.samarth.standupnow

import android.app.DatePickerDialog
import android.app.Dialog
import android.os.Bundle
import androidx.appcompat.app.AlertDialog
import androidx.fragment.app.DialogFragment
import java.text.SimpleDateFormat
import java.util.*

class DateRangePickerDialog : DialogFragment() {
    
    private var startDate: Long? = null
    private var endDate: Long? = null
    private var onDateRangeSelected: ((Long, Long) -> Unit)? = null
    
    companion object {
        private const val TAG = "DateRangePickerDialog"
        
        fun newInstance(callback: (Long, Long) -> Unit): DateRangePickerDialog {
            return DateRangePickerDialog().apply {
                onDateRangeSelected = callback
            }
        }
    }
    
    override fun onCreateDialog(savedInstanceState: Bundle?): Dialog {
        val dateFormat = SimpleDateFormat("MMM dd, yyyy", Locale.getDefault())
        
        val view = layoutInflater.inflate(R.layout.dialog_date_range_picker, null)
        val startDateButton = view.findViewById<android.widget.Button>(R.id.btn_start_date)
        val endDateButton = view.findViewById<android.widget.Button>(R.id.btn_end_date)
        
        // Set initial dates to today
        val today = Calendar.getInstance()
        endDate = today.timeInMillis
        
        val weekAgo = Calendar.getInstance()
        weekAgo.add(Calendar.DAY_OF_YEAR, -7)
        startDate = weekAgo.timeInMillis
        
        startDateButton.text = "Start: ${dateFormat.format(Date(startDate!!))}"
        endDateButton.text = "End: ${dateFormat.format(Date(endDate!!))}"
        
        // Start date picker
        startDateButton.setOnClickListener {
            val calendar = Calendar.getInstance()
            startDate?.let { calendar.timeInMillis = it }
            
            DatePickerDialog(
                requireContext(),
                { _, year, month, day ->
                    val selected = Calendar.getInstance()
                    selected.set(year, month, day, 0, 0, 0)
                    selected.set(Calendar.MILLISECOND, 0)
                    startDate = selected.timeInMillis
                    startDateButton.text = "Start: ${dateFormat.format(Date(startDate!!))}"
                },
                calendar.get(Calendar.YEAR),
                calendar.get(Calendar.MONTH),
                calendar.get(Calendar.DAY_OF_MONTH)
            ).show()
        }
        
        // End date picker
        endDateButton.setOnClickListener {
            val calendar = Calendar.getInstance()
            endDate?.let { calendar.timeInMillis = it }
            
            DatePickerDialog(
                requireContext(),
                { _, year, month, day ->
                    val selected = Calendar.getInstance()
                    selected.set(year, month, day, 23, 59, 59)
                    selected.set(Calendar.MILLISECOND, 999)
                    endDate = selected.timeInMillis
                    endDateButton.text = "End: ${dateFormat.format(Date(endDate!!))}"
                },
                calendar.get(Calendar.YEAR),
                calendar.get(Calendar.MONTH),
                calendar.get(Calendar.DAY_OF_MONTH)
            ).show()
        }
        
        return AlertDialog.Builder(requireContext())
            .setTitle("Select Date Range")
            .setView(view)
            .setPositiveButton("Apply") { _, _ ->
                val start = startDate
                val end = endDate
                if (start != null && end != null) {
                    if (start <= end) {
                        onDateRangeSelected?.invoke(start, end)
                    } else {
                        // Swap if start is after end
                        onDateRangeSelected?.invoke(end, start)
                    }
                }
            }
            .setNegativeButton("Cancel", null)
            .create()
    }
}

// Made with Bob