# Accessibility Testing — React Native / Expo

## Unit Testing with @testing-library/react-native

### Setup
```bash
npx expo install @testing-library/react-native jest-expo
```

`jest.config.js`:
```js
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterFramework: ['@testing-library/react-native/extend-expect'],
};
```

### Testing A11y Props

```tsx
import { render, screen } from '@testing-library/react-native';

describe('ProductCard accessibility', () => {
  it('has accessible name and role', () => {
    render(<ProductCard name="Widget" price={9.99} />);
    const btn = screen.getByRole('button', { name: /add widget to cart/i });
    expect(btn).toBeTruthy();
  });

  it('announces disabled state', () => {
    render(<ProductCard name="Widget" price={9.99} outOfStock />);
    const btn = screen.getByRole('button', { name: /add widget to cart/i });
    expect(btn).toBeDisabled();
    // or check accessibilityState:
    expect(btn.props.accessibilityState?.disabled).toBe(true);
  });

  it('decorative images are hidden from a11y', () => {
    render(<ProductCard name="Widget" price={9.99} />);
    const img = screen.queryByRole('image', { name: /decorative/i });
    expect(img).toBeNull(); // should not be in a11y tree
  });
});
```

### Testing Live Regions

```tsx
import { act } from '@testing-library/react-native';

it('announces error message', async () => {
  const { getByText, rerender } = render(<LoginForm />);

  await act(async () => {
    fireEvent.press(getByText('Submit'));
  });

  const error = getByText('Email is required');
  expect(error.props.accessibilityLiveRegion).toBe('polite');
  // or:
  expect(error.props['aria-live']).toBe('polite');
});
```

### Testing Modal Focus Trap

```tsx
it('modal has accessibilityViewIsModal set', () => {
  const { getByTestId } = render(<ConfirmModal visible={true} />);
  const modal = getByTestId('confirm-modal-container');
  expect(modal.props.accessibilityViewIsModal).toBe(true);
});
```

### Testing Accessible Labels are Localized

```tsx
it('labels are not hardcoded English', () => {
  // Render with a different locale and verify labels change
  mockI18n.setLocale('es');
  render(<CloseButton />);
  const btn = screen.getByRole('button', { name: /cerrar/i });
  expect(btn).toBeTruthy();
});
```

---

## Snapshot Testing with A11y Data

```tsx
it('matches accessibility snapshot', () => {
  const tree = render(<ProductCard name="Widget" price={9.99} />).toJSON();
  expect(tree).toMatchSnapshot();
  // Review snapshot to verify a11y props are present and correct
});
```

---

## ESLint Configuration

`eslint-plugin-jsx-a11y` doesn't cover all RN cases, but catches common issues.

```bash
npm install --save-dev eslint-plugin-jsx-a11y
```

`.eslintrc.js`:
```js
module.exports = {
  plugins: ['jsx-a11y'],
  rules: {
    // Require accessible name on interactive elements
    'jsx-a11y/interactive-supports-focus': 'error',
    // Require label on form inputs
    'jsx-a11y/label-has-associated-control': 'warn',
    // Warn on non-descriptive link text
    'jsx-a11y/anchor-has-content': 'warn',
  },
};
```

For React Native-specific linting, also consider:
```bash
npm install --save-dev eslint-plugin-react-native-a11y
```

`.eslintrc.js` addition:
```js
{
  plugins: ['react-native-a11y'],
  extends: ['plugin:react-native-a11y/ios+android'],
}
```

---

## End-to-End Testing with Detox

Detox can simulate VoiceOver/TalkBack interactions.

```js
// e2e/accessibility.e2e.js
describe('Login screen a11y', () => {
  it('email input has visible label', async () => {
    await element(by.accessibilityLabel('Email address')).tap();
    await element(by.accessibilityLabel('Email address')).typeText('user@example.com');
  });

  it('submit button announces loading state', async () => {
    await element(by.accessibilityLabel('Submit')).tap();
    // Detox can check accessibility attributes
    await expect(element(by.accessibilityLabel('Submit'))).toHaveToggleValue(false);
  });
});
```

---

## Manual Testing Checklist

### iOS VoiceOver
1. Enable: Settings > Accessibility > VoiceOver (or triple-click side button)
2. Navigate with swipe right/left — every element should be announced in logical order
3. Double-tap to activate buttons — confirm correct action fires
4. Check modals — focus should be trapped inside
5. Check form inputs — label (not placeholder) should be read

### Android TalkBack
1. Enable: Settings > Accessibility > TalkBack
2. Swipe right to move forward, left to go back
3. Double-tap to activate
4. Check "Explore by touch" — everything tappable should be discoverable
5. Use "Reading control" (swipe up+down) to navigate by headings, links, etc.

### iOS Accessibility Inspector
1. Xcode > Open Developer Tool > Accessibility Inspector
2. Point at simulator — see all a11y properties of any element
3. Use Audit tab to run automated checks on a screen

### Automated audit flags to follow up manually:
- "Hit area too small" — add hitSlop
- "Element has no description" — add accessibilityLabel
- "Possible small hit area" — verify 44×44 minimum
