// HypothesisOS — server store.
// Delegates to the SQLite adapter (persistent). The interface is unchanged so all
// API routes work without modification. Data survives restarts when HYPOS_DB points
// to a volume path (Railway: set env var HYPOS_DB=/data/hypothesisos.db).
export { store, newId } from "./sqlite-store";
