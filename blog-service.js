const fs = require('fs'); // fs module
let posts = [];
let categories = [];
let postPath = './data/posts.json';
let catPath = './data/categories.json';

// class example - change this part
module.exports.initialize  = () => {
    return new Promise((resolve, reject) => {    
        fs.readFile(postPath, 'utf8', (err, data) => {
            if (err) {
                reject("unable to read file");
            }
            else {
                posts = JSON.parse(data);
                resolve('Load succeeded');
            }
        });

        fs.readFile(catPath, 'utf8', (err, data) => {
            if (err) {
                reject("unable to read file");
            }
            else {
                categories = JSON.parse(data);
                resolve('Load succeeded');
            }
        });
    })
};

// return all posts
module.exports.getAllPosts = () => {
    return new Promise((resolve, reject) => {
        if (posts.length > 0) {
            resolve(posts);
        }
        else {
            reject("No results returned");
        }
    });
}

// return published posts
module.exports.getPublishedPosts = () => {
    return new Promise((resolve, reject) => {
        // filter results where posts.published === true
        let pubPost = posts.filter(posts => posts.published === true);  
        if (pubPost.length > 0) {
            resolve(pubPost);
        }
        else {
            reject("No results returned");
        }
    });
}

// return all categories
module.exports.getCategories = () => {
    return new Promise((resolve, reject) => {
        if (categories.length > 0) {
            resolve(categories);
        }
        else {
            reject("No results returned");
        }
    });
}