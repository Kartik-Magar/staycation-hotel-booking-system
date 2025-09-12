// Error 404
const pageNotFound  = (req,res,next)=>{
    res.status(404).render('404',{pageTitle: 'Page Not Found',
        currentPage: '404',
        isLoggedIn: req.session.isLoggedIn,
        user: req.session.user,
    });   
};

module.exports = {pageNotFound};

// exports.errorsController = {
//     pageNotFound
// };