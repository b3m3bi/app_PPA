// const name = document.querySelector('#name');
// const addBtn = document.querySelector('#add-btn');


// addBtn.addEventListener('click', (event) => {
//     tableContainer.textContent = name.value;
// })



let nodeData;
nodeData = await fetch("./test_node_data.json").then(res => res.json())


const definitionTable = document.querySelector('#definition-table');

for (let node of nodeData){
    console.log(node)
    let row = definitionTable.insertRow();
    for (let key in node){
        console.log(key)
        let cell = row.insertCell()
        cell.textContent = node[key];
    }
    let actionCell = row.insertCell();
    actionCell.innerHTML = '<button>Editar</button> <button>Borar</button>'


}



