import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import request from "supertest";
import { openDatabase, initializeSchema } from "../src/db.js";
import { createApp } from "../src/app.js";

test("Accounting contacts and catalogue remain within the user's organisation", async () => {
  const db = await openDatabase({ driver: "pglite", dataDir: ":memory:" });
  try {
    await initializeSchema(db);
    const sent = [];
    const app = createApp({ db, config: {
      production: false, jwtSecret: "accounting-test-secret-at-least-32-characters",
      frontendUrl: "http://localhost:5173", corsOrigins: [], uploadDir: "./test-uploads",
    }, mail: { send: async (message) => sent.push(message) } });
    const { repo, auth } = app.locals.ctx;
    const agencyA = randomUUID(), agencyB = randomUUID();
    async function makeUser(name, role, agencyId) {
      return repo.save("UserEntity", { firstName: name, lastName: "Test", email: `${name}@accounting.test`, role, isActive: true, agencyId });
    }
    async function login(user) {
      await auth.requestLink(user.email);
      const url = sent.at(-1).text.match(/http[^\s]+/)[0];
      const [email, password] = Buffer.from(new URL(url).searchParams.get("token"), "base64url").toString().split(":");
      return (await auth.exchange(email,password)).accessToken;
    }
    const adminA = await makeUser("adminA","ADMIN",agencyA), adminB = await makeUser("adminB","SUPERADMIN",agencyB),
      carer = await makeUser("carerA","CAREGIVER",agencyA),
      clientA = await makeUser("clientA","USER",agencyA), clientB = await makeUser("clientB","USER",agencyB);
    const tokenA = await login(adminA), tokenB = await login(adminB), carerToken = await login(carer);
    const call = (method,path,body,token=tokenA) => request(app)[method](path).set("Authorization",`Bearer ${token}`).send(body);
    const contactBody = { displayName: "Local authority", role: "CUSTOMER", email: "" };
    const contact = await call("post","/api/accounting/contacts",contactBody);
    assert.equal(contact.status,201);
    const contactId = contact.body.results.data.id;
    assert.equal((await call("get","/api/accounting/contacts",undefined,tokenB)).body.results.data.length,0);
    assert.equal((await call("put",`/api/accounting/contacts/${contactId}`,contactBody,tokenB)).status,404);
    assert.equal((await call("post",`/api/accounting/contacts/${contactId}/archive`,{},tokenB)).status,404);
    assert.equal((await call("get","/api/accounting/contacts",undefined,carerToken)).status,403);
    assert.equal((await call("post","/api/accounting/contacts",contactBody)).status,409);
    const item = await call("post","/api/accounting/items",{ name: "Care visit", unit: "hour", unitPricePence: 2150 });
    assert.equal(item.status,201);
    const itemId = item.body.results.data.id;
    assert.equal((await call("get","/api/accounting/items",undefined,tokenB)).body.results.data.length,0);
    assert.equal((await call("put",`/api/accounting/items/${itemId}`,{name:"Wrong",unit:"hour",unitPricePence:9999},tokenB)).status,404);
    assert.equal((await call("post",`/api/accounting/items/${itemId}/archive`,{},tokenB)).status,404);
    assert.equal((await call("get","/api/accounting/summary",undefined,tokenB)).body.results.data.contacts,0);
    const taxSettings = { vatNumber: "123456789", vatEffectiveDate: "2006-09-21" };
    assert.equal((await call("put","/api/accounting/tax-settings",taxSettings)).status,200);
    const savedTax = (await call("get","/api/accounting/tax-settings")).body.results.data;
    assert.equal(savedTax.vatNumber,taxSettings.vatNumber);
    assert.equal(savedTax.vatEffectiveDate,taxSettings.vatEffectiveDate);
    assert.equal(savedTax.verificationStatus,"UNVERIFIED");
    assert.deepEqual((await call("get","/api/accounting/tax-settings",undefined,tokenB)).body.results.data,{});
    assert.equal((await call("get","/api/accounting/tax-settings",undefined,carerToken)).status,403);
    assert.equal((await call("put","/api/accounting/tax-settings",{...taxSettings,vatNumber:"123"})).status,400);
    for (const payerType of ["FAMILY","INSURER","LOCAL_AUTHORITY","INDIVIDUAL","ORGANISATION","OTHER"]) {
      const response = await call("post","/api/accounting/contacts",{displayName:`${payerType} payer`,role:"CUSTOMER",payerType});
      assert.equal(response.status,201);
      assert.equal(response.body.results.data.payerType,payerType);
    }
    const familyId = (await call("get","/api/accounting/contacts")).body.results.data.find(c => c.payerType==="FAMILY").id;
    assert.equal((await call("put",`/api/accounting/client-payers/${clientA.id}`,{payerContactId:familyId})).status,200);
    const payers = (await call("get","/api/accounting/client-payers")).body.results.data;
    assert.equal(payers.length,1);
    assert.equal(payers[0].payerContactId,familyId);
    assert.equal(payers[0].payerType,"FAMILY");
    assert.equal((await call("get","/api/accounting/client-payers",undefined,tokenB)).body.results.data.length,1);
    assert.equal((await call("put",`/api/accounting/client-payers/${clientB.id}`,{payerContactId:familyId},tokenB)).status,404);
    assert.equal((await call("put",`/api/accounting/client-payers/${clientB.id}`,{payerContactId:null})).status,404);
    assert.equal((await call("put",`/api/accounting/contacts/${familyId}`,{displayName:"Family payer",role:"SUPPLIER",payerType:"FAMILY"})).status,409);
    assert.equal((await call("post",`/api/accounting/contacts/${familyId}/archive`,{})).status,409);
    assert.equal((await call("put",`/api/accounting/client-payers/${clientA.id}`,{payerContactId:null})).status,200);
    assert.equal((await call("post",`/api/accounting/contacts/${familyId}/archive`,{})).status,200);
    assert.equal((await call("post",`/api/accounting/contacts/${contactId}/archive`,{})).status,200);
    assert.equal((await call("get","/api/accounting/contacts")).body.results.data.some(c => c.id===contactId || c.id===familyId),false);
  } finally { await db.close(); }
});
