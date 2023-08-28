getData();

async function getData() {
    const pageName = document.body.id;
    const blockId = document.querySelector('.temp').id;
    document.querySelector('.temp').classList.remove('temp');
    const data = await fetchDataFromFirestore(`pages/${pageName}/blocks`);
    mainFuntion(data,blockId);
};


function mainFuntion(data,blockId){
    document.querySelector(`#${blockId}`).style.backgroundColor = data[blockId]['color'];
}