const mongoose=require("mongoose");
const plm=require("passport-local-mongoose");

mongoose.connect("mongodb+srv://sharmadisha361:6Y1Xwx7nY69kq5kD@cluster0.tuzried.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");

const userSchema=mongoose.Schema({
  username:String,
  name:String,
  email:String,
  password:String,
  profileImage:String,
  contact:Number,
  boards:{
    type:Array,
    default:[],
  },
  posts:[
    {
      type:mongoose.Schema.Types.ObjectId,
      ref:"post",
    }
  ]
});
userSchema.plugin(plm);

module.exports=mongoose.model("user",userSchema);
