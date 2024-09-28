const CONF_PATH = "./configuration.json";

// Model
const TILE_TYPES = new Map();

class Tile {
    constructor(value) {
        this.type = "number";

        this.value = value;
    }

}

const TILE_POOL = [];

TILE_POOL.draw = () => {
    return TILE_POOL.splice(Math.floor(Math.random() * TILE_POOL.length), 1);
}

TILE_POOL.discard = tile => {
    if (tile instanceof Tile) {
        TILE_POOL.push(tile);
    } else {
        throw new Error("Cannot discard " + tile + " into TILE_POOL");
    }
}

class Board {
    document = document.getElementById("board");
    grid = [];

    constructor(rows, columns) {
        if (columns === undefined) {
            columns = rows;
        }

        for (let row = 0; row < rows; row++) {
            this.grid[row] = [];

            for (let column = 0; column < columns; column++) {
                this.grid[row][column] = null;
            }
        }
    }

    dust(row, column, tile) {
        if (row >= this.grid.length || column >= this.grid[row].length) {
            throw new Error("Index out of bounds exception.");
        }

        if (this.grid[row][column] === null && tile instanceof Tile) {
            this.grid[row][column] = tile;
        } else {
            return this.grid[row][column];
        }
    }

    getElement(row, column) {
        const result = document.createElement("p");
        const tile = this.dust(row, column);

        if (tile instanceof Tile) {
            result.innerHTML = tile.value;
            result.className = `tile ${tile.type}`;

            if (tile.inPlay === true) {

            }

            result.setAttribute("style", `
                grid-row: ${row + 1} / ${row + 2};
                grid-column: ${column + 1} / ${column+2};
                `);

            return result;
        } else {
            return null;
        }
    }

    updateDoc() {
        this.document.innerHTML = "";

        for (let row = 0; row < this.grid.length; row++) {
            for (let column = 0; column < this.grid[row].length; column++) {
                let tile = this.getElement(row, column);

                if (tile === null) {
                    continue;
                } else {
                    this.document.appendChild(tile);
                }
            }
        }
    }

}

class Rack extends Board {
    document = document.getElementById("rack");

    constructor(size) {
        super(1, size);
    }

    draw() {
        return TILE_BAG.splice(Math.random() * TILE_BAG.length, 1);
    }

    exchange(tiles) {

    }

}

// e Model

// setup

async function initialize() {
    try {
        const response = await fetch(CONF_PATH);

        if (!response.ok) {
            throw new Error("Configuration fetch failed.");
        }

        const CONF = await response.json();


        Object.entries(CONF.setup.tilePool)
        // shit code fix later duh
            .forEach(type => {
                TILE_TYPES.set(type[0], type[1].map(element => element.value));

                type[1].forEach(element => {
                    while (element.frequency > 0) {
                        TILE_POOL.discard(new Tile(element.value));
                        element.frequency--;
                    }
                });
            });

    } catch (error) {
        console.error(error);
    }

}

// e setup

// main thread
(async () => {
    await initialize();

    const board = new Board(15);

    for (let row = 0; row < 15; row++) {
        for (let column = 0; column < 15; column++) {
            board.dust(row, column, TILE_POOL.draw()[0]);
        }
    }
    board.updateDoc();

    console.log("exit success");

}) ();

export class Debug {
    

}
