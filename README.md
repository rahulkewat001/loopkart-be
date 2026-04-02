# LoopKart Backend API

Backend API for LoopKart e-commerce platform with real-time chat, payment integration, and seller marketplace.

## 🚀 Tech Stack

- **Node.js** with **Express 5.2.1**
- **MongoDB** with **Mongoose 9.3.1**
- **Socket.IO 4.8.3** - Real-time communication
- **JWT** - Authentication
- **Bcryptjs** - Password hashing
- **Cloudinary** - Image storage
- **Razorpay** - Payment gateway
- **Nodemailer** - Email service

## 📋 Features

- User authentication (register, login, JWT tokens)
- Product management (CRUD operations)
- Order management with timeline tracking
- Real-time chat between buyers and sellers
- Payment integration with Razorpay
- Email OTP for password reset
- File upload to Cloudinary
- Role-based access control (User, Seller, Admin)
- Real-time notifications

## 🛠️ Installation

### Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas)
- Cloudinary account
- Razorpay account

### Setup

1. Clone the repository:
```bash
git clone https://github.com/rahulkewat001/loopkart-be.git
cd loopkart-be
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (use `.env.example` as template):
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
ACCESS_TOKEN_EXPIRE=15m
REFRESH_TOKEN_EXPIRE=7d
CLIENT_URL=http://localhost:5173

EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

4. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

Server will run on `http://localhost:5000`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh-token` - Refresh access token

### Password Reset
- `POST /api/auth/forgot-password` - Send OTP
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/reset-password` - Reset password

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (seller)
- `PUT /api/products/:id` - Update product (seller)
- `DELETE /api/products/:id` - Delete product (seller)

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id/status` - Update order status

### Payment
- `POST /api/payment/create-order` - Create Razorpay order
- `POST /api/payment/verify` - Verify payment

### Chat
- `GET /api/chats` - Get user chats
- `POST /api/chats` - Create/get chat
- `GET /api/chats/:id/messages` - Get messages

### Profile
- `GET /api/profile/me` - Get user profile
- `PUT /api/profile/me` - Update profile
- `POST /api/profile/avatar` - Upload avatar

### Reviews
- `POST /api/products/:id/reviews` - Add review
- `GET /api/products/:id/reviews` - Get reviews

### Seller
- `POST /api/seller/register` - Register as seller
- `GET /api/seller/dashboard` - Get seller stats
- `GET /api/seller/products` - Get seller products
- `GET /api/seller/orders` - Get seller orders

### Admin
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/role` - Update user role
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/stats` - Get platform stats

## 🔐 Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5000) |
| `MONGO_URI` | MongoDB connection string |
| `ACCESS_TOKEN_SECRET` | JWT access token secret |
| `REFRESH_TOKEN_SECRET` | JWT refresh token secret |
| `ACCESS_TOKEN_EXPIRE` | Access token expiry (e.g., 15m) |
| `REFRESH_TOKEN_EXPIRE` | Refresh token expiry (e.g., 7d) |
| `CLIENT_URL` | Frontend URL for CORS |
| `EMAIL_USER` | Email for sending OTPs |
| `EMAIL_PASS` | Email app password |
| `RAZORPAY_KEY_ID` | Razorpay key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay secret key |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

## 📁 Project Structure

```
backend/
├── config/
│   └── db.js                    # MongoDB connection
├── controllers/
│   ├── authController.js        # Authentication logic
│   ├── productController.js     # Product CRUD
│   ├── orderController.js       # Order management
│   ├── paymentController.js     # Razorpay integration
│   ├── chatController.js        # Chat management
│   ├── profileController.js     # User profile
│   ├── reviewController.js      # Product reviews
│   ├── sellerController.js      # Seller operations
│   ├── adminController.js       # Admin operations
│   ├── notificationController.js # Notifications
│   └── forgotPasswordController.js # Password reset
├── middleware/
│   ├── authMiddleware.js        # JWT verification
│   ├── generateTokens.js        # Token generation
│   └── upload.js                # Multer config
├── models/
│   ├── User.js                  # User schema
│   ├── Product.js               # Product schema
│   ├── Order.js                 # Order schema
│   ├── Chat.js                  # Chat schema
│   ├── Review.js                # Review schema
│   └── Notification.js          # Notification schema
├── routes/
│   ├── authRoutes.js
│   ├── productRoutes.js
│   ├── orderRoutes.js
│   ├── paymentRoutes.js
│   ├── chatRoutes.js
│   ├── profileRoutes.js
│   ├── reviewRoutes.js
│   ├── sellerRoutes.js
│   ├── adminRoutes.js
│   ├── notificationRoutes.js
│   ├── forgotPasswordRoutes.js
│   └── uploadRoutes.js
├── .env.example
├── .gitignore
├── package.json
└── server.js                    # Entry point
```

## 🔌 Socket.IO Events

### Client → Server
- `join_chat(chatId)` - Join chat room
- `send_message({ chatId, text })` - Send message
- `typing({ chatId, isTyping })` - Typing indicator
- `mark_read({ chatId })` - Mark as read

### Server → Client
- `new_message({ chatId, message })` - New message
- `typing({ userId, isTyping })` - User typing
- `user_online(userId)` - User online
- `user_offline(userId)` - User offline
- `online_users([userIds])` - Online users list

## 🚀 Deployment

### Render / Railway / Heroku

1. Set environment variables in dashboard
2. Set start command: `npm start`
3. Deploy from GitHub repository

### Important Notes
- Ensure MongoDB is accessible from deployment platform
- Update `CLIENT_URL` to production frontend URL
- Use production credentials for Razorpay and Cloudinary

## 📄 License

Private and Proprietary

## 👨‍💻 Author

Rahul Kewat
