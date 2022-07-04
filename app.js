const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const morgan = require('morgan');
const exphbs = require('express-handlebars');
const path = require('path');
const connectDB = require('./config/db');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const methodOverride = require('method-override');

//Load config file
dotenv.config({path:'./config/config.env'});

//Passport config
require('./config/passport')(passport)

connectDB();

const app = express();

//Body parser middleware
app.use(express.urlencoded({extended:false}))
app.use(express.json())

//Method override
app.use(methodOverride(function(req,res){
    if(req.body && typeof req.body === 'object' && '_method' in req.body){
        let method = req.body._method
        delete req.body._method
        return method    
    }
}))

//morgan for logs
if (process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}

//Handlebars Helper
const { formatDate,stripTags,truncate,editIcon} = require('./helpers/hbs')

//Handlebars
app.engine('.hbs',exphbs.engine({helpers:{formatDate,stripTags,truncate,editIcon},defaultLayout:'main',extname: '.hbs',}));
app.set('view engine','.hbs');

//Sessions middleware
app.use(session({
    secret: 'quotes app',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
    })
}))

//Passport middleware
app.use(passport.initialize())
app.use(passport.session())

//Set global variable
app.use(function(req,res,next){
    res.locals.user = req.user || null
    next()
})

//Static folder
app.use(express.static(path.join(__dirname,'public')))

//Routes
app.use('/',require('./routes/index'));
app.use('/auth',require('./routes/auth'));
app.use('/quotes',require('./routes/quotes'));

const PORT = process.env.PORT || 3000

app.listen(PORT,console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));