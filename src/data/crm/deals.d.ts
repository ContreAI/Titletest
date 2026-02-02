export interface Company {
  id: number;
  name: string;
  logo: string;
  link: string;
}

export interface Deal {
  id?: string | number;
  title?: string;
  name?: string; // Form uses 'name', display uses 'title'
  amount: number;
  stage: string;
  company?: Company;
  collaborators?: Array<{
    id: string | number;
    name: string;
    avatar?: string;
  }>;
  expanded?: boolean;
  description?: string;
  pipeline?: string;
  lastUpdate?: string;
  createDate?: string;
  closeDate?: string;
  owner?: any;
  client?: any;
  priority?: string;
  progress?: number;
  [key: string]: any;
}

export interface DealList {
  id: string | number;
  title: string;
  deals: Deal[];
  compactMode?: boolean;
}

export const companies: Company[];
export const dealsData: DealList[];
export type { Deal, DealList, Company };

