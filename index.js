const { response } = require('express')
const express = require('express')
const mongoose = require('mongoose')
const User = require('./models/userScheema')
const session = require('express-session')
const MongoStore = require('connect-mongo')
const mid = require('./middleware/index') // importing my custom middleware
const app = express()

const dbURI = `mongodb+srv://caleb:password1255@cluster0.tmikxym.mongodb.net/Practice-Database?retryWrites=true&w=majority`

// setting view Engine
app.set('view engine', 'ejs')

// Middlewares..
app.use(express.urlencoded()) // middleware for accepting form data
app.use(express.static('public')) // middleware to allow use serve static files. i.e css files from 'public' folder

// setting up session middleware.
app.use(session({
    secret: 'mySecret', // string used to sign session ID cookie
    resave: true, // forces session to be saved in the session store
    saveUninitialized: false, // forces an unitialized to not be saved in the session store.
    store: MongoStore.create({
        mongoUrl: dbURI,
        ttl: 14 * 24 * 60 * 60,
        autoRemove: 'native'
    })
}))

// making session available to whole app
app.use((req, res, next) => {
    // the .locals is a property that is available in all request objects.
    // so we are assigning that property a varaibale 'currentUser' and assigning that varaible to the session data.
    // meanig every response sent form this app will have a currentUser varaible and the value will be the session data 
    res.locals.currentUser = req.session.userId 
    next();
})

mongoose.connect(dbURI, {useNewUrlParser: true, useUnifiedTopology: true})
    .then ((response) => (
        console.log('conected To Database'),
        // To start listening for request
        app.listen('5000')
    ))
    .catch((err) => (
        console.log(err)
    ))
 
app.get('/', (req,res) => {

    res.render('index')
    // console.log(`this: ${res.locals}`)
    // res.sendFile('./views/index.html', {root: __dirname})
    // res.send('sending Response')
})

app.get('/login', mid.loggedOut , (req,res) => {
    res.render('login')
})

app.get('/logout', (req,res) => {
    if (req.session) {

        req.session.destroy((err) => {
            if (err) {
                console.log(err)
                return next(err)
            }
    
            return res.redirect("/")
        })
    }
})

// A Protected Route..
app.get('/profile', (req,res,next) => {
    if (! req.session.userId) { // checking if a session user ID dosent exist, i'e not logged in
        console.log('Not logged In')
        return res.redirect('/login')
    } else {
        User.findById(req.session.userId)
            .then((data) => {
                res.render('profile', {name: data.name, favoriteBook: data.favoriteBook})
            })
            .catch((err) => {
                console.log(err)
                next()
            })
    }
    console.log(req.session)
}) 
 
app.get('/new-user', mid.loggedOut, (req,res) => { // adding my custom middleware
    res.render('create')
})

// To Handle Users Logging IN
app.post('/login', (req,res, next) => {
    if(req.body.email !== '' || req.body.Password !== '') {
        // calling the authenticate method from the User Model. \\ check userSchemma.js file.
        User.authenticate(req.body.email, req.body.Password, function (error, user) {
            if (error || !user) { // check if an error occurs. i.e incorrect password or user dose'nt exist
                console.log(error)
                return res.send('Wrong email or Password')
            } else { // if authentication is successful

                // console.log('User Logged IN')
                // console.log(user)
                // console.log(User)
                
                req.session.userId = user._id // Defining a session variable 'userId' and assigning it to the _id property in the database.
                return res.redirect('/profile')
            }
        })
    }
    else {
        // res.send('Email and Password Required')
        let err = {
            message: 'Email and Password Required',
            status: 401
        }
        return next(err)
    }
})

// app.get('/new-user', (req,res) => {
//     res.redirect(307, '/new-user')
// })

app.post('/new-user', (req,res,next) => {
    console.log(req.body)
    const {name, email, favoriteBook, Password} = req.body

    const newUser = new User ({
        name: name,
        email: email,
        favoriteBook: favoriteBook,
        password: Password
    })

/*
    newUser.save()
        .then((data) => (
            console.log(data),
            console.log('succes saved'),
            res.send('User Saved')
        ))
        .catch((err) => (
            console.log(err),
            res.send('An Erro Occured')
        ))
*/
            // OR
    // You can also use the schema's create method to save documents in mongo.
    User.create(newUser, function (error, user) {
        if(error) {
            console.log(error)
            return next(error)
        } else {
            // console.log('userSaved')
            req.session.userId = user._id // Defining a session variable 'userId' and assigning it to the _id property in the database.
            console.log('user has being saved')
            return res.redirect('/profile')
        }
    })
})

// catch 404 and forward to error handler
app.use((req, res, next) => {
    let err = {
        message: 'File Not Found',
        status: 404
    }
    next(err)
})

// error Handle middleware
app.use((err, req, res, next) => {
    res.status(err.status || 500)
    res.render('error', {
        message: err.message,
        error: {}
    })
})

console.log('running')


