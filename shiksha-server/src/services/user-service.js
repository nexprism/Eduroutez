import { ServerConfig } from "../config/index.js";
import { OAuth2Client } from "google-auth-library";
import { EmailVerificationRepository, UserRepository, CounselorRepository } from "../repository/index.js";
import { sendEmail } from "../utils/Email/email.js";
import { Token } from "../utils/index.js";
import bcrypt from "bcrypt";
import axios from "axios";
import randomstring from "randomstring";
import NodeCache from "node-cache";
const otpCache = new NodeCache({ stdTTL: 90 }); // OTP expires in 90 seconds


class UserService {
  constructor() {
    this.userRepository = new UserRepository();
    this.emailVerificationRepository = new EmailVerificationRepository();
    this.counselorRepository = new CounselorRepository();
    this.googleClient = new OAuth2Client(ServerConfig.GOOGLE_CLIENT_ID);
  }

  generateRandomPassword(length = 16) {
    return randomstring.generate(length);
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
      console.log('id', id);
      const user = await this.userRepository.getById(id);
      if (!user) return null;

      let userObj = user.toObject ? user.toObject() : user;

      const counselor = await this.counselorRepository.getByid(userObj._id);
      if (counselor) {
        // Only set role to counsellor if counselor is verified
        if (counselor.isVerified === true && userObj.role !== 'counsellor' && userObj.role !== 'admin' && userObj.role !== 'SUPER_ADMIN') {
          await this.userRepository.update(userObj._id, { role: 'counsellor', level: 'Career Advisor' });
          userObj.role = 'counsellor';
          userObj.level = 'Career Advisor';
        }

        userObj.verificationStatus = counselor.verificationStatus;
        userObj.isVerified = counselor.isVerified;
        userObj.verifiedBadge = counselor.verifiedBadge;
        userObj.certificateUrl = counselor.certificateUrl;
      }

      return userObj;
    } catch (error) {
      throw error;
    }
  }


  async signup(data, res) {
    try {
      console.log('data', data)
      data.password = this.hashPassword(data.password);
      const user = await this.userRepository.create(data);
      console.log('user', user)
      const { accessToken, refreshToken, accessTokenExp, refreshTokenExp } = await Token.generateTokens(user);
      Token.setTokensCookies(res, accessToken, refreshToken, accessTokenExp, refreshTokenExp);

      return { accessToken, refreshToken, accessTokenExp, refreshTokenExp, user };
    } catch (error) {
      console.log(error.message)

      throw error;
    }
  }

  //saveotp
  async saveOtp(otp, phone) {
    try {
      //save otp in node cache
      // normalize key and set explicit TTL to avoid relying solely on global default
      const key = phone?.toString().trim();
      const ttlSeconds = 90; // keep in sync with otpCache default
      otpCache.set(key, otp, ttlSeconds);
      return otp;
    } catch (error) {
      throw error;
    }
  }

  //getStateCityById
  async getStateCityById(id, type) {
    try {
      const stateCity = await this.userRepository.getStateCityById(id, type);
      return stateCity;
    } catch (error) {
      throw error;
    }
  }

  //verifyOtp
  async verifyOtp(otp, phone) {
    try {
      const key = phone?.toString().trim();
      const cache_Otp = otpCache.get(key);

      console.log('Verifying OTP - Provided:', otp, 'Cached:', cache_Otp, 'Phone:', key);

      // If there's no cached OTP the value is expired or never set
      if (!cache_Otp) {
        console.log('OTP not found or expired for', key);
        return false;
      }

      // Check TTL explicitly (defensive) and reject if expired
      const ttl = otpCache.getTtl(key); // returns timestamp in ms or undefined
      if (!ttl || Date.now() > ttl) {
        otpCache.del(key);
        console.log('OTP expired for', key);
        return false;
      }

      // Match and consume OTP to prevent reuse
      if (otp.toString() === cache_Otp.toString()) {
        otpCache.del(key);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error in verifyOtp:', error);
      throw error;
    }
  }

  //sendOtp
  async sendOtp(otp, phone, email = null) {
    try {
      let smsResponse = { data: { return: false, message: "SMS not sent" } };
      let emailSent = false;

      // 1. Send SMS if phone is available
      if (phone) {
        var sender_id = 'Edurtz';
        var message = '179135';
        var variables_values = otp;
        var route = 'dlt';
        var numbers = phone;
        var schedule_time = "";
        var url = 'https://www.fast2sms.com/dev/bulkV2?authorization=' + process.env.FAST2SMS_API_KEY + '&route=' + route + '&sender_id=' + sender_id + '&message=' + message + '&variables_values=' + variables_values + '&numbers=' + numbers + '&schedule_time=' + schedule_time;
        
        const response = await axios.get(url);
        smsResponse = response;
        if (response.data.return === true) {
          this.saveOtp(otp, phone);
          console.log('OTP sent successfully via SMS', otp);
        }
      }

      // 2. Send Email if email is available
      if (email) {
        try {
          // Also cache OTP by email so it can be verified either way
          this.saveOtp(otp, email); 
          
          const subject = "Your Eduroutez OTP";
          const html = `
            <div style="font-family: Arial, sans-serif; color: #333;">
              <h2>Password Reset OTP</h2>
              <p>Your One-Time Password (OTP) for password reset is:</p>
              <h1 style="color: #b82025; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
              <p>This OTP is valid for 90 seconds. Please do not share it with anyone.</p>
            </div>
          `;
          await sendEmail(email, subject, html);
          emailSent = true;
          console.log('OTP sent successfully via Email', otp);
        } catch (emailError) {
          console.error("Error sending OTP email:", emailError.message);
        }
      }

      // Return success if either SMS or Email worked
      if (smsResponse.data.return || emailSent) {
        return { 
          data: { 
            return: true, 
            message: "OTP sent successfully",
            smsSent: smsResponse.data.return,
            emailSent: emailSent
          } 
        };
      }

      return smsResponse;
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

      const referalUserPayload = { ...referdata };

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

      let userObj = user.toObject ? user.toObject() : user;

      const counselor = await this.counselorRepository.getByid(userObj._id);
      if (counselor) {
        // Only set role to counsellor if counselor is verified
        if (counselor.isVerified === true && userObj.role !== 'counsellor' && userObj.role !== 'admin' && userObj.role !== 'SUPER_ADMIN') {
          await this.userRepository.update(userObj._id, { role: 'counsellor', level: 'Career Advisor' });
          userObj.role = 'counsellor';
          userObj.level = 'Career Advisor';
        }

        userObj.verificationStatus = counselor.verificationStatus;
        userObj.isVerified = counselor.isVerified;
        userObj.verifiedBadge = counselor.verifiedBadge;
        userObj.certificateUrl = counselor.certificateUrl;
      }

      return { accessToken, refreshToken, accessTokenExp, refreshTokenExp, user: userObj };
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

  async update(id, data) {
    try {
      const user = await this.userRepository.update(id, data);
      return user;
    } catch (error) {
      throw error;
    }
  }

  async sendUserPasswordResetEmail(email) {
    try {
      const user = await this.getUserByEmail(email);

      if (!user) {
        throw new Error("Email doesn't exist");
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
      const user = await this.userRepository.getById(id);
      if (!user) {
        throw new Error("User not found");
      }

      const decoded = Token.verifyResetToken(token);
      
      // Security check: Verify the token belongs to the user
      if (decoded.userID && decoded.userID.toString() !== id.toString()) {
        throw new Error("Invalid token for this user");
      }

      console.log('Resetting password via token for user:', id);

      const hashedPassword = this.hashPassword(password);
      const updatedUser = await this.userRepository.update(id, { password: hashedPassword });
      
      if (!updatedUser) {
        throw new Error("Failed to update password");
      }
      
      console.log('Password successfully reset via token for user:', id);
    } catch (error) {
      console.error('Error in userPasswordReset:', error.message);
      throw error;
    }
  }

  async resetPasswordWithOtp(phoneOrEmail, otp, newPassword, email) {
    try {
      let query = {};
      
      // 1. Identify the user first to get their registered phone number
      if (email) {
        query.email = email;
      } else if (phoneOrEmail.includes('@')) {
        query.email = phoneOrEmail;
      } else {
        // If it's just a phone number and multiple users have it, 
        // we'll have to pick one, but it's better to use email to disambiguate.
        query.contact_number = phoneOrEmail.toString();
      }

      const user = await this.userRepository.findBy(query);
      if (!user) {
        throw new Error("User not found with provided identifier");
      }

      // 2. Use the user's registered phone number to verify the OTP
      const phone = user.contact_number;
      const isVerified = await this.verifyOtp(otp, phone);
      if (!isVerified) {
        throw new Error("Invalid OTP");
      }

      console.log('Resetting password for user:', user._id, 'Email:', user.email);
      
      const hashedPassword = this.hashPassword(newPassword);
      const updatedUser = await this.userRepository.update(user._id, { password: hashedPassword });
      
      if (!updatedUser) {
        throw new Error("Failed to update password in database");
      }
      
      console.log('Password successfully updated for user:', updatedUser._id);
      return updatedUser;
    } catch (error) {
      console.error('Error in resetPasswordWithOtp:', error.message);
      throw error;
    }
  }

  async googleLogin(idToken, res) {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: idToken,
        audience: ServerConfig.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      const { email, name, picture } = payload;

      let user = await this.getUserByEmail(email);

      if (!user) {
        // Create new user if not exists
        const randomPassword = this.generateRandomPassword();
        user = await this.userRepository.create({
          email,
          name,
          image: picture,
          password: this.hashPassword(randomPassword),
          is_verified: true,
          role: "student", // Default role for social signup
        });
      }

      const { accessToken, refreshToken, accessTokenExp, refreshTokenExp } = await Token.generateTokens(user);
      Token.setTokensCookies(res, accessToken, refreshToken, accessTokenExp, refreshTokenExp);

      return { accessToken, refreshToken, accessTokenExp, refreshTokenExp, user };
    } catch (error) {
      console.error("Google Login Error:", error.message);
      throw new Error("Google authentication failed");
    }
  }

  async facebookLogin(accessToken, res) {
    try {
      // Verify Facebook token
      const fbUrl = `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`;
      const response = await axios.get(fbUrl);
      const { email, name, picture } = response.data;

      if (!email) {
        throw new Error("Facebook account must have an email associated with it.");
      }

      let user = await this.getUserByEmail(email);

      if (!user) {
        // Create new user if not exists
        const randomPassword = this.generateRandomPassword();
        user = await this.userRepository.create({
          email,
          name,
          image: picture?.data?.url,
          password: this.hashPassword(randomPassword),
          is_verified: true,
          role: "student",
        });
      }

      const { accessToken: edAccessToken, refreshToken, accessTokenExp, refreshTokenExp } = await Token.generateTokens(user);
      Token.setTokensCookies(res, edAccessToken, refreshToken, accessTokenExp, refreshTokenExp);

      return { accessToken: edAccessToken, refreshToken, accessTokenExp, refreshTokenExp, user };
    } catch (error) {
      console.error("Facebook Login Error:", error.message);
      throw new Error("Facebook authentication failed");
    }
  }
}

export default UserService;
