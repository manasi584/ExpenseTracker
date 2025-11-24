const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// initialize env and DB
dotenv.config();
require('./db');

const expensesRouter = require('./routes/expenses');
const budgetRouter = require('./routes/budget');
const userRouter = require('./routes/user');

const app = express();
const PORT = process.env.PORT || 4000;

// middlewares
app.use(cors());
app.use(express.json());

// health
app.get('/', (req, res) => res.json({ ok: true, env: process.env.NODE_ENV || 'development' }));

// api
app.use('/api/expenses', expensesRouter);
app.use('/api/budget', budgetRouter);
app.use('/api/user', userRouter);

// fallback
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
