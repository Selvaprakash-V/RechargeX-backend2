const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Helper function to convert stored image to data URL
const getProfilePhotoUrl = (profilePhoto) => {
  if (profilePhoto && profilePhoto.data && profilePhoto.contentType) {
    return `data:${profilePhoto.contentType};base64,${profilePhoto.data}`;
  }
  return "";
};

// Helper function to format user response with profile photo URL
const formatUserResponse = (user) => {
  const userObj = user.toObject();
  userObj.profilePhoto = getProfilePhotoUrl(user.profilePhoto);
  delete userObj.password;
  return userObj;
};

// 👉 REGISTER / CREATE user
exports.createUser = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email: email.toLowerCase() }, { phone }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ error: "User with this email or phone already exists" });
    }

    // Hash password using bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email: email.toLowerCase(),
      phone,
      password: hashedPassword,
      role: role || "USER"
    });

    const savedUser = await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: savedUser._id, role: savedUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Format user response with profile photo URL
    const userResponse = formatUserResponse(savedUser);

    res.status(201).json({
      message: "User registered successfully",
      user: userResponse,
      token
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


// 👉 LOGIN user
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    
    // Compare password using bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    
    if (!user.isActive) {
      return res.status(403).json({ message: "Account is deactivated" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );
    
    // Format user response with profile photo URL
    const userResponse = formatUserResponse(user);
    
    res.json({ 
      message: "Login successful", 
      user: userResponse,
      token 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// 👉 GET all users (Protected - Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    const formattedUsers = users.map(user => formatUserResponse(user));
    res.json(formattedUsers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// 👉 GET single user by ID (Protected)
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(formatUserResponse(user));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


// 👉 UPDATE user (Protected)
exports.updateUser = async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    // If password is being updated, hash it
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(formatUserResponse(updatedUser));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


// 👉 DELETE user (Protected - Admin only)
exports.deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


// 👉 GET current logged-in user profile (Protected)
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(formatUserResponse(user));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 👉 UPLOAD profile photo (Protected) - Store in MongoDB
exports.uploadPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Convert image buffer to Base64 string
    const base64Image = req.file.buffer.toString('base64');
    const contentType = req.file.mimetype;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { 
        profilePhoto: {
          data: base64Image,
          contentType: contentType
        }
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Return the image as a data URL for frontend use
    const profilePhotoUrl = `data:${contentType};base64,${base64Image}`;

    // Format user response
    const userResponse = formatUserResponse(user);

    res.json({ profilePhoto: profilePhotoUrl, user: userResponse });
  } catch (err) {
    console.error("Upload photo error:", err);
    res.status(500).json({ error: err.message });
  }
};
