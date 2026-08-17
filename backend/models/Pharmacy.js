import mongoose from "mongoose";

const otcItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: String, required: true },
  category: { type: String, required: true }
});

const pharmacySchema = new mongoose.Schema({
  name: { type: String, required: true },
  distance: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  openStatus: { type: String, default: "Open 24/7" },
  rating: { type: Number, default: 4.8 },
  otcItems: [otcItemSchema]
});

export const Pharmacy = mongoose.model("Pharmacy", pharmacySchema);
