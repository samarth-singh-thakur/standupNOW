package com.samarth.standupnow

import android.app.Dialog
import android.os.Bundle
import android.widget.EditText
import androidx.appcompat.app.AlertDialog
import androidx.fragment.app.DialogFragment
import androidx.fragment.app.setFragmentResult

class AddItemDialogFragment : DialogFragment() {

    override fun onCreateDialog(savedInstanceState: Bundle?): Dialog {
        val editText = EditText(requireContext()).apply {
            hint = "Enter your text"
            setPadding(50, 40, 50, 40)
        }

        return AlertDialog.Builder(requireContext())
            .setTitle("Add New Item")
            .setView(editText)
            .setPositiveButton("Save") { _, _ ->
                val text = editText.text.toString().trim()
                if (text.isNotEmpty()) {
                    val result = Bundle().apply {
                        putString("item_text", text)
                    }
                    setFragmentResult("add_item_request", result)
                }
            }
            .setNegativeButton("Cancel", null)
            .create()
    }

    companion object {
        const val TAG = "AddItemDialogFragment"
    }
}

// Made with Bob
