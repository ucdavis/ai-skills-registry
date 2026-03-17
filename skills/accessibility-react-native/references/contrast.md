# Color Contrast Reference — WCAG 2.1 AA for Mobile

## Required Ratios

| Content type | Minimum ratio | Notes |
|---|---|---|
| Normal text (< 18pt / < 14pt bold) | **4.5:1** | Most body text |
| Large text (≥ 18pt regular or ≥ 14pt bold) | **3:1** | Headlines, large labels |
| UI components (borders, icons, focus indicators) | **3:1** | Against adjacent background |
| Decorative / disabled elements | None | But consider cognitive accessibility |
| Logos | None | Per WCAG, but aim for 3:1 |

In React Native, 1pt ≈ 1sp (Android) ≈ 1pt (iOS). 18pt ≈ 24dp/sp.

---

## WCAG Contrast Formula

Contrast Ratio = (L1 + 0.05) / (L2 + 0.05)

Where L1 = lighter luminance, L2 = darker luminance.

Relative luminance of a sRGB color `(R, G, B)` where each channel is 0–1:
```
L = 0.2126 * Rlin + 0.7152 * Glin + 0.0722 * Blin
```
With linearization: `c <= 0.04045 ? c/12.92 : ((c+0.055)/1.055)^2.4`

---

## Common Failing Color Pairs (and Fixes)

### Gray text on white (very common failure)
| Color | On White | WCAG AA? | Fix |
|-------|----------|----------|-----|
| `#999999` | 2.85:1 | ❌ | Use `#767676` (4.54:1) |
| `#AAAAAA` | 2.32:1 | ❌ | Use `#767676` |
| `#767676` | 4.54:1 | ✅ | — |
| `#696969` | 5.08:1 | ✅ | — |

### Colored text on white
| Color | Ratio | WCAG AA? |
|-------|-------|----------|
| `#FF0000` (red) | 4.0:1 | ❌ (barely) |
| `#CC0000` | 5.91:1 | ✅ |
| `#0066CC` (blue link) | 4.66:1 | ✅ |
| `#FF6600` (orange) | 3.02:1 | ❌ for normal text |
| `#E65100` | 4.52:1 | ✅ |

### Dark mode common issues
- `#FFFFFF` on `#111111`: 18.1:1 ✅
- `#CCCCCC` on `#333333`: 5.74:1 ✅
- `#888888` on `#222222`: 3.54:1 — ❌ for normal text, ✅ for large text

---

## React Native Dark Mode Strategy

```tsx
import { useColorScheme } from 'react-native';

const colors = {
  light: {
    text: '#111111',          // on white: 19.6:1 ✅
    textSecondary: '#555555', // on white: 7.0:1 ✅
    placeholder: '#767676',   // on white: 4.54:1 ✅ (borderline — test carefully)
    border: '#767676',        // UI component: 4.54:1 ✅
    background: '#FFFFFF',
    surface: '#F5F5F5',
    primary: '#0056D2',       // on white: 5.9:1 ✅
    error: '#C62828',         // on white: 6.1:1 ✅
  },
  dark: {
    text: '#EEEEEE',          // on #121212: 15.6:1 ✅
    textSecondary: '#AAAAAA', // on #121212: 7.5:1 ✅
    placeholder: '#888888',   // on #121212: 4.6:1 ✅
    border: '#888888',
    background: '#121212',
    surface: '#1E1E1E',
    primary: '#6EA8FE',       // on #121212: 7.5:1 ✅
    error: '#EF9A9A',         // on #121212: 9.7:1 ✅
  },
};

export const useColors = () => {
  const scheme = useColorScheme();
  return colors[scheme ?? 'light'];
};
```

---

## High Contrast Mode

iOS has "Increase Contrast" setting. Android has "High contrast text".

```tsx
import { AccessibilityInfo } from 'react-native';

const [highContrast, setHighContrast] = useState(false);

useEffect(() => {
  // iOS only
  if (Platform.OS === 'ios') {
    AccessibilityInfo.isHighContrastEnabled?.().then(setHighContrast);
    const sub = AccessibilityInfo.addEventListener(
      'highContrastChanged',
      setHighContrast
    );
    return () => sub.remove();
  }
}, []);
```

When high contrast is enabled, increase border widths, use pure black/white where possible, and remove semi-transparent backgrounds.

---

## Checking Contrast in Code

Run `scripts/contrast-check.js` to scan your StyleSheet files. Alternatively, use these online tools:
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Colour Contrast Analyser](https://www.tpgi.com/color-contrast-checker/) (desktop app, works with device screenshots)
- [Stark](https://www.getstark.co/) (Figma plugin — check designs before implementing)

For physical device testing:
- iOS: Settings > Accessibility > Display & Text Size > "Increase Contrast"
- Android: Settings > Accessibility > "High contrast text"
- iOS Simulator: Accessibility Inspector > Settings > "Increase Contrast"
