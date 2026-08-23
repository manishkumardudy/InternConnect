import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// Layout & Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import MobileAccessBlocker from './components/MobileAccessBlocker';

// Pages
import LandingPage from './pages/LandingPage';
import BrowseListings from './pages/BrowseListings';
import ListingDetail from './pages/ListingDetail';
import AuthPage from './pages/AuthPage';
import StudentDashboard from './pages/StudentDashboard';
import StudentProfile from './pages/StudentProfile';
import MyApplications from './pages/MyApplications';
import RecruiterDashboard from './pages/RecruiterDashboard';
import PostListing from './pages/PostListing';
import CompanyProfile from './pages/CompanyProfile';
import ApplicantTracker from './pages/ApplicantTracker';
import PublicSpace from './pages/PublicSpace';
import ForgotPassword from './pages/ForgotPassword';
import ResumeBuilder from './pages/ResumeBuilder';
import LoginHistory from './pages/LoginHistory';
import Subscription from './pages/Subscription';
import Help from './pages/Help';
import BookmarkedJobs from './pages/BookmarkedJobs';

function App() {
  return (
    <MobileAccessBlocker>
      <AuthProvider>
        <SocketProvider>
          <Router>
            <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
              <Navbar />
              <main className="flex-grow">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/browse" element={<BrowseListings />} />
                  <Route path="/listings/:id" element={<ListingDetail />} />
                  <Route path="/help" element={<Help />} />
                  <Route path="/login" element={<AuthPage />} />
                  <Route path="/register" element={<AuthPage />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />

                  {/* Shared Protected Social Route */}
                  <Route
                    path="/public-space"
                    element={
                      <ProtectedRoute roles={['student', 'recruiter']}>
                        <PublicSpace />
                      </ProtectedRoute>
                    }
                  />

                  {/* Shared Protected Routes */}
                  <Route
                    path="/login-history"
                    element={
                      <ProtectedRoute roles={['student', 'recruiter']}>
                        <LoginHistory />
                      </ProtectedRoute>
                    }
                  />

                  {/* Student Protected Routes */}
                  <Route
                    path="/resume-builder"
                    element={
                      <ProtectedRoute roles={['student']}>
                        <ResumeBuilder />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/subscription"
                    element={
                      <ProtectedRoute roles={['student']}>
                        <Subscription />
                      </ProtectedRoute>
                    }
                  />

                  {/* Student Protected Routes */}
                  <Route
                    path="/student-dashboard"
                    element={
                      <ProtectedRoute roles={['student']}>
                        <StudentDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute roles={['student']}>
                        <StudentProfile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/my-applications"
                    element={
                      <ProtectedRoute roles={['student']}>
                        <MyApplications />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/saved-jobs"
                    element={
                      <ProtectedRoute roles={['student']}>
                        <BookmarkedJobs />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/bookmarks"
                    element={
                      <ProtectedRoute roles={['student']}>
                        <BookmarkedJobs />
                      </ProtectedRoute>
                    }
                  />

                  {/* Recruiter Protected Routes */}
                  <Route
                    path="/recruiter-dashboard"
                    element={
                      <ProtectedRoute roles={['recruiter']}>
                        <RecruiterDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/post-listing"
                    element={
                      <ProtectedRoute roles={['recruiter']}>
                        <PostListing />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/company-profile"
                    element={
                      <ProtectedRoute roles={['recruiter']}>
                        <CompanyProfile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/listing/:id/applicants"
                    element={
                      <ProtectedRoute roles={['recruiter']}>
                        <ApplicantTracker />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/listings/:id/applicants"
                    element={
                      <ProtectedRoute roles={['recruiter']}>
                        <ApplicantTracker />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </SocketProvider>
      </AuthProvider>
    </MobileAccessBlocker>
  );
}

export default App;
