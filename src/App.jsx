import { useState } from "react";
import "./App.css";
import ClassicMode from "./components/ClassicMode";

function App() {
    const [classic, setClassic] = useState(false);
    const [controls, setControls] = useState(false);

    const handleTitle = () => {
        setClassic(false);
        setControls(false);
    }

    return (
        <>
            <div className="title">
                <h1 onClick={handleTitle}>BLOCK BATTLE</h1>
            </div>
            {
                classic ?
                <ClassicMode /> :
                controls ?
                <div>
                    <ul>
                        <li>Arrows Keys to move</li>
                        <li>Space to hard drop</li>
                        <li>Z to rotate left</li>
                        <li>X to rotate right</li>
                        <li>ESC to pause</li>
                    </ul>
                </div> :
                <div className="menu-buttons">
                    <button onClick={() => setClassic(true)}>CLASSIC</button>
                    <button onClick={() => setControls(true)}>CONTROLS</button>
                </div>
            }
        </>
    );
}

export default App;