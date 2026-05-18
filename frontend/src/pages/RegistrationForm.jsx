import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { User, Mail, School, BookOpen, Smartphone, Users, CheckCircle, Calendar, MapPin, Clock } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

const RegistrationForm = () => {
  const { eventId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    department: '',
    course: '',
    contactNo: '',
    group: ''
  });

  useEffect(() => {
    const fetchEvent = async () => {
      try {
      const [{ data: eventData }, { data: registrations }] = await Promise.all([
          api.get(`/events/${eventId}`),
          api.get('/registrations/my'),
        ]);
        setEvent(eventData);
        setAlreadyRegistered(registrations.some((registration) => registration.eventId?._id === eventId));
      } catch (error) {
        console.error(error);
        toast.error("Event not found");
        navigate('/events');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [eventId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (alreadyRegistered) {
      toast.error('You have already registered for this event');
      navigate('/my-events');
      return;
    }

    if (event?.isFull) {
      toast.error('Event Full');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/registrations', { ...formData, eventId });
      toast.success('Registration submitted! Wait for approval.');
      navigate('/my-events');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  const seatsLeft = Math.max((event?.maxSeats ?? 0) - (event?.registeredCount ?? 0), 0);
  const submitDisabled = submitting || alreadyRegistered || event?.isFull;

  return (
    <div className="min-h-screen bg-white py-12 px-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-0" />
      
      <div className="max-w-4xl mx-auto bg-white rounded-[40px] shadow-2xl overflow-hidden border border-gray-100 flex flex-col md:flex-row z-10 relative">
        {/* Left Side: Event Details */}
        <div className="md:w-1/3 bg-primary p-12 text-white flex flex-col justify-between">
          <div>
            <div className="bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-8">
              <Calendar className="w-6 h-6" />
            </div>
            <div className="mb-5 flex flex-wrap gap-2">
              <StatusBadge status={event?.status} prefix="Event" />
            </div>
            <h2 className="text-3xl font-black mb-4 leading-tight">{event?.title}</h2>
            <div className="space-y-4 opacity-80">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5" />
                <span className="font-bold">{event?.venue}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5" />
                <span className="font-bold">{new Date(event?.date).toLocaleDateString()}</span>
              </div>
              {(event?.startTime || event?.endTime) && (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white/70" />
                  </div>
                  <span className="font-bold">{event?.startTime} - {event?.endTime}</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5" />
                <span className="font-bold">Seats Left: {seatsLeft}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-12 p-6 bg-white/10 rounded-3xl border border-white/10">
            <h4 className="text-sm font-black uppercase tracking-widest mb-2">
              {alreadyRegistered ? 'Already Registered' : event?.isFull ? 'Event Full' : 'Registration Open'}
            </h4>
            <p className="text-xs font-bold opacity-70 leading-relaxed">
              {alreadyRegistered
                ? 'Your registration is already in the workflow. Track it from My Events.'
                : event?.isFull
                ? 'No seats are left for approved registrations.'
                : 'Fill out all fields carefully. Your request will stay pending until an organizer or admin approves it.'}
            </p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="flex-1 p-10 md:p-16">
          <div className="mb-10">
            <h3 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">Entry Form</h3>
            <p className="text-gray-400 font-bold italic">Official Registration Portal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-primary transition-colors" />
                  <input
                    type="text"
                    placeholder="Name"
                    className="w-full pl-14 pr-4 py-5 bg-gray-50 border-2 border-transparent rounded-[20px] focus:border-primary/20 focus:bg-white focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-lg"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Official Email</label>
                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-primary transition-colors" />
                  <input
                    type="email"
                    placeholder="Email"
                    className="w-full pl-14 pr-4 py-5 bg-gray-50 border-2 border-transparent rounded-[20px] focus:border-primary/20 focus:bg-white focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-lg"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Department</label>
                <div className="relative group">
                  <School className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-primary transition-colors" />
                  <input
                    type="text"
                    placeholder="CSE, ECE, etc."
                    className="w-full pl-14 pr-4 py-5 bg-gray-50 border-2 border-transparent rounded-[20px] focus:border-primary/20 focus:bg-white focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-lg"
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Course / Year</label>
                <div className="relative group">
                  <BookOpen className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-primary transition-colors" />
                  <input
                    type="text"
                    placeholder="B.Tech 3rd Year"
                    className="w-full pl-14 pr-4 py-5 bg-gray-50 border-2 border-transparent rounded-[20px] focus:border-primary/20 focus:bg-white focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-lg"
                    value={formData.course}
                    onChange={(e) => setFormData({...formData, course: e.target.value})}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Contact No</label>
                <div className="relative group">
                  <Smartphone className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-primary transition-colors" />
                  <input
                    type="text"
                    placeholder="+91 XXXX..."
                    className="w-full pl-14 pr-4 py-5 bg-gray-50 border-2 border-transparent rounded-[20px] focus:border-primary/20 focus:bg-white focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-lg"
                    value={formData.contactNo}
                    onChange={(e) => setFormData({...formData, contactNo: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Assigned Group</label>
                <div className="relative group">
                  <Users className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-primary transition-colors" />
                  <input
                    type="text"
                    placeholder="Group A, B, etc."
                    className="w-full pl-14 pr-4 py-5 bg-gray-50 border-2 border-transparent rounded-[20px] focus:border-primary/20 focus:bg-white focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-lg"
                    value={formData.group}
                    onChange={(e) => setFormData({...formData, group: e.target.value})}
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitDisabled}
              className="w-full bg-primary text-white py-6 rounded-[25px] font-black uppercase tracking-widest text-sm hover:bg-primary-dark transition-all disabled:opacity-50 shadow-2xl shadow-primary/30 flex items-center justify-center group"
            >
              {submitting ? 'Submitting Form...' : (
                <>
                  {alreadyRegistered ? 'Already Registered' : event?.isFull ? 'Event Full' : 'Submit Registration'}
                  <CheckCircle className="ml-3 w-6 h-6 group-hover:scale-110 transition-transform" />
                </>
              )}
            </button>

            <p className="text-center mt-10 text-xs font-bold text-gray-400">
              By submitting, you agree to follow the campus event guidelines.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;
