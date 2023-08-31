async function getData() {
    const bodyId = document.body.id;
    const blockId = document.querySelector('.temp').id;
    document.querySelector('.temp').classList.remove('temp');
    
    const data = await fetchDataFromFirestore(`pages/${bodyId}/blocks`);

    if (!data) {
        console.log("Data not found");
        return;
    }
    

    let blockData = data[blockId];

    if (localStorage.getItem(blockId)) {
        blockData = JSON.parse(localStorage.getItem(blockId)); // Parse the stored JSON
    }

    localStorage.setItem(blockId, JSON.stringify(data[blockId]));

    if (!blockData) {
        console.log(`${blockId} data not found`);
        return; 
    }
    

    const titleElement = document.querySelector(`#${blockId} h1`);
    const contentElement = document.querySelector(`#${blockId} p`);
    const imageElement = document.querySelector(`#${blockId} .image`);

    
    if (titleElement) {
        titleElement.textContent = blockData["title"];
    }
    
    if (contentElement) {
        contentElement.textContent = blockData["content"];
    }

    if (imageElement) {
        imageElement.src = blockData["image"];  // Replace 'new_image_url.jpg' with the actual URL of the new image
    }

    if(blockData){
        document.querySelector(`#${blockId} .imageBlock`).style.display = "flex";
        document.querySelector(`#${blockId} .loading`).style.display = "none";
    }
}

getData();
