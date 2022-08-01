//section:query selector variables go here 👇
let profileButton = document.getElementById('profile-button');
let profileModal = document.getElementById('profile-modal');
let nameInput = document.getElementById('name-input');
let emailInput = document.getElementById('email-input');
let addressInput = document.getElementById('address-input');
let memberCreatedDateInput = document.getElementById('member-created-date');
let saveNameIcon = document.getElementById('save-name-icon');
let saveEmailIcon = document.getElementById('save-email-icon');
let saveAddressIcon = document.getElementById('save-address-icon');
let allIconElements = document.querySelectorAll('i');
let passSelectedContainer = document.getElementById('pass-selected-container');
let passInput = document.getElementById('pass-input');
let savePassIcon = document.getElementById('save-pass-icon');
let resortSelectedContainer = document.getElementById('resort-selected-container');
let resortInput = document.getElementById('resort-input');
let saveResortIcon = document.getElementById('save-resort-icon');
let deleteProfileButton = document.getElementById('delete-profile-button');

//section:global variables go here 👇

//section:event listeners go here 👇
saveNameIcon.addEventListener('click', () => saveNameEmailAddressInput(event, "name"));
saveEmailIcon.addEventListener('click', () => saveNameEmailAddressInput(event, "email"));
saveAddressIcon.addEventListener('click', () => saveNameEmailAddressInput(event, "address"));
passSelectedContainer.addEventListener('click', deletePassResort);
resortSelectedContainer.addEventListener('click', deletePassResort);
savePassIcon.addEventListener('click', () => savePassInput('pass'));
saveResortIcon.addEventListener('click', () => savePassInput('resort'));
deleteProfileButton.addEventListener('click', clearLocalStorage);
profileButton.addEventListener('click', loadProfileFromStorage);
// document.addEventListener('click', (event) => console.log(event.target));

//section:functions and event handlers go here 👇
function loadProfileFromStorage() {
  // console.log('profile button');

  profileModal.classList.add('is-active'); //render profile modal

  let skiProfile = getLocalStorage();

  if (skiProfile) {
    //set placeholder data
    if (skiProfile.name) {nameInput.setAttribute('placeholder', skiProfile.name)};
    if (skiProfile.email) {emailInput.setAttribute('placeholder', skiProfile.email)};
    if (skiProfile.address) {addressInput.setAttribute('placeholder', skiProfile.address)};

    if (skiProfile.memberDate) {
      memberCreatedDateInput.textContent = `Member Since: ${skiProfile.memberDate}`;
      memberCreatedDateInput.classList.remove('is-hidden');
    }

    // skiProfile.passes ?
    let passList = skiProfile.passes;
    let resortList = skiProfile.resorts;

    if (passList.length > 0) {
      // console.log('passes'),
      passSelectedContainer.textContent = "",
      passList.forEach(element => {
        let passSelectedElement = document.createElement('div');
        passSelectedElement.classList.add("box", "is-primary", "notification", "passes");
        passSelectedContainer.setAttribute("style", "height: 150px; overflow: scroll");
        // resortSelectedContainer.setAttribute("style", "height: 150px; overflow: scroll");
  
        let deleteButton = document.createElement('button');
        deleteButton.classList.add("delete", "is-normal");
  
        passSelectedElement.textContent = element;
  
        passSelectedContainer.append(passSelectedElement);
        passSelectedElement.append(deleteButton);
      })
    }

    // skiProfile.resorts ? 
    if (skiProfile.resorts.length > 0) {
      console.log('resorts'),
      resortSelectedContainer.textContent = "",
      resortList.forEach(element => {
        let resortSelectedElement = document.createElement('div');
        resortSelectedElement.classList.add("box", "is-primary", "notification", "resorts");
        resortSelectedContainer.setAttribute("style", "height: 150px; overflow: scroll");
  
        let deleteButton = document.createElement('button');
        deleteButton.classList.add("delete", "is-normal");
  
        resortSelectedElement.textContent = element;
  
        resortSelectedContainer.append(resortSelectedElement);
        resortSelectedElement.append(deleteButton);
      })
    }
  }
}

function saveNameEmailAddressInput(event, field) {
  // console.log(field);
  
  let input = "";
  let validInput = false;
  let mailFormatRegex = /[A-Za-z0-9]+@[a-z]+\.[a-z]{2,3}/g; //email validation
  
  //get input
  field === "email" ? input = emailInput.value : field === "name" ? input = nameInput.value : input = addressInput.value
  
  //validate input
  field === 'email' ? validInput = emailInput.value.match(mailFormatRegex) : validInput = (input && input.trim() !== "");
  
  if (validInput) {
    document.getElementById(`alert-${field}-invalid`).classList.add('is-hidden'); //ensure invalid alert is hidden
    document.getElementById(`alert-${field}-valid`).classList.remove('is-hidden'); //render valid alert

    field === "email" ? emailInput.setAttribute("placeholder", input) : field === "name" ? nameInput.setAttribute("placeholder", input) : addressInput.setAttribute("placeholder", input);//set placeholder to input value

    //swap disk and check icon to confirm valid
    allIconElements.forEach(element => {
      if (element.classList.contains(`${field}-disk`)) {element.classList.toggle('is-hidden')};
      if (element.classList.contains(`${field}-check`)) {element.classList.toggle('is-hidden')};
    })

    //after 1 second hide check icon, render disk icon, hide alert message
    setTimeout(() => {
      allIconElements.forEach(element => {
      if (element.classList.contains(`${field}-disk`)) {element.classList.toggle('is-hidden')};
      if (element.classList.contains(`${field}-check`)) {element.classList.toggle('is-hidden')};
      document.getElementById(`alert-${field}-valid`).classList.add('is-hidden');
    })
    }, 1000);
    //save to local storage

    setLocalStorage(field, input);
    createMemberSinceDate();
    //clear value
    field === "email" ? emailInput.value = "" : field === "name" ? nameInput.value = "" : addressInput.value = "";

  } else {
    //render invalid alert
    document.getElementById(`alert-${field}-invalid`).classList.remove('is-hidden');
    //focus cursor for input field
    field === "email" ? emailInput.focus() : field === "name" ? nameInput.focus() : addressInput.focus();
    //clear value
    field === "email" ? emailInput.value = "" : field === "name" ? nameInput.value = "" : addressInput.value = "";
    
  }
}

function savePassInput(selectedList) {
  let skiProfile = JSON.parse(localStorage.getItem('ski-profile'));

  if (skiProfile) {
    let passSelected = skiProfile ? skiProfile.passes : [];
    let resortSelected = skiProfile ? skiProfile.resorts : [];

    let selectOption = document.querySelectorAll('select');

    // console.log(event, event.target)
    selectOption.forEach(element => {
      // console.log('selectedOption', selectOption, element, element.getAttribute('name'))

      if (event.target.classList.contains('pass') && element.getAttribute('name') === 'pass' && !passSelected.includes(element.value)) {
        // console.log(element, element.value, passSelected, event.parentNode), 
        passSelected.push(element.value);
        setLocalStorage("passes", passSelected);

      // } else if (element.getAttribute('name') === 'resort' && !resortSelected.includes(element.value)) { //must be the resort selected
      } else if (event.target.classList.contains('resort') && element.getAttribute('name') === 'resort' && !resortSelected.includes(element.value)) { //must be the resort selected
        // console.log(element, element.value, resortSelected), 
        resortSelected.push(element.value);
        setLocalStorage("resorts", resortSelected);
      }
    });

    selectedList === "pass" ? passSelectedContainer.textContent = "" : resortSelectedContainer.textContent = "";
    passSelectedContainer.setAttribute("style", "height: 150px; overflow: scroll");
    resortSelectedContainer.setAttribute("style", "height: 150px; overflow: scroll");

    selectedList === "pass" ? (
      passSelected.forEach(element => {
        // console.log(passSelected, element);
        let passSelectedElement = document.createElement('div');
        passSelectedElement.classList.add("box", "is-primary", "notification", "passes");
  
        let deleteButton = document.createElement('button');
        deleteButton.classList.add("delete", "is-normal");
  
        passSelectedElement.textContent = element;
  
        passSelectedContainer.append(passSelectedElement);
        passSelectedElement.append(deleteButton);
      })) : (
        resortSelected.forEach(element => {
          // console.log(resortSelected, element);
          let resortSelectedElement = document.createElement('div');
          resortSelectedElement.classList.add("box", "is-primary", "notification", "resorts");
    
          let deleteButton = document.createElement('button');
          deleteButton.classList.add("delete", "is-normal");
    
          resortSelectedElement.textContent = element;
    
          resortSelectedContainer.append(resortSelectedElement);
          resortSelectedElement.append(deleteButton);
        })
      )
      document.getElementById(`alert-${selectedList}-invalid`).classList.add('is-hidden');
    } else {
      console.log('please complete profile');
      document.getElementById(`alert-${selectedList}-invalid`).classList.remove('is-hidden');
      setTimeout(() => {
        document.getElementById(`alert-${selectedList}-invalid`).classList.add('is-hidden');
      }, 3000);
    }
  }

function createMemberSinceDate() {
  let skiProfile = getLocalStorage();
  // console.log(skiProfile);

  if (skiProfile.memberDate === "") {
    let createdDate = moment().format("MMMM D YYYY h:mm:ss a"); //todo:remove day, hours, min, sec
    setLocalStorage("memberDate", createdDate)
    memberCreatedDateInput.textContent = `Member Since: ${createdDate}`;
    memberCreatedDateInput.classList.remove('is-hidden');
    // console.log(memberCreatedDateInput.textContent);
    return memberCreatedDateInput;
  }
}

function deletePassResort(event) {
  if (event.target.matches('button')) {
    // console.log(event.target, event.target.parentNode, event.target.parentNode.classList.contains('passes'))
    event.target.parentNode.remove(); //remove resort/pass from DOM
    
    let skiProfile = JSON.parse(localStorage.getItem('ski-profile'));
    let targetList = event.target.parentNode.classList.contains('passes') ? skiProfile.passes : skiProfile.resorts;
    let key = event.target.parentNode.classList.contains('passes') ? "passes" : "resorts";

    console.log(targetList, key)
    let index = targetList.indexOf(
      event.target.parentNode.textContent.trim()
      ); //get index of pass/resort clicked

    targetList.splice(index, 1); //remove pass or resort from local storage
    
    if (targetList.length === 0) {
      let noneSelected = document.createElement('div');
      noneSelected.classList.add("notification", "is-primary");

      event.target.parentNode.classList.contains('passes') ? noneSelected.textContent = "No Passes Selected" : noneSelected.textContent = "No Resorts Selected";
      event.target.parentNode.classList.contains('passes') ? passSelectedContainer.append(noneSelected) : resortSelectedContainer.append(noneSelected);
    }

    setLocalStorage(key, targetList);
  }
}

function setLocalStorage(key, value) {
  // console.log(key, value);
  let skiProfile = {};

  // console.log(JSON.parse(localStorage.getItem("ski-profile")));

  JSON.parse(localStorage.getItem("ski-profile")) ? skiProfile = JSON.parse(localStorage.getItem("ski-profile")) : skiProfile = {name: "", email: "", address: "", memberDate: "", passes: [], resorts: [],};

  skiProfile[key] = value;
  // console.log(skiProfile);

  localStorage.setItem('ski-profile', JSON.stringify(skiProfile));
}

//LOCAL STORAGE FUNCTIONS
function getLocalStorage() {
  return JSON.parse(localStorage.getItem("ski-profile"));
}

// function setLocalStorage(searchHistory) {
  // localStorage.setItem("weatherSearchHistory", JSON.stringify(searchHistory));
// }

function clearLocalStorage() {
  console.log('clear')
  localStorage.removeItem("ski-profile"); //clear storage

  //reset name and email
  nameInput.setAttribute('placeholder', "Powder Day");
  emailInput.setAttribute('placeholder', "pow@skiallday.com");
  addressInput.setAttribute('placeholder', "5280 SkiPowder Street, City, State, Zipcode");

  //reset pass container
  passSelectedContainer.textContent = "";
  let clearPasses = document.createElement('div');
  clearPasses.classList.add("notification", "is-primary");
  clearPasses.textContent = "No Passes Selected";
  passSelectedContainer.append(clearPasses);

  //reset resort container
  resortSelectedContainer.textContent = "";
  let clearResorts = document.createElement('div');
  clearResorts.classList.add("notification", "is-primary");
  clearResorts.textContent = "No Resorts Selected";
  resortSelectedContainer.append(clearResorts);

  //hide member create date
  memberCreatedDateInput.classList.add('is-hidden');

  nameInput.focus();
}

// API CALLS TO OPEN WEATHER
function fetchMapQuestSearchAhead(myRequest) { //need to run in vs live server
  fetch(myRequest)
    .then((response) => {
    if (response.ok) {
      response.json().then((data) => {
        // console.log(data.results);
        createAutoComplete(data.results);
      });
    } else {
      console.log('Error 1:', error);
    }
  })
  .catch((error) => {
    console.log('Error 2:', error);
  });
}

//add event listner for address input
addressInput.addEventListener('input', () => {
  let input = addressInput.value;
  // console.log(input)
  if (input.length > 1) {
    let key = '4ZMjXMriBP2RCLfjPje8VGED1Ekhbm2i';
    let limit = 5;
    let collection = 'adminArea,poi,address,category,franchise,airport';
    let urlSlug = `https://www.mapquestapi.com/search/v3/prediction?key=${key}&limit=${limit}&collection=${collection}&q=${input}`
    fetchMapQuestSearchAhead(urlSlug)
  }
})

function createAutoComplete(results) {
  // console.log(results)
  let autoCompleteDisplayString = [];
  results.forEach(element => {
    // console.log(element)
    autoCompleteDisplayString.push(element.displayString);
  })
  // console.log(autoCompleteDisplayString);
  showAutoCompleteLocationList(autoCompleteDisplayString);
  return autoCompleteDisplayString;
}

//then use that array in jquery autocomplete
function showAutoCompleteLocationList(autoCompleteDisplayString) {
  // console.log('jquery', autoCompleteDisplayString);
  $("#address-input").autocomplete({
    minLength: 2,
    // source: autoCompleteList,
    source: autoCompleteDisplayString,
  });
}

addressInput.addEventListener("input", showAutoCompleteLocationList);

function testAutoComplete() {
  console.log('test')
  $( function() {
    var availableTags = [
      "ActionScript",
      "AppleScript",
      "Asp",
      "BASIC",
    ];
    $( "#address-input" ).autocomplete({
      source: availableTags
    });
  });
}

//OPEN AND CLOSE THE PROFILE MODAL - USED BULMA SUGGESTED CODE
document.addEventListener('DOMContentLoaded', () => {
  // Functions to open and close a modal
  function openModal($el) {
    $el.classList.add('is-active');
  }

  function closeModal($el) {
    $el.classList.remove('is-active');
  }

  function closeAllModals() {
    (document.querySelectorAll('.modal') || []).forEach(($modal) => {
      closeModal($modal);
    });
  }

  // Add a click event on buttons to open a specific modal
  (document.querySelectorAll('.js-modal-trigger') || []).forEach(($trigger) => {
    const modal = $trigger.dataset.target;
    const $target = document.getElementById(modal);

    $trigger.addEventListener('click', () => {
      openModal($target);
    });
  });

  // Add a click event on various child elements to close the parent modal
  (document.querySelectorAll('.modal-background, .modal-close, .modal-card-head .delete, .modal-card-foot .button') || []).forEach(($close) => {
    const $target = $close.closest('.modal');

    $close.addEventListener('click', () => {
      closeModal($target);
    });
  });

  // Add a keyboard event to close all modals
  document.addEventListener('keydown', (event) => {
    const e = event || window.event;

    if (e.keyCode === 27) { // Escape key
      closeAllModals();
    }
  });
});