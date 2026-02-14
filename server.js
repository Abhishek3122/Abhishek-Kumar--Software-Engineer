const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
// parse application/x-www-form-urlencoded (HTML form submits)
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("MongoDB Connection Error:", err));

// Incident Schema
const incidentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  service: { type: String, required: true },
  severity: { type: String, enum: ["SEV1","SEV2","SEV3","SEV4"] },
  status: { type: String, enum: ["OPEN","MITIGATED","RESOLVED"], default: "OPEN" },
  owner: String,
  summary: String
}, { timestamps: true });

const Incident = mongoose.model("Incident", incidentSchema);

/////////////////////////////
// Routes
/////////////////////////////

// GET /api/incidents - pagination, filtering, sorting
app.get("/api/incidents", async (req, res) => {
  try {
    let { page = 1, limit = 10, search = "", sortBy = "createdAt", sortOrder = "desc", status, severity, service } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    const filter = {};

    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }
    if (status) filter.status = status;
    if (severity) filter.severity = severity;
    if (service) filter.service = service;

    const total = await Incident.countDocuments(filter);

    const incidents = await Incident.find(filter)
      .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      total,
      page,
      pages: Math.ceil(total / limit),
      incidents
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/incidents/:id - get single incident
app.get("/api/incidents/:id", async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);
    if (!incident) return res.status(404).json({ error: "Incident not found" });
    res.json(incident);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/incidents - create new incident
app.post("/api/incidents", async (req, res) => {
  console.log('POST /api/incidents headers:', req.headers['content-type']);
  console.log('POST /api/incidents body:', req.body);
  try {
    const { title, service, severity, status, owner, summary } = req.body;
    const newIncident = await Incident.create({ title, service, severity, status, owner, summary });
    res.status(201).json(newIncident);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH /api/incidents/:id - update incident
app.patch("/api/incidents/:id", async (req, res) => {
  try {
    const updateData = req.body;
    const updatedIncident = await Incident.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updatedIncident) return res.status(404).json({ error: "Incident not found" });
    res.json(updatedIncident);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
