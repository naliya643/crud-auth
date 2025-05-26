const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const User = require('../models/userModel');

const secret = 'rahasia';

exports.register = (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }

  const hashed = bcrypt.hashSync(password, 10);
  const newUser = { name, email, password: hashed };

  User.create(newUser, (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: 'User registered' });
  });
};

exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  User.findByEmail(email, (err, results) => {
    if (err || results.length === 0) {
      return res.status(400).json({ message: 'User not found' });
    }

    const user = results[0];
    const match = bcrypt.compareSync(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

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
  const id = req.params.id;

  User.findById(id, (err, users) => {
    if (err || users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
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
    const updateData = {};

    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (photo) updateData.photo = photo;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No data provided to update' });
    }

    // Hapus foto lama kalau ada foto baru
    if (photo && oldPhoto) {
      const filePath = path.join(__dirname, '..', 'public', 'uploads', oldPhoto);
      fs.unlink(filePath, (err) => {
        if (err) console.warn('Gagal hapus foto lama:', err.message);
      });
    }

    User.update(id, updateData, (err) => {
      if (err) return res.status(500).json({ error: err });

      const photoUrl = updateData.photo
        ? `http://localhost:3000/uploads/${updateData.photo}`
        : oldPhoto
        ? `http://localhost:3000/uploads/${oldPhoto}`
        : null;

      res.json({
        message: 'User updated successfully',
        user: {
          id,
          name: updateData.name || results[0].name,
          email: updateData.email || results[0].email,
          photo: photoUrl
        }
      });
    });
  });
};

exports.remove = (req, res) => {
  const id = req.params.id;

  User.findById(id, (err, results) => {
    if (err) return res.status(500).json(err);
    if (results.length === 0) return res.status(404).json({ message: 'User not found' });

    const photo = results[0].photo;
    if (photo) {
      const filePath = path.join(__dirname, '..', 'public', 'uploads', photo);
      fs.unlink(filePath, (err) => {
        if (err) console.warn('Gagal hapus foto:', err.message);
      });
    }

    User.delete(id, (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: 'User deleted' });
    });
  });
};
