/**
 * Storage utilities for managing game state and configuration in localStorage
 *
 * Schema v3 (sub-prizes for D/E/F):
 *
 * Config (`ichibankuji_config`):
 * {
 *   version: 3,
 *   grades: [ { grade: 'A'|'B'|'C'|'D'|'E'|'F', name: string, quantity: number,
 *               subPrizes: [ { name: string, quantity: number } ] }, x6 ],
 *   lastOne: { name: string },
 *   timestamp: number
 * }
 * `subPrizes` may only be non-empty on D/E/F; its quantities must sum exactly
 * to the grade's quantity (validateConfig enforces both).
 *
 * Game state (`ichibankuji_gameState`):
 * {
 *   version: 3,
 *   tickets: [ { id: string, grade: string, drawn: boolean, drawnAt: number|null } ],
 *   subPrizes: { D?: [...], E?: [...], F?: [...] },   // round-start snapshot
 *   records: [ { timestamp, ticketId, grade, prizeName, subPrizeName?: string, lastOne?: true } ]
 * }
 *
 * The `tickets` array order IS the shuffled pool order — fixed at round start,
 * never re-shuffled outside of a round reset. `subPrizes` is the variant
 * snapshot taken at round start: mid-round config edits never change the
 * running round's stock. Variant remaining stock is DERIVED (snapshot
 * quantity minus selections in records), never stored as a counter.
 */

const STORAGE_KEYS = {
  CONFIG: 'ichibankuji_config',
  GAME_STATE: 'ichibankuji_gameState',
  MIGRATION_NOTICE: 'ichibankuji_migrationNotice',
};

export const SCHEMA_VERSION = 3;
export const GRADES = ['A', 'B', 'C', 'D', 'E', 'F'];
export const GOLD_GRADES = ['A', 'B', 'C'];
export const SUB_PRIZE_GRADES = ['D', 'E', 'F'];
export const MAX_TOTAL_TICKETS = 200;
export const MULTI_DRAW_COUNT = 5;

const DEFAULT_CONFIG = {
  version: SCHEMA_VERSION,
  grades: [
    { grade: 'A', name: '豪華模型 Premium Figure', quantity: 1, subPrizes: [] },
    { grade: 'B', name: '絨毛娃娃 Plush Doll', quantity: 2, subPrizes: [] },
    { grade: 'C', name: '插畫色紙 Art Board', quantity: 3, subPrizes: [] },
    { grade: 'D', name: '玻璃杯 Glass Cup', quantity: 6, subPrizes: [] },
    { grade: 'E', name: '造型毛巾 Towel', quantity: 8, subPrizes: [] },
    { grade: 'F', name: '壓克力吊飾 Acrylic Charm', quantity: 10, subPrizes: [] },
  ],
  lastOne: { name: '特別色模型 Last One Special Figure' },
  timestamp: 0,
};

function isV3Config(config) {
  return (
    config &&
    config.version === SCHEMA_VERSION &&
    Array.isArray(config.grades) &&
    config.lastOne &&
    typeof config.lastOne.name === 'string'
  );
}

function isV2Config(config) {
  return (
    config &&
    config.version === 2 &&
    Array.isArray(config.grades) &&
    config.lastOne &&
    typeof config.lastOne.name === 'string'
  );
}

function isV3GameState(state) {
  return (
    state &&
    state.version === SCHEMA_VERSION &&
    Array.isArray(state.tickets) &&
    Array.isArray(state.records) &&
    typeof state.subPrizes === 'object' &&
    state.subPrizes !== null
  );
}

function isV2GameState(state) {
  return (
    state &&
    state.version === 2 &&
    Array.isArray(state.tickets) &&
    Array.isArray(state.records)
  );
}

// Lossless v2→v3: v2 had no sub-prizes, so grades gain empty variant lists
// and the running round gains an empty snapshot. Nothing is reset.
function upgradeV2Config(config) {
  return {
    ...config,
    version: SCHEMA_VERSION,
    grades: config.grades.map((g) => ({ ...g, subPrizes: [] })),
  };
}

function upgradeV2GameState(state) {
  return { ...state, version: SCHEMA_VERSION, subPrizes: {} };
}

function buildDefaultConfig() {
  return {
    ...DEFAULT_CONFIG,
    grades: DEFAULT_CONFIG.grades.map((g) => ({ ...g, subPrizes: g.subPrizes.map((s) => ({ ...s })) })),
    lastOne: { ...DEFAULT_CONFIG.lastOne },
    timestamp: Date.now(),
  };
}

/**
 * Get the current prize configuration.
 * v2 data is upgraded to v3 losslessly and silently; v1 or malformed data
 * is replaced by the default A–F configuration with a one-time notice flag.
 * @returns {Object} v3 configuration object
 */
export function getConfig() {
  let stored = null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONFIG);
    stored = raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error('Error reading config from localStorage:', error);
  }

  if (isV3Config(stored)) {
    return stored;
  }

  if (isV2Config(stored)) {
    const upgraded = upgradeV2Config(stored);
    try {
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(upgraded));
    } catch (error) {
      console.error('Error writing upgraded config to localStorage:', error);
    }
    return upgraded;
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
      grades: config.grades.map((g) => ({
        ...g,
        subPrizes: Array.isArray(g.subPrizes) ? g.subPrizes : [],
      })),
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
 * @param {Object} config - v3 configuration
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
 * Snapshot the configured D/E/F sub-prize variants for a new round.
 * Only grades with at least one variant get an entry.
 */
function snapshotSubPrizes(config) {
  const snapshot = {};
  config.grades.forEach((g) => {
    if (
      SUB_PRIZE_GRADES.includes(g.grade) &&
      Array.isArray(g.subPrizes) &&
      g.subPrizes.length > 0
    ) {
      snapshot[g.grade] = g.subPrizes.map((s) => ({ ...s }));
    }
  });
  return snapshot;
}

/**
 * Initialize a fresh game state (new shuffled pool, sub-prize snapshot,
 * empty history) from the current configuration. Does not persist.
 */
export function initializeGameState() {
  const config = getConfig();
  return {
    version: SCHEMA_VERSION,
    tickets: generateTicketPool(config),
    subPrizes: snapshotSubPrizes(config),
    records: [],
  };
}

/**
 * Get the current game state. v2 state is upgraded losslessly; v1 or
 * malformed data is reinitialized from the (already migrated) configuration.
 * @returns {Object} v3 game state
 */
export function getGameState() {
  let stored = null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GAME_STATE);
    stored = raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error('Error reading game state from localStorage:', error);
  }

  if (isV3GameState(stored)) {
    return stored;
  }

  if (isV2GameState(stored)) {
    const upgraded = upgradeV2GameState(stored);
    setGameState(upgraded);
    return upgraded;
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
 * from the latest applied configuration, re-snapshot sub-prizes, clear
 * all records (which also clears every selection and pending selection).
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
 * Whether a grade has sub-prize variants in the round snapshot.
 */
export function gradeHasSubPrizes(state, grade) {
  return Array.isArray(state.subPrizes?.[grade]) && state.subPrizes[grade].length > 0;
}

/**
 * Per-variant stock for a grade, derived from the round snapshot and the
 * selections recorded so far. No stored counters.
 * @returns {Array} [{ name, total, remaining }]
 */
export function getSubPrizeStock(state, grade) {
  const variants = state.subPrizes?.[grade] || [];
  const chosenCounts = {};
  state.records.forEach((r) => {
    if (r.grade === grade && r.subPrizeName) {
      chosenCounts[r.subPrizeName] = (chosenCounts[r.subPrizeName] || 0) + 1;
    }
  });
  return variants.map((v) => ({
    name: v.name,
    total: v.quantity,
    remaining: v.quantity - (chosenCounts[v.name] || 0),
  }));
}

/**
 * Committed draws of sub-prized grades that have no variant choice yet,
 * in record (draw) order. Derived — survives reloads by construction.
 * @returns {Array} pending records [{ timestamp, ticketId, grade, prizeName, ... }]
 */
export function getPendingSelections(state) {
  return state.records.filter((r) => gradeHasSubPrizes(state, r.grade) && !r.subPrizeName);
}

/**
 * Claim a sub-prize variant for a committed draw. The choice is the
 * player's — never randomized here. Writes `subPrizeName` onto the draw's
 * record in a single localStorage write.
 *
 * @param {string} ticketId - the draw's ticket id
 * @param {string} variantName - variant to claim (must have stock left)
 * @returns {Object|null} updated state, or null if the claim is invalid
 */
export function selectSubPrize(ticketId, variantName) {
  try {
    const state = getGameState();
    const record = state.records.find((r) => r.ticketId === ticketId);
    if (!record) {
      console.error(`Cannot select sub-prize: no record for ticket ${ticketId}`);
      return null;
    }
    if (!gradeHasSubPrizes(state, record.grade)) {
      console.error(`Cannot select sub-prize: grade ${record.grade} has no variants`);
      return null;
    }
    if (record.subPrizeName) {
      console.error(`Cannot select sub-prize: ticket ${ticketId} already claimed ${record.subPrizeName}`);
      return null;
    }
    const stock = getSubPrizeStock(state, record.grade).find((v) => v.name === variantName);
    if (!stock) {
      console.error(`Cannot select sub-prize: variant ${variantName} not in ${record.grade} snapshot`);
      return null;
    }
    if (stock.remaining <= 0) {
      console.error(`Cannot select sub-prize: variant ${variantName} is out of stock`);
      return null;
    }

    record.subPrizeName = variantName;
    if (!setGameState(state)) {
      return null;
    }
    return state;
  } catch (error) {
    console.error('Error selecting sub-prize:', error);
    return null;
  }
}

/**
 * Draw one or more specific tickets atomically.
 * All tickets are marked drawn, all records appended, and the state is
 * persisted in a single localStorage write — a 5連抽 either fully commits
 * or not at all. The draw that takes the pool's final ticket additionally
 * wins the Last One prize (record flagged `lastOne: true`).
 *
 * The draw decides only the grade: results carry `hasSubPrizes` so the UI
 * can chain into the variant picker, but no variant is assigned here.
 *
 * @param {string[]} ticketIds - ids of undrawn tickets, in pick order
 * @returns {{ state: Object, results: Array }|null}
 *   results: [{ ticketId, grade, prizeName, hasSubPrizes, lastOne, lastOnePrizeName }]
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
        hasSubPrizes: gradeHasSubPrizes(state, ticket.grade),
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
 * Sub-prize rules: variants are all-or-nothing per D/E/F grade — when any
 * variant rows exist, every row needs a non-empty unique name and an
 * integer quantity ≥ 1, and the variant total must equal the grade's
 * quantity exactly (so stock can never run out before the wins do).
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

    const subs = Array.isArray(g.subPrizes) ? g.subPrizes : [];
    if (subs.length === 0) return;

    if (!SUB_PRIZE_GRADES.includes(g.grade)) {
      errors[`grade_${g.grade}_subPrizes`] = 'Sub-prizes are only allowed on D賞–F賞';
      return;
    }
    if (Number.isInteger(qty) && qty === 0) {
      errors[`grade_${g.grade}_subPrizes`] = 'A grade with quantity 0 cannot have sub-prizes';
      return;
    }

    let subTotal = 0;
    let subQuantitiesValid = true;
    const seenNames = new Set();
    subs.forEach((sp, i) => {
      const name = sp.name ? sp.name.trim() : '';
      if (name === '') {
        errors[`grade_${g.grade}_sub_${i}_name`] = 'Variant name is required';
      } else if (seenNames.has(name)) {
        errors[`grade_${g.grade}_sub_${i}_name`] = 'Variant names must be unique';
      } else {
        seenNames.add(name);
      }
      if (!Number.isInteger(sp.quantity) || sp.quantity < 1) {
        errors[`grade_${g.grade}_sub_${i}_quantity`] = 'Variant quantity must be an integer ≥ 1';
        subQuantitiesValid = false;
      } else {
        subTotal += sp.quantity;
      }
    });

    if (subQuantitiesValid && Number.isInteger(qty) && qty > 0 && subTotal !== qty) {
      errors[`grade_${g.grade}_subPrizes`] =
        `Variant total (${subTotal}) must equal ${g.grade}賞 quantity (${qty})`;
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
