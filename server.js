const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db'); 
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/authRoutes');
const businesRouter = require('./routes/businessRoute');
const transactionRoute = require("./routes/transactionRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const walletRoutes = require('./routes/walletRoutes');
const paymentRoutes = require("./routes/paymentRoute");
const paystackRoutes = require('./routes/paystackRoute');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

// Connect to the database
connectDB();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],	
  credentials: true,
}));

// Socket.IO setup
io.on('connection', (socket) => {
  console.log('A user connected');
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// API Routes
app.use('/api/v1/user', authRoutes);
app.use('/api/v1/business', businesRouter);
app.use('/api/v1/transaction', transactionRoute);
app.use('/api/v1/wallet', walletRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use('/api/v1/paystack', paystackRoutes);

// Initialize payment routes with Socket.IO
app.use('/api/v1/payment', paymentRoutes(io));

// Default route
app.get('/api/v1', (req, res) => {
  res.status(200).json({
    message: 'Welcome to QMART API!',
  });
});

// Server setup
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
