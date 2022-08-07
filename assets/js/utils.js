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
  document.location = sessionStorage.getItem("returnPage");
  //document.referrer ? (window.location = document.referrer) : history.back();
}

// RENDER PROFILE MODAL FROM HOME PAGE OR DASHBOARD PAGE BUTTON CLICK; SEE DASHBOARD JS OR HOMEPAGE JS FOR EVENT LISTENER
function renderProfileModal() {
  location.href = "./profile.html";
}

function closeProfileModal(event) {
  if (event.keyCode === 27 || event.target.classList.contains("modal-close")) {
    renderLastPage();
  }
}

// API CALLS TO MAPQUEST FOR LOCATION AUTOCOMPLETE USING JQUERY
function fetchMapquestCreateAutoComplete(addressElement) {
  // console.log('1= ', addressElement);
  let input = addressElement.value;
  if (input.length > 1) {
    let key = config.MAPQUEST_KEY;
    // let key = '4ZMjXMriBP2RCLfjPje8VGED1Ekhbm2i';
    let limit = 15;
    let collection = "adminArea,poi,address,category,franchise,airport";
    let urlSlug = `https://www.mapquestapi.com/search/v3/prediction?key=${key}&limit=${limit}&collection=${collection}&q=${input}`;
    fetchMapQuestSearchAhead(urlSlug, addressElement);
    // return urlSlug;
  }
}

function fetchMapQuestSearchAhead(mapquestUrlSlug, addressElement) {
  //need to run in vs live server
  // console.log('2= ', addressElement);
  fetch(mapquestUrlSlug) //todo: fetch code in production
    .then((response) => {
    if (response.ok) {
      response.json().then((data) => {
        createAutoCompleteList(data.results, addressElement);
      });
    } else {
      // console.log('Error 1:', error);
    }
  })
  .catch((error) => {
    // console.log('Error 2:', error);
  });

  //TO USE TEST DATA - USE LINE BELOW, COMMENT OUT FETCH ABOVE
  createAutoCompleteList(testAutoComplete, addressElement); //todo test data/code
}

function createAutoCompleteList(results, addressElement) {
  let autoCompleteDisplayString = [];
  results.forEach((element) => {
    autoCompleteDisplayString.push(element.displayString);
  });
  showAutoCompleteLocationList(autoCompleteDisplayString, addressElement);
}

function showAutoCompleteLocationList(
  autoCompleteDisplayString,
  addressElement
) {
  //Use jQuery UI autocomplete
  // console.log(addressElement.getAttribute('id'));
  let addressElementIdString = addressElement.getAttribute("id");
  // console.log('4= ', addressElement);
  // $("#txtStartAddress").autocomplete({
  $("#" + addressElementIdString).autocomplete({
    minLength: 2,
    source: autoCompleteDisplayString,
  });
}

// VALIDATION MODAL
let validationModal = document.getElementById("validation-modal");
let modalTitle = document.getElementById("modal-title");
let modalBody = document.getElementById("modal-body");
let weatherWrapper = document.getElementById("weather-wrapper");

let deleteButton = document.getElementById("delete-button");
let cancelButton = document.getElementById("cancel-button");

function launchValidationModal(title, body, source) {
  // console.log(source);

  validationModal.classList.add("is-active"); //displays modal
  modalTitle.textContent = title; //adds title
  modalBody.textContent = body; //adds content

  // if (source === "weather") {weatherWrapper.classList.add('hide')}; //hides element with no info

  if (source === "profileDeleteButton") {
    deleteButton.classList.remove("hide");
    cancelButton.classList.remove("hide");
  } else {
    deleteButton.classList.add("hide");
    cancelButton.classList.add("hide");
  }

  if (source === "weather") {
    weatherWrapper.classList.add("hide"); //hides element with no info
  } else if (
    source === "staticmap-wrapper" ||
    source === "powmeter-wrapper" ||
    source === "directions-wrapper"
  ) {
    document.getElementById(source).classList.add("hide");
  }
}

let closeModal = document.getElementById("close-modal");
closeModal.addEventListener("click", exitValidationModal);

function exitValidationModal() {
  // console.log('close modal');
  validationModal.classList.remove("is-active");
}

// STEP #1: Create document getelement for the element you'll want to hide
//  i.e let weatherWrapper = document.getElementById('weather-wrapper');

// STEP #2: Install the launchValidationModal(title, body, source) in your error statement
//  i.e. launchValidationModal("Opps Didn't Find Weather", "Try again later", "weather");

// STEP #3: Add conditiional to the launchValidationModal function to hide the element from step #1
//  i.e. if (source === "weather") {weatherWrapper.classList.add('hide')}; //hides element with no info

// STEP #4: Make sure it all works. I didn't launch the actual fetch (didn't want to make api calls), I just put it inside the fetch function. One I finished I put it in the fetch conditional.

// STEP #5: Test the close button. I think it will work bases on the closeModal code in the utils.js file. It works that way for me.
