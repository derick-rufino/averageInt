let currentMode = "normal";
let pontos = 0; // Inicializa a variável de pontos

function getNumberValue(element) {
  //declara que cada elemento recebido no parâmetro
  return parseInt(element.innerText); //será um número inteiro
}

// o "elem" permite que os parametros usados ao chamar essa função, sejam passados como array
function calcularMedia(elem) {
  const soma = elem.reduce((acc, el) => acc + getNumberValue(el), 0); //soma os valores dos elementos, através da redução do array a um único valor: o reduce tem um acumulador (iniciado em 0) e o valor atual do elemento, que é armazenado na variável "el".
  return soma / elem.length; //retorna a média baseada no número de elementos
}

let mediaAtual = null;

// Aciona a função de aleatorizar
let randomizeBtn = document.getElementById("randomize-btn");
randomizeBtn.addEventListener("click", function generateRandom() {
  console.clear(); //limpa a tentativa anterior
  uMessage.innerText = ""; //limpa o texto exibido para o usuário (acerto, erro ou dica)
  let isInteger = false; //define uma nova variável que por padrão é false, até ser atualizada na linha 37, se o teste "mediaAtual é int" retornar true

  // ajusta a faixa de números conforme o modo
  let max;
  if (currentMode === "1") max = 10; // Aprendiz
  else if (currentMode === "2") max = 20; // Normal
  else if (currentMode === "3") max = 50; // Médio
  else if (currentMode === "4") max = 50; // Difícil
  else max = 20; // padrão

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

  // Reabilita o campo e o botão de envio para nova tentativa
  document.getElementById("userGuess").disabled = false;
  guessForm.querySelector('button[type="submit"]').disabled = false;
});

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

        // Desabilita o campo e o botão de envio após acerto
        document.getElementById("userGuess").disabled = true;
      } else {
        uMessage.innerText =
          "Tente novamente! A média correta é: " + mediaAtual;

        // Desabilita o campo e o botão de envio após erro
        document.getElementById("userGuess").disabled = true;
        guessForm.querySelector('button[type="submit"]').disabled = true;
      }
    }
    // Limpa o campo de entrada do usuário após a tentativa
    document.getElementById("userGuess").value = "";
  }
});

//código gerado por Copilot
// Função para trocar o modo de jogo
function trocarModo(novoModo, botaoClicado) {
  currentMode = novoModo;

  // Remove o destaque de todos os botões
  document.querySelectorAll(".gameModeOption").forEach((btn) => {
    btn.style.borderLeft = "none";
    btn.style.backgroundColor = ""; // ou cor padrão
  });

  // Destaca o botão selecionado
  botaoClicado.style.backgroundColor = "#23243a";
}

// Adiciona o event listener para todos os botões de modo
document.querySelectorAll(".gameModeOption").forEach((btn) => {
  btn.addEventListener("click", function () {
    // O id do botão indica o modo (ex: mode1, mode2...)
    let modo = this.id.replace("mode", ""); // pega só o número
    trocarModo(modo, this);
  });
});

function pontosPorAcerto() {
  if (currentMode === "1") return 5; // Fácil (Aprendiz)
  if (currentMode === "2") return 10; // Normal
  if (currentMode === "3") return 20; // Médio
  if (currentMode === "4") return 50; // Difícil
  return 10; // padrão
}
