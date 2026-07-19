import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import Toast from '../components/Toast';
import MapModule from '../components/MapModule';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  ArcElement,
  PointElement,
  LineElement,
  Title as ChartTitle, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { 
  Building2, 
  LayoutDashboard, 
  FileEdit, 
  History, 
  Bell, 
  User as UserIcon, 
  Settings as SettingsIcon, 
  LogOut,
  Search,
  Menu,
  X,
  ShieldAlert,
  Clock,
  CheckCircle,
  AlertCircle,
  MapPin,
  Camera,
  ChevronRight,
  TrendingUp,
  Award,
  Vote
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Register Chart.js elements
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  ChartTitle,
  Tooltip,
  Legend
);

const CitizenDashboard = () => {
  const { user, token, logout } = useAuth();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  // Issues and stats state
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0 });

  // Form State for reporting issue
  const [reportForm, setReportForm] = useState({
    title: '',
    category: 'Water Supply',
    description: '',
    priority: 'medium',
    address: '',
    lat: 12.9716,
    lng: 77.5946,
    photoUrl: '',
    anonymous: false,
    isDraft: false
  });
  const [submittingReport, setSubmittingReport] = useState(false);

  // Search filter for history table
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // View details modal
  const [selectedIssue, setSelectedIssue] = useState(null);

  // Voice Assistant states
  const [showVoiceAssistant, setShowVoiceAssistant] = useState(false);
  const [voiceLang, setVoiceLang] = useState('en-US'); // 'en-US', 'hi-IN', 'ta-IN'
  const [isRecording, setIsRecording] = useState(false);
  const [transcriptText, setTranscriptText] = useState('');
  const [voiceProcessing, setVoiceProcessing] = useState(false);
  const recognitionRef = useRef(null);

  // Feedback states
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');

  // Notifications live state
  const [notifications, setNotifications] = useState([]);

  const triggerToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
  };

 const response = await fetch('/api/issues', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

if (!response.ok) {
  throw new Error(`HTTP ${response.status}`);
}

const data = await response.json();

if (data.success) {
  const myIssues = data.data.filter(issue => {
    const reporterId = issue.reporter?._id || issue.reporter;
    const currentUserId = user._id || user.id;
    return reporterId === currentUserId;
  });

  setIssues(myIssues);

  const counts = {
    total: myIssues.length,
    pending: 0,
    inProgress: 0,
    resolved: 0
  };

  myIssues.forEach(i => {
    if (i.status === 'pending') counts.pending++;
    else if (i.status === 'in-progress') counts.inProgress++;
    else if (i.status === 'resolved') counts.resolved++;
  });

  setStats(counts);
}
    const issuePayload = {
      title: reportForm.title,
      category: reportForm.category,
      description: reportForm.description,
      priority: reportForm.priority,
      location: {
        lat: parseFloat(mockLat),
        lng: parseFloat(mockLng),
        address: reportForm.address
      },
      photoUrl: reportForm.photoUrl || 'https://images.unsplash.com/photo-1584467541268-b040f83be3fd?q=80&w=600&auto=format&fit=crop',
      anonymous: reportForm.anonymous,
      isDraft: asDraft
    };

    try {
      const response = await fetch('/api/issues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(issuePayload)
      });
      const data = await response.json();
      if (data.success) {
        triggerToast('Civic complaint registered successfully!');
        setReportForm({
          title: '',
          category: 'Water Supply',
          description: '',
          priority: 'medium',
          address: '',
          lat: 12.9716,
          lng: 77.5946,
          photoUrl: '',
          anonymous: false,
          isDraft: false
        });
        // Switch to history or main tab
        setActiveTab('history');
        fetchIssues();
      } else {
        triggerToast(data.message || 'Submission failed', 'error');
      }
    } catch (err) {
      triggerToast('Server connection failed', 'error');
    } finally {
      setSubmittingReport(false);
    }
  };

  const handleUpvote = async (issueId) => {
    try {
      const response = await fetch(`/api/issues/${issueId}/upvote`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        triggerToast('Upvote state toggled');
        fetchIssues();
        if (selectedIssue && selectedIssue._id === issueId) {
          // Sync modal details if open
          setSelectedIssue(data.data);
        }
      }
    } catch (err) {
      triggerToast('Upvote registration failed', 'error');
    }
  };

  const handleMarkNotificationsRead = async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        triggerToast('All notifications marked as read');
        fetchNotifications();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Voice report handlers
  const startVoiceRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      triggerToast('Speech Recognition not supported in this browser. Running simulation.', 'info');
      simulateRecording();
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = voiceLang;

    rec.onstart = () => {
      setIsRecording(true);
      setTranscriptText('');
    };

    rec.onerror = (e) => {
      console.error(e);
      triggerToast('Speech recognition error. Running simulation.', 'info');
      simulateRecording();
    };

    rec.onend = () => {
      setIsRecording(false);
    };

    rec.onresult = (event) => {
      let interim = '';
      let finalStr = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalStr += event.results[i][0].transcript + ' ';
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      setTranscriptText(prev => (prev + finalStr).trim() || interim);
    };

    recognitionRef.current = rec;
    rec.start();
  };

  const stopVoiceRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsRecording(false);
  };

  const simulateRecording = () => {
    setIsRecording(true);
    setTranscriptText('Listening...');
    setTimeout(() => {
      let sampleText = '';
      if (voiceLang === 'ta-IN') {
        sampleText = 'மகாத்மா காந்தி சாலையில் தெருவிளக்குகள் எரியவில்லை. இதனால் இரவு நேரத்தில் மக்கள் செல்ல பயப்படுகிறார்கள்.';
      } else if (voiceLang === 'hi-IN') {
        sampleText = 'यहाँ सेक्टर ४ में कचरा जमा हो गया है और बहुत बदबू आ रही है।';
      } else {
        sampleText = 'There is a deep pothole right under the Ring Road Metro Station pillar 24. It is causing traffic jams and is dangerous.';
      }
      setTranscriptText(sampleText);
      setIsRecording(false);
    }, 3000);
  };

  const handleVoiceSubmit = async () => {
    if (!transcriptText || transcriptText === 'Listening...') {
      triggerToast('Please speak or provide a transcript', 'error');
      return;
    }

    setVoiceProcessing(true);

    try {
      const response = await fetch('/api/issues/voice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          transcript: transcriptText,
          language: voiceLang === 'ta-IN' ? 'Tamil' : voiceLang === 'hi-IN' ? 'Hindi' : 'English',
          address: reportForm.address || 'Smart City Command Grid'
        })
      });
      const data = await response.json();
      if (data.success) {
        triggerToast('AI voice report processed and complaint created successfully!');
        setShowVoiceAssistant(false);
        setTranscriptText('');
        setActiveTab('history');
        fetchIssues();
        fetchNotifications();
      } else {
        triggerToast(data.message || 'Failed to submit voice report', 'error');
      }
    } catch (err) {
      triggerToast('Server connection failed', 'error');
    } finally {
      setVoiceProcessing(false);
    }
  };

  // Citizen feedback submitter
  const handleFeedbackSubmit = async () => {
    try {
      const response = await fetch(`/api/issues/${selectedIssue._id}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating: feedbackRating, comment: feedbackComment })
      });
      const data = await response.json();
      if (data.success) {
        triggerToast('Feedback submitted. Recalculating Civic Health Score!');
        setSelectedIssue(data.data);
        setFeedbackComment('');
        fetchIssues();
      } else {
        triggerToast(data.message || 'Failed to submit review', 'error');
      }
    } catch (err) {
      triggerToast('Server connection failed', 'error');
    }
  };

  // Chart configuration data
  const categoryStats = {
    'Water Supply': 0,
    'Roads & Potholes': 0,
    'Electricity': 0,
    'Garbage & Sanitation': 0,
    'Streetlights': 0,
    'Traffic & Public Transport': 0,
    'Others': 0
  };
  issues.forEach(i => {
    if (categoryStats[i.category] !== undefined) categoryStats[i.category]++;
  });

  const chartCategoriesData = {
    labels: Object.keys(categoryStats),
    datasets: [
      {
        label: 'Issues Reported',
        data: Object.values(categoryStats),
        backgroundColor: [
          'rgba(59, 130, 246, 0.7)',
          'rgba(239, 68, 68, 0.7)',
          'rgba(245, 158, 11, 0.7)',
          'rgba(16, 185, 129, 0.7)',
          'rgba(99, 102, 241, 0.7)',
          'rgba(236, 72, 153, 0.7)',
          'rgba(107, 114, 128, 0.7)',
        ],
        borderWidth: 0,
        borderRadius: 8
      }
    ]
  };

  const chartStatusData = {
    labels: ['Pending', 'In-Progress', 'Resolved'],
    datasets: [
      {
        data: [stats.pending, stats.inProgress, stats.resolved],
        backgroundColor: ['#F59E0B', '#3B82F6', '#10B981'],
        borderWidth: 0
      }
    ]
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { id: 'report', label: 'Report Issue', icon: <FileEdit className="h-5 w-5" /> },
    { id: 'history', label: 'Complaint History', icon: <History className="h-5 w-5" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="h-5 w-5" /> },
    { id: 'profile', label: 'My Profile', icon: <UserIcon className="h-5 w-5" /> },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon className="h-5 w-5" /> },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 transition-colors duration-300 dark:bg-slate-950 text-slate-800 dark:text-slate-100">
      
      {/* Sidebar - Desktop */}
      <aside className="hidden w-64 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 md:block">
        <div className="flex h-20 items-center gap-3 border-b border-slate-150 px-6 dark:border-slate-800">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-sans text-lg font-extrabold tracking-tight dark:text-white">CivicSync<span className="text-primary-600">AI</span></h2>
            <p className="text-[8px] font-bold uppercase tracking-widest text-slate-400">Citizen Command Hub</p>
          </div>
        </div>

        <nav className="space-y-1.5 p-4">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex w-full items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${activeTab === item.id ? 'bg-primary-600 text-white shadow-md shadow-primary-600/20' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'}`}
            >
              {item.icon} {item.label}
            </button>
          ))}
          
          <button
            onClick={logout}
            className="flex w-full items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-500/10 transition-all mt-8"
          >
            <LogOut className="h-5 w-5" /> Sign Out
          </button>
        </nav>
      </aside>

      {/* Main Body */}
      <div className="flex-1">
        
        {/* Top Navbar */}
        <header className="glass-nav sticky top-0 z-30 flex h-20 items-center justify-between px-6 shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-bold capitalize tracking-tight dark:text-white md:text-xl">
              {activeTab === 'dashboard' ? 'Overview' : activeTab.replace('-', ' ')}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden max-w-xs sm:block">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search complaints..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-48 rounded-xl border border-slate-200 bg-white/60 py-2 pl-9 pr-4 text-xs focus:border-primary-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900/60"
              />
            </div>
            
            <button onClick={() => setActiveTab('notifications')} className="relative rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
              <Bell className="h-5 w-5" />
              {notifications.filter(n => !n.isRead).length > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border-2 border-white dark:border-slate-900"></span>
                </span>
              )}
            </button>
            <ThemeToggle />

            {/* Profile Avatar Widget */}
            <div className="flex items-center gap-3 border-l border-slate-200 pl-4 dark:border-slate-800">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 font-extrabold text-primary-700 dark:bg-primary-950 dark:text-primary-300">
                {user ? user.name.charAt(0) : 'C'}
              </div>
              <div className="hidden text-left xl:block">
                <p className="text-xs font-bold dark:text-white">{user ? user.name : 'Citizen'}</p>
                <p className="text-[10px] font-semibold text-slate-400 capitalize">{user ? user.role : 'User'}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content container */}
        <main className="p-6 max-w-7xl mx-auto">
          {loading ? (
            <div className="flex h-96 items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-primary-600"></div>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                
                {/* 1. Dashboard Tab */}
                {activeTab === 'dashboard' && (
                  <div className="space-y-6">
                    {/* Stat Tiles */}
                    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                      {[
                        { count: stats.total, label: 'Total Complaints', icon: <ShieldAlert className="h-5 w-5 text-indigo-500" />, border: 'border-indigo-500/10' },
                        { count: stats.pending, label: 'Pending Response', icon: <Clock className="h-5 w-5 text-amber-500" />, border: 'border-amber-500/10' },
                        { count: stats.inProgress, label: 'In Progress', icon: <AlertCircle className="h-5 w-5 text-blue-500" />, border: 'border-blue-500/10' },
                        { count: stats.resolved, label: 'Resolved Issues', icon: <CheckCircle className="h-5 w-5 text-emerald-500" />, border: 'border-emerald-500/10' }
                      ].map((item, i) => (
                        <div key={i} className={`glass-card flex items-center justify-between rounded-2xl border p-5 shadow-sm`}>
                          <div>
                            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{item.label}</p>
                            <h3 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">{item.count}</h3>
                          </div>
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                            {item.icon}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Analytics Section */}
                    <div className="grid gap-6 lg:grid-cols-12">
                      <div className="glass-card rounded-2xl p-6 shadow-sm lg:col-span-8">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Complaints by Category</h3>
                        <div className="h-72">
                          {issues.length > 0 ? (
                            <Bar 
                              data={chartCategoriesData} 
                              options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { legend: { display: false } },
                                scales: { y: { ticks: { precision: 0 } } }
                              }} 
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-xs font-semibold text-slate-400">
                              No reported complaints found to display chart.
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="glass-card rounded-2xl p-6 shadow-sm lg:col-span-4">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Resolution Ratio</h3>
                        <div className="h-72 flex flex-col justify-center">
                          {issues.length > 0 ? (
                            <>
                              <div className="relative h-48">
                                <Pie 
                                  data={chartStatusData} 
                                  options={{ responsive: true, maintainAspectRatio: false }} 
                                />
                              </div>
                              <div className="mt-6 flex justify-around text-xs font-bold text-slate-500">
                                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500"></span> Pending</span>
                                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-blue-500"></span> Progress</span>
                                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500"></span> Resolved</span>
                              </div>
                            </>
                          ) : (
                            <div className="text-center text-xs font-semibold text-slate-400">
                              No data recorded.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Recent Complaints */}
                    <div className="glass-card rounded-2xl p-6 shadow-sm">
                      <div className="mb-6 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Recent Complaints</h3>
                        <button onClick={() => setActiveTab('history')} className="text-xs font-bold text-primary-600 hover:text-primary-700">
                          View All
                        </button>
                      </div>

                      <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {issues.slice(0, 3).map(issue => (
                          <div key={issue._id} className="flex flex-wrap items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                            <div>
                              <div className="flex items-center gap-3">
                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">{issue.category}</span>
                                <span className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold ${issue.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : issue.status === 'in-progress' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'}`}>
                                  {issue.status}
                                </span>
                              </div>
                              <h4 className="mt-1.5 text-sm font-bold text-slate-850 dark:text-slate-200">{issue.title}</h4>
                              <p className="mt-1 text-xs text-slate-450 dark:text-slate-400 flex items-center gap-1">
                                <MapPin className="h-3 w-3 shrink-0" /> {issue.location.address}
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <button 
                                onClick={() => handleUpvote(issue._id)}
                                className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-1.5 text-xs font-bold transition-all ${issue.upvotes?.includes(user?._id || user?.id) ? 'border-primary-600/30 bg-primary-600/10 text-primary-600' : 'border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400'}`}
                              >
                                <Vote className="h-3.5 w-3.5" /> Upvotes ({issue.upvotes?.length || 0})
                              </button>
                              <button 
                                onClick={() => setSelectedIssue(issue)}
                                className="rounded-xl bg-slate-100 px-3.5 py-1.5 text-xs font-semibold hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
                              >
                                View Details
                              </button>
                            </div>
                          </div>
                        ))}
                        {issues.length === 0 && (
                          <div className="py-8 text-center text-xs font-semibold text-slate-400">
                            No civic complaints submitted yet. Click "Report Issue" to file a report.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Report Issue Tab */}
                {activeTab === 'report' && (
                  <div className="max-w-2xl mx-auto glass-card rounded-2xl p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-lg font-bold dark:text-white">Submit New Civic Report</h2>
                      <button
                        type="button"
                        onClick={() => setShowVoiceAssistant(true)}
                        className="flex items-center gap-2 rounded-xl bg-primary-600/10 hover:bg-primary-600/20 px-4 py-2.5 text-xs font-bold text-primary-600 dark:text-primary-400 transition-all"
                      >
                        <svg className="h-4.5 w-4.5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                        Voice AI Report
                      </button>
                    </div>
                    
                    <form onSubmit={handleReportSubmit} className="space-y-5">
                      <div>
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Complaint Title</label>
                        <input
                          type="text"
                          required
                          value={reportForm.title}
                          onChange={(e) => setReportForm({ ...reportForm, title: e.target.value })}
                          className="mt-2 w-full rounded-xl border border-slate-200 bg-white/60 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900/60"
                          placeholder="e.g. Broken water pipeline leaking"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Category</label>
                          <select
                            value={reportForm.category}
                            onChange={(e) => setReportForm({ ...reportForm, category: e.target.value })}
                            className="mt-2 w-full rounded-xl border border-slate-200 bg-white/60 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900/60"
                          >
                            <option value="Water Supply">Water Supply</option>
                            <option value="Roads & Potholes">Roads & Potholes</option>
                            <option value="Electricity">Electricity</option>
                            <option value="Garbage & Sanitation">Garbage & Sanitation</option>
                            <option value="Streetlights">Streetlights</option>
                            <option value="Traffic & Public Transport">Traffic & Public Transport</option>
                            <option value="Others">Others</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Priority Level</label>
                          <select
                            value={reportForm.priority}
                            onChange={(e) => setReportForm({ ...reportForm, priority: e.target.value })}
                            className="mt-2 w-full rounded-xl border border-slate-200 bg-white/60 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900/60"
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="critical">Critical</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Detailed Description</label>
                        <textarea
                          rows={4}
                          required
                          value={reportForm.description}
                          onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                          className="mt-2 w-full rounded-xl border border-slate-200 bg-white/60 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900/60"
                          placeholder="Provide specific details e.g. ward, landmarks, exact damage type..."
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Exact Location Address</label>
                        <div className="relative mt-2 mb-4">
                          <MapPin className="absolute left-3 top-3 h-5 w-5 text-slate-450" />
                          <input
                            type="text"
                            required
                            value={reportForm.address}
                            onChange={(e) => setReportForm({ ...reportForm, address: e.target.value })}
                            className="w-full rounded-xl border border-slate-200 bg-white/60 py-3 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900/60"
                            placeholder="Enter street, area name, ward number"
                          />
                        </div>
                        <div className="h-64 rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800">
                          <MapModule
                            mode="select"
                            center={[reportForm.lat, reportForm.lng]}
                            zoom={13}
                            onSelectLocation={({ lat, lng, address }) => {
                              setReportForm(prev => ({
                                ...prev,
                                lat,
                                lng,
                                address
                              }));
                            }}
                            isDark={document.documentElement.classList.contains('dark')}
                          />
                        </div>
                        <p className="mt-1 text-[10px] text-slate-400 font-mono">Coordinates: {reportForm.lat.toFixed(4)}, {reportForm.lng.toFixed(4)}. Drag/Click map to position.</p>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Photo URL (Optional)</label>
                        <div className="relative mt-2">
                          <input
                            type="url"
                            value={reportForm.photoUrl}
                            onChange={(e) => setReportForm({ ...reportForm, photoUrl: e.target.value })}
                            className="w-full rounded-xl border border-slate-200 bg-white/60 py-3 pr-4 pl-4 text-sm focus:border-primary-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900/60"
                            placeholder="Paste image link (e.g. Unsplash URL)"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              triggerToast('Camera accessed successfully (mock)', 'info');
                              setReportForm({...reportForm, photoUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80'});
                            }}
                            className="absolute right-2 top-2 rounded-lg bg-slate-100 p-1.5 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                          >
                            <Camera className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="flex gap-4 items-center mb-6">
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 cursor-pointer">
                          <input type="checkbox" checked={reportForm.anonymous} onChange={(e) => setReportForm({...reportForm, anonymous: e.target.checked})} className="rounded text-primary-600 focus:ring-primary-500" />
                          Submit Anonymously
                        </label>
                      </div>
                      <div className="flex gap-4">
                        <button
                          type="button"
                          onClick={(e) => handleReportSubmit(e, true)}
                          disabled={submittingReport}
                          className="flex w-1/3 items-center justify-center gap-2 rounded-xl bg-slate-200 py-3.5 text-sm font-bold text-slate-700 hover:bg-slate-300 disabled:opacity-50 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                        >
                          Save Draft
                        </button>
                        <button
                          type="submit"
                          onClick={(e) => handleReportSubmit(e, false)}
                          disabled={submittingReport}
                          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary-600 py-3.5 text-sm font-bold text-white shadow-md hover:bg-primary-700 disabled:opacity-50"
                        >
                          {submittingReport ? (
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                          ) : (
                            'Submit Report to Smart City Core'
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* 3. Complaint History Tab */}
                {activeTab === 'history' && (
                  <div className="space-y-6">
                    {/* Filters Toolbar */}
                    <div className="flex flex-wrap items-center justify-between gap-4 glass-card rounded-2xl p-4 shadow-sm">
                      <div className="relative max-w-xs flex-1">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Filter history..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white/60 py-2 pl-9 pr-4 text-xs focus:border-primary-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900/60"
                        />
                      </div>
                      <div className="flex gap-3">
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="rounded-xl border border-slate-200 bg-white/60 px-4 py-2 text-xs focus:outline-none dark:border-slate-800 dark:bg-slate-900/60"
                        >
                          <option value="all">All Statuses</option>
                          <option value="pending">Pending</option>
                          <option value="in-progress">In-Progress</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </div>
                    </div>

                    {/* Table List */}
                    <div className="glass-card overflow-hidden rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-collapse">
                          <thead>
                            <tr className="border-b border-slate-100 bg-slate-100/50 dark:border-slate-800 dark:bg-slate-900/50 text-[11px] font-extrabold uppercase tracking-wider text-slate-450">
                              <th className="p-4">Complaint ID</th>
                              <th className="p-4">Title / Category</th>
                              <th className="p-4">Priority</th>
                              <th className="p-4">Status</th>
                              <th className="p-4">Submitted Date</th>
                              <th className="p-4 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {issues
                              .filter(issue => {
                                const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                                      issue.category.toLowerCase().includes(searchTerm.toLowerCase());
                                const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;
                                return matchesSearch && matchesStatus;
                              })
                              .map(issue => (
                                <tr key={issue._id} className="hover:bg-slate-100/10 transition-colors">
                                  <td className="p-4 font-mono text-xs">{issue._id.substring(0, 12)}</td>
                                  <td className="p-4">
                                    <p className="font-bold text-slate-900 dark:text-white">{issue.title}</p>
                                    <p className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase">{issue.category}</p>
                                  </td>
                                  <td className="p-4 capitalize">
                                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${issue.priority === 'critical' ? 'bg-red-500/10 text-red-500' : issue.priority === 'high' ? 'bg-orange-500/10 text-orange-500' : 'bg-slate-200 text-slate-600 dark:bg-slate-850 dark:text-slate-400'}`}>
                                      {issue.priority}
                                    </span>
                                  </td>
                                  <td className="p-4 capitalize">
                                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${issue.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-600' : issue.status === 'in-progress' ? 'bg-blue-500/10 text-blue-600' : 'bg-amber-500/10 text-amber-600'}`}>
                                      {issue.status}
                                    </span>
                                  </td>
                                  <td className="p-4 text-xs text-slate-400">{new Date(issue.createdAt).toLocaleDateString()}</td>
                                  <td className="p-4 text-right">
                                    <button 
                                      onClick={() => setSelectedIssue(issue)}
                                      className="rounded-lg bg-primary-600/10 px-3 py-1.5 text-xs font-bold text-primary-600 hover:bg-primary-600/20"
                                    >
                                      Inspect
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            {issues.length === 0 && (
                              <tr>
                                <td colSpan="6" className="p-8 text-center text-xs font-semibold text-slate-400">
                                  No records found.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Notifications Tab */}
                {activeTab === 'notifications' && (
                  <div className="max-w-2xl mx-auto space-y-4">
                    <div className="flex items-center justify-between glass-card rounded-2xl p-4 shadow-sm">
                      <span className="text-xs font-bold text-slate-450">Active Bulletins</span>
                      <button onClick={handleMarkNotificationsRead} className="text-xs font-bold text-primary-600 hover:text-primary-700">
                        Mark all as read
                      </button>
                    </div>

                    <div className="space-y-3">
                      {notifications.map(n => (
                        <div key={n.id} className={`glass-card rounded-2xl p-5 shadow-sm border-l-4 ${n.read ? 'border-l-slate-300 dark:border-l-slate-800' : 'border-l-primary-600'}`}>
                          <div className="flex justify-between items-start">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">{n.title}</h4>
                            <span className="text-[10px] font-semibold text-slate-400">{n.time}</span>
                          </div>
                          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{n.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. Profile Tab */}
                {activeTab === 'profile' && (
                  <div className="max-w-xl mx-auto glass-card rounded-2xl p-6 shadow-sm text-center">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary-100 font-extrabold text-primary-700 text-3xl dark:bg-primary-950 dark:text-primary-300">
                      {user ? user.name.charAt(0) : 'C'}
                    </div>
                    
                    <h2 className="mt-4 text-xl font-bold dark:text-white">{user?.name}</h2>
                    <p className="text-xs text-slate-400 capitalize">{user?.role} Profile Account</p>

                    <div className="mt-8 text-left space-y-4 border-t border-slate-100 pt-6 dark:border-slate-800">
                      <div className="flex justify-between py-2 border-b border-slate-50 dark:border-slate-850">
                        <span className="text-xs font-semibold text-slate-400">Account ID</span>
                        <span className="text-xs font-mono font-bold">{user?.id || user?._id}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-50 dark:border-slate-850">
                        <span className="text-xs font-semibold text-slate-400">Email Address</span>
                        <span className="text-xs font-bold">{user?.email}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-50 dark:border-slate-850">
                        <span className="text-xs font-semibold text-slate-400">Mobile Number</span>
                        <span className="text-xs font-bold">+91 {user?.phone}</span>
                      </div>
  <div className="py-2">
  <span className="text-xs font-semibold text-slate-400">
    Aadhaar Verification (Optional)
  </span>

  <input
    type="text"
    maxLength={12}
    placeholder="Enter 12-digit Aadhaar Number"
    className="w-full mt-2 p-2 border rounded-lg dark:bg-slate-800 dark:text-white"
  />

  <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg">
    Send OTP
  </button>

  <input
    type="text"
    maxLength={6}
    placeholder="Enter 6-digit OTP"
    className="w-full mt-3 p-2 border rounded-lg dark:bg-slate-800 dark:text-white"
  />

  <button className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg">
    Verify OTP
  </button>

  <p className="mt-3 text-sm text-yellow-500">
    Status: Not Verified
  </p>
</div>
                    </div>
                  </div>
                )}
                {/* 6. Settings Tab */}
                {activeTab === 'settings' && (
                  <div className="max-w-xl mx-auto glass-card rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold mb-6 dark:text-white">Security & Settings</h3>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-850">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Push Notifications</h4>
                          <p className="text-[11px] text-slate-400">Recieve instant SMS alerts for issue resolution changes</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" defaultChecked className="sr-only peer" />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-primary-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-850">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">High Contrast Map</h4>
                          <p className="text-[11px] text-slate-400">Enable high contrast borders on GIS tracking maps</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-primary-600"></div>
                        </label>
                      </div>

                      <button 
                        onClick={() => triggerToast('Preferences saved successfully')}
                        className="w-full rounded-xl bg-primary-600 py-3 text-sm font-bold text-white hover:bg-primary-700 shadow-md"
                      >
                        Save Configuration
                      </button>
                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          )}
        </main>
      </div>

      {/* Mobile Sidebar Modal overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black md:hidden"
            />
            <motion.div 
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed bottom-0 top-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 p-6 md:hidden shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-150 pb-5 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <h3 className="font-sans text-base font-extrabold tracking-tight dark:text-white">CivicSync<span className="text-primary-600">AI</span></h3>
                </div>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-full p-1 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="space-y-1 mt-6">
                {menuItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-xs font-semibold ${activeTab === item.id ? 'bg-primary-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'}`}
                  >
                    {item.icon} {item.label}
                  </button>
                ))}
                
                <button
                  onClick={logout}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-xs font-semibold text-red-500 hover:bg-red-500/10 mt-6"
                >
                  <LogOut className="h-5 w-5" /> Sign Out
                </button>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      
      {/* Voice Assistant Modal */}
      <AnimatePresence>
        {showVoiceAssistant && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} exit={{ opacity: 0 }}
              onClick={() => { stopVoiceRecording(); setShowVoiceAssistant(false); }}
              className="fixed inset-0 z-40 bg-slate-900 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-x-4 top-1/4 z-50 mx-auto max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900 border border-primary-500/20"
            >
              <div className="bg-gradient-to-r from-primary-600 to-indigo-600 p-6 text-center text-white relative">
                <button onClick={() => { stopVoiceRecording(); setShowVoiceAssistant(false); }} className="absolute right-4 top-4 rounded-full bg-white/20 p-1 hover:bg-white/30"><X className="h-5 w-5"/></button>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-md shadow-inner mb-4">
                  <svg className={`h-8 w-8 text-white ${isRecording || voiceProcessing ? 'animate-pulse' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                </div>
                <h3 className="text-lg font-bold">Smart City AI Voice Engine</h3>
                <p className="text-xs opacity-80 mt-1">Report civic issues in your preferred language</p>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="text-xs font-bold text-slate-500">Select Language</label>
                  <select value={voiceLang} onChange={(e) => setVoiceLang(e.target.value)} disabled={isRecording || voiceProcessing} className="w-full mt-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:outline-none dark:border-slate-800 dark:bg-slate-800">
                    <option value="en-US">English</option>
                    <option value="hi-IN">Hindi (हिंदी)</option>
                    <option value="ta-IN">Tamil (தமிழ்)</option>
                  </select>
                </div>

                <div className="min-h-[100px] p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex flex-col justify-center text-center">
                  {transcriptText ? (
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed">"{transcriptText}"</p>
                  ) : (
                    <p className="text-xs font-semibold text-slate-400">Press the microphone and start speaking to describe the civic issue...</p>
                  )}
                </div>

                <div className="flex gap-4">
                  {!isRecording ? (
                    <button onClick={simulateRecording} disabled={voiceProcessing} className="flex-1 rounded-xl bg-slate-800 py-3 text-sm font-bold text-white shadow-md hover:bg-slate-900 flex items-center justify-center gap-2 disabled:opacity-50 dark:bg-slate-700">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg> Start Recording
                    </button>
                  ) : (
                    <button onClick={stopVoiceRecording} className="flex-1 rounded-xl bg-red-500 py-3 text-sm font-bold text-white shadow-md hover:bg-red-600 flex items-center justify-center gap-2">
                      <div className="h-3 w-3 rounded-sm bg-white"></div> Stop Recording
                    </button>
                  )}
                  
                  <button onClick={handleVoiceSubmit} disabled={isRecording || voiceProcessing || !transcriptText || transcriptText === 'Listening...'} className="flex-1 rounded-xl bg-primary-600 py-3 text-sm font-bold text-white shadow-md hover:bg-primary-700 flex items-center justify-center gap-2 disabled:opacity-50">
                    {voiceProcessing ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div> : 'Submit Report'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>


      {/* Inspect Issue Modal */}
      <AnimatePresence>
        {selectedIssue && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedIssue(null)}
              className="fixed inset-0 z-40 bg-black"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-4 top-10 bottom-10 z-50 mx-auto max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 md:p-8"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">{selectedIssue.category}</span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">{selectedIssue.title}</h3>
                </div>
                <button 
                  onClick={() => setSelectedIssue(null)}
                  className="rounded-full p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="mt-6 space-y-6">
                
                {/* Photo if exists */}
                {selectedIssue.photoUrl && (
                  <div className="overflow-hidden rounded-2xl h-48 w-full bg-slate-100 dark:bg-slate-850">
                    <img 
                      src={selectedIssue.photoUrl} 
                      alt="Civic Issue Proof" 
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="rounded-xl bg-slate-50 p-3.5 dark:bg-slate-850">
                    <h4 className="font-semibold text-slate-400 uppercase tracking-wider">Reported Status</h4>
                    <p className="mt-1.5 font-bold capitalize text-slate-850 dark:text-slate-200">{selectedIssue.status}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3.5 dark:bg-slate-850">
                    <h4 className="font-semibold text-slate-400 uppercase tracking-wider">Priority Level</h4>
                    <p className="mt-1.5 font-bold capitalize text-slate-850 dark:text-slate-200">{selectedIssue.priority}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Problem Description</h4>
                  <p className="mt-2 text-xs leading-relaxed text-slate-650 dark:text-slate-350 bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl">
                    {selectedIssue.description}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">GIS Location Address</h4>
                  <p className="mt-2 text-xs text-slate-650 dark:text-slate-350 flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 shrink-0 text-red-500" /> {selectedIssue.location.address}
                  </p>
                  <p className="mt-1 text-[10px] text-slate-400 font-mono ml-5">
                    GPS: {selectedIssue.location.lat}, {selectedIssue.location.lng}
                  </p>
                </div>

                
{/* AI Metadata */}
                {selectedIssue.aiMetadata && selectedIssue.aiMetadata.confidenceScore > 0 && (
                  <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-2xl border border-primary-100 dark:border-primary-900/50">
                    <h4 className="text-[10px] font-extrabold text-primary-600 uppercase tracking-wider mb-2 flex items-center gap-1.5"><TrendingUp className="h-3.5 w-3.5" /> AI Classification Engine</h4>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Confidence Score</span>
                      <span className="text-xs font-bold text-primary-700 dark:text-primary-400">{selectedIssue.aiMetadata.confidenceScore}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 mb-3">
                      <div className="bg-primary-500 h-1.5 rounded-full" style={{ width: `${selectedIssue.aiMetadata.confidenceScore}%` }}></div>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Image AI: {selectedIssue.aiMetadata.imageAnalysis}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1">Priority AI: {selectedIssue.aiMetadata.priorityReasoning}</p>
                  </div>
                )}


                {/* Resolution Proof & Feedback */}
                {selectedIssue.status === 'resolved' && (
                  <div className="mt-6 border-t border-slate-100 dark:border-slate-800 pt-6">
                    {selectedIssue.resolutionProof && selectedIssue.resolutionProof.photoUrl && (
                      <div className="mb-6">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Officer's Resolution Proof</h4>
                        <div className="overflow-hidden rounded-2xl h-48 w-full bg-slate-100 dark:bg-slate-850 border border-emerald-500/20">
                          <img src={selectedIssue.resolutionProof.photoUrl} alt="Resolution Proof" className="h-full w-full object-cover" />
                        </div>
                      </div>
                    )}

                    {selectedIssue.feedback && selectedIssue.feedback.rating > 0 ? (
                      <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                        <h4 className="text-[10px] font-extrabold text-amber-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">Your Feedback</h4>
                        <div className="flex items-center gap-1 mb-2">
                          {[1,2,3,4,5].map(star => (
                            <svg key={star} className={`w-4 h-4 ${star <= selectedIssue.feedback.rating ? 'text-amber-500' : 'text-slate-300 dark:text-slate-600'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                          ))}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">"{selectedIssue.feedback.comment}"</p>
                      </div>
                    ) : (
                      <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-3">Rate Resolution</h4>
                        <div className="flex gap-2 mb-3">
                          {[1,2,3,4,5].map(star => (
                            <button key={star} type="button" onClick={() => setFeedbackRating(star)}>
                              <svg className={`w-6 h-6 ${star <= feedbackRating ? 'text-amber-500' : 'text-slate-300 dark:text-slate-600'} hover:scale-110 transition-transform`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                            </button>
                          ))}
                        </div>
                        <textarea
                          placeholder="Leave a comment (optional)..."
                          value={feedbackComment}
                          onChange={(e) => setFeedbackComment(e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-200 bg-white dark:bg-slate-900 p-3 mb-3 focus:border-amber-500 focus:outline-none dark:border-slate-700"
                        />
                        <button onClick={handleFeedbackSubmit} className="w-full bg-amber-500 text-white font-bold text-xs py-2 rounded-xl hover:bg-amber-600 transition-colors">Submit Civic Feedback</button>
                      </div>
                    )}
                  </div>
                )}


                
                {/* Timeline Visualization */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Inspection Timeline</h4>
                  <div className="space-y-4 border-l-2 border-slate-100 pl-4 dark:border-slate-800 ml-2">
                    {selectedIssue.timeline?.map((step, idx) => (
                      <div key={idx} className="relative">
                        <span className={`absolute -left-[23px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-slate-900 ${step.status === 'resolved' ? 'bg-emerald-500' : step.status === 'in-progress' ? 'bg-blue-500' : 'bg-amber-500'}`}></span>
                        <div className="flex justify-between items-start text-xs">
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white capitalize">{step.status}</p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{step.remarks}</p>
                          </div>
                          <div className="text-[10px] font-semibold text-slate-400 text-right">
                            <p>{step.updatedBy}</p>
                            <p className="text-[9px] mt-0.5">{new Date(step.updatedAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="mt-8 flex justify-end border-t border-slate-100 pt-4 dark:border-slate-800 gap-3">
                <button 
                  onClick={() => handleUpvote(selectedIssue._id)}
                  className={`flex items-center gap-1.5 rounded-xl border px-5 py-2 text-xs font-bold transition-all ${selectedIssue.upvotes?.includes(user?._id || user?.id) ? 'border-primary-600/30 bg-primary-600/10 text-primary-600' : 'border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400'}`}
                >
                  <Vote className="h-4 w-4" /> Upvote Complaint ({selectedIssue.upvotes?.length || 0})
                </button>
                <button
                  onClick={() => setSelectedIssue(null)}
                  className="rounded-xl bg-slate-100 px-5 py-2 text-xs font-semibold hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Global Toasts */}
      <AnimatePresence>
        {toastMessage && (
          <Toast 
            message={toastMessage} 
            type={toastType} 
            onClose={() => setToastMessage('')} 
          />
        )}
      </AnimatePresence>

    </div>
  );
};

export default CitizenDashboard;
