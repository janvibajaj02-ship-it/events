import { QrCode, MapPin, Calendar, X, Printer, Download, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { getServerUrl } from '../utils/apiConfig';

const TicketModal = ({ reg, onClose }) => {
  if (!reg) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-[40px] shadow-2xl overflow-hidden max-w-2xl w-full relative group print:shadow-none print:rounded-none"
      >
        {/* Close Button (Hidden on Print) */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-3 bg-white/20 backdrop-blur-md text-white rounded-2xl hover:bg-white/40 transition-all z-20 print:hidden"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Action Buttons (Floating, Hidden on Print) */}
        <div className="absolute bottom-8 right-8 flex gap-4 z-20 print:hidden">
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 bg-primary text-white px-6 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/30 hover:scale-105 transition-all"
          >
            <Printer className="w-4 h-4" /> Print Pass
          </button>
        </div>

        <div className="flex flex-col md:flex-row print:flex-row">
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col">
            {/* Header Image */}
            <div className="h-48 relative overflow-hidden">
              <img 
                src={reg.eventId.image ? getServerUrl(reg.eventId.image) : "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2070&auto=format&fit=crop"} 
                className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700"
                alt="Event"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-8">
                <span className="bg-primary text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-2 inline-block">
                  Official Entry Pass
                </span>
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-tight">
                  {reg.eventId.title}
                </h2>
              </div>
            </div>

            {/* Ticket Info Section */}
            <div className="p-8 space-y-8 bg-white">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Attendee Name</label>
                  <p className="text-xl font-black text-gray-900 leading-none">{reg.name}</p>
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Registration ID</label>
                  <p className="text-xl font-black text-gray-900 leading-none uppercase truncate">#{reg._id.substring(reg._id.length - 8)}</p>
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-gray-100">
                <div className="flex items-center text-sm font-bold text-gray-700">
                  <div className="bg-red-50 p-2 rounded-xl mr-4">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Date & Time</p>
                    {new Date(reg.eventId.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    {(reg.eventId.startTime || reg.eventId.endTime) && (
                      <div className="flex items-center gap-2 mt-1 text-primary">
                        <Clock className="w-3 h-3" />
                        <span className="text-[10px] uppercase font-black">{reg.eventId.startTime} - {reg.eventId.endTime}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center text-sm font-bold text-gray-700">
                  <div className="bg-red-50 p-2 rounded-xl mr-4">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Location</p>
                    {reg.eventId.venue}
                  </div>
                </div>
              </div>

              {/* Extra Meta Details */}
              <div className="flex gap-4 pt-6">
                <div className="bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 flex-1">
                  <p className="text-[8px] text-gray-400 uppercase font-black">Department</p>
                  <p className="text-xs font-black text-gray-700 uppercase">{reg.department}</p>
                </div>
                <div className="bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 flex-1">
                  <p className="text-[8px] text-gray-400 uppercase font-black">Course</p>
                  <p className="text-xs font-black text-gray-700 uppercase">{reg.course}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Side Ticket Stub (Perforated Area) */}
          <div className="w-full md:w-64 bg-gray-50 border-t-2 md:border-t-0 md:border-l-2 border-dashed border-gray-200 p-8 flex flex-col items-center justify-center text-center relative print:w-64 print:border-l-2">
             {/* Perforation holes simulation */}
             <div className="hidden md:block absolute -top-4 -left-4 w-8 h-8 bg-black/60 rounded-full print:hidden" />
             <div className="hidden md:block absolute -bottom-4 -left-4 w-8 h-8 bg-black/60 rounded-full print:hidden" />
             
             <div className="mb-6">
               <div className="bg-white p-4 rounded-3xl shadow-lg border border-gray-100 inline-block min-w-[128px] min-h-[128px] flex items-center justify-center">
                 {reg.qrCode ? (
                   <img src={reg.qrCode} alt="QR code" className="w-32 h-32" />
                 ) : (
                   <div className="text-[10px] font-bold text-gray-400 uppercase p-4 text-center">
                     QR Code<br/>Generated After<br/>Approval
                   </div>
                 )}
               </div>
               <p className="mt-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Scan for Attendance</p>
             </div>

             <div className="text-left w-full space-y-4 mt-8 opacity-60">
               <div className="h-px bg-gray-200" />
               <p className="text-[8px] font-bold text-gray-500 leading-relaxed uppercase">
                 * Please present this QR code at the entrance.<br/>
                 * Non-transferable admission pass.<br/>
                 * Valid only for the specified event date.
               </p>
             </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TicketModal;
