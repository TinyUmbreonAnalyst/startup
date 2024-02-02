# Custom Sized TicTacToe
## Elevator pitch
It's time for a test of concentration, speed, and skill. Tap the rock as fast as you can possibly can! Play with friends, or seek to just improve it by yourself. The faster you tap, the faster it breaks! You can try to see how fast you can break it, or how far you get in a minute! Play it your way, and have fun!
## Design

Rough Sketch of how website is designed.
## Key Features
* Secure Login over HTTPS
* Ability to select online or offline capability
* Ability to choose to play for when you break the rock, or how far you get in a certain time period.
* Ability to only start timing on imput
* Ability to see other's scores, on multiplayer, when you finish your round
* Storage of times in both time per rock, and percent per rock broken in miniut

## Technologies
I am going to use the following technologies in the following ways
* **HTML** - Use correct HTML structure for application. Going to have 4 HTML Pages: Home page, about page, play page, and score page
* **CSS** - Application styling that looks good on different screens, color, contrast, etc.
* **JavaScript** - Used for login, specifying game to play, and helps to play the game, and for unique animation if the won the game.
* **Service** - Backend endpoints for:
  - login
  - finding games that are in queue to be played
  - storing and accessing data, in both formats.
* **DB** - storing scores and users in a database
* **Login** - Register and login users. Credentials and time record stored in database. Can't play without login
* **WebSocket** - For multiplayer. Will see the other player's score when they are done, and whether they won or loss.
* **React** - Application ported to use the React web framework
* **Database** The record updating is going to be a call to the database, and so are the three tables in the score page
* **Websocket** The entire 256 radio buttons shown in the game is going to represent the input of the player and the websocket call of the opponent. Also the notification bar is websocket.

## CSS Deliverable
For this Deliverable, I edited the format of my startup using CSS.
*
