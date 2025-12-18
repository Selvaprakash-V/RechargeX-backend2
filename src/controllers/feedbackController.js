const Feedback = require("../models/feedbackModel");

// Helper function to convert stored image to data URL
const getProfilePhotoUrl = (profilePhoto) => {
  if (profilePhoto && profilePhoto.data && profilePhoto.contentType) {
    return `data:${profilePhoto.contentType};base64,${profilePhoto.data}`;
  }
  // If it's already a string (data URL or URL), return as is
  if (typeof profilePhoto === 'string') {
    return profilePhoto;
  }
  return "";
};

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
      // Get profile photo from populated user (stored as object with data and contentType)
      const userPhoto = feedback.userId?.profilePhoto;
      const photoUrl = getProfilePhotoUrl(userPhoto) || feedbackObj.profilePhoto || '';
      
      return {
        ...feedbackObj,
        profilePhoto: photoUrl
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
