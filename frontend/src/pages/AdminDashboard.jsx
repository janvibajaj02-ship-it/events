import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { Check, X, AlertCircle, BarChart3, Users, Calendar, ShieldCheck, TrendingUp, CheckCheck, FileText } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import StatusBadge from '../components/StatusBadge';
import { getServerUrl } from '../utils/apiConfig';

const AdminDashboard = () => {
  const [pendingEvents, setPendingEvents] = useState([]);
  const [stats, setStats] = useState({ users: 0, events: 0, registrations: 0 });
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    const loadDashboard = async () => {
      try {
        const [eventsRes, statsRes, trendsRes] = await Promise.all([
          api.get('/events/pending'),
          api.get('/registrations/stats'),
          api.get('/registrations/trends'),
        ]);

        if (ignore) {
          return;
        }

        setPendingEvents(eventsRes.data.events || eventsRes.data);
        setStats(statsRes.data);
        setTrends(trendsRes.data || []);
      } catch (error) {
        console.error(error);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      ignore = true;
    };
  }, []);

  async function fetchData() {
    try {
      const [eventsRes, statsRes, trendsRes] = await Promise.all([
        api.get('/events/pending'),
        api.get('/registrations/stats'),
        api.get('/registrations/trends'),
      ]);
      setPendingEvents(eventsRes.data.events || eventsRes.data);
      setStats(statsRes.data);
      setTrends(trendsRes.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const handleAction = async (id, action) => {
    try {
      await api.put(`/events/${action}/${id}`);
      toast.success(`Event ${action}ed!`);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-5xl font-bold text-gray-900 flex items-center">
            <ShieldCheck className="w-12 h-12 mr-4 text-primary" /> Admin Portal
          </h1>
          <p className="text-gray-500 mt-3 text-lg">Manage events and platform analytics</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link to="/admin/attendance-logs" className="bg-white border-2 border-gray-100 hover:border-primary text-gray-900 px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-sm flex items-center gap-2">
            <CheckCheck className="w-4 h-4 text-green-600" /> Audit Logs
          </Link>
          <Link to="/admin/dl-management" className="bg-white border-2 border-gray-100 hover:border-primary text-gray-900 px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-sm flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" /> DL Management
          </Link>
          <Link to="/admin/organizer-stats" className="bg-white border-2 border-gray-100 hover:border-primary text-gray-900 px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-sm flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" /> Organizer Stats
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 flex items-center">
          <div className="bg-red-50 p-5 rounded-2xl mr-8">
            <Users className="w-10 h-10 text-primary" />
          </div>
          <div>
            <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">Total Users</div>
            <div className="text-4xl font-black text-gray-900">{stats.users}</div>
          </div>
        </div>
        <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 flex items-center">
          <div className="bg-blue-50 p-5 rounded-2xl mr-8">
            <Calendar className="w-10 h-10 text-blue-600" />
          </div>
          <div>
            <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">Total Events</div>
            <div className="text-4xl font-black text-gray-900">{stats.events}</div>
          </div>
        </div>
        <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 flex items-center">
          <div className="bg-green-50 p-5 rounded-2xl mr-8">
            <BarChart3 className="w-10 h-10 text-green-600" />
          </div>
          <div>
            <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">Registrations</div>
            <div className="text-4xl font-black text-gray-900">{stats.registrations}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
        <div className="lg:col-span-2 bg-white p-10 rounded-4xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center">
              <TrendingUp className="w-6 h-6 mr-3 text-primary" /> Registration Trends
            </h3>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Last 6 Months</span>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends.length > 0 ? trends : [{ name: 'No data', registrations: 0 }]}>
                <defs>
                  <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9e1b32" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#9e1b32" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="registrations" stroke="#9e1b32" strokeWidth={3} fillOpacity={1} fill="url(#colorReg)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-primary p-10 rounded-4xl text-white shadow-xl shadow-primary/20 relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="text-red-100 font-bold text-xs uppercase tracking-widest mb-3">System Health</h4>
              <div className="text-4xl font-black mb-4">Optimal</div>
              <p className="text-base text-red-100/80 leading-relaxed">All services are running smoothly. Database connection is stable.</p>
            </div>
            <ShieldCheck className="absolute -bottom-4 -right-4 w-32 h-32 text-white/5" />
          </div>

          <div className="bg-white p-10 rounded-4xl border border-gray-100 shadow-sm">
            <h4 className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-6">Pending Tasks</h4>
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-gray-700">Event Approvals</span>
                <span className="bg-red-50 text-primary px-3 py-2 rounded-lg text-sm font-black">{pendingEvents.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-gray-700">Support Tickets</span>
                <span className="bg-blue-50 text-blue-600 px-3 py-2 rounded-lg text-sm font-black">0</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-3xl font-bold text-gray-900 mb-10 flex items-center">
        <AlertCircle className="w-7 h-7 mr-3 text-orange-500" /> Pending Approvals
      </h2>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((index) => (
            <div key={index} className="animate-pulse bg-white rounded-3xl h-40 border border-gray-100" />
          ))}
        </div>
      ) : pendingEvents.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {pendingEvents.map((event) => (
            <div
              key={event._id}
              className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-8 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-8 flex-1">
                <img
                  src={event.image ? getServerUrl(event.image) : 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=200&auto=format&fit=crop'}
                  className="w-32 h-32 rounded-2xl object-cover"
                />
                <div>
                  <div className="mb-3">
                    <StatusBadge status={event.status} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{event.title}</h3>
                  <p className="text-gray-500 text-base mb-3">{event.description.substring(0, 100)}...</p>
                  <div className="flex flex-wrap gap-4 text-sm font-semibold text-gray-400">
                    <span>By: {event.createdBy?.name}</span>
                    <span>{event.category}</span>
                    <span>{new Date(event.date).toLocaleDateString()}</span>
                    <span>Seats: {event.maxSeats}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => handleAction(event._id, 'approve')}
                  className="bg-green-500 hover:bg-green-600 text-white p-5 rounded-2xl transition-all shadow-lg shadow-green-100"
                  title="Approve event"
                >
                  <Check className="w-7 h-7" />
                </button>
                <button
                  onClick={() => handleAction(event._id, 'reject')}
                  className="bg-red-500 hover:bg-red-600 text-white p-5 rounded-2xl transition-all shadow-lg shadow-red-100"
                  title="Reject event"
                >
                  <X className="w-7 h-7" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <p className="text-gray-500 text-xl font-bold">No pending event approvals.</p>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
