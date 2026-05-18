import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { GOOGLE_AUTH_URL } from '../utils/apiConfig';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const [role, setRole] = useState('student');
  const navigate = useNavigate();

  const handleGoogleLogin = () => {
    window.location.href = `${GOOGLE_AUTH_URL}?role=${role}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const success = await login(email, password);
    if (success) navigate('/');
    setLoading(false);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6 bg-gray-50 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl w-full bg-white rounded-[40px] shadow-xl overflow-hidden border border-gray-100 flex flex-col md:flex-row z-10"
      >
        {/* Sidebar */}
        <div className="hidden lg:flex lg:w-1/3 p-12 flex-col justify-between text-white relative overflow-hidden">
          {/* Real Background Image */}
          <div className="absolute inset-0 z-0 bg-gray-900">
            <img 
              src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop" 
              alt="University" 
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/80 to-transparent" />
          </div>

          <div className="relative z-10">
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 p-10 md:p-14">
          <div className="mb-10">
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-5">
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-primary transition-colors" />
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-[20px] focus:border-primary/20 focus:bg-white focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-lg"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-primary transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="w-full pl-12 pr-12 py-4 bg-gray-50 border-2 border-transparent rounded-[20px] focus:border-primary/20 focus:bg-white focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-lg"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-all p-1"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" />
                <span className="ml-2 text-sm font-bold text-gray-500 group-hover:text-gray-700 transition-colors">Remember Me</span>
              </label>
              <Link to="/forgot-password" size="sm" className="text-sm font-black text-primary hover:underline underline-offset-4">Forgot Password?</Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-4 rounded-[20px] font-black uppercase tracking-widest text-sm hover:bg-primary-dark transition-all disabled:opacity-50 shadow-lg shadow-primary/20 flex items-center justify-center group"
            >
              {loading ? 'Authenticating...' : (
                <>Sign In Now <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>

            <div className="relative flex flex-col items-center justify-center py-6">
              <div className="w-full flex items-center mb-6">
                <div className="flex-grow border-t border-gray-100"></div>
                <span className="mx-4 text-[10px] font-black text-gray-300 uppercase tracking-widest">Or Continue With</span>
                <div className="flex-grow border-t border-gray-100"></div>
              </div>

              <div className="flex justify-center gap-4 mb-2">
                {['student', 'organizer'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      setRole(r);
                      if (r === 'student') {
                        setEmail('janvibajaj05@gmail.com');
                        setPassword('password123'); // Assuming common test password
                      } else if (r === 'organizer') {
                        setEmail('janvi1103.becse24@gmail.com');
                        setPassword('password123');
                      }
                    }}
                    className={`px-4 py-2 rounded-xl border-2 transition-all font-black uppercase tracking-widest text-[9px] ${
                      role === r 
                      ? 'border-primary bg-primary text-white shadow-md' 
                      : 'border-gray-50 bg-gray-50 text-gray-400 hover:border-gray-200'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full bg-white border-2 border-gray-100 text-gray-900 py-4 rounded-[22px] font-black uppercase tracking-widest text-[12px] hover:border-primary transition-all flex items-center justify-center gap-4 group/google shadow-sm hover:shadow-md"
            >
              <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 group-hover/google:scale-110 transition-transform">
                <img src="https://www.gstatic.com/images/branding/googleg/1x/googleg_standard_color_128dp.png" alt="G" className="w-6 h-6" />
              </div>
              Continue with Google
            </button>

            <p className="text-center mt-10 text-sm font-bold text-gray-400">
              Don't have an account? <Link to="/signup" className="text-primary hover:underline underline-offset-4">Create One</Link>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
