/**
 * Global types for deal stages and related data
 */

import type { GeocodingStatus, Coordinates } from 'modules/transactions/typings/transactions.types';

export type DealStageName = 'Active' | 'Post EM' | 'Inspection Cleared' | 'Ready for Close';

export interface DealStage {
  name: DealStageName;
  completed: boolean;
}

/**
 * Property address for map avatar display
 */
export interface DealPropertyAddress {
  streetAddress: string;
  city: string;
  state: string;
  zipCode?: string;
}

/**
 * Geocoding data for map avatar
 */
export interface DealGeocodingData {
  status: GeocodingStatus;
  confidence?: number;
  coordinates?: Coordinates;
}

export interface Deal {
  id: string;
  title: string;
  price: number;
  closingDate: string;
  stages: DealStage[];

  /**
   * Property address for PropertyMapAvatar component
   */
  propertyAddress?: DealPropertyAddress;

  /**
   * Geocoding data for PropertyMapAvatar component
   */
  geocoding?: DealGeocodingData;
}
