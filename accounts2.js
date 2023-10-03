const express = require("express")
const passport = require('passport')
const mongoose = require('mongoose');
const findOrCreate = require('mongoose-findorcreate')
const PassportLocalMongoose = require('passport-local-mongoose')



//setting up epxress
const app = express();
app.set('view-engine', 'ejs');
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


//Defining Mongoose Schemas and Models
const userschema = new mongoose.Schema({
    email: String,
    Notecategories: [String]
})

const noteschema = new mongoose.Schema({
    email: String,
    CategoryName: String,
    notes: [String]
})

userschema.plugin(findOrCreate)
noteschema.plugin(findOrCreate)
userschema.plugin(PassportLocalMongoose, { usernameField: 'email' });

const User = new mongoose.model('user', userschema)
const Note = new mongoose.model('note', noteschema)


////Passport Setup////

passport.use(User.createStrategy({usernameField:'email'}));


// Routes

const router = express.Router()
router.get('/protected', (req, res)=>{
    console.log(req.user);
});

router.get('/login', (req, res) => {
    console.log(req.session);
    res.render('login')
});

router.post('/login', (req, res, next) => passport.authenticate('local', (err, user, info) => {

    req.logIn(user, (err) => {
        if (err) {
            console.log("failed login",err);
            res.status(403).json(err);
        }
        else {
            console.log("success login:",user);
            //authenticates the user in DB if Successful redirect to /api/login/success else redirects to /api/login/fail
            passport.authenticate('local', { failureRedirect: '/accounts/signup', successRedirect: '/' })(req, res);
        }
    });
})(req, res, next)
)

router.get('/signup', (req, res) => {
    // if() console.log("signed in");
    console.log(req.cookies);
    res.render('signup');
})

router.post('/signup', (req, res, next) => {
    console.log(req.body);

    User.register(new User({ email: req.body.email }), req.body.password, (err,user) => {
        console.log("user details: ",user);
        if (err) {
            console.log('some error: ' + err);
            return next(err);
        }
        else {
            passport.authenticate('local')(req, res, () => {
                console.log('user registered');
                res.redirect('/accounts/protected');
            });
            
        }
    })
})


module.exports = router

