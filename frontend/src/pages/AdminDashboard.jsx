import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import Toast from '../components/Toast';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  ArcElement,
  Title as ChartTitle, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { 
  Building2, 
  LayoutDashboard, 
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
  ClipboardCheck,
  ChevronRight,
  TrendingUp,
  UserCheck,
  Building,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, ChartTitle, Tooltip, Legend);

const AdminDashboard = () => {
  const { user, token, logout } = useAuth();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const [issues, setIssues] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, unassigned: 0, inProgress: 0, resolved: 0 });

  // Assignment states
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [assignedOfficerId, setAssignedOfficerId] = useState('');
  const [submittingAssignment, setSubmittingAssignment] = useState(false);

  // Search filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [analyticsData, setAnalyticsData] = useState(null);

  const triggerToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
  };

  const fetchIssues = async () => {
    try {
      const response = await fetch('/api/issues', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setIssues(data.data);
        
        // Calculate stats
        const counts = { total: data.data.length, unassigned: 0, inProgress: 0, resolved: 0 };
        data.data.forEach(i => {
          if (!i.assignedOfficer) counts.unassigned++;
          if (i.status === 'in-progress') counts.inProgress++;
          else if (i.status === 'resolved') counts.resolved++;
        });
        setStats(counts);
      }
    } catch (err) {
      console.error(err);
      triggerToast('Failed to retrieve system complaints database', 'error');
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/issues/predictive-maintenance', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setAnalyticsData(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOfficers = async () => {
    try {
      const response = await fetch('/api/users/officers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setOfficers(data.data);
      }
    } catch (err) {
      console.error(err);
      triggerToast('Failed to load registered department officers list', 'error');
    }
  };

  useEffect(() => {
    const init = async () => {
      if (token && user) {
        setLoading(true);
        await Promise.all([fetchIssues(), fetchOfficers(), fetchAnalytics()]);
        setLoading(false);
      }
    };
    init();
  }, [token, user]);

  
  const handleMergeDuplicate = async (duplicateId, masterId) => {
    try {
      const response = await fetch(`/api/issues/${duplicateId}/merge`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ targetIssueId: masterId })
      });
      const data = await response.json();
      if (data.success) {
        triggerToast('Duplicate complaint successfully merged and closed.', 'success');
        setSelectedIssue(null);
        fetchIssues();
      } else {
        triggerToast(data.message || 'Failed to merge complaints', 'error');
      }
    } catch (err) {
      triggerToast('Server connection failed', 'error');
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedIssue || !assignedOfficerId) {
      triggerToast('Please select a valid department officer', 'error');
      return;
    }

    setSubmittingAssignment(true);

    try {
      const response = await fetch(`/api/issues/${selectedIssue._id}/assign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ officerId: assignedOfficerId })
      });
      const data = await response.json();
      if (data.success) {
        triggerToast('Officer assigned and dispatched successfully!');
        setAssignedOfficerId('');
        setSelectedIssue(null);
        fetchIssues();
      } else {
        triggerToast(data.message || 'Failed to dispatch officer', 'error');
      }
    } catch (err) {
      triggerToast('Server connection failed', 'error');
    } finally {
      setSubmittingAssignment(false);
    }
  };

  // Chart configuration
  const categoryCounts = {
    'Water Supply': 0,
    'Roads & Potholes': 0,
    'Electricity': 0,
    'Garbage & Sanitation': 0,
    'Streetlights': 0,
    'Traffic & Public Transport': 0,
    'Others': 0
  };
  issues.forEach(i => {
    if (categoryCounts[i.category] !== undefined) categoryCounts[i.category]++;
  });

  const chartCategoriesData = {
    labels: Object.keys(categoryCounts),
    datasets: [
      {
        label: 'Global Incidents',
        data: Object.values(categoryCounts),
        backgroundColor: 'rgba(37, 99, 235, 0.75)',
        borderWidth: 0,
        borderRadius: 8
      }
    ]
  };

  const chartStatusData = {
    labels: ['Awaiting Dispatch', 'In-Progress', 'Resolved'],
    datasets: [
      {
        data: [stats.unassigned, stats.inProgress, stats.resolved],
        backgroundColor: ['#EF4444', '#3B82F6', '#10B981'],
        borderWidth: 0
      }
    ]
  };

  const menuItems = [
    { id: 'dashboard', label: 'Command Center', icon: <LayoutDashboard className="h-5 w-5" /> },
    { id: 'dispatch', label: 'Dispatch Queue', icon: <Activity className="h-5 w-5" /> },
    { id: 'analytics', label: 'Predictive Analytics', icon: <TrendingUp className="h-5 w-5" /> },
    { id: 'officers', label: 'Department Officers', icon: <Building className="h-5 w-5" /> },
    { id: 'profile', label: 'Administrator Info', icon: <UserIcon className="h-5 w-5" /> },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 transition-colors duration-300 dark:bg-slate-950 text-slate-800 dark:text-slate-100">
      
      {/* Sidebar - Desktop */}
      <aside className="hidden w-64 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 md:block">
        <div className="flex h-20 items-center gap-3 border-b border-slate-150 px-6 dark:border-slate-800">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-white">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-sans text-lg font-extrabold tracking-tight dark:text-white">CivicSync<span className="text-primary-600">AI</span></h2>
            <p className="text-[8px] font-bold uppercase tracking-widest text-slate-400">Admin Control Console</p>
          </div>
        </div>

        <nav className="space-y-1.5 p-4 mt-6">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex w-full items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${activeTab === item.id ? 'bg-accent text-white shadow-md' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'}`}
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
        
        {/* Top Header */}
        <header className="glass-nav sticky top-0 z-30 flex h-20 items-center justify-between px-6 shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-bold capitalize tracking-tight dark:text-white md:text-xl">
              {activeTab === 'dashboard' ? 'Command Center Overview' : activeTab}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden max-w-xs sm:block">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Database lookup..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-48 rounded-xl border border-slate-200 bg-white/60 py-2 pl-9 pr-4 text-xs focus:border-accent focus:outline-none dark:border-slate-800 dark:bg-slate-900/60"
              />
            </div>
            
            <ThemeToggle />

            {/* Profile Avatar Widget */}
            <div className="flex items-center gap-3 border-l border-slate-200 pl-4 dark:border-slate-800">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 font-extrabold text-slate-800 dark:bg-slate-850 dark:text-slate-350">
                {user ? user.name.charAt(0) : 'A'}
              </div>
              <div className="hidden text-left xl:block">
                <p className="text-xs font-bold dark:text-white">{user ? user.name : 'Administrator'}</p>
                <p className="text-[10px] font-semibold text-slate-450 uppercase">Super Admin</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content container */}
        <main className="p-6 max-w-7xl mx-auto">
          {loading ? (
            <div className="flex h-96 items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800"></div>
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
                
                {/* 1. Command Center Tab */}
                {activeTab === 'dashboard' && (
                  <div className="space-y-6">
                    {/* Stat Tiles */}
                    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                      {[
                        { count: stats.total, label: 'Global Complaints', icon: <ShieldAlert className="h-5 w-5 text-indigo-500" /> },
                        { count: stats.unassigned, label: 'Unassigned Incidents', icon: <Clock className="h-5 w-5 text-red-500" /> },
                        { count: stats.inProgress, label: 'Active Resolutions', icon: <AlertCircle className="h-5 w-5 text-blue-500" /> },
                        { count: stats.resolved, label: 'Resolved Tickets', icon: <CheckCircle className="h-5 w-5 text-emerald-500" /> }
                      ].map((item, i) => (
                        <div key={i} className="glass-card flex items-center justify-between rounded-2xl border border-slate-100 p-5 shadow-sm dark:border-slate-800">
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
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Incident Categories</h3>
                        <div className="h-72">
                          <Bar 
                            data={chartCategoriesData} 
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: { legend: { display: false } },
                              scales: { y: { ticks: { precision: 0 } } }
                            }} 
                          />
                        </div>
                      </div>

                      <div className="glass-card rounded-2xl p-6 shadow-sm lg:col-span-4">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Status Distribution</h3>
                        <div className="h-72 flex flex-col justify-center">
                          <div className="relative h-48">
                            <Pie data={chartStatusData} options={{ responsive: true, maintainAspectRatio: false }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Dispatch Queue Shortcut */}
                    <div className="glass-card rounded-2xl p-6 shadow-sm">
                      <div className="mb-6 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Awaiting Officer Dispatch</h3>
                        <button onClick={() => setActiveTab('dispatch')} className="text-xs font-bold text-primary-600 hover:text-primary-700">
                          Inspect Queue
                        </button>
                      </div>

                      <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {issues
                          .filter(i => !i.assignedOfficer)
                          .slice(0, 3)
                          .map(issue => (
                            <div key={issue._id} className="flex flex-wrap items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                              <div>
                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">{issue.category}</span>
                                <h4 className="mt-1 text-sm font-bold text-slate-850 dark:text-slate-200">{issue.title}</h4>
                              </div>
                              
                              <button 
                                onClick={() => setSelectedIssue(issue)}
                                className="rounded-xl bg-accent px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-slate-800"
                              >
                                Assign Officer
                              </button>
                            </div>
                          ))}
                        {issues.filter(i => !i.assignedOfficer).length === 0 && (
                          <div className="py-6 text-center text-xs font-semibold text-slate-400">
                            No unassigned issues. Dispatch queue clear!
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Dispatch queue Tab */}
                {activeTab === 'dispatch' && (
                  <div className="space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-4 glass-card rounded-2xl p-4 shadow-sm">
                      <div className="relative max-w-xs flex-1">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Filter reports..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white/60 py-2 pl-9 pr-4 text-xs focus:border-accent focus:outline-none dark:border-slate-800 dark:bg-slate-900/60"
                        />
                      </div>
                      <div>
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="rounded-xl border border-slate-200 bg-white/60 px-4 py-2 text-xs focus:outline-none dark:border-slate-800 dark:bg-slate-900/60"
                        >
                          <option value="all">All Statuses</option>
                          <option value="unassigned">Awaiting Dispatch</option>
                          <option value="in-progress">In-Progress</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </div>
                    </div>

                    <div className="glass-card overflow-hidden rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-collapse">
                          <thead>
                            <tr className="border-b border-slate-100 bg-slate-100/50 dark:border-slate-800 dark:bg-slate-900/50 text-[11px] font-extrabold uppercase tracking-wider text-slate-450">
                              <th className="p-4">Incident ID</th>
                              <th className="p-4">Category & Title</th>
                              <th className="p-4">Assigned Officer</th>
                              <th className="p-4">Status</th>
                              <th className="p-4 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {issues
                              .filter(issue => {
                                const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase());
                                const matchesStatus = statusFilter === 'all' || 
                                                      (statusFilter === 'unassigned' && !issue.assignedOfficer) ||
                                                      (issue.status === statusFilter);
                                return matchesSearch && matchesStatus;
                              })
                              .map(issue => (
                                <tr key={issue._id} className="hover:bg-slate-100/10 transition-colors">
                                  <td className="p-4 font-mono text-xs">{issue._id.substring(0, 12)}</td>
                                  <td className="p-4">
                                    <p className="font-bold text-slate-900 dark:text-white">{issue.title}</p>
                                    <p className="text-[10px] font-bold text-slate-450 uppercase">{issue.category}</p>
                                  </td>
                                  <td className="p-4">
                                    {issue.assignedOfficer ? (
                                      <span className="font-semibold text-slate-700 dark:text-slate-350">{issue.assignedOfficer.name || 'Officer'}</span>
                                    ) : (
                                      <span className="text-red-500 font-extrabold text-xs">Unassigned</span>
                                    )}
                                  </td>
                                  <td className="p-4 capitalize">
                                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${issue.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-600' : issue.status === 'in-progress' ? 'bg-blue-500/10 text-blue-600' : 'bg-amber-500/10 text-amber-600'}`}>
                                      {issue.status}
                                    </span>
                                  </td>
                                  <td className="p-4 text-right">
                                    <button 
                                      onClick={() => {
                                        setSelectedIssue(issue);
                                        setAssignedOfficerId(issue.assignedOfficer ? (issue.assignedOfficer._id || issue.assignedOfficer) : '');
                                      }}
                                      className="rounded-lg bg-accent/10 px-3.5 py-1.5 text-xs font-bold text-slate-900 dark:text-white dark:bg-slate-800 hover:bg-accent/20"
                                    >
                                      Inspect
                                    </button>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Officers Tab */}
                
                {/* Analytics Tab */}
                {activeTab === 'analytics' && analyticsData && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="glass-card rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-sm">
                        <h3 className="text-sm font-extrabold uppercase tracking-widest text-slate-400 mb-4">Smart Civic Health Score</h3>
                        <div className="relative h-40 w-40 flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle cx="80" cy="80" r="70" fill="none" stroke="currentColor" strokeWidth="12" className="text-slate-100 dark:text-slate-800" />
                            <circle cx="80" cy="80" r="70" fill="none" stroke="currentColor" strokeWidth="12" strokeDasharray="440" strokeDashoffset={440 - (440 * analyticsData.healthScore) / 100} className={`${analyticsData.healthScore > 80 ? 'text-emerald-500' : analyticsData.healthScore > 60 ? 'text-amber-500' : 'text-red-500'} transition-all duration-1000 ease-out`} />
                          </svg>
                          <div className="absolute flex flex-col items-center">
                            <span className="text-4xl font-extrabold">{analyticsData.healthScore}</span>
                            <span className="text-[10px] font-bold text-slate-400">/ 100</span>
                          </div>
                        </div>
                        <p className="mt-4 text-xs font-semibold text-slate-500">Based on resolution speed & citizen feedback</p>
                      </div>

                      <div className="md:col-span-2 glass-card rounded-3xl p-6 shadow-sm">
                        <h3 className="text-sm font-extrabold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2"><MapPin className="h-4 w-4" /> High-Risk Predictive Zones</h3>
                        <div className="space-y-4">
                          {analyticsData.riskZones.map((zone, idx) => (
                            <div key={idx} className={`p-4 rounded-2xl border ${zone.riskLevel === 'critical' ? 'bg-red-50/50 border-red-100 dark:bg-red-900/10 dark:border-red-900/30' : 'bg-amber-50/50 border-amber-100 dark:bg-amber-900/10 dark:border-amber-900/30'}`}>
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{zone.name}</h4>
                                  <p className="text-[10px] font-extrabold uppercase mt-1 text-slate-500">{zone.category}</p>
                                </div>
                                <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${zone.riskLevel === 'critical' ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'}`}>{zone.riskLevel} Risk</span>
                              </div>
                              <p className="mt-3 text-xs text-slate-600 dark:text-slate-400 font-medium">{zone.prediction}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'officers' && (
                  <div className="space-y-6">
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {officers.map(off => (
                        <div key={off._id} className="glass-card rounded-2xl p-5 shadow-sm">
                          <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 font-bold dark:bg-slate-800">
                              {off.name.charAt(0)}
                            </div>
                            <div>
                              <h4 className="font-bold dark:text-white">{off.name}</h4>
                              <p className="text-[10px] font-bold uppercase text-slate-400">{off.department}</p>
                            </div>
                          </div>
                          <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-xs text-slate-500 dark:border-slate-800">
                            <p><strong>Email:</strong> {off.email}</p>
                            <p><strong>Contact:</strong> +91 {off.phone}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Profile Tab */}
                {activeTab === 'profile' && (
                  <div className="max-w-xl mx-auto glass-card rounded-2xl p-6 shadow-sm text-center">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-200 font-extrabold text-slate-800 text-3xl dark:bg-slate-800 dark:text-slate-300">
                      {user ? user.name.charAt(0) : 'A'}
                    </div>
                    <h2 className="mt-4 text-xl font-bold dark:text-white">{user?.name}</h2>
                    <p className="text-xs text-slate-450 uppercase">Municipal Administrator</p>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          )}
        </main>
      </div>

      {/* Inspect & Assign Modal */}
      <AnimatePresence>
        {selectedIssue && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedIssue(null)}
              className="fixed inset-0 z-45 bg-black"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-4 top-10 bottom-10 z-50 mx-auto max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 md:p-8"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-450">{selectedIssue.category}</span>
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
                
                {selectedIssue.potentialDuplicates && selectedIssue.potentialDuplicates.length > 0 && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-900/20">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="mt-0.5 h-5 w-5 text-amber-600 dark:text-amber-500 shrink-0" />
                      <div>
                        <h4 className="text-sm font-bold text-amber-800 dark:text-amber-400">AI Warning: Potential Duplicate Detected</h4>
                        <p className="mt-1 text-xs text-amber-700 dark:text-amber-500/80">
                          This issue has {selectedIssue.potentialDuplicates.length} highly similar complaint(s) reported nearby. 
                        </p>
                        <button
                          onClick={() => handleMergeDuplicate(selectedIssue._id, selectedIssue.potentialDuplicates[0]._id || selectedIssue.potentialDuplicates[0])}
                          className="mt-3 rounded-lg bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-amber-700"
                        >
                          Merge Duplicate
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                
                {selectedIssue.photoUrl && (
                  <div className="overflow-hidden rounded-2xl h-48 w-full bg-slate-100 dark:bg-slate-850">
                    <img src={selectedIssue.photoUrl} alt="Inspection Proof" className="h-full w-full object-cover" />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="rounded-xl bg-slate-50 p-3.5 dark:bg-slate-850">
                    <h4 className="font-semibold text-slate-400 uppercase tracking-wider">Reported Priority</h4>
                    <p className="mt-1.5 font-bold capitalize text-slate-850 dark:text-slate-200">{selectedIssue.priority}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3.5 dark:bg-slate-850">
                    <h4 className="font-semibold text-slate-400 uppercase tracking-wider">Resolution Status</h4>
                    <p className="mt-1.5 font-bold capitalize text-slate-850 dark:text-slate-200">{selectedIssue.status}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Citizen Problem Description</h4>
                  <p className="mt-2 text-xs leading-relaxed text-slate-650 dark:text-slate-350 bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl">
                    {selectedIssue.description}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans">GIS Pin Address</h4>
                  <p className="mt-2 text-xs text-slate-650 dark:text-slate-350 flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 shrink-0 text-red-500" /> {selectedIssue.location.address}
                  </p>
                </div>

                {/* Assignment Form */}
                <div className="border-t border-slate-100 pt-6 dark:border-slate-800">
                  <h4 className="text-sm font-bold dark:text-white flex items-center gap-1.5 mb-4">
                    <UserCheck className="h-5 w-5 text-primary-600" /> Dispatch Ward Engineering Officer
                  </h4>

                  <form onSubmit={handleAssignSubmit} className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Available Department Officers</label>
                      <select
                        required
                        value={assignedOfficerId}
                        onChange={(e) => setAssignedOfficerId(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white/60 px-4 py-3 text-sm focus:border-accent focus:outline-none dark:border-slate-800 dark:bg-slate-900/60"
                      >
                        <option value="" disabled>Select Officer</option>
                        {officers
                          .filter(off => off.department === selectedIssue.category)
                          .map(off => (
                            <option key={off._id} value={off._id}>{off.name} ({off.department})</option>
                          ))}
                      </select>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setSelectedIssue(null)}
                        className="rounded-xl bg-slate-100 px-5 py-2.5 text-xs font-semibold hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submittingAssignment}
                        className="flex items-center gap-1.5 rounded-xl bg-accent px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-slate-800 disabled:opacity-50"
                      >
                        {submittingAssignment ? (
                          <div className="h-4.5 w-4.5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        ) : (
                          'Dispatch Officer'
                        )}
                      </button>
                    </div>
                  </form>
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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

export default AdminDashboard;
