const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
const port = 4000;

// Enable CORS
app.use(cors());

// Set up storage for uploaded files
const storage = multer.diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// Create an uploads folder if it doesn't exist
if (!fs.existsSync('./uploads')) {
    fs.mkdirSync('./uploads');
}

// Route to handle audio upload
app.post('/uploads', upload.single('audio'), (req, res) => {
    if (!req.file) {
        return res.status(400).send({ message: 'No file uploaded' });
    }

    // Construct the file URL
    const fileUrl = `/uploads/${req.file.filename}`;

    res.status(200).send({
        message: 'File uploaded successfully',
        filename: req.file.filename,
        fileUrl: fileUrl,  // Send the file URL back to the client
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
