const mongoose = require('mongoose');

const IssueSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Water Supply',
      'Roads & Potholes',
      'Electricity',
      'Garbage & Sanitation',
      'Streetlights',
      'Traffic & Public Transport',
      'Others'
    ]
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'resolved', 'rejected', 'closed'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String, required: true }
  },
  photoUrl: {
    type: String,
    default: ''
  },
  images: [{
    type: String // Supports multiple base64 strings or photo URLs
  }],
  anonymous: {
    type: Boolean,
    default: false
  },
  isDraft: {
    type: Boolean,
    default: false
  },
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedOfficer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  upvotes: [{
    type: String // userIds that upvoted
  }],
  duplicateOf: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Issue',
    default: null
  },
  potentialDuplicates: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Issue'
  }],
  aiMetadata: {
    confidenceScore: { type: Number, default: 0 },
    imageAnalysis: { type: String, default: '' },
    priorityReasoning: { type: String, default: '' }
  },
  timeline: [
    {
      status: { type: String, required: true },
      remarks: { type: String, default: '' },
      updatedBy: { type: String, required: true }, // Name of the officer/user or 'System'
      updatedAt: { type: Date, default: Date.now }
    }
  ],
  feedback: {
    rating: { type: Number, min: 1, max: 5, default: null },
    comment: { type: String, default: '' },
    createdAt: { type: Date }
  },
  resolutionProof: {
    photoUrl: { type: String, default: '' },
    remarks: { type: String, default: '' },
    completedAt: { type: Date }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Issue', IssueSchema);
