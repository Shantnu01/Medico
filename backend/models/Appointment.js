import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  type: { type: String, required: true }, // "CONSULTATION" or "APPOINTMENT"
  userId: { type: String, required: true },
  doctorId: { type: String, required: true },
  doctorName: { type: String, required: true },
  specialty: { type: String, required: true },
  hospital: { type: String, required: true },
  fee: { type: String, required: true },
  date: { type: String },
  slot: { type: String },
  reason: { type: String },
  status: { type: String, default: "CONFIRMED" },
  meetingLink: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export const Appointment = mongoose.model("Appointment", appointmentSchema);
