import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import { 
  Building2, 
  MapPin, 
  ShieldAlert, 
  Clock, 
  ChevronRight, 
  Users, 
  CheckCircle2, 
  Building, 
  AlertTriangle,
  Send,
  Phone,
  Mail,
  BookOpen
} from 'lucide-react';
import { motion } from 'framer-motion';

const LandingPage = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  // Counter stats (simplified counts for SIH platform display)
  const [stats, setStats] = useState({ complaints: 0, resolved: 0, citizens: 0, departments: 0 });

  useEffect(() => {
    // Simple incremental counts for visual flair on page load
    const duration = 1500;
    const steps = 50;
    const stepTime = duration / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      setStats({
        complaints: Math.floor((14250 / steps) * currentStep),
        resolved: Math.floor((12840 / steps) * currentStep),
        citizens: Math.floor((45900 / steps) * currentStep),
        departments: Math.floor((18 / steps) * currentStep),
      });

      if (currentStep >= steps) {
        clearInterval(timer);
        setStats({ complaints: 14250, resolved: 12840, citizens: 45900, departments: 18 });
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, []);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setContactForm({ name: '', email: '', message: '' });
    }, 3000);
  };

  const handleCTAClick = () => {
    if (token && user) {
      navigate(`/${user.role}`);
    } else {
      navigate('/login');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      
      {/* Navbar */}
      <nav className="glass-nav sticky top-0 z-40 w-full shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 text-white shadow-md shadow-primary-600/30">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <span className="font-sans text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                CivicSync<span className="text-primary-600">AI</span>
              </span>
              <p className="text-[9px] font-semibold uppercase tracking-widest text-slate-400">Smart Governance Portal</p>
            </div>
          </div>

          <div className="hidden items-center gap-8 md:flex">
            <a href="#home" className="text-sm font-semibold text-slate-600 hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-400">Home</a>
            <a href="#features" className="text-sm font-semibold text-slate-600 hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-400">Features</a>
            <a href="#how-it-works" className="text-sm font-semibold text-slate-600 hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-400">How It Works</a>
            <a href="#about" className="text-sm font-semibold text-slate-600 hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-400">About</a>
            <a href="#contact" className="text-sm font-semibold text-slate-600 hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-400">Contact</a>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            {token && user ? (
              <Link 
                to={`/${user.role}`}
                className="flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-primary-600/30 hover:bg-primary-700"
              >
                Dashboard <ChevronRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link to="/login" className="hidden text-sm font-semibold text-slate-700 hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-400 sm:block">
                  Login
                </Link>
                <Link 
                  to="/register"
                  className="rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary-600/25 hover:bg-primary-700"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="hero-gradient relative flex min-h-[85vh] items-center py-20 overflow-hidden">
        {/* Animated Background Grid */}
        <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        
        <div className="mx-auto max-w-7xl px-6 relative z-10">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            
            <motion.div 
              className="lg:col-span-7"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* GOI Badge */}
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/60 px-3 py-1 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
                <span className="text-[11px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300">Smart Cities Mission India</span>
              </div>

              <h1 className="font-sans text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-950 dark:text-white sm:text-5xl lg:text-6xl">
                Building Smarter <br />
                <span className="bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent">Cities Together</span>
              </h1>
              
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600 dark:text-slate-400">
                Report local civic issues instantly using AI-powered smart governance. We bridge the gap between citizens and municipal authorities with real-time tracking, GIS mapping, and automated dispatch.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <button
                  onClick={handleCTAClick}
                  className="flex items-center gap-2 rounded-xl bg-primary-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-primary-600/30 transition-all hover:bg-primary-700 hover:shadow-primary-600/40"
                >
                  Report Issue <ChevronRight className="h-5 w-5" />
                </button>
                <a
                  href="#how-it-works"
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white/50 px-8 py-4 text-base font-semibold shadow-sm backdrop-blur-sm transition-all hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50 dark:hover:bg-slate-900"
                >
                  Learn More
                </a>
              </div>
            </motion.div>

            {/* Hero Image / Dynamic Card */}
            <motion.div 
              className="relative lg:col-span-5"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="glass-card overflow-hidden rounded-3xl p-6 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-500"></div>
                    <div className="h-2.5 w-2.5 rounded-full bg-yellow-500"></div>
                    <div className="h-2.5 w-2.5 rounded-full bg-green-500"></div>
                  </div>
                  <span className="text-xs font-semibold text-slate-400">Live AI Classification Feed</span>
                </div>
                
                {/* Live Mock Feed Items */}
                <div className="mt-6 space-y-4">
                  {[
                    { category: 'Roads & Potholes', title: 'Road damage reported at Ward 4', status: 'Assigned', color: 'bg-primary-500/10 text-primary-600 dark:text-primary-400' },
                    { category: 'Garbage & Sanitation', title: 'Illegal dump pile reported on NH-48', status: 'Cleaning Scheduled', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
                    { category: 'Streetlights', title: '5 Faulty streetlights near school lane', status: 'Resolved', color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400' },
                  ].map((feed, idx) => (
                    <motion.div 
                      key={idx}
                      className="flex items-start gap-4 rounded-2xl bg-white/40 p-4 dark:bg-slate-900/40"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-400">{feed.category}</span>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${feed.color}`}>
                            {feed.status}
                          </span>
                        </div>
                        <h4 className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">{feed.title}</h4>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="bg-slate-100/50 py-12 dark:bg-slate-900/50">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            
            {[
              { value: stats.complaints.toLocaleString() + "+", label: "Total Complaints", icon: <ShieldAlert className="h-6 w-6 text-primary-600" /> },
              { value: stats.resolved.toLocaleString() + "+", label: "Resolved Issues", icon: <CheckCircle2 className="h-6 w-6 text-emerald-500" /> },
              { value: stats.citizens.toLocaleString() + "+", label: "Active Citizens", icon: <Users className="h-6 w-6 text-indigo-500" /> },
              { value: stats.departments + "+", label: "Connected Depts", icon: <Building className="h-6 w-6 text-rose-500" /> }
            ].map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm dark:bg-slate-800">
                  {stat.icon}
                </div>
                <h3 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">{stat.value}</h3>
                <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">{stat.label}</p>
              </div>
            ))}

          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight dark:text-white sm:text-4xl">
              Engineered For Modern Cities
            </h2>
            <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">
              CivicSync AI deploys next-gen technologies to process, dispatch, and monitor civic reports automatically.
            </p>
          </div>

          <motion.div 
            className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              {
                title: "AI Classification",
                desc: "AI NLP automatically identifies issue types and tags appropriate departments instantly.",
                icon: <Building2 className="h-6 w-6 text-primary-600" />
              },
              {
                title: "Real-time GIS Mapping",
                desc: "Capture coordinates automatically and pinpoints problems on active maps.",
                icon: <MapPin className="h-6 w-6 text-emerald-500" />
              },
              {
                title: "Transparent Timelines",
                desc: "Every assignment, status shift, and inspection is permanently recorded and visible.",
                icon: <Clock className="h-6 w-6 text-amber-500" />
              },
              {
                title: "Active Alerts",
                desc: "Get SMS and dashboard update notifications immediately upon officer assignments.",
                icon: <Users className="h-6 w-6 text-indigo-500" />
              }
            ].map((feat, idx) => (
              <motion.div 
                key={idx} 
                className="glass-card rounded-2xl p-6 shadow-sm hover:shadow-md"
                variants={itemVariants}
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                  {feat.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{feat.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{feat.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="bg-slate-100/50 py-24 dark:bg-slate-900/50">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight dark:text-white sm:text-4xl">
              How CivicSync AI Works
            </h2>
            <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">
              Connecting citizen reports directly with municipal engineering departments.
            </p>
          </div>

          <div className="mt-20 grid gap-8 md:grid-cols-4">
            {[
              { step: "01", title: "Report & Upload", desc: "Citizen uploads issue description, category selection, and location coordinates via the dashboard." },
              { step: "02", title: "AI Dispatches", desc: "CivicSync AI evaluates, registers, and tags the matching Department Ward Officer automatically." },
              { step: "03", title: "Action Scheduled", desc: "Designated officer updates remarks, changes status to 'In-Progress', and schedules field works." },
              { step: "04", title: "Resolution Logs", desc: "Work is done, coordinates are checked off, status is changed to 'Resolved', and notifications are dispatched." }
            ].map((step, idx) => (
              <div key={idx} className="relative rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900">
                <span className="absolute -top-6 left-6 text-5xl font-black text-primary-600/10 dark:text-primary-400/10">{step.step}</span>
                <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100 text-primary-600 dark:bg-primary-950 dark:text-primary-400">
            <BookOpen className="h-6 w-6" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight dark:text-white sm:text-4xl">Smart India Hackathon 2026</h2>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-slate-600 dark:text-slate-400">
            CivicSync AI is an enterprise-grade crowdsourcing solution designed for **Problem Statement 25031**. It allows municipal corporations to optimize resource dispatch, bypass bureaucratic bottlenecks, and establish a high-trust communication portal with citizens.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="bg-slate-100/50 py-24 dark:bg-slate-900/50">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-12 lg:grid-cols-2">
            
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400 font-semibold">
                <li><Link to="/about" className="hover:text-primary-600 transition-colors">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-primary-600 transition-colors">Contact Us</Link></li>
                <li><Link to="/register" className="hover:text-primary-600 transition-colors">Register as Citizen</Link></li>
                <li><Link to="/login" className="hover:text-primary-600 transition-colors">Officer Login</Link></li>
              </ul>
            </div>
            
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight dark:text-white sm:text-4xl">Support & Inquiries</h2>
              <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">
                Reach out to the smart city command center desk for API documentation, custom deployments, or administrative permissions.
              </p>

              <div className="mt-10 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm dark:bg-slate-800">
                    <Phone className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-400">Toll Free Helpline</h4>
                    <p className="text-base font-bold dark:text-white">1800-456-2026</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm dark:bg-slate-800">
                    <Mail className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-400">Official Email</h4>
                    <p className="text-base font-bold dark:text-white">governance@civicsync.gov.in</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-3xl p-8 shadow-xl">
              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Full Name</label>
                  <input
                    type="text"
                    required
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white/60 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900/60"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
                  <input
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white/60 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900/60"
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Message Description</label>
                  <textarea
                    rows={4}
                    required
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white/60 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900/60"
                    placeholder="Explain how we can help..."
                  />
                </div>

                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 py-3.5 text-sm font-bold text-white shadow-md hover:bg-primary-700"
                >
                  Send Message <Send className="h-4 w-4" />
                </button>

                {submitted && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl bg-emerald-500/10 p-3 text-center text-xs font-bold text-emerald-500"
                  >
                    Thank you! Message sent to the smart city command center desk.
                  </motion.div>
                )}
              </form>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-12 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <div className="flex flex-wrap justify-center gap-6 text-slate-400">
            <span className="text-xs font-bold">DIGITAL INDIA</span>
            <span className="text-xs font-bold">SMART CITIES MISSION</span>
            <span className="text-xs font-bold">MUNICIPAL CORPORATION PORTAL</span>
          </div>
          <p className="mt-6 text-sm text-slate-400">
            © 2026 CivicSync AI. Government of India Smart City Project under SIH 2026.
          </p>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
