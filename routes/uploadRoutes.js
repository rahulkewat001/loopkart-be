const router  = require('express').Router();
const protect = require('../middleware/authMiddleware');
const { upload, uploadToCloudinary } = require('../middleware/upload');

// Upload single image (root route)
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    console.log('=== Upload Request ===');
    console.log('File received:', req.file ? 'Yes' : 'No');
    if (req.file) {
      console.log('File details:', {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      });
    }
    console.log('Cloudinary config:', {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'NOT SET',
      api_key: process.env.CLOUDINARY_API_KEY ? 'SET' : 'NOT SET',
      api_secret: process.env.CLOUDINARY_API_SECRET ? 'SET' : 'NOT SET'
    });
    
    if (!req.file) {
      console.log('ERROR: No file in request');
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.log('ERROR: Cloudinary credentials missing');
      return res.status(500).json({ message: 'Cloudinary not configured. Please contact admin.' });
    }
    
    console.log('Uploading to Cloudinary...');
    const result = await uploadToCloudinary(req.file.buffer, 'loopkart/products');
    console.log('Upload successful! URL:', result.secure_url);
    res.json({ url: result.secure_url, publicId: result.public_id });
  } catch (err) {
    console.error('=== Upload Error ===');
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
});

// Upload single image (alternate route)
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
