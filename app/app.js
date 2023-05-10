const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const app = express();

app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files from the public folder

// Set up the database
const db = new sqlite3.Database(':memory:', (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Connected to the in-memory SQLite database.');
});

// Create the customers table
db.run('CREATE TABLE customers (id INTEGER PRIMARY KEY, company_name TEXT NOT NULL, email TEXT NOT NULL, mobile_number TEXT NOT NULL)', (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Created customers table.');
});

// API endpoints
app.get('/api/customers', (req, res) => {
  db.all('SELECT * FROM customers', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

app.post('/api/customers', (req, res) => {
  const { company_name, email, mobile_number } = req.body;
  db.run('INSERT INTO customers (company_name, email, mobile_number) VALUES (?, ?, ?)', [company_name, email, mobile_number], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ id: this.lastID });
  });
});

app.put('/api/customers/:id', (req, res) => {
  const customerId = req.params.id;
  const { company_name, email, mobile_number } = req.body;
  db.run('UPDATE customers SET company_name = ?, email = ?, mobile_number = ? WHERE id = ?', [company_name, email, mobile_number, customerId], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ changes: this.changes });
  });
});

app.delete('/api/customers/:id', (req, res) => {
  const customerId = req.params.id;
  db.run('DELETE FROM customers WHERE id = ?', [customerId], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ changes: this.changes });
  });
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Example app listening on port 3000!');
});
