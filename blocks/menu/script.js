async function getData() {
    const key = window.key;
    const bodyId = document.body.id;
    const data = await fetchDataFromFirestore(`pages/`);

    if (!data) {
        console.log("Data not found");
        return; // Exit the function if data doesn't exist
    }

    // const imageBlockElements = Object.values(data).filter(item => item.type === "imageBlock");

    const blockData = data['settings']['menu'];

    console.log(blockData);

    
    if (!blockData) {
        console.log(`${key} data not found`);
        return; // Exit the function if blockData doesn't exist
    }


    
    const menu = document.querySelector(`#${key} .menu-list`);

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
