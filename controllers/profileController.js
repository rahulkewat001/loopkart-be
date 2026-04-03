const User = require('../models/User');
const cloudinary = require('cloudinary').v2;

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

const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'loopkart/avatars', width: 200, height: 200, crop: 'fill' },
      async (err, result) => {
        if (err) return res.status(500).json({ message: 'Upload failed', error: err.message });
        
        const user = await User.findByIdAndUpdate(
          req.user._id,
          { avatar: result.secure_url },
          { new: true }
        ).select('-password -refreshTokens');
        
        res.json({ user });
      }
    );
    
    require('stream').Readable.from(req.file.buffer).pipe(uploadStream);
  } catch (err) {
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
};

module.exports = { getMe, updateMe, changePassword, uploadAvatar };
