import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageSquare, Send, X, Calendar, User, Award, HelpCircle, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi! I’m your Event Hub Assistant. How can I help you?", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const messageIdRef = useRef(2);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const responses = {
    events: {
      text: "You can browse all upcoming events on our Events page. We have technical workshops, cultural fests, and more!",
      link: "/events",
      linkText: "View Events"
    },
    register: {
      text: "To register, simply go to the Events page, select an event, and click 'Register Now'. Make sure you're logged in!",
      link: "/login",
      linkText: "Login to Register"
    },
    'my events': {
      text: "You can see all your registered events and download tickets in the 'My Events' section.",
      link: "/my-events",
      linkText: "My Events"
    },
    'create event': {
      text: "Are you an organizer? You can host new events by clicking 'Host New Event' on your dashboard.",
      link: "/create-event",
      linkText: "Host Event"
    },
    certificate: {
      text: "Certificates are automatically generated once the organizer marks an event as completed. You'll find them in your dashboard.",
      link: "/profile",
      linkText: "Check Profile"
    },
    dl: {
        text: "You can apply for Duty Leave (DL) after attending an event. Go to your dashboard to see approved logs.",
        link: "/profile",
        linkText: "My DLs"
      },
    help: {
      text: "I can help you find events, register, or manage your certificates. Try clicking the quick links below!",
    }
  };

  const handleSend = (text = input) => {
    if (!text.trim()) return;

    const userMessage = { id: messageIdRef.current++, text, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Bot Logic
    setTimeout(() => {
      const lowerText = text.toLowerCase();
      let botResponse = { id: messageIdRef.current++, text: "I'm not sure I understand. Try asking about events, registration, or certificates!", sender: 'bot' };

      for (const key in responses) {
        if (lowerText.includes(key)) {
          botResponse = { id: Date.now() + 1, ...responses[key], sender: 'bot' };
          break;
        }
      }

      setMessages(prev => [...prev, botResponse]);
    }, 600);
  };

  const quickLinks = [
    { label: 'View Events', icon: <Calendar className="w-4 h-4" />, query: 'events' },
    { label: 'Register', icon: <ChevronRight className="w-4 h-4" />, query: 'register' },
    { label: 'My Events', icon: <User className="w-4 h-4" />, query: 'my events' },
  ];

  return (
    <div className="fixed bottom-8 right-8 z-50 font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="mb-6 w-[380px] h-[550px] bg-white rounded-[32px] shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-primary p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                  <MessageSquare className="text-white w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-white font-black text-sm tracking-tight">Event Hub Assistant</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                    <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Online Now</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-grow overflow-y-auto p-6 space-y-4 scrollbar-hide">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] p-4 rounded-2xl text-sm font-medium leading-relaxed ${
                    msg.sender === 'user' 
                      ? 'bg-primary text-white rounded-tr-none shadow-md' 
                      : 'bg-gray-100 text-gray-800 rounded-tl-none'
                  }`}>
                    {msg.text}
                    {msg.link && (
                      <div className="mt-3">
                        <Link 
                          to={msg.link} 
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                            msg.sender === 'user' ? 'bg-white/20 text-white' : 'bg-primary text-white hover:bg-primary-dark'
                          }`}
                        >
                          {msg.linkText} <ChevronRight className="w-3 h-3" />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions */}
            <div className="px-6 py-3 flex gap-2 overflow-x-auto no-scrollbar">
              {quickLinks.map((link, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(link.query)}
                  className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-[10px] font-black text-gray-600 hover:border-primary hover:text-primary hover:bg-red-50 transition-all uppercase tracking-widest whitespace-nowrap"
                >
                  {link.icon} {link.label}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="p-6 border-t border-gray-50">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="relative group"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message..."
                  className="w-full pl-5 pr-14 py-4 bg-gray-50 border-2 border-transparent rounded-[20px] focus:border-primary/20 focus:bg-white focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-sm text-gray-700"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-white p-2.5 rounded-2xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-primary rounded-[22px] shadow-2xl flex items-center justify-center text-white relative group overflow-hidden"
      >
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
        {isOpen ? <X className="w-7 h-7 relative z-10" /> : <MessageSquare className="w-7 h-7 relative z-10" />}
      </motion.button>
    </div>
  );
};

export default Chatbot;
