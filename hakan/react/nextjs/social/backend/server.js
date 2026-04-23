const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./controllers/authController'); // Basitlik için direkt import

const app = express();

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:3000", // Next.js portunuz
  credentials: true
}));

// Rotalar
app.post("/api/auth/register", authRoutes.register);
app.post("/api/auth/login", authRoutes.login);

const PORT = 8800;
app.listen(PORT, () => {
  console.log(`Backend ${PORT} portunda hazır!`);
});