if (process.env.NODE_ENV !=="production"){
    require('dotenv').config();
}
//mongodb+srv://srepalli:<password>@cluster0.oqadxhj.mongodb.net/?retryWrites=true&w=majority

//require('dotenv').config();

//console.log(process.env.CLOUDINARY_CLOUD_NAME)
//console.log(process.env.CLOUDINARY_KEY)

const express = require('express');
const  mongoose  = require('mongoose');
const path = require('path');
const ejsMate = require('ejs-mate');
const catchAsync= require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const Campground = require('./models/campground');
const session = require('express-session');
const Review = require('./models/review');
const flash= require('connect-flash')
const passport= require('passport')
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');

const {campgroundSchema,reviewSchema} = require('./schemas.js')
const methodOverride = require('method-override');

const userRoutes= require('./routes/users')
const campgroundRoutes= require('./routes/campgrounds');
const reviewRoutes= require('./routes/reviews');


const MongoStore = require('connect-mongo');

// const dbUrl = process.env.DB_URL 

const dbUrl='mongodb://127.0.0.1:27017/yelp-camp'

//'mongodb://127.0.0.1:27017/yelp-camp'

mongoose.connect(dbUrl)
    .then(()=>{
        console.log('Mongo connection open')
    })
    .catch(err=>{
    console.log("oh no Mongo connection e rror!")
    console.log(err)
})


const app = express();

app.engine('ejs',ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'))
//app.use(express.static('public'))
app.use(express.static(path.join(__dirname,'public')))

app.use(mongoSanitize({
    replaceWith: '_'
}))

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
      secret: 'squirrel'
    },
    touchAfter: 24 * 3600
})

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})

// app.use(
// session({
//     secret: 'your-secret-key',
//     resave: false,
//     saveUninitialized: false,
//     store: MongoStore.create({
//     client: mongoClient,
//     mongoUrl: dbUrl,
//     collectionName: 'sessions',
//     touchAfter: 24 * 3600
//     // Additional configuration options if needed
//     }).on("error", function (e) {
//         console.log("SESSION STORE ERROR", e)
//     }),
// })
// );


  



// store.on("error", function (e) {
//     console.log("SESSION STORE ERROR", e)
// })

const sessionConfig={
    store,
    
    name:'session',
    secret:'thisshouldbebettersecret!',
    resave:false,
    saveUninitialized:true,
    cookie:{
        httpOnly:true,
        // secure: true,
        expires:Date.now()+ 1000*60*60*24*7,
        maxAge:1000*60*60*24*7
    }
}
app.use(session(sessionConfig))
app.use(flash());
//app.use(helmet({contentSecurityPolicy :false}));

app.use(helmet());


const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net", // add this one
    "https://kit-free.fontawesome.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dbfayalcf/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    console.log(req.query)
    res.locals.currentUser= req.user;
    res.locals.success=req.flash('success');
    res.locals.error=req.flash('error');
    next();
})

// app.get('/fakeUser', async (req,res) =>{
//     const user = new User ({email:'coltttt@gmail.com',username:'colttt'})
//     const newUser = await User.register(user,'chicken')
//     res.send(newUser);
// } )

// register - FORM
// POST /register - create a user



app.use('/', userRoutes);
app.use('/campgrounds',campgroundRoutes)
app.use('/campgrounds/:id/reviews',reviewRoutes)

app.get('/', (req, res)=>{
    res.render('home')
})


// app.get('/makecampground', async (req, res)=>{
//     const camp = new Campground({title:'My Backyard', description : 'cheap camping!'});
//     await camp.save();
//     res.send(camp)
// })


app.all('*',(req,res,next)=>{
    next(new ExpressError('Page Not Found',404))
    // res.send("404!!")
})

app.use((err,req,res,next) => {
    const{statusCode=500} = err;
    if(!err.message) err.message = 'Oh No,something wrong'
    res.status(statusCode).render('error',{err})
    // res.send('Oh boy,Something went wrong!')
})

app.listen(3000, ()=>{
    console.log('Serving on port 3000')
})

//Post /campground/:id/review