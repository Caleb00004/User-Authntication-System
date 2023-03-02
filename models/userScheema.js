const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const Schema = mongoose.Schema

const userScheema = new Schema ({
    name: {
        type: String,
        required: true,
        trim: true // To remove needless white spaces in the input
    },
    email: {
        type: String,
        required: true,
        unique: true, // to make sure no duplicate email are available in the project
    },
    favoriteBook: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
    }
}, {timestamps: true})

    // creating this method to log in users. (call the method on the blog model obejct )
//         Note: we can call this method in our main file (index/server) with just 'modelName'.authenticate()

// authenticate user input against database documents
userScheema.statics.authenticate = function (email, password, callback) {
    // console.log(email)
    // console.log(password)

    User.findOne({ email: email})
        .exec(function (error, user) { // exec() method used executes a search for a match in a specified string and returns the string , or null . (string in this case is the user email.)
            if (error) { // if an error ocuurs
                return callback(error)
            } else if (!user) { // if the user is not found
                console.log('User Not FOund')
                let err = 'User not Found'
                err.status = 401
                return callback(err)
            }
            // This code will only exexute if the user is found. i.e all conditions up are false.

            // To check if passwords Match
            // use the bcrypt compare method to com[are passwords has 3 parameters
                    // 'inputed password', 'hashed password' & call back func to check if passwords match (result) or an error occured.
            console.log('Email Found')
            console.log(password)
            console.log(user)
            
            bcrypt.compare(password, user.password, function(error, result) {
                if (result === true) { // if the passwords match
                    console.log('password match')
                    return callback(null, user) // returning a null value, followed by logged in correct user object
                }
                else {
                    // console.log(password, User.password)
                    console.log('password DOnt match')
                    return callback()
                }
            })
        })
}


// To hash passwords before saving it
userScheema.pre('save', function (next) {
    const user = this // represents the current instance of the user model object to be saved in database.
    console.log(user)

    bcrypt.hash(user.password, 10, (err,hash) => {
        if (err) {
            console.log(err)
            return next()
        }
        console.log(hash)
        user.password = hash
        next()
    })
})

const User = mongoose.model('user-Collection', userScheema )
module.exports = User

