import { useState, useEffect, useRef } from 'react';
import { Bell, Check, Filter, X, Calendar, AlertCircle, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all' or 'unread'
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const { data: dbNotifications } = await api.get('/notifications');
      const { data: eventsRes } = await api.get('/events');
      const events = eventsRes.events || eventsRes;
      const { data: myRegistrations } = await api.get('/registrations/my');
      
      const registeredEventIds = new Set(myRegistrations.map(r => r.eventId?._id));
      const reminders = [];
      const now = new Date();

      events.forEach(event => {
        if (event.isAIGenerated) return;
        
        const eventDate = new Date(event.date);
        const diffTime = eventDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (registeredEventIds.has(event._id)) {
          // If registered, show countdown
          if (diffDays === 1) {
            reminders.push({
              _id: `reminder-${event._id}`,
              message: `🔥 1 day left for ${event.title}! Don't forget to bring your QR code.`,
              type: 'event',
              priority: 'urgent',
              createdAt: new Date().toISOString(),
              isRead: false,
              relatedId: event._id,
              isVirtual: true
            });
          } else if (diffDays === 2) {
            reminders.push({
              _id: `reminder-${event._id}`,
              message: `🗓️ 2 days left for ${event.title}! See you there.`,
              type: 'event',
              priority: 'normal',
              createdAt: new Date().toISOString(),
              isRead: false,
              relatedId: event._id,
              isVirtual: true
            });
          }
        } else if (event.status === 'approved' && diffDays > 0 && diffDays <= 3) {
          // If not registered and event is coming up soon, prompt to register
          const seatsLeft = (event.maxSeats || 0) - (event.registeredCount || 0);
          if (seatsLeft > 0) {
            reminders.push({
              _id: `prompt-${event._id}`,
              message: `⏳ Only ${seatsLeft} seats left for ${event.title}! Register now before it's full.`,
              type: 'system',
              priority: 'urgent',
              createdAt: new Date().toISOString(),
              isRead: false,
              relatedId: event._id,
              isVirtual: true
            });
          }
        }
      });

      // Filter out notifications related to AI generated events for students
      const filteredDb = dbNotifications.filter(n => {
        if (!n.relatedId) return true;
        const relatedEvent = events.find(e => e._id === n.relatedId);
        return !relatedEvent?.isAIGenerated;
      });
      
      // Combine and sort (reminders first)
      setNotifications([...reminders, ...filteredDb]);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Polling every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (id) => {
    if (id.startsWith('reminder-') || id.startsWith('prompt-')) {
      // Local state update only for virtual notifications
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      return;
    }
    try {
      await api.put(`/notifications/read/${id}`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.isRead;
    return true;
  });

  const getIcon = (type) => {
    switch (type) {
      case 'event': return <Calendar className="w-4 h-4 text-blue-500" />;
      case 'registration': return <Check className="w-4 h-4 text-green-500" />;
      case 'system': return <AlertCircle className="w-4 h-4 text-amber-500" />;
      default: return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-primary transition-all active:scale-95"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-5 h-5 bg-primary text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white animate-bounce shadow-lg">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-[60]"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-gray-900">Notifications</h3>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">
                  You have {unreadCount} unread updates
                </p>
              </div>
              <button 
                onClick={markAllAsRead}
                className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
              >
                Mark all as read
              </button>
            </div>

            {/* Filter Toggle */}
            <div className="flex bg-gray-200/50 p-1 m-4 rounded-2xl border border-gray-100">
              <button
                onClick={() => setFilter('all')}
                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                  filter === 'all' ? 'bg-white text-primary shadow-lg scale-105' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                  filter === 'unread' ? 'bg-white text-primary shadow-lg scale-105' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Unread
              </button>
            </div>

            {/* List */}
            <div className="max-h-[400px] overflow-y-auto overflow-x-hidden custom-scrollbar">
              {filteredNotifications.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                    <Bell className="w-8 h-8 text-gray-200" />
                  </div>
                  <p className="text-sm font-bold text-gray-400">No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {filteredNotifications.map((n) => (
                    <div
                      key={n._id}
                      onClick={() => {
                        if (!n.isRead) markAsRead(n._id);
                        if (n.relatedId) {
                          navigate(`/register/${n.relatedId}`);
                          setIsOpen(false);
                        }
                      }}
                      className={`p-5 flex gap-4 hover:bg-gray-50 transition-colors cursor-pointer relative group ${!n.isRead ? 'bg-primary/[0.02]' : ''}`}
                    >
                      <div className={`mt-1 w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        !n.isRead ? 'bg-white shadow-md border border-gray-100' : 'bg-gray-50'
                      }`}>
                        {getIcon(n.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm leading-relaxed mb-1 ${!n.isRead ? 'text-gray-900 font-bold' : 'text-gray-500 font-medium'}`}>
                          {n.isVirtual && <span className="bg-primary/10 text-primary text-[8px] font-black px-1.5 py-0.5 rounded mr-1.5">UPCOMING</span>}
                          {n.message}
                        </p>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                          {n.isVirtual ? 'Just now' : formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      {!n.isRead && (
                        <div className="w-2 h-2 rounded-full bg-primary mt-3 flex-shrink-0" />
                      )}
                      
                      {n.priority === 'urgent' && (
                         <div className="absolute top-0 right-0 h-full w-1 bg-primary rounded-l-full" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50/50 border-t border-gray-50 text-center">
              <button 
                onClick={() => setIsOpen(false)}
                className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-600"
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationDropdown;
