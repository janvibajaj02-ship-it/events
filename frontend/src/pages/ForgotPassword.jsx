import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { Mail, Lock, ArrowRight, KeyRound } from 'lucide-react';
import { motion } from 'framer-motion';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return toast.error('Passwords do not match');
    }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, newPassword });
      toast.success('Password updated successfully!');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6 bg-gray-50 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl w-full bg-white rounded-[40px] shadow-xl overflow-hidden border border-gray-100 z-10"
      >
        <div className="bg-primary p-12 text-center text-white relative">
          <KeyRound className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <h2 className="text-3xl font-black mb-2 tracking-tighter">Reset Security</h2>
          <p className="text-red-100 font-bold opacity-80">{step === 1 ? 'Verify Email' : 'New Password'}</p>
        </div>

        <form onSubmit={step === 1 ? (e) => { e.preventDefault(); setStep(2); } : handleReset} className="p-10 md:p-14">
          {step === 1 ? (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-primary transition-colors" />
                <input
                  type="email"
                  placeholder="Registered Email"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-[20px] focus:border-primary/20 focus:bg-white focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-lg"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-primary text-white py-4 rounded-[20px] font-black uppercase tracking-widest text-sm hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 flex items-center justify-center group"
              >
                Proceed <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-primary transition-colors" />
                <input
                  type="password"
                  placeholder="New Password"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-[20px] focus:border-primary/20 focus:bg-white focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-lg"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-primary transition-colors" />
                <input
                  type="password"
                  placeholder="Verify Password"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-[20px] focus:border-primary/20 focus:bg-white focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-lg"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-100 text-gray-500 py-4 rounded-[20px] font-black uppercase tracking-widest text-xs hover:bg-gray-200 transition-all"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] bg-primary text-white py-4 rounded-[20px] font-black uppercase tracking-widest text-sm hover:bg-primary-dark transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
                >
                  {loading ? 'Saving...' : 'Update Password'}
                </button>
              </div>
            </motion.div>
          )}

          <p className="text-center mt-10 text-sm font-bold text-gray-400">
            Remembered? <Link to="/login" className="text-primary hover:underline underline-offset-4">Login</Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
