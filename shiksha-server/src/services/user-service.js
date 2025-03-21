import { ServerConfig } from "../config/index.js";
import { EmailVerificationRepository, UserRepository } from "../repository/index.js";
import { sendEmail } from "../utils/Email/email.js";
import { Token } from "../utils/index.js";
import bcrypt from "bcrypt";
import axios from "axios";
import NodeCache from "node-cache";
const otpCache = new NodeCache({ stdTTL: 90 }); // OTP expires in 90 seconds


class UserService {
  constructor() {
    this.userRepository = new UserRepository();
    this.emailVerificationRepository = new EmailVerificationRepository();
  }

  hashPassword(password) {
    const salt = bcrypt.genSaltSync(+ServerConfig.SALT);
    const hashedPassword = bcrypt.hashSync(password, salt);
    return hashedPassword;
  }
  compare(plainPassword, hashedPassword) {
    return bcrypt.compareSync(plainPassword, hashedPassword);
  }

  async getUserByEmail(email) {
    try {
      const user = await this.userRepository.findBy({ email });
      return user;
    } catch (error) {
      throw error;
    }
  }

  //getStatesCities
  async getStatesCities(query) {
    try {
      
      //get state cities with search query
      const { search } = query;
      const states = await this.userRepository.getStatesCities(search);
      return states;
      
    } catch (error) {
      throw error;
    }
  }




  //getStates
  async getStates() {
    try {
      const states = await this.userRepository.getStates();
      return states;
    } catch (error) {
      throw error;
    }
  }


  //getCitiesByState
  async getCitiesByState(stateId) {
    try {
      const cities = await this.userRepository.getCityByState(stateId);
      return cities;
    } catch (error) {
      throw error;
    }

  }



  //getbyid
  async getUserById(id) {
    try {
      console.log('id',id);
      const user = await this.userRepository.getById(id);
      
      return user;
    } catch (error) {
      throw error;
    }
  }
  

  async signup(data, res) {
    try {
      console.log('data',data)
      data.password = this.hashPassword(data.password);
      const user = await this.userRepository.create(data);
      console.log('user',user)
      const { accessToken, refreshToken, accessTokenExp, refreshTokenExp } = await Token.generateTokens(user);
      Token.setTokensCookies(res, accessToken, refreshToken, accessTokenExp, refreshTokenExp);

      return { accessToken, refreshToken, accessTokenExp, refreshTokenExp, user };
    } catch (error) {
      console.log(error.message)

      throw error;
    }
  }

  //saveotp
  async saveOtp(otp,phone) {
    try {
      //save otp in node cache
      otpCache.set(phone,otp);
      return otp;
    } catch (error) {
      throw error;
    }
  }

  //getStateCityById
  async getStateCityById(id,type) {
    try {
      const stateCity = await this.userRepository.getStateCityById(id,type);
      return stateCity;
    } catch (error) {
      throw error;
    }
  }

  //verifyOtp
  async verifyOtp(otp,phone) {
    try {
      // console.log('phone',phone)
      // const cacheOtps = otpCache.set(phone,otp);
      // console.log('set cacheOtps',cacheOtps)
      //get all otpcache
      // console.log('otpCache',otpCache)

      if (otpCache.data){
        var cache_Otp = otpCache.get(phone);
      
      
      console.log('otp', otp)
      console.log('cacheOtp', cache_Otp)
      if (otp == cache_Otp){
        return true;
      }else{
        return false;

      }
    }else{
      return false;
    }
    } catch (error) {
      throw error;
    }
  }

  //sendOtp
  async sendOtp(otp,phone) {
    try {

      var sender_id = 'Edurtz';
      var message = '179135';
      var variables_values = otp;
      var route = 'dlt';
      var numbers = phone;
      var schedule_time = "";
      var url = 'https://www.fast2sms.com/dev/bulkV2?authorization=' + process.env.FAST2SMS_API_KEY +'&route='+route+'&sender_id='+sender_id+'&message='+message+'&variables_values='+variables_values+'&numbers='+numbers+'&schedule_time='+schedule_time;
      const response = await axios.get(url);
      if(response.data.return === true){
        //save otp in node cache
        this.saveOtp(otp,phone);
        console.log('otp sent successfully',otp)

      }
      return response;
    } catch (error) {
      throw error;
    }
  }

      


  //getUserByReferalCode
  async getUserByReferalCode(referalCode) {
    try {
      const user = await this.userRepository.findBy({ referalCode });
      return user;
    } catch (error) {
      throw error;
    }
  }
  

  ////update referalUser my_referrals
  async updateReferalUser(referalUser, userId) {
    try {
      const my_referrals = [];
      if (referalUser.my_referrals) {
        my_referrals.push(userId);
      }

      const referdata = {
        my_referrals: my_referrals,
        points: referalUser.points + 50,
      };

      const referalUserPayload = {  ...referdata };

      // console.log('referalUserPayload',referalUserPayload)

      const referalUserResponse = await this.userRepository.update(referalUser._id, referalUserPayload);

      return referalUserResponse;
    } catch (error) {
      throw error;
    }
  }

  

  async verifyEmail(email, otp) {
    const existingUser = await this.userRepository.getUserByEmail(email);

    // Check if email doesn't exists
    if (!existingUser) {
      return res.status(404).json({ status: "failed", message: "Email doesn't exists" });
    }

    // Check if email is already verified
    if (existingUser.is_verified) {
      return res.status(400).json({ status: "failed", message: "Email is already verified" });
    }

    // Check if there is a matching email verification OTP
    const emailVerification = await this.emailVerificationRepository.findBy({ userId: existingUser._id, otp });
    // const emailVerification = await EmailVerification.findOne({ userId: existingUser._id, otp });
    if (!emailVerification) {
      if (!existingUser.is_verified) {
        const otp = Math.floor(100000 + Math.random() * 900000);
        await this.emailVerificationRepository.create({ userId: existingUser._id, otp });

        await sendEmailVerificationOTP(req, existingUser);
        return res.status(400).json({ status: "failed", message: "Invalid OTP, new OTP sent to your email" });
      }
      return res.status(400).json({ status: "failed", message: "Invalid OTP" });
    }

    // Check if OTP is expired
    const currentTime = new Date();
    // 15 * 60 * 1000 calculates the expiration period in milliseconds(15 minutes).
    const expirationTime = new Date(emailVerification.createdAt.getTime() + 15 * 60 * 1000);
    if (currentTime > expirationTime) {
      // OTP expired, send new OTP
      await sendEmailVerificationOTP(req, existingUser);
      return res.status(400).json({ status: "failed", message: "OTP expired, new OTP sent to your email" });
    }

    // OTP is valid and not expired, mark email as verified
    existingUser.is_verified = true;
    await existingUser.save();

    // Delete email verification document
    await EmailVerification.deleteMany({ userId: existingUser._id });
  }

  async signin(data, res) {
    try {
      const user = await this.getUserByEmail(data.email);
      if (!user) {
        throw {
          message: "no user found",
        };
      }
      if (!this.compare(data.password, user.password)) {
        throw {
          message: "incorrect password",
        };
      }

      //check is_verified or not
      if (!user.is_verified) {
        throw {
          message: "Your Account is not Activated", 
        };
      }

      



      const { accessToken, refreshToken, accessTokenExp, refreshTokenExp } = await Token.generateTokens(user);

      Token.setTokensCookies(res, accessToken, refreshToken, accessTokenExp, refreshTokenExp);

      return { accessToken, refreshToken, accessTokenExp, refreshTokenExp, user };
    } catch (error) {
      throw error;
    }
  }

  async changeUserPassword(id, password) {
    try {
      const newHashPassword = this.hashPassword(password);
      await this.userRepository.update(id, { password: newHashPassword });
    } catch (error) {
      throw error;
    }
  }
  async sendUserPasswordResetEmail(email) {
    try {
      const user = await this.getUserByEmail(email);

      if (!user) {
        return res.status(404).json({ status: "failed", message: "Email doesn't exist" });
      }
      // Generate token for password reset
      const token = await Token.generateTokenForResetPassword(user);
      // Reset Link
      const resetLink = `${process.env.FRONTEND_HOST}/account/reset-password-confirm/${user._id}/${token}`;

      // Send password reset email
      sendEmail(user.email, "Password Reset", `<p>Hello ${user.name},</p><p>Please <a href="${resetLink}">click here</a> to reset your password.</p>`);
    } catch (error) {
      throw error;
    }
  }

  async userPasswordReset(id, token, password) {
    try {
      // Find user by ID
      const user = this.userRepository.get(id);
      if (!user) {
        return res.status(404).json({ status: "failed", message: "User not found" });
      }

      Token.verifyResetToken(token);

      const hashedPassword = this.hashPassword(password);

      await this.userRepository.update(id, { password: hashedPassword });
    } catch (error) {
      throw error;
    }
  }
}

export default UserService;
