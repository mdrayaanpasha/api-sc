import mongoose from "mongoose";

const sofaSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    Sku: String,
    Title: String,
    Description: String,
    "Product Category": String,
    "Sub Category": String,
    Color: String,
    Material: String,
    Size: String,
    "Selling Price": Number,
    Mrp: Number,
    "Similar Sku": [String] 
});


const SofaModel = mongoose.model('sofamodels', sofaSchema);

export default SofaModel;
