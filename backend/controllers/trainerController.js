const Trainer = require('../models/Trainer');

const getTrainers = async (req, res) => {
  try {
    const { search } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { name:  { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }
    const trainers = await Trainer.find(query).sort({ name: 1 });
    res.json({ success: true, trainers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getTrainer = async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.params.id);
    if (!trainer) return res.status(404).json({ success: false, message: 'Trainer not found.' });
    res.json({ success: true, trainer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createTrainer = async (req, res) => {
  try {
    const trainer = await Trainer.create(req.body);
    res.status(201).json({ success: true, trainer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateTrainer = async (req, res) => {
  try {
    const trainer = await Trainer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!trainer) return res.status(404).json({ success: false, message: 'Trainer not found.' });
    res.json({ success: true, trainer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteTrainer = async (req, res) => {
  try {
    await Trainer.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Trainer deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getTrainers, getTrainer, createTrainer, updateTrainer, deleteTrainer };
