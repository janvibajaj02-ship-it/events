import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, EffectFade } from 'swiper/modules';
import { Bell, ArrowRight, AlertTriangle, Info, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';

const CarouselBanner = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const { data } = await api.get('/announcements');
        setAnnouncements(data);
      } catch (error) {
        console.error('Failed to fetch announcements:', error);
      }
    };
    fetchAnnouncements();
  }, []);

  if (!isVisible || announcements.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="w-full relative z-40 bg-gray-900"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary-dark/90 via-primary/80 to-primary-dark/90 z-0"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 z-0"></div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <Swiper
            modules={[Autoplay, Pagination, Navigation, EffectFade]}
            spaceBetween={30}
            slidesPerView={1}
            effect="fade"
            loop={announcements.length > 1}
            autoplay={{
              delay: 4000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            pagination={{ clickable: true, dynamicBullets: true }}
            navigation={announcements.length > 1}
            className="rounded-3xl shadow-2xl overflow-hidden group border border-white/10"
          >
            {announcements.map((item) => (
              <SwiperSlide key={item._id}>
                <div 
                  className="relative flex flex-col md:flex-row items-center justify-between p-6 sm:p-8 min-h-[160px] cursor-pointer"
                  onClick={() => item.relatedEventId && navigate(`/register/${item.relatedEventId}`)}
                >
                  {/* Background Image Setup */}
                  <div 
                    className="absolute inset-0 bg-cover bg-center z-0 opacity-40 transition-transform duration-700 group-hover:scale-105"
                    style={{ backgroundImage: `url(${item.image || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=2070&auto=format&fit=crop'})` }}
                  ></div>
                  <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-gray-900 via-gray-900/80 to-transparent z-0"></div>

                  <div className="relative z-10 flex items-start sm:items-center space-x-4 sm:space-x-6 w-full max-w-4xl">
                    <div className="hidden sm:flex shrink-0 w-14 h-14 rounded-full bg-white/10 backdrop-blur-md items-center justify-center border border-white/20 shadow-xl">
                      {item.priority === 'urgent' ? (
                        <AlertTriangle className="w-7 h-7 text-red-400 animate-pulse" />
                      ) : (
                        <Bell className="w-7 h-7 text-yellow-400" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          item.priority === 'urgent' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                        }`}>
                          {item.priority}
                        </span>
                        <span className="text-gray-400 flex items-center text-xs font-semibold">
                          <Clock className="w-3 h-3 mr-1" />
                          Expires {formatDistanceToNow(new Date(item.expiryDate), { addSuffix: true })}
                        </span>
                      </div>
                      
                      <h2 className="text-xl sm:text-3xl font-black text-white mb-2 leading-tight tracking-tight drop-shadow-md">
                        {item.title}
                      </h2>
                      <p className="text-sm sm:text-base text-gray-300 line-clamp-2 md:line-clamp-none max-w-2xl font-medium">
                        {item.message}
                      </p>
                    </div>
                  </div>

                  {item.relatedEventId && (
                    <div className="relative z-10 mt-6 md:mt-0 ml-0 md:ml-6 shrink-0">
                      <button className="flex items-center px-6 py-3 bg-primary hover:bg-primary-light text-white text-sm font-black uppercase tracking-widest rounded-xl transition-all shadow-lg hover:shadow-primary/50 group-hover:-translate-y-1">
                        Take Action
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  )}
                </div>
              </SwiperSlide>
            ))}
            
            {/* Custom Navigation buttons override via CSS globally if needed, but Swiper provides defaults */}
          </Swiper>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CarouselBanner;
