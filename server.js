// server.js

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// Database setup
const db = new sqlite3.Database("./database.sqlite", (err) => {
    if (err) return console.error(err.message);
    console.log("Connected to the SQLite database.");
});

db.run(`CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    amount REAL,
    type TEXT,
    purpose TEXT,
    payment_method TEXT,
    date TEXT
)`);

// Endpoint to add a transaction
app.post("/api/transaction", (req, res) => {
    const { amount, type, purpose, payment_method } = req.body;
    const date = new Date().toISOString();
    db.run(`INSERT INTO transactions (amount, type, purpose, payment_method, date)
            VALUES (?, ?, ?, ?, ?)`,
        [amount, type, purpose, payment_method, date],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID });
        });
});

// Endpoint to retrieve all transactions
app.get("/api/transactions", (req, res) => {
    db.all("SELECT * FROM transactions", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// ** New Delete Endpoint **
// Endpoint to delete a transaction by ID
app.delete("/api/transaction/:id", (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM transactions WHERE id = ?`, id, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Transaction deleted successfully" });
    });
});

// Start server
app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});