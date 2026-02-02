import { ReactNode, Suspense, lazy } from 'react';
import { Navigate, RouteObject, createBrowserRouter } from 'react-router';
import MainLayout from 'layouts/main-layout';
import Page404 from 'pages/errors/Page404';
import ErrorPage from 'pages/errors/ErrorPage';
import AuthGuard from 'components/guard/AuthGuard';
import GuestGuard from 'components/guard/GuestGuard';
import PageLoader from 'components/loading/PageLoader';
import paths from './paths';
import { useAuthStore } from 'modules/auth/store/auth.store';
import PortalGuard from 'components/guard/PortalGuard';
import PortalLayout from 'layouts/portal-layout';
const App = lazy(() => import('App'));
const DashboardLayout = lazy(() => import('pages/dashboard/DashboardLayout'));
const BrokerHome = lazy(() => import('pages/dashboard/broker-home'));
const UserHome = lazy(() => import('pages/dashboard/user-home'));
const TransactionList = lazy(() => import('pages/transactions/transaction-list'));
const CreateTransaction = lazy(() => import('pages/transactions/create-transaction'));
const TransactionDetail = lazy(() => import('pages/transactions/transaction-detail'));
const DocsTraining = lazy(() => import('pages/docs-training/DocsTraining'));
const Notifications = lazy(() => import('pages/others/Notifications'));
const AccountSettings = lazy(() => import('pages/account-settings'));
const InviteAcceptPage = lazy(() => import('pages/invite/InviteAcceptPage'));
const InviteClaimPage = lazy(() => import('pages/invite/InviteClaimPage'));

// Transaction invite pages
const TransactionInviteAcceptPage = lazy(() => import('pages/transaction-invite/TransactionInviteAcceptPage'));
const TransactionInviteClaimPage = lazy(() => import('pages/transaction-invite/TransactionInviteClaimPage'));

// Share link pages
const SharedTransactionPage = lazy(() => import('pages/share/SharedTransactionPage'));

// Portal pages (title portal)
const PortalLoginPage = lazy(() => import('pages/portal/PortalLoginPage'));
const PortalPage = lazy(() => import('pages/portal/PortalPage'));
const PortalDashboardTab = lazy(() => import('pages/portal/tabs/DashboardTab'));
const PortalContractTab = lazy(() => import('pages/portal/tabs/ContractTab'));
const PortalTitleTab = lazy(() => import('pages/portal/tabs/TitleTab'));
const PortalFinancialTab = lazy(() => import('pages/portal/tabs/FinancialTab'));
const PortalClosingTab = lazy(() => import('pages/portal/tabs/ClosingTab'));

// Authentication pages
const Login = lazy(() => import('pages/authentication/Login'));
const Signup = lazy(() => import('pages/authentication/Signup'));
const ForgotPassword = lazy(() => import('pages/authentication/ForgotPassword'));
const SetPassword = lazy(() => import('pages/authentication/SetPassword'));

const withMainLayout = (node: ReactNode) => (
  <AuthGuard>
    <MainLayout>
      <Suspense fallback={<PageLoader />}>{node}</Suspense>
    </MainLayout>
  </AuthGuard>
);


const DashboardHome = () => {
  const { user } = useAuthStore();
  return (
    <Suspense fallback={<PageLoader />}>
      {user?.role === 'broker' ? <BrokerHome /> : <UserHome />}
    </Suspense>
  );
};

export const routes: RouteObject[] = [
  {
    element: (
      <Suspense fallback={<PageLoader />}>
        <App />
      </Suspense>
    ),
    errorElement: <ErrorPage />,
    children: [
      {
        path: '/',
        element: <Navigate to={paths.dashboard} replace />,
      },
      // Authentication routes (guest only)
      {
        path: 'authentication/login',
        element: (
          <GuestGuard>
            <Suspense fallback={<PageLoader />}>
              <Login />
            </Suspense>
          </GuestGuard>
        ),
      },
      {
        path: 'authentication/signup',
        element: (
          <GuestGuard>
            <Suspense fallback={<PageLoader />}>
              <Signup />
            </Suspense>
          </GuestGuard>
        ),
      },
      {
        path: 'authentication/forgot-password',
        element: (
          <GuestGuard>
            <Suspense fallback={<PageLoader />}>
              <ForgotPassword />
            </Suspense>
          </GuestGuard>
        ),
      },
      {
        path: 'authentication/set-password',
        element: (
          <Suspense fallback={<PageLoader />}>
            <SetPassword />
          </Suspense>
        ),
      },
      {
        element: withMainLayout(<DashboardLayout />),
        children: [
          {
            path: 'dashboard',
            element: <DashboardHome />,
          },
        ],
      },
      {
        path: 'docs-training',
        element: withMainLayout(<DocsTraining />),
      },
      {
        path: 'transactions',
        element: withMainLayout(<TransactionList />),
      },
      {
        path: 'transactions/new',
        element: withMainLayout(<CreateTransaction />),
      },
      {
        path: 'transactions/:id',
        element: withMainLayout(<TransactionDetail />),
      },
      {
        path: 'notifications',
        element: withMainLayout(<Notifications />),
      },
      {
        path: 'account-settings',
        element: withMainLayout(<AccountSettings />),
      },
      {
        path: 'account-settings/:tab',
        element: withMainLayout(<AccountSettings />),
      },
      // Invite acceptance routes (outside AuthGuard - public access)
      {
        path: 'invite/:token',
        element: (
          <Suspense fallback={<PageLoader />}>
            <InviteAcceptPage />
          </Suspense>
        ),
      },
      {
        path: 'invite/:token/claim',
        element: (
          <Suspense fallback={<PageLoader />}>
            <InviteClaimPage />
          </Suspense>
        ),
      },
      // Transaction invite routes (public access)
      {
        path: 'transaction-invite/:token',
        element: (
          <Suspense fallback={<PageLoader />}>
            <TransactionInviteAcceptPage />
          </Suspense>
        ),
      },
      {
        path: 'transaction-invite/:token/claim',
        element: (
          <Suspense fallback={<PageLoader />}>
            <TransactionInviteClaimPage />
          </Suspense>
        ),
      },
      // Share link routes (public access)
      {
        path: 'share/:token',
        element: (
          <Suspense fallback={<PageLoader />}>
            <SharedTransactionPage />
          </Suspense>
        ),
      },
      // Portal routes (title portal - separate auth system)
      {
        path: ':transactionId/:side/login',
        element: (
          <Suspense fallback={<PageLoader />}>
            <PortalLoginPage />
          </Suspense>
        ),
      },
      {
        path: ':transactionId/:side',
        element: (
          <PortalGuard>
            <PortalPage />
          </PortalGuard>
        ),
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<PageLoader />}>
                <PortalDashboardTab />
              </Suspense>
            ),
          },
          {
            path: 'contract',
            element: (
              <Suspense fallback={<PageLoader />}>
                <PortalContractTab />
              </Suspense>
            ),
          },
          {
            path: 'title',
            element: (
              <Suspense fallback={<PageLoader />}>
                <PortalTitleTab />
              </Suspense>
            ),
          },
          {
            path: 'financial',
            element: (
              <Suspense fallback={<PageLoader />}>
                <PortalFinancialTab />
              </Suspense>
            ),
          },
          {
            path: 'closing',
            element: (
              <Suspense fallback={<PageLoader />}>
                <PortalClosingTab />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: '*',
        element: <Page404 />,
      },
    ],
  },
];

const router = createBrowserRouter(routes, {
  basename: import.meta.env.VITE_BASENAME || '/',
});

export default router;
