//section:query selector variables go here 👇
let resortList = document.getElementById("resort-list");
let passList = document.getElementById("pass-list");
let profileModal = document.getElementById("profile-modal");
let allInputElements = document.querySelectorAll("input");
let nameInput = document.getElementById("name-input");
let emailInput = document.getElementById("email-input");
let addressInput = document.getElementById("address-input");
let memberCreatedDateInput = document.getElementById("member-created-date");
let saveNameIcon = document.getElementById("save-name-icon");
let saveEmailIcon = document.getElementById("save-email-icon");
let saveAddressIcon = document.getElementById("save-address-icon");
let allIconElements = document.querySelectorAll("i");
let allButtonElements = document.querySelectorAll("button");
let passSelectedContainer = document.getElementById(
  "passes-selected-container"
);
let passInput = document.getElementById("passes-input");
let savePassIcon = document.getElementById("save-passes-icon");
let resortSelectedContainer = document.getElementById(
  "resorts-selected-container"
);
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
passSelectedContainer.addEventListener("click", deletePassResort);
resortSelectedContainer.addEventListener("click", deletePassResort);
deleteProfileButton.addEventListener("click", confirmDeleteLocalStorage);
addressInput.addEventListener("input", () =>
  fetchMapquestCreateAutoComplete(addressInput)
); //SEE UTILS.JS
saveButtonElement.addEventListener("click", getAllProfileInput);
saveNameIcon.addEventListener("click", getUniqueProfileInput);
saveEmailIcon.addEventListener("click", getUniqueProfileInput);
saveAddressIcon.addEventListener("click", getUniqueProfileInput);
savePassIcon.addEventListener("click", getUniqueProfileInput);
saveResortIcon.addEventListener("click", getUniqueProfileInput);

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
      nameInput.classList.add("placeholder-color");
    }
    if (skiProfile.email) {
      emailInput.setAttribute("placeholder", skiProfile.email);
      emailInput.classList.add("placeholder-color");
    }
    if (skiProfile.address) {
      addressInput.setAttribute("placeholder", skiProfile.address);
      addressInput.classList.add("placeholder-color");
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
    deleteProfileButton.removeAttribute("disabled");
  }
}

//GET ALL INPUT
function getAllProfileInput() {
  //GET INPUT IF SAVE PROFILE BUTTON IS CLICKED
  let currentInput = {};

  allInputElements.forEach((element) => {
    currentInput[element.name.trim()] = element.value.trim();
  });

  isInputValid(event, currentInput);
}

function getUniqueProfileInput(event) {
  //GET INPUT IF EDIT BUTTONS ASIDE INPUT BARS ARE CLICKED
  //SHOULD REFACTOR TO COMBINE WITH getAllProfileInput function
  let selectedElementValue = [];
  if (event.target.classList.contains("name")) {
    selectedElementValue = document.getElementsByName("name");
  } else if (event.target.classList.contains("email")) {
    selectedElementValue = document.getElementsByName("email");
  } else if (event.target.classList.contains("address")) {
    selectedElementValue = document.getElementsByName("address");
  } else if (event.target.classList.contains("passes")) {
    selectedElementValue = document.getElementsByName("passes");
  } else if (event.target.classList.contains("resorts")) {
    selectedElementValue = document.getElementsByName("resorts");
  }

  let currentInput = {};

  selectedElementValue.forEach((element) => {
    currentInput[element.name.trim()] = element.value.trim();
  });

  isInputValid(event, currentInput);
}

function isInputValid(event, currentInput) {
  //DETERMINE IF INPUT IS VALID
  //** SHOULD REFACTOR THIS FUNCTION ***//
  let valid = [];
  let isValid = true;
  let isStorage = false;
  let isPassValid = false;
  let isResortValid = false;
  let isEmailValid = true;
  let emailFormatRegex = /[A-Za-z0-9]+@[a-z]+\.[a-z]{2,3}/g; //email validation

  //IS EMAIL INVALID
  if (currentInput.email) {
    //IF isEmailValid = NULL IT IS NOT VALID
    isEmailValid = currentInput.email.match(emailFormatRegex);
  }

  //IF EMAIL INVALID RENDER MODAL, RETURN
  if (isEmailValid === null) {
    isValid = false;
    renderValidationModal(
      event,
      `Email Not Valid`,
      `Pleae enter valid email (i.e. example@email.com)`,
      isValid,
      isEmailValid
    );
    emailInput.value = ""; //reset email value
    return;
  }

  //VALIDATE IF INPUT IS BLANK OR IS A DROP DOWN
  Object.keys(currentInput).forEach((element) => {
    currentInput[element] !== "" && currentInput[element] !== "none"
      ? valid.push(true)
      : valid.push(false);
    //IF CURRENT ELEMENT EMPTY RENDER WARNING ALERT
    if (currentInput[element] === "") {
      invalidNameEmailAddressAlert(event, element);
    }
  });

  //APPEND DROPDOWN SELECTION TO INPUT
  let appendSelectDropdown = {};
  Object.keys(currentInput).length > 1
    ? (appendSelectDropdown = getDropDownInput(currentInput))
    : (appendSelectDropdown = currentInput);

  //DETERMINE VALUES TO TEST IF INPUT IS VALID
  getLocalStorage() ? (isStorage = true) : (isStorage = false);
  valid.includes(true) ? (isValid = true) : (isValid = false); //todo
  document.getElementsByName("passes")[0].value === "none"
    ? (isPassValid = false)
    : (isPassValid = true);
  document.getElementsByName("resorts")[0].value === "none"
    ? (isResortValid = false)
    : (isResortValid = true);

  //IF NO NAME EMAIL ADDRESS BUT LOCAL STORAGE EXISTS ALLOW PASS INPUT
  if (
    isValid === false &&
    isStorage === true &&
    (isPassValid === true || isResortValid === true)
  ) {
    isValid = true;
  } else if (isValid === false) {
    //IF NO NAME EMAIL ADDRESS DON'T ALLOW INPUT
    isValid = false;
  }

  //IF NOT VALID, RENDER MODAL
  if (!isValid) {
    renderValidationModal(
      event,
      `Input Not Valid`,
      `Pleae enter name, email or address.`,
      isValid
    );
  }
  //IF VALID PROCESS INPUT TO RENDER AND SAVE
  if (isValid) {
    processInput(appendSelectDropdown);
  }
}

function invalidNameEmailAddressAlert(event, field) {
  //EMAIL VALIDATION SPECIAL CASE
  // if (event.target.classList.contains('email') && )

  //RENDER AND SAVE NAME EMAIL ADDRESS INPUT
  if (event.target.classList.contains(field)) {
    document
      .getElementById(`alert-${field}-invalid`)
      .classList.remove("is-hidden"); //render invalid alert
    resetNameEmailAddress(field); //clear/reset values
    hideAlertTimeOut(field);
  }
}

function renderValidationModal(event, title, body, isValid, isEmailValid) {
  if (
    isEmailValid === null ||
    (event.target.classList.contains("save-button") && !isValid)
  ) {
    launchValidationModal(title, body, "profileSaveButton");
  }
}

function getDropDownInput(currentInput) {
  //ADD DROP DOWN MENU SELECTION TO THE INPUT OBJECT CURRENT INPUT
  let selectOption = document.querySelectorAll("select");
  selectOption.forEach((element) => {
    currentInput[element.name] = element.value.trim();
  });
  return currentInput;
}

//PROCESS THE INPUT
function processInput(currentInput) {
  Object.keys(currentInput).forEach((element) => {
    //IF VALUE OF CURRENT INPUT IS NOT BLANK OR EQUAL TO DROP DOWN NONE VALUE
    if (currentInput[element] !== "" && currentInput[element] !== "none") {
      processNameEmailAddressInput(element, currentInput[element]);
      processPassResortInput(element, currentInput[element]);
    }
  });
}

function processNameEmailAddressInput(field, input) {
  if (field !== "passes" && field !== "resorts") {
    renderValidNameEmailAddress(field, input);
    hideAlertTimeOut(field);
    setLocalStorage(field, input);
    createMemberSinceDate();
    resetNameEmailAddress(field); //clear/reset values
    enableNameEmailAddress();
    deleteProfileButton.removeAttribute("disabled");
  }
}

function processPassResortInput(field, input) {
  let skiProfile = getLocalStorage();
  if (
    skiProfile &&
    (field === "passes" || field === "resorts") &&
    !skiProfile[field].includes(input)
  ) {
    skiProfile[field].push(input);
    resetPassResortContainer(field);
    setLocalStorage(field, skiProfile[field]);
    renderPassOrResorts(skiProfile[field], field);
  }
}

//RENDER & SAVE VALID NAME EMAIL ADDRESS INPUT
function renderValidNameEmailAddress(field, input) {
  if (field !== "passes" && field !== "resorts") {
    document
      .getElementById(`alert-${field}-invalid`)
      .classList.add("is-hidden"); //ensure invalid alert is hidden
    document
      .getElementById(`alert-${field}-valid`)
      .classList.remove("is-hidden"); //render valid alert

    field === "email"
      ? (emailInput.setAttribute("placeholder", input),
        emailInput.classList.add("placeholder-color"))
      : field === "name"
      ? (nameInput.setAttribute("placeholder", input),
        nameInput.classList.add("placeholder-color"))
      : (addressInput.setAttribute("placeholder", input),
        addressInput.classList.add("placeholder-color")); //set placeholder to input value

    //swap disk and check icon to confirm valid
    allButtonElements.forEach((element) => {
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
  if (field !== "passes" && field !== "resorts") {
    setTimeout(() => {
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
    let createdDate = moment().format("MMMM D, YYYY");
    setLocalStorage("memberDate", createdDate);
    memberCreatedDateInput.textContent = `Member Since: ${createdDate}`;
    memberCreatedDateInput.classList.remove("is-hidden");
    return memberCreatedDateInput;
  }
}

function enableNameEmailAddress() {
  allButtonElements.forEach((element) => {
    if (element.classList.contains(`input`)) {
      element.removeAttribute("disabled");
      element.classList.add("is-primary");
    }
  });
}

function disableNameEmailAddress() {
  allButtonElements.forEach((element) => {
    if (element.classList.contains(`input`)) {
      element.setAttribute("disabled", "true");
      element.classList.remove("is-primary");
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
  let sortedPassResortList = sortUtility(appendedPassOrResortList);

  sortedPassResortList.forEach((element) => {
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
    createPassResortDefaultContainer("selectedUpdate", selectedList);
  }
  if (selectedList !== "passes" && selectedList !== "resorts") {
    document
      .getElementById(`alert-${selectedList}-invalid`)
      .classList.add("is-hidden"); //ensures invalid alert is hidden
  }
}

//DELETE PASS OR RESORTS
function deletePassResort(event) {
  if (event.target.matches("button")) {
    event.target.parentNode.remove(); //remove resorts/pass from DOM

    let skiProfile = JSON.parse(localStorage.getItem("ski-profile"));
    let targetList = event.target.parentNode.classList.contains("passes")
      ? skiProfile.passes
      : skiProfile.resorts;
    let key = event.target.parentNode.classList.contains("passes")
      ? "passes"
      : "resorts";

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
  validationModal.classList.remove("is-active");

  localStorage.removeItem("ski-profile"); //clear storage
  localStorage.removeItem("userCurrentPosition");

  //reset name and email
  nameInput.setAttribute("placeholder", "Enter first & last name");
  emailInput.setAttribute("placeholder", "Enter valid email");
  addressInput.setAttribute("placeholder", "Street, City, State, Zipcode");
  nameInput.classList.remove("placeholder-color");
  emailInput.classList.remove("placeholder-color");
  addressInput.classList.remove("placeholder-color");
  nameInput.value = "";
  emailInput.value = "";
  addressInput.value = "";

  //reset pass resort container
  createPassResortDefaultContainer("deleteProfile");

  //hide member create date
  memberCreatedDateInput.classList.add("is-hidden");

  nameInput.focus();

  disableNameEmailAddress();
  deleteProfileButton.setAttribute("disabled", "true");
  loadPassList();
  loadResortList();
}

function createPassResortDefaultContainer(source, list) {
  let defaultList = ["passes", "resort"];

  if (source === "deleteProfile") {
    defaultList.forEach((element) => {
      if (element === "passes") {
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
    });
  }

  if (source === "selectedUpdate") {
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

//UTILITY FUNCTIONS
function sortUtility(listToSort) {
  let sortedList = listToSort.sort(function (a, b) {
    const nameA = a.toUpperCase(); //ignore upper and lowercase
    const nameB = b.toUpperCase(); //ignore upper and lowercase
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }
    //names must be equal
    return 0;
  });
  return sortedList;
}
