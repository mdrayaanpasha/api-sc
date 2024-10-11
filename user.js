import mongoose, { Mongoose } from "mongoose";



const Sch = new mongoose.Schema({
    email:String,
    name:String,
    phoneNo:Number,
    Adress:String,
    Password:String,
})

const userModel = mongoose.model("authenticationModel",Sch)


export default userModel;