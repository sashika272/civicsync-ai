import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import MapModule from '../components/MapModule';
import { ArrowLeft, MapPin, AlertCircle, Clock, CheckCircle, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const ComplaintDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchIssueDetails = async () => {
      try {
        const response = await fetch(`/api/issues/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        
        if (data.success) {
          setIssue(data.data);
        } else {
          setError(data.message || 'Issue not found');
        }
      } catch (err) {
        setError('Server error while fetching details');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchIssueDetails();
    }
  }, [id, token]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-primary-600"></div>
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold">Error Loading Complaint</h2>
          <p className="text-slate-500 dark:text-slate-400">{error}</p>
          <button onClick={() => navigate(-1)} className="px-6 py-2 rounded-xl bg-primary-600 text-white font-bold">Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <header className="glass-nav sticky top-0 z-30 flex h-20 items-center justify-between px-6 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-bold tracking-tight dark:text-white md:text-xl">Complaint Details</h1>
        </div>
        <ThemeToggle />
      </header>

      <main className="p-6 max-w-4xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-6 dark:border-slate-800">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">{issue.category}</span>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{issue.title}</h2>
              <p className="mt-2 text-xs font-mono text-slate-400">ID: {issue._id}</p>
            </div>
            <div className="text-right">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold \${issue.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-600' : issue.status === 'in-progress' ? 'bg-blue-500/10 text-blue-600' : 'bg-amber-500/10 text-amber-600'}`}>
                {issue.status === 'resolved' ? <CheckCircle className="h-4 w-4" /> : issue.status === 'in-progress' ? <Clock className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <span className="capitalize">{issue.status}</span>
              </span>
            </div>
          </div>

          <div className="mt-8 grid gap-8 md:grid-cols-2">
            <div className="space-y-6">
              {issue.photoUrl && (
                <div className="overflow-hidden rounded-2xl h-64 w-full bg-slate-100 dark:bg-slate-850">
                  <img src={issue.photoUrl} alt="Issue" className="h-full w-full object-cover" />
                </div>
              )}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Description</h4>
                <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-850/50 p-5 rounded-2xl">
                  {issue.description}
                </p>
              </div>

              {/* AI Metadata */}
              {issue.aiMetadata && issue.aiMetadata.confidenceScore > 0 && (
                <div className="bg-primary-50 dark:bg-primary-900/20 p-5 rounded-2xl border border-primary-100 dark:border-primary-900/50">
                  <h4 className="text-xs font-extrabold text-primary-600 uppercase tracking-wider mb-3 flex items-center gap-2"><TrendingUp className="h-4 w-4" /> AI Classification Engine</h4>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Confidence Score</span>
                    <span className="text-sm font-bold text-primary-700 dark:text-primary-400">{issue.aiMetadata.confidenceScore}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-4">
                    <div className="bg-primary-500 h-2 rounded-full" style={{ width: `${issue.aiMetadata.confidenceScore}%` }}></div>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed"><strong className="text-slate-700 dark:text-slate-300">Image Analysis:</strong> {issue.aiMetadata.imageAnalysis}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed mt-2"><strong className="text-slate-700 dark:text-slate-300">Priority AI:</strong> {issue.aiMetadata.priorityReasoning}</p>
                </div>
              )}


              {/* Resolution Proof */}
              {issue.status === 'resolved' && issue.resolutionProof && issue.resolutionProof.photoUrl && (
                <div className="pt-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Officer's Resolution Proof</h4>
                  <div className="overflow-hidden rounded-2xl h-64 w-full bg-slate-100 dark:bg-slate-850 border border-emerald-500/30">
                    <img src={issue.resolutionProof.photoUrl} alt="Resolution Proof" className="h-full w-full object-cover" />
                  </div>
                </div>
              )}

              {/* Citizen Feedback */}
              {issue.status === 'resolved' && issue.feedback && issue.feedback.rating > 0 && (
                <div className="bg-amber-50 dark:bg-amber-900/10 p-5 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                  <h4 className="text-xs font-extrabold text-amber-600 uppercase tracking-wider mb-3">Citizen Feedback</h4>
                  <div className="flex items-center gap-1.5 mb-3">
                    {[1,2,3,4,5].map(star => (
                      <svg key={star} className={`w-5 h-5 ${star <= issue.feedback.rating ? 'text-amber-500' : 'text-slate-300 dark:text-slate-600'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                    ))}
                  </div>
                  {issue.feedback.comment && (
                    <p className="text-sm text-slate-700 dark:text-slate-300 italic">"{issue.feedback.comment}"</p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-850/50">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Priority</h4>
                  <p className={`mt-1 font-bold capitalize \${issue.priority === 'critical' ? 'text-red-500' : issue.priority === 'high' ? 'text-orange-500' : 'text-slate-700 dark:text-slate-200'}`}>{issue.priority}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-850/50">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reporter</h4>
                  <p className="mt-1 font-bold text-slate-700 dark:text-slate-200">{issue.anonymous ? 'Anonymous Citizen' : (issue.reporter?.name || 'Citizen')}</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Location Map</h4>
                <div className="mt-3 h-48 rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800">
                  <MapModule mode="viewer" center={[issue.location.lat, issue.location.lng]} markers={[issue]} zoom={15} isDark={document.documentElement.classList.contains('dark')} />
                </div>
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 flex items-start gap-2">
                  <MapPin className="h-5 w-5 shrink-0 text-red-500" /> 
                  {issue.location.address}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Resolution Timeline</h4>
                <div className="space-y-5 border-l-2 border-slate-100 pl-5 dark:border-slate-800 ml-2">
                  {issue.timeline?.map((step, idx) => (
                    <div key={idx} className="relative">
                      <span className={`absolute -left-[27px] top-1 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-slate-900 \${step.status === 'resolved' ? 'bg-emerald-500' : step.status === 'in-progress' ? 'bg-blue-500' : 'bg-amber-500'}`}></span>
                      <div className="flex justify-between items-start text-sm">
                        <div className="pr-4">
                          <p className="font-bold text-slate-900 dark:text-white capitalize">{step.status}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{step.remarks}</p>
                        </div>
                        <div className="text-[10px] font-semibold text-slate-400 text-right shrink-0">
                          <p>{step.updatedBy}</p>
                          <p className="mt-0.5">{new Date(step.updatedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default ComplaintDetails;
