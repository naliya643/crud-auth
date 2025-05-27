const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const secret = 'rahasia';

exports.register = (req, res) => {
  const { name, email, password } = req.body;
  const hashed = bcrypt.hashSync(password, 10);
  const newUser = { name, email, password: hashed };

  User.create(newUser, (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: 'User registered' });
  });
};

exports.login = (req, res) => {
  const { email, password } = req.body;

  User.findByEmail(email, (err, results) => {
    if (err || results.length === 0) return res.status(400).json({ message: 'User not found' });

    const user = results[0];
    const match = bcrypt.compareSync(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, email: user.email }, secret, { expiresIn: '1d' });
    res.json({ token });
  });
};

exports.getAll = (req, res) => {
  User.findAll((err, users) => {
    if (err) return res.status(500).json(err);
    res.json(users);
  });
};

exports.getOne = (req, res) => {
  User.findById(req.params.id, (err, users) => {
    if (err || users.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(users[0]);
  });
};

exports.update = (req, res) => {
  const id = req.params.id;
  const { name, email } = req.body;
  const photo = req.file ? req.file.filename : null;

  User.findById(id, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0) return res.status(404).json({ message: 'User not found' });

    const oldPhoto = results[0].photo;
    const updateData = { name, email };
    if (photo) {
      updateData.photo = photo;

      // Hapus foto lama jika ada
      const fs = require('fs');
      const path = require('path');
      if (oldPhoto) {
        const filePath = path.join(__dirname, '..', 'public', 'uploads', oldPhoto);
        fs.unlink(filePath, (err) => {
          if (err) console.warn('Gagal hapus foto lama:', err.message);
        });
      }
    }

    User.update(id, updateData, (err, result) => {
      if (err) return res.status(500).json({ error: err });

      const photoUrl = photo
        ? `http://localhost:3000/uploads/${photo}`
        : oldPhoto
        ? `http://localhost:3000/uploads/${oldPhoto}`
        : null;

      res.json({
        message: 'User updated successfully',
        user: {
          id,
          name,
          email,
          photo: photoUrl
        }
      });
    });
  });
};

exports.remove = (req, res) => {
  User.delete(req.params.id, (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: 'User deleted' });
  });
};