require('dotenv').config();
const express = require('express');

const app = express();
app.use(express.json());

const authRoutes = require('./routes/authRoutes');
app.use('/auth', authRoutes);

const listRoutes = require('./routes/listRoutes');
app.use('/lists', listRoutes);

const userRoutes = require('./routes/userRoutes');
app.use('/users', userRoutes);

const todoRoutes = require('./routes/todoRoutes');
app.use('/lists/:listId/todos', todoRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});