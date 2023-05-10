const express = require('express');
const router = express.Router();
const db = require('../db');

// Route to get all tenants
router.get('/', async (req, res) => {
  try {
    const tenants = await db.any('SELECT * FROM tenants');
    res.render('tenants', { tenants });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal server error');
  }
});

// Route to create a new tenant
router.post('/', async (req, res) => {
  const { name, email, mobile } = req.body;
  try {
    const tenant = await db.one('INSERT INTO tenants (name, email, mobile) VALUES ($1, $2, $3) RETURNING *', [name, email, mobile]);
    res.redirect('/tenants');
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal server error');
  }
});

// Route to update an existing tenant
router.put('/:id', async (req, res) => {
  const { name, email, mobile } = req.body;
  const { id } = req.params;
  try {
    const tenant = await db.one('UPDATE tenants SET name=$1, email=$2, mobile=$3 WHERE id=$4 RETURNING *', [name, email, mobile, id]);
    res.json(tenant);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal server error');
  }
});

// Route to delete a tenant
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.none('DELETE FROM tenants WHERE id=$1', [id]);
    res.send('OK');
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal server error');
  }
});

module.exports = router;
