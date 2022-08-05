//section:query selector variables go here 👇
let resortList = document.getElementById("resort-list");
let passList = document.getElementById("pass-list");
let profileModal = document.getElementById("profile-modal");
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
saveNameIcon.addEventListener("click", saveNameEmailAddressInput);
saveEmailIcon.addEventListener("click", saveNameEmailAddressInput);
saveAddressIcon.addEventListener("click", saveNameEmailAddressInput);
passSelectedContainer.addEventListener("click", deletePassResort);
resortSelectedContainer.addEventListener("click", deletePassResort);

savePassIcon.addEventListener("click", () =>
  savePassResortInput(event, "passes")
);

saveResortIcon.addEventListener("click", () =>
  savePassResortInput(event, "resorts")
);

deleteProfileButton.addEventListener("click", confirmDeleteLocalStorage);
addressInput.addEventListener("input", () =>
  fetchMapquestCreateAutoComplete(addressInput)
); // SEE UTILS.JS FOR THE FUNCTIONS TO FETCH AND RENDER AUTOCOMPLETE
closeModalElement.addEventListener("click", () => renderLastPage());
document.addEventListener("keydown", (event) => {
  if (event.keyCode === 27 || event.target.classList.contains("modal-close")) {
    renderLastPage();
  }
});
saveButtonElement.addEventListener("click", saveAllProfileSelections);

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

  //SET DEFAULT OPTION
  let passElement = document.createElement("option");
  passElement.setAttribute("value", "none");
  passElement.setAttribute("selected", "true");
  passElement.setAttribute("disabled", "true");
  passElement.setAttribute("hidden", "true");
  passElement.textContent = "Select a Pass";
  passList.append(passElement);

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
  }
}

//SAVE PROFILE BUTTON
function saveAllProfileSelections() {
  // console.log('save it');
  saveNameIcon.click();
  saveEmailIcon.click();
  saveAddressIcon.click();
  savePassIcon.click();
  saveResortIcon.click();
}

//RENDER AND SAVE NAME EMAIL ADDRESS INPUT
function saveNameEmailAddressInput(event) {
  let { field, input } = getInput(event); //get input
  let { validInput } = validateInput(field, input); //validate input

  if (validInput) {
    renderValidNameEmailAddress(field, input);
    hideAlertTimeOut(field);
    setLocalStorage(field, input);
    createMemberSinceDate();
    resetNameEmailAddress(field); //clear/reset values
    enableNameEmailAddress();
  } else {
    if (!getLocalStorage()) {
      document
        .getElementById(`alert-${field}-invalid`)
        .classList.remove("is-hidden"); //render invalid alert
      resetNameEmailAddress(field); //clear/reset values
      hideAlertTimeOut(field);
      launchValidationModal(
        `Please Complete Profile`,
        `Enter name, email and preferred address.`,
        "profileSaveButton"
      );
    }
  }
}

function getInput(event) {
  let parentNodeField = event.target.parentNode.classList;
  // console.log(nameInput.value.trim(), emailInput.value, addressInput.value);

  parentNodeField.contains("name")
    ? ((field = "name"), (input = nameInput.value.trim()))
    : parentNodeField.contains("email")
    ? ((field = "email"), (input = emailInput.value.trim()))
    : ((field = "address"), (input = addressInput.value.trim()));
  return { field, input };
}

function validateInput(field, input) {
  let validInput = false;
  let mailFormatRegex = /[A-Za-z0-9]+@[a-z]+\.[a-z]{2,3}/g; //email validation
  field === "email"
    ? (validInput = emailInput.value.match(mailFormatRegex))
    : (validInput = input && input !== "");
  return { validInput };
}

function renderValidNameEmailAddress(field, input) {
  // console.log(field)
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

function hideAlertTimeOut(field, validInput) {
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

//RENDER AND SAVE PASSES OR RESORTS
function savePassResortInput(event, selectedList) {
  let skiProfile = getLocalStorage();

  if (skiProfile) {
    let { savedPassOrResortList } = createPassOrResortFromStorage(
      skiProfile,
      selectedList
    ); //get selected list

    let { appendedPassOrResortList } = appendCurrentSelection(
      event,
      selectedList,
      savedPassOrResortList
    ); //get dropdown selected item

    resetPassResortContainer(selectedList);
    renderPassOrResorts(appendedPassOrResortList, selectedList);
  } else {
    // console.log("please complete profile");
    document
      .getElementById(`alert-${selectedList}-invalid`)
      .classList.remove("is-hidden");
    setTimeout(() => {
      document
        .getElementById(`alert-${selectedList}-invalid`)
        .classList.add("is-hidden");
    }, 3000);
  }
}

function createPassOrResortFromStorage(skiProfile, selectedList) {
  let savedPassOrResortList = [];
  if (skiProfile) {
    savedPassOrResortList = skiProfile[selectedList];
  }
  return { savedPassOrResortList };
}

function appendCurrentSelection(event, selectedList, appendedPassOrResortList) {
  let selectOption = document.querySelectorAll("select");
  selectOption.forEach((element) => {
    if (
      event.target.classList.contains(selectedList) &&
      element.getAttribute("name") === selectedList &&
      !appendedPassOrResortList.includes(element.value) &&
      element.value !== "none"
    ) {
      appendedPassOrResortList.push(element.value);

      setLocalStorage(selectedList, appendedPassOrResortList);
    }
  });
  return { appendedPassOrResortList };
}

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
    console.log('yes')
    createPassResortDefaultContainer('selectedUpdate', selectedList);
  }

  document
    .getElementById(`alert-${selectedList}-invalid`)
    .classList.add("is-hidden"); //ensures invalid alert is hidden
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
  nameInput.setAttribute("placeholder", "Powder Day");
  emailInput.setAttribute("placeholder", "pow@skiallday.com");
  addressInput.setAttribute(
    "placeholder",
    "5280 SkiPowder Street, City, State, Zipcode"
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
