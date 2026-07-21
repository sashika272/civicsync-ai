const Contact = require('../models/Contact');

const submitContact = async (req, res) => {
  const { name, email, message } = req.body;
  
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  try {
    const newContact = await Contact.create({ name, email, message });
    res.status(201).json({ success: true, data: newContact, message: 'Message sent successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error saving message' });
  }
};

module.exports = { submitContact };
