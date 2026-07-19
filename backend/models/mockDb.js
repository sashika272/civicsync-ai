// In-memory Mock Database for CivicSync AI Demo Mode
const bcrypt = require('bcryptjs');

const mockUsers = [];
const mockIssues = [];
const mockNotifications = [];

// Seed database with default accounts
const seedDatabase = async () => {
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  // Create Citizens
  mockUsers.push({
    _id: 'user_citizen_1',
    name: 'Aarav Sharma',
    email: 'citizen@civicsync.in',
    password: hashedPassword,
    phone: '9876543200',
    role: 'citizen',
    department: null,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  });

  // Create Officers
  mockUsers.push({
    _id: 'user_officer_1',
    name: 'Dr. Rajesh Patel',
    email: 'officer@civicsync.in',
    password: hashedPassword,
    phone: '9876543211',
    role: 'officer',
    department: 'Roads & Potholes',
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
  });

  mockUsers.push({
    _id: 'user_officer_2',
    name: 'Suhail Khan',
    email: 'officer.waste@civicsync.in',
    password: hashedPassword,
    phone: '9876543212',
    role: 'officer',
    department: 'Garbage & Sanitation',
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
  });

  // Create Admins
  mockUsers.push({
    _id: 'user_admin_1',
    name: 'Smt. Priya Iyer, IAS',
    email: 'admin@civicsync.in',
    password: hashedPassword,
    phone: '9876543215',
    role: 'admin',
    department: null,
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
  });

  // Seed Issues
  mockIssues.push({
    _id: 'issue_1',
    title: 'Severe Pothole on Ring Road Metro Junction',
    category: 'Roads & Potholes',
    description: 'A deep pothole has formed right under the Metro Station pillar 24. It is causing severe traffic pile-ups during peak hours and is highly hazardous for two-wheelers.',
    status: 'pending',
    priority: 'high',
    location: {
      lat: 12.9716,
      lng: 77.5946,
      address: 'Outer Ring Road near Central Metro Station Pillar 24, Bengaluru'
    },
    photoUrl: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?q=80&w=600&auto=format&fit=crop',
    images: ['https://images.unsplash.com/photo-1515162305285-0293e4767cc2?q=80&w=600&auto=format&fit=crop'],
    anonymous: false,
    isDraft: false,
    reporter: { _id: 'user_citizen_1', name: 'Aarav Sharma', email: 'citizen@civicsync.in' },
    assignedOfficer: null,
    upvotes: ['user_citizen_1'],
    duplicateOf: null,
    potentialDuplicates: [],
    timeline: [
      {
        status: 'pending',
        remarks: 'Complaint registered by citizen Aarav Sharma via AI engine classification.',
        updatedBy: 'System',
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      }
    ],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  });

  mockIssues.push({
    _id: 'issue_2',
    title: 'Uncollected Garbage Dump in Sector 4 Park Entrance',
    category: 'Garbage & Sanitation',
    description: 'Municipal waste bin at the entrance of Sector 4 children park has overflowed. Garbage is scattered on the sidewalk, releasing bad odor and breeding mosquitoes.',
    status: 'in-progress',
    priority: 'medium',
    location: {
      lat: 19.0760,
      lng: 72.8777,
      address: 'Entrance of Sector 4 Public Park, Bandra West, Mumbai'
    },
    photoUrl: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?q=80&w=600&auto=format&fit=crop',
    images: ['https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?q=80&w=600&auto=format&fit=crop'],
    anonymous: false,
    isDraft: false,
    reporter: { _id: 'user_citizen_1', name: 'Aarav Sharma', email: 'citizen@civicsync.in' },
    assignedOfficer: { _id: 'user_officer_2', name: 'Suhail Khan', role: 'officer' },
    upvotes: ['user_citizen_1', 'user_citizen_2'],
    duplicateOf: null,
    potentialDuplicates: [],
    timeline: [
      {
        status: 'pending',
        remarks: 'Complaint registered.',
        updatedBy: 'System',
        updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
      },
      {
        status: 'in-progress',
        remarks: 'Assigned to Ward sanitation team. Cleaning trucks scheduled for evening dispatch.',
        updatedBy: 'Suhail Khan',
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      }
    ],
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
  });

  mockIssues.push({
    _id: 'issue_3',
    title: 'Faulty Streetlights on Mahatma Gandhi Path',
    category: 'Streetlights',
    description: 'Entire row of 5 streetlights from house number 12 to 28 has been out for the past week. High risk of accidents and security concerns at night.',
    status: 'resolved',
    priority: 'critical',
    location: {
      lat: 28.6139,
      lng: 77.2090,
      address: 'MG Road Lane 4, opposite Government Girls High School, New Delhi'
    },
    photoUrl: 'https://images.unsplash.com/photo-1509024644558-2f56ce76c490?q=80&w=600&auto=format&fit=crop',
    images: ['https://images.unsplash.com/photo-1509024644558-2f56ce76c490?q=80&w=600&auto=format&fit=crop'],
    anonymous: false,
    isDraft: false,
    reporter: { _id: 'user_citizen_1', name: 'Aarav Sharma', email: 'citizen@civicsync.in' },
    assignedOfficer: { _id: 'user_officer_1', name: 'Dr. Rajesh Patel', role: 'officer' },
    upvotes: ['user_citizen_1'],
    duplicateOf: null,
    potentialDuplicates: [],
    timeline: [
      {
        status: 'pending',
        remarks: 'Complaint registered.',
        updatedBy: 'System',
        updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
      },
      {
        status: 'in-progress',
        remarks: 'Assigned to electrical grid maintenance supervisor.',
        updatedBy: 'Dr. Rajesh Patel',
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        status: 'resolved',
        remarks: 'Replaced faulty cables and LED bulb units. Street lighting fully operational.',
        updatedBy: 'Dr. Rajesh Patel',
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      }
    ],
    feedback: {
      rating: 5,
      comment: 'Excellent prompt action! The lights are fully working now. Thank you, CivicSync.',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    },
    resolutionProof: {
      photoUrl: 'https://images.unsplash.com/photo-1509024644558-2f56ce76c490?q=80&w=600&auto=format&fit=crop',
      remarks: 'Replaced faulty cables and LED bulbs. Verified grid operational.',
      completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    },
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
  });

  // Seed Notifications
  mockNotifications.push({
    _id: 'notif_1',
    recipient: 'user_citizen_1',
    title: 'Complaint Registered',
    message: 'Your report "Severe Pothole on Ring Road" has been successfully filed in the Smart City database.',
    type: 'success',
    isRead: false,
    issueId: 'issue_1',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  });

  mockNotifications.push({
    _id: 'notif_2',
    recipient: 'user_citizen_1',
    title: 'Work Scheduled',
    message: 'Suhail Khan assigned team dispatch for "Uncollected Garbage Dump in Sector 4".',
    type: 'info',
    isRead: false,
    issueId: 'issue_2',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  });

  mockNotifications.push({
    _id: 'notif_3',
    recipient: 'user_citizen_1',
    title: 'Complaint Resolved',
    message: 'Faulty Streetlights on Mahatma Gandhi Path has been marked as RESOLVED by Dr. Rajesh Patel.',
    type: 'success',
    isRead: true,
    issueId: 'issue_3',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  });


  mockIssues.push({
    _id: 'issue_3',
    title: 'High-voltage Live Wire Fallen on Main Street',
    category: 'Electricity',
    description: 'A major storm last night caused a high tension wire to snap and fall across the pedestrian walkway near Central Market. Extreme electrocution hazard.',
    status: 'resolved',
    priority: 'critical',
    location: { lat: 28.6139, lng: 77.2090, address: 'Central Market Walkway, New Delhi' },
    photoUrl: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?q=80&w=600&auto=format&fit=crop',
    images: ['https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?q=80&w=600&auto=format&fit=crop'],
    anonymous: false,
    isDraft: false,
    reporter: { _id: 'user_citizen_1', name: 'Aarav Sharma', email: 'citizen@civicsync.in' },
    assignedOfficer: { _id: 'user_officer_1', name: 'Dr. Rajesh Patel' },
    upvotes: ['user_citizen_1'],
    duplicateOf: null,
    potentialDuplicates: [],
    aiMetadata: { confidenceScore: 95, imageAnalysis: 'Visual AI Model detected snapped power lines and sparks.', priorityReasoning: 'AI flagged critical safety hazard keywords (e.g., danger, live wire).' },
    resolutionProof: { photoUrl: 'https://images.unsplash.com/photo-1520694478166-daaaaec95b69?q=80&w=600&auto=format&fit=crop', remarks: 'Power disconnected, line repaired and secured.' },
    feedback: { rating: 5, comment: 'Extremely fast response, saved lives.' },
    timeline: [
      { status: 'pending', remarks: 'Registered via Voice AI.', updatedBy: 'System', updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
      { status: 'in-progress', remarks: 'Emergency team dispatched.', updatedBy: 'Smt. Priya Iyer, IAS', updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
      { status: 'resolved', remarks: 'Power disconnected, line repaired and secured.', updatedBy: 'Dr. Rajesh Patel', updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) }
    ],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
  });

  mockIssues.push({
    _id: 'issue_4',
    title: 'Severe Water Leakage from Main Supply Pipe',
    category: 'Water Supply',
    description: 'Fresh drinking water is leaking rapidly onto the street from a broken main pipe near the residential area. Thousands of liters wasted.',
    status: 'in-progress',
    priority: 'high',
    location: { lat: 13.0827, lng: 80.2707, address: 'Anna Nagar West, Chennai' },
    photoUrl: 'https://images.unsplash.com/photo-1542037104857-ffbb0b9155fb?q=80&w=600&auto=format&fit=crop',
    images: ['https://images.unsplash.com/photo-1542037104857-ffbb0b9155fb?q=80&w=600&auto=format&fit=crop'],
    anonymous: true,
    isDraft: false,
    reporter: null,
    assignedOfficer: { _id: 'user_officer_2', name: 'Suhail Khan' },
    upvotes: [],
    duplicateOf: null,
    potentialDuplicates: [],
    aiMetadata: { confidenceScore: 88, imageAnalysis: 'Visual AI Model detected burst pipe and flooding.', priorityReasoning: 'AI flagged urgent maintenance keywords (e.g., leakage).' },
    timeline: [
      { status: 'pending', remarks: 'Complaint registered anonymously.', updatedBy: 'System', updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
      { status: 'in-progress', remarks: 'Plumbing unit notified and en route.', updatedBy: 'Suhail Khan', updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000) }
    ],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  });

  mockIssues.push({
    _id: 'issue_5',
    title: 'Non-functioning Streetlights on Highway Stretch',
    category: 'Streetlights',
    description: 'A 2km stretch of highway is completely dark due to faulty streetlamps, causing accidents at night.',
    status: 'pending',
    priority: 'medium',
    location: { lat: 17.3850, lng: 78.4867, address: 'NH-65 Outer Ring, Hyderabad' },
    photoUrl: 'https://images.unsplash.com/photo-1601758228041-f3b279ce7bec?q=80&w=600&auto=format&fit=crop',
    images: ['https://images.unsplash.com/photo-1601758228041-f3b279ce7bec?q=80&w=600&auto=format&fit=crop'],
    anonymous: false,
    isDraft: false,
    reporter: { _id: 'user_citizen_1', name: 'Aarav Sharma', email: 'citizen@civicsync.in' },
    assignedOfficer: null,
    upvotes: ['user_citizen_1'],
    duplicateOf: null,
    potentialDuplicates: [],
    aiMetadata: { confidenceScore: 78, imageAnalysis: 'Visual AI Model detected dark road conditions.', priorityReasoning: 'Standard processing based on text keywords.' },
    timeline: [
      { status: 'pending', remarks: 'Registered via web portal.', updatedBy: 'System', updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) }
    ],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  });

};

seedDatabase();

module.exports = {
  mockUsers,
  mockIssues,
  mockNotifications
};
