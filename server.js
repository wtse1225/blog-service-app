/*********************************************************************************
*  WEB322 – Assignment 06
*  I declare that this assignment is my own work in accordance with Seneca Academic Policy.  
*  No part of this assignment has been copied manually or electronically from any other source
*  (including web sites) or distributed to other students.
* 
*  Name: Wai Hing William Tse   Student ID: 149 992 216    Date: 4/8/2023
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
const exphbs = require('express-handlebars'); // assignment 4
const stripJs = require('strip-js'); // assignment 4
const authData = require('./auth-service'); // assignment 6
const clientSessions = require('client-sessions'); // assignment 6
const path = require("path");
const app = express();
const upload = multer(); // assignment 3

// Assignment 4: Fix the nav bar to show the correct "active" item
app.use(function(req,res,next){
  let route = req.path.substring(1);
  app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
  app.locals.viewingCategory = req.query.category;
  next();
});

// Setup client-sessions
app.use(clientSessions({
  cookieName: "session", // this is the object name that will be added to 'req'
  secret: "assignment6_web322", // this should be a long un-guessable string.
  duration: 2 * 60 * 1000, // duration of the session in milliseconds (2 minutes)
  activeDuration: 1000 * 60 // the session will be extended by this many ms each request (1 minute)
}));

// A middleware function for the templates to have access to a session object
app.use(function(req, res, next) {
  res.locals.session = req.session;
  next();
});

// The heloper middleware function to check if a user is logged in
function ensureLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect("/login");
  } else {
    next();
  }
};

// assignment 4: setup the handlebars engine with helpers
app.engine('.hbs', exphbs.engine({  
  extname: '.hbs',
  helpers: { 
    navLink: function(url, options){ // the helper for nav bar to replace all of the nav bar links in main.hbs 
      return '<li' + 
          ((url == app.locals.activeRoute) ? ' class="active" ' : '') + 
          '><a href="' + url + '">' + options.fn(this) + '</a></li>';
    },
    equal: function (lvalue, rvalue, options) { // the helper for evaluate conditions for equality
      if (arguments.length < 3)
          throw new Error("Handlebars Helper equal needs 2 parameters");
      if (lvalue != rvalue) {
          return options.inverse(this);
      } else {
          return options.fn(this);
      }
    },
    safeHTML: function(context){
      return stripJs(context);
    },
    formatDate: function(dateObj){ // a date format helper added in assignment 5
      let year = dateObj.getFullYear();
      let month = (dateObj.getMonth() + 1).toString();
      let day = dateObj.getDate().toString();
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2,'0')}`;
    }    
  }
}));
app.set('view engine', '.hbs');

// call this function after the http server starts listening for requests
function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
};

// middleware for the server to correctly return main.css file
app.use(express.static('public'));

// A regular express middleware
app.use(express.urlencoded({extended: true}));

// setup a 'route' to listen on the default url path
app.get("/", function(req,res){  
    res.redirect('/blog');
});

// setup another route to listen on /about
app.get("/about", function(req,res){
  //res.sendFile(path.join(__dirname, "/views/about.html"));  
  res.render('about'); // render the about content with the main.hbs layout
});

// setup another route to listen on /posts
app.get("/posts", ensureLogin,function(req,res){
  //res.sendFile(path.join(__dirname, "/data/posts.json"));
  let category = req.query.category; 
  let minDateStr = req.query.minDate;

  if (category) {
    blogService.getPostsByCategory(category). then((data) => {
      if (data.length > 0 ) {
        res.render("posts", {posts: data});
      } else {
        res.render("posts", {message: "no results"});
      }
    }).catch((err) => {
      console.log(err);
      //res.send(err);
      res.render("posts", {message: "no results"} + err);
    });
  }
  else if (minDateStr) {
    blogService.getPostsByMinDate(minDateStr). then((data) => {
      //res.json(data);
      if (data.length > 0) {
        res.render("posts", {posts: data});
      }   else {
        res.render("posts", {message: "no results"});
      }
    }).catch((err) => {
      console.log(err);
      //res.send(err);
      res.render("posts", {message: "no results"} + err);
    });
  }
  else (blogService.getAllPosts().then((data) => {
    //res.json(data)
    if (data.length > 0) {
      res.render("posts", {posts: data}); // render the posts.hbs with the passed in posts object that holds all the data 
    } else {
      res.render("posts", {message: "no results"});
    }
  }).catch((err) => {
    console.log(err);
    res.render("posts", {message: "no results"} + err);
  }))
});

// setup a /post/value route
app.get("/post/:value", ensureLogin, (req, res) => {
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

// Assignment 4: setup another route to listen on /Blog 
app.get('/blog', async (req, res) => {
  // Declare an object to store properties for the view
  let viewData = {};

  try{

      // declare empty array to hold "post" objects
      let posts = [];

      // if there's a "category" query, filter the returned posts by category
      if(req.query.category){
          // Obtain the published "posts" by category
          posts = await blogService.getPublishedPostsByCategory(req.query.category);
      }else{
          // Obtain the published "posts"
          posts = await blogService.getPublishedPosts();
      }

      // sort the published posts by postDate
      posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

      // get the latest post from the front of the list (element 0)
      let post = posts[0]; 

      // store the "posts" and "post" data in the viewData object (to be passed to the view)
      viewData.posts = posts;
      viewData.post = post;

  }catch(err){
      viewData.message = "no results";
  }

  try{
      // Obtain the full list of "categories"
      let categories = await blogService.getCategories();

      // store the "categories" data in the viewData object (to be passed to the view)
      viewData.categories = categories;
  }catch(err){
      viewData.categoriesMessage = "no results"
  }

  // render the "blog" view with all of the data (viewData)
  res.render("blog", {data: viewData})

});

// Assignment 4: Adding the blog/:id route
app.get('/blog/:id', async (req, res) => {
  // Declare an object to store properties for the view
  let viewData = {};

  try{

      // declare empty array to hold "post" objects
      let posts = [];

      // if there's a "category" query, filter the returned posts by category
      if(req.query.category){
          // Obtain the published "posts" by category
          posts = await blogService.getPublishedPostsByCategory(req.query.category);
      }else{
          // Obtain the published "posts"
          posts = await blogService.getPublishedPosts();
      }

      // sort the published posts by postDate
      posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

      // store the "posts" and "post" data in the viewData object (to be passed to the view)
      viewData.posts = posts;

  }catch(err){
      viewData.message = "no results";
  }

  try{
      // Obtain the post by "id"
      viewData.post = await blogService.getPostsById(req.params.id);      
  }catch(err){
      viewData.message = "no results"; 
  }

  try{
      // Obtain the full list of "categories"
      let categories = await blogService.getCategories();

      // store the "categories" data in the viewData object (to be passed to the view)
      viewData.categories = categories;
  }catch(err){
      viewData.categoriesMessage = "no results"
  }
  
  // render the "blog" view with all of the data (viewData)
  res.render("blog", {data: viewData})
  //console.log({data: viewData});
});

// setup another route to listen on /categories
app.get("/categories", ensureLogin, function(req,res){
  //res.sendFile(path.join(__dirname, "/data/categories.json"));
  blogService.getCategories().then((data) => {
    //res.json(data)
    if (data.length > 0) {
      res.render("categories", {categories: data});
    } else {
      res.render("categories", {message: "no results"});
    }
  }).catch((err) => {
    console.log(err);
    res.render("categories", {message: "no results"} + err);
  })
});

// adding a route to support the new view /posts/add
app.get("/posts/add", ensureLogin, (req, res) => {
  //res.sendFile(path.join(__dirname, "/views/addPost.html"));
  //res.render('addPost');
  blogService.getCategories().then((data) => {
    res.render("addPost", {categories: data});
  }).catch((err) => {
    res.render("addPost", {categories: []});
  })
});

// adding the Post route
app.post("/posts/add", ensureLogin, upload.single("featureImage"), (req, res) => {
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

// adding a route to support the new view /categories/add
app.get("/categories/add", ensureLogin, (req, res) => {
  //res.sendFile(path.join(__dirname, "/views/addPost.html"));
  res.render('addCategory');
});

// adding the categories/add route
app.post("/categories/add", ensureLogin, (req, res) => {     
    blogService.addCategory(req.body).then(() => {
      res.redirect("/categories");
    }).catch((err) => {
      res.send(err);
    });
  } 
);

// adding the categories/delete/:id route
app.get("/categories/delete/:id", ensureLogin, (req, res) => {     
  blogService.deleteCategoryById(req.params.id).then(() => {
    res.redirect("/categories");
    }).catch((err) => {
    res.status(500).render("500", {message: "Unable to Remove Category / Category not found"});
    });
  } 
);

// adding the posts/delete/:id route
app.get("/post/delete/:id", ensureLogin, (req, res) => {     
  blogService.deletePostById(req.params.id).then(() => {
    res.redirect("/posts");
    }).catch((err) => {
    res.status(500).render("500", {message: "Unable to Remove Post / Post not found"});
    });
  } 
);

// Adding the login route
app.get("/login", (req, res) => {
  res.render('login', {
    layout: 'main'
  })
});

// Route for POST login
app.post("/login", (req, res) => {
  req.body.userAgent = req.get('User-Agent');
  authData.checkUser(req.body).then((user) => {
    req.session.user = {
      userName: user.userName,
      email: user.email,
      loginHistory: user.loginHistory
    }
    res.redirect("/posts");
  }).catch((err)=> {
    console.log(err)
    res.render('login', {
      errorMessage: err,
      userName: req.body.userName,
      layout: 'main'
    })
  })
})

// The function to reset the session (logout)
app.get("/logout", ensureLogin, (req, res) => {
  req.session.reset();
  res.redirect("/login");
});

// The function to render the login history
app.get("/loginHistory", ensureLogin, (req,res) => {
  res.render('loginHistory', {
    layout: 'main'
  })
})

// Adding the register route
app.get("/register", (req, res) => {
  res.render('register', {
    layout: 'main'
  })
});

// Adding the POST register route
app.post("/register", (req, res) => {
  authData.registerUser(req.body).then(() => {
    res.render('register', {
      successMessage: "User created",
      layout: 'main'
    })
  }).catch((err)=> {
    console.log(err)
    res.render('register', {
      errorMessage: err,
      userName: req.body.userName,
      layout: 'main'
    })
  })
})

// setting the cloudinary config
cloudinary.config({
  cloud_name: 'di23ypmba',
  api_key: '921268117758548',
  api_secret: 'A7tPHzYoD2yQ093q5kJtO7WH1qU',
  secure: true
});

// setup a 404 status return when the request is not found
app.use((req,res) => {
  //res.status(404).send("Your favorite 404 - Page Not Found");
  res.status(404).render("404", {message: "Your favorite 404 - Page Not Found"});
});

// init first, then setup http server to listen on HTTP_PORT
blogService.initialize().then(authData.initialize)
.then(function(){
    app.listen(HTTP_PORT, onHttpStart);
}).catch(function(err){
    console.log("unable to start server: " + err);
});
