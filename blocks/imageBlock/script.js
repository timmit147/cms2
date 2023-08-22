async function getData() {
    console.log(window.key);
    const key = window.key;
    const bodyId = document.body.id;
    const data = await fetchDataFromFirestore(`pages/${bodyId}/blocks`);

    if (!data) {
        console.log("Data not found");
        return; // Exit the function if data doesn't exist
    }

    // const imageBlockElements = Object.values(data).filter(item => item.type === "imageBlock");

    const blockData = data[key];

    
    if (!blockData) {
        console.log(`${key} data not found`);
        return; // Exit the function if blockData doesn't exist
    }


    
    const titleElement = document.querySelector(`#${key} h1`);
    const contentElement = document.querySelector(`#${key} p`);
    
    if (blockData["title"]) {
        titleElement.textContent = blockData["title"];
    }
    
    if (blockData["content"]) {
        contentElement.textContent = blockData["content"];
    }
}

getData();
