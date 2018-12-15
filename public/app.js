$.getJSON("/articles", function(data) {
	// For each one
  // for (var i = 0; i < data.length; i++) {
  //   // Display the apropos information on the page
  //   $("#articles").append("<p data-id='" +
	// 		data[0]._id + "'>" +
	// 		data[0].title + "<br/>" +
	// 		data[0].link + "</p>"
  //   );
	// }
	$("#articles").append(data);
});
