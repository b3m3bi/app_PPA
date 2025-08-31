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
const addTitle = document.querySelector('#add-definition-title');
const updateTitle = document.querySelector('#update-definition-title');

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
        row.innerHTML = `<th class="matrix-row-name"><div><span>${nodeData[i].code}</span></div></th>`;
        for(let j = 0; j < nodeData.length; j++){
            let cell = row.insertCell();
            cell.classList.add('matrix-cell');

            let svgArrowDown = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" /></svg>';
            let svgXMark = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>';

            let infoHover = document.createElement('div');
            infoHover.classList.add("info-hover");
            infoHover.innerHTML = `
            <div class="container">
                <div class="source-container">
                    <div class="label">
                        <span>Influencia de</span>
                    </div>
                    <div class="factor-name">
                        <span>${nodeData[i].factor}</span>
                    </div>
                </div>
                <div class="icon-container-arrow-down"><span class="arrow-down">${svgArrowDown}</span></div>
                <div class="icon-container-x-mark"><span class="x-mark">${svgXMark}</span></div>
                <div class="target-container">
                    <div class="label">
                        <span>sobre<span>
                    </div>
                    <div class="factor-name">
                        <span>${nodeData[j].factor}</span>
                    </div>
                </div>
            </div>`

            cell.append(infoHover);

            // create input and fill with adjacency matrix value
            let button = document.createElement('button');
            button.setAttribute('class', 'matrix-cell-btn');

            button.dataset.source = nodeData[i].code;
            button.dataset.target = nodeData[j].code; 

            let link = linkData.find(link => 
                link.source === button.dataset.source && link.target === button.dataset.target
            )

            if (link) {
                button.textContent = link.weight;
                button.classList.add('one-cell');
                infoHover.classList.add('one-cell-info');
            } else {
                button.textContent = 0;
                button.classList.add('zero-cell');
                infoHover.classList.add('zero-cell-info');
            }

            button.addEventListener('click', (event) => {
                let buttonElement = event.target;
                let selectedLink = linkData.find(link => 
                    link.source === buttonElement.dataset.source && link.target === buttonElement.dataset.target
                )
                //  if link exist delete it
                if (selectedLink) {
                    linkData.splice(linkData.findIndex(l => l === link), 1)
                    buttonElement.textContent = 0;
                    buttonElement.classList.remove('one-cell');
                    buttonElement.classList.add('zero-cell');
                    infoHover.classList.remove('one-cell-info');
                    infoHover.classList.add('zero-cell-info');
                } else {
                    // if link does not exist create it
                    let newLink = {
                        source: buttonElement.dataset.source,
                        target: buttonElement.dataset.target,
                        weight: 1
                    }
                    linkData.push(newLink);
                    buttonElement.textContent = 1;
                    buttonElement.classList.remove('zero-cell');
                    buttonElement.classList.add('one-cell');
                    infoHover.classList.remove('zero-cell-info');
                    infoHover.classList.add('one-cell-info');
                }
                renderPlots();
            })
            if (i === j) {
                button.setAttribute('disabled', 'disabled');
                infoHover.classList.add('disabled-cell-info');
            }
            cell.appendChild(button);
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

    let forcesCodes = nodeData.map(node => node.code);

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
        force.code = forcesCodes[i];
        forces.push(force)
    }
 
    let plotContainer = document.querySelector(containerId);

    plotForces(forces, plotContainer, typeOfForces)

}

const colHighlightMain = window.getComputedStyle(document.body).getPropertyValue('--col-highlight-main');
const colHighlightSecond = window.getComputedStyle(document.body).getPropertyValue('--col-highlight-second');
const colHighlightThird = window.getComputedStyle(document.body).getPropertyValue('--col-highlight-third');

function getFactorNameFromCode(code, nodeData) {
    return nodeData.find(node => node.code === code).factor;
}

function plotForces(forces, plotContainer, plotUID) {
    // plot
    plotContainer.innerHTML = '';

    const width = 600;
    const height = 400;
    const marginTop = 20;
    const marginRight = 60;
    const marginBottom = 60;
    const marginLeft = 60;

    const x = d3.scaleLinear().domain(d3.extent(forces, d => d.x)).nice().range([marginLeft, width - marginRight]);
    const y = d3.scaleLinear().domain(d3.extent(forces, d => d.y)).nice().range([height - marginBottom, marginTop]);

    const svg = d3.create('svg')
        .attr('viewBox', [0, 0, width, height])
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .style('width', '100%')
        .style('height', 'auto');

    svg.append('g')
        .attr('transform', `translate(0,${height - marginBottom})`)
        .call(d3.axisBottom(x))
        .call(g => g.append('text')
            .attr('x', width / 2)
            .attr('y', 40 )
            .attr('fill', 'currentColor')
            .attr('text-anchor', 'middle')
            .text('Dependencia')
        );

    svg.append('g')
        .attr('transform', `translate(${marginLeft}, 0)`)
        .call(d3.axisLeft(y))
        .call(g => g.append('text')
            .attr('x', - (height / 2))
            .attr('y', - 40)
            .attr('transform', 'rotate(-90)')
            .attr('fill', 'currentColor')
            .attr('text-anchor', 'middle')
            .text('Influencia')
        );

    let verticalLineX = 1;
    let horizontalLineY = 1;

    function createDragLine(x1, x2, y1, y2, classId){
        return svg.append('line')
        .attr('x1', x1)
        .attr('x2', x2)
        .attr('y1',y1)
        .attr('y2', y2)
        .style('stroke-width', 1)
        .style('stroke', 'black')
        .style('stroke-dasharray', "2,2")
        .style('opacity', 0.4)
        .style('fill', 'none')
        .attr('class', `${classId}-drag-line`)
        .on('mouseover', function(e,d) {
            d3.select(this)
                .style('opacity', 0.8)
                .style('stroke-width', 4)
        }).on('mouseout', function(e,d) {
            d3.select(this)
                .style('opacity', 0.4)
                .style('stroke-width', 1)
        })
    }

    let verticalLine = createDragLine(x(verticalLineX), x(verticalLineX), marginTop, height - marginBottom, 'vertical')
    let horizontalLine = createDragLine(marginLeft, width - marginRight, y(horizontalLineY), y(horizontalLineY), 'horizontal')

    function createRectangle(x, y, width, height, fill, id){
        return svg.append('rect')
        .attr('x', x)
        .attr('y', y)
        .attr('width', width)
        .attr('height', height)
        .attr('fill', fill)
        .attr('opacity', 0.2)
        .attr('id', `${id}-${plotUID}`)
        .classed(`rect ${id} ${plotUID}`, true)
        .lower()
    }

    const regionColors = ['#F04923', '#FFBF00', '#00A86B', '#0067A5']

    const topLeftRect = createRectangle(
        marginLeft, marginTop, 
        x(verticalLineX) - marginLeft, y(horizontalLineY) - marginTop, 
        regionColors[0], 'topLeftRect')

    const botLeftRect = createRectangle(
        marginLeft, y(horizontalLineY), 
        x(verticalLineX) - marginLeft,  height - marginBottom - y(horizontalLineY), 
        regionColors[1], 'botLeftRect')
    
    const topRightRect = createRectangle(
        x(verticalLineX), marginTop,
        width - x(verticalLineX) - marginLeft, y(horizontalLineY) - marginTop,
        regionColors[2], 'topRightRect')

    const botRightRect = createRectangle(
        x(verticalLineX), y(horizontalLineY), 
        width - x(verticalLineX) - marginLeft, height - marginBottom - y(horizontalLineY),
        regionColors[3], 'botRightRect')

    function inRegion(d, idRect){
        if (idRect === 'topLeftRect') return d.x <= verticalLineX && d.y >= horizontalLineY;
        if (idRect === 'botLeftRect') return d.x <= verticalLineX && d.y < horizontalLineY;
        if (idRect === 'topRightRect') return d.x > verticalLineX && d.y >= horizontalLineY;
        if (idRect === 'botRightRect') return d.x > verticalLineX && d.y < horizontalLineY;
    }

    function createClipPathRect(idRect) {
        svg.append('clipPath')
            .attr('id', `clip-${idRect}-${plotUID}`)
            .append('use')
            .attr('href',  `#${idRect}-${plotUID}`);
    }
    
    function createRegionText(x, y, idRect, fill, text, textAnchor, dominantBaseline){
        createClipPathRect(idRect);
        svg.append('text')
            .attr('x', x)
            .attr('y', y)
            .attr('clip-path', `url(#clip-${idRect}-${plotUID})`)
            .classed(`plot-rect-titles ${idRect} ${plotUID}`, true)
            .attr('text-anchor', textAnchor)
            .attr('dominant-baseline', dominantBaseline)
            .style('opacity', 0.7)
            .style('fill', fill)
            .text(text)
            .on('mouseover', function(e, d) {
                d3.selectAll('.rect')
                    .style('opacity', 0.05)
                d3.selectAll('.plot-rect-titles')
                    .style('opacity', 0.05)
                d3.selectAll(`.${idRect}`)
                    .style('opacity', 0.3)
                d3.select(this)
                    .style('opacity', 1)
                d3.selectAll('.point')
                    .style('opacity', d => inRegion(d, idRect) ? 1 : 0.1)
            })
            .on('mouseout', function(e, d) {
                d3.select(this)
                    .style('opacity', 0.7)
                d3.selectAll('.plot-rect-titles')
                    .style('opacity', 0.7)
                d3.selectAll('.point')
                    .style('opacity', 1)
                d3.selectAll('.rect')
                    .style('opacity', 0.2)
            })
    }

    createRegionText(marginLeft + 5, marginTop + 5, 'topLeftRect', regionColors[0], 'Impulsoras', 'start', 'hanging');
    createRegionText(marginLeft + 5, height - marginBottom - 5, 'botLeftRect', regionColors[1], 'Autónomas', 'start', 'auto');
    createRegionText(width - marginLeft - 5, marginTop + 5, 'topRightRect', regionColors[2], 'Palancas', 'end', 'hanging');
    createRegionText(width - marginLeft - 5, height - marginBottom - 5, 'botRightRect', regionColors[3], 'Efectos', 'end', 'auto');

    verticalLine.call(d3.drag()
        .on("drag", function(event){
            verticalLineX = Math.max(x.domain()[0], Math.min(x.domain()[1], x.invert(event.x)));
            d3.select(this)
                .attr('x1', x(verticalLineX))
                .attr('x2', x(verticalLineX))
            topLeftRect.attr('width', x(verticalLineX) - marginLeft)
            botLeftRect.attr('width', x(verticalLineX) - marginLeft)
            topRightRect
                .attr('x', x(verticalLineX))
                .attr('width', width  - x(verticalLineX) - marginLeft)
            botRightRect
                .attr('x', x(verticalLineX))
                .attr('width',width - x(verticalLineX) - marginLeft)
           
        }));

    horizontalLine.call(d3.drag()
        .on("drag", function(event){
            horizontalLineY = Math.max(y.domain()[0], Math.min(y.domain()[1], y.invert(event.y)));
            d3.select(this)
                .attr('y1', y(horizontalLineY))
                .attr('y2', y(horizontalLineY))
            topLeftRect.attr('height', y(horizontalLineY) - marginTop )
            botLeftRect
                .attr('y', y(horizontalLineY))
                .attr('height', height - marginBottom - y(horizontalLineY))
            topRightRect
                .attr('height', y(horizontalLineY) - marginTop)
            botRightRect
                .attr('y', y(horizontalLineY))
                .attr('height',height - marginBottom - y(horizontalLineY)) 
        }));

    const point = svg.selectAll('.point')
        .data(forces)
        .enter()
        .append('g')
        .attr('class', d => d.code.replace(/\s+/g, "-"))
        .classed('point', true)
    
    point.append('circle')
        .attr('cx', d => x(d.x))
        .attr('cy', d => y(d.y))
        .attr('r', 2)
        .attr('stroke', colHighlightMain)
        .attr('stroke-width', 1.5)
        .attr('fill', colHighlightThird)
    
    point.append('text')
        .attr('dy', '0.35em')
        .attr('x', d => x(d.x) + 5)
        .attr('y', d => y(d.y))
        .attr('class', 'point-label')
        .text(d => d.code);

    const tooltip = d3.select('body')
        .append('div')
        .attr('class', 'point-tooltip')
        .style('opacity', 0);
        
    point.on('mouseover', function (e, d) {
        // position tooltips in fix site https://stackoverflow.com/a/60472429
        let pos = d3.select(this).node().getBoundingClientRect();
        d3.selectAll('.point')
            .attr('opacity', '0.2');
        d3.selectAll(`.${d.code.replace(/\s+/g, "-")}`)
            .attr('opacity', '1');

        tooltip
            .style('opacity', 1)
            .html(` <div class="factor-name"><span>${getFactorNameFromCode(d.code, nodeData)}</span></div>
                    <div class="influence">Influencia: <span>${d.y.toFixed(2)}</span></div>
                    <div class="dependance">Dependencia: <span>${d.x.toFixed(2)}</span></div>`)
            .style('left', pos.x + (pos.width / 2) + 'px')
            .style('top', window.pageYOffset + pos.y + pos.height +  'px');
    })
    .on('mouseout', function (e, d) {
        d3.selectAll('.point')
            .attr('opacity', 1)
        tooltip
            .style('opacity', 0)
    })

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
        updateBtn.style.display = 'none';
        addTitle.style.display = 'block';
        updateTitle.style.display = 'none';
    }
    if (mode === 'edit'){
        addBtn.style.display = 'none';
        updateBtn.style.display = 'block';
        addTitle.style.display = 'none';
        updateTitle.style.display = 'block';
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

