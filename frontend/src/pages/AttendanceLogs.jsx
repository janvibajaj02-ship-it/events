import { useEffect, useState } from 'react';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { ShieldCheck, Search, Users, CheckCircle, XCircle, FileCheck, FileMinus, Calendar } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

const AttendanceLogs = () => {
  const [data, setData] = useState({ registrations: [], dutyLeaves: [] });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all, attended, missed, dl

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/duty-leave/admin/logs');
        setData(res.data);
      } catch {
        toast.error('Failed to load logs');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getDLStatus = (registrationId) => {
    return data.dutyLeaves.find(dl => dl.registrationId?.toString() === registrationId?.toString());
  };

  const filteredLogs = data.registrations.filter(reg => {
    const matchesSearch = 
      reg.name.toLowerCase().includes(search.toLowerCase()) ||
      reg.eventId?.title.toLowerCase().includes(search.toLowerCase());
    
    if (filter === 'attended') return matchesSearch && reg.attended;
    if (filter === 'missed') return matchesSearch && !reg.attended;
    if (filter === 'dl') return matchesSearch && reg.hasAppliedForDL;
    return matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-5xl font-black text-gray-900 flex items-center gap-4">
          <ShieldCheck className="w-12 h-12 text-primary" /> Audit Logs
        </h1>
        <p className="text-gray-500 mt-3 text-lg font-bold italic">Centralized attendance and Duty Leave monitoring</p>
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-12">
        <div className="flex flex-wrap gap-3 w-full lg:w-auto">
          {['all', 'attended', 'missed', 'dl'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                filter === f ? 'bg-primary text-white shadow-lg shadow-red-200' : 'bg-white text-gray-400 border border-gray-100 hover:bg-gray-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-96">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search student or event..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-16 pr-8 py-5 bg-white border-2 border-gray-100 rounded-[28px] shadow-sm focus:border-primary outline-none transition-all font-bold text-gray-900"
          />
        </div>
      </div>

      <div className="bg-white rounded-[40px] shadow-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Student & Event</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Attendance</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Duty Leave</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [1, 2, 3].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="4" className="px-8 py-10 bg-gray-50/20" />
                  </tr>
                ))
              ) : filteredLogs.map((reg) => {
                const dl = getDLStatus(reg._id);
                return (
                  <tr key={reg._id} className="hover:bg-red-50/5 transition-colors group">
                    <td className="px-8 py-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center font-black text-primary group-hover:scale-110 transition-transform">
                          {reg.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-black text-gray-900 text-lg">{reg.name}</div>
                          <div className="text-gray-400 font-bold text-xs">{reg.eventId?.title}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-8">
                      <div className="flex flex-col items-center">
                        {reg.attended ? (
                          <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">
                            <CheckCircle className="w-4 h-4" /> Attended
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">
                            <XCircle className="w-4 h-4" /> Not Attended
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-8">
                      <div className="flex flex-col items-center">
                        {reg.hasAppliedForDL ? (
                          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                            dl?.status === 'approved' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                            dl?.status === 'rejected' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-gray-50 text-gray-400 border-gray-100'
                          }`}>
                            {dl?.status === 'approved' ? <FileCheck className="w-4 h-4" /> : <FileMinus className="w-4 h-4" />}
                            DL {dl?.status || 'Pending'}
                          </div>
                        ) : (
                          <span className="text-gray-300 text-[10px] font-black uppercase tracking-widest">No DL Applied</span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-8">
                      <div className="text-gray-500 font-bold text-xs flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-300" />
                        {new Date(reg.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {filteredLogs.length === 0 && !loading && (
          <div className="py-24 text-center">
            <Users className="w-16 h-16 text-gray-100 mx-auto mb-4" />
            <p className="text-gray-400 font-black uppercase tracking-widest">No records matching your search</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceLogs;
