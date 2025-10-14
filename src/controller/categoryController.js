const News = require("../models/newsModel");
const Category = require("../models/categoryModel");
const Tags = require("../models/tagsModel");
const { Translate } = require("@google-cloud/translate").v2;

// const base64Key = process.env.GOOGLE_CLOUD_KEY_BASE64;
// if (!base64Key) {
//   throw new Error(
//     "GOOGLE_CLOUD_KEY_BASE64 is not set in environment variables"
//   );
// }
// const credentials = JSON.parse(
//   Buffer.from(base64Key, "base64").toString("utf-8")
// );

// const translate = new Translate({ credentials });

exports.createCategory = async (req, res) => {
  try {
    // Get the name from the request body
    const { name, description } = req.body;
    const user = req.user;

    // Define the target languages for translation
    // const targetLanguages = ["en", "kn", "hi"]; // English, Kannada, Hindi

    // // Translate the category name into multiple languages
    // const translationPromises = targetLanguages.map((lang) =>
    //   translate.translate(name, lang)
    // );

    // // Wait for all translations to complete
    // const translations = await Promise.all(translationPromises);

    // Map the translated names to respective fields
    const category = new Category({
      ...req.body,
      // english: translations[0][0],
      // kannada: translations[1][0], 
      // hindi: translations[2][0], 
      createdBy: user.id,
      name,
      description,
      status: user.role === "admin" ? "approved" : "pending",
    });

    // Save the category to the database
    const savedCategory = await category.save();

    // Respond with the saved category data
    res.status(201).json({ success: true, data: savedCategory });
  } catch (error) {
    // Handle errors during the category creation
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const categoriesList = await Category.find()
    .populate("createdBy")
    .sort({ createdTime: -1 });
    res.status(200).json({ success: true, data: categoriesList });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const user = req.user;
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    Object.assign(category, req.body);
    category.last_updated = new Date();

    // Moderator edits go to pending
    if (user.role === "moderator") {
      category.status = "pending";
    }

    const updated = await category.save();
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.approveCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: "Category not found" });

    category.status = "approved";
    category.last_updated = new Date();
    await category.save();

    res.status(200).json({ success: true, message: "Category approved", data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }
    res.status(200).json({ success: true, data: {},message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
