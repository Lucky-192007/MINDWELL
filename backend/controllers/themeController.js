const Theme = require('../models/Theme');
const User = require('../models/User');

const createTheme = async (req, res) => {
  try {
    const { name, description, colors, isPublic } = req.body;
    if (!name || !colors) return res.status(400).json({ message: 'Theme name and colors required' });

    const theme = new Theme({
      name,
      description,
      colors,
      creator: req.user._id,
      isPublic: isPublic || false,
    });
    await theme.save();
    
    const user = await User.findById(req.user._id);
    user.customThemes.push(theme._id);
    await user.save();

    res.status(201).json(theme);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getThemes = async (req, res) => {
  try {
    const publicThemes = await Theme.find({ isPublic: true }).populate('creator', 'name avatar');
    const userThemes = await Theme.find({ creator: req.user._id }).populate('creator', 'name avatar');
    res.json({ public: publicThemes, personal: userThemes });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const applyTheme = async (req, res) => {
  try {
    const { themeId } = req.body;
    const theme = await Theme.findById(themeId);
    if (!theme) return res.status(404).json({ message: 'Theme not found' });

    const user = await User.findByIdAndUpdate(req.user._id, { currentTheme: themeId }, { new: true });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const deleteTheme = async (req, res) => {
  try {
    const { themeId } = req.params;
    const theme = await Theme.findById(themeId);
    if (theme.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await Theme.findByIdAndDelete(themeId);
    res.json({ message: 'Theme deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const toggleLikeTheme = async (req, res) => {
  try {
    const { themeId } = req.params;
    const theme = await Theme.findById(themeId);
    if (!theme) return res.status(404).json({ message: 'Theme not found' });

    const hasLiked = theme.likes.includes(req.user._id);
    if (hasLiked) {
      theme.likes = theme.likes.filter((id) => !id.equals(req.user._id));
    } else {
      theme.likes.push(req.user._id);
    }
    await theme.save();
    res.json({ likes: theme.likes.length });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { createTheme, getThemes, applyTheme, deleteTheme, toggleLikeTheme };