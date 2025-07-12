// ========== BASIC FEEDBACK ==========

// ========== TOAST NOTIFICATION SYSTEM ==========

// Função para criar container de toast se não existir
function ensureToastContainer() {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "toast-container";
    document.body.appendChild(container);
  }
  return container;
}

// Função principal para mostrar toast
function showToast(message, type = "info", duration = 4000) {
  const container = ensureToastContainer();

  // Criar elemento toast
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;

  // Definir ícones por tipo
  const icons = {
    success: "fa-check-circle",
    error: "fa-exclamation-circle",
    warning: "fa-exclamation-triangle",
    info: "fa-info-circle",
  };

  toast.innerHTML = `
    <i class="fas ${icons[type]} toast-icon"></i>
    <span class="toast-text">${message}</span>
    <button class="toast-close" onclick="hideToast(this.parentElement)">
      <i class="fas fa-times"></i>
    </button>
  `;

  // Adicionar ao container
  container.appendChild(toast);

  // Mostrar toast com Animação
  setTimeout(() => {
    toast.classList.add("show");
  }, 10);

  // Auto-remover Após Duração especificada
  setTimeout(() => {
    hideToast(toast);
  }, duration);

  return toast;
}

// Função para esconder toast
function hideToast(toast) {
  if (!toast || !toast.parentElement) return;

  toast.classList.remove("show");
  toast.classList.add("hide");

  // Remover do DOM Após Animação
  setTimeout(() => {
    if (toast.parentElement) {
      toast.parentElement.removeChild(toast);
    }
  }, 300);
}

// Funções Específicas para cada tipo de toast
function showSuccessToast(message, duration = 3000) {
  return showToast(message, "success", duration);
}

function showErrorToast(message, duration = 4000) {
  return showToast(message, "error", duration);
}

function showWarningToast(message, duration = 4000) {
  return showToast(message, "warning", duration);
}

function showInfoToast(message, duration = 3000) {
  return showToast(message, "info", duration);
}

// ========== END TOAST NOTIFICATION SYSTEM ==========

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

  // Dicas ficam visíveis até o próximo acerto/erro/nova rodada
  // NÃO resetam automaticamente
}

// Variáveis globais de estado
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
let dicasEstaoDisponiveis = true; // indica se as dicas estao disponiveis para uso no modo atual ou nao - iniciado como true pois modo padrão é Normal
let dicasUsadasNaRodada = []; // Array para guardar dicas já usadas na rodada atual
let dicasUsadasNoJogo = 0; // Contador total de dicas usadas (para compartilhamento)

//Variáveis DOM (Manipulação da interface)
//Elementos de display (exibem mensagens, números, pontuações e o timer)
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
  //declara que cada elemento recebido no Parâmetro será um número inteiro
  return parseInt(element.innerText); //E Então retorna o valor (já parseado) para onde a Função foi chamada
}

// o "elem" permite que os parametros usados ao chamar essa Função, sejam passados como array
function calcularMedia(elem) {
  const soma = elem.reduce((acc, el) => acc + getNumberValue(el), 0); //soma os valores dos elementos, através da redução do array a um Único valor: o reduce tem um acumulador (iniciado em 0) e o valor atual do elemento, que é armazenado na Variável "el".
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
  botaoPararTimer.innerText = "Timer";
  botaoPararTimer.classList.remove("timer-active");
  // Remove estilos inline antigos
  botaoPararTimer.style.backgroundColor = "";
}

function setTimerBtnActiveState() {
  botaoPararTimer.innerText = "Parar";
  botaoPararTimer.classList.add("timer-active");
  // Remove estilos inline antigos para usar CSS
  botaoPararTimer.style.backgroundColor = "";
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

// Nova Função para controlar Formulário baseado no estado do jogo
function updateFormState() {
  if (!mediaAtual) {
    // Sem Números gerados - desabilitar Formulário mas manter randomize
    campoTentativaUsuario.disabled = true;
    botaoEnviarTentativa.disabled = true;
    botaoDica.disabled = true;
    randomizeBtn.disabled = false; // Sempre permitir gerar Números

    // Placeholder explicativo
    campoTentativaUsuario.placeholder = "Gere Números primeiro";
  } else {
    // Com Números gerados - habilitar Formulário normalmente
    campoTentativaUsuario.disabled = false;
    botaoEnviarTentativa.disabled = false;
    campoTentativaUsuario.placeholder = "Sua resposta";

    // Atualizar estado do botão de dica
    updateHintButtonState();
  }
}

// ========== SISTEMA DE DICAS ==========

// Função principal para usar dica
function usarDica() {
  // Verificar se há uma média atual válida
  if (!mediaAtual) {
    showErrorToast("Gere Números primeiro para usar dicas!");
    return;
  }

  // Verificar se pode usar dica (agora passando a média atual e números da sequência)
  const numerosSequencia = [
    getNumberValue(num1),
    getNumberValue(num2),
    getNumberValue(num3),
    getNumberValue(num4),
  ];

  const verificacao = DicasSystem.podeUsarDica(
    currentMode,
    pontos,
    dicasUsadasNaRodada,
    mediaAtual,
    numerosSequencia
  );

  if (!verificacao.pode) {
    showErrorToast(verificacao.motivo);
    return;
  }

  const { custo, dicaDisponivel } = verificacao;

  // Deduzir pontos (apenas se for modo difícil OU se tiver pontos)
  if (currentMode === "4" || pontos >= custo) {
    pontos = Math.max(0, pontos - custo);
    displayPontos.innerText = pontos;
  }

  // Registrar dica como usada
  dicasUsadasNaRodada.push(dicaDisponivel);
  dicasUsadasNoJogo++;

  // Mostrar dica no p#message (mantém comportamento atual)
  showHintMessage(dicaDisponivel);

  // Desabilitar botão de dica temporariamente
  botaoDica.disabled = true;

  // Reabilitar botão Após 3 segundos se ainda houver dicas disponíveis
  setTimeout(() => {
    updateHintButtonState();
  }, 3000);
}

// Função para atualizar estado do botão de dica
function updateHintButtonState() {
  // Remover classes anteriores
  botaoDica.classList.remove("hints-depleted");

  if (!dicasEstaoDisponiveis || !mediaAtual) {
    botaoDica.disabled = true;
    return;
  }

  const numerosSequencia = [
    getNumberValue(num1),
    getNumberValue(num2),
    getNumberValue(num3),
    getNumberValue(num4),
  ];

  const verificacao = DicasSystem.podeUsarDica(
    currentMode,
    pontos,
    dicasUsadasNaRodada,
    mediaAtual,
    numerosSequencia
  );

  if (verificacao.pode && !tentativaFeita) {
    // Estado habilitado - dica disponível
    botaoDica.disabled = false;
  } else {
    // Estado desabilitado
    botaoDica.disabled = true;

    // Se dicas estão esgotadas, adicionar classe especial
    const modoMap = { 1: "aprendiz", 2: "normal", 3: "medio", 4: "dificil" };
    const modo = modoMap[currentMode] || "normal";
    const limiteAtingido =
      dicasUsadasNaRodada.length >= DicasSystem.limites[modo];

    if (limiteAtingido) {
      botaoDica.classList.add("hints-depleted");
    }
  }
}

//Reset e Estados
function resetGame() {
  // Reseta os Números
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

  // Reseta estados da rodada (NãO pontos)
  dicaUsada = false;
  tentativaFeita = false;
  dicasUsadasNaRodada = []; // Reset das dicas da rodada
  // NãO resetar dicasUsadasNoJogo - isso é estatística do jogo todo

  // Reset estados visuais do botão de dica
  botaoDica.classList.remove("hints-depleted");

  // Atualizar estado do Formulário baseado na Situação atual
  updateFormState();
}

function resetForNewRound() {
  // Reseta o campo de tentativa
  campoTentativaUsuario.value = "";
  userMessage.innerText = "";

  // Reseta o estado da dica
  dicaUsada = false;

  // Atualizar estado do Formulário
  updateFormState();
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

    // Cores Específicas para cada modo
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
//Geração de Números
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

  // RESETAR estados da rodada
  tentativaFeita = false;
  dicaUsada = false;
  dicasUsadasNaRodada = []; // Reset das dicas da rodada

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
    // Gerar Números usando sua Função auxiliar
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

  // ✅ GARANTIR que controles sejam habilitados Após gerar Números
  updateFormState();

  // ✅ ATUALIZAR estado das dicas baseado no modo
  updateHintButtonState();

  // Timer só no modo difícil
  if (currentMode === "4") {
    startDifficultModeTimer();
  }
}

function startDifficultModeTimer() {
  // ✅ CORREã‡ãƒO: Limpar timer anterior SEM desabilitar controles
  clearPreviousTimer(); // Nova Função Específica para isso
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
      clearPreviousTimer(); // Usar a nova Função
      handleTimeoutDifficultMode();
    }
  }, 1000);
}

// ✅ NOVA FUNã‡ãƒO: Apenas limpa timer sem afetar controles
function clearPreviousTimer() {
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
  setTimerBtnInitialState();
}

// ✅ CORREã‡ãƒO: stopTimer agora é Específica para parada manual
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

  // ✅ GERAR Números finais ANTES da Animação
  let isInteger = false;
  let finalNumbers;
  let max;

  if (currentMode === "1") max = 10;
  else if (currentMode === "2") max = 30;
  else if (currentMode === "3") max = 50;
  else if (currentMode === "4") max = 100;
  else max = 30;

  // Encontrar Números que resultem em média inteira
  while (!isInteger) {
    finalNumbers = generateRandomNumbers(max);

    // Calcular média dos Números finais
    const testMedia = finalNumbers.reduce((acc, num) => acc + num, 0) / 4;
    if (Number.isInteger(testMedia)) {
      isInteger = true;
      mediaAtual = testMedia; // Atualizar para próxima rodada
    }
  }

  // ✅ MOSTRAR mensagem de transição
  userMessage.innerText = `⏰ Tempo esgotado! A resposta era ${mediaAtual} - Nova sequência...`;

  // ✅ INICIAR Animação dos displays
  animateNumberDisplays(finalNumbers, 3000);

  // Aguarda 3 segundos e finaliza a configuração da nova rodada
  setTimeout(() => {
    // Os Números já estão definidos pela Animação
    // Apenas resetar estados e habilitar controles
    tentativaFeita = false;
    dicaUsada = false;
    userMessage.innerText = "";

    enableGameControls();
    updateHintButtonState();

    // Timer só no modo difícil
    if (currentMode === "4") {
      startDifficultModeTimer();
    }
  }, 3000);
}

// ✅ NOVA FUNã‡ãƒO: Animação dos displays durante o delay
function animateNumberDisplays(finalNumbers, duration = 3000) {
  const displays = [num1, num2, num3, num4];
  const startTime = Date.now();
  const intervals = [];

  // Para cada display, criar uma Animação independente
  displays.forEach((display, index) => {
    let animationSpeed = 50; // Velocidade inicial (50ms entre mudanças)

    const animateDisplay = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / duration;

      if (progress >= 1) {
        // Animação terminou - mostrar número final
        display.innerText = finalNumbers[index];
        return;
      }

      // Desacelerar gradualmente a Animação
      const slowdownFactor = Math.max(0.3, 1 - progress); // De 1 a 0.3
      animationSpeed = 50 + 150 * (1 - slowdownFactor); // De 50ms a 200ms

      // Gerar número aleatório baseado no modo atual
      let max;
      if (currentMode === "1") max = 10;
      else if (currentMode === "2") max = 30;
      else if (currentMode === "3") max = 50;
      else if (currentMode === "4") max = 100;
      else max = 30;

      const randomNum = Math.floor(Math.random() * max) + 1;
      display.innerText = randomNum;

      // Agendar próxima mudança
      setTimeout(animateDisplay, animationSpeed);
    };

    // Começar Animação com delay escalonado para efeito visual
    setTimeout(() => {
      animateDisplay();
    }, index * 100); // 0ms, 100ms, 200ms, 300ms
  });
}

// ✅ CORREã‡ãƒO: handleCorrectAnswer no modo difícil com Animação
function handleCorrectAnswer() {
  // Para o timer se estiver rodando
  if (currentMode === "4" && countdownInterval) {
    clearPreviousTimer(); // Usa a nova Função
    botaoPararTimer.disabled = true; // Desabilita o botão de parar
  }

  pontos += pontosPorAcerto();

  // ✅ ANIMAã‡ãƒO DE CONFETTI: Usar Função de sucesso COM confetti
  showSuccessMessageWithConfetti(`Correto! +${pontosPorAcerto()} pontos`);

  tentativaFeita = true;

  // ✅ CORREã‡ãƒO: Comportamento específico por modo
  if (currentMode === "4") {
    // Modo difícil: desabilita tudo e aguarda 3s para regenerar COM ANIMAã‡ãƒO
    disableGameControls();

    // ✅ GERAR Números finais ANTES da Animação
    let isInteger = false;
    let finalNumbers;
    let max;

    if (currentMode === "1") max = 10;
    else if (currentMode === "2") max = 30;
    else if (currentMode === "3") max = 50;
    else if (currentMode === "4") max = 100;
    else max = 30;

    // Encontrar Números que resultem em média inteira
    while (!isInteger) {
      finalNumbers = generateRandomNumbers(max);

      // Calcular média dos Números finais
      const testMedia = finalNumbers.reduce((acc, num) => acc + num, 0) / 4;
      if (Number.isInteger(testMedia)) {
        isInteger = true;
        mediaAtual = testMedia; // Atualizar para próxima rodada
      }
    }

    // ✅ INICIAR Animação dos displays Após 1 segundo
    setTimeout(() => {
      animateNumberDisplays(finalNumbers, 3000);
    }, 1000);

    setTimeout(() => {
      // Os Números já estão definidos pela Animação
      // Apenas resetar estados e habilitar controles
      tentativaFeita = false;
      dicaUsada = false;
      dicasUsadasNaRodada = []; // Reset das dicas da rodada

      enableGameControls();
      updateHintButtonState();

      // Timer só no modo difícil
      if (currentMode === "4") {
        startDifficultModeTimer();
      }
    }, 4000); // 1s delay + 3s Animação
  } else {
    // Outros modos: desabilita apenas input/envio, mantém randomize habilitado
    campoTentativaUsuario.disabled = true;
    botaoEnviarTentativa.disabled = true;
    botaoDica.disabled = true;
    randomizeBtn.disabled = false; // Permite gerar nova sequência manualmente
  }
}

// ✅ CORREã‡ãƒO: handleWrongAnswer no modo difícil com Animação
function handleWrongAnswer() {
  // Para o timer se estiver rodando
  if (currentMode === "4" && countdownInterval) {
    clearPreviousTimer(); // Usa a nova Função
    botaoPararTimer.disabled = true; // Desabilita o botão de parar
  }

  // ✅ NOVA ANIMAã‡ãƒO: Usar Função de erro
  showErrorMessage(`Errado! A resposta era ${mediaAtual}`);

  tentativaFeita = true;

  if (currentMode === "4") {
    // Modo difícil: aguarda 3s e regenera automaticamente COM ANIMAã‡ãƒO
    disableGameControls(); // Desabilita tudo temporariamente

    // ✅ GERAR Números finais ANTES da Animação
    let isInteger = false;
    let finalNumbers;
    let max;

    if (currentMode === "1") max = 10;
    else if (currentMode === "2") max = 30;
    else if (currentMode === "3") max = 50;
    else if (currentMode === "4") max = 100;
    else max = 30;

    // Encontrar Números que resultem em média inteira
    while (!isInteger) {
      finalNumbers = generateRandomNumbers(max);

      // Calcular média dos Números finais
      const testMedia = finalNumbers.reduce((acc, num) => acc + num, 0) / 4;
      if (Number.isInteger(testMedia)) {
        isInteger = true;
        mediaAtual = testMedia; // Atualizar para próxima rodada
      }
    }

    userMessage.innerText = `❌ Errado! A resposta era ${mediaAtual} - Nova sequência...`;

    // ✅ INICIAR Animação dos displays Após 1 segundo
    setTimeout(() => {
      animateNumberDisplays(finalNumbers, 3000);
    }, 1000);

    setTimeout(() => {
      // Os Números já estão definidos pela Animação
      // Apenas resetar estados e habilitar controles
      tentativaFeita = false;
      dicaUsada = false;
      dicasUsadasNaRodada = []; // Reset das dicas da rodada
      userMessage.innerText = "";

      enableGameControls();
      updateHintButtonState();

      // Timer só no modo difícil
      if (currentMode === "4") {
        startDifficultModeTimer();
      }
    }, 4000); // 1s delay + 3s Animação
  } else {
    // ✅ CORREã‡ãƒO: Outros modos deixam só o randomize habilitado
    campoTentativaUsuario.disabled = true;
    botaoEnviarTentativa.disabled = true;
    botaoDica.disabled = true;
    randomizeBtn.disabled = false; // Permite gerar nova sequência
  }
}

function handleSubmit(event) {
  event.preventDefault(); // Previne o comportamento padrão do Formulário de recarregar a página

  // Verificar se Números foram gerados
  if (!mediaAtual) {
    showWarningToast("Gere Números primeiro para fazer uma tentativa!");
    return;
  }

  if (tentativaFeita) {
    showWarningToast("Você já fez uma tentativa nesta rodada!");
    return;
  }

  //Obter e validar a tentativa do usuário
  const userGuess = parseInt(campoTentativaUsuario.value.trim());
  console.log("User Input: " + userGuess);

  if (isNaN(userGuess)) {
    //caso não seja um número
    showErrorToast("Por favor, insira um número válido");
    return;
  }

  //Verificar se a tentativa está correta
  if (userGuess === mediaAtual) {
    console.log("Usuário acertou! Pontos antes: " + pontos);
    handleCorrectAnswer();
    console.log("Pontos Após acerto: " + pontos);
  } else {
    console.log("Usuário errou. Resposta correta era: " + mediaAtual);
    handleWrongAnswer();
  }

  // Limpar o campo de entrada Após a tentativa
  campoTentativaUsuario.value = "";

  //Atualizar o display de pontos
  displayPontos.innerText = pontos;
}

// ===== EVENT LISTENERS =====
// Conectar botões ã s Funções
randomizeBtn.addEventListener("click", () => {
  generateRandom();
});

formTentativa.addEventListener("submit", (e) => {
  handleSubmit(e);
});

botaoPararTimer.addEventListener("click", () => {
  stopTimer();
});

// botão de dica
botaoDica.addEventListener("click", () => {
  showHintConfirmation();
});

// botões de modo
document.getElementById("mode1")?.addEventListener("click", () => {
  console.log("Troca de modo. Atual: 1");
  currentMode = "1";
  dicasEstaoDisponiveis = true; // Dicas habilitadas para modo Aprendiz
  updateModeDisplay();
  highlightSelectedMode();
  resetGame();

  // Toast de confirmação
  showSuccessToast("Modo alterado para Aprendiz");

  // Fechar modal Após seleção (apenas mobile)
  closeModal(gameModeModal);
});

document.getElementById("mode2")?.addEventListener("click", () => {
  console.log("Troca de modo. Atual: 2");
  currentMode = "2";
  dicasEstaoDisponiveis = true; // Dicas habilitadas para modo Normal
  updateModeDisplay();
  highlightSelectedMode();
  resetGame();

  // Toast de confirmação
  showSuccessToast("Modo alterado para Normal");

  // Fechar modal Após seleção (apenas mobile)
  closeModal(gameModeModal);
});

document.getElementById("mode3")?.addEventListener("click", () => {
  console.log("Troca de modo. Atual: 3");
  currentMode = "3";
  dicasEstaoDisponiveis = true;
  updateModeDisplay();
  highlightSelectedMode();
  resetGame();

  // Toast de confirmação
  showSuccessToast("Modo alterado para Médio");

  // Fechar modal Após seleção (apenas mobile)
  closeModal(gameModeModal);
});

document.getElementById("mode4")?.addEventListener("click", () => {
  console.log("Troca de modo. Atual: 4");
  currentMode = "4";
  dicasEstaoDisponiveis = true;
  updateModeDisplay();
  highlightSelectedMode();
  resetGame();

  // Toast de confirmação
  showSuccessToast("Modo alterado para Difícil");

  // Fechar modal Após seleção (apenas mobile)
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

// botões para abrir modais
const rankingBtn = document.getElementById("rankingCard-btn");
const gameModeBtn = document.getElementById("gameMode-btn");

// botões para fechar modais (X)
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

// ========== RANKING TAB SYSTEM ==========

// Função para trocar entre abas do ranking
function switchRankingTab(tabName) {
  // Remove active de todas as abas e painéis
  document
    .querySelectorAll(".tab-btn")
    .forEach((btn) => btn.classList.remove("active"));
  document
    .querySelectorAll(".tab-panel")
    .forEach((panel) => panel.classList.remove("active"));

  // Ativa a aba clicada
  document.querySelector(`[data-tab="${tabName}"]`).classList.add("active");
  document.getElementById(`${tabName}-tab`).classList.add("active");
}

// Executar também Após o carregamento completo
document.addEventListener("DOMContentLoaded", () => {
  // Inicializar layout mobile
  initializeMobileLayout();

  // Inicializar estado do Formulário (desabilitado até gerar Números)
  updateFormState();

  // Inicializar modo padrão (Normal) corretamente
  updateModeDisplay();
  highlightSelectedMode();

  // Garantir que o estado das dicas seja configurado corretamente
  updateHintButtonState();

  // Abas do ranking
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tabName = btn.getAttribute("data-tab");
      switchRankingTab(tabName);
    });
  });

  // Inicializar sistema de tutorial
  initializeTutorial();
});

// ========== CONFETTI SYSTEM ==========

// Função para criar confetti
function createConfetti() {
  const container = document.getElementById("confetti-container");
  if (!container) return;

  // Limpar confetti anterior se existir
  container.innerHTML = "";

  // Configuraçãµes do confetti
  const colors = ["primary", "success", "warning", "accent", "secondary"];
  const shapes = ["square", "circle", "triangle"];
  const sizes = ["small", "medium", "large"];
  const movements = ["", "drift-left", "drift-right"];

  // Criar 25-40 peças de confetti
  const pieceCount = Math.floor(Math.random() * 16) + 25;

  for (let i = 0; i < pieceCount; i++) {
    createConfettiPiece(container, colors, shapes, sizes, movements);
  }

  // Limpar o container Após a Animação terminar
  setTimeout(() => {
    if (container) {
      container.innerHTML = "";
    }
  }, 3500);
}

// Função para criar uma peça individual de confetti
function createConfettiPiece(container, colors, shapes, sizes, movements) {
  const piece = document.createElement("div");
  piece.className = "confetti-piece";

  // Escolher características aleatórias
  const color = colors[Math.floor(Math.random() * colors.length)];
  const shape = shapes[Math.floor(Math.random() * shapes.length)];
  const size = sizes[Math.floor(Math.random() * sizes.length)];
  const movement = movements[Math.floor(Math.random() * movements.length)];

  // Aplicar classes
  piece.classList.add(color, shape, size);
  if (movement) piece.classList.add(movement);

  // Posição horizontal aleatória
  const startX = Math.random() * window.innerWidth;
  piece.style.left = startX + "px";

  // Posição inicial bem próxima do topo da tela
  piece.style.top = "-20px";

  // Duração aleatória da Animação (2.5s a 3.5s)
  const duration = 2.5 + Math.random() * 1;
  piece.style.setProperty("--fall-duration", duration + "s");

  // Rotação aleatória
  const rotation = Math.random() * 720 - 360; // -360 a 360 graus
  piece.style.setProperty("--rotation", rotation + "deg");

  // Adicionar delay aleatório pequeno para efeito mais natural
  const delay = Math.random() * 200; // 0-200ms
  piece.style.animationDelay = delay + "ms";

  container.appendChild(piece);
}

// Função modificada para mensagem de sucesso COM confetti
function showSuccessMessageWithConfetti(message) {
  // Criar confetti primeiro
  createConfetti();

  // Depois mostrar a mensagem
  userMessage.textContent = `✅ ${message}`;
  userMessage.className = "success";

  setTimeout(() => (userMessage.className = ""), 2500);
}

// ========== END CONFETTI SYSTEM ==========

// ========== HINT CONFIRMATION SYSTEM ==========

// Função para mostrar o card de confirmação de dica
function showHintConfirmation() {
  // Verificar se dica pode ser usada
  const verificacao = DicasSystem.podeUsarDica(
    currentMode,
    pontos,
    dicasUsadasNaRodada,
    mediaAtual,
    [
      getNumberValue(num1),
      getNumberValue(num2),
      getNumberValue(num3),
      getNumberValue(num4),
    ]
  );

  if (!verificacao.pode) {
    // Feedback específico para modo difícil quando faltam pontos
    if (currentMode === "4" && verificacao.motivo.includes("pontos")) {
      showErrorToast(
        `💰 ${verificacao.motivo} para usar dicas no modo Difícil!`
      );

      // Animação de "shake" no botão de dica
      botaoDica.style.animation = "shake 0.5s ease-in-out";
      setTimeout(() => {
        botaoDica.style.animation = "";
      }, 500);
    } else {
      showWarningToast(verificacao.motivo);
    }
    return;
  }

  // Atualizar custo da dica no card
  const hintCostText = document.getElementById("hintCostText");
  hintCostText.textContent = `-${verificacao.custo} pts`;

  // Calcular e mostrar disponibilidade das dicas
  const modoMap = { 1: "aprendiz", 2: "normal", 3: "medio", 4: "dificil" };
  const modo = modoMap[currentMode] || "normal";
  const limiteTotal = DicasSystem.limites[modo];
  const dicasUsadas = dicasUsadasNaRodada.length;
  const dicasRestantes = limiteTotal - dicasUsadas;

  const hintsAvailableText = document.getElementById("hintsAvailableText");
  hintsAvailableText.textContent = `${dicasRestantes} de ${limiteTotal} disponíveis`;

  // Mostrar card
  const card = document.getElementById("hintConfirmCard");
  card.classList.add("show");
}

// Função para fechar o card de confirmação
function closeHintConfirmation() {
  const card = document.getElementById("hintConfirmCard");
  card.classList.remove("show");
}

// Função para confirmar o uso da dica
function confirmHintUsage() {
  // Fechar card primeiro
  closeHintConfirmation();

  // Usar a dica (funcao ja existente)
  usarDica();
}

// ========== END HINT CONFIRMATION SYSTEM ==========

// ========== TUTORIAL SYSTEM ==========

// Função para inicializar o sistema de tutorial
function initializeTutorial() {
  const tutorialTabBtns = document.querySelectorAll(".tutorial-tab-btn");
  const tutorialPanels = document.querySelectorAll(".tutorial-panel");

  // Adicionar event listeners para as abas do tutorial
  tutorialTabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetTab = btn.getAttribute("data-tab");
      switchTutorialTab(targetTab);
    });
  });
}

// Função para trocar de aba no tutorial
function switchTutorialTab(targetTab) {
  const tutorialTabBtns = document.querySelectorAll(".tutorial-tab-btn");
  const tutorialPanels = document.querySelectorAll(".tutorial-panel");

  // Remover classe active de todas as abas e painéis
  tutorialTabBtns.forEach((btn) => btn.classList.remove("active"));
  tutorialPanels.forEach((panel) => panel.classList.remove("active"));

  // Adicionar classe active na aba e painel corretos
  const activeBtn = document.querySelector(`[data-tab="${targetTab}"]`);
  const activePanel = document.getElementById(`${targetTab}-tab`);

  if (activeBtn && activePanel) {
    activeBtn.classList.add("active");
    activePanel.classList.add("active");
  }
}

// ========== END TUTORIAL SYSTEM ==========
