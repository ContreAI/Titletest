# Property Avatar Map - UX Proposal

## Executive Summary

This proposal outlines the design specifications for replacing the current static home icon in the transaction list with dynamic map thumbnails showing property locations. The feature will use Mapbox Static Images API to display geocoded property addresses as visual map thumbnails, providing users with immediate geographic context for their transactions.

**Key Benefits:**
- Instant visual recognition of property locations
- Reduced cognitive load when scanning transaction lists
- Professional, modern appearance aligned with real estate industry expectations
- Leverages existing Mapbox integration (frontend) and Geoapify geocoding (backend)

---

## Backend Infrastructure (Already Implemented)

The following backend infrastructure already exists and should be leveraged:

### Existing Geocoding Service
- **Location:** `contre-ai-api/src/integrations/geocoding/`
- **Provider:** Geoapify API (configured via `GEOAPIFY_API_KEY`)
- **Services:**
  - `GeocodingService` - Main orchestration service
  - `GeoapifyService` - Geoapify API integration

### Database Schema (PostGIS Enabled)
The `transactions` table already includes:
```sql
location            geography(POINT, 4326)  -- PostGIS geography point
geocoding_status    TEXT DEFAULT 'pending'  -- 'pending', 'processing', 'success', 'failed', 'manual'
geocoding_source    TEXT                    -- 'geoapify', 'tiger', 'google', 'manual', 'property_link'
geocoding_confidence NUMERIC(4,3)           -- 0.000 to 1.000
geocoded_at         TIMESTAMPTZ             -- When geocoding completed
```

### Existing RPC Functions
- `update_transaction_location(p_transaction_id, p_lat, p_lng, p_source, p_confidence)` - Updates location
- `find_transactions_within_radius(p_lat, p_lng, p_radius_miles, p_user_id, p_limit)` - Proximity search

### Geocoding Status Flow
```
Transaction Created → geocoding_status = 'pending'
                    ↓
Background Job Runs → geocoding_status = 'processing'
                    ↓
Success → geocoding_status = 'success', location = POINT(lng, lat)
   OR
Failed  → geocoding_status = 'failed'
```

---

## 1. Design Specifications

### 1.1 Avatar Dimensions

| Size Variant | Dimensions | Use Case | Retina Image |
|--------------|------------|----------|--------------|
| Small | 40x40px | Compact list views | 80x80px |
| Medium (Recommended) | 48x48px | Default transaction list | 96x96px |
| Large | 56x56px | Expanded/detail views | 112x112px |

**Recommendation:** Increase from current 40x40px to **48x48px** for improved map legibility while maintaining compact list density.

### 1.2 Visual Styling

```
Border Radius: 8px (matches theme cardBorderRadius: 2)
Border: 1px solid rgba(0,0,0,0.08) in light mode
        1px solid rgba(255,255,255,0.08) in dark mode
Overflow: hidden (clip map to rounded corners)
```

### 1.3 Map Zoom Level

| Zoom Level | Context Shown | Recommendation |
|------------|---------------|----------------|
| 14 | Neighborhood (~1km) | Too far |
| 15 | Several blocks | Good for context |
| **16** | Street level | **Recommended** |
| 17 | Building level | Too close |

**Recommendation:** Use **zoom level 16** for optimal balance between property location precision and surrounding context.

### 1.4 Map Style

Use existing Themewagon styles for consistency with the interactive Mapbox component:

```
Light Mode: mapbox://styles/themewagon/clj57pads001701qo25756jtw
Dark Mode:  mapbox://styles/themewagon/cljzg9juf007x01pk1bepfgew
```

These styles are already integrated and will automatically switch with the app's theme mode.

### 1.5 Marker Display

**Option A: No Marker (Recommended)**
- Cleaner appearance at small sizes
- Map center IS the property location
- Reduces visual clutter

**Option B: Small Pin Marker**
- Use Mapbox pin-s (small pin) if needed
- Color: Primary brand color (#1976d2)
- Format: `pin-s+1976d2(lng,lat)`

---

## 2. Visual States

### 2.1 Loading State

```
Display: MUI Skeleton component
Variant: circular (to match avatar shape)
Animation: pulse (default MUI animation)
Duration: Until geocoding + image load complete
```

**Visual Description:**
- 48x48px circular skeleton with subtle pulse animation
- Background: theme.palette.action.hover
- Border radius: 8px

### 2.2 Success State

```
Display: Static map image from Mapbox API
Size: 96x96px (@2x for retina)
Rendered: 48x48px
Border: Subtle 1px border for definition
```

**Visual Description:**
- Crisp map thumbnail showing street-level view
- Property location centered in frame
- Rounded corners matching design system

### 2.3 Error/Fallback States

**Geocoding Failed:**
- Display: Home icon (current implementation)
- Tooltip: "Map unavailable for this address"
- Icon: `material-symbols:home-outline-rounded`

**Image Load Failed:**
- Display: Address initials in colored circle
- Example: "123 Main St" -> "123"
- Background: theme.palette.grey[200]

**No Address Provided:**
- Display: Generic location icon
- Icon: `material-symbols:location-on-outline`

### 2.4 Hover State

```css
transition: box-shadow 150ms ease-in-out, transform 150ms ease-in-out;
box-shadow: 0 4px 12px rgba(0,0,0,0.15);
transform: scale(1.02);
cursor: pointer;
```

---

## 3. Interaction Patterns

### 3.1 Click Behavior

**Recommended: Hybrid Approach**

1. **Single Click** -> Opens modal with larger interactive map
2. **Modal Actions:**
   - View larger map (300x200px minimum)
   - "Open in Google Maps" button
   - "Copy Address" button
   - Close button (X) and click-outside-to-close

**Rationale:** Keeps users in-app while providing escape hatch to full mapping tools.

### 3.2 Hover Preview (Optional Enhancement)

```
Trigger: Mouse hover for 400ms
Display: Tooltip with larger map preview (200x150px)
Position: Right of avatar, centered vertically
Dismiss: Mouse leave or click
```

**Implementation Note:** Consider as Phase 2 enhancement due to additional complexity.

### 3.3 Mobile Behavior

```
Tap: Opens modal (same as desktop click)
Long Press: Not recommended (conflicts with list selection)
Swipe: Standard list behavior unchanged
```

---

## 4. Technical Recommendations

### 4.1 Static Images API Usage

**Frontend: Mapbox Static Images API**

The frontend already has Mapbox configured (`VITE_MAPBOX_ACCESS_TOKEN`). Use Mapbox Static Images API for thumbnails.

**URL Construction:**
```
https://api.mapbox.com/styles/v1/themewagon/{style_id}/static/{lng},{lat},{zoom}/{width}x{height}@2x?access_token={token}
```

**Example:**
```
https://api.mapbox.com/styles/v1/themewagon/clj57pads001701qo25756jtw/static/-122.4194,37.7749,16/96x96@2x?access_token=pk.xxx
```

### 4.2 Geocoding Strategy (Backend Already Implemented)

**Existing Flow - No Changes Needed:**

1. Transaction created with address fields (`property_address`, `city`, `state`, `zip_code`)
2. `geocoding_status` defaults to `'pending'`
3. Background batch job calls `GeocodingService.geocodeTransaction()`
4. Geoapify API returns coordinates + confidence score
5. `update_transaction_location` RPC stores PostGIS POINT in `location` column
6. `geocoding_status` updated to `'success'` or `'failed'`

**Frontend Integration:**

The frontend needs to:
1. Fetch `location` coordinates from transaction API response
2. Extract lat/lng from PostGIS geography point
3. Generate Mapbox Static Image URL client-side
4. Display based on `geocoding_status`:
   - `'pending'` / `'processing'` → Loading skeleton
   - `'success'` → Map thumbnail
   - `'failed'` → Fallback icon

**API Response Enhancement Needed:**

The transaction API should return lat/lng extracted from the PostGIS `location` column:
```typescript
interface TransactionResponse {
  // ... existing fields
  geocodingStatus: 'pending' | 'processing' | 'success' | 'failed' | 'manual';
  geocodingConfidence?: number;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}
```

### 4.3 Caching Strategy

**Image Caching:**
- Browser will cache static map images automatically (Mapbox sets Cache-Control)
- Images are deterministic based on coordinates - same URL = same image
- Consider service worker for offline support

**Coordinate Caching:**
- Already stored in database (`location` column)
- Coordinates returned with transaction data - no separate fetch needed
- TTL: Indefinite (addresses don't move)

### 4.4 Lazy Loading

```typescript
// Use Intersection Observer for list virtualization
loading="lazy"
decoding="async"
```

**Implementation:**
- Only load images for visible list items
- Preload 2-3 items above/below viewport
- Show skeleton until image enters viewport

### 4.5 Map Tile Provider Options (Per Backend Task)

The backend task evaluates multiple providers. Frontend should be provider-agnostic:

| Provider | Pros | Cons | Cost |
|----------|------|------|------|
| **Mapbox Static** | Already integrated, high quality | Rate limits | Free tier: 100k/mo |
| **Geoapify Static** | Consistent with geocoding | Different styling | Free tier: 3k/day |
| **Google Static** | Most accurate | Expensive, requires API key | $2/1000 requests |

**Recommendation:** Use Mapbox (already configured) for Phase 1. Abstract provider for future flexibility.

---

## 5. Accessibility Requirements

### 5.1 Alt Text

```html
<img
  alt="Map showing property location at 123 Main Street, San Francisco, CA"
  ...
/>
```

**Format:** `Map showing property location at {streetAddress}, {city}, {state}`

### 5.2 ARIA Labels

```html
<button
  aria-label="View map for 123 Main Street property"
  role="button"
>
  <img ... />
</button>
```

### 5.3 Keyboard Navigation

| Key | Action |
|-----|--------|
| Tab | Focus avatar |
| Enter/Space | Open map modal |
| Escape | Close modal |

### 5.4 Focus Indicator

```css
&:focus-visible {
  outline: 2px solid theme.palette.primary.main;
  outline-offset: 2px;
}
```

### 5.5 Screen Reader Announcements

- On focus: "Property location map for [address]. Press Enter to view larger map."
- On modal open: "Map dialog opened. Press Escape to close."
- On error: "Map unavailable for this property."

### 5.6 Motion Preferences

```css
@media (prefers-reduced-motion: reduce) {
  .property-avatar {
    transition: none;
  }
  .skeleton {
    animation: none;
  }
}
```

---

## 6. Performance Considerations

### 6.1 Static vs Dynamic Maps

| Approach | Pros | Cons |
|----------|------|------|
| **Static Images (Recommended)** | Fast load, low bandwidth, cacheable | No interactivity |
| Dynamic Maps | Interactive, zoomable | Heavy, slow, complex |

**Decision:** Use static images for thumbnails. Modal can show interactive map if needed.

### 6.2 Image Optimization

```
Format: PNG (Mapbox default)
Size: 96x96px for 48px display (@2x)
Compression: Handled by Mapbox API
Average file size: ~15-25KB per image
```

### 6.3 Network Considerations

- **Fast 3G+:** Load all visible images immediately
- **Slow 2G:** Show skeletons, load on scroll stop
- **Offline:** Show fallback icons, queue for later

### 6.4 List Performance

```typescript
// Virtualization compatibility
// Use react-window or react-virtualized for 50+ items
// Each row height: fixed (e.g., 72px)
// Image load: triggered by Intersection Observer
```

---

## 7. Component Specifications

### 7.1 Props Interface

```typescript
import { SxProps, Theme } from '@mui/material';

/** Geocoding status from backend */
type GeocodingStatus = 'pending' | 'processing' | 'success' | 'failed' | 'manual';

interface PropertyMapAvatarProps {
  /** Property address for alt text and fallback display */
  address: {
    streetAddress: string;
    city: string;
    state: string;
    zipCode?: string;
  };

  /** Pre-geocoded coordinates from backend (from PostGIS location column) */
  coordinates?: {
    latitude: number;
    longitude: number;
  };

  /** Current geocoding status from backend */
  geocodingStatus?: GeocodingStatus;

  /** Geocoding confidence score (0-1) for potential quality indicators */
  geocodingConfidence?: number;

  /** Avatar size variant */
  size?: 'small' | 'medium' | 'large';

  /** Show pin marker on map */
  showMarker?: boolean;

  /** Click handler - opens map modal */
  onClick?: () => void;

  /** Error callback for image load failures */
  onError?: (error: Error) => void;

  /** Custom fallback content */
  fallbackIcon?: React.ReactNode;

  /** MUI sx prop for styling */
  sx?: SxProps<Theme>;
}
```

### 7.2 Usage Example (Aligned with Backend)

```tsx
// In DealRow.tsx or transaction list component
// Transaction data comes from API with coordinates extracted from PostGIS

<PropertyMapAvatar
  address={{
    streetAddress: transaction.propertyAddress,
    city: transaction.city,
    state: transaction.state,
    zipCode: transaction.zipCode,
  }}
  coordinates={transaction.coordinates}  // { latitude, longitude } from API
  geocodingStatus={transaction.geocodingStatus}
  geocodingConfidence={transaction.geocodingConfidence}
  size="medium"
  onClick={() => openMapModal(transaction)}
/>
```

### 7.3 Hook: useStaticMapUrl

```typescript
import { useThemeMode } from 'hooks/useThemeMode';

interface UseStaticMapUrlOptions {
  latitude: number;
  longitude: number;
  width?: number;
  height?: number;
  zoom?: number;
  retina?: boolean;
  marker?: boolean;
}

const MAPBOX_STYLES = {
  light: 'clj57pads001701qo25756jtw',
  dark: 'cljzg9juf007x01pk1bepfgew',
};

export function useStaticMapUrl(options: UseStaticMapUrlOptions | null): string | null {
  const { mode } = useThemeMode();

  if (!options) return null;

  const {
    latitude,
    longitude,
    width = 96,
    height = 96,
    zoom = 16,
    retina = true,
    marker = false,
  } = options;

  const accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
  if (!accessToken) return null;

  const styleId = MAPBOX_STYLES[mode === 'dark' ? 'dark' : 'light'];
  const retinaFlag = retina ? '@2x' : '';
  const markerOverlay = marker ? `pin-s+1976d2(${longitude},${latitude})/` : '';

  return `https://api.mapbox.com/styles/v1/themewagon/${styleId}/static/${markerOverlay}${longitude},${latitude},${zoom}/${width}x${height}${retinaFlag}?access_token=${accessToken}`;
}
```

### 7.4 File Structure

```
src/
  components/
    property/
      PropertyMapAvatar/
        PropertyMapAvatar.tsx       # Main component
        PropertyMapAvatar.types.ts  # TypeScript interfaces
        PropertyMapAvatar.test.tsx  # Unit tests
        useStaticMapUrl.ts          # URL builder hook
        index.ts                    # Barrel export
      PropertyMapModal/
        PropertyMapModal.tsx        # Full-size map modal (Phase 3)
        index.ts
```

### 7.5 State Management

The component is stateless - all data comes from props (backend response):

```typescript
// Component renders based on geocodingStatus prop:
switch (geocodingStatus) {
  case 'pending':
  case 'processing':
    return <Skeleton variant="rounded" width={size} height={size} />;

  case 'success':
    return <MapImage src={staticMapUrl} />;

  case 'failed':
  case undefined:
  default:
    return <FallbackIcon />;
}
```

---

## 8. Implementation Phases

### Phase 1: Frontend Component (Current Priority)
- [ ] `PropertyMapAvatar` component with MUI styling
- [ ] `useStaticMapUrl` hook for Mapbox Static Images
- [ ] Loading state (MUI Skeleton) for `pending`/`processing` status
- [ ] Error fallback (home icon) for `failed` status
- [ ] Success state with lazy-loaded map image
- [ ] Integration with `DealRow.tsx`

### Phase 2: API Integration
- [x] ~~Database schema with PostGIS location column~~ (Already done)
- [x] ~~GeocodingService with Geoapify integration~~ (Already done)
- [x] ~~Background batch geocoding job~~ (Already done)
- [ ] Update transaction API response to include extracted lat/lng from PostGIS
- [ ] Add `coordinates` field to frontend Transaction type
- [ ] Update `useTransactionDeals` hook to pass coordinates to Deal

### Phase 3: Enhanced Interactions
- [ ] `PropertyMapModal` component with interactive Mapbox
- [ ] "Open in Google Maps" external link
- [ ] "Copy Address" functionality
- [ ] Hover preview tooltip (optional)

### Phase 4: Optimization & Polish
- [ ] IntersectionObserver for lazy loading in list
- [ ] Service worker caching for map tiles
- [ ] Performance monitoring (image load times)
- [ ] Low-confidence indicator (if geocodingConfidence < 0.7)

### Backend Task Dependencies
The following items are tracked in the separate backend task:
- Map tile caching strategy (CDN vs database)
- Static map endpoint (if server-side tile generation needed)
- Provider evaluation (Mapbox vs Geoapify vs Google)

---

## 9. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Image load time | < 500ms | Performance monitoring |
| Geocoding success rate | > 95% | API analytics |
| User engagement | +20% clicks on property | Click tracking |
| Accessibility score | 100% | axe-core audit |

---

## Appendix A: API Reference

### Mapbox Static Images API (Frontend)
```
GET https://api.mapbox.com/styles/v1/{username}/{style_id}/static/{overlay}/{lon},{lat},{zoom},{bearing},{pitch}/{width}x{height}{@2x}?access_token={token}
```

**Themewagon Style IDs:**
- Light: `clj57pads001701qo25756jtw`
- Dark: `cljzg9juf007x01pk1bepfgew`

### Geoapify Geocoding API (Backend - Already Integrated)
```
GET https://api.geoapify.com/v1/geocode/search?text={address}&apiKey={key}&format=json&limit=1
```

**Response includes:**
- `lat`, `lon` - Coordinates
- `rank.confidence` - Confidence score (0-1)
- `formatted` - Standardized address string

---

## Appendix B: Backend Code Reference

### Key Files
| File | Purpose |
|------|---------|
| `contre-ai-api/src/integrations/geocoding/geocoding.service.ts` | Main geocoding orchestration |
| `contre-ai-api/src/integrations/geocoding/services/geoapify.service.ts` | Geoapify API client |
| `contre-ai-core/supabase/migrations/20260119000010_enable_postgis_geolocation.sql` | PostGIS schema |

### Database Functions
```sql
-- Update transaction location (called by GeocodingService)
update_transaction_location(p_transaction_id, p_lat, p_lng, p_source, p_confidence)

-- Find nearby transactions (for future proximity features)
find_transactions_within_radius(p_lat, p_lng, p_radius_miles, p_user_id, p_limit)
```

### Environment Variables
| Variable | Service | Purpose |
|----------|---------|---------|
| `VITE_MAPBOX_ACCESS_TOKEN` | Frontend | Mapbox Static Images API |
| `GEOAPIFY_API_KEY` | Backend | Geocoding API |

---

## Appendix C: Related Tasks

- **Backend Task:** [Backend] Property Map Tile Service Design
  - Status: In Review
  - Covers: Provider evaluation, caching strategy, API endpoint design

---

*Document Version: 1.1*
*Last Updated: 2026-01-23*
*Author: UX Research Team*
*Aligned with: Backend geocoding infrastructure (PostGIS + Geoapify)*
