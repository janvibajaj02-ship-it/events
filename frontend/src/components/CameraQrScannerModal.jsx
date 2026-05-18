import { useEffect, useRef, useState } from 'react';
import { Camera, ScanLine, X } from 'lucide-react';

const CameraQrScannerModal = ({ isOpen, onClose, onScan }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const frameRef = useRef(null);
  const detectorRef = useRef(null);
  const [error, setError] = useState('');
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    let cancelled = false;

    const stopScanner = () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };

    const scanFrame = async () => {
      if (
        cancelled ||
        !videoRef.current ||
        !canvasRef.current ||
        !detectorRef.current ||
        videoRef.current.readyState < 2
      ) {
        frameRef.current = requestAnimationFrame(scanFrame);
        return;
      }

      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      const video = videoRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      try {
        const barcodes = await detectorRef.current.detect(canvas);
        const qrCode = barcodes.find((barcode) => barcode.rawValue);

        if (qrCode?.rawValue) {
          onScan(qrCode.rawValue);
          stopScanner();
          return;
        }
      } catch (scanError) {
        setError(scanError.message || 'Unable to read QR code from camera');
      }

      frameRef.current = requestAnimationFrame(scanFrame);
    };

    const startScanner = async () => {
      if (!window.isSecureContext) {
        setError('Camera scanning needs HTTPS or localhost');
        return;
      }

      if (!('BarcodeDetector' in window)) {
        setError('This browser does not support camera QR scanning. Use the paste box below.');
        return;
      }

      try {
        setStarting(true);
        setError('');
        detectorRef.current = new window.BarcodeDetector({ formats: ['qr_code'] });

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        frameRef.current = requestAnimationFrame(scanFrame);
      } catch (startError) {
        setError(startError.message || 'Unable to start camera scanner');
      } finally {
        if (!cancelled) {
          setStarting(false);
        }
      }
    };

    startScanner();

    return () => {
      cancelled = true;
      stopScanner();
    };
  }, [isOpen, onClose, onScan]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-[32px] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <h3 className="text-xl font-black text-gray-900">Camera QR Scanner</h3>
            <p className="mt-1 text-sm font-medium text-gray-500">Point the camera at a student pass QR code</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-2xl bg-gray-100 p-3 text-gray-500 transition-all hover:bg-red-50 hover:text-primary"
            title="Close scanner"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="relative overflow-hidden rounded-[28px] bg-gray-950">
            <video ref={videoRef} className="aspect-video w-full object-cover" muted playsInline />
            <canvas ref={canvasRef} className="hidden" />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-56 w-56 rounded-[28px] border-4 border-white/80 shadow-[0_0_0_999px_rgba(0,0,0,0.35)]" />
            </div>
            <div className="absolute left-6 top-6 inline-flex items-center rounded-full bg-white/15 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-white backdrop-blur">
              <ScanLine className="mr-2 h-4 w-4" /> Live scan
            </div>
            {starting && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/45 text-white">
                <div className="rounded-2xl bg-white/10 px-5 py-4 text-sm font-bold backdrop-blur">Starting camera...</div>
              </div>
            )}
          </div>

          {error ? (
            <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              {error}
            </div>
          ) : (
            <div className="mt-4 flex items-center rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700">
              <Camera className="mr-2 h-4 w-4" /> Keep the QR code inside the frame for automatic attendance marking.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CameraQrScannerModal;
