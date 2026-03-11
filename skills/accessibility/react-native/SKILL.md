---
name: rn-accessibility
description: >
  Implement, audit, and fix accessibility (a11y) in React Native and Expo mobile apps.
  Use this skill whenever the user mentions accessibility, a11y, screen readers, VoiceOver,
  TalkBack, WCAG, accessible labels, focus management, color contrast, or when they ask
  to make their app more accessible. Also trigger when reviewing components for inclusion/exclusion
  concerns, or when accessibility-related lint errors or Expo/RN warnings appear. This skill
  covers both implementation (adding a11y props) and auditing (finding and fixing gaps) end-to-end.
license: MIT
metadata:
  author: anthropic
  version: "1.0"
  platforms: React Native, Expo (managed & bare workflow)
  rn-version: ">=0.71"
---

# React Native / Expo Accessibility Skill

This skill implements and audits accessibility (a11y) in React Native and Expo apps, following
WCAG 2.1 AA standards as adapted for mobile (iOS VoiceOver + Android TalkBack).

## When This Skill Is Needed

Use this skill for:
- Implementing `accessibilityLabel`, `accessibilityHint`, `accessibilityRole`, `accessibilityState`, `accessibilityValue`
- Auditing a component, screen, or entire app for a11y gaps
- Fixing VoiceOver / TalkBack focus order and grouping
- Checking color contrast and tap target sizes
- Writing accessible custom components (modals, carousels, date pickers, etc.)
- Integrating automated a11y testing (eslint-plugin-jsx-a11y adapted for RN, react-native-a11y)
- Adding `AccessibilityInfo` API usage (reduce motion, screen reader detection)

---

## Core Principles

1. **Every interactive element must have an accessible name** — via `accessibilityLabel` or meaningful text child.
2. **Every interactive element must have a role** — `accessibilityRole` tells screen readers *what* it is.
3. **State must be announced** — use `accessibilityState` for `disabled`, `selected`, `checked`, `expanded`, `busy`.
4. **Logical reading order** — use `importantForAccessibility` (Android) and `accessibilityViewIsModal` to manage focus scope.
5. **Tap targets ≥ 44×44 pts** — per Apple HIG and Android guidelines.
6. **4.5:1 contrast ratio** — for normal text; 3:1 for large text and UI components.
7. **No information conveyed by color alone** — always pair with text, icon, or pattern.
8. **Support Reduce Motion** — gate animations behind `AccessibilityInfo.isReduceMotionEnabled()`.

---

## Quick Reference: Core A11y Props

| Prop | Platform | Purpose |
|------|----------|---------|
| `accessible` | Both | Groups children into one focusable node |
| `accessibilityLabel` | Both | Name read aloud by screen reader |
| `accessibilityHint` | Both | Explains the result of an action |
| `accessibilityRole` | Both | Semantic role (button, link, header, image, etc.) |
| `accessibilityState` | Both | `{disabled, selected, checked, expanded, busy}` |
| `accessibilityValue` | Both | `{min, max, now, text}` for sliders/progress |
| `accessibilityLiveRegion` | Android | `'none'`, `'polite'`, `'assertive'` for dynamic content |
| `aria-live` | Both (RN ≥0.73) | ARIA-aligned live region |
| `accessibilityViewIsModal` | iOS | Traps focus inside modal |
| `importantForAccessibility` | Android | `'yes'`, `'no'`, `'no-hide-descendants'` |
| `onAccessibilityAction` | Both | Custom actions for screen readers |
| `accessibilityActions` | Both | Declares custom action names |

For detailed prop usage with examples, see [`references/props.md`](references/props.md).

---

## Implementation Workflow

### Step 1 — Audit (find gaps)

Run the audit script to surface issues before writing any code:

```bash
node scripts/audit.js <path-to-src>
```

This checks for:
- Touchable/Pressable elements missing `accessibilityLabel` or `accessibilityRole`
- Images missing `accessibilityLabel` or `accessibilityIgnoresInvertColors`
- `TextInput` missing `accessibilityLabel` (separate from `placeholder`)
- Custom interactive components lacking roles
- Potential color-only information (flag for manual review)

Then do a **manual walkthrough** with:
- iOS Simulator → Accessibility Inspector (`Xcode > Open Developer Tool > Accessibility Inspector`)
- Android Emulator → TalkBack (Settings > Accessibility > TalkBack)

### Step 2 — Fix by component type

See [`references/components.md`](references/components.md) for canonical patterns for:
- Buttons & Pressables
- Text Inputs & Forms
- Images & Icons
- Lists & FlatList
- Navigation (Tab bars, Stack headers)
- Modals & Bottom Sheets
- Custom controls (Switch, Slider, Checkbox, Radio)
- Loading / Skeleton states

### Step 3 — Verify color contrast

1. Extract all color pairs (text + background) from your design tokens / StyleSheet.
2. Run the contrast check: `node scripts/contrast-check.js`
3. Fix any failures — see [`references/contrast.md`](references/contrast.md) for replacement palette strategies.

### Step 4 — Add automated testing

Install and configure:
```bash
npx expo install @testing-library/react-native
npm install --save-dev eslint-plugin-jsx-a11y
```

Add to `.eslintrc`:
```json
{
  "plugins": ["jsx-a11y"],
  "extends": ["plugin:jsx-a11y/recommended"],
  "rules": {
    "jsx-a11y/interactive-supports-focus": "error"
  }
}
```

Write accessibility-focused unit tests — see [`references/testing.md`](references/testing.md).

### Step 5 — Reduce Motion & Dynamic Type

```js
import { AccessibilityInfo } from 'react-native';

// Reduce Motion
const [reduceMotion, setReduceMotion] = useState(false);
useEffect(() => {
  AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
  const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
  return () => sub.remove();
}, []);

// Dynamic Type (iOS) — use allowFontScaling (default true, do NOT set false)
<Text allowFontScaling={true} maxFontSizeMultiplier={2}>...</Text>
```

---

## Audit Checklist

Use this checklist per screen. Check each item; document failures with component name + line number.

### Perceivable
- [ ] All images have `accessibilityLabel` or are marked decorative (`accessible={false}`)
- [ ] Color is not the only means of conveying information
- [ ] Text contrast ≥ 4.5:1 (normal) / 3:1 (large ≥18pt or bold ≥14pt)
- [ ] UI component contrast ≥ 3:1 against adjacent colors
- [ ] `allowFontScaling` is NOT disabled on any `Text` or `TextInput`

### Operable
- [ ] All interactive elements have `accessibilityRole`
- [ ] All interactive elements have `accessibilityLabel` (or unambiguous text child)
- [ ] Tap targets ≥ 44×44 pts (use `hitSlop` to extend without changing layout)
- [ ] Focus order matches reading/visual order
- [ ] No time limits without accessible pause/extend mechanism
- [ ] Animations respect Reduce Motion setting

### Understandable
- [ ] Form inputs have visible labels (not just placeholder)
- [ ] Error messages are programmatically associated with inputs
- [ ] `accessibilityHint` used where action outcome isn't obvious
- [ ] `accessibilityLiveRegion` / `aria-live` on dynamic content (toasts, errors, countdowns)

### Robust
- [ ] Custom interactive components announce state changes
- [ ] Modal/overlay traps focus (`accessibilityViewIsModal={true}` on iOS)
- [ ] Keyboard/switch access works (external keyboard, switch control)
- [ ] No a11y props on decorative non-interactive `View`s (reduces noise)

---

## Common Mistakes to Avoid

- ❌ `accessibilityLabel` on a `View` wrapping a `TouchableOpacity` (set it on the Touchable itself)
- ❌ Using `placeholder` as the only label for `TextInput` (VoiceOver reads placeholder as label, but it disappears on input)
- ❌ `accessible={false}` on a container that has interactive children (hides them from screen reader)
- ❌ Hardcoded colors that ignore dark mode / high-contrast mode
- ❌ Calling `AccessibilityInfo.announceForAccessibility` on every render (debounce or trigger only on meaningful changes)
- ❌ Setting `importantForAccessibility="no-hide-descendants"` on a visible interactive group

---

## Expo-Specific Notes

- **Managed Workflow**: All standard RN a11y props work. No native module needed.
- **expo-router**: Navigation screen titles are announced automatically. Supplement with `Stack.Screen options={{ title }}` for clarity.
- **expo-image**: Supports `accessibilityLabel` prop directly; use `role="presentation"` for decorative images.
- **expo-av / expo-video**: Provide captions/subtitles via `subtitleStyles` and `tracks` props. Announce play/pause state via `accessibilityState={{ busy: isLoading }}`.
- **Expo Go**: Accessibility Inspector works with Expo Go on physical devices.

---

## Reference Files

| File | Contents |
|------|----------|
| [`references/props.md`](references/props.md) | Full prop API reference with before/after code examples |
| [`references/components.md`](references/components.md) | Canonical accessible patterns for 15+ component types |
| [`references/contrast.md`](references/contrast.md) | WCAG contrast ratios, formulas, palette fix strategies |
| [`references/testing.md`](references/testing.md) | Unit test patterns, e2e with Detox, CI integration |

## Scripts

| Script | Purpose |
|--------|---------|
| [`scripts/audit.js`](scripts/audit.js) | Static AST scan for missing a11y props |
| [`scripts/contrast-check.js`](scripts/contrast-check.js) | Extract and validate color contrast from JS/TS files |
