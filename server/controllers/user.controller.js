import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";
import { deleteMediaFromCloudinary, uploadMedia } from "../utils/cloudinary.js";

export const register = async (req, res) => {
  try {
    let { name, email, password } = req.body;
    //check if something is not present:
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "all fiels are required",
      });
    }

    //check if user is already signup
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        message: "user already exists with these fields",
      });
    }

    //data saved in db -- hash pwd to prevent hacker attack
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      name,
      email,
      password: hashedPassword,
    });

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to Register",
    });
  }
};

export const login = async (req, res) => {
  try {
    let { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required to Login",
      });
    }

    //check if user exits with the id
    const user = await User.findOne({email});
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Incorrect email or password",
      });
    }

    //if user exists then chech entered right password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect email or password",
      });
    }
    //generating tokens so that login for 1day etc functionality can be achieved.
    generateToken(res, user, `Welcome back ${user.name}`);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to Login",
    });
  }
};

export const logout = async (req, res) => {
  try {
    //cookie empty krdi cookie dlt krte hi logout since token based login tha
    res.status(200).cookie("token", "", { maxAge: 0 }).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to logout",
    });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const userId = req.id;
    const user = await User.findById(userId).select("-password").populate("enrolledCourses");
    if (!user) {
      return res.status(404).json({
        message: "Profile not found",
        success: false,
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to load user",
    });
  }
};


export const updateProfile = async (req,res)=>{
  try {
    const userId = req.id;
    const {name} = req.body;
    const profilePhoto = req.file;
    
    const user = await User.findById(userId);
    if(!user){
      return res.status(404).json({
        success: false,
        message: "User not found"
      })
    }
    //extract the public id of the old image from the url if it exists
    if(user.photoUrl){
      const publicId = user.photoUrl.split("/").pop().split(".")[0];   //extracting public id
      deleteMediaFromCloudinary(publicId);
    }

    //upload new photo
    const cloudResponse = await uploadMedia(profilePhoto.path);
    const photoUrl = cloudResponse.secure_url;

    const updatedData = {name, photoUrl};
    const updatedUser = await User.findByIdAndUpdate(userId, updatedData, {new: true}).select("-password");   //password nhi chahiye tha isliye -password
    return res.status(200).json({
      success: true,
      user: updatedUser,
      message: "Profile updated sucessfully"
    })
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to update profile",
      success: false
    })
  }
}
