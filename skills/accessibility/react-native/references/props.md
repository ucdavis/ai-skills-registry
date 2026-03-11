# Accessibility Props Reference — React Native / Expo

Full prop-by-prop guide with platform notes and code examples.

---

## `accessibilityLabel`

**Required on**: All interactive elements that lack an unambiguous text child. Also required on non-decorative images.

```tsx
// ❌ Bad — icon button with no label
<TouchableOpacity onPress={onClose}>
  <Icon name="x" />
</TouchableOpacity>

// ✅ Good
<TouchableOpacity
  onPress={onClose}
  accessibilityLabel="Close dialog"
  accessibilityRole="button"
>
  <Icon name="x" />
</TouchableOpacity>
```

**Rules**:
- Keep under ~40 characters; screen readers read the full string.
- Do NOT include the role (e.g., don't write "Close button" — the role announces "button" automatically).
- Localize with `i18n.t()` — never hardcode English-only labels.

---

## `accessibilityHint`

Optional but recommended when the outcome of an action isn't obvious from the label alone.

```tsx
<TouchableOpacity
  accessibilityLabel="Add to cart"
  accessibilityHint="Double tap to add this item to your shopping cart"
  accessibilityRole="button"
  onPress={addToCart}
/>
```

iOS reads hint after a brief pause following the label. Android TalkBack combines label + hint.

---

## `accessibilityRole`

**Required on all interactive elements and semantic landmarks.**

| Value | Use for |
|-------|---------|
| `button` | Any pressable that triggers an action |
| `link` | Opens a URL or navigates to another screen |
| `header` | Section headings (replaces `<h1>`–`<h6>`) |
| `image` | Meaningful images |
| `imagebutton` | Pressable image |
| `text` | Plain text (default for `<Text>`) |
| `search` | Search input |
| `checkbox` | Toggle with checked/unchecked state |
| `radio` | Single-select option in a group |
| `switch` | On/off toggle (maps to iOS switch role) |
| `slider` | Range input |
| `spinbutton` | Numeric stepper |
| `combobox` | Select / dropdown |
| `menu` | Menu container |
| `menuitem` | Item within a menu |
| `progressbar` | Progress indicator |
| `tab` | Individual tab in a tab bar |
| `tablist` | Container of tabs |
| `none` / `presentation` | Decorative element, removes from a11y tree |

```tsx
// Tab bar example
<View accessibilityRole="tablist">
  {tabs.map(tab => (
    <TouchableOpacity
      key={tab.id}
      accessibilityRole="tab"
      accessibilityState={{ selected: tab.id === activeTab }}
      accessibilityLabel={tab.label}
      onPress={() => setActiveTab(tab.id)}
    />
  ))}
</View>
```

---

## `accessibilityState`

Communicates the current state of a component.

```tsx
// Checkbox
<TouchableOpacity
  accessibilityRole="checkbox"
  accessibilityState={{ checked: isChecked }}
  onPress={toggleCheck}
>
  <CheckIcon checked={isChecked} />
  <Text>Accept terms</Text>
</TouchableOpacity>

// Disabled button
<TouchableOpacity
  accessibilityRole="button"
  accessibilityState={{ disabled: !isFormValid }}
  disabled={!isFormValid}
  onPress={submit}
>
  <Text>Submit</Text>
</TouchableOpacity>

// Expandable accordion
<TouchableOpacity
  accessibilityRole="button"
  accessibilityState={{ expanded: isOpen }}
  onPress={() => setIsOpen(o => !o)}
>
  <Text>Section Title</Text>
</TouchableOpacity>
```

---

## `accessibilityValue`

For sliders, progress bars, and any value-bearing control.

```tsx
<Slider
  accessibilityRole="slider"
  accessibilityLabel="Volume"
  accessibilityValue={{ min: 0, max: 100, now: volume, text: `${volume}%` }}
  value={volume}
  onValueChange={setVolume}
/>

<ActivityIndicator
  accessibilityRole="progressbar"
  accessibilityLabel="Loading content"
  accessibilityValue={{ text: 'Loading, please wait' }}
/>
```

---

## `accessible`

Groups all children into a single focusable unit. Screen reader reads the subtree as one element.

```tsx
// ✅ Group label + value into one read
<View
  accessible={true}
  accessibilityLabel="Temperature, 72 degrees Fahrenheit"
>
  <Text style={styles.label}>Temperature</Text>
  <Text style={styles.value}>72°F</Text>
</View>
```

**Warning**: Setting `accessible={true}` on a container makes its children inaccessible individually. Only do this when the whole group is semantically one concept.

---

## `accessibilityLiveRegion` (Android) / `aria-live` (cross-platform, RN ≥0.73)

Announces changes to dynamic content without requiring focus.

```tsx
// Error message that appears after form validation
<Text
  aria-live="polite"         // Use aria-live for cross-platform (RN ≥0.73)
  accessibilityLiveRegion="polite"  // Fallback for older RN
>
  {errorMessage}
</Text>

// Real-time countdown / alert — use "assertive" sparingly
<Text aria-live="assertive">
  {`Session expires in ${seconds} seconds`}
</Text>
```

Values:
- `"none"` — No announcement (default)
- `"polite"` — Announces when screen reader is idle
- `"assertive"` — Interrupts current speech (use only for urgent alerts)

---

## `accessibilityViewIsModal` (iOS)

Traps VoiceOver focus inside a modal or bottom sheet. Without this, users can swipe to elements behind the overlay.

```tsx
<View
  accessibilityViewIsModal={true}
  style={styles.modal}
>
  {/* Modal content */}
</View>
```

On Android, use `importantForAccessibility="no-hide-descendants"` on the background content instead.

---

## `importantForAccessibility` (Android)

```tsx
// Hide background content when modal is open
<View importantForAccessibility={isModalOpen ? "no-hide-descendants" : "yes"}>
  {/* Background screen */}
</View>
```

| Value | Behavior |
|-------|---------|
| `"yes"` | Element is accessible |
| `"no"` | Element is not accessible, children still are |
| `"no-hide-descendants"` | Element and all descendants hidden from a11y |
| `"auto"` | System decides (default) |

---

## `onAccessibilityAction` + `accessibilityActions`

Add custom actions that appear in the screen reader's "Actions" menu (iOS: long-press, swipe up; Android: explore-by-touch actions menu).

```tsx
<View
  accessible={true}
  accessibilityLabel="Email from Alice"
  accessibilityActions={[
    { name: 'reply', label: 'Reply' },
    { name: 'archive', label: 'Archive' },
    { name: 'delete', label: 'Delete' },
  ]}
  onAccessibilityAction={(event) => {
    switch (event.nativeEvent.actionName) {
      case 'reply': onReply(); break;
      case 'archive': onArchive(); break;
      case 'delete': onDelete(); break;
    }
  }}
>
  {/* email card content */}
</View>
```

---

## `AccessibilityInfo` API

```tsx
import { AccessibilityInfo } from 'react-native';

// Check screen reader status
const isScreenReaderEnabled = await AccessibilityInfo.isScreenReaderEnabled();

// Check reduce motion
const isReduceMotion = await AccessibilityInfo.isReduceMotionEnabled();

// Check bold text (iOS)
const isBoldText = await AccessibilityInfo.isBoldTextEnabled();

// Listen for changes
const subscription = AccessibilityInfo.addEventListener(
  'screenReaderChanged',
  (isEnabled) => setScreenReaderActive(isEnabled)
);
// Cleanup:
subscription.remove();

// Programmatically announce a message
AccessibilityInfo.announceForAccessibility('Item added to cart');

// Set focus to a specific element (use sparingly)
const ref = useRef(null);
AccessibilityInfo.setAccessibilityFocus(findNodeHandle(ref.current));
```

---

## `hitSlop`

Extends tap target without changing visual layout — critical for small icons.

```tsx
<TouchableOpacity
  onPress={onPress}
  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
  accessibilityLabel="Favorite"
  accessibilityRole="button"
>
  <HeartIcon size={20} />
</TouchableOpacity>
```

Minimum effective touch target after hitSlop: 44×44 pts.
