// ========== BASIC FEEDBACK ==========

// Função para mensagem de sucesso
function showSuccessMessage(message) {
  userMessage.textContent = `✅ ${message}`;
  userMessage.className = "success";

  setTimeout(() => (userMessage.className = ""), 2500);
}

// Função para mensagem de erro
function showErrorMessage(message) {
  userMessage.textContent = `❌ ${message}`;
  userMessage.className = "error";

  setTimeout(() => (userMessage.className = ""), 2500);
}

// Função para mensagem de dica
function showHintMessage(message) {
  userMessage.textContent = `💡 ${message}`;
  userMessage.className = "warning";

  setTimeout(() => (userMessage.className = ""), 2500);
}

// Váriaveis globais de estado
//Estado do Jogo
let currentMode = "2"; // modo Normal por padrão
let pontos = 0;
let mediaAtual = null;
let tentativaFeita = false; // utilizado para habilitar e desabilitar o input

//Controle do Timer
let countdownInterval = null;
let currentTimerValue = null;

//Sistema de Dicas
let dicaUsada = false; //indica se é possível usar novas dicas ou não
let dicasEstaoDisponíveis = false; // indica se as dicas estão disponíveis para uso no modo atual ou não

//Variáveis DOM (manipulação da interface)
//Elementos de display (exibem mensagens, números, porntuações e o timer)
const num1 = document.getElementById("number1");
const num2 = document.getElementById("number2");
const num3 = document.getElementById("number3");
const num4 = document.getElementById("number4");
const userMessage = document.getElementById("message");
const displayTimer = document.getElementById("timer");
const displayPontos = document.getElementById("currentPoints");
const currentModeDisplay = document.getElementById("currentMode-display");

//Controles do Jogo (botões, inputs)
const randomizeBtn = document.getElementById("randomize-btn");
const formTentativa = document.getElementById("guessForm");
let campoTentativaUsuario = document.getElementById("userGuess");
const botaoEnviarTentativa = document.getElementById("submit");
const botaoPararTimer = document.getElementById("timer-label");
const botaoDica = document.getElementById("hint");

//Funções de Utilidade (Obter, calcular e atribuir valores)
function getNumberValue(element) {
  //declara que cada elemento recebido no parâmetro será um número inteiro
  return parseInt(element.innerText); //E então retorna o valor (já parseado) para onde a função foi chamada
}

// o "elem" permite que os parametros usados ao chamar essa função, sejam passados como array
function calcularMedia(elem) {
  const soma = elem.reduce((acc, el) => acc + getNumberValue(el), 0); //soma os valores dos elementos, através da redução do array a um único valor: o reduce tem um acumulador (iniciado em 0) e o valor atual do elemento, que é armazenado na variável "el".
  return soma / elem.length; //retorna a média baseada no número de elementos
}

function pontosPorAcerto() {
  if (currentMode === "1") return 5; // Fácil (Aprendiz)
  if (currentMode === "2") return 10; // Normal
  if (currentMode === "3") return 20; // Médio
  if (currentMode === "4") return 50; // Difícil
  return 10; // padrão
}

//Funções de Interface
//Controle Visual
function setTimerBtnInitialState() {
  botaoPararTimer.innerText = "Timer"; // ✅ Usar variável correta
  botaoPararTimer.style.backgroundColor = "inherit";
}

function setTimerBtnActiveState() {
  botaoPararTimer.innerText = "Parar";
  botaoPararTimer.style.backgroundColor = "#7b1a1a";
}

function disableGameControls() {
  campoTentativaUsuario.disabled = true; // desabilita o input de tentativa
  botaoEnviarTentativa.disabled = true; // desabilita o botão de enviar
  randomizeBtn.disabled = true; // desabilita o botão de gerar novos números
  botaoDica.disabled = true; // desabilita o botão de dica
}

function enableGameControls() {
  campoTentativaUsuario.disabled = false; // habilita o input de tentativa
  botaoEnviarTentativa.disabled = false; // habilita o botão de enviar
  randomizeBtn.disabled = false; // habilita o botão de gerar novos números
  botaoDica.disabled = false; // habilita o botão de dica
}

//Reset e Estados
function resetGame() {
  // Reseta os números
  num1.innerText = "0";
  num2.innerText = "0";
  num3.innerText = "0";
  num4.innerText = "0";
  mediaAtual = null;

  // Reseta o timer
  displayTimer.innerText = "00";

  // Para o contador
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
  setTimerBtnInitialState();

  // Reseta mensagem e campo
  userMessage.innerText = "";
  campoTentativaUsuario.value = "";

  // Reseta estados da rodada (NÃO pontos)
  dicaUsada = false;
  tentativaFeita = false;

  // Habilita controles
  enableGameControls();
}

function resetForNewRound() {
  // Reseta o campo de tentativa
  campoTentativaUsuario.value = "";
  userMessage.innerText = "";

  // Reseta o estado da dica
  dicaUsada = false;

  // Habilita controles
  enableGameControls();
}

function updateHintButtonState() {
  if (dicasEstaoDisponíveis && !dicaUsada) {
    botaoDica.disabled = false; // Habilita o botão de dica
  } else {
    botaoDica.disabled = true; // Desabilita o botão de dica
  }
}

// Função para atualizar o display do modo atual
function updateModeDisplay() {
  const modeNames = {
    1: "Aprendiz",
    2: "Normal",
    3: "Médio",
    4: "Difícil",
  };

  const modeColors = {
    1: "#f8fafc", // --text-primary (branco)
    2: "#3b82f6", // --interactive-primary (azul)
    3: "#f59e0b", // --feedback-warning (amarelo)
    4: "#ef4444", // --feedback-danger (vermelho)
  };

  const modeName = modeNames[currentMode] || "Normal";
  const modeColor = modeColors[currentMode] || "#3b82f6";

  if (currentModeDisplay) {
    currentModeDisplay.textContent = modeName;
    currentModeDisplay.style.color = modeColor;
  }
}

// Função para destacar o modo selecionado
function highlightSelectedMode() {
  // Remover destaque de todos os modos
  document.querySelectorAll(".gameModeOption").forEach((btn) => {
    btn.classList.remove("selected");
    btn.style.backgroundColor = "";
  });

  // Destacar o modo atual
  const selectedModeBtn = document.getElementById(`mode${currentMode}`);
  if (selectedModeBtn) {
    selectedModeBtn.classList.add("selected");

    // Cores específicas para cada modo
    const modeBackgrounds = {
      1: "rgba(248, 250, 252, 0.1)", // Aprendiz - branco transparente
      2: "rgba(59, 130, 246, 0.2)", // Normal - azul transparente
      3: "rgba(245, 158, 11, 0.2)", // Médio - amarelo transparente
      4: "rgba(239, 68, 68, 0.2)", // Difícil - vermelho transparente
    };

    selectedModeBtn.style.backgroundColor =
      modeBackgrounds[currentMode] || modeBackgrounds["2"];
  }
}

//Lógica Principal do Jogo
//Geração de números
function generateRandomNumbers(max) {
  const numbers = [];
  for (let i = 0; i < 4; i++) {
    numbers.push(Math.floor(Math.random() * max) + 1);
  }
  return numbers;
}

function generateRandom() {
  console.clear();
  userMessage.innerText = "";

  // ✅ RESETAR estados da rodada
  tentativaFeita = false;
  dicaUsada = false;

  let isInteger = false;
  // Configurar range por modo
  let max;
  if (currentMode === "1") max = 10;
  else if (currentMode === "2") max = 30;
  else if (currentMode === "3") max = 50;
  else if (currentMode === "4") max = 100;
  else max = 30;

  console.log("Modo atual: " + currentMode + " | Range máximo: " + max);

  while (!isInteger) {
    // Gerar números usando sua função auxiliar
    const numbers = generateRandomNumbers(max);

    // Colocar no display
    num1.innerText = numbers[0];
    num2.innerText = numbers[1];
    num3.innerText = numbers[2];
    num4.innerText = numbers[3];

    // Calcular média
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

  // ✅ GARANTIR que controles sejam habilitados após gerar números
  enableGameControls();

  // ✅ ATUALIZAR estado das dicas baseado no modo
  updateHintButtonState();

  // Timer só no modo difícil
  if (currentMode === "4") {
    startDifficultModeTimer();
  }
}

function startDifficultModeTimer() {
  // ✅ CORREÇÃO: Limpar timer anterior SEM desabilitar controles
  clearPreviousTimer(); // Nova função específica para isso
  setTimerBtnActiveState();

  // ✅ HABILITAR o botão de parar timer
  botaoPararTimer.disabled = false;

  let secondsLeft = 60;
  displayTimer.innerText = secondsLeft;
  randomizeBtn.disabled = true;
  console.log("Timer iniciado - 60 segundos no modo difícil");

  countdownInterval = setInterval(() => {
    secondsLeft--;
    displayTimer.innerText = secondsLeft;

    if (secondsLeft <= 0) {
      console.log(
        "Tempo esgotado no modo difícil! Gerando nova sequência em 3s..."
      );
      clearPreviousTimer(); // Usar a nova função
      handleTimeoutDifficultMode();
    }
  }, 1000);
}

// ✅ NOVA FUNÇÃO: Apenas limpa timer sem afetar controles
function clearPreviousTimer() {
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
  setTimerBtnInitialState();
}

// ✅ CORREÇÃO: stopTimer agora é específica para parada manual
function stopTimer() {
  // Limpa o timer
  clearPreviousTimer();

  // ✅ DESABILITAR o botão de parar timer novamente
  botaoPararTimer.disabled = true;

  // ✅ FUNCIONALIDADE: Desabilitar controles quando timer é parado MANUALMENTE
  campoTentativaUsuario.disabled = true;
  botaoEnviarTentativa.disabled = true;
  botaoDica.disabled = true;
  randomizeBtn.disabled = false; // ✅ PERMITE gerar nova sequência
  userMessage.innerText =
    "⏸️ Timer parado pelo usuário - Gere uma nova sequência";

  displayTimer.innerText = "00";
}

// ✅ CORREÇÃO: handleTimeoutDifficultMode melhorada
function handleTimeoutDifficultMode() {
  userMessage.innerText = `⏰ Tempo esgotado! A resposta era ${mediaAtual}`;
  disableGameControls(); // Desabilita tudo

  // ✅ DESABILITAR o botão de parar timer pois não há mais timer rodando
  botaoPararTimer.disabled = true;

  // Aguarda 3 segundos e gera nova sequência
  setTimeout(() => {
    generateRandom();
  }, 3000);
}

// ✅ CORREÇÃO: handleCorrectAnswer no modo difícil
function handleCorrectAnswer() {
  // Para o timer se estiver rodando
  if (currentMode === "4" && countdownInterval) {
    clearPreviousTimer(); // Usa a nova função
    botaoPararTimer.disabled = true; // Desabilita o botão de parar
  }

  pontos += pontosPorAcerto();

  // ✅ NOVA ANIMAÇÃO: Usar função de sucesso
  showSuccessMessage(`Correto! +${pontosPorAcerto()} pontos`);

  tentativaFeita = true;

  // ✅ CORREÇÃO: Comportamento específico por modo
  if (currentMode === "4") {
    // Modo difícil: desabilita tudo e aguarda 3s para regenerar
    disableGameControls();

    setTimeout(() => {
      generateRandom();
    }, 3000);
  } else {
    // Outros modos: desabilita apenas input/envio, mantém randomize habilitado
    campoTentativaUsuario.disabled = true;
    botaoEnviarTentativa.disabled = true;
    botaoDica.disabled = true;
    randomizeBtn.disabled = false; // Permite gerar nova sequência manualmente
  }
}

// ✅ CORREÇÃO: handleWrongAnswer no modo difícil
function handleWrongAnswer() {
  // Para o timer se estiver rodando
  if (currentMode === "4" && countdownInterval) {
    clearPreviousTimer(); // Usa a nova função
    botaoPararTimer.disabled = true; // Desabilita o botão de parar
  }

  // ✅ NOVA ANIMAÇÃO: Usar função de erro
  showErrorMessage(`Errado! A resposta era ${mediaAtual}`);

  tentativaFeita = true;

  if (currentMode === "4") {
    // Modo difícil: aguarda 3s e regenera automaticamente
    disableGameControls(); // Desabilita tudo temporariamente
    userMessage.innerText = `❌ Errado! A resposta era ${mediaAtual} - Nova sequência em 3s...`;

    setTimeout(() => {
      generateRandom();
    }, 3000);
  } else {
    // ✅ CORREÇÃO: Outros modos deixam só o randomize habilitado
    campoTentativaUsuario.disabled = true;
    botaoEnviarTentativa.disabled = true;
    botaoDica.disabled = true;
    randomizeBtn.disabled = false; // Permite gerar nova sequência
  }
}

function handleSubmit(event) {
  event.preventDefault(); // Previne o comportamento padrão do formulário de recarregar a página

  if (tentativaFeita) {
    userMessage.innerText = "Você já fez uma tentativa nesta rodada!";
    return;
  }

  //Obter e validar a tentativa do usuário
  const userGuess = parseInt(campoTentativaUsuario.value.trim());
  console.log("User Input: " + userGuess);

  if (isNaN(userGuess)) {
    //caso não seja um número
    userMessage.innerText = "Por favor, insira um número válido.";
    return;
  }

  //Verificar se a tentativa está correta
  if (userGuess === mediaAtual) {
    console.log("Usuário acertou! Pontos antes: " + pontos);
    handleCorrectAnswer();
    console.log("Pontos após acerto: " + pontos);
  } else {
    console.log("Usuário errou. Resposta correta era: " + mediaAtual);
    handleWrongAnswer();
  }

  // Limpar o campo de entrada após a tentativa
  campoTentativaUsuario.value = "";

  //Atualizar o display de pontos
  displayPontos.innerText = pontos;
}

// ===== EVENT LISTENERS =====
// Conectar botões às funções
randomizeBtn.addEventListener("click", () => {
  generateRandom();
});

formTentativa.addEventListener("submit", (e) => {
  handleSubmit(e);
});

botaoPararTimer.addEventListener("click", () => {
  stopTimer();
});

// Botão de dica
botaoDica.addEventListener("click", () => {
  showHintMessage("Dica: A média é a soma dividida por 4!");
});

// Botões de modo
document.getElementById("mode1")?.addEventListener("click", () => {
  console.log("Troca de modo. Atual: 1");
  currentMode = "1";
  dicasEstaoDisponíveis = false;
  updateModeDisplay();
  highlightSelectedMode();
  resetGame();
  // Fechar modal após seleção (apenas mobile)
  closeModal(gameModeModal);
});

document.getElementById("mode2")?.addEventListener("click", () => {
  console.log("Troca de modo. Atual: 2");
  currentMode = "2";
  dicasEstaoDisponíveis = false;
  updateModeDisplay();
  highlightSelectedMode();
  resetGame();
  // Fechar modal após seleção (apenas mobile)
  closeModal(gameModeModal);
});

document.getElementById("mode3")?.addEventListener("click", () => {
  console.log("Troca de modo. Atual: 3");
  currentMode = "3";
  dicasEstaoDisponíveis = true;
  updateModeDisplay();
  highlightSelectedMode();
  resetGame();
  // Fechar modal após seleção (apenas mobile)
  closeModal(gameModeModal);
});

document.getElementById("mode4")?.addEventListener("click", () => {
  console.log("Troca de modo. Atual: 4");
  currentMode = "4";
  dicasEstaoDisponíveis = true;
  updateModeDisplay();
  highlightSelectedMode();
  resetGame();
  // Fechar modal após seleção (apenas mobile)
  closeModal(gameModeModal);
});

// Inicializar o display do modo atual
updateModeDisplay();
highlightSelectedMode();

// ========== MODAL SYSTEM FOR MOBILE ==========

// Elementos dos modais
const rankingModal = document.getElementById("rankingCard");
const gameModeModal = document.querySelector(".gameMode-card");
const coverAllOverlay = document.querySelector(".coverAll");

// Botões para abrir modais
const rankingBtn = document.getElementById("rankingCard-btn");
const gameModeBtn = document.getElementById("gameMode-btn");

// Botões para fechar modais (X)
const closeRankingBtn = rankingModal?.querySelector(".fa-xmark");
const closeGameModeBtn = gameModeModal?.querySelector(".fa-xmark");

// Função para verificar se está no mobile
function isMobileView() {
  return (
    window.innerWidth <= 720 || window.matchMedia("(max-width: 720px)").matches
  );
}

// Função para abrir modal (apenas mobile)
function openModal(modal) {
  if (isMobileView() && modal) {
    modal.classList.add("active");
    modal.style.display = "flex";
    modal.style.opacity = "1";

    if (coverAllOverlay) {
      coverAllOverlay.classList.add("active");
    }

    // Prevenir scroll do body sem afetar o layout
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.width = "100%";
  }
}

// Função para fechar modal (apenas mobile)
function closeModal(modal) {
  if (isMobileView() && modal) {
    modal.classList.remove("active");
    modal.style.display = "none";
    if (coverAllOverlay) {
      coverAllOverlay.classList.remove("active");
    }
    // Restaurar scroll do body
    document.body.style.overflow = "auto";
    document.body.style.position = "";
    document.body.style.width = "";
  }
}

// Event listeners para abrir modais
rankingBtn?.addEventListener("click", (e) => {
  e.preventDefault();
  openModal(rankingModal);
});

gameModeBtn?.addEventListener("click", (e) => {
  e.preventDefault();
  openModal(gameModeModal);
});

// Event listeners para fechar modais (botões X)
closeRankingBtn?.addEventListener("click", () => {
  closeModal(rankingModal);
});

closeGameModeBtn?.addEventListener("click", () => {
  closeModal(gameModeModal);
});

// Fechar modal ao clicar no overlay
coverAllOverlay?.addEventListener("click", () => {
  closeModal(rankingModal);
  closeModal(gameModeModal);
});

// Gerenciar redimensionamento da tela
window.addEventListener("resize", () => {
  if (!isMobileView()) {
    // No desktop, sempre mostrar os modais e remover classes/estilos mobile
    if (rankingModal) {
      rankingModal.classList.remove("active");
      rankingModal.style.display = "";
    }
    if (gameModeModal) {
      gameModeModal.classList.remove("active");
      gameModeModal.style.display = "";
    }
    if (coverAllOverlay) {
      coverAllOverlay.classList.remove("active");
    }
    // Resetar estilos do body
    document.body.style.overflow = "auto";
    document.body.style.position = "";
    document.body.style.width = "";
  } else {
    // Mobile - garantir que modais iniciem fechados
    if (rankingModal && !rankingModal.classList.contains("active")) {
      rankingModal.style.display = "none";
    }
    if (gameModeModal && !gameModeModal.classList.contains("active")) {
      gameModeModal.style.display = "none";
    }
  }
});

// Função para inicializar o layout mobile
function initializeMobileLayout() {
  if (isMobileView()) {
    if (rankingModal) rankingModal.style.display = "none";
    if (gameModeModal) gameModeModal.style.display = "none";
    if (coverAllOverlay) coverAllOverlay.classList.remove("active");

    // Garantir que o body tenha o estilo correto
    document.body.style.overflow = "auto";
    document.body.style.position = "";
    document.body.style.width = "";
  }
}

// Inicializar estado dos modais baseado na tela
initializeMobileLayout();

// Executar também após o carregamento completo
document.addEventListener("DOMContentLoaded", initializeMobileLayout);
