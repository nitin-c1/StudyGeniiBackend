import bcrypt from  "bcrypt"
import mongoose from "mongoose";


const  userSchema = new  mongoose.Schema({
 username : {
        type: String,
        required : true,
        trim : true
    },
     email : {
        type: String,
        required : true,
        trim : true,

        unique : true
    },
     password : {
        type: String,
        required : true,
        trim : true,
        minlength : 6
    },
    role : {
        type: String,
        enum : ["student", "teacher"],
        default : "student"
    }
})

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;