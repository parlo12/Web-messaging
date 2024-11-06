const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000; // Use any available port

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Default route for handling all other requests
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Client app is running at http://localhost:${PORT}`);
});