import test from "node:test";
import assert from "node:assert/strict";
import { replayOwnedQueue } from "../src/offlineQueue.js";

const item=(id,ownerId)=>({id,ownerId,path:`/${id}`,body:{clientEventId:id},label:id,queuedAt:"2026-09-17T00:00:00.000Z",attempts:0,lastError:""});

test("a restarted app replays only the signed-in caregiver records in their original order",async()=>{
  const delivered=[];
  const result=await replayOwnedQueue([item("a","carer-1"),item("x","carer-2"),item("b","carer-1")],"carer-1",async(value)=>delivered.push(value.id),()=>"");
  assert.deepEqual(delivered,["a","b"]);
  assert.deepEqual(result.remaining.map(value=>value.id),["x"]);
  assert.equal(result.sent,2);
});

test("a rejected or disconnected replay stops before later care records and retains them",async()=>{
  const delivered=[];
  const result=await replayOwnedQueue([item("a","carer-1"),item("b","carer-1"),item("c","carer-1")],"carer-1",async(value)=>{delivered.push(value.id);if(value.id==="b")throw new Error("conflict")},error=>error.message);
  assert.deepEqual(delivered,["a","b"]);
  assert.equal(result.sent,1);
  assert.deepEqual(result.remaining.map(value=>value.id),["b","c"]);
  assert.equal(result.remaining[0].attempts,1);
  assert.equal(result.remaining[0].lastError,"conflict");
});
