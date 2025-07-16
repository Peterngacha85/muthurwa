require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

// Swagger setup
const { swaggerUi, swaggerSpec } = require('./config/swagger');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Middleware
app.use(express.json());
app.use(cors({
  origin: ['https://muthurwa.vercel.app', 'http://localhost:3000'],
  credentials: true
}));
app.use(morgan('dev'));


// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/buyers', require('./routes/buyer'));
app.use('/api/tomato-types', require('./routes/tomatoType'));
app.use('/api/transactions', require('./routes/transaction'));
app.use('/api/deliveries', require('./routes/delivery'));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
