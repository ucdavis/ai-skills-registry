---
name: assistant-ucd-mobile
description: Coding standards, component defaults, and best practices for the UCD Mobile app (Expo, React Native, NativeWind, Expo Router).
---

# UCD Mobile — Coding Assistant Skill

Authoritative reference for building features in this project. Apply these rules whenever writing or reviewing code in `apps/mobile/`.

---

## Stack at a Glance

| Concern | Tool |
|---|---|
| Framework | Expo (managed) + React Native 0.81 |
| Language | TypeScript (strict) |
| Navigation | Expo Router (file-based) |
| Styling | NativeWind 4 (Tailwind) + `StyleSheet` (hybrid) |
| Server state | TanStack Query v5 |
| Global state | React Context |
| Local persistence | Drizzle ORM + `expo-sqlite` |
| Auth | Azure AD via `expo-auth-session` |
| Icons | `@hugeicons/react-native` |
| Lists | `@shopify/flash-list` |
| Bottom sheets | `@gorhom/bottom-sheet` |
| Validation | Zod |

Import alias: use `~/` for `src/` — e.g. `import { AGGIE_BLUE } from '~/constants/colors'`.

---

## 1. Project Structure

```
src/
├── app/              # Expo Router screens (file = route)
├── components/
│   ├── shared/       # Generic, reusable UI atoms
│   └── features/     # Feature-scoped components
├── constants/        # Colors, API endpoints, config
├── contexts/         # React Context providers + hooks
├── db/               # Drizzle schema
├── hooks/            # Custom hooks (data + UI logic)
├── services/         # API calls, DB operations, business logic
├── types/            # TypeScript types + Zod schemas
└── utils/            # Pure utility functions
```

**Rules:**
- Screens live only in `app/`. Do not put business logic in screen files — extract to hooks or services.
- Shared components must be generic; feature components may depend on feature context/data.
- Keep `services/` pure (no JSX, no hooks). They return data or throw.
- `types/zod/` holds runtime validation schemas; `types/*.ts` holds static TypeScript-only types.

---

## 2. Component Defaults

Every component must be typed and follow this template:

```tsx
import { View, Pressable, Text } from 'react-native';
import type { ComponentProps } from 'react';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
} & Pick<ComponentProps<typeof Pressable>, 'testID'>;

export function ActionButton({ label, onPress, disabled = false, testID }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      testID={testID}
      accessible
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      hitSlop={8}
      className="h-11 min-w-11 items-center justify-center rounded-lg bg-aggie-blue px-4 active:opacity-70"
    >
      <Text className="text-base font-semibold text-white">{label}</Text>
    </Pressable>
  );
}
```

**Mandatory defaults on every component:**

| Default | Reason |
|---|---|
| `accessible` on interactive containers | Screen reader groups children |
| `accessibilityRole` | Tells VoiceOver/TalkBack what the element is |
| `accessibilityLabel` | Human-readable name for the element |
| `hitSlop={8}` on small targets | Ensures ≥44 pt tap area per Apple HIG |
| `disabled` prop with `accessibilityState={{ disabled }}` | State reflected to assistive tech |
| `active:opacity-70` on pressables | Visible press feedback, both platforms |

---

## 3. Styling Rules

### Use NativeWind (`className`) for:
- Layout, spacing, sizing, flex
- Static colors from the theme palette
- Typography (`text-sm`, `font-bold`, etc.)
- Border radius, shadows via preset classes

### Use `StyleSheet.create()` for:
- Platform-specific shadows (iOS `shadowColor` vs Android `elevation`)
- Complex absolute positioning
- Animation-driven dynamic styles
- Performance-critical list-item styles

### Use inline `style` prop for:
- Values computed at runtime (e.g., from props or layout measurements)
- Combined with `className`: `<View className="flex-1" style={{ backgroundColor: brandColor }}>`

### Theme colors (always use these — never raw hex in JSX):

```ts
// tailwind.config.js theme extension — use as className
'aggie-blue'    // #022851  — primary brand, headers, key actions
'ucd-blue'      // #5D94FA  — active states, links, tab icons
'sub-blue'      // #AAB3BC  — secondary text, muted elements
'ui-grey'       // #F5F5F5  — screen backgrounds
'light-grey'    // #F8F8F8  — card backgrounds
```

When a color is needed in a `StyleSheet` or dynamic context, import from `~/constants/colors`.

### Platform-specific shadows (standard card style):

```ts
const cardShadow = StyleSheet.create({
  shadow: {
    // iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    // Android
    elevation: 3,
    backgroundColor: '#fff', // elevation requires a background color on Android
  },
});
```

---

## 4. Pressable vs TouchableOpacity

**Always use `Pressable`** — `TouchableOpacity` is legacy.

```tsx
// Correct
<Pressable
  onPress={fn}
  className="active:opacity-70"
  hitSlop={8}
  accessible
  accessibilityRole="button"
  accessibilityLabel="Open settings"
>
  ...
</Pressable>

// Wrong — do not use
<TouchableOpacity onPress={fn}>...</TouchableOpacity>
```

For icon-only buttons, always pair with an `accessibilityLabel` (the icon itself conveys no meaning to screen readers):

```tsx
<Pressable
  onPress={goBack}
  hitSlop={12}
  accessible
  accessibilityRole="button"
  accessibilityLabel="Go back"
  className="p-2"
>
  <HugeiconsIcon icon={ArrowLeft01Icon} size={24} color={AGGIE_BLUE} />
</Pressable>
```

---

## 5. Text & Typography

Use the shared text components from `~/components/shared/text/` — never raw `<Text>` for content:

| Component | When to use |
|---|---|
| `<HeadingText>` | Screen or section titles |
| `<SubHeadingText>` | Section subtitles, card titles |
| `<CaptionText>` | Labels, metadata, helper text |

When you must use raw `<Text>`, apply `allowFontScaling` explicitly if the size is constrained:

```tsx
// Fixed-size UI (e.g., tab bar label) — opt out of scaling
<Text allowFontScaling={false} className="text-xs">TAB</Text>

// Content text — always allow scaling (default is true, but be explicit)
<Text allowFontScaling className="text-base">Body content</Text>
```

---

## 6. Lists

**Always use `FlashList`** from `@shopify/flash-list`, not `FlatList` or `ScrollView` for data lists.

```tsx
import { FlashList } from '@shopify/flash-list';

<FlashList
  data={items}
  renderItem={({ item }) => <ItemRow item={item} />}
  estimatedItemSize={72}        // Required — measure your row height
  keyExtractor={(item) => item.id}
  contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
  ListEmptyComponent={<EmptyState />}
/>
```

Inside bottom sheets, use `BottomSheetFlatList` or `BottomSheetScrollView` from `@gorhom/bottom-sheet`.

---

## 7. Navigation (Expo Router)

File-based routing — the file path is the route. Never use `navigation.navigate()` — use the typed router:

```tsx
import { router } from 'expo-router';
import { Link } from 'expo-router';

// Programmatic
router.push('/Maps/Library/room-123/book');
router.back();

// Declarative
<Link href="/More" asChild>
  <Pressable ...>...</Pressable>
</Link>
```

**Screen layout template:**

```tsx
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';

export default function MyScreen() {
  const insets = useSafeAreaInsets();

  return (
    <>
      <Stack.Screen options={{ title: 'Screen Title', headerShown: true }} />
      <View
        className="flex-1 bg-ui-grey"
        style={{ paddingBottom: insets.bottom }}
      >
        {/* content */}
      </View>
    </>
  );
}
```

- Always apply `useSafeAreaInsets()` for bottom padding on scrollable screens.
- Set `Stack.Screen` options inline — do not hard-code navigation headers in the layout file.

---

## 8. Data Fetching (React Query)

Use `useQuery` / `useMutation` from TanStack Query for all API calls:

```tsx
import { useQuery } from '@tanstack/react-query';
import { fetchLibraryRooms } from '~/services/library';

export function useLibraryRooms() {
  return useQuery({
    queryKey: ['library', 'rooms'],
    queryFn: fetchLibraryRooms,
    staleTime: 5 * 60 * 1000,   // 5 min — adjust per data freshness needs
    retry: 2,
  });
}
```

**Rules:**
- All `queryFn` calls go through `~/services/` — never inline `fetch()` in components.
- Define query keys as arrays. Co-locate the hook with the feature it serves (`~/hooks/` or `~/hooks/<Feature>/`).
- Use `useIsFocused()` to gate expensive queries to active screens:

```tsx
const isFocused = useIsFocused();
const { data } = useQuery({ ..., enabled: isFocused });
```

---

## 9. Context Pattern

All Context providers follow this shape — always throw if hook is used outside provider:

```tsx
type MyContextType = {
  value: string;
  setValue: (v: string) => void;
};

const MyContext = createContext<MyContextType | null>(null);

export function MyProvider({ children }: { children: React.ReactNode }) {
  const [value, setValue] = useState('');
  return (
    <MyContext.Provider value={{ value, setValue }}>
      {children}
    </MyContext.Provider>
  );
}

export function useMyContext(): MyContextType {
  const ctx = useContext(MyContext);
  if (!ctx) throw new Error('useMyContext must be used within MyProvider');
  return ctx;
}
```

Add new providers to `app/_layout.tsx` — never nest providers inside feature screens.

---

## 10. Platform Defaults (iOS vs Android)

Use `Platform.select()` for values that must differ, not `Platform.OS === 'ios'` ternaries scattered across JSX:

```tsx
import { Platform } from 'react-native';

const hitSlop = Platform.select({ ios: 8, android: 12, default: 8 });

const headerStyle = Platform.select({
  ios: { shadowOpacity: 0.1, shadowRadius: 4 },
  android: { elevation: 4 },
  default: {},
});
```

**Standard platform defaults to always apply:**

| Property | iOS | Android |
|---|---|---|
| Shadow | `shadowColor/Offset/Opacity/Radius` | `elevation` + `backgroundColor` |
| Status bar style | `<StatusBar style="dark" />` | `<StatusBar backgroundColor="transparent" translucent />` |
| Keyboard avoid | `KeyboardAvoidingView behavior="padding"` | `behavior="height"` |
| Font rendering | System font (SF Pro) via `fontFamily: undefined` | Roboto via `fontFamily: undefined` |
| Tap feedback | `Pressable` active opacity | `Pressable` + optional `android_ripple` |
| Bottom safe area | `insets.bottom` from `useSafeAreaInsets` | Same |

**Ripple effect on Android (add to card/list-item Pressables):**

```tsx
<Pressable
  android_ripple={{ color: 'rgba(0,0,0,0.08)', borderless: false }}
  className="active:opacity-90"
  ...
>
```

**KeyboardAvoidingView template:**

```tsx
import { KeyboardAvoidingView, Platform } from 'react-native';

<KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  className="flex-1"
>
  {/* form content */}
</KeyboardAvoidingView>
```

---

## 11. Accessibility Defaults

Every screen and interactive component must meet these minimums:

```
Tap targets     ≥ 44×44 pts  (use hitSlop to pad small icons)
Color contrast  ≥ 4.5:1 text, ≥ 3:1 UI components
Focus order     logical top-to-bottom, left-to-right
```

**Required props checklist for interactive elements:**

```tsx
accessible                              // groups children for screen reader
accessibilityRole="button|link|header|image|none|..."
accessibilityLabel="Descriptive name"   // required if no visible text
accessibilityHint="What happens"        // optional but recommended for ambiguous actions
accessibilityState={{ disabled, selected, checked, expanded, busy }}
```

**For images:**

```tsx
// Decorative — hide from screen readers
<Image accessible={false} ... />

// Meaningful
<Image
  accessible
  accessibilityRole="image"
  accessibilityLabel="Campus map showing Shields Library"
  ...
/>
```

**For loading states:**

```tsx
<ActivityIndicator
  accessible
  accessibilityRole="progressbar"
  accessibilityLabel="Loading bus routes"
/>
```

See `.claude/skills/accessibility-react-native/SKILL.md` for full a11y audit workflow.

---

## 12. TypeScript Conventions

- **Strict mode is on.** No `any`, no `@ts-ignore` without a comment explaining why.
- Prefer `type` over `interface` for props and data shapes.
- Use Zod schemas in `~/types/zod/` for all data crossing API boundaries. Parse, don't cast:

```ts
// Correct
const data = MySchema.parse(rawApiResponse);

// Wrong
const data = rawApiResponse as MyType;
```

- Export component props types named `<ComponentName>Props`.
- Use `ComponentProps<typeof X>` to extend native component props:

```ts
type ButtonProps = {
  label: string;
} & Pick<ComponentProps<typeof Pressable>, 'onPress' | 'disabled' | 'testID'>;
```

---

## 13. File Naming & Export Conventions

| Thing | Convention | Example |
|---|---|---|
| Components | PascalCase file, named export | `BackButton.tsx` → `export function BackButton` |
| Screens | PascalCase file (Expo Router) | `app/Maps/index.tsx` |
| Hooks | camelCase, `use` prefix | `useLibraryRooms.ts` |
| Services | camelCase | `library.ts` |
| Constants | camelCase file, UPPER_SNAKE values | `colors.ts` → `AGGIE_BLUE` |
| Types | PascalCase for types/interfaces | `MapTypes.ts` |
| Zod schemas | camelCase + `Schema` suffix | `libraryRoomSchema` |

- **No default exports for components** — named exports only (improves refactor safety and tree-shaking).
- Default exports are only used for Expo Router screen files (required by the framework).

---

## 14. Performance Guidelines

- Use `useCallback` for event handlers passed as props to child components.
- Use `useMemo` only when the computation is genuinely expensive — not as a default.
- Avoid anonymous functions in `renderItem` — define the renderer outside the JSX tree.
- Use `React.memo` on list item components.
- Provide `estimatedItemSize` on every `FlashList`.
- Avoid `useEffect` for derived state — compute inline or with `useMemo`.
- Prefer `InteractionManager.runAfterInteractions()` for heavy work triggered by navigation.

---

## 15. Bottom Sheets

All bottom sheets use `@gorhom/bottom-sheet`. Standard setup:

```tsx
import BottomSheet, { BottomSheetView, BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { useRef, useMemo } from 'react';

export function MySheet() {
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['40%', '85%'], []);

  return (
    <BottomSheet
      ref={sheetRef}
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose
      backgroundStyle={{ borderRadius: 16 }}
      handleIndicatorStyle={{ backgroundColor: '#ccc', width: 40 }}
    >
      <BottomSheetView className="flex-1 px-4">
        {/* content */}
      </BottomSheetView>
    </BottomSheet>
  );
}
```

- Always use `BottomSheetFlatList` / `BottomSheetScrollView` inside sheets — never `FlatList` or `ScrollView`.
- Wrap the root layout in `<BottomSheetModalProvider>` (already done in `app/_layout.tsx`).

---

## 16. Icons

Use `@hugeicons/react-native` exclusively:

```tsx
import { HugeiconsIcon } from '@hugeicons/react-native';
import { SearchIcon } from '@hugeicons/core-free-icons';

<HugeiconsIcon
  icon={SearchIcon}
  size={24}         // Default: 24. Use 20 for dense UI, 28 for prominent actions
  color={AGGIE_BLUE}
  strokeWidth={1.5} // Default stroke — do not change without design approval
/>
```

- Never import SVGs directly; always go through `HugeiconsIcon`.
- Always pair icon-only buttons with `accessibilityLabel`.

---

## 17. Data Propagation & Error Handling

The app has four strict layers: **DB → Service → API → UI**. Each layer has its own result container. Never mix them.

```
DB  (Drizzle)  →  DbResult<T>
API            →  ApiResponse<T>
Service        →  ServiceResult<T>
UI             →  consumes ServiceResult<T> only
```

### Result Containers

```ts
// DB layer — wraps Drizzle query results
class DbResult<T> {
  static success<T>(data?: T): DbResult<T>
  static error(error: string, errorCode?: number): DbResult<any>

  constructor(
    public success: boolean,
    public data?: T,
    public error?: string,
    public errorCode?: number,
  ) {}
}

// API layer — wraps fetch/HTTP results
class ApiResponse<T> {
  static success<T>(statusCode: number, data?: T, message?: string): ApiResponse<T>
  static error(statusCode: number, error: string, message?: string): ApiResponse<any>

  constructor(
    public success: boolean,
    public data?: T,
    public error?: string,
    public message: string = '',
    public statusCode?: number,
  ) {}
}

// Service layer — what UI consumes
class ServiceResult<T> {
  static success<T>(data?: T): ServiceResult<T>
  static successFrom<T>(dbResult: DbResult<T>): ServiceResult<T>
  static error(error: string, errorCode?: number): ServiceResult<any>
  static errorFrom<T>(dbResult: DbResult<T>): ServiceResult<T>

  constructor(
    public success: boolean,
    public data?: T,
    public error?: string,
    public errorCode?: number,
  ) {}
}
```

### Layer Responsibilities

**DB Layer** (`~/services/db/`)
- Accesses SQLite through Drizzle ORM only.
- Returns only `DbResult<T>`.
- Catches all SQL exceptions locally — nothing bubbles up.

```ts
export async function getUser(id: string): Promise<DbResult<User>> {
  try {
    const user = await db.query.users.findFirst({ where: eq(users.id, id) });
    if (!user) return DbResult.error('User not found', 404);
    return DbResult.success(user);
  } catch (e: unknown) {
    return DbResult.error((e as Error)?.message ?? 'SQLite error', 500);
  }
}
```

**API Layer** (`~/services/`)
- Makes network requests only.
- Returns only `ApiResponse<T>`.
- Wraps `fetch` exceptions into standardized error responses.

```ts
export async function fetchUserFromApi(id: string): Promise<ApiResponse<User>> {
  try {
    const res = await fetch(`${API_BASE}/users/${id}`);
    const json = await res.json();
    if (!res.ok) return ApiResponse.error(res.status, json.error ?? 'Request failed');
    return ApiResponse.success(res.status, json);
  } catch (e: unknown) {
    return ApiResponse.error(503, (e as Error)?.message ?? 'Network error');
  }
}
```

**Service Layer** (`~/services/`)
- Combines DB and API logic.
- Converts `DbResult` / `ApiResponse` → `ServiceResult`.
- Normalizes error codes for UI consumption.

```ts
export async function loadUserProfile(id: string): Promise<ServiceResult<User>> {
  const local = await getUser(id);
  if (local.success && local.data) return ServiceResult.successFrom(local);
  if (!local.success && local.errorCode !== 404) return ServiceResult.errorFrom(local);

  // Not in DB — fetch from API
  const remote = await fetchUserFromApi(id);
  if (!remote.success) return ServiceResult.error(remote.error!, remote.statusCode);

  await saveUser(remote.data!);
  return ServiceResult.success(remote.data);
}
```

**UI Layer** (screens and hooks)
- Consumes only `ServiceResult<T>`.
- Renders loading / success / error states based on `.success` flag.
- Never calls DB or API functions directly.

```tsx
export function ProfileScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [user, setUser] = useState<User | undefined>();
  const { id } = useLocalSearchParams<{ id: string }>();

  const load = async () => {
    setLoading(true);
    const res = await loadUserProfile(id);
    if (res.success) setUser(res.data);
    else setError(res.error);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  if (loading) return <Spinner />;
  if (error) return <ErrorView message={error} onRetry={load} />;
  if (!user) return <EmptyState title="No user" />;
  return <ProfileView user={user} />;
}
```

### Error Code → UI Behavior

| Code | UI Behavior |
|---|---|
| 200 | Success toast or silent proceed |
| 201 | Success toast or navigate to confirmation |
| 202 | Loading indicator / "Processing..." |
| 204 | Refresh UI silently |
| 400 | Inline form error or alert modal with retry |
| 401 | Redirect to login — "Session expired. Please log in again." |
| 403 | "Access denied" modal; disable restricted actions |
| 404 | "Not Found" toast; allow retry or go back |
| 408 | "Request timed out" toast with retry button |
| 409 | Explain conflict (e.g. "Already exists"); allow retry or update |
| 410 | "Resource unavailable"; navigate to safe screen |
| 422 | Validation messages inline on form inputs |
| 429 | Rate-limit warning toast; disable submit temporarily |
| 500 | Error modal/toast with retry; optionally log |
| 503 | Maintenance / "Try again later" screen |
| 504 | Timeout toast with manual retry option |

### Rules

- The UI layer **never** handles raw HTTP status codes — that logic belongs in the service layer.
- Services **always** convert before returning — no `DbResult` or `ApiResponse` escapes to UI.
- DB functions **never** throw — always return a `DbResult.error(...)`.
- API functions **never** throw — always return an `ApiResponse.error(...)`.

---

## 18. What NOT to Do

- Do not use `FlatList`, `TouchableOpacity`, `TouchableHighlight` — use `FlashList` and `Pressable`.
- Do not use `AsyncStorage` for sensitive data — use `expo-secure-store`.
- Do not inline `fetch()` in components or hooks — go through `~/services/`.
- Do not add `console.log` in committed code.
- Do not cast types with `as` to work around type errors — fix the types.
- Do not create new React Query clients — use the one in `~/services/db/connection.ts`.
- Do not wrap a screen in `SafeAreaView` if the layout already uses `useSafeAreaInsets()` — double-nesting causes incorrect padding.
- Do not use `margin` on list items to achieve spacing — use `contentContainerStyle` gap or `ItemSeparatorComponent`.
