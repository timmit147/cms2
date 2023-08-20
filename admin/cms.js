let currentPage = null;
let firestore = null; // Declare firestore in a broader scope

newDatabase();

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
        showLogoutButton(); // Show the logout button
        const footerMenu = document.querySelector('.footerMenu');
        footerMenu.style.display = 'flex';
        const blockContainer = document.querySelector('#blockContainer');
        blockContainer.style.display = 'flex';

    } else {
        showLoginForm(); // Show the login form
        hideLogoutButton(); // Hide the logout button
    }
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

// Function to show the logout button
function showLogoutButton() {
    const logoutButton = document.getElementById('logout-button');
    logoutButton.style.display = 'block';
}

// Function to hide the logout button
function hideLogoutButton() {
    const logoutButton = document.getElementById('logout-button');
    logoutButton.style.display = 'none';
}

document.getElementById('logout-button').addEventListener('click', () => {
    firebase.auth().signOut().then(() => {
        location.reload(); // Refresh the page after logging out
    });
});
    
}

// Function to log in
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




// Function to fetch data from Firestore and display
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


async function placeBlock() {
    if (!currentPage) {
        return;
    }

    const blockContainer = document.getElementById('blockContainer');
    blockContainer.innerHTML = ''; // Clear the existing content


    const pageTitle = document.createElement('h1');
    pageTitle.textContent = currentPage;
    blockContainer.appendChild(pageTitle);

    const breadcrump = document.querySelector('.breadcrump');
    breadcrump.textContent = currentPage;

 

     const blocksTitle = document.createElement('h2');
     blocksTitle.textContent = 'Blocks';
     blockContainer.appendChild(blocksTitle);
     

     

    const pages = await fetchDataFromFirestore(`pages/${currentPage}/blocks`);

    const blockArray = Object.entries(pages).map(([index, block]) => ({
        index,
        order: block.order || 0,
        block,
    }));

    const sortedBlocks = blockArray.sort((a, b) => a.order - b.order);

    for (const { index, block } of sortedBlocks) {
        const blockWrapper = document.createElement('div'); // Create a wrapper div
        blockWrapper.classList.add('block-wrapper'); // Add a class for styling

        const blockDiv = document.createElement('div');
        blockDiv.classList.add('blockContent'); // Add a class for styling


        const typeLabel = document.createElement('label');
        typeLabel.textContent = block["title"] || block["type"];
        typeLabel.style.fontWeight = 'bold';
        blockDiv.appendChild(typeLabel);

        let propertiesVisible = false;

        

        for (const key in block) {
            if (key === "image") {
                if (block[key]) { // Check if the image property has a value
                    const imageElement = document.createElement('img');
                    imageElement.src = block[key]; // Set the source of the image to the value
                    blockDiv.appendChild(imageElement); // Append the image element to the blockDiv
                }
        
                const imageInput = document.createElement('input');
                imageInput.type = 'file';
                imageInput.style.display = 'none'; // Hide the image input by default
                imageInput.addEventListener('change', (event) => {
                    const selectedImage = event.target.files[0];
                    handleImageUpload(selectedImage, index); // Pass the index to the function
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const newImageElement = document.createElement('img');
                        newImageElement.src = e.target.result;
                        blockDiv.insertBefore(newImageElement, imageInput); // Insert the new image before the input
                    };
                    reader.readAsDataURL(selectedImage); // Read and convert the selected image to base64
                });
                blockDiv.appendChild(imageInput);
        
                // Show the image input when the label is pressed
                typeLabel.addEventListener('click', () => {
                    imageInput.style.display = 'block';
                });
            }
            if (key === "type" || key === "hash") {
                continue;
            }
            if (block.hasOwnProperty(key)) {
                const propertyDiv = document.createElement('div');
                propertyDiv.classList.add('propertyDiv'); // Add a class for styling
                propertyDiv.style.display = 'none';

                const inputLabel = document.createElement('label');
                inputLabel.textContent = key;
                inputLabel.style.fontWeight = 'bold';
                propertyDiv.appendChild(inputLabel);

                const inputField = document.createElement('input');
                inputField.type = 'text';
                inputField.value = block[key];
                inputField.addEventListener('keydown', handleInputKeydown(index, key, inputField));
                propertyDiv.appendChild(inputField);

                blockDiv.appendChild(propertyDiv);
            }
        }


        // Add Remove button, initially hidden
        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.addEventListener('click', () => {
            removeBlockAndPage(currentPage, index);
        });
        blockDiv.appendChild(removeButton);

        blockDiv.querySelector("label").addEventListener('click', () => {
            const propertyDivs = blockDiv.querySelectorAll('div');
            propertiesVisible = !propertiesVisible;
            propertyDivs.forEach(div => {
                div.style.display = propertiesVisible ? 'flex' : 'none';
            });

            removeButtonVisible = !removeButtonVisible;
            removeButton.style.display = removeButtonVisible ? 'inline' : 'none';
        });

        blockWrapper.appendChild(blockDiv); // Add the block content to the wrapper
        addUpDownButtons(blockWrapper, index, sortedBlocks.length, currentPage);
        blockContainer.appendChild(blockWrapper); // Add the wrapper to the main container
          
         
    }

       // Add the form to the blockContainer
             const formHTML = `
             <form method="POST">
                 <select name="block" id="dropdown">
                     <option value="block1">Block 1</option>
                     <option value="block2">Block 2</option>
                     <option value="block3">Block 3</option>
                 </select>
                 <button type="submit" id="submitButton">Submit</button>
             </form>
         `;
         
         // Add the form HTML to the blockContainer
         blockContainer.insertAdjacentHTML('beforeend', formHTML);

         
    const settings = document.createElement('h2');
    settings.textContent = 'Settings';
    blockContainer.appendChild(settings);

     await loopPageFields(currentPage);



     // Add Remove button next to the h1 element
     const removePagelabel = document.createElement('label');
     removePagelabel.textContent = 'Remove Page';
     blockContainer.appendChild(removePagelabel);


     const removePageButton = document.createElement('button'); // Renamed variable
     removePageButton.textContent = 'Remove Page';
     removePageButton.addEventListener('click', () => {
         // Call the correct function with the appropriate parameter
         removePage(currentPage); // Assuming currentPageName is a string with the page's name
     });
     blockContainer.appendChild(removePageButton);
         
         // Use event delegation to add an event listener to the blockContainer
         blockContainer.addEventListener('click', async (event) => {
             // Check if the clicked element is the submit button
             if (event.target && event.target.id === 'submitButton') {
                 event.preventDefault(); // Prevent the default form submission behavior
         
                 // Get the selected block value from the dropdown
                 const selectedBlock = document.querySelector('#dropdown').value;
         
                 // Call the function to add a new block with the selected value
                 await addNewBlock(selectedBlock);
             }
         });
}



// ... (previous code remains the same)

// ... (previous code remains the same)

async function loopPageFields(currentPage) {
    const pageData = await getPageData(currentPage);

    if (!pageData) {
        console.log(`Page ${currentPage} does not exist.`);
        return;
    }

    const blockContainer = document.getElementById('blockContainer');

    const excludedFields = ['menu', 'label']; // Add other field names you want to exclude

    for (const field in pageData) {
        if (pageData.hasOwnProperty(field) && !excludedFields.includes(field)) {
            const fieldValue = pageData[field];

            const fieldLabel = document.createElement('label');
            fieldLabel.textContent = field;
            blockContainer.appendChild(fieldLabel);

            if (typeof fieldValue === 'string') {
                // Add an input field for string fields
                const inputField = createInputField('text', fieldValue, async (value) => {
                    await updatePageField(currentPage, field, value);
                });
                blockContainer.appendChild(inputField);
            } else if (typeof fieldValue === 'number') {
                // Add an input field for number fields
                const inputField = createInputField('number', fieldValue, async (value) => {
                    await updatePageField(currentPage, field, value);
                });
                blockContainer.appendChild(inputField);
            } else if (typeof fieldValue === 'boolean') {
                // Add a checkbox for boolean fields
                const checkbox = createCheckbox(fieldValue, async (value) => {
                    await updatePageField(currentPage, field, value);
                });
                blockContainer.appendChild(checkbox);
            } else {
                // Display the field value for other field types
                const fieldValueElement = createFieldValueElement(fieldValue.toString());
                blockContainer.appendChild(fieldValueElement);
            }

            blockContainer.appendChild(document.createElement('br')); // Add line break
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
            blockContainer.appendChild(pageWrapper);
        }
    }
}

async function displayUnselectedPages(menu) {
    const allPages = await getAllPages();

    for (const page of allPages) {
        if (!menu.includes(page)) {
            const pageWrapper = createPageWrapper(page, menu);
            blockContainer.appendChild(pageWrapper);
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
            await loopPageFields(currentPage); // Refresh the display
        }
    });

    const downButton = document.createElement('button');
    downButton.innerHTML = 'Move Down';
    downButton.addEventListener('click', async () => {
        const pageIndex = menu.indexOf(page);
        if (pageIndex < menu.length - 1) {
            [menu[pageIndex], menu[pageIndex + 1]] = [menu[pageIndex + 1], menu[pageIndex]];
            await updatePageField(currentPage, 'menu', menu);
            await loopPageFields(currentPage); // Refresh the display
        }
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




// ... (rest of the code remains the same)


// ... (previous code remains the same)

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

// ... (rest of the code remains the same)





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



// Assuming you have the necessary Firebase initialization code here

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

function handleAddPageButtonClick() {
    const pageNameInput = document.getElementById('pageNameInput');
    const popup = document.getElementById('addPagePopup');
    const saveButton = document.getElementById('saveButton');

    popup.style.display = 'flex'; // Show the popup

    saveButton.addEventListener('click', async () => {
        const newPageName = pageNameInput.value;
        if (newPageName) {
            const pagesRef = firebase.firestore().collection('pages');
            await pagesRef.doc(newPageName).set({});

            popup.style.display = 'none'; // Hide the popup after saving
            pageNameInput.value = ''; // Clear the input field

            // Refresh the menu buttons after adding a new page
            addMenuButtons();
        }
    });
}

async function removePage(pageName) {
    const confirmation = confirm(`Are you sure you want to remove the page ${pageName}?`);
    if (confirmation) {
        try {
            // Assuming you are using Firebase Firestore
            const pageRef = firebase.firestore().doc(`pages/${pageName}`);
            await pageRef.delete();

            // Refresh the page
            location.reload();
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






async function addMenuButtons() {
    const pages = await fetchDataFromFirestore("pages");
    const popup = document.getElementById('popup');
    const pagesButton = document.getElementById('pagesButton');

    // Clear the existing buttons and title

    // Event listener for the "Add Page" button

    for (const page in pages) {
        const button = document.createElement('button');
        button.textContent = page;
        button.className = "button2"; // Add the class to the button

        button.addEventListener('click', () => {
            currentPage = page;
            placeBlock();
            popup.style.display = 'none'; // Close the popup after selecting a page
        });

        popup.appendChild(button);
    }


    pagesButton.addEventListener('click', () => {
        if (popup.style.display === 'flex') {
            popup.style.display = 'none'; // Close the popup if it's open
        } else {
            popup.style.display = 'flex'; // Show the popup if it's closed
        }
    });
}



const storage = firebase.storage();



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

        const objectWithBlocks = [
            {
              title: "Introduction to Programming",
              content: "Learn the basics of programming with this comprehensive guide.",
              link: "https://example.com/programming-intro",
              type: "block1",
              image: "https://example.com/programming-intro"
            },
            {
              title: "Recipe Book",
              content: "Explore a collection of delicious recipes from around the world.",
              link: "https://example.com/recipe-book",
              type: "block2",
              image: "https://example.com/programming-intro"

            },
            {
              title: "Fitness Workout Plan",
              content: "Get fit and healthy with this step-by-step workout routine.",
              link: "https://example.com/fitness-plan",
              type: "block3",
              image: "https://example.com/programming-intro"
            }
        ];

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

  

// ...

function createBlockDiv(blockIndex, block) {
    const blockDiv = document.createElement('div');
    blockDiv.classList.add('blockContent'); // Add a class for styling

    // ... (Other block content creation)

    // Create an image input for blocks with "image" property
    if (block.hasOwnProperty("image")) {
        const imageInput = document.createElement('input');
        imageInput.type = 'file';
        imageInput.addEventListener('change', (event) => {
            const selectedImage = event.target.files[0];
            handleImageUpload(selectedImage, blockIndex);
        });
        blockDiv.appendChild(imageInput);
    }

    // ... (Other block content creation)

    return blockDiv;
}


// ...

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










