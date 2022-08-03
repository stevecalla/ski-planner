//section:query selector variables go here 👇
let resortList = document.getElementById("resort-list");
let profileModal = document.getElementById("profile-modal");
let nameInput = document.getElementById("name-input");
let emailInput = document.getElementById("email-input");
let addressInput = document.getElementById("address-input");
let memberCreatedDateInput = document.getElementById("member-created-date");
let saveNameIcon = document.getElementById("save-name-icon");
let saveEmailIcon = document.getElementById("save-email-icon");
let saveAddressIcon = document.getElementById("save-address-icon");
let allIconElements = document.querySelectorAll("i");
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
deleteProfileButton.addEventListener("click", clearLocalStorage);
addressInput.addEventListener("input", () => fetchMapquestCreateAutoComplete(addressInput));// SEE UTILS.JS FOR THE FUNCTIONS TO FETCH AND RENDER AUTOCOMPLETE
closeModalElement.addEventListener("click", () => renderLastPage());
document.addEventListener("keydown", (event) => {
  if (event.keyCode === 27 || event.target.classList.contains("modal-close")) {
      renderLastPage();
    }
});

//section:functions and event handlers go here 👇
//LOAD PROFILE FROM STORAGE
function loadProfile() {
  loadResortList();
  loadProfileFromStorage();
  nameInput.focus();
}

function loadResortList() {
  resortList.textContent = "";
  skiAreas.forEach((resort) => {
    // console.log(resort);
    let resortElement = document.createElement("option");
    resortElement.setAttribute("value", resort.Name);
    resortElement.textContent = resort.Name;
    resortList.append(resortElement);
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
  } else {
    document
      .getElementById(`alert-${field}-invalid`)
      .classList.remove("is-hidden"); //render invalid alert
    resetNameEmailAddress(field); //clear/reset values
  }
}

function getInput(event) {
  let parentNodeField = event.target.parentNode.classList;
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
    : (validInput = input && input.trim() !== "");
  return { validInput };
}

function renderValidNameEmailAddress(field, input) {
  document.getElementById(`alert-${field}-invalid`).classList.add("is-hidden"); //ensure invalid alert is hidden
  document.getElementById(`alert-${field}-valid`).classList.remove("is-hidden"); //render valid alert

  field === "email"
    ? emailInput.setAttribute("placeholder", input)
    : field === "name"
    ? nameInput.setAttribute("placeholder", input)
    : addressInput.setAttribute("placeholder", input); //set placeholder to input value

  //swap disk and check icon to confirm valid
  allIconElements.forEach((element) => {
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
    allIconElements.forEach((element) => {
      if (element.classList.contains(`${field}-disk`)) {
        element.classList.toggle("is-hidden");
      }
      if (element.classList.contains(`${field}-check`)) {
        element.classList.toggle("is-hidden");
      }
      document
        .getElementById(`alert-${field}-valid`)
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
    let createdDate = moment().format("MMMM D YYYY h:mm:ss a"); //todo:remove day, hours, min, sec
    setLocalStorage("memberDate", createdDate);
    memberCreatedDateInput.textContent = `Member Since: ${createdDate}`;
    memberCreatedDateInput.classList.remove("is-hidden");
    return memberCreatedDateInput;
  }
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
    console.log("please complete profile");
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
      !appendedPassOrResortList.includes(element.value)
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
        "height: 150px; overflow: scroll"
      ))
    : ((resortSelectedContainer.textContent = ""),
      resortSelectedContainer.setAttribute(
        "style",
        "height: 150px; overflow: scroll"
      ));
}

function renderPassOrResorts(appendedPassOrResortList, selectedList) {
  appendedPassOrResortList.forEach((element) => {
    let selectedElement = document.createElement("div");
    selectedElement.classList.add(
      "box",
      "is-primary",
      "notification",
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
      noneSelected.classList.add("notification", "is-primary");

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

function clearLocalStorage() {
  console.log("clear");
  localStorage.removeItem("ski-profile"); //clear storage

  //reset name and email
  nameInput.setAttribute("placeholder", "Powder Day");
  emailInput.setAttribute("placeholder", "pow@skiallday.com");
  addressInput.setAttribute(
    "placeholder",
    "5280 SkiPowder Street, City, State, Zipcode"
  );

  //reset pass container
  passSelectedContainer.textContent = "";
  let clearPasses = document.createElement("div");
  clearPasses.classList.add("notification", "is-primary");
  clearPasses.textContent = "No Passes Selected";
  passSelectedContainer.append(clearPasses);

  //reset resorts container
  resortSelectedContainer.textContent = "";
  let clearResorts = document.createElement("div");
  clearResorts.classList.add("notification", "is-primary");
  clearResorts.textContent = "No Resorts Selected";
  resortSelectedContainer.append(clearResorts);

  //hide member create date
  memberCreatedDateInput.classList.add("is-hidden");

  nameInput.focus();
}