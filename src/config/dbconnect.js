const mongoose = require('mongoose');

const dbconnect = async () => {
 
  try {
    const connect = await mongoose.connect(process.env.MONGO_URL);
  console.log(`MongoDB connected: ${connect.connection.host} ,${connect.connection.name}`);
  }
  catch (error) {
    console.log(`Error: ${error.message}`);
    process.exit(1);
  }
}

module.exports = dbconnect;
