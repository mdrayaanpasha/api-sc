import mongoose from "mongoose";




const Sch = new mongoose.Schema({
    Email:String,
    Skus:Array,
})

const cartModel = mongoose.model("CartModel",Sch)


export default cartModel;