let currentPage = document.getElementsByTagName("body")[0].id;
let firestore = null;
const objectWithBlocks = [
    {
        title: "Image block title",
        content: "Content",
        type: "imageBlock",
        image: ""
    },
    {
        title: "Footer title",
        content: "footer text",
        type: "footer",
        image: ""
    },
    {
        type: "menu",
        logo: ""
    }
];

const formHTML = `
<form method="POST">
    <select name="block" id="dropdown">
        <option value="imageBlock">Image block</option>
        <option value="footer">Footer</option>
        <option value="menu">Menu</option>
    </select>
    <button type="Add page" id="submitButton">Block toevoegen</button>
</form>
`;


function myFunction() {
    if(localStorage.getItem('page')){
        currentPage = localStorage.getItem('page');
    }
  }

window.addEventListener("load", myFunction);

startScript();

async function startScript(){
    console.log(currentPage);
    await newDatabase();
}


async function newDatabase() {
    // Your Firebase configuration
    const firebaseConfig = {
        apiKey: "AIzaSyCj6MCnHdqr9_DOYRJtSsB30P_LfD3QyH8",
        authDomain: "cms2-58eaf.firebaseapp.com",
        projectId: "cms2-58eaf",
        storageBucket: "cms2-58eaf.appspot.com",
        messagingSenderId: "405806447010",
        appId: "1:405806447010:web:e842ddf9737960fbd45afb",
        measurementId: "G-VYBDR6G2EG"
      };

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);

    // Get a reference to the Firestore database
    firestore = firebase.firestore();

    // Firebase authentication state change listener
// Firebase authentication state change listener
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        // User is signed in, proceed with your application logic
        addMenuButtons();
        console.log("you are logged in");
        hideLoginForm(); // Hide the login form
        // showLogoutButton(); // Show the logout button
        const footerMenu = document.querySelector('.footerMenu');
        footerMenu.style.display = 'flex';
        const container = document.querySelector('#container');
        container.style.display = 'flex';
    } else {
        showLoginForm(); // Show the login form
        hideLogoutButton(); // Hide the logout button
    }
        placeBlock();
});



// Function to hide the login form
function hideLoginForm() {
    const loginForm = document.getElementById('form');
    loginForm.style.display = 'none';
}

// Function to show the login form
function showLoginForm() {
    const loginForm = document.getElementById('form');
    loginForm.style.display = 'flex';
}

    
}

function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
        .then(() => {
            return firebase.auth().signInWithEmailAndPassword(email, password);
        })
        .catch((error) => {
            console.error('Error logging in: ', error);
        });
        
}

async function fetchDataFromFirestore(path) {
    const allData = {};

    try {
        const querySnapshot = await firestore.collection(path).get();
        querySnapshot.forEach((doc) => {
            allData[doc.id] = doc.data();
        });
        return allData;
    } catch (error) {
        console.error("Error fetching data: ", error);
        throw error; // Re-throw the error to be handled by the caller
    }
}

function clearContainer(target) {
      // Create a new body element to replace the existing one
      const newBody = document.createElement('body');

      // Move all child nodes (including event listeners) from the old body to the new body
      while (document.body.firstChild) {
          newBody.appendChild(document.body.firstChild);
      }
  
      // Replace the existing body with the new body
      document.body.parentNode.replaceChild(newBody, document.body);
  
      // Note: The old body and its event listeners will be garbage collected
      target.innerHTML = '';
}



function addTitle(target){
    const pageTitle = document.createElement('h1');
    pageTitle.textContent = currentPage;
    target.appendChild(pageTitle);
}

function addContent(target){
    const pageContent = document.createElement('p');
    pageContent.textContent = "On this page you can add and change blocks and change the settings";
    target.appendChild(pageContent);
}

function changeBreadcrump(page, block) {
    const breadcrump = document.querySelector('.breadcrump');

    if (breadcrump) {
        if (page && block) {
            const pageLink = document.createElement('a');
            pageLink.href = '#'; // You can set the appropriate URL here
            pageLink.textContent = page;
            pageLink.addEventListener('click', () => {
                placeBlock();
            });
            
            breadcrump.innerHTML = ''; // Clear existing content
            breadcrump.appendChild(pageLink);
            breadcrump.appendChild(document.createTextNode(' > ' + block));
        } else if (page) {
            breadcrump.textContent = page;
        }
    }
}



function addBlockTitle(target){
    const blocksTitle = document.createElement('h2');
    blocksTitle.textContent = 'Blocks';
    target.appendChild(blocksTitle);
}


function ShowBlockContents(target, name){
    const blocksTitle = document.createElement('h2');
    blocksTitle.textContent = name;
    target.appendChild(blocksTitle);
}

function loopSortedBlocks(blockArray){
    const sortedBlocks = blockArray.sort((a, b) => a.order - b.order);
    for (const { index, block } of sortedBlocks) {

       const container =  document.querySelector('#container');

       const typeLabel = document.createElement('label');
       typeLabel.textContent = block["title"] || block["type"];
       typeLabel.style.fontWeight = 'bold';
       
       const divContainer = document.createElement('div'); // Creating the div container
       divContainer.className = 'block'; // Replace 'your-class-name' with the actual class name you want
       
       divContainer.appendChild(typeLabel); // Placing the typeLabel inside the div
       addUpDownButtons(divContainer, index, sortedBlocks.length, currentPage); // Adding buttons to the div
       
       container.appendChild(divContainer); // Placing the whole div container inside the 'container'
       


        

        typeLabel.addEventListener('click', () => {
            const container = document.querySelector("#container");
            clearContainer(container);
            ShowBlockContents(container, typeLabel.textContent);
            changeBreadcrump(currentPage,typeLabel.textContent);          
    
            for (const key in block) {
                if (key === "type") {
                    continue;
                }
                if (block.hasOwnProperty(key)) {

                    if (key.includes("image") || key.includes("Image") || key.includes("logo")) {
                        const imageField = document.createElement('div');
                imageField.className = 'image-field'; // You can add a class name for styling if needed
                
                const blocksTitle = document.createElement('label');
                blocksTitle.textContent = key;
                imageField.appendChild(blocksTitle);
            
                if (block.image) {
                    const imageElement = document.createElement('img');
                    imageElement.src = block.image;
                    imageField.appendChild(imageElement);
                }
            
                const imageInput = document.createElement('input');
                imageInput.type = 'file';
                imageInput.addEventListener('change', (event) => {
                    const selectedImage = event.target.files[0];
                    handleImageUpload(selectedImage, index);
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const newImageElement = document.createElement('img');
                        newImageElement.src = e.target.result;
                        imageField.insertBefore(newImageElement, imageInput);
                    };
                    reader.readAsDataURL(selectedImage);
                });
                imageField.appendChild(imageInput);
            
                container.appendChild(imageField);
                continue;
                    }

                    const propertyDiv = document.createElement('div');
                    propertyDiv.classList.add('propertyDiv');
    
                    const inputLabel = document.createElement('label');
                    inputLabel.textContent = key;
                    inputLabel.style.fontWeight = 'bold';
                    propertyDiv.appendChild(inputLabel);
    
                    const inputField = document.createElement('input');
                    inputField.type = 'text';
                    inputField.value = block[key];
                    inputField.addEventListener('keydown', handleInputKeydown(index, key, inputField));
                    propertyDiv.appendChild(inputField);
    
                    container.appendChild(propertyDiv);
                }
            }
    
            const inputLabel = document.createElement('label');
                    inputLabel.textContent = "Remove block";
                    inputLabel.style.fontWeight = 'bold';
                    container.appendChild(inputLabel);

            const removeButton = document.createElement('button');
            removeButton.textContent = 'Remove';
            removeButton.addEventListener('click', () => {
                removeBlockAndPage(currentPage, index);
            });
            container.appendChild(removeButton);
    





        });
    }
}

async function getBlocks() {
    const pages = await fetchDataFromFirestore(`pages/${currentPage}/blocks`);

    const blockArray = Object.entries(pages).map(([index, block]) => ({
        index,
        order: block.order || 0,
        block,
    }));

    loopSortedBlocks(blockArray);
}

function addForm(){
    container.insertAdjacentHTML('beforeend', formHTML);
}

async function addSettings(){

    await loopPageFields(currentPage);


    if (currentPage !== "homepage" && currentPage !== "settings") {
        const removePagelabel = document.createElement('label');
        removePagelabel.textContent = 'Remove Page';
        container.appendChild(removePagelabel);

        const removePageButton = document.createElement('button');
        removePageButton.textContent = 'Remove Page';
        removePageButton.addEventListener('click', () => {
            removePage(currentPage); 
        });
        container.appendChild(removePageButton);
        function handleButtonClick() {
            const selectedBlock = document.querySelector('#dropdown').value;
            addNewBlock(selectedBlock);
        }
     
    
        document.getElementById('submitButton').onclick = async function(event) {
            event.preventDefault();
            handleButtonClick();
        };
        
    }

    
}

async function placeBlock() {
    const container = document.getElementById('container');
    clearContainer(container);
    addTitle(container);
    addContent(container);

    changeBreadcrump(currentPage);
    if(currentPage != "settings"){
        addBlockTitle(container);
        await getBlocks();
        addForm();
        const settings = document.createElement('h2');
        settings.textContent = 'Settings';
        container.appendChild(settings);
    }
    addSettings();
}

async function loopPageFields(currentPage) {
    const pageData = await getPageData(currentPage);

    if (!pageData) {
        console.log(`Page ${currentPage} does not exist.`);
        return;
    }

    const container = document.getElementById('container');

    const excludedFields = ['menu', 'label']; // Add other field names you want to exclude

    for (const field in pageData) {
        if (pageData.hasOwnProperty(field) && !excludedFields.includes(field)) {
            const fieldValue = pageData[field];

            const fieldLabel = document.createElement('label');
            fieldLabel.textContent = field;
            container.appendChild(fieldLabel);

            if (typeof fieldValue === 'string') {
                // Add an input field for string fields
                const inputField = createInputField('text', fieldValue, async (value) => {
                    await updatePageField(currentPage, field, value);
                });
                container.appendChild(inputField);
            } else if (typeof fieldValue === 'number') {
                // Add an input field for number fields
                const inputField = createInputField('number', fieldValue, async (value) => {
                    await updatePageField(currentPage, field, value);
                });
                container.appendChild(inputField);
            } else if (typeof fieldValue === 'boolean') {
                // Add a checkbox for boolean fields
                const checkbox = createCheckbox(fieldValue, async (value) => {
                    await updatePageField(currentPage, field, value);
                });
                container.appendChild(checkbox);
            } else {
                // Display the field value for other field types
                const fieldValueElement = createFieldValueElement(fieldValue.toString());
                container.appendChild(fieldValueElement);
            }

        }
        
    }
    

    if (currentPage === 'settings') {
        await displayMenuPages(pageData.menu);
        await displayUnselectedPages(pageData.menu);
    }
    
}

async function getPageData(currentPage) {
    const pageRef = firestore.collection('pages').doc(currentPage);
    const pageSnapshot = await pageRef.get();

    if (pageSnapshot.exists) {
        return pageSnapshot.data();
    } else {
        return null;
    }
}

function createInputField(type, value, changeCallback) {
    const inputField = document.createElement('input');
    inputField.type = type;
    inputField.value = value;

    inputField.addEventListener('input', async () => {
        await changeCallback(inputField.value);
    });

    return inputField;
}

function createCheckbox(checked, changeCallback) {
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = checked;

    checkbox.addEventListener('change', async () => {
        await changeCallback(checkbox.checked);
    });

    return checkbox;
}

function createFieldValueElement(value) {
    const fieldValueElement = document.createElement('p');
    fieldValueElement.textContent = value;
    return fieldValueElement;
}

async function displayMenuPages(menu) {
    const allPages = await getAllPages();

    for (const page of menu) {
        if (allPages.includes(page)) {
            const pageWrapper = createPageWrapper(page, menu);
            container.appendChild(pageWrapper);
        }
    }
}

async function displayUnselectedPages(menu) {
    const allPages = await getAllPages();

    for (const page of allPages) {
        if (!menu.includes(page)) {
            const pageWrapper = createPageWrapper(page, menu);
            container.appendChild(pageWrapper);
        }
    }
}

function createPageWrapper(page, menu) {
    const pageWrapper = document.createElement('div');
    pageWrapper.classList.add('page-wrapper');

    const pageCheckbox = document.createElement('input');
    pageCheckbox.type = 'checkbox';
    pageCheckbox.value = page;
    pageCheckbox.checked = menu.includes(page);
    pageCheckbox.addEventListener('change', async () => {
        if (pageCheckbox.checked) {
            menu.push(page);
        } else {
            const pageIndex = menu.indexOf(page);
            if (pageIndex !== -1) {
                menu.splice(pageIndex, 1);
            }
        }
        await updatePageField(currentPage, 'menu', menu);
        await loopPageFields(currentPage); // Refresh the display
            placeBlock();
    });

    

    const pageLabel = document.createElement('label');
    pageLabel.textContent = page;

    const upButton = document.createElement('button');
    upButton.innerHTML = 'Move Up';
    upButton.addEventListener('click', async () => {
        const pageIndex = menu.indexOf(page);
        if (pageIndex > 0) {
            [menu[pageIndex], menu[pageIndex - 1]] = [menu[pageIndex - 1], menu[pageIndex]];
            await updatePageField(currentPage, 'menu', menu);
        }
            placeBlock();
    });

    const downButton = document.createElement('button');
    downButton.innerHTML = 'Move Down';
    downButton.addEventListener('click', async () => {
        const pageIndex = menu.indexOf(page);
        if (pageIndex < menu.length - 1) {
            [menu[pageIndex], menu[pageIndex + 1]] = [menu[pageIndex + 1], menu[pageIndex]];
            await updatePageField(currentPage, 'menu', menu);
        }
            placeBlock();
    });

    pageWrapper.appendChild(pageCheckbox);
    pageWrapper.appendChild(pageLabel);
    pageWrapper.appendChild(upButton);
    pageWrapper.appendChild(downButton);

    return pageWrapper;
}

async function getAllPages() {
    const pagesCollection = firestore.collection('pages');
    const pagesQuerySnapshot = await pagesCollection.get();
    return pagesQuerySnapshot.docs.map(doc => doc.id);
}

async function movePage(currentPage, pageToMove, direction) {
    try {
        const pagesRef = firestore.collection('pages');
        const pageRef = pagesRef.doc(currentPage);
        const pageSnapshot = await pageRef.get();

        if (pageSnapshot.exists) {
            const pageData = pageSnapshot.data();
            const menu = pageData.menu || [];

            const currentIndex = menu.indexOf(pageToMove);
            if (currentIndex === -1) {
                console.log(`Page ${pageToMove} not found in the menu.`);
                return;
            }

            let newIndex;
            if (direction === 'up' && currentIndex > 0) {
                newIndex = currentIndex - 1;
            } else if (direction === 'down' && currentIndex < menu.length - 1) {
                newIndex = currentIndex + 1;
            } else {
                console.log(`Cannot move ${pageToMove} ${direction} as it's already at the ${direction === 'up' ? 'top' : 'bottom'}.`);
                return;
            }

            menu.splice(newIndex, 0, menu.splice(currentIndex, 1)[0]);
            await updatePageField(currentPage, 'menu', menu);
            
            // Update the displayed menu order after moving a page
            loopPageFields(currentPage);
        } else {
            console.log(`Page ${currentPage} does not exist.`);
        }
    } catch (error) {
        console.error('Error moving page:', error);
    }
}

async function updatePageField(pageName, field, newValue) {
    try {
        const pageRef = firestore.collection('pages').doc(pageName);
        await pageRef.update({
            [field]: newValue
        });
        console.log(`Field '${field}' updated successfully.`);
    } catch (error) {
        console.error(`Error updating field '${field}':`, error);
    }
}

function addUpDownButtons(blockDiv, blockIndex, totalBlocks, pageName) {
    const buttonsDiv = document.createElement('div'); // Create a div to contain the buttons
    buttonsDiv.classList.add('arrow-buttons'); // Add a class name for styling

    const upButton = document.createElement('button');
    upButton.innerHTML = '<i class="fas fa-angle-up"></i>'; // Font Awesome up arrow icon
    upButton.classList.add('arrow-button');
    upButton.addEventListener('click', async () => {
        await swapBlocks(pageName, blockIndex, "up");
    });

    const downButton = document.createElement('button');
    downButton.innerHTML = '<i class="fas fa-angle-down"></i>'; // Font Awesome down arrow icon
    downButton.classList.add('arrow-button');
    downButton.addEventListener('click', async () => {
        await swapBlocks(pageName, blockIndex, "down");
    });

    buttonsDiv.appendChild(upButton);
    buttonsDiv.appendChild(downButton);

    blockDiv.appendChild(buttonsDiv); // Add the div containing the buttons to the block div
}

async function swapBlocks(pageName, blockId, upDown) {

    try {
        const db = firebase.firestore();
        const blockRef = db.collection('pages').doc(pageName).collection('blocks').doc(blockId);
        const blockSnapshot = await blockRef.get();

        if (!blockSnapshot.exists) {
            console.log(`Block with ID ${blockId} does not exist.`);
            return;
        }

        const blockData = blockSnapshot.data();

        // Ensure the block has an 'order' property
        if (!('order' in blockData)) {
            console.log(`Block with ID ${blockId} does not have an 'order' property.`);
            return;
        }

        const blockOrder = blockData.order;

        // Fetch all blocks and their orders
        const blocksQuerySnapshot = await db.collection('pages').doc(pageName).collection('blocks').get();
        const existingOrders = blocksQuerySnapshot.docs.map(doc => doc.data().order);
        // Determine the target order based on the 'upDown' direction
        const currentIndex = existingOrders.indexOf(blockOrder);
let targetIndex;

if (upDown === 'up') {
    // Find the highest available order lower than the current block's order
    const lowerOrders = existingOrders.filter(order => order < blockOrder);

    if (lowerOrders.length > 0) {
        targetIndex = existingOrders.indexOf(Math.max(...lowerOrders));
    } else {
        console.log(`Cannot swap block ${blockId} ${upDown} as it's already at the top.`);
        return;
    }
} else {
    // Find the next available order higher than the current block's order
    const higherOrders = existingOrders.filter(order => order > blockOrder);

    if (higherOrders.length > 0) {
        targetIndex = existingOrders.indexOf(Math.min(...higherOrders));
    } else {
        console.log(`Cannot swap block ${blockId} ${upDown} as it's already at the bottom.`);
        return;
    }
}

if (targetIndex < 0 || targetIndex >= existingOrders.length) {
    console.log(`Cannot swap block ${blockId} ${upDown} as there is no block with target order.`);
    return;
}

const targetOrder = existingOrders[targetIndex];

// Find the block to swap with based on target order
const targetBlockSnapshot = blocksQuerySnapshot.docs.find(doc => doc.data().order === targetOrder);
const targetBlockRef = targetBlockSnapshot.ref;

// Swap the order values
try {
    await db.runTransaction(async (transaction) => {
        const blockData = (await transaction.get(blockRef)).data();
        const targetBlockData = (await transaction.get(targetBlockRef)).data();

        // Swap the order values
        const tempOrder = blockData.order;
        blockData.order = targetBlockData.order;
        targetBlockData.order = tempOrder;

        // Update the blocks in the transaction
        transaction.update(blockRef, blockData);
        transaction.update(targetBlockRef, targetBlockData);
    });

    placeBlock(); // Re-render the blocks after swapping
} catch (error) {
    console.error("Error updating blocks in Firestore:", error);
}

    } catch (error) {
        console.error("Error getting block data:", error);
    }
}

function handleInputKeydown(blockIndex, inputKey, inputField) {
    return (event) => {
        if (event.keyCode === 13) { // Enter key
            const newValue = inputField.value;
            updateBlockProperty(currentPage, blockIndex, inputKey, newValue);
        }
    };
}



async function removePage(pageName) {
    const confirmation = confirm(`Are you sure you want to remove the page ${pageName}?`);
    if (confirmation) {
        try {
            // Assuming you are using Firebase Firestore
            const pageRef = firebase.firestore().doc(`pages/${pageName}`);
            await pageRef.delete();

            // Refresh the page
            reloadMenu();
        } catch (error) {
            console.error("Error removing page:", error);
        }
    }
}

async function removeBlockAndPage(pageName, blockIndex) {
    const confirmation = confirm(`Are you sure you want to remove the block ${blockIndex} from the page ${pageName}?`);
    if (confirmation) {
        try {
            // Assuming you are using Firebase Firestore
            const blockRef = firebase.firestore().doc(`pages/${pageName}/blocks/${blockIndex}`);
            await blockRef.delete();
            placeBlock(); // Re-render the blocks after removal
        } catch (error) {
            console.error("Error removing block:", error);
        }
    }
}

async function handleAddPageButtonClick() {
    console.log("test");

    // Prompt the user for the new page name
    const newPageName = prompt("Enter the name of the new page:");

    if (newPageName) {
        const pagesRef = firebase.firestore().collection('pages');
        
        try {
            await pagesRef.doc(newPageName).set({});
            
            // Refresh the menu buttons after adding a new page
            reloadMenu();
            
            // Show a success message
            alert(`Page "${newPageName}" has been added successfully.`);
        } catch (error) {
            console.error("An error occurred:", error);
        }
    }
}



async function addMenuButtons() {
    const pagesButton = document.getElementById('pagesButton');

    pagesButton.onclick = () => {
        if (pagesButton.classList.contains('menu-open')) {
            placeBlock();
            pagesButton.classList.remove('menu-open');
        } else {
            reloadMenu();
            pagesButton.classList.add('menu-open');
        }
    };
}



async function reloadMenu(){
    const pages = await fetchDataFromFirestore("pages");
    const container = document.querySelector("#container");
        clearContainer(container);

        const h1 = document.createElement('h1');
        h1.textContent = "Menu";
        container.appendChild(h1);

        const pagesArray = Object.keys(pages); 

        const homepageIndex = pagesArray.indexOf('homepage');
        if (homepageIndex !== -1) {
            pagesArray.splice(homepageIndex, 1); 
            pagesArray.unshift('homepage');
        }

        for (const page of pagesArray) {
            if (page === 'settings') {
                continue; 
            }

            const button = document.createElement('button');
            button.textContent = page.charAt(0).toUpperCase() + page.slice(1);
            button.className = "button2";

            button.addEventListener('click', () => {
                currentPage = page;
                localStorage.setItem('page', page);
                placeBlock();
                pagesButton.classList.remove('menu-open');
            });

            container.appendChild(button);
        }

        container.appendChild(document.createElement('br')); // Add line break

        const createPageButton = document.createElement('button');
        createPageButton.textContent = "Create Page";
        createPageButton.className = "createPage button2";
        createPageButton.onclick = handleAddPageButtonClick; // Set the onclick handler
        container.appendChild(createPageButton);

        for (const page in pages) {
            if (page === 'settings') {
                const button = document.createElement('button');
                button.textContent = page.charAt(0).toUpperCase() + page.slice(1);
                button.className = "button2";
            
                button.addEventListener('click', () => {
                    currentPage = page;
                    localStorage.setItem('page', page);
                    placeBlock();
                });
                container.appendChild(button);            }
        }


        const logoutButton = document.createElement('button');
logoutButton.textContent = "Logout";
logoutButton.id = "logout-button";
container.appendChild(logoutButton);

    // Add event listener to the logout button
    logoutButton.addEventListener('click', () => {
        firebase.auth().signOut().then(() => {
            location.reload();
        });
    });
    
}


async function addNewBlock(selectedBlock) {
    try {
        const pagesCollection = firestore.collection('pages');
        const page1DocumentRef = pagesCollection.doc(currentPage);
        const blocksCollectionRef = page1DocumentRef.collection('blocks');

        // Get the current count of blocks in the collection
        const blocksSnapshot = await blocksCollectionRef.get();
        const blockCount = blocksSnapshot.size;

        // Calculate the order for the new block
        const newBlockOrder = blockCount + 1;

        // Generate a unique ID for the new block document
        const newBlockDocRef = blocksCollectionRef.doc();

        function getBlockData(blockName) {
            const block = objectWithBlocks.find(obj => obj.type === blockName);
            return block || null; // Return null if blockName is not found
        }

        // Set the data for the new block document with the generated ID
        const selectedBlockData = getBlockData(selectedBlock);
        if (selectedBlockData) {
            const newBlockData = {
                ...selectedBlockData,
                order: newBlockOrder
            };

            if (selectedBlockData.image) {
                // If the block supports an image, add the 'image' property here
                newBlockData.image = ''; // Initialize with an empty string or other appropriate value
            }

            await newBlockDocRef.set(newBlockData);
            console.log(`New block '${selectedBlock}' added successfully.`);
        } else {
            console.error(`Block '${selectedBlock}' not found.`);
        }
        placeBlock(); // Refresh the blocks after adding a new block
    } catch (error) {
        console.error('Error adding new block:', error);
    }
}

async function handleImageUpload(file, blockIndex) {
    const storageRef = firebase.storage().ref();
    const imagesRef = storageRef.child('images');

    try {
        const imageRef = imagesRef.child(file.name);
        await imageRef.put(file);

        const downloadURL = await imageRef.getDownloadURL();

        // Update the block's data in Firestore with the image URL
        const db = firebase.firestore();
        const blockRef = db.collection('pages').doc(currentPage).collection('blocks').doc(blockIndex);

        try {
            await blockRef.update({
                image: downloadURL // Update the 'image' property with the download URL
            });
            console.log(`Image URL stored in the block's data.`);
        } catch (error) {
            console.error('Error updating block with image URL:', error);
        }

        console.log('Image uploaded successfully');
    } catch (error) {
        console.error('Error uploading image:', error);
    }
}

async function updateBlockProperty(pageName, blockIndex, propertyKey, newValue) {
    try {
        const blockRef = firestore.collection('pages').doc(pageName).collection('blocks').doc(blockIndex);
        await blockRef.update({
            [propertyKey]: newValue
        });
        console.log(`Block property '${propertyKey}' updated successfully.`);
    } catch (error) {
        console.error(`Error updating block property '${propertyKey}':`, error);
    }
}   