import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Bell } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isHomePage = location.pathname === '/';

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid min-h-[84px] grid-cols-[1fr_auto_1fr] items-center gap-6">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <img src="/logo.png" alt="Event Hub Logo" className="h-24 w-24 object-contain" />
              <span className="text-[1.9rem] font-black text-primary tracking-tight">EVENT HUB</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center justify-center gap-7">
            <Link to="/events" className="text-gray-700 hover:text-primary px-3 py-2 text-[15px] font-bold transition-colors">
              Events
            </Link>
            {isHomePage && (
              <Link to="/about" className="text-gray-700 hover:text-primary px-3 py-2 text-[15px] font-bold transition-colors">
                About Us
              </Link>
            )}

            {/* Organizer links */}
            {user?.role === 'organizer' && (
              <>
                <Link to="/create-event" className="text-gray-700 hover:text-primary px-3 py-2 text-[15px] font-bold transition-colors">
                  Create Event
                </Link>
                <Link to="/organizer" className="text-gray-700 hover:text-primary px-3 py-2 text-[15px] font-bold transition-colors">
                  Dashboard
                </Link>
                <Link to="/dl-requests" className="text-gray-700 hover:text-primary px-3 py-2 text-[15px] font-bold transition-colors">
                  DL Requests
                </Link>
              </>
            )}

            {/* Admin links */}
            {user?.role === 'admin' && (
              <>
                <Link to="/create-event" className="text-gray-700 hover:text-primary px-3 py-2 text-[15px] font-bold transition-colors">
                  Create Event
                </Link>
                <Link to="/admin" className="text-gray-700 hover:text-primary px-3 py-2 text-[15px] font-bold transition-colors">
                  Admin Panel
                </Link>
              </>
            )}

            {/* Student links */}
            {user?.role === 'student' && (
              <Link to="/my-events" className="text-gray-700 hover:text-primary px-3 py-2 text-[15px] font-bold transition-colors">
                My Registrations
              </Link>
            )}
          </div>

          <div className="flex items-center justify-end space-x-4">
            {user ? (
              <div className="flex items-center space-x-2">
                <NotificationDropdown />
                <div className="h-8 w-[1px] bg-gray-100 mx-2 hidden sm:block" />
                <Link to="/profile" className="flex items-center space-x-3 group">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 overflow-hidden">
                    {user.profilePic ? (
                      <img src={getServerUrl(user.profilePic)} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-primary font-black uppercase">{user.name[0]}</span>
                    )}
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-[15px] font-black text-gray-900 group-hover:text-primary transition-colors">{user.name}</div>
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{user.role}</div>
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-3 rounded-xl text-gray-400 hover:bg-red-50 hover:text-primary transition-all"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="text-gray-700 hover:text-primary px-3 py-2 text-[15px] font-bold">
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-primary text-white px-5 py-3 rounded-xl text-[15px] font-bold hover:bg-primary-dark transition-all shadow-md"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
