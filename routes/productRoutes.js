const router  = require('express').Router();
const { getProducts, getProduct, getRelatedProducts, seedProducts } = require('../controllers/productController');

router.get('/',              getProducts);
router.get('/seed',          seedProducts);
router.get('/:id/related',   getRelatedProducts);
router.get('/:id',           getProduct);
router.put('/:id/view',      async (req, res) => {
  try {
    await require('../models/Product').findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    res.json({ ok: true });
  } catch { res.json({ ok: false }); }
});

module.exports = router;
