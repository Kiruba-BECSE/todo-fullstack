const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');


// SIGNUP
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // check if user already exists
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    // hash the password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    // create a token immediately so user is logged in after signup
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid email or password' });

    // compare plain password with hashed one
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid email or password' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
const auth = require('../middleware/auth');

// CHANGE PASSWORD (protected)
router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Current password is incorrect' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
const { sendResetCodeEmail } = require('../utils/mailer');

// STEP 1: request a reset code
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    // don't reveal whether the email exists — always respond the same way
    if (!user) return res.json({ message: 'If that email exists, a code has been sent.' });

    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
    user.resetCode = code;
    user.resetCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min from now
    await user.save();

    await sendResetCodeEmail(user.email, code);

    res.json({ message: 'If that email exists, a code has been sent.' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// STEP 2: verify the code, return a short-lived reset token
router.post('/verify-reset-code', async (req, res) => {
  try {
    const { email, code } = req.body;
    const user = await User.findOne({ email });

    if (!user || user.resetCode !== code || user.resetCodeExpires < new Date()) {
      return res.status(400).json({ error: 'Invalid or expired code' });
    }

    // short-lived token, only valid for resetting password — not a normal login token
    const resetToken = jwt.sign({ id: user._id, purpose: 'reset' }, process.env.JWT_SECRET, { expiresIn: '10m' });

    res.json({ resetToken });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// STEP 3: set the new password using the reset token
router.post('/reset-password', async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    if (decoded.purpose !== 'reset') return res.status(400).json({ error: 'Invalid token' });

    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetCode = null;
    user.resetCodeExpires = null;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    res.status(400).json({ error: 'Invalid or expired reset token' });
  }
});
module.exports = router;