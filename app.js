const definitionTable = document.querySelector('#definition-table');

let nodeData = await fetch("./test_node_data.json").then(res => res.json())

function renderTable(nodeData) {
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
        renderTable(nodeData);
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
    renderTable(nodeData);
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
    renderTable(nodeData);
}

let currentEditingCode = '';
updateBtn.addEventListener('click', () => {
    updateDefinition(currentEditingCode);
    currentEditingCode = '';
    clearInputs();

});



renderTable(nodeData);



