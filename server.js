const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db'); 
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const businesRouter = require('./routes/businessRoute');
const transactionRoute = require("./routes/transactionRoutes")

const cookieParser = require('cookie-parser');
const walletRoutes = require('./routes/walletRoutes');





dotenv.configDotenv();


const app = express();

connectDB();

app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],	
  credentials: true
})); 


app.use('/api/v1/user', authRoutes);
app.use('/api/v1/business',businesRouter);
app.use('/api/v1/transaction', transactionRoute)
app.use('/api/v1/wallet', walletRoutes);
// app.use('/api/v1/payment', customerPay);



app.get('/api/v1', (req, res) => {
  res.status(200).json({
    message: 'Welcome to QMART API!',
    availableEndpoints: {
      user: {
        signup: '/api/v1/user/signup',
        signin: '/api/v1/user/signin',
        signout: '/api/v1/user/signout',
      },
      business: {
        register: '/api/v1/business/business-registration',
      },
    },
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
