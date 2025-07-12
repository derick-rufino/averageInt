const DicasSystem = {
  // Arrays de dicas por modo
  aprendiz: [
    "A média é menor que 5",
    "A média está entre 6 e 9",
    "A média é um número par",
    "A média é um número ímpar",
    "A média está entre 1 e 4",
    "A média é maior que 7",
    "A média é menor que 3",
    "A média está entre 3 e 7",
    "A média é maior que a metade de 10",
    "A média não está entre 4 e 6",
  ],

  normal: [
    "A média é menor que 15",
    "A média está entre 10 e 20",
    "A média é maior que 18",
    "A média está entre 5 e 10",
    "A média é maior que 12 e menor que 17",
    "A média está entre 20 e 25",
    "A média é menor que 9",
    "A média é um número par",
    "A média é um número ímpar",
    "A média não está entre 13 e 16",
    "A média está entre 25 e 30",
    "A média é maior que 22",
  ],

  medio: [
    "A média é maior que 30",
    "A média está entre 20 e 35",
    "A média é maior que 40",
    "A média está entre 15 e 25",
    "A média é menor que 18",
    "A média está entre 35 e 45",
    "A média é maior que 25 e menor que 35",
    "A média está entre 10 e 20",
    "A média é um número par",
    "A média é um número ímpar",
    "A média está entre 45 e 50",
    "A média é menor que 12",
    "A média é maior que 42",
  ],

  dificil: [
    "A média está entre 60 e 80",
    "A média é maior que 40 e menor que 60",
    "A média é menor que 50",
    "A média é maior que 75",
    "A média está entre 30 e 50",
    "A média está entre 80 e 95",
    "A média é menor que 25",
    "A média está entre 50 e 70",
    "A média é maior que 85",
    "A média está entre 20 e 40",
    "A média é um número par",
    "A média é um número ímpar",
    "A média está entre 90 e 100",
    "A média é maior que 33 e menor que 66",
    "A média está entre 10 e 30",
  ],

  independentes: [
    "Tente números próximos ao meio do intervalo",
    "A média é a soma dos 4 números dividida por 4",
    "Números redondos são sempre uma boa tentativa",
  ],

  // Custos em pontos por modo
  custos: {
    aprendiz: 1,
    normal: 2,
    medio: 3,
    dificil: 5,
    independentes: 1,
  },

  // Limites de dicas por modo
  limites: {
    aprendiz: 1,
    normal: 2,
    medio: 2,
    dificil: 3,
  },

  // Função para obter dica baseada no modo atual e MÉDIA REAL
  obterDica(
    modoAtual,
    dicasUsadasNaRodada,
    mediaAtual,
    numerosSequencia = null
  ) {
    if (!mediaAtual) return null;

    const modoMap = {
      1: "aprendiz",
      2: "normal",
      3: "medio",
      4: "dificil",
    };

    const modo = modoMap[modoAtual] || "normal";

    // Gerar dicas dinâmicas baseadas na média real
    const dicasDinamicas = this.gerarDicasDinamicas(
      mediaAtual,
      modo,
      numerosSequencia
    );

    // Combinar com dicas independentes (apenas estratégias, não valores específicos)
    const dicasDisponiveis = [...dicasDinamicas, ...this.independentes];

    // Filtrar dicas já usadas na rodada atual
    const dicasNaoUsadas = dicasDisponiveis.filter(
      (dica) => !dicasUsadasNaRodada.includes(dica)
    );

    // Se não há dicas disponíveis, retornar null
    if (dicasNaoUsadas.length === 0) {
      return null;
    }

    // Escolher dica aleatória
    const indiceAleatorio = Math.floor(Math.random() * dicasNaoUsadas.length);
    return dicasNaoUsadas[indiceAleatorio];
  },

  // NOVA FUNÇÃO: Gerar dicas dinâmicas baseadas na média real
  gerarDicasDinamicas(media, modo, numerosSequencia = null) {
    const dicas = [];

    // Definir ranges por modo
    const ranges = {
      aprendiz: { min: 1, max: 10 },
      normal: { min: 1, max: 30 },
      medio: { min: 1, max: 50 },
      dificil: { min: 1, max: 100 },
    };

    const range = ranges[modo];
    const metadeRange = Math.floor((range.max - range.min) / 2) + range.min;

    // 1. Dicas de comparação com números específicos
    if (media > metadeRange) {
      dicas.push(`A média é maior que ${Math.floor(metadeRange)}`);
      dicas.push(`A média é maior que ${Math.floor(media * 0.7)}`);
    } else {
      dicas.push(`A média é menor que ${Math.ceil(metadeRange)}`);
      dicas.push(`A média é menor que ${Math.ceil(media * 1.3)}`);
    }

    // 2. Dicas de faixas
    const faixaInicio = Math.max(range.min, Math.floor(media * 0.8));
    const faixaFim = Math.min(range.max, Math.ceil(media * 1.2));
    if (faixaInicio < faixaFim) {
      dicas.push(`A média está entre ${faixaInicio} e ${faixaFim}`);
    }

    // 3. Dicas de paridade (par/ímpar)
    if (media % 2 === 0) {
      dicas.push("A média é um número par");
    } else {
      dicas.push("A média é um número ímpar");
    }

    // 4. Dicas de proximidade com números redondos
    const numerosRedondos = [
      5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100,
    ];
    const redondoProximo = numerosRedondos.find(
      (num) => Math.abs(num - media) <= 3
    );
    if (redondoProximo) {
      dicas.push(`A média está próxima de ${redondoProximo}`);
    }

    // 5. Dicas de divisibilidade
    if (media % 5 === 0) {
      dicas.push("A média é múltipla de 5");
    }
    if (media % 10 === 0) {
      dicas.push("A média é múltipla de 10");
    }

    // 6. Dicas baseadas na comparação com os números da sequência
    if (numerosSequencia && numerosSequencia.length === 4) {
      const numerosSorted = [...numerosSequencia].sort((a, b) => a - b);
      const menor = numerosSorted[0];
      const maior = numerosSorted[3];
      const meio1 = numerosSorted[1];
      const meio2 = numerosSorted[2];

      // Comparação com menor e maior
      if (media > menor && media < maior) {
        dicas.push(
          `A média está entre o menor (${menor}) e o maior (${maior}) número`
        );
      }

      // Comparação com números do meio
      if (media >= meio1 && media <= meio2) {
        dicas.push(
          `A média está entre os números do meio (${meio1} e ${meio2})`
        );
      }

      // Verificar se é maior/menor que todos
      if (media > maior) {
        dicas.push("A média é maior que todos os números mostrados");
      } else if (media < menor) {
        dicas.push("A média é menor que todos os números mostrados");
      }

      // Verificar se é igual a algum número
      if (numerosSequencia.includes(media)) {
        dicas.push(`A média é igual a um dos números mostrados (${media})`);
      }
    }

    // 7. Dicas de quartis (especialmente para modos mais difíceis)
    if (modo === "dificil") {
      if (media <= 25) {
        dicas.push("A média está no primeiro quartil (1-25)");
      } else if (media <= 50) {
        dicas.push("A média está no segundo quartil (26-50)");
      } else if (media <= 75) {
        dicas.push("A média está no terceiro quartil (51-75)");
      } else {
        dicas.push("A média está no último quartil (76-100)");
      }
    }

    // 8. Dicas de exclusão (não está em determinada faixa)
    const faixaExclusao = this.gerarFaixaExclusao(media, range);
    if (faixaExclusao) {
      dicas.push(faixaExclusao);
    }

    return dicas;
  },

  // Função para gerar dicas de exclusão
  gerarFaixaExclusao(media, range) {
    const opcoesFaixas = [
      { inicio: range.min, fim: Math.floor(range.max * 0.3) },
      { inicio: Math.floor(range.max * 0.3), fim: Math.floor(range.max * 0.6) },
      { inicio: Math.floor(range.max * 0.6), fim: range.max },
    ];

    // Encontrar uma faixa que NÃO contenha a média
    const faixaExclusao = opcoesFaixas.find(
      (faixa) => media < faixa.inicio || media > faixa.fim
    );

    if (faixaExclusao) {
      return `A média não está entre ${faixaExclusao.inicio} e ${faixaExclusao.fim}`;
    }

    return null;
  },

  // Função para calcular custo da dica
  calcularCusto(modoAtual, dica) {
    const modoMap = {
      1: "aprendiz",
      2: "normal",
      3: "medio",
      4: "dificil",
    };

    const modo = modoMap[modoAtual] || "normal";

    // Se é dica independente, custo menor
    if (this.independentes.includes(dica)) {
      return this.custos.independentes;
    }

    // Senão, custo do modo atual
    return this.custos[modo];
  },

  // Verificar se pode usar dica
  podeUsarDica(
    modoAtual,
    pontosAtuais,
    dicasUsadasNaRodada,
    mediaAtual,
    numerosSequencia = null
  ) {
    const modoMap = {
      1: "aprendiz",
      2: "normal",
      3: "medio",
      4: "dificil",
    };

    const modo = modoMap[modoAtual] || "normal";

    // Verificar limite de dicas
    if (dicasUsadasNaRodada.length >= this.limites[modo]) {
      return {
        pode: false,
        motivo: `Limite de ${this.limites[modo]} dica(s) atingido`,
      };
    }

    // Verificar se há dicas disponíveis
    const dicaDisponivel = this.obterDica(
      modoAtual,
      dicasUsadasNaRodada,
      mediaAtual,
      numerosSequencia
    );
    if (!dicaDisponivel) {
      return { pode: false, motivo: "Não há mais dicas disponíveis" };
    }

    // Calcular custo da próxima dica
    const custo = this.calcularCusto(modoAtual, dicaDisponivel);

    // Modo difícil: não pode usar sem pontos
    if (modoAtual === "4" && pontosAtuais < custo) {
      return { pode: false, motivo: `Você precisa de ${custo} pontos` };
    }

    // Outros modos: pode usar mesmo sem pontos
    return { pode: true, custo, dicaDisponivel };
  },
};

// Tornar disponível globalmente
window.DicasSystem = DicasSystem;
