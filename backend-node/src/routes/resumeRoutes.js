const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resumeController');
const multer = require('multer');

// File upload configuration
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// POST /api/resumes/upload - Upload and process resume
router.post('/upload', upload.single('file'), resumeController.uploadResume);

// GET /api/resumes/:id - Get resume details
router.get('/:id', resumeController.getResume);

// GET /api/resumes - List all resumes
router.get('/', resumeController.listResumes);

// DELETE /api/resumes/:id - Delete resume
router.delete('/:id', resumeController.deleteResume);

module.exports = router;
