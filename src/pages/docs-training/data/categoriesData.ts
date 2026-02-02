export interface DocumentCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  iconColorScheme: 'primary' | 'info' | 'neutral';
}

export const contractsCategories: DocumentCategory[] = [
  {
    id: 'purchase-sale',
    title: 'Purchase & Sale Agreement',
    description: 'Standard purchase agreement template with state compliance',
    icon: 'custom:docs-purchase-sale',
    iconColorScheme: 'primary',
  },
  {
    id: 'representation',
    title: 'Representation Agreement',
    description: 'Client representation and agency agreement forms',
    icon: 'custom:docs-representation',
    iconColorScheme: 'info',
  },
  {
    id: 'disclosures',
    title: 'Disclosures',
    description: 'Property disclosure and condition reports',
    icon: 'custom:docs-disclosures',
    iconColorScheme: 'neutral',
  },
  {
    id: 'counter-offers',
    title: 'Counter Offers',
    description: 'Counter offer and negotiation templates',
    icon: 'custom:docs-counter-offers',
    iconColorScheme: 'neutral',
  },
  {
    id: 'addendums',
    title: 'Addendums & Amendments',
    description: 'Contract modifications and additional terms',
    icon: 'custom:docs-addendums',
    iconColorScheme: 'neutral',
  },
  {
    id: 'other',
    title: 'Other',
    description: 'Other Docs You Would Like to Train',
    icon: 'material-symbols:folder-outline',
    iconColorScheme: 'neutral',
  },
];

export const stateLegalCategories: DocumentCategory[] = [
  {
    id: 'state-forms',
    title: 'State Required Forms',
    description: 'Mandatory state disclosure and compliance forms',
    icon: 'material-symbols:gavel',
    iconColorScheme: 'neutral',
  },
  {
    id: 'legal-notices',
    title: 'Legal Notices',
    description: 'Required legal notices and disclosures',
    icon: 'material-symbols:article-outline',
    iconColorScheme: 'neutral',
  },
];

export const companyDocsCategories: DocumentCategory[] = [
  {
    id: 'policies',
    title: 'Company Policies',
    description: 'Internal policies and procedures documentation',
    icon: 'material-symbols:policy-outline',
    iconColorScheme: 'neutral',
  },
  {
    id: 'training',
    title: 'Training Materials',
    description: 'Employee training guides and resources',
    icon: 'material-symbols:school-outline',
    iconColorScheme: 'neutral',
  },
];
