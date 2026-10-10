import { useState, useRef, useEffect, useCallback } from 'react';
import jsQR from 'jsqr';
import { Html5Qrcode } from 'html5-qrcode';
import { BrowserMultiFormatReader, DecodeHintType, BarcodeFormat } from '@zxing/library';
import {
  Camera,
  Upload,
  Keyboard,
  Scan,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Video,
  VideoOff,
  SwitchCamera,
  ShieldCheck,
  Check,
  Zap,
  Info,
  Mail,
  Send,
  HelpCircle,
  Copy,
  Barcode as BarcodeIcon,
  Maximize2
} from 'lucide-react';
import Button from '../common/Button';
import EmailNotificationModal from '../common/EmailNotificationModal';
import { useVerification } from '../../context/VerificationContext';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { notificationApi } from '../../services/api';

export default function QRScanner({ onScanComplete }) {
  const [activeTab, setActiveTab] = useState('camera'); // 'camera' | 'upload' | 'manual'
  const [scanMode, setScanMode] = useState('all'); // 'all' | 'qr' | 'barcode'
  const [detectedFormat, setDetectedFormat] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' | 'user'
  const [detectedCode, setDetectedCode] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [manualId, setManualId] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailPreviewData, setEmailPreviewData] = useState(null);
  const [sendingEmail, setSendingEmail] = useState(false);

  const { user } = useAuth();

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const zxingReaderRef = useRef(null);
  const scanLockRef = useRef(false);
  const fileInputRef = useRef(null);
  const mediaStreamRef = useRef(null);

  const { verifyDocument, documents = [] } = useVerification();
  const { addToast } = useToast();
  const { t, language } = useLanguage();

  const myDoc = documents.find((d) => d.userId === user?.id || (d.holder && user?.name && d.holder.toLowerCase() === user.name.toLowerCase()));
  const myActiveDvid = myDoc ? (myDoc.digitalId || myDoc.id) : '';

  // Play audio beep when QR or Barcode is detected
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // 880 Hz beep
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch (e) {
      // AudioContext not allowed or not supported
    }
  };

  // Perform backend verification with decoded payload
  const executeVerification = async (rawPayload, source) => {
    setIsScanning(true);
    let searchKey = rawPayload.trim();

    // If payload is a full URL like https://veriglass.io/verify/DVID-..., extract token
    if (searchKey.includes('/verify/')) {
      searchKey = searchKey.split('/verify/')[1].split('?')[0];
    } else if (searchKey.includes('id=')) {
      const match = searchKey.match(/id=([^&]+)/);
      if (match) searchKey = match[1];
    }

    const isBarcode = source && source.toLowerCase().includes('barcode');

    // Toast when code is detected
    addToast(
      isBarcode
        ? (language === 'ta' ? '1D பார்-கோடு கண்டறியப்பட்டது. சரிபார்க்கப்படுகிறது...' : '1D Barcode Detected. Verifying...')
        : (language === 'ta' ? 'QR குறியீடு கண்டறியப்பட்டது. சரிபார்க்கப்படுகிறது...' : 'QR Code Detected. Verifying...'),
      'info',
      2500
    );

    try {
      const result = await verifyDocument(searchKey, source);
      setIsScanning(false);

      if (result.outcome === 'VALID') {
        addToast(
          language === 'ta'
            ? `✓ செல்லுபடியாகும்: ${result.doc?.holder || 'சான்றிதழ்'} சரிபார்க்கப்பட்டது!`
            : language === 'hi'
              ? `✓ मान्य: ${result.doc?.holder || 'प्रमाणपत्र'} सत्यापित!`
              : `✓ VALID: ${result.doc?.holder || 'Identity'} verified in root ledger!`,
          'success'
        );
      } else if (result.outcome === 'EXPIRED') {
        addToast(
          language === 'ta'
            ? '⚠ காலாவதியானது: இந்த சான்றிதழின் காலம் முடிந்துவிட்டது.'
            : language === 'hi'
              ? '⚠ समाप्त: इस क्रेडेंशियल की वैधता समाप्त हो चुकी है।'
              : '⚠ EXPIRED: Credential validity period has lapsed.',
          'warning'
        );
      } else if (result.outcome === 'REVOKED') {
        addToast(
          language === 'ta'
            ? '✕ ரத்து செய்யப்பட்டது: இந்த சான்றிதழ் நிர்வாகத்தால் ரத்து செய்யப்பட்டுள்ளது!'
            : language === 'hi'
              ? '✕ रद्द: यह क्रेडेंशियल सिस्टम द्वारा रद्द कर दिया गया है!'
              : '✕ REVOKED: Flagged/Tampered credential blocked by system!',
          'error'
        );
      } else {
        addToast(
          language === 'ta'
            ? '✕ தவறானது: இந்த குறியீடு தரவுத்தளத்தில் இல்லை.'
            : language === 'hi'
              ? '✕ अमान्य: यह कोड डेटाबेस में नहीं मिला।'
              : '✕ INVALID: Payload not found in institutional ledger.',
          'error'
        );
      }

      if (onScanComplete) onScanComplete(result);
    } catch (err) {
      setIsScanning(false);
      addToast('Verification error: ' + (err.message || 'Server error'), 'error');
    }
  };

  const handleOpenEmailModal = async () => {
    try {
      const res = await notificationApi.getEmails(user?.email || '');
      if (res && res.success && res.data && res.data.length > 0) {
        setEmailPreviewData(res.data[0]);
      } else {
        setEmailPreviewData({
          to: user?.email || '',
          recipientName: user?.name || 'Registered Member',
          digitalId: myActiveDvid || '',
          docName: myDoc?.name || 'Digital Identity Card',
          timestamp: new Date().toISOString()
        });
      }
      setShowEmailModal(true);
    } catch (e) {
      setEmailPreviewData({
        to: user?.email || '',
        recipientName: user?.name || 'Registered Member',
        digitalId: myActiveDvid || '',
        docName: myDoc?.name || 'Digital Identity Card'
      });
      setShowEmailModal(true);
    }
  };

  const handleSendEmailNotification = async () => {
    const targetEmail = user?.email || '';
    if (!targetEmail) {
      addToast('Please login with an email to receive notification', 'warning');
      return;
    }
    setSendingEmail(true);
    try {
      const res = await notificationApi.sendEmail({
        to: targetEmail,
        recipientName: user?.name || 'Registered Member',
        digitalId: myActiveDvid || '',
        docName: myDoc?.name || 'Digital Identity Card'
      });
      setSendingEmail(false);
      addToast(
        language === 'ta'
          ? `✓ மின்னஞ்சல் அனுப்பப்பட்டது: ${targetEmail} முகவரிக்கு உங்கள் ID அனுப்பப்பட்டது!`
          : language === 'hi'
            ? `✓ ईमेल भेजा गया: ${targetEmail} पर आपकी आईडी भेज दी गई है!`
            : `✓ Email sent: Verification ID notification dispatched to ${targetEmail}!`,
        'success'
      );
      if (res && res.data) {
        setEmailPreviewData(res.data);
        setShowEmailModal(true);
      }
    } catch (err) {
      setSendingEmail(false);
      addToast('Error sending email: ' + err.message, 'error');
    }
  };

  // Start Camera with ZXing Continuous MultiFormat Decoder (1D Barcodes + 2D QR Codes)
  const startCamera = async () => {
    setCameraError(null);
    setDetectedCode(null);
    scanLockRef.current = false;

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        let stream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: facingMode, width: { ideal: 1280 }, height: { ideal: 720 } }
          });
        } catch (constraintErr) {
          // Fallback to default webcam
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
        }

        mediaStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', 'true');
          await videoRef.current.play();
        }
        setCameraActive(true);

        // Build ZXing hints for chosen scan mode
        const hints = new Map();
        let formats = [];
        if (scanMode === 'barcode') {
          formats = [
            BarcodeFormat.CODE_128,
            BarcodeFormat.CODE_39,
            BarcodeFormat.CODE_93,
            BarcodeFormat.EAN_13,
            BarcodeFormat.EAN_8,
            BarcodeFormat.UPC_A,
            BarcodeFormat.UPC_E,
            BarcodeFormat.CODABAR,
            BarcodeFormat.ITF
          ];
        } else if (scanMode === 'qr') {
          formats = [BarcodeFormat.QR_CODE];
        } else {
          // ALL formats
          formats = [
            BarcodeFormat.QR_CODE,
            BarcodeFormat.CODE_128,
            BarcodeFormat.CODE_39,
            BarcodeFormat.CODE_93,
            BarcodeFormat.EAN_13,
            BarcodeFormat.EAN_8,
            BarcodeFormat.UPC_A,
            BarcodeFormat.UPC_E,
            BarcodeFormat.CODABAR,
            BarcodeFormat.ITF,
            BarcodeFormat.DATA_MATRIX
          ];
        }
        hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);
        hints.set(DecodeHintType.TRY_HARDER, true);

        if (zxingReaderRef.current) {
          try {
            zxingReaderRef.current.reset();
          } catch (e) {}
        }

        const reader = new BrowserMultiFormatReader(hints);
        reader.timeBetweenDecodingAttempts = 120; // 120ms for fast detection
        reader.timeBetweenScansMillis = 120; // 120ms continuous scan loop
        zxingReaderRef.current = reader;

        if (videoRef.current) {
          reader.decodeFromVideoElementContinuously(videoRef.current, (result, err) => {
            if (result && !scanLockRef.current) {
              scanLockRef.current = true;
              const rawPayload = result.getText();
              const formatEnum = result.getBarcodeFormat();
              const formatTitle = BarcodeFormat[formatEnum] || 'BARCODE';
              const isBarcode = formatTitle !== 'QR_CODE';

              playBeep();
              setDetectedCode(rawPayload);
              setDetectedFormat(formatTitle);
              stopCamera();

              addToast(
                isBarcode
                  ? (language === 'ta' ? `✓ 1D பார்-கோடு (${formatTitle}) கண்டறியப்பட்டது: ${rawPayload.substring(0, 25)}` : `✓ 1D Barcode (${formatTitle}) Detected: ${rawPayload.substring(0, 25)}`)
                  : (language === 'ta' ? '✓ QR குறியீடு கண்டறியப்பட்டது!' : '✓ QR Code Detected!'),
                'success'
              );

              executeVerification(
                rawPayload,
                isBarcode ? `1D Barcode (${formatTitle})` : 'Live Camera QR Scan'
              );
            }
          });
        }

        addToast(
          language === 'ta'
            ? 'நேரடி கேமரா இயங்குகிறது. QR அல்லது பார்-கோடைக் காட்டவும்.'
            : language === 'hi'
              ? 'लाइव कैमरा सक्रिय है। QR या बारकोड दिखाएं।'
              : 'Live camera active. Point at any QR code or 1D barcode to scan.',
          'info'
        );
      } else {
        setCameraError('Camera API is not supported on this browser.');
      }
    } catch (err) {
      console.warn('Camera access error:', err);
      setCameraError('Camera permission denied or camera device not detected.');
      addToast('Camera unavailable. You can upload an image or enter a test credential below.', 'warning');
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (zxingReaderRef.current) {
      try {
        zxingReaderRef.current.reset();
      } catch (e) {}
      zxingReaderRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  // When scanMode changes, restart scanner with new hints
  useEffect(() => {
    if (cameraActive) {
      stopCamera();
      const timer = setTimeout(() => {
        startCamera();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [scanMode]);

  // Switch between front and back camera
  const toggleFacingMode = () => {
    stopCamera();
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
    setTimeout(() => {
      startCamera();
    }, 200);
  };

  // Real Image File Decoder supporting 1D Barcode (Code-128, Code-39, EAN, UPC) and 2D QR Code
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    setIsScanning(true);
    addToast(
      language === 'ta'
        ? `${file.name} பகுப்பாய்வு செய்யப்படுகிறது (பார்-கோடு / QR)...`
        : language === 'hi'
          ? `${file.name} का विश्लेषण किया जा रहा है (बारकोड / QR)...`
          : `Analyzing ${file.name} for 1D Barcode & 2D QR Code...`,
      'info',
      1200
    );

    const reader = new FileReader();
    reader.onload = async (event) => {
      const img = new Image();
      img.onload = async () => {
        let decodedPayload = null;
        let detectedType = 'QR / Barcode';

        // 1. Try ZXing BrowserMultiFormatReader on image
        try {
          const zxing = new BrowserMultiFormatReader();
          const zxingResult = await zxing.decodeFromImageElement(img);
          if (zxingResult) {
            decodedPayload = zxingResult.getText();
            const formatEnum = zxingResult.getBarcodeFormat();
            detectedType = BarcodeFormat[formatEnum] || 'BARCODE';
          }
        } catch (zxingErr) {
          // not found in zxing, try next
        }

        // 2. Try Html5Qrcode file scan (supports Code-128, Code-39, EAN-13, UPC, etc.)
        if (!decodedPayload) {
          try {
            const tempScannerId = 'html5-file-scanner-temp';
            let container = document.getElementById(tempScannerId);
            if (!container) {
              container = document.createElement('div');
              container.id = tempScannerId;
              container.style.position = 'absolute';
              container.style.width = '1px';
              container.style.height = '1px';
              container.style.opacity = '0';
              container.style.pointerEvents = 'none';
              document.body.appendChild(container);
            }
            const html5Scanner = new Html5Qrcode(tempScannerId);
            const scanResult = await html5Scanner.scanFileV2(file, false);
            if (scanResult && scanResult.decodedText) {
              decodedPayload = scanResult.decodedText;
              detectedType = scanResult.result?.format?.formatName || 'BARCODE / QR';
            }
            try {
              await html5Scanner.clear();
            } catch (clearErr) {}
          } catch (html5Err) {
            // not decoded by html5-qrcode
          }
        }

        // 3. Fallback to jsQR for 2D QR matrices
        if (!decodedPayload) {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          ctx.drawImage(img, 0, 0, img.width, img.height);
          const imageData = ctx.getImageData(0, 0, img.width, img.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'attemptBoth'
          });
          if (code && code.data) {
            decodedPayload = code.data;
            detectedType = 'QR_CODE';
          }
        }

        if (decodedPayload) {
          playBeep();
          setDetectedCode(decodedPayload);
          setDetectedFormat(detectedType);
          const is1D = detectedType !== 'QR_CODE' && !detectedType.includes('QR');
          addToast(
            language === 'ta'
              ? `✓ ${is1D ? '1D பார்-கோடு' : 'QR குறியீடு'} (${detectedType}) வெற்றிகரமாக படிக்கப்பட்டது: ${decodedPayload.substring(0, 30)}`
              : `✓ Decoded ${detectedType}: ${decodedPayload.substring(0, 30)}...`,
            'success'
          );
          executeVerification(decodedPayload, `Image Upload (${detectedType})`);
        } else {
          setIsScanning(false);
          addToast(
            language === 'ta'
              ? '✕ இந்த படத்தில் பார்-கோடு அல்லது QR குறியீடு கண்டறியப்படவில்லை. தெளிவான படத்தை பதிவேற்றவும்.'
              : language === 'hi'
                ? '✕ इस छवि में कोई बारकोड या QR कोड नहीं मिला।'
                : '✕ No barcode or QR code detected in this image. Please upload a clear image.',
            'error',
            3500
          );
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualId.trim()) {
      addToast('Please enter an ID or QR token', 'error');
      return;
    }
    executeVerification(manualId.trim(), 'Manual ID Entry');
  };

  return (
    <div className="vg-card" style={{ padding: '1.75rem' }}>
      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Header Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: cameraActive ? '#10b981' : '#64748b',
            boxShadow: cameraActive ? '0 0 10px #10b981' : 'none',
            animation: cameraActive ? 'pulse 2s infinite' : 'none'
          }} />
          <span style={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.06em', color: cameraActive ? '#059669' : '#64748b', textTransform: 'uppercase' }}>
            {cameraActive
              ? (language === 'ta' ? 'கேமரா நேரலையில் உள்ளது' : language === 'hi' ? 'लाइव कैमरा चालू है' : 'Camera Feed Active')
              : (language === 'ta' ? 'ஸ்கேனர் தயார்' : language === 'hi' ? 'स्कैनर तैयार है' : 'Optical Engine Ready')}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.35rem', backgroundColor: '#f1f5f9', padding: '0.25rem', borderRadius: '0.75rem' }}>
          <button
            onClick={() => { setActiveTab('camera'); }}
            className={`btn btn-sm ${activeTab === 'camera' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ border: 'none', padding: '0.35rem 0.75rem' }}
          >
            <Camera size={14} />
            <span>{t('liveCamera')}</span>
          </button>
          <button
            onClick={() => { setActiveTab('upload'); stopCamera(); }}
            className={`btn btn-sm ${activeTab === 'upload' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ border: 'none', padding: '0.35rem 0.75rem' }}
          >
            <Upload size={14} />
            <span>{t('uploadImage')}</span>
          </button>
          <button
            onClick={() => { setActiveTab('manual'); stopCamera(); }}
            className={`btn btn-sm ${activeTab === 'manual' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ border: 'none', padding: '0.35rem 0.75rem' }}
          >
            <Keyboard size={14} />
            <span>{t('enterId')}</span>
          </button>
        </div>
      </div>

      {/* Optical Scan Target Mode Switcher */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1rem',
        padding: '0.45rem 0.75rem',
        backgroundColor: '#f8fafc',
        borderRadius: '0.85rem',
        border: '1px solid #e2e8f0',
        flexWrap: 'wrap',
        gap: '0.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Zap size={14} color="#2563eb" />
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {language === 'ta' ? 'ஸ்கேன் முறை:' : 'Scan Target:'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setScanMode('all')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.3rem 0.75rem',
              borderRadius: '0.55rem',
              fontSize: '0.78rem',
              fontWeight: scanMode === 'all' ? 800 : 600,
              border: scanMode === 'all' ? '1.5px solid #2563eb' : '1px solid #cbd5e1',
              backgroundColor: scanMode === 'all' ? '#2563eb' : '#ffffff',
              color: scanMode === 'all' ? '#ffffff' : '#475569',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Zap size={12} />
            <span>{language === 'ta' ? 'அனைத்தும் (QR + பார்-கோடு)' : 'All (QR + Barcode)'}</span>
          </button>

          <button
            type="button"
            onClick={() => setScanMode('barcode')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.3rem 0.75rem',
              borderRadius: '0.55rem',
              fontSize: '0.78rem',
              fontWeight: scanMode === 'barcode' ? 800 : 600,
              border: scanMode === 'barcode' ? '1.5px solid #dc2626' : '1px solid #cbd5e1',
              backgroundColor: scanMode === 'barcode' ? '#dc2626' : '#ffffff',
              color: scanMode === 'barcode' ? '#ffffff' : '#475569',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <BarcodeIcon size={13} />
            <span>{language === 'ta' ? '1D பார்-கோடு' : '1D Barcode'}</span>
          </button>

          <button
            type="button"
            onClick={() => setScanMode('qr')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.3rem 0.75rem',
              borderRadius: '0.55rem',
              fontSize: '0.78rem',
              fontWeight: scanMode === 'qr' ? 800 : 600,
              border: scanMode === 'qr' ? '1.5px solid #0284c7' : '1px solid #cbd5e1',
              backgroundColor: scanMode === 'qr' ? '#0284c7' : '#ffffff',
              color: scanMode === 'qr' ? '#ffffff' : '#475569',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Scan size={13} />
            <span>{language === 'ta' ? '2D QR குறியீடு' : '2D QR Code'}</span>
          </button>
        </div>
      </div>

      {/* Camera Viewport */}
      {activeTab === 'camera' && (
        <div>
          <div className="scanner-viewport" style={{
            minHeight: '340px',
            flexDirection: 'column',
            gap: '1.25rem',
            position: 'relative',
            overflow: 'hidden',
            backgroundColor: '#090d16',
            borderRadius: '1.25rem'
          }}>
            {/* Live Video Feed */}
            <video
              ref={videoRef}
              style={{
                display: cameraActive ? 'block' : 'none',
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />

            {/* Target Reticle Viewfinder */}
            <div style={{
              width: scanMode === 'barcode' ? '290px' : scanMode === 'all' ? '270px' : '240px',
              height: scanMode === 'barcode' ? '160px' : scanMode === 'all' ? '220px' : '240px',
              border: scanMode === 'barcode' ? '2px dashed rgba(239, 68, 68, 0.85)' : '2px dashed rgba(56, 189, 248, 0.85)',
              borderRadius: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              backgroundColor: cameraActive ? 'rgba(15, 23, 42, 0.25)' : 'rgba(15, 23, 42, 0.8)',
              zIndex: 2,
              backdropFilter: cameraActive ? 'none' : 'blur(4px)',
              transition: 'all 0.25s ease'
            }}>
              {/* Corner Reticle Brackets */}
              <div style={{ position: 'absolute', top: '-2px', left: '-2px', width: '24px', height: '24px', borderTop: scanMode === 'barcode' ? '3px solid #ef4444' : '3px solid #38bdf8', borderLeft: scanMode === 'barcode' ? '3px solid #ef4444' : '3px solid #38bdf8', borderTopLeftRadius: '0.6rem' }} />
              <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '24px', height: '24px', borderTop: scanMode === 'barcode' ? '3px solid #ef4444' : '3px solid #38bdf8', borderRight: scanMode === 'barcode' ? '3px solid #ef4444' : '3px solid #38bdf8', borderTopRightRadius: '0.6rem' }} />
              <div style={{ position: 'absolute', bottom: '-2px', left: '-2px', width: '24px', height: '24px', borderBottom: scanMode === 'barcode' ? '3px solid #ef4444' : '3px solid #38bdf8', borderLeft: scanMode === 'barcode' ? '3px solid #ef4444' : '3px solid #38bdf8', borderBottomLeftRadius: '0.6rem' }} />
              <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '24px', height: '24px', borderBottom: scanMode === 'barcode' ? '3px solid #ef4444' : '3px solid #38bdf8', borderRight: scanMode === 'barcode' ? '3px solid #ef4444' : '3px solid #38bdf8', borderBottomRightRadius: '0.6rem' }} />

              {/* Sub-label inside reticle */}
              <div style={{
                position: 'absolute',
                top: '8px',
                padding: '0.15rem 0.5rem',
                backgroundColor: 'rgba(0,0,0,0.6)',
                borderRadius: '0.35rem',
                fontSize: '0.65rem',
                fontWeight: 800,
                color: scanMode === 'barcode' ? '#f87171' : '#38bdf8',
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
              }}>
                {scanMode === 'barcode' ? '|||| 1D Barcode Target' : scanMode === 'all' ? '✦ Dual 1D / 2D Engine' : '⬛ 2D QR Target'}
              </div>

              {/* Animated Optical Laser Sweep */}
              {cameraActive && (
                <div style={{
                  position: 'absolute',
                  left: '6px',
                  right: '6px',
                  height: scanMode === 'barcode' ? '3px' : '2px',
                  backgroundColor: scanMode === 'barcode' ? '#ef4444' : '#38bdf8',
                  boxShadow: scanMode === 'barcode' ? '0 0 14px #ef4444, 0 0 24px #ef4444' : '0 0 14px #38bdf8, 0 0 24px #38bdf8',
                  animation: 'laserSweep 2s ease-in-out infinite'
                }} />
              )}

              {/* QR / Barcode Code Detected Overlay */}
              {isScanning && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'rgba(15, 23, 42, 0.92)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '1rem',
                  textAlign: 'center',
                  zIndex: 10,
                  borderRadius: '1.25rem'
                }}>
                  <RefreshCw size={32} className="spin" color={detectedFormat && detectedFormat !== 'QR_CODE' ? '#ef4444' : '#38bdf8'} />
                  <strong style={{ color: '#ffffff', fontSize: '0.95rem', marginTop: '0.75rem' }}>
                    {detectedFormat && detectedFormat !== 'QR_CODE'
                      ? (language === 'ta' ? `1D பார்-கோடு (${detectedFormat}) கண்டறியப்பட்டது` : `1D Barcode (${detectedFormat}) Detected`)
                      : (language === 'ta' ? 'QR குறியீடு கண்டறியப்பட்டது' : 'QR Code Detected')}
                  </strong>
                  <span style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                    {language === 'ta' ? 'சரிபார்ப்பு நிலையை சரிபார்க்கிறது...' : 'Checking verification status in root ledger...'}
                  </span>
                </div>
              )}

              {!cameraActive && (
                <div style={{ textAlign: 'center', color: '#94a3b8', padding: '1rem' }}>
                  {scanMode === 'barcode' ? (
                    <BarcodeIcon size={52} strokeWidth={1.4} color="#ef4444" />
                  ) : (
                    <Scan size={52} strokeWidth={1.4} color="#38bdf8" />
                  )}
                  <p style={{ fontSize: '0.85rem', marginTop: '0.85rem', color: '#cbd5e1', fontWeight: 600 }}>
                    {language === 'ta' ? 'கேமராவைத் தொடங்கவும்' : language === 'hi' ? 'कैमरा शुरू करें' : 'Camera Standby'}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
                    {scanMode === 'barcode'
                      ? (language === 'ta' ? 'பார்-கோடை ஸ்கேன் செய்ய கேமராவைத் தொடங்குங்கள்' : 'Click "Start Real Camera" to scan any 1D barcode')
                      : (language === 'ta' ? 'QR / பார்-கோடை ஸ்கேன் செய்ய கேமராவைத் தொடங்குங்கள்' : 'Click "Start Real Camera" below to scan QR or Barcode')}
                  </p>
                </div>
              )}
            </div>

            {/* Instruction Banner */}
            <div style={{
              backgroundColor: scanMode === 'barcode' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(56, 189, 248, 0.1)',
              border: scanMode === 'barcode' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '0.75rem',
              padding: '0.65rem 1rem',
              textAlign: 'center',
              zIndex: 3
            }}>
              <p style={{ color: scanMode === 'barcode' ? '#fca5a5' : '#bae6fd', fontSize: '0.82rem', fontWeight: 600, margin: 0 }}>
                {scanMode === 'barcode'
                  ? (language === 'ta'
                      ? '📌 பார்-கோடின் மீது சிவப்பு லேசர் வரியை கிடைமட்டமாக (Horizontal) வைக்கவும். சிஸ்டமே தானாக ஸ்கேன் செய்யும்.'
                      : '📌 Align the red laser horizontally across the 1D barcode. Decoding is completely automatic.')
                  : (language === 'ta'
                      ? '📌 பயனரிடம் தங்கள் QR குறியீடு அல்லது பார்-கோடைக் காட்டுமாறு கேட்கவும். ஸ்கேனர் தானாகவே படிக்கும்.'
                      : '📌 Ask user to present their QR code or 1D Barcode. Automatic optical detection is active.')}
              </p>
            </div>

            {/* Viewport Control Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', zIndex: 3 }}>
              {!cameraActive ? (
                <button
                  type="button"
                  onClick={startCamera}
                  style={{
                    backgroundColor: scanMode === 'barcode' ? '#dc2626' : '#0284c7',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.55rem 1.25rem',
                    borderRadius: '0.65rem',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: scanMode === 'barcode' ? '0 4px 12px rgba(220, 38, 38, 0.4)' : '0 4px 12px rgba(2, 132, 199, 0.4)'
                  }}
                >
                  <Video size={16} />
                  <span>{language === 'ta' ? 'உண்மையான கேமராவைத் தொடங்கு' : language === 'hi' ? 'असली कैमरा शुरू करें' : 'Start Real Camera'}</span>
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={stopCamera}
                    style={{
                      backgroundColor: 'rgba(239,68,68,0.25)',
                      color: '#f87171',
                      border: '1px solid rgba(239,68,68,0.5)',
                      padding: '0.45rem 0.95rem',
                      borderRadius: '0.55rem',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    <VideoOff size={15} />
                    <span>{language === 'ta' ? 'கேமராவை நிறுத்து' : language === 'hi' ? 'कैमरा बंद करें' : 'Stop Camera'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={toggleFacingMode}
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.15)',
                      color: '#ffffff',
                      border: '1px solid rgba(255,255,255,0.3)',
                      padding: '0.45rem 0.85rem',
                      borderRadius: '0.55rem',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}
                    title="Flip camera"
                  >
                    <SwitchCamera size={15} />
                    <span>Flip</span>
                  </button>
                </>
              )}
            </div>

            {cameraError && (
              <div style={{ backgroundColor: 'rgba(245,158,11,0.2)', border: '1px solid #f59e0b', padding: '0.4rem 0.85rem', borderRadius: '0.5rem', color: '#fbbf24', fontSize: '0.75rem', zIndex: 2 }}>
                {cameraError}
              </div>
            )}
          </div>

          {/* Automatic QR / Barcode Image Upload Dropzone */}
          <div style={{
            marginTop: '1.25rem',
            padding: '1rem 1.25rem',
            borderRadius: '0.85rem',
            border: '2px dashed var(--border-color)',
            backgroundColor: 'rgba(0,0,0,0.02)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '0.75rem',
                backgroundColor: 'rgba(56, 189, 248, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)'
              }}>
                <Upload size={20} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {language === 'ta' ? 'QR அல்லது பார்-கோடு படம் பதிவேற்றி தானாக சரிபார்' : 'Upload QR or Barcode Image to Auto-Verify'}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {language === 'ta' ? 'Code-128, Code-39, EAN-13, UPC மற்றும் 2D QR குறியீடுகளை சிஸ்டமே தானாக படிக்கும்' : 'Supports Code-128, Code-39, EAN-13, UPC & 2D QR matrices with automatic MongoDB status evaluation'}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                padding: '0.6rem 1.25rem',
                borderRadius: '0.65rem',
                border: '1.5px solid var(--primary)',
                backgroundColor: 'var(--primary)',
                color: '#ffffff',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
              }}
            >
              <Upload size={16} />
              <span>{language === 'ta' ? 'படம் பதிவேற்று' : 'Select Image File'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Upload QR Image Tab */}
      {activeTab === 'upload' && (
        <div style={{ textAlign: 'center' }}>
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: '2px dashed var(--border-color)',
              borderRadius: '1.25rem',
              padding: '3rem 1.5rem',
              cursor: 'pointer',
              backgroundColor: '#fafbfc',
              transition: 'border-color 0.2s',
              minHeight: '260px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files?.[0]) {
                handleFileUpload({ target: { files: e.dataTransfer.files } });
              }
            }}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              style={{ display: 'none' }}
            />
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '1rem',
              backgroundColor: '#eff6ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
              marginBottom: '1rem'
            }}>
              <Upload size={30} />
            </div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
              {uploadedFile ? uploadedFile.name : (language === 'ta' ? 'QR அல்லது பார்-கோடு படக் கோப்பை இங்கே பதிவேற்றவும்' : language === 'hi' ? 'यहाँ QR या बारकोड छवि अपलोड करें' : 'Upload Any QR Code or 1D Barcode Image')}
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 1.25rem' }}>
              {language === 'ta'
                ? 'சிஸ்டம் தானாகவே 1D பார்-கோடு (Code-128/EAN/UPC) அல்லது 2D QR குறியீட்டைப் படித்து உடனடியாக தரவுத்தளத்தில் சரிபார்க்கும்.'
                : language === 'hi'
                  ? 'सिस्टम स्वचालित रूप से 1D बारकोड या 2D QR कोड का पता लगाकर तुरंत सत्यापन करेगा।'
                  : 'Multi-decoder engine (BarcodeDetector + Html5Qrcode + jsQR) parses Code-128, Code-39, EAN, UPC, and QR codes directly.'}
            </p>
            <Button variant="secondary" size="sm" type="button">
              {language === 'ta' ? 'கோப்பைத் தேர்ந்தெடு' : language === 'hi' ? 'फ़ाइल चुनें' : 'Browse Files'}
            </Button>
          </div>
        </div>
      )}

      {/* Manual ID Input Tab */}
      {activeTab === 'manual' && (
        <div style={{ padding: '0.75rem 0' }}>
          {/* WHERE DO I GET THIS ID EXPLANATION BOX */}
          <div style={{
            backgroundColor: 'var(--bg-subtle)',
            border: '1px solid var(--border-color)',
            borderRadius: '1rem',
            padding: '1.25rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
              <HelpCircle size={18} color="var(--primary)" />
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                {language === 'ta'
                  ? 'இந்த சரிபார்ப்பு ஐடி (Verification ID) எங்கே இருக்கும்?'
                  : language === 'hi'
                    ? 'यह सत्यापन आईडी (Verification ID) कहाँ मिलेगी?'
                    : 'Where do you get this Verification ID?'}
              </h4>
            </div>

            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '0.85rem' }}>
              {language === 'ta'
                ? 'டிஜிட்டல் சரிபார்ப்பு ஐடி (DVID) என்பது உங்கள் சான்றிதழ் அல்லது ஐடி அட்டைக்கான தனித்துவமான குறியீடாகும். இதனை பின்வரும் இடங்களில் எளிதாகப் பெறலாம்:'
                : language === 'hi'
                  ? 'डिजिटल सत्यापन आईडी (DVID) आपके प्रमाण पत्र या पहचान पत्र का विशिष्ट कोड है। इसे आप निम्न स्थानों से प्राप्त कर सकते हैं:'
                  : 'The Digital Verification ID (DVID) is the institutional identifier for authenticating credentials. You can locate it from:'}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.65rem', marginBottom: '1rem' }}>
              <div style={{ backgroundColor: 'var(--bg-card)', padding: '0.65rem 0.85rem', borderRadius: '0.65rem', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', display: 'block' }}>
                  1. {language === 'ta' ? 'டிஜிட்டல் ஐடி அட்டை' : language === 'hi' ? 'डिजिटल आईडी कार्ड' : 'Digital ID Card'}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-main)', fontWeight: 600 }}>
                  {language === 'ta' ? 'டாஷ்போர்டில் உள்ள "Digital ID" அல்லது "My QR" பக்கம்' : language === 'hi' ? '"Digital ID" या "My QR" पेज पर' : 'Top of your ID Card (e.g. DVID-2026-CS892)'}
                </span>
              </div>

              <div style={{ backgroundColor: 'var(--bg-card)', padding: '0.65rem 0.85rem', borderRadius: '0.65rem', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', display: 'block' }}>
                  2. {language === 'ta' ? 'மின்னஞ்சல் அறிவிப்பு' : language === 'hi' ? 'ईमेल अधिसूचना' : 'Email Notification'}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-main)', fontWeight: 600 }}>
                  {language === 'ta' ? 'ஐடி ஒப்புதல் அளிக்கப்பட்டவுடன் மின்னஞ்சலுக்கு அனுப்பப்படும்' : language === 'hi' ? 'आईडी जारी होने पर ईमेल पर भेजी गई' : 'Sent to your institutional inbox'}
                </span>
              </div>

              <div style={{ backgroundColor: 'var(--bg-card)', padding: '0.65rem 0.85rem', borderRadius: '0.65rem', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', display: 'block' }}>
                  3. {language === 'ta' ? 'அறிவிப்பு மணி' : language === 'hi' ? 'सूचनाएं' : 'In-App Alerts'}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-main)', fontWeight: 600 }}>
                  {language === 'ta' ? 'மேல் பட்டியில் உள்ள 🔔 அறிவிப்பு மையம்' : language === 'hi' ? 'शीर्ष पट्टी में 🔔 नोटिफिकेशन बॉक्स' : 'Available in your notification feed'}
                </span>
              </div>
            </div>

            {/* Quick Action Buttons Row */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setManualId(myActiveDvid)}
                className="btn btn-primary btn-sm"
                style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Sparkles size={13} />
                <span>
                  {language === 'ta'
                    ? `எனது ஐடியை நிரப்புக (${myActiveDvid})`
                    : language === 'hi'
                      ? `मेरी आईडी भरें (${myActiveDvid})`
                      : `Autofill My ID (${myActiveDvid})`}
                </span>
              </button>

              <button
                type="button"
                onClick={handleOpenEmailModal}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Mail size={13} color="var(--primary)" />
                <span>
                  {language === 'ta' ? 'மின்னஞ்சல் அறிவிப்பில் காண்க' : language === 'hi' ? 'ईमेल में देखें' : 'View Email Notification'}
                </span>
              </button>

              <button
                type="button"
                onClick={handleSendEmailNotification}
                disabled={sendingEmail}
                className="btn btn-subtle btn-sm"
                style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Send size={13} />
                <span>
                  {sendingEmail
                    ? 'Sending...'
                    : (language === 'ta' ? 'மின்னஞ்சலுக்கு அனுப்பு' : language === 'hi' ? 'ईमेल पर भेजें' : 'Resend to My Email')}
                </span>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleManualSubmit}>
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
              <input
                type="text"
                placeholder={
                  language === 'ta'
                    ? 'DVID-2026-CS892 அல்லது டோக்கனை உள்ளிடவும்...'
                    : language === 'hi'
                      ? 'DVID-2026-CS892 या टोकन दर्ज करें...'
                      : 'Enter DVID-2026-CS892 or verification token...'
                }
                value={manualId}
                onChange={(e) => setManualId(e.target.value)}
                style={{
                  flex: 1,
                  padding: '0.75rem 1rem',
                  borderRadius: '0.75rem',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  outline: 'none',
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--text-main)'
                }}
              />
              <Button variant="primary" type="submit" loading={isScanning} icon={ShieldCheck}>
                {language === 'ta' ? 'சரிபார்' : language === 'hi' ? 'सत्यापित करें' : 'Authenticate'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Email Notification Modal */}
      <EmailNotificationModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        emailData={emailPreviewData}
        onUseId={(id) => {
          setManualId(id);
          setActiveTab('manual');
          executeVerification(id, 'Email Modal Quick Autofill');
        }}
      />
    </div>
  );
}
