/**
 * Storage utilities for managing game state and configuration in localStorage
 *
 * Schema v2 (realistic kuji experience):
 *
 * Config (`ichibankuji_config`):
 * {
 *   version: 2,
 *   grades: [ { grade: 'A'|'B'|'C'|'D'|'E'|'F', name: string, quantity: number }, x6 ],
 *   lastOne: { name: string },
 *   timestamp: number
 * }
 *
 * Game state (`ichibankuji_gameState`):
 * {
 *   version: 2,
 *   tickets: [ { id: string, grade: string, drawn: boolean, drawnAt: number|null } ],
 *   records: [ { timestamp, ticketId, grade, prizeName, lastOne?: true } ]
 * }
 *
 * The `tickets` array order IS the shuffled pool order — fixed at round start,
 * never re-shuffled outside of a round reset.
 */

const STORAGE_KEYS = {
  CONFIG: 'ichibankuji_config',
  GAME_STATE: 'ichibankuji_gameState',
  MIGRATION_NOTICE: 'ichibankuji_migrationNotice',
};

export const SCHEMA_VERSION = 2;
export const GRADES = ['A', 'B', 'C', 'D', 'E', 'F'];
export const GOLD_GRADES = ['A', 'B', 'C'];
export const MAX_TOTAL_TICKETS = 200;
export const MULTI_DRAW_COUNT = 5;

const DEFAULT_CONFIG = {
  version: SCHEMA_VERSION,
  grades: [
    { grade: 'A', name: '豪華模型 Premium Figure', quantity: 1 },
    { grade: 'B', name: '絨毛娃娃 Plush Doll', quantity: 2 },
    { grade: 'C', name: '插畫色紙 Art Board', quantity: 3 },
    { grade: 'D', name: '玻璃杯 Glass Cup', quantity: 6 },
    { grade: 'E', name: '造型毛巾 Towel', quantity: 8 },
    { grade: 'F', name: '壓克力吊飾 Acrylic Charm', quantity: 10 },
  ],
  lastOne: { name: '特別色模型 Last One Special Figure' },
  timestamp: 0,
};

function isV2Config(config) {
  return (
    config &&
    config.version === SCHEMA_VERSION &&
    Array.isArray(config.grades) &&
    config.lastOne &&
    typeof config.lastOne.name === 'string'
  );
}

function isV2GameState(state) {
  return (
    state &&
    state.version === SCHEMA_VERSION &&
    Array.isArray(state.tickets) &&
    Array.isArray(state.records)
  );
}

function buildDefaultConfig() {
  return {
    ...DEFAULT_CONFIG,
    grades: DEFAULT_CONFIG.grades.map((g) => ({ ...g })),
    lastOne: { ...DEFAULT_CONFIG.lastOne },
    timestamp: Date.now(),
  };
}

/**
 * Get the current prize configuration.
 * v1 or malformed data is replaced by the default A–F configuration,
 * and a one-time migration notice flag is set.
 * @returns {Object} v2 configuration object
 */
export function getConfig() {
  let stored = null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONFIG);
    stored = raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error('Error reading config from localStorage:', error);
  }

  if (isV2Config(stored)) {
    return stored;
  }

  const fresh = buildDefaultConfig();
  try {
    if (stored !== null) {
      // v1 (or corrupt) data found — reinitialize and flag the one-time notice
      localStorage.setItem(STORAGE_KEYS.MIGRATION_NOTICE, '1');
      localStorage.removeItem(STORAGE_KEYS.GAME_STATE);
    }
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(fresh));
  } catch (error) {
    console.error('Error writing config to localStorage:', error);
  }
  return fresh;
}

/**
 * Save prize configuration to localStorage (applies from the next round)
 * @param {Object} config - { grades, lastOne }
 * @returns {boolean} Success status
 */
export function setConfig(config) {
  try {
    const configToStore = {
      version: SCHEMA_VERSION,
      grades: config.grades,
      lastOne: config.lastOne,
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
 * Consume the one-time migration notice.
 * @returns {boolean} True if old data was reset since the last check
 */
export function consumeMigrationNotice() {
  try {
    if (localStorage.getItem(STORAGE_KEYS.MIGRATION_NOTICE)) {
      localStorage.removeItem(STORAGE_KEYS.MIGRATION_NOTICE);
      return true;
    }
  } catch (error) {
    console.error('Error reading migration notice:', error);
  }
  return false;
}

/**
 * Expand the grade configuration into a flat ticket pool and shuffle it
 * (Fisher–Yates). Ticket outcomes are sealed here — exactly like filling
 * a real kuji box. Ids are assigned by pool position after shuffling.
 * @param {Object} config - v2 configuration
 * @returns {Array} Shuffled tickets [{ id, grade, drawn, drawnAt }]
 */
export function generateTicketPool(config) {
  const tickets = [];
  config.grades.forEach((g) => {
    for (let i = 0; i < g.quantity; i++) {
      tickets.push({ grade: g.grade });
    }
  });

  for (let i = tickets.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tickets[i], tickets[j]] = [tickets[j], tickets[i]];
  }

  return tickets.map((t, index) => ({
    id: `T${String(index + 1).padStart(3, '0')}`,
    grade: t.grade,
    drawn: false,
    drawnAt: null,
  }));
}

/**
 * Initialize a fresh game state (new shuffled pool, empty history)
 * from the current configuration. Does not persist.
 */
export function initializeGameState() {
  const config = getConfig();
  return {
    version: SCHEMA_VERSION,
    tickets: generateTicketPool(config),
    records: [],
  };
}

/**
 * Get the current game state. v1 or malformed data is reinitialized
 * from the (already migrated) configuration.
 * @returns {Object} v2 game state
 */
export function getGameState() {
  let stored = null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GAME_STATE);
    stored = raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error('Error reading game state from localStorage:', error);
  }

  if (isV2GameState(stored)) {
    return stored;
  }

  if (stored !== null) {
    try {
      localStorage.setItem(STORAGE_KEYS.MIGRATION_NOTICE, '1');
    } catch (error) {
      console.error('Error writing migration notice:', error);
    }
  }

  const fresh = initializeGameState();
  setGameState(fresh);
  return fresh;
}

/**
 * Save game state to localStorage
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
 * Reset game state for a new round: regenerate and reshuffle the pool
 * from the latest applied configuration, clear all records.
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
 * Draw one or more specific tickets atomically.
 * All tickets are marked drawn, all records appended, and the state is
 * persisted in a single localStorage write — a 5連抽 either fully commits
 * or not at all. The draw that takes the pool's final ticket additionally
 * wins the Last One prize (record flagged `lastOne: true`).
 *
 * @param {string[]} ticketIds - ids of undrawn tickets, in pick order
 * @returns {{ state: Object, results: Array }|null}
 *   results: [{ ticketId, grade, prizeName, lastOne, lastOnePrizeName }]
 */
export function drawTickets(ticketIds) {
  try {
    const config = getConfig();
    const state = getGameState();
    const prizeNameByGrade = {};
    config.grades.forEach((g) => {
      prizeNameByGrade[g.grade] = g.name;
    });

    const ticketById = {};
    state.tickets.forEach((t) => {
      ticketById[t.id] = t;
    });

    // Validate the whole batch before touching anything
    for (const id of ticketIds) {
      const ticket = ticketById[id];
      if (!ticket || ticket.drawn) {
        console.error(`Cannot draw ticket ${id}: not found or already drawn`);
        return null;
      }
    }

    let remaining = state.tickets.filter((t) => !t.drawn).length;
    const results = [];
    const now = Date.now();

    ticketIds.forEach((id, index) => {
      const ticket = ticketById[id];
      ticket.drawn = true;
      ticket.drawnAt = now + index; // preserve pick order in timestamps
      remaining--;

      const isLastOne = remaining === 0;
      const record = {
        timestamp: ticket.drawnAt,
        ticketId: ticket.id,
        grade: ticket.grade,
        prizeName: prizeNameByGrade[ticket.grade] || '',
      };
      if (isLastOne) {
        record.lastOne = true;
      }
      state.records.push(record);

      results.push({
        ticketId: ticket.id,
        grade: ticket.grade,
        prizeName: record.prizeName,
        lastOne: isLastOne,
        lastOnePrizeName: isLastOne ? config.lastOne.name : null,
      });
    });

    if (!setGameState(state)) {
      return null;
    }
    return { state, results };
  } catch (error) {
    console.error('Error drawing tickets:', error);
    return null;
  }
}

/**
 * Get the number of undrawn tickets
 */
export function getTotalRemaining(state) {
  try {
    const gameState = state || getGameState();
    return gameState.tickets.filter((t) => !t.drawn).length;
  } catch (error) {
    console.error('Error calculating total remaining:', error);
    return 0;
  }
}

/**
 * Per-grade drawn counts, derived from the ticket pool
 * @returns {Object} { A: number, ..., F: number }
 */
export function getDrawnCountByGrade(state) {
  const counts = {};
  GRADES.forEach((g) => {
    counts[g] = 0;
  });
  state.tickets.forEach((t) => {
    if (t.drawn) counts[t.grade]++;
  });
  return counts;
}

/**
 * Validate a configuration draft (admin editor).
 * @param {Object} config - { grades, lastOne }
 * @returns {Object} map of field errors, empty when valid
 */
export function validateConfig(config) {
  const errors = {};
  let total = 0;

  config.grades.forEach((g) => {
    const qty = g.quantity;
    if (!Number.isInteger(qty) || qty < 0) {
      errors[`grade_${g.grade}_quantity`] = 'Quantity must be an integer ≥ 0';
    } else {
      total += qty;
    }
    if (qty > 0 && (!g.name || g.name.trim() === '')) {
      errors[`grade_${g.grade}_name`] = 'Prize name is required when quantity > 0';
    }
  });

  if (total < 1) {
    errors.general = 'At least one ticket is required (total quantity ≥ 1)';
  } else if (total > MAX_TOTAL_TICKETS) {
    errors.general = `Total tickets must be at most ${MAX_TOTAL_TICKETS}`;
  }

  if (!config.lastOne || !config.lastOne.name || config.lastOne.name.trim() === '') {
    errors.lastOne_name = 'Last One prize name is required';
  }

  return errors;
}

/**
 * Clear all data (for testing/reset purposes)
 * @returns {boolean} Success status
 */
export function clearAllData() {
  try {
    localStorage.removeItem(STORAGE_KEYS.CONFIG);
    localStorage.removeItem(STORAGE_KEYS.GAME_STATE);
    localStorage.removeItem(STORAGE_KEYS.MIGRATION_NOTICE);
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
