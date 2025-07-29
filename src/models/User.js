import mongoose from 'mongoose';
import { type } from 'os';

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
  isScanner: {type:Boolean , default:false},
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model("User", UserSchema);