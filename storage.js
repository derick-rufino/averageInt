// ========== LOCALSTORAGE PERSISTENCE SYSTEM ==========

/**
 * Sistema de persistência para AverageInt usando localStorage
 * Implementa armazenamento de rankings, configurações e estatísticas
 */

const StorageSystem = {
  // Chaves de armazenamento
  STORAGE_KEYS: {
    RANKINGS: 'averageint_rankings',
    SETTINGS: 'averageint_settings', 
    STATISTICS: 'averageint_statistics'
  },

  // Estrutura padrão dos dados
  getDefaultData() {
    return {
      rankings: {
        general: [],
        timed: []
      },
      gameSettings: {
        currentMode: "2", // Normal por padrão
        soundEnabled: true,
        lastPlayed: null
      },
      statistics: {
        totalGames: 0,
        totalPoints: 0,
        averageScore: 0,
        bestStreak: 0,
        currentStreak: 0,
        gamesPerMode: {
          "1": 0, // Aprendiz
          "2": 0, // Normal
          "3": 0, // Médio
          "4": 0  // Difícil
        }
      }
    };
  },

  // ========== FUNÇÕES DE WRAPPER PARA LOCALSTORAGE ==========

  /**
   * Verifica se localStorage está disponível
   */
  isStorageAvailable() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      console.warn('[Storage] localStorage não disponível:', e);
      return false;
    }
  },

  /**
   * Salva dados no localStorage com tratamento de erro
   */
  setItem(key, data) {
    try {
      if (!this.isStorageAvailable()) {
        console.warn('[Storage] localStorage indisponível, dados não salvos');
        return false;
      }

      const serializedData = JSON.stringify(data);
      localStorage.setItem(key, serializedData);
      return true;
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.error('[Storage] Cota de armazenamento excedida:', error);
        this.handleStorageQuotaExceeded();
      } else {
        console.error('[Storage] Erro ao salvar dados:', error);
      }
      return false;
    }
  },

  /**
   * Recupera dados do localStorage com tratamento de erro
   */
  getItem(key, defaultValue = null) {
    try {
      if (!this.isStorageAvailable()) {
        console.warn('[Storage] localStorage indisponível, usando dados padrão');
        return defaultValue;
      }

      const item = localStorage.getItem(key);
      if (item === null) {
        return defaultValue;
      }

      return JSON.parse(item);
    } catch (error) {
      console.warn('[Storage] Dados corrompidos detectados, resetando:', error);
      this.removeItem(key);
      return defaultValue;
    }
  },

  /**
   * Remove item do localStorage
   */
  removeItem(key) {
    try {
      if (this.isStorageAvailable()) {
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.error('[Storage] Erro ao remover item:', error);
    }
  },

  /**
   * Limpa todos os dados do jogo
   */
  clearAllData() {
    Object.values(this.STORAGE_KEYS).forEach(key => {
      this.removeItem(key);
    });
  },

  /**
   * Trata erro de cota excedida tentando limpar dados antigos
   */
  handleStorageQuotaExceeded() {
    try {
      // Tentar limpar dados mais antigos dos rankings
      const rankings = this.getRankings();
      
      // Manter apenas top 10 em cada categoria
      if (rankings.general.length > 10) {
        rankings.general = rankings.general.slice(0, 10);
      }
      if (rankings.timed.length > 10) {
        rankings.timed = rankings.timed.slice(0, 10);
      }

      this.saveRankings(rankings);
      console.info('[Storage] Dados antigos removidos para liberar espaço');
    } catch (error) {
      console.error('[Storage] Falha ao limpar dados antigos:', error);
    }
  },

  // ========== FUNÇÕES ESPECÍFICAS PARA RANKINGS ==========

  /**
   * Carrega rankings do localStorage
   */
  getRankings() {
    const defaultRankings = this.getDefaultData().rankings;
    return this.getItem(this.STORAGE_KEYS.RANKINGS, defaultRankings);
  },

  /**
   * Salva rankings no localStorage
   */
  saveRankings(rankings) {
    return this.setItem(this.STORAGE_KEYS.RANKINGS, rankings);
  },

  /**
   * Adiciona nova pontuação aos rankings
   */
  addScore(points, mode, time = null) {
    try {
      const rankings = this.getRankings();
      const now = new Date().toISOString();
      
      const scoreEntry = {
        id: this.generateUUID(),
        points: points,
        date: now,
        mode: mode
      };

      // Se tem tempo, é para o ranking cronometrado
      if (time !== null) {
        scoreEntry.time = time;
        rankings.timed.push(scoreEntry);
        // Ordenar por pontos (desc) e depois por tempo (asc)
        rankings.timed.sort((a, b) => {
          if (b.points !== a.points) {
            return b.points - a.points;
          }
          return this.compareTimeStrings(a.time, b.time);
        });
        // Manter apenas top 20
        rankings.timed = rankings.timed.slice(0, 20);
      } else {
        rankings.general.push(scoreEntry);
        // Ordenar por pontos (desc)
        rankings.general.sort((a, b) => b.points - a.points);
        // Manter apenas top 20
        rankings.general = rankings.general.slice(0, 20);
      }

      this.saveRankings(rankings);
      return true;
    } catch (error) {
      console.error('[Storage] Erro ao adicionar pontuação:', error);
      return false;
    }
  },

  /**
   * Compara strings de tempo no formato MM:SS
   */
  compareTimeStrings(timeA, timeB) {
    const [minA, secA] = timeA.split(':').map(Number);
    const [minB, secB] = timeB.split(':').map(Number);
    
    const totalA = minA * 60 + secA;
    const totalB = minB * 60 + secB;
    
    return totalA - totalB;
  },

  // ========== FUNÇÕES ESPECÍFICAS PARA CONFIGURAÇÕES ==========

  /**
   * Carrega configurações do localStorage
   */
  getSettings() {
    const defaultSettings = this.getDefaultData().gameSettings;
    return this.getItem(this.STORAGE_KEYS.SETTINGS, defaultSettings);
  },

  /**
   * Salva configurações no localStorage
   */
  saveSettings(settings) {
    return this.setItem(this.STORAGE_KEYS.SETTINGS, settings);
  },

  /**
   * Atualiza uma configuração específica
   */
  updateSetting(key, value) {
    const settings = this.getSettings();
    settings[key] = value;
    return this.saveSettings(settings);
  },

  // ========== FUNÇÕES ESPECÍFICAS PARA ESTATÍSTICAS ==========

  /**
   * Carrega estatísticas do localStorage
   */
  getStatistics() {
    const defaultStats = this.getDefaultData().statistics;
    return this.getItem(this.STORAGE_KEYS.STATISTICS, defaultStats);
  },

  /**
   * Salva estatísticas no localStorage
   */
  saveStatistics(stats) {
    return this.setItem(this.STORAGE_KEYS.STATISTICS, stats);
  },

  /**
   * Atualiza estatísticas após um jogo
   */
  updateGameStatistics(points, mode, wasCorrect) {
    try {
      const stats = this.getStatistics();
      
      stats.totalGames++;
      stats.gamesPerMode[mode] = (stats.gamesPerMode[mode] || 0) + 1;
      
      if (wasCorrect) {
        stats.totalPoints += points;
        stats.currentStreak++;
        stats.bestStreak = Math.max(stats.bestStreak, stats.currentStreak);
      } else {
        stats.currentStreak = 0;
      }
      
      // Recalcular média
      stats.averageScore = stats.totalGames > 0 ? 
        Math.round(stats.totalPoints / stats.totalGames) : 0;
      
      this.saveStatistics(stats);
      return stats;
    } catch (error) {
      console.error('[Storage] Erro ao atualizar estatísticas:', error);
      return this.getStatistics();
    }
  },

  // ========== FUNÇÕES UTILITÁRIAS ==========

  /**
   * Gera UUID simples para identificação de entradas
   */
  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  },

  /**
   * Formata tempo em segundos para MM:SS
   */
  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  },

  /**
   * Inicializa o sistema de storage (chamado no carregamento da página)
   */
  initialize() {
    console.info('[Storage] Inicializando sistema de persistência...');
    
    if (!this.isStorageAvailable()) {
      console.warn('[Storage] localStorage não disponível - modo offline limitado');
      return false;
    }

    // Verificar se dados existem, senão criar estrutura padrão
    if (!this.getItem(this.STORAGE_KEYS.RANKINGS)) {
      this.saveRankings(this.getDefaultData().rankings);
    }
    
    if (!this.getItem(this.STORAGE_KEYS.SETTINGS)) {
      this.saveSettings(this.getDefaultData().gameSettings);
    }
    
    if (!this.getItem(this.STORAGE_KEYS.STATISTICS)) {
      this.saveStatistics(this.getDefaultData().statistics);
    }

    console.info('[Storage] Sistema de persistência inicializado com sucesso');
    return true;
  },

  /**
   * Exporta todos os dados para backup (formato JSON)
   */
  exportData() {
    return {
      rankings: this.getRankings(),
      settings: this.getSettings(),
      statistics: this.getStatistics(),
      exportDate: new Date().toISOString()
    };
  },

  /**
   * Importa dados de backup
   */
  importData(data) {
    try {
      if (data.rankings) this.saveRankings(data.rankings);
      if (data.settings) this.saveSettings(data.settings);
      if (data.statistics) this.saveStatistics(data.statistics);
      return true;
    } catch (error) {
      console.error('[Storage] Erro ao importar dados:', error);
      return false;
    }
  }
};

// Tornar disponível globalmente
window.StorageSystem = StorageSystem;

// Auto-inicializar quando o script for carregado
document.addEventListener('DOMContentLoaded', () => {
  StorageSystem.initialize();
});