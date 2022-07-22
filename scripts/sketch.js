
var grid = [];
var blocksX = 20;
var blocksY = 20;

let blockSize;
let xOffset;
let yOffset;
let maxBlocks = 800;
let totalBees = 120;
let headerSize = 80
let speedMultiplier = 1;

let dx = [0, -1, 0, 1, -1, 1, -1, 1];
let dy = [1, 0, -1, 0, -1, 1, 1, -1];
let flag;
let dead = false;
let totalRevealed = 0;

let checked = []

function preload() {
    flag = loadImage("flag.png");
}

function setup() {

    window.canvas = createCanvas(windowWidth, windowHeight);
    canvas.position(0, 0);
    canvas.elt.addEventListener("contextmenu", (e) => e.preventDefault())

    setBlocks();

    blockSize = min(width / blocksX, height / blocksY);

    blockSize = min(canvas.width / blocksX, (canvas.height - headerSize) / blocksY);

    console.log(blockSize)

    xOffset = (width - blockSize * blocksX) / 2;
    yOffset = (height - blockSize * blocksY) / 2 + headerSize / 8;

    let count = 0;
    for (let j = 0; j < blocksY; j++) {
        for (let i = 0; i < blocksX; i++) {
            grid.push(new Cell(i, j, count++));
        }
    }

    // pick totalBees Spots
    for (let n = 0; n < totalBees; n++) {
        let i = floor(random(grid.length));
        while (grid[i].bee) {
            i = floor(random(grid.length));;
        }
        grid[i].bee = true
    }

    for (let j = 0; j < grid.length; j++) {
        grid[j].countBees();
    }

    background(0);

    fill(200);
    textSize(headerSize / 3);
    textAlign(CENTER, CENTER);
    text("AI Minesweeper", 0, 0, canvas.width, yOffset);

    frameRate(30);
}

function setBlocks() {
    let testBlockSize = 1;
    while (true) {
        if (floor(canvas.width / testBlockSize) * floor((canvas.height - headerSize) / testBlockSize) < maxBlocks) {

            blockSize = testBlockSize;
            blocksX = floor(canvas.width / blockSize) - floor(canvas.width / blockSize) % 2;
            blocksY = floor((canvas.height - headerSize) / blockSize) - floor((canvas.height - headerSize) / blockSize) % 2;
            return;
        } else {
            testBlockSize++;
        }
    }
}

function draw() {
    if (totalRevealed == (blocksX * blocksY)) {
        dead = true
    }
    if (dead) {
        noLoop();
    }

    for (let i = 0; i < speedMultiplier; i++) {
        update();
    }

    fill(255);
    for (var i = 0; i < grid.length; i++) {
        grid[i].show();
    }

}

function GameOver() {
    for (let i = 0; i < grid.length; i++) {
        if (!grid[i].revealed) {
            grid[i].reveal();
        }
    }
    dead = true;
}

function keyPressed() {
    switch (key) {
        case ' ':
            speedMultiplier = 10;
            break;
    }
}

function keyReleased() {
    switch (key) {
        case ' ':
            speedMultiplier = 1;
            break;
    }
}


function windowResized() {
    setup();
}

function move() {
    for (let i = 0; i < checked.length; i++) {
        let j = checked[i];

        // if already revealed fuck it
        if (j.revealed || j.flag) {
            checked.splice(i, 1);
            i--;
            continue;
        }

        // can this block be a bee?
        for (let k of j.padosi) {

            let known = 0;
            let flaged = 0;
            for (let nbr of k.padosi) {
                if (nbr.revealed || nbr.flag) known++;
                if (nbr.flag) flaged++;
            }

            if (known == k.padosi.length - 1 && flaged == k.neighbours - 1) {
                j.flag = true;
                console.log("flaged");
                checked.splice(i, 1);
                totalRevealed++;
                return;
            }
        }

        // is it possible to nuke this block
        for (nbr of j.padosi) {
            if (!nbr.revealed) continue;

            known = 0;
            for (let nbr2 of nbr.padosi) {
                if (nbr2.flag) known++;
            }
            if (known == nbr.neighbours) {
                j.reveal();
                checked.splice(i, 1);
                totalRevealed++;
                return;
            }
        }
    }

    if ("do some random shit") {

        let rand;
        if (checked.length) {
            rand = floor(random(0, checked.length));
            checked[rand].reveal();
            totalRevealed++;
            return;
        }

        rand = floor(random(0, grid.length));
        console.log(rand, grid[rand]);
        while (!dead && (grid[rand].revealed || grid[rand].flag)) {
            rand = floor(random(0, grid.length));
            console.log(rand);
        }
        grid[rand].reveal();
        totalRevealed++;
    }
}

function update() {
    move();
}