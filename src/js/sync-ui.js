// Shared sync UI component for all pages
// Provides sync button, status indicator, and connection modal

class SyncUI {
  constructor(containerId) {
    this.containerId = containerId;
    this.syncManager = window.syncManager;
  }

  // Render sync UI
  render() {
    const container = document.getElementById(this.containerId);
    if (!container) {
      console.error(`Container ${this.containerId} not found`);
      return;
    }

    container.innerHTML = `
      <button id="syncButton" class="sync-button" title="Sync with phone">
        <span id="syncStatusIndicator" class="sync-status-indicator"></span>
        <span id="syncIcon">🔄</span>
        <span id="syncStatus">Sync</span>
      </button>
    `;

    // Add modal HTML to body
    this.addModalToBody();

    // Set up event listeners
    this.setupEventListeners();

    // Update initial status
    this.updateStatus();
  }

  // Add modal HTML to body
  addModalToBody() {
    const modalHTML = `
      <div id="syncModal" class="sync-modal" style="display: none;">
        <div class="sync-modal-content">
          <div class="sync-modal-header">
            <h2>📱 Sync with Phone</h2>
            <button id="closeSyncModal" class="close-modal-btn">×</button>
          </div>
          
          <div id="syncConnectionStatus" class="sync-connection-status" style="display: none;">
            <span id="syncStatusText">✓ Connected</span>
          </div>
          
          <div class="sync-modal-body">
            <div class="sync-input-group">
              <label for="phoneIPModal">Phone IP Address</label>
              <input type="text" id="phoneIPModal" placeholder="192.168.1.100" />
            </div>
            
            <div class="sync-input-group">
              <label for="phonePortModal">Port</label>
              <input type="text" id="phonePortModal" placeholder="8080" value="8080" />
            </div>
            
            <div class="sync-modal-actions">
              <button id="connectPhoneBtnModal" class="sync-btn-primary">Connect to Phone</button>
              <button id="disconnectPhoneBtnModal" class="sync-btn-secondary" style="display: none;">Disconnect</button>
            </div>
            
            <div class="sync-info">
              <p>💡 <strong>How to connect:</strong></p>
              <ol>
                <li>Open StandupNow app on your Android phone</li>
                <li>Go to Settings → Sync</li>
                <li>Note the IP address and port shown</li>
                <li>Enter them above and click Connect</li>
              </ol>
              <p style="margin-top: 12px;">
                <strong>Auto-sync:</strong> Once connected, your entries will sync automatically every minute.
              </p>
            </div>
          </div>
        </div>
      </div>
    `;

    // Remove existing modal if present
    const existingModal = document.getElementById('syncModal');
    if (existingModal) {
      existingModal.remove();
    }

    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }

  // Setup event listeners
  setupEventListeners() {
    // Sync button click
    document.getElementById('syncButton').addEventListener('click', async () => {
      const status = await this.syncManager.getSyncStatus();
      
      if (status.connected) {
        // If connected, trigger sync
        await this.triggerSync();
      } else {
        // If not connected, show modal
        this.showModal();
      }
    });

    // Close modal
    document.getElementById('closeSyncModal').addEventListener('click', () => {
      this.hideModal();
    });

    // Close modal on outside click
    document.getElementById('syncModal').addEventListener('click', (e) => {
      if (e.target.id === 'syncModal') {
        this.hideModal();
      }
    });

    // Connect button
    document.getElementById('connectPhoneBtnModal').addEventListener('click', async () => {
      await this.handleConnect();
    });

    // Disconnect button
    document.getElementById('disconnectPhoneBtnModal').addEventListener('click', async () => {
      await this.handleDisconnect();
    });

    // Listen for sync complete events
    window.addEventListener('syncComplete', () => {
      this.updateStatus();
    });

    // Update status periodically
    setInterval(() => this.updateStatus(), 30000); // Every 30 seconds
  }

  // Show modal
  showModal() {
    document.getElementById('syncModal').style.display = 'flex';
    this.updateModalDisplay();
  }

  // Hide modal
  hideModal() {
    document.getElementById('syncModal').style.display = 'none';
  }

  // Update modal display
  async updateModalDisplay() {
    const status = await this.syncManager.getSyncStatus();
    const statusDiv = document.getElementById('syncConnectionStatus');
    const statusText = document.getElementById('syncStatusText');
    const connectBtn = document.getElementById('connectPhoneBtnModal');
    const disconnectBtn = document.getElementById('disconnectPhoneBtnModal');
    const ipInput = document.getElementById('phoneIPModal');
    const portInput = document.getElementById('phonePortModal');
    
    if (status.connected) {
      // Connected
      statusDiv.style.display = 'block';
      statusDiv.style.background = 'rgba(76, 175, 80, 0.1)';
      statusDiv.style.borderColor = 'rgba(76, 175, 80, 0.3)';
      statusText.style.color = '#4CAF50';
      
      if (status.lastSyncTime) {
        const lastSync = new Date(status.lastSyncTime);
        const now = new Date();
        const diffMinutes = Math.floor((now - lastSync) / (1000 * 60));
        statusText.textContent = `✓ Connected - Last sync: ${diffMinutes < 1 ? 'just now' : diffMinutes + 'm ago'}`;
      } else {
        statusText.textContent = '✓ Connected - Ready to sync';
      }
      
      // Extract IP and port from serverUrl
      if (status.serverUrl) {
        const url = new URL(status.serverUrl);
        ipInput.value = url.hostname;
        portInput.value = url.port || '8080';
      }
      ipInput.disabled = true;
      portInput.disabled = true;
      
      connectBtn.style.display = 'none';
      disconnectBtn.style.display = 'block';
    } else {
      // Not connected
      statusDiv.style.display = 'none';
      ipInput.disabled = false;
      portInput.disabled = false;
      connectBtn.style.display = 'block';
      disconnectBtn.style.display = 'none';
    }
  }

  // Handle connect
  async handleConnect() {
    const ip = document.getElementById('phoneIPModal').value.trim();
    const port = document.getElementById('phonePortModal').value.trim();
    
    if (!ip || !port) {
      this.showToast('⚠️ Enter IP and port', '❌');
      return;
    }
    
    const btn = document.getElementById('connectPhoneBtnModal');
    btn.disabled = true;
    btn.textContent = 'Connecting...';
    
    try {
      const result = await this.syncManager.connect(ip, port);
      
      if (result.success) {
        this.showToast('✓ Connected to phone', '🔄');
        await this.updateModalDisplay();
        await this.updateStatus();
        
        // Trigger initial sync
        const syncResult = await this.syncManager.syncWithPhone();
        if (syncResult.success) {
          this.showToast(`✓ Synced ${syncResult.pushed} entries to phone`, '🔄');
        }
      } else {
        this.showToast('✗ Cannot reach phone', '❌');
      }
    } catch (error) {
      this.showToast('✗ Connection failed', '❌');
      console.error('Connection error:', error);
    } finally {
      btn.disabled = false;
      btn.textContent = 'Connect to Phone';
    }
  }

  // Handle disconnect
  async handleDisconnect() {
    await this.syncManager.disconnect();
    this.showToast('✓ Disconnected', '🔄');
    await this.updateModalDisplay();
    await this.updateStatus();
  }

  // Trigger sync
  async triggerSync() {
    const btn = document.getElementById('syncButton');
    const icon = document.getElementById('syncIcon');
    const statusText = document.getElementById('syncStatus');
    
    btn.disabled = true;
    icon.style.animation = 'spin 1s linear infinite';
    statusText.textContent = 'Syncing...';
    
    const result = await this.syncManager.syncWithPhone();
    
    if (result.success) {
      this.showToast(`✓ Synced: ${result.pushed} sent, ${result.pulled} received`, '🔄');
    } else {
      this.showToast(`✗ Sync failed: ${result.error}`, '❌');
    }
    
    icon.style.animation = '';
    btn.disabled = false;
    await this.updateStatus();
  }

  // Update sync button status
  async updateStatus() {
    const status = await this.syncManager.getSyncStatus();
    const btn = document.getElementById('syncButton');
    const indicator = document.getElementById('syncStatusIndicator');
    const icon = document.getElementById('syncIcon');
    const statusText = document.getElementById('syncStatus');
    
    if (!btn) return;
    
    if (status.connected) {
      // Connected - Green box
      btn.style.borderColor = '#4CAF50';
      btn.style.color = '#4CAF50';
      indicator.className = 'sync-status-indicator connected';
      icon.textContent = '🔄';
      
      if (status.lastSyncTime) {
        const lastSync = new Date(status.lastSyncTime);
        const now = new Date();
        const diffMinutes = Math.floor((now - lastSync) / (1000 * 60));
        statusText.textContent = diffMinutes < 1 ? 'Synced' : `${diffMinutes}m ago`;
      } else {
        statusText.textContent = 'Connected';
      }
    } else {
      // Not connected - Red box with !
      btn.style.borderColor = '#FF5252';
      btn.style.color = '#FF5252';
      indicator.className = 'sync-status-indicator disconnected';
      indicator.textContent = '!';
      icon.textContent = '📱';
      statusText.textContent = 'Not Syncing';
    }
  }

  // Show toast notification
  showToast(message, icon = '⏰') {
    // Remove any existing toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
      existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span class="toast-icon">${icon}</span><span>${message}</span>`;
    document.body.appendChild(toast);
    
    // Remove toast after animation completes
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }
}

// CSS for sync UI (to be added to each page's styles)
const syncUIStyles = `
  .sync-button {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    background: transparent;
    border: 2px solid #FFD700;
    border-radius: 8px;
    color: #FFD700;
    font-family: inherit;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
  }
  
  .sync-status-indicator {
    width: 12px;
    height: 12px;
    border-radius: 3px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 700;
    transition: all 0.2s;
  }
  
  .sync-status-indicator.connected {
    background: #4CAF50;
    box-shadow: 0 0 8px rgba(76, 175, 80, 0.6);
  }
  
  .sync-status-indicator.disconnected {
    background: #FF5252;
    color: white;
    box-shadow: 0 0 8px rgba(255, 82, 82, 0.6);
    animation: pulse 2s ease-in-out infinite;
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }
  
  .sync-button:hover {
    background: rgba(255, 215, 0, 0.1);
    transform: translateY(-1px);
  }
  
  .sync-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  #syncIcon {
    font-size: 16px;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  .sync-modal {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    z-index: 10000;
    align-items: center;
    justify-content: center;
  }
  
  .sync-modal-content {
    background: #1a1a1a;
    border: 2px solid #FFD700;
    border-radius: 12px;
    width: 90%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
  }
  
  .sync-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid rgba(255, 215, 0, 0.2);
  }
  
  .sync-modal-header h2 {
    margin: 0;
    font-size: 20px;
    color: #FFD700;
  }
  
  .close-modal-btn {
    background: none;
    border: none;
    color: #888;
    font-size: 32px;
    cursor: pointer;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.2s;
  }
  
  .close-modal-btn:hover {
    color: #FFD700;
  }
  
  .sync-connection-status {
    margin: 20px;
    padding: 12px;
    border-radius: 8px;
    border: 1px solid;
    text-align: center;
    font-weight: 600;
  }
  
  .sync-modal-body {
    padding: 20px;
  }
  
  .sync-input-group {
    margin-bottom: 16px;
  }
  
  .sync-input-group label {
    display: block;
    margin-bottom: 6px;
    font-size: 13px;
    color: #FFD700;
    font-weight: 600;
  }
  
  .sync-input-group input {
    width: 100%;
    padding: 10px;
    background: #0f0f0f;
    border: 1px solid rgba(255, 215, 0, 0.3);
    border-radius: 6px;
    color: #e0e0e0;
    font-family: inherit;
    font-size: 14px;
  }
  
  .sync-input-group input:focus {
    outline: none;
    border-color: #FFD700;
  }
  
  .sync-input-group input:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .sync-modal-actions {
    display: flex;
    gap: 12px;
    margin-top: 20px;
  }
  
  .sync-btn-primary,
  .sync-btn-secondary {
    flex: 1;
    padding: 12px;
    border-radius: 8px;
    font-family: inherit;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .sync-btn-primary {
    background: #FFD700;
    border: none;
    color: #000;
  }
  
  .sync-btn-primary:hover {
    background: #FFC700;
    transform: translateY(-1px);
  }
  
  .sync-btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .sync-btn-secondary {
    background: transparent;
    border: 2px solid #FF5252;
    color: #FF5252;
  }
  
  .sync-btn-secondary:hover {
    background: rgba(255, 82, 82, 0.1);
  }
  
  .sync-info {
    margin-top: 24px;
    padding: 16px;
    background: rgba(255, 215, 0, 0.05);
    border: 1px solid rgba(255, 215, 0, 0.2);
    border-radius: 8px;
    font-size: 13px;
    line-height: 1.6;
  }
  
  .sync-info ol {
    margin: 8px 0;
    padding-left: 20px;
  }
  
  .sync-info li {
    margin: 4px 0;
  }
`;

// Made with Bob
