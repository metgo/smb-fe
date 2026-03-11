import { Suspense, useEffect } from "react";
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
  VouchersMgmtPage,
  EventDetailsPage,
  BusinessDetailsPage,
  ProductDetailsPage,
  ContentMgmtPage,
  ErrorUiPage,
  AnalyticsDashboardPage,
} from "@/pages";
import { IdleLogout } from "./components/shared";
import TestLabPage from "./pages/test-lab";
import { useAppDispatch } from "@/hooks/hooks";
import { loginSuccess } from "@/features/authSlice";

// Handle Google OAuth callback - extract userData from URL and store in localStorage
const handleGoogleOAuthCallback = (): boolean => {
  if (typeof window === "undefined") return false;

  const urlParams = new URLSearchParams(window.location.search);
  const userData = urlParams.get("userData");

  if (userData) {
    try {
      const data = JSON.parse(decodeURIComponent(userData));

      // Store tokens and user info in localStorage
      if (data.accessToken) {
        localStorage.setItem("access_token", data.accessToken);
      }
      if (data.user) {
        localStorage.setItem("user_info", JSON.stringify({ user: data.user }));
      }

      // Clean up URL by removing userData param
      urlParams.delete("userData");
      const newUrl = urlParams.toString()
        ? `${window.location.pathname}?${urlParams.toString()}`
        : window.location.pathname;
      window.history.replaceState({}, "", newUrl);

      return true;
    } catch (error) {
      console.error("Error parsing Google OAuth userData:", error);
    }
  }
  return false;
};

// Run synchronously before React renders
const isGoogleOAuthCallback = handleGoogleOAuthCallback();

interface ProtectedRouteProps {
  children: React.ReactNode;
  isLoginPage?: boolean;
}

function App() {
  const dispatch = useAppDispatch();

  // Update Redux state if Google OAuth callback was handled
  useEffect(() => {
    if (isGoogleOAuthCallback) {
      const userInfo = localStorage.getItem("user_info");
      if (userInfo) {
        try {
          const { user } = JSON.parse(userInfo);
          if (user) {
            dispatch(loginSuccess(user));
          }
        } catch (error) {
          console.error(
            "Error updating Redux state after Google login:",
            error,
          );
        }
      }
    }
  }, [dispatch]);

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
      // errorElement: <ErrorUiPage />,
      children: [
        { path: routes.dashboard, element: <DashboardPage /> },
        {
          path: routes.analyticsDashboard,
          element: <AnalyticsDashboardPage />,
        },

        { path: routes.businessMgmt, element: <BusinessesMgmtPage /> },
        { path: routes.businessDetails, element: <BusinessDetailsPage /> },

        { path: routes.eventsMgmt, element: <EventsMgmtPage /> },
        { path: routes.eventDetails, element: <EventDetailsPage /> },

        { path: routes.productsMgmt, element: <ProductsMgmtPage /> },
        { path: routes.miniCampaign, element: <MiniCampaignsMgmtPage /> },
        { path: routes.eventsMgmt, element: <EventsMgmtPage /> },
        { path: routes.eventDetails, element: <EventDetailsPage /> },
        { path: routes.productDetails, element: <ProductDetailsPage /> },
        { path: routes.contentMgmt, element: <ContentMgmtPage /> },
        { path: routes.voucherMgmt, element: <VouchersMgmtPage /> },

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
      errorElement: <ErrorUiPage />,
      children: [
        { path: routes.auth, element: <AuthPage /> },
        { path: "/test-lab", element: <TestLabPage /> },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
