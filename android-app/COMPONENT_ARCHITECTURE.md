# Component Architecture

## Overview
The app follows a modular component-based architecture with clear separation of concerns.

## Folder Structure

```
app/src/main/res/layout/
├── component_header_bar.xml         # HeaderBar component
├── component_entry_composer.xml     # EntryComposer component
├── component_content_controls.xml   # ContentControls component
├── component_entry_card.xml         # EntryCard component
├── activity_main.xml                # HomeScreen (main activity)
├── item_date_header.xml             # Date header for timeline
├── dialog_date_range_picker.xml     # Date range picker dialog
└── [legacy layouts]                 # Old layouts (to be migrated)
```

**Note:** Android doesn't support subdirectories in the `layout` folder, so we use a flat structure with naming conventions:
- `component_*` - Reusable UI components
- `activity_*` - Activity screens
- `item_*` - RecyclerView item layouts
- `dialog_*` - Dialog layouts

## Component Hierarchy

```
HomeScreen (activity_main.xml)
 ├── HeaderBar (component_header_bar.xml)
 │    ├── Toolbar
 │    ├── Server URL Display
 │    └── Entries Count
 ├── EntryComposer (component_entry_composer.xml)
 │    ├── Section Label
 │    ├── Multiline Input (200dp)
 │    └── Save Button
 ├── ContentControls (component_content_controls.xml)
 │    ├── SearchBar
 │    │    ├── Search Icon
 │    │    └── Search Input
 │    └── FilterTabs
 │         ├── Chip: All
 │         ├── Chip: Today
 │         ├── Chip: Yesterday
 │         ├── Chip: This Week
 │         └── Chip: Custom Range
 ├── EntryList (RecyclerView)
 │    └── EntryCard[] (component_entry_card.xml)
 │         ├── Time Gap Text
 │         ├── Card Container
 │         │    ├── Gold Accent Bar
 │         │    ├── Timestamp
 │         │    └── Entry Text
 └── FAB (Floating Action Button)
```

## Component Details

### 1. HeaderBar
**File:** `components/component_header_bar.xml`

**Purpose:** Top navigation with app branding and status indicators

**Features:**
- App title/logo
- Server connection status (IP address with color coding)
- Entries count display
- Overflow menu access

**IDs:**
- `toolbar` - MaterialToolbar
- `toolbar_server_url` - Server URL TextView
- `toolbar_entries_count` - Entries count TextView

---

### 2. EntryComposer
**File:** `components/component_entry_composer.xml`

**Purpose:** Primary interaction surface for creating new entries

**Features:**
- Glowing gold border with pulsing animation
- Large multiline text input (200dp height)
- Inline save button
- Keyboard shortcut support (Ctrl+Enter)

**IDs:**
- `entry_composer` - Container LinearLayout
- `composer_label` - Section label TextView
- `composer_input` - Multiline EditText
- `composer_save_button` - Save Button

**Styling:**
- Background: `@drawable/bg_quick_jot_glow`
- Animation: `@anim/glow_pulse`

---

### 3. ContentControls
**File:** `components/component_content_controls.xml`

**Purpose:** Search and filter navigation for entries

**Features:**
- Real-time search functionality
- Segmented filter chips
- Horizontal scrollable layout

**IDs:**
- `content_controls` - Container LinearLayout
- `search_bar` - Search container
- `search_input` - Search EditText
- `filter_tabs` - HorizontalScrollView
- `filter_chip_group` - ChipGroup
- `chip_all`, `chip_today`, `chip_yesterday`, `chip_this_week`, `chip_custom_range` - Filter Chips

---

### 4. EntryCard
**File:** `components/component_entry_card.xml`

**Purpose:** Individual timeline entry display

**Features:**
- Time gap indicator (between entries)
- Gold accent vertical bar
- Timestamp display
- Entry text in monospace font

**IDs:**
- `time_gap_text` - Time gap TextView
- `entry_card` - MaterialCardView
- `accent_bar` - Gold vertical bar View
- `entry_time` - Timestamp TextView
- `entry_text` - Entry content TextView

**Styling:**
- Card background: `@color/card_bg`
- Accent color: `@color/gold_accent`
- Font: Monospace

---

### 5. FAB (Floating Action Button)
**Location:** Defined in `screens/screen_home.xml`

**Purpose:** Quick access to entry creation

**Features:**
- Scrolls to EntryComposer
- Focuses input field
- Shows keyboard automatically

**IDs:**
- `fab` - FloatingActionButton

**Styling:**
- Background: `@color/gold_accent`
- Icon tint: `@color/dark_bg`
- Position: Bottom-end with 24dp margin

---

## Screen Details

### HomeScreen
**File:** `activity_main.xml`

**Purpose:** Main application screen

**Layout Structure:**
- CoordinatorLayout (root)
  - LinearLayout (main content)
    - HeaderBar (include)
    - NestedScrollView
      - EntryComposer (include)
      - ContentControls (include)
      - EntryList (RecyclerView)
  - FAB

**Key Features:**
- Scrollable content area
- Sticky header
- Floating action button
- Empty state handling

---

## Integration Points

### MainActivity.kt
**Component References:**
```kotlin
// HeaderBar
toolbarServerUrl = findViewById(R.id.toolbar_server_url)
entriesCountText = findViewById(R.id.toolbar_entries_count)

// EntryComposer
quickJotContainer = findViewById(R.id.entry_composer)
quickJotInput = findViewById(R.id.composer_input)
quickJotSave = findViewById(R.id.composer_save_button)

// ContentControls
searchInput = findViewById(R.id.search_input)
chipAll = findViewById(R.id.chip_all)
// ... other chips

// EntryList
recyclerView = findViewById(R.id.recycler_view)
emptyText = findViewById(R.id.empty_state_text)

// FAB
binding.fab.setOnClickListener { ... }
```

### TimelineAdapter.kt
**Component Usage:**
```kotlin
VIEW_TYPE_ENTRY -> {
    val view = LayoutInflater.from(parent.context)
        .inflate(R.layout.component_entry_card, parent, false)
    EntryViewHolder(view)
}
```

---

## Design Principles

1. **Modularity**: Each component is self-contained and reusable
2. **Single Responsibility**: Components have one clear purpose
3. **Composition**: Complex UIs built from simple components
4. **Consistency**: Shared styling through theme and color resources
5. **Maintainability**: Clear folder structure and naming conventions

---

## Benefits

✅ **Reusability**: Components can be used across multiple screens
✅ **Testability**: Individual components can be tested in isolation
✅ **Maintainability**: Changes to one component don't affect others
✅ **Scalability**: Easy to add new components or screens
✅ **Clarity**: Clear separation between components and screens
✅ **Collaboration**: Multiple developers can work on different components

---

## Future Enhancements

- Create ViewModels for each component
- Add component-specific styles
- Implement data binding
- Add unit tests for components
- Create Jetpack Compose versions
- Add accessibility improvements
- Implement dark mode variants

---

## Migration Notes

**Legacy Layouts** (to be migrated):
- `content_main.xml` → Deprecated (functionality moved to screen_home.xml)
- `item_user.xml` → Deprecated (replaced by component_entry_card.xml)
- `item_timeline_entry.xml` → Deprecated (replaced by component_entry_card.xml)

**Symlink:**
- `activity_main.xml` → Points to `screens/screen_home.xml` for backward compatibility

---

Made with ❤️ by IBM Bob