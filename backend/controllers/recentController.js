import RecentlyAccessed from '../models/RecentlyAccessed.js';

// @desc    Get recently accessed items from MongoDB
// @route   GET /api/recent
// @access  Public / Private
export const getRecentlyAccessed = async (req, res) => {
  try {
    const { userId } = req.query;
    const query = {};
    if (userId) query.userId = userId;

    const list = await RecentlyAccessed.find(query).sort({ updatedAt: -1 }).limit(10);
    res.json({ success: true, count: list.length, data: list });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add or update a recently accessed item
// @route   POST /api/recent
// @access  Public / Private
export const addRecentlyAccessed = async (req, res) => {
  try {
    const { userId = 'anonymous', itemType = 'identity', itemId, title, subtitle, path, icon = 'file' } = req.body;

    if (!title || !path) {
      return res.status(400).json({ success: false, message: 'Title and path are required' });
    }

    // Upsert recent record
    const record = await RecentlyAccessed.findOneAndUpdate(
      { userId, path },
      {
        userId,
        itemType,
        itemId: itemId || `ID-${Date.now()}`,
        title,
        subtitle: subtitle || '',
        path,
        icon
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(201).json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
