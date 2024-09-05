const cloudinary = require('cloudinary').v2;
const fs = require('fs');
require('dotenv').config()

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.cloud_name,
    api_key: process.env.api_key,
    api_secret: process.env.api_secret
});

const cloudinaryupload = async (filepath, newfolder) => {
    try {
        // Upload an image to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(filepath, {
            folder: newfolder
        });

        // Delete the local file after upload
        try {
            fs.unlinkSync(filepath);
        } catch (error) {
            console.error("Error deleting local file:", error);
        }

        return {
            secure_url: uploadResult.secure_url,
            public_id: uploadResult.public_id,
        };
    } catch (error) {
        console.error("Error uploading to Cloudinary:", error);
        throw new Error('Failed to upload image'); // Optional: rethrow to handle in the calling function
    }
};

module.exports = cloudinaryupload;
