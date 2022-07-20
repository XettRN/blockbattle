import { useEffect, useRef } from "react";
import { SHAPES, squareDraw, useMainCanvas } from "./GameCanvas";

const CLASSIC_ROWS = 20;
const CLASSIC_COLS = 10;
const CLASSIC_SIZE = 30;

const LEVEL = {
  0: 800,
  1: 720,
  2: 630,
  3: 550,
  4: 470,
  5: 380,
  6: 300,
  7: 220,
  8: 130,
  9: 100,
  10: 80,
  11: 80,
  12: 80,
  13: 70,
  14: 70,
  15: 70,
  16: 50,
  17: 50,
  18: 50,
  19: 30,
  20: 30,
  // 29+ is 20ms
};
var timerId;

function ClassicMode() {
    const [mainRef, state, dispatch] = useMainCanvas(CLASSIC_ROWS, 
        CLASSIC_COLS, CLASSIC_SIZE);

    const handleReset = () => {
        dispatch({type: "reset"});
    }

    useEffect(() => {
        if (!state.paused && state.level < 21) {
            timerId = setInterval(() => dispatch({type: "drop"}), LEVEL[state.level]);
            return () => {
                clearInterval(timerId);
            }
        }
    }, [timerId, state.paused, state.level]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.defaultPrevented) {
                return;
            }
            switch (event.code) {
                case "ArrowLeft":
                    dispatch({type: "left"});
                    break;
                case "ArrowRight":
                    dispatch({type: "right"});
                    break;
                case "ArrowDown":
                    dispatch({type: "softDrop"});
                    break;
                case "KeyZ":
                    dispatch({type: "rotateLeft"});
                    break;
                case "KeyX":
                    dispatch({type: "rotateRight"});
                    break;
                case "Space":
                    dispatch({type: "hardDrop"});
                    break;
                case "Escape":
                    dispatch({type: "pause"});
                    break;
            }
            event.preventDefault();
        };
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        }
    }, []);

    const nextRef = useRef(null);
    useEffect(() => {
        const canvas = nextRef.current;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (!state.paused) {
            let shape = SHAPES[state.next];
            shape.forEach((row, dy) => {
                row.forEach((val, dx) => {
                    if (val > 0) {
                        squareDraw(ctx, dx, dy, val, CLASSIC_SIZE);
                    }
                });
            });
        }
    });
    
    return (
        <>
            <canvas
                ref={mainRef}
                width={CLASSIC_COLS * CLASSIC_SIZE}
                height={CLASSIC_ROWS * CLASSIC_SIZE}
            />
            <button onClick={handleReset}>RESET</button>
            <canvas
                ref={nextRef}
                width={CLASSIC_SIZE * 4}
                height={CLASSIC_SIZE * 4}
            />
            <h2>Score: {state.score}</h2>
            <h2>Lines: {state.lines}</h2>
            <h2>Level: {state.level}</h2>
        </>
    )
}

export default ClassicMode;