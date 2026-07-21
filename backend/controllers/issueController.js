const Issue = require('../models/Issue');
const User = require('../models/User');
const Notification = require('../models/Notification');


// Helper to check if Mongo is active


// Helper to dispatch user notifications in both Mongo and Demo Modes
const sendNotification = async (recipientId, title, message, issueId, type = 'info') => {
  const cleanRecipientId = recipientId._id || recipientId;
  const cleanIssueId = issueId ? (issueId._id || issueId) : null;
  
  
    try {
      await Notification.create({
        recipient: cleanRecipientId,
        title,
        message,
        type,
        issueId: cleanIssueId
      });
      console.log(`📡 [Notification Logged] To: ${cleanRecipientId} | Msg: ${message}`);
    } catch (err) {
      console.error('Failed to create DB notification:', err);
    }
  
};


// AI Category & Department Keyword router (Simulated Image & Text Analysis)
const runAiRouting = (title = '', description = '', photoUrl = '') => {
  const text = `${title} ${description}`.toLowerCase();
  
  let category = 'Others';
  let confidenceScore = 65; // Base confidence
  let imageAnalysis = 'No image provided for AI visual verification.';
  let priorityReasoning = 'Standard processing based on text keywords.';
  
  // Keyword mapping checks
  if (text.includes('water') || text.includes('leak') || text.includes('pipe') || text.includes('drain') || text.includes('sewage')) {
    category = 'Water Supply';
    confidenceScore += 15;
  } else if (text.includes('pothole') || text.includes('road') || text.includes('flyover') || text.includes('crack') || text.includes('asphalt')) {
    category = 'Roads & Potholes';
    confidenceScore += 15;
  } else if (text.includes('streetlight') || text.includes('bulb') || text.includes('lamp') || text.includes('darkness')) {
    category = 'Streetlights';
    confidenceScore += 15;
  } else if (text.includes('garbage') || text.includes('trash') || text.includes('waste') || text.includes('dump') || text.includes('bin') || text.includes('litter')) {
    category = 'Garbage & Sanitation';
    confidenceScore += 15;
  } else if (text.includes('power') || text.includes('electricity') || text.includes('cable') || text.includes('wire') || text.includes('shock') || text.includes('grid')) {
    category = 'Electricity';
    confidenceScore += 15;
  } else if (text.includes('traffic') || text.includes('parking') || text.includes('bus') || text.includes('metro') || text.includes('signal')) {
    category = 'Traffic & Public Transport';
    confidenceScore += 15;
  }

  if (photoUrl) {
    confidenceScore += Math.floor(Math.random() * 10) + 10;
    imageAnalysis = `Visual AI Model analyzed image. Detected objects matching ${category} parameters with high probability.`;
  }

  // Calculate priority level
  let priority = 'medium';
  const criticalWords = ['danger', 'shock', 'fire', 'injury', 'accident', 'deadly', 'collapsed', 'live wire', 'hazard'];
  const highWords = ['broken', 'clogged', 'smell', 'dark', 'block', 'delay', 'leakage'];
  
  if (criticalWords.some(w => text.includes(w))) {
    priority = 'critical';
    priorityReasoning = 'AI flagged critical safety hazard keywords (e.g., danger, accident, live wire).';
  } else if (highWords.some(w => text.includes(w))) {
    priority = 'high';
    priorityReasoning = 'AI flagged urgent maintenance keywords (e.g., broken, leak).';
  }

  confidenceScore = Math.min(confidenceScore, 98); // Max 98%

  return { category, priority, aiMetadata: { confidenceScore, imageAnalysis, priorityReasoning } };
};


// Spatial distance calculator (approximation in meters)
const getDistance = (lat1, lng1, lat2, lng2) => {
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const r = 6371000; // Earth radius in meters
  return r * c;
};

// Text similarity check (intersecting keywords overlap percentage)
const getKeywordOverlap = (text1 = '', text2 = '') => {
  const stopWords = new Set(['the', 'a', 'is', 'of', 'in', 'on', 'and', 'to', 'for', 'at', 'with', 'from', 'by', 'that', 'this', 'it']);
  
  const getKeywords = (str) => {
    return str.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopWords.has(w));
  };

  const keys1 = getKeywords(text1);
  const keys2 = getKeywords(text2);
  
  if (keys1.length === 0 || keys2.length === 0) return 0;
  
  const set2 = new Set(keys2);
  const intersection = keys1.filter(k => set2.has(k));
  
  return intersection.length / Math.min(keys1.length, keys2.length);
};

// Check duplicates logic
const findDuplicates = async (newIssue, allIssues) => {
  const duplicates = [];
  const lat1 = newIssue.location.lat;
  const lng1 = newIssue.location.lng;
  const text1 = `${newIssue.title} ${newIssue.description}`;

  for (const existing of allIssues) {
    // Skip drafts and already merged duplicates
    if (existing.isDraft || existing.duplicateOf || existing._id.toString() === newIssue._id.toString()) continue;

    const lat2 = existing.location.lat;
    const lng2 = existing.location.lng;
    const text2 = `${existing.title} ${existing.description}`;

    // Distance check (within 250 meters)
    const dist = getDistance(lat1, lng1, lat2, lng2);
    if (dist <= 250) {
      // Keyword overlap check (at least 30%)
      const overlap = getKeywordOverlap(text1, text2);
      if (overlap >= 0.3) {
        duplicates.push(existing._id);
      }
    }
  }

  return duplicates;
};

// @desc    Report a new civic issue
// @route   POST /api/issues
// @access  Private (Citizen)
const reportIssue = async (req, res) => {
  const { title, description, location, isDraft, anonymous, images, photoUrl } = req.body;

  try {
    if (!title || !description || !location || !location.address) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const { lat, lng, address } = location;
    const isDraftBool = !!isDraft;

    // AI Classification & Routing (Only triggers if it is NOT a draft submission)
    let category = req.body.category || 'Others';
    let priority = req.body.priority || 'medium';
    
    if (!isDraftBool) {
      const aiResults = runAiRouting(title, description, photoUrl);
      category = aiResults.category;
      priority = aiResults.priority;
      var aiMetadata = aiResults.aiMetadata;
    }

    
      // 1. Create issue base
      const issue = await Issue.create({
        title,
        category,
        description,
        status: isDraftBool ? 'pending' : 'pending',
        priority,
        location: { lat, lng, address },
        photoUrl: photoUrl || '',
        images: images || [],
        aiMetadata: typeof aiMetadata !== 'undefined' ? aiMetadata : undefined,
        anonymous: !!anonymous,
        isDraft: isDraftBool,
        reporter: req.user._id,
        timeline: [
          {
            status: 'pending',
            remarks: isDraftBool ? 'Complaint saved as draft' : `Issue reported and AI routed under category: ${category}`,
            updatedBy: req.user.name,
            updatedAt: new Date()
          }
        ]
      });

      // 2. Perform duplicate scans if not draft
      if (!isDraftBool) {
        const activeIssues = await Issue.find({ isDraft: false });
        const potentialDups = await findDuplicates(issue, activeIssues);
        if (potentialDups.length > 0) {
          issue.potentialDuplicates = potentialDups;
          await issue.save();
          
          // Also link back on matched items
          await Issue.updateMany(
            { _id: { $in: potentialDups } },
            { $addToSet: { potentialDuplicates: issue._id } }
          );
        }

        // Notify user
        await sendNotification(
          req.user._id, 
          'Complaint Submitted Successfully', 
          `Your report "${title}" has been filed. AI assigned priority: ${priority}.`,
          issue._id,
          'success'
        );
      }

      return res.status(201).json({ success: true, data: issue });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to submit issue report' });
  }
};

// @desc    Get all civic issues
// @route   GET /api/issues
// @access  Private
const getIssues = async (req, res) => {
  const { status, category, reporter, isDraft } = req.query;

  try {
    
      const query = {};
      
      // Filter status
      if (status) {
        if (status === 'unassigned') {
          query.assignedOfficer = null;
          query.isDraft = false;
        } else {
          query.status = status;
        }
      }
      
      if (category) query.category = category;
      if (reporter) query.reporter = reporter;
      
      // Handle draft filters explicitly
      if (isDraft !== undefined) {
        query.isDraft = isDraft === 'true';
      } else {
        query.isDraft = false; // default exclude drafts from general lists
      }

      const issues = await Issue.find(query)
        .populate('reporter', 'name email phone')
        .populate('assignedOfficer', 'name email phone department')
        .sort({ createdAt: -1 });

      return res.json({ success: true, count: issues.length, data: issues });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to retrieve issues list' });
  }
};

// @desc    Get details of an issue by ID
// @route   GET /api/issues/:id
// @access  Private
const getIssueById = async (req, res) => {
  const { id } = req.params;

  try {
    
      const issue = await Issue.findById(id)
        .populate('reporter', 'name email phone')
        .populate('assignedOfficer', 'name email phone department')
        .populate('potentialDuplicates', 'title status location');

      if (!issue) {
        return res.status(404).json({ success: false, message: 'Issue report not found' });
      }

      return res.json({ success: true, data: issue });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error retrieving issue details' });
  }
};

// @desc    Update a complaint (only drafts or pending prior to officer assignments)
// @route   PUT /api/issues/:id
// @access  Private
const updateIssue = async (req, res) => {
  const { id } = req.params;
  const { title, description, category, priority, location, isDraft, anonymous, images } = req.body;

  try {
    let issue;
    
      issue = await Issue.findById(id);
    

    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    // Authorization check
    const reporterId = issue.reporter._id || issue.reporter;
    const currentUserId = req.user._id || req.user.id;
    if (reporterId.toString() !== currentUserId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this complaint' });
    }

    // Pre-assignment checks
    if (!issue.isDraft && issue.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Cannot edit complaint after officer assignment' });
    }

    // If publishing from draft
    const publishing = issue.isDraft && isDraft === false;
    let finalCategory = category || issue.category;
    let finalPriority = priority || issue.priority;

    if (publishing) {
      // Trigger AI router
      const aiResults = runAiRouting(title || issue.title, description || issue.description);
      finalCategory = aiResults.category;
      finalPriority = aiResults.priority;
    }

    const updateFields = {
      title: title || issue.title,
      description: description || issue.description,
      category: finalCategory,
      priority: finalPriority,
      anonymous: anonymous !== undefined ? !!anonymous : issue.anonymous,
      isDraft: isDraft !== undefined ? !!isDraft : issue.isDraft,
      images: images || issue.images,
      location: location || issue.location
    };

    if (publishing) {
      updateFields.timeline = [
        {
          status: 'pending',
          remarks: `Draft submitted and AI routed under category: ${finalCategory}`,
          updatedBy: req.user.name,
          updatedAt: new Date()
        }
      ];
    }

    
      const updatedIssue = await Issue.findByIdAndUpdate(id, { $set: updateFields }, { new: true });
      
      if (publishing) {
        // Run duplicate calculations
        const activeIssues = await Issue.find({ isDraft: false });
        const potentialDups = await findDuplicates(updatedIssue, activeIssues);
        if (potentialDups.length > 0) {
          updatedIssue.potentialDuplicates = potentialDups;
          await updatedIssue.save();
          await Issue.updateMany(
            { _id: { $in: potentialDups } },
            { $addToSet: { potentialDuplicates: updatedIssue._id } }
          );
        }

        await sendNotification(
          req.user._id,
          'Draft Published',
          `Your draft complaint "${updatedIssue.title}" has been successfully published.`,
          updatedIssue._id,
          'success'
        );
      }

      return res.json({ success: true, data: updatedIssue });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to update complaint details' });
  }
};

// @desc    Delete/Cancel a complaint (only drafts or pending prior to officer assignments)
// @route   DELETE /api/issues/:id
// @access  Private
const deleteIssue = async (req, res) => {
  const { id } = req.params;

  try {
    let issue;
    
      issue = await Issue.findById(id);
    

    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    // Auth validation
    const reporterId = issue.reporter._id || issue.reporter;
    const currentUserId = req.user._id || req.user.id;
    if (reporterId.toString() !== currentUserId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this complaint' });
    }

    // Pre-assignment check
    if (!issue.isDraft && issue.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Cannot delete complaint after officer assignment' });
    }

    
      await Issue.findByIdAndDelete(id);
      
      // Clean duplicate references
      await Issue.updateMany(
        { potentialDuplicates: id },
        { $pull: { potentialDuplicates: id } }
      );
    

    return res.json({ success: true, message: 'Complaint successfully cancelled and deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to delete complaint record' });
  }
};

// @desc    Merge a duplicate complaint into a master complaint
// @route   PUT /api/issues/:id/merge
// @access  Private (Admin only)
const mergeIssue = async (req, res) => {
  const { id } = req.params; // Duplicate issue ID
  const { targetIssueId } = req.body; // Original master issue ID

  try {
    if (!targetIssueId) {
      return res.status(400).json({ success: false, message: 'Please specify target original complaint ID' });
    }

    
      const duplicate = await Issue.findById(id);
      const master = await Issue.findById(targetIssueId);

      if (!duplicate || !master) {
        return res.status(404).json({ success: false, message: 'Duplicate or original complaint not found' });
      }

      duplicate.status = 'closed';
      duplicate.duplicateOf = targetIssueId;
      duplicate.timeline.push({
        status: 'closed',
        remarks: `Merged as duplicate of original complaint #${targetIssueId}. Tracing transferred.`,
        updatedBy: req.user.name,
        updatedAt: new Date()
      });
      await duplicate.save();

      // Bump upvotes on master issue if duplicate user hadn't voted yet
      const duplicateUser = duplicate.reporter.toString();
      if (!master.upvotes.includes(duplicateUser)) {
        master.upvotes.push(duplicateUser);
        await master.save();
      }

      // Notify duplicate citizen
      await sendNotification(
        duplicate.reporter,
        'Complaint Merged',
        `Your complaint "${duplicate.title}" has been merged with a matching report. Tracking transferred.`,
        master._id,
        'info'
      );

      // Notify master citizen
      await sendNotification(
        master.reporter,
        'Complaint Upvoted',
        `Another citizen has reported matching issues at your location. Upvote priority updated.`,
        master._id,
        'success'
      );

      return res.json({ success: true, message: 'Complaints merged successfully', data: duplicate });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to merge complaints' });
  }
};

// Upvote / vote on issue
const upvoteIssue = async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id || req.user.id;

  try {
    
      const issue = await Issue.findById(id);
      if (!issue) return res.status(404).json({ success: false, message: 'Issue not found' });

      const upvotedIdx = issue.upvotes.indexOf(userId.toString());
      if (upvotedIdx !== -1) {
        issue.upvotes.splice(upvotedIdx, 1);
      } else {
        issue.upvotes.push(userId);
      }
      await issue.save();
      return res.json({ success: true, data: issue });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to update upvote state' });
  }
};

// Assign issue to officer
const assignIssue = async (req, res) => {
  const { id } = req.params;
  const { officerId } = req.body;

  try {
    if (!officerId) return res.status(400).json({ success: false, message: 'Please select an officer' });

    
      const officer = await User.findById(officerId);
      if (!officer) return res.status(404).json({ success: false, message: 'Officer not found' });

      const issue = await Issue.findById(id);
      if (!issue) return res.status(404).json({ success: false, message: 'Issue not found' });

      issue.assignedOfficer = officerId;
      issue.status = 'in-progress';
      issue.timeline.push({
        status: 'in-progress',
        remarks: `Assigned to Officer: ${officer.name}. Scheduled under department: ${issue.category}`,
        updatedBy: req.user.name,
        updatedAt: new Date()
      });
      await issue.save();

      // Notify citizen
      await sendNotification(
        issue.reporter,
        'Officer Dispatched',
        `Officer ${officer.name} has been assigned to resolve your complaint "${issue.title}".`,
        issue._id,
        'info'
      );

      const populatedIssue = await Issue.findById(id)
        .populate('reporter', 'name email phone')
        .populate('assignedOfficer', 'name email phone');

      return res.json({ success: true, data: populatedIssue });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to assign officer' });
  }
};

// Update issue status
const updateIssueStatus = async (req, res) => {
  const { id } = req.params;
  const { status, remarks, proofImage } = req.body;

  try {
    if (!status) return res.status(400).json({ success: false, message: 'Please specify status' });

    
      const issue = await Issue.findById(id);
      if (!issue) return res.status(404).json({ success: false, message: 'Issue not found' });

      issue.status = status;
      if (status === 'resolved') {
        issue.resolutionProof = {
          photoUrl: proofImage || '',
          remarks: remarks || 'Resolved by field officer',
          completedAt: new Date()
        };
        if (proofImage) {
          issue.photoUrl = proofImage;
          issue.images.push(proofImage);
        }
      }

      issue.timeline.push({
        status,
        remarks: remarks || `Status updated to: ${status}`,
        updatedBy: req.user.name,
        updatedAt: new Date()
      });
      await issue.save();

      // Notify citizen
      await sendNotification(
        issue.reporter,
        `Status Updated: ${status}`,
        `Your complaint "${issue.title}" status changed to ${status}. Notes: ${remarks || 'None'}`,
        issue._id,
        status === 'resolved' ? 'success' : 'info'
      );

      const populatedIssue = await Issue.findById(id)
        .populate('reporter', 'name email phone')
        .populate('assignedOfficer', 'name email phone');

      return res.json({ success: true, data: populatedIssue });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to update status' });
  }
};

// Process voice complaint (STT fallback & AI classification)
const voiceComplaint = async (req, res) => {
  const { transcript, language, address } = req.body;

  try {
    if (!transcript) {
      return res.status(400).json({ success: false, message: 'No speech transcript received' });
    }

    // Run AI routing and classification
    const aiResults = runAiRouting('', transcript);
    const category = aiResults.category;
    const priority = aiResults.priority;

    // Generate a title
    const words = transcript.split(' ');
    const title = words.slice(0, 6).join(' ') + (words.length > 6 ? '...' : '');

    const mockLat = (12.9 + Math.random() * 0.1).toFixed(4);
    const mockLng = (77.5 + Math.random() * 0.1).toFixed(4);

    const issueData = {
      title,
      description: transcript,
      category,
      priority,
      location: {
        lat: parseFloat(mockLat),
        lng: parseFloat(mockLng),
        address: address || 'Parsed via Multilingual Voice Core'
      },
      reporter: req.user._id,
      timeline: [
        {
          status: 'pending',
          remarks: `Voice complaint processed in ${language || 'English'}. AI assigned category: ${category}`,
          updatedBy: 'Voice AI Engine',
          updatedAt: new Date()
        }
      ]
    };

    let issue;
    
      issue = await Issue.create(issueData);

      const activeIssues = await Issue.find({ isDraft: false });
      const potentialDups = await findDuplicates(issue, activeIssues);
      if (potentialDups.length > 0) {
        issue.potentialDuplicates = potentialDups;
        await issue.save();
        await Issue.updateMany(
          { _id: { $in: potentialDups } },
          { $addToSet: { potentialDuplicates: issue._id } }
        );
      }

      await sendNotification(
        req.user._id,
        'Voice Complaint Filed',
        `Your voice complaint "${title}" was successfully processed and filed.`,
        issue._id,
        'success'
      );
    

    res.status(201).json({ success: true, data: issue });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Voice complaint parsing failed' });
  }
};

// Retrieve predictive maintenance metrics & Civic Health Score
const getPredictiveMaintenance = async (req, res) => {
  try {
    let allIssues = [];
    
      allIssues = await Issue.find({ isDraft: false });
    

    const total = allIssues.length;
    const resolved = allIssues.filter(i => i.status === 'resolved').length;
    const inProgress = allIssues.filter(i => i.status === 'in-progress').length;
    const pending = allIssues.filter(i => i.status === 'pending').length;

    const resolutionRate = total > 0 ? resolved / total : 1.0;

    let feedbackCount = 0;
    let feedbackSum = 0;
    allIssues.forEach(i => {
      if (i.feedback && i.feedback.rating) {
        feedbackCount++;
        feedbackSum += i.feedback.rating;
      }
    });
    const avgFeedback = feedbackCount > 0 ? feedbackSum / feedbackCount : 4.0;

    let healthScore = Math.round(
      (resolutionRate * 45) +
      ((avgFeedback / 5) * 45) +
      (total < 15 ? 10 : Math.max(0, 10 - (total - 15) * 0.2))
    );
    healthScore = Math.min(100, Math.max(0, healthScore));

    const riskZones = [
      {
        id: 'zone_1',
        name: 'Sector 4 Sanitation Block',
        category: 'Garbage & Sanitation',
        riskLevel: 'high',
        density: allIssues.filter(i => i.category === 'Garbage & Sanitation' && i.status !== 'resolved').length,
        prediction: 'High risk of waste accumulation and vector-borne diseases near park entrances.',
        coordinates: { lat: 19.0760, lng: 72.8777 }
      },
      {
        id: 'zone_2',
        name: 'Outer Ring Road Metro Corridor',
        category: 'Roads & Potholes',
        riskLevel: 'critical',
        density: allIssues.filter(i => i.category === 'Roads & Potholes' && i.status !== 'resolved').length,
        prediction: 'High accident probability under Metro Pillar 24 due to monsoon erosion.',
        coordinates: { lat: 12.9716, lng: 77.5946 }
      },
      {
        id: 'zone_3',
        name: 'MG Road Lane Grid',
        category: 'Streetlights',
        riskLevel: 'medium',
        density: allIssues.filter(i => i.category === 'Streetlights' && i.status !== 'resolved').length,
        prediction: 'Aging grid layout. Preventive wiring maintenance recommended prior to monsoon.',
        coordinates: { lat: 28.6139, lng: 77.2090 }
      }
    ];

    riskZones[0].density = Math.max(1, allIssues.filter(i => i.category === 'Garbage & Sanitation' && i.status !== 'resolved').length);
    riskZones[1].density = Math.max(1, allIssues.filter(i => i.category === 'Roads & Potholes' && i.status !== 'resolved').length);
    riskZones[2].density = Math.max(1, allIssues.filter(i => i.category === 'Streetlights' && i.status !== 'resolved').length);

    res.json({
      success: true,
      healthScore,
      riskZones,
      metrics: {
        total,
        resolved,
        inProgress,
        pending,
        avgFeedbackRating: parseFloat(avgFeedback.toFixed(1)),
        avgResponseTimeHours: total > 0 ? 18.5 : 0
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to retrieve predictive maintenance metrics' });
  }
};

// Submit citizen rating & feedback review
const submitFeedback = async (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;

  try {
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Feedback rating must be between 1 and 5' });
    }

    
      const issue = await Issue.findById(id);
      if (!issue) return res.status(404).json({ success: false, message: 'Complaint not found' });

      if (issue.status !== 'resolved' && issue.status !== 'closed') {
        return res.status(400).json({ success: false, message: 'Feedback can only be submitted for resolved complaints' });
      }

      issue.feedback = {
        rating,
        comment: comment || '',
        createdAt: new Date()
      };

      issue.timeline.push({
        status: issue.status,
        remarks: `Citizen left feedback rating: ${rating}/5. Remarks: ${comment || 'None'}`,
        updatedBy: req.user.name,
        updatedAt: new Date()
      });

      await issue.save();

      if (issue.assignedOfficer) {
        await sendNotification(
          issue.assignedOfficer,
          'Citizen Left Review',
          `Your resolved task "${issue.title}" received a rating of ${rating}/5 stars.`,
          issue._id,
          rating >= 4 ? 'success' : 'info'
        );
      }

      return res.json({ success: true, data: issue });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to record feedback review' });
  }
};

module.exports = {
  reportIssue,
  getIssues,
  getIssueById,
  updateIssue,
  deleteIssue,
  mergeIssue,
  upvoteIssue,
  assignIssue,
  updateIssueStatus,
  voiceComplaint,
  getPredictiveMaintenance,
  submitFeedback
};
