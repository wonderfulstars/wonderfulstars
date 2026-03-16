
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

/* ---------------- DATABASE CONNECTION ---------------- */

// If running locally, use: "mongodb://127.0.0.1:27017/healthdb"
// For GitHub/Cloud, you will replace this string with your MongoDB Atlas URL
const MONGO_URI = "mongodb://127.0.0.1:27017/healthdb"; 

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

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

// 1. Home Route
app.get("/", (req, res) => {
    res.send("<h1>Health Surveillance API is Online</h1><p>Use /diseases to see data.</p>");
});

// 2. Get All Diseases (Sorted by Trust Score)
app.get("/diseases", async (req, res) => {
    try {
        const data = await Disease.find().sort({ trustScore: -1 });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch diseases" });
    }
});

// 3. Search Diseases by Name
app.get("/search/:name", async (req, res) => {
    try {
        const name = req.params.name;
        const result = await Disease.find({
            name: { $regex: name, $options: "i" }
        }).sort({ trustScore: -1 });
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: "Search failed" });
    }
});

// 4. Add New Disease
app.post("/add", async (req, res) => {
    try {
        const newDisease = new Disease(req.body);
        await newDisease.save();
        res.status(201).json({ message: "Disease added successfully", id: newDisease._id });
    } catch (err) {
        res.status(400).json({ error: "Could not add disease. Check your data format." });
    }
});

// 5. Delete Disease
app.delete("/delete/:id", async (req, res) => {
    try {
        await Disease.findByIdAndDelete(req.params.id);
        res.json({ message: "Disease removed from database" });
    } catch (err) {
        res.status(404).json({ error: "Disease not found or already deleted" });
    }
});

/* ---------------- SERVER START ---------------- */

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running at: http://localhost:${PORT}`);
});
