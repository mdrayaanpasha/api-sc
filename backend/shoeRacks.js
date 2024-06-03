import mongoose from "mongoose";


// Define Schema
const ShoeRackSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    Sku: String,
    Title: String,
    Description: String,
    "Product Category": String,
    "Sub Category": String,
    Color: String,
    Material: String,
    Size: String,
    "Selling Price ": Number,
    "Mrp ": Number,
    SKUs:String, // Should be array if intended to store multiple values
});

// Define model
const ShoeRackModel = mongoose.model('ShoeRackModel', ShoeRackSchema, 'ShoeRackModel'); // Use correct collection name


export default ShoeRackModel;
