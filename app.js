require("dotenv").config();
const express = require("express");
const app = express();
const port = 8080;
const path = require("path");
const userModel = require("./models/student");

const cookieParser = require("cookie-parser");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));


//register
app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/register", async (req, res) => {

   let {email,password,age,username} = req.body;
   let user = await userModel.findOne({email:email});

   if(user) {
     return res.status(401).send("You already have an account, please login.");
    }

    bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(password, salt, async function (err, hash) {
            if (err) return res.send(err.message);
            else {
                let user = await userModel.create({
                    username,
                    email,
                    password: hash,
                    age,
                });
                
                let token = jwt.sign({email:user.email,id: user._id}, process.env.TOKEN_KEY);
                res.cookie("token",token);
                res.redirect("/login");
            }
        })
    })

});


//login
app.get("/login",(req,res)=>{
    res.render("login.ejs");
})



app.post("/login", async (req,res)=>{
    let {email,password} = req.body;
    let user = await userModel.findOne({email: email });
    if(!user) {
       return res.send("Email or Password is Incorrect");
    }

    bcrypt.compare(password, user.password, (err, result)=> {
        if(result){

            let token = jwt.sign({email:user.email,id: user._id},  process.env.TOKEN_KEY);
            res.cookie("token", token);
             res.redirect("/profile");

        }else {
            return res.send("Email or Password incorrect");
        }
    })

});



//logout
app.get("/logout",(req,res)=>{
    res.cookie("token", "");
    res.redirect("/login");
})

//loogdin
const isloogidin =  ( async (req,res,next)=>{
    if(!req.cookies.token){
        return res.redirect("/login");
    }
    try{
        let decoded = jwt.verify(req.cookies.token,  process.env.TOKEN_KEY);
        let user = await userModel
        .findOne({ email: decoded.email })
        .select("-password");
        req.user = user;
        next();
    }catch(err){
        req.send("Something went wrong");
    }  
});

//profile
app.get("/profile", isloogidin , async (req,res)=>{
    
    const users = await userModel.find();
     res.render("profile.ejs",{users});

});



app.listen(port, () => {
    console.log("App is listening on port");
})