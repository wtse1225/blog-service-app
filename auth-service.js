const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    "userName": {"type": String, "unique": true},
    "password": String,
    "email": String,
    "loginHistory":[{
        "dateTime": Date, 
        "userAgent": String
    }]    
});

let User; // to be defined on new connection (see initialize)

// The initialize function to connect with MongoDB
module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {
        let db = mongoose.createConnection("mongodb+srv://wtse11:Aa12345.@senecaweb.vygpdvd.mongodb.net/?retryWrites=true&w=majority");

        db.on('error', (err)=>{
            reject(err); // reject the promise with the provided error
        });
        db.once('open', ()=>{
           User = db.model("users", userSchema);
           resolve(); // if connection is successful, return nothing
        });
    });
};

// The function to register a user to the db, involves user name and password checking
module.exports.registerUser = (userData) => {
    return new Promise((resolve, reject) => {
        if (userData.password != userData.password2) {
            reject("Passwords do not match");
        } else {
            bcrypt.hash(userData.password, 10).then((hash) => {
                userData.password = hash // notice when this will be added?
                let newUser = new User(userData)
                newUser.save().then(() => {
                    resolve()
                }).catch((err) => {
                    if(err.code == 11000) {
                        reject("User Name already taken");
                    } else {
                        reject("There was an error creating the user: " + err);
                    }
                })
            }).catch((err) => {
                reject("PASSWORD ENCRYPTION ERROR")
            })

        }
    })
};

// The function to login the user, involves checking the user name and password in the db
module.exports.checkUser = function(userData) {
    return new Promise((resolve, reject) => {
        User.findOne({userName: userData.userName})
        .exec()
        .then((user) => {
            if(!user) {    // if input user name is not found in the User object
                reject("Unable to find user: " + userData.userName);
            } else {
                bcrypt.compare(userData.password, user.password).then((result) => {
                    if (result) { // if password matches
                        user.loginHistory.push({dateTime: new Date(), userAgent: userData.userAgent}) // push time and agent to the history array
                        User.updateOne(
                            {userName: user.userName},
                            {$set: {loginHistory: user.loginHistory}}
                        ).then(() => {
                            resolve(user);
                        }).catch((err) => {
                            reject("There was an error verifying the user: " + err);
                        })
                    } else {
                        reject("Incorrect Password for user: " + userData.userName);
                    }
                }).catch((err) => {
                    reject("PASSWORD COULD NOT BE DECRYPTED");
                })
                // if (userData.password == user.password) {
                //     resolve()
                // } else {
                //     console.log(userData.password, user.password)
                //     reject("INCORRECT PASSWORD!")
                // }
            }
        }).catch((err) => {
            reject("DATABASE ERROR");
            console.log(err);
        })
    })
};
