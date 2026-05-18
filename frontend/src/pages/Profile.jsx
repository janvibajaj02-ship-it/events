import { useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, School, Smartphone, Hash, Calendar, LogOut, Camera, Edit3, Check, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import api from '../api/axios';

const Profile = () => {
  const { user, logout, setUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    rollNo: user?.rollNo || '',
    phone: user?.phone || '',
    department: user?.department || '',
  });
  const fileInputRef = useRef(null);

  if (!user) return null;

  const stats = [
    { label: 'Member Since', value: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently', icon: Calendar },
    { label: 'Role', value: user.role.toUpperCase(), icon: Shield },
    { label: 'Account Type', value: user.googleId ? 'Google SSO' : 'Standard', icon: User },
  ];

  const handlePicChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profilePic', file);

    setUploading(true);
    try {
      const { data } = await api.put('/auth/profile-pic', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUser(data.user);
      toast.success('Profile picture updated!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.put('/auth/profile', form);
      setUser(data.user);
      setEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({
      name: user.name || '',
      rollNo: user.rollNo || '',
      phone: user.phone || '',
      department: user.department || '',
    });
    setEditing(false);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] py-12 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100"
        >
          {/* Header/Cover */}
          <div className="h-48 bg-primary relative">
            <div className="absolute -bottom-16 left-10">
              <div
                className="relative w-32 h-32 rounded-3xl bg-white p-1 shadow-2xl overflow-hidden border-4 border-white cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
                title="Click to change photo"
              >
                {user.profilePic ? (
                  <img
                    src={getServerUrl(user.profilePic)}
                    alt="Profile"
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  <div className="w-full h-full bg-red-50 flex items-center justify-center text-primary text-4xl font-black rounded-2xl">
                    {user.name[0]}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                  {uploading ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Camera className="w-7 h-7 text-white mb-1" />
                      <span className="text-white text-[9px] font-black uppercase tracking-widest">Change</span>
                    </>
                  )}
                </div>
              </div>
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handlePicChange} className="hidden" />
            </div>
          </div>

          <div className="pt-20 pb-10 px-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h1 className="text-4xl font-black text-gray-900 mb-1">{user.name}</h1>
                <p className="text-gray-500 font-bold flex items-center">
                  <Mail className="w-4 h-4 mr-2" /> {user.email}
                </p>
                <p className="text-xs text-gray-400 mt-2 font-bold">Click on your photo to update it</p>
              </div>
              <button
                onClick={logout}
                className="flex items-center px-6 py-3 bg-red-50 text-primary font-black uppercase tracking-widest text-xs rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm"
              >
                <LogOut className="w-4 h-4 mr-2" /> Logout Account
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              {stats.map((stat, i) => (
                <div key={i} className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <stat.icon className="w-6 h-6 text-primary mb-3" />
                  <div className="text-xs font-black text-gray-400 uppercase tracking-widest">{stat.label}</div>
                  <div className="text-lg font-black text-gray-900">{stat.value}</div>
                </div>
              ))}
            </div>

            {user.role === 'student' && (
              <div className="mt-12 bg-white border border-gray-100 rounded-3xl p-8">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-black text-gray-900 flex items-center">
                    <School className="w-6 h-6 mr-3 text-primary" /> Academic Profile
                  </h3>
                  {!editing ? (
                    <button
                      onClick={() => setEditing(true)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-primary/10 text-primary font-black uppercase tracking-widest text-xs rounded-xl hover:bg-primary hover:text-white transition-all"
                    >
                      <Edit3 className="w-4 h-4" /> Edit
                    </button>
                  ) : (
                    <div className="flex gap-3">
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-black uppercase tracking-widest text-xs rounded-xl hover:bg-primary-dark transition-all disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={handleCancel}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-600 font-black uppercase tracking-widest text-xs rounded-xl hover:bg-gray-200 transition-all"
                      >
                        <X className="w-4 h-4" /> Cancel
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Roll Number */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                      <Hash className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Roll Number</div>
                      {editing ? (
                        <input
                          type="text"
                          value={form.rollNo}
                          onChange={(e) => setForm({ ...form, rollNo: e.target.value })}
                          placeholder="e.g. 2210990234"
                          className="w-full px-4 py-2 bg-gray-50 border-2 border-primary/20 rounded-xl font-black text-gray-800 outline-none focus:border-primary transition-all"
                        />
                      ) : (
                        <div className="font-black text-gray-800">{user.rollNo || <span className="text-gray-400 font-bold">Not Provided</span>}</div>
                      )}
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                      <Smartphone className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Phone Number</div>
                      {editing ? (
                        <input
                          type="tel"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          placeholder="e.g. 9876543210"
                          className="w-full px-4 py-2 bg-gray-50 border-2 border-primary/20 rounded-xl font-black text-gray-800 outline-none focus:border-primary transition-all"
                        />
                      ) : (
                        <div className="font-black text-gray-800">{user.phone || <span className="text-gray-400 font-bold">Not Provided</span>}</div>
                      )}
                    </div>
                  </div>

                  {/* Department */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                      <School className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Department</div>
                      {editing ? (
                        <input
                          type="text"
                          value={form.department}
                          onChange={(e) => setForm({ ...form, department: e.target.value })}
                          placeholder="e.g. Computer Science"
                          className="w-full px-4 py-2 bg-gray-50 border-2 border-primary/20 rounded-xl font-black text-gray-800 outline-none focus:border-primary transition-all"
                        />
                      ) : (
                        <div className="font-black text-gray-800">{user.department || <span className="text-gray-400 font-bold">Not Provided</span>}</div>
                      )}
                    </div>
                  </div>

                  {/* Name */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Display Name</div>
                      {editing ? (
                        <input
                          type="text"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          placeholder="Your full name"
                          className="w-full px-4 py-2 bg-gray-50 border-2 border-primary/20 rounded-xl font-black text-gray-800 outline-none focus:border-primary transition-all"
                        />
                      ) : (
                        <div className="font-black text-gray-800">{user.name}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
