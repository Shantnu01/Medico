import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  location: {
    city: { type: String, default: "Mumbai" },
    country: { type: String, default: "India" },
    region: { type: String, default: "Tropical South Asia" },
    latitude: { type: Number },
    longitude: { type: Number }
  },
  createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.model("User", userSchema);
