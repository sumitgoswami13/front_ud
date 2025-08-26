// App.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
  useParams,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import FileUpload from "./components/FileUpload";
import Registration from "./components/Registration";
import PaymentSummary from "./components/PaymentSummary";
import FileUploadProgress from "./components/FileUploadProgress";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";
import AdminUserDetail from "./components/AdminUserDetail";
import ApiDebug from "./components/ApiDebug";
import RazorpayTest from "./components/RazorpayTest";
import TermsConditions from "./components/TermsConditions";
import PrivacyPolicy from "./components/PrivacyPolicy";
import PricingPolicy from "./components/PricingPolicy";
import DeliveryPolicy from "./components/DeliveryPolicy";
import CancellationRefundPolicy from "./components/CancellationRefundPolicy";

import secureStore from "./utils/secureStorage";
const LOCAL_USER_KEY = "udin:user";       // where signup stores user profile
const ACCESS_TOKEN_KEY = "accessToken";   // where we store JWT access token

function AppShell() {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [showUploadProgress, setShowUploadProgress] = useState(false);
  const [transactionId, setTransactionId] = useState(null);
  const [paymentId, setPaymentId] = useState(null);

  // session
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [persistedUser, setPersistedUser] = useState(null);

  // admin session
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  // restore session on boot
  useEffect(() => {
    (async () => {
      const token = await secureStore.getItem(ACCESS_TOKEN_KEY);
      const userJson =
        (await secureStore.getItem(LOCAL_USER_KEY)) || (await secureStore.getItem("userData"));
      const parsed = userJson ? safeParse(userJson) : null;

      setIsLoggedIn(Boolean(token && parsed));
      setPersistedUser(parsed || null);

      // Check admin session
      const isAdminFlag = (await secureStore.getItem('isAdmin')) === 'true' || localStorage.getItem('isAdmin') === 'true';
      const adminData = (await secureStore.getItem('adminData')) || localStorage.getItem('adminData');
      setIsAdminLoggedIn(Boolean(isAdminFlag && adminData));
    })();
  }, []);

  const safeParse = (s) => {
    try {
      return JSON.parse(s);
    } catch {
      return null;
    }
  };

  // Guards
  const canGoRegistration = useMemo(() => uploadedFiles.length > 0, [uploadedFiles]);
  const canGoPayment = useMemo(
    () => Boolean(userInfo || persistedUser),
    [userInfo, persistedUser]
  );
  const canGoDashboard = useMemo(() => isLoggedIn, [isLoggedIn]);
  const canGoAdminDashboard = useMemo(() => isAdminLoggedIn, [isAdminLoggedIn]);
  const canGoAdminUserDetail = useMemo(() => isAdminLoggedIn, [isAdminLoggedIn]);

  // Hide chrome on login, dashboard, and admin routes
  const hideNavbar = location.pathname === "/login" || location.pathname === "/dashboard" ||
                     location.pathname.startsWith("/admin");
  const hideFooter = location.pathname === "/login" || location.pathname.startsWith("/admin");

  // Navigation handlers
  const handleProceedToRegistration = (files) => {
    setUploadedFiles(files || []);
    navigate("/register", { replace: true });
  };

  const handleRegistrationComplete = (user) => {
    setUserInfo(user);
    navigate("/payment", { replace: true });
  };

  const handlePaymentSuccess = (txId, payId) => {
    setTransactionId(txId);
    setPaymentId(payId);
    setShowUploadProgress(true); // keep modal; route stays /payment
  };

  const handleUploadComplete = () => {
    setShowUploadProgress(false);
    navigate("/login", { replace: true });
  };

  const handleLoginSuccess = async () => {
    setIsLoggedIn(true);
    const userJson =
      (await secureStore.getItem(LOCAL_USER_KEY)) || (await secureStore.getItem("userData"));
    setPersistedUser(userJson ? safeParse(userJson) : null);
    navigate("/dashboard", { replace: true });
  };

  const handleLogout = async () => {
    // Clear secure keys and legacy storage
    await secureStore.removeItem(ACCESS_TOKEN_KEY);
    await secureStore.removeItem('refreshToken');
    await secureStore.removeItem(LOCAL_USER_KEY);
    await secureStore.removeItem('userData');
    await secureStore.removeItem('adminData');
    await secureStore.removeItem('isAdmin');
    localStorage.clear();

    setIsLoggedIn(false);
    setPersistedUser(null);
    setUserInfo(null);
    setUploadedFiles([]);
    setTransactionId(null);
    setPaymentId(null);
    setShowUploadProgress(false);
    navigate("/upload", { replace: true });
  };

  const handleAdminLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    navigate("/admin/dashboard", { replace: true });
  };

  const handleAdminLogout = async () => {
    await secureStore.removeItem('adminData');
    await secureStore.removeItem('isAdmin');
    localStorage.removeItem('adminData');
    localStorage.removeItem('isAdmin');
    setIsAdminLoggedIn(false);
    setSelectedUserId(null);
    navigate("/admin/login", { replace: true });
  };

  const handleUserSelect = (userId) => {
    setSelectedUserId(userId);
    navigate(`/admin/user/${userId}`, { replace: true });
  };

  const handleBackToAdminDashboard = () => {
    setSelectedUserId(null);
    navigate("/admin/dashboard", { replace: true });
  };

  // Wrapper component to handle URL parameters for AdminUserDetail
  const AdminUserDetailWrapper = () => {
    const { userId } = useParams();

    // Sync selectedUserId with URL parameter if not already set
    useEffect(() => {
      if (userId && userId !== selectedUserId) {
        setSelectedUserId(userId);
      }
    }, [userId]);

    return (
      <AdminUserDetail
        userId={userId}
        onBack={handleBackToAdminDashboard}
        onLogout={handleAdminLogout}
      />
    );
  };

  return (
    <>
      {!hideNavbar && <Navbar />}

      <main className="flex-1">
        <Routes>
          {/* default */}
          <Route path="/" element={<Navigate to="/upload" replace />} />

          {/* Upload — open */}
          <Route
            path="/upload"
            element={<FileUpload onProceedToRegistration={handleProceedToRegistration} />}
          />

          {/* Registration — require files from this session */}
          <Route
            path="/register"
            element={
              canGoRegistration ? (
                <Registration
                  onBack={() => navigate("/upload")}
                  uploadedFiles={uploadedFiles}
                  onRegistrationComplete={handleRegistrationComplete}
                />
              ) : (
                <Navigate to="/upload" replace />
              )
            }
          />

          {/* Payment — require user info (from state or persisted) */}
          <Route
            path="/payment"
            element={
              canGoPayment ? (
                <PaymentSummary
                  userInfo={userInfo || persistedUser}
                  onBack={() => navigate("/register")}
                  onPaymentSuccess={handlePaymentSuccess}
                />
              ) : (
                <Navigate to="/register" replace />
              )
            }
          />

          {/* Login — always open */}
          <Route
            path="/login"
            element={
              <Login
                onBack={() => navigate("/upload")}
                onLoginSuccess={handleLoginSuccess}
              />
            }
          />

          {/* Dashboard — require session */}
          <Route
            path="/dashboard"
            element={
              canGoDashboard ? (
                <Dashboard onBack={() => navigate("/upload")} onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/login"
            element={
              <AdminLogin
                onBack={() => navigate("/upload")}
                onLoginSuccess={handleAdminLoginSuccess}
              />
            }
          />

          <Route
            path="/admin/dashboard"
            element={
              canGoAdminDashboard ? (
                <AdminDashboard
                  onLogout={handleAdminLogout}
                  onUserSelect={handleUserSelect}
                />
              ) : (
                <Navigate to="/admin/login" replace />
              )
            }
          />

          <Route
            path="/admin/user/:userId"
            element={
              canGoAdminUserDetail ? (
                <AdminUserDetailWrapper />
              ) : (
                <Navigate to="/admin/login" replace />
              )
            }
          />

          {/* Policy Pages */}
          <Route path="/terms" element={<TermsConditions />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/pricing-policy" element={<PricingPolicy />} />
          <Route path="/delivery-policy" element={<DeliveryPolicy />} />
          <Route path="/cancellation-refund" element={<CancellationRefundPolicy />} />

          {/* Dev helpers */}
          {import.meta.env.DEV && (
            <>
              <Route path="/debug" element={<ApiDebug />} />
              <Route path="/rzp" element={<RazorpayTest />} />
            </>
          )}

          {/* fallback */}
          <Route path="*" element={<Navigate to="/upload" replace />} />
        </Routes>
      </main>

      {!hideFooter && <Footer />}

      {/* Upload progress modal (post-payment) */}
      <FileUploadProgress
        isOpen={showUploadProgress}
        onClose={() => setShowUploadProgress(false)}
        onUploadComplete={handleUploadComplete}
        userInfo={userInfo || persistedUser}
        transactionId={transactionId}
        paymentId={paymentId}
      />
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppShell />
    </Router>
  );
}
