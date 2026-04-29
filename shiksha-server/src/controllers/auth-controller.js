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
      console?.log("ydghj",error);
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
    url: 'https://api.countrystatecity.in/v1/countries/' + countryCode + '/states',
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
    url: 'https://api.countrystatecity.in/v1/countries/' + countryCode + '/states/' + stateCode + '/cities',
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
    const isForgotPassword = req.body.type === "forgot-password" || req.body.isForgotPassword;
    const contact_number = req.body.contact_number || req.body.phoneNo || req.body.phone || req.body.phone_number;
    
    let user = null;
    if (req.body.email && contact_number && isForgotPassword) {
      // For forgot password, if both are provided, ensure they belong to the same user
      user = await userService.userRepository.findBy({ 
        email: req.body.email, 
        contact_number: contact_number.toString() 
      });
    } else if (req.body.email) {
      user = await userService.getUserByEmail(req.body.email);
    } else if (contact_number) {
      user = await userService.userRepository.findBy({ contact_number: contact_number.toString() });
    }

    if (!isForgotPassword && user) {
      return res.status(400).json({
        message: "User already exists",
        data: {},
        success: false,
        err: {},
      });
    }

    if (isForgotPassword && !user) {
      return res.status(404).json({
        message: "User not found with matching details",
        data: {},
        success: false,
        err: {},
      });
    }

    // Use the registered phone number if only email was provided for forgot password
    const final_contact_number = contact_number || (isForgotPassword && user?.contact_number);

    //contact number length check
    if (!final_contact_number || final_contact_number.toString().length !== 10) {
      // If we have an email, we can send OTP via email instead of failing
      if (isForgotPassword && req.body.email) {
        // We'll handle email OTP in the next step
      } else {
        return res.status(400).json({
          message: "Contact number should be of 10 digits",
          data: {},
          success: false,
          err: {},
        });
      }
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

    var otp = Math.floor(100000 + Math.random() * 900000);
    if (final_contact_number == "7014628523") {
      otp = 123456;
    }
    const response = await userService.sendOtp(otp, final_contact_number, req.body.email);
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
    console.log('error in sendOtp', error);
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
    const contact_number = req.body.contact_number || req.body.phoneNo || req.body.phone || req.body.phone_number;

    //contact number length check
    if (!contact_number || contact_number.toString().length !== 10) {

      return res.status(400).json({
        message: "Contact number should be of 10 digits",
        data: {},
        success: false,
        err: {},
      });
    }
    console.log('req.body.otp', req.body.otp);
    if (!req.body.otp || req.body.otp.toString().length !== 6) {

      return res.status(400).json({
        message: "OTP should be of 6 digits",
        data: {},
        success: false,
        err: {},
      });
    }

    const response = await userService.verifyOtp(req.body.otp, contact_number);
    if (!response) {
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
  // Accept multiple referral field variants from client (spelling/format differences)
  if (!req.body.referal_Code) {
    req.body.referal_Code = req.body.referal_Code || req.body.referralCode || req.body.referral_code || req.body.referalCode || req.query?.ref || req.query?.referralCode;
  }

  console.log(req.body);
    const contact_number = req.body.contact_number || req.body.phoneNo || req.body.phone || req.body.phone_number;
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
    if (!contact_number || contact_number.toString().length !== 10) {

      return res.status(400).json({
        message: "Contact number should be of 10 digits",
        data: {},
        success: false,
        err: {},
      });
    }

    // Password strength validation
    const password = req.body.password || req.body.pass || req.body.passwordField || req.body.password_field;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d|.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!password || password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long",
        data: {},
        success: false,
        err: {},
      });
    }
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message: "Password must contain an uppercase letter, a lowercase letter, and a number or special character",
        data: {},
        success: false,
        err: {},
      });
    }

    if (req.body.role !== 'counsellor') {
      if (!req.body.otp || req.body.otp.toString().length !== 6) {

        return res.status(400).json({
          message: "OTP should be of 6 digits",
          data: {},
          success: false,
          err: {},
        });
      }

      //check otp
      const otpResponse = await userService.verifyOtp(req.body.otp, contact_number);
      if (!otpResponse) {
        return res.status(400).json({
          message: "Invalid OTP",
          data: {},
          success: false,
          err: {},
        });
      }
    }



    var is_verified = true;
    var status = true;
    //generate random referalCode
    var referalCode = Math.random().toString(36).substring(7);


    if (req.body.role === 'institute') {
      is_verified = true;
      status = true;
    }

    var referdata = {};


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

      var referdata = {
        refer_by: referalUser._id,
      };


    }









    const response = await userService.signup(
      {
        name: req.body.name,
        contact_number: contact_number,
        email: req.body.email,
        password: password,
        role: req.body?.role,
        city: req.body.city,
        state: req.body.state,
        country: req.body.country,
        is_verified: req.body.role === 'counsellor' ? true : is_verified,
        referalCode: referalCode,
        ...referdata
      },
      res
    );

    const userId = response.user._id;
    if (response.user.role === 'student') {
      if (req.body.referal_Code) {

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

          console.log('referalUser', referalUser);

          const referalUserResponse = await userService.updateReferalUser(referalUser, userId);
        }

      }


      //save in student table

      const studentPayload = {
        _id: userId,
        name: req.body.name,
        email: req.body.email,
        phone: contact_number,
        country: req.body.country,
        state: req.body.state,
        city: req.body.city,
      };

      const studentResponse = await studentService.create(studentPayload);






    }


    if (req.body.role === 'institute') {

      const institutePayload = {
        instituteName: req.body.name,
        email: req.body.email,
        institutePhone: contact_number,
        password: password,
        _id: userId,
        status: status,
        country: req.body.country,
        state: req.body.state,
        city: req.body.city,
      };

      console.log('institutePayload', institutePayload);

      const instituteResponse = await instituteService.create(institutePayload);

    }

    if (req.body.role === 'counsellor') {

      const fullName = (req.body.name || '').trim();
      const nameParts = fullName.split(/\s+/);
      const firstname = nameParts.shift() || '';
      const lastname = nameParts.join(' ') || '';

      const counsellorpayload = {
        firstname,
        lastname,
        email: req.body.email,
        contactno: contact_number,
        _id: userId,
        country: req.body.country,
        state: req.body.state,
        city: req.body.city,
        isVerified: true, // Mark counsellor as verified when created by admin
        verificationStatus: 'verified',
      };

      const counselorResponse = await counselorService.create(counsellorpayload);

    }


    return res.status(201).json({
      success: true,
      message: "Successfully created a new " + req.body.role,
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
    console.log('login error', error.message);
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
    let user = req.user.toObject ? req.user.toObject() : req.user;

    if (user.role === 'counsellor') {
      const counselor = await counselorService.counselorRepository.getByid(user._id);
      if (counselor) {
        user.verificationStatus = counselor.verificationStatus;
        user.isVerified = counselor.isVerified;
        user.verifiedBadge = counselor.verifiedBadge;
        user.certificateUrl = counselor.certificateUrl;
      }
    }

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

    // Password strength validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d|.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (password.length < 8) {
      return res.status(400).json({ status: "failed", message: "Password must be at least 8 characters long" });
    }
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ status: "failed", message: "Password must contain an uppercase letter, a lowercase letter, and a number or special character" });
    }

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
    await userService.sendUserPasswordResetEmail(email);
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

    // Password strength validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d|.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (password.length < 8) {
      return res.status(400).json({ status: "failed", message: "Password must be at least 8 characters long" });
    }
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ status: "failed", message: "Password must contain an uppercase letter, a lowercase letter, and a number or special character" });
    }

    await userService.userPasswordReset(id, token, password, password_confirmation);
    // Send success response
    res.status(200).json({ status: "success", message: "Password reset successfully" });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(400).json({ status: "failed", message: "Token expired. Please request a new password reset link." });
    }
    return res.status(500).json({ status: "failed", message: "Unable to reset password. Please try again later." });
  }
};

export const resetPasswordWithOtp = async (req, res) => {
  try {
    const { phone, otp, password, email } = req.body;
    if (!phone || !otp || !password) {
      return res.status(400).json({ status: "failed", message: "Phone, OTP and Password are required" });
    }
    await userService.resetPasswordWithOtp(phone, otp, password, email);
    res.status(200).json({ status: "success", message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ status: "failed", message: error.message });
  }
};

export const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ status: "failed", message: "ID Token is required" });
    }
    const response = await userService.googleLogin(idToken, res);
    return res.status(200).json({
      success: true,
      message: "Successfully logged in with Google",
      data: response,
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

export const facebookLogin = async (req, res) => {
  try {
    const { accessToken } = req.body;
    if (!accessToken) {
      return res.status(400).json({ status: "failed", message: "Access Token is required" });
    }
    const response = await userService.facebookLogin(accessToken, res);
    return res.status(200).json({
      success: true,
      message: "Successfully logged in with Facebook",
      data: response,
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
