import passport from "passport";

import passportJWT from "passport-jwt";
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
import User from "./models/User";
import dotenv from "dotenv";

dotenv.config();

module.exports = () => {
  passport.use(User.createStrategy());

  passport.serializeUser(User.serializeUser());
  passport.deserializeUser(User.deserializeUser());
  //JWT Strategy
  passport.use(
    new JWTStrategy(
      {
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET
      },
      function(jwtPayload, done) {
        return User.findOne({ _id: jwtPayload._id })
          .then(user => {
            return done(null, user);
          })
          .catch(err => {
            return done(err);
          });
      }
    )
  );
};
