/**
 * Storage utilities for managing game state and configuration in localStorage
 */

const STORAGE_KEYS = {
  CONFIG: 'ichibankuji_config',
  GAME_STATE: 'ichibankuji_gameState',
  ADMIN_PASSWORD: 'ichibankuji_adminPassword',
};

/**
 * Prize Configuration Schema:
 * {
 *   prizes: [
 *     { name: string, initialQuantity: number },
 *     ...
 *   ],
 *   timestamp: number (milliseconds)
 * }
 */

/**
 * Game State Schema:
 * {
 *   quantities: { [prizeName]: number },
 *   records: [
 *     { timestamp: number, prizeName: string, remainingQty: number },
 *     ...
 *   ]
 * }
 */

/**
 * Default configuration for first-time users
 */
const DEFAULT_CONFIG = {
  prizes: [
    { name: 'Gold Prize', initialQuantity: 1 },
    { name: 'Silver Prize', initialQuantity: 3 },
    { name: 'Bronze Prize', initialQuantity: 5 },
    { name: 'Participation Prize', initialQuantity: 10 },
  ],
  timestamp: Date.now(),
};

/**
 * Get the current prize configuration
 * @returns {Object} Configuration object or default if not set
 */
export function getConfig() {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CONFIG);
    return stored ? JSON.parse(stored) : DEFAULT_CONFIG;
  } catch (error) {
    console.error('Error reading config from localStorage:', error);
    return DEFAULT_CONFIG;
  }
}

/**
 * Save prize configuration to localStorage
 * @param {Object} config - Configuration object with prizes array
 * @returns {boolean} Success status
 */
export function setConfig(config) {
  try {
    const configToStore = {
      ...config,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(configToStore));
    return true;
  } catch (error) {
    console.error('Error writing config to localStorage:', error);
    return false;
  }
}

/**
 * Get the current game state (quantities and draw records)
 * @returns {Object} Game state or initialized state if not set
 */
export function getGameState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.GAME_STATE);
    if (stored) {
      return JSON.parse(stored);
    }
    // Initialize from current config
    return initializeGameState();
  } catch (error) {
    console.error('Error reading game state from localStorage:', error);
    return initializeGameState();
  }
}

/**
 * Save game state to localStorage
 * @param {Object} state - Game state object with quantities and records
 * @returns {boolean} Success status
 */
export function setGameState(state) {
  try {
    localStorage.setItem(STORAGE_KEYS.GAME_STATE, JSON.stringify(state));
    return true;
  } catch (error) {
    console.error('Error writing game state to localStorage:', error);
    return false;
  }
}

/**
 * Initialize game state from current configuration
 * @returns {Object} New game state with quantities and empty records
 */
export function initializeGameState() {
  const config = getConfig();
  const quantities = {};
  
  config.prizes.forEach((prize) => {
    quantities[prize.name] = prize.initialQuantity;
  });
  
  return {
    quantities,
    records: [],
  };
}

/**
 * Reset game state for a new round
 * Clears records and resets quantities to initial values
 * @returns {boolean} Success status
 */
export function resetGameState() {
  try {
    const newState = initializeGameState();
    return setGameState(newState);
  } catch (error) {
    console.error('Error resetting game state:', error);
    return false;
  }
}

/**
 * Add a draw record to the current game state
 * @param {string} prizeName - Name of the prize drawn
 * @returns {Object} Updated game state or null on error
 */
export function addDrawRecord(prizeName) {
  try {
    const state = getGameState();
    const currentQty = state.quantities[prizeName];
    
    const record = {
      timestamp: Date.now(),
      prizeName,
      remainingQty: currentQty - 1, // After decrement
    };
    
    state.records.push(record);
    return setGameState(state) ? state : null;
  } catch (error) {
    console.error('Error adding draw record:', error);
    return null;
  }
}

/**
 * Update prize quantity after a draw
 * @param {string} prizeName - Name of the prize to decrement
 * @returns {Object} Updated game state or null on error
 */
export function decrementPrizeQuantity(prizeName) {
  try {
    const state = getGameState();
    if (state.quantities[prizeName] > 0) {
      state.quantities[prizeName]--;
      return setGameState(state) ? state : null;
    }
    return null; // Cannot decrement below 0
  } catch (error) {
    console.error('Error decrementing prize quantity:', error);
    return null;
  }
}

/**
 * Get the total remaining quantity across all prizes
 * @returns {number} Sum of all remaining quantities
 */
export function getTotalRemaining() {
  try {
    const state = getGameState();
    return Object.values(state.quantities).reduce((sum, qty) => sum + qty, 0);
  } catch (error) {
    console.error('Error calculating total remaining:', error);
    return 0;
  }
}

/**
 * Clear all data (for testing/reset purposes)
 * @returns {boolean} Success status
 */
export function clearAllData() {
  try {
    localStorage.removeItem(STORAGE_KEYS.CONFIG);
    localStorage.removeItem(STORAGE_KEYS.GAME_STATE);
    localStorage.removeItem(STORAGE_KEYS.ADMIN_PASSWORD);
    return true;
  } catch (error) {
    console.error('Error clearing data:', error);
    return false;
  }
}

/**
 * Check if localStorage is available
 * @returns {boolean} True if localStorage is available and working
 */
export function isLocalStorageAvailable() {
  try {
    const test = '__test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}
