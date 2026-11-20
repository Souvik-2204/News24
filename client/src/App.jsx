import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Layouts
import TopBroadcastBar from './components/layout/TopBroadcastBar';
import Header from './components/layout/Header';
import TVTicker from './components/layout/TVTicker';
import CategoryNav from './components/layout/CategoryNav';
import Footer from './components/layout/Footer';
import AdminLayout from './components/layout/AdminLayout';

// Public Pages
import HomePage from './pages/HomePage';
import ArticlePage from './pages/ArticlePage';
import CategoryPage from './pages/CategoryPage';
import SearchPage from './pages/SearchPage';
import PricingPage from './pages/PricingPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Admin CMS Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminReviewQueue from './pages/admin/AdminReviewQueue';
import AdminArticles from './pages/admin/AdminArticles';
import AdminArticleEdit from './pages/admin/AdminArticleEdit';
import AdminCategories from './pages/admin/AdminCategories';
import AdminSubscriptions from './pages/admin/AdminSubscriptions';
import AdminUsers from './pages/admin/AdminUsers';
import AdminLogs from './pages/admin/AdminLogs';

function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-navy-950 text-slate-100">
      <TopBroadcastBar />
      <Header />
      <TVTicker />
      <CategoryNav />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public News Channel & Reader Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/article/:slug" element={<ArticlePage />} />
            <Route path="/category/:slug" element={<CategoryPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Dedicated Newsroom Editorial CMS Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="queue" element={<AdminReviewQueue />} />
            <Route path="articles" element={<AdminArticles />} />
            <Route path="articles/new" element={<AdminArticleEdit />} />
            <Route path="articles/:id/edit" element={<AdminArticleEdit />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="subscriptions" element={<AdminSubscriptions />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="logs" element={<AdminLogs />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
