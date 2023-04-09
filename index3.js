const express = require("express");
const bodyParser = require("body-parser");
const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const port = 3040;

app.use(bodyParser.json());
app.use(passport.initialize());

const add = (n1, n2) => n1 + n2;
const subtract = (n1, n2) => n1 - n2;
const multiply = (n1, n2) => n1 * n2;
const divide = (n1, n2) => n1 / n2;

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET_KEY,
};

passport.use(
  new JwtStrategy(jwtOptions, (jwtPayload, done) => {
    if (Date.now() > jwtPayload.expires) {
      return done(null, false);
    }
    done(null, jwtPayload);
  })
);
const authenticate = passport.authenticate("jwt", { session: false });

const generateToken = (payload, secret, expiresIn) => {
  return jwt.sign(payload, secret, { expiresIn });
};

app.post("/add", authenticate, (req, res) => {
  const num1 = req.body.num1;
  const num2 = req.body.num2;
  const result = add(num1, num2);
  res.json({ result });
});

app.post("/subtract", authenticate, (req, res) => {
  const num1 = req.body.num1;
  const num2 = req.body.num2;
  const result = subtract(num1, num2);
  res.json({ result });
});

app.post("/multiply", authenticate, (req, res) => {
  const num1 = req.body.num1;
  const num2 = req.body.num2;
  const result = multiply(num1, num2);
  res.json({ result });
});

app.post("/divide", authenticate, (req, res) => {
  const num1 = req.body.num1;
  const num2 = req.body.num2;
  const result = divide(num1, num2);
  res.json({ result });
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username === "admin" && password === "password") {
    const payload = {
      username,
      expires: Date.now() + parseInt(process.env.JWT_EXPIRATION_MS),
    };
    const token = generateToken(payload, jwtOptions.secretOrKey, "1h");
    res.status(200).json({ token });
  } else {
    res.status(401).json({ message: "Invalid username or password" });
  }
});

app.listen(port, () => {
  console.log(`Calculator API listening at http://localhost:${port}`);
});
