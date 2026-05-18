import { useEffect, useState } from 'react';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { FileText, CheckCircle, XCircle, Clock, Search, Filter, User, Calendar, MapPin, Award, Check, X } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

const STATUS_ICONS = {
  pending: <Clock className="w-4 h-4 text-yellow-500" />,
  approved: <CheckCircle className="w-4 h-4 text-green-500" />,
  rejected: <XCircle className="w-4 h-4 text-red-500" />,
};

const AdminDLDashboard = () => {
  const [dls, setDls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const fetchDLs = async () => {
    try {
      const { data } = await api.get('/duty-leave/admin/all-dls');
      setDls(data);
    } catch {
      toast.error('Failed to load DL dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDLs();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.put(`/duty-leave/status/${id}`, { status });
      toast.success(`DL ${status}!`);
      fetchDLs();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const filtered = dls.filter(dl => {
    const matchSearch =
      dl.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      dl.eventId?.title?.toLowerCase().includes(search.toLowerCase()) ||
      dl.rollNo?.toLowerCase().includes(search.toLowerCase());
    if (filter === 'all') return matchSearch;
    return matchSearch && dl.status === filter;
  });

  const stats = {
    total: dls.length,
    approved: dls.filter(d => d.status === 'approved').length,
    pending: dls.filter(d => d.status === 'pending').length,
    rejected: dls.filter(d => d.status === 'rejected').length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 flex items-center gap-4">
            <FileText className="w-10 h-10 text-primary" /> DL Management
          </h1>
          <p className="text-gray-500 mt-2 font-bold italic">All Duty Leave applications across all events</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        {[
          { label: 'Total', value: stats.total, color: 'bg-gray-50 text-gray-700', border: 'border-gray-200' },
          { label: 'Approved', value: stats.approved, color: 'bg-green-50 text-green-700', border: 'border-green-200' },
          { label: 'Pending', value: stats.pending, color: 'bg-yellow-50 text-yellow-700', border: 'border-yellow-200' },
          { label: 'Rejected', value: stats.rejected, color: 'bg-red-50 text-red-700', border: 'border-red-200' },
        ].map(s => (
          <div key={s.label} className={`${s.color} border ${s.border} rounded-3xl p-6`}>
            <div className="text-3xl font-black mb-1">{s.value}</div>
            <div className="text-xs font-black uppercase tracking-widest opacity-70">{s.label} DLs</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8">
        <div className="flex flex-wrap gap-3">
          {['all', 'pending', 'approved', 'rejected'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                filter === f
                  ? 'bg-primary text-white shadow-lg shadow-red-200'
                  : 'bg-white text-gray-400 border border-gray-100 hover:bg-gray-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search student, roll no, or event..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-white border-2 border-gray-100 rounded-3xl shadow-sm focus:border-primary outline-none transition-all font-bold text-gray-900"
          />
        </div>
      </div>

      {/* DL Table */}
      <div className="bg-white rounded-[40px] shadow-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-50/60 border-b border-gray-100">
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Student</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Event</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Event Date</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Applied On</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Approved On</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [1, 2, 3, 4].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="7" className="px-8 py-8 bg-gray-50/20" />
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-8 py-24 text-center">
                    <FileText className="w-16 h-16 text-gray-100 mx-auto mb-4" />
                    <p className="text-gray-400 font-black uppercase tracking-widest">No DL records found</p>
                  </td>
                </tr>
              ) : filtered.map(dl => (
                <tr key={dl._id} className="hover:bg-red-50/5 transition-colors group">
                  <td className="px-8 py-7">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 bg-red-50 rounded-2xl flex items-center justify-center font-black text-primary group-hover:scale-110 transition-transform text-lg">
                        {dl.userId?.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <div className="font-black text-gray-900">{dl.userId?.name || 'N/A'}</div>
                        <div className="text-xs text-gray-400 font-bold">Roll: {dl.rollNo}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-7">
                    <div className="font-bold text-gray-900 max-w-[200px] truncate">{dl.eventId?.title || 'N/A'}</div>
                    {dl.eventId?.venue && (
                      <div className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" /> {dl.eventId.venue}
                      </div>
                    )}
                  </td>
                  <td className="px-8 py-7">
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
                      <Calendar className="w-4 h-4 text-primary" />
                      {dl.eventId?.date ? new Date(dl.eventId.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                    </div>
                    {(dl.eventId?.startTime || dl.eventId?.endTime) && (
                      <div className="text-xs text-gray-400 mt-1">
                        {dl.eventId.startTime} – {dl.eventId.endTime}
                      </div>
                    )}
                  </td>
                  <td className="px-8 py-7 text-sm font-bold text-gray-600">
                    {new Date(dl.appliedAt || dl.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-8 py-7 text-sm font-bold text-gray-600">
                    {dl.approvedAt
                      ? <span className="flex items-center gap-2 text-green-600"><Award className="w-4 h-4" />{new Date(dl.approvedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      : <span className="text-gray-300">—</span>
                    }
                  </td>
                  <td className="px-8 py-7">
                    <div className="flex justify-center">
                      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                        dl.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200'
                        : dl.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                      }`}>
                        {STATUS_ICONS[dl.status]} {dl.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-7">
                    {dl.status === 'pending' && (
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleStatusUpdate(dl._id, 'approved')}
                          className="bg-green-500 hover:bg-green-600 text-white p-2.5 rounded-xl transition-all"
                          title="Approve"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(dl._id, 'rejected')}
                          className="bg-red-500 hover:bg-red-600 text-white p-2.5 rounded-xl transition-all"
                          title="Reject"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    {dl.status !== 'pending' && (
                      <div className="text-center text-gray-300 text-xs font-bold uppercase">Done</div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDLDashboard;
