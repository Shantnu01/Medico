import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5003;
app.use(cors());
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://shan01tnu_db_user:Skmoni123@ac-ogkq2x0-shard-00-00.jreuwhc.mongodb.net:27017,ac-ogkq2x0-shard-00-01.jreuwhc.mongodb.net:27017,ac-ogkq2x0-shard-00-02.jreuwhc.mongodb.net:27017/medico_db?ssl=true&replicaSet=atlas-13lkha-shard-0&authSource=admin&retryWrites=true&w=majority';
mongoose.set('bufferCommands', false);

let isConnected = false;
async function connectDB() {
  if (isConnected || mongoose.connection.readyState === 1) return;
  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000, connectTimeoutMS: 5000 });
    isConnected = true;
    console.log('[Admin] MongoDB connected');
  } catch (err) {
    console.error('[Admin] MongoDB connection error:', err.message);
  }
}

connectDB();

app.use(async (req, res, next) => {
  await connectDB();
  next();
});

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  specialty: { type: String },
  medicalLicenseId: { type: String },
  medicalCouncilAuthority: { type: String },
  licenseRegistrationYear: { type: Number },
  mbbsCollege: { type: String },
  mbbsPassYear: { type: Number },
  postgradDegree: { type: String },
  workplaceHospital: { type: String },
  workplaceDepartment: { type: String },
  workplacePhone: { type: String },
  governmentIdType: { type: String },
  governmentIdNumber: { type: String },
  registrationDocLink: { type: String },
  experienceYears: { type: Number },
  consultationFee: { type: Number },
  bio: { type: String },
  image: { type: String },
  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
  activeCasesCount: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  reviewsCount: { type: Number, default: 0 },
  location: { type: String },
  slots: { type: Array, default: [] },
  createdAt: { type: Date, default: Date.now }
}, { collection: 'doctors' });

const Doctor = mongoose.models.Doctor || mongoose.model('Doctor', doctorSchema);

app.post('/api/admin/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      return res.status(200).json({
        status: "SUCCESS",
        token: "admin_super_session_key_2026",
        admin: {
          name: "Platform Administrator",
          email: process.env.ADMIN_EMAIL,
          role: "SUPER_ADMIN"
        }
      });
    } else {
      return res.status(401).json({ status: "ERROR", message: "Invalid credentials" });
    }
  } catch (error) {
    return res.status(500).json({ status: "ERROR", message: error.message });
  }
});

app.get('/api/admin/doctors/pending', async (req, res) => {
  try {
    const pendingDoctors = await Doctor.find({ status: 'PENDING' });
    return res.status(200).json({ count: pendingDoctors.length, pendingDoctors });
  } catch (error) {
    return res.status(500).json({ status: "ERROR", message: error.message });
  }
});

app.get('/api/admin/doctors/active', async (req, res) => {
  try {
    const activeDoctors = await Doctor.find({ status: 'APPROVED' });
    return res.status(200).json({ count: activeDoctors.length, activeDoctors });
  } catch (error) {
    return res.status(500).json({ status: "ERROR", message: error.message });
  }
});

app.post('/api/admin/doctors/approve', async (req, res) => {
  try {
    const { doctorId } = req.body;
    if (!doctorId) {
      return res.status(400).json({ status: 'ERROR', message: 'Doctor ID is required' });
    }

    let updatedDoctor;
    if (mongoose.Types.ObjectId.isValid(doctorId)) {
      updatedDoctor = await Doctor.findByIdAndUpdate(doctorId, { status: 'APPROVED' }, { new: true });
    } else {
      updatedDoctor = await Doctor.findOneAndUpdate({ email: doctorId }, { status: 'APPROVED' }, { new: true });
    }

    if (!updatedDoctor) {
      return res.status(404).json({ status: 'ERROR', message: 'Doctor not found' });
    }

    return res.status(200).json({ status: 'SUCCESS', updatedDoctor });
  } catch (error) {
    return res.status(500).json({ status: "ERROR", message: error.message });
  }
});

app.post('/api/admin/doctors/reject', async (req, res) => {
  try {
    const { doctorId } = req.body;
    if (!doctorId) {
      return res.status(400).json({ status: 'ERROR', message: 'Doctor ID is required' });
    }

    let updatedDoctor;
    if (mongoose.Types.ObjectId.isValid(doctorId)) {
      updatedDoctor = await Doctor.findByIdAndUpdate(doctorId, { status: 'REJECTED' }, { new: true });
    } else {
      updatedDoctor = await Doctor.findOneAndUpdate({ email: doctorId }, { status: 'REJECTED' }, { new: true });
    }

    if (!updatedDoctor) {
      return res.status(404).json({ status: 'ERROR', message: 'Doctor not found' });
    }

    return res.status(200).json({ status: 'SUCCESS', updatedDoctor });
  } catch (error) {
    return res.status(500).json({ status: "ERROR", message: error.message });
  }
});

app.listen(PORT, () => console.log(`[Admin Portal] running on port ${PORT}`));
