const express = require('express');
const app = express();
const path = require('path');

// Menyediakan file statis dari folder 'public' di root
app.use(express.static(path.join(__dirname, '../public')));

// Mengarahkan halaman utama ke index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Ekspor app untuk serverless Vercel
module.exports = app;
