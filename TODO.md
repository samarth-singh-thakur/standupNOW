# TODO List - standupNOW Enhancements

## 1. Encryption & Data Security
- [ ] Research encryption methods for data in transit (TLS/SSL, end-to-end encryption)
- [ ] Design pairing mechanism for devices on home network
  - [ ] Consider device discovery protocols
  - [ ] Implement secure handshake/pairing flow
  - [ ] Handle multiple users on same network
- [ ] Implement device authentication/authorization
- [ ] Add encryption for sync data
- [ ] Test security implementation across different network scenarios

## 2. Sync Button Text Issue
- [ ] Investigate sync button text behavior in `src/js/sync-modal.js`
- [ ] Check button state management and text updates
- [ ] Identify root cause of text display issue
- [ ] Fix sync button text rendering
- [ ] Test sync button across different states (idle, syncing, success, error)

## 3. Markdown File Support
- [ ] Analyze current data structure and storage format
- [ ] Design markdown export/import functionality
  - [ ] Define markdown format for entries
  - [ ] Consider metadata handling (timestamps, tags, etc.)
- [ ] Implement markdown file reading capability
- [ ] Implement markdown file writing capability
- [ ] Add UI for markdown file operations (import/export buttons)
- [ ] Test markdown integration with existing entries

## 4. Custom Timer Enhancement
- [ ] Review current timer implementation in `src/js/timer-end.js`
- [ ] Identify enhancement requirements
  - [ ] Configurable timer durations
  - [ ] Custom notification sounds/messages
  - [ ] Timer presets
  - [ ] Break reminders
- [ ] Design custom timer features
- [ ] Implement custom timer enhancements
- [ ] Update UI for custom timer controls
- [ ] Add timer settings to settings modal
- [ ] Test timer functionality across different scenarios

---

## Notes
- Priority should be given to security (encryption) as it affects data integrity
- Sync button fix is a quick win that improves UX
- Markdown support expands use cases significantly
- Timer enhancements improve daily usability