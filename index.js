var skills = document.getElementById("skills");
var ps = document.getElementById("ps");
var small = document.images[0];
var smallSig = document.images[1];
var big;
var bigSig;
loadsmall(small, big, "./images/bgcover.jpg", 2000);
loadsmall(smallSig, bigSig, "/images/Untitled-2.png", 1000);
//reusable small image load
function loadsmall(smallImg, bigImg, source, time) {
  bigImg = document.createElement("img");
  bigImg.onload = function () {
    smallImg.src = this.src;
  };
  setTimeout(function () {
    bigImg.src = source;
  }, time);
}

skills.onclick = function myFunction() {
  ps.classList.toggle("font");
};

var ham = document.querySelector(".hamburger");
var social_links = document.querySelector(".social-links");
var nav_overlay = document.querySelector(".nav-overlay");

ham.onclick = function myFunction() {
  ham.classList.toggle("active");
  social_links.classList.toggle("active");
  nav_overlay.classList.toggle("active");
};

document.onkeydown = function (e) {
  if (event.keyCode == 123) {
    return false;
  }
  if (e.ctrlKey && e.shiftKey && e.keyCode == "I".charCodeAt(0)) {
    return false;
  }
  if (e.ctrlKey && e.shiftKey && e.keyCode == "J".charCodeAt(0)) {
    return false;
  }
  if (e.ctrlKey && e.keyCode == "U".charCodeAt(0)) {
    return false;
  }
  if (e.ctrlKey && e.keyCode == "C".charCodeAt(0)) {
    return false;
  }
  if (e.ctrlKey && e.keyCode == "X".charCodeAt(0)) {
    return false;
  }
  if (e.ctrlKey && e.keyCode == "Y".charCodeAt(0)) {
    return false;
  }
  if (e.ctrlKey && e.keyCode == "Z".charCodeAt(0)) {
    return false;
  }
  if (e.ctrlKey && e.keyCode == "V".charCodeAt(0)) {
    return false;
  }
  if (e.keyCode == 67 && e.shiftKey && (e.ctrlKey || e.metaKey)) {
    return false;
  }
  if (e.keyCode == "J".charCodeAt(0) && e.altKey && (e.ctrlKey || e.metaKey)) {
    return false;
  }
  if (e.keyCode == "I".charCodeAt(0) && e.altKey && (e.ctrlKey || e.metaKey)) {
    return false;
  }
  if (
    (e.keyCode == "V".charCodeAt(0) && e.metaKey) ||
    (e.metaKey && e.altKey)
  ) {
    return false;
  }
  if (e.ctrlKey && e.shiftKey && e.keyCode == "C".charCodeAt(0)) {
    return false;
  }
  if (e.ctrlKey && e.keyCode == "S".charCodeAt(0)) {
    return false;
  }
  if (e.ctrlKey && e.keyCode == "H".charCodeAt(0)) {
    return false;
  }
  if (e.ctrlKey && e.keyCode == "A".charCodeAt(0)) {
    return false;
  }
  if (e.ctrlKey && e.keyCode == "F".charCodeAt(0)) {
    return false;
  }
  if (e.ctrlKey && e.keyCode == "E".charCodeAt(0)) {
    return false;
  }
};
if (document.addEventListener) {
  document.addEventListener(
    "contextmenu",
    function (e) {
      e.preventDefault();
    },
    false
  );
} else {
  document.attachEvent("oncontextmenu", function () {
    window.event.returnValue = false;
  });
}
