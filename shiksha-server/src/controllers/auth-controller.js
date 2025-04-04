import { FileUpload } from "../middlewares/index.js";
import UserRefreshToken from "../models/UserRefreshToken.js";
import UserService from "../services/user-service.js";
import StudentService from "../services/student-service.js";
import InstituteService from "../services/institute-service.js";
import CounselorService from "../services/counselor-service.js";
import { SuccessResponse, ErrorResponse } from "../utils/common/index.js";
import axios from "axios";  
const singleUploader = FileUpload.upload.single("image");

const userService = new UserService();
const instituteService = new InstituteService();
const counselorService = new CounselorService();
const studentService = new StudentService();

//getCountries
export const getCountries = async (req, res) => {
  
    var config = {
      method: 'get',
      url: 'https://api.countrystatecity.in/v1/countries',
      headers: {
        'X-CSCAPI-KEY': process.env.COUNTRY_STATE_CITY_API_KEY
      }
    };

    axios(config)
      .then(function (response) {
        const countries = JSON.stringify(response.data);
        return res.status(200).json({
          success: true,
          message: "Successfully fetched countries",
          data: response.data,
          err: {},
        });
      })
      .catch(function (error) {
        return res.status(500).json({
          message: "Something went wrong",
          data: {},
          success: false,
          err: error.message,
        });
      });
    
    
  
}

//getStates
export const getStatesByCountry = async (req, res) => {
  
  const countryCode = req.body.countryCode;
  var config = {
    method: 'get',
    url: 'https://api.countrystatecity.in/v1/countries/' + countryCode +'/states',
    headers: {
      'X-CSCAPI-KEY': process.env.COUNTRY_STATE_CITY_API_KEY
    }
  };

  axios(config)
    .then(function (response) {
      const states = JSON.stringify(response.data);
      return res.status(200).json({
        success: true,
        message: "Successfully fetched States",
        data: response.data,
        err: {},
      });
    })
    .catch(function (error) {
      return res.status(500).json({
        message: "Something went wrong",
        data: {},
        success: false,
        err: error.message,
      });
    });
    
  
};

//getCitiesByState
export const getCitiesByState = async (req, res) => {
  
    const stateCode = req.body.stateCode;
    const countryCode = req.body.countryCode;

    var config = {
      method: 'get',
      url: 'https://api.countrystatecity.in/v1/countries/' + countryCode +'/states/'+stateCode+'/cities',
      headers: {
        'X-CSCAPI-KEY': process.env.COUNTRY_STATE_CITY_API_KEY
      }
    };

    axios(config)
      .then(function (response) {
        const cities = JSON.stringify(response.data);
        return res.status(200).json({
          success: true,
          message: "Successfully fetched Citites",
          data: response.data,
          err: {},
        });
      })
      .catch(function (error) {
        return res.status(500).json({
          message: "Something went wrong",
          data: {},
          success: false,
          err: error.message,
        });
      });
    
};



//sendOtp 
export async function sendOtp(req, res) {
  try {
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
    if (req.body.contact_number.length !== 10) {

      return res.status(400).json({
        message: "Contact number should be of 10 digits",
        data: {},
        success: false,
        err: {},
      });
    }

    if (req.body.referal_Code) {
      const referalUser = await userService.getUserByReferalCode(req.body.referal_Code);
      if (!referalUser) {
        return res.status(400).json({
          message: "Referal code Invalid",
          data: {},
          success: false,
          err: {},
        });
      }
    }

    var  otp = Math.floor(100000 + Math.random() * 900000);
    const response = await userService.sendOtp(otp, req.body.contact_number);
    if (!response.data.return) 
      return res.status(400).json({
        message: response.data.message,
        data: {},
        success: false,
        err: {},
      });
    SuccessResponse.data = response.data;
    SuccessResponse.message = "Successfully sent OTP";
    return res.status(200).json(SuccessResponse);
  } catch (error) {
    console.log('error in sendOtp',error.message);
    return res.status(500).json({
      message: error.message,
      data: {},
      success: false,
      err: error.message,
    });
  }
}

//verifyOtp
export async function verifyOtp(req, res) {
  try {

    //contact number length check
    if (req.body.contact_number.length !== 10) {

      return res.status(400).json({
        message: "Contact number should be of 10 digits",
        data: {},
        success: false,
        err: {},
      });
    }
    console.log('req.body.otp', req.body.otp.length);
    if (req.body.otp.length !== 6) {

      return res.status(400).json({
        message: "OTP should be of 6 digits",
        data: {},
        success: false,
        err: {},
      });
    }

    const response = await userService.verifyOtp(req.body.otp, req.body.contact_number);
    if (!response){
      return res.status(400).json({
        
        message: "Invalid OTP",
        data: {},
        success: false,
        err: {},
      });
    }
    
    SuccessResponse.message = "Successfully verified OTP";  
    return res.status(200).json(SuccessResponse);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      data: {},
      success: false,
      err: error.message,
    });
  }
}

//getStateCityById
export const getStateCityById = async (req, res) => {

  try {
    const type = req.body.type;
    const stateCity = await userService.getStateCityById(req.params.id, type);
    return res.status(200).json({
      success: true,
      message: "Successfully fetched state and city",
      data: stateCity,
      err: {},
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
      data: {},
      success: false,
      err: error.message,
    });
  }
};


export const signup = async (req, res) => {
  console.log(req.body);
  //req parms refercode

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

    if(req.body.otp.length !== 6){

      return res.status(400).json({
        message: "OTP should be of 6 digits",
        data: {},
        success: false,
        err: {},
      });
    }

    //check otp
    const otpResponse = await userService.verifyOtp(req.body.otp, req.body.contact_number);
    if (!otpResponse){
      return res.status(400).json({
        message: "Invalid OTP",
        data: {},
        success: false,
        err: {},
      });
    }



    var is_verified = true;
    var status = true;
    //generate random referalCode
    var referalCode = Math.random().toString(36).substring(7);
    
    
    if (req.body.role === 'institute'){
      is_verified = true;
      status = true;
    }

    var referdata = {};
    

    if(req.body.referal_Code){
      const referalUser = await userService.getUserByReferalCode(req.body.referal_Code);
      if(!referalUser){
        return res.status(400).json({
          message: "Referal code Invalid",
          data: {},
          success: false,
          err: {},
        });
      }
     
     var referdata = {
        refer_by: referalUser._id,
      };


    }

    




    


    const response = await userService.signup(
      {
        name:req.body.name,
        contact_number:req.body.contact_number,
        email: req.body.email,
        password: req.body.password,
        role: req.body?.role,
        city:req.body.city,
        state:req.body.state,
        country:req.body.country,
        is_verified: is_verified,
        referalCode: referalCode,
      ...referdata  
      },
      res
    );

    const userId = response.user._id;
    if (response.user.role === 'student') {
if(req.body.referal_Code){

  if (req.body.referal_Code) {
    const referalUser = await userService.getUserByReferalCode(req.body.referal_Code);
    if (!referalUser) {
      return res.status(400).json({
        message: "Referal code Invalid",
        data: {},
        success: false,
        err: {},
      });
    }

    console.log('referalUser',referalUser);

    const referalUserResponse = await userService.updateReferalUser(referalUser, userId);
}

}


//save in student table

  const studentPayload = {
    _id: userId,
    name: req.body.name,
    email: req.body.email,
    phone: req.body.contact_number,
    country: req.body.country,
    state: req.body.state,
    city: req.body.city,
  };

const studentResponse = await studentService.create(studentPayload);

    




}


  if(req.body.role === 'institute'){
    
    const institutePayload = {
      instituteName: req.body.name,
      email: req.body.email,
      institutePhone: req.body.contact_number,
      password: req.body.password,
      _id: userId,
      status: status,
      country: req.body.country,
      state: req.body.state,
      city: req.body.city,
    };

    console.log('institutePayload',institutePayload);

    const instituteResponse = await instituteService.create(institutePayload);

  }

    if (req.body.role === 'counsellor') {

      const counsellorpayload = {
        firstname: req.body.name,
        lastname: req.body.name,
        email: req.body.email,
        contactno: req.body.contact_number,
        _id: userId,
        country: req.body.country,
        state: req.body.state,
        city: req.body.city,
      };
    
      const counselorResponse = await counselorService.create(counsellorpayload);

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

//getStatesCities
export const getStatesCities = async (req, res) => {
  try {
    const search = req.query.search;
    const states = await userService.getStatesCities(req.query);
    return res.status(200).json({
      success: true,
      message: "Successfully fetched states and cities",
      data: states,
      err: {},
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
      data: {},
      success: false,
      err: error.message,
    });
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
    console.log('login error',error.message);
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
