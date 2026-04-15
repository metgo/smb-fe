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
  VoucherDetailsPage,
  ContentMgmtPage,
  ErrorUiPage,
  NotificationsMgmtPage,
  AnalyticsDashboardPage,
  WebsiteMgmtPage,
  DynamicPageMgmtPage,
} from "@/pages";
import TestLabPage from "./pages/test-lab";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { IdleLogout, SplashLoader } from "./components/shared";
import { loginSuccess } from "@/features/authSlice";
import { useSocket } from "./providers/SocketProvider";
import {
  addNotification,
  setNotifications,
} from "./features/notificationSlice";
import { useLazyGetAllNotificationsQuery } from "./store/api/notificationApi";
import ArticlesManagement from "./pages/articles";
import ArticleDetails from "./pages/articles/details";

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
        sessionStorage.setItem("access_token", data.accessToken);
      }
      if (data.user) {
        sessionStorage.setItem(
          "user_info",
          JSON.stringify({ user: data.user }),
        );
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
  const socket = useSocket();
  const dispatch = useAppDispatch();

  const { notifications } = useAppSelector((state) => state.notification);
  const latestCreatedAt = notifications?.[0]?.createdAt;

  const [getLatestNotification] = useLazyGetAllNotificationsQuery();

  useEffect(() => {
    if (!socket) return;
    const notificationSound = new Audio("/assets/audio/bell-ring.mp3");
    const fetchInitialNotifications = async () => {
      try {
        const response = await getLatestNotification({}).unwrap();

        if (response?.data) {
          dispatch(setNotifications(response.data));
        }
      } catch (error) {
        console.error("Initial notification fetch failed", error);
      }
    };

    const handleNotification = async (data: any) => {
      console.log("🔔", data);

      if (!data?.type) return;
      notificationSound.play().catch((err) => {
        console.log("Sound blocked by browser:", err);
      });

      try {
        const response = await getLatestNotification({
          createdAfter: latestCreatedAt,
        }).unwrap();

        if (response?.data?.length) {
          response.data.reverse().forEach((notif: INotification) => {
            dispatch(addNotification(notif));
          });
        }
      } catch (error) {
        console.error("Failed to fetch new notifications", error);
      }
    };

    const handleConnect = () => {
      console.log("✅ Socket connected");
      fetchInitialNotifications();
    };

    socket.on("connect", handleConnect);
    socket.on("notification", handleNotification);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("notification", handleNotification);
    };
  }, [socket, dispatch, getLatestNotification, latestCreatedAt]);

  // Update Redux state if Google OAuth callback was handled
  useEffect(() => {
    if (isGoogleOAuthCallback) {
      const userInfo = sessionStorage.getItem("user_info");
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
    const isLoggedIn = !!sessionStorage.getItem("access_token");

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
        <Suspense fallback={<SplashLoader />}>
          <ProtectedRoute>
            <IdleLogout />
            <RootLayout />
          </ProtectedRoute>
        </Suspense>
      ),
      errorElement: <ErrorUiPage />,
      children: [
        { path: routes.dashboard, element: <DashboardPage /> },
        {
          path: routes.analyticsDashboard,
          element: <AnalyticsDashboardPage />,
        },

        { path: routes.businessMgmt, element: <BusinessesMgmtPage /> },
        { path: routes.businessDetails, element: <BusinessDetailsPage /> },

        { path: routes.articleMgmt, element: <ArticlesManagement /> },
        { path: routes.articleDetails, element: <ArticleDetails /> },

        { path: routes.eventsMgmt, element: <EventsMgmtPage /> },
        { path: routes.eventDetails, element: <EventDetailsPage /> },

        { path: routes.productsMgmt, element: <ProductsMgmtPage /> },
        { path: routes.miniCampaign, element: <MiniCampaignsMgmtPage /> },
        { path: routes.eventsMgmt, element: <EventsMgmtPage /> },
        { path: routes.eventDetails, element: <EventDetailsPage /> },
        { path: routes.productDetails, element: <ProductDetailsPage /> },
        { path: routes.contentMgmt, element: <ContentMgmtPage /> },
        { path: routes.voucherMgmt, element: <VouchersMgmtPage /> },
        { path: routes.voucherDetails, element: <VoucherDetailsPage /> },
        { path: routes.profile, element: <ProfilePage /> },
        { path: routes.ordersMgmt, element: <OrdersMgmtPage /> },
        { path: routes.notificationMgmt, element: <NotificationsMgmtPage /> },
        { path: routes.websiteMgmt, element: <WebsiteMgmtPage /> },
        { path: routes.dynamicPages, element: <DynamicPageMgmtPage /> },

        { path: "/*", element: <DashboardPage /> },
      ],
    },
    {
      element: (
        <Suspense fallback={<SplashLoader />}>
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
