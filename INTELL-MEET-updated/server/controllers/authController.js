import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'dev_secret_key', {
    expiresIn: '30d',
  });
};

export const registerUser = async (req, res) => {
  try {
    console.log('📥 Body received:', req.body); // ← yeh add karo
    const { name, email, password } = req.body;
    console.log('👤 Name:', name, 'Email:', email); // ← yeh bhi

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ name, email, password });

    if (user) {
      return res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      return res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('🔴 Signup Error:', error); // ← full error print
    return res.status(500).json({ message: error.message });
  }
};

// export const registerUser = async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     const userExists = await User.findOne({ email });
//     if (userExists) {
//       return res.status(400).json({ message: 'User already exists' });
//     }

//     const user = await User.create({ name, email, password });

//     if (user) {
//       return res.status(201).json({
//         _id: user._id,
//         name: user.name,
//         email: user.email,
//         token: generateToken(user._id),
//       });
//     } else {
//       return res.status(400).json({ message: 'Invalid user data' });
//     }
//   } catch (error) {
//     return res.status(500).json({ message: error.message });
//   }
// };

export const authUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    console.log('🔍 Found user:', user ? 'Yes' : 'No');
    console.log('🔑 Password match:', await user.matchPassword(password));

    if (user && (await user.matchPassword(password))) {
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};