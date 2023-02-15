/*********************************************************************************
*  WEB322 – Assignment 03
*  I declare that this assignment is my own work in accordance with Seneca Academic Policy.  
*  No part of this assignment has been copied manually or electronically from any other source
*  (including web sites) or distributed to other students.
* 
*  Name: Wai Hing William Tse   Student ID: 149 992 216    Date: 2/15/2023
*
*  Cyclic Web App URL: https://dark-puce-macaw-wear.cyclic.app
*
*  GitHub Repository URL: https://github.com/wtse1225/web322-app
*
********************************************************************************/ 

const HTTP_PORT = process.env.PORT || 8080; 
const blogService = require("./blog-service");
const express = require("express");
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const path = require("path");
const app = express();
const upload = multer(); // Part 2: step 1

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
  let category = req.query.category;  // Part 3: step 1, optional filters
  let minDateStr = req.query.minDate;

  if (category) {
    blogService.getPostsByCategory(category). then((data) => {
      res.json(data);
    }).catch((err) => {
      console.log(err);
      res.send(err);
    });
  }
  else if (minDateStr) {
    blogService.getPostsByMinDate(minDateStr). then((data) => {
      res.json(data);
    }).catch((err) => {
      console.log(err);
      res.send(err);
    });
  }
  else (blogService.getAllPosts().then((data) => {
    res.json(data)
  }).catch((err) => {
    console.log(err);
    res.send(err);
  }))
});

// Part 3: step 2, setup a /post/value route
app.get("/post/:value", (req, res) => {
  let id = req.params.value;

  if (id) {
    blogService.getPostsById(id).then((data) => {
      res.json(data);
    }).catch((err) => {
      console.log(err);
      res.send(err);
    });
  }
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

// Part 1: step 2, adding a route to support the new view /posts/add
app.get("/posts/add", (req, res) => {
  res.sendFile(path.join(__dirname, "/views/addPost.html"));
});

// Part 2: step 2, adding the Post route
app.post("/posts/add", upload.single("featureImage"), (req, res) => {
  if(req.file){
    let streamUpload = (req) => {
        return new Promise((resolve, reject) => {
            let stream = cloudinary.uploader.upload_stream((error, result) => {
                    if (result) {
                        resolve(result);
                    } else {
                        reject(error);
                    }
                }
            );
            streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
    };

    async function upload(req) {
        let result = await streamUpload(req);
        console.log(result);
        return result;
    }

    upload(req).then((uploaded)=>{
        processPost(uploaded.url);
    });
  }else{
    processPost("");
  }
 
  function processPost(imageUrl){
    req.body.featureImage = imageUrl;

    // TODO: Process the req.body and add it as a new Blog Post before redirecting to /posts
    blogService.addPost(req.body).then(() => {
      res.redirect("/posts");
    }).catch((err) => {
      res.send(err);
    });
  } 

});

// Part 2: step 1, setting the cloudinary config
cloudinary.config({
  cloud_name: 'di23ypmba',
  api_key: '921268117758548',
  api_secret: 'A7tPHzYoD2yQ093q5kJtO7WH1qU',
  secure: true
});

// setup a 404 status return when the request is not found
app.use((req,res) => {
  res.status(404).send("Your favorite 404 - Page Not Found");
});

// init first, then setup http server to listen on HTTP_PORT
blogService.initialize().then(() => {  
  app.listen(HTTP_PORT, onHttpStart);
})