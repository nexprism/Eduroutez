import JWT from "passport-jwt";

import User from "../models/User.js";
import passport from "passport";
import { ServerConfig } from "./index.js";

const JwtStrategy = JWT.Strategy;
const ExtractJwt = JWT.ExtractJwt;

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: ServerConfig.JWT_ACCESS_SECRET,
};

passport.use(
  new JwtStrategy(opts, async function (jwt_payload, done) {
    try {
      const user = await User.findOne({ _id: jwt_payload._id }).select("-password");
      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    } catch (error) {
      return done(err, false);
    }
  })
);
