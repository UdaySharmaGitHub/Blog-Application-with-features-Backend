import mongoose,{Schema} from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
const userSchema  = new Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trime:true,
        index:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trime:true,
    },
    fullName:{
        type:String,
        required:true,
        trime:true,
        index:true,
    },
    avatar:{
        type:String,  // using the Cloudinary URL
        required:true,
    },
    coverImage:{
        type:String,  // using the Cloudinary URL
    },
    watchhistory:[
        {
            type:Schema.Types.ObjectId,
            ref:"Video",
        }
    ],
    password:{
        type:String,
        required:[true,'Passwod is Required'],
    },
    refreshToken:{
        type:String,
    }
},{timestamps:true});

/*
Using the pre Hooks to encrypt the data before actual storing in the database
userSchema.pre(<Event>)
- validate
- save
- remove
- updateOne
- deleteOne
init (note: init hooks are synchronous)
*/
/*
    JWT Formate
    jwt.sign(payload, secretOrPrivateKey, [options, callback])
*/
userSchema.pre("save",async (next)=>{
    // firstly check the password is changed or not
    if(!this.isModified("password")) return next();
    // bcrypt.hash(data_feild,no_of_rounds)
    this.password = await bcrypt.hash(this.password,10);
    next();
})

//  Custom made method in mongoose
//  to check the password is correct
userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password);
}

// Generate a Access Token in USER Schema
userSchema.methods.generateAccessToken = function(){
    
    return jwt.sign(
        // Writing Payload
        {
        _id:this._id,
        email:this.email,
        username:this.username,
        fullname:this.fullname
    },
    // Secret Key
    process.env.ACCESS_TOKEN_SECRET,
    // Options
    {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
)
    }

// Generate the REFRESH Token in USER Schema
userSchema.methods.generateRefreshToken = function(){
    const token = jwt.sign(
        {
            id:this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    ) 
        return token;
        }

export const User  = mongoose.model("User",userSchema);