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

// // API CALLS TO MAPQUEST FOR LOCATION AUTOCOMPLETE USING JQUERY
function fetchMapquestCreateAutoComplete() {
  let input = txtStartAddress.value;
  if (input.length > 1) {
    let key = '4ZMjXMriBP2RCLfjPje8VGED1Ekhbm2i';
    let limit = 5;
    let collection = 'adminArea,poi,address,category,franchise,airport';
    let urlSlug = `https://www.mapquestapi.com/search/v3/prediction?key=${key}&limit=${limit}&collection=${collection}&q=${input}`
    fetchMapQuestSearchAhead(urlSlug)
    return urlSlug;
  }
}

function fetchMapQuestSearchAhead(mapquestUrlSlug) { //need to run in vs live server
  fetch(mapquestUrlSlug)
    .then((response) => {
    if (response.ok) {
      response.json().then((data) => {
        createAutoCompleteList(data.results);
      });
    } else {
      console.log('Error 1:', error);
    }
  })
  .catch((error) => {
    console.log('Error 2:', error);
  });
}

function createAutoCompleteList(results) {
  let autoCompleteDisplayString = [];
  results.forEach(element => {
    autoCompleteDisplayString.push(element.displayString);
  })
  showAutoCompleteLocationList(autoCompleteDisplayString);
}

function showAutoCompleteLocationList(autoCompleteDisplayString) { //Use jQuery UI autocomplete
  $("#txtStartAddress").autocomplete({
    minLength: 2,
    source: autoCompleteDisplayString,
  });
}