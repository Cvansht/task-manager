const mongoose = require('mongoose');


const TaskSchema = new mongoose.Schema({
title: { type: String, required: true, index: 'text' },
description: { type: String },
priority: { type: String, enum: ['Low','Medium','High'], default: 'Low', index: true },
status: { type: String, enum: ['Todo','In Progress','Completed'], default: 'Todo', index: true },
dueDate: { type: Date },
userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
createdAt: { type: Date, default: Date.now },
updatedAt: { type: Date, default: Date.now }
});


TaskSchema.index({ title: 'text', description: 'text' });


module.exports = mongoose.model('Task', TaskSchema);