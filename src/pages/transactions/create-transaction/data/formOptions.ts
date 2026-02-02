import type { RepresentationType } from 'modules/transactions';

export interface RepresentationOption {
  value: RepresentationType;
  label: string;
  icon: string;
}

export interface PropertyTypeOption {
  value: string; // Property type name (e.g., "Single Family", "Condo/Townhouse")
  label: string;
  icon: string;
}

export const representationOptions: RepresentationOption[] = [
  { value: 'buyer', label: 'Buyer', icon: 'mdi:home-outline' },
  { value: 'seller', label: 'Seller', icon: 'mdi:key-outline' },
  { value: 'both', label: 'Both', icon: 'mdi:handshake-outline' },
];

export const propertyTypeOptions: PropertyTypeOption[] = [
  { value: 'single_family', label: 'Single Family', icon: 'mdi:home-outline' },
  { value: 'condo_townhouse', label: 'Condo/Townhouse', icon: 'mdi:office-building-outline' },
  { value: 'land', label: 'Land', icon: 'mdi:terrain' },
  { value: 'commercial', label: 'Commercial', icon: 'mdi:office-building-marker-outline' },
  { value: 'other', label: 'Other', icon: 'mdi:dots-horizontal' },
];

export const usStates = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming',
];

