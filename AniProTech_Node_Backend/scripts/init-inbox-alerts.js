import {configuration} from '../src/config.js';
import {openDatabase} from '../src/db.js';
import {initializeInboxAlerts} from '../src/inbox-alert-schema.js';
const db=await openDatabase(configuration());
try{await db.transaction(()=>initializeInboxAlerts(db));console.log('Inbox workflow tables ready; existing records retained.');}finally{await db.close();}
