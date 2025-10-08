const StaticPage = require("../models/staticpageModel");
const mongoose = require("mongoose");
const User = require("../models/userModel");

const createStaticPage = async (req, res) => {
    const { staticpageLink } = req.body;
    try {
        const staticpage = new StaticPage({ staticpageLink,
            createdBy: req.user._id,
            status: req.user.role === 'admin' ? 'approved' : 'pending'
         });
        await staticpage.save();
        res.status(201).json(staticpage);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const approveStaticPage = async (req, res) => {
    const { id } = req.params;
    try {
        const staticpage = await StaticPage.findById(id);
        if (!staticpage) {
            return res.status(404).json({ message: "StaticPage not found" });
        }
        staticpage.status = "approved";
        await staticpage.save();
        res.status(200).json(staticpage);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getAllStaticPages = async (req, res) => {
    try {
        const staticpages = await StaticPage.find({ status: "approved" });
        res.status(200).json(staticpages);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


const getStaticPageById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).send("No staticpage with that id");
        }
        const staticpage = await StaticPage.findById(id);
        res.status(200).json(staticpage);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};


const deleteStaticPageById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).send("No staticpage with that id");
        }
        await StaticPage.findByIdAndDelete(id);
        res.json({ message: "StaticPage deleted successfully" });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};



module.exports = { createStaticPage, approveStaticPage, getAllStaticPages, getStaticPageById, deleteStaticPageById };