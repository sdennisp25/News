// Dependencies
var express = require("express");
var exphbs = require("express-handlebars");
var axios = require("axios");
var cheerio = require("cheerio");
var logger = require("morgan");
var mongoose = require("mongoose");
var db = require("./models");
var app = express();
var PORT = process.env.PORT || 8080; //PORT set by Heroku

app.engine(
  "handlebars",
  exphbs({
    defaultLayout: "main"
    // partialsDir: path.join(__dirname, "views/partials")
  })
);
app.set("view engine", "handlebars");

// =====================================================

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// app.use("public", express.static(__dirname + "/public/app"));

// =====================================================

// Connect to the Mongo DB
var MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
mongoose.connect(
  MONGODB_URI,
  { useNewUrlParser: true }
);

// =====================================================

// A GET route for scraping the echoJS website
app.get("/scrape", function(req, res) {
  axios.get("http://www.echojs.com/").then(function(response) {
    var $ = cheerio.load(response.data);

    $("article h2").each(function(i, element) {
      var result = {}; //created empty object

      //saving as properties for result object
      result.title = $(this)
        .children("a")
        .text();
      result.link = $(this)
        .children("a")
        .attr("href");

      // Create a new Article using the `result` object built from scraping

      db.Article.create(result)
        .then(function(dbArticle) {
          // console.log(dbArticle);
        })
        .catch(function(err) {
          console.log(err);
        });
    });
    res.send("Scrape Complete");
  });
});

// =====================================================

app.get("/articles", function(req, res) {
  // Grab every document in the Articles collection

  db.Article.find({})
    .then(function(dbArticle) {
      console.log(dbArticle);
      res.render("news", { news: dbArticle });
    })
    .catch(function(err) {
      res.json(err);
    });
});

// =====================================================

app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// =====================================================
app.post("/add", function(req, res) {
  db.Note.create(req.body)
    .then(function(dbNote) {
      return db.Article.findOneAndUpdate(
        {},
        { $push: { notes: dbNote._id } },
        { new: true }
      );
    })
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.get("/savedArticles", function(req, res) {
	// db.SavedArticle.create({})
	// .then(function(dbArticle) {
	// 	console.log(dbArticle);
	// })
	// .catch(function(err) {
	// 	console.log(err);
	// });

  db.Article.find({})
    .populate("note")
    .then(function(dbArticle) {
      res.render("saved", { saved: dbArticle });
    })
    .catch(function(err) {
      res.json(err);
    });
});

// =====================================================

app.listen(PORT, function() {
  console.log("Server listening on: http://localhost:" + PORT);
});
