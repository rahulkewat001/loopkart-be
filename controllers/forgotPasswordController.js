const User       = require('../models/User');
const nodemailer = require('nodemailer');
const generateTokens = require('../middleware/generateTokens');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

// ─── Send OTP ─────────────────────────────────────────────────
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'No account found with this email' });

    const otp    = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    user.resetOtp       = otp;
    user.resetOtpExpiry = expiry;
    await user.save();

    await transporter.sendMail({
      from:    `"LoopKart" <${process.env.EMAIL_USER}>`,
      to:      email,
      subject: 'Your LoopKart Password Reset OTP',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#fff8f5;border-radius:16px;">
          <h2 style="color:#ff6b35;">🛒 LoopKart</h2>
          <h3>Password Reset OTP</h3>
          <p>Use the OTP below to reset your password. It expires in <strong>10 minutes</strong>.</p>
          <div style="font-size:36px;font-weight:800;letter-spacing:8px;color:#ff6b35;text-align:center;padding:20px;background:#fff;border-radius:12px;margin:20px 0;">${otp}</div>
          <p style="color:#999;font-size:13px;">If you didn't request this, ignore this email.</p>
        </div>
      `,
    });

    res.json({ message: 'OTP sent to your email' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to send OTP', error: err.message });
  }
};

// ─── Verify OTP & Reset Password ──────────────────────────────
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user || user.resetOtp !== otp)
      return res.status(400).json({ message: 'Invalid OTP' });

    if (new Date() > user.resetOtpExpiry)
      return res.status(400).json({ message: 'OTP has expired' });

    user.password       = newPassword;
    user.resetOtp       = null;
    user.resetOtpExpiry = null;
    await user.save();

    const { accessToken, refreshToken } = generateTokens(user._id);
    await User.updateOne({ _id: user._id }, { $push: { refreshTokens: refreshToken } });

    res.json({ message: 'Password reset successful', user, accessToken, refreshToken });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { forgotPassword, resetPassword };
