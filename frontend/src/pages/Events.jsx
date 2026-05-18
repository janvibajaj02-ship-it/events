import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { getServerUrl } from '../utils/apiConfig';
import { Calendar as LucideCalendar, MapPin, Users, Search, ArrowRight, AlertCircle, Clock, LayoutGrid, Calendar as CalendarIcon } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

// Category-based fallback images
const CATEGORY_IMAGES = {
  Technical: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop',
  Cultural:  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=2070&auto=format&fit=crop',
  Sports:    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=2070&auto=format&fit=crop',
  Workshop:  'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop',
  default:   'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2070&auto=format&fit=crop',
};

const getEventImage = (event) => {
  if (event.image) {
    return getServerUrl(event.image);
  }
  return CATEGORY_IMAGES[event.category] || CATEGORY_IMAGES.default;
};

const CustomToolbar = (toolbar) => {
  const goToBack = () => {
    toolbar.onNavigate('PREV');
  };

  const goToNext = () => {
    toolbar.onNavigate('NEXT');
  };

  const goToCurrent = () => {
    toolbar.onNavigate('TODAY');
  };

  const label = () => {
    const date = moment(toolbar.date);
    return <span>{date.format('MMMM YYYY')}</span>;
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 bg-gray-50/50 p-4 rounded-3xl border border-gray-100">
      <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100">
        <button className="px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 hover:text-primary transition-all text-gray-500" onClick={goToBack}>Back</button>
        <button className="px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 hover:text-primary transition-all text-gray-500 mx-1" onClick={goToCurrent}>Today</button>
        <button className="px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 hover:text-primary transition-all text-gray-500" onClick={goToNext}>Next</button>
      </div>

      <div className="text-xl font-black text-gray-900 uppercase tracking-[0.2em]">
        {label()}
      </div>

      <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100">
        {toolbar.views.map(view => (
          <button
            key={view}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              toolbar.view === view ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:text-primary hover:bg-gray-100'
            }`}
            onClick={() => toolbar.onView(view)}
          >
            {view}
          </button>
        ))}
      </div>
    </div>
  );
};

const Events = () => {
  const [events, setEvents] = useState([]);
  const [registeredEventIds, setRegisteredEventIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState('month');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let ignore = false;

    const loadEvents = async () => {
      try {
        const [{ data: eventsData }, registrationsResponse] = await Promise.all([
          api.get('/events'),
          user?.role === 'student' ? api.get('/registrations/my') : Promise.resolve({ data: [] }),
        ]);

        if (ignore) {
          return;
        }

        setEvents(eventsData.events || eventsData);
        setRegisteredEventIds(new Set(registrationsResponse.data.map((registration) => registration.eventId?._id)));
      } catch (error) {
        console.error(error);
        if (!ignore) {
          toast.error('Failed to fetch events');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadEvents();

    return () => {
      ignore = true;
    };
  }, [user]);

  const handleRegister = (event) => {
    if (!user) {
      toast.error('Please login to register');
      navigate('/login');
      return;
    }

    if (user.role === 'admin') {
      toast.error('Admins cannot register for events');
      return;
    }

    if (registeredEventIds.has(event._id)) {
      toast.error('You have already registered for this event');
      navigate('/my-events');
      return;
    }

    navigate(`/register/${event._id}`);
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = category === 'All' || event.category === category;
    const isNotAI = !event.isAIGenerated;
    return matchesSearch && matchesCategory && isNotAI;
  });

  const calendarEvents = filteredEvents.map(event => ({
    id: event._id,
    title: event.title,
    start: new Date(event.date),
    end: event.endDate ? new Date(event.endDate) : new Date(event.date),
    resource: event
  }));

  const handleSelectEvent = (event) => {
    navigate(`/register/${event.id}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Discover Events</h1>
            <p className="text-gray-500 mt-2 font-medium">Find and join the most exciting events on campus</p>
          </div>

          <div className="flex bg-gray-200/50 p-1 rounded-2xl border border-gray-100">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-300 ${
                viewMode === 'list' 
                ? 'bg-white text-primary shadow-lg scale-105' 
                : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <LayoutGrid className="w-4 h-4 mr-2" />
              List View
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-300 ${
                viewMode === 'calendar' 
                ? 'bg-white text-primary shadow-lg scale-105' 
                : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <CalendarIcon className="w-4 h-4 mr-2" />
              Calendar
            </button>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 flex-1 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search events..."
              className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-6 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm outline-none font-bold text-gray-700"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            <option value="Technical">Technical</option>
            <option value="Cultural">Cultural</option>
            <option value="Sports">Sports</option>
            <option value="Workshop">Workshop</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse bg-white rounded-[40px] h-[500px] border border-gray-100" />
          ))}
        </div>
      ) : viewMode === 'list' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEvents.map((event) => (
              <div
                key={event._id}
                className="bg-white rounded-[40px] shadow-xl border border-gray-100 overflow-hidden flex flex-col group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
              >
                {(() => {
                  const alreadyRegistered = registeredEventIds.has(event._id);
                  const seatsLeft = Math.max((event.maxSeats ?? 0) - (event.registeredCount ?? 0), 0);
                  const isFull = seatsLeft === 0;
                  const isPastDeadline = event.registrationDeadline && new Date() > new Date(event.registrationDeadline);
                  const buttonLabel = alreadyRegistered ? 'Already Registered' : isFull ? 'Event Full' : isPastDeadline ? 'Registration Closed' : 'Register';
                  const buttonDisabled = alreadyRegistered || isFull || isPastDeadline;

                  return (
                    <>
                      <div className="h-56 relative overflow-hidden">
                        <img
                          src={getEventImage(event)}
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute top-6 left-6 flex flex-wrap gap-2">
                          <StatusBadge status={event.status} />
                        </div>
                        <div className="absolute top-6 right-6">
                          <span className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-black text-primary uppercase tracking-widest shadow-lg">
                            {event.category}
                          </span>
                        </div>
                      </div>

                      <div className="p-8 flex-1 flex flex-col">
                        <h3 className="text-2xl font-black text-gray-900 mb-3 group-hover:text-primary transition-colors leading-tight">
                          {event.title}
                        </h3>
                        <p className="text-gray-500 text-sm mb-6 font-medium line-clamp-2">
                          {event.description}
                        </p>

                        <div className="space-y-3 mb-8">
                          <div className="flex items-center text-sm font-medium text-gray-700">
                             <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center mr-3">
                               <LucideCalendar className="w-4 h-4 text-primary" />
                             </div>
                             {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                             {event.endDate && ` - ${new Date(event.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                           </div>
                           {(event.startTime || event.endTime) && (
                             <div className="flex items-center text-sm font-medium text-gray-700">
                               <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center mr-3">
                                 <Clock className="w-4 h-4 text-primary" />
                               </div>
                               {event.startTime || 'TBD'} - {event.endTime || 'TBD'}
                             </div>
                           )}
                          <div className="flex items-center text-sm font-medium text-gray-700">
                            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center mr-3">
                              <MapPin className="w-4 h-4 text-primary" />
                            </div>
                            {event.venue}
                          </div>
                          <div className="flex items-center text-sm font-medium text-gray-700">
                            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center mr-3">
                              <Users className="w-4 h-4 text-primary" />
                            </div>
                            Registered: {event.registeredCount || 0} / {event.maxSeats || 0}
                          </div>
                          {event.registrationDeadline && (
                            <div className={`flex items-center text-sm font-bold ${new Date() > new Date(event.registrationDeadline) ? 'text-red-500' : 'text-amber-600'}`}>
                              <div className={`w-8 h-8 rounded-lg ${new Date() > new Date(event.registrationDeadline) ? 'bg-red-50' : 'bg-amber-50'} flex items-center justify-center mr-3`}>
                                <AlertCircle className={`w-4 h-4 ${new Date() > new Date(event.registrationDeadline) ? 'text-red-500' : 'text-amber-600'}`} />
                              </div>
                              {new Date() > new Date(event.registrationDeadline) 
                                ? 'Registration Closed' 
                                : `Deadline: ${new Date(event.registrationDeadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}`
                              }
                            </div>
                          )}
                        </div>

                        {alreadyRegistered && (
                          <div className="mb-6 flex items-center rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold text-green-700">
                            <AlertCircle className="mr-2 h-4 w-4" />
                            Registration already submitted for this event.
                          </div>
                        )}

                        <div className="mt-auto">
                          <button
                            onClick={() => handleRegister(event)}
                            disabled={buttonDisabled}
                            className={`w-full py-4 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all flex items-center justify-center ${
                              buttonDisabled
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-primary text-white hover:bg-primary-dark shadow-lg hover:shadow-primary/30'
                            }`}
                          >
                            {buttonDisabled ? buttonLabel : (
                              <>
                                {buttonLabel} <ArrowRight className="ml-2 w-4 h-4" />
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            ))}
        </div>
      ) : (
        <div className="bg-white p-8 rounded-[40px] shadow-xl border border-black overflow-hidden">
          <div className="calendar-container" style={{ height: '400px' }}>
            <Calendar
              localizer={localizer}
              events={calendarEvents}
              startAccessor="start"
              endAccessor="end"
              onSelectEvent={handleSelectEvent}
              className="font-bold text-gray-700"
              views={['month', 'week', 'day']}
              date={currentDate}
              onNavigate={(date) => setCurrentDate(date)}
              view={currentView}
              onView={(view) => setCurrentView(view)}
              components={{
                toolbar: CustomToolbar
              }}
              eventPropGetter={(event) => ({
                className: `!border-none !rounded-xl !px-3 !py-1.5 !font-black !text-[10px] !uppercase !tracking-widest shadow-sm hover:!bg-primary-dark transition-all`,
                style: { backgroundColor: 'var(--color-primary)', color: 'white' }
              })}
            />
          </div>
        </div>
      )}

      {!loading && filteredEvents.length === 0 && (
        <div className="text-center py-32">
          <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="text-gray-400 w-10 h-10" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No events found</h3>
          <p className="text-gray-500">Try adjusting your search or category filter</p>
        </div>
      )}
    </div>
  );
};

export default Events;
