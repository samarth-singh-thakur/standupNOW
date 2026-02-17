# Android Emulator Setup for StandupNow Sync

## Special Network Configuration for Emulator

When running the Android app in an **emulator**, the network setup is different from a physical device.

## IP Address for Emulator

### ❌ Don't Use: `10.0.2.16`
This is the emulator's own IP address - it won't work for connecting to your computer.

### ✅ Use: `10.0.2.2`
This is the special IP that the Android emulator uses to access the **host machine** (your computer).

## Connection Setup

### In Android Emulator:
1. Start your server in the Android app
2. The app will show: `10.0.2.16:8080`
3. **Ignore this IP** - it's for the emulator itself

### In Chrome Extension:
1. Click the sync button (🔄)
2. Enter:
   - **IP Address**: `10.0.2.2`
   - **Port**: `8080` (same port shown in app)
3. Click "Connect to Phone"

## Why This Works

```
┌─────────────────────┐
│  Your Computer      │
│  (Host Machine)     │
│                     │
│  ┌───────────────┐  │
│  │   Emulator    │  │
│  │   10.0.2.16   │  │
│  │               │  │
│  │   10.0.2.2 ───┼──┼──> Points to Host
│  └───────────────┘  │
└─────────────────────┘
```

- `10.0.2.2` is a special alias that always points to the host machine
- The emulator translates `10.0.2.2` to your computer's localhost
- Your server running on port 8080 becomes accessible at `10.0.2.2:8080`

## Testing Connection

### 1. Verify Server is Running
In Android app, you should see:
```
Server Running
Address: 10.0.2.16
Port: 8080
```

### 2. Test from Extension
Open Chrome DevTools Console and run:
```javascript
fetch('http://10.0.2.2:8080/api/ping')
  .then(r => console.log('Connected!', r.status))
  .catch(e => console.error('Failed:', e));
```

### 3. If Connection Fails

**Check Firewall:**
```bash
# Windows: Allow port 8080
netsh advfirewall firewall add rule name="Android Sync" dir=in action=allow protocol=TCP localport=8080

# Mac: System Preferences > Security & Privacy > Firewall > Firewall Options
# Add your app and allow incoming connections
```

**Check Server is Listening:**
- Make sure the Android app shows "Server Running"
- Port 8080 should be open on your computer

## Physical Device vs Emulator

| Device Type | IP Address to Use |
|-------------|-------------------|
| **Emulator** | `10.0.2.2` |
| **Physical Device** (same WiFi) | Your computer's local IP (e.g., `192.168.1.100`) |

## Quick Reference

### Emulator Setup:
```
Extension Settings:
├─ IP: 10.0.2.2
└─ Port: 8080
```

### Physical Device Setup:
```
Extension Settings:
├─ IP: 192.168.1.100 (your computer's IP)
└─ Port: 8080
```

## Troubleshooting

### "Cannot reach phone"
1. ✅ Use `10.0.2.2` not `10.0.2.16`
2. ✅ Check server is running in Android app
3. ✅ Check firewall allows port 8080
4. ✅ Try `http://10.0.2.2:8080/api/ping` in browser

### "Connection failed"
1. Server might not be running
2. Wrong port number
3. Firewall blocking connection

### "Sync failed"
1. Connection was successful but sync logic failed
2. Check Chrome DevTools console for errors
3. Check Android app logs

## Example: Complete Setup

1. **Start Android Server:**
   ```
   App shows: 10.0.2.16:8080
   ```

2. **In Extension:**
   ```
   Click 🔄 button
   Enter: 10.0.2.2
   Port: 8080
   Click "Connect to Phone"
   ```

3. **Success:**
   ```
   ✓ Connected to phone
   Button turns green ✓
   ```

4. **Sync:**
   ```
   Click ✓ button again
   Shows: "Last sync: just now"
   ```

---

**Remember:** Always use `10.0.2.2` for emulator, never `10.0.2.16`!