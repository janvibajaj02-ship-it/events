import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { Users, Calendar, Check, X, Eye, FileText, Trash2, CheckCheck, ScanLine, Camera, ImageUp, Lock, ArrowRight, Upload, QrCode } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import CameraQrScannerModal from '../components/CameraQrScannerModal';
import { Html5Qrcode } from 'html5-qrcode';

const OrganizerDashboard = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [allRegistrations, setAllRegistrations] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [scanInput, setScanInput] = useState('');
  const [scanning, setScanning] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [qrUploading, setQrUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const qrFileRef = useRef(null);

  useEffect(() => {
    let ignore = false;
    const loadDashboard = async () => {
      try {
        const [eventsResponse, registrationsResponse] = await Promise.all([
          api.get('/events/organizer'),
          user?.role === 'admin' ? api.get('/registrations/all') : Promise.resolve({ data: [] }),
        ]);
        if (ignore) return;
        setEvents(eventsResponse.data.events || eventsResponse.data);
        if (user?.role === 'admin') {
          setAllRegistrations(registrationsResponse.data || []);
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    loadDashboard();
    return () => { ignore = true; };
  }, [user]);

  async function fetchEvents() {
    try {
      const { data } = await api.get('/events/organizer');
      setEvents(data.events || data);
    } catch (error) {
      console.error(error);
    }
  }

  async function fetchAllRegistrations() {
    try {
      const { data } = await api.get('/registrations/all');
      setAllRegistrations(data || []);
    } catch (error) {
      console.error(error);
    }
  }

  const fetchRegistrations = async (eventId) => {
    try {
      const { data } = await api.get(`/registrations/event/${eventId}`);
      setRegistrations(data);
      setSelectedEvent(eventId);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch registrations');
    }
  };

  const handleRegAction = async (regId, action) => {
    try {
      await api.put(`/registrations/${action}/${regId}`);
      toast.success(`Registration ${action}ed!`);
      if (selectedEvent) fetchRegistrations(selectedEvent);
      fetchEvents();
      if (user?.role === 'admin') fetchAllRegistrations();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  const handleDeleteRegistration = async (regId) => {
    if (window.confirm('Are you sure you want to delete this student registration?')) {
      try {
        await api.delete(`/registrations/${regId}`);
        toast.success('Registration deleted');
        if (selectedEvent) fetchRegistrations(selectedEvent);
        fetchEvents();
        if (user?.role === 'admin') fetchAllRegistrations();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Delete failed');
      }
    }
  };

  const handleCompleteEvent = async (eventId) => {
    if (window.confirm('Mark this event as completed? This will unlock certificates for approved attendees.')) {
      try {
        await api.put(`/events/complete/${eventId}`);
        toast.success('Event marked as completed!');
        fetchEvents();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to complete event');
      }
    }
  };

  const handleGenerateCode = async (eventId) => {
    try {
      const { data } = await api.post('/attendance/generate-code', { eventId });
      toast.success(`Event Code Generated: ${data.code}`);
      fetchEvents();
    } catch {
      toast.error('Failed to generate code');
    }
  };

  const handleCameraScan = async (rawValue) => {
    setCameraOpen(false);
    await processQrValue(rawValue);
  };

  const processQrValue = async (rawValue) => {
    if (!selectedEvent) {
      toast.error('Select an event before scanning');
      return;
    }
    setScanning(true);
    try {
      const { data } = await api.post('/registrations/scan-attendance', {
        qrData: rawValue,
        eventId: selectedEvent,
      });
      toast.success(data.message);
      setScanInput('');
      fetchRegistrations(selectedEvent);
      if (user?.role === 'admin') fetchAllRegistrations();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Attendance scan failed');
    } finally {
      setScanning(false);
    }
  };

  // QR Image Upload Handler
  const handleQrImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!selectedEvent) {
      toast.error('Please select an event first');
      e.target.value = '';
      return;
    }

    setQrUploading(true);
    try {
      const html5QrCode = new Html5Qrcode('qr-reader-hidden');
      const result = await html5QrCode.scanFile(file, false);
      await html5QrCode.clear();
      toast.success('QR decoded! Marking attendance...');
      await processQrValue(result);
    } catch (err) {
      console.error(err);
      toast.error('Could not read QR from image. Ensure the QR code is clear and well-lit.');
    } finally {
      setQrUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Hidden div for html5-qrcode scanner */}
      <div id="qr-reader-hidden" style={{ display: 'none' }} />

      <div>
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <h1 className="text-4xl font-bold text-gray-900">Organizer Dashboard</h1>
          <div className="flex gap-4">
            <Link
              to="/create-event"
              className="bg-primary text-white px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-md flex items-center gap-2 hover:bg-primary-dark"
            >
              <Calendar className="w-4 h-4" /> Host New Event
            </Link>
            <Link
              to="/dl-requests"
              className="bg-white border-2 border-gray-100 hover:border-primary text-gray-900 px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-sm flex items-center gap-2"
            >
              <FileText className="w-4 h-4 text-primary" /> Review DL Requests
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* My Events List */}
          <div className="lg:col-span-1 space-y-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-primary" /> My Hosted Events
            </h2>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="animate-pulse bg-white rounded-2xl h-24 border border-gray-100" />)}
              </div>
            ) : events.length > 0 ? (
              events.map(event => (
                <div
                  key={event._id}
                  className={`w-full text-left p-6 rounded-2xl border-2 transition-all ${
                    selectedEvent === event._id
                      ? 'border-primary bg-red-50 shadow-lg'
                      : 'border-gray-100 bg-white hover:border-red-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex gap-2">
                      <StatusBadge status={event.status} />
                    </div>
                    <span className="text-xs text-gray-400">{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 truncate mb-3">{event.title}</h3>
                  <div className="flex items-center mt-2 text-sm text-gray-500 mb-4">
                    <Users className="w-4 h-4 mr-1" />
                    Registered: {event.registeredCount || 0} / {event.maxSeats || 0}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => fetchRegistrations(event._id)}
                      className="flex-1 py-2 px-3 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-dark transition-all"
                    >
                      View Registrations
                    </button>
                    {event.status !== 'completed' && (
                      <button
                        onClick={() => handleCompleteEvent(event._id)}
                        className="flex-1 py-2 px-3 bg-blue-500 text-white text-xs font-bold rounded-lg hover:bg-blue-600 transition-all flex items-center justify-center"
                        title="Mark event as completed to unlock certificates"
                      >
                        <CheckCheck className="w-4 h-4 mr-1" /> Complete
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-3xl border border-gray-100">
                <p className="text-gray-400">No events created yet.</p>
              </div>
            )}
          </div>

          {/* Registration Management */}
          <div className="lg:col-span-2">
            {selectedEvent ? (
              <div>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center">
                    <Users className="w-5 h-5 mr-2 text-primary" /> Registration Requests
                  </h2>
                  <div className="text-sm font-medium text-gray-400">
                    Event ID: {selectedEvent.substring(18)}
                  </div>
                </div>

                {/* Attendance Options */}
                <div className="mb-8 rounded-[28px] border border-gray-100 bg-white p-8 shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Camera QR Scanner */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-xl">
                          <Camera className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="text-base font-black text-gray-900">Live Camera</h3>
                      </div>
                      <p className="text-xs text-gray-500 font-medium">Scan student QR codes using your device camera in real time.</p>
                      <Link
                        to={`/organizer/scan/${selectedEvent}`}
                        className="inline-flex items-center justify-center w-full bg-primary text-white px-4 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all"
                      >
                        <Camera className="mr-2 h-4 w-4" /> Start Camera Scan
                      </Link>
                    </div>

                    {/* QR Image Upload */}
                    <div className="space-y-4 border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-6">
                      <div className="flex items-center gap-3">
                        <div className="bg-green-50 p-2 rounded-xl">
                          <Upload className="h-5 w-5 text-green-600" />
                        </div>
                        <h3 className="text-base font-black text-gray-900">Upload QR Image</h3>
                      </div>
                      <p className="text-xs text-gray-500 font-medium">Upload a photo of the student's QR code to mark attendance instantly.</p>
                      <input
                        ref={qrFileRef}
                        type="file"
                        accept="image/*"
                        onChange={handleQrImageUpload}
                        className="hidden"
                        id="qr-upload-input"
                      />
                      <label
                        htmlFor="qr-upload-input"
                        className={`inline-flex items-center justify-center w-full px-4 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all cursor-pointer ${
                          qrUploading
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-100'
                        }`}
                      >
                        <QrCode className="mr-2 h-4 w-4" />
                        {qrUploading ? 'Reading QR...' : 'Upload QR Image'}
                      </label>
                    </div>

                    {/* Event Code */}
                    <div className="space-y-4 border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-6">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-50 p-2 rounded-xl">
                          <Lock className="h-5 w-5 text-blue-600" />
                        </div>
                        <h3 className="text-base font-black text-gray-900">Backup Code</h3>
                      </div>
                      <p className="text-xs text-gray-500 font-medium">Generate a 5-digit code students enter manually if QR scanning fails.</p>
                      <div className="flex gap-2">
                        <div className="flex-grow bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center font-black text-xl tracking-[0.5em] text-primary py-2 px-4">
                          {events.find(e => e._id === selectedEvent)?.attendanceCode || '-----'}
                        </div>
                        <button
                          onClick={() => handleGenerateCode(selectedEvent)}
                          className="bg-primary text-white p-3 rounded-2xl hover:bg-primary-dark transition-all"
                          title="Generate New Code"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Registrations List */}
                {registrations.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {registrations.map((reg) => (
                      <div
                        key={reg._id}
                        className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center font-bold text-gray-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                            {reg.userId?.name?.charAt(0) || reg.name?.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">{reg.name}</div>
                            <div className="text-sm text-gray-500">{reg.email}</div>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                              <span>Course: {reg.course}</span>
                              <span>Ph: {reg.contactNo}</span>
                              <span>Dept: {reg.department}</span>
                              <span>Grp: {reg.group}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="flex flex-col items-end gap-2">
                            <StatusBadge status={reg.status} prefix="Registration" />
                            <span className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] ${
                              reg.attended ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-500'
                            }`}>
                              {reg.attended ? '✓ Attended' : 'Not Attended'}
                            </span>
                          </div>
                          <button
                            onClick={() => handleDeleteRegistration(reg._id)}
                            className="p-2 text-gray-400 hover:text-primary hover:bg-red-50 rounded-xl transition-all"
                            title="Remove Registration"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-24 bg-white rounded-[40px] border-2 border-dashed border-gray-100">
                    <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="text-gray-300 w-8 h-8" />
                    </div>
                    <p className="text-gray-400 font-medium">No registrations yet for this event.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200">
                <Eye className="w-12 h-12 text-gray-300 mb-4" />
                <p className="text-gray-400 font-bold text-lg">Select an event to view registrations</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <CameraQrScannerModal
        isOpen={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onScan={handleCameraScan}
      />
    </div>
  );
};

export default OrganizerDashboard;
