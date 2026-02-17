# Design System Playbook
## StandupNOW Design Language

This playbook ensures design consistency across all applications and features.

---

## 🎨 **1. Color System**

### Primary Palette
```css
/* Core Colors */
--color-gold: #FFD700;           /* Primary accent, CTAs, highlights */
--color-gold-hover: #FFC700;     /* Hover states */
--color-gold-alpha-10: rgba(255, 215, 0, 0.1);
--color-gold-alpha-30: rgba(255, 215, 0, 0.3);
--color-gold-alpha-50: rgba(255, 215, 0, 0.5);

/* Background Hierarchy */
--bg-pure-black: #000000;        /* Headers, emphasis areas */
--bg-dark: #0f0f0f;              /* Cards, entries, elevated surfaces */
--bg-medium: #1a1a1a;            /* Main backgrounds, containers */
--bg-light: #2a2a2a;             /* Borders, dividers, inputs */

/* Text Colors */
--text-primary: #e0e0e0;         /* Main content */
--text-secondary: #b0b0b0;       /* Supporting text */
--text-tertiary: #888888;        /* Placeholders, hints */
--text-muted: #666666;           /* Disabled, subtle text */
--text-accent: #FFD700;          /* Highlighted text */
```

### Semantic Colors
```css
/* Status Colors */
--color-success: #4CAF50;        /* Success states, confirmations */
--color-error: #ff4444;          /* Errors, destructive actions */
--color-warning: #ff9800;        /* Warnings, demo mode */
--color-info: #4A90E2;           /* Information, neutral actions */
--color-purple: #9B59B6;         /* Alternative accent (yesterday) */
```

### Usage Rules
- **Gold (#FFD700)**: Primary CTAs, active states, important borders, key information
- **Black (#000000)**: Headers, high-contrast areas
- **Dark Gray (#0f0f0f)**: Content cards, entries
- **Medium Gray (#1a1a1a)**: Main backgrounds
- **Never use**: Pure white backgrounds (breaks dark theme)

---

## 📝 **2. Typography System**

### Font Stack
```css
font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', 
             'Fira Mono', 'Roboto Mono', 'Consolas', 
             'Courier New', monospace;
```

### Font Smoothing (Always Include)
```css
-webkit-font-smoothing: antialiased;
-moz-osx-font-smoothing: grayscale;
```

### Type Scale
```css
/* Headers */
--font-size-h1: 24px;            /* Main titles */
--font-size-h2: 20px;            /* Section headers */
--font-size-h3: 16-18px;         /* Subsection headers */

/* Body Text */
--font-size-body: 14px;          /* Standard text */
--font-size-small: 12-13px;      /* Supporting text */
--font-size-tiny: 10-11px;       /* Labels, metadata */

/* Interactive */
--font-size-button: 14px;        /* Button text */
--font-size-input: 14-16px;      /* Form inputs */
```

### Font Weights
```css
--font-weight-normal: 400;       /* Body text (rarely used) */
--font-weight-semibold: 600;     /* Emphasis, headers */
--font-weight-bold: 700;         /* Strong emphasis, CTAs */
```

### Text Styles
```css
/* Headers & Labels */
.header-text {
  text-transform: uppercase;
  letter-spacing: 0.5-1px;
  font-weight: 600-700;
}

/* Monospace Numbers (for timers, counts) */
.numeric-text {
  font-variant-numeric: tabular-nums;
  letter-spacing: 1px;
}

/* Body Text */
.body-text {
  line-height: 1.6-1.8;
}
```

---

## 📐 **3. Spacing System**

### Base Unit: 4px
```css
/* Spacing Scale (multiples of 4) */
--space-xs: 4px;
--space-sm: 8px;
--space-md: 12px;
--space-lg: 16px;
--space-xl: 20px;
--space-2xl: 24px;
--space-3xl: 30px;
--space-4xl: 40px;
```

### Common Patterns
```css
/* Padding */
--padding-button: 10-12px 16-20px;
--padding-input: 10-15px;
--padding-card: 12-20px;
--padding-section: 20-30px;

/* Gaps */
--gap-tight: 8px;
--gap-normal: 10-12px;
--gap-loose: 15-20px;

/* Margins */
--margin-element: 10-15px;
--margin-section: 20-25px;
```

---

## 🔲 **4. Border & Radius System**

### Border Widths
```css
--border-thin: 1px;              /* Subtle dividers */
--border-medium: 2px;            /* Standard borders */
--border-thick: 3-4px;           /* Emphasis, left accents */
```

### Border Radius
```css
--radius-sm: 4-6px;              /* Small elements, badges */
--radius-md: 8px;                /* Buttons, inputs, cards */
--radius-lg: 12px;               /* Large containers */
--radius-full: 50%;              /* Circular elements */
```

### Border Patterns
```css
/* Standard Border */
border: 2px solid #2a2a2a;

/* Accent Border */
border: 2px solid #FFD700;

/* Left Accent (for cards) */
border-left: 4px solid #FFD700;

/* Glowing Border */
border: 2px solid rgba(255, 215, 0, 0.3);
```

---

## 🎭 **5. Interactive States**

### Button States
```css
/* Primary Button */
.btn-primary {
  background: #FFD700;
  color: #000;
  border: none;
  box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4);
  transition: all 0.3s;
}

.btn-primary:hover {
  background: #FFC700;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 215, 0, 0.6);
}

.btn-primary:active {
  transform: translateY(0);
}

/* Secondary Button */
.btn-secondary {
  background: transparent;
  color: #FFD700;
  border: 2px solid #FFD700;
  transition: all 0.3s;
}

.btn-secondary:hover {
  background: #FFD700;
  color: #000;
  font-weight: 700;
}

/* Danger Button */
.btn-danger {
  background: #ff4444;
  color: white;
  border: 2px solid #ff4444;
}

.btn-danger:hover {
  background: #cc0000;
  border-color: #cc0000;
}
```

### Input States
```css
/* Default Input */
input, textarea {
  background: #0f0f0f;
  color: #e0e0e0;
  border: 2px solid #2a2a2a;
  transition: all 0.3s;
}

/* Focus State */
input:focus, textarea:focus {
  outline: none;
  border-color: #FFD700;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.2);
}

/* Placeholder */
::placeholder {
  color: #666;
  font-style: italic;
}
```

### Hover Transforms
```css
/* Lift Effect */
.hover-lift:hover {
  transform: translateY(-2px);
}

/* Scale Effect */
.hover-scale:hover {
  transform: scale(1.05-1.1);
}

/* Slide Effect (for cards) */
.hover-slide:hover {
  transform: translateX(4px);
}
```

---

## ✨ **6. Animation System**

### Transition Timing
```css
/* Standard Transition */
transition: all 0.3s ease;

/* Quick Transition */
transition: all 0.2s ease;

/* Slow Transition */
transition: all 0.5s ease;
```

### Common Animations
```css
/* Pulse Glow (for important sections) */
@keyframes pulseGlow {
  0%, 100% {
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.2);
  }
  50% {
    box-shadow: 0 0 30px rgba(255, 215, 0, 0.4);
  }
}

/* Fade In Scale (for new elements) */
@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-5px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Fade In (simple) */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Usage
```css
/* Apply pulse to important sections */
.important-section {
  animation: pulseGlow 2s ease-in-out infinite;
}

/* Apply fade-in to new elements */
.new-element {
  animation: fadeInScale 0.3s ease-out;
}
```

---

## 🎯 **7. Shadow System**

### Shadow Levels
```css
/* Subtle Shadow */
--shadow-sm: 0 2px 6px rgba(0, 0, 0, 0.3);

/* Standard Shadow */
--shadow-md: 0 4px 12px rgba(0, 0, 0, 0.4);

/* Elevated Shadow */
--shadow-lg: 0 6px 20px rgba(0, 0, 0, 0.5);

/* Gold Glow Shadows */
--shadow-gold-sm: 0 2px 8px rgba(255, 215, 0, 0.3);
--shadow-gold-md: 0 4px 15px rgba(255, 215, 0, 0.4);
--shadow-gold-lg: 0 6px 20px rgba(255, 215, 0, 0.6);
```

### Usage Patterns
```css
/* Buttons */
box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4);

/* Cards on Hover */
box-shadow: 0 0 20px rgba(255, 215, 0, 0.2);

/* Modals */
box-shadow: 0 10px 40px rgba(255, 215, 0, 0.3);

/* Focus States */
box-shadow: 0 0 25px rgba(255, 215, 0, 0.5);
```

---

## 📱 **8. Component Patterns**

### Card Component
```css
.card {
  background: #0f0f0f;
  border-left: 4px solid #FFD700;
  border-radius: 8px;
  padding: 12px;
  border: 1px solid #2a2a2a;
  transition: all 0.3s;
}

.card:hover {
  background: #252525;
  transform: translateX(4px);
  border-color: #FFD700;
}
```

### Input Section
```css
.input-section {
  background: rgba(255, 215, 0, 0.05);
  padding: 20px;
  border-radius: 12px;
  border: 2px solid rgba(255, 215, 0, 0.3);
  animation: pulseGlow 2s ease-in-out infinite;
  position: relative;
}

/* Floating Label */
.input-section::before {
  content: '✍️ Label text';
  position: absolute;
  top: -12px;
  left: 20px;
  background: #1a1a1a;
  padding: 4px 12px;
  font-size: 11px;
  color: #FFD700;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-radius: 4px;
  border: 1px solid rgba(255, 215, 0, 0.5);
}
```

### Modal Component
```css
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #1a1a1a;
  padding: 30px;
  border-radius: 12px;
  border: 2px solid #FFD700;
  box-shadow: 0 10px 40px rgba(255, 215, 0, 0.3);
  max-width: 400px;
  width: 90%;
}
```

### Scrollbar Styling
```css
::-webkit-scrollbar {
  width: 6-8px;
  height: 6-8px;
}

::-webkit-scrollbar-track {
  background: #2a2a2a;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: #FFD700;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: #FFC700;
}
```

---

## 🎨 **9. Icon & Emoji Usage**

### Icon Guidelines
- Use emojis for visual interest and quick recognition
- Common patterns:
  - ✍️ Writing/Input
  - 📋 Copy/Clipboard
  - ⚙️ Settings
  - 🔔 Notifications
  - 📊 Analytics/Stats
  - 🎭 Demo/Preview
  - ☁️ Cloud/Sync
  - 💡 Tips/Quotes

### Emoji Sizing
```css
/* Small Icons (inline) */
font-size: 16px;

/* Medium Icons (buttons) */
font-size: 18-20px;

/* Large Icons (empty states) */
font-size: 48-64px;
```

---

## 📋 **10. Layout Patterns**

### Header Pattern
```css
.header {
  background: #000000;
  color: white;
  padding: 20px;
  text-align: center;
  border-bottom: 2px solid #FFD700;
}
```

### Two-Column Layout
```css
.container {
  display: flex;
  height: 100vh;
}

.sidebar {
  width: 320px;
  background: #0f0f0f;
  border-right: 2px solid #FFD700;
}

.main-content {
  flex: 1;
  background: #0f0f0f;
}
```

### Section Dividers
```css
/* Top Border Divider */
border-top: 2px solid #2a2a2a;
padding-top: 20px;
margin-top: 20px;

/* Bottom Border Divider */
border-bottom: 2px solid #FFD700;
```

---

## ✅ **11. Accessibility Guidelines**

### Contrast Requirements
- Gold (#FFD700) on Black (#000000): ✅ WCAG AAA
- Light Gray (#e0e0e0) on Dark (#1a1a1a): ✅ WCAG AA
- Always test color combinations

### Focus States
```css
/* Always provide visible focus states */
*:focus {
  outline: 2px solid #FFD700;
  outline-offset: 2px;
}

/* Or custom focus styles */
*:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.5);
}
```

### Interactive Elements
- Minimum touch target: 44x44px
- Clear hover states
- Visible active states
- Keyboard navigation support

---

## 🚀 **12. Implementation Checklist**

### Starting a New Feature/App
- [ ] Include base CSS reset (`* { margin: 0; padding: 0; box-sizing: border-box; }`)
- [ ] Set monospace font stack
- [ ] Apply font smoothing
- [ ] Use dark background hierarchy
- [ ] Implement gold accent color
- [ ] Add standard transitions (0.3s)
- [ ] Style custom scrollbars
- [ ] Create hover states for interactive elements
- [ ] Add focus states for accessibility
- [ ] Test color contrast
- [ ] Implement responsive breakpoints if needed

### Component Checklist
- [ ] Uses design system colors
- [ ] Follows spacing system (multiples of 4px)
- [ ] Has proper border radius (6-12px)
- [ ] Includes hover state
- [ ] Includes active state
- [ ] Has smooth transitions
- [ ] Uses appropriate shadows
- [ ] Follows typography scale
- [ ] Accessible (keyboard + screen reader)

---

## 🎯 **13. Common Mistakes to Avoid**

### ❌ Don't Do This
```css
/* Pure white backgrounds */
background: #ffffff;

/* Inconsistent transitions */
transition: opacity 0.5s, transform 0.2s;

/* Random spacing */
padding: 13px 17px;

/* Inconsistent border radius */
border-radius: 5px; /* Use 6px or 8px */

/* Missing hover states */
button { /* no :hover defined */ }

/* Hard-coded colors */
color: #FFD800; /* Use #FFD700 */
```

### ✅ Do This Instead
```css
/* Dark backgrounds */
background: #1a1a1a;

/* Consistent transitions */
transition: all 0.3s;

/* System spacing */
padding: 12px 16px;

/* System border radius */
border-radius: 8px;

/* Always include hover states */
button:hover { transform: translateY(-2px); }

/* Use design system colors */
color: #FFD700;
```

---

## 📚 **14. Quick Reference**

### CSS Variables Template
```css
:root {
  /* Colors */
  --gold: #FFD700;
  --gold-hover: #FFC700;
  --bg-black: #000000;
  --bg-dark: #0f0f0f;
  --bg-medium: #1a1a1a;
  --bg-light: #2a2a2a;
  --text-primary: #e0e0e0;
  --text-secondary: #b0b0b0;
  
  /* Spacing */
  --space-sm: 8px;
  --space-md: 12px;
  --space-lg: 20px;
  
  /* Borders */
  --radius-md: 8px;
  --border-width: 2px;
  
  /* Transitions */
  --transition: all 0.3s ease;
}
```

### Copy-Paste Snippets

**Standard Button:**
```css
.btn {
  padding: 12px 20px;
  background: #FFD700;
  color: #000;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 215, 0, 0.6);
}
```

**Standard Input:**
```css
input, textarea {
  width: 100%;
  padding: 12px;
  background: #0f0f0f;
  color: #e0e0e0;
  border: 2px solid #2a2a2a;
  border-radius: 8px;
  font-family: inherit;
  transition: all 0.3s;
}

input:focus, textarea:focus {
  outline: none;
  border-color: #FFD700;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.2);
}
```

---

## 🔄 **15. Version Control**

**Current Version:** 1.0.0  
**Last Updated:** 2026-02-17  
**Maintained By:** StandupNOW Team

### Changelog
- **v1.0.0** (2026-02-17): Initial design system documentation

---

## 📞 **Support & Questions**

For questions about implementing this design system:
1. Review this playbook thoroughly
2. Check existing components in the codebase
3. Test your implementation against the checklist
4. Ensure accessibility compliance

**Remember:** Consistency is key. When in doubt, reference existing components that follow these patterns.