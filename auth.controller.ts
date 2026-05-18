import { Request, Response } from 'express';
import { User } from '../models/User';
import { signToken } from '../utils/jwt';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../types';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      sendError(res, 409, 'Email already registered');
      return;
    }

    const user = await User.create({ name, email, password, role });
    const token = signToken(user._id.toString(), user.role);

    sendSuccess(res, 201, 'Registration successful', {
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    sendError(res, 500, 'Registration failed', error);
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      sendError(res, 401, 'Invalid email or password');
      return;
    }

    const token = signToken(user._id.toString(), user.role);

    sendSuccess(res, 200, 'Login successful', {
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    sendError(res, 500, 'Login failed', error);
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.userId);
    if (!user) {
      sendError(res, 404, 'User not found');
      return;
    }
    sendSuccess(res, 200, 'User fetched', {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    sendError(res, 500, 'Failed to fetch user', error);
  }
};
