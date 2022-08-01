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