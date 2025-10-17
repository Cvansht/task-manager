const { validationResult } = require("express-validator");
const Task = require("../models/Task");

exports.createTask = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });
     
 try {
    const data =  {...req.body , userId :  req.user.id};
    const task = new Task (data);
    await  task.save();
    res.json(task);
 } catch(err){
    console.error(err.message);
    res.status(500).send('Server Error');
 }};

exports.getTask   =async (req, res )=> {
    try {
        const {status , priority , search} = req.query;
        const filter = {userId : req.user.id};
        if (status) filter.status = status;
        if(priority) filter.priority = priority;
        if (search) {
        const escaped = String(search).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const prefix = new RegExp(`^${escaped}`, 'i');
        filter.$or = [
          { title: { $regex: prefix } },
          { description: { $regex: prefix } }
        ];
        }
        const tasks = await Task.find(filter).sort({createdAt : -1});
        res.json(tasks);


    } catch(err){
        console.error(err.message);
        res.status(500).send('Server Error')
}};

exports.getTaskById = async (req, res) => {
try {
const task = await Task.findOne({ _id: req.params.id, userId: req.user.id });
if (!task) return res.status(404).json({ msg: 'Task not found' });
res.json(task);
} catch (err) {
console.error(err.message);
res.status(500).send('Server error');
}};

exports.updateTask = async (req, res) => {
try {
const task = await Task.findOneAndUpdate(
{ _id: req.params.id, userId: req.user.id },
{ ...req.body, updatedAt: Date.now() },
{ new: true }
);
if (!task) return res.status(404).json({ msg: 'Task not found' });
res.json(task);
} catch (err) {
console.error(err.message);
res.status(500).send('Server error');
}};

exports.deleteTask = async (req, res) => {
try {
const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
if (!task) return res.status(404).json({ msg: 'Task not found' });
res.json({ msg: 'Task removed' });
} catch (err) {
console.error(err.message);
res.status(500).send('Server error');
}
};


exports.getStats = async (req , res) => {
try {
const userId = req.user.id;
const total = await Task.countDocuments({ userId });
const completed = await Task.countDocuments({ userId, status: 'Completed' });
const pending = await Task.countDocuments({ userId, status: { $ne: 'Completed' } });
let byPriority = [];
try {
  const mongoose = require('mongoose');
  const userObjectId = new mongoose.Types.ObjectId(userId);
  byPriority = await Task.aggregate([
    { $match: { userId: userObjectId } },
    { $group: { _id: '$priority', count: { $sum: 1 } } }
  ]);
} catch (castErr) {
  byPriority = [];
}
res.json({ total, completed, pending, byPriority });
} catch (err) {
console.error(err.message);
res.status(500).send('Server error');
}
};


