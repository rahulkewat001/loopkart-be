const SavedSearch = require('../models/SavedSearch');

// Get user's saved searches
exports.getSavedSearches = async (req, res) => {
  try {
    const searches = await SavedSearch.find({ user: req.user._id }).sort('-createdAt');
    res.json(searches);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create new saved search
exports.createSavedSearch = async (req, res) => {
  try {
    const { name, filters, alertEnabled } = req.body;
    
    const search = await SavedSearch.create({
      user: req.user._id,
      name,
      filters,
      alertEnabled: alertEnabled !== undefined ? alertEnabled : true,
    });

    res.status(201).json(search);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update saved search
exports.updateSavedSearch = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const search = await SavedSearch.findOne({ _id: id, user: req.user._id });
    if (!search) {
      return res.status(404).json({ message: 'Saved search not found' });
    }

    Object.assign(search, updates);
    await search.save();

    res.json(search);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete saved search
exports.deleteSavedSearch = async (req, res) => {
  try {
    const { id } = req.params;

    const search = await SavedSearch.findOneAndDelete({ _id: id, user: req.user._id });
    if (!search) {
      return res.status(404).json({ message: 'Saved search not found' });
    }

    res.json({ message: 'Saved search deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Check for new matches (called by cron job or on-demand)
exports.checkMatches = async (req, res) => {
  try {
    const Product = require('../models/Product');
    const searches = await SavedSearch.find({ alertEnabled: true });

    for (const search of searches) {
      const query = {};
      
      if (search.filters.query) {
        query.$or = [
          { name: { $regex: search.filters.query, $options: 'i' } },
          { description: { $regex: search.filters.query, $options: 'i' } },
        ];
      }
      if (search.filters.category) query.category = search.filters.category;
      if (search.filters.minPrice) query.price = { ...query.price, $gte: search.filters.minPrice };
      if (search.filters.maxPrice) query.price = { ...query.price, $lte: search.filters.maxPrice };
      if (search.filters.condition) query.condition = search.filters.condition;
      if (search.filters.location) query['location.city'] = { $regex: search.filters.location, $options: 'i' };

      // Only get products created after last notification
      if (search.lastNotified) {
        query.createdAt = { $gt: search.lastNotified };
      }

      const matches = await Product.countDocuments(query);
      
      if (matches > 0) {
        search.matchCount = matches;
        search.lastNotified = new Date();
        await search.save();
      }
    }

    res.json({ message: 'Matches checked successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
