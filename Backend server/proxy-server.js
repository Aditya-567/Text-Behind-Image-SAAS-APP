const express = require('express');
const multer = require('multer');
const fetch = require('node-fetch');
const cors = require('cors');
const FormData = require('form-data');

const app = express();
const upload = multer();
app.use(cors());

app.post('/remove-bg', upload.single('image_file'), async (req, res) => {
    const form = new FormData();
    form.append('image_file', req.file.buffer, req.file.originalname);

    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: { 'X-Api-Key': 'YOUR_REMOVE_BG_API_KEY' },
        body: form,
    });

    const buffer = await response.buffer();
    res.set('Content-Type', 'image/png');
    res.send(buffer);
});

app.listen(3000, () => console.log('Proxy server on http://localhost:3000'));
