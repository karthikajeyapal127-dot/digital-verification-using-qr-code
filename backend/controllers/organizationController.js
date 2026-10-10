import Organization from '../models/Organization.js';
import User from '../models/User.js';

// @desc    Get current organization profile
// @route   GET /api/organizations/me
// @access  Private (Organization Admin)
export const getOrganizationMe = async (req, res) => {
  try {
    let org = null;
    if (req.user?.organizationId) {
      org = await Organization.findById(req.user.organizationId);
    }

    if (!org) {
      // Find the first organization or create default for this admin
      org = await Organization.findOne();
    }

    if (!org) {
      org = await Organization.create({
        organizationId: `ORG-${Date.now().toString().slice(-6)}`,
        organizationName: req.user?.organizationName || 'Apex Institute of Science & Technology',
        organizationType: 'University',
        email: req.user?.email || 'admin@apex.edu',
        phone: req.user?.phone || '+91 98765 43210',
        address: '100 University Avenue, Tech Innovation Hub',
        website: 'https://apex.edu',
        status: 'ACTIVE'
      });
      if (req.user) {
        req.user.organizationId = org._id;
        await req.user.save();
      }
    }

    res.json({
      success: true,
      data: org
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update organization profile
// @route   PUT /api/organizations/me
// @access  Private (Organization Admin)
export const updateOrganizationMe = async (req, res) => {
  try {
    const { organizationName, organizationType, email, phone, address, website, logo } = req.body;

    let org = null;
    if (req.user?.organizationId) {
      org = await Organization.findById(req.user.organizationId);
    }
    if (!org) {
      org = await Organization.findOne();
    }

    if (!org) {
      org = new Organization({
        organizationId: `ORG-${Date.now().toString().slice(-6)}`,
        email: email || req.user?.email
      });
    }

    if (organizationName) org.organizationName = organizationName;
    if (organizationType) org.organizationType = organizationType;
    if (email) org.email = email;
    if (phone) org.phone = phone;
    if (address) org.address = address;
    if (website) org.website = website;
    if (logo) org.logo = logo;

    await org.save();

    res.json({
      success: true,
      message: 'Organization profile updated successfully',
      data: org
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
