const express = require("express");
const { uploadFile, uploadMiddleware } = require("../controllers/upload");

const router = express.Router();

// API tải lên file
router.post("/uploads", uploadMiddleware, uploadFile);

module.exports = router;