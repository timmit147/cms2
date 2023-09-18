let currentPage = document.getElementsByTagName("body")[0].id;
let firestore = null;

const createDropdownWithBlocks = (async () => {
    const module = await import('./blocks.js');
    const objectWithBlocks = module.default; 

    let optionsHTML = '';
    objectWithBlocks.forEach(item => {
        if (item.type) {
            const optionText = item.type.charAt(0).toUpperCase() + item.type.slice(1).replace(/([A-Z])/g, ' $1').toLowerCase();
            optionsHTML += `<option value="${item.type}">${optionText}</option>`;
        }
    });

    // Construct the complete form HTML
    return `
    <label>Add block</label>
    <div id="addBlock">
        <select class="block" name="block" >
            ${optionsHTML}
        </select>
        <button>Add block</button>
    </div>
    `;
})();




function myFunction() {
    if(localStorage.getItem('page')){
        currentPage = localStorage.getItem('page');
    }
  }

window.addEventListener("load", myFunction);

startScript();

async function startScript(){
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
        // addMenuButtons();
        hideLoginForm(); // Hide the login form
        // const menu = document.querySelector('.menu');
        // menu.style.display = 'flex';
        // const container = document.querySelector('#container');
        // container.style.display = 'flex';
    } else {
        showLoginForm(); // Show the login form
    }
});



// Function to hide the login form
function hideLoginForm() {
    const loginForm = document.getElementById('loginForm');
    loginForm.style.display = 'none';
}

// Function to show the login form
function showLoginForm() {
    const loginForm = document.getElementById('loginForm');
    loginForm.style.display = 'flex';
}

    
}


var loginForm = document.getElementById("loginFormElement");
var passwordField = document.getElementById('password');
var emailField = document.getElementById('email');
var errorMessage = document.getElementById('error-message');

loginForm.addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent the default form submission

    const email = emailField.value;
    const password = passwordField.value;

    // Perform basic email format validation
    if (!validateEmail(email)) {
        errorMessage.textContent = "!Invalid email or password";
        return;
    }

    loginUser(email, password);
});

passwordField.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        event.preventDefault(); // Prevent the default form submission

        const email = emailField.value;
        const password = passwordField.value;

        // Perform basic email format validation
        if (!validateEmail(email)) {
            errorMessage.textContent = "Invalid email address";
            return;
        }

        loginUser(email, password);
    }
});

function loginUser(email, password) {
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
        .then(() => {
            return firebase.auth().signInWithEmailAndPassword(email, password);
        })
        .catch((error) => {
            // Display user-friendly error message
            errorMessage.textContent = error.message;
        });
}

function validateEmail(email) {
    // Basic email format validation using a regular expression
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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

}




function addLink(target,hash) {
    if(hash !== undefined){
        hash = `#${hash}`
    }
    else{
        hash = '';
    }
    const currentDomain = window.location.hostname;
    const currentPort = (currentDomain === 'localhost') ? ':3000/' : ''; // Only add port for localhost
    const desiredURL = `http://${currentDomain}${currentPort}${currentPage}${hash}`;
    const pageTitle = document.createElement('a');
    pageTitle.textContent = desiredURL;
    pageTitle.href = desiredURL;
    pageTitle.target = "_blank";
    
    target.appendChild(pageTitle);
}






function addBlockTitle(target){
    const blocksTitle = document.createElement('h2');
    blocksTitle.textContent = 'Blocks';
    target.appendChild(blocksTitle);
}


function ShowBlockContents(target, name){
    const blocksTitle = document.createElement('h1');
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
       
       addUpButton(divContainer, index, sortedBlocks.length, currentPage); // Adding buttons to the div

       divContainer.appendChild(typeLabel); // Placing the typeLabel inside the div
       
       container.appendChild(divContainer); // Placing the whole div container inside the 'container'

        typeLabel.addEventListener('click', () => {
            const container = document.querySelector("#container");
            clearContainer(container);
            ShowBlockContents(container, typeLabel.textContent);
            addLink(container,index);
    
            const keysArray = [];

            for (const key in block) {
                if (block.hasOwnProperty(key)) {
                    keysArray.push(key);
                }
            }


            keysArray.sort();

            loopKeysArray(keysArray, block, index );

            
            const removeDiv = document.createElement('div');
            removeDiv.classList.add('removeDiv');
            
            const inputLabel = document.createElement('label');
            inputLabel.textContent = "Remove block";
            inputLabel.style.fontWeight = 'bold';
            removeDiv.appendChild(inputLabel);
            
            const removeButton = document.createElement('button');
            removeButton.textContent = 'Remove block';
            removeButton.classList.add('removeBlockButton');
            
            // Hide the button initially by setting its style
            removeButton.style.display = 'none';
            
            removeButton.addEventListener('click', () => {
                removeBlockAndPage(currentPage, index); // This will remove the block
            });
            
            let isButtonVisible = false; // Initially, the button is hidden
            
            inputLabel.addEventListener('click', () => {
                if (isButtonVisible) {
                    removeButton.style.display = 'none'; // Hide the button
                } else {
                    removeButton.style.display = 'inline-block'; // Show the button
                }
                isButtonVisible = !isButtonVisible; // Toggle button visibility state
            });
            
            removeDiv.appendChild(removeButton);
            
            container.appendChild(removeDiv);
            

    





        });
    }
}



function formatKeyLabel(key) {
    // Split the key by uppercase letters and join with spaces
    return key.split(/(?=[A-Z])/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function loopKeysArray(keysArray, block, index) {
    for (const key of keysArray) {
        if (key === "type") {
            continue;
        }
        if (!block.hasOwnProperty(key)) {
            continue;
        }

        const formattedKey = formatKeyLabel(key);
        const fieldContainer = document.createElement('div');

        if (key.includes("image") || key.includes("Image") || key.includes("logo")) {
            const imageField = document.createElement('div');
            imageField.className = 'image-field';

            const blocksTitle = document.createElement('label');
            blocksTitle.textContent = key;

            function toggleImageAndInput() {
                const isImageVisible = imageElement.style.display === 'none';
                imageElement.style.display = isImageVisible ? 'block' : 'none';
                imageInput.style.display = isImageVisible ? 'block' : 'none';
            }

            blocksTitle.addEventListener('click', toggleImageAndInput);

            imageField.appendChild(blocksTitle);

            const imageElement = document.createElement('img');
            imageElement.src = block[key];
            imageElement.style.display = 'none';
            imageField.appendChild(imageElement);

            const imageInput = document.createElement('input');
            imageInput.type = 'file';
            imageInput.style.display = 'none';

            imageInput.addEventListener('change', (event) => {
                const selectedImage = event.target.files[0];
                handleImageUpload(selectedImage, index, key);
                const reader = new FileReader();
                reader.onload = (e) => {
                    const newImageElement = document.createElement('img');
                    newImageElement.src = e.target.result;
                    imageElement.src = e.target.result;
                    imageField.insertBefore(newImageElement, imageInput);
                };
                reader.readAsDataURL(selectedImage);
            });

            imageField.appendChild(imageInput);

            fieldContainer.appendChild(imageField);
        } else {
            const propertyDiv = document.createElement('div');
            propertyDiv.classList.add('propertyDiv');

            const inputLabel = document.createElement('label');
            inputLabel.textContent = formattedKey;
            inputLabel.style.fontWeight = 'bold';
            propertyDiv.appendChild(inputLabel);

            const inputField = document.createElement('input');
            inputField.type = 'text';
            inputField.value = block[key];
            inputField.style.display = 'none';
            propertyDiv.appendChild(inputField);

            const submitButton = document.createElement('button');
            submitButton.textContent = 'Update';
            submitButton.style.display = 'none';
            propertyDiv.appendChild(submitButton);

            inputLabel.addEventListener('click', () => {
                inputField.style.display = inputField.style.display === 'none' ? 'block' : 'none';
                submitButton.style.display = submitButton.style.display === 'none' ? 'block' : 'none';
            });

            submitButton.addEventListener('click', () => {
                handleSubmitButtonClick(index, key, inputField, submitButton);
            });

            fieldContainer.appendChild(propertyDiv);
        }

        container.appendChild(fieldContainer);
    }
}










async function addForm(){
    container.insertAdjacentHTML('beforeend', await createDropdownWithBlocks);
    document.querySelector("#addBlock button").addEventListener("click", function() {
        const selectedBlock = document.querySelector('#addBlock .block').value;
        addNewBlock(selectedBlock, page);      
    });
}



document.addEventListener("DOMContentLoaded", function () {
    const addPageButton = document.querySelector(".addPage");
    const showPageForm = document.querySelector(".showPageForm");


    addPageButton.addEventListener("click", async function () {
        if (showPageForm.style.display === "flex") {
            showPageForm.style.display = "none";
          } else {
            showPageForm.style.display = "flex";
          }
    });
});

const module = await import('./blocks.js');
const objectWithBlocks = module.default;

const selectElement = document.querySelector('.selectOption');
const blockForm = document.querySelector('.showBlockForm');

objectWithBlocks.forEach(item => {
    const option = document.createElement('option');
    option.value = item.type; // Set the option value
    option.textContent = item.type; // Set the option text
    selectElement.appendChild(option);
});

blockForm.addEventListener('submit', async function (event) {
    event.preventDefault(); // Prevent the default form submission behavior
    const selectedBlock = document.querySelector('.selectOption').value;
    await addNewBlock(selectedBlock);  
    let page = document.querySelector('.currentPage').textContent.toLowerCase();
    getBlocks(page);
    document.querySelector('.showBlockForm').style.display = 'none';
});


var removeBlock = document.querySelector('.removeBlock');

    // Add a click event listener to the button
    removeBlock.addEventListener('click', async function() {
      let currentBlock = document.querySelector('.currentBlock').id;
      console.log(currentBlock);
      let page = document.querySelector('.currentPage').textContent.toLowerCase();
      await deleteBlock(page,currentBlock);
      getBlocks(page);
    });


    async function deleteBlock(pageName, blockName) {
        try {
            const confirmDelete = confirm(`Are you sure you want to delete the block with name: ${blockName}?`);
    
            if (!confirmDelete) {
                console.log('Block deletion canceled by user.');
                return;
            }
    
            // Reference to the specific document to delete
            const blockRef = firestore.collection('pages').doc(pageName).collection('blocks').doc(blockName);
    
            // Delete the document
            await blockRef.delete();
    
            console.log(`Block with name ${blockName} has been deleted.`);
        } catch (error) {
            console.error('Error deleting block:', error);
        }
    }
    

    
const addButton = document.querySelector('.addBlock');

        // Add a click event listener to the button
        addButton.addEventListener('click', () => {
            // Toggle the display property of the block form element
            if (blockForm.style.display === 'none' || blockForm.style.display === '') {
                blockForm.style.display = 'block';
            } else {
                blockForm.style.display = 'none';
            }
        });



const addPageButton = document.querySelector('.addPageButton');
const addPageInput = document.querySelector('.addPageInput');

addPageButton.addEventListener('click', async function() {
    let inputValue = addPageInput.value;
    
    if (inputValue) {
        inputValue = inputValue.toLowerCase(); // Convert input to lowercase
        try {
            await createPage(inputValue);
            getPages();
            document.querySelector(".showPageForm").style.display = "none";
            console.log(`Page created with value: ${inputValue}`);
            // You can add more code here for success handling
        } catch (error) {
            console.error(`Error creating page: ${error}`);
            // You can add more code here for error handling
        }
    } else {
        console.warn('Please enter a value before clicking the "Add Page" button.');
        // You can add more code here for handling empty input
    }
});


var removePageButton = document.querySelector(".removePage");

removePageButton.addEventListener("click", async function () {
    let currentPage = document.querySelector('.currentPage');
    let currentPageText = currentPage.textContent.toLowerCase();
    await deletePage(currentPageText);
    getPages();
});

async function deletePage(pageName) {
    try {
        const confirmDelete = confirm(`Are you sure you want to delete the page with ID: ${pageName}?`);

        if (!confirmDelete) {
            console.log('Page deletion canceled by user.');
            return;
        }

        const pagesCollection = firestore.collection('pages');
        const pageRef = pagesCollection.doc(pageName);

        // Delete the document
        await pageRef.delete();

        console.log(`Page deleted with ID: ${pageName}`);
    } catch (error) {
        console.error('Error deleting page:', error);
    }
}




async function createPage(pageName) {
    try {
        const pagesCollection = firestore.collection('pages');

        // Specify the document ID as the pageName
        const newPageRef = pagesCollection.doc(pageName);

        // You can set data for the document if needed
        const pageData = {
            // Add any other fields as needed
        };

        await newPageRef.set(pageData); // Use set() to create or update the document

        console.log(`Page added with ID: ${pageName}`);
    } catch (error) {
        console.error('Error creating page:', error);
    }
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

            if (typeof fieldValue === 'string' || typeof fieldValue === 'number') {
                // Create a div with the class "field-container" to wrap the input field and submit button
                const fieldDiv = document.createElement('div');
                fieldDiv.classList.add('field-container');

                // Add an input field for string and number fields
                const inputField = createInputField(
                    typeof fieldValue === 'string' ? 'text' : 'number',
                    fieldValue,
                    async (value) => {
                        // Do nothing here, we will update when the button is pressed.
                    }
                );
                fieldDiv.appendChild(inputField);

                // Add a submit button for each input field
                const submitButton = document.createElement('button');
                submitButton.textContent = 'Submit';
                submitButton.addEventListener('click', async () => {
                    const field = fieldLabel.textContent;
                    const inputValue = inputField.value;
                    await updatePageField(currentPage, field, inputValue);
                });
                fieldDiv.appendChild(submitButton);

                container.appendChild(fieldDiv);
            } else if (typeof fieldValue === 'boolean') {
                // Create a div with the class "field-container" to wrap the checkbox and submit button
                const fieldDiv = document.createElement('div');
                fieldDiv.classList.add('field-container');

                // Add a checkbox for boolean fields
                const checkbox = createCheckbox(fieldValue, async (value) => {
                    // Do nothing here, we will update when the button is pressed.
                });
                fieldDiv.appendChild(checkbox);

                // Add a submit button for each checkbox
                const submitButton = document.createElement('button');
                submitButton.textContent = 'Submit';
                submitButton.addEventListener('click', async () => {
                    const field = fieldLabel.textContent;
                    const checkboxValue = checkbox.checked;
                    await updatePageField(currentPage, field, checkboxValue);
                });
                fieldDiv.appendChild(submitButton);

                container.appendChild(fieldDiv);
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
    });

    const downButton = document.createElement('button');
    downButton.innerHTML = 'Move Down';
    downButton.addEventListener('click', async () => {
        const pageIndex = menu.indexOf(page);
        if (pageIndex < menu.length - 1) {
            [menu[pageIndex], menu[pageIndex + 1]] = [menu[pageIndex + 1], menu[pageIndex]];
            await updatePageField(currentPage, 'menu', menu);
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
        triggerGitHubAction();

    } catch (error) {
        console.error(`Error updating field '${field}':`, error);
    }


}

async function triggerGitHubAction() {
    const data = await fetchDataFromFirestore("private");
    const token = await data["private"]["token"];   
    
    const repository = 'timmit147/cms2';

    const response = await fetch(`https://api.github.com/repos/${repository}/dispatches`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            event_type: 'update-html', // This should match the event in your workflow file.
        }),
    });

    if (response.ok) {
        console.log('GitHub Action workflow triggered successfully.');
    } else {
        console.error('Error triggering GitHub Action workflow:', response.statusText);
    }
}


function addUpButton(blockDiv, blockIndex, totalBlocks, pageName) {
    const buttonsDiv = document.createElement('div'); // Create a div to contain the buttons
    buttonsDiv.classList.add('arrow-buttons'); // Add a class name for styling

    const upButton = document.createElement('button');
    upButton.innerHTML = '<i class="fas fa-angle-up"></i>'; // Font Awesome up arrow icon
    upButton.classList.add('arrow-button');
    upButton.addEventListener('click', async () => {
        await swapBlocksUp(pageName, blockIndex);
    });

    buttonsDiv.appendChild(upButton);

    blockDiv.appendChild(buttonsDiv); // Add the div containing the up button to the block div
}

async function swapBlocksUp(pageName, blockId) {
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
        const existingOrders = blocksQuerySnapshot.docs.map(doc => ({
            id: doc.id,
            order: doc.data().order
        }));

        // Find the highest available order lower than the current block's order
        const lowerOrders = existingOrders.filter(item => item.order < blockOrder);

        if (lowerOrders.length > 0) {
            const targetOrder = Math.max(...lowerOrders.map(item => item.order));
            const targetBlock = lowerOrders.find(item => item.order === targetOrder);

            const targetBlockRef = db.collection('pages').doc(pageName).collection('blocks').doc(targetBlock.id);

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

            } catch (error) {
                console.error("Error updating blocks in Firestore:", error);
            }
        } else {
            console.log(`Cannot swap block ${blockId} up as it's already at the top.`);
        }
    } catch (error) {
        console.error("Error getting block data:", error);
    }
}


async function handleSubmitButtonClick(blockIndex, inputKey, inputField,submitButton) {
    const newValue = inputField.value;
    const paragraph = document.createElement("p");
    const result = await updateBlockProperty(currentPage, blockIndex, inputKey, newValue);
    paragraph.textContent = result;
    console.log(result);

    if (result.includes("error")) {
        paragraph.style.color = "red";
    } else {
        paragraph.style.color = "green";
    }

    paragraph.style.fontSize = "14px";

    submitButton.insertAdjacentElement('afterend', paragraph);
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
        } catch (error) {
            console.error("Error removing block:", error);
        }
    }
}

async function handleAddPageButtonClick() {
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


async function getPages() {
    const pages = await fetchDataFromFirestore("pages");
    const pagesTitles = document.querySelector(".pageTitles");
    pagesTitles.innerHTML = "";
    const pagesArray = Object.keys(pages); 
    for (const page of pagesArray) {
        const button = document.createElement('button'); // Create the button element
        button.textContent = page.charAt(0).toUpperCase() + page.slice(1);
        button.addEventListener('click', () => {
            // Remove the 'currentPage' class from all buttons
            const allButtons = document.querySelectorAll(".pageTitles button");
            allButtons.forEach((btn) => {
                btn.classList.remove("currentPage");
                document.querySelector(".removePage").style.display = "none";
                document.querySelector(".addBlock").style.display = "none";
            });

            // Add the 'currentPage' class to the clicked button
            document.querySelector('.upBlock').style.display = 'none';
            button.classList.add("currentPage");
            document.querySelector(".removePage").style.display = "initial";
            document.querySelector('.removeBlock').style.display = 'none';
            document.querySelector(".addBlock").style.display = "block";



            getBlocks(page);
        });
        pagesTitles.appendChild(button); // Append the button to the button container
    }
}


getPages();

let upBlockElement = document.querySelector(".upBlock");

// Add a click event listener to the ".upBlock" element
upBlockElement.addEventListener("click", async function () {
    let currentBlockElement = document.querySelector(".currentBlock");

    // Get the id of the ".currentBlock" element and log it to the console
    var currentBlockId = currentBlockElement.id;

    let page = document.querySelector('.currentPage').textContent.toLowerCase();
    const blocksQuerySnapshot = await firebase.firestore().collection('pages').doc(page).collection('blocks').get();
    const existingOrders = blocksQuerySnapshot.docs.map(doc => ({
        id: doc.id,
        order: doc.data().order
    }));

    // Get the id of the button above the ".currentBlock" element
    var aboveButton = currentBlockElement.previousElementSibling;
    if (aboveButton) {
        var aboveButtonId = aboveButton.id;
    
        // Find the order values for the current block and the above button
        var currentBlockOrder = parseInt(existingOrders.find(item => item.id === currentBlockId).order);
        var aboveButtonOrder = parseInt(existingOrders.find(item => item.id === aboveButtonId).order);
    
        // Check if the order values are the same
        if (currentBlockOrder === aboveButtonOrder) {
            currentBlockOrder += 1; // Increment aboveButton's order by 1
        }
    
    
        // Swap the order values
        existingOrders.find(item => item.id === currentBlockId).order = aboveButtonOrder;
        existingOrders.find(item => item.id === aboveButtonId).order = currentBlockOrder;
    
        // Update the Firestore database with the new order values
        existingOrders.forEach(async item => {
            await firebase.firestore().collection('pages').doc(page).collection('blocks').doc(item.id).update({
                order: item.order.toString() // Convert the number back to a string when updating
            });
        });
    } else {
        console.log("No button above the currentBlock element.");
    }
    
    getBlocks(page);
});






async function getBlocks(page) {
    const blocks = await fetchDataFromFirestore(`pages/${page}/blocks`);
    const blocksTitles = document.querySelector(".blockTitles");
    blocksTitles.innerHTML = "";
    const contentFields = document.querySelector(".contentFields");
    contentFields.innerHTML = "";
    const blocksArray = Object.keys(blocks);

    // Sort the blocksArray based on the "order" property
    blocksArray.sort((a, b) => {
        const orderA = blocks[a].order || 0; // Default to 0 if "order" is missing
        const orderB = blocks[b].order || 0; // Default to 0 if "order" is missing
        return orderA - orderB; // Sort in ascending order based on "order" property
    });

    for (const block of blocksArray) {
        const button = document.createElement('button'); // Create the button element
        button.id = block;
        button.textContent = blocks[block]['title'];
        button.addEventListener('click', () => {
            // Remove the 'currentBlock' class from all buttons
            const allButtons = document.querySelectorAll(".blockTitles button");
            allButtons.forEach((btn) => {
                btn.classList.remove("currentBlock");
            });

            // Add the 'currentBlock' class to the clicked button
            button.classList.add("currentBlock");
            const buttonAbove = button.previousElementSibling;

            if (buttonAbove && buttonAbove.tagName === 'BUTTON') {
                document.querySelector('.upBlock').style.display = 'block';
            }
            else{
                document.querySelector('.upBlock').style.display = 'none';
            }
            document.querySelector('.removeBlock').style.display = 'block';

            getContent(page, block);
        });
        blocksTitles.appendChild(button); // Append the button to the button container
    }
}


async function getContent(page, block) {
    let content = await fetchDataFromFirestore(`pages/${page}/blocks`);
    const contentFields = document.querySelector(".contentFields");
    contentFields.innerHTML = "";

    // Create an array of field names
    const fieldNames = Object.keys(content[block]);

    // Sort the field names alphabetically, excluding "title"
    const sortedFieldNames = fieldNames.filter(fieldName => fieldName !== "title").sort();

    // Check if "title" field exists and add it at the beginning
    if (fieldNames.includes("title")) {
        sortedFieldNames.unshift("title");
    }

    // Function to format field names
    function formatFieldName(fieldName) {
        // Replace numbers with corresponding words, e.g., "block1Price" becomes "Block 1 Price"
        fieldName = fieldName.replace(/(\d+)/g, " $1 ");
        // Add spaces before capital letters (except the first one)
        fieldName = fieldName.replace(/([A-Z])/g, ' $1');
        // Capitalize the first letter of each word
        return fieldName.trim().replace(/(^\w|\s\w)/g, m => m.toUpperCase());
    }

    // Iterate through the sorted field names and create elements
    for (const fieldName of sortedFieldNames) {
        let imageElement;
        const fieldDiv = document.createElement('div');
        fieldDiv.classList.add('field'); // Add the class "field" to the div
    
        const typeLabel = document.createElement('label');
        typeLabel.textContent = formatFieldName(fieldName); // Format the field name
        typeLabel.style.fontWeight = 'bold';
    
        const inputField = document.createElement('input');
    
        if (fieldName.includes("Image") || fieldName.includes("image")) {
            inputField.type = 'file';
            imageElement = document.createElement('img');
            imageElement.src = content[block][fieldName];
            inputField.addEventListener('change', (event) => {
                const selectedImage = event.target.files[0];
                handleImageUpload(page, selectedImage, block, fieldName);
                const reader = new FileReader();
                reader.onload = (e) => {
                    const newImageElement = document.createElement('img');
                    newImageElement.src = e.target.result;
                    imageElement.src = e.target.result;
                    // imageElement.insertBefore(newImageElement, inputField);
                };
                reader.readAsDataURL(selectedImage);
            });
    
        } else {
            inputField.type = 'text';
            inputField.value = content[block][fieldName];
        }
    
        const submitButton = document.createElement('button');
        submitButton.textContent = 'Update';
    
        submitButton.addEventListener('click', () => {
            updateBlockProperty(page, block, fieldName, inputField.value);
        });
    
        fieldDiv.appendChild(typeLabel);
        if (imageElement !== undefined) {
            fieldDiv.appendChild(imageElement);
        }
        fieldDiv.appendChild(inputField);
        fieldDiv.appendChild(submitButton);
    
        contentFields.appendChild(fieldDiv); // Add the "field" div to the parent container
    }
    
}




async function addNewBlock(selectedBlock) {
    let page = document.querySelector('.currentPage').textContent.toLowerCase();
    try {
        const pagesCollection = firestore.collection('pages');
        const page1DocumentRef = pagesCollection.doc(page);
        const blocksCollectionRef = page1DocumentRef.collection('blocks');

        // Get the current count of blocks in the collection
        const blocksSnapshot = await blocksCollectionRef.get();
        const blockCount = blocksSnapshot.size;

        // Calculate the order for the new block
        const newBlockOrder = blockCount + 1;

        // Generate a unique ID for the new block document
        const newBlockDocRef = blocksCollectionRef.doc();

        async function getBlockData(blockName) {
            const module = await import('./blocks.js');
            const objectWithBlocks = module.default; 
            const block = objectWithBlocks.find(obj => obj.type === blockName);
            return block || null; // Return null if blockName is not found
        }

        // Set the data for the new block document with the generated ID
        const selectedBlockData = await getBlockData(selectedBlock);
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
    } catch (error) {
        console.error('Error adding new block:', error);
    }
}

async function handleImageUpload(page,file, blockIndex,key) {
    const storageRef = firebase.storage().ref();
    const imagesRef = storageRef.child('images');

    try {
        const imageRef = imagesRef.child(file.name);
        await imageRef.put(file);

        const downloadURL = await imageRef.getDownloadURL();

        // Update the block's data in Firestore with the image URL
        const db = firebase.firestore();
        const blockRef = db.collection('pages').doc(page).collection('blocks').doc(blockIndex);
        console.log(blockRef);
        try {
            await blockRef.update({
                [key]: downloadURL // Update the 'key' field with the download URL
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
        triggerGitHubAction();
        return `Block property '${propertyKey}' updated successfully. and it should take approximately 1 minute for the changes to reflect on the website.`;
    } catch (error) {
        console.error(`Error updating block property '${propertyKey}':`, error);
        return `Error updating block property '${propertyKey}':`, error;
    }
}   