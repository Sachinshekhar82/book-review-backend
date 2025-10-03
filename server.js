const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

// CORS Configuration - ADD THIS
const corsOptions = {
  origin: [
    'https://book-review-frontend-i1iz.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173'
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Or for testing, allow all origins temporarily:
// app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add a root route for testing
app.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Book Review API is running' 
  });
});

// Your existing routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/books', require('./routes/bookRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});


