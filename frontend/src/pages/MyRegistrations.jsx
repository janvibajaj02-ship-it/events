import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Ticket, Calendar, MapPin, Download, QrCode, Lock, Award, FileText, CheckCircle, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import TicketModal from '../components/TicketModal';
import DutyLeaveModal from '../components/DutyLeaveModal';
import StatusBadge from '../components/StatusBadge';

const MyRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReg, setSelectedReg] = useState(null);
  const [dlReg, setDlReg] = useState(null);
  const [certificateEligibility, setCertificateEligibility] = useState({});
  const [attendanceCodes, setAttendanceCodes] = useState({});
  const [markingAttendance, setMarkingAttendance] = useState({});

  useEffect(() => {
    let ignore = false;

    const loadRegistrations = async () => {
      try {
        const { data } = await api.get('/registrations/my');
        const eligibilityChecks = await Promise.all(
          data.map(async (registration) => {
            if (!registration.eventId) return [registration._id, { eligible: false, reason: 'Event no longer exists' }];
            try {
              const response = await api.get(`/registrations/certificate/check/${registration.eventId._id}`);
              return [registration._id, response.data];
            } catch {
              return [registration._id, { eligible: false, reason: 'Check failed' }];
            }
          })
        );

        if (ignore) {
          return;
        }

        setRegistrations(data);
        setCertificateEligibility(Object.fromEntries(eligibilityChecks));
      } catch (error) {
        console.error(error);
        if (!ignore) {
          toast.error('Failed to load your registrations');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadRegistrations();

    return () => {
      ignore = true;
    };
  }, []);

  const downloadCertificate = async (eventId, eventTitle, studentName) => {
    try {
      const response = await api.get(`/registrations/certificate/${eventId}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Certificate_${studentName}_${eventTitle}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Certificate downloaded!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to download certificate');
    }
  };

  const downloadQrImage = async (qrCodeDataURL, eventTitle, studentName) => {
    try {
      const response = await fetch(qrCodeDataURL);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `QR_${studentName}_${eventTitle}.png`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('QR code downloaded!');
    } catch {
      toast.error('Failed to download QR code');
    }
  };

  const handleCancelRegistration = async (registrationId) => {
    if (!window.confirm('Are you sure you want to cancel this registration? This action cannot be undone.')) return;
    
    try {
      await api.delete(`/registrations/cancel-my/${registrationId}`);
      setRegistrations(prev => prev.filter(r => r._id !== registrationId));
      toast.success('Registration cancelled successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel registration');
    }
  };

  const handleMarkAttendance = async (eventId) => {
    const code = attendanceCodes[eventId];
    if (!code || code.length !== 5) {
      return toast.error('Enter a valid 5-digit code');
    }

    setMarkingAttendance(prev => ({ ...prev, [eventId]: true }));
    try {
      await api.post('/attendance/code', { eventId, code });
      toast.success('Attendance marked successfully!');
      // Refresh registrations
      const { data } = await api.get('/registrations/my');
      setRegistrations(data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark attendance');
    } finally {
      setMarkingAttendance(prev => ({ ...prev, [eventId]: false }));
    }
  };

  const handleViewTicket = (registration) => {
    setSelectedReg(registration);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">My Registrations</h1>
          <p className="text-gray-500 mt-2 font-bold italic">Your event registrations, entry passes and certificates</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2].map((index) => <div key={index} className="animate-pulse bg-white rounded-3xl h-96 border border-gray-100" />)}
        </div>
      ) : registrations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {registrations.filter(r => r.eventId).map((reg) => {
            const seatsLeft = Math.max((reg.eventId?.maxSeats ?? 0) - (reg.eventId?.registeredCount ?? 0), 0);
            const canDownloadCertificate = certificateEligibility[reg._id]?.eligible;

            return (
              <div
                key={reg._id}
                className="bg-white rounded-[40px] shadow-xl border border-gray-100 overflow-hidden flex flex-col md:flex-row group relative"
              >
                <div className="p-10 flex-1">
                  <div className="flex items-center gap-3 mb-6 flex-wrap">
                    <StatusBadge status={reg.status} prefix="Registration" />
                    <StatusBadge status={reg.eventId.status} prefix="Event" />
                  </div>

                  <h3 className="text-3xl font-black text-gray-900 mb-4 group-hover:text-primary transition-colors leading-tight">
                    {reg.eventId.title}
                  </h3>

                  <div className="space-y-3 mb-8">
                    <div className="flex items-center text-sm font-bold text-gray-600">
                      <Calendar className="w-5 h-5 mr-3 text-primary" />
                      {new Date(reg.eventId.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-sm font-bold text-gray-600">
                      <MapPin className="w-5 h-5 mr-3 text-primary" />
                      {reg.eventId.venue}
                    </div>
                    <div className="text-sm font-bold text-gray-600">
                      Registered: <span className="text-gray-900">{reg.eventId?.registeredCount || 0} / {reg.eventId?.maxSeats || 0}</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-[25px] p-6 mb-8 grid grid-cols-2 gap-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border border-gray-100">
                    <div>
                      <span className="block text-gray-300 mb-1">Name</span>
                      <span className="text-gray-900">{reg.name}</span>
                    </div>
                    <div>
                      <span className="block text-gray-300 mb-1">Dept</span>
                      <span className="text-gray-900">{reg.department}</span>
                    </div>
                    <div>
                      <span className="block text-gray-300 mb-1">Course</span>
                      <span className="text-gray-900">{reg.course}</span>
                    </div>
                    <div>
                      <span className="block text-gray-300 mb-1">Group</span>
                      <span className="text-gray-900">{reg.group}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => handleViewTicket(reg)}
                      className="w-full flex items-center justify-center text-primary font-black uppercase text-xs tracking-widest hover:underline underline-offset-4 py-3 rounded-xl hover:bg-primary/5 transition-colors"
                    >
                      <Download className="w-4 h-4 mr-2" /> View & Download Pass
                    </button>

                    {canDownloadCertificate ? (
                      <button
                        onClick={() => downloadCertificate(reg.eventId._id, reg.eventId.title, reg.name)}
                        className="w-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-black uppercase text-xs tracking-widest py-3 rounded-xl hover:shadow-lg hover:shadow-blue-200 transition-all"
                      >
                        <Award className="w-4 h-4 mr-2" /> Download Certificate
                      </button>
                    ) : (
                      <button
                        disabled
                        className="w-full flex items-center justify-center bg-gray-100 text-gray-400 font-black uppercase text-xs tracking-widest py-3 rounded-xl cursor-not-allowed"
                      >
                        <Lock className="w-4 h-4 mr-2" /> {certificateEligibility[reg._id]?.reason || 'Certificate locked'}
                      </button>
                    )}

                    {reg.attended && reg.eventId.status === 'completed' && !reg.hasAppliedForDL && (
                      <button
                        onClick={() => setDlReg(reg)}
                        className="w-full flex items-center justify-center bg-green-500 hover:bg-green-600 text-white font-black uppercase text-xs tracking-widest py-3 rounded-xl shadow-lg shadow-green-100 transition-all"
                      >
                        <FileText className="w-4 h-4 mr-2" /> Apply for Duty Leave
                      </button>
                    )}

                    {!reg.attended && (
                      <button
                        onClick={() => handleCancelRegistration(reg._id)}
                        className="w-full flex items-center justify-center text-red-500 font-black uppercase text-[10px] tracking-widest hover:bg-red-50 py-2 rounded-xl transition-colors mt-2"
                      >
                        <X className="w-3 h-3 mr-1" /> Undo / Cancel Registration
                      </button>
                    )}

                    {reg.attended && reg.eventId.status !== 'completed' && (
                      <div className="text-center p-3 bg-gray-50 rounded-xl border border-gray-200">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">DL available after event completion</span>
                      </div>
                    )}

                    {reg.hasAppliedForDL && (
                      <div className="text-center p-3 bg-green-50 rounded-xl border border-green-100">
                        <span className="text-[10px] font-black text-green-700 uppercase tracking-widest">DL Applied</span>
                      </div>
                    )}

                    {!reg.attended && reg.status === 'approved' && (
                      <div className="mt-6 pt-6 border-t border-gray-100">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Self Attendance (Event Code)</p>
                        <div className="flex gap-2">
                          <input 
                            type="text"
                            maxLength={5}
                            placeholder="Enter 5-digit code"
                            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm font-bold focus:border-primary outline-none"
                            value={attendanceCodes[reg.eventId._id] || ''}
                            onChange={(e) => setAttendanceCodes(prev => ({ ...prev, [reg.eventId._id]: e.target.value }))}
                          />
                          <button
                            onClick={() => handleMarkAttendance(reg.eventId._id)}
                            disabled={markingAttendance[reg.eventId._id]}
                            className="bg-gray-900 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50"
                          >
                            {markingAttendance[reg.eventId._id] ? '...' : 'Mark'}
                          </button>
                        </div>
                      </div>
                    )}

                    {reg.attended ? (
                      <div className="mt-4 p-4 bg-green-50 rounded-2xl border border-green-100 flex items-center justify-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-xs font-black text-green-700 uppercase tracking-widest">Attendance: Present</span>
                      </div>
                    ) : (
                      <div className="mt-4 p-4 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-gray-300 animate-pulse" />
                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Attendance: Pending</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="w-full md:w-56 p-10 flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-dashed border-gray-200 relative bg-white">
                  <div className="hidden md:block absolute -top-4 -left-4 w-8 h-8 bg-gray-50 rounded-full border border-gray-100" />
                  <div className="hidden md:block absolute -bottom-4 -left-4 w-8 h-8 bg-gray-50 rounded-full border border-gray-100" />

                  {reg.qrCode ? (
                    <div className="text-center">
                      <img src={reg.qrCode} alt="QR Ticket" className="w-36 h-36 mb-4 rounded-2xl border-4 border-white shadow-xl" />
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center justify-center mb-4">
                        <QrCode className="w-3 h-3 mr-1" /> Entry Pass
                      </p>
                      
                      {/* QR Code Actions */}
                      <div className="space-y-2">
                        <button
                          onClick={() => downloadQrImage(reg.qrCode, reg.eventId.title, reg.name)}
                          className="w-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs py-2 px-3 rounded-lg transition-colors"
                          title="Download QR code as PNG image"
                        >
                          <Download className="w-3 h-3 mr-1" /> Download QR
                        </button>
                        
                        <p className="text-[8px] text-gray-400 mt-2 leading-tight">
                          Present this QR at the venue for attendance
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center opacity-40">
                      <Ticket className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">QR unavailable</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-32 bg-white rounded-[50px] border-2 border-dashed border-gray-100">
          <Ticket className="w-20 h-20 text-gray-100 mx-auto mb-6" />
          <h3 className="text-3xl font-black text-gray-900 mb-2">No registrations found</h3>
          <p className="text-gray-500 font-bold">Go to events page to explore and join!</p>
        </div>
      )}

      {selectedReg && (
        <TicketModal
          reg={selectedReg}
          onClose={() => setSelectedReg(null)}
        />
      )}

      {dlReg && (
        <DutyLeaveModal
          reg={dlReg}
          onClose={() => setDlReg(null)}
          onApplied={() => {
            setRegistrations(prev => prev.map(r => r._id === dlReg._id ? { ...r, hasAppliedForDL: true } : r));
          }}
        />
      )}
    </div>
  );
};

export default MyRegistrations;
