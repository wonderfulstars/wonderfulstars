const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

/* ---------------- MIDDLEWARE ---------------- */
app.use(cors());
app.use(express.json());

/* ---------------- DATABASE CONNECTION ---------------- */

// Use this for local MongoDB
const MONGO_URI = "mongodb://127.0.0.1:27017/healthdb";

// Connect to MongoDB
mongoose.connect(MONGO_URI)
.then(() => console.log("✅ MongoDB connected"))
.catch(err => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1); // Stop server if DB fails
});

/* ---------------- DATA MODEL ---------------- */

const DiseaseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    overview: String,
    symptoms: [String],
    causes: [String],
    treatment: [String],
    prevention: [String],
    source: String,
    trustScore: { type: Number, default: 0 }
});

const Disease = mongoose.model("Disease", DiseaseSchema);

/* ---------------- ROUTES ---------------- */

// Home
app.get("/", (req, res) => {
    res.send("🚀 Health Surveillance API Running");
});

// Get all diseases
app.get("/diseases", async (req, res) => {
    try {
        const data = await Disease.find().sort({ trustScore: -1 });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "Error fetching diseases" });
    }
});

// Search diseases
app.get("/search/:name", async (req, res) => {
    try {
        const name = req.params.name;

        const result = await Disease.find({
            name: { $regex: name, $options: "i" }
        }).sort({ trustScore: -1 });

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: "Search failed" });
    }
});

// Add disease
app.post("/add", async (req, res) => {
    try {
        const newDisease = new Disease(req.body);
        await newDisease.save();
        res.json({ message: "✅ Disease added successfully" });
    } catch (error) {
        res.status(500).json({ error: "Error adding disease" });
    }
});

// Delete disease
app.delete("/delete/:id", async (req, res) => {
    try {
        await Disease.findByIdAndDelete(req.params.id);
        res.json({ message: "🗑️ Disease removed" });
    } catch (error) {
        res.status(500).json({ error: "Error deleting disease" });
    }
});

/* ---------------- SERVER ---------------- */

// IMPORTANT: works locally + online
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
