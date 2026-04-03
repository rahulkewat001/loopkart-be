const User           = require('../models/User');
const generateTokens = require('../middleware/generateTokens');
const jwt            = require('jsonwebtoken');
const crypto         = require('crypto');

// ─── Register ─────────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: 'All fields are required' });

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(409).json({ message: 'Email already registered' });

    const user = await User.create({ name, email, password });
    const { accessToken, refreshToken } = generateTokens(user._id);

    await User.updateOne({ _id: user._id }, { $push: { refreshTokens: refreshToken } });

    res.status(201).json({ user, accessToken, refreshToken });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── Login ────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !password)
      return res.status(400).json({ message: 'Email and password are required' });

    const user = await User.findOne({ email: normalizedEmail });
    if (!user)
      return res.status(404).json({ message: 'Account does not exist' });

    if (!(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Incorrect password' });

    const { accessToken, refreshToken } = generateTokens(user._id);
    await User.updateOne({ _id: user._id }, { $push: { refreshTokens: refreshToken } });

    res.json({ user, accessToken, refreshToken });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── Google Auth ──────────────────────────────────────────────
const googleAuth = async (req, res) => {
  try {
    const { email, name, googleId, avatar } = req.body;

    if (!email || !name || !googleId) {
      return res.status(400).json({ message: 'Missing Google profile details' });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        googleId,
        avatar: avatar || null,
        password: crypto.randomBytes(24).toString('hex'),
      });
    } else {
      user.name = user.name || name;
      user.googleId = googleId;
      if (avatar && !user.avatar) user.avatar = avatar;
      await user.save();
    }

    const { accessToken, refreshToken } = generateTokens(user._id);
    await User.updateOne({ _id: user._id }, { $push: { refreshTokens: refreshToken } });

    res.json({ user, accessToken, refreshToken });
  } catch (err) {
    res.status(500).json({ message: 'Google login failed', error: err.message });
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
