import { useEffect, useReducer, useRef } from "react";

export const IDS = {
    0: "EMPTY",
    1: "I",
    2: "O",
    3: "T",
    4: "S",
    5: "Z",
    6: "J",
    7: "L"
}
export const SHAPES = {
    EMPTY: [[0]],
    I: [
        [0, 0, 0, 0], 
        [1, 1, 1, 1], 
        [0, 0, 0, 0], 
        [0, 0, 0, 0]
    ],
    O: [
        [2, 2], 
        [2, 2]
    ],
    T: [
        [0, 3, 0], 
        [3, 3, 3],
        [0, 0, 0]
    ],
    S: [
        [0, 4, 4], 
        [4, 4, 0], 
        [0, 0, 0]
    ],
    Z: [
        [5, 5, 0], 
        [0, 5, 5], 
        [0, 0, 0]
    ],
    J: [
        [6, 0, 0], 
        [6, 6, 6], 
        [0, 0, 0]
    ],
    L: [
        [0, 0, 7], 
        [7, 7, 7], 
        [0, 0, 0]
    ]
};
export const COLORS = {
    I: "rgba(0,255,255,1)",
    O: "rgba(255,255,0,1)",
    T: "rgba(128,0,255,1)",
    S: "rgba(0,255,0,1)",
    Z: "rgba(255,0,0,1)",
    J: "rgba(0,0,255,1)",
    L: "rgba(255,128,0,1)"
}
export const POINTS = {
    SINGLE: 100,
    DOUBLE: 300,
    TRIPLE: 500,
    TETRIS: 800,
    SOFT_DROP: 1,
    HARD_DROP: 2
}

export function squareDraw(ctx, x, y, val, size) {
    if (val > 0) {
        let id = IDS[val];
        ctx.beginPath();
        ctx.fillStyle = COLORS[id];
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.rect(x * size, y * size, size, size);
        ctx.fill();
        ctx.stroke();
    }
    else {
        ctx.beginPath();
        ctx.strokeStyle = "rgba(128,128,128,0.5)";
        ctx.lineWidth = 2;
        ctx.rect(x * size, y * size, size, size);
        ctx.stroke();
    }
}

function init(i) {
    return {
        grid: Array.from({length: i.rows}, () => Array(i.cols).fill(0)),
        id: i.id,
        next: i.next,
        x: 3,
        y: 0,
        shape: SHAPES[i.id],
        score: 0,
        level: 0,
        lines: 0,
        paused: i.paused,
        over: false
    };
}

function isValid(state, nx, ny) {
    return state.shape.every((row, dy) => {
        return row.every((val, dx) => {
            let x = nx + dx;
            let y = ny + dy;
            return (
                val === 0 || (
                    (x >= 0 && x < state.grid[0].length) &&
                    (y <= state.grid.length) &&
                    (state.grid[y] && state.grid[y][x] === 0)
                )
            );
        });
    });
}

function place(state) {
    let n = JSON.parse(JSON.stringify(state.grid));
    state.shape.forEach((row, y) => {
        row.forEach((val, x) => {
            if (val > 0) {
                n[y + state.y][x + state.x] = val;
            }
        });
    });
    return {...state, grid: n};
}

function spawn(state, id) {
    return {
        ...state, 
        id: id, 
        next: IDS[Math.ceil(Math.random() * 7)],
        x: 3,
        y: 0,
        shape: SHAPES[id]
    };
}

function clearLines(state) {
    let grid = JSON.parse(JSON.stringify(state.grid));
    let lines = 0;
    grid.forEach((row, y) => {
        if (row.every(val => val > 0)) {
            lines++;
            grid.splice(y, 1);
            grid.unshift(Array(grid[0].length).fill(0));
        }
    });
    let score = state.score;
    if (lines == 0) {
        return state;
    }
    else if (lines == 1) {
        score += lines * POINTS.SINGLE;
    }
    else if (lines == 2) {
        score += lines * POINTS.DOUBLE;
    }
    else if (lines == 3) {
        score += lines * POINTS.TRIPLE;
    }
    else {
        score += lines * POINTS.TETRIS;
    }
    let level = Math.floor((state.lines + lines) / 10);
    return {
        ...state, 
        grid: grid, 
        score: score, 
        lines: state.lines + lines,
        level: level
    };
}

function drop(state) {
    if (isValid(state, state.x, state.y + 1)) {
        return {...state, y: state.y + 1};
    }
    else if (state.y === 0) {
        return {...state, over: true};
    }
    else {
        return clearLines(spawn(place(state), state.next));
    }
}

function hardDrop(state) {
    let i = state.y;
    while (isValid(state, state.x, i + 1)) {
        i++;
    }
    if (i === 0) {
        return {...state, over: true}
    }
    let temp = {...state, y: i, score: state.score + (i * POINTS.HARD_DROP)};
    return clearLines(spawn(place(temp), state.next));
}
    
function rotateL(state) {
    let s = JSON.parse(JSON.stringify(state.shape));
    
    s.forEach(row => row.reverse());
    let t = s[0].map((col, i) => s.map(row => row[i]));
    s = t;

    if (isValid({...state, shape: s}, state.x, state.y)) {
        return {...state, shape: s};
    }
    else {
        return state;
    }
}

function rotateR(state) {
    let s = JSON.parse(JSON.stringify(state.shape));
    
    let t = s[0].map((col, i) => s.map(row => row[i]));
    s = t;
    s.forEach(row => row.reverse());

    if (isValid({...state, shape: s}, state.x, state.y)) {
        return {...state, shape: s};
    }
    else {
        return state;
    }
}

function reducer(state, action) {
    if (!state.paused) {
        switch (action.type) {
            case "left":
                if (isValid(state, state.x - 1, state.y)) {
                    return {...state, x: state.x - 1};
                }
                return state;
            case "right":
                if (isValid(state, state.x + 1, state.y)) {
                    return {...state, x: state.x + 1};
                }
                return state;
            case "drop":
                return drop(state, action);
            case "softDrop":
                let soft = drop(state, action);
                return {...soft, score: soft.score + POINTS.SOFT_DROP};
            case "hardDrop":
                return hardDrop(state);
            case "rotateLeft":
                return rotateL(state);
            case "rotateRight":
                return rotateR(state);
            case "reset":
                return init({
                    rows: state.grid.length,
                    cols: state.grid[0].length,
                    id: IDS[Math.ceil(Math.random() * 7)],
                    next: IDS[Math.ceil(Math.random() * 7)],
                    paused: false
                });
            case "pause":
                return {...state, paused: true}
            default:
                return state;
        }
    }
    else {
        if (action.type === "pause" && !state.over) {
            return {...state, paused: false};
        }
        else if (action.type === "reset") {
            return init({
                rows: state.grid.length,
                cols: state.grid[0].length,
                id: IDS[Math.ceil(Math.random() * 7)],
                next: IDS[Math.ceil(Math.random() * 7)],
                paused: false
            });
        }
        else {
            return state;
        }
    }
}

export function useMainCanvas(rows, cols, blockSize) {
    const mainRef = useRef(null);
    const [state, dispatch] = useReducer(reducer, {
        rows: rows,
        cols: cols,
        id: IDS[0],
        next: IDS[0],
        paused: true
    }, init);

    useEffect(() => {
        const canvas = mainRef.current;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (!state.paused) {
            state.grid.forEach((row, y) => {
                row.forEach((val, x) => {
                    squareDraw(ctx, x, y, val, blockSize);
                });
            });
    
            state.shape.forEach((row, dy) => {
                row.forEach((val, dx) => {
                    if (val > 0) {
                        squareDraw(ctx, state.x + dx, state.y + dy,
                            val, blockSize);
                    }
                });
            });

            if (state.over) {
                ctx.font = "bold 48px sans-serif";
                ctx.textAlign = "center";
                ctx.strokeStyle = "white";
                ctx.fillStyle = "black";
                ctx.strokeText("GAME OVER", (cols / 2) * blockSize, (rows / 2) * blockSize);
                ctx.fillText("GAME OVER", (cols / 2) * blockSize, (rows / 2) * blockSize);
            }
        }
        else {
            ctx.font = "bold 48px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("PAUSED", (cols / 2) * blockSize, (rows / 2) * blockSize);
        }
    });

    return [mainRef, state, dispatch];
}