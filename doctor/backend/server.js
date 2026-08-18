import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));
app.options('*', cors());
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://shan01tnu_db_user:Skmoni123@cluster0.jreuwhc.mongodb.net/medico_db?retryWrites=true&w=majority";

mongoose.set('bufferCommands', true);
mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 3000, connectTimeoutMS: 3000, socketTimeoutMS: 5000 })
  .then(() => console.log('[Doctor] MongoDB connected'))
  .catch(err => console.error('[Doctor] MongoDB error:', err.message));

// Models
const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  specialty: String,
  medicalLicenseId: String,
  medicalCouncilAuthority: String,
  licenseRegistrationYear: String,
  mbbsCollege: String,
  mbbsPassYear: String,
  postgradDegree: String,
  workplaceHospital: String,
  workplaceDepartment: String,
  workplacePhone: String,
  governmentIdType: String,
  governmentIdNumber: String,
  registrationDocLink: String,
  experienceYears: Number,
  consultationFee: Number,
  bio: String,
  image: String,
  status: { type: String, default: 'PENDING' }, // PENDING, APPROVED, REJECTED
  activeCasesCount: { type: Number, default: 0 },
  rating: { type: Number, default: 3.0 },
  reviewsCount: { type: Number, default: 0 },
  location: {
    city: String,
    region: String,
    lat: Number,
    lon: Number
  },
  slots: { type: [String], default: ["10:00 AM","11:30 AM","02:00 PM","04:30 PM"] },
  createdAt: { type: Date, default: Date.now }
});
const Doctor = mongoose.model('doctors', doctorSchema);

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  age: Number,
  gender: String,
  bloodGroup: String,
  height: Number,
  weight: Number,
  allergies: [String],
  chronicConditions: [String],
  currentMedications: [String],
  familyHistory: [String],
  lifestyle: {
    smoking: String,
    alcohol: String,
    exerciseFrequency: String,
    dietType: String
  },
  deviceAlarms: [String],
  weeklyDietPlan: { type: mongoose.Schema.Types.Mixed, default: {} },
  prescriptions: [{
    date: Date,
    medication: String,
    dosage: String,
    instructions: String,
    doctorId: String,
    doctorName: String
  }],
  medicalHistoryFiles: [{
    filename: String,
    url: String,
    uploadDate: Date,
    type: String, // 'lab_report', 'clinical_note', etc.
    summary: String
  }],
  doctorNotes: String,
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('users', userSchema);

const appointmentSchema = new mongoose.Schema({
  patientId: String,
  patientName: String,
  patientEmail: String,
  doctorId: String,
  doctorName: String,
  doctorSpecialty: String,
  appointmentDate: Date,
  slotTime: String,
  symptomComplaint: String,
  type: String, // ONLINE, OFFLINE
  status: { type: String, default: 'SCHEDULED' }, // SCHEDULED, COMPLETED, CANCELLED
  paymentStatus: { type: String, default: 'PENDING' }, // PENDING, PAID
  notes: String,
  createdAt: { type: Date, default: Date.now }
});
const Appointment = mongoose.model('appointments', appointmentSchema);


// AI / Utility Functions
function checkIsMedicalQuery(query) {
  const q = query.toLowerCase();
  const keywords = ['pain', 'ache', 'fever', 'diet', 'blood', 'doctor', 'treatment', 'medicine', 'symptom', 'disease', 'health', 'heart', 'liver', 'kidney', 'stomach', 'headache'];
  return keywords.some(kw => q.includes(kw));
}

async function runDynamicClinicalAI(query, context, requestDiet = false) {
  try {
    const res = await fetch('http://localhost:5000/api/ai/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, context, requestDiet })
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.result) return data.result;
    }
  } catch (err) {
    console.error("[Doctor] Python AI unreachable:", err.message);
  }

  // Gemini Fallback
  if (process.env.GEMINI_API_KEY) {
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      const prompt = requestDiet 
        ? `Generate a JSON diet plan for: ${context}. Return ONLY valid JSON format.` 
        : `Answer this medical query based on context: ${query}\nContext: ${context}`;
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch(err) {
      console.error("[Doctor] Gemini error:", err.message);
    }
  }

  // Keyword Fallback
  if (requestDiet) {
    return JSON.stringify({
      Monday: { breakfast: "Oats", lunch: "Salad", dinner: "Soup" },
      Tuesday: { breakfast: "Eggs", lunch: "Chicken", dinner: "Veggies" }
    });
  }
  return "Cannot provide AI advice at the moment. Please consult manually.";
}

// Routes

app.post('/api/doctor/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, password required" });
    }
    const existing = await Doctor.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }
    const doctor = new Doctor({ ...req.body, status: 'PENDING' });
    await doctor.save();
    res.json({ doctor, status: "PENDING" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/doctor/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const doctor = await Doctor.findOne({ email });
    if (!doctor) return res.status(401).json({ message: "Not found" });
    if (doctor.password !== password) return res.status(401).json({ message: "Invalid credentials" });
    
    if (doctor.status === 'PENDING') {
      return res.json({ status: "PENDING", doctor });
    }
    if (doctor.status === 'REJECTED') {
      return res.status(403).json({ message: "Application rejected", status: "REJECTED" });
    }
    return res.json({ status: "APPROVED", token: doctor._id.toString(), doctor });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/doctor/profile', async (req, res) => {
  try {
    const doctorId = req.headers.authorization?.split(' ')[1];
    if (!doctorId) return res.status(401).json({ message: "Unauthorized" });

    const allowedUpdates = ['name', 'specialty', 'bio', 'consultationFee', 'workplaceHospital', 'workplaceDepartment', 'workplacePhone', 'experienceYears', 'slots'];
    const updates = {};
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    const updatedDoc = await Doctor.findByIdAndUpdate(doctorId, { $set: updates }, { new: true });
    if (!updatedDoc) return res.status(404).json({ message: "Doctor not found" });
    res.json(updatedDoc);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/doctor/patients', async (req, res) => {
  try {
    const doctorId = req.query.doctorId;
    if (!doctorId) return res.status(400).json({ message: "doctorId query param required" });
    const appointments = await Appointment.find({ doctorId });
    const patients = [];
    
    for (const app of appointments) {
      const user = await User.findById(app.patientId);
      const patientData = user ? user.toObject() : { name: app.patientName, email: app.patientEmail, _id: app.patientId };
      patientData.appointmentDate = app.appointmentDate;
      patientData.slotTime = app.slotTime;
      patientData.symptomComplaint = app.symptomComplaint;
      patients.push(patientData);
    }
    res.json({ count: patients.length, patients });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/doctor/patient/diet', async (req, res) => {
  try {
    const { patientId, dietPlan } = req.body;
    if (!patientId) return res.status(400).json({ message: "patientId required" });
    const user = await User.findByIdAndUpdate(patientId, { $set: { weeklyDietPlan: dietPlan } }, { new: true });
    if (!user) return res.status(404).json({ message: "Patient not found" });
    res.json({ message: "Diet plan updated", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/doctor/patient/notes', async (req, res) => {
  try {
    const { patientId, notes } = req.body;
    if (!patientId) return res.status(400).json({ message: "patientId required" });
    const user = await User.findByIdAndUpdate(patientId, { $set: { doctorNotes: notes } }, { new: true });
    if (!user) return res.status(404).json({ message: "Patient not found" });
    res.json({ message: "Notes updated", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/doctor/patient/prescription', async (req, res) => {
  try {
    const { patientId, prescription } = req.body;
    if (!patientId || !prescription) return res.status(400).json({ message: "patientId and prescription required" });
    const user = await User.findByIdAndUpdate(patientId, { $push: { prescriptions: prescription } }, { new: true });
    if (!user) return res.status(404).json({ message: "Patient not found" });
    res.json({ message: "Prescription added", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/doctor/patient/alarm', async (req, res) => {
  try {
    const { patientId, alarmTime } = req.body;
    if (!patientId || !alarmTime) return res.status(400).json({ message: "patientId and alarmTime required" });
    const user = await User.findByIdAndUpdate(patientId, { $push: { deviceAlarms: alarmTime } }, { new: true });
    if (!user) return res.status(404).json({ message: "Patient not found" });
    res.json({ message: "Alarm added", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/doctor/consultation/complete', async (req, res) => {
  try {
    const { patientId, appointmentId, doctorNotes, dietPlan } = req.body;
    if (!patientId || !appointmentId) return res.status(400).json({ message: "patientId and appointmentId required" });
    
    const user = await User.findById(patientId);
    if (!user) return res.status(404).json({ message: "Patient not found" });

    // Save notes and diet
    if (doctorNotes) user.doctorNotes = doctorNotes;
    if (dietPlan) user.weeklyDietPlan = dietPlan;
    
    // Build file
    const fileContent = `Clinical Consultation File
Date: ${new Date().toISOString()}
Patient: ${user.name}
Notes: ${doctorNotes || 'None'}
Diet: ${JSON.stringify(dietPlan) || 'None'}`;
    
    const fileRecord = {
      filename: `consultation_${Date.now()}.txt`,
      url: `data:text/plain;base64,${Buffer.from(fileContent).toString('base64')}`,
      uploadDate: new Date(),
      type: 'clinical_note',
      summary: 'Generated consultation note'
    };
    user.medicalHistoryFiles.push(fileRecord);
    await user.save();

    await Appointment.findByIdAndUpdate(appointmentId, { $set: { status: 'COMPLETED' } });

    res.json({ message: "Consultation completed", file: fileRecord });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/clinical-copilot', async (req, res) => {
  try {
    const { query, context } = req.body;
    if (!query) return res.status(400).json({ message: "Query required" });
    const result = await runDynamicClinicalAI(query, context, false);
    res.json({ result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/doctor/generate-diet', async (req, res) => {
  try {
    const { patientId, context } = req.body;
    if (!patientId) return res.status(400).json({ message: "patientId required" });
    const result = await runDynamicClinicalAI("Generate diet", context, true);
    
    let parsedDiet = {};
    try {
      parsedDiet = JSON.parse(result);
    } catch(e) {
      parsedDiet = { aiSuggestion: result };
    }

    const user = await User.findByIdAndUpdate(patientId, { $set: { weeklyDietPlan: parsedDiet } }, { new: true });
    res.json({ result: parsedDiet, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => console.log(`[Doctor Portal] running on port ${PORT}`));
