// Dependencies
var express = require("express");
var exphbs = require("express-handlebars");
var axios = require("axios");
var cheerio = require("cheerio");
var databaseUrl = "scraper";
var collections = ["scrapedData"];
var mongojs = require("mongojs");

var app = express();
var PORT = process.env.PORT || 8080; //PORT set by Heroku

// =====================================================
var db = mongojs(databaseUrl, collections);
db.on("error", function(error) {
  console.log("Database Error:", error);
});

// =====================================================
// Set Handlebars as the default templating engine.
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Data
var articles = [
  { name: "article 1"},
  { name: "article 2"},
  { name: "article 3"}
];

// Routes
app.get("/articles/:name", function(req, res) {
  for (var i = 0; i < articles.length; i++) {
    if (articles[i].name === req.params.name) {
      return res.render("article", articles[i]);
    }
  }
});

app.get("/articles", function(req, res) {
  res.render("news", { news: articles });
});


app.get("/scrape", function(req, res) {
  // Make a request via axios for the news section of `ycombinator`
  axios.get("https://news.ycombinator.com/").then(function(response) {
    // Load the html body from axios into cheerio
    var $ = cheerio.load(response.data);
    // For each element with a "title" class
    $(".title").each(function(i, element) {
      // Save the text and href of each link enclosed in the current element
      var title = $(element).children("a").text();
      var link = $(element).children("a").attr("href");

      // If this found element had both a title and a link
      if (title && link) {
        // Insert the data in the scrapedData db
        db.scrapedData.insert({
          title: title,
          link: link
        },
        function(err, inserted) {
          if (err) {
            // Log the error if one is encountered during the query
            console.log(err);
          }
          else {
            // Otherwise, log the inserted data
            console.log(inserted);
          }
        });
      }
    });
  });

  res.send("Scrape Complete");
});
// =====================================================

app.listen(PORT, function() {
  console.log("Server listening on: http://localhost:" + PORT);
});
