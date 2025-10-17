require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');


const app = express();
app.use(express.json());
app.use(cors());


connectDB(process.env.MONGO_URI);


app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));


app.use(errorHandler);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));