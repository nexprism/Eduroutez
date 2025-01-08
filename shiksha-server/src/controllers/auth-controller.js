import { FileUpload } from "../middlewares/index.js";
import UserRefreshToken from "../models/UserRefreshToken.js";
import UserService from "../services/user-service.js";
import InstituteService from "../services/institute-service.js";
const singleUploader = FileUpload.upload.single("image");

const userService = new UserService();
const instituteService = new InstituteService();

export const signup = async (req, res) => {
  console.log(req.body);
  try {
    
    //check email already exists
    const user = await userService.getUserByEmail(req.body.email);
    if (user) {
      return res.status(400).json({
        message: "Email already exists",
        data: {},
        success: false,
        err: {},
      });
    }
    // console.log('user', user);
    //contact number length check
    if(req.body.contact_number.length !== 10){

      return res.status(400).json({
        message: "Contact number should be of 10 digits",
        data: {},
        success: false,
        err: {},
      });
    }




    
    


    const response = await userService.signup(
      {
        name:req.body.name,
        contact_number:req.body.contact_number,
        email: req.body.email,
        password: req.body.password,
        role: req.body?.role,
        city:req.body.city,
        state:req.body.state
      },
      res
    );

    const userId = response.user._id;
  if(req.body.role === 'institute'){
    
    const institutePayload = {
      instituteName: req.body.name,
      email: req.body.email,
      institutePhone: req.body.contact_number,
      password: req.body.password,
      _id: userId,
    };

    console.log('institutePayload',institutePayload);

    const instituteResponse = await instituteService.create(institutePayload);

  }

  
    return res.status(201).json({
      success: true,
      message: "Successfully created a new "+req.body.role,
      data: response,
      err: {},
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Something went wrong",
      data: {},
      success: false,
      err: err,
    });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    // Extract request body parameters
    const { email, otp } = req.body;

    // Check if all required fields are provided
    if (!email || !otp) {
      return res.status(400).json({ status: "failed", message: "All fields are required" });
    }

    await userService.verifyEmail(email, otp);
    return res.status(200).json({ status: "success", message: "Email verified successfully" });
  } catch (error) {
    res.status(500).json({ status: "failed", message: "Unable to verify email, please try again later" });
  }
};

export const login = async (req, res) => {
  try {
    console.log(req.body);
    const token = await userService.signin(req.body, res);
    return res.status(200).json({
      success: true,
      message: "Successfully logged in",
      data: token,
      err: {},
    });
    
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      data: {},
      success: false,
      err: error,
    });
  }
};

export const userProfile = async (req, res) => {
  try {
    const user = req.user;

    return res.status(200).json({
      success: true,
      message: "Successfully fetched the user profile",
      data: user,
      err: {},
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
      data: {},
      success: false,
      err: error,
    });
  }
};

export const logout = async (req, res) => {
  try {
    // Optionally, you can blacklist the refresh token in the database

    const refreshToken = req.cookies.refreshToken || req.headers["x-refresh-token"];
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.clearCookie("is_auth");

    if (refreshToken) {
      await UserRefreshToken.findOneAndDelete({ token: refreshToken });
    }

    res.status(200).json({ status: "success", message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ status: "failed", message: "Unable to logout, please try again later" });
  }
};

export const changeUserPassword = async (req, res) => {
  try {
    const { password, password_confirmation } = req.body;

    // Check if both password and password_confirmation are provided
    if (!password || !password_confirmation) {
      return res.status(400).json({ status: "failed", message: "New Password and Confirm New Password are required" });
    }

    // Check if password and password_confirmation match
    if (password !== password_confirmation) {
      return res.status(400).json({ status: "failed", message: "New Password and Confirm New Password don't match" });
    }
    // above part will be in middleware ^

    // Update user's password
    await userService.changeUserPassword(req.user._id, password);

    // Send success response
    res.status(200).json({ status: "success", message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ status: "failed", message: "Unable to change password, please try again later" });
  }
};

export const sendUserPasswordResetEmail = async (req, res) => {
  try {
    const { email } = req.body;
    // Check if email is provided
    if (!email) {
      return res.status(400).json({ status: "failed", message: "Email field is required" });
    }
    userService.sendUserPasswordResetEmail(email);
    // Send success response
    res.status(200).json({ status: "success", message: "Password reset email sent. Please check your email." });
  } catch (error) {
    res.status(500).json({ status: "failed", message: "Unable to send password reset email. Please try again later." });
  }
};

// Password Reset
export const userPasswordReset = async (req, res) => {
  try {
    const { password, password_confirmation } = req.body;
    const { id, token } = req.params;
    // Check if password and password_confirmation are provided
    if (!password || !password_confirmation) {
      return res.status(400).json({ status: "failed", message: "New Password and Confirm New Password are required" });
    }

    // Check if password and password_confirmation match
    if (password !== password_confirmation) {
      return res.status(400).json({ status: "failed", message: "New Password and Confirm New Password don't match" });
    }
    userService.userPasswordReset(id, token, password, password_confirmation);
    // Send success response
    res.status(200).json({ status: "success", message: "Password reset successfully" });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(400).json({ status: "failed", message: "Token expired. Please request a new password reset link." });
    }
    return res.status(500).json({ status: "failed", message: "Unable to reset password. Please try again later." });
  }
};
