export interface BreadcrumbItem {
  label: string;
  path: string;
}

export interface SearchFile {
  name: string;
  path: string;
  type: string;
}

export interface SearchContact {
  name: string;
  avatar?: string;
  email?: string;
}

export interface SearchResult {
  breadcrumbs: BreadcrumbItem[][];
  files: SearchFile[];
  contacts: SearchContact[];
  tags: string[];
}

declare const searchResult: SearchResult;
export default searchResult;

