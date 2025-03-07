const Snapshot = require("../models/snapshot.model");

exports.createSnapshot = async (req, res) => {
  try {
    const snapshot = new Snapshot(req.body);
    await snapshot.save();
    res.status(201).json(snapshot);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getSnapshots = async (req, res) => {
  try {
    const snapshots = await Snapshot.find(req.query);
    res.json(snapshots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSnapshotById = async (req, res) => {
  try {
    const snapshot = await Snapshot.findById(req.params.id);
    if (!snapshot) {
      return res.status(404).json({ message: "Snapshot not found" });
    }
    res.json(snapshot);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateSnapshot = async (req, res) => {
  try {
    const snapshot = await Snapshot.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!snapshot) {
      return res.status(404).json({ message: "Snapshot not found" });
    }
    res.json(snapshot);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteSnapshot = async (req, res) => {
  try {
    const snapshot = await Snapshot.findByIdAndDelete(req.params.id);
    if (!snapshot) {
      return res.status(404).json({ message: "Snapshot not found" });
    }
    res.json({ message: "Snapshot deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
