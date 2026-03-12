#!/usr/bin/env python3
"""
Fetch entries from StandupNOW server and generate browser console script
"""

import requests
import json

# Server configuration
SERVER_URL = "http://192.168.1.7:8080"
API_ENDPOINT = f"{SERVER_URL}/api/sync"

def fetch_entries():
    """Fetch all entries from the server"""
    print("Fetching entries from server...")
    
    payload = {
        "lastSync": "1970-01-01T00:00:00.000Z",
        "entries": []
    }
    
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    
    try:
        response = requests.post(API_ENDPOINT, json=payload, headers=headers, timeout=10)
        response.raise_for_status()
        data = response.json()
        print(f"✅ Successfully fetched {len(data['entries'])} entries")
        return data
    except requests.exceptions.RequestException as e:
        print(f"❌ Error fetching entries: {e}")
        return None

def generate_console_script(server_data):
    """Generate JavaScript console script using Chrome storage API"""
    if not server_data:
        return None
    
    # Serialize the server data as a JSON string for embedding in JS
    server_json = json.dumps(server_data, indent=2)
    
    # Create the JavaScript code
    js_code = f"""// Paste this entire script in your Chrome extension console (F12 -> Console tab)
(function() {{
  console.log('🔄 Starting import from phone server...');
  
  const serverResponse = {server_json};
  
  // Convert main branch format (note, time) to v2.0 format (content, timestamp)
  const v2Entries = serverResponse.entries
    .filter(e => !e.deleted)
    .map(e => ({{
      id: e.id,
      content: e.note,
      timestamp: e.time
    }}));
  
  console.log('📦 Converted', v2Entries.length, 'entries to v2.0 format');
  
  // Save to Chrome storage
  chrome.storage.local.set({{ 'standupnow_entries': v2Entries }}, function() {{
    if (chrome.runtime.lastError) {{
      console.error('❌ Error saving to Chrome storage:', chrome.runtime.lastError);
    }} else {{
      console.log('✅ Successfully saved', v2Entries.length, 'entries to Chrome storage');
      console.log('🔄 Reloading extension...');
      
      // Reload the page to show new entries
      setTimeout(() => location.reload(), 500);
    }}
  }});
}})();"""
    
    return js_code

def main():
    print("=" * 60)
    print("StandupNOW Entry Import Script Generator")
    print("=" * 60)
    print()
    
    # Fetch entries
    server_data = fetch_entries()
    
    if not server_data:
        print("\n❌ Failed to fetch entries. Please check:")
        print("  1. Server is running at http://192.168.1.7:8080")
        print("  2. You're on the same network")
        print("  3. Server has CORS enabled (if accessing from browser)")
        return
    
    # Generate script
    print("\nGenerating console script...")
    js_script = generate_console_script(server_data)
    
    if not js_script:
        print("❌ Failed to generate script")
        return
    
    # Save to file
    output_file = "import_entries_script.js"
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(js_script)
    
    print(f"✅ Script saved to: {output_file}")
    print()
    print("=" * 60)
    print("NEXT STEPS:")
    print("=" * 60)
    print("1. Open your Chrome extension (click the icon)")
    print("2. Press F12 to open Developer Tools")
    print("3. Go to the 'Console' tab")
    print(f"4. Open {output_file} and copy ALL the code")
    print("5. Paste it into the console and press Enter")
    print("6. The extension will reload with all your entries!")
    print("=" * 60)

if __name__ == "__main__":
    main()

# Made with Bob
