const Reward = require("../models/reward.model");

exports.createReward = async (req, res) => {
  try {
    const reward = new Reward(req.body);
    await reward.save();
    res.status(201).json(reward);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getRewards = async (req, res) => {
  try {
    const rewards = await Reward.find(req.query);
    res.json(rewards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRewardById = async (req, res) => {
  try {
    const reward = await Reward.findById(req.params.id);
    if (!reward) {
      return res.status(404).json({ message: "Reward not found" });
    }
    res.json(reward);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateReward = async (req, res) => {
  try {
    const reward = await Reward.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!reward) {
      return res.status(404).json({ message: "Reward not found" });
    }
    res.json(reward);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteReward = async (req, res) => {
  try {
    const reward = await Reward.findByIdAndDelete(req.params.id);
    if (!reward) {
      return res.status(404).json({ message: "Reward not found" });
    }
    res.json({ message: "Reward deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
