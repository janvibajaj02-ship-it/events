import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { Calendar, MapPin, Users, ArrowRight, CheckCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { getServerUrl } from '../utils/apiConfig';


const CATEGORY_IMAGES = {
  Technical: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop',
  Cultural:  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=2070&auto=format&fit=crop',
  Sports:    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=2070&auto=format&fit=crop',
  Workshop:  'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop',
  default:   'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2070&auto=format&fit=crop',
};

const getEventImage = (event) => {
  if (event.image) return getServerUrl(event.image);
  return CATEGORY_IMAGES[event.category] || CATEGORY_IMAGES.default;
};

const Home = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data: eventsData } = await api.get('/events');
        const events = eventsData.events || eventsData;
        // Filter out AI generated events
        const userEvents = events.filter(event => !event.isAIGenerated);
        setEvents(userEvents.slice(0, 3)); 
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  return (
    <div className="flex flex-col bg-white">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-black/60 z-10" />
        <img 
          src="https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=2086&auto=format&fit=crop" 
          alt="University Building"
          className="absolute inset-0 w-full h-full object-cover scale-105 animate-slow-zoom"
        />
        <div className="relative z-20 container mx-auto px-6 md:px-12">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <div className="inline-block bg-primary px-4 py-1 rounded-full text-white text-xs font-bold uppercase tracking-widest mb-6">
              Welcome to the Hub
            </div>
            <motion.h1 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="text-6xl md:text-8xl font-black text-white mb-8 leading-[1.1]"
            >
              Elevate Your <br/> 
              <span className="text-primary-light">College Life.</span>
            </motion.h1>
            <p className="text-xl text-gray-200 mb-10 leading-relaxed max-w-xl">
              The ultimate platform for university events. Discover opportunities, connect with peers, and make your campus journey unforgettable.
            </p>
            <div className="flex flex-wrap gap-5">
              <Link to="/events" className="bg-primary hover:bg-primary-dark text-white px-10 py-5 rounded-2xl text-lg font-bold transition-all shadow-2xl shadow-primary/40 flex items-center">
                Explore Events <ArrowRight className="ml-3 w-6 h-6" />
              </Link>
              <Link to="/signup" className="bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/20 px-10 py-5 rounded-2xl text-lg font-bold transition-all">
                Join Community
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured News / Updates Style Section */}
      <section className="py-24 bg-gray-50/50">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">News & Updates</h2>
              <div className="w-20 h-2 bg-primary mb-6"></div>
              <p className="text-gray-500 text-lg">Stay informed about the latest happenings and important announcements from our campus community.</p>
            </div>
            <Link to="/events" className="group flex items-center bg-white px-8 py-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all font-bold text-primary">
              View All Events <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse bg-white rounded-2xl h-[400px] border border-gray-100" />
              ))}
            </div>
          ) : events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {events.map(event => (
                <motion.div 
                  key={event._id}
                  whileHover={{ 
                    y: -15,
                    rotateX: 5,
                    rotateY: 5,
                    scale: 1.02,
                    transition: { duration: 0.3 }
                  }}
                  style={{ transformStyle: "preserve-3d" }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-[0_20px_50px_rgba(158,27,50,0.1)] transition-all"
                >
                  <div className="h-48 overflow-hidden relative">
                    <img 
                      src={getEventImage(event)} 
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-primary uppercase">
                      {event.category}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-1">{event.title}</h3>
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center text-gray-500 text-sm">
                        <Calendar className="w-4 h-4 mr-2 text-primary" />
                        {new Date(event.date).toLocaleDateString()}
                        {event.endDate && ` - ${new Date(event.endDate).toLocaleDateString()}`}
                      </div>
                      {(event.startTime || event.endTime) && (
                        <div className="flex items-center text-gray-500 text-sm mt-1">
                          <Clock className="w-4 h-4 mr-2 text-primary" />
                          {event.startTime} - {event.endTime}
                        </div>
                      )}
                      <div className="flex items-center text-gray-500 text-sm mt-1">
                        <Users className="w-4 h-4 mr-2 text-primary" />
                        {event.registeredCount} / {event.maxSeats} Registered
                      </div>
                    </div>
                    <Link 
                      to="/events" 
                      className="w-full bg-gray-50 text-gray-900 hover:bg-primary hover:text-white py-3 rounded-xl font-bold transition-all block text-center"
                    >
                      View Details
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
              <p className="text-gray-500 text-lg">No events available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <motion.div 
              whileHover={{ rotateX: 10, rotateY: -10 }}
              className="relative perspective-1000"
            >
              <img 
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop" 
                alt="Student Life" 
                className="rounded-3xl shadow-2xl z-20 relative"
              />
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary rounded-2xl -z-10 animate-pulse"></div>
            </motion.div>
            <div>
              <h2 className="text-4xl font-black text-gray-900 mb-6">Redefining Campus Engagement</h2>
              <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                Event Hub is more than just a registration portal. It's a digital ecosystem designed to bridge the gap between organizers and students. We believe that every event is an opportunity for growth, networking, and creating lasting memories.
              </p>
              <ul className="space-y-4 mb-8">
                {['Seamless Registration', 'Verified Certificates', 'Role-based Management', 'Real-time Analytics'].map((item, i) => (
                  <li key={i} className="flex items-center text-gray-800 font-bold">
                    <CheckCircle className="text-primary w-6 h-6 mr-3" /> {item}
                  </li>
                ))}
              </ul>
              <Link to="/about" className="btn-primary inline-block text-center">Learn More About Us</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gray-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -mr-48 -mt-48"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">Voices of Success</h2>
            <p className="text-gray-400">Hear from students and organizers who use Event Hub every day.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Janvi', role: 'Student', text: 'The QR code system made entry to the Annual Fest so much faster. No more long queues!' },
              { name: 'Devansh Sharma', role: 'Organizer', text: 'Managing registrations used to be a nightmare. Event Hub has automated everything for us.' },
              { name: 'Janvi', role: 'Admin (janvibajaj02@gmail.com)', text: 'The dashboard gives us perfect visibility into all campus activities. Truly a game changer.' }
            ].map((t, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-lg p-8 rounded-3xl border border-white/10 hover:border-primary/50 transition-all">
                <p className="italic text-gray-300 mb-6 font-medium leading-relaxed">"{t.text}"</p>
                <div>
                  <div className="font-black text-primary-light">{t.name}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-widest">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-3xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-500">Everything you need to know about Event Hub.</p>
          </div>
          <div className="space-y-6">
            {[
              { q: 'How do I register for an event?', a: 'Simply browse the events page, select an event, and click Register. Once the organizer approves, you will receive your QR code.' },
              { q: 'Can I host my own event?', a: 'Yes! Sign up as an Organizer, fill out the event creation form, and wait for Admin approval.' },
              { q: 'Is there a limit to how many events I can join?', a: 'No, students can register for as many approved events as they like, provided seats are available.' }
            ].map((faq, i) => (
              <div key={i} className="p-6 rounded-2xl bg-gray-50 border border-gray-100">
                <h4 className="font-bold text-gray-900 mb-2 flex items-center">
                  <CheckCircle className="w-5 h-5 text-primary mr-2" /> {faq.q}
                </h4>
                <p className="text-gray-600 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners / Sponsors */}
      <section className="py-20 bg-gray-50/50 border-t border-gray-100">
        <div className="container mx-auto px-6 text-center">
          <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-10">Trusted by Leading Institutions</p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all">
            <div className="text-2xl font-black text-gray-400">CHITKARA</div>
            <div className="text-2xl font-black text-gray-400">VIT</div>
            <div className="text-2xl font-black text-gray-400">LPU</div>
            <div className="text-2xl font-black text-gray-400">AMITY</div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-primary py-24">
        <div className="container mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center text-white">
          <div>
            <div className="text-5xl font-black mb-2">50+</div>
            <div className="text-red-100 font-bold uppercase tracking-widest text-sm">Live Events</div>
          </div>
          <div>
            <div className="text-5xl font-black mb-2">2k+</div>
            <div className="text-red-100 font-bold uppercase tracking-widest text-sm">Students</div>
          </div>
          <div>
            <div className="text-5xl font-black mb-2">15+</div>
            <div className="text-red-100 font-bold uppercase tracking-widest text-sm">Categories</div>
          </div>
          <div>
            <div className="text-5xl font-black mb-2">100%</div>
            <div className="text-red-100 font-bold uppercase tracking-widest text-sm">Digital</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 py-16 border-t border-gray-200">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-6">
                <img src="/logo.png" alt="Event Hub Logo" className="w-16 h-16 object-contain" />
                <span className="text-2xl font-black text-primary tracking-tight">EVENT HUB</span>
              </div>
              <p className="text-gray-500 max-w-sm mb-6">
                Empowering campus life through technology. Join thousands of students and organizers building a better college experience.
              </p>
            </div>
            <div>
              <h4 className="font-black text-gray-900 mb-6">Quick Links</h4>
              <ul className="space-y-4 text-gray-600 font-medium">
                <li><Link to="/events" className="hover:text-primary transition-colors">Browse Events</Link></li>
                <li><Link to="/signup" className="hover:text-primary transition-colors">Join as Organizer</Link></li>
                <li><Link to="/login" className="hover:text-primary transition-colors">Admin Portal</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-black text-gray-900 mb-6">Contact Us</h4>
              <ul className="space-y-4 text-gray-600 font-medium">
                <li>support@eventhub.edu</li>
                <li>+1 (555) 000-1111</li>
                <li>Campus Hall B, Room 402</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-200 text-center text-gray-400 text-sm font-bold">
            &copy; {new Date().getFullYear()} EVENT HUB College Portal. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
