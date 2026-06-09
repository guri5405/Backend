const express = require('express');
const dotenv = require('dotenv').config();
const dbconnect = require('./config/dbconnect');

const authRoutes = require('./routes/authRoutes');

const userRoutes = require('./routes/userRoutes')

dbconnect();

const app = express();

//middleware
app.use(express.json());

// routes
app.get('/', (req, res) => {
  res.send('Server is up');
});
// post call for create
app.use('/api/auth', authRoutes);

app.use('/api/users', userRoutes);

//start server
const PORT = process.env.PORT || 4001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
