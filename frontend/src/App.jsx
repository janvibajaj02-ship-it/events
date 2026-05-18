import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import { Suspense, lazy } from 'react';

// Eagerly load core pages
import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';

// Lazy load feature pages
import RegistrationForm from './pages/RegistrationForm';
import MyRegistrations from './pages/MyRegistrations';
const Events = lazy(() => import('./pages/Events'));
const CreateEvent = lazy(() => import('./pages/CreateEvent'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const OrganizerDashboard = lazy(() => import('./pages/OrganizerDashboard'));
// const RegistrationForm = lazy(() => import('./pages/RegistrationForm'));
// const MyRegistrations = lazy(() => import('./pages/MyRegistrations'));
const Profile = lazy(() => import('./pages/Profile'));
const DLRequests = lazy(() => import('./pages/DLRequests'));
const AttendanceLogs = lazy(() => import('./pages/AttendanceLogs'));
const Navbar = lazy(() => import('./components/Navbar'));
const AttendanceScanner = lazy(() => import('./pages/AttendanceScanner'));
const AdminDLDashboard = lazy(() => import('./pages/AdminDLDashboard'));
const OrganizerStats = lazy(() => import('./pages/OrganizerStats'));
const Chatbot = lazy(() => import('./components/Chatbot'));

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-white flex flex-col font-sans">
          <Suspense fallback={<div className="h-16 bg-white border-b border-gray-100 shadow-sm animate-pulse"></div>}>
            <Navbar />
          </Suspense>
          
          <main className="flex-grow">
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            }>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/events" element={<Events />} />
                
                <Route path="/create-event" element={
                  <ProtectedRoute roles={['organizer', 'admin']}>
                    <CreateEvent />
                  </ProtectedRoute>
                } />

                <Route path="/admin" element={
                  <ProtectedRoute roles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />

                <Route path="/admin/attendance-logs" element={
                  <ProtectedRoute roles={['admin']}>
                    <AttendanceLogs />
                  </ProtectedRoute>
                } />

                <Route path="/organizer" element={
                  <ProtectedRoute roles={['organizer', 'admin']}>
                    <OrganizerDashboard />
                  </ProtectedRoute>
                } />

                <Route path="/organizer/scan/:eventId" element={
                  <ProtectedRoute roles={['organizer', 'admin']}>
                    <AttendanceScanner />
                  </ProtectedRoute>
                } />

                <Route path="/dl-requests" element={
                  <ProtectedRoute roles={['organizer', 'admin']}>
                    <DLRequests />
                  </ProtectedRoute>
                } />

                <Route path="/admin/dl-management" element={
                  <ProtectedRoute roles={['admin']}>
                    <AdminDLDashboard />
                  </ProtectedRoute>
                } />

                <Route path="/admin/organizer-stats" element={
                  <ProtectedRoute roles={['admin']}>
                    <OrganizerStats />
                  </ProtectedRoute>
                } />

                <Route path="/my-events" element={
                  <ProtectedRoute roles={['student', 'organizer', 'admin']}>
                    <MyRegistrations />
                  </ProtectedRoute>
                } />

                <Route path="/register/:eventId" element={
                  <ProtectedRoute roles={['student', 'organizer', 'admin']}>
                    <RegistrationForm />
                  </ProtectedRoute>
                } />

                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />

                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Suspense>
          </main>
          <Suspense fallback={null}>
            <Chatbot />
          </Suspense>
          <Toaster position="top-right" />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
