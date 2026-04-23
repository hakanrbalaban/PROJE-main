const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await db.execute(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );
    res.status(201).json({ message: "Kayıt başarılı!" });
  } catch (err) {
    res.status(500).json({ error: "E-posta veya kullanıcı adı zaten kullanımda." });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(404).json({ error: "Kullanıcı bulunamadı!" });

    const validPass = await bcrypt.compare(password, rows[0].password);
    if (!validPass) return res.status(400).json({ error: "Hatalı şifre!" });

    const token = jwt.sign({ id: rows[0].id }, process.env.JWT_SECRET || 'gizli_anahtar', { expiresIn: '1d' });

    res.cookie("token", token, { httpOnly: true }).status(200).json({
      id: rows[0].id,
      username: rows[0].username
    });
  } catch (err) {
    res.status(500).json({ error: "Giriş yapılamadı." });
  }
};