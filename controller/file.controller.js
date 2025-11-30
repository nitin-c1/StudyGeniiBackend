import File from '../model/file.model.js';
import cloudinary from '../config/cloud.js';

export const addFile = async (req, res) => {
  try {
    const { title, description, subject, createdBy } = req.body;

    // Check required fields
    let missingFields = [];
    if (!title) missingFields.push('title');
    if (!description) missingFields.push('description');
    if (!subject) missingFields.push('subject');
    if (!createdBy) missingFields.push('createdBy');
    if (!req.file) missingFields.push('file');

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        missing: missingFields,
      });
    }

    // Convert file to base64
    const base64File = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(base64File, {
      folder: 'files',
      resource_type: 'raw',
    });

    // Save to DB
    const newFile = await File.create({
      title,
      description,
      subject,
      createdBy,
      fileUrl: uploadResult.secure_url,
    });

    return res.status(201).json({
      success: true,
      message: 'File uploaded & record created successfully',
      data: newFile,
    });
  } catch (error) {
    console.error('Error in addFile:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getAllFiles = async (req, res) => {
  try {
    const files = await File.find();
    res.status(200).json({ success: true, files });
  } catch (error) {
    console.error('Error in getAllFiles:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getFileById = async (req, res) => {
  try {
    const { id } = req.params;
    const file = await File.findById(id);
    if (!file) return res.status(404).json({ message: 'File not found' });
    res.status(200).json({ success: true, file });
  } catch (error) {
    console.error('Error in getFileById:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
