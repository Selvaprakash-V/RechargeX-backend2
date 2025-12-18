const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


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

    // Remove password from response
    const userResponse = savedUser.toObject();
    delete userResponse.password;

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
    
    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;
    
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
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// 👉 GET single user by ID (Protected)
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
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
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updatedUser);
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
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 👉 UPLOAD profile photo (Protected)
exports.uploadPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const photoUrl = `http://localhost:3000/uploads/${req.file.filename}`;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profilePhoto: photoUrl },
      { new: true }
    ).select("-password");

    res.json({ profilePhoto: photoUrl, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
