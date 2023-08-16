
async function getData() {
    const bodyId = document.body.id;
    const data = await fetchDataFromFirestore(`pages/${bodyId}/blocks`);
    const block1Data = data["block1"];
    document.querySelector("#block1 h1").textContent = block1Data["title"];
    document.querySelector("#block1 p").textContent = block1Data["content"];

}

getData();