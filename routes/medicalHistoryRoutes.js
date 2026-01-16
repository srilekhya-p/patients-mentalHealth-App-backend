const express = require('express');
const router = express.Router();
const medicalHistoryController = require('../controllers/medicalHistoryController');
const { upload, s3 } = require('../S3Setup');  // import S3 and upload

router.post('/upload-history', upload.single('file'), medicalHistoryController.uploadHistory);
router.get('/get-files/:userId', medicalHistoryController.getFiles);
router.get('/view-file/:fileId', medicalHistoryController.viewFile);
router.delete('/delete-file/:fileId', medicalHistoryController.deleteFile);

module.exports = router;