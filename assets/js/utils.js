// Function to remove all child nodes
function removeAllChildNodes(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}

function isLatLong(coords) {
  let arrCoords = coords.split(",");
  if (
    arrCoords.length !== 2 ||
    isNaN(parseFloat(arrCoords[0])) ||
    isNaN(parseFloat(arrCoords[0]))
  ) {
    return false;
  } else {
    return true;
  }
}

// RENDER PROFILE MODAL FROM HOME PAGE OR DASHBOARD PAGE BUTTON CLICK; SEE DASHBOARD JS OR HOMEPAGE JS FOR EVENT LISTENER
function renderProfileModal() {
  location.href = "./profile.html"
}