async function getData() {
    
    const pageName = document.body.id;
    const blockId = document.querySelector('.temp').id;
    document.querySelector('.temp').classList.remove('temp');
    const data = await fetchDataFromFirestore(`pages/${pageName}/blocks`);

    if (!data) {
        console.log("Data not found");
        return; // Exit the function if data doesn't exist
    }

    // const imageBlockElements = Object.values(data).filter(item => item.type === "imageBlock");

    const blockData = data[blockId];

    
    if (!blockData) {
        console.log(`${blockId} data not found`);
        return; // Exit the function if blockData doesn't exist
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
}

getData();
