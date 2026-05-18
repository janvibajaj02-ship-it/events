import { useState, useEffect } from 'react';
import { Megaphone, X, AlertTriangle, ArrowRight } from 'lucide-react';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const AnnouncementBanner = () => {
  const [announcement, setAnnouncement] = useState(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const fetchUrgentNotifications = async () => {
      try {
        const { data: notifications } = await api.get('/notifications');
        const { data: eventsData } = await api.get('/events');
        const events = eventsData.events || eventsData;
        
        // Find urgent notification related to a non-AI event
        const urgent = notifications.find(n => {
          if (n.priority !== 'urgent' || n.isRead) return false;
          if (n.relatedId) {
            const relatedEvent = events.find(e => e._id === n.relatedId);
            return relatedEvent && !relatedEvent.isAIGenerated;
          }
          return true;
        });

        if (urgent) {
          setAnnouncement(urgent);
        }
      } catch (error) {
        console.error('Failed to fetch announcements:', error);
      }
    };

    fetchUrgentNotifications();
  }, []);

  if (!announcement || !isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0, y: -20 }}
        animate={{ height: 'auto', opacity: 1, y: 0 }}
        exit={{ height: 0, opacity: 0, y: -20 }}
        className="bg-primary text-white relative z-50 shadow-2xl overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary-dark to-primary opacity-90" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
        
        {/* Animated glowing lines */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer delay-1000" />
        </div>

        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center justify-between flex-wrap gap-6">
            <div className="flex items-center flex-1 min-w-0">
              <div className="flex p-2.5 rounded-2xl bg-white/20 backdrop-blur-xl mr-5 shadow-2xl border border-white/30 transform hover:rotate-12 transition-transform">
                <AlertTriangle className="h-6 w-6 text-white animate-pulse" aria-hidden="true" />
              </div>
              <div>
                <p className="font-black text-xs uppercase tracking-[0.2em] text-white/70 mb-0.5">Critical Update</p>
                <p className="font-black text-sm sm:text-base tracking-tight truncate">
                  {announcement.message}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-5">
               {announcement.relatedId && (
                 <Link 
                   to={`/register/${announcement.relatedId}`}
                   className="flex items-center px-6 py-2.5 bg-white text-primary text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-gray-100 transition-all shadow-2xl active:scale-95 group"
                 >
                   Take Action <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                 </Link>
               )}
              <button
                type="button"
                onClick={() => setIsVisible(false)}
                className="p-2.5 rounded-2xl hover:bg-white/20 backdrop-blur-md transition-all border border-transparent hover:border-white/20"
              >
                <X className="h-5 w-5 text-white" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AnnouncementBanner;
