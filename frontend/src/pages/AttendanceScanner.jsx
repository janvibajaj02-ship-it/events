import { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { ArrowLeft, CheckCircle, XCircle, Loader, Camera } from 'lucide-react';

const AttendanceScanner = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [event, setEvent] = useState(null);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const { data } = await api.get(`/events/${eventId}`);
                setEvent(data);
            } catch {
                toast.error('Failed to load event details');
            }
        };
        fetchEvent();

        const markAttendance = async (userId) => {
            setLoading(true);
            try {
                const { data } = await api.post('/attendance/scan', { userId, eventId });
                setResult({ success: true, message: data.message, student: data.studentName });
                toast.success('Attendance marked!');
                setTimeout(() => {
                    setResult(null);
                }, 3000);
            } catch (error) {
                setResult({ 
                    success: false, 
                    message: error.response?.data?.message || 'Failed to mark attendance' 
                });
                toast.error('Scan failed');
                setTimeout(() => {
                    setResult(null);
                }, 3000);
            } finally {
                setLoading(false);
            }
        };

        const scanner = new Html5QrcodeScanner('reader', {
            fps: 10,
            qrbox: { width: 250, height: 250 },
        });

        scanner.render(onScanSuccess, onScanError);

        function onScanSuccess(decodedText) {
            try {
                const data = JSON.parse(decodedText);
                if (data.userId && data.eventId === eventId) {
                    markAttendance(data.userId);
                } else {
                    toast.error('Invalid QR Code for this event');
                }
            } catch {
                toast.error('Could not decode QR data');
            }
        }

        function onScanError() {
            // console.warn(err);
        }

        return () => scanner.clear();
    }, [eventId]);

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <div className="max-w-xl mx-auto">
                <button 
                    onClick={() => navigate('/organizer')}
                    className="flex items-center text-gray-400 hover:text-white mb-8 transition-colors"
                >
                    <ArrowLeft className="mr-2" /> Back to Dashboard
                </button>

                <div className="text-center mb-12">
                    <div className="inline-block px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full mb-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Attendance Mode</p>
                    </div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">QR Scanner</h1>
                    <p className="text-gray-400 font-bold max-w-xs mx-auto">{event?.title}</p>
                </div>

                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-600 rounded-[44px] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                    
                    <div className="relative bg-black rounded-[40px] overflow-hidden border-2 border-white/10 shadow-2xl aspect-square">
                        <div id="reader" className="w-full h-full"></div>
                        
                        {loading && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50">
                                <Loader className="w-12 h-12 text-primary animate-spin" />
                            </div>
                        )}

                        {result && (
                            <div 
                                className={`absolute inset-0 flex flex-col items-center justify-center z-50 p-10 ${
                                    result.success ? 'bg-green-600/95' : 'bg-red-600/95'
                                }`}
                            >
                                {result.success ? (
                                    <CheckCircle className="w-24 h-24 mb-6" />
                                ) : (
                                    <XCircle className="w-24 h-24 mb-6" />
                                )}
                                <h3 className="text-2xl font-black uppercase mb-2">{result.success ? 'Success!' : 'Error'}</h3>
                                <p className="font-bold text-center mb-4">{result.message}</p>
                                {result.student && (
                                    <p className="bg-white/20 px-4 py-2 rounded-full text-xs font-black uppercase">
                                        {result.student}
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="absolute inset-0 pointer-events-none border-2 border-primary/30 m-12 rounded-3xl">
                            <div className="absolute top-0 left-0 w-full h-1 bg-primary animate-scan-line"></div>
                        </div>
                    </div>
                </div>

                <div className="mt-12 bg-white/5 rounded-3xl p-6 border border-white/10 flex items-center gap-4">
                    <div className="bg-primary/20 p-3 rounded-2xl">
                        <Camera className="text-primary" />
                    </div>
                    <div>
                        <p className="text-xs font-black uppercase text-gray-400 tracking-widest">Scanner Active</p>
                        <p className="text-sm font-bold">Position the student's QR code within the frame</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AttendanceScanner;