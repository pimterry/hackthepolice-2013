var isMobile;

if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/)) {
  isMobile = true;
  document.addEventListener("deviceready", onDeviceReady, false);
} else {
  isMobile = false;
  onDeviceReady(); // this is the browser
}
