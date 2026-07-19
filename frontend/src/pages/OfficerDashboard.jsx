import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import Toast from '../components/Toast';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title as ChartTitle, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
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
  MessageSquare,
  Wrench
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

ChartJS.register(CategoryScale, LinearScale, BarElement, ChartTitle, Tooltip, Legend);

const OfficerDashboard = () => {
  const { user, token, logout } = useAuth();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0 });

  // Inspector & status update state
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState('in-progress');
  const [remarksUpdate, setRemarksUpdate] = useState('');
  const [proofImage, setProofImage] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Search filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const triggerToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
  };

  const fetchIssues = async () => {
    try {
      const response = await fetch('/api/issues', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        // Filter issues matching officer's assigned department or issues assigned to them
        const deptIssues = data.data.filter(issue => {
          return issue.category === user.department || 
                 (issue.assignedOfficer && (issue.assignedOfficer._id === user.id || issue.assignedOfficer === user.id));
        });

        setIssues(deptIssues);
        
        // Calculate Statistics
        const counts = { total: deptIssues.length, pending: 0, inProgress: 0, resolved: 0 };
        deptIssues.forEach(i => {
          if (i.status === 'pending') counts.pending++;
          else if (i.status === 'in-progress') counts.inProgress++;
          else if (i.status === 'resolved') counts.resolved++;
        });
        setStats(counts);
      }
    } catch (err) {
      console.error(err);
      triggerToast('Failed to retrieve department complaints feed', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && user) {
      fetchIssues();
    }
  }, [token, user]);

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!selectedIssue) return;

    setUpdatingStatus(true);

    try {
      const response = await fetch(`/api/issues/${selectedIssue._id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: statusUpdate,
          remarks: remarksUpdate || `Official action update: Status changed to ${statusUpdate}`,
          proofImage: statusUpdate === 'resolved' ? proofImage : undefined
        })
      });
      const data = await response.json();
      if (data.success) {
        triggerToast(`Status updated to: ${statusUpdate}`);
        setRemarksUpdate('');
        setProofImage('');
        setSelectedIssue(null);
        fetchIssues();
      } else {
        triggerToast(data.message || 'Failed to apply status update', 'error');
      }
    } catch (err) {
      triggerToast('Server connection failed', 'error');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Chart configuration
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } }
  };

  const chartData = {
    labels: ['Pending Inspection', 'Under Repairs', 'Work Completed'],
    datasets: [
      {
        data: [stats.pending, stats.inProgress, stats.resolved],
        backgroundColor: ['rgba(245, 158, 11, 0.75)', 'rgba(59, 130, 246, 0.75)', 'rgba(16, 185, 129, 0.75)'],
        borderWidth: 0,
        borderRadius: 8
      }
    ]
  };

  const menuItems = [
    { id: 'dashboard', label: 'Overview', icon: <LayoutDashboard className="h-5 w-5" /> },
    { id: 'worklist', label: 'Inspection Worklist', icon: <Wrench className="h-5 w-5" /> },
    { id: 'notifications', label: 'System Bulletins', icon: <Bell className="h-5 w-5" /> },
    { id: 'profile', label: 'My Account', icon: <UserIcon className="h-5 w-5" /> },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 transition-colors duration-300 dark:bg-slate-950 text-slate-800 dark:text-slate-100">
      
      {/* Sidebar - Desktop */}
      <aside className="hidden w-64 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 md:block">
        <div className="flex h-20 items-center gap-3 border-b border-slate-150 px-6 dark:border-slate-800">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary-600 text-white">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-sans text-lg font-extrabold tracking-tight dark:text-white">CivicSync<span className="text-secondary-600">AI</span></h2>
            <p className="text-[8px] font-bold uppercase tracking-widest text-slate-400">Officer Console</p>
          </div>
        </div>

        {/* Officer Badge Info */}
        <div className="mx-4 mt-6 rounded-2xl bg-secondary-500/5 p-4 border border-secondary-500/10">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-450">Department Assigned</p>
          <p className="text-xs font-extrabold text-secondary-600 mt-1">{user?.department || 'General Administration'}</p>
        </div>

        <nav className="space-y-1.5 p-4 mt-4">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex w-full items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${activeTab === item.id ? 'bg-secondary-600 text-white shadow-md shadow-secondary-600/20' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'}`}
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
              {activeTab === 'dashboard' ? 'Overview' : activeTab}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden max-w-xs sm:block">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Find assigned task..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-48 rounded-xl border border-slate-200 bg-white/60 py-2 pl-9 pr-4 text-xs focus:border-secondary-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900/60"
              />
            </div>
            
            <ThemeToggle />

            {/* Profile Avatar Widget */}
            <div className="flex items-center gap-3 border-l border-slate-200 pl-4 dark:border-slate-800">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary-100 font-extrabold text-secondary-750 dark:bg-secondary-950 dark:text-secondary-300">
                {user ? user.name.charAt(0) : 'O'}
              </div>
              <div className="hidden text-left xl:block">
                <p className="text-xs font-bold dark:text-white">{user ? user.name : 'Officer'}</p>
                <p className="text-[10px] font-semibold text-slate-450 uppercase">{user ? user.role : 'User'}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content container */}
        <main className="p-6 max-w-7xl mx-auto">
          {loading ? (
            <div className="flex h-96 items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-secondary-600"></div>
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
                
                {/* 1. Overview Tab */}
                {activeTab === 'dashboard' && (
                  <div className="space-y-6">
                    {/* Stat Tiles */}
                    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                      {[
                        { count: stats.total, label: 'Assigned Issues', icon: <ShieldAlert className="h-5 w-5 text-indigo-500" /> },
                        { count: stats.pending, label: 'Awaiting Action', icon: <Clock className="h-5 w-5 text-amber-500" /> },
                        { count: stats.inProgress, label: 'Under Repairs', icon: <AlertCircle className="h-5 w-5 text-blue-500" /> },
                        { count: stats.resolved, label: 'Jobs Completed', icon: <CheckCircle className="h-5 w-5 text-emerald-500" /> }
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

                    {/* Chart & Department Details */}
                    <div className="grid gap-6 lg:grid-cols-12">
                      <div className="glass-card rounded-2xl p-6 shadow-sm lg:col-span-8">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Repair Completion Analysis</h3>
                        <div className="h-72">
                          {issues.length > 0 ? (
                            <Bar data={chartData} options={chartOptions} />
                          ) : (
                            <div className="flex h-full items-center justify-center text-xs font-semibold text-slate-400">
                              No data recorded yet.
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="glass-card rounded-2xl p-6 shadow-sm lg:col-span-4 flex flex-col justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Command Center Bulletins</h3>
                          <div className="space-y-4">
                            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-850">
                              <span className="text-[10px] font-bold text-secondary-600 uppercase">Alert</span>
                              <p className="text-xs font-bold text-slate-850 dark:text-slate-200 mt-1">SIH System Sync Active</p>
                              <p className="text-[11px] text-slate-550 dark:text-slate-400 mt-0.5 leading-relaxed">Ensure all resolved items have photo proof uploaded to command node.</p>
                            </div>
                          </div>
                        </div>
                        
                        <button 
                          onClick={() => setActiveTab('worklist')}
                          className="w-full flex items-center justify-center gap-1 bg-secondary-600 py-3 text-sm font-bold text-white rounded-xl hover:bg-secondary-700 shadow-md"
                        >
                          Access Action Worklist <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Active Worklist Preview */}
                    <div className="glass-card rounded-2xl p-6 shadow-sm">
                      <div className="mb-6 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Awaiting Dispatch</h3>
                        <button onClick={() => setActiveTab('worklist')} className="text-xs font-bold text-secondary-600 hover:text-secondary-700">
                          Inspect Full List
                        </button>
                      </div>

                      <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {issues
                          .filter(i => i.status !== 'resolved')
                          .slice(0, 3)
                          .map(issue => (
                            <div key={issue._id} className="flex flex-wrap items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                              <div>
                                <div className="flex items-center gap-3">
                                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">{issue.category}</span>
                                  <span className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold capitalize ${issue.priority === 'critical' ? 'bg-red-500/10 text-red-500' : 'bg-slate-150 text-slate-600 dark:bg-slate-800'}`}>
                                    {issue.priority} Priority
                                  </span>
                                </div>
                                <h4 className="mt-1.5 text-sm font-bold text-slate-850 dark:text-slate-200">{issue.title}</h4>
                                <p className="mt-1 text-xs text-slate-450 dark:text-slate-400 flex items-center gap-1">
                                  <MapPin className="h-3 w-3 shrink-0" /> {issue.location.address}
                                </p>
                              </div>
                              
                              <button 
                                onClick={() => setSelectedIssue(issue)}
                                className="rounded-xl bg-secondary-600/10 px-4 py-2 text-xs font-bold text-secondary-600 hover:bg-secondary-600/20"
                              >
                                Take Action
                              </button>
                            </div>
                          ))}
                        {issues.filter(i => i.status !== 'resolved').length === 0 && (
                          <div className="py-8 text-center text-xs font-semibold text-slate-400">
                            Excellent! No pending or active complaints in your queue.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Worklist Tab */}
                {activeTab === 'worklist' && (
                  <div className="space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-4 glass-card rounded-2xl p-4 shadow-sm">
                      <div className="relative max-w-xs flex-1">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Filter inspection jobs..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white/60 py-2 pl-9 pr-4 text-xs focus:border-secondary-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900/60"
                        />
                      </div>
                      <div>
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="rounded-xl border border-slate-200 bg-white/60 px-4 py-2 text-xs focus:outline-none dark:border-slate-800 dark:bg-slate-900/60"
                        >
                          <option value="all">All Jobs</option>
                          <option value="pending">Pending Review</option>
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
                              <th className="p-4">Job ID</th>
                              <th className="p-4">Title / Reporter</th>
                              <th className="p-4">Priority</th>
                              <th className="p-4">Status</th>
                              <th className="p-4 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {issues
                              .filter(issue => {
                                const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase());
                                const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;
                                return matchesSearch && matchesStatus;
                              })
                              .map(issue => (
                                <tr key={issue._id} className="hover:bg-slate-100/10 transition-colors">
                                  <td className="p-4 font-mono text-xs">{issue._id.substring(0, 12)}</td>
                                  <td className="p-4">
                                    <p className="font-bold text-slate-900 dark:text-white">{issue.title}</p>
                                    <p className="text-[10px] text-slate-400">Reporter: {issue.reporter.name || 'Citizen'}</p>
                                  </td>
                                  <td className="p-4 capitalize">
                                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${issue.priority === 'critical' ? 'bg-red-500/10 text-red-500' : 'bg-slate-200 text-slate-650 dark:bg-slate-850'}`}>
                                      {issue.priority}
                                    </span>
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
                                        setStatusUpdate(issue.status);
                                      }}
                                      className="rounded-lg bg-secondary-600/10 px-3.5 py-1.5 text-xs font-bold text-secondary-600 hover:bg-secondary-600/20"
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

                {/* 3. Notifications Tab */}
                {activeTab === 'notifications' && (
                  <div className="max-w-2xl mx-auto space-y-4">
                    <div className="glass-card rounded-2xl p-5 shadow-sm text-center text-xs font-semibold text-slate-450">
                      Syncing dispatcher logs. No new admin tasks.
                    </div>
                  </div>
                )}

                {/* 4. Profile Tab */}
                {activeTab === 'profile' && (
                  <div className="max-w-xl mx-auto glass-card rounded-2xl p-6 shadow-sm text-center">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-secondary-105 font-extrabold text-secondary-700 text-3xl dark:bg-secondary-950 dark:text-secondary-300">
                      {user ? user.name.charAt(0) : 'O'}
                    </div>
                    
                    <h2 className="mt-4 text-xl font-bold dark:text-white">{user?.name}</h2>
                    <p className="text-xs text-slate-400 capitalize">{user?.role} Profile Account</p>

                    <div className="mt-8 text-left space-y-4 border-t border-slate-100 pt-6 dark:border-slate-800">
                      <div className="flex justify-between py-2 border-b border-slate-50 dark:border-slate-850">
                        <span className="text-xs font-semibold text-slate-400">Department Code</span>
                        <span className="text-xs font-bold capitalize text-secondary-600">{user?.department}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-50 dark:border-slate-850">
                        <span className="text-xs font-semibold text-slate-400">Official Email</span>
                        <span className="text-xs font-bold">{user?.email}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-xs font-semibold text-slate-400">Mobile Contact</span>
                        <span className="text-xs font-bold">+91 {user?.phone}</span>
                      </div>
                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          )}
        </main>
      </div>

      {/* Inspect and Action Modal */}
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
                {selectedIssue.photoUrl && (
                  <div className="overflow-hidden rounded-2xl h-48 w-full bg-slate-100 dark:bg-slate-850">
                    <img src={selectedIssue.photoUrl} alt="Inspection Proof" className="h-full w-full object-cover" />
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div className="rounded-xl bg-slate-50 p-3.5 dark:bg-slate-850">
                    <h4 className="font-semibold text-slate-400 uppercase tracking-wider">Citizen Reporter</h4>
                    <p className="mt-1.5 font-bold text-slate-850 dark:text-slate-200">{selectedIssue.reporter.name || 'Aarav Sharma'}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3.5 dark:bg-slate-850">
                    <h4 className="font-semibold text-slate-400 uppercase tracking-wider">Priority Level</h4>
                    <p className="mt-1.5 font-bold capitalize text-slate-850 dark:text-slate-200">{selectedIssue.priority}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3.5 dark:bg-slate-850">
                    <h4 className="font-semibold text-slate-400 uppercase tracking-wider">Coordinates</h4>
                    <p className="mt-1.5 font-mono text-[10px] text-slate-850 dark:text-slate-200">{selectedIssue.location.lat}, {selectedIssue.location.lng}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Citizen Problem Description</h4>
                  <p className="mt-2 text-xs leading-relaxed text-slate-650 dark:text-slate-350 bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl">
                    {selectedIssue.description}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">GIS Address Pin</h4>
                  <p className="mt-2 text-xs text-slate-650 dark:text-slate-350 flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 shrink-0 text-red-500" /> {selectedIssue.location.address}
                  </p>
                </div>

                {/* Status Update Form */}
                <div className="border-t border-slate-100 pt-6 dark:border-slate-800">
                  <h4 className="text-sm font-bold dark:text-white flex items-center gap-1.5 mb-4">
                    <ClipboardCheck className="h-5 w-5 text-secondary-600" /> Submit Action Resolution Report
                  </h4>

                  <form onSubmit={handleStatusSubmit} className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      {['pending', 'in-progress', 'resolved'].map(status => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => setStatusUpdate(status)}
                          className={`rounded-xl border py-2.5 text-xs font-bold transition-all capitalize ${statusUpdate === status ? 'border-secondary-600 bg-secondary-600/10 text-secondary-600' : 'border-slate-250 text-slate-400 hover:bg-slate-100 dark:border-slate-800'}`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Official Action Remarks / Notes</label>
                      <textarea
                        rows={3}
                        required
                        value={remarksUpdate}
                        onChange={(e) => setRemarksUpdate(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white/60 px-4 py-3 text-sm focus:border-secondary-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900/60"
                        placeholder="e.g. Cleared rubbish piles, dispatched repair truck grid 4. Photos attached."
                      />
                    </div>

                    
                    <AnimatePresence>
                      {statusUpdate === 'resolved' && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-4 block">Resolution Proof Image URL (Required for closing)</label>
                          <input
                            type="url"
                            required={statusUpdate === 'resolved'}
                            value={proofImage}
                            onChange={(e) => setProofImage(e.target.value)}
                            className="mt-2 w-full rounded-xl border border-emerald-500/30 bg-emerald-50/50 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none dark:border-emerald-900/50 dark:bg-emerald-900/10"
                            placeholder="https://... (Photo showing fixed issue)"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>

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
                        disabled={updatingStatus}
                        className="flex items-center gap-1.5 rounded-xl bg-secondary-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-secondary-700 disabled:opacity-50"
                      >
                        {updatingStatus ? (
                          <div className="h-4.5 w-4.5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        ) : (
                          'Save Resolution Status'
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

export default OfficerDashboard;
