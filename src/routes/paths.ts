const paths = {
  dashboard: '/dashboard',
  transactions: '/transactions',
  createTransaction: '/transactions/new',
  docsTraining: '/docs-training',
  notifications: '/notifications',
  accountSettings: '/account-settings',
  accountSettingsProfile: '/account-settings/profile',
  accountSettingsSubscription: '/account-settings/subscription',
  accountSettingsBillingHistory: '/account-settings/billing-history',
  accountSettingsTeam: '/account-settings/team',
  accountSettingsAccessibility: '/account-settings/accessibility',
  accountSettingsPreferences: '/account-settings/preferences',
  // Team invite acceptance
  inviteAccept: (token: string) => `/invite/${token}`,
  inviteClaim: (token: string) => `/invite/${token}/claim`,
  // Transaction invite acceptance
  transactionInviteAccept: (token: string) => `/transaction-invite/${token}`,
  transactionInviteClaim: (token: string) => `/transaction-invite/${token}/claim`,
  // Share link access
  shareAccess: (token: string) => `/share/${token}`,
  // Auth paths
  defaultJwtLogin: '/authentication/login',
  defaultJwtSignup: '/authentication/signup',
  defaultJwtForgotPassword: '/authentication/forgot-password',
  defaultJwtSetPassword: '/authentication/set-password',
  defaultJwt2FA: '/authentication/2fa',
  crm: '/crm',
  dealDetails: (id: string) => `/transactions/${id}`,
};

export const authPaths = {
  login: paths.defaultJwtLogin,
  signup: paths.defaultJwtSignup,
  forgotPassword: paths.defaultJwtForgotPassword,
  setNewPassword: paths.defaultJwtSetPassword,
  twoFactorAuth: paths.defaultJwt2FA,
};

export const apiEndpoints = {
  transactions: '/transactions',
  getTransaction: (id: string) => `/transactions/${id}`,
  updateTransaction: (id: string) => `/transactions/${id}`,
  deleteTransaction: (id: string) => `/transactions/${id}`,
  generateTransactionReport: '/transaction-reports/generate',
  getTransactionReportByTransactionId: (transactionId: string) =>
    `/transaction-reports/transaction/${transactionId}`,
  getTransactionReport: (id: string) => `/transaction-reports/${id}`,
  documents: '/documents',
  uploadDocument: '/documents/upload',
  getDocumentsByTransaction: (transactionId: string) => `/documents/transaction/${transactionId}`,
  getDocument: (id: string) => `/documents/${id}`,
  deleteDocument: (id: string) => `/documents/${id}`,
  analyzeDocument: (id: string) => `/documents/${id}/analyze`,
  // OCR Templates
  trainTemplate: '/ocr-templates/train',
  getTrainingStatus: (jobId: string) => `/ocr-templates/training/${jobId}`,
  getCompletedTrainingJobs: '/ocr-templates/training/completed',
  getTemplates: '/ocr-templates',
  getTemplate: (id: string) => `/ocr-templates/${id}`,

  // Team endpoints
  team: {
    getTeamData: '/team',
    sendInvite: '/team/invites',
    sendBulkInvites: '/team/invites/bulk',
    resendInvite: (id: string) => `/team/invites/${id}/resend`,
    cancelInvite: (id: string) => `/team/invites/${id}`,
    updateMember: (id: string) => `/team/members/${id}`,
    removeMember: (id: string) => `/team/members/${id}`,
    leaveTeam: '/team/members/leave',
  },

  // Invite acceptance (public)
  invites: {
    validate: (token: string) => `/invites/${token}`,
    claim: (token: string) => `/invites/${token}/claim`,
    decline: (token: string) => `/invites/${token}/decline`,
  },

  // Subscription endpoints
  subscription: {
    getCurrent: '/subscriptions',
    getAll: '/subscriptions/all',
    getPlans: '/subscriptions/plans',
  },

  // Billing endpoints
  billing: {
    getInvoices: '/billing/invoices',
    getInvoice: (id: string) => `/billing/invoices/${id}`,
    getPaymentMethods: '/billing/payment-methods',
    getPaymentMethod: (id: string) => `/billing/payment-methods/${id}`,
  },

  // User settings endpoints
  userSettings: {
    getAll: '/user-settings',
    updateAll: '/user-settings',
    getNotifications: '/user-settings/notifications',
    updateNotifications: '/user-settings/notifications',
    getAccessibility: '/user-settings/accessibility',
    updateAccessibility: '/user-settings/accessibility',
    getPreferences: '/user-settings/preferences',
    updatePreferences: '/user-settings/preferences',
  },

  // Transaction participants endpoints
  transactionParticipants: {
    // Participant management
    list: (transactionId: string) => `/transactions/${transactionId}/participants`,
    add: (transactionId: string) => `/transactions/${transactionId}/participants`,
    participant: (transactionId: string, participantId: string) =>
      `/transactions/${transactionId}/participants/${participantId}`,

    // Invite management
    invites: (transactionId: string) => `/transactions/${transactionId}/invites`,
    sendInvite: (transactionId: string) => `/transactions/${transactionId}/invites`,
    invite: (transactionId: string, inviteId: string) =>
      `/transactions/${transactionId}/invites/${inviteId}`,
    resendInvite: (transactionId: string, inviteId: string) =>
      `/transactions/${transactionId}/invites/${inviteId}/resend`,

    // Share link management
    shareLinks: (transactionId: string) => `/transactions/${transactionId}/share-links`,
    createShareLink: (transactionId: string) => `/transactions/${transactionId}/share-links`,
    shareLink: (transactionId: string, linkId: string) =>
      `/transactions/${transactionId}/share-links/${linkId}`,
  },

  // Transaction invite acceptance (public)
  transactionInvites: {
    validate: (token: string) => `/transaction-invites/${token}`,
    claim: (token: string) => `/transaction-invites/${token}/claim`,
  },

  // Share link access (public)
  shareLinks: {
    access: (token: string) => `/share/${token}`,
    convert: (token: string) => `/share/${token}/convert`,
  },

  // Portal endpoints (title portal API)
  portal: {
    login: (transactionId: string, side: string) => `/portal/${transactionId}/${side}/login`,
    validatePassword: (transactionId: string, side: string) => `/portal/${transactionId}/${side}/validate`,
    getData: (transactionId: string, side: string) => `/portal/${transactionId}/${side}/data`,
    getDocuments: (transactionId: string, side: string) => `/portal/${transactionId}/${side}/documents`,
    uploadDocument: (transactionId: string, side: string) => `/portal/${transactionId}/${side}/documents/upload`,
  },
};

// Portal paths (title portal routes)
export const portalPaths = {
  login: (transactionId: string, side: string) => `/${transactionId}/${side}/login`,
  home: (transactionId: string, side: string) => `/${transactionId}/${side}`,
  tab: (transactionId: string, side: string, tab: string) => `/${transactionId}/${side}/${tab}`,
  dashboard: (transactionId: string, side: string) => `/${transactionId}/${side}`,
  contract: (transactionId: string, side: string) => `/${transactionId}/${side}/contract`,
  title: (transactionId: string, side: string) => `/${transactionId}/${side}/title`,
  financial: (transactionId: string, side: string) => `/${transactionId}/${side}/financial`,
  closing: (transactionId: string, side: string) => `/${transactionId}/${side}/closing`,
};

export default paths;
