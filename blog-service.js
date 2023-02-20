const fs = require('fs'); // fs module
let posts = [];
let categories = [];
let postPath = './data/posts.json';
let catPath = './data/categories.json';

// A nested callbacks are used to ensure both reads are successful before returning resolve
module.exports.initialize  = () => {
    return new Promise((resolve, reject) => {    
        fs.readFile(postPath, 'utf8', (err, data) => {
            if (err) {
                reject("unable to read file");
            }
            else {
                posts = JSON.parse(data);

                fs.readFile(catPath, 'utf8', (err, data) => {
                    if (err) {
                        reject("unable to read file");
                    }
                    else {
                        categories = JSON.parse(data);
                        resolve('Load succeeded');
                    }
                });
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

// Part 4: step 1, add a function to return posts that match the query category
module.exports.getPostsByCategory = (category) => {
    return new Promise((resolve, reject) => {
        let catPost = posts.filter(posts => posts.category == category);  
        if (catPost.length > 0) {
            resolve(catPost);
        }
        else {
            reject("No results returned");
        }
    });
}

// Part 4: step 2, add a function to return posts that is >= input "minDateStr"
module.exports.getPostsByMinDate = (minDateStr) => {
    return new Promise((resolve, reject) => {
        let datePost = posts.filter(posts => new Date(posts.postDate) >= new Date(minDateStr));
        if (datePost.length > 0) {
            resolve(datePost);
        }
        else {
            reject("No results returned");
        }
    });
}

// Part 4: step 3, add a function to return posts that match the query id
module.exports.getPostsById = (id) => {
    return new Promise((resolve, reject) => {
        idPost = posts.filter(posts => posts.id == id);
        if (idPost.length > 0) {
            resolve(idPost);
        }
        else {
            reject("No results returned");
        }
    });
}

// Part 2: step 3, add postData to posts array
module.exports.addPost = (postData) => {
    return new Promise((resolve, reject) => {
        if (postData.published) {
            postData.published = true;
            postData.id = posts.length + 1;
            posts.push(postData);
            resolve(postData);
        }
        else {
            postData.published = false;
            reject("Upload failed");
        }
    });
}