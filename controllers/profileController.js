const User = require('../models/User');

const getMe = (req, res) => res.json({ user: req.user });

const updateMe = async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, email },
      { new: true, runValidators: true }
    ).select('-password -refreshTokens');
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!(await user.matchPassword(currentPassword)))
      return res.status(400).json({ message: 'Current password is incorrect' });
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const updateAvatar = async (req, res) => {
  try {
    const { avatar } = req.body;
    if (!avatar) return res.status(400).json({ message: 'Avatar URL required' });
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar },
      { new: true }
    ).select('-password -refreshTokens');
    
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getMe, updateMe, changePassword, updateAvatar };
