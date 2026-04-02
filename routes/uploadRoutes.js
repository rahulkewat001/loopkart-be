const router  = require('express').Router();
const protect = require('../middleware/authMiddleware');
const { upload, uploadToCloudinary } = require('../middleware/upload');

// Upload single image
router.post('/image', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const result = await uploadToCloudinary(req.file.buffer, 'loopkart/products');
    res.json({ url: result.secure_url, publicId: result.public_id });
  } catch (err) {
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
});

// Upload multiple images (max 4)
router.post('/images', protect, upload.array('images', 4), async (req, res) => {
  try {
    if (!req.files?.length) return res.status(400).json({ message: 'No files uploaded' });
    const uploads = await Promise.all(
      req.files.map((f) => uploadToCloudinary(f.buffer, 'loopkart/products'))
    );
    res.json({ urls: uploads.map((u) => u.secure_url) });
  } catch (err) {
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
});

module.exports = router;
