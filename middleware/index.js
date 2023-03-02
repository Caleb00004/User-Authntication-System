// Custom Middleware to check if a user is LoggedIn.
function loggedOut(req, res, next) {
    if (req.session && req.session.userId) { // if user logged in, redirect to Home page. 
        return res.redirect('/')          // don't want logged in users to have access to login & signup pages/routes.
    } else { // else pass it on to the next middleware
        next()
    }
}

function requiresLogIn(req, res, next) {
    if (req.session && req.session.userId) {
        return next()
    } else {
        let err = {
            status: 401,
            message: 'User Not logged In'
        }
        return next(err)
    }
}

// exporting the midleware
module.exports.loggedOut = loggedOut
module.exports.requiresLogIn =requiresLogIn

