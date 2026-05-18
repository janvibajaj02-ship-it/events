import { useEffect, useState } from 'react';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { FileText, Check, X, User, Calendar, Clock, MapPin, Search } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

const DLRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchRequests = async () => {
    try {
      const { data } = await api.get('/duty-leave/organizer/requests');
      setRequests(data);
    } catch {
      toast.error('Failed to load DL requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    fetchRequests();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.put(`/duty-leave/status/${id}`, { status });
      toast.success(`DL Request ${status}!`);
      fetchRequests();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const filteredRequests = requests.filter(req => 
    req.userId?.name.toLowerCase().includes(search.toLowerCase()) ||
    req.rollNo.toLowerCase().includes(search.toLowerCase()) ||
    req.eventId?.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-8">
        <div>
          <h1 className="text-4xl font-black text-gray-900 flex items-center gap-4">
            <FileText className="w-10 h-10 text-primary" /> Duty Leave Requests
          </h1>
          <p className="text-gray-500 mt-2 font-bold italic">Review and approve duty leaves for your events</p>
        </div>

        <div className="relative w-full md:w-96">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by student, roll no, or event..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-16 pr-8 py-5 bg-white border-2 border-gray-100 rounded-3xl shadow-sm focus:border-primary focus:bg-white outline-none transition-all font-bold text-gray-900"
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map(i => <div key={i} className="animate-pulse bg-white rounded-3xl h-32 border border-gray-100" />)}
        </div>
      ) : filteredRequests.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {filteredRequests.map((req) => (
            <div key={req._id} className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 flex flex-col lg:flex-row items-center justify-between gap-8 hover:shadow-md transition-all group">
              <div className="flex items-center gap-8 flex-1 w-full lg:w-auto">
                <div className="bg-red-50 p-6 rounded-2xl group-hover:scale-110 transition-transform">
                  <User className="w-8 h-8 text-primary" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                      Roll: {req.rollNo}
                    </span>
                    <StatusBadge status={req.status} />
                  </div>
                  
                  <h3 className="text-2xl font-black text-gray-900 mb-1">{req.userId?.name}</h3>
                  <p className="text-primary font-bold text-sm mb-4">{req.eventId?.title}</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-bold text-gray-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" /> {new Date(req.eventId?.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" /> {req.appliedAt ? new Date(req.appliedAt).toLocaleDateString() : 'N/A'}
                    </div>
                    <div className="flex items-center gap-2 lg:col-span-1">
                      <FileText className="w-4 h-4" /> {req.reason.substring(0, 30)}...
                    </div>
                  </div>
                </div>
              </div>

              {req.status === 'pending' && (
                <div className="flex gap-4 w-full lg:w-auto">
                  <button
                    onClick={() => handleStatusUpdate(req._id, 'approved')}
                    className="flex-1 lg:flex-none bg-green-500 hover:bg-green-600 text-white p-5 rounded-2xl transition-all shadow-lg shadow-green-100 flex items-center justify-center gap-2 font-black uppercase text-xs tracking-widest"
                  >
                    <Check className="w-5 h-5" /> Approve
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(req._id, 'rejected')}
                    className="flex-1 lg:flex-none bg-red-500 hover:bg-red-600 text-white p-5 rounded-2xl transition-all shadow-lg shadow-red-100 flex items-center justify-center gap-2 font-black uppercase text-xs tracking-widest"
                  >
                    <X className="w-5 h-5" /> Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-white rounded-[40px] border-2 border-dashed border-gray-100">
          <FileText className="w-20 h-20 text-gray-200 mx-auto mb-6" />
          <p className="text-gray-500 text-xl font-bold">No DL requests found.</p>
        </div>
      )}
    </div>
  );
};

export default DLRequests;
