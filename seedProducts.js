const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

const products = [
  // Electronics
  { name: 'Wireless Headphones', emoji: '🎧', category: 'Electronics', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80', price: 2499, originalPrice: 4999, rating: 4.5, reviews: 1250, badge: 'BEST SELLER', description: 'Premium wireless headphones with noise cancellation', stock: 50 },
  { name: 'Smart Watch', emoji: '⌚', category: 'Electronics', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80', price: 3999, originalPrice: 7999, rating: 4.3, reviews: 890, badge: 'SALE', description: 'Fitness tracker with heart rate monitor', stock: 30 },
  { name: 'Bluetooth Speaker', emoji: '🔊', category: 'Electronics', image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&q=80', price: 1999, originalPrice: 3999, rating: 4.6, reviews: 2100, badge: 'TOP RATED', description: 'Portable speaker with 12-hour battery', stock: 75 },
  { name: 'Laptop Stand', emoji: '💻', category: 'Electronics', image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&q=80', price: 899, originalPrice: 1499, rating: 4.4, reviews: 560, description: 'Ergonomic aluminum laptop stand', stock: 100 },
  { name: 'USB-C Hub', emoji: '🔌', category: 'Electronics', image: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=400&q=80', price: 1299, originalPrice: 2499, rating: 4.2, reviews: 340, description: '7-in-1 USB-C multiport adapter', stock: 80 },
  { name: 'Webcam HD', emoji: '📹', category: 'Electronics', image: 'https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=400&q=80', price: 2799, originalPrice: 4999, rating: 4.5, reviews: 670, badge: 'BEST SELLER', description: '1080p HD webcam with auto-focus', stock: 45 },
  { name: 'Mechanical Keyboard', emoji: '⌨️', category: 'Electronics', image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=400&q=80', price: 3499, originalPrice: 5999, rating: 4.7, reviews: 1890, badge: 'TOP RATED', description: 'RGB mechanical gaming keyboard', stock: 60 },
  { name: 'Wireless Mouse', emoji: '🖱️', category: 'Electronics', image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&q=80', price: 799, originalPrice: 1499, rating: 4.3, reviews: 920, description: 'Ergonomic wireless mouse', stock: 120 },
  { name: '4K Monitor', emoji: '🖥️', category: 'Electronics', image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&q=80', price: 18999, originalPrice: 29999, rating: 4.6, reviews: 450, badge: 'SALE', description: '27-inch 4K UHD monitor', stock: 25 },
  { name: 'Phone Case', emoji: '📱', category: 'Electronics', image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&q=80', price: 399, originalPrice: 799, rating: 4.1, reviews: 3400, description: 'Shockproof phone case', stock: 200 },

  // Fashion
  { name: 'Cotton T-Shirt', emoji: '👕', category: 'Fashion', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80', price: 499, originalPrice: 999, rating: 4.4, reviews: 2800, badge: 'BEST SELLER', description: 'Premium cotton round neck t-shirt', stock: 150 },
  { name: 'Denim Jeans', emoji: '👖', category: 'Fashion', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&q=80', price: 1499, originalPrice: 2999, rating: 4.5, reviews: 1560, badge: 'SALE', description: 'Slim fit denim jeans', stock: 90 },
  { name: 'Leather Jacket', emoji: '🧥', category: 'Fashion', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&q=80', price: 3999, originalPrice: 7999, rating: 4.7, reviews: 890, badge: 'TOP RATED', description: 'Genuine leather jacket', stock: 40 },
  { name: 'Sneakers', emoji: '👟', category: 'Fashion', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80', price: 2499, originalPrice: 4999, rating: 4.6, reviews: 3200, badge: 'BEST SELLER', description: 'Comfortable running sneakers', stock: 110 },
  { name: 'Sunglasses', emoji: '🕶️', category: 'Fashion', image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&q=80', price: 899, originalPrice: 1999, rating: 4.3, reviews: 1450, description: 'UV protection sunglasses', stock: 85 },
  { name: 'Backpack', emoji: '🎒', category: 'Fashion', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80', price: 1299, originalPrice: 2499, rating: 4.5, reviews: 2100, badge: 'SALE', description: 'Water-resistant laptop backpack', stock: 70 },
  { name: 'Analog Watch', emoji: '⌚', category: 'Fashion', image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=400&q=80', price: 2999, originalPrice: 5999, rating: 4.4, reviews: 780, description: 'Classic analog wristwatch', stock: 55 },
  { name: 'Leather Belt', emoji: '👔', category: 'Fashion', image: 'https://images.unsplash.com/photo-1624222247344-550fb60583bb?w=400&q=80', price: 599, originalPrice: 1199, rating: 4.2, reviews: 1890, description: 'Genuine leather belt', stock: 130 },
  { name: 'Wallet', emoji: '👛', category: 'Fashion', image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&q=80', price: 799, originalPrice: 1599, rating: 4.3, reviews: 2340, badge: 'BEST SELLER', description: 'Slim leather wallet', stock: 95 },
  { name: 'Baseball Cap', emoji: '🧢', category: 'Fashion', image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&q=80', price: 399, originalPrice: 799, rating: 4.1, reviews: 1670, description: 'Adjustable baseball cap', stock: 140 },

  // Beauty
  { name: 'Face Serum', emoji: '💧', category: 'Beauty', price: 1299, originalPrice: 2499, rating: 4.6, reviews: 3400, badge: 'TOP RATED', description: 'Vitamin C face serum', stock: 80 },
  { name: 'Lipstick Set', emoji: '💄', category: 'Beauty', price: 899, originalPrice: 1799, rating: 4.5, reviews: 2890, badge: 'BEST SELLER', description: 'Matte lipstick set of 5', stock: 100 },
  { name: 'Moisturizer', emoji: '🧴', category: 'Beauty', price: 799, originalPrice: 1499, rating: 4.4, reviews: 4200, description: 'Hydrating face moisturizer', stock: 120 },
  { name: 'Perfume', emoji: '🌸', category: 'Beauty', price: 1999, originalPrice: 3999, rating: 4.7, reviews: 1560, badge: 'SALE', description: 'Long-lasting eau de parfum', stock: 65 },
  { name: 'Nail Polish', emoji: '💅', category: 'Beauty', price: 299, originalPrice: 599, rating: 4.2, reviews: 2100, description: 'Quick-dry nail polish', stock: 180 },
  { name: 'Eye Shadow Palette', emoji: '🎨', category: 'Beauty', price: 1499, originalPrice: 2999, rating: 4.6, reviews: 1890, badge: 'TOP RATED', description: '12-color eye shadow palette', stock: 75 },
  { name: 'Foundation', emoji: '✨', category: 'Beauty', price: 1199, originalPrice: 2399, rating: 4.5, reviews: 2340, badge: 'BEST SELLER', description: 'Full coverage foundation', stock: 90 },
  { name: 'Mascara', emoji: '👁️', category: 'Beauty', price: 699, originalPrice: 1399, rating: 4.3, reviews: 3100, description: 'Volumizing mascara', stock: 110 },
  { name: 'Face Mask', emoji: '😷', category: 'Beauty', price: 499, originalPrice: 999, rating: 4.4, reviews: 5600, badge: 'SALE', description: 'Sheet mask pack of 10', stock: 150 },
  { name: 'Hair Oil', emoji: '🧴', category: 'Beauty', price: 599, originalPrice: 1199, rating: 4.5, reviews: 4800, description: 'Nourishing hair oil', stock: 130 },

  // Home & Living
  { name: 'Table Lamp', emoji: '💡', category: 'Home & Living', price: 1299, originalPrice: 2499, rating: 4.4, reviews: 890, badge: 'BEST SELLER', description: 'LED desk lamp with dimmer', stock: 70 },
  { name: 'Wall Clock', emoji: '🕐', category: 'Home & Living', price: 899, originalPrice: 1799, rating: 4.3, reviews: 1230, description: 'Silent wall clock', stock: 85 },
  { name: 'Cushion Cover', emoji: '🛋️', category: 'Home & Living', price: 399, originalPrice: 799, rating: 4.2, reviews: 2340, description: 'Cotton cushion cover set', stock: 160 },
  { name: 'Photo Frame', emoji: '🖼️', category: 'Home & Living', price: 599, originalPrice: 1199, rating: 4.5, reviews: 1670, badge: 'SALE', description: 'Wooden photo frame', stock: 95 },
  { name: 'Candle Set', emoji: '🕯️', category: 'Home & Living', price: 799, originalPrice: 1599, rating: 4.6, reviews: 2100, badge: 'TOP RATED', description: 'Scented candle set of 3', stock: 110 },
  { name: 'Flower Vase', emoji: '🏺', category: 'Home & Living', price: 1099, originalPrice: 2199, rating: 4.4, reviews: 780, description: 'Ceramic flower vase', stock: 60 },
  { name: 'Area Rug', emoji: '🧶', category: 'Home & Living', price: 2499, originalPrice: 4999, rating: 4.5, reviews: 560, badge: 'BEST SELLER', description: '5x7 feet area rug', stock: 45 },
  { name: 'Curtains', emoji: '🪟', category: 'Home & Living', price: 1499, originalPrice: 2999, rating: 4.3, reviews: 1120, description: 'Blackout curtains set', stock: 75 },
  { name: 'Bedsheet Set', emoji: '🛏️', category: 'Home & Living', price: 1999, originalPrice: 3999, rating: 4.6, reviews: 3400, badge: 'SALE', description: 'Cotton bedsheet with pillow covers', stock: 90 },
  { name: 'Towel Set', emoji: '🧺', category: 'Home & Living', price: 899, originalPrice: 1799, rating: 4.4, reviews: 2890, description: 'Bath towel set of 4', stock: 120 },

  // Sports
  { name: 'Yoga Mat', emoji: '🧘', category: 'Sports', price: 799, originalPrice: 1599, rating: 4.5, reviews: 2340, badge: 'BEST SELLER', description: 'Non-slip yoga mat', stock: 120 },
  { name: 'Dumbbells Set', emoji: '🏋️', category: 'Sports', price: 1999, originalPrice: 3999, rating: 4.6, reviews: 1560, badge: 'TOP RATED', description: 'Adjustable dumbbells 5-25kg', stock: 60 },
  { name: 'Resistance Bands', emoji: '💪', category: 'Sports', price: 499, originalPrice: 999, rating: 4.4, reviews: 3100, description: 'Set of 5 resistance bands', stock: 150 },
  { name: 'Jump Rope', emoji: '🪢', category: 'Sports', price: 299, originalPrice: 599, rating: 4.3, reviews: 2890, description: 'Speed jump rope', stock: 200 },
  { name: 'Gym Bag', emoji: '🎒', category: 'Sports', price: 1299, originalPrice: 2499, rating: 4.5, reviews: 1890, badge: 'SALE', description: 'Waterproof gym duffle bag', stock: 85 },
  { name: 'Water Bottle', emoji: '💧', category: 'Sports', price: 399, originalPrice: 799, rating: 4.4, reviews: 4200, description: '1L sports water bottle', stock: 180 },
  { name: 'Fitness Tracker', emoji: '⌚', category: 'Sports', price: 2499, originalPrice: 4999, rating: 4.6, reviews: 1230, badge: 'BEST SELLER', description: 'Heart rate fitness tracker', stock: 70 },
  { name: 'Yoga Block', emoji: '🧱', category: 'Sports', price: 399, originalPrice: 799, rating: 4.2, reviews: 1670, description: 'EVA foam yoga block', stock: 140 },
  { name: 'Skipping Rope', emoji: '🪢', category: 'Sports', price: 249, originalPrice: 499, rating: 4.3, reviews: 2100, description: 'Adjustable skipping rope', stock: 190 },
  { name: 'Gym Gloves', emoji: '🧤', category: 'Sports', price: 599, originalPrice: 1199, rating: 4.4, reviews: 1450, badge: 'SALE', description: 'Padded workout gloves', stock: 110 },

  // Books
  { name: 'Atomic Habits', emoji: '📚', category: 'Books', price: 399, originalPrice: 699, rating: 4.8, reviews: 5600, badge: 'TOP RATED', description: 'Self-help bestseller', stock: 150 },
  { name: 'Rich Dad Poor Dad', emoji: '📖', category: 'Books', price: 349, originalPrice: 599, rating: 4.7, reviews: 4800, badge: 'BEST SELLER', description: 'Personal finance classic', stock: 130 },
  { name: 'The Alchemist', emoji: '📕', category: 'Books', price: 299, originalPrice: 499, rating: 4.6, reviews: 6700, description: 'Paulo Coelho masterpiece', stock: 170 },
  { name: 'Think and Grow Rich', emoji: '📗', category: 'Books', price: 329, originalPrice: 599, rating: 4.7, reviews: 3890, badge: 'SALE', description: 'Napoleon Hill classic', stock: 140 },
  { name: 'The Power of Now', emoji: '📘', category: 'Books', price: 379, originalPrice: 699, rating: 4.6, reviews: 2340, description: 'Spiritual guide', stock: 120 },
  { name: 'Sapiens', emoji: '📙', category: 'Books', price: 449, originalPrice: 799, rating: 4.8, reviews: 4200, badge: 'TOP RATED', description: 'Yuval Noah Harari', stock: 100 },
  { name: 'The Subtle Art', emoji: '📔', category: 'Books', price: 359, originalPrice: 599, rating: 4.5, reviews: 3100, description: 'Mark Manson bestseller', stock: 160 },
  { name: 'Deep Work', emoji: '📓', category: 'Books', price: 399, originalPrice: 699, rating: 4.6, reviews: 2100, badge: 'BEST SELLER', description: 'Cal Newport productivity', stock: 110 },
  { name: 'The 5 AM Club', emoji: '📕', category: 'Books', price: 379, originalPrice: 649, rating: 4.5, reviews: 2890, description: 'Robin Sharma guide', stock: 130 },
  { name: 'Ikigai', emoji: '📗', category: 'Books', price: 329, originalPrice: 599, rating: 4.7, reviews: 3400, badge: 'SALE', description: 'Japanese secret to longevity', stock: 145 },

  // Toys
  { name: 'Building Blocks', emoji: '🧱', category: 'Toys', price: 799, originalPrice: 1599, rating: 4.6, reviews: 2340, badge: 'BEST SELLER', description: '500-piece building set', stock: 90 },
  { name: 'Puzzle Set', emoji: '🧩', category: 'Toys', price: 499, originalPrice: 999, rating: 4.5, reviews: 1890, description: '1000-piece jigsaw puzzle', stock: 110 },
  { name: 'Remote Car', emoji: '🚗', category: 'Toys', price: 1299, originalPrice: 2499, rating: 4.7, reviews: 1560, badge: 'TOP RATED', description: 'RC racing car', stock: 65 },
  { name: 'Teddy Bear', emoji: '🧸', category: 'Toys', price: 599, originalPrice: 1199, rating: 4.4, reviews: 3100, description: 'Soft plush teddy bear', stock: 140 },
  { name: 'Board Game', emoji: '🎲', category: 'Toys', price: 899, originalPrice: 1799, rating: 4.6, reviews: 2100, badge: 'SALE', description: 'Family board game', stock: 85 },
  { name: 'Action Figure', emoji: '🦸', category: 'Toys', price: 699, originalPrice: 1399, rating: 4.3, reviews: 2890, description: 'Superhero action figure', stock: 120 },
  { name: 'Doll House', emoji: '🏠', category: 'Toys', price: 1999, originalPrice: 3999, rating: 4.7, reviews: 1230, badge: 'BEST SELLER', description: '3-story doll house', stock: 45 },
  { name: 'Art Set', emoji: '🎨', category: 'Toys', price: 799, originalPrice: 1599, rating: 4.5, reviews: 1670, description: 'Complete art supplies', stock: 95 },
  { name: 'Musical Toy', emoji: '🎵', category: 'Toys', price: 899, originalPrice: 1799, rating: 4.4, reviews: 1450, description: 'Kids musical keyboard', stock: 75 },
  { name: 'Soft Ball', emoji: '⚽', category: 'Toys', price: 299, originalPrice: 599, rating: 4.2, reviews: 4200, description: 'Soft foam ball', stock: 200 },

  // Kitchen
  { name: 'Mixer Grinder', emoji: '🔌', category: 'Kitchen', price: 2999, originalPrice: 5999, rating: 4.6, reviews: 2340, badge: 'BEST SELLER', description: '750W mixer grinder', stock: 60 },
  { name: 'Non-Stick Pan', emoji: '🍳', category: 'Kitchen', price: 799, originalPrice: 1599, rating: 4.5, reviews: 3100, description: '26cm non-stick frying pan', stock: 110 },
  { name: 'Knife Set', emoji: '🔪', category: 'Kitchen', price: 1299, originalPrice: 2499, rating: 4.7, reviews: 1890, badge: 'TOP RATED', description: '6-piece knife set', stock: 85 },
  { name: 'Pressure Cooker', emoji: '🍲', category: 'Kitchen', price: 1999, originalPrice: 3999, rating: 4.6, reviews: 2890, badge: 'SALE', description: '5L pressure cooker', stock: 70 },
  { name: 'Blender', emoji: '🥤', category: 'Kitchen', price: 1799, originalPrice: 3499, rating: 4.5, reviews: 2100, description: '500W blender', stock: 90 },
  { name: 'Cookware Set', emoji: '🍳', category: 'Kitchen', price: 3499, originalPrice: 6999, rating: 4.7, reviews: 1560, badge: 'BEST SELLER', description: '7-piece cookware set', stock: 50 },
  { name: 'Cutting Board', emoji: '🪵', category: 'Kitchen', price: 399, originalPrice: 799, rating: 4.4, reviews: 4200, description: 'Bamboo cutting board', stock: 150 },
  { name: 'Storage Containers', emoji: '📦', category: 'Kitchen', price: 699, originalPrice: 1399, rating: 4.5, reviews: 3400, description: 'Set of 10 containers', stock: 120 },
  { name: 'Electric Kettle', emoji: '☕', category: 'Kitchen', price: 899, originalPrice: 1799, rating: 4.6, reviews: 2340, badge: 'SALE', description: '1.5L electric kettle', stock: 100 },
  { name: 'Spice Rack', emoji: '🧂', category: 'Kitchen', price: 599, originalPrice: 1199, rating: 4.3, reviews: 1670, description: '12-jar spice rack', stock: 130 },

  // Grocery (keeping original)
  { name: 'Organic Honey', emoji: '🍯', category: 'Grocery', price: 399, originalPrice: 699, rating: 4.7, reviews: 5600, badge: 'TOP RATED', description: 'Pure organic honey 500g', stock: 200 },
  { name: 'Green Tea', emoji: '🍵', category: 'Grocery', price: 299, originalPrice: 599, rating: 4.5, reviews: 4200, badge: 'BEST SELLER', description: 'Green tea bags pack of 50', stock: 180 },
  { name: 'Olive Oil', emoji: '🫒', category: 'Grocery', price: 699, originalPrice: 1299, rating: 4.6, reviews: 3100, description: 'Extra virgin olive oil 500ml', stock: 150 },
  { name: 'Almonds', emoji: '🥜', category: 'Grocery', price: 599, originalPrice: 999, rating: 4.5, reviews: 6700, badge: 'SALE', description: 'Premium almonds 500g', stock: 170 },
  { name: 'Protein Bar', emoji: '🍫', category: 'Grocery', price: 199, originalPrice: 399, rating: 4.3, reviews: 2340, description: 'Protein bar pack of 6', stock: 220 },
  { name: 'Dark Chocolate', emoji: '🍫', category: 'Grocery', price: 299, originalPrice: 599, rating: 4.6, reviews: 4800, badge: 'BEST SELLER', description: '70% dark chocolate 100g', stock: 190 },
  { name: 'Oats', emoji: '🥣', category: 'Grocery', price: 249, originalPrice: 499, rating: 4.4, reviews: 5200, description: 'Rolled oats 1kg', stock: 210 },
  { name: 'Peanut Butter', emoji: '🥜', category: 'Grocery', price: 399, originalPrice: 799, rating: 4.5, reviews: 3890, badge: 'TOP RATED', description: 'Crunchy peanut butter 500g', stock: 160 },
  { name: 'Coffee Beans', emoji: '☕', category: 'Grocery', price: 599, originalPrice: 1199, rating: 4.7, reviews: 2100, badge: 'SALE', description: 'Arabica coffee beans 250g', stock: 140 },
  { name: 'Quinoa', emoji: '🌾', category: 'Grocery', price: 499, originalPrice: 999, rating: 4.4, reviews: 1670, description: 'Organic quinoa 500g', stock: 130 },

  // Accessories
  { name: 'Phone Holder', emoji: '📱', category: 'Accessories', image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&q=80', price: 299, originalPrice: 599, rating: 4.2, reviews: 2890, description: 'Car phone holder', stock: 180 },
  { name: 'Cable Organizer', emoji: '🔌', category: 'Accessories', image: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=400&q=80', price: 199, originalPrice: 399, rating: 4.3, reviews: 3400, badge: 'BEST SELLER', description: 'Cable management clips', stock: 250 },
  { name: 'Power Bank', emoji: '🔋', category: 'Accessories', image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400&q=80', price: 1499, originalPrice: 2999, rating: 4.5, reviews: 4200, badge: 'SALE', description: '10000mAh power bank', stock: 110 },
  { name: 'Earbuds Case', emoji: '🎧', category: 'Accessories', image: 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=400&q=80', price: 399, originalPrice: 799, rating: 4.1, reviews: 1890, description: 'Silicone earbuds case', stock: 160 },
  { name: 'Laptop Sleeve', emoji: '💼', category: 'Accessories', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80', price: 799, originalPrice: 1599, rating: 4.4, reviews: 2340, badge: 'TOP RATED', description: '15-inch laptop sleeve', stock: 95 },
  { name: 'Card Holder', emoji: '💳', category: 'Accessories', image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&q=80', price: 499, originalPrice: 999, rating: 4.3, reviews: 3100, description: 'RFID blocking card holder', stock: 140 },
  { name: 'Key Chain', emoji: '🔑', category: 'Accessories', image: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=400&q=80', price: 199, originalPrice: 399, rating: 4.0, reviews: 5600, description: 'Metal key chain', stock: 280 },
  { name: 'Pen Set', emoji: '🖊️', category: 'Accessories', image: 'https://images.unsplash.com/photo-1565022536102-b2f7b9e5d6b0?w=400&q=80', price: 599, originalPrice: 1199, rating: 4.4, reviews: 1670, badge: 'BEST SELLER', description: 'Premium pen set of 3', stock: 120 },
  { name: 'Notebook', emoji: '📓', category: 'Accessories', image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400&q=80', price: 299, originalPrice: 599, rating: 4.2, reviews: 4800, description: 'A5 ruled notebook', stock: 200 },
  { name: 'Water Bottle', emoji: '💧', category: 'Accessories', image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&q=80', price: 499, originalPrice: 999, rating: 4.5, reviews: 6700, badge: 'SALE', description: 'Stainless steel water bottle', stock: 150 },
];

async function seedProducts() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing products (optional)
    await Product.deleteMany({});
    console.log('🗑️  Cleared existing products');

    // Insert products
    const result = await Product.insertMany(products);
    console.log(`✅ Successfully added ${result.length} products to database`);

    mongoose.connection.close();
    console.log('👋 Database connection closed');
  } catch (error) {
    console.error('❌ Error seeding products:', error);
    process.exit(1);
  }
}

seedProducts();
