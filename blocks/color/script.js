const getData = async () => {
    const pageName = document.body.id;
    const blockId = document.querySelector('.temp').id;
    document.querySelector('.temp').classList.remove('temp');
    const data = await fetchDataFromFirestore(`pages/${pageName}/blocks`);
    return data[blockId];
};

getData().then(data => {
    console.log(data['color']);
    document.querySelector('.color').style.backgroundColor = data['color'];
});
