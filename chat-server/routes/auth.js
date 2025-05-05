const router = require("express").Router();

const authController = require("../controllers/auth");

router.post("/login", authController.login);

router.post("/register", authController.register);

router.post("/logout", authController.logout);

router.get('/check-session', authController.checkSession);

router.get("/search", authController.searchUsersByEmail);

module.exports = router;
