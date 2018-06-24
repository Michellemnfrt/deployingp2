var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/User');

module.exports = function (passport) {
  passport.serializeUser(function(user, callback) {
    callback(null, user.id);
  });

  passport.deserializeUser(function(id, callback) {
    User.findById(id, function(err, user) {
      callback(err, user);
    });
  });

  passport.use('local-Signup', new LocalStrategy({   
        usernameField: "email",
        passwordField: "password",
        passReqToCallback: true
      },
      function(req, email, password, callback) {
        User.findOne({ "local.email": email })
          .then(User => {
            if (User) {
              return callback(
                null,
                false,
                req.flash("signupMessage", "this email is already taken")
              );
            } else {
              let newUser = new User();
              newUser.local.email = email;
              newUser.local.password = newUser.encrypt(password);

              newUser.save(err => {
                if (err) throw err;
                return callback(null, newUser);
              });
            }
          })
          .catch(err => console.log(err));
      }
    )
  );

  passport.use(
    "local-login",
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
        passReqToCallback: true
      },
      function(req, email, password, callback) {
        User.findOne({ "local.email": email }, function(err, user) {
          if (err) return callback(err);

          if (!User) {
            return callback(
              null,
              false,
              req.flash("loginMessage", "No user found")
            );
          }
          if (!User.validPassword(password)) {
            return callback(
              null,
              false,
              req.flash("loginMessage", "Ooops, wrong password")
            );
          }
          return callback(null, User);
        });
      }
    )
  );
};