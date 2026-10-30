import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  House,
  MapPin,
  Shield,
  MessageSquare,
  Plus,
  Star,
  ThumbsUp,
  CheckCircle2,
  Flame,
  Droplets,
  ChevronDown,
  ChevronUp,
  Lock,
  Compass,
  Building,
  ArrowUpRight,
  CornerDownRight,
  X,
  Users,
  Facebook
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';

// --- FIREBASE INITIALIZATION ---
// Configure these values in .env.local before deploying.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const hasFirebaseConfig = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.appId
);

let app = null;
let auth = null;
let db = null;

try {
  if (hasFirebaseConfig) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } else {
    console.warn('Firebase is not configured. Add Firebase values to .env.local.');
  }
} catch (err) {
  console.error('Firebase initialization failed:', err);
}

// --- CUSTOM BRAND ICON ---
const BariwalaBrandIcon = ({ className = 'w-8 h-8' }) => (
  <svg
    viewBox="0 0 36 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect width="36" height="36" rx="10" className="fill-slate-900" />
    <path
      d="M7.5 17.5L18 9L28.5 17.5"
      stroke="#10B981"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M11 16V24.5C11 25.6046 11.8954 26.5 13 26.5H16.5L19.5 29L20.5 26.5H23C24.1046 26.5 25 25.6046 25 24.5V16"
      stroke="white"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M15.2 20.5L17.2 22.5L21.2 18.5"
      stroke="#10B981"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// --- CITIES & HIERARCHICAL AREAS DATA (DHAKA & CHITTAGONG) ---
const CITIES_LOCATIONS = {
  dhaka: [
    {
      id: 'mirpur',
      bn: 'মিরপুর',
      en: 'Mirpur',
      blocks: [
        { id: 'Mirpur 1', bn: 'মিরপুর-১', en: 'Mirpur 1' },
        { id: 'Mirpur 2', bn: 'মিরপুর-২', en: 'Mirpur 2' },
        { id: 'Mirpur 6', bn: 'মিরপুর-৬', en: 'Mirpur 6' },
        { id: 'Mirpur 10', bn: 'মিরপুর-১০ (ব্লক A-D)', en: 'Mirpur 10 (Block A-D)' },
        { id: 'Mirpur 11', bn: 'মিরপুর-১১', en: 'Mirpur 11' },
        { id: 'Mirpur 12', bn: 'মিরপুর-১২', en: 'Mirpur 12' },
        { id: 'Pallabi', bn: 'পল্লবী', en: 'Pallabi' },
        { id: 'Kazipara', bn: 'কাজীপাড়া', en: 'Kazipara' },
        { id: 'Shewrapara', bn: 'শেওড়াপাড়া', en: 'Shewrapara' },
        { id: 'Mirpur DOHS', bn: 'মিরপুর DOHS', en: 'Mirpur DOHS' }
      ]
    },
    {
      id: 'bashundhara',
      bn: 'বসুন্ধরা আ/এ',
      en: 'Bashundhara R/A',
      blocks: [
        { id: 'Block A', bn: 'ব্লক A', en: 'Block A' },
        { id: 'Block B', bn: 'ব্লক B', en: 'Block B' },
        { id: 'Block C', bn: 'ব্লক C', en: 'Block C' },
        { id: 'Block D', bn: 'ব্লক D', en: 'Block D' },
        { id: 'Block E', bn: 'ব্লক E', en: 'Block E' },
        { id: 'Block F', bn: 'ব্লক F', en: 'Block F' },
        { id: 'Block G', bn: 'ব্লক G', en: 'Block G' },
        { id: 'Block I', bn: 'ব্লক I', en: 'Block I' }
      ]
    },
    {
      id: 'uttara',
      bn: 'উত্তরা',
      en: 'Uttara',
      blocks: [
        { id: 'Sector 1', bn: 'সেক্টর ১', en: 'Sector 1' },
        { id: 'Sector 3', bn: 'সেক্টর ৩', en: 'Sector 3' },
        { id: 'Sector 4', bn: 'সেক্টর ৪', en: 'Sector 4' },
        { id: 'Sector 6', bn: 'সেক্টর ৬', en: 'Sector 6' },
        { id: 'Sector 7', bn: 'সেক্টর ৭', en: 'Sector 7' },
        { id: 'Sector 11', bn: 'সেক্টর ১১', en: 'Sector 11' },
        { id: 'Sector 13', bn: 'সেক্টর ১৩', en: 'Sector 13' }
      ]
    },
    {
      id: 'dhanmondi',
      bn: 'ধানমন্ডি',
      en: 'Dhanmondi',
      blocks: [
        { id: 'Road 1-8', bn: 'রোড ১ - ৮', en: 'Road 1 - 8' },
        { id: 'Road 9-15', bn: 'রোড ৯ - ১৫', en: 'Road 9 - 15' },
        { id: 'Road 16-27', bn: 'রোড ১৬ - ২৭', en: 'Road 16 - 27' },
        { id: 'Shankar', bn: 'শংকর', en: 'Shankar' }
      ]
    },
    {
      id: 'mohammadpur',
      bn: 'মোহাম্মদপুর',
      en: 'Mohammadpur',
      blocks: [
        { id: 'Tajmahal Road', bn: 'তাজমহল রোড', en: 'Tajmahal Road' },
        { id: 'Adabor', bn: 'আদাবর', en: 'Adabor' },
        { id: 'Shekhertek', bn: 'শেখেরটেক', en: 'Shekhertek' },
        { id: 'Lalmatia', bn: 'লালমাটিয়া', en: 'Lalmatia' }
      ]
    },
    {
      id: 'banasree',
      bn: 'বনশ্রী ও রামপুরা',
      en: 'Banasree & Rampura',
      blocks: [
        { id: 'Banasree Block A', bn: 'বনশ্রী ব্লক A', en: 'Banasree Block A' },
        { id: 'Banasree Block B', bn: 'বনশ্রী ব্লক B', en: 'Banasree Block B' },
        { id: 'Banasree Block C', bn: 'বনশ্রী ব্লক C', en: 'Banasree Block C' },
        { id: 'Banasree Block D', bn: 'বনশ্রী ব্লক D', en: 'Banasree Block D' },
        { id: 'East Rampura', bn: 'রামপুরা', en: 'Rampura' }
      ]
    },
    {
      id: 'gulshan',
      bn: 'গুলশান ও বনানী',
      en: 'Gulshan & Banani',
      blocks: [
        { id: 'Niketan', bn: 'নিকেতন', en: 'Niketan' },
        { id: 'Banani', bn: 'বনানী', en: 'Banani' },
        { id: 'Gulshan 1', bn: 'গুলশান-১', en: 'Gulshan 1' },
        { id: 'Gulshan 2', bn: 'গুলশান-২', en: 'Gulshan 2' }
      ]
    }
  ],
  chittagong: [
    {
      id: 'nasirabad',
      bn: 'নাসিরাবাদ ও খুলশী',
      en: 'Nasirabad & Khulshi',
      blocks: [
        { id: 'Nasirabad Housing', bn: 'নাসিরাবাদ হাউজিং', en: 'Nasirabad Housing' },
        { id: 'Khulshi', bn: 'খুলশী আবাসিক', en: 'Khulshi R/A' },
        { id: 'Zakir Hossain Road', bn: 'জাকির হোসেন রোড', en: 'Zakir Hossain Road' }
      ]
    },
    {
      id: 'gec',
      bn: 'জিইসি ও মেহেদীবাগ',
      en: 'GEC & Mehedibag',
      blocks: [
        { id: 'Mehedibag', bn: 'মেহেদীবাগ', en: 'Mehedibag' },
        { id: 'GEC Circle', bn: 'জিইসি মোড় সংলগ্ন', en: 'GEC Circle' },
        { id: 'Rabindra Soroni', bn: 'রবীন্দ্র সরণি', en: 'Rabindra Soroni' }
      ]
    },
    {
      id: 'chawkbazar',
      bn: 'চকবাজার ও চন্দনপুরা',
      en: 'Chawkbazar & Chandanpura',
      blocks: [
        { id: 'Chawkbazar', bn: 'চকবাজার', en: 'Chawkbazar' },
        { id: 'Kata Pahar Road', bn: 'কাটাহাড় রোড', en: 'Kata Pahar Road' },
        { id: 'Telpatty Mor', bn: 'তেলপট্টি মোড়', en: 'Telpatty Mor' }
      ]
    },
    {
      id: 'agrabad',
      bn: 'আগ্রাবাদ ও হালিশহর',
      en: 'Agrabad & Halishahar',
      blocks: [
        { id: 'Agrabad C/A', bn: 'আগ্রাবাদ সি/এ', en: 'Agrabad C/A' },
        { id: 'Halishahar H-Block', bn: 'হালিশহর এইচ ব্লক', en: 'Halishahar H-Block' },
        { id: 'Double Mooring', bn: 'ডবলমুরিং', en: 'Double Mooring' }
      ]
    },
    {
      id: 'patenga',
      bn: 'পতেঙ্গা ও ইপিজেড',
      en: 'Patenga & EPZ',
      blocks: [
        { id: 'EPZ Area', bn: 'ইপিজেড মোড়', en: 'EPZ Mor' },
        { id: 'Katgor', bn: 'কাটগড়', en: 'Katgor' }
      ]
    }
  ]
};

// --- BILINGUAL UI DICTIONARY ---
const UI_TEXT = {
  bn: {
    brandName: 'Bariwala Kemon',
    navExplore: 'রিভিউ খুঁজুন',
    navAreas: 'এলাকা ও ব্লক',
    navAbout: 'কেন এই প্ল্যাটফর্ম?',
    shareBtn: 'অভিজ্ঞতা শেয়ার করুন',
    heroBadge: '১০০% নিরাপদ ও বিশ্বস্ত',
    heroTitle1: 'নতুন বাসা ভাড়া নিচ্ছেন?',
    heroTitle2: 'আগে জানুন বাড়িওয়ালা কেমন।',
    heroSub:
      'বাসা বাইরে থেকে চকচকে হলেও আগের ভাড়াটিয়া কেন বাসা ছেড়েছিলেন, এবং পানি-গ্যাসের আসল অবস্থা কী—জেনে নিন সরাসরি আগের ভাড়াটিয়াদের কাছ থেকে।',
    searchPlaceholder: 'রোড, বাসার নাম বা হোল্ডিং লিখে খুঁজুন...',
    cityDhaka: 'ঢাকা',
    cityChittagong: 'চট্টগ্রাম',
    step1AreaTitle: '১. এলাকা নির্বাচন করুন',
    step2BlockTitle: '২. ব্লক / সেক্টর বেছে নিন',
    allAreas: 'সব এলাকা',
    allBlocks: 'সব ব্লক/সেক্টর',
    clearFilters: 'ফিল্টার মুছুন',
    statTotalReviews: 'মোট বাসার রিভিউ',
    statDepositAlert: 'কমিউনিটি কমেন্ট ও রিপ্লাই',
    statDisputeLeaves: 'ঝামেলায় বাসা ত্যাগ',
    metricRent: 'মাসিক ভাড়া ও চার্জ',
    metricWhyLeft: 'আগের ভাড়াটিয়া কেন ছেড়েছেন?',
    landlordScoreLabel: 'বাড়িওয়ালা রেটিং',
    detailsExpand: 'পানি, গ্যাস ও নিয়মকানুন দেখুন',
    detailsCollapse: 'সংক্ষিপ্ত করুন',
    discussionBtn: 'আলোচনা ও রিপ্লাই',
    replyPlaceholder: 'এই বাসা সম্পর্কে আপনার প্রশ্ন বা অভিজ্ঞতা লিখুন...',
    replySubmitBtn: 'রিপ্লাই দিন',
    emptyTitle: 'এই এলাকায় এখনো কোনো রিভিউ যোগ হয়নি',
    emptySub: 'আপনি যদি এই এলাকায় থেকে থাকেন, তবে প্রথম রিভিউ দিয়ে অন্যদের সাহায্য করুন।',
    modalTitle: 'আপনার বাসার অভিজ্ঞতা শেয়ার করুন',
    modalSub: 'আপনার গোপনীয়তা সম্পূর্ণ সুরক্ষিত রাখা হয়।',
    submitBtn: 'রিভিউ প্রকাশ করুন',
    cancelBtn: 'বাতিল করুন'
  },
  en: {
    brandName: 'Bariwala Kemon',
    navExplore: 'Explore Reviews',
    navAreas: 'Areas & Blocks',
    navAbout: 'Why This Platform?',
    shareBtn: 'Share Experience',
    heroBadge: '100% Secure & Verified',
    heroTitle1: 'Renting a new flat?',
    heroTitle2: 'Find out how the landlord really is.',
    heroSub:
      'Before moving into a new flat, check why the previous tenant left, how the water & gas situation is, and discuss openly with past tenants in the comments.',
    searchPlaceholder: 'Search by house name, road, or sector...',
    cityDhaka: 'Dhaka',
    cityChittagong: 'Chittagong',
    step1AreaTitle: '1. Select Area',
    step2BlockTitle: '2. Filter by Sub-Area / Block',
    allAreas: 'All Areas',
    allBlocks: 'All Blocks/Sectors',
    clearFilters: 'Reset Filters',
    statTotalReviews: 'Total Flat Reviews',
    statDepositAlert: 'Community Replies',
    statDisputeLeaves: 'Left Due to Dispute',
    metricRent: 'Monthly Rent & Charge',
    metricWhyLeft: 'Why Previous Tenant Left',
    landlordScoreLabel: 'Landlord Score',
    detailsExpand: 'Water, Gas & Gate Rules',
    detailsCollapse: 'Hide Details',
    discussionBtn: 'Comments & Replies',
    replyPlaceholder: 'Ask a question or share your experience about this building...',
    replySubmitBtn: 'Post Reply',
    emptyTitle: 'No reviews found in this block yet',
    emptySub: 'Lived here before? Be the first to share a review.',
    modalTitle: 'Share Your Rental Experience',
    modalSub: 'Your privacy is fully protected.',
    submitBtn: 'Publish Review',
    cancelBtn: 'Cancel'
  }
};

function sanitizeAndCheckContent(text) {
  let cleaned = text;
  const bdPhoneRegex = /(?:\+?88)?01[3-9]\d{8}/g;
  if (bdPhoneRegex.test(cleaned)) {
    cleaned = cleaned.replace(bdPhoneRegex, '[PHONE HIDDEN]');
  }
  return { cleaned };
}


// --- PRIVATE ADMIN DASHBOARD ---
// Access is enforced by Firestore Security Rules; this UI is not the security boundary.
function AdminDashboard({ auth, db }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminUser, setAdminUser] = useState(null);
  const [pendingReviews, setPendingReviews] = useState([]);
  const [approvedReviews, setApprovedReviews] = useState([]);
  const [archivedReviews, setArchivedReviews] = useState([]);
  const [pendingComments, setPendingComments] = useState([]);
  const [pendingReplies, setPendingReplies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [selectedReview, setSelectedReview] = useState(null);

  useEffect(() => {
    if (!auth) return undefined;
    return onAuthStateChanged(auth, (currentUser) => {
      setAdminUser(currentUser && !currentUser.isAnonymous ? currentUser : null);
    });
  }, []);

  const loadPending = async () => {
    if (!db) return;
    setLoading(true);
    setError('');
    try {
      const [reviewSnap, approvedSnap, archivedSnap] = await Promise.all([
        getDocs(query(collection(db, 'reviews'), where('status', '==', 'pending'))),
        getDocs(query(collection(db, 'reviews'), where('status', '==', 'approved'))),
        getDocs(query(collection(db, 'reviews'), where('status', '==', 'archived')))
      ]);
      const reviewItems = reviewSnap.docs.map((item) => ({ id: item.id, ...item.data() }));
      setPendingReviews(reviewItems);
      setApprovedReviews(approvedSnap.docs.map((item) => ({ id: item.id, ...item.data() })));
      setArchivedReviews(archivedSnap.docs.map((item) => ({ id: item.id, ...item.data() })));

      const commentItems = [];
      const replyItems = [];
      // Pending comments/replies may belong to approved or archived reviews too.
      const allReviews = [
        ...reviewItems,
        ...approvedSnap.docs.map((item) => ({ id: item.id, ...item.data() })),
        ...archivedSnap.docs.map((item) => ({ id: item.id, ...item.data() })),
      ];

      for (const review of allReviews) {
        const commentsSnap = await getDocs(
          collection(db, 'reviews', review.id, 'comments')
        );

        for (const commentDoc of commentsSnap.docs) {
          const commentData = commentDoc.data();
          if (commentData.status === 'pending') {
            commentItems.push({
              id: commentDoc.id,
              reviewId: review.id,
              ...commentData,
            });
          }

          // Check replies under every comment, not only pending comments.
          const repliesSnap = await getDocs(query(
            collection(db, 'reviews', review.id, 'comments', commentDoc.id, 'replies'),
            where('status', '==', 'pending')
          ));
          repliesSnap.docs.forEach((replyDoc) => {
            replyItems.push({
              id: replyDoc.id,
              reviewId: review.id,
              commentId: commentDoc.id,
              ...replyDoc.data(),
            });
          });
        }
      }
      setPendingComments(commentItems);
      setPendingReplies(replyItems);
    } catch (err) {
      console.error('Admin moderation load failed:', err);
      setError('ডেটা লোড করা যায়নি। এই account-এর UID admins collection-এর document ID কি না এবং Firestore Rules published কি না পরীক্ষা করুন।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminUser) loadPending();
  }, [adminUser]);

  const login = async (event) => {
    event.preventDefault();
    setError('');
    setNotice('');
    if (!auth || !db) {
      setError('Firebase configuration পাওয়া যায়নি।');
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      setPassword('');
    } catch (err) {
      console.error('Admin login failed:', err);
      setError('লগইন হয়নি। Email ও password পরীক্ষা করুন।');
      setLoading(false);
    }
  };

  const moderate = async (path, id, status, label) => {
    if (!db) return;
    setBusyId(id);
    setError('');
    try {
      await updateDoc(doc(db, ...path, id), { status });
      const actionText = status === 'approved' ? 'Restore / অনুমোদন' : status === 'archived' ? 'Archive' : 'Reject';
      setNotice(`${label} ${actionText} করা হয়েছে।`);
      await loadPending();
    } catch (err) {
      console.error('Moderation failed:', err);
      setError('আপডেট করা যায়নি। Admin permission এবং Firestore Rules পরীক্ষা করুন।');
    } finally {
      setBusyId('');
    }
  };

  const logout = async () => {
    if (auth) await signOut(auth);
    setPendingReviews([]);
    setApprovedReviews([]);
    setArchivedReviews([]);
    setPendingComments([]);
    setPendingReplies([]);
  };

  if (!auth || !db) {
    return <div className="min-h-screen grid place-items-center bg-slate-100 p-6">Firebase configuration পাওয়া যায়নি।</div>;
  }

  if (!adminUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <form onSubmit={login} className="w-full max-w-md bg-white rounded-2xl p-7 shadow-2xl space-y-4">
          <div className="text-center">
            <div className="mx-auto mb-3 w-12 h-12 rounded-xl bg-slate-900 text-emerald-400 grid place-items-center text-2xl">⌂</div>
            <h1 className="text-xl font-extrabold text-slate-900">Bariwala Kemon Admin</h1>
            <p className="text-sm text-slate-500 mt-1">Private moderation panel</p>
          </div>
          {error && <p className="text-sm text-rose-700 bg-rose-50 rounded-lg p-3">{error}</p>}
          <label className="block text-sm font-semibold text-slate-700">Admin email
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2" />
          </label>
          <label className="block text-sm font-semibold text-slate-700">Password
            <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2" />
          </label>
          <button disabled={loading} className="w-full rounded-lg bg-slate-900 hover:bg-emerald-700 text-white font-bold py-3 disabled:opacity-60">
            {loading ? 'Please wait…' : 'Login'}
          </button>
          <a href="/" className="block text-center text-sm text-slate-500 hover:text-emerald-700">← Back to website</a>
        </form>
      </div>
    );
  }

  const ActionButtons = ({ path, id, label }) => (
    <div className="flex gap-2 shrink-0">
      <button disabled={busyId === id} onClick={() => moderate(path, id, 'approved', label)} className="px-3 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold disabled:opacity-50">Approve</button>
      <button disabled={busyId === id} onClick={() => moderate(path, id, 'rejected', label)} className="px-3 py-2 rounded-lg bg-rose-600 text-white text-xs font-bold disabled:opacity-50">Reject</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="bg-slate-950 text-white px-5 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <div><h1 className="font-extrabold text-lg">Bariwala Kemon Admin</h1><p className="text-xs text-slate-300">{adminUser.email}</p></div>
          <div className="flex gap-2">
            <button onClick={loadPending} className="px-3 py-2 rounded-lg bg-slate-700 text-xs font-bold">Refresh</button>
            <button onClick={logout} className="px-3 py-2 rounded-lg bg-rose-700 text-xs font-bold">Logout</button>
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
        <div className="grid grid-cols-3 gap-3">
          {[['Pending reviews', pendingReviews.length], ['Comments', pendingComments.length], ['Replies', pendingReplies.length]].map(([label, count]) => (
            <div key={label} className="bg-white rounded-xl border border-slate-200 p-4"><p className="text-xs text-slate-500">{label}</p><p className="text-2xl font-extrabold">{count}</p></div>
          ))}
        </div>
        {error && <p className="bg-rose-50 text-rose-700 p-3 rounded-lg text-sm">{error}</p>}
        {notice && <p className="bg-emerald-50 text-emerald-700 p-3 rounded-lg text-sm">{notice}</p>}
        {loading && <p className="text-sm text-slate-500">Loading moderation queue…</p>}

        <section className="space-y-3">
          <h2 className="font-extrabold text-lg">Pending Reviews</h2>
          {pendingReviews.length === 0 && !loading && <p className="bg-white p-4 rounded-xl text-sm text-slate-500">কোনো pending review নেই।</p>}
          {pendingReviews.map((item) => (
            <article key={item.id} className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex flex-wrap justify-between gap-3"><div><h3 className="font-bold">{item.houseName} <span className="text-xs text-slate-500">({item.houseType || item.tenantType || '—'})</span></h3><p className="text-xs text-slate-500">{item.city} / {item.areaId} / {item.subBlock}</p></div><div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={() => setSelectedReview(item)} className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold">বিস্তারিত দেখুন</button>
                <ActionButtons path={['reviews']} id={item.id} label="Review" />
              </div></div>
              <p className="text-sm whitespace-pre-wrap">{item.reviewText}</p>
              <p className="text-xs text-slate-500">Overall: {item.overallRating}/10 · Landlord: {item.landlordRating}/10 · Utility: {item.utilityRating}/10 · Security: {item.securityRating}/10</p>
            </article>
          ))}
        </section>

        <section className="space-y-3">
          <h2 className="font-extrabold text-lg">Approved Reviews</h2>
          {approvedReviews.length === 0 && !loading && <p className="bg-white p-4 rounded-xl text-sm text-slate-500">কোনো approved review নেই।</p>}
          {approvedReviews.map((item) => (
            <article key={item.id} className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-bold">{item.houseName} <span className="text-xs text-slate-500">({item.houseType || item.tenantType || '—'})</span></h3>
                <p className="text-xs text-slate-500">{item.city} / {item.areaId} / {item.subBlock}</p>
                <p className="text-sm mt-1">{item.reviewText}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button type="button" onClick={() => setSelectedReview(item)} className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold">বিস্তারিত দেখুন</button>
                <button disabled={busyId === item.id} onClick={() => {
                  if (window.confirm('এই review archive করতে চান? এটি public website থেকে লুকানো হবে; পরে Restore করা যাবে।')) {
                    moderate(['reviews'], item.id, 'archived', 'Review');
                  }
                }} className="px-3 py-2 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold disabled:opacity-50">Archive</button>
              </div>
            </article>
          ))}
        </section>

        <section className="space-y-3">
          <h2 className="font-extrabold text-lg">Archived Reviews</h2>
          {archivedReviews.length === 0 && !loading && <p className="bg-white p-4 rounded-xl text-sm text-slate-500">কোনো archived review নেই।</p>}
          {archivedReviews.map((item) => (
            <article key={item.id} className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-bold">{item.houseName} <span className="text-xs text-slate-500">({item.houseType || item.tenantType || '—'})</span></h3>
                <p className="text-xs text-slate-500">{item.city} / {item.areaId} / {item.subBlock}</p>
                <p className="text-sm mt-1">{item.reviewText}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button type="button" onClick={() => setSelectedReview(item)} className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold">বিস্তারিত দেখুন</button>
                <button disabled={busyId === item.id} onClick={() => moderate(['reviews'], item.id, 'approved', 'Review')} className="px-3 py-2 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-xs font-bold disabled:opacity-50">Restore</button>
              </div>
            </article>
          ))}
        </section>

        <section className="space-y-3">
          <h2 className="font-extrabold text-lg">Pending Comments</h2>
          {pendingComments.length === 0 && <p className="bg-white p-4 rounded-xl text-sm text-slate-500">কোনো pending comment নেই।</p>}
          {pendingComments.map((item) => (
            <article key={`${item.reviewId}-${item.id}`} className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0"><p className="text-xs text-slate-500">Review: {item.reviewId} · {item.authorAlias}</p><p className="text-sm whitespace-pre-wrap">{item.text}</p></div>
              <ActionButtons path={['reviews', item.reviewId, 'comments']} id={item.id} label="Comment" />
            </article>
          ))}
        </section>

        <section className="space-y-3">
          <h2 className="font-extrabold text-lg">Pending Replies</h2>
          {pendingReplies.length === 0 && <p className="bg-white p-4 rounded-xl text-sm text-slate-500">কোনো pending reply নেই।</p>}
          {pendingReplies.map((item) => (
            <article key={`${item.reviewId}-${item.commentId}-${item.id}`} className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0"><p className="text-xs text-slate-500">Comment: {item.commentId} · {item.authorAlias}</p><p className="text-sm whitespace-pre-wrap">{item.text}</p></div>
              <ActionButtons path={['reviews', item.reviewId, 'comments', item.commentId, 'replies']} id={item.id} label="Reply" />
            </article>
          ))}
        </section>
        <p className="text-xs text-slate-500">Admin access Firestore Security Rules দ্বারা যাচাই হয়; শুধু login form থাকলেই admin access পাওয়া যায় না।</p>
      </main>

      {selectedReview && (
        <div
          className="fixed inset-0 z-[150] bg-slate-950/65 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
          onClick={(event) => {
            if (event.target === event.currentTarget) setSelectedReview(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-review-details-title"
            className="w-full max-w-3xl max-h-[92vh] bg-[#F8FAFC] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            <header className="px-5 py-4 sm:px-7 bg-white border-b border-slate-200 flex items-start justify-between gap-4 shrink-0">
              <div className="min-w-0">
                <p className="text-xs font-bold text-emerald-700 mb-1">Review details · {selectedReview.status}</p>
                <h2 id="admin-review-details-title" className="text-lg sm:text-xl font-extrabold text-slate-900">{selectedReview.houseName || 'বাসার রিভিউ'}</h2>
                <p className="text-xs text-slate-500 mt-1">{selectedReview.city || ''} · {selectedReview.areaId || ''} · {selectedReview.subBlock || ''}</p>
              </div>
              <button type="button" onClick={() => setSelectedReview(null)} aria-label="Close details" className="w-9 h-9 shrink-0 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-2xl leading-none">×</button>
            </header>
            <div className="p-5 sm:p-7 overflow-y-auto overscroll-contain space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  ['বাসার ধরন', selectedReview.houseType],
                  ['বাসার নাম', selectedReview.houseName],
                  ['মাসিক ভাড়া', selectedReview.rent !== undefined && selectedReview.rent !== null && selectedReview.rent !== '' ? `৳${Number(selectedReview.rent).toLocaleString('en-BD')}` : null],
                  ['সার্ভিস চার্জ', selectedReview.serviceCharge !== undefined && selectedReview.serviceCharge !== null && selectedReview.serviceCharge !== '' ? `৳${Number(selectedReview.serviceCharge).toLocaleString('en-BD')}` : null],
                  ['ফ্লোর / ইউনিট', selectedReview.floorUnit],
                  ['কতদিন ছিলেন', selectedReview.stayDuration],
                  ['বাড়িওয়ালার রেটিং', selectedReview.landlordRating != null ? `${selectedReview.landlordRating}/10` : null],
                  ['ইউটিলিটি রেটিং', selectedReview.utilityRating != null ? `${selectedReview.utilityRating}/10` : null],
                  ['নিরাপত্তা রেটিং', selectedReview.securityRating != null ? `${selectedReview.securityRating}/10` : null],
                  ['সার্বিক রেটিং', selectedReview.overallRating != null ? `${selectedReview.overallRating}/10` : null],
                  ['গ্যাসের অবস্থা', selectedReview.gasStatus],
                  ['পানির অবস্থা', selectedReview.waterStatus],
                  ['গেট বন্ধের সময়', selectedReview.gateClosingTime],
                  ['বাসা ছাড়ার কারণ', selectedReview.leaveReason],
                  ['রোড', selectedReview.road],
                  ['ব্লক / সেক্টর', selectedReview.subBlock],
                ].filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== '').map(([label, value]) => (
                  <div key={label} className="bg-white border border-slate-200 rounded-xl p-3">
                    <span className="block text-[10px] font-semibold text-slate-500 mb-1">{label}</span>
                    <span className="text-sm font-bold text-slate-900">{value}</span>
                  </div>
                ))}
              </div>
              {selectedReview.reviewText && (
                <section className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5">
                  <p className="text-xs font-bold text-emerald-700 mb-2">বিস্তারিত অভিজ্ঞতা</p>
                  <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap text-slate-800">{selectedReview.reviewText}</p>
                </section>
              )}
            </div>
            <footer className="px-5 py-3 sm:px-7 bg-white border-t border-slate-200 flex justify-end shrink-0">
              <button type="button" onClick={() => setSelectedReview(null)} className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-emerald-700 text-white text-sm font-bold">বন্ধ করুন</button>
            </footer>
          </section>
        </div>
      )}
    </div>
  );
}


export default function App() {
  const [lang, setLang] = useState('bn');
  const t = UI_TEXT[lang];
  const [activeTab, setActiveTab] = useState('explore');

  // Set Browser Favicon dynamically to match project brand icon SVG
  useEffect(() => {
    const svgFavicon = `data:image/svg+xml,<svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="36" height="36" rx="10" fill="%230F172A"/><path d="M7.5 17.5L18 9L28.5 17.5" stroke="%2310B981" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M11 16V24.5C11 25.6046 11.8954 26.5 13 26.5H16.5L19.5 29L20.5 26.5H23C24.1046 26.5 25 25.6046 25 24.5V16" stroke="white" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/><path d="M15.2 20.5L17.2 22.5L21.2 18.5" stroke="%2310B981" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    let link = document.querySelector("link[rel*='icon']");
    if (!link) {
      link = document.createElement('link');
      link.type = 'image/svg+xml';
      link.rel = 'shortcut icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    link.href = svgFavicon;
  }, []);

  const [selectedCity, setSelectedCity] = useState('dhaka');
  const activeCityAreas = CITIES_LOCATIONS[selectedCity] || CITIES_LOCATIONS.dhaka;

  const [selectedAreaId, setSelectedAreaId] = useState('all');
  const [selectedSubBlock, setSelectedSubBlock] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTenantType, setSelectedTenantType] = useState('All');
  const [sortBy, setSortBy] = useState('helpful');

  const [user, setUser] = useState(null);
  const [myAlias] = useState(() => `Tenant #${Math.floor(100 + Math.random() * 899)}`);
  const [reviews, setReviews] = useState([]);
  const [commentsByReview, setCommentsByReview] = useState({});
  const [nestedRepliesByComment, setNestedRepliesByComment] = useState({});
  const [likeCounts, setLikeCounts] = useState({});
  const [likedReviewIds, setLikedReviewIds] = useState([]);
  const [upvotedIds, setUpvotedIds] = useState([]);
  const [expandedCardIds, setExpandedCardIds] = useState([]);
  const [openThreadIds, setOpenThreadIds] = useState(['seed-1']);

  const [replyTexts, setReplyTexts] = useState({});
  const [nestedReplyTexts, setNestedReplyTexts] = useState({});
  const [activeReplyBoxId, setActiveReplyBoxId] = useState(null);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [selectedReviewForDetails, setSelectedReviewForDetails] = useState(null);
  const [toast, setToast] = useState(null);

  const [newReview, setNewReview] = useState({
    city: 'dhaka',
    areaId: 'mirpur',
    subBlock: 'Mirpur 10',
    road: '',
    houseName: '',
    houseType: 'Family',
    floorUnit: '',
    tenantType: '',
    rent: '',
    serviceCharge: '',
    stayDuration: '',
    landlordRating: '',
    utilityRating: '',
    securityRating: '',
    waterStatus: '',
    gasStatus: '',
    gateClosingTime: '',
    leaveReason: '',
    leaveCategory: '',
    reviewText: ''
  });

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    if (!auth) return undefined;
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser && window.location.pathname !== '/admin') {
        signInAnonymously(auth).catch((error) => {
          console.error('Anonymous sign-in failed:', error);
        });
      }
    });
    return () => unsub();
  }, []);

  // Public feed receives only moderator-approved reviews in real time.
  useEffect(() => {
    if (!db) return undefined;
    const approvedReviews = query(
      collection(db, 'reviews'),
      where('status', '==', 'approved')
    );
    const unsub = onSnapshot(
      approvedReviews,
      (snapshot) => {
        const liveReviews = snapshot.docs.map((reviewDoc) => ({
          id: reviewDoc.id,
          ...reviewDoc.data(),
        }));
        setReviews(liveReviews);
      },
      (error) => {
        console.error('Could not load approved reviews:', error);
      }
    );
    return () => unsub();
  }, []);

  // Live approved comments for each published review. New comments remain pending until moderation.
  useEffect(() => {
    if (!db || reviews.length === 0) {
      setCommentsByReview({});
      return undefined;
    }
    const unsubs = reviews.map((review) => {
      const commentsQuery = query(
        collection(db, 'reviews', review.id, 'comments'),
        where('status', '==', 'approved')
      );
      return onSnapshot(commentsQuery, (snapshot) => {
        const items = snapshot.docs.map((commentDoc) => ({ id: commentDoc.id, ...commentDoc.data() }));
        setCommentsByReview((prev) => ({ ...prev, [review.id]: items }));
      }, (error) => console.error('Could not load comments:', error));
    });
    return () => unsubs.forEach((unsub) => unsub());
  }, [reviews]);

  // Live approved nested replies for visible comments.
  useEffect(() => {
    if (!db) return undefined;
    const allComments = Object.values(commentsByReview).flat();
    if (!allComments.length) {
      setNestedRepliesByComment({});
      return undefined;
    }
    const unsubs = allComments.map((comment) => {
      const parentReview = reviews.find((review) => (commentsByReview[review.id] || []).some((item) => item.id === comment.id));
      if (!parentReview) return () => {};
      const repliesQuery = query(
        collection(db, 'reviews', parentReview.id, 'comments', comment.id, 'replies'),
        where('status', '==', 'approved')
      );
      return onSnapshot(repliesQuery, (snapshot) => {
        const items = snapshot.docs.map((replyDoc) => ({ id: replyDoc.id, ...replyDoc.data() }));
        setNestedRepliesByComment((prev) => ({ ...prev, [comment.id]: items }));
      }, (error) => console.error('Could not load nested replies:', error));
    });
    return () => unsubs.forEach((unsub) => unsub());
  }, [commentsByReview, reviews]);

  // Like counts and current visitor's like state persist in Firestore.
  useEffect(() => {
    if (!db || !user || reviews.length === 0) return undefined;
    const unsubs = reviews.map((review) => {
      const likesRef = collection(db, 'reviews', review.id, 'likes');
      return onSnapshot(likesRef, (snapshot) => {
        setLikeCounts((prev) => ({ ...prev, [review.id]: snapshot.size }));
        setLikedReviewIds((prev) => {
          const hasLiked = snapshot.docs.some((likeDoc) => likeDoc.id === user.uid);
          if (hasLiked && !prev.includes(review.id)) return [...prev, review.id];
          if (!hasLiked) return prev.filter((id) => id !== review.id);
          return prev;
        });
      }, (error) => console.error('Could not load likes:', error));
    });
    return () => unsubs.forEach((unsub) => unsub());
  }, [reviews, user]);

  const activeAreaObj = useMemo(
    () => activeCityAreas.find((a) => a.id === selectedAreaId) || null,
    [activeCityAreas, selectedAreaId]
  );

  const modalCityAreas = CITIES_LOCATIONS[newReview.city] || CITIES_LOCATIONS.dhaka;
  const modalAreaObj = useMemo(
    () => modalCityAreas.find((a) => a.id === newReview.areaId) || modalCityAreas[0],
    [modalCityAreas, newReview.areaId]
  );

  const handleSelectCity = (cityKey) => {
    setSelectedCity(cityKey);
    setSelectedAreaId('all');
    setSelectedSubBlock('all');
    setNewReview((prev) => ({
      ...prev,
      city: cityKey,
      areaId: CITIES_LOCATIONS[cityKey][0].id,
      subBlock: CITIES_LOCATIONS[cityKey][0].blocks[0].id
    }));
  };

  const handleSelectArea = (areaId) => {
    setSelectedAreaId(areaId);
    setSelectedSubBlock('all');
    if (activeTab !== 'explore') setActiveTab('explore');
  };

  const areaCounts = useMemo(() => {
    const counts = {};
    activeCityAreas.forEach((a) => {
      counts[a.id] = 0;
    });
    reviews
      .filter((r) => r.city === selectedCity)
      .forEach((r) => {
        if (counts[r.areaId] !== undefined) counts[r.areaId] += 1;
      });
    return counts;
  }, [reviews, selectedCity, activeCityAreas]);

  const filteredReviews = useMemo(() => {
    return reviews
      .filter((item) => {
        if (item.city !== selectedCity) return false;
        if (selectedAreaId !== 'all' && item.areaId !== selectedAreaId) return false;
        if (selectedSubBlock !== 'all' && item.subBlock !== selectedSubBlock) return false;
        if (selectedTenantType !== 'All' && (item.houseType || item.tenantType) !== selectedTenantType) return false;

        if (searchQuery.trim() !== '') {
          const q = searchQuery.toLowerCase();
          const areaObj = activeCityAreas.find((a) => a.id === item.areaId);
          const searchable = `${areaObj?.bn || ''} ${areaObj?.en || ''} ${item.subBlock} ${item.road} ${item.houseName} ${item.reviewText}`.toLowerCase();
          return searchable.includes(q);
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'helpful') return (b.upvotes || 0) - (a.upvotes || 0);
        if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
        if (sortBy === 'lowest') return a.overallRating - b.overallRating;
        if (sortBy === 'highest') return b.overallRating - a.overallRating;
        return 0;
      });
  }, [
    reviews,
    selectedCity,
    selectedAreaId,
    selectedSubBlock,
    selectedTenantType,
    searchQuery,
    sortBy,
    activeCityAreas
  ]);

  const toggleCardExpand = (id) => {
    setExpandedCardIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleThreadOpen = (id) => {
    setOpenThreadIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleUpvote = async (reviewId) => {
    if (!db || !user) {
      showToast(lang === 'bn' ? 'Like দিতে Firebase সংযোগ প্রয়োজন।' : 'Connect Firebase to like a review.');
      return;
    }
    const likeRef = doc(db, 'reviews', reviewId, 'likes', user.uid);
    try {
      if (likedReviewIds.includes(reviewId)) {
        await deleteDoc(likeRef);
      } else {
        await setDoc(likeRef, { ownerUid: user.uid, createdAt: serverTimestamp() });
      }
    } catch (error) {
      console.error('Review like failed:', error);
      showToast(lang === 'bn' ? 'Like আপডেট করা যায়নি।' : 'Could not update like.');
    }
  };

  const handleAddReply = async (reviewId) => {
    const rawText = (replyTexts[reviewId] || '').trim();
    if (!rawText || !db || !user) return;
    const { cleaned } = sanitizeAndCheckContent(rawText);
    if (cleaned.length < 3 || cleaned.length > 1000) {
      showToast(lang === 'bn' ? 'কমেন্ট ৩–১০০০ অক্ষরের মধ্যে লিখুন।' : 'Comment must be 3–1000 characters.');
      return;
    }
    try {
      await addDoc(collection(db, 'reviews', reviewId, 'comments'), {
        text: cleaned,
        authorAlias: myAlias,
        ownerUid: user.uid,
        status: 'pending',
        createdAt: serverTimestamp(),
        timeAgo: lang === 'bn' ? 'যাচাইয়ের অপেক্ষায়' : 'Awaiting review'
      });
      setReplyTexts((prev) => ({ ...prev, [reviewId]: '' }));
      showToast(lang === 'bn' ? 'কমেন্ট জমা হয়েছে; অনুমোদনের পর দেখা যাবে।' : 'Comment submitted and will appear after moderation.');
    } catch (error) {
      console.error('Comment submission failed:', error);
      showToast(lang === 'bn' ? 'কমেন্ট জমা হয়নি। Firebase Rules পরীক্ষা করুন।' : 'Comment could not be submitted. Check Firebase Rules.');
    }
  };

  const handleAddNestedReply = async (reviewId, parentCommentId) => {
    const rawText = (nestedReplyTexts[parentCommentId] || '').trim();
    if (!rawText || !db || !user) return;
    const { cleaned } = sanitizeAndCheckContent(rawText);
    if (cleaned.length < 3 || cleaned.length > 1000) {
      showToast(lang === 'bn' ? 'রিপ্লাই ৩–১০০০ অক্ষরের মধ্যে লিখুন।' : 'Reply must be 3–1000 characters.');
      return;
    }
    try {
      await addDoc(collection(db, 'reviews', reviewId, 'comments', parentCommentId, 'replies'), {
        text: cleaned,
        authorAlias: myAlias,
        ownerUid: user.uid,
        status: 'pending',
        createdAt: serverTimestamp(),
        timeAgo: lang === 'bn' ? 'যাচাইয়ের অপেক্ষায়' : 'Awaiting review'
      });
      setNestedReplyTexts((prev) => ({ ...prev, [parentCommentId]: '' }));
      setActiveReplyBoxId(null);
      showToast(lang === 'bn' ? 'রিপ্লাই জমা হয়েছে; অনুমোদনের পর দেখা যাবে।' : 'Reply submitted and will appear after moderation.');
    } catch (error) {
      console.error('Reply submission failed:', error);
      showToast(lang === 'bn' ? 'রিপ্লাই জমা হয়নি। Firebase Rules পরীক্ষা করুন।' : 'Reply could not be submitted. Check Firebase Rules.');
    }
  };

  const handleCreateReview = async (e) => {
    e.preventDefault();
    if (!newReview.houseName.trim() || !newReview.reviewText.trim()) return;

    const { cleaned: cleanedReviewText } = sanitizeAndCheckContent(newReview.reviewText);

    const overall = Number(
      (
        (Number(newReview.landlordRating) +
          Number(newReview.utilityRating) +
          Number(newReview.securityRating)) /
        3
      ).toFixed(1)
    );

    if (!db || !user) {
      showToast(
        lang === 'bn'
          ? 'রিভিউ জমা দিতে Firebase সেটআপ ও সংযোগ প্রয়োজন।'
          : 'Firebase setup and connection are required to submit a review.'
      );
      return;
    }

    const payload = {
      city: newReview.city,
      areaId: newReview.areaId,
      subBlock: newReview.subBlock,
      road: newReview.road.trim(),
      houseName: newReview.houseName.trim(),
      houseType: newReview.houseType,
      floorUnit: newReview.floorUnit.trim(),
      // Keep the legacy tenantType field in sync with the selected house type.
      tenantType: newReview.houseType,
      rent: newReview.rent === '' ? null : Number(newReview.rent),
      serviceCharge: newReview.serviceCharge === '' ? null : Number(newReview.serviceCharge),
      stayDuration: newReview.stayDuration.trim(),
      overallRating: overall,
      landlordRating: Number(newReview.landlordRating),
      utilityRating: Number(newReview.utilityRating),
      securityRating: Number(newReview.securityRating),
      waterStatus: newReview.waterStatus,
      gasStatus: newReview.gasStatus,
      gateClosingTime: newReview.gateClosingTime,
      leaveReason: newReview.leaveReason,
      leaveCategory: newReview.leaveCategory,
      tags: [newReview.houseType],
      reviewText: cleanedReviewText,
      reviewerAlias: myAlias,
      upvotes: 0,
      createdAt: new Date().toISOString(),
      replies: [],
      status: 'pending',
      ownerUid: user.uid,
    };

    try {
      await addDoc(collection(db, 'reviews'), payload);
      setIsWriteModalOpen(false);
      setSelectedCity(newReview.city);
      setSelectedAreaId(newReview.areaId);
      setSelectedSubBlock(newReview.subBlock);
      showToast(
        lang === 'bn'
          ? 'রিভিউ জমা হয়েছে। যাচাইয়ের পর সবার জন্য প্রকাশ করা হবে।'
          : 'Review submitted. It will appear publicly after moderation.'
      );
    } catch (error) {
      console.error('Review submission failed:', error);
      showToast(
        lang === 'bn'
          ? 'রিভিউ জমা দেওয়া যায়নি। Firebase সেটআপ ও Firestore Rules পরীক্ষা করুন।'
          : 'Could not submit review. Check Firebase setup and Firestore Rules.'
      );
    }
  };

  const totalCityReviews = reviews.filter((r) => r.city === selectedCity).length;
  const totalCommunityReplies = Object.values(commentsByReview).reduce(
    (sum, comments) => sum + comments.reduce((subSum, comment) => subSum + 1 + (nestedRepliesByComment[comment.id] || []).length, 0),
    0
  );
  const disputeCount = reviews.filter(
    (r) => r.city === selectedCity && r.leaveCategory === 'dispute'
  ).length;

  const getAreaName = (cityKey, areaId) => {
    const list = CITIES_LOCATIONS[cityKey] || CITIES_LOCATIONS.dhaka;
    const found = list.find((a) => a.id === areaId);
    if (!found) return areaId;
    return lang === 'bn' ? found.bn : found.en;
  };

  // One ticker item per property, based on its average review rating.
  // On the 1–10 scale, 7.0/10 is equivalent to 3.5/5.
  const lowestRatedProperties = useMemo(() => {
    const properties = new Map();

    reviews.forEach((review) => {
      const propertyKey = [
        review.city,
        review.areaId,
        review.subBlock || '',
        (review.houseName || '').trim().toLowerCase(),
      ].join('::');

      if (!review.houseName || !Number.isFinite(Number(review.overallRating))) return;

      const current = properties.get(propertyKey) || {
        key: propertyKey,
        city: review.city,
        areaId: review.areaId,
        subBlock: review.subBlock,
        houseName: review.houseName,
        totalRating: 0,
        reviewCount: 0,
        reviewId: review.id,
      };

      current.totalRating += Number(review.overallRating);
      current.reviewCount += 1;
      properties.set(propertyKey, current);
    });

    return Array.from(properties.values())
      .map((property) => ({
        ...property,
        averageRating: property.totalRating / property.reviewCount,
      }))
      .filter((property) => property.averageRating <= 7.0)
      .sort((a, b) => a.averageRating - b.averageRating)
      .slice(0, 6);
  }, [reviews]);

  if (window.location.pathname.replace(/\/$/, '') === '/admin') {
    return <AdminDashboard auth={auth} db={db} />;
  }

  return (
    <div className="min-h-screen pb-24 md:pb-0 bg-[#F8FAFC] text-slate-900 font-sans flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      {/* TOAST */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg border border-slate-700 flex items-center gap-2.5 text-xs sm:text-sm font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* NAVBAR */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
        <div className="relative max-w-7xl mx-auto w-full px-2.5 sm:px-6 h-[68px] sm:min-h-20 sm:h-auto py-0 sm:py-0 flex flex-nowrap items-center justify-between gap-2 sm:gap-4">
          
          {/* FAR LEFT: LOGO & BRAND NAME */}
          <button
            onClick={() => {
              setActiveTab('explore');
              setSelectedAreaId('all');
              setSelectedSubBlock('all');
            }}
            className="flex items-center gap-2 sm:gap-3 text-left group cursor-pointer focus:outline-none shrink-0 min-w-0"
          >
            <BariwalaBrandIcon className="w-9 h-9 sm:w-10 sm:h-10 transition-transform duration-200 group-hover:scale-105 shrink-0 shadow-sm rounded-xl" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-[13px] sm:text-xl tracking-tight text-slate-900 whitespace-nowrap">
                  {t.brandName}
                </span>
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs whitespace-nowrap">
                  {selectedCity === 'dhaka'
                    ? lang === 'bn'
                      ? 'ঢাকা'
                      : 'Dhaka'
                    : lang === 'bn'
                    ? 'চট্টগ্রাম'
                    : 'Chittagong'}
                </span>
              </div>
            </div>
          </button>

          {/* CENTER: NAV TABS */}
          <nav className="hidden md:flex items-center bg-[#F1F5F9] p-1.5 rounded-2xl border border-slate-200/80 shadow-2xs md:static md:translate-x-0 lg:absolute lg:left-1/2 lg:-translate-x-1/2">
            <button
              onClick={() => setActiveTab('explore')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
                activeTab === 'explore'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.navExplore}
            </button>
            <button
              onClick={() => setActiveTab('areas')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
                activeTab === 'areas'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.navAreas}
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
                activeTab === 'about'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.navAbout}
            </button>
          </nav>

          {/* FAR RIGHT: ACTIONS & SEPARATED LANGUAGE SWITCHER */}
          <div className="ml-auto flex items-center gap-1.5 sm:gap-3 shrink-0">
            <button
              onClick={() => setIsWriteModalOpen(true)}
              className="hidden md:flex items-center gap-1.5 bg-slate-900 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">{t.shareBtn}</span>
              <span className="sm:hidden">{lang === 'bn' ? 'রিভিউ দিন' : 'Post'}</span>
            </button>

            {/* SEPARATED LANGUAGE SWITCHER CONTAINER */}
            <div className="flex items-center gap-0.5 sm:gap-1.5 bg-[#F1F5F9] p-1 sm:p-1.5 rounded-xl sm:rounded-2xl border border-slate-300 shadow-2xs shrink-0">
              <button
                onClick={() => setLang('bn')}
                className={`px-2 sm:px-3 py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  lang === 'bn'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-transparent text-slate-700 hover:bg-slate-200'
                }`}
              >
                বাংলা
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-2 sm:px-3 py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  lang === 'en'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-transparent text-slate-700 hover:bg-slate-200'
                }`}
              >
                EN
              </button>
            </div>
          </div>

        </div>
      </header>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav
        aria-label="Mobile navigation"
        className="md:hidden fixed bottom-3 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-24px)] max-w-[520px] rounded-[24px] border border-emerald-100 bg-white/95 p-2 shadow-[0_8px_30px_rgba(15,23,42,0.18)] backdrop-blur-xl"
      >
        <div className="grid grid-cols-4 gap-1">
          <button
            onClick={() => setActiveTab('explore')}
            className={`min-w-0 flex flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 text-[10px] sm:text-xs font-bold leading-tight transition cursor-pointer ${
              activeTab === 'explore'
                ? 'bg-emerald-100 text-emerald-900'
                : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-800'
            }`}
          >
            <House className="w-5 h-5" />
            <span className="text-center">{lang === 'bn' ? 'হোম' : 'Home'}</span>
          </button>
          <button
            onClick={() => setIsWriteModalOpen(true)}
            className="min-w-0 flex flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 text-[10px] sm:text-xs font-bold leading-tight text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-800 cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            <span className="text-center">{t.shareBtn}</span>
          </button>
          <button
            onClick={() => setActiveTab('areas')}
            className={`min-w-0 flex flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 text-[10px] sm:text-xs font-bold leading-tight transition cursor-pointer ${
              activeTab === 'areas'
                ? 'bg-emerald-100 text-emerald-900'
                : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-800'
            }`}
          >
            <MapPin className="w-5 h-5" />
            <span className="text-center">{t.navAreas}</span>
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`min-w-0 flex flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 text-[10px] sm:text-xs font-bold leading-tight transition cursor-pointer ${
              activeTab === 'about'
                ? 'bg-emerald-100 text-emerald-900'
                : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-800'
            }`}
          >
            <Shield className="w-5 h-5" />
            <span className="text-center">{t.navAbout}</span>
          </button>
        </div>
      </nav>

      {/* EXPLORE TAB */}
      {activeTab === 'explore' && (
        <>
          {/* HERO BANNER WITH DHAKA CITY DRONE VIEW BACKGROUND (OPACITY INCREASED) */}
          <section className="relative overflow-hidden border-b border-slate-200/80 bg-slate-950 py-14 sm:py-24">
            <div 
              className="absolute inset-0 z-0 bg-cover bg-center opacity-55 pointer-events-none mix-blend-luminosity"
              style={{ backgroundImage: `url('https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=1600&auto=format&fit=crop')` }}
            />
            <div className="absolute inset-0 z-0 bg-gradient-to-tr from-slate-950 via-slate-900/75 to-emerald-950/30 pointer-events-none" />
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-slate-900/80 border border-emerald-400/40 text-emerald-300 text-xs font-medium backdrop-blur-md shadow-lg">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t.heroBadge}</span>
              </div>

              <h1 className="text-2xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight drop-shadow-md">
                {t.heroTitle1}{' '}
                <span className="text-emerald-400 underline decoration-emerald-400/50 decoration-wavy underline-offset-4">
                  {t.heroTitle2}
                </span>
              </h1>

              <p className="text-xs sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed font-medium drop-shadow">
                {t.heroSub}
              </p>

              {/* CITY SWITCHER BUTTONS IN HERO */}
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => handleSelectCity('dhaka')}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    selectedCity === 'dhaka'
                      ? 'bg-emerald-600 text-white shadow-lg ring-2 ring-emerald-400/30'
                      : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800 backdrop-blur-md'
                  }`}
                >
                  <Building className="w-4 h-4" />
                  <span>{t.cityDhaka}</span>
                </button>
                <button
                  onClick={() => handleSelectCity('chittagong')}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    selectedCity === 'chittagong'
                      ? 'bg-emerald-600 text-white shadow-lg ring-2 ring-emerald-400/30'
                      : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800 backdrop-blur-md'
                  }`}
                >
                  <Building className="w-4 h-4" />
                  <span>{t.cityChittagong}</span>
                </button>
              </div>

              {/* SEARCH BAR */}
              <div className="max-w-2xl mx-auto pt-2">
                <div className="relative flex items-center bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-700 shadow-2xl px-4 py-3">
                  <Search className="w-5 h-5 text-emerald-400 mr-3 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.searchPlaceholder}
                    className="w-full bg-transparent text-sm sm:text-base text-white placeholder-slate-400 focus:outline-none"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-slate-400 hover:text-white p-1 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>

          <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-7">
            {/* METRICS BAR */}
            <section className="grid grid-cols-3 gap-2.5 sm:gap-4 bg-[#F1F5F9] p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs text-center -mt-12 relative z-20">
              <div className="px-2">
                <p className="text-lg sm:text-2xl font-extrabold text-slate-900 tabular-nums">
                  {totalCityReviews}
                </p>
                <p className="text-[11px] sm:text-xs text-slate-600 font-medium mt-0.5">
                  {t.statTotalReviews}
                </p>
              </div>
              <div className="px-2 border-x border-slate-200">
                <p className="text-lg sm:text-2xl font-extrabold text-emerald-600 tabular-nums">
                  {totalCommunityReplies}
                </p>
                <p className="text-[11px] sm:text-xs text-slate-600 font-medium mt-0.5">
                  {t.statDepositAlert}
                </p>
              </div>
              <div className="px-2">
                <p className="text-lg sm:text-2xl font-extrabold text-rose-600 tabular-nums">
                  {disputeCount}
                </p>
                <p className="text-[11px] sm:text-xs text-slate-600 font-medium mt-0.5">
                  {t.statDisputeLeaves}
                </p>
              </div>
            </section>

            {/* HIERARCHICAL AREA & BLOCK EXPLORER */}
            <section className="bg-[#F1F5F9] rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  {selectedCity === 'dhaka' ? 'ঢাকা' : 'চট্টগ্রাম'} — {t.step1AreaTitle}
                </span>

                {(selectedAreaId !== 'all' || selectedSubBlock !== 'all' || searchQuery) && (
                  <button
                    onClick={() => {
                      setSelectedAreaId('all');
                      setSelectedSubBlock('all');
                      setSearchQuery('');
                    }}
                    className="text-xs font-semibold text-emerald-700 hover:underline cursor-pointer"
                  >
                    {t.clearFilters}
                  </button>
                )}
              </div>

              {/* Step 1: Area pills */}
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                <button
                  onClick={() => handleSelectArea('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                    selectedAreaId === 'all'
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  <span>{t.allAreas}</span>
                </button>

                {activeCityAreas.map((area) => {
                  const isSelected = selectedAreaId === area.id;
                  const count = areaCounts[area.id] || 0;
                  return (
                    <button
                      key={area.id}
                      onClick={() => handleSelectArea(area.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      <span>{lang === 'bn' ? area.bn : area.en}</span>
                      {count > 0 && (
                        <span
                          className={`text-[10px] px-1.5 rounded-full ${
                            isSelected
                              ? 'bg-emerald-700 text-emerald-100'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Step 2: Sub-blocks / Sectors Tray */}
              {activeAreaObj && (
                <div className="pt-3 border-t border-slate-200/80 bg-[#E2E8F0]/70 -mx-4 sm:-mx-5 px-4 sm:px-5 pb-2 rounded-b-xl space-y-2">
                  <span className="text-[11px] font-bold text-emerald-900 flex items-center gap-1">
                    <Compass className="w-3.5 h-3.5 text-emerald-600" />
                    {lang === 'bn' ? activeAreaObj.bn : activeAreaObj.en} — {t.step2BlockTitle}:
                  </span>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    <button
                      onClick={() => setSelectedSubBlock('all')}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                        selectedSubBlock === 'all'
                          ? 'bg-slate-800 text-white'
                          : 'bg-white text-slate-700 border border-slate-200'
                      }`}
                    >
                      {t.allBlocks}
                    </button>

                    {activeAreaObj.blocks.map((block) => {
                      const isBlockSelected = selectedSubBlock === block.id;
                      return (
                        <button
                          key={block.id}
                          onClick={() => setSelectedSubBlock(block.id)}
                          className={`px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                            isBlockSelected
                              ? 'bg-emerald-600 text-white font-semibold shadow-2xs'
                              : 'bg-white text-slate-700 border border-slate-200 hover:border-emerald-400'
                          }`}
                        >
                          {lang === 'bn' ? block.bn : block.en}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>

            {/* LOWEST-RATED PROPERTY NEWS TICKER */}
            {lowestRatedProperties.length > 0 && (
              <section className="worst-ticker" aria-label={lang === 'bn' ? 'কম রেটিং পাওয়া বাড়ি' : 'Lowest-rated properties'}>
                <div className="worst-ticker-heading">
                  <span className="worst-ticker-icon" aria-hidden="true">↓</span>
                  <h2 className="text-sm font-extrabold text-slate-900">
                    {lang === 'bn' ? 'সবচেয়ে কম রেটিং পাওয়া বাড়ি' : 'Lowest-rated properties'}
                  </h2>
                  <span className="worst-ticker-label">{lang === 'bn' ? 'সতর্কতা' : 'LOWEST RATED'}</span>
                </div>
                <div className="worst-ticker-window" aria-live="off">
                  <div className="worst-ticker-track">
                    {[0, 1].map((copy) => (
                      <div className="worst-ticker-group" key={copy} aria-hidden={copy === 1 ? 'true' : undefined}>
                        {lowestRatedProperties.map((property) => (
                          <button
                            className="worst-ticker-item"
                            key={`${copy}-${property.key}`}
                            type="button"
                            tabIndex={copy === 1 ? -1 : 0}
                            onClick={() => {
                              if (copy === 1) return;
                              setSelectedCity(property.city);
                              setSelectedAreaId(property.areaId);
                              setSelectedSubBlock(property.subBlock || 'all');
                              setSearchQuery(property.houseName);
                              setActiveTab('explore');
                            }}
                            title={property.houseName}
                          >
                            <span className="worst-ticker-name">{property.houseName}</span>
                            <span className="worst-ticker-area">{getAreaName(property.city, property.areaId)}</span>
                            <span className="worst-ticker-rating">★ {property.averageRating.toFixed(1)}/10</span>
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* REVIEW LIST */}
            {filteredReviews.length === 0 ? (
              <div className="bg-[#F1F5F9] rounded-2xl border border-slate-200/90 p-10 text-center max-w-md mx-auto">
                <MapPin className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <h3 className="text-base font-bold text-slate-800">{t.emptyTitle}</h3>
                <p className="text-xs text-slate-600 mt-1 mb-4">{t.emptySub}</p>
                <button
                  onClick={() => setIsWriteModalOpen(true)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-emerald-700 transition cursor-pointer"
                >
                  + {t.shareBtn}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredReviews.map((review) => {
                  const isThreadOpen = openThreadIds.includes(review.id);
                  const isPositive = review.overallRating >= 7.0;
                  const isWarning = review.overallRating < 4.0;

                  const topReplies = commentsByReview[review.id] || [];
                  const totalReplyCount = topReplies.reduce(
                    (acc, comment) => acc + 1 + (nestedRepliesByComment[comment.id] || []).length,
                    0
                  );

                  return (
                    <article
                      key={review.id}
                      className="bg-[#F1F5F9] rounded-2xl border border-slate-200/90 hover:border-slate-300 transition-all duration-150 shadow-2xs overflow-hidden"
                    >
                      <div className="p-5 sm:p-6 space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-1.5 text-xs">
                              <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                                {review.city === 'dhaka' ? 'ঢাকা' : 'চট্টগ্রাম'} :{' '}
                                {getAreaName(review.city, review.areaId)}
                              </span>
                              <span className="text-slate-400">/</span>
                              <span className="font-semibold text-slate-700">{review.subBlock}</span>
                              <span className="text-slate-400">•</span>
                              <span className="text-slate-600">{review.road}</span>
                            </div>

                            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                              {review.houseName}{' '}
                              <span className="text-xs font-normal text-slate-500">
                                ({review.floorUnit})
                              </span>
                            </h3>
                          </div>

                          <div className="flex flex-col items-end gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => setSelectedReviewForDetails(review)}
                              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 hover:bg-emerald-700 text-white text-[11px] sm:text-xs font-bold transition cursor-pointer shadow-sm"
                            >
                              বিস্তারিত দেখুন
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </button>
                            <div
                              className={`px-3 py-1.5 rounded-xl border text-right ${
                                isPositive
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                  : isWarning
                                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                                  : 'bg-amber-50 border-amber-200 text-amber-800'
                              }`}
                            >
                              <div className="flex items-center justify-end gap-1 font-extrabold text-sm sm:text-base tabular-nums">
                                <Star className="w-3.5 h-3.5 fill-current" />
                                <span>{review.overallRating}</span>
                              </div>
                              <p className="text-[10px] font-medium opacity-75">
                                {t.landlordScoreLabel}: {review.landlordRating}/10
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* METRIC STRIP */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-white p-3 rounded-xl border border-slate-200/80 text-xs">
                          <div>
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block">
                              {t.metricRent}
                            </span>
                            <p className="font-bold text-slate-900 mt-0.5 tabular-nums">
                              {review.rent !== undefined && review.rent !== null && review.rent !== ''
                                ? `৳${Number(review.rent).toLocaleString('en-BD')}`
                                : 'ভাড়া উল্লেখ নেই'}{' '}
                              <span className="font-normal text-slate-600">
                                {review.serviceCharge !== undefined && review.serviceCharge !== null && review.serviceCharge !== ''
                                  ? `(+৳${Number(review.serviceCharge).toLocaleString('en-BD')})`
                                  : '(সার্ভিস চার্জ উল্লেখ নেই)'}
                              </span>
                            </p>
                          </div>
                          <div className="sm:border-l sm:border-slate-200 sm:pl-4">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block">
                              {t.metricWhyLeft}
                            </span>
                            <p className="font-bold text-slate-800 mt-0.5 truncate">
                              {review.leaveReason}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <p className="text-sm sm:text-base text-slate-800 leading-relaxed whitespace-pre-wrap">
                            {review.reviewText}
                          </p>
                        </div>

                      </div>

                      <div className="px-5 py-3 bg-[#E2E8F0]/70 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-3 text-slate-600">
                          <span className="font-semibold text-slate-800 flex items-center gap-1">
                            <Lock className="w-3 h-3 text-emerald-600" />
                            {review.reviewerAlias}
                          </span>
                          <span>•</span>
                          <span>{review.stayDuration}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUpvote(review.id)}
                            className={`px-2.5 py-1.5 rounded-lg font-semibold border flex items-center gap-1 transition cursor-pointer ${
                              likedReviewIds.includes(review.id)
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                                : 'bg-white border-slate-300 text-slate-700'
                            }`}
                          >
                            <ThumbsUp className="w-3 h-3" />
                            <span>{likeCounts[review.id] ?? review.upvotes ?? 0}</span>
                          </button>

                          <button
                            onClick={() => toggleThreadOpen(review.id)}
                            className={`px-3 py-1.5 rounded-lg font-semibold border flex items-center gap-1.5 transition cursor-pointer ${
                              isThreadOpen
                                ? 'bg-slate-900 text-white border-slate-900'
                                : 'bg-white border-slate-300 text-slate-700'
                            }`}
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                            <span>
                              {t.discussionBtn} ({totalReplyCount})
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* COMMENTS & NESTED REPLIES */}
                      {isThreadOpen && (
                        <div className="bg-[#E2E8F0]/40 border-t border-slate-200 px-5 py-4 space-y-4">
                          {topReplies.length === 0 ? (
                            <p className="text-xs text-slate-500 italic">কোনো কমেন্ট নেই।</p>
                          ) : (
                            <div className="space-y-3">
                              {topReplies.map((comment) => (
                                <div key={comment.id} className="space-y-2">
                                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1 shadow-2xs">
                                    <div className="flex items-center justify-between text-[11px]">
                                      <div className="flex items-center gap-2">
                                        <span className="font-bold text-slate-800">
                                          {comment.authorAlias}
                                        </span>
                                        <span className="text-slate-500">• {comment.timeAgo}</span>
                                      </div>
                                    </div>
                                    <p className="text-xs sm:text-sm text-slate-700">
                                      {comment.text}
                                    </p>
                                    <div className="pt-1 flex items-center justify-end">
                                      <button
                                        onClick={() =>
                                          setActiveReplyBoxId(
                                            activeReplyBoxId === comment.id ? null : comment.id
                                          )
                                        }
                                        className="text-[11px] font-semibold text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
                                      >
                                        <CornerDownRight className="w-3 h-3" />
                                        <span>রিপ্লাই</span>
                                      </button>
                                    </div>
                                  </div>

                                  {nestedRepliesByComment[comment.id] && nestedRepliesByComment[comment.id].length > 0 && (
                                    <div className="pl-6 space-y-2 border-l-2 border-slate-300 ml-3">
                                      {nestedRepliesByComment[comment.id].map((sub) => (
                                        <div
                                          key={sub.id}
                                          className="bg-white p-3 rounded-xl border border-slate-200 space-y-1"
                                        >
                                          <div className="flex items-center gap-2 text-[11px]">
                                            <span className="font-bold text-slate-800">
                                              {sub.authorAlias}
                                            </span>
                                            <span className="text-slate-500">• {sub.timeAgo}</span>
                                          </div>
                                          <p className="text-xs sm:text-sm text-slate-700">
                                            {sub.text}
                                          </p>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {activeReplyBoxId === comment.id && (
                                    <div className="pl-6 pt-1 flex items-center gap-2">
                                      <input
                                        type="text"
                                        value={nestedReplyTexts[comment.id] || ''}
                                        onChange={(e) =>
                                          setNestedReplyTexts((prev) => ({
                                            ...prev,
                                            [comment.id]: e.target.value
                                          }))
                                        }
                                        placeholder={`${comment.authorAlias}-কে রিপ্লাই দিন...`}
                                        className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-emerald-600"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => handleAddNestedReply(review.id, comment.id)}
                                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer shrink-0"
                                      >
                                        রিপ্লাই
                                      </button>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                            <input
                              type="text"
                              value={replyTexts[review.id] || ''}
                              onChange={(e) =>
                                setReplyTexts((prev) => ({
                                  ...prev,
                                  [review.id]: e.target.value
                                }))
                              }
                              placeholder={t.replyPlaceholder}
                              className="flex-1 bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm focus:outline-none focus:border-emerald-600"
                            />
                            <button
                              type="button"
                              onClick={() => handleAddReply(review.id)}
                              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>{t.replySubmitBtn}</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </main>
        </>
      )}

      {/* AREAS DIRECTORY TAB */}
      {activeTab === 'areas' && (
        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 flex-1 w-full space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              {selectedCity === 'dhaka'
                ? 'ঢাকা শহরের এলাকা ও ব্লক'
                : 'চট্টগ্রাম শহরের এলাকা ও ব্লক'}
            </h2>
            <div className="flex bg-[#F1F5F9] p-1 rounded-xl text-xs font-semibold border border-slate-200">
              <button
                onClick={() => setSelectedCity('dhaka')}
                className={`px-3 py-1.5 rounded-lg ${
                  selectedCity === 'dhaka' ? 'bg-white shadow-2xs' : 'text-slate-600'
                }`}
              >
                ঢাকা
              </button>
              <button
                onClick={() => setSelectedCity('chittagong')}
                className={`px-3 py-1.5 rounded-lg ${
                  selectedCity === 'chittagong' ? 'bg-white shadow-2xs' : 'text-slate-600'
                }`}
              >
                চট্টগ্রাম
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeCityAreas.map((area) => (
              <div
                key={area.id}
                className="bg-[#F1F5F9] rounded-2xl border border-slate-200 p-5 space-y-3 shadow-2xs"
              >
                <button
                  onClick={() => {
                    setSelectedAreaId(area.id);
                    setActiveTab('explore');
                  }}
                  className="text-base font-bold text-slate-900 hover:text-emerald-600 flex items-center gap-1.5 cursor-pointer"
                >
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>{lang === 'bn' ? area.bn : area.en}</span>
                  <ArrowUpRight className="w-4 h-4 text-slate-400" />
                </button>
                <div className="flex flex-wrap gap-1.5">
                  {area.blocks.map((block) => (
                    <button
                      key={block.id}
                      onClick={() => {
                        setSelectedAreaId(area.id);
                        setSelectedSubBlock(block.id);
                        setActiveTab('explore');
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 border border-slate-200 transition cursor-pointer"
                    >
                      {lang === 'bn' ? block.bn : block.en}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* ABOUT TAB */}
      {activeTab === 'about' && (
        <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 flex-1 w-full space-y-6">
          <div className="bg-[#F1F5F9] rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-2xs">
            <h2 className="text-2xl font-extrabold text-slate-900">Bariwala Kemon</h2>
            <p className="text-sm text-slate-700 leading-relaxed">
              ঢাকা ও চট্টগ্রাম শহরের ভাড়াটিয়াদের দুর্দশা ও সঠিক তথ্য পাওয়ার সংকট দূর করতে এই প্ল্যাটফর্মটি তৈরি করা হয়েছে। এখানে সম্পূর্ণ নিরাপদে বাড়িওয়ালা এবং বাসা সম্পর্কে অভিজ্ঞতা শেয়ার করা যায়।
            </p>
          </div>
        </main>
      )}

      {/* NEW REVIEW MODAL */}
      {selectedReviewForDetails && (
        <div
          className="fixed inset-0 z-[120] bg-slate-950/65 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
          onClick={(event) => {
            if (event.target === event.currentTarget) setSelectedReviewForDetails(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="review-details-title"
            className="w-full max-w-3xl max-h-[92vh] bg-[#F8FAFC] rounded-2xl sm:rounded-3xl shadow-2xl border border-white/70 overflow-hidden flex flex-col"
          >
            <header className="px-5 py-4 sm:px-7 sm:py-5 bg-white border-b border-slate-200 flex items-start justify-between gap-4 shrink-0">
              <div className="min-w-0">
                <p className="text-xs font-bold text-emerald-700 mb-1">রিভিউয়ের বিস্তারিত</p>
                <h2 id="review-details-title" className="text-lg sm:text-xl font-extrabold text-slate-900 truncate">
                  {selectedReviewForDetails.houseName}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {selectedReviewForDetails.city === 'dhaka' ? 'ঢাকা' : 'চট্টগ্রাম'} · {getAreaName(selectedReviewForDetails.city, selectedReviewForDetails.areaId)} · {selectedReviewForDetails.subBlock || ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReviewForDetails(null)}
                aria-label="বিস্তারিত বন্ধ করুন"
                className="w-9 h-9 shrink-0 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 grid place-items-center text-2xl leading-none"
              >
                ×
              </button>
            </header>

            <div className="p-5 sm:p-7 overflow-y-auto overscroll-contain space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  ['বাসার ধরন', selectedReviewForDetails.houseType],
                  ['মাসিক ভাড়া', selectedReviewForDetails.rent !== undefined && selectedReviewForDetails.rent !== null && selectedReviewForDetails.rent !== '' ? `৳${Number(selectedReviewForDetails.rent).toLocaleString('en-BD')}` : null],
                  ['সার্ভিস চার্জ', selectedReviewForDetails.serviceCharge !== undefined && selectedReviewForDetails.serviceCharge !== null && selectedReviewForDetails.serviceCharge !== '' ? `৳${Number(selectedReviewForDetails.serviceCharge).toLocaleString('en-BD')}` : null],
                ].filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== '').map(([label, value]) => (
                  <div key={label} className="bg-white border border-slate-200 rounded-xl p-3">
                    <span className="block text-[10px] font-semibold text-slate-500 mb-1">{label}</span>
                    <span className="text-sm font-bold text-slate-900">{value}</span>
                  </div>
                ))}
              </div>

              <section className="space-y-2">
                <h3 className="font-extrabold text-sm text-slate-900">রেটিং (১০-এর মধ্যে)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    ['সার্বিক রেটিং', selectedReviewForDetails.overallRating],
                    ['বাড়িওয়ালার রেটিং', selectedReviewForDetails.landlordRating],
                    ['ইউটিলিটি রেটিং', selectedReviewForDetails.utilityRating],
                    ['নিরাপত্তা রেটিং', selectedReviewForDetails.securityRating],
                  ].filter(([, value]) => value !== undefined && value !== null && value !== '').map(([label, value]) => (
                    <div key={label} className="bg-white border border-slate-200 rounded-xl p-3">
                      <span className="block text-[10px] font-semibold text-slate-500 mb-1">{label}</span>
                      <span className="text-lg font-extrabold text-slate-900">{`${value}/10`}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="space-y-2">
                <h3 className="font-extrabold text-sm text-slate-900">বাসার সুবিধা ও পরিবেশ</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    ['গ্যাসের অবস্থা', selectedReviewForDetails.gasStatus],
                    ['পানির অবস্থা', selectedReviewForDetails.waterStatus],
                    ['গেট বন্ধের সময়', selectedReviewForDetails.gateClosingTime],
                    ['কতদিন ছিলেন', selectedReviewForDetails.stayDuration],
                    ['বাসা ছাড়ার কারণ', selectedReviewForDetails.leaveReason],
                    ['ব্লক / সেক্টর', selectedReviewForDetails.subBlock],
                  ].filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== '').map(([label, value]) => (
                    <div key={label} className="bg-white border border-slate-200 rounded-xl p-3">
                      <span className="block text-[10px] font-semibold text-slate-500 mb-1">{label}</span>
                      <span className="text-sm font-semibold text-slate-800">{value}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-2">
                <h3 className="font-extrabold text-sm text-slate-900">বিস্তারিত অভিজ্ঞতা</h3>
                <p className="text-base sm:text-lg text-slate-800 leading-relaxed whitespace-pre-wrap">{selectedReviewForDetails.reviewText}</p>
              </section>
            </div>

            <footer className="px-5 py-3 sm:px-7 bg-white border-t border-slate-200 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setSelectedReviewForDetails(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-emerald-700 text-white text-sm font-bold transition"
              >
                বন্ধ করুন
              </button>
            </footer>
          </section>
        </div>
      )}

      {isWriteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-hidden">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[92vh] max-h-[calc(100dvh-1rem)] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-[#F1F5F9]">
              <div>
                <h3 className="font-bold text-base text-slate-900">{t.modalTitle}</h3>
                <p className="text-xs text-slate-600">{t.modalSub}</p>
              </div>
              <button
                onClick={() => setIsWriteModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleCreateReview}
              className="p-5 min-h-0 flex-1 overflow-y-auto overscroll-contain space-y-4 text-xs sm:text-sm"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    শহর (City) *
                  </label>
                  <select
                    value={newReview.city}
                    onChange={(e) => {
                      const c = e.target.value;
                      const firstArea = CITIES_LOCATIONS[c][0];
                      setNewReview({
                        ...newReview,
                        city: c,
                        areaId: firstArea.id,
                        subBlock: firstArea.blocks[0].id
                      });
                    }}
                    className="w-full bg-[#F1F5F9] border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium"
                  >
                    <option value="dhaka">ঢাকা (Dhaka)</option>
                    <option value="chittagong">চট্টগ্রাম (Chittagong)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    এলাকা (Area) *
                  </label>
                  <select
                    value={newReview.areaId}
                    onChange={(e) => {
                      const nextAreaId = e.target.value;
                      const foundArea = modalCityAreas.find((a) => a.id === nextAreaId);
                      setNewReview({
                        ...newReview,
                        areaId: nextAreaId,
                        subBlock: foundArea?.blocks[0]?.id || ''
                      });
                    }}
                    className="w-full bg-[#F1F5F9] border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium"
                  >
                    {modalCityAreas.map((area) => (
                      <option key={area.id} value={area.id}>
                        {lang === 'bn' ? area.bn : area.en}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ব্লক / সেক্টর *
                  </label>
                  <select
                    value={newReview.subBlock}
                    onChange={(e) => setNewReview({ ...newReview, subBlock: e.target.value })}
                    className="w-full bg-[#F1F5F9] border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium"
                  >
                    {modalAreaObj.blocks.map((b) => (
                      <option key={b.id} value={b.id}>
                        {lang === 'bn' ? b.bn : b.en}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    বাসার ধরন (House Type) *
                  </label>
                  <select
                    required
                    value={newReview.houseType}
                    onChange={(e) => setNewReview({ ...newReview, houseType: e.target.value })}
                    className="w-full bg-[#F1F5F9] border border-slate-300 rounded-lg px-3 py-2"
                  >
                    <option value="Family">Family (ফ্যামিলি)</option>
                    <option value="Male bachelor">Male bachelor (পুরুষ ব্যাচেলর)</option>
                    <option value="Female bachelor">Female bachelor (নারী ব্যাচেলর)</option>
                    <option value="Sublet">Sublet (সাবলেট)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    বাসার নাম বা হোল্ডিং *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: Swapnoneer Villa"
                    value={newReview.houseName}
                    onChange={(e) => setNewReview({ ...newReview, houseName: e.target.value })}
                    className="w-full bg-[#F1F5F9] border border-slate-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">মাসিক ভাড়া (৳)</label>
                  <input type="number" min="0" placeholder="যেমন: 18000" value={newReview.rent} onChange={(e) => setNewReview({ ...newReview, rent: e.target.value })} className="w-full bg-[#F1F5F9] border border-slate-300 rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">সার্ভিস চার্জ (৳)</label>
                  <input type="number" min="0" placeholder="যেমন: 2000" value={newReview.serviceCharge} onChange={(e) => setNewReview({ ...newReview, serviceCharge: e.target.value })} className="w-full bg-[#F1F5F9] border border-slate-300 rounded-lg px-3 py-2" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">বাড়িওয়ালার রেটিং (১–১০) *</label>
                  <select required value={newReview.landlordRating} onChange={(e) => setNewReview({ ...newReview, landlordRating: e.target.value })} className="w-full bg-[#F1F5F9] border border-slate-300 rounded-lg px-3 py-2">
                    <option value="">রেটিং নির্বাচন করুন</option>
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n} / 10</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">গ্যাসের অবস্থা *</label>
                  <select required value={newReview.gasStatus} onChange={(e) => setNewReview({ ...newReview, gasStatus: e.target.value })} className="w-full bg-[#F1F5F9] border border-slate-300 rounded-lg px-3 py-2">
                    <option value="">নির্বাচন করুন</option>
                    <option>স্বাভাবিক</option><option>গ্যাসের চাপ কম</option><option>অনিয়মিত</option><option>গ্যাস নেই</option><option>সিলিন্ডার গ্যাস</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">পানির অবস্থা *</label>
                  <select required value={newReview.waterStatus} onChange={(e) => setNewReview({ ...newReview, waterStatus: e.target.value })} className="w-full bg-[#F1F5F9] border border-slate-300 rounded-lg px-3 py-2">
                    <option value="">নির্বাচন করুন</option>
                    <option>২৪ ঘণ্টা পানি থাকে</option><option>নির্দিষ্ট সময়ে পানি থাকে</option><option>পানির চাপ কম</option><option>অনিয়মিত পানি</option><option>পানির সমস্যা আছে</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">নিরাপত্তা রেটিং (১–১০) *</label>
                  <select required value={newReview.securityRating} onChange={(e) => setNewReview({ ...newReview, securityRating: e.target.value })} className="w-full bg-[#F1F5F9] border border-slate-300 rounded-lg px-3 py-2">
                    <option value="">রেটিং নির্বাচন করুন</option>
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n} / 10</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">সার্বিক ইউটিলিটি রেটিং (১–১০) *</label>
                  <select required value={newReview.utilityRating} onChange={(e) => setNewReview({ ...newReview, utilityRating: e.target.value })} className="w-full bg-[#F1F5F9] border border-slate-300 rounded-lg px-3 py-2">
                    <option value="">রেটিং নির্বাচন করুন</option>
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n} / 10</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">গেট বন্ধের সময় *</label>
                  <select required value={newReview.gateClosingTime} onChange={(e) => setNewReview({ ...newReview, gateClosingTime: e.target.value })} className="w-full bg-[#F1F5F9] border border-slate-300 rounded-lg px-3 py-2">
                    <option value="">নির্বাচন করুন</option>
                    <option>গেট বন্ধ হয় না</option><option>রাত ১০:০০</option><option>রাত ১০:৩০</option><option>রাত ১১:০০</option><option>রাত ১১:৩০</option><option>রাত ১২:০০</option><option>রাত ১২:৩০</option><option>রাত ১:০০</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">কতদিন ছিলেন? *</label>
                  <select required value={newReview.stayDuration} onChange={(e) => setNewReview({ ...newReview, stayDuration: e.target.value })} className="w-full bg-[#F1F5F9] border border-slate-300 rounded-lg px-3 py-2">
                    <option value="">সময় নির্বাচন করুন</option>
                    <option>৩ মাসের কম</option><option>৩–৬ মাস</option><option>৬ মাস–১ বছর</option><option>১–২ বছর</option><option>২ বছরের বেশি</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">বাসা ছাড়ার কারণ *</label>
                  <select required value={newReview.leaveCategory} onChange={(e) => {
                    const value = e.target.value;
                    const reasons = {
                      personal: 'নিজ প্রয়োজনে / অফিস পরিবর্তন',
                      rent: 'ভাড়া বা অতিরিক্ত চার্জ',
                      landlord: 'বাড়িওয়ালার আচরণ',
                      utility: 'গ্যাস / পানি / বিদ্যুৎ সমস্যা',
                      security: 'নিরাপত্তা সমস্যা',
                      dispute: 'বাড়িওয়ালার সঙ্গে বিরোধ',
                      other: 'অন্যান্য কারণ'
                    };
                    setNewReview({ ...newReview, leaveCategory: value, leaveReason: reasons[value] || '' });
                  }} className="w-full bg-[#F1F5F9] border border-slate-300 rounded-lg px-3 py-2">
                    <option value="">কারণ নির্বাচন করুন</option>
                    <option value="personal">নিজ প্রয়োজনে / অফিস পরিবর্তন</option><option value="rent">ভাড়া বা অতিরিক্ত চার্জ</option><option value="landlord">বাড়িওয়ালার আচরণ</option><option value="utility">গ্যাস / পানি / বিদ্যুৎ সমস্যা</option><option value="security">নিরাপত্তা সমস্যা</option><option value="dispute">বাড়িওয়ালার সঙ্গে বিরোধ</option><option value="other">অন্যান্য কারণ</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    বিস্তারিত অভিজ্ঞতা *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="বাড়িওয়ালার ব্যবহার, গ্যাস-পানি কেমন..."
                    value={newReview.reviewText}
                    onChange={(e) => setNewReview({ ...newReview, reviewText: e.target.value })}
                    className="w-full bg-[#F1F5F9] border border-slate-300 rounded-lg p-3 text-base sm:text-lg leading-relaxed"
                  />
                </div>
              </div>

              <div className="sticky bottom-0 mt-auto pt-2 flex items-center justify-end gap-2 border-t border-slate-200 bg-[#F1F5F9] -mx-5 -mb-5 p-4">
                <button
                  type="button"
                  onClick={() => setIsWriteModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-200 cursor-pointer"
                >
                  {t.cancelBtn}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg text-xs font-bold bg-slate-900 hover:bg-emerald-700 text-white cursor-pointer"
                >
                  {t.submitBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="bg-slate-950 text-slate-300 border-t border-slate-800 py-12 px-4 sm:px-6 mt-16">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 pb-10 border-b border-slate-800">
          {/* Brand Col */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <BariwalaBrandIcon className="w-8 h-8" />
              <span className="font-extrabold text-lg text-white tracking-tight">
                {t.brandName}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              ঢাকা ও চট্টগ্রাম শহরের ভাড়াটিয়াদের জন্য বাড়িওয়ালা ও বাসা যাচাইয়ের সবচেয়ে বিশ্বস্ত ট্রাস্ট প্ল্যাটফর্ম।
            </p>
          </div>

          {/* Connected with Us */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              আমাদের সাথে যুক্ত থাকুন
            </h4>
            <div className="flex flex-col gap-2 text-xs">
              <a
                href="https://www.facebook.com/share/1KBZ19ayXg/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-slate-300 hover:text-emerald-400 transition"
              >
                <Facebook className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Facebook Page</span>
              </a>
              <a
                href="https://www.facebook.com/share/g/19quPGwZnD/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-slate-300 hover:text-emerald-400 transition"
              >
                <Users className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Community</span>
              </a>
            </div>
          </div>

          {/* Quick Note */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              নিরাপত্তা ও গোপনীয়তা
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              সকল রিভিউ ও মন্তব্য সম্পূর্ণ এনক্রিপটেড ও নিরাপদ। কারো ব্যক্তিগত গোপনীয়তা লঙ্ঘন করা হয় না।
            </p>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="max-w-5xl mx-auto pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            © {new Date().getFullYear()} {t.brandName}. All rights reserved.
          </div>
          <div className="flex flex-wrap items-center justify-center gap-1.5 font-medium text-slate-300 text-center">
            <span>Developed by</span>
            <a
              href="https://www.linkedin.com/in/hellominhaj/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-emerald-400 hover:underline"
            >
              Md Minhajul Islam
            </a>
            <span>&amp;</span>
            <a
              href="https://www.linkedin.com/in/abdur-rahman-fahim-43ab741bb/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-emerald-400 hover:underline"
            >
              Abdur Rahman Fahim
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}