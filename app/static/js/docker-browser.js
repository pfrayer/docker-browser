$(document).ready(function() {

  // Init all data:
  var images, images_dangling, containers, containers_exited, volumes, volumes_dangling, networks, networks_dangling;

  // Load containers :
  $.ajax({
    url: "http://127.0.0.1:5000/containers",
    success: function(data) {
      containers = data.result;
      for(container in containers) {
        $('#containers').append('<div class="container active" id="'+containers[container]["Id"]+'" style="background-color: '+hashStringToColor(containers[container]["Id"])+';"><b>' + containers[container]["Id"].substring(0,12) + '</b><br/>' + container + '</div>');
      }
    }
  });

  // Load exited containers:
  $.ajax({
    url: "http://127.0.0.1:5000/containers/exited"
  }).then(function(data) {
    containers_exited = data.result;
    for(container in containers_exited) {
      $('#containers-exited').append('<div class="container exited">' + containers_exited[container]["Id"].substring(0,12) + '<br/>' + container + '</div>');
    }
  });

  // Load images :
  $.ajax({
    url: "http://127.0.0.1:5000/images"
  }).then(function(data) {
    images = data.result;
    for(image in images) {
      $('#images').append('<div class="image active" id="'+images[image]["Id"].substring(7,72)+'" style="background-color: '+hashStringToColor(images[image]["Id"])+';"><b>' + images[image]["Id"].substring(7,19) + '</b><br/>' + image +'</div>');
    }
  });

  // Load dangling images :
  $.ajax({
    url: "http://127.0.0.1:5000/images/dangling"
  }).then(function(data) {
    images_dangling = data.result;
    for(image in images_dangling) {
      $('#images-dangling').append('<div class="image dangling">' + images_dangling[image]["Id"].substring(7,19) + '<br/>&ltnone&gt:&ltnone&gt</div>');
    }
  });


  $(document).on("click", ".container", function() {
    $(".selected").removeClass("selected");
    $(".active").removeClass("active");
    $(this).addClass("selected");
    $(this).addClass("active");
    container = $(this).attr("id");
    $.ajax({
      url: "http://127.0.0.1:5000/images/used_by/"+container
    }).then(function(data) {
      image = data.result;
      $("#"+image.substring(7,72)).addClass("selected");
      $("#"+image.substring(7,72)).addClass("active");
    });
  });

  $('#refresh').click(function() {
    location.reload();
});
});


function djb2(str){
  var hash = 5381;
  for (var i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i); /* hash * 33 + c */
  }
  return hash;
}

function hashStringToColor(str) {
  var hash = djb2(str);
  var r = (hash & 0xFF0000) >> 16;
  var g = (hash & 0x00FF00) >> 8;
  var b = hash & 0x0000FF;
  return "#" + ("0" + r.toString(16)).substr(-2) + ("0" + g.toString(16)).substr(-2) + ("0" + b.toString(16)).substr(-2);
}
