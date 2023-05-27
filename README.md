# Minesweeper
### [Link](https://dayanych.github.io/minesweeper/)
### Main functional requirements
`Basic (required):`
* initially, body in the index.html file must be empty (only script tag is allowed), all necessary elements are generated using JS
* the design should be adaptive (or responsive) from (500px <= width). It is acceptable to change the appearance for the mobile version (for example, hide the buttons in the burger menu)
* the default size of the frame is 10x10 with 10 mines.
* the player should be able to click on cells to reveal them. If the cell contains a mine, the game is over. If the cell does not contain a mine, the number of mines in the surrounding cells should be displayed
* the game should end when the player reveals all cells that do not contain mines (win) or clicks on mine (lose). On a successful game solution, display the message: "Hooray! You found all mines in ## seconds and N moves!" or "Game over. Try again"

`Advanced:`
* mines are placed after the first move, so that user cannot lose the game on the first move
* the player should be able to flag cells to indicate that they suspect a mine is present
* the game should use color coding (using numbers and colors) to indicate the number of mines surrounding a revealed cell.
* the game can be restarted without reloading the page (for example, by clicking on button New game)
* display the game duration seconds and the number of clicks
* when user opens a square that does not touch any mines, it will be empty and the adjacent squares will automatically open in all directions until reaching squares that contain numbers

`Additional (to get extra points):`
* the game should include sound effects for events such as revealing a cell, flagging a cell, and game over (win and lose).
* the player should be able to select a difficulty level (easy, medium, hard) which changes the size of the game board and the number of mines
* the latest 10 results are saved in the high score table and can be viewed in any way (for example, by pressing a button)
* implement the functionality to save the game (for example, using localStorage), so that when the page is reloaded, a player can continue from where he left off
* dark/light themes of the game
