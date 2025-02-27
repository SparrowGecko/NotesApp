const express = require('express');
const { authenticateUser } = require('../middleware/authMiddleware');

const router = express.Router();

// process the GET request with authenticateUser to check if logged in
router.get('/', authenticateUser, (req, res) => {
  console.log("Request received from:", req.headers.origin);
  console.log("Cookies received:", req.cookies);
  console.log("req.user in notes.js:", req.user); 

  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  const mockNotes = [
        { id: 1, content: 'First note' },
        { id: 2, content: 'Second note' }
      ];
      if (!req.user) {
        console.error("User authentication failed");
        return res.status(401).json({ error: "User not authenticated" });
      }
  res.json({
    user: req.user.id,
    notes: mockNotes
  });
});

module.exports = router;