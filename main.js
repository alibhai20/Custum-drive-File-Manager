let folderBtn = document.querySelector("#add-folder-button");
let fileBtn = document.querySelector("#add-file-button");
let myTemplate = document.querySelector(".my-template");
let foldersDiv = document.querySelector(".folders");
let myBreadCrums = document.querySelector(".breadcrums");

let divApp = document.querySelector(".app");
let divAppHeader = document.querySelector(".app-header");
let divAppTitle = document.querySelector(".app-title");
let divAppMenuBar = document.querySelector(".app-menu-bar");
let divAppBody = document.querySelector(".app-body");
let closeIcon = document.querySelector(".file-close-icon");
let resourcesArr = getFolders();
let currentFolderId = -1;
const defaultFileProperties = {
  content: "Hi,\n\nI'm default text",
  fontSize: "15",
  fontFamily: "arial",
  bgColor: "#ffffff",
  fgColor: "#000000",
};

renderFolders(resourcesArr);

closeIcon.addEventListener('click',function(){
  toggleApp();
});

function getFolderSequnce() {
  return (
    resourcesArr.filter(
      (r) =>
        r.resourceType == 1 &&
        r.parentId == currentFolderId &&
        r.name.startsWith("New folder")
    ).length + 1
  );
}

function getFileSequnce() {
  return (
    resourcesArr.filter(
      (r) =>
        r.resourceType == 2 && 
        r.parentId == currentFolderId && 
        r.name.startsWith("New file")
    ).length + 1
  );
}

folderBtn.addEventListener("click", function () {
  let folderName = prompt(
    "Enter a folder name",
    "New folder " + getFolderSequnce()
  );
  if (!folderName?.trim()) {
    return;
  }

  if (isExisted(folderName, 1)) {
    alert("Already existed");
    return;
  }

  let folder = {
    id: getFolderId(),
    name: folderName,
    parentId: currentFolderId,
    resourceType: 1,
    properties: {},
  };
  createFolder(folder);//html
  resourcesArr.push(folder); //ram
  saveToStorage(resourcesArr); // db /localstorage
  renderFolders();
});

fileBtn.addEventListener("click", function () {
  let fileName = prompt("Enter a file name", "New file " + getFileSequnce());
  if (!fileName?.trim()) {
    return;
  }

  if (isExisted(fileName, 2)) {
    alert("Already existed");
    return;
  }

  let file = {
    id: getFolderId(),
    name: fileName,
    parentId: currentFolderId,
    resourceType: 2,
    properties: defaultFileProperties,
  };
  createFile(file); //html
  resourcesArr.push(file); // ram
  saveToStorage(resourcesArr); // db
});

function handleFolderClick() {
  currentFolderId = parseInt(this.id);

  let pathTemplate = myTemplate.content.querySelector(".path");
  let pathElement = document.importNode(pathTemplate, true);

  pathElement.innerHTML = " / " + this.textContent;
  myBreadCrums.appendChild(pathElement);
  pathElement.setAttribute("id", currentFolderId);
  pathElement.addEventListener("click", handlePathClick);

  renderFolders(resourcesArr);
  toggleApp();
}
function handleFileClick() {
  fileId = parseInt(this.id);

  divNotePadMenuTemplate = myTemplate.content.querySelector(
    '[purpose="notepad-menu"]'
  );
  divNotePadMenu = document.importNode(divNotePadMenuTemplate, true);
  divAppMenuBar.innerHTML = "";
  divAppMenuBar.appendChild(divNotePadMenu);

  divNotePadBodyTemplate = myTemplate.content.querySelector(
    '[purpose="notepad-body"]'
  );
  divNotePadBody = document.importNode(divNotePadBodyTemplate, true);

  divAppBody.innerHTML = "";
  divAppBody.appendChild(divNotePadBody);
  divAppTitle.textContent = this.textContent + ".txt";
  divAppTitle.setAttribute("fileId", fileId);

  let spanSave = divAppMenuBar.querySelector('[action="save"]');
  let spanBold = divAppMenuBar.querySelector('[action="bold"]');
  let spanItalic = divAppMenuBar.querySelector('[action="italic"]');
  let spanUnderline = divAppMenuBar.querySelector('[action="underline"]');
  let spanBGColor = divAppMenuBar.querySelector('[action="bg-color"]');
  let spanFGColor = divAppMenuBar.querySelector('[action="fg-color"]');
  let selectFontFamilty = divAppMenuBar.querySelector('[action="font-family"]');
  let selectFontSize = divAppMenuBar.querySelector('[action="font-size"]');
  let spanDownload = divAppMenuBar.querySelector('[action="download"]');
  let spanUpload = divAppMenuBar.querySelector('span[action="upload"]');
  let inputUpload = divAppMenuBar.querySelector('input[action="upload"]');
  let spanReset = divAppMenuBar.querySelector('[action="reset"]');

  spanSave.addEventListener("click", saveNotePad);
  spanBold.addEventListener("click", makeNotePadBold);
  spanItalic.addEventListener("click", makeNotePadItalic);
  spanUnderline.addEventListener("click", makeNotePadUnderline);
  spanBGColor.addEventListener("change", chaneNodepadBGColor);
  spanFGColor.addEventListener("change", chaneNodepadFGColor);
  selectFontFamilty.addEventListener("change", changeNotepadFontFamily);
  selectFontSize.addEventListener("change", changeNotePadFontSize);
  spanDownload.addEventListener("click", downloadNotePad);
  spanUpload.addEventListener("click", openFileUpload);
  inputUpload.addEventListener("change", uploadNotePad);
  spanReset.addEventListener("click", resetNotePadProperties);

  let file = resourcesArr.find((r) => r.id == fileId);
  initializeNotePad(file);
  toggleApp(true);
}

function resetNotePadProperties() {
  if(!confirm('Are you sure, you want to reset all changes ?')){
    return;
  }
  let fid = divAppTitle.getAttribute("fileId");
  let resource = resourcesArr.find((r) => r.id === parseInt(fid));

  resource.properties = defaultFileProperties;
  initializeNotePad(resource);
}

function openFileUpload() {
  let inputUpload = divAppMenuBar.querySelector('input[action="upload"]');
  inputUpload.click();
}

function downloadNotePad() {
  let fid = divAppTitle.getAttribute("fileId");
  let resource = resourcesArr.find((r) => r.id == fid);

  let downloadAnchorTag = divNotePadMenu.querySelector('a[purpose="download"]');
  downloadAnchorTag.setAttribute(
    "href",
    "data:text/json;charset=utf-8, " +
      encodeURIComponent(JSON.stringify(resource))
  );
  downloadAnchorTag.setAttribute("download", resource.name + ".json");
  downloadAnchorTag.click();
}
function uploadNotePad() {
  if (window.event.target.files.length == 0) {
    alert("Please upload a file");
    return;
  }
  let file = window.event.target.files[0];
  let reader = new FileReader();
  reader.readAsText(file);
  reader.addEventListener("load", function () {
    let resource = JSON.parse(window.event.target.result);
    initializeNotePad(resource);
  });
}

function initializeNotePad(file) {
  if (!file) {
    return;
  }

  let spanBold = divAppMenuBar.querySelector('[action="bold"]');
  let spanItalic = divAppMenuBar.querySelector('[action="italic"]');
  let spanUnderline = divAppMenuBar.querySelector('[action="underline"]');
  let spanBGColor = divAppMenuBar.querySelector('[action="bg-color"]');
  let spanFGColor = divAppMenuBar.querySelector('[action="fg-color"]');
  let selectFontFamilty = divAppMenuBar.querySelector('[action="font-family"]');
  let selectFontSize = divAppMenuBar.querySelector('[action="font-size"]');
  let textArea = divAppBody.querySelector("textarea");

  spanBold.setAttribute("pressed", !file.properties.isBold);
  spanBold.dispatchEvent(new Event("click"));

  spanItalic.setAttribute("pressed", !file.properties.isItalic);
  spanItalic.dispatchEvent(new Event("click"));

  spanUnderline.setAttribute("pressed", !file.properties.isUnderline);
  spanUnderline.dispatchEvent(new Event("click"));

  textArea.style.backgroundColor = file.properties.bgColor;
  textArea.style.color = file.properties.fgColor;
  spanBGColor.value = file.properties.bgColor;
  spanFGColor.value = file.properties.fgColor;

  selectFontFamilty.value = file.properties.fontFamily;
  selectFontSize.value = file.properties.fontSize;

  textArea.style.fontFamily = file.properties.fontFamily;
  textArea.style.fontSize = file.properties.fontSize + "px";
  textArea.value = file.properties.content ?? "";
}

function saveNotePad() {
  let fid = divAppTitle.getAttribute("fileId");
  let file = resourcesArr.find((r) => r.id == fid);

  file.properties.isBold =
    divAppMenuBar.querySelector('[action="bold"]').getAttribute("pressed") ===
    "true";
  file.properties.isItalic =
    divAppMenuBar.querySelector('[action="italic"]').getAttribute("pressed") ===
    "true";
  file.properties.isUnderline =
    divAppMenuBar
      .querySelector('[action="underline"]')
      .getAttribute("pressed") === "true";
  file.properties.bgColor = divAppMenuBar.querySelector(
    '[action="bg-color"]'
  ).value;
  file.properties.fgColor = divAppMenuBar.querySelector(
    '[action="fg-color"]'
  ).value;
  file.properties.fontFamily = divAppMenuBar.querySelector(
    '[action="font-family"]'
  ).value;
  file.properties.fontSize = divAppMenuBar.querySelector(
    '[action="font-size"]'
  ).value;

  file.properties.content = divAppBody.querySelector("textarea").value;

  saveToStorage(resourcesArr);
}
function makeNotePadBold() {
  let textArea = divAppBody.querySelector("textarea");
  let isPressed = this.getAttribute("pressed");
  if (isPressed === "false") {
    textArea.style.fontWeight = "bold";
    this.setAttribute("pressed", "true");
  } else {
    textArea.style.fontWeight = "normal";
    this.setAttribute("pressed", "false");
  }
}
function makeNotePadItalic() {
  let textArea = divAppBody.querySelector("textarea");
  let isPressed = this.getAttribute("pressed");
  if (isPressed === "false") {
    textArea.style.fontStyle = "italic";
    this.setAttribute("pressed", "true");
  } else {
    textArea.style.fontStyle = "normal";
    this.setAttribute("pressed", "false");
  }
}
function makeNotePadUnderline() {
  let textArea = divAppBody.querySelector("textarea");
  let isPressed = this.getAttribute("pressed");
  if (isPressed === "false") {
    textArea.style.textDecoration = "underline";
    this.setAttribute("pressed", "true");
  } else {
    textArea.style.textDecoration = "none";
    this.setAttribute("pressed", "false");
  }
}
function chaneNodepadBGColor() {
  let textArea = divAppBody.querySelector("textarea");
  textArea.style.backgroundColor = this.value;
}
function chaneNodepadFGColor() {
  let textArea = divAppBody.querySelector("textarea");
  textArea.style.color = this.value;
}
function changeNotepadFontFamily() {
  let textArea = divAppBody.querySelector("textarea");
  textArea.style.fontFamily = this.value;
}
function changeNotePadFontSize() {
  let textArea = divAppBody.querySelector("textarea");
  textArea.style.fontSize = this.value + "px";
}

function handleFolders() {
  if (resourcesArr.filter((f) => f.parentId === currentFolderId).length > 0) {
    document.querySelector(".no-content").style.display = "none";
  } else {
    document.querySelector(".no-content").style.display = "block";
  }
  updateResourcesCount();
}
function handlePathClick() {
  currentFolderId = parseInt(this.id);
  renderFolders(resourcesArr);
  toggleApp();
  while (this.nextElementSibling) {
    this.parentNode.removeChild(this.nextElementSibling);
  }
}
function navigateToRoot(e) {
  currentFolderId = -1;
  toggleApp();
  renderFolders(resourcesArr);

  while (e.nextElementSibling) {
    e.parentNode.removeChild(e.nextElementSibling);
  }
}

function toggleApp(show = false) {
  if (show == true) {
    divApp.classList.remove("hidden");
    return;
  }
  divApp.classList.add("hidden");
}

function renderFolders(folders) {
  if (!folders || folders.length == 0) {
    return;
  }

  foldersDiv.innerHTML = "";
  folders
    .filter((f) => f.parentId === currentFolderId)
    .sort((a, b) => a.resourceType - b.resourceType)
    .forEach((folder) => {
      if (folder.resourceType == 1) {
        createFolder(folder);
      } else {
        createFile(folder); 
      }
    });
  handleFolders();
  toggleApp();
}

function createFolder(folder) {
  if (!folder) {
    return;
  }
  let folderName = folder.name;
  folderTemplate = myTemplate.content.querySelector(".folder");
  folderDiv = document.importNode(folderTemplate, true);
  deleteSpan = folderDiv.querySelector("span[action='delete']");
  editSpan = folderDiv.querySelector("span[action='edit']");
  nameDiv = folderDiv.querySelector("[purpose='name']");
  nameDiv.textContent = folderName;
  nameDiv.addEventListener("click", handleFolderClick);

  deleteSpan.setAttribute("id", folder.id);
  editSpan.setAttribute("id", folder.id);
  nameDiv.setAttribute("id", folder.id);
  nameDiv.setAttribute("parentId", currentFolderId);

  foldersDiv.appendChild(folderDiv);
}
function createFile(file) {
  if (!file) {
    return;
  }
  let fileName = file.name;
  fileTemplate = myTemplate.content.querySelector(".file");
  fileDiv = document.importNode(fileTemplate, true);
  deleteSpan = fileDiv.querySelector("span[action='delete']");
  deleteSpan = fileDiv.querySelector("span[action='delete']");
  editSpan = fileDiv.querySelector("span[action='edit']");
  nameDiv = fileDiv.querySelector("[purpose='name']");
  nameDiv.textContent = fileName;
  nameDiv.addEventListener("click", handleFileClick);

  deleteSpan.setAttribute("id", file.id);
  editSpan.setAttribute("id", file.id);
  nameDiv.setAttribute("id", file.id);
  nameDiv.setAttribute("parentId", currentFolderId);

  foldersDiv.appendChild(fileDiv);
}

function editFolder(e) {
  let id = parseInt(e.id);
  let folderIndex = resourcesArr.findIndex((f) => f.id == id);
  let nameDiv =
    e.nextElementSibling?.nextElementSibling?.nextElementSibling
      ?.nextElementSibling;
  let newName = prompt("New name ?", nameDiv.textContent);
  if (
    !newName?.trim() ||
    isExisted(newName, resourcesArr[folderIndex].resourceType)
  ) {
    alert("Please enter valid & unique name");
    return;
  }
  nameDiv.textContent = newName;
  resourcesArr[folderIndex].name = newName;

  saveToStorage(resourcesArr);
}

function deleteFolder(e) {
  if (!isDeleteAllowed(e.id)) {
    alert("Folder contains some content, please delete it first");
    return;
  }
  if (!confirm("Are you sure you want to delete ?")) {
    return;
  }
  foldersDiv.removeChild(e.parentElement);
  let id = parseInt(e.id);
  let folderIndex = resourcesArr.findIndex((f) => f.id == id);
  resourcesArr.splice(folderIndex, 1);
  saveToStorage(resourcesArr);
}

function isDeleteAllowed(folderId) {
  return resourcesArr.findIndex((f) => f.parentId == folderId) == -1;
}

function isExisted(resorceName, resourceType = 1) {
  return (
    resourcesArr
      .filter(
        (f) => f.parentId === currentFolderId && f.resourceType === resourceType
      )
      .findIndex((f) => f.name === resorceName) >= 0
  );
}

function saveToStorage(folders) {
  if (!folders) {
    return;
  }
  handleFolders();
  localStorage.setItem("tcp_folders", JSON.stringify(folders));
}

function getFolders() {
  let folders = localStorage.getItem("tcp_folders");
  return folders ? JSON.parse(folders) : [];
}

function getFolderId() {
  if (!resourcesArr || resourcesArr.length == 0) {
    return 1;
  }
  return resourcesArr[resourcesArr.length - 1].id + 1;
}

function updateResourcesCount() {
  let divResDescition = document.querySelector(".resources-description");
  let spanFolderCount = divResDescition.querySelector(
    '[purpose="folders-count"]'
  );
  let spanFileCount = divResDescition.querySelector('[purpose="file-count"]');
  let spanTotalCount = divResDescition.querySelector(
    '[purpose="resources-count"]'
  );
  spanFolderCount.textContent = resourcesArr.filter(
    (r) => r.resourceType == 1 && r.parentId == currentFolderId
  ).length;
  spanFileCount.textContent = resourcesArr.filter(
    (r) => r.resourceType == 2 && r.parentId == currentFolderId
  ).length;
  spanTotalCount.textContent = resourcesArr.filter(
    (r) => r.parentId == currentFolderId
  ).length;
}
