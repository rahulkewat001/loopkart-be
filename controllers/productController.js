const Product = require('../models/Product');

const getProducts = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (search)   filter.$or = [
      { name:        { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { category:    { $regex: search, $options: 'i' } },
    ];

    const total    = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .skip((+page - 1) * +limit)
      .limit(+limit)
      .sort({ createdAt: -1 });

    res.json({ products, total, page: +page, pages: Math.ceil(total / +limit) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ product });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getRelatedProducts = async (req, res) => {
  try {
    const product  = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Not found' });
    const related = await Product.find({
      category: product.category,
      _id:      { $ne: product._id },
      status:   'active',
    }).limit(4);
    res.json({ products: related });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const seedProducts = async (req, res) => {
  try {
    await Product.deleteMany({});
    const products = [
      {
        name: 'Wireless Noise-Cancelling Headphones',
        emoji: '🎧',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
        images: [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
          'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&q=80',
          'https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?w=600&q=80',
        ],
        price: 2999, originalPrice: 4999, rating: 4.5, reviews: 1240,
        badge: 'Best Seller', category: 'Electronics',
        description: 'Premium wireless headphones with active noise cancellation, 30hr battery life and crystal clear sound. Foldable design with premium cushioning for all-day comfort.',
      },
      {
        name: 'Smart Watch Series 5 Pro',
        emoji: '⌚',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80',
        images: [
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80',
          'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&q=80',
          'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&q=80',
        ],
        price: 5499, originalPrice: 7999, rating: 4.7, reviews: 856,
        badge: 'New', category: 'Electronics',
        description: 'Feature-packed smartwatch with health tracking, GPS, AMOLED display and 7-day battery. Water resistant up to 50m.',
      },
      {
        name: 'Running Shoes Ultra Boost',
        emoji: '👟',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
        images: [
          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
          'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&q=80',
          'https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&q=80',
        ],
        price: 1799, originalPrice: 2999, rating: 4.3, reviews: 2100,
        badge: 'Sale', category: 'Fashion',
        description: 'Lightweight running shoes with responsive cushioning and breathable mesh upper. Perfect for daily runs and gym workouts.',
      },
      {
        name: 'Portable Bluetooth Speaker',
        emoji: '🔊',
        image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&q=80',
        images: [
          'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&q=80',
          'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&q=80',
        ],
        price: 1299, originalPrice: 1999, rating: 4.6, reviews: 678,
        badge: null, category: 'Electronics',
        description: '360° surround sound, waterproof IPX7 design, 12hr playtime. Perfect for outdoors, beach and travel.',
      },
      {
        name: 'Organic Face Serum 30ml',
        emoji: '✨',
        image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80',
        images: [
          'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80',
          'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&q=80',
        ],
        price: 899, originalPrice: 1499, rating: 4.8, reviews: 3200,
        badge: 'Top Rated', category: 'Beauty',
        description: 'Vitamin C enriched face serum for glowing skin. Dermatologist tested, cruelty-free. Reduces dark spots in 4 weeks.',
      },
      {
        name: 'Stainless Steel Water Bottle',
        emoji: '🍶',
        image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&q=80',
        images: [
          'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&q=80',
          'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=600&q=80',
        ],
        price: 499, originalPrice: 799, rating: 4.4, reviews: 540,
        badge: null, category: 'Kitchen',
        description: 'Double-wall insulated bottle keeps drinks cold 24hrs, hot 12hrs. BPA free, leak-proof lid. 750ml capacity.',
      },
      {
        name: 'Mechanical Gaming Keyboard',
        emoji: '⌨️',
        image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80',
        images: [
          'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80',
          'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=600&q=80',
        ],
        price: 3499, originalPrice: 4999, rating: 4.6, reviews: 920,
        badge: 'Hot', category: 'Electronics',
        description: 'RGB backlit mechanical keyboard with tactile switches, anti-ghosting, N-key rollover and USB-C connectivity.',
      },
      {
        name: 'Yoga Mat Premium Non-Slip',
        emoji: '🧘',
        image: 'https://images.unsplash.com/photo-1601925228008-f5e4c5e5e5e5?w=600&q=80',
        images: [
          'https://images.unsplash.com/photo-1601925228008-f5e4c5e5e5e5?w=600&q=80',
          'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80',
        ],
        price: 699, originalPrice: 1199, rating: 4.5, reviews: 1560,
        badge: null, category: 'Sports',
        description: 'Extra thick 6mm yoga mat with alignment lines, carrying strap and non-slip surface. Eco-friendly TPE material.',
      },
      {
        name: 'Men\'s Classic White T-Shirt',
        emoji: '👕',
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80',
        images: [
          'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80',
          'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600&q=80',
        ],
        price: 399, originalPrice: 699, rating: 4.2, reviews: 4500,
        badge: 'Sale', category: 'Fashion',
        description: '100% pure cotton, pre-shrunk, available in 12 colors. Everyday comfort wear with a relaxed fit.',
      },
      {
        name: 'Non-Stick Frying Pan 28cm',
        emoji: '🍳',
        image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80',
        images: [
          'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80',
          'https://images.unsplash.com/photo-1585515320310-259814833e62?w=600&q=80',
        ],
        price: 899, originalPrice: 1499, rating: 4.5, reviews: 2300,
        badge: null, category: 'Kitchen',
        description: 'Granite coated non-stick pan, induction compatible, PFOA free coating. Ergonomic heat-resistant handle.',
      },
      {
        name: 'Bestselling Novel Collection',
        emoji: '📚',
        image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80',
        images: [
          'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80',
          'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=600&q=80',
        ],
        price: 599, originalPrice: 999, rating: 4.9, reviews: 6700,
        badge: 'Best Seller', category: 'Books',
        description: 'Set of 5 bestselling fiction novels. Perfect for book lovers and gifting. Includes award-winning titles.',
      },
      {
        name: 'Kids Building Blocks Set 120pcs',
        emoji: '🧸',
        image: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600&q=80',
        images: [
          'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600&q=80',
          'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
        ],
        price: 799, originalPrice: 1299, rating: 4.7, reviews: 890,
        badge: null, category: 'Toys',
        description: '120-piece colorful building blocks set. Develops creativity and motor skills. Safe, non-toxic materials for ages 3+.',
      },
      {
        name: 'DSLR Camera Bag Backpack',
        emoji: '📷',
        image: 'https://images.unsplash.com/photo-1553652297-3b1a3b5e5e5e?w=600&q=80',
        images: [
          'https://images.unsplash.com/photo-1553652297-3b1a3b5e5e5e?w=600&q=80',
          'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80',
        ],
        price: 1499, originalPrice: 2499, rating: 4.4, reviews: 430,
        badge: null, category: 'Electronics',
        description: 'Waterproof DSLR camera backpack with padded compartments, laptop sleeve and tripod holder. Fits 15" laptop.',
      },
      {
        name: 'Leather Wallet Slim Bifold',
        emoji: '👜',
        image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&q=80',
        images: [
          'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&q=80',
          'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80',
        ],
        price: 699, originalPrice: 1199, rating: 4.3, reviews: 1100,
        badge: null, category: 'Fashion',
        description: 'Genuine leather slim bifold wallet with RFID blocking. 6 card slots, 2 cash compartments. Available in 4 colors.',
      },
      {
        name: 'Scented Candle Gift Set',
        emoji: '🕯️',
        image: 'https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=600&q=80',
        images: [
          'https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=600&q=80',
          'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=600&q=80',
        ],
        price: 599, originalPrice: 999, rating: 4.6, reviews: 780,
        badge: 'New', category: 'Home & Living',
        description: 'Set of 4 premium scented candles — Lavender, Vanilla, Sandalwood & Rose. 40hr burn time each. Perfect gift.',
      },
      {
        name: 'Resistance Bands Set 5-Pack',
        emoji: '💪',
        image: 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=600&q=80',
        images: [
          'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=600&q=80',
          'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80',
        ],
        price: 449, originalPrice: 799, rating: 4.5, reviews: 2200,
        badge: 'Hot', category: 'Sports',
        description: '5 resistance levels from light to extra heavy. Made from natural latex. Includes carry bag and exercise guide.',
      },
    ];
    await Product.insertMany(products);
    res.json({ message: `${products.length} products seeded with real images` });
  } catch (err) {
    res.status(500).json({ message: 'Seed failed', error: err.message });
  }
};

module.exports = { getProducts, getProduct, getRelatedProducts, seedProducts };
