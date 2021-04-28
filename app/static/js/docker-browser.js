$(document).ready(function() {

  // Load containers :
  $.ajax({
    url: "http://"+window.location.hostname+":"+window.location.port+"/containers",
    success: function(data) {
      containers = data.result;
      for(container in containers) {
        $('#containers-active').append('<div class="container active" id="'+container+'" style="background-color:'+ hashStringToColor(container)+ ';"><b>'+ container.substring(0,12) +'</b><br/>'+ containers[container]["Name"].replace('/','') +'</div>');
      }
    }
  });
  // Load images :
  $.ajax({
    url: "http://"+window.location.hostname+":"+window.location.port+"/images"
  }).then(function(data) {
    images = data.result;
    for(image in images) {
      $('#images-active').append('<div class="image active" id="'+ image.substring(7,72) +'" style="background-color:'+ hashStringToColor(image) +';"><b>' + image.substring(7,19) + '</b><br/>' + images[image]["RepoTags"][0] +'</div>');
    }
  });
  // Load volumes :
  $.ajax({
    url: "http://"+window.location.hostname+":"+window.location.port+"/volumes"
  }).then(function(data) {
    volumes = data.result;
    for(volume in volumes) {
      $('#volumes-active').append('<div class="volume active" id="'+ volume +'" style="background-color:'+hashStringToColor(volume)+';"><b>'+ volume.substring(0,12) +'</b><br/>'+ volumes[volume]["Driver"] +'</div>');
    }
  });
  // Load networks :
  $.ajax({
    url: "http://"+window.location.hostname+":"+window.location.port+"/networks"
  }).then(function(data) {
    networks = data.result;
    for(network in networks) {
      $('#networks-active').append('<div class="network active" id="'+ network +'" style="background-color:'+ hashStringToColor(network) +';"><b>' + network.substring(0,12) + '</b><br/>' + networks[network]["Name"] +'</div>');
    }
  });

  // Load exited containers:
  $.ajax({
    url: "http://"+window.location.hostname+":"+window.location.port+"/containers/exited"
  }).then(function(data) {
    containers_exited = data.result;
    for(container in containers_exited) {
      $('#containers-exited').append('<div class="container exited">'+ container.substring(0,12) +'<br/>'+ containers_exited[container]["Name"].replace('/','') +'</div>');
    }
  });
  // Load dangling images :
  $.ajax({
    url: "http://"+window.location.hostname+":"+window.location.port+"/images/dangling"
  }).then(function(data) {
    images_dangling = data.result;
    for(image in images_dangling) {
      $('#images-dangling').append('<div class="image dangling">'+ image.substring(7,19) +'<br/>&ltnone&gt:&ltnone&gt</div>');
    }
  });
  // Load dangling volumes :
  $.ajax({
    url: "http://"+window.location.hostname+":"+window.location.port+"/volumes/dangling"
  }).then(function(data) {
    volumes = data.result;
    for(volume in volumes) {
      $('#volumes-dangling').append('<div class="volume dangling"><b>'+ volume.substring(0,12) +'</b><br/>'+ volumes[volume]["Driver"] +'</div>');
    }
  });
  // Load dangling networks :
  $.ajax({
    url: "http://"+window.location.hostname+":"+window.location.port+"/networks/dangling"
  }).then(function(data) {
    networks = data.result;
    for(network in networks) {
      $('#networks-dangling').append('<div class="network dangling"><b>' + network.substring(0,12) + '</b><br/>' + networks[network]["Name"] +'</div>');
    }
  });



  $(document).on("click", ".container", function() {
    $(".selected").removeClass("selected");
    $(".active").removeClass("active");
    $(this).addClass("selected");
    $(this).addClass("active");
    $(this).css({'box-shadow' : '0px 0px 15px '+$(this).css('background-color')})
    container = $(this).attr("id");
    $.ajax({
      url: "http://"+window.location.hostname+":"+window.location.port+"/images/used_by/"+container
    }).then(function(data) {
      image = data.result;
      $("#"+image.substring(7,72)).addClass("selected");
      $("#"+image.substring(7,72)).addClass("active");
      $("#"+image.substring(7,72)).css({'box-shadow' : '0px 0px 15px '+ $("#"+image.substring(7,72)).css('background-color') })
    });

    $.ajax({
      url: "http://"+window.location.hostname+":"+window.location.port+"/volumes/used_by/"+container
    }).then(function(data) {
      volumes = data.result;
      for(volume in volumes) {
        $("#"+volumes[volume]["Name"]).addClass("selected");
        $("#"+volumes[volume]["Name"]).addClass("active");
        $("#"+volumes[volume]["Name"]).css({'box-shadow' : '0px 0px 15px '+ $("#"+volume).css('background-color') })
      }
    });

    $.ajax({
      url: "http://"+window.location.hostname+":"+window.location.port+"/networks/used_by/"+container
    }).then(function(data) {
      networks = data.result;
      for(network in networks) {
        $("#"+networks[network]["NetworkID"]).addClass("selected");
        $("#"+networks[network]["NetworkID"]).addClass("active");
        $("#"+networks[network]["NetworkID"]).css({'box-shadow' : '0px 0px 15px '+ $("#"+networks[network]["NetworkID"]).css('background-color') })
      }
    });
  });

  $(".se-pre-con").fadeOut("slow");

  $('#refresh').click(function() {
    location.reload();
  });
});


function djb2(str){
  var hash = 7536;
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
