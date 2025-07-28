import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  fullname: String,
  email: String,
  phone: String,
  qrCodeData: String, // This will store the value encoded in QR
  userID : Number,
  age: String,
  Gender: String,
  DOB: String,
  Address: String,
  School: String,
  Class: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model("User", UserSchema);