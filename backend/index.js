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

//middle WArE:
const app = express();
app.use(cors());
app.use(express.json());



//this is mongo stuff!

const dburl = "mongodb+srv://mohdrayaanpasha:Abc1543786290@cluster0.rtpe7lh.mongodb.net/SolaceCraft?retryWrites=true&w=majority";

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

app.post("/otherGetData",async(req,res)=>{
    const subcat = req.body.PC;
    const cat = req.body.Product;
    // console.log(cat,subcat)

    try {
        if(cat==="Sofa"){
            const D = await SofaModel.aggregate([
                { $sample: { size: 10 } }, 
              ]);
                          res.send({
                Data:D,
                message:"ok"
            })
        }else if(cat==="Shoe Rack "){
            const D = await ShoeRackModel.aggregate([
                { $sample: { size: 10 } }, 
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
            console.log("userThere")
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
                from: "Email Authenticator <your_gmail_address@gmail.com>",
                to: req.body.email,
                subject: "OTP For Verification!!",
                text: "Hello world!",
                html: `<p>Here is your OTP: <b>${randomNumber}</b></p>`,
              });
            } catch (error) {
              console.error("Error occurred:", error);
              return res.status(500).send("Failed to send email.");
            }
      
            res.send({otp: randomNumber });
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
    console.log(E,P)
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
        const D = await SofaModel.find({Sku:S})
        res.send({Message:"done",Da:D[0]})
        console.log(D)
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
console.log(folderName)
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

        // console.log(filePaths);

        
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

app.get("/cabSRget",async(req,res)=>{
    try {
        const D = await ShoeRackModel.find({"Sub Category":"Shoe Cabinet"});
        res.send({Data:D,message:"ok"})
    } catch (error) {
        console.log(error)
        res.send({message:"notok"})
    }
})










app.listen(3000, () => {
    console.log('Server is running on port 3000');
});