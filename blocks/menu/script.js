async function getData() {
    const bodyId = document.body.id;
    const data = await fetchDataFromFirestore(`pages/`);

    if (!data) {
        console.log("Data not found");
        return; // Exit the function if data doesn't exist
    }

    const blockData = data['settings']['menu'];
    
    if (!blockData) {
        console.log(`${bodyId} data not found`);
        return; // Exit the function if blockData doesn't exist
    }

    const menu = document.querySelector(`#${bodyId} .menu-list`);
    
    if (!menu) {
        console.log("Menu element not found");
        return; // Exit the function if menu doesn't exist
    }

    // Loop through blockData array
    for (const item of blockData) {
        // Create a list item element
        const listItem = document.createElement('li');
        
        // Create a link element
        const link = document.createElement('a');
        link.href =  item.toLowerCase()  + '.html'; // Set the link using lowercase item name
        link.textContent = item; // Set the text content of the link
        
        // Append the link to the list item
        listItem.appendChild(link);
        
        // Append the list item to the menu
        menu.appendChild(listItem);
    }
}

getData();
