const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const fs = require('fs');
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// Vulnerable database connection string (hardcoded sensitive information)
mongoose.connect('mongodb://admin:password@localhost:27017/vulnerableDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Vulnerable route with NoSQL Injection potential
app.get('/search', (req, res) => {
    const searchTerm = req.query.q;

    // Directly using user input in a database query (No sanitization)
    mongoose.connection.db.collection('items').find({ name: searchTerm }).toArray((err, result) => {
        if (err) return res.status(500).send('Database error');
        res.send(result);
    });
});

// Vulnerable route with Cross-Site Scripting (XSS)
app.get('/greet', (req, res) => {
    const name = req.query.name;
    res.send(`<h1>Hello, ${name}</h1>`); // User input directly included in response
});

// Command Injection Vulnerability
const { exec } = require('child_process');
app.post('/execute', (req, res) => {
    const userCommand = req.body.command;
    exec(userCommand, (err, stdout, stderr) => {
        if (err) {
            res.status(500).send(`Error: ${stderr}`);
            return;
        }
        res.send(`Output: ${stdout}`);
    });
});

// Directory Traversal Vulnerability
app.get('/file', (req, res) => {
    const fileName = req.query.name;
    const filePath = `./uploads/${fileName}`;
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) return res.status(500).send('File not found');
        res.send(data);
    });
});

// Prototype Pollution Vulnerability
app.post('/update', (req, res) => {
    const updates = req.body;
    Object.assign(Object.prototype, updates); // Modifying Object prototype
    res.send('Update applied');
});

// Insecure Deserialization Vulnerability
app.post('/deserialize', (req, res) => {
    const serializedData = req.body.data;
    const deserializedObject = eval(`(${serializedData})`); // Using eval for deserialization
    res.send(`Deserialized: ${JSON.stringify(deserializedObject)}`);
});

// Hardcoded API key vulnerability
const apiKey = '12345-ABCDE'; // Sensitive information exposed in code

// Start the application
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


//test
