require('dotenv').config();
const express = require('express');

const app = express();
app.use(express.json());

const authRoutes = require('./routes/authRoutes');
app.use('/auth', authRoutes);

const listRoutes = require('./routes/listRoutes');
app.use('/lists', listRoutes);

const todoRoutes = require('./routes/todoRoutes');
app.use('/lists/:listId/todos', todoRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});