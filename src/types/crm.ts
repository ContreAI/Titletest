export interface DealData {
  icon: string;
  count: number;
  label: string;
  percentage: number;
  trend: 'up' | 'down';
}

export interface KPIData {
  title: string;
  value: string | number;
  subtitle: string;
  icon: {
    name: string;
    color: string;
  };
}

