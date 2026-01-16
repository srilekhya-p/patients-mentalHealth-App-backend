const { GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const MedicalHistory = require('../models/MedicalHistory');
const { s3 } = require('../S3Setup');

exports.uploadHistory = async (req, res) => {
  try {
    const { title, userId } = req.body;
    if (!userId || !title) return res.status(400).json({ error: 'Missing title or userId' });
    if (!req.file) return res.status(400).json({ error: 'File not uploaded' });

    const fileUrl = req.file.location;
    const newEntry = new MedicalHistory({ userId, title, fileUrl });
    await newEntry.save();
    res.json({ message: 'Uploaded successfully', fileUrl });
  } catch (err) {
    console.error('Upload failed:', err);
    res.status(500).json({ error: 'Server error during upload' });
  }
};

exports.getFiles = async (req, res) => {
  try {
    const { userId } = req.params;
    const files = await MedicalHistory.find({ userId }).sort({ createdAt: -1 });
    res.json({ files });
  } catch (err) {
    console.error('Error fetching files:', err);
    res.status(500).json({ error: 'Failed to fetch files' });
  }
};

// Stream file from S3
exports.viewFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const file = await MedicalHistory.findById(fileId);
    if (!file) return res.status(404).json({ error: 'File not found' });

    // Extract S3 key
    const urlParts = file.fileUrl.split('/');
    let key = urlParts.slice(3).join('/');
    key = decodeURIComponent(key);

    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
    });
    const s3Response = await s3.send(command);

    res.setHeader('Content-Type', s3Response.ContentType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${file.title}"`);
    s3Response.Body.pipe(res);
  } catch (err) {
    console.error('Error streaming file:', err);
    res.status(500).json({ error: 'Error retrieving file from S3' });
  }
};

exports.deleteFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const file = await MedicalHistory.findById(fileId);
    if (!file) return res.status(404).json({ error: "File not found" });

    const urlParts = file.fileUrl.split('/');
    let key = urlParts.slice(3).join("/");
    key = decodeURIComponent(key);

    await s3.send(new DeleteObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
    }));

    await MedicalHistory.findByIdAndDelete(fileId);
    res.json({ message: "File deleted successfully" });
  } catch (err) {
    console.error("Error deleting file:", err);
    res.status(500).json({ error: "Failed to delete file" });
  }
};
