/**
 * =================================================================
 * SERVER for Image Storage Application (with User Roles & Auth)
 * =================================================================
 * This file sets up a Node.js server using the Express framework.
 * It uses Firebase Admin SDK to authenticate users and manages data
 * visibility based on roles (user, admin, superadmin).
 *
 * To Run:
 * 1. Make sure you have a .env file with MONGO_URI and GOOGLE_APPLICATION_CREDENTIALS.
 * 2. Run `node server.js` in your terminal.
 * =================================================================
 */

// === 0. LOAD ENVIRONMENT VARIABLES ===
require('dotenv').config();

// === 1. IMPORT NECESSARY PACKAGES ===
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const admin = require('firebase-admin'); // Import Firebase Admin SDK

// === 2. INITIALIZE FIREBASE ADMIN SDK ===
// This requires a service account key JSON file from your Firebase project.
// Set the GOOGLE_APPLICATION_CREDENTIALS environment variable to the path of this file.
try {
    admin.initializeApp({
        credential: admin.credential.applicationDefault()
    });
    console.log('Firebase Admin SDK initialized successfully.');
} catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error);
    process.exit(1);
}

// === 3. INITIALIZE APP & DEFINE CONSTANTS ===
const app = express();
const PORT = process.env.PORT || 3000;

// === 4. SETUP MIDDLEWARE ===
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// === 5. MONGODB DATABASE CONNECTION ===
const dbURI = process.env.MONGO_URI;
if (!dbURI) {
    console.error('FATAL ERROR: MONGO_URI is not defined in the .env file.');
    process.exit(1);
}

mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Connected Successfully.'))
    .catch(err => {
        console.error('Failed to connect to MongoDB:', err);
        process.exit(1);
    });

// === 6. DEFINE MONGODB SCHEMAS & MODELS ===

// User Schema to store roles
const UserSchema = new mongoose.Schema({
    uid: { type: String, required: true, unique: true }, // Firebase UID
    email: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin', 'superadmin'], default: 'user' },
    createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', UserSchema);

// Image Schema, now with a reference to the user
const ImageSchema = new mongoose.Schema({
    originalName: { type: String, required: true },
    filename: { type: String, required: true },
    path: { type: String, required: true },
    description: String,
    userId: { type: String, required: true }, // Links image to a user UID
    uploadDate: { type: Date, default: Date.now }
});
const Image = mongoose.model('Image', ImageSchema);

// === 7. AUTHENTICATION MIDDLEWARE ===
const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized: No token provided.' });
    }

    const idToken = authHeader.split('Bearer ')[1];
    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        let user = await User.findOne({ uid: decodedToken.uid });

        // If user doesn't exist in our DB, create them
        if (!user) {
            user = new User({
                uid: decodedToken.uid,
                email: decodedToken.email
            });
            await user.save();
        }

        req.user = user; // Attach user profile (with role) to the request object
        next();
    } catch (error) {
        console.error('Error verifying auth token:', error);
        return res.status(403).json({ message: 'Forbidden: Invalid token.' });
    }
};


// === 8. CONFIGURE MULTER FOR FILE UPLOADS ===
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
    console.log(`Created directory: ${uploadsDir}`);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage: storage });


// === 9. DEFINE API ROUTES (NOW PROTECTED) ===

// All image routes are now protected by the authMiddleware
app.post('/api/images/upload', authMiddleware, upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file was uploaded.' });
    }

    const newImage = new Image({
        originalName: req.file.originalname,
        filename: req.file.filename,
        path: req.file.path.replace(/\\/g, "/"),
        description: req.body.description || '',
        userId: req.user.uid // Associate the image with the authenticated user
    });

    try {
        const savedImage = await newImage.save();
        res.status(201).json(savedImage);
    } catch (error) {
        console.error('Error saving image to database:', error);
        res.status(500).json({ message: 'Error saving image to database.', error });
    }
});

app.get('/api/images', authMiddleware, async (req, res) => {
    try {
        let query = {};
        // If the user is a regular user, only show their own images
        if (req.user.role === 'user') {
            query = { userId: req.user.uid };
        }
        // Admins and Superadmins can see all images (empty query)

        const images = await Image.find(query).sort({ uploadDate: -1 });
        res.status(200).json(images);
    } catch (error) {
        console.error('Error fetching images:', error);
        res.status(500).json({ message: 'Error fetching images.', error });
    }
});

app.get('/api/images/search', authMiddleware, async (req, res) => {
    const { q: query } = req.query;
    if (!query) {
        return res.status(400).json({ message: 'Search query parameter "q" is required.' });
    }

    try {
        // Base search criteria
        const searchCriteria = {
            $or: [
                { originalName: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ]
        };

        let finalQuery = searchCriteria;
        // If the user is a regular user, add their ID to the search query
        if (req.user.role === 'user') {
            finalQuery = {
                $and: [
                    { userId: req.user.uid },
                    searchCriteria
                ]
            };
        }

        const images = await Image.find(finalQuery).sort({ uploadDate: -1 });
        res.status(200).json(images);
    } catch (error) {
        console.error('Error searching images:', error);
        res.status(500).json({ message: 'Error searching images.', error });
    }
});

// === 10. START THE SERVER ===
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

