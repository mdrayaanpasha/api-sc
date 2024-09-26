import mongoose from "mongoose";


const orderSchema = new mongoose.Schema({
    'Costumer Name': String,
    'Costumer Email': String,
    'Costumer Phone': Number,
    'Costumer Adress' : String,
    'Costumer Id': String,
    'Product Name': String,
    'Product Price': Number,
    'Product Sku': String,
    'Product Type':String,
    'Product Sub-Type':String,
    'Order Date': {
        type: Date,
        default: Date.now, 
    },
    'Admin':Boolean,
    
    
});



const DashBoardModel = mongoose.model("DashBoardModel",orderSchema)


export default DashBoardModel;
