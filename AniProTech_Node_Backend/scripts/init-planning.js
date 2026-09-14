import {configuration} from '../src/config.js';
import {openDatabase} from '../src/db.js';
import {initializePlanning} from '../src/planning-schema.js';
const db=await openDatabase(configuration());
try{await initializePlanning(db);console.log('Roster planning tables ready; existing visits retained.');}finally{await db.close();}
