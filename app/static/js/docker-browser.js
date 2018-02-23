$(document).ready(function() {

  // Load containers :
  $.ajax({
    url: "http://127.0.0.1:5000/containers"
  }).then(function(data) {
    for(container in data.result) {
      $('#containers').append('<div class="container" style="background-color: #'+getRandomColor()+';"><b>' + data.result[container]["Id"].substring(0,12) + '</b><br/>' + container + '</div>');
    }
  });

  // Load images :
  $.ajax({
    url: "http://127.0.0.1:5000/images"
  }).then(function(data) {
    for(image in data.result) {
      $('#images').append('<div class="image" style="background-color: '+getRandomColor()+';"><b>' + data.result[image]["Id"].substring(7,19) + '</b><br/>' + image +'</div>');
    }
  });
});

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
