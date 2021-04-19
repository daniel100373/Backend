require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("connect-flash");
const bodyParser = require("body-parser");
const User = require("./models/user");
const bcrypt = require("bcrypt");
const saltRounds = 10;

app.set("view engine", "ejs");
app.use(cookieParser(process.env.SECRET));
app.use(
    session({
        secret: process.env.SECRET,
        resave: false,
        saveUninitialized: false,
    })
);
app.use(flash());
app.use(bodyParser.urlencoded({ extended: true }));
const requireLogin = (req, res, next) => {
    if (!req.session.isVerified == true) {
        res.redirect("login");
    }
    next();
};
// middlewares

mongoose
    .connect("mongodb://localhost:27017/test", {
        useFindAndModify: false,
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log("Connected to mongodb.");
    })
    .catch((e) => {
        console.log(e);
    });

app.get("/", (req, res) => {
    res.send("Homepage");
});

app.get("/signup", (req, res) => {
    res.render("signup");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/welcome", requireLogin, (req, res) => {
    res.render("welcome");
});

app.post("/signup", async (req, res, next) => {
    let { email, password, studentId, username } = req.body;
    try {
        let checkUser = await User.findOne({ studentId });
        if (checkUser) {
            res.send("StudentId existed");
        } else {
            bcrypt.genSalt(saltRounds, (err, salt) => {
                if (err) {
                    next(err);
                }

                bcrypt.hash(password, salt, (err, hash) => {
                    if (err) {
                        next(err);
                    }
                    let newUser = new User({ email, password: hash, studentId, username });
                    try {
                        newUser
                            .save()
                            .then(() => {
                                res.send("Data has been saved.");
                            })
                            .catch((e) => {
                                res.send("Error!");
                            });
                    } catch (err) {
                        next(err);
                    }
                });
            });
        }
    } catch (err) {
        next(err);
    }
});

app.post("/login", async (req, res, next) => {
    let { studentId, password } = req.body;
    try {
        let foundUser = await User.findOne({ studentId });
        if (foundUser) {
            bcrypt.compare(password, foundUser.password, (err, result) => {
                if (err) {
                    next(err);
                }
                if (result === true) {
                    req.session.isVerified = true;
                    res.redirect("welcome");
                } else {
                    res.send("Username or Password not correct");
                }
            });
        } else {
            res.send("Username or Password not correct");
        }
    } catch (err) {
        next(err);
    }
});

app.get("/*", (req, res) => {
    res.status(404).send("404 Page is not founded");
});

app.use((err, req, res, next) => {
    console.log(err);
    res.status(500).send("something is broken");
});

app.listen(3000, () => {
    console.log("Server running on port 3000.");
});
