require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const urlRoutes = require("./routes/urlRoutes");
const { redirectUrl } = require("./controllers/urlController");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

// Simple request logger for debugging
app.use((req, res, next) => {
	console.log('[req]', req.method, req.originalUrl, 'headers.authorization=', !!req.headers.authorization);
	next();
});

app.use("/api/auth", authRoutes);
app.use("/api/url", urlRoutes);

// Public redirect endpoint at root (e.g., http://localhost:5000/abc123)
app.get('/:shortCode', redirectUrl);

app.get("/", (req, res) => {
	res.send("URL Shortener API Running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
	console.log(`🚀 Server running on port ${PORT}`);
});
