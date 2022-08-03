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

// BACK BUTTON FOR HOME & DASHBOARD PAGE
function renderLastPage() {
    history.back();
}

// RENDER PROFILE MODAL FROM HOME PAGE OR DASHBOARD PAGE BUTTON CLICK; SEE DASHBOARD JS OR HOMEPAGE JS FOR EVENT LISTENER
function renderProfileModal() {
  location.href = "./profile.html"
}

// // API CALLS TO MAPQUEST FOR LOCATION AUTOCOMPLETE USING JQUERY
function fetchMapquestCreateAutoComplete(addressElement) {
  // console.log('1= ', addressElement);
  let input = addressElement.value;
  if (input.length > 1) {
    let key = '4ZMjXMriBP2RCLfjPje8VGED1Ekhbm2i';
    let limit = 15;
    let collection = 'adminArea,poi,address,category,franchise,airport';
    let urlSlug = `https://www.mapquestapi.com/search/v3/prediction?key=${key}&limit=${limit}&collection=${collection}&q=${input}`
    fetchMapQuestSearchAhead(urlSlug, addressElement);
    // return urlSlug;
  }
}

function fetchMapQuestSearchAhead(mapquestUrlSlug, addressElement) { //need to run in vs live server
  // console.log('2= ', addressElement);
  // fetch(mapquestUrlSlug)
  //   .then((response) => {
  //   if (response.ok) {
  //     response.json().then((data) => {
  //       createAutoCompleteList(data.results, addressElement);
  //     });
  //   } else {
  //     // console.log('Error 1:', error);
  //   }
  // })
  // .catch((error) => {
  //   // console.log('Error 2:', error);
  // });

  createAutoCompleteList(testAutoComplete, addressElement);
}

function createAutoCompleteList(results, addressElement) {
  let autoCompleteDisplayString = [];
  results.forEach(element => {
    autoCompleteDisplayString.push(element.displayString);
  })
  showAutoCompleteLocationList(autoCompleteDisplayString, addressElement);
}

function showAutoCompleteLocationList(autoCompleteDisplayString, addressElement) { //Use jQuery UI autocomplete
  // console.log(addressElement.getAttribute('id'));
  let addressElementIdString = addressElement.getAttribute('id');
  // console.log('4= ', addressElement);
  // $("#txtStartAddress").autocomplete({
  $("#" + addressElementIdString).autocomplete({
    minLength: 2,
    source: autoCompleteDisplayString,
  });
}