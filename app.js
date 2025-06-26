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
        deleteLinksUsingCode(code);
        renderTables();
        plotDirectInfluence();
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

function deleteLinksUsingCode(code){
    let linksUsingCode = linkData.filter(link => link.source === code || link.target === code);
    linksUsingCode.forEach(link => linkData.splice(linkData.findIndex(l => l === link), 1));
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
                plotDirectInfluence();
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

function getDirectInfluenceWeighted(influenceMatrix){
    const directInfluence = sumMatrixRows(influenceMatrix);
    let directInfluenceSum = directInfluence.reduce((sum, val) => sum += val, 0);
    let numberOfNonZeroDirectInfluenceForces = directInfluence.filter(val => val > 0).length;
    return directInfluence.map(val => val / (directInfluenceSum / numberOfNonZeroDirectInfluenceForces));
}

function getDirectDependanceWeighted(influenceMatrix){
    const directDependance = sumMatrixColumns(influenceMatrix);
    let directDependanceSum = directDependance.reduce((sum, val) => sum += val, 0);
    let numberOfNonZeroDirectDependanceForces = directDependance.filter(val => val > 0).length;
    return directDependance.map(val => val / (directDependanceSum / numberOfNonZeroDirectDependanceForces));
}

function plotDirectInfluence() {
    // calculate forces

    const influenceMatrix = getAdjMatrix(linkData, nodeData);

    let forcesNames = nodeData.map(node => node.code);

    let forces = [];
    let directInfluenceWeighted = getDirectInfluenceWeighted(influenceMatrix);
    let directDependanceWeighted = getDirectDependanceWeighted(influenceMatrix);

    for (let i = 0; i < influenceMatrix.length; i++){
        let force = new Object();
        force.x = directDependanceWeighted[i];
        force.y = directInfluenceWeighted[i];
        force.name = forcesNames[i];
        forces.push(force)
    }

    // plot
    let container = document.querySelector('.plot-direct-influence');
    container.innerHTML = '';

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

    container.append(svg.node());

}

plotDirectInfluence();