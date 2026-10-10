const { check, validationResult } = require("express-validator");
const User = require("../model/user");
const bcrypt = require("bcryptjs");

exports.getLogin =(req,res,next)=>{
    res.render("auth/login",{
        pageTitle: "Login",
        currentPage: "login",
        isLoggedIn: false,
        errors: [],
        oldInput:{
            email:"",
            password:"",
            user: {},
        },
    })
}
exports.getSignup = (req,res,next)=>{
    console.log("SignUp");
    res.render("auth/signup",{
        pageTitle: "Signup",
        currentPage: "signup",
        isLoggedIn: false,
        errors: [],
        oldInput:{
            firstName:"",
            lastName:"",
            email:"",
            userType:"",
            user: {},
        },
    });
}

exports.postSignup = [
    check("firstName")
    .trim()
    .isLength({min: 2})
    .withMessage("First name should be at least 2 characters long")
    .matches(/^[a-zA-Z]+$/)                                // cheak("firstName") should be a string
    .withMessage("First name should only contain letters"),
    
    check("lastName")
    .trim()
    .isLength({min: 2})
    .withMessage("First name should be at least 2 characters long")
    .matches(/^[a-zA-Z]+$/)                                // cheak("firstName") should be a string
    .withMessage("First name should only contain letters"),

    check("email")
    .isEmail()
    .withMessage("Please enter a valid email")
    .normalizeEmail(),

    check("password")
    .isLength({min: 6})
    .withMessage("Password should be at least 6 characters long")
    .matches(/[A-Z]/)
    .withMessage("Password should contain at least one uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password should contain at least one lowercase letter")   
    .matches(/[0-9]/)   
    .withMessage("Password should contain at least one number")
    .matches(/[@$!%*?&]/)
    .withMessage("Password should contain at least one special character")
    .trim(),

    check("confirmPassword")
    .trim()
    .custom((value,{req})=>{
        if(value !== req.body.password){
            throw new Error("Password did not match");
        }
        return true;
    }),

    check("userType")
    .notEmpty()
    .withMessage("Please select a user type")
    .isIn(['guest','host'])
    .withMessage("Please select a valid user type"),

    check("terms")
    .notEmpty()
    .withMessage("Please accept the terms and conditions")
    .custom((value,{req})=>{
        if(value !== "on"){
            throw new Error("Please accept the terms and conditions");
        }
        return true;
    }),
    
    (req,res,next)=>{
    const {firstName,lastName,email,password,userType} = req.body;
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(422).render("auth/signup",{
            pageTitle: "Signup",
            currentPage: "signup",
            isLoggedIn: false,
            errors: errors.array().map(err=> err.msg),
            oldInput:{
                firstName:firstName,
                lastName:lastName,
                email:email,
                password:password,
                userType:userType,
                user: {},
            },
            validationErrors: errors.array(),
        });
    }

    bcrypt.hash(password, 12)
    .then((hashedPassword)=>{
        const user = new User({firstName,lastName,email,password:hashedPassword,userType});
        return user.save();
    }).then(()=>{
        res.redirect("/login");
    })
    .catch((err)=>{
        console.log(err);
        if(err.code === 11000){
            return res.status(422).render("auth/signup",{
                pageTitle: "Signup",
                currentPage: "signup",
                isLoggedIn: false,
                errors: [err.message],
                oldInput:{
                    firstName:firstName,
                    lastName:lastName,
                    email:email,
                    password:password,
                    userType:userType,
                    user: {},
                },
                validationErrors: [{param:"email",msg:"Email already exists"}], 
            });
        }
        res.redirect("/signup");
    });
}];

exports.postLogin = async (req,res,next)=>{
  try {
    const {email,password} = req.body;
    if (!email || !password) return res.status(422).render("auth/login", {
      pageTitle: "Login", currentPage: "login", isLoggedIn: false,
      errors: ["Email and password are required"], oldInput: { email: email || "" }, user: {},
    });
    const user = await User.findOne({email:email});
    if(!user){
        return res.status(422).render("auth/login",{
            pageTitle: "Login",
            currentPage: "login",
            isLoggedIn: false,
            errors: ["User not found"],
            oldInput:{
                email:email,
                // password:password,
            },
            user: {},
        });
    }
    const isMatch = await bcrypt.compare(password,user.password);
    if(!isMatch){
        return res.status(422).render("auth/login",{
        pageTitle: "Login",
        currentPage: "login",
        isLoggedIn: false,
        errors: ["Invalid password"],
        oldInput:{
            email:email,
            // password:password,
        },
        user: req.session.user,
    });
}
    await new Promise((resolve, reject) => req.session.regenerate((err) => err ? reject(err) : resolve()));
    req.session.isLoggedIn = true;
    req.session.user = { _id: user._id, userType: user.userType, firstName: user.firstName };
    await new Promise((resolve, reject) => req.session.save((err) => err ? reject(err) : resolve()));
    res.redirect("/");
  } catch (error) { next(error); }
}


exports.postLogout =(req,res,next)=>{
    console.log("LogOut");
    req.session.destroy(()=>{
        res.redirect("/login");
    })
} 
