const mongoose = require('mongoose');

const DataBase = async (req, res) => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("DataBase is successfully connected sir");
    } catch (error) {
        console.log("DataBase is not connected sir");
    }
}
module.exports=DataBase