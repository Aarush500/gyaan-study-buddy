import { useAuth } from '@/contexts/AuthContext';

export type Lang = 'English' | 'Hindi' | 'Tamil' | 'Telugu' | 'Kannada' | 'Marathi';

// UI string keys. Add a key here and translate it in every language block below.
export type TKey =
  | 'welcomeBack'
  | 'dayStreak'
  | 'unlocked'
  | 'signOut'
  | 'verifyMyNotes'
  | 'askDoubtSoon'
  | 'boards'
  | 'inDays'
  | 'back'
  | 'topics'
  | 'done'
  | 'nextTopic'
  | 'previous'
  | 'chapterDone'
  | 'askDoubt'
  | 'latestNcert'
  | 'unlockChapter'
  | 'firstTopicFree'
  | 'unlockFor'
  | 'reportProblem'
  | 'tryAgain'
  | 'failedToLoad'
  | 'needsWork'
  | 'strong'
  | 'free'
  | 'chapters';

type Dict = Record<TKey, string>;

const en: Dict = {
  welcomeBack: 'Welcome back,',
  dayStreak: 'Day streak',
  unlocked: 'Unlocked',
  signOut: 'Sign Out',
  verifyMyNotes: 'Verify My Notes',
  askDoubtSoon: 'Ask a Doubt (Coming Soon)',
  boards: 'Boards',
  inDays: 'in {n} days',
  back: 'Back',
  topics: 'Topics',
  done: 'done',
  nextTopic: 'Next topic',
  previous: 'Previous',
  chapterDone: 'Chapter done',
  askDoubt: 'Doubt',
  latestNcert: 'Latest NCERT',
  unlockChapter: 'Unlock this chapter',
  firstTopicFree: 'First topic is free. Unlock the rest.',
  unlockFor: 'Unlock for ₹39',
  reportProblem: 'Report a problem',
  tryAgain: 'Try Again',
  failedToLoad: 'Failed to load notes',
  needsWork: 'Needs work',
  strong: 'Strong',
  free: 'FREE',
  chapters: 'Chapters',
};

const hi: Dict = {
  welcomeBack: 'वापसी पर स्वागत है,',
  dayStreak: 'दिन की लगातार पढ़ाई',
  unlocked: 'अनलॉक किए गए',
  signOut: 'साइन आउट',
  verifyMyNotes: 'मेरे नोट्स जाँचें',
  askDoubtSoon: 'सवाल पूछें (जल्द आ रहा है)',
  boards: 'बोर्ड परीक्षा',
  inDays: '{n} दिनों में',
  back: 'वापस',
  topics: 'विषय',
  done: 'पूरा',
  nextTopic: 'अगला विषय',
  previous: 'पिछला',
  chapterDone: 'अध्याय पूरा',
  askDoubt: 'सवाल',
  latestNcert: 'नवीनतम NCERT',
  unlockChapter: 'यह अध्याय अनलॉक करें',
  firstTopicFree: 'पहला विषय मुफ़्त है। बाकी अनलॉक करें।',
  unlockFor: '₹39 में अनलॉक करें',
  reportProblem: 'समस्या बताएं',
  tryAgain: 'फिर कोशिश करें',
  failedToLoad: 'नोट्स लोड नहीं हो सके',
  needsWork: 'सुधार चाहिए',
  strong: 'मज़बूत',
  free: 'मुफ़्त',
  chapters: 'अध्याय',
};

const ta: Dict = {
  welcomeBack: 'மீண்டும் வரவேற்கிறோம்,',
  dayStreak: 'நாள் தொடர்ச்சி',
  unlocked: 'திறக்கப்பட்டது',
  signOut: 'வெளியேறு',
  verifyMyNotes: 'என் குறிப்புகளைச் சரிபார்',
  askDoubtSoon: 'சந்தேகம் கேள் (விரைவில்)',
  boards: 'போர்டு தேர்வு',
  inDays: '{n} நாட்களில்',
  back: 'பின்',
  topics: 'தலைப்புகள்',
  done: 'முடிந்தது',
  nextTopic: 'அடுத்த தலைப்பு',
  previous: 'முந்தைய',
  chapterDone: 'அத்தியாயம் முடிந்தது',
  askDoubt: 'சந்தேகம்',
  latestNcert: 'சமீபத்திய NCERT',
  unlockChapter: 'இந்த அத்தியாயத்தைத் திற',
  firstTopicFree: 'முதல் தலைப்பு இலவசம். மற்றவற்றைத் திற.',
  unlockFor: '₹39-க்குத் திற',
  reportProblem: 'சிக்கலைப் புகாரளி',
  tryAgain: 'மீண்டும் முயற்சி',
  failedToLoad: 'குறிப்புகளை ஏற்ற முடியவில்லை',
  needsWork: 'மேம்பாடு தேவை',
  strong: 'வலிமையானது',
  free: 'இலவசம்',
  chapters: 'அத்தியாயங்கள்',
};

const te: Dict = {
  welcomeBack: 'తిరిగి స్వాగతం,',
  dayStreak: 'రోజుల వరుస',
  unlocked: 'అన్‌లాక్ చేసినవి',
  signOut: 'సైన్ అవుట్',
  verifyMyNotes: 'నా నోట్స్ తనిఖీ చేయి',
  askDoubtSoon: 'సందేహం అడగండి (త్వరలో)',
  boards: 'బోర్డు పరీక్షలు',
  inDays: '{n} రోజుల్లో',
  back: 'వెనుకకు',
  topics: 'అంశాలు',
  done: 'పూర్తయింది',
  nextTopic: 'తదుపరి అంశం',
  previous: 'మునుపటి',
  chapterDone: 'అధ్యాయం పూర్తయింది',
  askDoubt: 'సందేహం',
  latestNcert: 'తాజా NCERT',
  unlockChapter: 'ఈ అధ్యాయాన్ని అన్‌లాక్ చేయి',
  firstTopicFree: 'మొదటి అంశం ఉచితం. మిగతావి అన్‌లాక్ చేయి.',
  unlockFor: '₹39కి అన్‌లాక్ చేయి',
  reportProblem: 'సమస్యను నివేదించు',
  tryAgain: 'మళ్ళీ ప్రయత్నించు',
  failedToLoad: 'నోట్స్ లోడ్ కాలేదు',
  needsWork: 'మెరుగుదల కావాలి',
  strong: 'బలంగా',
  free: 'ఉచితం',
  chapters: 'అధ్యాయాలు',
};

const kn: Dict = {
  welcomeBack: 'ಮತ್ತೆ ಸ್ವಾಗತ,',
  dayStreak: 'ದಿನಗಳ ಸರಣಿ',
  unlocked: 'ಅನ್‌ಲಾಕ್ ಆಗಿದೆ',
  signOut: 'ಸೈನ್ ಔಟ್',
  verifyMyNotes: 'ನನ್ನ ಟಿಪ್ಪಣಿ ಪರಿಶೀಲಿಸಿ',
  askDoubtSoon: 'ಪ್ರಶ್ನೆ ಕೇಳಿ (ಶೀಘ್ರದಲ್ಲೇ)',
  boards: 'ಬೋರ್ಡ್ ಪರೀಕ್ಷೆ',
  inDays: '{n} ದಿನಗಳಲ್ಲಿ',
  back: 'ಹಿಂದೆ',
  topics: 'ವಿಷಯಗಳು',
  done: 'ಮುಗಿದಿದೆ',
  nextTopic: 'ಮುಂದಿನ ವಿಷಯ',
  previous: 'ಹಿಂದಿನ',
  chapterDone: 'ಅಧ್ಯಾಯ ಮುಗಿದಿದೆ',
  askDoubt: 'ಪ್ರಶ್ನೆ',
  latestNcert: 'ಇತ್ತೀಚಿನ NCERT',
  unlockChapter: 'ಈ ಅಧ್ಯಾಯ ಅನ್‌ಲಾಕ್ ಮಾಡಿ',
  firstTopicFree: 'ಮೊದಲ ವಿಷಯ ಉಚಿತ. ಉಳಿದವನ್ನು ಅನ್‌ಲಾಕ್ ಮಾಡಿ.',
  unlockFor: '₹39ಕ್ಕೆ ಅನ್‌ಲಾಕ್ ಮಾಡಿ',
  reportProblem: 'ಸಮಸ್ಯೆ ವರದಿ ಮಾಡಿ',
  tryAgain: 'ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ',
  failedToLoad: 'ಟಿಪ್ಪಣಿ ಲೋಡ್ ಆಗಲಿಲ್ಲ',
  needsWork: 'ಸುಧಾರಣೆ ಬೇಕು',
  strong: 'ಬಲಿಷ್ಠ',
  free: 'ಉಚಿತ',
  chapters: 'ಅಧ್ಯಾಯಗಳು',
};

const mr: Dict = {
  welcomeBack: 'पुन्हा स्वागत आहे,',
  dayStreak: 'दिवसांची मालिका',
  unlocked: 'अनलॉक केलेले',
  signOut: 'साइन आउट',
  verifyMyNotes: 'माझ्या नोट्स तपासा',
  askDoubtSoon: 'शंका विचारा (लवकरच)',
  boards: 'बोर्ड परीक्षा',
  inDays: '{n} दिवसांत',
  back: 'मागे',
  topics: 'विषय',
  done: 'पूर्ण',
  nextTopic: 'पुढील विषय',
  previous: 'मागील',
  chapterDone: 'धडा पूर्ण',
  askDoubt: 'शंका',
  latestNcert: 'नवीनतम NCERT',
  unlockChapter: 'हा धडा अनलॉक करा',
  firstTopicFree: 'पहिला विषय मोफत आहे. बाकीचे अनलॉक करा.',
  unlockFor: '₹39 मध्ये अनलॉक करा',
  reportProblem: 'समस्या कळवा',
  tryAgain: 'पुन्हा प्रयत्न करा',
  failedToLoad: 'नोट्स लोड होऊ शकल्या नाहीत',
  needsWork: 'सुधारणा हवी',
  strong: 'मजबूत',
  free: 'मोफत',
  chapters: 'धडे',
};

const DICTS: Record<Lang, Dict> = {
  English: en,
  Hindi: hi,
  Tamil: ta,
  Telugu: te,
  Kannada: kn,
  Marathi: mr,
};

function resolveLang(language?: string | null): Lang {
  return (language && language in DICTS ? language : 'English') as Lang;
}

export function translate(language: string | null | undefined, key: TKey, vars?: Record<string, string | number>): string {
  const dict = DICTS[resolveLang(language)] || en;
  let out = dict[key] ?? en[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      out = out.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    }
  }
  return out;
}

// Hook: reads the signed-in student's preferred language and returns a `t()`.
export function useT() {
  const { profile } = useAuth();
  const language = profile?.preferred_language;
  const t = (key: TKey, vars?: Record<string, string | number>) => translate(language, key, vars);
  return { t, language: resolveLang(language) };
}