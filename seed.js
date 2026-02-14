const mongoose = require("mongoose");
require("dotenv").config();

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected for Seeding"))
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

// Arrays to pick random values
const services = ["Payments", "Auth", "Orders"];
const severities = ["SEV1","SEV2","SEV3","SEV4"];
const statuses = ["OPEN","MITIGATED","RESOLVED"];
const owners = ["Alice", "Bob", "Charlie", "David", "Eve"];

// Seed 200 incidents
async function seedIncidents() {
  console.log("Seeding 200 incidents...");

  for (let i = 1; i <= 200; i++) {
    await Incident.create({
      title: `Incident ${i}`,
      service: services[Math.floor(Math.random() * services.length)],
      severity: severities[Math.floor(Math.random() * severities.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      owner: owners[Math.floor(Math.random() * owners.length)],
      summary: `This is a summary for incident ${i}.`
    });
  }

  console.log("Seeding complete ✅");
  mongoose.disconnect();
}

// Run seeding
seedIncidents();
