const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Path to data.json
const DATA_FILE = path.join(__dirname, 'data.json');

// Function to read data from data.json
const loadData = () => {
    try {
        const data = fs.readFileSync(DATA_FILE);
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
};

// Function to write data to data.json
const saveData = (data) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

// GET: Fetch all users
app.get('/users', (req, res) => {
    const users = loadData();
    res.json(users);
});

// POST: Add a new user
app.post('/users', (req, res) => {
    const users = loadData();
    const { name, age } = req.body;

    if (!name || !age) {
        return res.status(400).json({ error: "Name and age are required" });
    }

    const newUser = { id: users.length + 1, name, age };
    users.push(newUser);
    saveData(users);

    res.status(201).json({ message: "User added successfully", user: newUser });
});

// PUT: Update a user by ID
app.put('/users/:id', (req, res) => {
    let users = loadData();
    const { id } = req.params;
    const { name, age } = req.body;

    const userIndex = users.findIndex(user => user.id === parseInt(id));
    if (userIndex === -1) {
        return res.status(404).json({ error: "User not found" });
    }

    users[userIndex] = { id: parseInt(id), name, age };
    saveData(users);

    res.json({ message: "User updated successfully", user: users[userIndex] });
});

// DELETE: Remove a user by ID
app.delete('/users/:id', (req, res) => {
    let users = loadData();
    const { id } = req.params;

    const filteredUsers = users.filter(user => user.id !== parseInt(id));

    if (filteredUsers.length === users.length) {
        return res.status(404).json({ error: "User not found" });
    }

    saveData(filteredUsers);
    res.json({ message: "User deleted successfully" });
});

// Serve static files
app.use(express.static(path.join(__dirname, 'static')));

// Serve the index.html file for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});