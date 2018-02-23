$(document).ready(function() {

  // Load images :
  $.ajax({
    url: "http://127.0.0.1:5000/images"
  }).then(function(data) {
    for(image in data.result) {
      $('#images').append('<div>' + image + '</div><br>');
    }
  });

  // Load containers :
  $.ajax({
    url: "http://127.0.0.1:5000/containers"
  }).then(function(data) {
    for(container in data.result) {
      $('#containers').append('<div>' + container + '</div><br>');
    }
  });
});
