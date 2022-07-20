# blockbattle

This is a tetris clone based on the classic version of tetris. 
Unlike many other versions online, this one uses React components along
with canvas elements. 

This project is based on a vanilla JS version from this
[article](https://michael-karen.medium.com/learning-modern-javascript-with-tetris-92d532bcd057)
by Michael Karen. So thanks for him for a baseline for this project. However,
I've modified many of the elements to fit modern JS standards.  With React,
I've used a custom hook for the game canvas and useReducer for stateful
logic as I felt it made the most sense for this project. There are some also some small
additions like gridlines and pausing.

[You can try out the game here](https://ttexpie.github.io/blockbattle/)

## Controls

+ Arrow Keys to move blocks
+ Z to rotate left
+ X to rotate right
+ Spacebar to hard drop
+ ESC to pause/unpause the game
