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

  // ── Admin area (completely separate from the public site) ──────────────────
  // /admin → full-page login (never redirects to the customer homepage).
  // Authenticated visitors to /admin are sent to the dashboard.
  // Any protected /admin/* route without a session redirects to /admin.
  if (cleanPath === '/admin' || cleanPath === '/admin/') {
    return isAuthed ? <Redirect to="/admin/dashboard" /> : <AdminLogin />;
  }
  if (cleanPath.startsWith('/admin/')) {
    if (!isAuthed) return <Redirect to="/admin" />;
    switch (cleanPath) {
      case '/admin/dashboard': return <AdminDashboard />;
      case '/admin/orders': return <AdminOrders />;
      case '/admin/products': return <AdminProducts />;
      case '/admin/categories': return <AdminCategories />;
      case '/admin/customers': return <AdminCustomers />;
      case '/admin/inventory': return <AdminInventory />;
      case '/admin/coupons': return <AdminCoupons />;
      case '/admin/analytics': return <AdminAnalytics />;
      case '/admin/settings': return <AdminSettings />;
      default: return <AdminDashboard />;
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
