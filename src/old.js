let currentMode = "normal";
let pontos = 0; // Inicializa a variável de pontos
let countdownInterval = null; // variável global para o intervalo
let mediaAtual = null;
let isInteger = false; //define uma nova variável que por padrão é false, até ser atualizada, se o teste "mediaAtual é int" retornar true
let isGenerateRequested = false;

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

const stopTimer = document.getElementById("timer-label");
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

function resetGame() {
  // Reseta os números
  num1.innerText = "0";
  num2.innerText = "0";
  num3.innerText = "0";
  num4.innerText = "0";
  let mediaAtual = null;

  // Reseta o timer
  timer.innerText = "00";
  // Para o contador
  if (countdownInterval) clearInterval(countdownInterval);
  if (typeof currentTimerValue !== "undefined" && currentTimerValue)
    clearTimeout(currentTimerValue);
}

// Função para trocar o modo de jogo
function trocarModo(novoModo, botaoClicado) {
  currentMode = novoModo;
  console.log("Troca de modo. Atual: " + novoModo);

  // Remove o destaque de todos os botões
  document.querySelectorAll(".gameModeOption").forEach((btn) => {
    btn.style.backgroundColor = "";
  });

  // Destaca o botão selecionado
  botaoClicado.style.backgroundColor = "#23243a";
  randomizeBtn.disabled = false;
  clearTimeout(countdownInterval);
}

// Adiciona o event listener para todos os botões de modo
document.querySelectorAll(".gameModeOption").forEach((btn) => {
  btn.addEventListener("click", function () {
    // O id do botão indica o modo (ex: mode1, mode2...)
    let modo = this.id.replace("mode", ""); // pega só o número, removendo o mode com um espço vazio
    trocarModo(modo, this); //chama o trocar modo lá em cima, passando o número do botão como indicador e deixa a váriavel currentMode dentro dele receber esse indicado, o que também possibilita a troca da faixa de números e pontos por modo
  });
});

function getNumberValue(element) {
  //declara que cada elemento recebido no parâmetro
  return parseInt(element.innerText); //será um número inteiro
}

// o "elem" permite que os parametros usados ao chamar essa função, sejam passados como array
function calcularMedia(elem) {
  const soma = elem.reduce((acc, el) => acc + getNumberValue(el), 0); //soma os valores dos elementos, através da redução do array a um único valor: o reduce tem um acumulador (iniciado em 0) e o valor atual do elemento, que é armazenado na variável "el".
  return soma / elem.length; //retorna a média baseada no número de elementos
}

let randomizeBtn = document.getElementById("randomize-btn");
randomizeBtn.addEventListener("click", generateRandom);
function generateRandom() {
  isGenerateRequested = true;
  console.clear(); //limpa a tentativa anterior
  uMessage.innerText = ""; //limpa o texto exibido para o usuário (acerto, erro ou dica)

  // Ajuste na faixa de números conforme o modo
  let max;
  if (currentMode === "1") max = 10; // Aprendiz
  else if (currentMode === "2") max = 30; // Normal
  else if (currentMode === "3") max = 50; // Médio
  else if (currentMode === "4") max = 100; // Difícil
  else max = 30; // padrão

  while (!isInteger) {
    // Gera números aleatórios conforme a dificuldade
    num1.innerText = parseInt(Math.random() * max);
    num2.innerText = parseInt(Math.random() * max);
    num3.innerText = parseInt(Math.random() * max);
    num4.innerText = parseInt(Math.random() * max);

    mediaAtual = calcularMedia([num1, num2, num3, num4]);
    console.log("O tipo de mediaAtual é " + typeof mediaAtual);
    console.log("Média atual: " + mediaAtual);

    if (Number.isInteger(mediaAtual)) {
      console.log(
        "A média é um número inteiro. O usuário pode digitar sua tentativa."
      );
      isInteger = true;
    } else {
      console.log("A média é um número float. Gerando nova sequência...");
    }
  }

  if (countdownInterval) clearInterval(countdownInterval); //limpa a contagem anterior caso ele seja true
  if (isGenerateRequested && currentMode == "4") {
    setTimerBtnActiveState();
    stopTimer.removeAttribute("disabled"); //habilita o botão de parar
    let secondsLeft = 60; // contador de segundos
    timer.innerText = secondsLeft;
    randomizeBtn.disabled = true;

    countdownInterval = setInterval(() => {
      secondsLeft--;
      timer.innerText = secondsLeft;
      if (secondsLeft <= 0) {
        clearInterval(countdownInterval);
      }
    }, 1000);

    // Gera uma nova sequência depois de 1 minuto (60 segundos)
    if (typeof currentTimerValue !== "undefined" && currentTimerValue)
      clearTimeout(currentTimerValue);
    currentTimerValue = setTimeout(() => {
      generateRandom();
    }, 60 * 1000);
  } else {
    timer.innerText = "00"; // Limpa o timer nos outros modos
    if (typeof currentTimerValue !== "undefined" && currentTimerValue)
      clearTimeout(currentTimerValue);
  }
}

// Armazenando a entrada do usuário
const guessForm = document.getElementById("guessForm");
guessForm.addEventListener("submit", (e) => {
  e.preventDefault(); //previne que a página recarregue ao enviar o form
  const formValue = new FormData(guessForm);

  for (item of formValue) {
    //para cada item dentro dos valores do form
    console.log(item); //loga o item que o user deu entrada em formato array
    let userGuessValue = item[1]; //acessa o array e armazena apenas o valor numérico
    console.log("User Input: " + userGuessValue);

    if (mediaAtual !== null) {
      //verifica se a média foi calculada
      if (userGuessValue == mediaAtual) {
        // não pode ser estritamente igual, pois o input reserva outro tipo de dado
        pontos += pontosPorAcerto(); // soma os pontos conforme o modo
        currentPoints.innerText = pontos;
        uMessage.innerText = "Parabéns! Você acertou a média!";

        setTimerBtnInitialState();

        // Reabilita o botão para nova rodada no modo difícil
        if (currentMode === "4") {
          randomizeBtn.disabled = false;
          // Também pode zerar o timer se quiser:
          timer.innerText = "00";
          if (countdownInterval) clearInterval(countdownInterval);
          if (typeof currentTimerValue !== "undefined" && currentTimerValue)
            clearTimeout(currentTimerValue);
        }
      } else {
        uMessage.innerText =
          "Tente novamente! A média correta é: " + mediaAtual;
      }
    }
    // Limpa o campo de entrada do usuário após a tentativa
    document.getElementById("userGuess").value = "";
  }
});

function pontosPorAcerto() {
  if (currentMode === "1") return 5; // Fácil (Aprendiz)
  if (currentMode === "2") return 10; // Normal
  if (currentMode === "3") return 20; // Médio
  if (currentMode === "4") return 50; // Difícil
  return 10; // padrão
}

stopTimer.addEventListener("click", stopTimerRun());
function stopTimerRun() {
  resetGame();

  randomizeBtn.disabled = false;
  setTimerBtnInitialState();
}
