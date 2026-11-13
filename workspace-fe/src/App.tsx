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
  ChatPage,
  AuthPage,
  BusinessesMgmtPage,
  PendingApprovalsPage,
  ProductsMgmtPage,
  EventsMgmtPage,
  ProfilePage,
  OrdersMgmtPage,
  VouchersMgmtPage,
  PunchpassMgmtPage,
  PunchPassDetailsPage,
  PunchPassScanMgmtPage,
  EventDetailsPage,
  BusinessDetailsPage,
  ProductDetailsPage,
  VoucherDetailsPage,
  ContentMgmtPage,
  ErrorUiPage,
  NoInternetPage,
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
  ScoreSettingsPage,
  ScoreInsightsPage,
  EventSessionMgmtPage,
  TripsMgmtPage,
  TripDetailsPage,
  StatsSummaryPage,
  PaymentMgmtPage,
  PaymentTransactionsPage,
  UtmBuilderPage,
  MiniSiteMgmtPage,
  MiniSiteDetailsPage,
  OfflineOrdersMgmtPage,
  EmailConfigMgmtPage,
  EmailActivityMgmtPage,
  DashboardMgmtPage,
} from "@/pages";
import OrdersSummaryMgmtPage from "@/pages/orders-summary-mgmt";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { useUserRoles } from "@/hooks/useUserRoles";
import {
  IdleLogout,
  SplashLoader,
  SyncLanguagePreference,
} from "./components/shared";
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
import DocumentsManagement from "./pages/documents-mgmt";
import PublicTicketPage from "./pages/public-ticket";
import PublicSessionPage from "./pages/public-session";
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

  // Handle internet connection monitoring
  useEffect(() => {
    const handleOffline = () => {
      // Only redirect if not already on no-internet page
      if (window.location.pathname !== routes.noInternet) {
        // Save current URL for restoration
        sessionStorage.setItem(
          "last_valid_url",
          window.location.pathname + window.location.search,
        );
        window.location.href = routes.noInternet;
      }
    };

    const handleOnline = () => {
      // When connection is restored, reload to restore original content
      const lastUrl = sessionStorage.getItem("last_valid_url");
      if (lastUrl && window.location.pathname === routes.noInternet) {
        sessionStorage.removeItem("last_valid_url");
        window.location.href = lastUrl;
      } else if (window.location.pathname === routes.noInternet) {
        // If no saved URL, go to dashboard
        window.location.href = routes.dashboard;
      }
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    // Check initial connection status
    if (!navigator.onLine && window.location.pathname !== routes.noInternet) {
      sessionStorage.setItem(
        "last_valid_url",
        window.location.pathname + window.location.search,
      );
      window.location.href = routes.noInternet;
    }

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

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
    const isPublicSessionPath = window.location.pathname.startsWith(
      routes.publicSession,
    );

    // Skip for QR mode and public ticket/session pages
    if (isOrdersManagement || isPublicTicketPath || isPublicSessionPath) return;

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
    const isPublicSession = window.location.pathname.startsWith(
      routes.publicSession,
    );

    if (isPublicTicket || isPublicSession) {
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
      if (
        attemptedPath &&
        attemptedPath !== "/" &&
        attemptedPath !== routes.auth
      ) {
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

  const SuperadminRoute: React.FC<{ children: React.ReactNode }> = ({
    children,
  }) => {
    const { isSuperadmin } = useUserRoles();
    if (!isSuperadmin) {
      return <Navigate to={routes.dashboard} replace />;
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
          path: `${routes.publicSession}/:wrapperId/:sessionBookingId`,
          element: (
            <Suspense fallback={<SplashLoader />}>
              <PublicSessionPage />
            </Suspense>
          ),
          errorElement: <ErrorUiPage />,
        },
        {
          path: routes.noInternet,
          element: (
            <Suspense fallback={<SplashLoader />}>
              <NoInternetPage />
            </Suspense>
          ),
        },
        {
          element: (
            <Suspense fallback={<SplashLoader />}>
              <ProtectedRoute>
                <IdleLogout />
                <SyncLanguagePreference />
                <RootLayout />
              </ProtectedRoute>
            </Suspense>
          ),
          errorElement: <ErrorUiPage />,
          children: [
            { path: routes.dashboard, element: <DashboardPage /> },
            {
              path: routes.dashboardDemo,
              element: <DashboardMgmtPage />,
            },
            {
              path: routes.analyticsDashboard,
              element: <AnalyticsDashboardPage />,
            },
            { path: routes.chat, element: <ChatPage /> },
            {
              path: routes.statsSummary,
              element: <StatsSummaryPage />,
            },

            { path: routes.businessMgmt, element: <BusinessesMgmtPage /> },
            { path: routes.businessDetails, element: <BusinessDetailsPage /> },
            {
              path: routes.pendingApprovals,
              element: <PendingApprovalsPage />,
            },

            { path: routes.articleMgmt, element: <ArticlesManagement /> },
            { path: routes.articleDetails, element: <ArticleDetails /> },
            {
              path: routes.vendorReconciliationMgmt,
              element: <PaymentMgmtPage />,
            },
            {
              path: routes.paymentTransactions,
              element: <PaymentTransactionsPage />,
            },
            { path: routes.articleMgmt, element: <ArticlesManagement /> },
            { path: routes.articleDetails, element: <ArticleDetails /> },

            {
              path: routes.documentMgmt,
              element: (
                <SuperadminRoute>
                  <DocumentsManagement />
                </SuperadminRoute>
              ),
            },
            { path: routes.tripsMgmt, element: <TripsMgmtPage /> },
            { path: routes.tripDetails, element: <TripDetailsPage /> },

            { path: routes.eventsMgmt, element: <EventsMgmtPage /> },
            { path: routes.eventDetails, element: <EventDetailsPage /> },
            { path: routes.eventsMgmt, element: <EventsMgmtPage /> },
            { path: routes.eventDetails, element: <EventDetailsPage /> },

            { path: routes.productsMgmt, element: <ProductsMgmtPage /> },

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
            { path: routes.punchPassMgmt, element: <PunchpassMgmtPage /> },
            {
              path: routes.punchPassDetails,
              element: <PunchPassDetailsPage />,
            },
            {
              path: routes.punchPassScanMgmt,
              element: <PunchPassScanMgmtPage />,
            },

            { path: routes.profile, element: <ProfilePage /> },
            { path: routes.dmoMgmt, element: <DmosMgmtPage /> },
            { path: routes.partners, element: <PartnersPage /> },
            { path: routes.campaignMgmt, element: <CampaignsMgmtPage /> },
            { path: routes.authorityMgmt, element: <AuthoritiesMgmtPage /> },
            { path: routes.websiteMgmt, element: <WebsiteMgmtPage /> },
            { path: routes.websiteConfig, element: <WebsiteConfigPage /> },

            { path: routes.ordersMgmt, element: <OrdersMgmtPage /> },
            {
              path: routes.ordersSummaryMgmt,
              element: <OrdersSummaryMgmtPage />,
            },
            {
              path: routes.notificationMgmt,
              element: <NotificationsMgmtPage />,
            },
            {
              path: routes.offlineOrdersMgmt,
              element: <OfflineOrdersMgmtPage />,
            },

            { path: routes.dynamicPages, element: <DynamicPageMgmtPage /> },

            { path: routes.promotionMgmt, element: <PromotionsMgmtPage /> },
            { path: routes.utmBuilder, element: <UtmBuilderPage /> },
            {
              path: routes.emailConfigMgmt,
              element: (
                <SuperadminRoute>
                  <EmailConfigMgmtPage />
                </SuperadminRoute>
              ),
            },
            {
              path: routes.emailActivityMgmt,
              element: (
                <SuperadminRoute>
                  <EmailActivityMgmtPage />
                </SuperadminRoute>
              ),
            },
            { path: routes.poiMgmt, element: <PoiMgmtPage /> },
            { path: routes.poiDetails, element: <PoiDetailsPage /> },
            { path: routes.users, element: <UsersMgmtPage /> },
            { path: routes.miniSiteMgmt, element: <MiniSiteMgmtPage /> },
            { path: routes.miniSiteDetails, element: <MiniSiteDetailsPage /> },
            {
              path: routes.websiteCrashes,
              element: <WebsiteCrashesPage />,
            },
            {
              path: routes.websiteCrashDetails,
              element: <WebsiteCrashDetailsPage />,
            },
            {
              path: routes.scoreSettings,
              element: (
                <SuperadminRoute>
                  <ScoreSettingsPage />
                </SuperadminRoute>
              ),
            },
            {
              path: routes.scoreInsights,
              element: (
                <SuperadminRoute>
                  <ScoreInsightsPage />
                </SuperadminRoute>
              ),
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
