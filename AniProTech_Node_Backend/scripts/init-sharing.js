import { configuration } from '../src/config.js';
import { openDatabase } from '../src/db.js';
import { initializeSharing } from '../src/share-schema.js';
const db = await openDatabase(configuration());
try {
  await db.transaction(() => initializeSharing(db));
  console.log('Sharing schema ready.');
} finally { await db.close(); }
