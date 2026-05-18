import { useState } from 'react';
import { X, FileText, Send } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../api/axios';

const DutyLeaveModal = ({ reg, onClose, onApplied }) => {
  const [rollNo, setRollNo] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/duty-leave/apply', {
        registrationId: reg._id,
        rollNo,
        reason
      });
      toast.success('DL Application submitted successfully!');
      onApplied();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to apply for DL');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-[40px] w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-primary text-white">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight">Apply for DL</h2>
              <p className="text-red-100 text-xs font-bold">{reg.eventId.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Roll Number</label>
            <input
              required
              type="text"
              value={rollNo}
              onChange={(e) => setRollNo(e.target.value)}
              placeholder="e.g. 211099XXXX"
              className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-primary focus:bg-white outline-none transition-all font-bold text-gray-900"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Reason / Purpose</label>
            <textarea
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why you need duty leave..."
              rows={4}
              className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-primary focus:bg-white outline-none transition-all font-bold text-gray-900 resize-none"
            />
          </div>

          <div className="bg-red-50 p-6 rounded-3xl border border-red-100">
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest leading-relaxed text-center">
              Important: DL will include your name, roll no, event date, and timings. Organizer approval is required.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-red-800 text-white font-black uppercase text-sm tracking-widest py-5 rounded-2xl shadow-xl shadow-red-200 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? 'Submitting...' : (
              <>
                Submit Application <Send className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DutyLeaveModal;
