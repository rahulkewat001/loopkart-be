const Product = require('../models/Product');
const User = require('../models/User');

const sortMap = {
  latest: { createdAt: -1 },
  trending: { views: -1, rating: -1, createdAt: -1 },
  price_asc: { price: 1, createdAt: -1 },
  price_desc: { price: -1, createdAt: -1 },
  rating: { rating: -1, reviews: -1, createdAt: -1 },
};

const variantDescriptors = ['Studio Select', 'Eco Edition', 'Urban Loop', 'Renew Drop', 'Second Story', 'Weekend Archive'];
const variantCities = ['Bengaluru', 'Mumbai', 'Delhi', 'Pune', 'Hyderabad', 'Chennai', 'Ahmedabad', 'Kolkata', 'Jaipur', 'Goa'];
const variantConditions = ['like_new', 'good', 'fair', 'new'];
const variantBadges = [null, 'Trending', 'Fresh Drop', 'Rare Find', 'Top Rated', 'Editor Pick'];
const variantUsageNotes = [
  'Professionally checked, cleaned, and relisted for its next owner.',
  'Gently used and kept in rotation with other items from the same collection.',
  'Minor cosmetic wear only. Core performance and usability still excellent.',
  'Stored carefully between uses and relisted after a condition review.',
  'Seller-kept with maintenance records and recent quality checks.',
  'Verified working condition with fresh photos and updated listing details.',
];

const upsertDemoUser = async (fixture) => {
  let user = await User.findOne({ email: fixture.email });

  if (!user) {
    user = new User(fixture);
  } else {
    user.name = fixture.name;
    user.email = fixture.email;
    user.password = fixture.password;
    user.role = fixture.role || 'user';
    user.avatar = fixture.avatar || null;
    user.sellerProfile = fixture.sellerProfile || user.sellerProfile;
  }

  user.password = fixture.password;
  user.role = fixture.role || 'user';
  user.avatar = fixture.avatar || null;

  if (fixture.sellerProfile) {
    user.sellerProfile = {
      ...user.sellerProfile?.toObject?.(),
      ...fixture.sellerProfile,
    };
  }

  user.refreshTokens = [];
  await user.save();
  return user;
};

const getProducts = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12, sort = 'latest' } = req.query;
    const currentPage = Math.max(1, Number(page) || 1);
    const pageSize = Math.max(1, Number(limit) || 12);
    const filter = { status: 'active' };

    if (category) filter.category = category;
    if (search)   filter.$or = [
      { name:        { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { category:    { $regex: search, $options: 'i' } },
    ];

    const total    = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .sort(sortMap[sort] || sortMap.latest)
      .skip((currentPage - 1) * pageSize)
      .limit(pageSize);

    res.json({ products, total, page: currentPage, pages: Math.max(1, Math.ceil(total / pageSize)) });
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
    const sellerFixtures = [
      {
        name: 'Aarav Menon',
        email: 'aarav.seller@loopkart.dev',
        password: 'loopkart123',
        role: 'seller',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=80',
        sellerProfile: {
          shopName: 'Renewed Circuit',
          shopDesc: 'Carefully restored gadgets and workstation gear.',
          phone: '9876543210',
          city: 'Bengaluru',
          state: 'Karnataka',
          approved: true,
          totalSales: 184,
          rating: 4.8,
        },
      },
      {
        name: 'Meera Sethi',
        email: 'meera.seller@loopkart.dev',
        password: 'loopkart123',
        role: 'seller',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80',
        sellerProfile: {
          shopName: 'Second Story Studio',
          shopDesc: 'Curated lifestyle, fashion, and home finds with minimal wear.',
          phone: '9865321470',
          city: 'Delhi',
          state: 'Delhi',
          approved: true,
          totalSales: 232,
          rating: 4.9,
        },
      },
      {
        name: 'Kabir Deshmukh',
        email: 'kabir.seller@loopkart.dev',
        password: 'loopkart123',
        role: 'seller',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&q=80',
        sellerProfile: {
          shopName: 'ReLoop Sports',
          shopDesc: 'Performance gear and accessories with verified condition checks.',
          phone: '9812345678',
          city: 'Pune',
          state: 'Maharashtra',
          approved: true,
          totalSales: 146,
          rating: 4.7,
        },
      },
      {
        name: 'Naina Kapoor',
        email: 'naina.seller@loopkart.dev',
        password: 'loopkart123',
        role: 'seller',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&q=80',
        sellerProfile: {
          shopName: 'Loop Luxe Closet',
          shopDesc: 'Premium pre-owned fashion and design-forward accessories.',
          phone: '9898989898',
          city: 'Mumbai',
          state: 'Maharashtra',
          approved: true,
          totalSales: 301,
          rating: 4.9,
        },
      },
    ];

    const buyerFixtures = [
      { name: 'Ishaan Rao', email: 'ishaan.buyer@loopkart.dev', password: 'loopkart123', role: 'user' },
      { name: 'Tanya Arora', email: 'tanya.buyer@loopkart.dev', password: 'loopkart123', role: 'user' },
      { name: 'Riya Bansal', email: 'riya.buyer@loopkart.dev', password: 'loopkart123', role: 'user' },
      { name: 'Arjun Malhotra', email: 'arjun.buyer@loopkart.dev', password: 'loopkart123', role: 'user' },
      { name: 'Neha Joshi', email: 'neha.buyer@loopkart.dev', password: 'loopkart123', role: 'user' },
      { name: 'Sanjay Pillai', email: 'sanjay.buyer@loopkart.dev', password: 'loopkart123', role: 'user' },
    ];

    const sellers = [];

    for (const fixture of sellerFixtures) {
      const seller = await upsertDemoUser(fixture);
      sellers.push(seller);
    }

    for (const fixture of buyerFixtures) {
      await upsertDemoUser(fixture);
    }

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
        manufacturer: 'Sony',
        usageSummary: 'Refurbished and tested. Ear cushions replaced recently.',
        usageMonths: 8,
        healthScore: 92,
        city: 'Bengaluru',
        material: 'Aluminium + memory foam',
        carbonSavedKg: 22,
        wasteSavedKg: 4,
        views: 1480,
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
        manufacturer: 'Apple',
        usageSummary: 'Used gently for a quarter. Battery health still strong.',
        usageMonths: 5,
        healthScore: 94,
        city: 'Mumbai',
        material: 'Recycled aluminium case',
        carbonSavedKg: 18,
        wasteSavedKg: 2,
        views: 1240,
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
        manufacturer: 'Adidas',
        usageSummary: 'Rotated with two other pairs. Soles are still springy.',
        usageMonths: 6,
        healthScore: 89,
        city: 'Pune',
        material: 'Primeknit + rubber',
        carbonSavedKg: 15,
        wasteSavedKg: 3,
        views: 1040,
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
        manufacturer: 'JBL',
        usageSummary: 'Weekend use only. Waterproof seals recently checked.',
        usageMonths: 7,
        healthScore: 91,
        city: 'Delhi',
        material: 'Fabric mesh + recycled polymer',
        carbonSavedKg: 11,
        wasteSavedKg: 2,
        views: 930,
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
        manufacturer: 'Minimalist',
        usageSummary: 'Factory sealed excess inventory from a studio store.',
        usageMonths: 0,
        healthScore: 99,
        city: 'Delhi',
        material: 'Glass bottle',
        carbonSavedKg: 5,
        wasteSavedKg: 1,
        views: 860,
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
        manufacturer: 'Milton',
        usageSummary: 'Used for office commutes. Exterior has a minor scratch.',
        usageMonths: 10,
        healthScore: 88,
        city: 'Hyderabad',
        material: 'Stainless steel',
        carbonSavedKg: 8,
        wasteSavedKg: 1,
        views: 670,
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
        manufacturer: 'Keychron',
        usageSummary: 'Desk-kept with custom keycap cleaning done monthly.',
        usageMonths: 11,
        healthScore: 93,
        city: 'Bengaluru',
        material: 'Aluminium + PBT keycaps',
        carbonSavedKg: 19,
        wasteSavedKg: 3,
        views: 1180,
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
        manufacturer: 'Boldfit',
        usageSummary: 'Home yoga only. Sanitized and rolled flat after each session.',
        usageMonths: 4,
        healthScore: 95,
        city: 'Goa',
        material: 'TPE foam',
        carbonSavedKg: 6,
        wasteSavedKg: 2,
        views: 780,
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
        manufacturer: 'Uniqlo',
        usageSummary: 'Worn twice for a shoot. Professionally dry-cleaned.',
        usageMonths: 2,
        healthScore: 97,
        city: 'Mumbai',
        material: 'Supima cotton',
        carbonSavedKg: 4,
        wasteSavedKg: 1,
        views: 990,
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
        manufacturer: 'Prestige',
        usageSummary: 'Gently used in a home studio kitchen. Coating in solid shape.',
        usageMonths: 5,
        healthScore: 90,
        city: 'Chennai',
        material: 'Forged aluminium',
        carbonSavedKg: 12,
        wasteSavedKg: 2,
        views: 710,
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
        manufacturer: 'Penguin Random House',
        usageSummary: 'Library-kept edition with crisp pages and no annotations.',
        usageMonths: 9,
        healthScore: 96,
        city: 'Kolkata',
        material: 'Recycled paper',
        carbonSavedKg: 7,
        wasteSavedKg: 2,
        views: 1260,
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
        manufacturer: 'Lego',
        usageSummary: 'All pieces counted and sanitized before relisting.',
        usageMonths: 7,
        healthScore: 94,
        city: 'Ahmedabad',
        material: 'ABS plastic',
        carbonSavedKg: 10,
        wasteSavedKg: 3,
        views: 840,
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
        manufacturer: 'Lowerpro',
        usageSummary: 'Travelled on three shoots. Zippers and padding feel fresh.',
        usageMonths: 8,
        healthScore: 91,
        city: 'Bengaluru',
        material: 'Ballistic nylon',
        carbonSavedKg: 13,
        wasteSavedKg: 2,
        views: 760,
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
        manufacturer: 'Hidesign',
        usageSummary: 'Carried for a month and conditioned before listing.',
        usageMonths: 1,
        healthScore: 95,
        city: 'Mumbai',
        material: 'Full-grain leather',
        carbonSavedKg: 6,
        wasteSavedKg: 1,
        views: 580,
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
        manufacturer: 'Bath & Body Works',
        usageSummary: 'Unused gift set from a holiday pop-up.',
        usageMonths: 0,
        healthScore: 99,
        city: 'Delhi',
        material: 'Soy wax + glass',
        carbonSavedKg: 4,
        wasteSavedKg: 1,
        views: 620,
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
        manufacturer: 'Decathlon',
        usageSummary: 'Used in indoor mobility sessions. Stretch integrity verified.',
        usageMonths: 3,
        healthScore: 96,
        city: 'Pune',
        material: 'Natural latex',
        carbonSavedKg: 5,
        wasteSavedKg: 1,
        views: 1110,
      },
    ];

    const seededProducts = products.map((product, index) => {
      const seller = sellers[index % sellers.length];
      return {
        ...product,
        seller: seller._id,
        sellerName: seller.name,
        isSellerListing: true,
      };
    });

    const expandedProducts = [];

    seededProducts.forEach((product, index) => {
      expandedProducts.push(product);

      for (let iteration = 0; iteration < 6; iteration += 1) {
        const seller = sellers[(index + iteration + 1) % sellers.length];
        const usageMonths = Math.max(0, product.usageMonths + iteration - 2);
        const healthScore = Math.max(78, Math.min(99, product.healthScore - iteration * 2 + (index % 3)));
        const priceBump = 1 + ((iteration - 2) * 0.04);
        const price = Math.max(299, Math.round(product.price * priceBump / 10) * 10);
        const originalPrice = Math.max(price + 200, Math.round(product.originalPrice * (1 + iteration * 0.03) / 10) * 10);

        expandedProducts.push({
          ...product,
          name: `${product.name} ${variantDescriptors[(index + iteration) % variantDescriptors.length]}`,
          price,
          originalPrice,
          rating: Number(Math.min(5, Math.max(4, product.rating + ((iteration % 3) - 1) * 0.1)).toFixed(1)),
          reviews: product.reviews + iteration * 87 + index * 11,
          badge: variantBadges[(index + iteration) % variantBadges.length],
          usageSummary: `${product.usageSummary} ${variantUsageNotes[(index + iteration) % variantUsageNotes.length]}`,
          usageMonths,
          healthScore,
          city: variantCities[(index * 2 + iteration) % variantCities.length],
          carbonSavedKg: product.carbonSavedKg + iteration + (index % 4),
          wasteSavedKg: product.wasteSavedKg + Math.floor(iteration / 2),
          views: product.views + iteration * 140 + index * 35,
          condition: variantConditions[(index + iteration) % variantConditions.length],
          seller: seller._id,
          sellerName: seller.name,
        });
      }
    });

    await Product.insertMany(expandedProducts);
    res.json({ message: `${expandedProducts.length} products and ${sellers.length + buyerFixtures.length} dummy users seeded` });
  } catch (err) {
    res.status(500).json({ message: 'Seed failed', error: err.message });
  }
};

module.exports = { getProducts, getProduct, getRelatedProducts, seedProducts };
