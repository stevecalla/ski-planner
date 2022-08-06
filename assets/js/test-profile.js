//section:query selector variables go here 👇
let resortList = document.getElementById("resort-list");
let passList = document.getElementById("pass-list");
let profileModal = document.getElementById("profile-modal");
let allInputElements = document.querySelectorAll('input');
let nameInput = document.getElementById("name-input");
let emailInput = document.getElementById("email-input");
let addressInput = document.getElementById("address-input");
let memberCreatedDateInput = document.getElementById("member-created-date");
let saveNameIcon = document.getElementById("save-name-icon");
let saveEmailIcon = document.getElementById("save-email-icon");
let saveAddressIcon = document.getElementById("save-address-icon");
let allIconElements = document.querySelectorAll("i");
let allButtonElements = document.querySelectorAll("button");
let passSelectedContainer = document.getElementById("passes-selected-container");
let passInput = document.getElementById("passes-input");
let savePassIcon = document.getElementById("save-passes-icon");
let resortSelectedContainer = document.getElementById("resorts-selected-container");
let resortInput = document.getElementById("resorts-input");
let saveResortIcon = document.getElementById("save-resorts-icon");
let deleteProfileButton = document.getElementById("delete-profile-button");
let closeModalElement = document.getElementById("custom-close-modal");
let saveButtonElement = document.getElementById("save-button");

//section:global variables go here 👇

//section:event listeners go here 👇
window.addEventListener("load", loadProfile);
document.addEventListener("keydown", closeProfileModal);
closeModalElement.addEventListener("click", () => renderLastPage()); //SEE UTILS.JS
saveNameIcon.addEventListener("click", getAllProfileInput);
saveEmailIcon.addEventListener("click", getAllProfileInput);
saveAddressIcon.addEventListener("click", getAllProfileInput);
passSelectedContainer.addEventListener("click", deletePassResort);
resortSelectedContainer.addEventListener("click", deletePassResort);
savePassIcon.addEventListener("click", getAllProfileInput);
saveResortIcon.addEventListener("click", getAllProfileInput);
deleteProfileButton.addEventListener("click", confirmDeleteLocalStorage);
addressInput.addEventListener("input", () => fetchMapquestCreateAutoComplete(addressInput)); //SEE UTILS.JS
saveButtonElement.addEventListener("click", getAllProfileInput);

//section:functions and event handlers go here 👇
//LOAD PROFILE FROM STORAGE
function loadProfile() {
  loadResortList();
  loadPassList();
  loadProfileFromStorage();
  nameInput.focus();
}

function loadResortList() {
  resortList.textContent = "";

  //SET DEFAULT OPTION
  let resortElement = document.createElement("option");
  resortElement.setAttribute("value", "none");
  resortElement.setAttribute("selected", "true");
  resortElement.setAttribute("disabled", "true");
  resortElement.setAttribute("hidden", "true");
  resortElement.textContent = "Select a Resort";
  resortList.append(resortElement);

  skiAreas.forEach((resort) => {
    resortElement = document.createElement("option");
    resortElement.setAttribute("value", resort.name);
    resortElement.textContent = resort.name;
    resortList.append(resortElement);
  });
}

function loadPassList() {
  passList.textContent = "";
  let passListAll = ["Epic", "Ikon", "Independent"];

  //SET DEFAULT OPTION "SELECT A..." LANGUAGE
  let passElement = document.createElement("option");
  passElement.setAttribute("value", "none");
  passElement.setAttribute("selected", "true");
  passElement.setAttribute("disabled", "true");
  passElement.setAttribute("hidden", "true");
  passElement.textContent = "Select a Pass";
  passList.append(passElement);

  //LOAD PASS LIST
  passListAll.forEach((pass) => {
    passElement = document.createElement("option");
    passElement.setAttribute("value", pass);
    passElement.textContent = pass;
    passList.append(passElement);
  });
}

function loadProfileFromStorage() {
  profileModal.classList.add("is-active"); //render profile modal
  let skiProfile = getLocalStorage();
  if (skiProfile) {
    //set placeholder data
    if (skiProfile.name) {
      nameInput.setAttribute("placeholder", skiProfile.name);
    }
    if (skiProfile.email) {
      emailInput.setAttribute("placeholder", skiProfile.email);
    }
    if (skiProfile.address) {
      addressInput.setAttribute("placeholder", skiProfile.address);
    }
    if (skiProfile.memberDate) {
      memberCreatedDateInput.textContent = `Member Since: ${skiProfile.memberDate}`;
      memberCreatedDateInput.classList.remove("is-hidden");
    }
    if (skiProfile.passes.length > 0) {
      resetPassResortContainer("passes");
      renderPassOrResorts(skiProfile.passes, "passes");
    }
    if (skiProfile.resorts.length > 0) {
      resetPassResortContainer("resorts");
      renderPassOrResorts(skiProfile.resorts, "resorts");
    }
    enableNameEmailAddress();
    deleteProfileButton.removeAttribute('disabled');
  }
}

//GET ALL INPUT
function getAllProfileInput() {
  let currentInput = {};

  allInputElements.forEach(element => {
    currentInput[element.name.trim()] = element.value.trim();
  });

  isInputValid(event, currentInput);
}

function isInputValid(event, currentInput) {
  //DETERMINE IF INPUT IS VALID
  let valid = [];
  let isValid = true;
  let emailFormatRegex = /[A-Za-z0-9]+@[a-z]+\.[a-z]{2,3}/g; //email validation

  //IF EMAIL INVALID RENDER MODAL, RETURN
  if (currentInput.email !== "" && !currentInput.email.match(emailFormatRegex)) {
    isValid = false;
    console.log('email invalid')
    renderValidationModal(`Email Not Valid`, `Pleae enter valid email (i.e. example@email.com)`, isValid);
    return;
  }
  
  //VALIDATE IF INPUT IS BLANK OR IS A DROP DOWN
  Object.keys(currentInput).forEach(element => {
    currentInput[element] !== "" && currentInput[element] !== "none" ? valid.push(true): valid.push(false);
    //IF CURRENT ELEMENT EMPTY RENDER WARNING
    if (currentInput[element] === "") {
      invalidNameEmailAddress(event, element)
    }
  })

  //IF NO INPUT FOR ANY FIELDS RENDER MODAL & NO LOCAL STORAGE
  valid.includes(true) || getLocalStorage() ? isValid = true : isValid = false;
  renderValidationModal(`Input Not Valid`, `Pleae enter name, email or address.`, isValid);

  //APPEND DROPDOWN SELECTION TO INPUT
  let appendSelectDropdown = getDropDownInput(currentInput);
  if (isValid) {processInput(appendSelectDropdown)};
}

function invalidNameEmailAddress(event, field) {
  //RENDER AND SAVE NAME EMAIL ADDRESS INPUT
  console.log(event, event.target.classList, field); 
  if (event.target.classList.contains(field)) {
    console.log('not valid ', field)
    document.getElementById(`alert-${field}-invalid`).classList.remove("is-hidden"); //render invalid alert
    resetNameEmailAddress(field); //clear/reset values
    hideAlertTimeOut(field);
  }
}

function renderValidationModal(title, body, isValid) {
  if (!isValid) {
      launchValidationModal(title, body, "profileSaveButton");
  }
}

function getDropDownInput(currentInput) {
  //ADD DROP DOWN MENU SELECTION TO THE INPUT OBJECT CURRENT INPUT
  let selectOption = document.querySelectorAll('select');
  selectOption.forEach(element => {
    currentInput[element.name] = element.value.trim();
  });
  return currentInput;
}

//PROCESS THE INPUT
function processInput(currentInput) {
  Object.keys(currentInput).forEach(element => {
    //IF VALUE OF CURRENT INPUT IS NOT BLANK OR EQUAL TO DROP DOWN NONE VALUE
    if (currentInput[element] !== "" && currentInput[element] !== 'none') {
      processNameEmailAddressInput(element, currentInput[element]);
      processPassResortInput(element, currentInput[element])
    }
  })
}

function processNameEmailAddressInput(field, input) {
  if (field !== 'passes' && field !== 'resorts') {
    console.log('valid ', field)
    renderValidNameEmailAddress(field, input);
    hideAlertTimeOut(field);
    setLocalStorage(field, input);
    createMemberSinceDate();
    resetNameEmailAddress(field); //clear/reset values
    enableNameEmailAddress();
    deleteProfileButton.removeAttribute('disabled');
  }
}

function processPassResortInput(field, input) {
  let skiProfile = getLocalStorage();

  console.log(field === 'passes', field === 'resorts', skiProfile[field])
  console.log((field === 'passes' || field === 'resorts'))

  if ((field === 'passes' || field === 'resorts') && !skiProfile[field].includes(input)) {
    skiProfile[field].push(input);
    resetPassResortContainer(field);
    setLocalStorage(field, skiProfile[field]);
    renderPassOrResorts(skiProfile[field], field);
  }
}

//RENDER & SAVE VALID NAME EMAIL ADDRESS INPUT
function renderValidNameEmailAddress(field, input) {
  console.log(field)
  if (field !== 'passes' && field !== 'resorts') {
    console.log(field)
    document.getElementById(`alert-${field}-invalid`).classList.add("is-hidden"); //ensure invalid alert is hidden
    document.getElementById(`alert-${field}-valid`).classList.remove("is-hidden"); //render valid alert
  
    field === "email"
      ? emailInput.setAttribute("placeholder", input)
      : field === "name"
      ? nameInput.setAttribute("placeholder", input)
      : addressInput.setAttribute("placeholder", input); //set placeholder to input value
  
    //swap disk and check icon to confirm valid
    // allIconElements.forEach((element) => {
    allButtonElements.forEach((element) => {
      // console.log(field, element.classList)
      if (element.classList.contains(`${field}-disk`)) {
        element.classList.toggle("is-hidden");
      }
      if (element.classList.contains(`${field}-check`)) {
        element.classList.toggle("is-hidden");
      }
    });
  }
}

function hideAlertTimeOut(field, validInput) {
  if (field !== 'passes' && field !== 'resorts') {
  setTimeout(() => {
    // allIconElements.forEach((element) => {
    allButtonElements.forEach((element) => {
      if (element.classList.contains(`${field}-disk`)) {
        element.classList.remove("is-hidden");
      }
      if (element.classList.contains(`${field}-check`)) {
        element.classList.add("is-hidden");
      }
      document
        .getElementById(`alert-${field}-valid`)
        .classList.add("is-hidden");
      document
        .getElementById(`alert-${field}-invalid`)
        .classList.add("is-hidden");
    });
  }, 1000);
}
}

function resetNameEmailAddress(field) {
  field === "email"
    ? emailInput.focus()
    : field === "name"
    ? nameInput.focus()
    : addressInput.focus(); //focus input field cursor
  field === "email"
    ? (emailInput.value = "")
    : field === "name"
    ? (nameInput.value = "")
    : (addressInput.value = "");
}

function createMemberSinceDate() {
  let skiProfile = getLocalStorage();
  if (skiProfile.memberDate === "") {
    // let createdDate = moment().format("MMMM D, YYYY h:mm:ss a"); //todo:remove day, hours, min, sec
    let createdDate = moment().format("MMMM D, YYYY"); //todo:remove day, hours, min, sec
    setLocalStorage("memberDate", createdDate);
    memberCreatedDateInput.textContent = `Member Since: ${createdDate}`;
    memberCreatedDateInput.classList.remove("is-hidden");
    return memberCreatedDateInput;
  }
}

function enableNameEmailAddress() {
  allButtonElements.forEach((element) => {
    if (element.classList.contains(`input`)) {
      element.removeAttribute('disabled');
      element.classList.add('is-primary');
    }
  });
}

function disableNameEmailAddress() {
  allButtonElements.forEach((element) => {
    if (element.classList.contains(`input`)) {
      element.setAttribute('disabled', 'true');
      element.classList.remove('is-primary');
    }
  });
}

//RENDER & SAVE PASSES OR RESORTS
function resetPassResortContainer(selectedList) {
  selectedList === "passes"
    ? ((passSelectedContainer.textContent = ""),
      passSelectedContainer.setAttribute(
        "style",
        "height: 125px; overflow: scroll"
      ))
    : ((resortSelectedContainer.textContent = ""),
      resortSelectedContainer.setAttribute(
        "style",
        "height: 125px; overflow: scroll"
      ));
}

function renderPassOrResorts(appendedPassOrResortList, selectedList) {
  appendedPassOrResortList.forEach((element) => {
    let selectedElement = document.createElement("div");

    selectedElement.classList.add(
      "box",
      "notification",
      "has-text-white",
      "is-size-4",
      "custom-box-blue",
      "mb-1",
      selectedList
    );

    let deleteButton = document.createElement("button");
    deleteButton.classList.add("delete", "is-normal");

    selectedElement.textContent = element;

    selectedList === "passes"
      ? passSelectedContainer.append(selectedElement)
      : resortSelectedContainer.append(selectedElement);
    selectedElement.append(deleteButton);
  });

  if (appendedPassOrResortList.length === 0) {
    //if none selected render default containers
    // console.log('create');
    // console.log('yes')
    createPassResortDefaultContainer('selectedUpdate', selectedList);
  }

  console.log('505 =', selectedList)
  if (selectedList !== 'passes' && selectedList !== 'resorts') {
  document
    .getElementById(`alert-${selectedList}-invalid`)
    .classList.add("is-hidden"); //ensures invalid alert is hidden
  }
}

//DELETE PASS OR RESORTS
function deletePassResort(event) {
  if (event.target.matches("button")) {
    // console.log(event.target, event.target.parentNode, event.target.parentNode.classList.contains('passes'))
    event.target.parentNode.remove(); //remove resorts/pass from DOM

    let skiProfile = JSON.parse(localStorage.getItem("ski-profile"));
    let targetList = event.target.parentNode.classList.contains("passes")
      ? skiProfile.passes
      : skiProfile.resorts;
    let key = event.target.parentNode.classList.contains("passes")
      ? "passes"
      : "resorts";

    // console.log(targetList, key)
    let index = targetList.indexOf(event.target.parentNode.textContent.trim()); //get index of pass/resorts clicked

    targetList.splice(index, 1); //remove pass or resorts from local storage

    if (targetList.length === 0) {
      let noneSelected = document.createElement("div");
      noneSelected.classList.add(
        "box",
        // "notification",
        "has-text-white",
        "is-size-4",
        "custom-box-gray",
        "mb-1"
      );

      event.target.parentNode.classList.contains("passes")
        ? (noneSelected.textContent = "No Passes Selected")
        : (noneSelected.textContent = "No Resorts Selected");
      event.target.parentNode.classList.contains("passes")
        ? passSelectedContainer.append(noneSelected)
        : resortSelectedContainer.append(noneSelected);
    }

    setLocalStorage(key, targetList);
  }
}

//LOCAL STORAGE FUNCTIONS
function getLocalStorage() {
  return JSON.parse(localStorage.getItem("ski-profile"));
}

function setLocalStorage(key, value) {
  let skiProfile = {
    name: "",
    email: "",
    address: "",
    memberDate: "",
    passes: [],
    resorts: [],
  };
  let storedProfile = getLocalStorage();

  storedProfile ? (skiProfile = storedProfile) : (storedProfile = skiProfile); //if local storage exits use it, else create stored object

  skiProfile[key] = value; //add key & value to local storage
  localStorage.setItem("ski-profile", JSON.stringify(skiProfile)); //set local storatge
}

function confirmDeleteLocalStorage() {
  // let deleteButton = document.getElementById('delete-button');
  // let cancelButton = document.getElementById('cancel-button');

  cancelButton.addEventListener("click", (event) => {
    validationModal.classList.remove("is-active");
  });

  launchValidationModal(
    `Delete Profile`,
    `Are you sure you want to delete your profile?`,
    "profileDeleteButton"
  );

  deleteButton.addEventListener("click", clearLocalStorage);
}

function clearLocalStorage() {
  // console.log("clear");
  // console.log(confirmDelete, confirmDelete === true, confirmDelete === "true");
  validationModal.classList.remove("is-active");

  localStorage.removeItem("ski-profile"); //clear storage
  localStorage.removeItem("userCurrentPosition");

  //reset name and email
  nameInput.setAttribute("placeholder", "Enter first & last name");
  emailInput.setAttribute("placeholder", "Enter valid email");
  addressInput.setAttribute(
    "placeholder",
    "Street, City, State, Zipcode"
  );
  nameInput.value = "";
  emailInput.value = "";
  addressInput.value = "";

  //reset pass resort container
  createPassResortDefaultContainer('deleteProfile');

  //hide member create date
  memberCreatedDateInput.classList.add("is-hidden");

  nameInput.focus();

  disableNameEmailAddress();
  deleteProfileButton.setAttribute('disabled', 'true');
  loadPassList();
  loadResortList();
}

function createPassResortDefaultContainer(source, list) {
  let defaultList = ['passes', 'resort'];

  if (source === 'deleteProfile') {
    defaultList.forEach(element => {
      if (element === 'passes') {
        let defaultContainer = document.createElement("div");
        defaultContainer.classList.add(
          "box",
          "has-text-white",
          "is-size-4",
          "custom-box-gray",
          "mb-1"
        );
        defaultContainer.textContent = `No ${element} Selected`;
  
        passSelectedContainer.textContent = "";
        passSelectedContainer.append(defaultContainer);
      } else {
        let defaultContainer = document.createElement("div");
        defaultContainer.classList.add(
          "box",
          "has-text-white",
          "is-size-4",
          "custom-box-gray",
          "mb-1"
        );
        defaultContainer.textContent = `No ${element} Selected`;
  
        resortSelectedContainer.textContent = "";
        resortSelectedContainer.append(defaultContainer);
      }
    })
  }

  if (source === 'selectedUpdate') {
    list === "passes"
      ? (passSelectedContainer.textContent = "")
      : (resortSelectedContainer.textContent = "");
    let defaultContainer = document.createElement("div");
    defaultContainer.classList.add(
      "box",
      "has-text-white",
      "is-size-4",
      "custom-box-gray",
      "mb-1"
    );
    defaultContainer.textContent = `No ${list} Selected`;
    list === "passes"
      ? passSelectedContainer.append(defaultContainer)
      : resortSelectedContainer.append(defaultContainer);
    // })
  }
}