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


function renderInfluenceMatrixTable(nodeData){
    // Put names at first row
    influenceMatrixTable.innerHTML = '';
    let firstRow = influenceMatrixTable.insertRow();
    firstRow.innerHTML = '<th></th>';
    for(let node of nodeData){
        let th = document.createElement('th');
        th.textContent = node.code;
        firstRow.appendChild(th)
    }

    // Put names at first colum
    for(let node of nodeData){
        let row = influenceMatrixTable.insertRow();
        row.innerHTML = `<th>${node.code}</th>`;
        for(let i = 0; i < nodeData.length; i++){
            let cell = row.insertCell();
            cell.innerHTML = '<input type="number" class="matrix-cell" step="1" value="0">';
            
        }
    }
}


function renderTables(){
    renderDefinitionTable(nodeData);
    renderInfluenceMatrixTable(nodeData);
}

renderTables();