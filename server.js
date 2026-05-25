const express = require('express');
const app = express();
const path = require('path');

// Menyediakan file statis dari folder 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Mengarahkan halaman utama ke index.html di dalam folder public
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Port otomatis untuk Vercel atau port lokal 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
});
