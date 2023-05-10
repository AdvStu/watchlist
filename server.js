const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

mongoose.connect(process.env.DB_CONNECT, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Connected to database');
});

const watchlistSchema = new mongoose.Schema({
  tenantId: String,
  licensePlate: String,
  time: { type: Date, default: Date.now }
});

const Watchlist = mongoose.model('Watchlist', watchlistSchema);

app.post('/watchlist', function(req, res) {
  const tenantId = req.body.tenantId;
  const licensePlate = req.body.licensePlate;

  Watchlist.findOneAndUpdate({ tenantId: tenantId, licensePlate: licensePlate },
    { tenantId: tenantId, licensePlate: licensePlate },
    { upsert: true },
    function(err, doc) {
      if (err) {
        return res.send(500, { error: err });
      }

      return res.send('success');
    });
});

app.get('/watchlist', function(req, res) {
  const tenantId = req.query.tenantId;
  const licensePlate = req.query.licensePlate;

  Watchlist.findOne({ tenantId: tenantId, licensePlate: licensePlate }, function(err, watchlist) {
    if (err) {
      return res.send(500, { error: err });
    }

    if (!watchlist) {
      return res.send(false);
    }

    return res.send(true);
  });
});

const port = process.env.PORT || 3000;

app.listen(port, function() {
  console.log(`Server running on port ${port}`);
});
