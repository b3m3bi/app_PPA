const forcesNames = [
    'am esp',
    'offre serv',
    'offre agric',
    'of alim priv',
    'of alim coll',
    'mob',
    'dem prod alim',
    'dem vol',
    'CSP',
    'age',
    'santé',
    'budget',
    'déchets',
    'tps repas',
    'état env',
    'transf et stock',
    'NRJ',
    'gouv',
    'strat',
    'interac',
    'act coll',
    'pol al'
]

const influenceMatrix = [
    [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
    [1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 0, 1, 0, 1, 1, 0]
]

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

    let C = [];
    for(let i = 0; i < rows; i++){
        C[i] = new Array(cols).fill(0);
    }

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


let test = [
    [1, 2, 3],
    [4, 5, 6]
];

let test2 = [
    [1, 2],
    [3, 4],
    [5, 6]
]


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

console.log(forces);


function getDirectPower(influenceMatrix, weighted = false) {
    const directInfluence = sumMatrixRows(influenceMatrix);
    const directDependance = sumMatrixColumns(influenceMatrix);

    let directPower = [];
    let influenceSum = directInfluence.reduce((sum, val) => sum += val, 0);

    for (let i = 0; i < directInfluence.length; i++){
        let influence = directInfluence[i];
        let dependance = directDependance[i];

        let power = (influence / influenceSum) * (influence / (influence + dependance))
        directPower.push(power);
    }

    if (weighted){
        let powerSum = directPower.reduce((sum, val) => sum += val, 0);
        return directPower.map((val) => val / (powerSum / directPower.length));
    } else {
        return directPower;
    }
}

let directPower = getDirectPower(influenceMatrix, true);
// console.log(directPower.reduce((sum, val) => sum += val, 0))




//////////////////////////////////////////////////////////////////////////////

let container = document.querySelector('.plot-01');

const width = 640;
const height = 400;
const marginTop = 20;
const marginRight = 20;
const marginBottom = 30;
const marginLeft = 40;

const x = d3.scaleLinear().domain(d3.extent(forces, d => d.x)).nice().range([marginLeft, width - marginRight]);

const y = d3.scaleLinear().domain(d3.extent(forces, d => d.y)).nice().range([height - marginBottom, marginTop]);

const svg = d3.create('svg').attr('viewBox', [0, 0, width, height])
    .attr('style', 'max-width: 100%; height: auto; font: 10px sans-serif;');

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