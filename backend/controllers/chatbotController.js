/**
 * VerifyAssist Intelligent FAQ & Assistance Engine
 * Trilingual: Fluent in English, Tamil (தமிழ்), and Hindi (हिन्दी).
 * Automatically resolves questions regarding verification, registration, QR codes,
 * status states (Valid, Expired, Revoked, Invalid), and administrative actions.
 */

const faqDatabase = [
  {
    keywords: ['register', 'sign up', 'create account', 'பதிவு', 'கணக்கு', 'எப்படி பதிவு', 'पंजीकरण', 'रजिस्टर', 'खाता बनाएं', 'साइन अप'],
    replyEn: 'To register: Click "Register" on the top navigation, fill in your Name, Email, Password, Department, and select your Role (Student, Employee, or Verifier). Once submitted, your account is immediately created and ready to use.',
    replyTa: 'பதிவு செய்ய: மேல் பட்டியில் உள்ள "பதிவு செய்" (Register) என்பதைக் கிளிக் செய்து, உங்கள் பெயர், மின்னஞ்சல், கடவுச்சொல் மற்றும் பங்கைத் (மாணவர்/பணியாளர்) தேர்ந்தெடுக்கவும். உடனடியாக உங்கள் கணக்கு உருவாக்கப்படும்.',
    replyHi: 'पंजीकरण करने के लिए: शीर्ष नेविगेशन पर "पंजीकरण करें" (Register) पर क्लिक करें, अपना नाम, ईमेल, पासवर्ड, विभाग भरें और अपनी भूमिका (छात्र, कर्मचारी या सत्यापनकर्ता) चुनें। आपका खाता तुरंत सक्रिय हो जाएगा।',
    category: 'Registration'
  },
  {
    keywords: ['digital id', 'create id', 'request id', 'identity card', 'அடையாள அட்டை', 'டிஜிட்டல் ஐடி', 'डिजिटल आईडी', 'आईडी कार्ड', 'पहचान पत्र'],
    replyEn: 'To create a Digital ID: Log in to your Student/Employee portal, navigate to "Digital ID" or "Request Identity", provide your course/designation, student ID, and photo. Submit the application to the Admin. Once approved, your unique DVID (e.g. DVID-2026-XXXX) and secure QR code are generated.',
    replyTa: 'டிஜிட்டல் ஐடி பெற: உள்நுழைந்து "டிஜிட்டல் ஐடி" பக்கத்திற்குச் சென்று, உங்கள் படிப்பு, அடையாள எண் மற்றும் விவரங்களை நிரப்பி சமர்ப்பிக்கவும். நிர்வாகி (Admin) ஒப்புதல் அளித்ததும் தனித்துவமான DVID மற்றும் பாதுகாப்பான QR குறியீடு வழங்கப்படும்.',
    replyHi: 'डिजिटल आईडी बनाने के लिए: अपने छात्र/कर्मचारी पोर्टल में लॉगिन करें, "डिजिटल आईडी" पेज पर जाएं, अपने कोर्स/पद, छात्र आईडी और विवरण भरें। व्यवस्थापक द्वारा अनुमोदन के बाद आपका विशिष्ट DVID और सुरक्षित QR कोड जनरेट हो जाएगा।',
    category: 'Digital Identity'
  },
  {
    keywords: ['generate qr', 'download qr', 'my qr', 'க்யூஆர்', 'qr குறியீடு உருவாக்க', 'क्यूआर कोड', 'डाउनलोड', 'qr बनाएं'],
    replyEn: 'To generate or download your QR code: Go to the "My QR Code" page from your dashboard. Click "Download QR" to save a high-resolution PNG image, or click "Print Digital ID" to generate an official verification card with asymmetric cryptographic seals.',
    replyTa: 'QR குறியீட்டைப் பெற: உங்கள் டாஷ்போர்டில் உள்ள "எனது QR குறியீடு" (My QR) பக்கத்திற்குச் செல்லவும். "Download QR" கிளிக் செய்து படத்தை பதிவிறக்கலாம் அல்லது அச்சிடலாம்.',
    replyHi: 'QR कोड जनरेट या डाउनलोड करने के लिए: अपने डैशबोर्ड से "मेरा QR कोड" पेज पर जाएं। उच्च गुणवत्ता वाली PNG छवि सहेजने के लिए "QR डाउनलोड करें" पर क्लिक करें, या आधिकारिक पहचान पत्र प्रिंट करने के लिए "कार्ड प्रिंट करें" चुनें।',
    category: 'QR Code'
  },
  {
    keywords: ['scan', 'scanner', 'camera', 'how to scan', 'ஸ்கேன்', 'ஸ்கேனர்', 'स्कैन', 'स्कैनर', 'कैमरा'],
    replyEn: 'To scan a QR code: Open the "QR Scanner" page. Allow camera permissions to aim your camera at any institutional QR code. You can also upload a saved QR image or manually type in the verification ID (e.g., DVID-2026-CS892). The backend validates it instantly.',
    replyTa: 'QR ஸ்கேன் செய்ய: "QR Scanner" பக்கத்திற்குச் சென்று, கேமரா அனுமதியை வழங்கி QR-ஐ காட்டவும். அல்லது QR படத்தை பதிவேற்றம் செய்யலாம் அல்லது அடையாள எண்ணை நேரடியாக உள்ளிடலாம்.',
    replyHi: 'QR स्कैन करने के लिए: "QR स्कैनर" पेज खोलें। कैमरे की अनुमति दें और किसी भी QR कोड को कैमरे के सामने रखें। आप QR छवि अपलोड भी कर सकते हैं या मैन्युअल रूप से पहचान संख्या दर्ज कर सकते हैं।',
    category: 'Scanner'
  },
  {
    keywords: ['valid', 'what does valid mean', 'செல்லுபடியாகும்', 'சரிபார்க்கப்பட்டது', 'मान्य', 'सत्यापित', 'वैध'],
    replyEn: 'VALID (Green): Means the credential is authentic, issued by an accredited institution, unrevoked, unexpired, and its cryptographic SHA-256 signature matches the root trust ledger with 100% integrity.',
    replyTa: 'VALID (பச்சை): இந்த சான்றிதழ் உண்மை, கல்வி நிறுவனத்தால் வழங்கப்பட்டது, செல்லுபடியாகும் காலத்திற்குள் உள்ளது மற்றும் எந்த மாற்றமும் செய்யப்படவில்லை என்பதை உறுதிப்படுத்துகிறது.',
    replyHi: 'VALID (हरा): इसका मतलब है कि क्रेडेंशियल पूरी तरह से प्रामाणिक है, अधिकृत संस्थान द्वारा जारी किया गया है, वैध अवधि में है और इसका क्रिप्टोग्राफिक हैश 100% सटीक मेल खाता है।',
    category: 'Status'
  },
  {
    keywords: ['revoked', 'what does revoked mean', 'ரத்து', 'ரத்து செய்யப்பட்டது', 'रद्द', 'रद्द किया गया', 'खारिज'],
    replyEn: 'REVOKED (Red): Indicates the credential was officially cancelled by the issuing authority due to tampering, altered grades, disciplinary action, or administrative fraud. It is classified as HIGH RISK and rejected.',
    replyTa: 'REVOKED (சிவப்பு): இந்த சான்றிதழ் முறைகேடு, மதிப்பெண் திருத்தம் அல்லது ஒழுங்கு நடவடிக்கை காரணமாக அதிகாரப்பூர்வமாக ரத்து செய்யப்பட்டுள்ளது. இது உடனடியாக நிராகரிக்கப்படும்.',
    replyHi: 'REVOKED (लाल): इसका मतलब है कि सुरक्षा कारणों, छेड़छाड़ या प्रशासनिक कार्रवाई के कारण संस्थान द्वारा यह आईडी आधिकारिक तौर पर रद्द कर दी गई है। इसे तुरंत अस्वीकार किया जाता है।',
    category: 'Status'
  },
  {
    keywords: ['expired', 'what does expired mean', 'காலாவதி', 'முடிந்தது', 'समाप्त', 'एक्सपायर्ड', 'अवधि समाप्त'],
    replyEn: 'EXPIRED (Amber/Yellow): Means the credential was genuine when issued, but its designated validity period has passed. It cannot be used for active privileges until renewed.',
    replyTa: 'EXPIRED (மஞ்சள்): சான்றிதழ் உண்மையானது, ஆனால் அதற்கான செல்லுபடியாகும் காலம் முடிந்துவிட்டது. புதுப்பிக்கும் வரை இதனைப் பயன்படுத்த முடியாது.',
    replyHi: 'EXPIRED (पीला/अम्बर): इसका अर्थ है कि क्रेडेंशियल वैध रूप से जारी किया गया था, लेकिन इसकी अंतिम तिथि समाप्त हो चुकी है। नवीनीकरण होने तक इसका उपयोग नहीं किया जा सकता।',
    category: 'Status'
  },
  {
    keywords: ['invalid', 'tampered', 'tamper', 'போலி', 'செல்லாது', 'अमान्य', 'फर्जी', 'छेड़छाड़'],
    replyEn: 'INVALID / TAMPERED: The QR payload or ID does not exist in the centralized database, or the cryptographic checksum does not match. This prevents counterfeiting and forged IDs.',
    replyTa: 'INVALID / TAMPERED: இந்த QR குறியீடு தரவுத்தளத்தில் இல்லை அல்லது மாற்றப்பட்டுள்ளது. போலி சான்றிதழ்களைத் தடுக்க இந்த பாதுகாப்பு உதவுகிறது.',
    replyHi: 'INVALID / TAMPERED: यह QR कोड डेटाबेस में मौजूद नहीं है या डेटा में छेड़छाड़ की गई है। यह सुरक्षा नकली और जाली क्रेडेंशियल्स को तुरंत पकड़ लेती है।',
    category: 'Security'
  },
  {
    keywords: ['contact admin', 'helpdesk', 'support', 'நிர்வாகியை தொடர்பு கொள்ள', 'உதவி', 'व्यवस्थापक', 'सहायता', 'सपोर्ट'],
    replyEn: 'You can contact the System Administrator at support@veriglass.io or visit the Academic Registrar Office at Apex Institute. Admins have access to restore credentials, review audit logs, and approve pending digital IDs.',
    replyTa: 'நீங்கள் நிர்வாகியை support@veriglass.io என்ற மின்னஞ்சலில் தொடர்பு கொள்ளலாம் அல்லது வளாகப் பதிவாளர் அலுவலகத்தை அணுகலாம்.',
    replyHi: 'आप support@veriglass.io पर सिस्टम व्यवस्थापक से संपर्क कर सकते हैं या संस्थान के रजिस्ट्रार कार्यालय में जा सकते हैं।',
    category: 'Support'
  },
  {
    keywords: ['trust score', 'risk engine', 'நம்பகத்தன்மை', 'ரிஸ்க்', 'विश्वास स्कोर', 'जोखिम इंजन', 'ट्रस्ट स्कोर'],
    replyEn: 'The Dynamic Verification Trust & Risk Engine is our unique rule-based algorithm that inspects 6 factors: cryptographic signature integrity, identity status, temporal horizon, scan velocity anomalies, issuer accreditation, and tampering checksums, producing an explainable score (0-100) and risk level.',
    replyTa: 'டைனமிக் டிரஸ்ட் மற்றும் ரிஸ்க் என்ஜின் என்பது QR நம்பகத்தன்மை, கையொப்ப ஒருமைப்பாடு, காலாவதி மற்றும் ஸ்கேன் வேகம் போன்ற 6 காரணிகளை ஆராய்ந்து 0-100 மதிப்பெண்ணை வெளிப்படையாகக் கணக்கிடும் தனித்துவமான தொழில்நுட்பமாகும்.',
    replyHi: 'डायनामिक ट्रस्ट और रिस्क इंजन हमारा अद्वितीय एल्गोरिदम है जो 6 कारकों की जांच करता है: क्रिप्टोग्राफिक हस्ताक्षर, आईडी स्थिति, समय सीमा, स्कैन आवृत्ति, जारीकर्ता मान्यता, और डेटा अखंडता, और 0-100 का पारदर्शी स्कोर प्रदान करता है।',
    category: 'Engine'
  }
];

import DigitalID from '../models/DigitalID.js';

export const processChatMessage = async (req, res) => {
  try {
    const { message, language = 'en' } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message content is required' });
    }

    const cleanMsg = message.toLowerCase().trim();
    const isTamil = language === 'ta' || /[\u0B80-\u0BFF]/.test(message);
    const isHindi = language === 'hi' || /[\u0900-\u097F]/.test(message);

    let reply = '';
    let category = 'General';

    // Direct Database ID Lookup capability
    const idMatch = message.match(/(DID-[A-Za-z0-9-]+|tok_sec_[A-Za-z0-9_]+)/i);
    if (idMatch) {
      const searchKey = idMatch[1];
      const doc = await DigitalID.findOne({
        $or: [
          { uniqueId: searchKey },
          { verificationToken: searchKey }
        ]
      });

      if (doc) {
        const statusEmoji = doc.status === 'ACTIVE' ? '✅ VALID (ACTIVE)' : doc.status === 'EXPIRED' ? '⚠️ EXPIRED' : '🚫 REVOKED';
        reply = isTamil
          ? `அடையாள எண் [${doc.uniqueId}] காணப்பட்டது! நிலை: ${statusEmoji}. பெயர்: ${doc.holderName}. துறை: ${doc.department}. நிறுவனம்: ${doc.organization}. செல்லுபடியாகும் காலம்: ${doc.expiryDate ? doc.expiryDate.toISOString().split('T')[0] : ''}.`
          : isHindi
            ? `आईडी [${doc.uniqueId}] मिल गई है! स्थिति: ${statusEmoji}। धारक: ${doc.holderName}। विभाग: ${doc.department}। संस्थान: ${doc.organization}। वैधता: ${doc.expiryDate ? doc.expiryDate.toISOString().split('T')[0] : ''}।`
            : `Verification Lookup Result for [${doc.uniqueId}]: Status is ${statusEmoji}. Holder: ${doc.holderName}. Department: ${doc.department}. Organization: ${doc.organization}. Valid Until: ${doc.expiryDate ? doc.expiryDate.toISOString().split('T')[0] : ''}.`;
        category = 'Direct Identity Lookup';
      } else {
        reply = isTamil
          ? `அடையாள எண் [${searchKey}] தரவுத்தளத்தில் இல்லை. இது தவறான அல்லது பதிவு செய்யப்படாத சான்றிதழ்.`
          : isHindi
            ? `आईडी [${searchKey}] डेटाबेस में नहीं मिली। यह अमान्य या अपंजीकृत क्रेडेंशियल हो सकता है।`
            : `Verification Lookup: No record found for [${searchKey}] in our institutional database. The credential may be invalid or counterfeit.`;
        category = 'Lookup Failure';
      }
    } else {
      // Match query against FAQ keywords
      let matchedItem = faqDatabase.find((item) =>
        item.keywords.some((kw) => cleanMsg.includes(kw.toLowerCase()))
      );

      if (matchedItem) {
        reply = isTamil ? matchedItem.replyTa : isHindi ? matchedItem.replyHi : matchedItem.replyEn;
        category = matchedItem.category;
      } else {
        reply = isTamil
          ? 'வணக்கம்! நான் VerifyAssist டிஜிட்டல் சரிபார்ப்பு உதவியாளர். பதிவு செய்தல், டிஜிட்டல் ஐடி பெறுதல், QR ஸ்கேன் செய்தல், அல்லது ஏதேனும் அடையாள எண்ணை (DID-...) உள்ளிட்டு நேரடியாக சரிபார்க்கலாம்.'
          : isHindi
            ? 'नमस्ते! मैं VerifyAssist डिजिटल सत्यापन सहायक हूँ। आप मुझसे पंजीकरण, डिजिटल आईडी बनाने, QR स्कैन करने, या किसी भी आईडी (DID-...) को लिखकर तुरंत सत्यापन करने के लिए कह सकते हैं।'
            : "Hello! I'm VerifyAssist, your digital verification AI assistant. You can ask me how to register, how to scan QR codes, what VALID/REVOKED/EXPIRED statuses mean, or type any Verification ID (e.g. DID-2026-CSE892) to look it up in real time!";
      }
    }

    res.json({
      success: true,
      sender: 'VerifyAssist',
      reply,
      category,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: isTamil
        ? ['எப்படி பதிவு செய்வது?', 'QR எப்படி ஸ்கேன் செய்வது?', 'VALID என்றால் என்ன?', 'நிர்வாகி உதவி']
        : isHindi
          ? ['पंजीकरण कैसे करें?', 'QR कैसे स्कैन करें?', 'VALID का क्या अर्थ है?', 'व्यवस्थापक सहायता']
          : ['How to create Digital ID?', 'How does QR Scanner work?', 'What does VALID mean?', 'What is Trust Engine?']
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
