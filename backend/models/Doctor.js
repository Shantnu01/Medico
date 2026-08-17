import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialty: { type: String, required: true },
  experience: { type: String, required: true },
  rating: { type: Number, default: 4.8 },
  reviewsCount: { type: Number, default: 50 },
  distance: { type: String, default: "1.0 km away" },
  hospital: { type: String, required: true },
  fee: { type: String, required: true },
  availableToday: { type: Boolean, default: true },
  image: { type: String },
  bio: { type: String },
  slots: [{ type: String }]
});

export const Doctor = mongoose.model("Doctor", doctorSchema);
