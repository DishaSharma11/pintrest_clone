var express = require('express');
var router = express.Router();
const userModel=require("./users");
const passport = require('passport');
const localStrategy=require('passport-local');
const upload = require('./multer');
const axios = require('axios');
const postModel=require("./post");

passport.use(new localStrategy(userModel.authenticate()));
router.get('/', function(req, res, next) {
  res.render('index');
});
router.get('/register', function(req, res, next) {
  res.render('register');
});
router.get('/profile',isLoggedIn, async function(req, res, next) {
  const user=await userModel.findOne({username:req.session.passport.user}).populate("posts");
  res.render('profile',{user});
});
router.get('/show/posts',isLoggedIn, async function(req, res, next) {
  const user=await userModel.findOne({username:req.session.passport.user}).populate("posts");
  res.render('show',{user});
});
router.post('/register',async function(req,res){
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
router.get('/add',isLoggedIn,async (req,res)=>{
  const user=await userModel.findOne({username:req.session.passport.user});
  res.render('add',{user});
})
router.post('/createpost',isLoggedIn,upload.single("postimage"), async function(req,res){
  const user=await userModel.findOne({username:req.session.passport.user});
  const post=await postModel.create({
    user:user._id,
    title:req.body.title,
    description:req.body.description,
    image:req.file.filename
  });
  user.posts.push(post._id);
  await user.save();
  res.redirect("/profile");
})
router.get('/feed',isLoggedIn, async (req, res) => {
  const user=await userModel.findOne({username:req.session.passport.user});
  const posts=await postModel.find().populate("user");
  try {
    const response = await axios.get('https://api.unsplash.com/photos/random/?client_id=LQlW5hwSfX3MIRdCvt9wXIwG2pBWO94kqIC8VKtsoNM&count=28');
    const imageData = response.data;
    const imageUrls = imageData.map(image => image.urls.regular);
    res.render('feed', { imageUrls,user,posts });
  } catch (error) {
    console.error('Error fetching random images:', error);
    res.status(500).send('Error fetching random images');
  }
});

router.post('/fileupload',isLoggedIn,upload.single("image"),async function(req,res){
  const user=await userModel.findOne({username:req.session.passport.user});
  user.profileImage=req.file.filename;
  await user.save();
  res.redirect("/profile");
})

router.get('/edit', isLoggedIn, async (req, res) => {
    const user = await userModel.findOne({ username: req.session.passport.user });
    res.render('edit', { user });
});

router.post('/edit', isLoggedIn, async (req, res) => {
    const user = await userModel.findOne({ username: req.session.passport.user });
    user.name = req.body.name;
    user.email = req.body.email;
    user.contact = req.body.contact;
    user.username=req.body.username;
    await user.save();
    res.redirect('/profile');
});

function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect("/");
}

module.exports = router;
