async function getData() {
    const key = window.key;
    const bodyId = document.body.id;
    const data = await fetchDataFromFirestore(`pages/${bodyId}/blocks`);

    if (!data) {
        console.log("Data not found");
        return;
    }
    

    let blockData = data[key];

    if (localStorage.getItem(key)) {
        blockData = JSON.parse(localStorage.getItem(key)); // Parse the stored JSON
    }

    localStorage.setItem(key, JSON.stringify(data[key]));

    if (!blockData) {
        console.log(`${key} data not found`);
        return; 
    }
    

    const titleElement = document.querySelector(`#${key} h1`);
    const contentElement = document.querySelector(`#${key} p`);
    const imageElement = document.querySelector(`#${key} .image`);

    
    if (blockData["title"]) {
        titleElement.textContent = blockData["title"];
    }
    
    if (blockData["content"]) {
        contentElement.textContent = blockData["content"];
    }

    if (blockData["image"]) {
        imageElement.src = blockData["image"];  // Replace 'new_image_url.jpg' with the actual URL of the new image
    }

    if(blockData){
        document.querySelector(`#${key} .imageBlock`).style.display = "flex";
        document.querySelector(`#${key} .loading`).style.display = "none";
    }
}

getData();
