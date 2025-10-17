const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const taskController = require('../controllers/taskController');
const auth = require('../middleware/auth');

router.use(auth);


router.get('/stats', taskController.getStats);
router.get('/', taskController.getTask);
router.get('/:id', taskController.getTaskById);
router.post('/', [ body('title').notEmpty() ], taskController.createTask);
router.put('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);


module.exports = router;