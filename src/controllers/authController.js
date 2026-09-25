const prisma = require('../prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateUniqueId = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase().padEnd(6, '0');
};

const generateFreeUniqueId = async () => {
    for (let i = 0; i < 10; i++) {
        const candidate = generateUniqueId();
        const taken = await prisma.users.findUnique({ where: { unique_id: candidate } });
        if (!taken) return candidate;
    }
    throw new Error('Could not generate a unique id');
};

const signToken = (userId) =>
    jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

const register = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const existingUser = await prisma.users.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already in use' });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const uniqueId = await generateFreeUniqueId();

        const user = await prisma.users.create({
            data: { email, password_hash: passwordHash, unique_id: uniqueId },
        });

        res.status(201).json({
            token: signToken(user.id),
            user: { id: user.id, email: user.email, uniqueId: user.unique_id },
        });
    } catch (error) {
        res.status(500).json({ error: 'Registration failed' });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const user = await prisma.users.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        res.json({ token: signToken(user.id), user: { id: user.id, email: user.email, uniqueId: user.unique_id } });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
};

module.exports = { register, login };