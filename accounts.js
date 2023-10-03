const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const findOrCreate = require('mongoose-findorcreate')
const mongoose = require('mongoose');
// mongoose.connect("mongodb://127.0.0.1:27017/todolistv3-1")
express().set('view-engine', 'ejs');
const bcrypt = require('bcrypt')
const passport = require('passport')
const customStrategy = require('passport-custom').Strategy
const mongostore = require('connect-mongo')
const session = require('express-session')
const MongooseConnection = mongoose.createConnection("mongodb://127.0.0.1:27017/todolistv3-1")
const sessionStore = mongostore.create({ mongoUrl: "mongodb://127.0.0.1:27017/todolistv3-1", collectionName: 'sessions' })

router.use(session({
    secret: "mysecrethahaha",
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000
    },
}))

express().use(express.json())
express().use(express.urlencoded({ extended: true }))

passport.serializeUser((user, callback) => {
    // console.log("user:" + JSON.stringify(user));
    callback(null, user.doc.id);
})

passport.deserializeUser((id, callback) => {
    // console.log("deserialise called");
    User.findById(id).then((user) => {
        // console.log('user found by deserialise : ' + user);
        if (user) return callback(user);
    }).catch(err => {
        // console.log(err);
        return callback(err);
    })
})

router.use(passport.initialize())
router.use(passport.session())

const userSchema = new mongoose.Schema({
    email: String,
    NoteCategories: {},
    passwordHash: String
})

userSchema.virtual('password').set((value) => {
    this.passwordHash = bcrypt.hashSync(value, 12);
})

userSchema.plugin(findOrCreate)

const NoteSchema = new mongoose.Schema({
    email: String,
    Category: String,
    notes: {}
})

const User = MongooseConnection.model('user', userSchema);
const Note = MongooseConnection.model('note', NoteSchema);

const localStrategy = new customStrategy(
    (req, done) => {

        console.log("strategy in action");

        const user = req.body
        // console.log(user);

        User.findOrCreate({ email: user.email }).then(user => {
            return done(null, user)
        }).catch(err => {
            return done(err);
        })

    }
)

passport.use('custom-password', localStrategy)

router.post('/signup', (req, res, next) => {
    console.log("inside post");
    passport.authenticate('custom-password', (err, user, info)=>{
        if(user){
            console.log("user provided by authenticate function: " + user);
            req.logIn(user, (err)=>{
                console.log("login error:" + err);
                if(err || ! user){
                    console.log("inside error if");
                    return next(err);
                }
                else{
                    console.log("login");
                    return res.redirect("/");
                }
            })
        }
    })(req, res, next)
})

router.post('/login', (req, res) => {
})

router.get('/login', (req, res) => {
    console.log("inside login get");
    if(req.isAuthenticated()){
        console.log("authenticated");
    }
    res.send('hello')
})

router.get('/signup', (req, res) => {
    console.log("inside signup get");
    if(!req.isAuthenticated()){
        res.render("signup")
    }
    else{
        console.log("signed in");
        res.send("already signed in")
    }

})

router.get('check', (req, res)=>{
    res.send("hi")
})

module.exports = router;