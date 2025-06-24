let nodeData = await fetch('./data/test_node_data.json').then(res => res.json());
let linkData = await fetch('./data/test_link_data.json').then(res => res.json());

////// Create definition table

const definitionTable = document.querySelector('#definition-table tbody');


function renderDefinitionTable(nodeData) {
    // Reset table
    definitionTable.innerHTML = '';
    // Add data
    for (let node of nodeData){
        addDefinitionToTable(definitionTable, node.factor, node.code, node.definition);
    }
}

function addDefinitionToTable(definitionTable, factor, code, definition) {
    let row = definitionTable.insertRow();
    row.innerHTML = `<td>${factor}</td> <td>${code}</td> <td>${definition}</td>`;

    let actionCell = row.insertCell();
    let deleteBtn = document.createElement('button');
    deleteBtn.addEventListener('click', () => {
        deleteDefinition(code);
        renderTables();
    });
    deleteBtn.textContent = 'Borrar';
    actionCell.append(deleteBtn);
    
    let editBtn = document.createElement('button');
    editBtn.addEventListener('click', () => {
        editDefinition(code);
    });
    editBtn.textContent = 'Editar';
    actionCell.append(editBtn);
}

const factorInput = document.querySelector('#factor');
const codeInput = document.querySelector('#code');
const definitionInput = document.querySelector('#definition');

const addBtn = document.querySelector('#add-btn');
const updateBtn = document.querySelector('#update-btn');

function addDefinitionToNodeData(factor, code, definition){
    let node = {
        factor, 
        code,
        definition
    }
    nodeData.push(node);
}

addBtn.addEventListener('click', () => {
    addDefinitionToNodeData(factorInput.value, codeInput.value, definitionInput.value);
    renderTables();
    clearInputs();
})

function clearInputs() {
    factor.value = '';
    code.value = '';
    definition.value = '';
}

function deleteDefinition(code){
    let index = nodeData.findIndex(node => node.code === code);
    nodeData.splice(index, 1);
}

function editDefinition(code){
    let node = nodeData.filter(node => node.code === code).pop();
    factorInput.value = node.factor;
    codeInput.value = node.code;
    definitionInput.value = node.definition;
    currentEditingCode = code;
}

function updateDefinition(code){
    let node = nodeData.filter(node => node.code === code).pop();
    node.factor = factorInput.value;
    node.code = codeInput.value;
    node.definition = definitionInput.value;
    renderTables();
}

let currentEditingCode = '';
    updateBtn.addEventListener('click', () => {
    updateDefinition(currentEditingCode);
    currentEditingCode = '';
    clearInputs();

});

///////// Create influence matrix

const influenceMatrixTable = document.querySelector('#influence-matrix-table tbody');

function renderInfluenceMatrixTable(linkData){

    let adjMatrix = getAdjMatrix(linkData, nodeData);

    // Put names at first row
    influenceMatrixTable.innerHTML = '';
    let firstRow = influenceMatrixTable.insertRow();
    firstRow.innerHTML = '<th></th>';
    for(let node of nodeData){
        let th = document.createElement('th');
        th.textContent = node.code;
        firstRow.appendChild(th)
    }

 
    for(let i = 0; i < nodeData.length; i++){
        let row = influenceMatrixTable.insertRow();
        // put names at first column
        row.innerHTML = `<th>${nodeData[i].code}</th>`;
        for(let j = 0; j < nodeData.length; j++){
            let cell = row.insertCell();
            // create input and fill with adjacency matrix value
            let input = document.createElement('input');
            input.setAttribute('type', 'number')
            input.setAttribute('class', 'matrix-cell');
            input.setAttribute('value', adjMatrix[i][j]);
            input.dataset.source = nodeData[i].code;
            input.dataset.target = nodeData[j].code; 
            input.addEventListener('change', (event) => {
                let inputElement = event.target;
                let link = linkData.find(link => 
                    link.source === inputElement.dataset.source && link.target === inputElement.dataset.target
                )
                if (link){
                    if (inputElement.value === '0'){
                        linkData.splice(linkData.findIndex(l => l === link), 1)
                        console.log('existe el link, se borra')
                    } else {
                        link.weight = inputElement.value;
                        console.log('existe el link, se modifica');
                    }
                } else {
                    let newLink = {
                        source: inputElement.dataset.source,
                        target: inputElement.dataset.target,
                        weight: inputElement.value
                    }
                    linkData.push(newLink);
                    console.log('nuevo link')
                }
                console.log(linkData);
            })
            cell.appendChild(input);
        }
        
    }
}


function getZeroFilledMatrix(rows, cols){
    let matrix = [];
    for(let i = 0; i < rows; i++){
        matrix[i] = new Array(cols).fill(0);
    }
    return matrix;
}

function getIndexInNodeData(code, nodeData){
    return nodeData.map(node => node.code).indexOf(code);
}


let testNodeData = [{code: "A"}, {code: "B"}, {code: "C"}]
let testLinkData = [{source: "A", target: "B", weight: 1}, {source: "C", target: "A", weight: 1}]


function getAdjMatrix(linkData, nodeData){

    let adjMatrix = getZeroFilledMatrix(nodeData.length, nodeData.length);

    for(let link of linkData){
        let sourceIndex = getIndexInNodeData(link.source, nodeData);
        let targetIndex = getIndexInNodeData(link.target, nodeData);
        adjMatrix[sourceIndex][targetIndex] = link.weight;
    }
    return adjMatrix;
}

function renderTables(){
    renderDefinitionTable(nodeData);
    renderInfluenceMatrixTable(linkData);
}

renderTables();