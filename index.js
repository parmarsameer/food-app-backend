const http = require('http');
const express = require('express');
const cors = require('cors');
const socketIO = require('socket.io');
const mongoose = require('mongoose');
const app = express();
const port = 9000;
const Crypto = require("crypto-js");
var nodemailer = require('nodemailer');
let randomstring = require('randomstring')

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const cookieParser = require("cookie-parser");
app.use(cookieParser());
const session = require("express-session");

app.use(session({
    secret: 'conda',
    resave: false,
    saveUninitialized: false,
    // cookie: { maxAge: null }
}));

// app.use(session({
//     secret: 'conda',
//     resave: true,
//     saveUninitialized: false,
//     cookie: {
//       path: '/',
//       maxAge: null,
//       httpOnly: true,
//     }
//   }))
// const conn = mongoose.connect('mongodb+srv://sanjay:minddeft@skminddeft.kutanuu.mongodb.net/myfood');

const conn = mongoose.connect('mongodb://127.0.0.1:27017/myfood');

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            require: true,
            unique: true
        },
        password: {
            type: String,
            require: true,
        },
        name: {
            type: String,
            require: true,
        },
        phone: {
            type: String,
            require: true,
        },
    },
    {
        timestamps: true,
    }
);
const user_model = mongoose.model('user_credentails', userSchema)

const restaurantSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            require: true,
            unique: true
        },
        password: {
            type: String,
            require: true,
        },
        name: {
            type: String,
            require: true,
        },
        image_url: {
            type: String,
            require: true,
        },
        description: {
            type: String,
            require: true,
        },
        phone: {
            type: String,
            require: true,
        },
        address: {
            type: String,
            require: true,
        },
        gst_in: {
            type: String,
            require: true,
        },
        pan_no: {
            type: String,
            require: true,
        },
        lat_long: {
            type: Array,
        },
    },
    {
        timestamps: true,
    }
);
const restaurant_model = mongoose.model('restaurent_data', restaurantSchema)

const menuSchema = new mongoose.Schema(
    {
        rid: {
            type: String,
            require: true,
        },
        food_name: {
            type: String,
            require: true,
        },
        food_category: {
            type: String,
            require: true,
        },
        food_price: {
            type: String,
            require: true,
        },
        food_image: {
            type: String,
            require: true,
        },
        food_availability: {
            type: Boolean,
            require: true,
        },
        is_veg: {
            type: Boolean,
            require: true,
        },
        food_quantity: {
            type: String,
            require: true,
        },
    },
    {
        timestamps: true,
    }
);
const menu_model = mongoose.model('menu_data', menuSchema)

const OrdersSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            require: true,
            unique: true
        },
        order: {
            type: Array,
        }
    },
    {
        timestamps: true,
    }
);
const order_model = mongoose.model('orders_data', OrdersSchema)

const AdminSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            require: true,
            unique: true
        },
        password: {
            type: Array,
            require: true
        },
    },
);
const admin_model = mongoose.model('admin_cred', AdminSchema)

const deliverySchema = new mongoose.Schema(
    {
        email: {
            type: String,
            require: true,
            unique: true
        },
        password: {
            type: String,
            require: true,
        },
        name: {
            type: String,
            require: true,
        },
        phone: {
            type: String,
            require: true,
        },
        address: {
            type: String,
            require: true,
        },
        aadhar_no: {
            type: String,
            require: true,
        },
        status: {
            type: String,
            require: true,
        },
    },
    {
        timestamps: true,
    }
);
const delivery_model = mongoose.model('delivery_data', deliverySchema)

const server = http.createServer(app)
app.use(cors())

app.get("/api/", (req, res) => {
    res.send("server running...");
})

const io = new socketIO.Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
    }
})

io.on('connection', (socket) => {
    console.log(`new connection ${socket.id}`);
});

server.listen(port, () => {
    console.log(`Listening to port ${port}`)
})


const GLOBAL_PASS = "sudo-pt"

const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: "sp2042001@gmail.com",
        pass: "mfifwvezlvzjhurb",
    },
});

let mailid, encryptedpass, uname, uphone;

app.post("/api/user_reg", async (req, res) => {
    var { email, password, cpassword, name, phone } = req.body;
    var encryptedPwd = Crypto.AES.encrypt(password, GLOBAL_PASS).toString();
    mailid = email;
    uname = name;
    uphone = phone;
    encryptedpass = encryptedPwd;
    if (password == cpassword) {
        let query = user_model.where({ email: `${mailid}` });
        let value = await query.findOne();
        if (value) {
            if (value.email == mailid) {
                res.json({ message: "User already exists.", code:201 });
            }
        } else {
            var _otp = Math.random();
            _otp = _otp * 1000000;
            req.session.OTP = parseInt(_otp);
            var mailOptions = {
                to: mailid,
                subject: "OTP FOR SIGNUP",
                html: "<h3>OTP for account verification is </h3>" + "<h1 style='font-weight:bold;'>" + req.session.OTP + "</h1>" // html body
            };

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    res.status(403).json({ message: error });
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                    res.json({ message: "Enter otp sent on your email", code: 200 })
                }
            });
        }
    } else {
        res.status(402).json({ message: "Wrong Credentials." });
    }
})

app.post("/api/user_lg", async (req, res) => {
    console.log(req.session)
    let { email, password } = req.body;
    let usr_pwd = password;
    var encryptedPass = Crypto.AES.encrypt(usr_pwd, GLOBAL_PASS).toString();
    var decryptedPass = Crypto.AES.decrypt(encryptedPass, GLOBAL_PASS).toString();
    var encrp = decryptedPass.toString(Crypto.enc.Utf8);
    let query = user_model.where({ email: email });
    let value = await query.findOne();
    if (email != "" && password != "") {
        if (value != null) {
            // req.session.email = value.email;
            mailid = value.email;
            uname = value.name;
            let pswd = value.password;
            var decryptedPwd = Crypto.AES.decrypt(pswd.trim().toString(), GLOBAL_PASS).toString();
            var decrypt = decryptedPwd.toString(Crypto.enc.Utf8);
            if (value.email == email && decrypt == encrp) {
                // res.redirect('/api/login_otp');
                var _otp = Math.random();
                _otp = _otp * 1000000;
                req.session.OTP = parseInt(_otp);
                var mailOptions = {
                    to: mailid,
                    subject: "OTP FOR SIGNIN",
                    html: "<h3>OTP for account verification is </h3>" + "<h1 style='font-weight:bold;'>" + req.session.OTP + "</h1>"
                };
                console.log("login:", req.session);

                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        res.json({ message: error });
                    } else {
                        console.log('Email sent: ' + info.response);
                        res.sendStatus(201).json({ message: "Enter otp sent on your email" })
                    }
                });

                // res.json({ message: "Enter otp sent on your email" })
            } else {
                res.json({ message: "Wrong Credentials." });
            }
        } else {
            res.json({ message: "Wrong Credentials." });
        }
    } else {
        res.json({ message: "Wrong Credentials." });
    }
})

app.post('/api/verify', function (req, res) {
    const { otp } = req.body;
    console.log(otp)
    var obj = {
        email: mailid,
        password: encryptedpass,
        name: uname,
        phone: uphone
    };
    if (otp == req.session.OTP) {
        user_model.create(obj);
        res.json({ message: "Account created successfully.", code: 200 });
    }
    else {
        res.status(402).json({ message: "Incorrect OTP." });
    }
});

app.post('/api/log_verify', function (req, res) {
    const { otp } = req.body;
    console.log("verify:", req.session)
    if (parseInt(otp) === parseInt(req.session.OTP)) {
        res.json({ message: "Login successful.", code:200 });
    }
    else {
        res.json({ message: "Incorrect OTP." });
    }
});

app.get('/api/resend_otp', function (req, res) {
    var _otp = Math.random();
    _otp = _otp * 1000000;
    req.session.OTP = parseInt(_otp);
    var mailOptions = {
        to: mailid,
        subject: "OTP RESEND",
        html: "<h3>OTP for account verification is </h3>" + "<h1 style='font-weight:bold;'>" + req.session.OTP + "</h1>"
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            res.json({ message: "Found some error." });
        }
        res.json({ message: "OTP Send.", code: 200 });
    });
});

app.post('/api/add_restaurant', function (req, res) {
    const { name, address, email, phone, gst_in, pan_no, description, image_url, lat, long } = req.body;
    const password = randomstring.generate({
        length: 8,
        charset: 'alphabetic'
    })
    console.log(password)
    let encryptedPassword = Crypto.AES.encrypt(password.trim().toString(), GLOBAL_PASS).toString();
    var obj = {
        email: email,
        password: encryptedPassword,
        name: name,
        phone: phone,
        address: address,
        gst_in: gst_in,
        pan_no: pan_no,
        image_url: image_url,
        lat_long: {
            lat: lat, long: long
        },
        description: description
    };
    if (name !== "" && address !== "" && email !== "" && phone !== "" && gst_in !== "" && pan_no !== "") {
        var mailOptions = {
            to: email,
            subject: "Welcome to myFood.com Family",
            html: `<h3>Hello ${name}, Now you are a member of myFood.com</h3>` + `<h4>Your login username is your email id and password is</h4>` + "<h1 style='font-weight:bold;'>" + password + "</h1>"
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                res.status(402).json({ message: error });
            } else {
                console.log('Email sent: ' + info.response);
                restaurant_model.create(obj);
                res.json({ message: "Restaurant added.", code:200 })
            }
        });
    }
    else {
        res.json({ message: "Invalid input." });
    }
});

app.post('/api/add_product', function (req, res) {
    const { rid, food_name, food_category, food_price, food_image, food_availability, is_veg, food_quantity } = req.body;
    var obj = {
        rid: rid,
        food_name: food_name,
        food_category: food_category,
        food_price: food_price,
        food_image: food_image,
        food_availability: food_availability,
        is_veg: is_veg,
        food_quantity: food_quantity,
    };
    if (rid !== undefined && food_name !== "" && food_price !== "" && food_category !== "" && food_image !== "" && food_availability !== undefined) {
        menu_model.create(obj);
        res.json({ message: "Product Added.", code: 200 });
    }
    else {
        res.json({ message: "Invalid input." });
    }
});

app.post("/api/restaurant_login", async (req, res) => {
    let { email, password } = req.body;
    let usr_pwd = password;
    let encryptedPass = Crypto.AES.encrypt(usr_pwd.trim().toString(), GLOBAL_PASS).toString();
    let decryptedPass = Crypto.AES.decrypt(encryptedPass, GLOBAL_PASS).toString();
    let encrp = decryptedPass.toString(Crypto.enc.Utf8);
    if (email != "" && password != "") {
        let query = restaurant_model.where({ email: email });
        let value = await query.findOne();
        if (value != null) {
            let pswd = value.password;
            let decryptedPwd = Crypto.AES.decrypt(pswd.trim().toString(), GLOBAL_PASS).toString();
            let decrypt = decryptedPwd.toString(Crypto.enc.Utf8);
            console.log(decrypt)
            console.log(encrp)
            if (value.email == email && decrypt == encrp) {
                res.json({id:value._id})
            } else {
                res.status(400).json({ message: "Wrong Credentials." });
            }
        } else {
            res.status(402).json({ message: "Wrong Credentials." });
        }
    } else {
        res.status(402).json({ message: "Wrong Credentials." });
    }
})

// app.post("/api/restaurant_id", async (req, res) => {
//     try {
//         let { email } = req.body;
//         let query = restaurant_model.where({ "email": email });
//         let value = await query.findOne();
//         res.json({value})
//     } catch (error) {
//         return res.sendStatus(402).json({ message: error.message })
//     }
// })

app.get('/api/menu_data', async (req, res) => {
    let resp = await menu_model.find();
    res.json(resp);
})

app.get('/api/restaurant_data', async (req, res) => {
    let respo = await restaurant_model.find();
    res.json(respo);
})

app.post("/api/admin/login", async (req, res) => {
    console.log(req.session)
    let { email, password } = req.body;
    let query = admin_model.where({ email: email });
    let value = await query.findOne();
    if (email != "" && password != "") {
        if (value != null) {
            mailid = value.email;
            let pswd = value.password;
            if (pswd == password) {
                res.status(202).json({ message: "Admin logged in." });
            } else {
                res.status(402).json({ message: "Wrong Credentials." });
            }
        } else {
            res.status(402).json({ message: "Wrong Credentials." });
        }
    } else {
        res.status(402).json({ message: "Wrong Credentials." });
    }
})

app.post('/api/restaurant_data/del', async (req, res) => {
    let {id} = req.body;
    try {
        await restaurant_model.deleteOne({ _id: id}).then(async()=>{
                await menu_model.deleteOne({ rid: id}).then(function(){
                    res.json({message: "record deleted"})
                }).catch(function(error){
                    res.json({message: error})
                });
        }).catch(function(error){
            res.json({message: error})
        });; 
    } catch (error) {
        res.json({message:error})
    }
})

app.post('/api/restaurant_data/update', async (req, res) => {
    let {id, current_option, changeVal} = req.body;
    if (current_option == 'name'){
    try {
        await restaurant_model.findOneAndUpdate({ _id: id}, { $set: { "name": changeVal }}).then(async()=>{
            res.json({message: "Name updated."})
        }).catch(function(error){
            res.json({message: error})
        }); 
    } catch (error) {
        res.json({message:error})
    }
    }
    else if (current_option == 'address'){
        try {
            await restaurant_model.findOneAndUpdate({ _id: id}, { $set: { "address": changeVal }}).then(async()=>{
                res.json({message: "Address updated."})
            }).catch(function(error){
                res.json({message: error})
            }); 
        } catch (error) {
            res.json({message:error})
        }
        }
    else{
        res.json({message:"Invalid option"})
    }
})

app.post("/api/user/order_data", async (req, res) => {
    let { email, cart, order_date, fullAddress } = req.body;
    // await cart.splice(0, 0, { order_date: order_date })
    cart.unshift({ order_date: order_date, full_address: fullAddress, status: "ongoing" })
    let query = order_model.where({ email: email });
    let value = await query.findOne();
    if (value === null) {
        try {
            var obj = {
                email: email,
                order: [cart] 
            };
            order_model.create(obj).then(() => {
                res.json({ message: "Order added.", code: 200 })
            })
        } catch (error) {
            console.log(error)
            res.json({ message: error.message })
        }
    } else {
        try {
            await order_model.findOneAndUpdate({ email: email }, { $push: { order: cart } }).then((resp) => {
                res.json({ message: "Order added.", code: 200 })
            })
        } catch (error) {
            console.log(error)
            res.json({ message: error.message })
        }
    }
})

app.post("/api/user/myorder", async (req, res) => {
    let date = []
    let cart_data = []
    try {
        let { email } = req.body;
        let query = order_model.where({ "email": email });
        let value = await query.findOne();
        date.push(value.order.map((val)=>val[0].order_date))
        cart_data.push(value.order.map((val)=>val.splice(1,)))
        // let cart_values = (cart_data[0])
        // let date_values = (date[0])
        let cart_values = (cart_data[0]).reverse()
        let date_values = (date[0]).reverse()
        // console.log(cart_values[0])
        res.json({date_values, cart_values})
    } catch (error) {
        return res.json({ message: error.message })
    }
})

app.post('/api/item/delete', async (req, res) => {
    let {id} = req.body;
    try {
        await menu_model.deleteOne({ _id: id}).then(async()=>{
                res.json({message: "Item deleted", code: 200})
        }).catch(function(error){
            res.json({message: error})
        });
    } catch (error) {
        res.json({message:error})
    }
})

app.post('/api/item/update', async (req, res) => {
    let {id, current_option, changeVal} = req.body;
    if (current_option == 'img'){
    try {
        await menu_model.findOneAndUpdate({ _id: id}, { $set: { "food_image": changeVal }}).then(async()=>{
            res.json({message: "Image updated.", code:200})
        }).catch(function(error){
            res.json({message: error})
        }); 
    } catch (error) {
        res.json({message:error})
    }
    }
    else if (current_option == 'price'){
        try {
            await menu_model.findOneAndUpdate({ _id: id}, { $set: { "food_price": changeVal }}).then(async()=>{
                res.json({message: "Address updated.", code:200})
            }).catch(function(error){
                res.json({message: error})
            }); 
        } catch (error) {
            res.json({message:error})
        }
        }
        else if (current_option == 'name'){
            try {
                await menu_model.findOneAndUpdate({ _id: id}, { $set: { "food_name": changeVal }}).then(async()=>{
                    res.json({message: "Name updated.", code:200})
                }).catch(function(error){
                    res.json({message: error})
                }); 
            } catch (error) {
                res.json({message:error})
            }
            }
    else{
        res.json({message:"Invalid option"})
    }
})

app.post('/api/res/data/conf', async (req, res) => {
    let {i} = req.body;
    let query = restaurant_model.where({ "_id": i });
    let value = await query.findOne();
    res.json(value);
})

app.post('/api/add_delivery_person', function (req, res) {
    const { name, address, email, phone, aadhar_no } = req.body;
    const password = randomstring.generate({
        length: 8,
    })
    console.log(password)
    let encryptedPassword = Crypto.AES.encrypt(password.trim().toString(), GLOBAL_PASS).toString();
    var obj = {
        email: email,
        password: encryptedPassword,
        name: name,
        phone: phone,
        address: address,
        aadhar_no: aadhar_no,
        status: "inactive"
    };
    if (name !== "" && address !== "" && email !== "" && phone !== "" && aadhar_no !== "") {
        var mailOptions = {
            to: email,
            subject: "Welcome to myFood.com Family",
            html: `<h3>Hello ${name}, Now you are a member of myFood.com</h3>` + `<h4>Your login username is your email id and password is</h4>` + "<h1 style='font-weight:bold;'>" + password + "</h1>"
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                res.status(402).json({ message: error });
            } else {
                console.log('Email sent: ' + info.response);
                delivery_model.create(obj);
                res.json({ message: "Person added.", code:200 })
            }
        });
    }
    else {
        res.json({ message: "Invalid input." });
    }
});

app.post("/api/delivery_login", async (req, res) => {
    let { email, password } = req.body;
    let usr_pwd = password;
    let encryptedPass = Crypto.AES.encrypt(usr_pwd.trim().toString(), GLOBAL_PASS).toString();
    let decryptedPass = Crypto.AES.decrypt(encryptedPass, GLOBAL_PASS).toString();
    let encrp = decryptedPass.toString(Crypto.enc.Utf8);
    if (email != "" && password != "") {
        let query = delivery_model.where({ email: email });
        let value = await query.findOne();
        if (value != null) {
            let pswd = value.password;
            let decryptedPwd = Crypto.AES.decrypt(pswd.trim().toString(), GLOBAL_PASS).toString();
            let decrypt = decryptedPwd.toString(Crypto.enc.Utf8);
            console.log(decrypt)
            console.log(encrp)
            if (value.email == email && decrypt == encrp) {
                res.json({id:value._id})
            } else {
                res.json({ message: "Wrong Credentials." });
            }
        } else {
            res.json({ message: "Wrong Credentials." });
        }
    } else {
        res.json({ message: "Wrong Credentials." });
    }
})

app.post("/api/delivery_person/start", async (req, res) => {
    let { id } = req.body;
    if (id != "") {
            try {
                await delivery_model.findOneAndUpdate({ _id: id}, { $set: { "status": "active" }}).then(async()=>{
                    res.json({message: "Active.", code:200})
                }).catch(function(error){
                    res.json({message: error})
                }); 
            } catch (error) {
                res.json({message:error})
            }
        } else {
            res.json({ message: "Failed." });
        }
})

app.post("/api/delivery_person/stop", async (req, res) => {
    let { id } = req.body;
    if (id != "") {
            try {
                await delivery_model.findOneAndUpdate({ _id: id}, { $set: { "status": "inactive" }}).then(async()=>{
                    res.json({message: "Inactive.", code:200})
                }).catch(function(error){
                    res.json({message: error})
                });
            } catch (error) {
                res.json({message:error})
            }
        } else {
            res.json({ message: "Failed." });
        }
})

app.post('/api/delivery_person/status', async (req, res) => {
    let {i} = req.body;
    let query = delivery_model.where({ "_id": i });
    let value = await query.findOne();
    res.json(value);
})
