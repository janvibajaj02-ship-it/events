import { useEffect, useState } from 'react';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { Users, Calendar, Check, ChevronDown, ChevronUp, BarChart3, UserCheck, Shield } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

const OrganizerStats = () => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/events/organizer-stats');
        setStats(data);
      } catch {
        toast.error('Failed to load organizer statistics');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const totalEventsAll = stats.reduce((sum, s) => sum + s.totalEvents, 0);
  const totalRegsAll = stats.reduce((sum, s) => sum + s.totalRegistrations, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 flex items-center gap-4">
            <Users className="w-10 h-10 text-primary" /> Organizer Statistics
          </h1>
          <p className="text-gray-500 mt-2 font-bold italic">Events hosted and registrations per organizer</p>
        </div>
        <div className="flex gap-6">
          <div className="bg-primary text-white px-8 py-5 rounded-3xl text-center shadow-xl shadow-red-200">
            <div className="text-3xl font-black">{totalEventsAll}</div>
            <div className="text-xs font-black uppercase tracking-widest text-red-100">Total Events</div>
          </div>
          <div className="bg-white border border-gray-100 px-8 py-5 rounded-3xl text-center shadow-xl">
            <div className="text-3xl font-black text-gray-900">{totalRegsAll}</div>
            <div className="text-xs font-black uppercase tracking-widest text-gray-400">Total Registrations</div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse bg-white rounded-3xl h-32 border border-gray-100" />
          ))}
        </div>
      ) : stats.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-[40px] border-2 border-dashed border-gray-100">
          <Users className="w-16 h-16 text-gray-100 mx-auto mb-4" />
          <p className="text-gray-400 font-black uppercase tracking-widest">No organizers found</p>
        </div>
      ) : (
        <div className="space-y-6">
          {stats.map((s, idx) => (
            <div key={s.organizer.id} className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
              {/* Organizer Header Row */}
              <div
                className="flex flex-col lg:flex-row items-start lg:items-center justify-between p-8 cursor-pointer hover:bg-gray-50/50 transition-all gap-6"
                onClick={() => setExpanded(expanded === idx ? null : idx)}
              >
                <div className="flex items-center gap-6">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white shadow-lg ${
                    s.organizer.role === 'admin' ? 'bg-purple-600' : 'bg-primary'
                  }`}>
                    {s.organizer.name?.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-xl font-black text-gray-900">{s.organizer.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        s.organizer.role === 'admin'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-red-50 text-primary'
                      }`}>
                        {s.organizer.role === 'admin' ? <><Shield className="w-3 h-3 inline mr-1" />Admin</> : 'Organizer'}
                      </span>
                    </div>
                    <p className="text-gray-400 font-bold text-sm">{s.organizer.email}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 items-center">
                  {[
                    { label: 'Total Events', value: s.totalEvents, color: 'text-gray-900', bg: 'bg-gray-50' },
                    { label: 'Approved', value: s.approvedEvents, color: 'text-green-700', bg: 'bg-green-50' },
                    { label: 'Pending', value: s.pendingEvents, color: 'text-yellow-700', bg: 'bg-yellow-50' },
                    { label: 'Completed', value: s.completedEvents, color: 'text-blue-700', bg: 'bg-blue-50' },
                    { label: 'Total Registrations', value: s.totalRegistrations, color: 'text-primary', bg: 'bg-red-50' },
                  ].map(card => (
                    <div key={card.label} className={`${card.bg} px-5 py-3 rounded-2xl text-center min-w-[90px]`}>
                      <div className={`text-2xl font-black ${card.color}`}>{card.value}</div>
                      <div className="text-[9px] font-black uppercase tracking-widest text-gray-400 leading-tight">{card.label}</div>
                    </div>
                  ))}
                  <div className="p-2 bg-gray-100 rounded-xl text-gray-500">
                    {expanded === idx ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>
              </div>

              {/* Expanded Events List */}
              {expanded === idx && (
                <div className="border-t border-gray-100 px-8 pb-8 pt-4">
                  {s.events.length === 0 ? (
                    <p className="text-gray-400 text-sm font-bold py-6 text-center">No events created yet.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left min-w-[600px]">
                        <thead>
                          <tr className="border-b border-gray-100">
                            <th className="py-4 pr-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Event Name</th>
                            <th className="py-4 pr-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                            <th className="py-4 pr-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                            <th className="py-4 pr-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Registered / Max</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {s.events.map(ev => (
                            <tr key={ev._id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="py-4 pr-8 font-bold text-gray-900">{ev.title}</td>
                              <td className="py-4 pr-8"><StatusBadge status={ev.status} /></td>
                              <td className="py-4 pr-8 text-sm text-gray-500 font-bold">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-primary" />
                                  {new Date(ev.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </div>
                              </td>
                              <td className="py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <span className="text-lg font-black text-primary">{ev.registeredCount}</span>
                                  <span className="text-gray-300 font-bold">/</span>
                                  <span className="text-gray-600 font-bold">{ev.maxSeats}</span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrganizerStats;
