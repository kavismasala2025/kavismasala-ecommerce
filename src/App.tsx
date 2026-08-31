import { useEffect } from 'react';
import { RouterProvider, useRouter } from './lib/router';
import { CartProvider } from './context/CartContext';
import { AdminProvider, useAdmin } from './context/AdminContext';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import WhatsAppFloat from './components/WhatsAppFloat';
import ChatBot from './components/ChatBot';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Success from './pages/Success';
import AboutUs from './pages/AboutUs';
import TrackOrder from './pages/TrackOrder';
import ReturnPolicy from './pages/ReturnPolicy';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Account from './pages/Account';
import AccountProfile from './pages/AccountProfile';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrders from './pages/admin/AdminOrders';
import AdminProducts from './pages/admin/AdminProducts';
import AdminCategories from './pages/admin/AdminCategories';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminInventory from './pages/admin/AdminInventory';
import AdminCoupons from './pages/admin/AdminCoupons';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminSettings from './pages/admin/AdminSettings';

function Redirect({ to }: { to: string }) {
  const { navigate } = useRouter();
  useEffect(() => { navigate(to); }, []);
  return null;
}

function Routes() {
  const { path } = useRouter();
  const { isAuthed } = useAdmin();

  const cleanPath = path.split('?')[0];

  // ── MyPortal area ──────────────────────────────────────────────────────────
// /myportal → MyPortal login
// Authenticated visitors to /myportal are sent to the dashboard.
// Protected /myportal/* routes require MyPortal authentication.

if (cleanPath === '/myportal' || cleanPath === '/myportal/') {
  return isAuthed ? <Redirect to="/myportal/dashboard" /> : <AdminLogin />;
}

if (cleanPath.startsWith('/myportal/')) {
  if (!isAuthed) return <Redirect to="/myportal" />;

  switch (cleanPath) {
    case '/myportal/dashboard':
      return <AdminDashboard />;

    case '/myportal/orders':
      return <AdminOrders />;

    case '/myportal/products':
      return <AdminProducts />;

    case '/myportal/categories':
      return <AdminCategories />;

    case '/myportal/customers':
      return <AdminCustomers />;

    case '/myportal/inventory':
      return <AdminInventory />;

    case '/myportal/coupons':
      return <AdminCoupons />;

    case '/myportal/analytics':
      return <AdminAnalytics />;

    case '/myportal/settings':
      return <AdminSettings />;

    default:
      return <AdminDashboard />;
  }
}
 
  // Account routes — standalone, no public header/footer
  if (cleanPath === '/account') {
    return <Account />;
  }
  if (cleanPath === '/account/profile') {
    return <AccountProfile />;
  }

  let page: React.ReactNode;
  if (cleanPath === '/' || cleanPath === '') {
    page = <Home />;
  } else if (cleanPath === '/shop') {
    page = <Shop />;
  } else if (cleanPath.startsWith('/product/')) {
    const slug = cleanPath.replace('/product/', '');
    page = <ProductDetail slug={slug} />;
  } else if (cleanPath === '/cart') {
    page = <Cart />;
  } else if (cleanPath === '/checkout') {
    page = <Checkout />;
  } else if (cleanPath === '/success') {
    page = <Success />;
  } else if (cleanPath === '/about') {
    page = <AboutUs />;
  } else if (cleanPath === '/track') {
    page = <TrackOrder />;
  } else if (cleanPath === '/return-policy') {
    page = <ReturnPolicy />;
  } else if (cleanPath === '/privacy') {
    page = <PrivacyPolicy />;
  } else {
    page = (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold text-stone-900">Page not found</h1>
        <a href="/" className="text-maroon-700 font-semibold mt-4 inline-block hover:underline">Go home</a>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-cream-50">
      <Header />
      <main className="flex-1">{page}</main>
      <Footer />
      <WhatsAppFloat />
      <ChatBot />
    </div>
  );
}

export default function App() {
  return (
    <RouterProvider>
      <AuthProvider>
        <CartProvider>
          <AdminProvider>
            <Routes />
          </AdminProvider>
        </CartProvider>
      </AuthProvider>
    </RouterProvider>
  );
}
