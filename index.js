require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const { exec } = require('child_process');
const connectDB = require('./connect');
const userRoutes = require("./routes/user");
const multer = require('multer');
const { verifyToken } = require('./middleware/auth'); // Add this line
const User = require('./models/User'); // Add this line

const fs = require('fs');
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: ['http://localhost:3000'] })); // Add allowed origins

// Static files and views setup
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Corrected path
app.use(express.static(path.join(__dirname, '../public')));

// Routes 
app.use("/", userRoutes);

// Render Views
app.get('/', (req, res) => res.render('home'));
app.get('/stockMarket', (req, res) => res.render('stockMarket'));
app.get('/BeginnersGuideS', (req, res) => res.render('BeginnersGuideS')); // Ensure this line is correct
app.get('/BeginnersGuideC', (req, res) => res.render('BeginnersGuideC')); // Ensure this line is correct
app.get('/newsS', (req, res) => res.render('newsS')); // Ensure this line is correct
app.get('/livechartsS', (req, res) => res.render('livechartsS')); // Ensure this line is correct
app.get('/dmat', (req, res) => res.render('dmat'));
app.get('/investmenS', (req, res) => res.render('investmenS'));
app.get('/ipo', (req, res) => res.render('ipo'));
app.get('/etf', (req, res) => res.render('etf'));
app.get('/fo', (req, res) => res.render('fo'));
app.get('/disclaimer', (req, res) => res.render('disclaimer'));
app.get('/cinvest', (req, res) => res.render('cinvest'));
app.get('/cdisclaimer', (req, res) => res.render('cdisclaimer'));

app.get('/mbeginner', (req, res) => {
    console.log('Rendering mbeginner view');
    res.render('mbeginner');
});
app.get('/sip', (req, res) => res.render('sip'));
app.get('/lc', (req, res) => res.render('lc'));
app.get('/lcmc', (req, res) => res.render('lcmc'));
app.get('/mc', (req, res) => res.render('mc'));
app.get('/sc', (req, res) => res.render('sc'));
app.get('/minvest', (req, res) => res.render('minvest'));
app.get('/mdisclaimer', (req, res) => res.render('mdisclaimer'));
 // Ensure this line is correct




app.get('/government', (req, res) => res.render('government'));
app.get('/fd_and_rd', (req, res) => res.render('fd_and_rd'));


app.get('/MutualFunds', (req, res) => res.render('mutualFunds'));

app.get('/Cryptocurrency', (req, res) => res.render('cryptocurrency'));
app.get('/GovernmentSchemes', (req, res) => res.render('governmentSchemes'));
app.get('/FixedDeposit', (req, res) => res.render('fixedDeposit'));

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'uploads'));
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

// Upload profile photo route
app.post('/upload-profile-photo', verifyToken, upload.single('profilePhoto'), async (req, res) => {
    try {
        const userId = req.user.id;
        console.log(`User ID: ${userId}`); // Add logging
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const profilePhotoUrl = `/uploads/${req.file.filename}`;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.profilePhoto = profilePhotoUrl;
        await user.save();
        res.status(200).json({ message: 'Profile photo uploaded successfully', profilePhoto: profilePhotoUrl });
    } catch (error) {
        console.error('Error uploading profile photo:', error);
        res.status(500).json({ message: 'Profile photo upload failed' });
    }
});
 
// Trigger Python Voice Bot
app.post('/start-voice-bot', (req, res) => {
    const scriptPath = path.join(__dirname, 'path/to/main.py');
    exec(`python ${scriptPath}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing Python script: ${error.message}`);
             return res.status(500).json({ message: 'Error starting voice bot' });
        } 
        console.log(`Python script stdout: ${stdout}`);
        res.status(200).json({ message: 'Voice bot started', output: stdout });
    }); 
});

// Error Handling
app.use((req, res) => res.status(404).render('404', { message: 'Page Not Found' }));
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
}); 

// Connect to MongoDB and Start Server
connectDB();
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
