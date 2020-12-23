const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const createError = require('http-errors');
require('dotenv').config();
const connectDB = require('./helpers/init_DB');

// Export routes
const AuthRoute = require('./routes/Auth.route');
const UserRoute = require('./routes/User.route');

// Connection to database
connectDB();

const app = express();

// Body Parser
app.use(express.json());

// Cors
app.use(cors());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.get('/', async (req, res, next) => {
  res.send('Test get after deploy');
});

app.use('/auth', AuthRoute);
app.use('/user', UserRoute);

app.use(async (req, res, next) => {
  next(createError.NotFound());
});

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    error: {
      status: err.status || 500,
      message: err.message,
    },
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});

// Handle unhandled promise rejection
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
