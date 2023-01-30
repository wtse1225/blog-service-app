/*********************************************************************************
*  WEB322 – Assignment 1
*  I declare that this assignment is my own work in accordance with Seneca Academic Policy.  
*  No part of this assignment has been copied manually or electronically from any other source
*  (including web sites) or distributed to other students.
* 
*  Name: Wai Hing William Tse   Student ID: 149 992 216    Date: 1/18/2023
*
*  Cyclic Web App URL: https://cerise-lemming-yoke.cyclic.app
*
*  GitHub Repository URL: https://github.com/wtse1225/helloworld
*
********************************************************************************/ 

var HTTP_PORT = process.env.PORT || 8080;
var express = require("express");
var app = express();

// setup a 'route' to listen on the default url path
app.get("/", (req, res) => {
    res.send("Wai Hing William Tse - 149 992 216");
});

// setup http server to listen on HTTP_PORT
app.listen(HTTP_PORT);