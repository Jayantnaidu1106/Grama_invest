const express = require('express');
const jwt = require('jsonwebtoken');
const { uploadProfilePhoto } = require('../controllers/user');
const { verifyToken } = require('../middleware/auth');
const User = require('../models/user'); // Corrected path for User model
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads'));
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

const router = express.Router();

// Sign-up route
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const user = new User({ name, email, password });
        await user.save();
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error('Error during sign-up:', error);
        res.status(500).json({ message: 'Sign-up failed' });
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (user && user.password === password) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.status(200).json({ message: 'Login successful', user: { ...user.toObject(), token } });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Login failed' });
    }
});

router.post('/upload-profile-photo', verifyToken, upload.single('profilePhoto'), async (req, res) => {
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

router.get('/', (req, res) => {
  res.render('home');
});

module.exports = router;
