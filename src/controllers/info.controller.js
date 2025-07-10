exports.getInfo = async (req, res) => {
  try {

    res.status(201).json(reward);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
