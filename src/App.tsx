import { Suspense } from "react";
import {
  Outlet,
  RouterProvider,
  createBrowserRouter,
  Navigate,
} from "react-router-dom";

import { routes } from "@/lib/routes";
import DashboardPage from "@/pages/dashboard";
import RootLayout from "@/components/RootLayout";
import {
  AuthPage,
  BusinessesMgmtPage,
  ProductsMgmtPage,
  MiniCampaignsMgmtPage,
  EventsMgmtPage,
  ProfilePage,
  OrdersMgmtPage,
  EventDetailsPage,
  BusinessDetailsPage,
  MiniSiteMgmtPage,
} from "@/pages";
import { IdleLogout } from "./components/shared";
import TestLabPage from "./pages/test-lab";

interface ProtectedRouteProps {
  children: React.ReactNode;
  isLoginPage?: boolean;
}

function App() {
  const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    isLoginPage = false,
  }) => {
    const isLoggedIn = !!localStorage.getItem("access_token");

    if (isLoginPage) {
      if (isLoggedIn) {
        return <Navigate to={routes.dashboard} replace />;
      }
      return children;
    }

    if (!isLoggedIn) {
      return <Navigate to={routes.auth} replace />;
    }

    return children;
  };

  const router = createBrowserRouter([
    {
      element: (
        <Suspense fallback={null}>
          <ProtectedRoute>
            <IdleLogout />
            <RootLayout />
          </ProtectedRoute>
        </Suspense>
      ),
      children: [
        { path: routes.dashboard, element: <DashboardPage /> },

        { path: routes.businessMgmt, element: <BusinessesMgmtPage /> },
        { path: routes.businessDetails, element: <BusinessDetailsPage /> },

        { path: routes.eventsMgmt, element: <EventsMgmtPage /> },
        { path: routes.eventDetails, element: <EventDetailsPage /> },

        { path: routes.productsMgmt, element: <ProductsMgmtPage /> },

        { path: routes.miniCampaignMgmt, element: <MiniCampaignsMgmtPage /> },
        { path: routes.miniSiteMgmt, element: <MiniSiteMgmtPage /> },

        { path: routes.profile, element: <ProfilePage /> },
        { path: routes.ordersMgmt, element: <OrdersMgmtPage /> },
        { path: "/*", element: <DashboardPage /> },
      ],
    },
    {
      element: (
        <Suspense fallback={null}>
          <ProtectedRoute isLoginPage>
            <Outlet />
          </ProtectedRoute>
        </Suspense>
      ),
      children: [
        { path: routes.auth, element: <AuthPage /> },
        { path: "/test-lab", element: <TestLabPage /> },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
