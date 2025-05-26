const db = require('../config/db');

const User = {
  create: (data, callback) => {
    const sql = 'INSERT INTO users SET ?';
    db.query(sql, data, callback);
  },
  findByEmail: (email, callback) => {
    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [email], callback);
  },
  findAll: (callback) => {
    db.query('SELECT * FROM users', callback);
  },
  findById: (id, callback) => {
    db.query('SELECT * FROM users WHERE id = ?', [id], callback);
  },
  update: (id, data, callback) => {
    db.query('UPDATE users SET ? WHERE id = ?', [data, id], callback);
  },
  delete: (id, callback) => {
    db.query('DELETE FROM users WHERE id = ?', [id], callback);
  }
};

module.exports = User;