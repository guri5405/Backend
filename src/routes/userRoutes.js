const express = require("express");
const verifyToken = require('../middlewares/authMiddleware');
const authorizedRoles = require('../middlewares/roleMiddleware')

const router = express.Router();


//only admin can access this router
router.get("/admin", verifyToken, authorizedRoles("admin"), (req, res) =>{
  res.json({message : "Welcome Admin "});
});


// all can access this router
router.get("/user", verifyToken,authorizedRoles("admin", "user"), (req, res) =>{
  res.json({message : "Welcome User"});
});


module.exports = router;