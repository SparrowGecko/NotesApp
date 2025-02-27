const express = require('express');
const { authenticateUser } = require('../middleware/authMiddleware');

const router = express.Router();

// process the GET request with authenticateUser to check if logged in
router.get('/', authenticateUser, (req, res) => {
    const mockNotes = [
        { id: 1, content: 'First note' },
        { id: 2, content: 'Second note' }
      ];
      
      res.json({
        user: req.user,
        notes: mockNotes
      });
});

module.exports = router;