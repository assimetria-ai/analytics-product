// Wrapper: delegate to the canonical migration runner one directory up.
// start.js (in this @system dir) and index.js both expect run.js here,
// but the actual runner lives at db/migrations/run.js.
require('../run.js')
