const express = require("express")
const router = express.Router()

router.use('/user-info', require("./info/user-info"))






module.exports = router;