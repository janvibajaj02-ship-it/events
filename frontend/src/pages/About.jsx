import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Shield, Zap, CheckCircle } from 'lucide-react';

const About = () => {
  return (
    <div className="flex flex-col min-h-[calc(100vh-84px)] bg-gray-50 pt-16">
      <div className="flex-grow pb-24">
        {/* Hero Section */}
      <section className="container mx-auto px-6 mb-20 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight"
        >
          About <span className="text-primary">Event Hub</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
        >
          We are dedicated to transforming how campus events are organized, managed, and experienced. Event Hub is the central nervous system of university life.
        </motion.p>
      </section>

      {/* Mission Section */}
      <section className="container mx-auto px-6 mb-24">
        <div className="bg-white rounded-[40px] shadow-xl p-12 md:p-20 border border-gray-100 flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1">
            <h2 className="text-4xl font-black text-gray-900 mb-6">Our Mission</h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              To provide a seamless, digital-first platform that bridges the gap between event organizers and students. We eliminate paperwork, long queues, and confusion, replacing them with instant digital passes, automated attendance, and real-time analytics.
            </p>
            <ul className="space-y-4">
              {['Paperless Registrations', 'Automated Duty Leaves', 'Real-time Analytics', 'Secure QR Ticketing'].map((item, i) => (
                <li key={i} className="flex items-center text-gray-800 font-bold">
                  <CheckCircle className="text-primary w-6 h-6 mr-3" /> {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex-1 relative">
            <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl transform scale-150 -z-10"></div>
            <img 
              src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop" 
              alt="Students collaborating" 
              className="rounded-3xl shadow-2xl object-cover"
            />
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="container mx-auto px-6 text-center">
        <h2 className="text-4xl font-black text-gray-900 mb-16">Why Choose Us?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            { icon: Users, title: 'Community First', desc: 'Built by students, for students. We understand campus needs better than anyone else.' },
            { icon: Shield, title: 'Secure & Reliable', desc: 'Enterprise-grade security ensures your data and event tickets are always safe.' },
            { icon: Zap, title: 'Lightning Fast', desc: 'From registration to check-in, every interaction takes mere seconds.' }
          ].map((value, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -10 }}
              className="bg-white p-10 rounded-3xl shadow-lg border border-gray-100"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <value.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4">{value.title}</h3>
              <p className="text-gray-600 leading-relaxed">{value.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 py-16 border-t border-gray-200 mt-auto">
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

export default About;
