# Property Avatar Map - Frontend-Backend Integration Guide

## Overview

This document details the integration points between the frontend `PropertyMapAvatar` component and the existing backend geocoding infrastructure.

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           BACKEND (Already Exists)                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Transaction Created          Background Job              Database          │
│  ┌──────────────────┐        ┌──────────────────┐        ┌──────────────┐  │
│  │ property_address │───────▶│ GeocodingService │───────▶│ transactions │  │
│  │ city, state, zip │        │ (Geoapify API)   │        │ - location   │  │
│  │ geocoding_status │        │                  │        │ - geo_status │  │
│  │   = 'pending'    │        │                  │        │ - confidence │  │
│  └──────────────────┘        └──────────────────┘        └──────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ API Response
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (To Implement)                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  API Response              PropertyMapAvatar           Mapbox Static API    │
│  ┌──────────────────┐     ┌──────────────────┐        ┌──────────────────┐ │
│  │ coordinates: {   │────▶│ useStaticMapUrl  │───────▶│ Static Image URL │ │
│  │   lat, lng       │     │ hook             │        │ (client-side)    │ │
│  │ }                │     │                  │        │                  │ │
│  │ geocodingStatus  │     │                  │        │                  │ │
│  └──────────────────┘     └──────────────────┘        └──────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## API Response Enhancement

### Current Transaction Response
```typescript
// Current API response (needs enhancement)
interface TransactionResponse {
  id: string;
  transactionName: string;
  propertyAddress: string;
  city: string;
  state: string;
  zipCode: string;
  status: string;
  // ... other fields
}
```

### Required Enhancement
```typescript
// Enhanced API response with geocoding data
interface TransactionResponse {
  id: string;
  transactionName: string;
  propertyAddress: string;
  city: string;
  state: string;
  zipCode: string;
  status: string;

  // NEW: Geocoding data
  geocodingStatus: 'pending' | 'processing' | 'success' | 'failed' | 'manual';
  geocodingConfidence?: number;  // 0-1, from geocoding_confidence column
  geocodingSource?: string;      // 'geoapify', 'manual', etc.
  coordinates?: {
    latitude: number;   // Extracted from PostGIS location column
    longitude: number;  // Extracted from PostGIS location column
  };
}
```

### Backend SQL for Coordinate Extraction
```sql
-- In the transaction select query, extract lat/lng from PostGIS geography
SELECT
  id,
  transaction_name,
  property_address,
  city,
  state,
  zip_code,
  status,
  geocoding_status,
  geocoding_confidence,
  geocoding_source,
  -- Extract coordinates from PostGIS geography point
  ST_Y(location::geometry) as latitude,
  ST_X(location::geometry) as longitude
FROM transactions
WHERE user_id = $1;
```

---

## Frontend Type Updates

### File: `src/modules/transactions/typings/transactions.types.ts`

```typescript
// Add geocoding types
export type GeocodingStatus = 'pending' | 'processing' | 'success' | 'failed' | 'manual';
export type GeocodingSource = 'geoapify' | 'tiger' | 'google' | 'manual' | 'property_link';

export interface GeocodingData {
  status: GeocodingStatus;
  confidence?: number;
  source?: GeocodingSource;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

// Update Transaction interface
export interface Transaction extends TransactionFormData {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: TransactionStatus;
  createdBy: string;

  // NEW: Geocoding data
  geocoding?: GeocodingData;
}
```

### File: `src/types/deals.ts`

```typescript
// Update Deal interface
export interface Deal {
  id: string;
  title: string;
  price: number;
  closingDate: string;
  stages: DealStage[];

  // NEW: For map avatar
  propertyAddress?: {
    streetAddress: string;
    city: string;
    state: string;
    zipCode?: string;
  };
  geocoding?: {
    status: GeocodingStatus;
    confidence?: number;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
}
```

---

## Hook Updates

### File: `src/pages/transactions/transaction-list/hooks/useTransactionDeals.ts`

```typescript
// Update the transaction-to-deal mapping to include geocoding data

function mapTransactionToDeal(transaction: Transaction): Deal {
  return {
    id: transaction.id,
    title: formatAddress(transaction.propertyAddress),
    price: extractPrice(transaction),
    closingDate: extractClosingDate(transaction),
    stages: mapStatusToStages(transaction.status),

    // NEW: Pass through geocoding data for PropertyMapAvatar
    propertyAddress: {
      streetAddress: transaction.propertyAddress.streetAddress,
      city: transaction.propertyAddress.city,
      state: transaction.propertyAddress.state,
      zipCode: transaction.propertyAddress.zipCode,
    },
    geocoding: transaction.geocoding,
  };
}
```

---

## Component Integration

### File: `src/pages/transactions/transaction-list/components/deals-list/DealRow.tsx`

```tsx
import { PropertyMapAvatar } from '@/components/property/PropertyMapAvatar';

interface DealRowProps {
  deal: Deal;
  // ... existing props
}

export function DealRow({ deal, ...props }: DealRowProps) {
  return (
    <Box /* existing container styles */>
      {/* Replace home icon with PropertyMapAvatar */}
      <PropertyMapAvatar
        address={deal.propertyAddress}
        coordinates={deal.geocoding?.coordinates}
        geocodingStatus={deal.geocoding?.status}
        geocodingConfidence={deal.geocoding?.confidence}
        size="medium"  // 48x48px
        onClick={() => handleMapClick(deal)}
      />

      {/* Rest of DealRow content */}
      <Box>
        <Typography>{deal.title}</Typography>
        {/* ... */}
      </Box>
    </Box>
  );
}
```

---

## Visual State Mapping

| Backend `geocoding_status` | Frontend Display | Notes |
|---------------------------|------------------|-------|
| `'pending'` | Skeleton loader | Geocoding queued but not started |
| `'processing'` | Skeleton loader | Geocoding in progress |
| `'success'` | Map thumbnail | Coordinates available |
| `'failed'` | Home icon fallback | Address couldn't be geocoded |
| `'manual'` | Map thumbnail | Manually entered coordinates |
| `null` / undefined | Home icon fallback | Legacy data without geocoding |

---

## Error Handling

### Geocoding Confidence Threshold

When `geocoding_confidence < 0.7`, the address may be inaccurate:

```tsx
// Optional: Show warning indicator for low-confidence geocoding
{geocodingConfidence < 0.7 && (
  <Tooltip title="Location may be approximate">
    <WarningIcon fontSize="small" />
  </Tooltip>
)}
```

### Missing Mapbox Token

```tsx
// In useStaticMapUrl hook
const accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
if (!accessToken) {
  console.warn('Mapbox token not configured - map avatars disabled');
  return null;  // Component will show fallback
}
```

---

## Testing Strategy

### Unit Tests
```typescript
describe('PropertyMapAvatar', () => {
  it('shows skeleton when geocodingStatus is pending', () => {
    render(<PropertyMapAvatar geocodingStatus="pending" />);
    expect(screen.getByTestId('skeleton')).toBeInTheDocument();
  });

  it('shows map image when geocodingStatus is success', () => {
    render(
      <PropertyMapAvatar
        geocodingStatus="success"
        coordinates={{ latitude: 37.7749, longitude: -122.4194 }}
      />
    );
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('shows fallback icon when geocodingStatus is failed', () => {
    render(<PropertyMapAvatar geocodingStatus="failed" />);
    expect(screen.getByTestId('home-icon')).toBeInTheDocument();
  });
});
```

### Integration Tests
```typescript
describe('DealRow with PropertyMapAvatar', () => {
  it('renders map avatar with coordinates from API', async () => {
    // Mock API response with geocoding data
    const mockDeal = {
      id: '123',
      title: '123 Main St',
      geocoding: {
        status: 'success',
        coordinates: { latitude: 37.7749, longitude: -122.4194 },
      },
    };

    render(<DealRow deal={mockDeal} />);

    // Verify map image URL contains coordinates
    const img = await screen.findByRole('img');
    expect(img.src).toContain('-122.4194,37.7749');
  });
});
```

---

## Checklist

### Backend (Existing - Verify Only)
- [x] PostGIS extension enabled
- [x] `location` column on transactions table
- [x] `geocoding_status` column with valid states
- [x] `GeocodingService` processes pending transactions
- [ ] **API returns coordinates extracted from PostGIS** (TO DO)

### Frontend (To Implement)
- [ ] Add geocoding types to `transactions.types.ts`
- [ ] Update `Deal` interface with geocoding fields
- [ ] Update `useTransactionDeals` to map geocoding data
- [ ] Create `PropertyMapAvatar` component
- [ ] Create `useStaticMapUrl` hook
- [ ] Update `DealRow` to use new component
- [ ] Add unit tests
- [ ] Add integration tests

---

*Document Version: 1.0*
*Last Updated: 2026-01-23*
