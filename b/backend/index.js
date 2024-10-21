import express from "express";
import multer from "multer";
import cors from "cors";
import path from "path";
import { fileURLToPath } from 'url';

import fs from "fs"

import nodemailer from "nodemailer"
import { ppid } from "process";

import mongoose from "mongoose";
import { Server } from "http"; // Import Server from "http" module
import dotenv from 'dotenv';


//middle WArE:
const app = express();
app.use(cors());
app.use(express.json());
dotenv.config();


//this is mongo stuff!

const dburl =process.env.MONGO_URI;

const connectionParams = {
    useNewUrlParser:true,
    useUnifiedTopology:true
}

mongoose.connect(dburl,connectionParams)
.then(()=>console.log("connected to DB"))
.catch(err=>console.log(err))

import SofaModel from "./sofa.js";
import userModel from "./user.js";
import cartModel from "./cart.js";
import ShoeRackModel from "./shoeRacks.js";
import DashBoardModel from "./Dashboard.js";
import CancelModel from "./cancelModel.js";




//other stuff!

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use('/public', express.static(path.join(__dirname, 'public')));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/img');
    },
    filename: (req, file, cb) => {
        const randomNumber = Math.floor(Math.random() * (999 - 100 + 1)) + 100;
        cb(null, randomNumber + file.fieldname + "-" + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

app.get('/getSofas', async (req, res) => {
    try {
        // Call function to get sofas from database
        const sofas = await SofaModel.find()
        res.send({ S: sofas, message: 'ok' });
    } catch (error) {
        console.error(error);
        res.send({ message: 'not ok' });
    }
});

app.post('/getS', async (req, res) => {
    const folderName = req.body.Sku;
let data;

try {
    data = await SofaModel.findOne({ Sku: folderName });
} catch (error) {
    console.log(error);
    // You may want to handle the error more gracefully, e.g., by returning an error response
    return res.status(500).send("An error occurred while fetching data.");
}

if (!data) {
    // Handle the case where no data is found
    return res.status(404).send("No data found for the given SKU.");
}

const folderPath = path.join(__dirname, `public/img/sofa/${data["Sub Category"]}/${folderName}`); // Construct the full path to the folder
const filePaths = [];

    fs.readdir(folderPath, (err, files) => {
        if (err) {
            console.error('Error reading directory:', err);
           
        }
        // Log the file names to the console
        files.forEach(file => {
            const filePath = path.join(folderPath, file);
            const isFile = fs.statSync(filePath).isFile();
            if (isFile) {
                filePaths.push(file);
            }
        });

        // console.log(filePaths);

        
    });
    try {
        const D = await SofaModel.find({ Sku: folderName }); // Use folderName instead of undefined variable s
        res.send({ message: "ok", sofa: D, files: filePaths });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "not ok" }); // Send appropriate error response
    }
});

app.post("/sofaimg", async (req, res) => {
    const folderName = req.body.sku;
    let data;

    try {
        data = await SofaModel.find({Sku:folderName});
    } catch (error) {
        console.log(error)
        res.send({message:"there is an error in backend"})
    }
    
    const folderPath = path.join(__dirname, `public/img/sofa/${data[0]['Sub Category']}/${folderName}`);
  
    fs.readdir(folderPath, (err, files) => {
        if (err) {
          console.error('Error reading directory:', err);
          return; // Add this line to exit the function if there is an error
        }
        const filePaths = [];
        files.forEach(file => {
          const filePath = path.join(folderPath, file);
          const isFile = fs.statSync(filePath).isFile();
          if (isFile) {
            filePaths.push(file);
          }
        });
        res.send({message:"ok",names:filePaths,D:data[0]})
      });
      
      
  });
  

app.post("/otherGetData",async(req,res)=>{
    const subcat = req.body.PC;
    const cat = req.body.Product;


    try {
        if(cat==="Sofa"){
            const D = await SofaModel.aggregate([
                { $sample: { size: 20 } }, 
              ]);
                          res.send({
                Data:D,
                message:"ok"
            })
        }else if(cat==="SR"){
            const D = await ShoeRackModel.aggregate([
                { $sample: { size: 20 } }, 
              ]);
                          res.send({
                Data:D,
                message:"ok"
            })
            
        }
        
    } catch (error) {
        console.log(error)
        res.send({
            message:"not ok"
        })
    }
})

app.post("/reg",async(req,res)=>{
    //here first check if a person with that email already exist?
    try {
        const d = await userModel.find({email:req.body.email})
        if(d.length > 0){
            res.send({message:"there"})
        }else{
            const randomNumber = Math.floor(1000 + Math.random() * 9000);
            const transporter = nodemailer.createTransport({
              host: "smtp.gmail.com", // Correct hostname for Gmail SMTP server
              port: 587,
              secure: false, // true for 465, false for other ports
              auth: {
                user: "mohdrayaanpasha@gmail.com", // your Gmail email
                pass: "wjla emip mkys ocmj",
              },
            });
      
            try {
                const info = await transporter.sendMail({
                    from: "Solace Craft <noreply@solacecraft.com>",
                    to: req.body.email,
                    subject: "Welcome to Solace Craft - Your Registration OTP",
                    text: "Dear Valued User,",
                    html: `
                      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                        <h2>Welcome to Solace Craft!</h2>
                        <p>Thank you for choosing Solace Craft for your journey. We are thrilled to have you on board!</p>
                        <p>Your One-Time Password (OTP) for registration is:</p>
                        <h3 style="color: #007BFF;"><b>${randomNumber}</b></h3>
                        <p>Please use this OTP to complete your registration. If you did not request this, please ignore this email.</p>
                        <p>Best Regards,<br>The Solace Craft Team</p>
                      </div>
                    `,
                  });
                  
            } catch (error) {
              console.error("Error occurred:", error);
              return res.status(500).send("Failed to send email.");
            }
      
            res.send({otp: randomNumber,message:"notthere" });
          }
        } catch (error) {
          console.error("Error occurred:", error);
          res.status(500).send("Internal server error.");
        }
      });

    //if there send for login, else send otp and authenticate
app.post("/confirmReg",async(req,res)=>{
    try {
        await userModel.create({
            email:req.body.email,
            name:req.body.name,
            phoneNo:req.body.number,
            Adress:req.body.shippingAddress,
            Password:req.body.password
        })
        res.send({message:"done"})
    } catch (error) {
        res.send({message:"notdone"})
    }
})

app.post("/login",async(req,res)=>{
    const E =req.body.Email

    const P = req.body.Password
   
    try {
        const data = await userModel.find({email:E});
        if(data.length > 0){
            if(data[0].Password === P){
                res.send({message: "Pass"})
            }else{
                res.send({message:"Fail"})
            }
        }else{
            res.send({message:"not"})
        }
    } catch (error) {
        
    }
})


app.post("/userInfo",async(req,res)=>{
    const E =req.body.Email
    try {
        const data = await userModel.find({email:E})
        res.send({message:true,D:data})
    } catch (error) {
        console.log(error)
        res.send({message:false})

    }
})

app.post("/addcart", async (req, res) => {
    const E = req.body.Email;
    let Arr = []; // Initialize outside the try block
  
    try {
      const D = await cartModel.find({ Email: E });
      
      if (D.length > 0) {
        const Existing = D[0].Skus;
        let there = false
        for(let i=0;i<Existing.length;i++){
            if(Existing[i]===req.body.Sku){
                there=true;
                break
            }
        }
        if(!there){
            const mergedSkus = [...Existing, req.body.Sku];
        
            await cartModel.updateOne({ Email: E }, { Skus: mergedSkus });
            res.send({message:"done"})
        }else{
            res.send({message:"there"})
        }
        
      } else {
        Arr.push(req.body.Sku);
        await cartModel.create({
          Email: E,
          Skus: Arr,
        });
        res.send({message:"done"})
      }
  
    
    } catch (error) {
      console.error("Error adding item to cart:", error);
      res.status(500).send("Internal server error.");
    }
  });
  
app.post("/CartGet",async(req,res)=>{
    const E= req.body.Email;

    try {
        const D = await cartModel.find({Email:E})
        res.send({message:"ok",Da:D[0]})
    
    } catch (error) {
        res.send({message:"notok"})
        console.log(error)
    }
})

app.post("/Item4Cart",async(req,res)=>{
    const S = req.body.Sku;
    try {
        const D = await SofaModel.find({Sku:S});
        if(D.length > 0){
            res.send({Message:"done",Da:D[0]})
        }else{
            const a = await ShoeRackModel.find({Sku:S});
           
            if(a.length > 0){
                res.send({Message:"done",Da:a[0]})
            }else{
                res.send({Message:"item not found!"})
                console.log("item not found!")
            }
        }
        
        // console.log(D)
    } catch (error) {
        console.log(error)
    }
})

app.get("/3seatget",async(req,res)=>{
    try {
        const D = await SofaModel.find({"Sub Category":"3 Seater Sofa"});
        res.send({Data:D,message:"ok"})
    } catch (error) {
        console.log(error)
        res.send({message:"notok"})
    }
})

app.get("/2seatget",async(req,res)=>{
    try {
        const D = await SofaModel.find({"Sub Category":"2 Seater Sofa"});
        res.send({Data:D,message:"ok"})
    } catch (error) {
        console.log(error)
        res.send({message:"notok"})
    }
})

app.get("/1seatget",async(req,res)=>{
    try {
        const D = await SofaModel.find({"Sub Category":"1 Seater Sofa"});
        res.send({Data:D,message:"ok"})
    } catch (error) {
        console.log(error)
        res.send({message:"notok"})
    }
})

app.get("/storageBGet",async(req,res)=>{
    try {
        const D = await SofaModel.find({"Sub Category":"Storage Bench"});
        res.send({Data:D,message:"ok"})
    } catch (error) {
        console.log(error)
        res.send({message:"notok"})
    }
})

app.get("/Lget",async(req,res)=>{
    try {
        const D = await SofaModel.find({"Sub Category":"L Shape Sofa"});
        res.send({Data:D,message:"ok"})
    } catch (error) {
        console.log(error)
        res.send({message:"notok"})
    }
})

app.get("/ShoeRacksget",async(req,res)=>{
    try {
        const Data=await ShoeRackModel.find({});
        res.send({message:"ok",D:Data})
    } catch (error) {
        console.log(error)
        res.send({message:"not ok"})
    }
})

app.post('/SRget', async (req, res) => {
    const folderName = req.body.Sku;
let data;

try {
    data = await ShoeRackModel.findOne({ Sku: folderName });
    console.log(data)
} catch (error) {
    console.log(error);
    // You may want to handle the error more gracefully, e.g., by returning an error response
    return res.status(500).send("An error occurred while fetching data.");
}

if (!data) {
    // Handle the case where no data is found
    return res.status(404).send("No data found for the given SKU.");
}

const folderPath = path.join(__dirname, `public/img/SR/${data["Sub Category"]}/${folderName}`); // Construct the full path to the folder
const filePaths = [];

    fs.readdir(folderPath, (err, files) => {
        if (err) {
            console.error('Error reading directory:', err);
           
        }
        // Log the file names to the console
        files.forEach(file => {
            const filePath = path.join(folderPath, file);
            const isFile = fs.statSync(filePath).isFile();
            if (isFile) {
                filePaths.push(file);
            }
        });

    

        
    });
    try {
        const D = await ShoeRackModel.find({ Sku: folderName }); // Use folderName instead of undefined variable s
        res.send({ message: "ok", sofa: D, files: filePaths });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "not ok" }); // Send appropriate error response
    }
});


app.get("/seatSRget",async(req,res)=>{
    try {
        const D = await ShoeRackModel.find({"Sub Category":"Shoe Cabinet with Seat"});
        res.send({Data:D,message:"ok"})
    } catch (error) {
        console.log(error)
        res.send({message:"notok"})
    }
})

app.get("/benchSRget",async(req,res)=>{
    try {
        const D = await ShoeRackModel.find({"Sub Category":"Shoe Cabinet Bench"});
        res.send({Data:D,message:"ok"})
    } catch (error) {
        console.log(error)
        res.send({message:"notok"})
    }
})
app.get("/test",async(req,res)=>{
    res.send("yea its there solacecraft")
})
app.get("/cabSRget",async(req,res)=>{
    try {
        const D = await ShoeRackModel.find({"Sub Category":"Shoe Cabinet"});
        res.send({Data:D,message:"ok"})
    } catch (error) {
        console.log(error)
        res.send({message:"notok"})
    }
})



app.post("/cartUpdate",async(req,res)=>{
    const email = req.body.Email
    const sku = req.body.Arr
  
    try {
        await cartModel.updateOne(
            { Email: email },
            { $set: { Skus: sku } } 
        );
    } catch (error) {
        console.log(error)
    }
})



app.get("/randomhome",async(req,res)=>{
    try {
        const SofaD = await SofaModel.aggregate([
            { $sample: { size: 6 } }, 
          ]);
        const ShoeD = await ShoeRackModel.aggregate([
            { $sample: { size: 6 } }, 
          ]);

          const arr = SofaD.concat(ShoeD);
          console.log(arr)

          res.send({message:"ok",Da:arr})
    } catch (error) {
        console.log(error)
        res.send({message:"err"})
    }
})

app.get("/randomspotlights",async(req,res)=>{
    try {
        const SofaD = await SofaModel.aggregate([
            { $sample: { size: 15 } }, 
          ]);
        const ShoeD = await ShoeRackModel.aggregate([
            { $sample: { size: 10 } }, 
          ]);

          const arr = SofaD.concat(ShoeD);
          console.log(arr)

          res.send({message:"ok",Da:arr})
    } catch (error) {
        console.log(error)
        res.send({message:"err"})
    }
})

app.post("/EnterDash", async (req, res) => {
    const Da = req.body.D;
 
    try {
        const s = await DashBoardModel.create(Da);
        res.send({ message: true, id:s._id });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: false, error: error.message }); // Return a status and error message
    }
});


app.get("/getAdmin",async(req,res)=>{
    try {
        const d = await DashBoardModel.find();
        res.send({message:true,D:d})
    } catch (error) {
        res.send({message:false})
        console.log(error)
    }
})


app.post("/delorder", async (req, res) => {
    const orderId = req.body.orderId; // Ensure the field name matches the one used in your React component
    try {
        // Update the order status (assuming "Admin" field indicates cancellation)
        const result = await DashBoardModel.updateOne(
            { _id: orderId },
            { $set: { Admin: false } } 
        );

      
     
            res.send({ message: true });
        
           
    } catch (error) {
        console.error(error);
        res.send({ message: false });
    }
});

app.post("/delCancel", async (req, res) => {
    const orderId = req.body.orderId; // Ensure the field name matches the one used in your React component
    try {
        // Update the order status (assuming "Admin" field indicates cancellation)
        await CancelModel.deleteOne({ _id: orderId});

      
        
            res.send({ message: true }); 
        
    } catch (error) {
        console.error(error);
        res.send({ message: false });
    }
});


app.post("/myordersget", async (req, res) => {
    const email = req.body.Email; // Use a consistent naming convention (lowercase `id`)
    
    if (!email) {
        return res.status(400).send({ message: "No customer ID provided" });
    }

    

    try {
        const orders = await DashBoardModel.find({ "Costumer Email": email }); // Assuming the model field name is correct
        if(orders.length > 0){
            res.send({Orders:orders,message:true})
        }else{
            res.send({ Orders: [], message: true });
        }
        
             // Explicitly return an empty array if no orders are found
        
    } catch (error) {
        console.error("Error fetching orders:", error); // More descriptive logging
        res.status(500).send({ message: "Internal server error" }); // More informative error message
    }
});


app.post("/cancelorder", async (req, res) => {
    const { data } = req.body;
    
    if (!data || !data["Costumer Id"]) {
        return res.status(400).send({ message: 'Invalid request data' });
    }

    data.Admin = true;

    try {
        
        await CancelModel.create(data);

        let i = data._id 
        await DashBoardModel.deleteOne({ _id: i});

        // Send a success responses
        res.send({ message: true });
    } catch (error) {
        console.error(error);
        // Send a failure response
        res.status(500).send({ message: false });
    }
});


app.get("/cancelGet",async(req,res)=>{
    try {
        const D = await CancelModel.find();
        res.send({message:true,Da:D})
    } catch (error) {
        console.log(error)
        res.send({message:false})
    }
})

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
