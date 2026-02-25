import React from 'react';
import { BrowserRouter as Router, Route, Routes, Outlet, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import AxiosInterceptor from './AxiosInterceptor';

import { loadStripe } from '@stripe/stripe-js';

import Login from './components/Login';
import Signup from './components/Signup';
import EnterEmail from './components/EnterEmail';
import ValidateEmail from './components/ValidateEmail';
import ResetPassword from './components/ResetPassword';
import AddPost from './components/AddPost';
import Feed from './components/Feed';
import ProfileView from './components/ProfileView';
import EditProfile from './components/EditProfile';
import FollowersView from './components/FollowersView';
import FollowingView from './components/FollowingView';
import NavigationBar from './components/NavigationBar';
import Notifications from './components/Notifications';
import NotFound from './components/NotFound';
import HashtagPage from './components/HashtagPage';
import PaymentPage from './components/PaymentPage';
import PaymentConfirmed from './components/PaymentConfirmed';
import PostStats from './components/PostStats';
import ReportsView from './components/ReportsView';
import AddAdminUser from './components/AddAdminUser';
import AllUsersView from './components/AllUsersView';
import PostView from './components/PostView';
import AdminStatistics from './components/AdminStatistics';
import ChangePassword from './components/ChangePassword';
import Explore from './components/Explore';
import ProfileStats from './components/ProfileStats';



const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

// Guard that redirects to NotFound (*) if user is not authenticated
const PrivateRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div></div>;
  }

  return user ? <Outlet /> : <Navigate to="*" replace />;
};

// Layout wrapper that shows Navbar conditionally and renders child routes
const AppLayout = () => {
  const location = useLocation();
  const { pathname } = location;

  const hideNavbarRoutes = ['/', '/register', '/enter/email'];
  const hideNavbarPrefix = ['/validate/email/', '/reset/password/', '/payment/confirmed/', '/payment/'];
  const hideNavbar =
    hideNavbarRoutes.includes(pathname) ||
    hideNavbarPrefix.some(prefix => pathname.startsWith(prefix));

  return (
    <>
      <Notifications />
      {!hideNavbar && <NavigationBar />}
      <Outlet />
    </>
  );
};

function App() {

  return (
    <Router>
      <AxiosInterceptor />

      <Routes>
        {/* Wrap login/signup/reset flows in layout */}
        <Route element={<AppLayout />}>
          {/* Public routes */}
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Signup />} />
          <Route path="/enter/email" element={<EnterEmail />} />
          <Route path="/validate/email/:token" element={<ValidateEmail />} />
          <Route path="/reset/password/:token" element={<ResetPassword />} />
          <Route path="/payment/confirmed" element={<PaymentConfirmed />} />
          


          <Route
            path="/payment/:userID"
            element={<PaymentPage amount={2000} testMode={true} />}
          />


          {/* Protected routes require authentication */}
          <Route element={<PrivateRoute />}>
            <Route path="/post" element={<AddPost />} />
            <Route path="/home" element={<Feed />} />
            <Route path="/post/:postID" element={<PostView />} />
            <Route path="/posts/hashtag/:hashtag" element={<HashtagPage />} />
            <Route path="/profile/:username" element={<ProfileView />} />
            <Route path="/profile/:username/edit" element={<EditProfile />} />
            <Route path="/profile/followers/:username" element={<FollowersView />} />
            <Route path="/profile/following/:username" element={<FollowingView />} />
            <Route path="/admin/reports" element={<ReportsView />} />
            <Route path="/admin/add/user" element={<AddAdminUser />} />
            <Route path="/admin/users" element={<AllUsersView />} />
            <Route path="/admin/stats" element={<AdminStatistics />} />
            <Route path="/post/:postID/stats" element={<PostStats />} />
            <Route path="/profile/:userID/stats" element={<ProfileStats />} />
            <Route path="/change/password" element={<ChangePassword />} />
            <Route path="/explore" element={<Explore />} />
          </Route>
        </Route>

        {/* Catch-all for 404/unauthorized, no layout wrapper => no Navbar */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
