import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { emitNotificationEvent } from '../services/socketService.js';

// @desc    Get all users with search and role filter from MongoDB
// @route   GET /api/users
// @access  Admin Only / Private
export const getUsers = async (req, res) => {
  try {
    const { role, status, search } = req.query;
    const query = {};

    if (role) {
      query.role = role.toUpperCase();
    }

    if (status) {
      query.status = status.toUpperCase();
    }

    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [
        { name: regex },
        { email: regex },
        { department: regex },
        { organization: regex },
        { phone: regex }
      ];
    }

    const list = await User.find(query).select('-passwordHash').sort({ createdAt: -1 });

    res.json({
      success: true,
      count: list.length,
      data: list
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const findUserFlexible = async (idParam) => {
  if (!idParam) return null;
  const cleanId = String(idParam).trim();
  if (cleanId.match(/^[0-9a-fA-F]{24}$/)) {
    const u = await User.findById(cleanId);
    if (u) return u;
  }
  return await User.findOne({
    $or: [{ userId: cleanId }, { email: cleanId.toLowerCase() }]
  });
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
export const getUserById = async (req, res) => {
  try {
    const user = await findUserFlexible(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const safeUser = user.toJSON ? user.toJSON() : user;
    delete safeUser.passwordHash;
    res.json({ success: true, data: safeUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get currently logged in user profile
// @route   GET /api/users/profile
// @access  Private (Authenticated)
export const getUserProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    const user = await User.findById(req.user._id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update currently logged in user profile
// @route   PUT /api/users/profile
// @access  Private (Authenticated)
export const updateUserProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const {
      name,
      phone,
      phoneNumber,
      dob,
      dateOfBirth,
      gender,
      address,
      city,
      state,
      country,
      department,
      organization,
      avatar,
      profilePhoto
    } = req.body;

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (phoneNumber !== undefined) user.phone = phoneNumber.trim();
    if (dob) user.dob = dob;
    if (dateOfBirth) user.dob = dateOfBirth;
    if (gender) user.gender = gender;
    if (address !== undefined) user.address = address;
    if (city !== undefined) user.city = city;
    if (state !== undefined) user.state = state;
    if (country !== undefined) user.country = country;
    if (department) user.department = department;
    if (organization) user.organization = organization;
    if (req.body.userType) {
      user.userType = req.body.userType;
      user.holderType = req.body.userType.toUpperCase();
    }
    if (avatar) user.avatar = avatar;
    if (profilePhoto) {
      user.profilePhoto = profilePhoto;
      if (!user.avatar) user.avatar = profilePhoto;
    }
    if (req.body.profileImage) {
      user.profileImage = req.body.profileImage;
      user.profilePhoto = req.body.profileImage;
      if (!user.avatar) user.avatar = req.body.profileImage;
    }

    await user.save();

    const notif = await Notification.create({
      userId: user._id,
      title: 'Profile Updated',
      message: 'Your personal profile information has been updated successfully.',
      type: 'GENERAL'
    });
    emitNotificationEvent(notif);

    const safeUser = user.toJSON ? user.toJSON() : user;
    delete safeUser.passwordHash;

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: safeUser
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Change user password from authenticated session
// @route   PUT /api/users/change-password
// @access  Private (Authenticated)
export const changeUserPassword = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword) {
      return res.status(400).json({ success: false, message: 'Current password is required.' });
    }

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long.' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password does not match.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    const notif = await Notification.create({
      userId: user._id,
      title: 'Password Changed',
      message: 'Your account password was updated successfully from security settings.',
      type: 'SECURITY'
    });
    emitNotificationEvent(notif);

    res.json({
      success: true,
      message: 'Password changed successfully.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user profile by ID
// @route   PUT /api/users/:id
// @access  Private
export const updateUser = async (req, res) => {
  try {
    const user = await findUserFlexible(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const {
      name,
      department,
      organization,
      phone,
      status,
      role,
      dob,
      gender,
      address,
      city,
      state,
      country,
      avatar,
      profilePhoto
    } = req.body;

    if (name) user.name = name;
    if (department) user.department = department;
    if (organization) user.organization = organization;
    if (phone !== undefined) user.phone = phone;
    if (dob) user.dob = dob;
    if (gender) user.gender = gender;
    if (address !== undefined) user.address = address;
    if (city !== undefined) user.city = city;
    if (state !== undefined) user.state = state;
    if (country !== undefined) user.country = country;
    if (avatar) user.avatar = avatar;
    if (profilePhoto) user.profilePhoto = profilePhoto;
    if (status) user.status = status.toUpperCase();
    if (role && (req.user?.role === 'ADMIN' || req.user?.role === 'ORGANIZATION_ADMIN')) {
      user.role = role.toUpperCase();
    }

    await user.save();

    const safeUser = user.toJSON ? user.toJSON() : user;
    delete safeUser.passwordHash;

    res.json({
      success: true,
      message: 'User updated successfully',
      data: safeUser
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user role
// @route   PUT /api/users/:id/role
// @access  Admin Only
export const updateUserRole = async (req, res) => {
  try {
    const user = await findUserFlexible(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { role } = req.body;
    if (role) {
      user.role = role.toUpperCase();
      await user.save();
    }

    res.json({ success: true, message: `User role updated to ${user.role}`, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user status
// @route   PUT /api/users/:id/status
// @access  Admin Only
export const updateUserStatus = async (req, res) => {
  try {
    const user = await findUserFlexible(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { status } = req.body;
    if (status) {
      user.status = status.toUpperCase();
      await user.save();
    }

    res.json({ success: true, message: `User status updated to ${user.status}`, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Admin Only
export const deleteUser = async (req, res) => {
  try {
    const user = await findUserFlexible(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await User.findByIdAndDelete(user._id);

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

