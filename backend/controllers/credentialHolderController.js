import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Credential from '../models/Credential.js';
import DigitalID from '../models/DigitalID.js';
import Notification from '../models/Notification.js';

// @desc    Create a new credential holder (Student, Employee, Staff, Member, Participant)
// @route   POST /api/users/holders
// @access  Private (Organization Admin)
export const createHolder = async (req, res) => {
  try {
    const {
      name,
      email,
      phone = '',
      holderType = 'STUDENT',
      department = 'General',
      designation = 'Candidate',
      password
    } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Holder full name and email are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(400).json({ success: false, message: 'A user with this email already exists.' });
    }

    const defaultPassword = password || 'HolderPass2026!';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(defaultPassword, salt);

    const validHolderTypes = ['STUDENT', 'EMPLOYEE', 'STAFF', 'MEMBER', 'PARTICIPANT'];
    const assignedHolderType = validHolderTypes.includes(holderType?.toUpperCase()) ? holderType.toUpperCase() : 'STUDENT';

    const newHolder = await User.create({
      userId: `HLD-${Date.now().toString().slice(-6)}`,
      organizationId: req.user?.organizationId || null,
      name,
      email: cleanEmail,
      passwordHash,
      role: 'CREDENTIAL_HOLDER',
      holderType: assignedHolderType,
      phone,
      department,
      designation,
      status: 'ACTIVE'
    });

    res.status(201).json({
      success: true,
      message: `${assignedHolderType} credential holder created successfully`,
      data: newHolder
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all credential holders with search & type filter
// @route   GET /api/users/holders
// @access  Private (Organization Admin)
export const getHolders = async (req, res) => {
  try {
    const { search = '', type = '', status = '' } = req.query;
    const query = {
      role: { $in: ['CREDENTIAL_HOLDER', 'USER', 'STUDENT', 'EMPLOYEE'] }
    };

    if (type) {
      query.holderType = type.toUpperCase();
    }

    if (status) {
      query.status = status.toUpperCase();
    }

    if (search) {
      const reg = new RegExp(search, 'i');
      query.$or = [{ name: reg }, { email: reg }, { phone: reg }, { department: reg }, { designation: reg }];
    }

    const holders = await User.find(query).sort({ createdAt: -1 });

    // Attach active credential counts
    const holderIds = holders.map((h) => h._id);
    const credentials = await Credential.find({ holderId: { $in: holderIds } });

    const enriched = holders.map((h) => {
      const hObj = h.toJSON();
      hObj.credentialsCount = credentials.filter((c) => c.holderId?.toString() === h._id.toString()).length;
      return hObj;
    });

    res.json({
      success: true,
      count: enriched.length,
      data: enriched
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single credential holder profile & their credentials
// @route   GET /api/users/holders/:id
// @access  Private (Admin / Holder himself)
export const getHolderById = async (req, res) => {
  try {
    const searchId = req.params.id;
    let holder = null;

    if (searchId.match(/^[0-9a-fA-F]{24}$/)) {
      holder = await User.findById(searchId);
    }
    if (!holder) {
      holder = await User.findOne({
        $or: [{ userId: searchId }, { email: searchId.toLowerCase() }]
      });
    }

    if (!holder) {
      return res.status(404).json({ success: false, message: 'Credential holder not found.' });
    }

    // Fetch credentials belonging to this holder
    const credentials = await Credential.find({
      $or: [{ holderId: holder._id }, { 'metadata.holderEmail': holder.email }]
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        ...holder.toJSON(),
        credentials
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update credential holder
// @route   PUT /api/users/holders/:id
// @access  Private (Admin)
export const updateHolder = async (req, res) => {
  try {
    const { name, phone, department, designation, holderType, status } = req.body;
    const searchId = req.params.id;

    let holder = null;
    if (searchId.match(/^[0-9a-fA-F]{24}$/)) {
      holder = await User.findById(searchId);
    }
    if (!holder) {
      holder = await User.findOne({ $or: [{ userId: searchId }, { email: searchId.toLowerCase() }] });
    }

    if (!holder) {
      return res.status(404).json({ success: false, message: 'Credential holder not found.' });
    }

    if (name) holder.name = name;
    if (phone !== undefined) holder.phone = phone;
    if (department) holder.department = department;
    if (designation) holder.designation = designation;
    if (holderType) holder.holderType = holderType.toUpperCase();
    if (status) holder.status = status.toUpperCase();

    await holder.save();

    res.json({
      success: true,
      message: 'Credential holder updated successfully',
      data: holder
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete or deactivate credential holder
// @route   DELETE /api/users/holders/:id
// @access  Private (Admin)
export const deleteHolder = async (req, res) => {
  try {
    const searchId = req.params.id;
    let holder = null;
    if (searchId.match(/^[0-9a-fA-F]{24}$/)) {
      holder = await User.findById(searchId);
    }
    if (!holder) {
      holder = await User.findOne({ $or: [{ userId: searchId }, { email: searchId.toLowerCase() }] });
    }

    if (!holder) {
      return res.status(404).json({ success: false, message: 'Credential holder not found.' });
    }

    await User.findByIdAndDelete(holder._id);
    res.json({ success: true, message: 'Credential holder removed from database.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
