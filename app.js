//not using lodash in this project
//does not handle database operation errors

const bodyParser = require('body-parser');
const express = require('express');
const { redirect } = require('express/lib/response');
const app = express();
const date = require(__dirname + '/date.js');
const mongoose = require("mongoose");
const mongostore = require('connect-mongo')
const passport = require('passport');
const session = require('express-session')

//mongoose connection
mongoose.connect("mongodb://127.0.0.1:27017/todolistv3-1").then((x)=>{
});
// const accounts = require('./accounts')
const accounts2 = require('./accounts2')
/////////////////////////////////////////////////////////////////////////////////

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('public'))
app.use(express.json())
app.use(passport.initialize());
app.use(passport.session());

const sessionStore = mongostore.create({ mongoUrl: "mongodb://127.0.0.1:27017/todolistv3-1", collectionName: 'sessions' })


//Session Middleware
app.use(session({
    secret: "hellobhosdike",
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 180 //180 days
    },
    store: sessionStore
}));


//passport setup

// used to serialize the user for the session
passport.serializeUser(function (user, done) {
    done(null, user.id);
});

// used to deserialize the user
passport.deserializeUser(async function (id, done) {
    try {
        const user = await User.findById(id).exec();
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});


/////////////////////////////////////////////////////////////////////////////////

let arr = []
let lastURL = ""

//db structures

// app.use('/accounts', accounts)
app.use('/accounts', accounts2)

const itemSchema = new mongoose.Schema({
    name: String
})

const ListSchema = new mongoose.Schema({
    ListName: String,
    Items: [itemSchema]
})

const Item = new mongoose.model('Item', itemSchema)
const List = new mongoose.model('List', ListSchema)


app.get('/', (req, res) => {
    res.redirect('/manage');
})

app.get('/lists/:listName', (req, res) => {
    lastURL = req.params.listName
    // console.log(lastURL);
    let listID = 0;
    List.findOne({ListName:req.params.listName}).then((x) => {
        if(x == null){
            List.create({ListName:req.params.listName})
            res.render('list', { dayvalue: req.params.listName, taskArray: [], routeName: '/lists/' + req.params.listName })
        }
        else{
            res.render('list', { dayvalue: req.params.listName, taskArray: x.Items, routeName: '/lists/' + req.params.listName })
        }
    })
    
})

app.post('/checked', (req, res)=>{
    let newArr = []
    
    List.findOneAndUpdate({ListName:lastURL}, {$pull:{Items:{name:req.body.item}}}).then((UpdateResult)=>{})
    res.redirect('/lists/' + lastURL);
})

app.post('/lists/:listName', (req, res) => {
    const ListName = req.params.listName;
    lastURL = ListName;
    List.findOne({ ListName: ListName }).then((x)=>{
        let newItem = new Item({
            name:req.body.task
        })
        x.Items.push(newItem);
        
        List.findOneAndUpdate({ListName: ListName}, {Items:x.Items}).then((y)=>{
            // console.log("updation>>> " + y);
        }).then(()=>{
            res.redirect('/lists/' + ListName)
        })
    })
})

let arr2 = [];

app.get('/manage', (req, res)=>{
    List.find().then((x)=>{
        res.render('manage', {ItemArray:x})
    })
})

app.post('/deletelist', function (req, res) {
    List.deleteOne({ListName:req.body.deletename}).then((x)=>{
        res.redirect('/manage')
    })
})

app.get('/about', (req, res)=>{
    res.render('about');
})

app.listen(process.env.PORT || 3000, () => {
    console.log(`online`);
});