import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
app.use(cors());
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://shan01tnu_db_user:Skmoni123@cluster0.jreuwhc.mongodb.net/medico_db?retryWrites=true&w=majority";

mongoose.set('bufferCommands', true);
mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 30000, connectTimeoutMS: 30000, socketTimeoutMS: 45000 })
  .then(() => console.log('[Patient] MongoDB connected'))
  .catch(err => console.error('[Patient] MongoDB error:', err.message));

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String },
  age: { type: Number },
  gender: { type: String },
  bloodGroup: { type: String },
  heightCm: { type: Number },
  weightKg: { type: Number },
  medicalHistory: { type: String },
  allergies: { type: String },
  emergencyContact: { type: String },
  symptomComplaint: { type: String },
  doctorNotes: { type: String },
  weeklyDietPlan: {
    monday: String, tuesday: String, wednesday: String, thursday: String, friday: String, saturday: String, sunday: String
  },
  prescriptions: [{
    medicineName: String, dosage: String, timeDose: String, duration: String, instructions: String, prescribedBy: String, date: String
  }],
  deviceAlarms: [{ alarmTime: String, label: String, active: Boolean }],
  medicalHistoryFiles: [{ id: String, fileName: String, fileContent: String, date: String, doctorName: String, specialty: String, problemStated: String, notes: String }],
  cycleLogs: [{ startDate: String, cycleLength: Number, periodDuration: Number, flow: String, symptoms: [String], notes: String, createdAt: { type: Date, default: Date.now } }],
  pcosScreening: {
    riskLevel: String, score: Number, symptomsList: [String], lastScreenedDate: Date, recommendation: String
  },
  location: { city: String, region: String, country: String, lat: Number, lon: Number },
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', UserSchema, 'users');

const AppointmentSchema = new mongoose.Schema({
  patientId: { type: String, required: true },
  patientName: String,
  patientEmail: String,
  doctorId: { type: String, required: true },
  doctorName: String,
  specialty: String,
  symptomComplaint: String,
  appointmentDate: String,
  slotTime: String,
  status: { type: String, default: 'CONFIRMED' },
  createdAt: { type: Date, default: Date.now }
});
const Appointment = mongoose.model('Appointment', AppointmentSchema, 'appointments');

const DoctorSchema = new mongoose.Schema({
  name: String, email: String, specialty: String, workplaceHospital: String, bio: String, image: String, experienceYears: Number, consultationFee: Number, rating: Number, reviewsCount: Number, status: String, slots: [String], location: { city: String, region: String, country: String }
});
const Doctor = mongoose.model('Doctor', DoctorSchema, 'doctors');

// Patient Auth
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = new User({ username, email, password });
    await user.save();
    res.json({ token: user._id.toString(), user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    res.json({ token: user._id.toString(), user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Patient Profile
app.get('/api/user/profile', async (req, res) => {
  try {
    const userId = req.headers.authorization?.split(' ')[1];
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/user/profile', async (req, res) => {
  try {
    const userId = req.headers.authorization?.split(' ')[1];
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const user = await User.findByIdAndUpdate(userId, req.body, { new: true });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Appointments
app.post('/api/appointments/book', async (req, res) => {
  try {
    const apt = new Appointment(req.body);
    await apt.save();
    res.json(apt);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/patient/appointments', async (req, res) => {
  try {
    const patientId = req.headers.authorization?.split(' ')[1];
    if (!patientId) return res.status(401).json({ error: 'Unauthorized' });
    const apts = await Appointment.find({ patientId });
    res.json(apts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/patient/consultations', async (req, res) => {
  try {
    const patientId = req.headers.authorization?.split(' ')[1];
    if (!patientId) return res.status(401).json({ error: 'Unauthorized' });
    const apts = await Appointment.find({ patientId, status: 'CONFIRMED' });
    const user = await User.findById(patientId);
    res.json({
      appointments: apts,
      doctorNotes: user?.doctorNotes || "",
      prescriptions: user?.prescriptions || [],
      dietPlan: user?.weeklyDietPlan || {}
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Patient Data
app.get('/api/patient/diet-prescription', async (req, res) => {
  try {
    const patientId = req.headers.authorization?.split(' ')[1];
    if (!patientId) return res.status(401).json({ error: 'Unauthorized' });
    const user = await User.findById(patientId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ weeklyDietPlan: user.weeklyDietPlan, prescriptions: user.prescriptions, deviceAlarms: user.deviceAlarms });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/patient/medical-history-files', async (req, res) => {
  try {
    const patientId = req.headers.authorization?.split(' ')[1];
    if (!patientId) return res.status(401).json({ error: 'Unauthorized' });
    const user = await User.findById(patientId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ files: user.medicalHistoryFiles || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cycle & PCOS
app.post('/api/patient/cycle-log', async (req, res) => {
  try {
    const patientId = req.headers.authorization?.split(' ')[1];
    if (!patientId) return res.status(401).json({ error: 'Unauthorized' });
    const user = await User.findById(patientId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    user.cycleLogs.push(req.body);
    await user.save();
    
    const latest = user.cycleLogs[user.cycleLogs.length - 1];
    const cycleLength = latest.cycleLength || 28;
    const start = new Date(latest.startDate);
    const nextPeriod = new Date(start.getTime() + cycleLength * 24 * 60 * 60 * 1000);
    const ovulation = new Date(start.getTime() + (cycleLength - 14) * 24 * 60 * 60 * 1000);
    const fertileStart = new Date(ovulation.getTime() - 4 * 24 * 60 * 60 * 1000);
    const fertileEnd = new Date(ovulation.getTime() + 1 * 24 * 60 * 60 * 1000);
    
    res.json({
      prediction: {
        nextPeriodDate: nextPeriod.toISOString().split('T')[0],
        ovulationDate: ovulation.toISOString().split('T')[0],
        fertileWindow: `${fertileStart.toISOString().split('T')[0]} - ${fertileEnd.toISOString().split('T')[0]}`
      },
      log: latest
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/patient/cycle-log', async (req, res) => {
  try {
    const patientId = req.headers.authorization?.split(' ')[1];
    if (!patientId) return res.status(401).json({ error: 'Unauthorized' });
    const user = await User.findById(patientId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    let prediction = null;
    if (user.cycleLogs.length > 0) {
      const latest = user.cycleLogs[user.cycleLogs.length - 1];
      const cycleLength = latest.cycleLength || 28;
      const start = new Date(latest.startDate);
      const nextPeriod = new Date(start.getTime() + cycleLength * 24 * 60 * 60 * 1000);
      const ovulation = new Date(start.getTime() + (cycleLength - 14) * 24 * 60 * 60 * 1000);
      const fertileStart = new Date(ovulation.getTime() - 4 * 24 * 60 * 60 * 1000);
      const fertileEnd = new Date(ovulation.getTime() + 1 * 24 * 60 * 60 * 1000);
      prediction = {
        nextPeriodDate: nextPeriod.toISOString().split('T')[0],
        ovulationDate: ovulation.toISOString().split('T')[0],
        fertileWindow: `${fertileStart.toISOString().split('T')[0]} - ${fertileEnd.toISOString().split('T')[0]}`
      };
    }
    
    res.json({ logs: user.cycleLogs, prediction, pcosScreening: user.pcosScreening });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/patient/pcos-screening', async (req, res) => {
  try {
    const patientId = req.headers.authorization?.split(' ')[1];
    if (!patientId) return res.status(401).json({ error: 'Unauthorized' });
    
    const { irregularCycles, acneSeverity, hairGrowth, weightFluctuations, moodSwings, symptomsList } = req.body;
    let score = 0;
    if (irregularCycles) score += 30;
    if (acneSeverity === 'Moderate' || acneSeverity === 'Severe') score += 15;
    if (hairGrowth) score += 20;
    if (weightFluctuations) score += 15;
    if (moodSwings) score += 10;
    if (symptomsList && symptomsList.length > 2) score += 10;
    
    let riskLevel = 'LOW RISK';
    if (score >= 60) riskLevel = 'HIGH RISK';
    else if (score >= 35) riskLevel = 'MODERATE RISK';
    
    const recommendation = riskLevel === 'HIGH RISK' ? "Please consult a gynecologist for a detailed evaluation." : (riskLevel === 'MODERATE RISK' ? "Consider monitoring your symptoms and consulting a doctor." : "Your risk is low. Maintain a healthy lifestyle.");
    
    const screening = { riskLevel, score, symptomsList, lastScreenedDate: new Date(), recommendation };
    await User.findByIdAndUpdate(patientId, { pcosScreening: screening });
    
    res.json(screening);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Doctors Directory
app.get('/api/doctors', async (req, res) => {
  try {
    const docs = await Doctor.find({ status: 'Approved' });
    const mapped = docs.map(d => {
      const docObj = d.toObject();
      docObj.id = docObj._id.toString();
      return docObj;
    });
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI endpoints
function checkIsMedicalQuery(query) {
  const q = query.toLowerCase();
  const medKeywords = ['symptom', 'pain', 'doctor', 'treatment', 'disease', 'medicine', 'hospital', 'health', 'fever', 'cough', 'blood', 'headache'];
  return medKeywords.some(kw => q.includes(kw));
}

async function runDynamicClinicalAI(query) {
  if (!checkIsMedicalQuery(query)) {
    return { summary: "Please ask a medical or health-related question.", type: "fallback" };
  }
  
  if (process.env.GEMINI_API_KEY) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "You are a clinical AI. Provide a brief diagnosis or recommendation for: " + query }] }]
        })
      });
      const data = await response.json();
      if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
        return { summary: data.candidates[0].content.parts[0].text, type: "gemini" };
      }
    } catch (e) {
      console.error("Gemini error:", e);
    }
  }
  
  // NLP Fallback
  const q = query.toLowerCase();
  if (q.includes("headache")) return { summary: "Possible tension headache or migraine. Rest and hydrate. Consult doctor if severe.", type: "nlp" };
  if (q.includes("fever")) return { summary: "Possible viral infection. Monitor temperature and stay hydrated.", type: "nlp" };
  return { summary: "Please consult a healthcare professional for a precise diagnosis.", type: "nlp" };
}

app.post('/api/predict', async (req, res) => {
  try {
    const { features } = req.body;
    const textQuery = Array.isArray(features) ? features.join(" ") : (features || "");
    const result = await runDynamicClinicalAI(textQuery);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/ai/herhealth-copilot', async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({ error: "AI not configured" });
    }
    const { messages } = req.body;
    const sysInstruction = "You are HerHealth Copilot, a specialized women's health AI. Provide compassionate, evidence-based guidance on menstrual health, PCOS, reproductive wellness, and general gynecology. Do not diagnose conditions. Suggest consulting a healthcare provider for definitive medical advice.";
    
    const formattedMessages = messages.map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: sysInstruction }] },
        contents: formattedMessages,
        generationConfig: { temperature: 0.4, maxOutputTokens: 600 }
      })
    });
    
    const data = await response.json();
    if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
      res.json({ reply: data.candidates[0].content.parts[0].text });
    } else {
      res.status(500).json({ error: "Failed to generate reply" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/ai/summarize-medical-history', async (req, res) => {
  try {
    const patientId = req.headers.authorization?.split(' ')[1];
    if (!patientId) return res.status(401).json({ error: 'Unauthorized' });
    const user = await User.findById(patientId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    if (!process.env.GEMINI_API_KEY) {
      return res.json({ summary: "AI not configured. You have " + (user.medicalHistoryFiles?.length || 0) + " records.", keyConditions: [] });
    }
    
    const historyData = user.medicalHistoryFiles?.map(f => `File: ${f.fileName}, Problem: ${f.problemStated}, Notes: ${f.notes}`).join('\n') || "No records.";
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Summarize this medical history in JSON format with fields 'summary' (string) and 'keyConditions' (array of strings):\n" + historyData }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });
    
    const data = await response.json();
    if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
      res.json(JSON.parse(data.candidates[0].content.parts[0].text));
    } else {
      res.json({ summary: "Could not generate summary.", keyConditions: [] });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/user/location', (req, res) => {
  res.json({ location: "127.0.0.1 (Localhost)" });
});

app.get('/api/regional-diseases', (req, res) => {
  try {
    const { location } = req.query;
    const tropicalDiseases = [
      { name: 'Dengue Fever', description: 'Mosquito-borne viral infection.', prevention: 'Use repellent, remove standing water.' },
      { name: 'Malaria', description: 'Parasitic disease transmitted by mosquitoes.', prevention: 'Use bed nets, antimalarial meds.' }
    ];
    const northDiseases = [
      { name: 'Lyme Disease', description: 'Tick-borne illness.', prevention: 'Wear long sleeves in wooded areas, check for ticks.' },
      { name: 'Seasonal Influenza', description: 'Respiratory illness.', prevention: 'Annual vaccine, hand hygiene.' }
    ];
    
    if (location && location.toLowerCase().includes('india')) {
      res.json({ diseases: tropicalDiseases });
    } else if (location && location.toLowerCase().includes('canada')) {
      res.json({ diseases: northDiseases });
    } else {
      res.json({ diseases: tropicalDiseases }); // default
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/pharmacies', (req, res) => {
  res.json({ pharmacies: [] });
});

app.listen(PORT, () => console.log(`[Patient Portal] running on port ${PORT}`));
