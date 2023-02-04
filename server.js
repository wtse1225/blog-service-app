/*********************************************************************************
*  WEB322 – Assignment 02
*  I declare that this assignment is my own work in accordance with Seneca Academic Policy.  
*  No part of this assignment has been copied manually or electronically from any other source
*  (including web sites) or distributed to other students.
* 
*  Name: Wai Hing William Tse   Student ID: 149 992 216    Date: 1/29/2023
*
*  Cyclic Web App URL: https://dark-puce-macaw-wear.cyclic.app
*
*  GitHub Repository URL: https://github.com/wtse1225/web322-app
*
********************************************************************************/ 

var HTTP_PORT = process.env.PORT || 8080; 
var blogService = require("./blog-service");
var express = require("express");
var path = require("path");
var app = express();

// call this function after the http server starts listening for requests
function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}

// middleware for the server to correctly return main.css file
app.use(express.static('public'));

// setup a 'route' to listen on the default url path
app.get("/", function(req,res){  
    res.redirect('/about');
});

// setup another route to listen on /about
app.get("/about", function(req,res){
  res.sendFile(path.join(__dirname, "/views/about.html"));  
});

// setup another route to listen on /posts
app.get("/posts", function(req,res){
  //res.sendFile(path.join(__dirname, "/data/posts.json"));
  blogService.getAllPosts().then((data) => {
    res.json(data)
  }).catch((err) => {
    console.log(err);
    res.send(err);
  })
});

// setup another route to listen on /Blog
app.get("/blog", function(req,res){
  //res.sendFile(path.join(__dirname, "/data/posts.json"));
  blogService.getPublishedPosts().then((data) => {
    res.json(data)
  }).catch((err) => {
    console.log(err);
    res.send(err);
  })
});

// setup another route to listen on /categories
app.get("/categories", function(req,res){
  //res.sendFile(path.join(__dirname, "/data/categories.json"));
  blogService.getCategories().then((data) => {
    res.json(data)
  }).catch((err) => {
    console.log(err);
    res.send(err);
  })
});

// setup a 404 status return when the request is not found
app.use((req,res) => {
  res.status(404).send("Your favorite 404 - Page Not Found");
});

// init first, then setup http server to listen on HTTP_PORT
blogService.initialize().then(() => {  
  app.listen(HTTP_PORT, onHttpStart);
})