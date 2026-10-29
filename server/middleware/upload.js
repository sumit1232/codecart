const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ZIP_TYPES = ['application/zip', 'application/x-zip-compressed', 'application/octet-stream'];
const folder = { image: 'images', gallery: 'images', file: 'files', avatar: 'avatars' };

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads', folder[file.fieldname] || 'images')),
  filename: (req, file, cb) => cb(null, crypto.randomBytes(16).toString('hex') + path.extname(file.originalname).toLowerCase()),
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'file') {
    const ok = path.extname(file.originalname).toLowerCase() === '.zip' && ZIP_TYPES.includes(file.mimetype);
    return ok ? cb(null, true) : cb(new Error('Project file must be a .zip'));
  }
  return IMAGE_TYPES.includes(file.mimetype) ? cb(null, true) : cb(new Error('Images must be JPG, PNG or WebP'));
};

// project upload: 1 cover, up to 4 screenshots, 1 zip
exports.projectUpload = multer({ storage, fileFilter, limits: { fileSize: 100 * 1024 * 1024, files: 6 } })
  .fields([{ name: 'image', maxCount: 1 }, { name: 'gallery', maxCount: 4 }, { name: 'file', maxCount: 1 }]);

exports.avatarUpload = multer({ storage, fileFilter, limits: { fileSize: 2 * 1024 * 1024 } }).single('avatar');
