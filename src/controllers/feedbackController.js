const Feedback = require("../models/feedbackModel");

// Create feedback
exports.createFeedback = async (req, res) => {
  try {
    const { userId, name, profilePhoto, feedback, rating } = req.body;
    
    const newFeedback = await Feedback.create({
      userId,
      name,
      profilePhoto: profilePhoto || '',
      feedback,
      rating
    });

    res.status(201).json(newFeedback);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all feedbacks (public)
exports.getApprovedFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ isApproved: true })
      .populate('userId', 'profilePhoto name')
      .sort({ createdAt: -1 })
      .limit(20);
    
    // Map to include user profile photo from the populated userId
    const feedbacksWithPhotos = feedbacks.map(feedback => {
      const feedbackObj = feedback.toObject();
      return {
        ...feedbackObj,
        profilePhoto: feedback.userId?.profilePhoto || feedbackObj.profilePhoto || ''
      };
    });
    
    res.status(200).json(feedbacksWithPhotos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all feedbacks (admin)
exports.getAllFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.status(200).json(feedbacks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Approve feedback (admin)
exports.approveFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    );
    res.status(200).json(feedback);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete feedback
exports.deleteFeedback = async (req, res) => {
  try {
    await Feedback.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Feedback deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
