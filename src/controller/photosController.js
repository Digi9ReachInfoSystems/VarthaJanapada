const Photos = require("../models/photosModel");
const mongoose = require("mongoose");
const User = require("../models/userModel");

const createPhotos = async (req, res) => {
    const { photoImage } = req.body;
    try {
        const photos = new Photos({ photoImage,
createdBy: req.user._id,
status: req.user.role === 'admin' ? 'approved' : 'pending'

        });
        await photos.save();
        res.status(201).json(photos);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const approvePhotos = async (req, res) => {
    const { id } = req.params;
    try {
        const photos = await Photos.findById(id);
        if (!photos) {
            return res.status(404).json({ message: "Photos not found" });
        }
        photos.status = "approved";
        await photos.save();
        res.status(200).json(photos);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getAllPhotos = async (req, res) => {
    try {
        const photos = await Photos.find({ status: "approved" });
        res.status(200).json(photos);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getPhotosById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).send("No photos with that id");
        }
        const photos = await Photos.findById(id);
        res.status(200).json(photos);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

const deletePhotosById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).send("No photos with that id");
        }
        await Photos.findByIdAndDelete(id);
        res.json({ message: "Photos deleted successfully" });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

module.exports = { createPhotos, approvePhotos, getAllPhotos, getPhotosById, deletePhotosById };