// routes/bodyParts.js
// Express router for anatomical systems, linked indicators, and 3D body statuses.

const express = require('express');
const router = express.Router();
const bodyPartsController = require('../controllers/bodyPartsController');

router.get('/', bodyPartsController.getAll);
router.get('/:id', bodyPartsController.getById);

module.exports = router;
