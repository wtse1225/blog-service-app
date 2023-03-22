//const fs = require('fs'); // fs module
//let posts = [];
//let categories = [];
//let postPath = './data/posts.json';
//let catPath = './data/categories.json';

// Sequalize feature added in assignment 5
const Sequelize = require('sequelize');
var sequelize = new Sequelize('eanlieow', 'eanlieow', '6cmTi523Tc14DsSwC0yE72KLkjfV5ExZ', {
    host: 'ruby.db.elephantsql.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});

// Define two data models
var Post = sequelize.define('Post', {
    body: Sequelize.TEXT,
    title: Sequelize.STRING,
    postDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN
});

var Category = sequelize.define('Category', {
    category: Sequelize.STRING
});

// Define a relationship between Post and Category models
Post.belongsTo(Category, {foreignKey: 'category'});

// A nested callbacks are used to ensure both reads are successful before returning resolve
module.exports.initialize  = () => {
    return new Promise((resolve, reject) => { 
        sequelize.sync().then(function() {
            console.log("Postgres DB successfully loaded");
            resolve();
        }).catch((err) => {
            console.log("Postgres load failed" + err);
            reject();
        })
    })
};

// return all posts
module.exports.getAllPosts = () => {
    return new Promise((resolve, reject) => {
        Post.findAll().then((data) => {
            console.log("All posts results are found");
            resolve(data);
        }).catch((err) => {
            reject("No All posts results returned" + err);
        });
    });
}

// add a function to return posts that match the query category
module.exports.getPostsByCategory = (category) => {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: { category: category}
        }).then((data) => {
            console.log("Posts by min category results found and loaded");
            resolve(data);
        }).catch((err) => {
            reject("No Posts by min category results returned" + err);
        });
    });
}

// add a function to return posts that is >= input "minDateStr"
module.exports.getPostsByMinDate = (minDateStr) => {
    return new Promise((resolve, reject) => {
        const { gte } = Sequelize.Op;

        Post.findAll({
            where: { postDate: {[gte]: new Date(minDateStr)}}
        }).then((data) => {
            console.log("Posts by min date results found and loaded")
            resolve(data);
        }).catch((err) => {
            reject("No Posts by min date results returned" + err);
        });
    });
}

// add a function to return posts that match the query id
module.exports.getPostsById = (id) => {
    return new Promise((resolve, reject) => {
        Post.findOne({
            where: { id: id } // Postgres creates the id in default
        }).then((data) => {
            console.log("Posts by ID results found and loaded")
            resolve(data);
        }).catch((err) => {
            reject("No Posts by ID results returned" + err);
        });
    });
}

// add postData to posts array
module.exports.addPost = (postData) => {
    return new Promise((resolve, reject) => {
        postData.published = (postData.published) ? true : false;
        for (let i in postData) {
            if (postData[i] === "") {
                postData[i] = null;
            }
        }
        postData.postDate = new Date();
        Post.create(postData).then(() => {
            console.log("Post added successfully");
            resolve();
        }).catch((err) => {
            console.log("Adding post failed " + err);
        });
    });
}

// add categoryData to category array
module.exports.addCategory = (categoryData) => {
    return new Promise((resolve, reject) => {
        for (let i in categoryData) {
            if (categoryData[i] === "") {
                categoryData[i] = null;
            }
        }
        Category.create(categoryData).then(() => {
            console.log("Category added successfully");
            resolve();
        }).catch((err) => {
            console.log("Adding category failed " + err);
        });
    });
}

// Added a function to delete category by input id
module.exports.deleteCategoryById = (id) => {
    return new Promise((resolve, reject) => {
        Category.destroy({
            where: {id: id}
        }).then(() => {
            console.log("Category deleted");
            resolve();
        }).catch((err) => {
            console.log("Category delete failed");
            reject();
        })
    });
}

// Added a function to delete post by input id
module.exports.deletePostById = (id) => {
    return new Promise((resolve, reject) => {
        Post.destroy({
            where: {id: id}
        }).then(() => {
            console.log("Post deleted");
            resolve();
        }).catch((err) => {
            console.log("Post delete failed");
            reject();
        })
    });
}

// return published posts
module.exports.getPublishedPosts = () => {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: { published: true}
        }).then((data) => {
            console.log("Published posts results found")
            resolve(data);
        }).catch((err) => {
            reject("No Published posts results returned" + err);
        });
    });
}

// return published posts AND by category
module.exports.getPublishedPostsByCategory = (category) => {
    return new Promise((resolve, reject) => {        
        Post.findAll({
            where: { published: true, category: category }
        }).then((data) => {
            console.log("Posts by Category results found")
            resolve(data);
        }).catch((err) => {
            reject("No Posts by Category results returned" + err);
        });
    });
}

// return all categories
module.exports.getCategories = () => {
    return new Promise((resolve, reject) => {
        Category.findAll().then((data) => {
            console.log("Categories are found")
            resolve(data);
        }).catch((err) => {
            reject("No categories returned" + err);
        });
    });
}