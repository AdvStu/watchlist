const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/anpr', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Define a schema for the watchlist collection
const WatchlistSchema = new mongoose.Schema({
  tenantId: String,
  licensePlate: String
});

// Define a model for the watchlist collection
const WatchlistModel = mongoose.model('Watchlist', WatchlistSchema);

const app = express();

// Parse incoming request bodies in a middleware before your handlers
app.use(bodyParser.json());

// Create a new watchlist for a tenant
app.post('/api/watchlist', async (req, res) => {
  const { tenantId, licensePlate } = req.body;
  const watchlist = new WatchlistModel({ tenantId, licensePlate });
  try {
    await watchlist.save();
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// Retrieve all watchlists for a tenant
app.get('/api/watchlist/:tenantId', async (req, res) => {
  const tenantId = req.params.tenantId;
  try {
    const watchlist = await WatchlistModel.find({ tenantId });
    res.json(watchlist);
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
