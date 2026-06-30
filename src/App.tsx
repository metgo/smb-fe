import axios from "axios";
import {
  Outlet,
  RouterProvider,
  createBrowserRouter,
  Navigate,
} from "react-router-dom";
import { Suspense, useEffect, useRef, useMemo } from "react";

import { envKeys } from "@/lib/envKeys";
import { endpoints } from "@/lib/endpoints";
import { routes } from "@/lib/routes";
import { saveUserInfo } from "@/lib/storage";
import DashboardPage from "@/pages/dashboard";
import RootLayout from "@/components/RootLayout";
import {
  AuthPage,
  BusinessesMgmtPage,
  PendingApprovalsPage,
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
  PromotionsMgmtPage,
  PoiMgmtPage,
  PoiDetailsPage,
  DmosMgmtPage,
  AuthoritiesMgmtPage,
  WebsiteConfigPage,
  PartnersPage,
  CampaignsMgmtPage,
  UsersMgmtPage,
  WebsiteCrashesPage,
  WebsiteCrashDetailsPage,
  EventSessionMgmtPage,
} from "@/pages";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { IdleLogout, SplashLoader } from "./components/shared";
import RouterProgressBar from "./components/shared/RouterProgressBar";
import { loginSuccess } from "@/features/authSlice";
import { useSocket } from "./providers/SocketProvider";
import {
  addNotification,
  setNotifications,
  incrementUnreadCount,
  setUnreadCount,
} from "./features/notificationSlice";
import {
  useLazyGetAllNotificationsQuery,
  notificationApi,
} from "./store/api/notificationApi";
import ArticlesManagement from "./pages/articles";
import ArticleDetails from "./pages/articles/details";
import PublicTicketPage from "./pages/public-ticket";
import { UserRole } from "./enums/user.types";
import { store } from "./store/store";

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

      // Redirect to auth route so ProtectedRoute handles role-based redirects (traveller → business)
      window.history.replaceState({}, "", routes.auth);

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

  const { notifications, unreadCount } = useAppSelector(
    (state) => state.notification,
  );
  const latestCreatedAt = notifications?.[0]?.createdAt;

  const [getLatestNotification] = useLazyGetAllNotificationsQuery();
  const countRefreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  useEffect(() => {
    if (!socket) return;
    const notificationSound = new Audio("/assets/audio/bell-ring.mp3");
    const fetchInitialNotifications = async () => {
      try {
        const response = await getLatestNotification({}).unwrap();

        if (response?.data) {
          dispatch(setNotifications(response.data));
        }

        // Set initial unread count from API response
        if ((response as any)?.totalUnread !== undefined) {
          dispatch(setUnreadCount((response as any).totalUnread));
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

          // Increment count locally for each new notification (instant + accurate)
          const newNotificationsCount = response.data.length;
          for (let i = 0; i < newNotificationsCount; i++) {
            dispatch(incrementUnreadCount());
          }

          // Debounced API verification: only verify if count < 100 and batch calls
          const currentCount = store.getState().notification.unreadCount;
          if (currentCount < 100) {
            // Clear existing timeout to debounce
            if (countRefreshTimeoutRef.current) {
              clearTimeout(countRefreshTimeoutRef.current);
            }

            // Set new debounced timeout (300ms)
            countRefreshTimeoutRef.current = setTimeout(() => {
              // Only call API if still < 100 (in case more notifications arrived)
              const finalCount = store.getState().notification.unreadCount;
              if (finalCount < 100) {
                store.dispatch(
                  notificationApi.endpoints.getNotificationCount.initiate(),
                );
              }
              countRefreshTimeoutRef.current = null;
            }, 300);
          }
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
      // Cleanup debounce timer
      if (countRefreshTimeoutRef.current) {
        clearTimeout(countRefreshTimeoutRef.current);
      }
    };
  }, [socket, dispatch, getLatestNotification, latestCreatedAt, unreadCount]);

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

          const savedRedirect = sessionStorage.getItem("redirect_after_login");
          if (savedRedirect) {
            sessionStorage.removeItem("redirect_after_login");
            window.location.href = savedRedirect;
          } else if (user?.role === UserRole.TRAVELLER && !user?.hasBusiness) {
            window.location.href = routes.businessMgmt;
          } else {
            window.location.href = routes.dashboard;
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

  // Handle QR verification token for orders-management and event-details access (JWT token, same as incomplete profile)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const jwtToken = urlParams.get("token");
    const isOrdersManagement = window.location.pathname === routes.ordersMgmt;
    const isEventDetails = window.location.pathname.startsWith(
      routes.eventDetails,
    );

    if (jwtToken && (isOrdersManagement || isEventDetails)) {
      // Keep the original QR token separate from the normal access token.
      sessionStorage.setItem("access_token", jwtToken);
      sessionStorage.setItem("qr_token", jwtToken);
      sessionStorage.setItem("isQrMode", "true");
      sessionStorage.setItem("isQrVerified", "false");

      const fetchVendorUserInfo = async () => {
        try {
          const response = await axios.get(
            `${envKeys.baseUrl}/public/users/verify/${jwtToken}`,
          );

          const payload =
            response.data?.data || response.data?.datas || response.data;
          const userData = payload?.user || payload;
          if (userData) {
            const accessToken = payload?.accessToken || userData?.accessToken;
            if (accessToken) {
              sessionStorage.setItem("access_token", accessToken);
            }
            sessionStorage.setItem("isQrVerified", "true");
            saveUserInfo({ user: userData });
            dispatch(loginSuccess(userData));

            // Clean token from URL now that it's stored in session
            const newUrl =
              window.location.pathname +
              window.location.search
                .replace(/[?&]token=[^&]*/, "")
                .replace(/^&/, "?");
            window.history.replaceState({}, "", newUrl);

            // Notify other components like SocketProvider
            window.dispatchEvent(new Event("session:updated"));
          }
        } catch (error) {
          console.error("Failed to fetch vendor user info via QR token", error);
          // Keep JWT token in session even if user fetch fails, allows event management
        }
      };

      fetchVendorUserInfo();
    }
  }, [dispatch]);

  // Handle profile completion token — auto-login the user if token is in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token") || urlParams.get("approveToken");
    const currentAccessToken = sessionStorage.getItem("access_token");
    const isOrdersManagement = window.location.pathname === routes.ordersMgmt;

    const isPublicTicketPath = window.location.pathname.startsWith(
      routes.publicTicket,
    );

    // Skip for QR mode and public ticket pages
    if (isOrdersManagement || isPublicTicketPath) return;

    // Only trigger if we have a token and it's either new or different from the current one
    if (token && token !== currentAccessToken) {
      const fetchUserProfile = async () => {
        try {
          // Set the token temporarily so /users/me can use it
          sessionStorage.setItem("access_token", token);

          const response = await axios.get(
            `${envKeys.baseUrl}${endpoints.userInfo}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );

          const userData = response.data;
          if (userData) {
            saveUserInfo({ user: userData });
            dispatch(loginSuccess(userData));

            // Clean token from URL now that it's stored in session
            const newUrl =
              window.location.pathname +
              window.location.search
                .replace(/[?&]token=[^&]*/, "")
                .replace(/^&/, "?");
            window.history.replaceState({}, "", newUrl);

            // Notify other components like SocketProvider
            window.dispatchEvent(new Event("session:updated"));
          }
        } catch (error) {
          console.error("Failed to auto-login via profile token", error);
          // If auto-login fails, don't leave a potentially broken token
          if (sessionStorage.getItem("access_token") === token) {
            sessionStorage.removeItem("access_token");
          }
        }
      };
      fetchUserProfile();
    }
  }, [dispatch]);

  const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    isLoginPage = false,
  }) => {
    const isLoggedIn = !!sessionStorage.getItem("access_token");
    const userInfo = sessionStorage.getItem("user_info");
    const isPublicTicket = window.location.pathname.startsWith(
      routes.publicTicket,
    );

    if (isPublicTicket) {
      return children;
    }
    let user: any = null;
    if (userInfo) {
      try {
        user = JSON.parse(userInfo).user;
      } catch (e) {
        console.error("Failed to parse user_info");
      }
    }

    // If user is on login page
    if (isLoginPage) {
      if (isLoggedIn && user) {
        const savedRedirect = sessionStorage.getItem("redirect_after_login");
        if (savedRedirect) {
          sessionStorage.removeItem("redirect_after_login");
          return <Navigate to={savedRedirect} replace />;
        }

        if (user.role === UserRole.TRAVELLER && !user.hasBusiness) {
          return <Navigate to={routes.businessMgmt} replace />;
        }
        return <Navigate to={routes.dashboard} replace />;
      }
      return children;
    }

    // Normal protected routes
    if (!isLoggedIn) {
      const attemptedPath = window.location.pathname + window.location.search;
      if (attemptedPath && attemptedPath.includes(routes.notificationMgmt)) {
        sessionStorage.setItem("redirect_after_login", attemptedPath);
      }

      // Allow routes with token to bypass login (business-details, event-details, orders-management QR)
      const urlParams = new URLSearchParams(window.location.search);
      const hasToken = urlParams.get("token");
      const orderId = urlParams.get("orderId");

      const isBusinessDetails = window.location.pathname.startsWith(
        routes.businessDetails,
      );
      const isEventDetails = window.location.pathname.startsWith(
        routes.eventDetails,
      );
      const isOrdersManagement = window.location.pathname === routes.ordersMgmt;

      if (
        hasToken &&
        (isBusinessDetails || isEventDetails || isOrdersManagement)
      ) {
        return children;
      }

      if (orderId && isOrdersManagement) {
        return children;
      }

      if (orderId) {
        return (
          <Navigate to={`${routes.ordersMgmt}?orderId=${orderId}`} replace />
        );
      }

      return <Navigate to={routes.auth} replace />;
    }

    return children;
  };

  const router = useMemo(
    () =>
      createBrowserRouter([
        {
          path: `${routes.publicTicket}/:eventId/:ticketId`,
          element: (
            <Suspense fallback={<SplashLoader />}>
              <PublicTicketPage />
            </Suspense>
          ),
          errorElement: <ErrorUiPage />,
        },
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
            {
              path: routes.pendingApprovals,
              element: <PendingApprovalsPage />,
            },

            { path: routes.articleMgmt, element: <ArticlesManagement /> },
            { path: routes.articleDetails, element: <ArticleDetails /> },

            { path: routes.eventsMgmt, element: <EventsMgmtPage /> },
            { path: routes.eventDetails, element: <EventDetailsPage /> },

            { path: routes.productsMgmt, element: <ProductsMgmtPage /> },
            { path: routes.miniCampaign, element: <MiniCampaignsMgmtPage /> },

            { path: routes.eventsMgmt, element: <EventsMgmtPage /> },
            { path: routes.eventDetails, element: <EventDetailsPage /> },
            {
              path: routes.eventSessionMgmt,
              element: <EventSessionMgmtPage />,
            },

            { path: routes.productDetails, element: <ProductDetailsPage /> },
            { path: routes.contentMgmt, element: <ContentMgmtPage /> },
            { path: routes.voucherMgmt, element: <VouchersMgmtPage /> },
            { path: routes.voucherDetails, element: <VoucherDetailsPage /> },

            { path: routes.profile, element: <ProfilePage /> },
            { path: routes.dmoMgmt, element: <DmosMgmtPage /> },
            { path: routes.partners, element: <PartnersPage /> },
            { path: routes.campaignMgmt, element: <CampaignsMgmtPage /> },
            { path: routes.authorityMgmt, element: <AuthoritiesMgmtPage /> },
            { path: routes.websiteMgmt, element: <WebsiteMgmtPage /> },
            { path: routes.websiteConfig, element: <WebsiteConfigPage /> },

            { path: routes.ordersMgmt, element: <OrdersMgmtPage /> },
            {
              path: routes.notificationMgmt,
              element: <NotificationsMgmtPage />,
            },
            { path: routes.dynamicPages, element: <DynamicPageMgmtPage /> },

            { path: routes.promotionMgmt, element: <PromotionsMgmtPage /> },
            { path: routes.poiMgmt, element: <PoiMgmtPage /> },
            { path: routes.poiDetails, element: <PoiDetailsPage /> },
            { path: routes.users, element: <UsersMgmtPage /> },
            {
              path: routes.websiteCrashes,
              element: <WebsiteCrashesPage />,
            },
            {
              path: routes.websiteCrashDetails,
              element: <WebsiteCrashDetailsPage />,
            },

            { path: "/*", element: <DashboardPage /> },
          ],
        },
        {
          element: (
            <Suspense fallback={<SplashLoader />}>
              <ProtectedRoute isLoginPage>
                <>
                  <RouterProgressBar />
                  <Outlet />
                </>
              </ProtectedRoute>
            </Suspense>
          ),
          errorElement: <ErrorUiPage />,
          children: [{ path: routes.auth, element: <AuthPage /> }],
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
      ]),
    [],
  );

  return <RouterProvider router={router} />;
}

export default App;
