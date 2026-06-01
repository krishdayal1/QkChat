import { generateToken } from "../lib/utilis.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";
import { sendEmail} from "../lib/sendEmail.js";

export const signup = async (req,res) => {
    const {fullName,email,password} = req.body;
    try {

        if(!fullName || !email || !password){
            return res.status(400).json({message: "All fields are required"});
        }

        if(password.length < 6){
            return res.status(400).json({ message: "Password must be at least 6 characters"})
        }
        
        const existingUser = await User.findOne({email});

        const salt = await bcrypt.genSalt(10);

        const hashedPassword = await bcrypt.hash(password, salt);

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        if(existingUser && existingUser.isVerified) {
            return res.status(400).json({ message: "Email already exists"});
        }

        if(existingUser && !existingUser.isVerified) {
            existingUser.fullName = fullName;
            existingUser.password = hashedPassword;
            existingUser.otp = otp;
            existingUser.otpExpiry = Date.now() + 5 * 60 * 1000;

            await existingUser.save();
            await sendEmail(
            email,
            "Verify your email of ChatToMax",
            `Your OTP for email verification is ${otp}. It will expire in 5 minutes.`
        );

        return res.status(200).json({
            message: "Account already exists but is not verified. New OTP sent"
        });
    }
     // Creating new user
    const newUser = new User({
        fullName,
        email,
        password: hashedPassword,
        otp,
        otpExpiry: Date.now() + 5 * 60 * 1000,
    })

    await newUser.save();

    await sendEmail(
        email,
        "Verify Your email of ChatToMax",
        `Your OTP for email verification is ${otp}. It will expire in 5 minutes`
    )

    return res.status(201).json({
        message: "OTP sent to your email"
    });

} catch (error) {
        console.error("Error in signup controller", error.message);
        res.status(500).json({message: "Internal Server Error"});
    }
};

export const login = async (req,res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });

        if(!user){
            return res.status(400).json({ message: "Invalid credentials"});
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if(!isPasswordCorrect){
            return res.status(400).json({ message: "Invalid credentials"});
        }

        if(!user.isVerified){
            return res.status(400).json({
                message: "please verify your email first"
            })
        }

        generateToken(user.id, res);

        res.status(200).json({
            _id: user.id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic,
        })
    } catch (error) {
        console.error("Error in login controller", error.message);
        res.status(500).json({ message: "Internal Server Error"});
    }
};

export const logout = (req,res) => {
    try {
        res.cookie("jwt", "", { maxAge: 0 });
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.error("Error in logout controller", error.message);
        res.status(500).json({ message: "Internal Server Error"});
    }
};


export const updateProfile = async (req, res) => {
    try {
        const { profilePic } = req.body;
        const userId = req.user._id;

        if(!profilePic){
            return res.status(400).json({ message: "Profile pic is required" });
        }

        const uploadResponse = await cloudinary.uploader.upload(profilePic);
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { profilePic: uploadResponse.secure_url},
            { new: true}
        );

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error("error in update profile", error)
        res.status(500).json({ message: "Internal Server Error"});
    }
};

export const checkAuth = (req, res) => {
    try {
        res.status(200).json(req.user);  
    } catch (error) {
        console.error("Error in checkAuth controller", error.message);
        res.status(500).json({ message: "Internal Server Error"});
    }
}

export const verifyOtp = async (req,res) => {
    try{
        const { email, otp } = req.body;

        const user = await User.findOne({ email });
        
        if(!user){
            return res.status(400).json({ message: "User not found"});
        };

        if(user.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP"});
        };

        if(user.otpExpiry < Date.now()) {
            return res.status(400).json({ message: "OTP Expired"});
        };

        user.isVerified = true;

        user.otp = null;
        user.otpExpiry = null;

        await user.save();

        generateToken(user._id, res);

        res.status(200).json({
            message: "Email Verified successfully",

            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic,
        });

    } catch(error) {
        console.error("Error in verifyOtp Controller", error.message);

        res.status(500).json({message: "Internal Server Error"})
    }
}

export const resendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });

        if(!user){
            return res.status(400).json({ message: "User not found"});
        }

        const otp = Math.floor( 100000 + Math.random() * 900000).toString();

        user.otp = otp;

        user.otpExpiry = Date.now() + 5 * 60 * 1000;

        await user.save();

        await sendEmail(
            email, 
            "Resend Otp of ChatToMax",
            `Your OTP for email verification is ${otp}. It will expire in 5 minutes.`
        );

        return res.status(200).json({ message: "OTP resent successfully"});
    } catch (error) {
        console.error("Error in resendOtp controller", error.message);
        res.status(500).json({ message: "Internal server error"});
    }
};
