async function getData() {
    const bodyId = document.body.id;
    const data = await fetchDataFromFirestore(`pages/${bodyId}/blocks`);

    if (!data) {
        console.log("Data not found");
        return; // Exit the function if data doesn't exist
    }

    const block1Data = data["block3"];
    
    if (!block1Data) {
        console.log("Block3 data not found");
        return; // Exit the function if block1Data doesn't exist
    }

    console.log(block1Data);
    
    const titleElement = document.querySelector("#block3 h1");
    const contentElement = document.querySelector("#block3 p");
    
    if (block1Data["title"]) {
        titleElement.textContent = block1Data["title"];
    }
    
    if (block1Data["content"]) {
        contentElement.textContent = block1Data["content"];
    }
}

getData();
