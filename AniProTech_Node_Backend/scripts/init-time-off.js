import {configuration} from '../src/config.js';
import {openDatabase} from '../src/db.js';
import {initializeTimeOff} from '../src/time-off-schema.js';
const db=await openDatabase(configuration());
try{await initializeTimeOff(db);console.log('Holiday year table ready.');}finally{await db.close();}
