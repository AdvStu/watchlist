const fastify = require('fastify')();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const uuid = require('uuid');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('database.sqlite3');

const port = process.env.PORT || 3000;
const jwtSecret = process.env.JWT_SECRET || 'secret';

fastify.register(require('fastify-formbody'));

fastify.get('/watchlists', async (req, res) => {
  const watchlists = await getWatchlists();
  res.view('watchlists.hbs', { watchlists });
});

fastify.post('/watchlists', async (req, res) => {
  const name = req.body.name;
  const id = uuid.v4();
  await createWatchlist(id, name);
  res.redirect('/watchlists');
});

fastify.get('/watchlists/:id', async (req, res) => {
  const id = req.params.id;
  const watchlist = await getWatchlistById(id);
  const numberplates = await getNumberplatesByWatchlistId(id);
  res.view('watchlist.hbs', { watchlist, numberplates });
});

fastify.post('/watchlists/:id', async (req, res) => {
  const id = req.params.id;
  const numberplate = req.body.numberplate;
  await createNumberplate(id, numberplate);
  res.redirect(`/watchlists/${id}`);
});

fastify.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await getUserByEmail(email);
  if (!user) {
    return res.status(401).send({ message: 'Invalid credentials' });
  }
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).send({ message: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user.id }, jwtSecret);
  res.send({ token });
});

fastify.register((fastify, opts, done) => {
  fastify.addHook('preHandler', async (req, res) => {
    const token = req.headers['authorization'];
    if (!token) {
      throw new Error('No token provided');
    }
    try {
      const decoded = jwt.verify(token, jwtSecret);
      const user = await getUserById(decoded.id);
      if (!user) {
        throw new Error('User not found');
      }
      req.user = user;
    } catch (err) {
      throw new Error('Invalid token');
    }
  });

  fastify.get('/tokens', async (req, res) => {
    const tokens = await getTokensByUserId(req.user.id);
    res.view('tokens.hbs', { tokens });
  });

  fastify.post('/tokens', async (req, res) => {
    const token = jwt.sign({ id: req.user.id }, jwtSecret);
    await createToken(req.user.id, token);
    res.send({ token });
  });

  fastify.delete('/tokens/:id', async (req, res) => {
    const id = req.params.id;
    await deleteTokenById(id);
    res.send({ message: 'Token deleted' });
  });

  done();
});

async function getUserById(id) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

fastify.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
