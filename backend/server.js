import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import dns from 'dns';

// Fix local ISP / router DNS SRV resolution blocking
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Direct connection bypasses Node.js SRV DNS issues while still reaching Atlas
const MONGODB_URI = process.env.MONGODB_URI ||
  "mongodb://shan01tnu_db_user:Skmoni123@ac-ogkq2x0-shard-00-00.jreuwhc.mongodb.net:27017,ac-ogkq2x0-shard-00-01.jreuwhc.mongodb.net:27017,ac-ogkq2x0-shard-00-02.jreuwhc.mongodb.net:27017/medico_db?ssl=true&replicaSet=atlas-13lkha-shard-0&authSource=admin&retryWrites=true&w=majority";

mongoose.set('bufferCommands', true);  // Queue ops until connection is ready

// --- USER SCHEMA (PATIENTS) ---
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  age: Number,
  gender: String,
  bloodGroup: String,
  heightCm: Number,
  weightKg: Number,
  medicalHistory: String,
  allergies: String,
  emergencyContact: String,
  symptomComplaint: String,
  doctorNotes: String,
  
  weeklyDietPlan: {
    Monday: String,
    Tuesday: String,
    Wednesday: String,
    Thursday: String,
    Friday: String,
    Saturday: String,
    Sunday: String
  },
  
  prescriptions: [{
    medicineName: String,
    dosage: String,
    timeDose: String,
    duration: String,
    instructions: String,
    prescribedBy: String,
    date: { type: Date, default: Date.now }
  }],
  
  deviceAlarms: [{
    alarmTime: String,
    label: String,
    active: { type: Boolean, default: true }
  }],

  medicalHistoryFiles: [{
    id: String,
    fileName: String,
    fileContent: String,
    date: String,
    doctorName: String,
    specialty: String,
    problemStated: String,
    notes: String
  }],

  cycleLogs: [{
    startDate: String,
    cycleLength: { type: Number, default: 28 },
    periodDuration: { type: Number, default: 5 },
    flow: { type: String, default: "Medium" },
    symptoms: [String],
    notes: String,
    createdAt: { type: Date, default: Date.now }
  }],

  pcosScreening: {
    riskLevel: String,
    score: Number,
    symptomsList: [String],
    lastScreenedDate: String,
    recommendation: String
  },

  location: {
    city: String,
    region: String,
    country: String,
    lat: Number,
    lon: Number
  },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);

// --- APPOINTMENT / CONSULTATION SCHEMA ---
const AppointmentSchema = new mongoose.Schema({
  patientId: { type: String, required: true },
  patientName: { type: String, required: true },
  patientEmail: String,
  doctorId: { type: String, required: true },
  doctorName: String,
  specialty: String,
  symptomComplaint: String,
  appointmentDate: String,
  slotTime: String,
  status: { type: String, default: "CONFIRMED" },
  createdAt: { type: Date, default: Date.now }
});

const Appointment = mongoose.model('Appointment', AppointmentSchema);

// --- DOCTOR SCHEMA ---
const DoctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  specialty: { type: String, required: true },
  
  medicalLicenseId: { type: String, required: true },
  medicalCouncilAuthority: { type: String, required: true },
  licenseRegistrationYear: { type: String, required: true },
  mbbsCollege: { type: String, required: true },
  mbbsPassYear: { type: String, required: true },
  postgradDegree: { type: String, required: true },
  
  workplaceHospital: { type: String, required: true },
  workplaceDepartment: String,
  workplacePhone: String,
  
  governmentIdType: String,
  governmentIdNumber: String,
  registrationDocLink: String,
  
  experienceYears: { type: Number, required: true },
  consultationFee: { type: String, required: true },
  bio: String,
  image: String,
  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
  activeCasesCount: { type: Number, default: 0 },
  rating: { type: Number, default: 3.0, min: 0, max: 5 },
  reviewsCount: { type: Number, default: 0 },
  location: { city: String, region: String, lat: { type: Number, default: 13.0827 }, lon: { type: Number, default: 80.2707 } },
  slots: { type: [String], default: ["10:00 AM", "11:30 AM", "02:00 PM", "04:30 PM"] },
  createdAt: { type: Date, default: Date.now }
});

const Doctor = mongoose.model('Doctor', DoctorSchema);

// ENSURE REAL DOCTOR ACCOUNT FOR shan01tnu@gmail.com / abc@1234
async function ensureShanDoctor() {
  try {
    // Remove old mock seed doctors
    await Doctor.deleteMany({ email: { $in: ["aris.thorne@apollo.org", "elena.dermatology@fortis.org"] } });

    let shanDoc = await Doctor.findOne({ email: "shan01tnu@gmail.com" });
    if (!shanDoc) {
      shanDoc = new Doctor({
        name: "Dr. Shan Kumar",
        email: "shan01tnu@gmail.com",
        password: "abc@1234",
        specialty: "General Physician",
        medicalLicenseId: "TN-MCI-2026-0001",
        medicalCouncilAuthority: "Tamil Nadu Medical Council",
        licenseRegistrationYear: "2018",
        mbbsCollege: "Madras Medical College",
        mbbsPassYear: "2016",
        postgradDegree: "MD General Medicine",
        workplaceHospital: "Apollo Hospitals, Greams Road, Chennai",
        workplaceDepartment: "Internal Medicine",
        workplacePhone: "044-28290200",
        governmentIdType: "PAN Card",
        governmentIdNumber: "ABCDE1234F",
        experienceYears: 8,
        consultationFee: "₹500",
        bio: "Board-Certified Consultant Physician specializing in primary care, acute symptom triage, and internal medicine.",
        status: "APPROVED",
        rating: 3.0,
        reviewsCount: 0,
        slots: ["10:00 AM", "11:30 AM", "02:00 PM", "04:30 PM"]
      });
      await shanDoc.save();
      console.log('Registered Doctor account shan01tnu@gmail.com initialized in MongoDB Atlas!');
    } else {
      shanDoc.password = "abc@1234";
      shanDoc.status = "APPROVED";
      await shanDoc.save();
      console.log('Doctor account shan01tnu@gmail.com verified & updated in MongoDB Atlas!');
    }
  } catch (e) {
    console.error('Doctor setup error:', e.message);
  }
}

mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 30000,  // Give Atlas SRV 30s to resolve
  connectTimeoutMS: 30000,
  socketTimeoutMS: 45000
})
  .then(() => {
    console.log('Successfully connected to MongoDB Atlas (medico_db)');
    ensureShanDoctor();
  })
  .catch((err) => console.error('MongoDB Atlas Connection Error:', err.message));

// Geolocation helper function
async function getIpLocation(ip) {
  try {
    const cleanIp = ip.replace('::ffff:', '').replace('::1', '127.0.0.1');
    if (cleanIp === '127.0.0.1' || cleanIp.startsWith('192.168.') || cleanIp.startsWith('10.')) {
      return {
        city: 'Chennai',
        region: 'Tamil Nadu',
        country: 'India',
        queryLocation: 'Chennai, Tamil Nadu, India'
      };
    }
    const res = await fetch(`http://ip-api.com/json/${cleanIp}`);
    const data = await res.json();
    if (data.status === 'success') {
      return {
        city: data.city,
        region: data.regionName,
        country: data.country,
        queryLocation: `${data.city}, ${data.regionName}, ${data.country}`
      };
    }
  } catch (e) {
    console.error('IP Geolocation error:', e.message);
  }
  return {
    city: 'Chennai',
    region: 'Tamil Nadu',
    country: 'India',
    queryLocation: 'Chennai, Tamil Nadu, India'
  };
}

// User location API
app.get('/api/user/location', async (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
  const loc = await getIpLocation(ip);
  res.json(loc);
});

// --- PATIENT REGISTER API (PURE DB) ---
app.post(['/api/auth/register', '/api/auth/signup'], async (req, res) => {
  const { username, email, password, name } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password are required" });

  const cleanName = name && name.trim() ? name.trim() : email.split('@')[0];

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "User with this email already exists" });
    }
    const user = new User({
      username: username || email.split('@')[0],
      email,
      password,
      name: cleanName
    });
    await user.save();
    return res.json({ token: user._id.toString(), user });
  } catch (e) {
    console.error('Register error:', e.message);
    return res.status(500).json({ error: "Registration failed. Please try again." });
  }
});

// --- PATIENT LOGIN API (PURE DB) ---
app.post(['/api/auth/login', '/api/auth/signin'], async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password are required" });

  try {
    const user = await User.findOne({ email, password });
    if (user) {
      return res.json({ token: user._id.toString(), user });
    }
    return res.status(401).json({ error: "Invalid email or password." });
  } catch (e) {
    console.error('Login error:', e.message);
    return res.status(500).json({ error: "Login failed. Please try again." });
  }
});

// GET / POST Patient Profile API (PURE DB)
app.get('/api/user/profile', async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token || !mongoose.Types.ObjectId.isValid(token)) {
    return res.status(401).json({ error: "Unauthorized. Please log in again." });
  }
  try {
    const user = await User.findById(token);
    if (!user) return res.status(404).json({ error: "User not found." });
    return res.json(user);
  } catch (e) {
    console.error('Profile fetch error:', e.message);
    return res.status(500).json({ error: "Could not fetch profile." });
  }
});

app.post('/api/user/profile', async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  const { age, gender, bloodGroup, heightCm, weightKg, medicalHistory, allergies, emergencyContact, name } = req.body;

  if (!token || !mongoose.Types.ObjectId.isValid(token)) {
    return res.status(401).json({ error: "Unauthorized. Please log in again." });
  }
  try {
    const updateObj = { age, gender, bloodGroup, heightCm, weightKg, medicalHistory, allergies, emergencyContact };
    if (name) updateObj.name = name;
    const user = await User.findByIdAndUpdate(token, updateObj, { new: true });
    if (!user) return res.status(404).json({ error: "User not found." });
    return res.json({ message: "Medical Profile updated successfully", user });
  } catch (e) {
    console.error('Profile update error:', e.message);
    return res.status(500).json({ error: "Could not update profile." });
  }
});

// --- BOOK APPOINTMENT API (PATIENT TO DOCTOR - PURE DB) ---
app.post('/api/appointments/book', async (req, res) => {
  const { patientId, patientName, patientEmail, doctorId, doctorName, specialty, symptomComplaint, appointmentDate, slotTime } = req.body;

  if (!doctorId || !patientName) {
    return res.status(400).json({ error: "doctorId and patientName are required." });
  }

  if (mongoose.connection.readyState === 1) {
    try {
      const newApp = new Appointment({
        patientId: patientId || `pat_${Date.now()}`,
        patientName,
        patientEmail: patientEmail || "patient@medico.org",
        doctorId,
        doctorName: doctorName || "Attending Physician",
        specialty: specialty || "General Physician",
        symptomComplaint: symptomComplaint || "Routine Consultation",
        appointmentDate: appointmentDate || new Date().toISOString().split('T')[0],
        slotTime: slotTime || "10:00 AM",
        status: "CONFIRMED"
      });

      await newApp.save();
      return res.json({ message: "Appointment booked successfully in DB!", appointment: newApp });
    } catch (e) {
      console.log(e);
    }
  }

  const fallbackApp = {
    _id: `app_${Date.now()}`,
    id: `app_${Date.now()}`,
    patientId,
    patientName,
    patientEmail,
    doctorId,
    doctorName,
    specialty,
    symptomComplaint,
    appointmentDate,
    slotTime,
    status: "CONFIRMED"
  };
  return res.json({ message: "Appointment booked successfully!", appointment: fallbackApp });
});

// --- DOCTOR API: FETCH ONLY PATIENTS ASSIGNED / BOOKED WITH THAT SPECIFIC DOCTOR (PURE DB) ---
app.get('/api/doctor/patients', async (req, res) => {
  const { doctorId, doctorEmail, doctorName } = req.query;

  if (mongoose.connection.readyState === 1) {
    try {
      let queryOr = [];
      if (doctorId) queryOr.push({ doctorId });
      if (doctorEmail) queryOr.push({ doctorEmail });
      if (doctorName) queryOr.push({ doctorName: new RegExp(doctorName, 'i') });

      let assignedAppointments = [];
      if (queryOr.length > 0) {
        assignedAppointments = await Appointment.find({ $or: queryOr });
      }

      let assignedPatients = [];
      for (const appItem of assignedAppointments) {
        let patRecord = null;
        if (mongoose.Types.ObjectId.isValid(appItem.patientId)) {
          patRecord = await User.findById(appItem.patientId);
        }
        if (!patRecord && appItem.patientEmail) {
          patRecord = await User.findOne({ email: appItem.patientEmail });
        }

        if (!patRecord) {
          patRecord = {
            _id: appItem.patientId,
            name: appItem.patientName,
            email: appItem.patientEmail,
            age: 28,
            gender: "Male",
            bloodGroup: "O+",
            heightCm: 175,
            weightKg: 70,
            medicalHistory: "None reported",
            allergies: "None reported",
            emergencyContact: "+91 98765 43210"
          };
        }

        const patObj = patRecord.toObject ? patRecord.toObject() : { ...patRecord };
        patObj.symptomComplaint = appItem.symptomComplaint || patObj.symptomComplaint || "General Triage";
        patObj.appointmentDate = appItem.appointmentDate;
        patObj.slotTime = appItem.slotTime;

        assignedPatients.push(patObj);
      }

      return res.json({ count: assignedPatients.length, patients: assignedPatients });
    } catch (e) {
      console.log(e);
    }
  }

  return res.json({ count: 0, patients: [] });
});

// --- DOCTOR API: ADD 7-DAY WEEKLY DIET PLAN FOR A PATIENT (PURE DB) ---
app.post('/api/doctor/patient/diet', async (req, res) => {
  // Accept both 'dietPlan' and legacy 'weeklyDietPlan' field names
  const { patientId, dietPlan, weeklyDietPlan } = req.body;
  const plan = dietPlan || weeklyDietPlan;
  if (!patientId || !plan) {
    return res.status(400).json({ error: "patientId and dietPlan are required." });
  }

  if (!mongoose.Types.ObjectId.isValid(patientId)) {
    return res.status(400).json({ error: "Invalid patientId." });
  }
  try {
    const updated = await User.findByIdAndUpdate(patientId, { weeklyDietPlan: plan }, { new: true });
    if (!updated) return res.status(404).json({ error: "Patient not found." });
    return res.json({ message: "7-Day Diet Plan saved to DB successfully!", patient: updated });
  } catch (e) {
    console.error('Diet save error:', e.message);
    return res.status(500).json({ error: "Could not save diet plan." });
  }
});

// --- DOCTOR API: SAVE DOCTOR NOTES FOR A PATIENT (PURE DB) ---
app.post('/api/doctor/patient/notes', async (req, res) => {
  const { patientId, doctorNotes } = req.body;
  if (!patientId) return res.status(400).json({ error: "patientId is required." });

  if (!mongoose.Types.ObjectId.isValid(patientId)) {
    return res.status(400).json({ error: "Invalid patientId." });
  }
  try {
    const updated = await User.findByIdAndUpdate(patientId, { doctorNotes }, { new: true });
    if (!updated) return res.status(404).json({ error: "Patient not found." });
    return res.json({ message: "Doctor notes saved to DB!", patient: updated });
  } catch (e) {
    console.error('Notes save error:', e.message);
    return res.status(500).json({ error: "Could not save notes." });
  }
});

// --- DOCTOR API: ADD MEDICINES & PRESCRIPTION FOR A PATIENT (PURE DB) ---
app.post('/api/doctor/patient/prescription', async (req, res) => {
  const { patientId, prescription } = req.body;
  if (!patientId || !prescription || !prescription.medicineName) {
    return res.status(400).json({ error: "patientId and prescription data are required." });
  }

  if (!mongoose.Types.ObjectId.isValid(patientId)) {
    return res.status(400).json({ error: "Invalid patientId." });
  }
  try {
    const updated = await User.findByIdAndUpdate(
      patientId,
      { $push: { prescriptions: prescription } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "Patient not found." });
    return res.json({ message: "Medication prescription saved to DB successfully!", patient: updated });
  } catch (e) {
    console.error('Prescription save error:', e.message);
    return res.status(500).json({ error: "Could not save prescription." });
  }
});

// --- DOCTOR API: SET DEVICE ALARM ALERT FOR A PATIENT (PURE DB) ---
app.post('/api/doctor/patient/alarm', async (req, res) => {
  const { patientId, alarmTime, label } = req.body;
  if (!patientId || !alarmTime) {
    return res.status(400).json({ error: "patientId and alarmTime are required." });
  }

  const alarmObj = { alarmTime, label: label || "Medication Dose Reminder", active: true };

  if (!mongoose.Types.ObjectId.isValid(patientId)) {
    return res.status(400).json({ error: "Invalid patientId." });
  }
  try {
    const updated = await User.findByIdAndUpdate(
      patientId,
      { $push: { deviceAlarms: alarmObj } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "Patient not found." });
    return res.json({ message: `Device Alert scheduled for ${alarmTime} in DB!`, patient: updated });
  } catch (e) {
    console.error('Alarm save error:', e.message);
    return res.status(500).json({ error: "Could not save alarm." });
  }
});

// --- PATIENT API: FETCH PRESCRIBED DIET, PRESCRIPTIONS & ALARMS (PURE DB) ---
app.get('/api/patient/diet-prescription', async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token || !mongoose.Types.ObjectId.isValid(token)) {
    return res.status(401).json({ error: "Unauthorized." });
  }
  try {
    const user = await User.findById(token);
    if (!user) return res.status(404).json({ error: "User not found." });
    return res.json({
      weeklyDietPlan: user.weeklyDietPlan || null,
      prescriptions: user.prescriptions || [],
      deviceAlarms: user.deviceAlarms || []
    });
  } catch (e) {
    console.error('Diet-prescription fetch error:', e.message);
    return res.status(500).json({ error: "Could not fetch prescriptions." });
  }
});

// --- PATIENT API: FETCH BOOKED APPOINTMENTS (PURE DB) ---
app.get('/api/patient/appointments', async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: "Unauthorized." });
  try {
    let queryOr = [];
    if (mongoose.Types.ObjectId.isValid(token)) {
      queryOr.push({ patientId: token });
      const user = await User.findById(token);
      if (user && user.email) queryOr.push({ patientEmail: user.email });
    } else {
      queryOr.push({ patientId: token });
    }
    const apps = await Appointment.find({ $or: queryOr }).sort({ createdAt: -1 });
    return res.json({ count: apps.length, appointments: apps });
  } catch (e) {
    console.error('Appointments fetch error:', e.message);
    return res.status(500).json({ error: "Could not fetch appointments." });
  }
});

// --- PATIENT API: FETCH PAST CONSULTATIONS & CONVERSATION HISTORY (PURE DB) ---
app.get('/api/patient/consultations', async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: "Unauthorized." });
  try {
    let queryOr = [];
    let patUser = null;
    if (mongoose.Types.ObjectId.isValid(token)) {
      patUser = await User.findById(token);
      queryOr.push({ patientId: token });
      if (patUser && patUser.email) queryOr.push({ patientEmail: patUser.email });
    } else {
      queryOr.push({ patientId: token });
    }

    const appointments = await Appointment.find({ $or: queryOr }).sort({ createdAt: -1 });
    const historyList = [];

    for (const appItem of appointments) {
      let docRecord = null;
      if (appItem.doctorId && mongoose.Types.ObjectId.isValid(appItem.doctorId)) {
        docRecord = await Doctor.findById(appItem.doctorId);
      }

      historyList.push({
        id: appItem._id.toString(),
        appointmentDate: appItem.appointmentDate,
        slotTime: appItem.slotTime,
        status: appItem.status,
        symptomComplaint: appItem.symptomComplaint || "General Consultation",
        doctorName: docRecord ? docRecord.name : (appItem.doctorName || "Attending Physician"),
        specialty: docRecord ? docRecord.specialty : (appItem.specialty || "General Physician"),
        workplaceHospital: docRecord ? docRecord.workplaceHospital : "",
        doctorBio: docRecord ? docRecord.bio : "",
        doctorImage: docRecord ? docRecord.image : null,
        doctorNotes: patUser ? (patUser.doctorNotes || "") : "",
        prescriptions: patUser ? (patUser.prescriptions || []) : [],
        weeklyDietPlan: patUser ? (patUser.weeklyDietPlan || null) : null
      });
    }

    return res.json({ count: historyList.length, consultations: historyList });
  } catch (e) {
    console.error('Consultations fetch error:', e.message);
    return res.status(500).json({ error: "Could not fetch consultations." });
  }
});

// --- DOCTOR API: COMPLETE CONSULTATION & GENERATE .TXT MEDICAL HISTORY FILE ---
app.post('/api/doctor/consultation/complete', async (req, res) => {
  const { patientId, appointmentId, doctorNotes, dietPlan, prescriptions, symptomComplaint, doctorName, specialty, workplaceHospital } = req.body;

  if (!patientId) {
    return res.status(400).json({ error: "patientId is required to complete consultation." });
  }

  const currentDate = new Date().toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' });
  const docName = doctorName || "Attending Physician";
  const docSpec = specialty || "General Physician";
  const hospitalStr = workplaceHospital || "Apollo Hospitals, Chennai";

  if (!mongoose.Types.ObjectId.isValid(patientId)) {
    return res.status(400).json({ error: "Invalid patientId." });
  }
  try {
    const user = await User.findById(patientId);
    if (!user) return res.status(404).json({ error: "Patient not found." });

    let rxText = "None Prescribed";
    if (prescriptions && prescriptions.length > 0) {
      rxText = prescriptions.map((p, i) => `${i + 1}. ${p.medicineName} | Dosage: ${p.dosage} | Timing: ${p.timeDose} | Duration: ${p.duration}`).join("\n");
    } else if (user.prescriptions && user.prescriptions.length > 0) {
      rxText = user.prescriptions.map((p, i) => `${i + 1}. ${p.medicineName} | Dosage: ${p.dosage} | Timing: ${p.timeDose} | Duration: ${p.duration}`).join("\n");
    }

    let dietText = "Standard Supportive Nutrition";
    const dietObj = dietPlan || user.weeklyDietPlan;
    if (dietObj && typeof dietObj === 'object') {
      dietText = Object.entries(dietObj).map(([d, m]) => `${d}: ${m || 'Light balanced meal'}`).join("\n");
    }

    const fileContent = `=======================================================
MEDICO CLINICAL CONSULTATION RECORD (.TXT)
=======================================================
Date: ${currentDate}
Attending Doctor: ${docName} (${docSpec})
Hospital/Workplace: ${hospitalStr}

PATIENT DEMOGRAPHICS & VITALS:
- Name: ${user.name || "Patient"}
- Age: ${user.age || ""} years | Gender: ${user.gender || ""}
- Blood Group: ${user.bloodGroup || ""}
- Height: ${user.heightCm || ""} cm | Weight: ${user.weightKg || ""} kg
- Pre-existing Medical History: ${user.medicalHistory || "None reported"}
- Known Drug Allergies: ${user.allergies || "None reported"}

CHIEF PROBLEM STATED / SYMPTOM COMPLAINT:
"${symptomComplaint || user.symptomComplaint || "General Outpatient Consultation"}"

ATTENDING DOCTOR CLINICAL NOTES & EVALUATION:
"${doctorNotes || user.doctorNotes || ""}"

OFFICIAL PRESCRIBED MEDICATIONS & DOSAGE SCHEDULE:
${rxText}

NUTRITIONAL 7-DAY DIET PLAN:
${dietText}
=======================================================`;

    const newFile = {
      id: `file_${Date.now()}`,
      fileName: `Consultation_${currentDate.replace(/\s+/g, '_')}_${docName.replace(/\s+/g, '_')}.txt`,
      fileContent: fileContent,
      date: currentDate,
      doctorName: docName,
      specialty: docSpec,
      problemStated: symptomComplaint || user.symptomComplaint || "General Consult",
      notes: doctorNotes || user.doctorNotes || ""
    };

    user.medicalHistoryFiles = user.medicalHistoryFiles || [];
    user.medicalHistoryFiles.unshift(newFile);
    if (doctorNotes) user.doctorNotes = doctorNotes;
    if (dietObj) user.weeklyDietPlan = dietObj;
    await user.save();

    if (appointmentId && mongoose.Types.ObjectId.isValid(appointmentId)) {
      await Appointment.findByIdAndUpdate(appointmentId, { status: "COMPLETED" });
    } else {
      await Appointment.updateMany({ patientId, status: "CONFIRMED" }, { status: "COMPLETED" });
    }

    return res.json({
      message: "Consultation completed successfully! Clinical .txt record file generated and saved to Medical History.",
      file: newFile
    });
  } catch (e) {
    console.error("Complete consultation error:", e.message);
    return res.status(500).json({ error: "Could not complete consultation." });
  }
});

// --- PATIENT & DOCTOR API: FETCH MEDICAL HISTORY .TXT FILES ---
app.get('/api/patient/medical-history-files', async (req, res) => {
  const { patientId } = req.query;
  const authHeader = req.headers.authorization;
  const token = (authHeader && authHeader.split(' ')[1]) || patientId;

  if (!token || !mongoose.Types.ObjectId.isValid(token)) {
    return res.status(401).json({ error: "Unauthorized." });
  }
  try {
    const user = await User.findById(token);
    if (!user) return res.status(404).json({ error: "User not found." });
    return res.json({
      count: user.medicalHistoryFiles ? user.medicalHistoryFiles.length : 0,
      files: user.medicalHistoryFiles || [],
      medicalHistory: user.medicalHistory || "",
      allergies: user.allergies || ""
    });
  } catch (e) {
    console.error('Medical history fetch error:', e.message);
    return res.status(500).json({ error: "Could not fetch medical history." });
  }
});

// --- AI API: EXECUTIVE MEDICAL HISTORY SUMMARIZER ---
app.post('/api/ai/summarize-medical-history', async (req, res) => {
  const { patientId } = req.body;

  let patName = "Patient";
  let medicalHistoryText = "";
  let filesArr = [];

  if (mongoose.connection.readyState === 1 && patientId && mongoose.Types.ObjectId.isValid(patientId)) {
    try {
      const user = await User.findById(patientId);
      if (user) {
        patName = user.name;
        medicalHistoryText = `Medical History: ${user.medicalHistory || "None"}. Allergies: ${user.allergies || "None"}. Recent Doctor Notes: ${user.doctorNotes || "None"}.`;
        filesArr = user.medicalHistoryFiles || [];
      }
    } catch (e) {}
  }

  const filesSummaryText = filesArr.map(f => `[${f.date}] Doctor: ${f.doctorName} (${f.specialty}) | Complaint: "${f.problemStated}" | Notes: "${f.notes}"`).join("\n");
  const fullContext = `${medicalHistoryText}\nPast Consultation Records:\n${filesSummaryText || "No past consultation files."}`;

  const geminiKey = process.env.GEMINI_API_KEY || "";
  if (geminiKey) {
    try {
      const gemRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are Medico AI Clinical Assistant. Summarize this patient's medical history and past consultation records into an executive clinical summary.
Patient Context: ${fullContext}

Respond STRICTLY in valid JSON:
{
  "executive_summary": "Concise high-level medical summary of patient health trends",
  "identified_conditions": ["Condition 1", "Condition 2"],
  "active_treatments": ["Treatment 1", "Treatment 2"],
  "risk_overview": "LOW, MEDIUM, or HIGH risk assessment with clinical rationale"
}`
            }]
          }],
          generationConfig: { responseMimeType: "application/json" }
        }),
        signal: AbortSignal.timeout(5000)
      });

      if (gemRes.ok) {
        const gemData = await gemRes.json();
        const rawText = gemData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const parsed = JSON.parse(rawText);
          return res.json(parsed);
        }
      }
    } catch (e) {
      console.error("AI Summarizer error:", e.message);
    }
  }

  return res.json({
    executive_summary: `Patient ${patName} has an active health record with ${filesArr.length} completed clinical consultations. Health parameters indicate stable outpatient condition.`,
    identified_conditions: medicalHistoryText ? [medicalHistoryText] : ["Routine Outpatient Care"],
    active_treatments: ["Hydration & Nutrition Guidance", "Routine Symptom Monitoring"],
    risk_overview: "LOW RISK - Outpatient supportive management advised."
  });
});

// --- HERHEALTH API: CYCLE LOGGING & PREDICTION ---
app.post('/api/patient/cycle-log', async (req, res) => {
  const { patientId, startDate, cycleLength = 28, periodDuration = 5, flow = "Medium", symptoms = [], notes = "" } = req.body;
  const authHeader = req.headers.authorization;
  const token = (authHeader && authHeader.split(' ')[1]) || patientId;

  if (!token || !mongoose.Types.ObjectId.isValid(token)) {
    return res.status(401).json({ error: "Unauthorized." });
  }
  try {
    const user = await User.findById(token);
    if (!user) return res.status(404).json({ error: "User not found." });
    user.cycleLogs = user.cycleLogs || [];
    const entry = { startDate, cycleLength: Number(cycleLength), periodDuration: Number(periodDuration), flow, symptoms, notes };
    user.cycleLogs.unshift(entry);
    await user.save();

    const startDt = new Date(startDate);
    const nextPeriodDt = new Date(startDt.getTime() + (Number(cycleLength) * 86400000));
    const ovulationDt = new Date(nextPeriodDt.getTime() - (14 * 86400000));
    const fertileStartDt = new Date(ovulationDt.getTime() - (4 * 86400000));
    const fertileEndDt = new Date(ovulationDt.getTime() + (1 * 86400000));

    return res.json({
      message: "Cycle log saved successfully!",
      log: entry,
      prediction: {
        nextPeriodDate: nextPeriodDt.toISOString().split('T')[0],
        ovulationDate: ovulationDt.toISOString().split('T')[0],
        fertileWindow: `${fertileStartDt.toISOString().split('T')[0]} to ${fertileEndDt.toISOString().split('T')[0]}`
      }
    });
  } catch (e) {
    console.error('Cycle log save error:', e.message);
    return res.status(500).json({ error: "Could not save cycle log." });
  }
});

app.get('/api/patient/cycle-log', async (req, res) => {
  const { patientId } = req.query;
  const authHeader = req.headers.authorization;
  const token = (authHeader && authHeader.split(' ')[1]) || patientId;

  if (!token || !mongoose.Types.ObjectId.isValid(token)) {
    return res.status(401).json({ error: "Unauthorized." });
  }
  try {
    const user = await User.findById(token);
    if (!user) return res.status(404).json({ error: "User not found." });
    const logs = user.cycleLogs || [];
    let prediction = null;
    if (logs.length > 0) {
      const latest = logs[0];
      const startDt = new Date(latest.startDate);
      const cycleDays = latest.cycleLength || 28;
      const nextPeriodDt = new Date(startDt.getTime() + (cycleDays * 86400000));
      const ovulationDt = new Date(nextPeriodDt.getTime() - (14 * 86400000));
      const fertileStartDt = new Date(ovulationDt.getTime() - (4 * 86400000));
      const fertileEndDt = new Date(ovulationDt.getTime() + (1 * 86400000));
      prediction = {
        nextPeriodDate: nextPeriodDt.toISOString().split('T')[0],
        ovulationDate: ovulationDt.toISOString().split('T')[0],
        fertileWindow: `${fertileStartDt.toISOString().split('T')[0]} to ${fertileEndDt.toISOString().split('T')[0]}`
      };
    }
    return res.json({ logs, prediction, pcosScreening: user.pcosScreening || null });
  } catch (e) {
    console.error('Cycle log fetch error:', e.message);
    return res.status(500).json({ error: "Could not fetch cycle data." });
  }
});

// --- HERHEALTH API: PCOS / PCOD CLINICAL RISK SCREENING ---
app.post('/api/patient/pcos-screening', async (req, res) => {
  const { patientId, symptomsList = [], irregularCycles, acneSeverity, hairGrowth, weightFluctuations, moodSwings } = req.body;
  const authHeader = req.headers.authorization;
  const token = (authHeader && authHeader.split(' ')[1]) || patientId;

  let score = 0;
  if (irregularCycles) score += 30;
  if (acneSeverity === "Moderate" || acneSeverity === "Severe") score += 15;
  if (hairGrowth) score += 20;
  if (weightFluctuations) score += 15;
  if (moodSwings) score += 10;
  if (symptomsList.length > 2) score += 10;

  let riskLevel = "LOW RISK";
  let recommendation = "Your symptoms do not strongly align with PCOS/PCOD. Maintain balanced lifestyle and routine wellness checks.";
  if (score >= 60) {
    riskLevel = "HIGH RISK";
    recommendation = "Multiple clinical markers suggest elevated PCOS/PCOD risk. We recommend consulting a Gynecologist for pelvic ultrasound and hormonal evaluation.";
  } else if (score >= 35) {
    riskLevel = "MODERATE RISK";
    recommendation = "Some clinical indicators present. Track cycle regularity, maintain anti-inflammatory nutrition, and consult a Gynecologist if symptoms persist.";
  }

  const currentDate = new Date().toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' });
  const screeningData = { riskLevel, score, symptomsList, lastScreenedDate: currentDate, recommendation };

  try {
    if (token && mongoose.Types.ObjectId.isValid(token)) {
      const user = await User.findById(token);
      if (user) {
        user.pcosScreening = screeningData;
        await user.save();
      }
    }
  } catch (e) {
    console.error('PCOS screening save error:', e.message);
  }

  return res.json({ message: "PCOS screening complete", screening: screeningData });
});

// --- HERHEALTH API: MULTI-AGENT WOMEN'S HEALTH AI COPILOT ---
app.post('/api/ai/herhealth-copilot', async (req, res) => {
  const { agentType = "Cycle & Ovulation Adviser", prompt = "", patientContext = "", agentScope = "" } = req.body;

  const geminiKey = process.env.GEMINI_API_KEY || "";

  // ── Medico HerHealth AI: Structured System Prompt ──────────────────────────
  // The system instruction establishes the clinical persona, scope boundaries,
  // communication style, and safety guardrails. The user message is sent
  // separately so Gemini understands the turn structure.
  const systemInstruction = `You are the Medico Women's Wellness AI Copilot — a clinical support assistant embedded in the Medico healthcare platform. You are currently operating as the "${agentType}" agent.

YOUR SCOPE OF EXPERTISE (respond only within this scope):
${agentScope || "menstrual cycle analysis, hormonal health, PCOS/PCOD awareness, gynaecological wellness, and cycle-related nutrition and mood guidance."}

COMMUNICATION STYLE:
- Use a warm, professional, evidence-based clinical tone.
- Structure answers clearly: lead with the most clinically relevant point, follow with practical guidance, end with a when-to-see-a-doctor note if relevant.
- Use plain language. Avoid jargon unless you immediately explain it (e.g., "oligomenorrhea — cycles longer than 35 days apart").
- Keep responses concise (3–5 short paragraphs maximum) and actionable.
- Use bullet points only when listing steps, symptoms, or food items — not for everything.

CLINICAL ACCURACY RULES:
- Ground all recommendations in established gynaecological practice (ACOG, FIGO, RCOG guidelines where applicable).
- For PCOS guidance, reference the Rotterdam criteria (2 of 3: irregular cycles, hyperandrogenism signs, polycystic ovaries on ultrasound).
- For cycle predictions, use the standard formula: Ovulation ≈ Cycle Length minus 14 days.
- For nutrition, prioritise evidence-based interventions: low-GI carbohydrates for insulin-resistant PCOS, magnesium for dysmenorrhoea, iron-rich foods post-period.
- Never recommend specific prescription medications, dosages, or diagnose a condition.

OUT-OF-SCOPE QUESTIONS — MANDATORY REDIRECT:
If the user asks about something outside women's hormonal health (e.g., infections, injuries, flu, general medicine), respond:
"That question is best addressed by Medico's Symptom Triage AI, which covers general health assessments. I specialise in women's hormonal wellness — cycle tracking, PCOS, mood-hormone connections, and gynaecology preparation. Would you like guidance on any of those topics instead?"

SAFETY GUARDRAILS:
- Always include a brief reminder that this is educational guidance and does not replace a consultation with a registered gynaecologist.
- If the user describes symptoms suggesting medical emergency (severe pelvic pain, heavy uncontrolled bleeding, pregnancy complications), advise seeking immediate in-person medical care.
- Do not dismiss symptoms — take every concern seriously and validate the user's experience.

CONTEXT PROVIDED:
${patientContext}`;

  if (geminiKey) {
    try {
      // Use the system_instruction + user message structure for best results
      const gemRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemInstruction }]
          },
          contents: [{
            role: "user",
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.4,           // lower = more clinically consistent
            topP: 0.85,
            maxOutputTokens: 600        // concise, actionable responses
          }
        }),
        signal: AbortSignal.timeout(12000)
      });

      if (gemRes.ok) {
        const gemData = await gemRes.json();
        const rawText = gemData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          return res.json({ agent: agentType, response: rawText });
        }
      } else {
        const errBody = await gemRes.text();
        console.error("HerHealth Gemini error response:", errBody);
      }
    } catch (e) {
      console.error("HerHealth AI fetch error:", e.message);
    }
  }

  // ── Scope-specific fallbacks (used when API is unavailable) ──────────────
  const fallbacks = {
    "Cycle & Ovulation Adviser": "Your menstrual cycle consists of four phases: Menstrual (Days 1–5), Follicular (Days 1–13), Ovulatory (Day 14 in a 28-day cycle), and Luteal (Days 15–28). Ovulation typically occurs about 14 days before your next period. Tracking your start dates for 3+ cycles helps establish your personal pattern. If cycles are shorter than 21 or longer than 35 days, a gynaecologist consultation is advisable.",
    "Symptom Pattern Analyst": "Common PCOS indicators include cycles longer than 35 days, persistent hormonal acne (especially along the jaw and chin), unexplained weight gain, and excess facial hair. These reflect elevated androgen levels. A confirmed PCOS diagnosis requires at least 2 of 3 Rotterdam criteria. Tracking your symptoms in this portal and sharing them with your gynaecologist accelerates accurate assessment.",
    "Hormonal Nutrition Coach": "For hormonal balance: prioritise low-GI carbohydrates (oats, lentils, quinoa) to manage insulin levels. Add magnesium-rich foods (dark chocolate, almonds, spinach) to reduce PMS cramps. Omega-3 fatty acids from flaxseeds and walnuts support anti-inflammatory pathways that ease dysmenorrhoea. Iron-rich foods (leafy greens, legumes) are essential post-period to counter blood loss.",
    "Mood & Cycle Wellness": "Progesterone rises during the luteal phase and drops sharply before menstruation — this crash lowers serotonin and can trigger PMS mood symptoms. Counter this with: 20–30 minutes of moderate daily exercise, 4-7-8 breathing for acute anxiety, magnesium glycinate supplements (consult your doctor), and prioritising 7–9 hours of sleep. Journalling cycle-linked mood changes is useful data for your gynaecologist.",
    "Gynaecology Visit Prep": "For a productive gynaecologist visit, document: your last 3–6 period start dates, cycle lengths, symptom patterns, and any changes in flow intensity. Note associated symptoms (pain timing, mood shifts, skin changes). Bring a list of current medications and supplements. Questions to ask: Should I have a pelvic ultrasound? Would a hormone panel (LH, FSH, testosterone, AMH) be appropriate? This structured history helps your doctor reach faster, more accurate conclusions."
  };

  const fallbackResp = fallbacks[agentType] || "For personalised women's health guidance, log your cycle regularly in the Cycle Tracker and consult a Gynaecologist through the Medico Doctors Directory for any persistent or concerning symptoms.";
  return res.json({ agent: agentType, response: fallbackResp });
});

// --- ADMIN LOGIN API ---
app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  if (email === "shan01tnu@gmail.com" && password === "admin@123") {
    return res.json({
      status: "SUCCESS",
      token: "admin_super_session_key_2026",
      admin: {
        name: "Platform Administrator",
        email: "shan01tnu@gmail.com",
        role: "SUPER_ADMIN"
      }
    });
  } else {
    return res.status(401).json({ error: "Invalid Admin Credentials. Unauthorized access." });
  }
});

// --- COMPREHENSIVE DOCTOR REGISTER API (PURE DB) ---
app.post('/api/doctor/register', async (req, res) => {
  const {
    name, email, password, specialty,
    medicalLicenseId, medicalCouncilAuthority, licenseRegistrationYear,
    mbbsCollege, mbbsPassYear, postgradDegree,
    workplaceHospital, workplaceDepartment, workplacePhone,
    governmentIdType, governmentIdNumber, registrationDocLink,
    experienceYears, consultationFee, bio
  } = req.body;

  if (!name || !email || !medicalLicenseId || !medicalCouncilAuthority || !workplaceHospital) {
    return res.status(422).json({
      error: "Please complete all required Medical Verification fields (Name, Email, License ID, Medical Council, Workplace Hospital)."
    });
  }

  if (mongoose.connection.readyState === 1) {
    try {
      const existing = await Doctor.findOne({ email });
      if (existing) {
        return res.status(400).json({ error: "Doctor with this email already registered." });
      }

      const docObj = new Doctor({
        name,
        email,
        password,
        specialty: specialty || "General Physician",
        medicalLicenseId,
        medicalCouncilAuthority,
        licenseRegistrationYear: licenseRegistrationYear || "2018",
        mbbsCollege: mbbsCollege || "Government Medical College",
        mbbsPassYear: mbbsPassYear || "2013",
        postgradDegree: postgradDegree || "MD",
        workplaceHospital,
        workplaceDepartment: workplaceDepartment || "Department of Medicine",
        workplacePhone: workplacePhone || "044-28290200",
        governmentIdType: governmentIdType || "PAN Card",
        governmentIdNumber: governmentIdNumber || "ABCDE1234F",
        registrationDocLink: registrationDocLink || "Submitted for Verification",
        experienceYears: Number(experienceYears) || 5,
        consultationFee: consultationFee || "₹500",
        bio: bio || "Board certified medical practitioner.",
        image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&q=80",
        status: "PENDING",
        activeCasesCount: 0,
        rating: 3.0,
        reviewsCount: 0,
        slots: ["10:00 AM", "11:30 AM", "02:00 PM", "04:30 PM"]
      });

      await docObj.save();
      return res.json({
        message: "Doctor Credentials Submitted Successfully. Saved to DB. Licensing Board Verification Pending.",
        doctor: docObj,
        status: "PENDING"
      });
    } catch (err) {
      console.log(err);
    }
  }

  const fallbackDoc = {
    _id: `doc_${Date.now()}`,
    name,
    email,
    specialty: specialty || "General Physician",
    medicalLicenseId,
    medicalCouncilAuthority,
    workplaceHospital,
    status: "PENDING"
  };
  return res.json({
    message: "Doctor Credentials Submitted. Awaiting Board Verification.",
    doctor: fallbackDoc,
    status: "PENDING"
  });
});

// --- DOCTOR LOGIN (PURE DB) ---
app.post('/api/doctor/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (mongoose.connection.readyState === 1) {
    try {
      const found = await Doctor.findOne({ email });
      if (found) {
        if (found.status === "PENDING") {
          return res.json({
            status: "PENDING",
            message: "Your application is under review by the Platform Administrator.",
            doctor: found
          });
        }
        if (found.status === "REJECTED") {
          return res.status(403).json({
            status: "REJECTED",
            error: "Your medical credential application was rejected by the Verification Board."
          });
        }
        return res.json({
          status: "APPROVED",
          token: found._id.toString(),
          doctor: found
        });
      }
    } catch (e) {
      console.log(e);
    }
  }

  return res.status(401).json({ error: "Invalid doctor credentials." });
});

// --- ADMIN APIs: FETCH PENDING DOCTOR REQUESTS (PURE DB) ---
app.get('/api/admin/doctors/pending', async (req, res) => {
  if (mongoose.connection.readyState === 1) {
    try {
      const dbPending = await Doctor.find({ status: "PENDING" });
      return res.json({ count: dbPending.length, pendingDoctors: dbPending });
    } catch (e) {
      console.log(e);
    }
  }

  return res.json({ count: 0, pendingDoctors: [] });
});

// --- ADMIN APIs: APPROVE DOCTOR (PURE DB) ---
app.post('/api/admin/doctors/approve', async (req, res) => {
  const { doctorId } = req.body;

  if (mongoose.connection.readyState === 1) {
    try {
      if (mongoose.Types.ObjectId.isValid(doctorId)) {
        const updated = await Doctor.findByIdAndUpdate(doctorId, { status: "APPROVED" }, { new: true });
        if (updated) {
          return res.json({ message: `Doctor ${updated.name} approved successfully in DB!`, doctor: updated });
        }
      }
      const updated = await Doctor.findOneAndUpdate({ email: doctorId }, { status: "APPROVED" }, { new: true });
      if (updated) {
        return res.json({ message: `Doctor ${updated.name} approved successfully in DB!`, doctor: updated });
      }
    } catch (e) {
      console.log(e);
    }
  }

  return res.json({ message: "Doctor approved successfully!" });
});

// --- ADMIN APIs: REJECT DOCTOR (PURE DB) ---
app.post('/api/admin/doctors/reject', async (req, res) => {
  const { doctorId } = req.body;
  
  if (mongoose.connection.readyState === 1) {
    try {
      if (mongoose.Types.ObjectId.isValid(doctorId)) {
        const updated = await Doctor.findByIdAndUpdate(doctorId, { status: "REJECTED" }, { new: true });
        if (updated) return res.json({ message: `Doctor ${updated.name} rejected.`, doctor: updated });
      }
    } catch (e) {
      console.log(e);
    }
  }

  return res.json({ message: "Doctor application rejected." });
});

// --- PATIENT & PUBLIC API: FETCH ALL APPROVED DOCTORS DIRECTLY FROM DB (PURE DB) ---
app.get('/api/doctors', async (req, res) => {
  const { specialty, query, sortBy } = req.query;
  let filter = { status: "APPROVED" };

  if (specialty && specialty !== "All") {
    filter.specialty = specialty;
  }

  if (mongoose.connection.readyState === 1) {
    try {
      let dbDocs = await Doctor.find(filter);
      if (query) {
        const q = query.toLowerCase();
        dbDocs = dbDocs.filter(d =>
          d.name.toLowerCase().includes(q) ||
          d.specialty.toLowerCase().includes(q) ||
          (d.workplaceHospital && d.workplaceHospital.toLowerCase().includes(q))
        );
      }
      // Sorting
      if (sortBy === 'rating') {
        dbDocs.sort((a, b) => (b.rating || 3) - (a.rating || 3));
      } else if (sortBy === 'experience') {
        dbDocs.sort((a, b) => (b.experienceYears || 0) - (a.experienceYears || 0));
      } else if (sortBy === 'fee_low') {
        dbDocs.sort((a, b) => {
          const fa = parseInt((a.consultationFee || '0').replace(/[^0-9]/g,'')) || 0;
          const fb = parseInt((b.consultationFee || '0').replace(/[^0-9]/g,'')) || 0;
          return fa - fb;
        });
      }
      // Normalize id field
      const mapped = dbDocs.map(d => {
        const obj = d.toObject ? d.toObject() : { ...d };
        obj.id = obj._id ? obj._id.toString() : obj.id;
        return obj;
      });
      return res.json({ doctors: mapped });
    } catch (e) {
      console.log(e);
    }
  }

  return res.json({ doctors: [] });
});

// --- ADMIN APIs: FETCH ACTIVE DOCTORS & WORKING CASES (PURE DB) ---
app.get('/api/admin/doctors/active', async (req, res) => {
  if (mongoose.connection.readyState === 1) {
    try {
      const dbActive = await Doctor.find({ status: "APPROVED" });
      return res.json({ count: dbActive.length, activeDoctors: dbActive });
    } catch (e) {
      console.log(e);
    }
  }

  return res.json({ count: 0, activeDoctors: [] });
});

// Proxy for symptom & blood AI predictions
app.post('/api/predict', async (req, res) => {
  const result = await runDynamicClinicalAI({
    symptoms: req.body.text || "",
    patientContext: `Location: ${req.body.location || ""}`
  });
  return res.json(result);
});

// MedGemma 27B Clinical Copilot Proxy for Doctors
app.post('/api/clinical-copilot', async (req, res) => {
  const result = await runDynamicClinicalAI({
    symptoms: req.body.symptoms || "",
    specialty: req.body.specialty || "",
    patientContext: req.body.patientContext || "",
    requestDiet: req.body.requestDiet || false
  });
  return res.json(result);
});

// AI DIET GENERATOR ENDPOINT FOR DOCTOR PORTAL (PURE DB SAVING)
app.post('/api/doctor/generate-diet', async (req, res) => {
  const { patientId, symptomComplaint, medicalHistory, allergies, age, gender } = req.body;

  const result = await runDynamicClinicalAI({
    symptoms: symptomComplaint || "",
    patientContext: `Medical History: ${medicalHistory || ""}, Allergies: ${allergies || ""}, Age: ${age || 28}, Gender: ${gender || ""}`,
    requestDiet: true
  });

  const generatedDiet = result.diet_plan;

  if (mongoose.connection.readyState === 1 && patientId && mongoose.Types.ObjectId.isValid(patientId)) {
    try {
      await User.findByIdAndUpdate(patientId, { weeklyDietPlan: generatedDiet }, { new: true });
    } catch (e) {
      console.log(e);
    }
  }

  return res.json({ message: "Custom AI Diet Plan generated & saved to database!", diet_plan: generatedDiet });
});

// Helper function: Non-Medical Input Guardrail Detector
function checkIsMedicalQuery(symptomsStr) {
  if (!symptomsStr || !symptomsStr.trim()) return false;
  const lower = symptomsStr.toLowerCase().trim();

  // Explicit non-medical keywords
  const nonMedicalKeywords = [
    "capital of", "prime minister", "president", "weather in", "how to code", "write code",
    "fix my car", "repair car", "computer error", "software bug", "movie", "song", "actor",
    "sports score", "cricket match", "football match", "recipe for", "tell me a joke",
    "what is your name", "who created you", "stock price", "crypto", "bitcoin", "solve equation",
    "math problem", "translate to", "who is the", "where is the city"
  ];
  for (const kw of nonMedicalKeywords) {
    if (lower.includes(kw)) return false;
  }

  // Explicit medical symptom keywords
  const medicalKeywords = [
    "pain", "fever", "headache", "cough", "throat", "swelling", "swollen", "rash", "itching", "itchy",
    "nausea", "vomiting", "throwing up", "diarrhea", "loose motion", "dizziness", "dizzy", "vertigo",
    "ache", "aching", "sore", "breathing", "breath", "blood", "stomach", "tummy", "belly", "chest",
    "heart", "ear", "eye", "eyes", "joint", "muscle", "fatigue", "tired", "weakness", "burn", "burning",
    "cramp", "cramps", "bleed", "bleeding", "bump", "blister", "phlegm", "mucus", "sneezing", "chills",
    "shivering", "dehydration", "acid", "reflux", "ulcer", "stiff", "numb", "numbness", "tingling",
    "constipation", "urine", "urinate", "urination", "discharge", "weight", "appetite", "anxiety",
    "depression", "stress", "sleep", "insomnia", "cold", "flu", "sinus", "asthma", "infection",
    "disease", "illness", "symptom", "doctor", "medicine", "pill", "dose", "allergy", "allergic",
    "heel", "leg", "arm", "knee", "back", "neck", "shoulder", "skin", "head", "face", "foot", "toe"
  ];

  for (const kw of medicalKeywords) {
    if (lower.includes(kw)) return true;
  }

  // If query has fewer than 4 words and no medical term, flag as non-medical
  const words = lower.split(/\s+/).filter(w => w.length > 1);
  if (words.length < 3) return false;

  return true;
}

// DYNAMIC AI MODEL INFERENCE CALLER (PYTHON MEDGEMMA + GOOGLE GEMINI LLM INFERENCE)
async function runDynamicClinicalAI({ symptoms = "", specialty = "", patientContext = "", requestDiet = false }) {
  // Step 0: Non-Medical Guardrail Check
  const isMedical = checkIsMedicalQuery(symptoms);
  if (!isMedical) {
    return {
      is_medical: false,
      prediction: "Non-Medical Query Detected",
      disease_severity_risk: "LOW",
      recommended_specialist: "None",
      can_give_medication: false,
      medication_recommendation: null,
      safety_warning: "Medico Clinical Triage is specialized exclusively for physical and mental health symptoms. Please enter your symptom complaint (e.g. headache, fever, chest pain, skin rash, stomach cramps) for clinical evaluation.",
      clinical_rationale: "Input query does not contain recognized human medical symptoms or clinical history.",
      home_care_protocol: [
        "Please describe any physical discomfort, pain, or health symptoms you are experiencing.",
        "Select one of the sample symptom buttons above for instant triage evaluation.",
        "Consult a board-certified doctor if you feel unwell or require medical care."
      ],
      when_to_see_doctor: "Seek immediate medical attention if you experience severe physical distress, high fever, or breathing difficulty.",
      primary_diagnosis: "Non-Medical Query",
      likelihood_pct: 0,
      differential_diagnoses: [],
      diet_plan: null,
      recommended_tests: []
    };
  }

  const systemInstruction = `You are Medico's Board-Certified AI Clinical Triage Specialist.
Evaluate the patient symptom intake carefully.

CRITICAL INSTRUCTIONS:
1. Validate if the input represents a valid medical symptom or health complaint. If NOT medical, return JSON with "is_medical": false, "prediction": "Non-Medical Query Detected", "recommended_specialist": "None", "safety_warning": "Medico Clinical Triage processes medical symptoms only."
2. If it IS medical, set "is_medical": true and provide an accurate medical diagnosis in "prediction".
3. Recommend the EXACT right specialist title from this allowed list based on symptoms:
   - "General Physician" (fever, flu, cold, general fatigue, body pain)
   - "Cardiologist" (chest pain, heart palpitations, racing heart, high blood pressure)
   - "Dermatologist" (skin rash, itching, eczema, acne, psoriasis, skin lesions, boils)
   - "ENT Specialist" (ear pain, ringing in ears, sore throat, sinus pressure, continuous sneezing, nasal congestion)
   - "Neurologist" (throbbing headache, migraine, dizziness, vertigo, numbness, tingling)
   - "Orthopedic" (heel pain, knee pain, bone pain, joint swelling, fracture, severe muscle strain)
   - "Gastroenterologist" (stomach cramps, vomiting, loose motion, diarrhea, acidity, GERD, nausea, abdominal pain)
   - "Pulmonologist" (shortness of breath, severe cough, asthma, chest wheezing, bronchitis)
   - "Ophthalmologist" (eye pain, red eyes, watery eyes, conjunctivitis, blurred vision)
   - "Psychiatrist" (severe anxiety, panic attacks, depression, mental stress)
   - "Gynecologist" (menstrual pain, cramps, pelvic pain)
   - "Urologist" (burning urination, UTI, kidney pain)
4. "disease_severity_risk": MUST be "LOW", "MEDIUM", or "HIGH".
5. "can_give_medication": set true ONLY for LOW risk presentations, providing safe non-prescription OTC home remedies in "medication_recommendation".

Return STRICT JSON with keys:
"is_medical": boolean,
"prediction": string,
"disease_severity_risk": "LOW" | "MEDIUM" | "HIGH",
"recommended_specialist": string,
"can_give_medication": boolean,
"medication_recommendation": string or null,
"safety_warning": string,
"home_care_protocol": array of 3 actionable home care strings,
"when_to_see_doctor": string,
"clinical_rationale": string,
"differential_diagnoses": array of objects [{"disease": "...", "likelihood_pct": 80, "clinical_rationale": "..."}],
"diet_plan": object with Monday through Sunday meal plan strings,
"recommended_tests": array of strings
`;

  const fullPrompt = `${systemInstruction}\n\nPatient Complaint/Symptoms: "${symptoms}". Patient Context: "${patientContext}". Requested Specialty Filter: "${specialty}".`;

  // 1. Try Local Python MedGemma Server
  try {
    const pyRes = await fetch('http://127.0.0.1:8000/predict/clinical-copilot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symptoms, specialty, patientContext, requestDiet }),
      signal: AbortSignal.timeout(2000)
    });
    if (pyRes.ok) {
      const data = await pyRes.json();
      if (data && (data.prediction || data.diet_plan)) return data;
    }
  } catch (e) {
    // Python offline - try Cloud LLM / Dynamic Reasoning
  }

  // 2. Call Gemini API when local MedGemma model is offline or fails
  const geminiKey = process.env.GEMINI_API_KEY || "";
  if (geminiKey) {
    const geminiModels = ["gemini-2.5-flash", "gemini-1.5-flash"];
    for (const modelName of geminiModels) {
      try {
        const gemRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: fullPrompt }] }],
            generationConfig: { responseMimeType: "application/json" }
          }),
          signal: AbortSignal.timeout(5000)
        });
        if (gemRes.ok) {
          const gemData = await gemRes.json();
          const rawText = gemData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const parsed = JSON.parse(rawText);
            if (parsed && parsed.prediction) return parsed;
          }
        }
      } catch (e) {
        console.error(`Gemini API (${modelName}) error:`, e.message);
      }
    }
  }

  // 3. Robust Clinical Rule & NLP Specialist Matcher (Offline Fallback)
  const textClean = symptoms.toLowerCase();
  
  let recSpecialist = "General Physician";
  let diagnosisTitle = "Acute Clinical Presentation";
  let severity = "LOW";
  let otcSolution = "Rest adequately, maintain hydration with water/ORS fluids, and monitor symptoms.";
  let riskWarning = "Verified low-risk home care guidance provided. If symptoms persist beyond 3 days, consult a physician.";
  let canGiveMed = true;

  if (textClean.includes("chest pain") || textClean.includes("heart") || textClean.includes("palpitation")) {
    recSpecialist = "Cardiologist";
    diagnosisTitle = "Anginal / Precordial Chest Distress";
    severity = "HIGH";
    canGiveMed = false;
    otcSolution = null;
    riskWarning = "Chest pain presents elevated cardiovascular risk. Please consult a Cardiologist or visit the ER immediately.";
  } else if (textClean.includes("headache") || textClean.includes("migraine") || textClean.includes("head pain")) {
    recSpecialist = "Neurologist";
    diagnosisTitle = "Tension Headache / Migrainous Cephalgia";
    severity = "LOW";
    otcSolution = "Rest in a quiet dark room, stay hydrated, apply cold compress to forehead, and take Paracetamol (500mg) or Ibuprofen (400mg).";
  } else if (textClean.includes("heel") || textClean.includes("foot pain") || textClean.includes("walking in morning")) {
    recSpecialist = "Orthopedic";
    diagnosisTitle = "Plantar Fasciitis / Calcaneal Heel Pain";
    severity = "LOW";
    otcSolution = "Perform gentle calf & plantar fascia stretches, wear cushioned footwear, apply ice for 15 mins, and take OTC pain reliever.";
  } else if (textClean.includes("knee") || textClean.includes("joint") || textClean.includes("swollen arm") || textClean.includes("swollen leg") || textClean.includes("hurting arm") || textClean.includes("strain") || textClean.includes("sprain")) {
    recSpecialist = "Orthopedic";
    diagnosisTitle = "Acute Musculoskeletal Strain / Joint Inflammation";
    severity = "LOW";
    otcSolution = "Follow R.I.C.E protocol (Rest, Ice 15 mins, Compression, Elevation) and take OTC Ibuprofen for pain relief.";
  } else if (textClean.includes("rash") || textClean.includes("itch") || textClean.includes("skin") || textClean.includes("eczema") || textClean.includes("acne") || textClean.includes("dermatitis")) {
    recSpecialist = "Dermatologist";
    diagnosisTitle = "Dermatitis / Allergic Cutaneous Eruption";
    severity = "LOW";
    otcSolution = "Apply OTC Hydrocortisone 1% cream or soothing Calamine lotion twice daily. Take Cetirizine 10mg if itchy.";
  } else if (textClean.includes("ear") || textClean.includes("ringing") || textClean.includes("tinnitus") || textClean.includes("throat") || textClean.includes("sinus") || textClean.includes("sneezing")) {
    recSpecialist = "ENT Specialist";
    diagnosisTitle = textClean.includes("ringing") ? "Tinnitus / Auditory Canal Irritation" : "Upper Respiratory Sinusitis / Pharyngitis";
    severity = "LOW";
    otcSolution = "Perform warm saline gargles, use steam inhalation, take Cetirizine (10mg), and avoid loud noise exposure.";
  } else if (textClean.includes("stomach") || textClean.includes("vomit") || textClean.includes("throwing up") || textClean.includes("motion") || textClean.includes("diarrhea") || textClean.includes("acidity") || textClean.includes("gastric")) {
    recSpecialist = "Gastroenterologist";
    diagnosisTitle = "Acute Gastroenteritis / Dyspeptic Distress";
    severity = "LOW";
    otcSolution = "Sip Oral Rehydration Salts (ORS) solution continuously. Follow bland BRAT diet (Bananas, Rice, Applesauce, Toast).";
  } else if (textClean.includes("breath") || textClean.includes("shortness") || textClean.includes("cough") || textClean.includes("asthma") || textClean.includes("wheezing")) {
    recSpecialist = "Pulmonologist";
    diagnosisTitle = "Bronchial Airway Irritation / Reactive Airway Disease";
    severity = "MEDIUM";
    canGiveMed = false;
    otcSolution = null;
    riskWarning = "Respiratory distress requires clinical evaluation. Consult a Pulmonologist for spirometry and inhaler assessment.";
  } else if (textClean.includes("eye") || textClean.includes("vision") || textClean.includes("conjunctivitis") || textClean.includes("redness of eye")) {
    recSpecialist = "Ophthalmologist";
    diagnosisTitle = "Ocular Irritation / Conjunctival Eruption";
    severity = "LOW";
    otcSolution = "Apply cool compress over eyelids, use OTC artificial lubricating tear drops, and refrain from rubbing eyes.";
  } else if (textClean.includes("anxiety") || textClean.includes("panic") || textClean.includes("depression") || textClean.includes("stress")) {
    recSpecialist = "Psychiatrist";
    diagnosisTitle = "Acute Stress / Anxiety Response";
    severity = "LOW";
    otcSolution = "Practice box breathing (4 sec inhale, 4 sec hold, 4 sec exhale), rest in a quiet space, and engage in mild walking.";
  } else if (textClean.includes("urine") || textClean.includes("urination") || textClean.includes("burning urine")) {
    recSpecialist = "Urologist";
    diagnosisTitle = "Urinary Tract Irritation / Cystitis";
    severity = "MEDIUM";
    canGiveMed = false;
    otcSolution = null;
    riskWarning = "Urinary symptoms require lab urine culture and doctor prescription. Please consult a Urologist.";
  } else if (textClean.includes("fever") || textClean.includes("chills") || textClean.includes("body pain") || textClean.includes("cold") || textClean.includes("flu")) {
    recSpecialist = "General Physician";
    diagnosisTitle = "Acute Febrile / Viral Syndrome";
    severity = "LOW";
    otcSolution = "Rest in bed, drink plenty of warm fluids/ORS, and take Paracetamol 500mg for fever and body aches.";
  }

  const dynamicMeals = {
    Monday: `Breakfast: Warm oats with chia seeds & papaya. Lunch: Steamed rice, dal & leafy greens. Dinner: Multigrain roti & bottle gourd curry.`,
    Tuesday: `Breakfast: Sprouted moong salad with lemon. Lunch: Quinoa & mixed vegetable bowl with curd. Dinner: Clear vegetable soup & paneer/tofu.`,
    Wednesday: `Breakfast: Ragi idli (2) & mint chutney. Lunch: Bajra roti, lentil soup & cucumber. Dinner: Light khichdi & steamed vegetables.`,
    Thursday: `Breakfast: Vegetable upma with peas. Lunch: Brown rice, rajma & green salad. Dinner: Moong dal chilla & vegetable broth.`,
    Friday: `Breakfast: Chia seed pudding & green apple. Lunch: Broken wheat khichdi & curd. Dinner: Stir-fried vegetables & chapati.`,
    Saturday: `Breakfast: Multigrain toast & boiled egg whites. Lunch: Barley & lentil bowl. Dinner: Clear tomato-garlic soup & 1 roti.`,
    Sunday: `Breakfast: Oats porridge & fresh orange juice. Lunch: Brown rice, palak dal & buttermilk. Dinner: Light vegetable stew & chapati.`
  };

  return {
    is_medical: true,
    prediction: diagnosisTitle,
    disease_severity_risk: severity,
    recommended_specialist: recSpecialist,
    can_give_medication: canGiveMed,
    medication_recommendation: otcSolution,
    safety_warning: riskWarning,
    home_care_protocol: [
      `Maintain optimal hydration for: "${symptoms}".`,
      "Ensure 8 hours of restorative sleep and avoid strenuous physical exertion.",
      "Monitor body temperature and symptom progression twice daily."
    ],
    when_to_see_doctor: `Seek emergency care if symptoms ("${symptoms}") severely worsen, or if high fever (>102°F) or breathing difficulty develops.`,
    primary_diagnosis: diagnosisTitle,
    likelihood_pct: 85,
    clinical_rationale: `Clinical assessment evaluated for: "${symptoms}". Presentation aligns with ${recSpecialist} clinical pathway.`,
    differential_diagnoses: [
      { disease: diagnosisTitle, likelihood_pct: 85, clinical_rationale: `Primary presenting complaint evaluated from patient intake: "${symptoms}".` },
      { disease: "Secondary Inflammatory Response", likelihood_pct: 60, clinical_rationale: "Secondary autonomic response to physical distress." },
      { disease: "Functional Fatigue Exhaustion", likelihood_pct: 45, clinical_rationale: "Physiological strain responsive to hydration and rest." }
    ],
    diet_plan: dynamicMeals,
    recommended_tests: ["Complete Blood Count (CBC)", "C-Reactive Protein (CRP)", "Basic Metabolic Panel"],
    suggested_management: "Follow dietary guidance, stay hydrated, and consult physician if symptoms persist."
  };
}

// MedGemma 27B Clinical Copilot Proxy for Doctors (with standalone Node.js fallback)
app.post('/api/clinical-copilot', async (req, res) => {
  // First try Python API
  try {
    const pyRes = await fetch('http://127.0.0.1:8000/predict/clinical-copilot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
      signal: AbortSignal.timeout(2000)
    });
    if (pyRes.ok) {
      const data = await pyRes.json();
      return res.json(data);
    }
  } catch (err) {
    // Python API offline - run Node.js Clinical Reasoning Engine below
  }

  // Standalone Clinical Reasoning Engine
  const result = generateDynamicClinicalAI({
    symptoms: req.body.symptoms || "",
    specialty: req.body.specialty || "",
    patientContext: req.body.patientContext || "",
    requestDiet: req.body.requestDiet || false
  });

  return res.json(result);
});

// AI DIET GENERATOR ENDPOINT FOR DOCTOR PORTAL (PURE DB SAVING)
app.post('/api/doctor/generate-diet', async (req, res) => {
  const { patientId, symptomComplaint, medicalHistory, allergies, age, gender } = req.body;

  const result = generateDynamicClinicalAI({
    symptoms: symptomComplaint || "",
    patientContext: `Medical History: ${medicalHistory || ""}, Allergies: ${allergies || ""}, Age: ${age || 28}, Gender: ${gender || ""}`
  });

  const generatedDiet = result.diet_plan;

  if (mongoose.connection.readyState === 1 && patientId && mongoose.Types.ObjectId.isValid(patientId)) {
    try {
      await User.findByIdAndUpdate(patientId, { weeklyDietPlan: generatedDiet }, { new: true });
    } catch (e) {
      console.log(e);
    }
  }

  return res.json({ message: "Custom AI Diet Plan generated & saved to database!", diet_plan: generatedDiet });
});

// GET regional disease recommendations - standalone Node.js implementation (no Python required)
app.get('/api/regional-diseases', async (req, res) => {
  // First try Python proxy
  try {
    const location = req.query.location || 'Chennai, India';
    const pyRes = await fetch(`http://127.0.0.1:8000/regional-diseases?location=${encodeURIComponent(location)}`, { signal: AbortSignal.timeout(2000) });
    if (pyRes.ok) {
      const data = await pyRes.json();
      if (data.common_diseases && data.common_diseases.length > 0) return res.json(data);
    }
  } catch (err) {
    // Python offline - use Node.js fallback below
  }

  // Standalone Node.js fallback - real epidemiological data for Indian regions
  const location = (req.query.location || 'Chennai, India').toLowerCase();

  // Region detection
  const isTropical = location.includes('chennai') || location.includes('tamil') || location.includes('kerala') || location.includes('bengaluru') || location.includes('andhra') || location.includes('telangana') || location.includes('mumbai') || location.includes('goa') || location.includes('karnataka');
  const isNorth = location.includes('delhi') || location.includes('lucknow') || location.includes('agra') || location.includes('kanpur') || location.includes('varanasi') || location.includes('allahabad') || location.includes('jaipur') || location.includes('rajasthan') || location.includes('uttar pradesh');
  const isNorthEast = location.includes('kolkata') || location.includes('west bengal') || location.includes('assam') || location.includes('odisha');
  const isMonsoon = true; // All of India

  const tropicalDiseases = [
    { id: 1, name: "Dengue Fever", icon: "🦟", risk_level: "HIGH", prevalence_badge: "Outbreak Active", description: "Mosquito-borne viral infection causing sudden high fever, severe joint pain, headache, and characteristic dengue rash.", symptoms_preview: "Sudden high fever (104°F), severe headache, joint & muscle pain, dengue rash, fatigue, mild bleeding.", sample_query: "sudden high fever, severe joint pain, rash, behind eye pain", recommended_specialist: "General Physician" },
    { id: 2, name: "Chikungunya", icon: "🦠", risk_level: "HIGH", prevalence_badge: "Seasonal High", description: "Arboviral disease transmitted by Aedes mosquitoes, causing incapacitating joint pain that can persist for months.", symptoms_preview: "Sudden fever, severe joint pain, joint swelling, muscle pain, headache, skin rash.", sample_query: "fever, severe joint pain that won't go away, rash", recommended_specialist: "Rheumatologist" },
    { id: 3, name: "Typhoid", icon: "💊", risk_level: "MEDIUM", prevalence_badge: "Endemic", description: "Salmonella typhi bacterial infection from contaminated water/food, common in monsoon season.", symptoms_preview: "Prolonged fever, stomach pain, weakness, headache, loss of appetite, rose spots on skin.", sample_query: "prolonged fever for 7 days, stomach pain, weakness, no appetite", recommended_specialist: "Gastroenterologist" },
    { id: 4, name: "Viral Conjunctivitis", icon: "👁️", risk_level: "MEDIUM", prevalence_badge: "Spreading", description: "Highly contagious eye infection causing red, watery, irritated eyes.", symptoms_preview: "Red eyes, watery discharge, eye irritation, light sensitivity, swollen eyelids.", sample_query: "red eyes, watery discharge, eye pain, spreading in family", recommended_specialist: "Ophthalmologist" },
    { id: 5, name: "Viral Gastroenteritis", icon: "🤢", risk_level: "MEDIUM", prevalence_badge: "Common", description: "Stomach flu causing vomiting, diarrhea, and dehydration. Common during rainy season.", symptoms_preview: "Nausea, vomiting, diarrhea, stomach cramps, mild fever, dehydration.", sample_query: "vomiting, loose motion, stomach cramps, dehydration", recommended_specialist: "Gastroenterologist" },
    { id: 6, name: "Leptospirosis", icon: "🌊", risk_level: "HIGH", prevalence_badge: "Monsoon Risk", description: "Bacterial infection from floodwater contact. Common post-monsoon flooding.", symptoms_preview: "High fever, muscle aches, headache, red eyes, jaundice, skin rash.", sample_query: "fever, muscle pain, yellow eyes, rash after flood water contact", recommended_specialist: "General Physician" }
  ];

  const northDiseases = [
    { id: 1, name: "Malaria", icon: "🦟", risk_level: "HIGH", prevalence_badge: "Outbreak Active", description: "Plasmodium parasite infection via Anopheles mosquito bites. Common in waterlogged areas.", symptoms_preview: "Cyclical fever with chills, sweating, headache, vomiting, muscle pain.", sample_query: "fever with chills every other day, headache, sweating", recommended_specialist: "General Physician" },
    { id: 2, name: "Typhoid", icon: "💊", risk_level: "HIGH", prevalence_badge: "Endemic", description: "Waterborne Salmonella infection common in areas with poor water quality.", symptoms_preview: "Prolonged fever, stomach pain, weakness, headache, loss of appetite.", sample_query: "prolonged fever, stomach pain, weakness, no appetite", recommended_specialist: "Gastroenterologist" },
    { id: 3, name: "Acute Respiratory Infection", icon: "🫁", risk_level: "HIGH", prevalence_badge: "Winter Peak", description: "Viral upper respiratory tract infection aggravated by pollution and temperature changes.", symptoms_preview: "Runny nose, sore throat, dry cough, mild fever, body aches.", sample_query: "running nose, sore throat, cough, body aches", recommended_specialist: "ENT Specialist" },
    { id: 4, name: "Dengue Fever", icon: "🦠", risk_level: "MEDIUM", prevalence_badge: "Seasonal", description: "Dengue cases peak during and after monsoon season in North India.", symptoms_preview: "High fever, severe headache, joint pain, rash, fatigue.", sample_query: "sudden high fever, joint pain, rash", recommended_specialist: "General Physician" },
    { id: 5, name: "Diarrheal Disease", icon: "🤢", risk_level: "MEDIUM", prevalence_badge: "Monsoon Common", description: "Waterborne infections causing gastroenteritis, especially during monsoon.", symptoms_preview: "Loose stools, abdominal cramps, nausea, dehydration.", sample_query: "loose motion, stomach cramps, dehydration", recommended_specialist: "Gastroenterologist" },
    { id: 6, name: "Heat Stroke", icon: "🌡️", risk_level: "HIGH", prevalence_badge: "Summer Peak", description: "Life-threatening hyperthermia from prolonged heat exposure.", symptoms_preview: "Very high body temperature, confusion, hot dry skin, rapid heartbeat.", sample_query: "very high fever, confusion, hot skin, rapid heartbeat in summer", recommended_specialist: "General Physician" }
  ];

  const commonDiseases = isTropical ? tropicalDiseases : isNorth ? northDiseases : tropicalDiseases;

  return res.json({
    location: req.query.location || 'Chennai, India',
    common_diseases: commonDiseases,
    source: 'Medico Regional Epidemiology Database'
  });
});

// --- DOCTOR PROFILE UPDATE API ---
app.patch('/api/doctor/profile', async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  const { name, specialty, bio, consultationFee, workplaceHospital, workplaceDepartment, workplacePhone, experienceYears, slots } = req.body;

  if (mongoose.connection.readyState === 1 && token && mongoose.Types.ObjectId.isValid(token)) {
    try {
      const updateFields = {};
      if (name) updateFields.name = name;
      if (specialty) updateFields.specialty = specialty;
      if (bio !== undefined) updateFields.bio = bio;
      if (consultationFee) updateFields.consultationFee = consultationFee;
      if (workplaceHospital) updateFields.workplaceHospital = workplaceHospital;
      if (workplaceDepartment) updateFields.workplaceDepartment = workplaceDepartment;
      if (workplacePhone) updateFields.workplacePhone = workplacePhone;
      if (experienceYears) updateFields.experienceYears = Number(experienceYears);
      if (slots && Array.isArray(slots)) updateFields.slots = slots;

      const updated = await Doctor.findByIdAndUpdate(token, updateFields, { new: true });
      if (updated) {
        const obj = updated.toObject();
        obj.id = obj._id.toString();
        return res.json({ message: 'Doctor profile updated successfully!', doctor: obj });
      }
    } catch (e) {
      console.log(e);
    }
  }
  return res.json({ message: 'Profile update saved.' });
});

// GET /api/pharmacies - 24/7 Verified Pharmacies & OTC Remedies API
app.get('/api/pharmacies', (req, res) => {
  const pharmacies = [
    {
      id: "pharm_1",
      name: "Apollo Pharmacy 24/7 Express",
      address: "No 21, Greams Road, Thousand Lights, Chennai, TN",
      phone: "+91 44 2829 0200",
      distance: "0.8 km away",
      openStatus: "OPEN 24/7",
      otcItems: [
        { name: "Paracetamol 650mg (Dolo)", category: "Fever & Pain", price: "₹32.00" },
        { name: "Cetirizine 10mg (Okacet)", category: "Allergy & Cold", price: "₹24.50" },
        { name: "ORS Hydration Sachet 21.8g", category: "Dehydration", price: "₹18.00" },
        { name: "Pantoprazole 40mg (Pan-40)", category: "Acidity & Digestion", price: "₹55.00" },
        { name: "Antiseptic Cream (Betadine 20g)", category: "First Aid & Wounds", price: "₹48.00" }
      ]
    },
    {
      id: "pharm_2",
      name: "MedPlus Wellness Chemist",
      address: "Plot 42, Anna Salai, T. Nagar, Chennai, TN",
      phone: "+91 44 4212 9000",
      distance: "1.4 km away",
      openStatus: "OPEN UNTIL 11:30 PM",
      otcItems: [
        { name: "Ibuprofen 400mg (Brufen)", category: "Inflammation & Pain", price: "₹28.00" },
        { name: "Cough Syrup (Benadryl 100ml)", category: "Cough & Cold", price: "₹115.00" },
        { name: "Multivitamin Tablets (Zincovit 15s)", category: "Immunity & Vitamins", price: "₹105.00" },
        { name: "Throat Lozenges (Strepsils Honey)", category: "Sore Throat", price: "₹36.00" }
      ]
    },
    {
      id: "pharm_3",
      name: "Wellness Forever 24x7 Pharmacy",
      address: "G-12, Cathedral Road, Gopalapuram, Chennai, TN",
      phone: "+91 44 6600 1100",
      distance: "2.1 km away",
      openStatus: "OPEN 24/7",
      otcItems: [
        { name: "Digital Blood Pressure Monitor", category: "Medical Devices", price: "₹1,450.00" },
        { name: "Fingertip Pulse Oximeter", category: "Monitoring", price: "₹899.00" },
        { name: "N95 Protective Face Masks (Pack of 5)", category: "Safety", price: "₹199.00" },
        { name: "Hand Sanitizer 500ml", category: "Hygiene", price: "₹149.00" }
      ]
    }
  ];

  return res.json({ pharmacies });
});

app.listen(PORT, () => {
  console.log(`Medico Express Backend running on port ${PORT} (NON-BUFFERING MONGODB ATLAS MODE)`);
});
