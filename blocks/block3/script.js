async function getData() {
    const bodyId = document.body.id;
    const data = await fetchDataFromFirestore(`pages/${bodyId}/blocks`);
    const block1Data = data["block3"];
    document.querySelector("#block3 h1").textContent = block1Data["title"];
    document.querySelector("#block3 p").textContent = block1Data["content"];

}

getData();