const validator = require('validator');
const Url = require('../models/Url');
const Visit = require('../models/Visit');
const QRCode = require('qrcode');
const parseDevice = require('../utils/parseDevice');
const generateShortCode = require('../utils/generateShortCode');

// POST /api/url/create
exports.createShortUrl = async (req, res) => {
  try {
    console.log('[createShortUrl] req.user=', req.user, 'body=', req.body);
    const { originalUrl, customAlias, expiryDate } = req.body;
    // fallback: extract userId from token if middleware didn't attach it
    let userId = req.user && req.user.id;
    if (!userId) {
      try {
        const authHeader = req.headers.authorization || '';
        if (authHeader.startsWith('Bearer ')) {
          const token = authHeader.split(' ')[1];
          const jwt = require('jsonwebtoken');
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
          userId = decoded.id;
        }
      } catch (e) {
        console.error('[createShortUrl] token parse failed', e && e.message);
      }
    }
    console.log('[createShortUrl] originalUrl=', originalUrl);
    if (!originalUrl || !validator.isURL(originalUrl, { require_protocol: true })) {
      return res.status(400).json({ message: 'A valid originalUrl (with protocol) is required' });
    }

    // If customAlias provided, use it as shortCode (ensure uniqueness)
    let shortCode = customAlias || generateShortCode();
    // ensure unique
    let attempts = 0;
    while (await Url.findOne({ shortCode })) {
      attempts++;
      console.log('[createShortUrl] collision, attempt=', attempts);
      shortCode = generateShortCode();
      if (attempts > 10) break;
    }

    console.log('[createShortUrl] shortCode=', shortCode);

    console.log('[createShortUrl] about to create URL doc');

    // generate QR code (data URL)
    const base = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    const shortUrl = `${base}/${shortCode}`;
    let qrCodeData = undefined;
    try {
      qrCodeData = await QRCode.toDataURL(shortUrl);
    } catch (e) {
      console.error('[createShortUrl] QR generation failed', e && e.message);
    }

    const url = await Url.create({
      userId: userId,
      originalUrl,
      shortCode,
      customAlias: customAlias || undefined,
      qrCode: qrCodeData,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
    });

    return res.status(201).json(url);
  } catch (err) {
    console.error('[createShortUrl]', err && err.stack ? err.stack : err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// GET /:shortCode (public redirect)
exports.redirectUrl = async (req, res) => {
  try {
    const { shortCode } = req.params;

    const url = await Url.findOne({ shortCode });

    if (!url) {
      return res.status(404).json({ message: 'Short URL not found' });
    }

    if (url.expiryDate && new Date() > new Date(url.expiryDate)) {
      return res.status(410).json({ message: 'Link has expired' });
    }

    url.clickCount = (url.clickCount || 0) + 1;
    await url.save();

    const deviceInfo = parseDevice(req.headers['user-agent']);

    await Visit.create({
      urlId: url._id,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
      device: deviceInfo.device,
      ip: req.ip,
    });

    return res.redirect(url.originalUrl);
  } catch (error) {
    console.error('[redirectUrl]', error);
    return res.status(500).json({ message: error.message });
  }
};

// GET /api/url/myurls
exports.getUserUrls = async (req, res) => {
  try {
    const userId = (req.user && req.user.id) || (() => {
      try {
        const authHeader = req.headers.authorization || '';
        if (authHeader.startsWith('Bearer ')) {
          const token = authHeader.split(' ')[1];
          const jwt = require('jsonwebtoken');
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
          return decoded.id;
        }
      } catch (e) {
        return null;
      }
    })();
    const urls = await Url.find({ userId }).sort({ createdAt: -1 });
    return res.json(urls);
  } catch (err) {
    console.error('[getUserUrls]', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/url/:id
exports.deleteUrl = async (req, res) => {
  try {
    const { id } = req.params;
    const url = await Url.findById(id);
    if (!url) return res.status(404).json({ message: 'URL not found' });
    const userId = (req.user && req.user.id) || (() => {
      try {
        const authHeader = req.headers.authorization || '';
        if (authHeader.startsWith('Bearer ')) {
          const token = authHeader.split(' ')[1];
          const jwt = require('jsonwebtoken');
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
          return decoded.id;
        }
      } catch (e) {
        return null;
      }
    })();
    if (String(url.userId) !== String(userId)) return res.status(403).json({ message: 'Not authorized' });
    await url.deleteOne();
    return res.json({ message: 'URL deleted successfully' });
  } catch (err) {
    console.error('[deleteUrl]', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/url/:id/qr (protected) - download QR PNG
exports.downloadQR = async (req, res) => {
  try {
    const { id } = req.params;
    const url = await Url.findById(id);

    if (!url || !url.qrCode) {
      return res.status(404).json({ message: 'QR code not found' });
    }

    const base64Data = url.qrCode.replace(/^data:image\/png;base64,/, '');
    const imgBuffer = Buffer.from(base64Data, 'base64');

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename=${url.shortCode}.png`);

    return res.send(imgBuffer);
  } catch (error) {
    console.error('[downloadQR]', error);
    return res.status(500).json({ message: error.message });
  }
};

