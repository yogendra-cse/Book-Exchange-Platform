const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const initSocket = require('./socket/socket');
const aiRoutes = require("./routes/ai");
// Load env vars
dotenv.config();

// Connect to MongoDB
connectDB();

// Register Models (ensures they are available for population)
require('./models/User');
require('./models/Book');
require('./models/TradeRequest');
require('./models/Match');
require('./models/Message');

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});
initSocket(io);

// Middlewares
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth',    require('./routes/auth'));
app.use('/api/users',   require('./routes/users'));
app.use('/api/books',   require('./routes/books'));
app.use('/api/trades',  require('./routes/trades'));
app.use('/api/matches', require('./routes/matches'));
app.use('/api/chat',    require('./routes/chat'));
app.use("/api/ai", aiRoutes);
// Health check
app.get('/', (req, res) => res.json({ message: 'Book Exchange Platform API Running' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
