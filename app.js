const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// hide mongoDB user info
// const uri = process.env.MONGODB_URI;
// mongoose.connect(uri);

// localhost mongoDB
mongoose.connect("mongodb://127.0.0.1:27017/wikiDB", {
  useNewUrlParser: true
});

/* Set up collection */
const articleSchema = {
    title: String,
    content: String
};
const Article = mongoose.model("Article", articleSchema);


//////////////////////////////////////////////////////////

/* Chain HTTP routes for batch manipulations */

app.route("/articles")

  // HTTP GET
  .get(function (req, res) {
    Article.find({}, function (err, foundArticles) {
      if (!err) {
        res.send(foundArticles);
      } else {
        console.log(err);
      }
    });
  })

  // HTTP POST
  // function confirmed by POSTMAN
  .post(function (req, res) {
    const newArticle = new Article({
      title: req.body.title,
      content: req.body.content,
    });
    newArticle.save(function (err) {
      if (err) {
        res.send(err);
      } else {
        res.send("Article successfully saved to database");
      }
    });
  })

  // HTTP DELETE
  .delete(function (req, res) {
    Article.deleteMany(function (err) {
      if (!err) {
        res.send("Sucessfully deleted all articles");
      } else {
        res.send(err);
      }
    });
  }
);

//////////////////////////////////////////////////////////

/* Chain routes for individual article requests */
// Note that letter capitalization matters

app.route("/articles/:articleTitle")
    .get(function (req, res) {
        Article.findOne(
            { title: req.params.articleTitle },
            function (err, foundArticle) {
                if (foundArticle) {
                    res.send(foundArticle);
                } else {
                    res.send("No article found :(");
                }
            }
        );
    })
    // update all fields
    .put(function (req, res) { 
        Article.update(
            { title: req.params.articleTitle },
            {
                title: req.body.title,
                content: req.body.content
            },
            { overwrite: true }, // !important
            function (err) {
                if (!err) {
                    res.send("Article successfully put.");
                } else {
                    res.send(err);
                }
            }
        );
    })
    .patch(function (req, res) { 
        Article.update(
          { title: req.params.articleTitle },
          { $set: req.body }, // !important
            function (err) { 
                if (!err) {
                  res.send("Article successfully patched.");
                } else {
                  res.send(err);
                }
            }
        );
    })
    .delete(function (req, res) {
        Article.deleteOne(
            { title: req.params.articleTitle },
            function (err) {
                if (!err) {
                    res.send("Article successfully put.");
                } else {
                    res.send(err);
                }
            }
        );
    });


//////////////////////////////////////////////////////////

/* Set up server */

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Our app is running on port ${PORT}`);
});