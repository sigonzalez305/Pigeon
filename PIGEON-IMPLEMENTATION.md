# PIGEON - Implementation Documentation

## Overview

PIGEON is a **slow-messaging, Tamagotchi-style companion app** built according to a strict specification emphasizing stability, deterministic behavior, and CSP compliance.

## Architecture

### Core Principles

1. **CSP-Safe by Default** - No eval, no dynamic code execution, no unsafe JavaScript
2. **State Is Sacred** - Deterministic behavior, no random elements
3. **UI Never Breaks Logic** - Rendering errors are isolated and don't cascade
4. **Debuggable in Production** - Built-in debug panel surfaces all errors and interactions
5. **Interaction Guarantees** - All clicks are captured and logged

### File Structure

```
pigeon-app.html          - Main HTML entry point
pigeon-app.js            - Main application controller
pigeon-app.css           - Tamagotchi-inspired visual design
pigeon-state.js          - State management with validation/repair
pigeon-debug.js          - Debug panel and error capture
pigeon-weather.js        - Weather system (live API + deterministic mock)
```

## Features

### 1. Pigeon Entity (Tamagotchi-style)

**Properties:**
- Name (customizable, max 20 chars)
- Color (customizable)
- Mood (happy, neutral, tired, sad) - **deterministic**
- Energy (0-100)
- XP and Level progression
- Last fed timestamp
- Last message sent timestamp

**Behavior Rules (Deterministic):**
- Energy < 20 → sad mood
- Energy < 50 → tired mood
- Recent activity (< 1 hour) → happy mood
- Activity within 24 hours → neutral mood
- No activity > 24 hours → tired mood

### 2. Messaging System

**Message Properties:**
- ID (auto-generated)
- From/To area codes
- Message body (max 500 chars)
- Created timestamp
- Scheduled delivery timestamp
- Delivered timestamp (nullable)
- Status (queued, in_flight, delivered)

**Rules:**
- Daily send limit (default: 3 messages/day)
- Energy cost per message: 15 points
- XP gained per message: 10 points
- Messages delayed based on distance and weather

### 3. Weather System

**Features:**
- Real weather API integration (if API key provided)
- Deterministic mock fallback (same area code = same weather)
- Weather affects message delivery time

**Weather Multipliers:**
- Clear: 1.0x
- Partly Cloudy: 1.1x
- Cloudy: 1.2x
- Light Rain: 1.3x
- Fog: 1.4x
- Rain: 1.5x
- Thunderstorm: 2.0x
- Snow: 2.5x

**Mock Weather:**
Uses area code modulo pattern count to ensure consistency:
```javascript
Area code 212 → Always returns same weather pattern
```

### 4. State Management

**Storage:**
- LocalStorage key: `pigeon_app_state`
- Automatic validation and repair on load
- Graceful degradation for corrupt data

**State Shape:**
```javascript
{
  version: 1,
  pigeon: { id, name, color, mood, energy, xp, level, ... },
  session: { dailyMessagesUsed, dailyLimit, editMode, ... },
  messages: [ {...}, {...}, ... ],
  weather: { isLive, condition, temperature, delayMultiplier, ... }
}
```

**Validation Rules:**
- Missing fields filled with defaults
- Numeric values clamped to valid ranges
- Enums validated against allowed values
- Arrays filtered for valid items only

### 5. Debug Panel

**Features:**
- Always visible (bottom-right corner)
- Captures all errors (window.onerror, unhandledrejection)
- Logs all button clicks (capture phase)
- CSP violation reporting
- Lifecycle event tracking
- State snapshots

**Log Levels:**
- INFO - General information
- CLICK - Button interactions
- ERROR - Errors and exceptions
- WARNING - Warnings
- LIFECYCLE - App lifecycle events

### 6. Safe Rendering

**Protection Mechanisms:**
- `safeNumber()` - Never crashes on null/undefined numbers
- `safeDate()` - Handles invalid timestamps gracefully
- `safeText()` - Safe string conversion with fallbacks
- Try-catch blocks isolate each render operation
- Message history renders items independently

**Example:**
```javascript
// Will never crash, even with null/undefined
safeNumber(null, 2) → "0.00"
safeDate(invalid) → "Never"
safeText(undefined, "fallback") → "fallback"
```

### 7. Event Handling

**Event Delegation:**
- Single click listener on document root
- Uses `data-action` attributes for routing
- Capture-phase logging proves clicks are received
- Try-catch around each action handler

**Example:**
```html
<button data-action="send-message">Send Message</button>
```

## UI Components

### Main Screen
- Pigeon display (Tamagotchi-style screen)
- Status bar (messages used, last delivery)
- Action buttons (tactile, large, clear)

### Panels (Expandable)
1. **Edit Pigeon** - Customize name and color
2. **Send Message** - Compose and send messages
3. **Message History** - View all sent messages
4. **Weather Report** - Check weather conditions

### Visual Design
- **Color Palette:**
  - Sky Blue: `#6BA3D0`
  - Earth Brown: `#8B7355`
  - Feather White: `#F5F5F0`
  - Grass Green: `#7FB069`
  - Sunset Orange: `#E07A5F`

- **Typography:** Courier New (monospace)
- **Borders:** Thick (4px) for Tamagotchi feel
- **Animations:** Subtle float animation on pigeon sprite

## API Integration

### Weather API (Optional)

**Setup:**
```javascript
window.PIGEON_WEATHER_API_KEY = 'your_api_key';
```

**Provider:** WeatherAPI.com

**Fallback:** Deterministic mock weather (no API key required)

## Testing

### Success Criteria

✅ Page loads with no console errors
✅ All buttons visibly log clicks and update UI
✅ One broken data item doesn't disable the app
✅ No CSP errors appear
✅ State persists across page reloads
✅ Rendering errors are isolated and don't cascade

### Manual Testing Checklist

1. **Initial Load**
   - [ ] App displays without errors
   - [ ] Debug panel appears
   - [ ] Pigeon shows default state

2. **Edit Pigeon**
   - [ ] Click "Edit Pigeon" opens panel
   - [ ] Can change name and color
   - [ ] Save updates display

3. **Send Message**
   - [ ] Click "Send Message" opens panel
   - [ ] Form validation works
   - [ ] Message sends and appears in history
   - [ ] Daily limit enforced

4. **Message History**
   - [ ] Click "Message History" shows messages
   - [ ] Empty state displays correctly
   - [ ] Corrupted message doesn't crash list

5. **Weather**
   - [ ] Click "Check Weather" fetches data
   - [ ] Shows live or mock indicator
   - [ ] Displays delay multiplier

6. **Reset Session**
   - [ ] Click "Reset Daily Session" clears counters
   - [ ] Preserves pigeon and history

7. **Debug Panel**
   - [ ] All clicks logged
   - [ ] Errors captured
   - [ ] Can clear logs

## Development

### Running Locally

```bash
npm install
npm start
```

Server starts on `http://localhost:3000`

### Files to Access

- Main App: `http://localhost:3000/pigeon-app.html`
- Debug Panel: Built-in (bottom-right corner)

### No Build Required

All files are vanilla JavaScript modules - no transpilation or bundling needed.

## Security

### Content Security Policy

```
default-src 'self';
style-src 'self' 'unsafe-inline';
script-src 'self';
connect-src 'self' https://api.weatherapi.com;
img-src 'self' data: https:;
```

**Compliant:**
- ✅ No eval()
- ✅ No new Function()
- ✅ No inline scripts
- ✅ No string-executed timers
- ✅ No dynamic code generation

## Troubleshooting

### Common Issues

**Issue:** Clicks not working
**Solution:** Check debug panel - all clicks should be logged. If not, check for overlay elements with pointer-events.

**Issue:** State not persisting
**Solution:** Check localStorage quota. Debug panel shows state save attempts.

**Issue:** Weather not loading
**Solution:** Check if API key is set. Falls back to deterministic mock automatically.

**Issue:** Rendering errors
**Solution:** Check debug panel for specific error. Each render is try-catch protected.

## Future Enhancements

Potential additions (not implemented):

- Real-time message delivery updates
- Pigeon accessories and customization
- Achievement system
- Friend system (send to other pigeons)
- Weather-based XP bonuses
- Pigeon evolution stages

## License

See project LICENSE file.

## Credits

Built according to specification by Claude Code.
