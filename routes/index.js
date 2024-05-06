var express = require('express');
var router = express.Router();
const userModel=require("./users");
const passport = require('passport');
const localStrategy=require('passport-local');
const upload = require('./multer');

passport.use(new localStrategy(userModel.authenticate()));
router.get('/', function(req, res, next) {
  res.render('index');
});
router.get('/register', function(req, res, next) {
  res.render('register');
});
router.get('/profile',isLoggedIn, async function(req, res, next) {
  const user=await userModel.findOne({username:req.session.passport.user});
  res.render('profile',{user});
});
router.post('/register',function(req,res){
  const data=new userModel({
    username:req.body.username,
    email:req.body.email,
    contact:req.body.contact, 
    name:req.body.name,
  })
  userModel.register(data,req.body.password)
  .then(function(){
    passport.authenticate("local")(req,res,function(){
      res.redirect("/profile");
    })
  })
})
router.post('/login',passport.authenticate("local",{
  failureRedirect:"/",
  successRedirect:"/profile",
}),function(req,res,next){
});

router.get("/logout",function(req,res,next){
  req.logout(function(err){
    if(err){return next(err);}
    res.redirect("/");
  });
})
router.post('/fileupload',isLoggedIn,upload.single("image"),async function(req,res){
  const user=await userModel.findOne({username:req.session.passport.user});
  user.profileImage=req.file.filename;
  await user.save();
  res.redirect("/profile");
})
function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect("/");
}

module.exports = router;
