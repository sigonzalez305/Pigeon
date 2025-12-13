/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PIGEON - Tamagotchi + Messaging Application
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * This is the MAIN APPLICATION file that controls the entire Pigeon app.
 * It combines a virtual pet (like Tamagotchi) with a messaging system.
 *
 * WHAT THIS FILE DOES:
 * - Controls the user interface (UI) - what you see on screen
 * - Handles button clicks and user interactions
 * - Updates the pigeon's appearance based on its mood and energy
 * - Manages the message sending workflow (write → attach → send → delivery)
 * - Shows/hides modals (popup windows) for different actions
 *
 * IMPORTANT CONCEPTS:
 * - "State" = the current condition of everything (pigeon stats, messages, etc.)
 * - "DOM" = Document Object Model (the HTML elements on the page)
 * - "Element" = a piece of the webpage (button, text, image, etc.)
 * - "Render" = draw/display something on the screen
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

// Import our helper modules (separate files with specific functions)
// Think of these like importing tools from a toolbox
import * as State from './pigeon-state.js';     // Manages all data (pigeon stats, messages)
import * as Debug from './pigeon-debug.js';     // Helps us find bugs and see what's happening
import * as Weather from './pigeon-weather.js'; // Gets weather data for message delivery

// ═══════════════════════════════════════════════════════════════════════════
// GLOBAL VARIABLES (used throughout the entire application)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * DOM Elements Cache
 *
 * This object stores references to HTML elements so we don't have to
 * search for them every time we need them (searching is slow!)
 *
 * Think of it like bookmarks - instead of searching Google every time,
 * you bookmark the page and go directly to it.
 */
let elements = {};

/**
 * Current Scroll Draft
 *
 * When the user writes a message, we store it here temporarily.
 * It's like writing a letter and putting it on your desk before mailing it.
 *
 * Structure:
 * {
 *   fromAreaCode: "555",      // Where the message is from (3 digits)
 *   toAreaCode: "123",        // Where the message is going (3 digits)
 *   body: "Hello!",           // The actual message text
 *   weather: {...}            // Weather data for the route
 * }
 *
 * This is null when there's no message being drafted.
 */
let currentDraft = null;

/**
 * Current Weather Cache
 *
 * Stores the most recently fetched weather data.
 * We cache (save) it so we don't have to fetch it again if we need it soon.
 *
 * Think of it like checking the weather once in the morning and remembering
 * it, instead of checking your phone every 5 minutes.
 */
let currentWeather = null;

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS - Helper functions used throughout the app
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Safe Number Formatting
 *
 * WHY THIS EXISTS:
 * Sometimes we get bad data (null, undefined, weird text) when we expect a number.
 * If we try to display bad data, the whole app could crash!
 * This function safely converts any value to a number and formats it.
 *
 * PARAMETERS:
 * @param {any} value - The value we want to convert to a number
 *                      Could be: 42, "42", null, undefined, "hello", etc.
 * @param {number} decimals - How many decimal places to show (default: 0)
 *                           0 = whole number (42)
 *                           1 = one decimal (42.5)
 *                           2 = two decimals (42.50)
 *
 * RETURNS:
 * @returns {string} - A string representation of the number (e.g., "42" or "42.50")
 *                     Returns "0" if the value can't be converted to a number
 *
 * EXAMPLES:
 * safeNumber(42.7, 0)      → "43"      (rounds to whole number)
 * safeNumber(42.7, 1)      → "42.7"    (one decimal)
 * safeNumber("hello", 0)   → "0"       (can't convert, returns 0)
 * safeNumber(null, 0)      → "0"       (can't convert, returns 0)
 * safeNumber(undefined, 0) → "0"       (can't convert, returns 0)
 */
function safeNumber(value, decimals = 0) {
  try {
    // Try to convert the value to a number
    const num = Number(value);

    // Check if conversion failed (isNaN = "is Not a Number")
    // NaN is what you get when you try Number("hello")
    if (isNaN(num)) return '0';

    // toFixed() converts a number to a string with specified decimal places
    // Example: (42.567).toFixed(2) = "42.57"
    return num.toFixed(decimals);
  } catch (err) {
    // If ANYTHING goes wrong, log the error and return "0"
    // This prevents the entire app from crashing
    Debug.logError('Number formatting error', err);
    return '0';
  }
}

/**
 * Safe Date Formatting
 *
 * WHY THIS EXISTS:
 * Dates and times can be stored in many formats (timestamp, string, Date object).
 * This function safely converts any date format into a readable string.
 *
 * PARAMETERS:
 * @param {number|string|Date} timestamp - A date/time value
 *                                         Usually a timestamp (milliseconds since Jan 1, 1970)
 *                                         Example: 1699999999999
 *
 * RETURNS:
 * @returns {string} - A human-readable date string like "11/15/2023, 3:46:39 PM"
 *                     Returns "Never" if the timestamp is invalid or missing
 *
 * HOW IT WORKS:
 * 1. Check if timestamp exists (not null/undefined)
 * 2. Create a Date object from the timestamp
 * 3. Verify the Date is valid (invalid dates have NaN time)
 * 4. Convert to a readable local string using browser settings
 *
 * EXAMPLES:
 * safeDate(1699999999999) → "11/15/2023, 3:46:39 PM"  (real date)
 * safeDate(null)          → "Never"                   (no date)
 * safeDate(undefined)     → "Never"                   (no date)
 * safeDate("invalid")     → "Never"                   (bad date)
 */
function safeDate(timestamp) {
  try {
    // If timestamp doesn't exist (null, undefined, 0), return "Never"
    if (!timestamp) return 'Never';

    // Create a Date object from the timestamp
    // Timestamps are numbers representing milliseconds since 1970
    const date = new Date(timestamp);

    // Check if the date is valid
    // Invalid dates have getTime() = NaN (Not a Number)
    if (isNaN(date.getTime())) return 'Never';

    // Convert to a readable string based on user's locale (language/region)
    // toLocaleString() uses browser settings to format the date
    return date.toLocaleString();
  } catch (err) {
    // If anything goes wrong, log it and return "Never"
    Debug.logError('Date formatting error', err);
    return 'Never';
  }
}

/**
 * Safe Text Rendering
 *
 * WHY THIS EXISTS:
 * Sometimes we need to display text that might be null, undefined, or missing.
 * Instead of showing "undefined" or "null" on the screen (looks broken!),
 * we show a fallback value.
 *
 * PARAMETERS:
 * @param {any} value - The value we want to display as text
 * @param {string} fallback - What to show if value is missing (default: empty string '')
 *
 * RETURNS:
 * @returns {string} - The value as a string, or the fallback if value is empty
 *
 * HOW IT WORKS:
 * - Uses the OR operator (||) to pick the first "truthy" value
 * - "Falsy" values in JavaScript: null, undefined, '', 0, false, NaN
 * - If value is falsy, it uses the fallback instead
 * - Converts everything to a String to ensure text output
 *
 * EXAMPLES:
 * safeText("Hello", "default")     → "Hello"   (value exists)
 * safeText("", "default")          → "default" (empty string is falsy)
 * safeText(null, "default")        → "default" (null is falsy)
 * safeText(undefined, "default")   → "default" (undefined is falsy)
 * safeText(0, "default")           → "default" (0 is falsy)
 * safeText("0", "default")         → "0"       (string "0" is truthy!)
 */
function safeText(value, fallback = '') {
  try {
    // Convert to string, using fallback if value is falsy
    // String() safely converts any value to a string representation
    return String(value || fallback);
  } catch (err) {
    // If conversion fails somehow, log error and return fallback
    Debug.logError('Text rendering error', err);
    return fallback;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// PIGEON STATE LOGIC - Determines how the pigeon looks and acts
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get Pigeon State Based on Stats
 *
 * WHY THIS EXISTS:
 * The pigeon's visual appearance (animation, sprite) changes based on its stats.
 * This function decides what "state" the pigeon should be in based on its energy and mood.
 * The state determines which animation plays and how the pigeon sprite looks.
 *
 * PARAMETERS:
 * @param {Object} pigeon - The pigeon object containing stats
 *        pigeon.energy - Energy level (0-100)
 *        pigeon.mood - Current mood ('happy', 'neutral', 'tired', 'sad')
 *
 * RETURNS:
 * @returns {string} - The pigeon's visual state: 'tired', 'happy', or 'idle'
 *
 * DECISION FLOW (checked in order):
 * 1. If energy is very low (< 30) → 'tired' (pigeon looks exhausted)
 * 2. Else if mood is happy → 'happy' (pigeon looks energetic)
 * 3. Otherwise → 'idle' (default resting state)
 *
 * IMPORTANT:
 * The order matters! We check energy FIRST because a tired pigeon can't be happy.
 * Think of it like: you might feel happy, but if you're exhausted, you look tired!
 */
function getPigeonState(pigeon) {
  // Check energy first - tired trumps everything
  // Energy < 30 means pigeon is too tired to show other emotions
  if (pigeon.energy < 30) return 'tired';

  // If not tired, check if mood is happy
  // Happy pigeons have a cheerful animation
  if (pigeon.mood === 'happy') return 'happy';

  // Default state when energy is OK and not particularly happy
  // This is the calm, neutral resting state
  return 'idle';
}

/**
 * Get Status Message Based on Pigeon State
 *
 * WHY THIS EXISTS:
 * We want to show the user helpful text describing what the pigeon is doing.
 * This function generates human-readable messages based on the pigeon's current state.
 *
 * PARAMETERS:
 * @param {Object} pigeon - The pigeon object with stats
 * @param {boolean} hasScroll - Whether the pigeon is currently carrying a message
 *
 * RETURNS:
 * @returns {string} - A friendly message describing the pigeon's current status
 *
 * MESSAGE PRIORITY (checked in order):
 * 1. Carrying message → takes priority over everything
 * 2. Exhausted (< 20) → urgent warning
 * 3. Tired (< 50) → gentle reminder
 * 4. Happy → positive feedback
 * 5. Default → neutral resting message
 *
 * WHY THIS ORDER:
 * - Message carrying is most important (active task)
 * - Energy warnings help prevent the pigeon from being unable to work
 * - Happy messages provide positive reinforcement
 * - Default message is shown when everything is normal
 */
function getStatusMessage(pigeon, hasScroll) {
  // Priority 1: If carrying a message, that's the most important status
  if (hasScroll) {
    return 'Your pigeon is carrying a message';
  }

  // Priority 2: Very low energy - urgent warning
  // < 20 energy means pigeon can't send messages (see handleWrite function)
  if (pigeon.energy < 20) {
    return 'Your pigeon is exhausted and needs rest';
  }

  // Priority 3: Low energy - gentle reminder to rest soon
  // < 50 energy means pigeon is getting tired
  if (pigeon.energy < 50) {
    return 'Your pigeon looks tired';
  }

  // Priority 4: Happy mood - positive feedback
  // Rewards the player for keeping the pigeon happy
  if (pigeon.mood === 'happy') {
    return 'Your pigeon is happy and energetic!';
  }

  // Default: Everything is normal, pigeon is just resting
  return 'Your pigeon is resting peacefully';
}

// ═══════════════════════════════════════════════════════════════════════════
// UI RENDERING FUNCTIONS - Update what the user sees on screen
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Update Pigeon Sprite State
 *
 * WHY THIS EXISTS:
 * The pigeon's visual appearance needs to match its current state (happy, tired, idle).
 * We do this by changing the 'data-state' attribute on the sprite element.
 * CSS animations and styling are tied to this attribute.
 *
 * HOW IT WORKS:
 * 1. Get the current pigeon stats from state
 * 2. Calculate what state the pigeon should be in
 * 3. Update the sprite's HTML attribute
 * 4. CSS automatically changes the animation based on the new attribute
 *
 * HTML ATTRIBUTE EXAMPLE:
 * <div id="pigeonSprite" data-state="happy"></div>
 * <div id="pigeonSprite" data-state="tired"></div>
 * <div id="pigeonSprite" data-state="idle"></div>
 *
 * CSS REACTS TO THIS:
 * [data-state="happy"] { animation: bounce 0.5s; }
 * [data-state="tired"] { animation: droop 1s; }
 * [data-state="idle"]  { animation: breathe 2s; }
 *
 * SAFETY FEATURES:
 * - Uses try-catch to prevent crashes
 * - Checks if sprite element exists before updating
 * - Uses optional chaining (?.) to safely access nested properties
 */
function updatePigeonSprite() {
  try {
    // Get the current state from our state management system
    const state = State.getState();

    // Safely extract pigeon data using optional chaining (?.)
    // If state is null/undefined, this safely returns {}
    // The || {} ensures we always have an object, even if state.pigeon doesn't exist
    const pigeon = state?.pigeon || {};

    // Get the sprite element from our cached elements
    const sprite = elements.pigeonSprite;

    // Safety check: if sprite doesn't exist in the DOM, exit early
    // This prevents errors if the HTML is malformed or hasn't loaded yet
    if (!sprite) return;

    // Calculate what visual state the pigeon should be in
    // Returns: 'happy', 'tired', or 'idle'
    const pigeonState = getPigeonState(pigeon);

    // Update the HTML attribute on the sprite element
    // setAttribute(name, value) adds or changes an HTML attribute
    // This triggers CSS rules that change the pigeon's appearance
    sprite.setAttribute('data-state', pigeonState);

    // Log this change for debugging purposes
    // Helps us track when and why the pigeon's appearance changes
    Debug.logInfo(`Pigeon state: ${pigeonState}`);
  } catch (err) {
    // If ANYTHING goes wrong, log the error but don't crash the app
    // The pigeon might not update visually, but the app keeps running
    Debug.logError('Failed to update pigeon sprite', err);
  }
}

/**
 * Render Status Icons
 *
 * WHY THIS EXISTS:
 * The status bar at the top shows the pigeon's key stats (energy, mood, level).
 * This function updates those icons whenever the stats change.
 *
 * VISUAL LAYOUT:
 * ┌─────────────────────────────────────┐
 * │  ⚡ 85   😊 happy   ⭐ 3            │  ← Status bar with icons
 * └─────────────────────────────────────┘
 *
 * HOW IT WORKS:
 * 1. Get current pigeon stats from state
 * 2. Update each icon element's text content
 * 3. Use safe formatters to prevent display of "undefined" or "null"
 *
 * ELEMENTS UPDATED:
 * - iconEnergy: Shows energy level (0-100)
 * - iconMood: Shows mood text ('happy', 'neutral', 'tired', 'sad')
 * - iconLevel: Shows pigeon's level (1, 2, 3, etc.)
 *
 * WHY SAFETY CHECKS:
 * - Elements might not exist if HTML structure changes
 * - Stats might be missing if state is corrupted
 * - Safe formatters prevent ugly "undefined" text on screen
 */
function renderStatusIcons() {
  try {
    // Get current application state
    const state = State.getState();

    // Safely extract pigeon data (default to empty object if missing)
    const pigeon = state?.pigeon || {};

    // Update energy icon (if it exists in the DOM)
    // Shows a whole number (0 decimals) representing energy 0-100
    if (elements.iconEnergy) {
      elements.iconEnergy.textContent = safeNumber(pigeon.energy, 0);
    }

    // Update mood icon (if it exists)
    // Shows text like "happy", "neutral", "tired", or "sad"
    // Defaults to "neutral" if mood is missing
    if (elements.iconMood) {
      elements.iconMood.textContent = safeText(pigeon.mood, 'neutral');
    }

    // Update level icon (if it exists)
    // Shows the pigeon's level as a whole number
    // Level increases as the pigeon gains XP (experience points)
    if (elements.iconLevel) {
      elements.iconLevel.textContent = safeNumber(pigeon.level, 0);
    }

    // Log successful render for debugging
    Debug.logInfo('Status icons rendered');
  } catch (err) {
    // If anything fails, log it but don't crash the app
    Debug.logError('Failed to render status icons', err);
  }
}

/**
 * Render Pigeon Name
 *
 * WHY THIS EXISTS:
 * The user can customize their pigeon's name and color.
 * This function updates the display to show the custom name and color.
 *
 * WHAT IT UPDATES:
 * 1. The pigeon's name text
 * 2. The pigeon sprite's color (CSS color property)
 *
 * HOW CUSTOMIZATION WORKS:
 * - User clicks "Edit Pigeon" button
 * - Changes name from "Courier" to "Speedy"
 * - Changes color from brown (#8B7355) to blue (#4A90E2)
 * - This function updates the display to reflect those changes
 *
 * WHY querySelector:
 * - We use document.querySelector for the avatar because we need to find
 *   it fresh each time (might not be cached in elements object)
 * - querySelector searches the DOM for an element matching the CSS selector
 */
function renderPigeonName() {
  try {
    // Get current state and pigeon data
    const state = State.getState();
    const pigeon = state?.pigeon || {};

    // Update the name display element
    // Default to "Courier" if no custom name is set
    if (elements.pigeonName) {
      elements.pigeonName.textContent = safeText(pigeon.name, 'Courier');
    }

    // Update pigeon sprite color
    // This changes the CSS color property of the sprite element
    // querySelector finds the element by its CSS class
    const avatar = document.querySelector('.pigeon-sprite');

    // Only update if both avatar exists AND pigeon has a color set
    if (avatar && pigeon.color) {
      // Directly modify CSS style
      // avatar.style.color sets the CSS 'color' property
      // Color should be a hex code like "#8B7355" or color name like "blue"
      avatar.style.color = pigeon.color;
    }

    // Log for debugging
    Debug.logInfo('Pigeon name rendered');
  } catch (err) {
    // Catch and log errors without crashing
    Debug.logError('Failed to render pigeon name', err);
  }
}

/**
 * Render Status Message
 *
 * WHY THIS EXISTS:
 * Shows a helpful text message describing what the pigeon is currently doing.
 * This gives the user feedback about the pigeon's state.
 *
 * EXAMPLE MESSAGES:
 * - "Your pigeon is carrying a message"
 * - "Your pigeon is exhausted and needs rest"
 * - "Your pigeon looks tired"
 * - "Your pigeon is happy and energetic!"
 * - "Your pigeon is resting peacefully"
 *
 * HOW IT CHECKS FOR SCROLL:
 * - Checks if the messageScroll element has the "hidden" class
 * - If it's NOT hidden, that means the pigeon IS carrying a scroll
 * - classList.contains('hidden') returns true if class is present
 * - The ! (NOT operator) flips it: hasScroll = NOT hidden
 *
 * CSS CLASSES:
 * - .hidden is a CSS class that typically has: display: none;
 * - When we want to show something: element.classList.remove('hidden')
 * - When we want to hide something: element.classList.add('hidden')
 */
function renderStatusMessage() {
  try {
    // Get current state
    const state = State.getState();
    const pigeon = state?.pigeon || {};

    // Check if pigeon is currently carrying a scroll
    // Uses optional chaining (?.) to safely check classList
    // If messageScroll doesn't exist, this safely returns undefined
    // Then the !undefined becomes true (but we handle that in getStatusMessage)
    const hasScroll = !elements.messageScroll?.classList.contains('hidden');

    // Update the status message text
    if (elements.statusMessage) {
      // getStatusMessage() generates the appropriate message
      // based on pigeon stats and whether it's carrying a scroll
      elements.statusMessage.textContent = getStatusMessage(pigeon, hasScroll);
    }

    // Log for debugging
    Debug.logInfo('Status message rendered');
  } catch (err) {
    // Catch and log errors
    Debug.logError('Failed to render status message', err);
  }
}

/**
 * Update Action Button States (Enable/Disable Buttons)
 *
 * WHY THIS EXISTS:
 * Not all actions should be available at all times. For example:
 * - Can't send a message if there's no scroll attached
 * - Can't write a message if the pigeon is too tired
 * - Can't write if already carrying a scroll
 *
 * This function enables/disables buttons based on current game state.
 *
 * BUTTON RULES:
 * ┌──────────┬────────────────────────────────────────────┐
 * │ Button   │ Disabled When...                           │
 * ├──────────┼────────────────────────────────────────────┤
 * │ SEND     │ No scroll attached                         │
 * │ WRITE    │ Energy < 20 OR already has scroll          │
 * │ FEED     │ Always enabled                             │
 * │ REST     │ Always enabled                             │
 * └──────────┴────────────────────────────────────────────┘
 *
 * DISABLED ATTRIBUTE:
 * - button.disabled = true  → Button is grayed out and can't be clicked
 * - button.disabled = false → Button is normal and clickable
 *
 * WHY THESE RULES:
 * - SEND needs a scroll: Can't send nothing!
 * - WRITE needs energy: Tired pigeons can't carry messages
 * - WRITE needs no scroll: Can only carry one scroll at a time
 * - FEED/REST always work: Player can always care for their pigeon
 */
function updateActionButtons() {
  try {
    // Get current state
    const state = State.getState();
    const pigeon = state?.pigeon || {};

    // Check if we have a scroll ready to send
    // currentDraft is the global variable holding the drafted message
    // null = no scroll, object = has scroll
    const hasScroll = currentDraft !== null;

    // Update SEND button
    // Disabled when: no scroll attached
    // !hasScroll means "NOT has scroll" → disabled when no scroll
    if (elements.btnSend) {
      elements.btnSend.disabled = !hasScroll;
    }

    // Update WRITE button
    // Disabled when: pigeon too tired OR already carrying a scroll
    // energy < 20: not enough energy to carry a message
    // hasScroll: can't write two messages at once
    if (elements.btnWrite) {
      elements.btnWrite.disabled = pigeon.energy < 20 || hasScroll;
    }

    // FEED button - always enabled
    // Player can always feed their pigeon to restore energy

    // REST button - always enabled
    // Player can always let their pigeon rest to restore energy

    // Log for debugging
    Debug.logInfo('Action buttons updated');
  } catch (err) {
    // Catch and log any errors
    Debug.logError('Failed to update action buttons', err);
  }
}

/**
 * Render All UI Components
 *
 * WHY THIS EXISTS:
 * Instead of calling 5 different render functions one by one,
 * we have this convenience function that updates EVERYTHING.
 *
 * WHEN TO USE:
 * - After any state change (pigeon stats change, scroll attached, etc.)
 * - On initial app load
 * - After feeding, resting, sending messages
 * - After editing pigeon customization
 *
 * WHAT IT UPDATES:
 * 1. Status icons (energy, mood, level)
 * 2. Pigeon name and color
 * 3. Status message text
 * 4. Pigeon sprite animation
 * 5. Button enabled/disabled states
 *
 * ORDER MATTERS:
 * - We update data displays first (icons, name, message)
 * - Then update visual elements (sprite)
 * - Finally update interaction elements (buttons)
 * - This ensures everything is consistent when the user sees it
 *
 * THINK OF IT LIKE:
 * Refreshing a webpage - everything gets updated to match current state
 */
function renderAll() {
  // Update the status bar icons (energy, mood, level)
  renderStatusIcons();

  // Update the pigeon's name and color display
  renderPigeonName();

  // Update the status message text
  renderStatusMessage();

  // Update the pigeon's visual appearance/animation
  updatePigeonSprite();

  // Update which buttons are enabled/disabled
  updateActionButtons();
}

// ═══════════════════════════════════════════════════════════════════════════
// MODAL FUNCTIONS - Show/Hide popup windows
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Show Modal (Popup Window)
 *
 * WHY THIS EXISTS:
 * Modals are popup windows that appear over the main screen.
 * Examples: write message form, history list, edit pigeon form.
 * This function makes a modal visible.
 *
 * PARAMETERS:
 * @param {string} modalId - The ID of the modal element in the elements cache
 *                           Examples: 'ritualOverlay', 'modalHistory', 'modalEdit'
 *
 * HOW IT WORKS:
 * 1. Get the modal element from our cached elements
 * 2. Remove the 'hidden' CSS class
 * 3. CSS automatically shows the modal (hidden class has display: none)
 *
 * CSS PATTERN:
 * .hidden { display: none; }       ← Modal is invisible
 * (no hidden class) { display: block; }  ← Modal is visible
 *
 * VISUAL EFFECT:
 * Before: [Main Screen]
 * After:  [Main Screen] + [Modal Overlay]
 */
function showModal(modalId) {
  try {
    // Get the modal element from our cached elements object
    // modalId is the key, like 'ritualOverlay' or 'modalHistory'
    const modal = elements[modalId];

    // Only proceed if the modal exists
    if (modal) {
      // Remove the 'hidden' CSS class to make modal visible
      // classList.remove() removes a class from the element
      modal.classList.remove('hidden');

      // Log for debugging
      Debug.logInfo(`Showing modal: ${modalId}`);
    }
  } catch (err) {
    // Log error but don't crash if modal can't be shown
    Debug.logError(`Failed to show modal: ${modalId}`, err);
  }
}

/**
 * Hide Modal (Close Popup Window)
 *
 * WHY THIS EXISTS:
 * After the user completes an action in a modal or clicks "Cancel",
 * we need to close/hide the modal and return to the main screen.
 *
 * PARAMETERS:
 * @param {string} modalId - The ID of the modal to hide
 *
 * HOW IT WORKS:
 * 1. Get the modal element
 * 2. Add the 'hidden' CSS class
 * 3. CSS automatically hides the modal
 *
 * WHEN CALLED:
 * - User clicks "Cancel" button
 * - User clicks "X" close button
 * - User completes an action (after saving)
 *
 * VISUAL EFFECT:
 * Before: [Main Screen] + [Modal Overlay]
 * After:  [Main Screen]
 */
function hideModal(modalId) {
  try {
    // Get the modal element
    const modal = elements[modalId];

    // Only proceed if modal exists
    if (modal) {
      // Add the 'hidden' CSS class to make modal invisible
      // classList.add() adds a class to the element
      modal.classList.add('hidden');

      // Log for debugging
      Debug.logInfo(`Hiding modal: ${modalId}`);
    }
  } catch (err) {
    // Log error but don't crash
    Debug.logError(`Failed to hide modal: ${modalId}`, err);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// ACTION HANDLERS - Functions that run when user clicks action buttons
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Handle Feed Action
 *
 * WHAT HAPPENS:
 * User clicks the "FEED" button to give their pigeon food.
 * This restores energy and improves mood, plus plays a happy animation.
 *
 * GAME MECHANICS:
 * - Restores 20 energy points
 * - Energy is capped at 100 (can't go higher)
 * - Refreshes mood (might become happy if energy was low)
 * - Plays brief "happy" animation (1 second)
 *
 * WHY FEEDING MATTERS:
 * - Pigeons need energy to carry messages
 * - Low energy = can't send messages (< 20 energy)
 * - Happy pigeon = better user experience
 *
 * ANIMATION FLOW:
 * 1. Set sprite to 'happy' state immediately
 * 2. Wait 1000ms (1 second)
 * 3. Return sprite to normal state based on current stats
 *
 * setTimeout EXPLAINED:
 * setTimeout(function, milliseconds) runs a function after a delay
 * - setTimeout(() => {...}, 1000) runs code after 1000ms = 1 second
 * - The () => {...} is an "arrow function" (short function syntax)
 */
function handleFeed() {
  try {
    // Get current state and pigeon
    const state = State.getState();
    const pigeon = state.pigeon;

    // Calculate new energy level
    // Math.min(100, X) ensures value never exceeds 100
    // Example: energy=90, +20 = 110, but Math.min(100,110) = 100
    const newEnergy = Math.min(100, pigeon.energy + 20);

    // Save the new energy to state
    // This updates the stored data and triggers a save to localStorage
    State.updatePigeon({ energy: newEnergy });

    // Refresh mood based on new energy level
    // Low energy → tired/sad, High energy → happy/neutral
    State.refreshMood();

    // Play happy animation for 1 second
    // Optional chaining (?.) safely handles if pigeonSprite doesn't exist
    elements.pigeonSprite?.setAttribute('data-state', 'happy');

    // After 1 second, return to normal state
    setTimeout(() => {
      // This runs after 1000 milliseconds (1 second)
      // Updates sprite to match current stats (might still be happy!)
      updatePigeonSprite();
    }, 1000);

    // Update all UI components to reflect changes
    renderAll();

    // Log the action for debugging
    Debug.logInfo('Fed pigeon', { newEnergy });
  } catch (err) {
    // Catch and log any errors
    Debug.logError('Failed to feed pigeon', err);
  }
}

/**
 * Handle Rest Action
 *
 * WHAT HAPPENS:
 * User clicks the "REST" button to let their pigeon rest.
 * This restores a small amount of energy.
 *
 * GAME MECHANICS:
 * - Restores 10 energy points (half as much as feeding)
 * - Energy is capped at 100
 * - Refreshes mood
 * - No special animation (feeding is more rewarding!)
 *
 * DESIGN CHOICE:
 * - Resting gives less energy than feeding
 * - This makes feeding feel more valuable/special
 * - But resting is always available (can't run out of rest!)
 *
 * Math.min EXPLAINED:
 * Math.min(a, b) returns the smaller of two numbers
 * - Math.min(100, 90) = 90   (90 is smaller)
 * - Math.min(100, 110) = 100 (100 is smaller)
 * - This prevents energy from exceeding 100
 */
function handleRest() {
  try {
    // Get current state
    const state = State.getState();

    // Calculate new energy (restore 10, cap at 100)
    const newEnergy = Math.min(100, state.pigeon.energy + 10);

    // Update energy in state
    State.updatePigeon({ energy: newEnergy });

    // Refresh mood based on new energy
    State.refreshMood();

    // Update UI to show changes
    renderAll();

    // Log for debugging
    Debug.logInfo('Pigeon rested', { newEnergy });
  } catch (err) {
    // Catch and log errors
    Debug.logError('Failed to rest pigeon', err);
  }
}

/**
 * Handle Write Action (Open Message Compose Modal)
 *
 * WHAT HAPPENS:
 * User clicks the "WRITE" button to start writing a message.
 * This opens a modal (popup) where they can compose their message.
 *
 * VALIDATION CHECKS (in order):
 * 1. Energy check - Pigeon needs at least 20 energy
 * 2. Existing scroll check - Can't write if already carrying a message
 * 3. Daily limit check - Prevents spam (default 3 messages per day)
 *
 * WHY THESE CHECKS:
 * - Energy: Tired pigeons can't carry messages (game mechanic)
 * - One scroll: Can only carry one message at a time (realism)
 * - Daily limit: Prevents abuse of the demo system
 *
 * FORM FIELDS:
 * - From Area Code: 3-digit number (where message is FROM)
 * - To Area Code: 3-digit number (where message is going TO)
 * - Message Body: The actual message text
 * - Character Count: Shows how many characters typed (live counter)
 *
 * "return" KEYWORD:
 * When we call "return" inside a function, it stops executing immediately.
 * This is called "early return" - we exit early if validation fails.
 *
 * FLOW:
 * Check 1 fails → alert → return (stop)
 * Check 2 fails → alert → return (stop)
 * Check 3 fails → alert → return (stop)
 * All pass → clear form → show modal → continue
 */
function handleWrite() {
  try {
    // Get current application state
    const state = State.getState();

    // ─────────────────────────────────────────────────────────────
    // VALIDATION CHECK #1: Energy Level
    // ─────────────────────────────────────────────────────────────
    // Pigeon must have at least 20 energy to carry a message
    // This prevents the pigeon from being too exhausted
    if (state.pigeon.energy < 20) {
      // Show alert popup to user (browser built-in popup)
      alert('Your pigeon is too tired to carry a message. Let them rest first!');
      // Exit function early - don't continue to show the write modal
      return;
    }

    // ─────────────────────────────────────────────────────────────
    // VALIDATION CHECK #2: Already Carrying Message
    // ─────────────────────────────────────────────────────────────
    // Can only carry one scroll at a time
    // currentDraft = null means no scroll, otherwise it's an object
    if (currentDraft !== null) {
      alert('Your pigeon is already carrying a message!');
      return; // Exit early
    }

    // ─────────────────────────────────────────────────────────────
    // VALIDATION CHECK #3: Daily Message Limit
    // ─────────────────────────────────────────────────────────────
    // Prevent users from sending unlimited messages (demo limitation)
    // Default limit is 3 messages per day
    if (state.session.dailyMessagesUsed >= state.session.dailyLimit) {
      alert('Daily message limit reached! Reset your session to send more.');
      return; // Exit early
    }

    // ─────────────────────────────────────────────────────────────
    // CLEAR FORM FIELDS
    // ─────────────────────────────────────────────────────────────
    // Make sure form starts empty (in case user previously entered data)
    // We check if elements exist before clearing them (safety)

    // Clear "From Area Code" input field
    if (elements.inputFromArea) elements.inputFromArea.value = '';

    // Clear "To Area Code" input field
    if (elements.inputToArea) elements.inputToArea.value = '';

    // Clear message text area
    if (elements.inputMessage) elements.inputMessage.value = '';

    // Reset character counter to 0
    if (elements.charCount) elements.charCount.textContent = '0';

    // ─────────────────────────────────────────────────────────────
    // SHOW THE WRITE MODAL
    // ─────────────────────────────────────────────────────────────
    // 'ritualOverlay' is the ID of the write message modal
    // This modal contains the form for composing a message
    showModal('ritualOverlay');

    // Log for debugging
    Debug.logInfo('Write ritual opened');
  } catch (err) {
    // Catch and log any errors
    Debug.logError('Failed to handle write', err);
  }
}

/**
 * Handle Attach Scroll (Save Message and Attach to Pigeon)
 *
 * WHAT HAPPENS:
 * User fills out the message form and clicks "Attach to Pigeon".
 * This validates the input, fetches weather data, creates a draft scroll,
 * and visually attaches it to the pigeon sprite.
 *
 * ASYNC/AWAIT EXPLAINED:
 * - "async" before function means it can use "await"
 * - "await" pauses execution until something finishes (like fetching weather)
 * - This is needed because fetching weather takes time (network request)
 * - Without await, the code would continue before weather data arrives!
 *
 * VALIDATION (Progressive checks):
 * 1. All fields filled? (fromArea, toArea, message body)
 * 2. Area codes exactly 3 characters?
 * 3. Area codes only numbers? (using regex)
 *
 * REGEX EXPLAINED:
 * /^\d{3}$/ is a "regular expression" that checks if text matches a pattern
 * Breaking it down:
 * - ^ = start of string
 * - \d = any digit (0-9)
 * - {3} = exactly 3 of them
 * - $ = end of string
 * - Together: "exactly 3 digits, nothing else"
 * .test(string) returns true if the string matches the pattern
 *
 * Example:
 * /^\d{3}$/.test("123")  → true  ✓ (exactly 3 digits)
 * /^\d{3}$/.test("12")   → false ✗ (only 2 digits)
 * /^\d{3}$/.test("1234") → false ✗ (4 digits)
 * /^\d{3}$/.test("abc")  → false ✗ (not digits)
 * /^\d{3}$/.test("12a")  → false ✗ (contains letter)
 *
 * TERNARY OPERATOR:
 * condition ? valueIfTrue : valueIfFalse
 * It's a short if-else:
 * messageBody.length > 30 ? "truncate" : "use full text"
 */
async function handleAttachScroll() {
  try {
    // ─────────────────────────────────────────────────────────────
    // GET FORM VALUES
    // ─────────────────────────────────────────────────────────────
    // Extract values from form input fields
    // Optional chaining (?.) safely gets value even if element doesn't exist

    const fromArea = elements.inputFromArea?.value;    // "From" area code
    const toArea = elements.inputToArea?.value;        // "To" area code
    const messageBody = elements.inputMessage?.value;  // Message text

    // ─────────────────────────────────────────────────────────────
    // VALIDATION CHECK #1: All Fields Filled
    // ─────────────────────────────────────────────────────────────
    // Using OR (||) operator: if ANY field is empty, this triggers
    // Empty string (''), null, and undefined are all "falsy"
    if (!fromArea || !toArea || !messageBody) {
      alert('Please fill in all fields');
      return; // Exit early
    }

    // ─────────────────────────────────────────────────────────────
    // VALIDATION CHECK #2: Area Code Length
    // ─────────────────────────────────────────────────────────────
    // Area codes must be exactly 3 characters (e.g., "555", "212")
    // .length gets the number of characters in a string
    if (fromArea.length !== 3 || toArea.length !== 3) {
      alert('Area codes must be exactly 3 digits');
      return; // Exit early
    }

    // ─────────────────────────────────────────────────────────────
    // VALIDATION CHECK #3: Area Codes Are Numbers Only
    // ─────────────────────────────────────────────────────────────
    // Use regex to check if area codes contain ONLY 3 digits
    // ! before .test() means "NOT" - so this triggers if it DOESN'T match
    if (!/^\d{3}$/.test(fromArea) || !/^\d{3}$/.test(toArea)) {
      alert('Area codes must contain only numbers');
      return; // Exit early
    }

    // Log validation success
    Debug.logInfo('Attaching scroll', { fromArea, toArea });

    // ─────────────────────────────────────────────────────────────
    // FETCH WEATHER DATA
    // ─────────────────────────────────────────────────────────────
    // This is ASYNC - it might take time (network request)
    // "await" pauses here until weather data arrives
    // Weather affects delivery time (storms cause delays!)
    currentWeather = await Weather.getRouteWeather(fromArea, toArea);

    // ─────────────────────────────────────────────────────────────
    // CREATE DRAFT SCROLL OBJECT
    // ─────────────────────────────────────────────────────────────
    // Store all message data in the global currentDraft variable
    // This is what gets sent when user clicks SEND button
    currentDraft = {
      fromAreaCode: fromArea,      // Where message is from
      toAreaCode: toArea,           // Where message is going
      body: messageBody,             // The message text
      weather: currentWeather,       // Weather data for route
    };

    // ─────────────────────────────────────────────────────────────
    // SHOW SCROLL ATTACHED TO PIGEON
    // ─────────────────────────────────────────────────────────────
    // Make the scroll sprite visible on the pigeon
    if (elements.messageScroll) {
      // Remove 'hidden' class to make scroll visible
      elements.messageScroll.classList.remove('hidden');
    }

    // ─────────────────────────────────────────────────────────────
    // SHOW MESSAGE PREVIEW ON SCROLL
    // ─────────────────────────────────────────────────────────────
    // Display first 30 characters of message on the scroll sprite
    if (elements.scrollText) {
      // Ternary operator: if message > 30 chars, truncate and add "..."
      // substring(0, 30) gets first 30 characters
      const preview = messageBody.length > 30
        ? messageBody.substring(0, 30) + '...'   // Long message: truncate
        : messageBody;                            // Short message: use all

      // Display the preview text on the scroll
      elements.scrollText.textContent = preview;
    }

    // ─────────────────────────────────────────────────────────────
    // CLOSE THE WRITE MODAL
    // ─────────────────────────────────────────────────────────────
    // User is done composing, return to main screen
    hideModal('ritualOverlay');

    // ─────────────────────────────────────────────────────────────
    // UPDATE UI
    // ─────────────────────────────────────────────────────────────
    // Refresh all UI elements to show the attached scroll
    // This will also update button states (SEND becomes enabled)
    renderAll();

    // Log success
    Debug.logInfo('Scroll attached', currentDraft);
  } catch (err) {
    // ─────────────────────────────────────────────────────────────
    // ERROR HANDLING
    // ─────────────────────────────────────────────────────────────
    // If anything goes wrong (network error, bad data, etc.):
    // 1. Log the error for debugging
    // 2. Show user-friendly alert
    // 3. Don't crash the app
    Debug.logError('Failed to attach scroll', err);
    alert('Failed to attach scroll. Check debug panel for details.');
  }
}

/**
 * Handle Send Action (Pigeon Flight Animation Sequence)
 *
 * WHAT HAPPENS:
 * User clicks "SEND" to send their message. The pigeon flies away, delivers the
 * message, and returns. This function orchestrates a complex animation sequence
 * using multiple setTimeout delays.
 *
 * ANIMATION TIMELINE (example with 5-minute delivery):
 * ┌────────────────────────────────────────────────────────────────────┐
 * │ Time     │ Event                                                   │
 * ├──────────┼─────────────────────────────────────────────────────────┤
 * │ 0ms      │ Pigeon starts flying animation                          │
 * │ 500ms    │ Scroll disappears                                       │
 * │ 2000ms   │ Pigeon disappears, status shows "Flying..."            │
 * │ 5min     │ Pigeon returns with "returning" animation               │
 * │ 5min+2s  │ Pigeon back to normal, alert "Message delivered!"      │
 * └──────────┴─────────────────────────────────────────────────────────┘
 *
 * NESTED SETTIMEOUT EXPLAINED:
 * setTimeout creates a "timer" that runs code after a delay.
 * We can nest them to create a sequence:
 *
 * setTimeout(() => { Step 1 }, 1000);         // Runs after 1 second
 * setTimeout(() => { Step 2 }, 2000);         // Runs after 2 seconds
 * setTimeout(() => {                          // Runs after 5 seconds
 *   Step 3;
 *   setTimeout(() => { Step 4 }, 1000);       // Then 1 second later
 * }, 5000);
 *
 * TIME CALCULATIONS:
 * - Date.now() = current time in milliseconds since 1970
 * - delivery.delayedMinutes = delivery time in minutes (e.g., 5)
 * - minutes * 60 = seconds (5 * 60 = 300 seconds)
 * - seconds * 1000 = milliseconds (300 * 1000 = 300000ms = 5 minutes)
 *
 * GAME MECHANICS:
 * - Costs 15 energy to send a message
 * - Rewards 10 XP (experience points)
 * - Message goes into history
 * - Delivery time depends on distance and weather
 */
function handleSend() {
  try {
    // ─────────────────────────────────────────────────────────────
    // VALIDATION: Check if there's a message to send
    // ─────────────────────────────────────────────────────────────
    if (!currentDraft) {
      alert('No message to send! Write a message first.');
      return; // Exit early if no draft
    }

    // Get current application state
    const state = State.getState();

    // ═════════════════════════════════════════════════════════════
    // CALCULATE DELIVERY TIME
    // ═════════════════════════════════════════════════════════════
    // Delivery time depends on two factors:
    // 1. Distance (difference between area codes)
    // 2. Weather (storms slow down the pigeon)

    // Calculate distance in miles between area codes
    // Example: fromAreaCode=555, toAreaCode=123 → calculates distance
    const distance = Weather.calculateDistance(
      currentDraft.fromAreaCode,
      currentDraft.toAreaCode
    );

    // Get weather multiplier (1.0 = clear, 2.5 = snow storm)
    // Optional chaining (?.) with fallback (||) to default 1.0
    const weatherMultiplier = currentDraft.weather?.delayMultiplier || 1.0;

    // Calculate final delivery time considering weather
    // Returns object: { baseMinutes, delayedMinutes, weatherImpact }
    const delivery = Weather.calculateDelivery(distance, weatherMultiplier);

    // Calculate exact timestamp when message will be delivered
    // Date.now() = current time in milliseconds
    // delivery.delayedMinutes * 60 * 1000 = convert minutes to milliseconds
    const scheduledDeliveryAt = Date.now() + (delivery.delayedMinutes * 60 * 1000);

    // ═════════════════════════════════════════════════════════════
    // SAVE MESSAGE TO HISTORY
    // ═════════════════════════════════════════════════════════════
    // Add message to state so it appears in history
    const message = State.addMessage({
      fromAreaCode: currentDraft.fromAreaCode,
      toAreaCode: currentDraft.toAreaCode,
      body: currentDraft.body,
      scheduledDeliveryAt,              // When it will be delivered
    });

    // ═════════════════════════════════════════════════════════════
    // UPDATE PIGEON STATS
    // ═════════════════════════════════════════════════════════════
    // Sending a message costs energy but rewards XP

    // Consume 15 energy (flying is tiring!)
    State.consumeEnergy(15);

    // Reward 10 XP (experience points) for sending
    // Pigeon levels up every 100 XP
    State.addXP(10);

    // ═════════════════════════════════════════════════════════════
    // ANIMATION SEQUENCE: Pigeon Flying Away
    // ═════════════════════════════════════════════════════════════

    // ─── STEP 1: Start Flying Animation (Immediate) ───
    if (elements.pigeonSprite) {
      // Change sprite to 'flying' state (wing flapping animation)
      elements.pigeonSprite.setAttribute('data-state', 'flying');
    }

    // ─── STEP 2: Hide Scroll After 500ms ───
    setTimeout(() => {
      // After half a second, the scroll disappears
      // (pigeon has grabbed it and is taking off)
      if (elements.messageScroll) {
        elements.messageScroll.classList.add('hidden');
      }
    }, 500);  // 500 milliseconds = 0.5 seconds

    // ─── STEP 3: Pigeon Disappears After 2 Seconds ───
    setTimeout(() => {
      // Pigeon has flown away - no longer visible
      if (elements.pigeonSprite) {
        elements.pigeonSprite.setAttribute('data-state', 'gone');
      }

      // Update status message to show flight progress
      // Template literal (backticks) lets us insert variables with ${variable}
      if (elements.statusMessage) {
        elements.statusMessage.textContent =
          `Flying to area code ${currentDraft.toAreaCode}... ETA: ${delivery.delayedMinutes} min`;
      }
    }, 2000);  // 2000 milliseconds = 2 seconds

    // ─── STEP 4: Pigeon Returns After Delivery Time ───
    setTimeout(() => {
      // This runs after the full delivery time has elapsed
      // Example: if delivery.delayedMinutes = 5, this runs after 5 minutes

      // Pigeon comes back with "returning" animation
      if (elements.pigeonSprite) {
        elements.pigeonSprite.setAttribute('data-state', 'returning');
      }

      // ─── STEP 5: Landing Complete After 2 More Seconds ───
      setTimeout(() => {
        // Pigeon has landed, return to normal state
        updatePigeonSprite();  // Updates sprite based on current stats
        renderAll();            // Refresh entire UI

        // Show success message to user
        alert(`Message delivered! Your pigeon has returned.`);
      }, 2000);  // Additional 2 seconds for landing animation

    }, delivery.delayedMinutes * 60 * 1000);  // Main delivery delay
    // ^ This converts minutes to milliseconds:
    //   delivery.delayedMinutes (e.g., 5) * 60 = 300 seconds
    //   300 seconds * 1000 = 300000 milliseconds = 5 minutes

    // ═════════════════════════════════════════════════════════════
    // CLEANUP AND UPDATE
    // ═════════════════════════════════════════════════════════════

    // Clear the current draft (message has been sent)
    currentDraft = null;

    // Update all UI elements to reflect changes
    // (button states, stats, etc.)
    renderAll();

    // Log for debugging
    Debug.logInfo('Message sent', message);

  } catch (err) {
    // ═════════════════════════════════════════════════════════════
    // ERROR HANDLING
    // ═════════════════════════════════════════════════════════════
    Debug.logError('Failed to send message', err);
    alert('Failed to send message. Check debug panel for details.');
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// HISTORY AND CUSTOMIZATION HANDLERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Handle View History
 *
 * WHAT HAPPENS:
 * User clicks the "HISTORY" button to view all sent messages.
 * This renders the history list and displays it in a modal.
 *
 * FLOW:
 * 1. Call renderMessageHistory() to generate the HTML list
 * 2. Show the history modal
 * 3. User can now scroll through and view all sent messages
 */
function handleViewHistory() {
  try {
    // Generate/update the message history HTML
    renderMessageHistory();

    // Show the history modal popup
    showModal('modalHistory');

    // Log for debugging
    Debug.logInfo('History modal opened');
  } catch (err) {
    // Catch and log errors
    Debug.logError('Failed to handle view history', err);
  }
}

/**
 * Render Message History List
 *
 * WHAT THIS DOES:
 * Creates HTML elements for each sent message and displays them in a scrollable list.
 * This function dynamically builds the DOM (webpage structure) using JavaScript.
 *
 * HTML STRUCTURE CREATED:
 * ┌────────────────────────────────────────┐
 * │ <div class="history-item">             │
 * │   <div class="history-item-header">    │  ← From/To area codes
 * │     From: 555  To: 123                 │
 * │   </div>                               │
 * │   <div class="history-item-body">      │  ← Message text
 * │     Hello there!                       │
 * │   </div>                               │
 * │   <div class="history-item-meta">      │  ← Status and timestamps
 * │     Status: delivered                  │
 * │     Sent: 11/15/2023, 3:46 PM         │
 * │     Delivered: 11/15/2023, 4:01 PM    │
 * │   </div>                               │
 * │ </div>                                 │
 * └────────────────────────────────────────┘
 *
 * IMPORTANT CONCEPTS:
 * - document.createElement(tag) creates a new HTML element
 * - element.className sets the CSS class
 * - element.innerHTML sets HTML content (can include tags)
 * - element.textContent sets text content (safer, no HTML)
 * - element.appendChild(child) adds an element inside another element
 * - forEach loops through an array and runs a function for each item
 *
 * TEMPLATE LITERALS:
 * Strings with backticks (`) allow embedded variables and multi-line text:
 * `From: ${code}` inserts the variable "code" into the string
 *
 * TERNARY IN TEMPLATE:
 * ${condition ? "yes" : "no"} is if-else inside a template literal
 * ${msg.deliveredAt ? `<div>...</div>` : ''} means:
 * - If deliveredAt exists, show the div
 * - If it doesn't exist, show nothing ('')
 */
function renderMessageHistory() {
  try {
    // ─────────────────────────────────────────────────────────────
    // SAFETY CHECK: Ensure history list element exists
    // ─────────────────────────────────────────────────────────────
    if (!elements.historyList) return;

    // ─────────────────────────────────────────────────────────────
    // GET MESSAGES FROM STATE
    // ─────────────────────────────────────────────────────────────
    const state = State.getState();
    // Safely get messages array, default to empty array if doesn't exist
    const messages = state?.messages || [];

    // ─────────────────────────────────────────────────────────────
    // EMPTY STATE: No Messages Yet
    // ─────────────────────────────────────────────────────────────
    if (messages.length === 0) {
      // Show a friendly "no messages" message
      // innerHTML lets us write HTML directly as a string
      elements.historyList.innerHTML = '<p class="empty-state">No messages sent yet</p>';
      Debug.logInfo('No messages to display');
      return; // Exit early, nothing more to do
    }

    // ─────────────────────────────────────────────────────────────
    // CLEAR EXISTING CONTENT
    // ─────────────────────────────────────────────────────────────
    // Remove any old messages before adding new ones
    // Setting innerHTML to '' clears all child elements
    elements.historyList.innerHTML = '';

    // ─────────────────────────────────────────────────────────────
    // LOOP THROUGH MESSAGES AND CREATE HTML
    // ─────────────────────────────────────────────────────────────
    // forEach runs the function for each message in the array
    // Parameters: msg = current message object, index = position in array (0, 1, 2...)
    messages.forEach((msg, index) => {
      try {
        // ═════════════════════════════════════════════════════════
        // CREATE MAIN CONTAINER FOR THIS MESSAGE
        // ═════════════════════════════════════════════════════════
        // document.createElement('div') creates a new <div> element
        const item = document.createElement('div');
        // Set the CSS class for styling
        item.className = 'history-item';

        // ═════════════════════════════════════════════════════════
        // CREATE HEADER (From/To Area Codes)
        // ═════════════════════════════════════════════════════════
        const header = document.createElement('div');
        header.className = 'history-item-header';
        // Template literal with embedded variables
        // safeText ensures we don't display "undefined" or "null"
        header.innerHTML = `
          <span>From: ${safeText(msg.fromAreaCode, '???')}</span>
          <span>To: ${safeText(msg.toAreaCode, '???')}</span>
        `;

        // ═════════════════════════════════════════════════════════
        // CREATE BODY (Message Text)
        // ═════════════════════════════════════════════════════════
        const body = document.createElement('div');
        body.className = 'history-item-body';
        // Using textContent (not innerHTML) for safety
        // textContent treats everything as plain text (no HTML injection)
        body.textContent = safeText(msg.body, '[No message]');

        // ═════════════════════════════════════════════════════════
        // CREATE META (Status and Timestamps)
        // ═════════════════════════════════════════════════════════
        const meta = document.createElement('div');
        meta.className = 'history-item-meta';

        // Complex template literal with conditional content
        // The last line uses a ternary operator:
        // ${msg.deliveredAt ? `show this` : 'show nothing'}
        // This means: only show delivery time IF the message was delivered
        meta.innerHTML = `
          <div>Status: ${safeText(msg.status, 'unknown')}</div>
          <div>Sent: ${safeDate(msg.createdAt)}</div>
          ${msg.deliveredAt ? `<div>Delivered: ${safeDate(msg.deliveredAt)}</div>` : ''}
        `;
        // ^ If msg.deliveredAt is truthy (exists), show the div
        //   If it's falsy (null/undefined), show empty string ''

        // ═════════════════════════════════════════════════════════
        // ASSEMBLE THE MESSAGE ITEM
        // ═════════════════════════════════════════════════════════
        // appendChild adds elements as children (nested inside)
        // This builds the structure: item > header, body, meta
        item.appendChild(header);
        item.appendChild(body);
        item.appendChild(meta);

        // ═════════════════════════════════════════════════════════
        // ADD COMPLETED ITEM TO HISTORY LIST
        // ═════════════════════════════════════════════════════════
        // Add this complete message item to the history list container
        elements.historyList.appendChild(item);

      } catch (err) {
        // If anything goes wrong rendering THIS message, log it
        // But continue to render other messages (don't stop the whole list)
        Debug.logError(`Failed to render message ${index}`, err);
      }
    });

    // Log success
    Debug.logInfo(`Rendered ${messages.length} messages`);

  } catch (err) {
    // If the entire function fails, log the error
    Debug.logError('Failed to render message history', err);
  }
}

/**
 * Handle Edit Pigeon (Open Customization Modal)
 *
 * WHAT HAPPENS:
 * User clicks to edit their pigeon's name or color.
 * This opens a modal with form inputs pre-filled with current values.
 *
 * FORM POPULATION:
 * We set the .value property of input fields to match current pigeon data.
 * This way the user sees their current name/color and can modify it.
 *
 * WHY PRE-FILL:
 * Better user experience - they can see current values and just make changes
 * rather than having to retype everything from scratch.
 */
function handleEditPigeon() {
  try {
    // Get current pigeon data
    const state = State.getState();
    const pigeon = state.pigeon;

    // ─────────────────────────────────────────────────────────────
    // POPULATE FORM WITH CURRENT VALUES
    // ─────────────────────────────────────────────────────────────
    // Set the name input field to current pigeon name
    if (elements.inputPigeonName) {
      elements.inputPigeonName.value = pigeon.name;
    }

    // Set the color input field to current pigeon color
    // Color inputs show a color picker in most browsers
    if (elements.inputPigeonColor) {
      elements.inputPigeonColor.value = pigeon.color;
    }

    // Show the edit modal
    showModal('modalEdit');

    // Log for debugging
    Debug.logInfo('Edit pigeon modal opened');
  } catch (err) {
    // Catch and log errors
    Debug.logError('Failed to handle edit pigeon', err);
  }
}

/**
 * Handle Save Pigeon (Save Customization Changes)
 *
 * WHAT HAPPENS:
 * User has edited their pigeon's name/color and clicks "Save".
 * This reads the form values and updates the pigeon in state.
 *
 * SHORTHAND OBJECT PROPERTY:
 * { name, color } is shorthand for { name: name, color: color }
 * This creates an object with properties matching the variable names
 *
 * DEFAULT VALUES:
 * We use || (OR) operator to provide defaults if fields are empty:
 * - Default name: 'Courier'
 * - Default color: '#8B7355' (pigeon brown)
 */
function handleSavePigeon() {
  try {
    // ─────────────────────────────────────────────────────────────
    // READ FORM VALUES
    // ─────────────────────────────────────────────────────────────
    // Get name from input, default to 'Courier' if empty
    const name = elements.inputPigeonName?.value || 'Courier';

    // Get color from input, default to pigeon brown if empty
    const color = elements.inputPigeonColor?.value || '#8B7355';

    // ─────────────────────────────────────────────────────────────
    // UPDATE STATE
    // ─────────────────────────────────────────────────────────────
    // Save the new name and color to state
    // { name, color } is shorthand for { name: name, color: color }
    State.updatePigeon({ name, color });

    // ─────────────────────────────────────────────────────────────
    // CLOSE MODAL AND UPDATE UI
    // ─────────────────────────────────────────────────────────────
    // Close the edit modal
    hideModal('modalEdit');

    // Update all UI to show the new name and color
    renderAll();

    // Log for debugging
    Debug.logInfo('Pigeon saved', { name, color });
  } catch (err) {
    // Catch and log errors
    Debug.logError('Failed to save pigeon', err);
  }
}

/**
 * Handle Reset Session
 *
 * WHAT HAPPENS:
 * Resets the daily message counter so user can send more messages.
 * This is useful for testing/demo purposes.
 *
 * confirm() FUNCTION:
 * Built-in browser function that shows a popup with OK/Cancel buttons
 * Returns true if user clicks OK, false if they click Cancel
 *
 * WHY CONFIRM:
 * We ask for confirmation before resetting to prevent accidental resets.
 * User might have clicked the button by mistake!
 */
function handleResetSession() {
  try {
    // Show confirmation dialog to user
    // confirm() returns true if user clicks OK, false if they click Cancel
    const confirmed = confirm('Reset daily session? This will reset message count.');

    // Only proceed if user clicked OK
    if (confirmed) {
      // Reset the daily message counter in state
      // This sets dailyMessagesUsed back to 0
      State.resetDailySession();

      // Update UI to reflect the reset
      renderAll();

      // Log for debugging
      Debug.logInfo('Daily session reset');

      // Show success message to user
      alert('Daily session reset!');
    }
    // If user clicked Cancel (confirmed = false), do nothing
  } catch (err) {
    // Catch and log errors
    Debug.logError('Failed to reset session', err);
  }
}

/**
 * Update Character Count
 *
 * WHAT HAPPENS:
 * As user types in the message textarea, this updates a counter showing
 * how many characters they've typed. Provides real-time feedback.
 *
 * WHEN CALLED:
 * This is called on the 'input' event of the textarea (every keystroke)
 *
 * .toString() METHOD:
 * Converts a number to a string
 * message.length = 42 (number)
 * message.length.toString() = "42" (string)
 * We need a string to set textContent
 */
function updateCharCount() {
  try {
    // Get current message text from textarea
    const message = elements.inputMessage?.value || '';

    // Update character count display
    if (elements.charCount) {
      // .length gets number of characters in string
      // .toString() converts number to string for display
      elements.charCount.textContent = message.length.toString();
    }
  } catch (err) {
    // Catch and log errors
    Debug.logError('Failed to update char count', err);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EVENT SYSTEM - Connect user clicks to handler functions
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Set Up All Event Handlers (Click Routing System)
 *
 * WHAT THIS DOES:
 * Connects user clicks to the appropriate handler functions.
 * Uses "event delegation" - one listener on the whole document instead of
 * individual listeners on each button.
 *
 * EVENT DELEGATION EXPLAINED:
 * Instead of: button1.addEventListener, button2.addEventListener, etc. (many listeners)
 * We do: document.addEventListener (one listener catches all clicks)
 * Then we check WHICH element was clicked and route accordingly.
 *
 * WHY EVENT DELEGATION:
 * - More performant (fewer listeners = less memory)
 * - Works with dynamically added elements (elements added after page load)
 * - Centralizes all click handling in one place
 *
 * HOW IT WORKS:
 * 1. User clicks anywhere on the page
 * 2. Event bubbles up to document
 * 3. We check if clicked element has data-action attribute
 * 4. Route to appropriate handler based on action value
 *
 * HTML BUTTON EXAMPLE:
 * <button data-action="feed">FEED</button>
 * When clicked, this triggers handleFeed()
 *
 * DATA ATTRIBUTES:
 * data-action is a custom HTML attribute we define
 * Access via: element.dataset.action
 * Example: <div data-action="send"> → element.dataset.action = "send"
 *
 * SWITCH STATEMENT:
 * Like a series of if-else, but cleaner for many options:
 * switch (value) {
 *   case 'option1': doThis(); break;
 *   case 'option2': doThat(); break;
 *   default: handleUnknown();
 * }
 */
function setupEventHandlers() {
  // ═════════════════════════════════════════════════════════════
  // CLICK EVENT DELEGATION
  // ═════════════════════════════════════════════════════════════
  // Listen for ALL clicks on the entire document
  // addEventListener('event', callback) runs callback when event occurs
  document.addEventListener('click', (event) => {
    // Get the element that was clicked
    // event.target is the actual element clicked (might be inside a button)
    const target = event.target;

    // Safety check - exit if no target (shouldn't happen, but be safe!)
    if (!target) return;

    // ─────────────────────────────────────────────────────────────
    // FIND THE ACTION ATTRIBUTE
    // ─────────────────────────────────────────────────────────────
    // Check if clicked element OR its parent has data-action attribute
    // target.dataset.action: get data-action from clicked element
    // target.closest('[data-action]'): find nearest parent with data-action
    // || means "or" - try first option, if null try second option
    const action = target.dataset?.action || target.closest('[data-action]')?.dataset?.action;

    // If no action found, this wasn't an action button - ignore the click
    if (!action) return;

    // Log which action was triggered (for debugging)
    Debug.logInfo(`Action triggered: ${action}`);

    // ─────────────────────────────────────────────────────────────
    // ROUTE TO APPROPRIATE HANDLER
    // ─────────────────────────────────────────────────────────────
    try {
      // Switch statement routes to different handlers based on action value
      // break; prevents falling through to next case
      switch (action) {
        case 'feed':
          handleFeed();
          break;

        case 'write':
          handleWrite();
          break;

        case 'send':
          handleSend();
          break;

        case 'rest':
          handleRest();
          break;

        case 'attach-scroll':
          handleAttachScroll();
          break;

        case 'close-ritual':
          hideModal('ritualOverlay');
          break;

        case 'view-history':
          handleViewHistory();
          break;

        case 'close-history':
          hideModal('modalHistory');
          break;

        case 'edit-pigeon':
          handleEditPigeon();
          break;

        case 'save-pigeon':
          handleSavePigeon();
          break;

        case 'close-edit':
          hideModal('modalEdit');
          break;

        case 'reset-session':
          handleResetSession();
          break;

        // default runs if action doesn't match any case
        default:
          Debug.logWarning(`Unknown action: ${action}`);
      }
    } catch (err) {
      // If handler throws an error, log it but don't crash the app
      Debug.logError(`Action handler failed: ${action}`, err);
    }
  });

  // ═════════════════════════════════════════════════════════════
  // INPUT EVENT FOR CHARACTER COUNTER
  // ═════════════════════════════════════════════════════════════
  // Listen for typing in the message textarea
  if (elements.inputMessage) {
    // 'input' event fires every time user types (every keystroke)
    // updateCharCount() updates the character counter display
    elements.inputMessage.addEventListener('input', updateCharCount);
  }

  // Log that event system is ready
  Debug.logLifecycle('Event handlers installed');
}

// ═══════════════════════════════════════════════════════════════════════════
// INITIALIZATION FUNCTIONS - Set up the application
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Cache DOM Elements
 *
 * WHAT THIS DOES:
 * Finds all the HTML elements we need and stores references to them.
 * This is called once during app initialization.
 *
 * WHY CACHE ELEMENTS:
 * - Performance: Finding elements is slow, caching is fast
 * - Instead of calling document.getElementById() every time we need an element,
 *   we find it ONCE and save it in the "elements" object
 * - Think of it like writing down phone numbers instead of looking them up
 *   in the phone book every time
 *
 * document.getElementById(id):
 * - Searches the entire webpage for an element with matching id attribute
 * - Example HTML: <div id="pigeonSprite">
 * - Get it with: document.getElementById('pigeonSprite')
 * - Returns the element, or null if not found
 *
 * OBJECT LITERAL SHORTHAND:
 * When property name matches variable name:
 * { app: app, name: name } can be written as: { app, name }
 * But here we're calling a function, so we write the full version
 *
 * ELEMENT CATEGORIES:
 * - Display elements (pigeonName, pigeonSprite, statusMessage)
 * - Status icons (iconEnergy, iconMood, iconLevel)
 * - Action buttons (btnFeed, btnWrite, btnSend, btnRest)
 * - Modals (ritualOverlay, modalHistory, modalEdit)
 * - Form inputs (inputFromArea, inputToArea, inputMessage, etc.)
 */
function cacheElements() {
  // Build the elements object with all our DOM element references
  // Each property stores a reference to one HTML element from the page
  elements = {
    // ─── Main App Container ───
    app: document.getElementById('app'),

    // ─── Pigeon Display Elements ───
    pigeonName: document.getElementById('pigeonName'),        // Pigeon's name text
    pigeonSprite: document.getElementById('pigeonSprite'),    // Pigeon sprite/avatar
    messageScroll: document.getElementById('messageScroll'),  // Scroll attached to pigeon
    scrollText: document.getElementById('scrollText'),        // Message preview on scroll
    statusMessage: document.getElementById('statusMessage'),  // Status text below pigeon

    // ─── Status Bar Icons ───
    iconEnergy: document.getElementById('iconEnergy'),        // Energy stat display
    iconMood: document.getElementById('iconMood'),            // Mood stat display
    iconLevel: document.getElementById('iconLevel'),          // Level stat display

    // ─── Action Buttons ───
    btnFeed: document.getElementById('btnFeed'),              // FEED button
    btnWrite: document.getElementById('btnWrite'),            // WRITE button
    btnSend: document.getElementById('btnSend'),              // SEND button
    btnRest: document.getElementById('btnRest'),              // REST button

    // ─── Write Message Modal ───
    ritualOverlay: document.getElementById('ritualOverlay'),  // Write message popup
    inputFromArea: document.getElementById('inputFromArea'),  // "From" area code input
    inputToArea: document.getElementById('inputToArea'),      // "To" area code input
    inputMessage: document.getElementById('inputMessage'),    // Message text area
    charCount: document.getElementById('charCount'),          // Character counter

    // ─── History Modal ───
    modalHistory: document.getElementById('modalHistory'),    // History popup
    historyList: document.getElementById('historyList'),      // History list container

    // ─── Edit Pigeon Modal ───
    modalEdit: document.getElementById('modalEdit'),          // Edit popup
    inputPigeonName: document.getElementById('inputPigeonName'),    // Name input
    inputPigeonColor: document.getElementById('inputPigeonColor'),  // Color input
  };

  // Log that caching is complete
  Debug.logLifecycle('DOM elements cached');
}

/**
 * Initialize Application (APP ENTRY POINT)
 *
 * ═══════════════════════════════════════════════════════════════
 * THIS IS THE MOST IMPORTANT FUNCTION - IT STARTS EVERYTHING!
 * ═══════════════════════════════════════════════════════════════
 *
 * WHAT THIS DOES:
 * This is the "main" function that sets up the entire application.
 * It runs once when the page loads and initializes all systems.
 *
 * INITIALIZATION SEQUENCE (ORDER MATTERS!):
 * ┌─────────────────────────────────────────────────────────┐
 * │ Step │ What                │ Why                        │
 * ├──────┼─────────────────────┼────────────────────────────┤
 * │  1   │ Debug system        │ So we can log everything   │
 * │  2   │ State system        │ Load saved data            │
 * │  3   │ Cache elements      │ Find all HTML elements     │
 * │  4   │ Subscribe to state  │ Auto-update on changes     │
 * │  5   │ Event handlers      │ Connect buttons to code    │
 * │  6   │ Initial render      │ Show current state         │
 * │  7   │ Mood timer          │ Update mood periodically   │
 * └──────┴─────────────────────┴────────────────────────────┘
 *
 * WHY THIS ORDER:
 * - Debug first: We want to log everything that follows
 * - State second: Other systems depend on state being loaded
 * - Elements third: We need DOM elements before we can update them
 * - Subscribe before event handlers: So state changes trigger updates
 * - Render after everything is ready: Show the initial UI
 * - Timer last: Background task that runs forever
 *
 * STATE SUBSCRIPTION:
 * State.subscribe(callback) registers a function to run when state changes.
 * Anytime state is updated (pigeon fed, message sent, etc.), our callback runs.
 * This creates "reactive" UI - UI automatically updates when data changes!
 *
 * setInterval EXPLAINED:
 * setInterval(function, milliseconds) runs function repeatedly on a schedule.
 * setInterval(() => {...}, 60000) runs every 60000ms = 60 seconds = 1 minute.
 * We use this to periodically update the pigeon's mood based on time passed.
 *
 * ARROW FUNCTIONS:
 * () => { code } is shorthand for function() { code }
 * Both do the same thing, arrow syntax is just shorter and modern.
 */
function initApp() {
  try {
    // Log that initialization has started
    Debug.logLifecycle('App initialization started');

    // ═════════════════════════════════════════════════════════════
    // STEP 1: Initialize Debug System
    // ═════════════════════════════════════════════════════════════
    // Set up debug panel and error logging FIRST
    // This way we can log everything that happens during init
    Debug.initDebug();

    // ═════════════════════════════════════════════════════════════
    // STEP 2: Initialize State Management
    // ═════════════════════════════════════════════════════════════
    // Load saved data from localStorage (pigeon stats, messages, etc.)
    // If no saved data exists, creates default state
    State.initState();

    // ═════════════════════════════════════════════════════════════
    // STEP 3: Cache DOM Elements
    // ═════════════════════════════════════════════════════════════
    // Find all HTML elements we need and store references to them
    // This makes future element access fast
    cacheElements();

    // ═════════════════════════════════════════════════════════════
    // STEP 4: Subscribe to State Changes (Reactive UI)
    // ═════════════════════════════════════════════════════════════
    // Register a callback that runs whenever state changes
    // This makes the UI automatically update when data changes
    // Arrow function: () => { code } is shorthand for function() { code }
    State.subscribe(() => {
      // This runs every time state changes (feed, send message, etc.)
      Debug.logInfo('State changed, re-rendering');

      // Re-render entire UI to reflect new state
      renderAll();
    });

    // ═════════════════════════════════════════════════════════════
    // STEP 5: Set Up Event Handlers
    // ═════════════════════════════════════════════════════════════
    // Connect click events to handler functions
    // Now buttons will actually do something when clicked!
    setupEventHandlers();

    // ═════════════════════════════════════════════════════════════
    // STEP 6: Initial Render
    // ═════════════════════════════════════════════════════════════
    // Draw the UI for the first time
    // Shows pigeon, stats, buttons, etc. based on current state
    renderAll();

    // ═════════════════════════════════════════════════════════════
    // STEP 7: Start Periodic Mood Updates
    // ═════════════════════════════════════════════════════════════
    // Set up a timer to update mood every minute
    // setInterval runs a function repeatedly on a schedule
    // 60000 milliseconds = 60 seconds = 1 minute
    setInterval(() => {
      // This runs every minute
      // Recalculates mood based on energy and last activity time
      State.refreshMood();
    }, 60000);  // Run every 60,000 milliseconds (1 minute)

    // ═════════════════════════════════════════════════════════════
    // INITIALIZATION COMPLETE!
    // ═════════════════════════════════════════════════════════════
    Debug.logLifecycle('App initialization complete');

    // Log a snapshot of initial state for debugging
    Debug.logStateSnapshot(State.getState());

  } catch (err) {
    // ═════════════════════════════════════════════════════════════
    // ERROR HANDLING
    // ═════════════════════════════════════════════════════════════
    // If ANYTHING goes wrong during initialization, log it
    // This helps us debug problems that prevent the app from starting
    Debug.logError('App initialization failed', err);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// APP STARTUP - Run initApp when page loads
// ═══════════════════════════════════════════════════════════════════════════

/**
 * APP STARTUP LOGIC
 *
 * PROBLEM:
 * JavaScript can run before the HTML is fully loaded!
 * If we try to find DOM elements before they exist, we get null/errors.
 *
 * SOLUTION:
 * Check if HTML is still loading. If yes, wait for it to finish.
 * If it's already loaded, run initApp immediately.
 *
 * document.readyState:
 * - 'loading' = HTML is still being parsed (elements don't exist yet)
 * - 'interactive' = HTML parsed, but resources (images, etc.) still loading
 * - 'complete' = Everything loaded
 *
 * DOMContentLoaded EVENT:
 * Fires when HTML is fully parsed and DOM is ready.
 * This is the safe moment to start finding elements and running code.
 *
 * TWO SCENARIOS:
 * 1. Script runs BEFORE HTML finishes loading:
 *    → Wait for DOMContentLoaded event, then run initApp
 *
 * 2. Script runs AFTER HTML is already loaded:
 *    → Run initApp immediately (no need to wait)
 */

// Check if document is still loading
if (document.readyState === 'loading') {
  // Case 1: HTML still loading - wait for it to finish
  // DOMContentLoaded event fires when HTML is fully parsed
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  // Case 2: HTML already loaded - run immediately
  initApp();
}
