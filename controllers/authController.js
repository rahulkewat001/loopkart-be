const User           = require('../models/User');
const generateTokens = require('../middleware/generateTokens');
const jwt            = require('jsonwebtoken');

// ─── Register ─────────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password)
      return res.status(400).json({ message: 'All fields are required' });

    if (password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' });

    // Check if user exists
    const exists = await User.findOne({ email });
    if (exists)
      return res.status(409).json({ message: 'Email already registered' });

    // Create user
    const user = await User.create({ name, email, password });
    
    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Save refresh token
    await User.updateOne({ _id: user._id }, { $push: { refreshTokens: refreshToken } });

    res.status(201).json({ user, accessToken, refreshToken });
  } catch (err) {
    console.error('Registration error:', err);
    
    // Handle specific MongoDB errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Email already registered' });
    }
    
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── Login ────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required' });

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' });

    const { accessToken, refreshToken } = generateTokens(user._id);
    await User.updateOne({ _id: user._id }, { $push: { refreshTokens: refreshToken } });

    res.json({ user, accessToken, refreshToken });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── Google OAuth ─────────────────────────────────────────────
const googleAuth = async (req, res) => {
  try {
    const { email, name, googleId, avatar } = req.body;

    if (!email || !name || !googleId)
      return res.status(400).json({ message: 'Missing required Google data' });

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user with Google data
      user = await User.create({
        name,
        email,
        password: Math.random().toString(36).slice(-8) + 'Aa1!', // Random password (won't be used)
        avatar: avatar || undefined,
        googleId
      });
    } else if (!user.googleId) {
      // Link Google account to existing user
      user.googleId = googleId;
      if (avatar && !user.avatar) user.avatar = avatar;
      await user.save();
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);
    await User.updateOne({ _id: user._id }, { $push: { refreshTokens: refreshToken } });

    res.json({ user, accessToken, refreshToken });
  } catch (err) {
    console.error('Google auth error:', err);
    res.status(500).json({ message: 'Google authentication failed', error: err.message });
  }
};

// ─── Logout ───────────────────────────────────────────────────
const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      await User.findByIdAndUpdate(decoded.id, {
        $pull: { refreshTokens: refreshToken },
      });
    }
    res.json({ message: 'Logged out' });
  } catch {
    res.json({ message: 'Logged out' });
  }
};

// ─── Refresh Token ────────────────────────────────────────────
const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) return res.status(401).json({ message: 'No refresh token' });

    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    const user    = await User.findById(decoded.id);

    if (!user || !user.refreshTokens.includes(token))
      return res.status(403).json({ message: 'Invalid refresh token' });

    // Rotate tokens
    user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
    const { accessToken, refreshToken: newRefresh } = generateTokens(user._id);
    user.refreshTokens.push(newRefresh);
    await user.save();

    res.json({ accessToken, refreshToken: newRefresh });
  } catch {
    res.status(403).json({ message: 'Invalid or expired refresh token' });
  }
};

module.exports = { register, login, googleAuth, logout, refreshToken };
