# Accessible Component Patterns — React Native / Expo

Canonical, copy-paste-ready patterns for the most common component types.

---

## Buttons & Pressables

```tsx
// Standard button
<Pressable
  onPress={onPress}
  accessibilityRole="button"
  accessibilityLabel="Save changes"
  accessibilityState={{ disabled: isSaving }}
  disabled={isSaving}
  style={({ pressed }) => [styles.button, pressed && styles.pressed]}
>
  <Text style={styles.buttonText}>Save</Text>
</Pressable>

// Icon-only button
<Pressable
  onPress={onDelete}
  accessibilityRole="button"
  accessibilityLabel="Delete item"
  accessibilityHint="Removes this item permanently"
  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
>
  <TrashIcon />
</Pressable>

// Loading button
<Pressable
  accessibilityRole="button"
  accessibilityLabel="Submit"
  accessibilityState={{ disabled: isLoading, busy: isLoading }}
  disabled={isLoading}
  onPress={onSubmit}
>
  {isLoading ? <ActivityIndicator /> : <Text>Submit</Text>}
</Pressable>
```

---

## Text Inputs & Forms

```tsx
// Text input with label (always visible label, never rely on placeholder alone)
<View>
  <Text
    nativeID="emailLabel"
    style={styles.label}
  >
    Email address
  </Text>
  <TextInput
    accessibilityLabelledBy="emailLabel"   // Android (RN ≥0.73)
    accessibilityLabel="Email address"      // iOS fallback
    accessibilityHint="Enter your account email"
    placeholder="you@example.com"
    keyboardType="email-address"
    autoComplete="email"
    textContentType="emailAddress"
    accessibilityState={{ disabled: isDisabled }}
  />
</View>

// Input with inline error
const [error, setError] = useState('');
<View>
  <Text nativeID="passwordLabel">Password</Text>
  <TextInput
    accessibilityLabel="Password"
    accessibilityErrorMessage={error}   // RN ≥0.73
    accessibilityInvalid={!!error}      // RN ≥0.73
    secureTextEntry
  />
  {error ? (
    <Text
      aria-live="polite"
      style={styles.errorText}
      accessibilityRole="alert"
    >
      {error}
    </Text>
  ) : null}
</View>
```

---

## Images & Icons

```tsx
// Meaningful image
<Image
  source={{ uri: product.imageUrl }}
  accessibilityLabel={`Product photo of ${product.name}`}
  accessibilityRole="image"
  style={styles.productImage}
/>

// Decorative image (skip in a11y tree)
<Image
  source={require('./decorative-banner.png')}
  accessible={false}
  importantForAccessibility="no"
  style={styles.banner}
/>

// Icon that carries meaning (standalone)
<View
  accessible={true}
  accessibilityLabel="Warning"
  accessibilityRole="image"
>
  <WarningIcon />
</View>

// Icon paired with text — hide icon from a11y, let text speak
<View accessible={true} accessibilityLabel="3 notifications">
  <BellIcon accessible={false} importantForAccessibility="no" />
  <Text accessible={false}>3</Text>
</View>
```

---

## FlatList & ScrollView

```tsx
// Accessible FlatList
<FlatList
  data={items}
  accessibilityRole="list"
  keyExtractor={(item) => item.id}
  renderItem={({ item, index }) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={item.title}
      accessibilityHint={`Item ${index + 1} of ${items.length}`}
      onPress={() => onSelect(item)}
    >
      <Text>{item.title}</Text>
    </Pressable>
  )}
/>

// List item with complex content — group into one focusable node
<Pressable
  accessible={true}
  accessibilityLabel={`${contact.name}, ${contact.email}, ${contact.role}`}
  accessibilityRole="button"
  onPress={() => openContact(contact)}
>
  <Avatar uri={contact.avatar} accessible={false} />
  <View>
    <Text accessible={false}>{contact.name}</Text>
    <Text accessible={false}>{contact.email}</Text>
  </View>
</Pressable>
```

---

## Navigation

```tsx
// Tab bar (expo-router or React Navigation bottom tabs)
// The library typically handles this — but if custom:
<View accessibilityRole="tablist" style={styles.tabBar}>
  {routes.map(route => (
    <Pressable
      key={route.key}
      accessibilityRole="tab"
      accessibilityLabel={route.title}
      accessibilityState={{ selected: activeRoute === route.key }}
      onPress={() => navigate(route.key)}
    >
      <route.Icon />
      <Text>{route.title}</Text>
    </Pressable>
  ))}
</View>

// Screen headers — set title so screen reader announces screen change
// In expo-router:
<Stack.Screen options={{ title: 'Product Details', headerShown: true }} />
// In React Navigation:
navigation.setOptions({ title: 'Product Details' });
```

---

## Modals & Bottom Sheets

```tsx
// Modal with focus trap (iOS)
<Modal
  visible={isVisible}
  onRequestClose={onClose}    // Required for Android back button
  accessibilityViewIsModal={true}
>
  <View accessibilityViewIsModal={true}>
    {/* Auto-focus first element on open */}
    <Text
      accessibilityRole="header"
      ref={titleRef}
    >
      Confirm deletion
    </Text>
    <Pressable accessibilityRole="button" onPress={onClose}>
      <Text>Cancel</Text>
    </Pressable>
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Delete item"
      onPress={onConfirm}
    >
      <Text>Delete</Text>
    </Pressable>
  </View>
</Modal>

// Focus first element when modal opens
useEffect(() => {
  if (isVisible && titleRef.current) {
    const handle = findNodeHandle(titleRef.current);
    if (handle) AccessibilityInfo.setAccessibilityFocus(handle);
  }
}, [isVisible]);

// Hide background content on Android
<View importantForAccessibility={isVisible ? "no-hide-descendants" : "auto"}>
  {/* screen content behind modal */}
</View>
```

---

## Switch / Toggle

```tsx
import { Switch } from 'react-native';

<View
  accessible={true}
  accessibilityLabel="Push notifications"
  accessibilityRole="switch"
  accessibilityState={{ checked: isEnabled }}
>
  <Text>Push notifications</Text>
  <Switch
    value={isEnabled}
    onValueChange={setIsEnabled}
    accessible={false}    // Parent View handles a11y
  />
</View>
```

---

## Checkbox & Radio

```tsx
// Custom checkbox (no native RN component)
const Checkbox = ({ label, checked, onChange }) => (
  <Pressable
    accessibilityRole="checkbox"
    accessibilityLabel={label}
    accessibilityState={{ checked }}
    onPress={() => onChange(!checked)}
    style={styles.row}
  >
    <View style={[styles.box, checked && styles.checked]}>
      {checked && <CheckIcon />}
    </View>
    <Text>{label}</Text>
  </Pressable>
);

// Radio group
<View accessibilityRole="radiogroup" accessibilityLabel="Shipping speed">
  {options.map(option => (
    <Pressable
      key={option.value}
      accessibilityRole="radio"
      accessibilityLabel={option.label}
      accessibilityState={{ checked: selected === option.value }}
      onPress={() => setSelected(option.value)}
    >
      <RadioDot selected={selected === option.value} />
      <Text>{option.label}</Text>
    </Pressable>
  ))}
</View>
```

---

## Accordion / Expandable Section

```tsx
const Accordion = ({ title, children }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityState={{ expanded }}
        onPress={() => setExpanded(e => !e)}
        style={styles.header}
      >
        <Text style={styles.title}>{title}</Text>
        <ChevronIcon direction={expanded ? 'up' : 'down'} accessible={false} />
      </Pressable>
      {expanded && (
        <View accessibilityRole="region" accessibilityLabel={`${title} content`}>
          {children}
        </View>
      )}
    </View>
  );
};
```

---

## Loading States

```tsx
// Inline loading indicator
<View
  accessible={true}
  accessibilityRole="progressbar"
  accessibilityLabel="Loading products"
  accessibilityValue={{ text: 'Loading, please wait' }}
  accessibilityLiveRegion="polite"
>
  <ActivityIndicator />
</View>

// Full-screen overlay
<View
  accessibilityViewIsModal={true}
  importantForAccessibility="yes"
  accessible={true}
  accessibilityLabel="Loading, please wait"
  accessibilityRole="progressbar"
>
  <ActivityIndicator size="large" />
</View>

// Skeleton screen — announce when content loads
const [isLoaded, setIsLoaded] = useState(false);
useEffect(() => {
  if (isLoaded) {
    AccessibilityInfo.announceForAccessibility('Products loaded');
  }
}, [isLoaded]);
```

---

## Toast / Snackbar

```tsx
// Announce toast via live region — no focus needed
const Toast = ({ message, visible }) => {
  if (!visible) return null;
  return (
    <View
      style={styles.toast}
      accessible={true}
      accessibilityRole="alert"
      aria-live="polite"
      accessibilityLiveRegion="polite"
    >
      <Text>{message}</Text>
    </View>
  );
};
```

---

## Carousel / Horizontal Scroll

```tsx
<ScrollView
  horizontal
  accessibilityRole="list"
  accessibilityLabel="Featured products"
  showsHorizontalScrollIndicator={true}
>
  {products.map((product, i) => (
    <Pressable
      key={product.id}
      accessibilityRole="button"
      accessibilityLabel={product.name}
      accessibilityHint={`Item ${i + 1} of ${products.length}. Double tap to view details.`}
      onPress={() => navigate(product)}
    >
      <Image
        source={{ uri: product.image }}
        accessibilityLabel={`Photo of ${product.name}`}
      />
      <Text accessible={false}>{product.name}</Text>
    </Pressable>
  ))}
</ScrollView>
```
