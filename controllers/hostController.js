// local module
const Home=  require('../model/home');
const fs = require('fs');

// hostRouter
const getAddHome = (req,res,next)=>{
    res.render('host/edit-home',{pageTitle: 'Add Home to Airbnb',
        currentPage: 'addHome',
        editing: false,
        isLoggedIn: req.session.isLoggedIn,
        user: req.session.user,
    });  
}

const getEditHome =(req,res,next)=>{
    const homeId = req.params.homeId
    const editing = req.query.editing === "true";

    Home.findById(homeId).then(home => {
        if(!home){
            console.log("Home not found for edit");
            return res.redirect("/host/host-home-list");
        }
        
    console.log(homeId, editing,home)
    res.render('host/edit-home',{
        home: home,
        pageTitle: 'Edit Your Home Details',
        currentPage: 'host-homes',
        editing: editing,
        isLoggedIn: req.session.isLoggedIn,
        user: req.session.user,
    }); 

    }); 
}

const getHostHomes = async (req, res, next) => {
    try {
        const registerHomes = await Home.find(); // Wait for data
        res.render('host/host-home-list', {
            registerHomes: registerHomes,    
            pageTitle: 'Host home list',
            currentPage: 'host-homes',
            isLoggedIn: req.session.isLoggedIn,
            user: req.session.user,
        });
    } catch (error) {
        console.error("Error fetching homes:", error);
        res.status(500).send("Error fetching homes");
    }
    console.log(req.url, req.method);
};


const postAddHome = async (req,res,next)=>{

    console.log("Request Body:", req.body);

    const {houseName, price, location, rating,description} = req.body;
    
    if(!req.file){
        return res.status(422).send("File not found");
    }
    const photo = req.file.path;
    const home = new Home({houseName, price, location, rating, photo, description});
    console.log(req.file);
    await home.save();
    console.log("Home save successefully");
    res.redirect('/host/host-home-list');    

//     home.save()
//         .then(() => {
//             console.log("Home saved successfully");
//             res.redirect('/host/host-home-list');
//         })
};

const postEditHome = async (req, res, next) => {
    try {
        const { id, houseName, price, location, rating, description } = req.body;
        const home = await Home.findById(id);

        if (!home) {
            console.error("Home not found");
            return res.status(404).json({ error: "Home not found" });
        }

        home.houseName = houseName;
        home.price = price;
        home.location = location;
        home.rating = rating;
        home.description = description;

        if (req.file) {
            fs.unlink(home.photo, (err) => {
                if (err) {
                    console.error("Error deleting old photo:", err);
                }
            });
            home.photo = req.file.path;
        }

        await home.save();
        console.log("Home updated successfully:", home);
        res.redirect("/host/host-home-list");

    } catch (error) {
        console.error("Error while updating:", error);
        res.status(500).json({ error: "Error updating home" });
    }
};


const postDeleteHome = (req,res,next)=>{
const homeId = req.params.homeId;
console.log("Came to delete home Id:",homeId);
Home.findByIdAndDelete(homeId).then((err)=>{
    if(err){
        console.log("error came while Deleting: ",err);
    }
    res.redirect('/host/host-home-list');    
})
};


module.exports ={getAddHome, postAddHome,getHostHomes,getEditHome,postEditHome,postDeleteHome};

// exports.homesController = {               if we exports like this we have to import them {homesController} =require('../controllers/homes').gethomes or .postAddHome
//     getAddHome,
//     postAddHome,
//     getHomes,
// };
// exports.registerHomes = registerHomes;     {We Dont have exports registerhome because we are using it in this folder only}
