import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Image as ImageIcon, CheckCircle, UserPlus, ShieldCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { GOOGLE_AUTH_URL } from '../utils/apiConfig';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student'
  });
  const [profilePic, setProfilePic] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    setLoading(true);
    
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (profilePic) data.append('profilePic', profilePic);

    const success = await signup(data);
    if (success) navigate('/');
    setLoading(false);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] py-12 px-6 bg-gray-50 relative overflow-hidden flex items-center justify-center">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl w-full bg-white rounded-[40px] shadow-xl overflow-hidden border border-gray-100 flex flex-col md:flex-row z-10"
      >
        {/* Sidebar */}
        <div className="hidden lg:flex lg:w-2/5 p-12 flex-col justify-between text-white relative overflow-hidden">
          <div className="absolute inset-0 z-0 bg-gray-900">
            <img 
              src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop" 
              alt="Students" 
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/80 to-transparent" />
          </div>

          <div className="relative z-10">
          </div>
        </div>

        {/* Form Panel */}
        <div className="flex-1 p-8 md:p-12">
          <div className="mb-8">
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Avatar */}
            <div className="flex flex-col items-center bg-gray-50 p-5 rounded-3xl border border-dashed border-gray-200 group hover:border-primary/30 transition-all cursor-pointer relative max-w-xs mx-auto">
              <div className="w-20 h-20 rounded-[20px] bg-white shadow-lg overflow-hidden border-2 border-white flex items-center justify-center relative">
                {preview ? (
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-6 h-6 text-gray-300" />
                )}
                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                  <UserPlus className="text-white w-5 h-5" />
                </div>
              </div>
              <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
              <div className="text-center mt-2">
                <h4 className="text-sm font-black text-gray-800">Profile Badge</h4>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Click to upload</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-800 uppercase tracking-widest ml-1 block">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-primary transition-colors" />
                  <input
                    type="text"
                    placeholder="E.g. John Doe"
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-transparent rounded-[18px] focus:border-primary/20 focus:bg-white focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-base"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-800 uppercase tracking-widest ml-1 block">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-primary transition-colors" />
                  <input
                    type="email"
                    placeholder="university@email.com"
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-transparent rounded-[18px] focus:border-primary/20 focus:bg-white focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-base"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-800 uppercase tracking-widest ml-1 block">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-primary transition-colors" />
                  <input
                    type="password"
                    placeholder="Min. 8 chars"
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-transparent rounded-[18px] focus:border-primary/20 focus:bg-white focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-base"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-800 uppercase tracking-widest ml-1 block">Verify Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-primary transition-colors" />
                  <input
                    type="password"
                    placeholder="Repeat password"
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-transparent rounded-[18px] focus:border-primary/20 focus:bg-white focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-base"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 text-center">
              <label className="text-xs font-black text-gray-800 uppercase tracking-widest mb-4 block">Account Type</label>
              <div className="flex justify-center gap-4">
                {['student', 'organizer'].map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setFormData({ ...formData, role })}
                    className={`px-6 py-3 rounded-xl border-2 transition-all font-black uppercase tracking-widest text-xs ${
                      formData.role === role 
                      ? 'border-primary bg-primary text-white shadow-lg' 
                      : 'border-gray-50 bg-gray-50 text-gray-400 hover:border-gray-200'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-4 rounded-[22px] font-black uppercase tracking-widest text-base hover:bg-primary-dark transition-all disabled:opacity-50 shadow-xl shadow-primary/20 mt-8 flex items-center justify-center group"
            >
              {loading ? 'Creating Account...' : (
                <>Sign Up Now <CheckCircle className="ml-3 w-5 h-5 group-hover:scale-110 transition-transform" /></>
              )}
            </button>

            <div className="relative flex items-center justify-center py-6">
              <div className="flex-grow border-t border-gray-100"></div>
              <span className="mx-4 text-[10px] font-black text-gray-300 uppercase tracking-widest">Or Join With</span>
              <div className="flex-grow border-t border-gray-100"></div>
            </div>

            <button
              type="button"
              onClick={() => window.location.href = `${GOOGLE_AUTH_URL}?role=${formData.role}`}
              className="w-full bg-white border-2 border-gray-100 text-gray-900 py-4 rounded-[22px] font-black uppercase tracking-widest text-[12px] hover:border-primary transition-all flex items-center justify-center gap-4 group/google shadow-sm hover:shadow-md"
            >
              <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 group-hover/google:scale-110 transition-transform">
                <img src="https://www.gstatic.com/images/branding/googleg/1x/googleg_standard_color_128dp.png" alt="G" className="w-6 h-6" />
              </div>
              Continue with Google
            </button>

            <p className="text-center mt-6 text-base font-bold text-gray-600">
              Already a member? <Link to="/login" className="text-primary hover:underline underline-offset-4 font-black">Login</Link>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
