import express from 'express';
import { registerUser, authUser } from '../controllers/authController.js';

const router = express.Router();

router.post('/signup', registerUser);
router.post('/login', authUser);

// Future implementation
router.post('/logout', (req, res) => res.json({ message: 'Logout not implemented yet' }));
router.post('/refresh', (req, res) => res.json({ message: 'Refresh not implemented yet' }));

export default router;
