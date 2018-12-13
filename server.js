// Dependencies
var express = require("express");
var exphbs = require("express-handlebars");

// Create an instance of the express app.
var app = express();

// Set the port of our application
// process.env.PORT lets the port be set by Heroku
var PORT = process.env.PORT || 8080;

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

// =====================================================

app.listen(PORT, function() {
  console.log("Server listening on: http://localhost:" + PORT);
});
