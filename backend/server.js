require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const { Readable } = require('stream');

const app = express();
const PORT = process.env.PORT;

// Security Middlewares
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
}));

// Rate limiting to prevent API spam
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window`
    message: "Too many requests from this IP, please try again after 15 minutes.",
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', apiLimiter);

// Multer config: memory storage, 10MB limit, file type filtering
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = ['text/csv', 'application/json', 'text/plain', 'application/pdf'];
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only CSV, JSON, TXT, and PDF are allowed.'));
        }
    }
});

// Upload route to handle file and send to Pinata
app.post('/api/upload', upload.single('dataset'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Convert buffer to stream for form-data
        const stream = Readable.from(req.file.buffer);
        const data = new FormData();
        data.append('file', stream, {
            filepath: req.file.originalname,
            contentType: req.file.mimetype,
        });

        const metadata = JSON.stringify({
            name: req.file.originalname,
        });
        data.append('pinataMetadata', metadata);

        // Upload to Pinata
        const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', data, {
            maxBodyLength: Infinity,
            headers: {
                'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
                'pinata_api_key': process.env.PINATA_API_KEY,
                'pinata_secret_api_key': process.env.PINATA_SECRET_API_KEY,
            }
        });

        res.status(200).json({
            success: true,
            ipfsHash: response.data.IpfsHash,
        });
    } catch (error) {
        next(error);
    }
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err);
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: err.message });
    } else if (err.message) {
        return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
    console.log(`Backend server running securely on port ${PORT}`);
});
