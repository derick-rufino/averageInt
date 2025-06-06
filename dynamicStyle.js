// Acessando os elementos HTML
let num1 = document.getElementById("number1");
let num2 = document.getElementById("number2");
let num3 = document.getElementById("number3");
let num4 = document.getElementById("number4");
let uMessage = document.getElementById("message");
let timer = document.getElementById("timer");
let currentTimerValue = null;

const rankingCard = document.getElementById("rankingCard");

let currentPoints = document.getElementById("currentPoints");

function setTimerBtnInitialState() {
  stopTimer.innerText = "Timer";
  stopTimer.style.backgroundColor = "inherit";
}

function setTimerBtnActiveState() {
  stopTimer.innerText = "Parar"; //muda o texto para indicar que ele pode ser clicado
  stopTimer.style.backgroundColor = "#7b1a1a"; // muda a cor, indicando que é um botão
}

function rowDice(){
    
}