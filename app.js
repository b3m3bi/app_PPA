let nodeData = await fetch('./data/test_node_data.json').then(res => res.json());
let linkData = await fetch('./data/test_link_data.json').then(res => res.json());

////// Create definition table

const definitionTable = document.querySelector('#definition-table tbody');

function renderDefinitionTable(nodeData) {
    // Reset table
    definitionTable.innerHTML = '';
    // Add data
    for (let i = 0; i < nodeData.length; i++){
        let node = nodeData[i];
        addDefinitionToTable(definitionTable, node.factor, node.code, node.definition, i);
    }
}

function addDefinitionToTable(definitionTable, factor, code, definition, index) {
    let row = definitionTable.insertRow();
    row.innerHTML = `<td>${index + 1}</td> <td>${factor}</td> <td>${code}</td> <td>${definition}</td>`;

    let actionCell = row.insertCell();
    let btnsContainer = document.createElement('div');
    btnsContainer.classList.add('center-cell');
    
    let deleteBtn = document.createElement('button');
    deleteBtn.addEventListener('click', () => {
        deleteDefinition(code);
        deleteLinksUsingCode(code);
        renderTables();
        renderPlots();
    });

    const svgDeleteIcon = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6"><path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>';
    deleteBtn.innerHTML = svgDeleteIcon;
    deleteBtn.classList.add("action-btn");
    btnsContainer.append(deleteBtn);
    
    let editBtn = document.createElement('button');
    editBtn.addEventListener('click', () => {
        editDefinition(code);
        showModal('edit');
    });
    
    const svgEditIcon = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6"><path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>'
    editBtn.innerHTML = svgEditIcon;
    editBtn.classList.add("action-btn");
    btnsContainer.append(editBtn);

    actionCell.append(btnsContainer);
}

const factorInput = document.querySelector('#factor');
const codeInput = document.querySelector('#code');
const definitionInput = document.querySelector('#definition');

const addBtn = document.querySelector('#add-definition-btn');
const updateBtn = document.querySelector('#update-definition-btn');

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
    closeModal()
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

function deleteLinksUsingCode(code){
    let linksUsingCode = linkData.filter(link => link.source === code || link.target === code);
    linksUsingCode.forEach(link => linkData.splice(linkData.findIndex(l => l === link), 1));
}

function updateLinksUsingCode(oldCode, newCode){
    for (let link of linkData) {
        if (link.source === oldCode){
            link.source = newCode;
        }
        if (link.target === oldCode){
            link.target = newCode;
        }
    }
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
    updateLinksUsingCode(currentEditingCode, codeInput.value);
    renderTables();
}

let currentEditingCode = '';
updateBtn.addEventListener('click', () => {
    updateDefinition(currentEditingCode);
    currentEditingCode = '';
    clearInputs();
    closeModal();
});

///////// Create influence matrix

const influenceMatrixTable = document.querySelector('#influence-matrix-table tbody');

function renderInfluenceMatrixTable(linkData){

    let adjMatrix = getAdjMatrix(linkData, nodeData);

    // Put names at first row
    influenceMatrixTable.innerHTML = '';
    let firstRow = influenceMatrixTable.insertRow();
    // vacio el primer elemento
    firstRow.innerHTML = '<th></th>';
    for(let node of nodeData){
        let th = document.createElement('th');
        th.innerHTML = `<div><span>${node.code}</span></div>`;
        th.classList.add('matrix-column-name');
        firstRow.appendChild(th)
    }

 
    for(let i = 0; i < nodeData.length; i++){
        let row = influenceMatrixTable.insertRow();
        // put names at first column
        row.innerHTML = `<th><div><span>${nodeData[i].code}</span></div></th>`;
        row.classList.add('matrix-row-name');
        for(let j = 0; j < nodeData.length; j++){
            let cell = row.insertCell();
            // create input and fill with adjacency matrix value
            let input = document.createElement('input');
            input.setAttribute('type', 'number')
            input.setAttribute('class', 'matrix-cell');
            input.setAttribute('value', adjMatrix[i][j]);
            input.setAttribute('min', '0');
            input.setAttribute('max', '100');
            input.dataset.source = nodeData[i].code;
            input.dataset.target = nodeData[j].code; 
            input.addEventListener('change', (event) => {
                let inputElement = event.target;
                let link = linkData.find(link => 
                    link.source === inputElement.dataset.source && link.target === inputElement.dataset.target
                )
                if (link){
                    if (inputElement.value === '0'){
                        // if no weight remove link
                        linkData.splice(linkData.findIndex(l => l === link), 1)
                    } else {
                        link.weight = parseInt(inputElement.value);
                    }
                } else {
                    let newLink = {
                        source: inputElement.dataset.source,
                        target: inputElement.dataset.target,
                        weight: parseInt(inputElement.value)
                    }
                    linkData.push(newLink);
                }
                input.setAttribute('value',inputElement.value);
                renderPlots();
            })
            if (i === j) {
                input.setAttribute('disabled', 'disabled')
            }
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

///// Plots
function sumMatrixRows(mat){
    let rowSums = [];
    for(let row of mat){
        rowSums.push(row.reduce((sum, val) => sum += val, 0));
    }
    return rowSums;
}

function sumMatrixColumns(mat){
    let colSums = Array(mat.length)
    colSums.fill(0, 0, mat.length);
    for(let row of mat){
        for(let i = 0; i < row.length; i++){
            colSums[i] += row[i];
        }
    }
    return colSums;
}

function matrixMultiplication(A, B){
    let rowsA = A.length;
    let colsA = A[0].length;
    let rowsB = B.length;
    let colsB = B[0].length;

    if (colsA !== rowsB){
        console.error("Matrices need to be of size n x m and m x p.");
        return;
    }

    let rows = rowsA;
    let cols = colsB;

    let C = getZeroFilledMatrix(rows, cols);

    for(let i = 0; i < rows; i++){
        for (let j = 0; j < cols; j++){
            let sum = 0;
            for (let k = 0; k < colsA; k++){
                sum += A[i][k] * B[k][j];
            }
            C[i][j] = sum;
        }
    }
    return C;
}

function matrixSum(A, B){
    let rows = A.length;
    let cols = A[0].length;
    let C = getZeroFilledMatrix(rows, cols);
    for(let i = 0; i < rows; i++){
        for(let j = 0; j < cols; j++){
            C[i][j] = A[i][j] + B[i][j];
        }
    }
    return C;
}

function getInfluenceWeighted(influenceMatrix){
    const influence = sumMatrixRows(influenceMatrix);
    let influenceSum = influence.reduce((sum, val) => sum += val, 0);
    let numberOfNonZeroInfluenceForces = influence.filter(val => val > 0).length;
    return influence.map(val => val / (influenceSum / numberOfNonZeroInfluenceForces));
}

function getDependanceWeighted(influenceMatrix){
    const dependance = sumMatrixColumns(influenceMatrix);
    let dependanceSum = dependance.reduce((sum, val) => sum += val, 0);
    let numberOfNonZeroDependanceForces = dependance.filter(val => val > 0).length;
    return dependance.map(val => val / (dependanceSum / numberOfNonZeroDependanceForces));
}

function plotInfluence(typeOfForces, containerId) {
    // calculate forces

    const influenceMatrix = getAdjMatrix(linkData, nodeData);

    let forcesNames = nodeData.map(node => node.code);

    let forces = [];

    let influence;
    let dependance;
    let sqrInfluenceMatrix;

    switch (typeOfForces) {
        case 'direct':
            influence = getInfluenceWeighted(influenceMatrix);
            dependance = getDependanceWeighted(influenceMatrix);
            break;
        case 'indirect':
            sqrInfluenceMatrix = matrixMultiplication(influenceMatrix, influenceMatrix);
            influence = getInfluenceWeighted(sqrInfluenceMatrix);
            dependance = getDependanceWeighted(sqrInfluenceMatrix);
            break;
        case 'total':
            sqrInfluenceMatrix = matrixMultiplication(influenceMatrix, influenceMatrix);
            let totalInfluenceMatrix = matrixSum(influenceMatrix, sqrInfluenceMatrix);
            influence = getInfluenceWeighted(totalInfluenceMatrix);
            dependance = getDependanceWeighted(totalInfluenceMatrix);
            break;
    }

    for (let i = 0; i < influenceMatrix.length; i++){
        let force = new Object();
        force.x = dependance[i];
        force.y = influence[i];
        force.name = forcesNames[i];
        forces.push(force)
    }
 
    let plotContainer = document.querySelector(containerId);

    plotForces(forces, plotContainer)

}

function plotForces(forces, plotContainer) {
    // plot
    plotContainer.innerHTML = '';

    const width = 640;
    const height = 400;
    const marginTop = 20;
    const marginRight = 20;
    const marginBottom = 30;
    const marginLeft = 40;

    const x = d3.scaleLinear().domain(d3.extent(forces, d => d.x)).nice().range([marginLeft, width - marginRight]);

    const y = d3.scaleLinear().domain(d3.extent(forces, d => d.y)).nice().range([height - marginBottom, marginTop]);

    const svg = d3.create('svg').attr('viewBox', [0, 0, width, height])
        .attr('style', 'max-width: 1000px; height: auto; font: 10px sans-serif;');

    svg.append('g').attr('transform', `translate(0,${height - marginBottom})`)
        .call(d3.axisBottom(x))
        .call(g => g.append('text')
            .attr('x', width)
            .attr('y', marginBottom - 4)
            .attr('fill', 'currentColor')
            .attr('text-anchor', 'end')
            .text('Dependance →')
        );

    svg.append('g').attr('transform', `translate(${marginLeft}, 0)`)
        .call(d3.axisLeft(y))
        .call(g => g.append('text')
            .attr('x', -marginLeft)
            .attr('y', 10)
            .attr('fill', 'currentColor')
            .attr('text-anchor', 'start')
            .text('↑ Influence')
        );

    svg.append('g')
        .attr('stroke', 'steelblue')
        .attr('stroke-width', 1.5)
        .attr('fill', 'none')
        .selectAll('circle')
        .data(forces)
        .join('circle')
        .attr('cx', d => x(d.x))
        .attr('cy', d => y(d.y))
        .attr('r', 2);

    svg.append('g')
        .attr('font-family', 'sans-serif')
        .attr('font-size', 10)
        .selectAll('text')
        .data(forces)
        .join('text')
        .attr('dy', '0.35em')
        .attr('x', d => x(d.x) + 7)
        .attr('y', d => y(d.y))
        .text(d => d.name);

    plotContainer.append(svg.node());

}

function renderPlots() {
    plotInfluence('direct', '.plot-direct-influence');
    plotInfluence('indirect', '.plot-indirect-influence');
    plotInfluence('total', '.plot-total-influence');

}

renderTables();
renderPlots();

const definitionFormModal = document.querySelector('#definition-form-modal');
const newDefinitionBtn = document.querySelector('#new-definition-btn');
const closeBnt = document.querySelector(".close-btn");

function showModal(mode) {
    definitionFormModal.style.display = 'block';
    if (mode === 'add'){
        addBtn.style.display = 'block';
    }
    if (mode === 'edit'){
        updateBtn.style.display = 'block';
    }

}

function closeModal() {
    definitionFormModal.style.display = 'none';
    addBtn.style.display = 'none';
    updateBtn.style.display = 'none';
}

newDefinitionBtn.addEventListener('click', () => {
    factorInput.value = '';
    codeInput.value = '';
    definitionInput.value = '';
    showModal('add');
})

window.addEventListener('click', event => {
    if (event.target == closeBnt) {
        definitionFormModal.style.display = 'none';
    }
});

closeBnt.addEventListener('click', () => {
    definitionFormModal.style.display = 'none';
})

