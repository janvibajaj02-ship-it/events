import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { Calendar, MapPin, AlignLeft, Image as ImageIcon, Users, Tag, Send, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const CreateEvent = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    endDate: '',
    startTime: '',
    endTime: '',
    venue: '',
    category: '',
    maxSeats: '',
    registrationDeadline: '',
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key]) {
        data.append(key, formData[key]);
      }
    });
    if (image) data.append('image', image);

    try {
      await api.post('/events', data);
      toast.success('Event created! Awaiting admin approval.');
      navigate('/organizer');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100"
      >
        <div className="bg-primary p-8 text-white">
          <h1 className="text-3xl font-bold">Create New Event</h1>
          <p className="text-red-100 mt-2">Fill in the details to host your campus event</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                <Tag className="w-4 h-4 mr-2 text-primary" /> Event Title
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                placeholder="e.g. Annual Tech Symposium"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-primary" /> Event Date
              </label>
              <input
                type="date"
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-primary" /> Venue
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                placeholder="e.g. Auditorium Hall A"
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-primary" /> End Date (Optional)
              </label>
              <input
                type="date"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-primary" /> Start Time
                </label>
                <input
                  type="text"
                  placeholder="10:00 AM"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-primary" /> End Time
                </label>
                <input
                  type="text"
                  placeholder="05:00 PM"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                <Users className="w-4 h-4 mr-2 text-primary" /> Max Seats
              </label>
              <input
                type="number"
                required
                min="1"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                placeholder="e.g. 100"
                value={formData.maxSeats}
                onChange={(e) => setFormData({ ...formData, maxSeats: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                <Clock className="w-4 h-4 mr-2 text-primary" /> Registration Deadline
              </label>
              <input
                type="datetime-local"
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                value={formData.registrationDeadline}
                onChange={(e) => setFormData({ ...formData, registrationDeadline: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                <AlignLeft className="w-4 h-4 mr-2 text-primary" /> Category
              </label>
              <select
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="">Select Category</option>
                <option value="Technical">Technical</option>
                <option value="Cultural">Cultural</option>
                <option value="Sports">Sports</option>
                <option value="Workshop">Workshop</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                <ImageIcon className="w-4 h-4 mr-2 text-primary" /> Event Image
              </label>
              <div className="relative">
                <input
                  type="file"
                  className="hidden"
                  id="image-upload"
                  onChange={(e) => setImage(e.target.files[0])}
                  accept="image/*"
                />
                <label 
                  htmlFor="image-upload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-all overflow-hidden"
                >
                  {image ? (
                    <div className="text-center">
                      <p className="text-primary font-bold text-sm">{image.name}</p>
                      <p className="text-xs text-gray-400">Click to change</p>
                    </div>
                  ) : (
                    <>
                      <ImageIcon className="w-8 h-8 text-gray-300 mb-2" />
                      <p className="text-xs text-gray-400">Upload cover image</p>
                    </>
                  )}
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                <AlignLeft className="w-4 h-4 mr-2 text-primary" /> Description
              </label>
              <textarea
                required
                rows="4"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all resize-none"
                placeholder="Tell students what the event is about..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              ></textarea>
            </div>
          </div>

          <div className="md:col-span-2 pt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-dark text-white py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-primary/20 transition-all flex items-center justify-center disabled:opacity-50"
            >
              {loading ? 'Creating...' : (
                <>
                  Submit for Approval <Send className="ml-2 w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateEvent;
