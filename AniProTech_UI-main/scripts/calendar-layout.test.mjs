import {test} from 'node:test';
import assert from 'node:assert/strict';
import {minutes,positionVisits} from '../src/pages/Clients/ViewClients/Calendar/calendar-layout.js';
const v=(id,startTime,endTime)=>({id,startTime,endTime});
test('Exact clock positions and touching visits use full-width blocks',()=>{
 assert.equal(minutes('00:00'),0);assert.equal(minutes('07:30'),450);assert.equal(minutes('23:59'),1439);
 const result=positionVisits([v('b','08:00','09:00'),v('a','07:00','08:00')]);
 assert.deepEqual(result.map(x=>[x.id,x.start,x.end,x.lane,x.columns]),[['a',420,480,0,1],['b',480,540,0,1]]);
});
test('Nested overlaps and chained overlaps do not obscure one another',()=>{
 const result=positionVisits([v('a','07:00','09:00'),v('b','07:30','08:00'),v('c','08:00','08:30'),v('d','08:15','09:30'),v('e','10:00','11:00')]);
 for(const a of result)for(const b of result)if(a.id!==b.id&&a.start<b.end&&b.start<a.end)assert.notEqual(a.lane,b.lane);
 assert.equal(result.find(x=>x.id==='a').columns,3);assert.equal(result.find(x=>x.id==='e').columns,1);
});
test('Input records are not mutated and empty calendars are supported',()=>{
 const input=[v('a','22:00','23:30')];const before=JSON.stringify(input);positionVisits(input);assert.equal(JSON.stringify(input),before);assert.deepEqual(positionVisits([]),[]);
});
