import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { _get, _post, _put } from "../../utils/ApiService";

const emptyContact = { displayName: "", legalName: "", contactPerson: "", email: "", phone: "", billingAddress: "", companyNumber: "", vatNumber: "", role: "CUSTOMER", paymentTermsDays: 30 };
const emptyItem = { name: "", description: "", unit: "each", unitPricePence: 0 };
const read = async (path) => (await _get(path)).data.results.data;
const money = (pence) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format((pence || 0) / 100);

export default function AccountingIndex() {
  const [tab, setTab] = useState("overview"), [summary, setSummary] = useState(null);
  const [contacts, setContacts] = useState([]), [items, setItems] = useState([]);
  const [contact, setContact] = useState(emptyContact), [item, setItem] = useState(emptyItem);
  const [taxSettings, setTaxSettings] = useState(null), [taxForm, setTaxForm] = useState({ vatNumber: "", vatEffectiveDate: "" });
  const [priceInput, setPriceInput] = useState("0.00");
  const [editing, setEditing] = useState(null), [error, setError] = useState(""), [notice, setNotice] = useState(""), [busy, setBusy] = useState(false);
  const refresh = async () => {
    const [s, c, i] = await Promise.all([read("/api/accounting/summary"), read("/api/accounting/contacts"), read("/api/accounting/items")]);
    setSummary(s); setContacts(c); setItems(i);
  };
  useEffect(() => { let live = true; Promise.all([read("/api/accounting/summary"), read("/api/accounting/contacts"), read("/api/accounting/items"), read("/api/accounting/tax-settings")])
    .then(([s,c,i,t]) => { if (live) { setSummary(s); setContacts(c); setItems(i); if (t?.vatNumber) { setTaxSettings(t); setTaxForm({vatNumber:t.vatNumber,vatEffectiveDate:t.vatEffectiveDate}); } } })
    .catch(e => { if (live) setError(e.response?.data?.message || "Accounting could not be loaded"); });
    return () => { live = false; }; }, []);
  const save = async (kind) => {
    setBusy(true); setError(""); setNotice("");
    try {
      if (kind === "contact") {
        const path = `/api/accounting/contacts${editing ? `/${editing}` : ""}`;
        await (editing ? _put(path, contact) : _post(path, contact));
        setContact(emptyContact);
      } else {
        const path = `/api/accounting/items${editing ? `/${editing}` : ""}`;
        const payload = { ...item, unitPricePence: Math.round(Number(priceInput) * 100) };
        await (editing ? _put(path, payload) : _post(path, payload));
        setItem(emptyItem); setPriceInput("0.00");
      }
      setEditing(null); await refresh(); setNotice("Saved successfully.");
    } catch (e) { setError(e.response?.data?.message || "Unable to save"); }
    finally { setBusy(false); }
  };
  const archive = async (kind, id) => {
    if (!window.confirm("Archive this record? It can no longer be selected for new work.")) return;
    setBusy(true); setError(""); setNotice("");
    try { await _post(`/api/accounting/${kind}/${id}/archive`); await refresh(); setNotice("Record archived."); }
    catch (e) { setError(e.response?.data?.message || "Unable to archive"); }
    finally { setBusy(false); }
  };
  const startContact = (c) => { setContact({ ...emptyContact, ...c }); setEditing(c.id); setTab("contacts"); };
  const startItem = (i) => { setItem({ ...emptyItem, ...i }); setPriceInput((i.unitPricePence / 100).toFixed(2)); setEditing(i.id); setTab("catalogue"); };
  const saveTax = async (event) => {
    event.preventDefault(); setBusy(true); setError(""); setNotice("");
    try { const result = await _put("/api/accounting/tax-settings",taxForm); setTaxSettings(result.data.results.data); setNotice("VAT registration details saved for this organisation."); }
    catch (e) { setError(e.response?.data?.message || "Unable to save VAT settings"); }
    finally { setBusy(false); }
  };
  return <main className="min-h-screen bg-[#f5faff] p-4 text-[#10233f] md:p-8">
    <div className="mx-auto max-w-7xl">
      <header className="mb-6"><h1 className="text-3xl font-bold">Accounting</h1><p className="mt-2 text-slate-600">Billing contacts and service prices for your organisation.</p></header>
      <nav aria-label="Accounting sections" className="mb-6 flex flex-wrap gap-2">
        {[["overview","Overview"],["contacts","Contacts"],["catalogue","Products and services"],["tax","VAT settings"]].map(([key,label]) =>
          <button key={key} type="button" aria-current={tab===key?"page":undefined} onClick={() => { setTab(key); setEditing(null); setContact(emptyContact); setItem(emptyItem); setPriceInput("0.00"); setError(""); }}
            className={`rounded-lg border px-4 py-2 font-semibold transition ${tab===key?"border-[#0b294a] bg-[#0b294a] text-white":"border-slate-300 bg-white text-[#0b294a] hover:bg-cyan-50"}`}>{label}</button>)}</nav>
      {error && <p role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">{error}</p>}
      {notice && <p role="status" className="mb-5 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800">{notice}</p>}
      {tab === "overview" && <><div className="grid gap-4 md:grid-cols-3">
        {[["Billing contacts",summary?.contacts],["Catalogue items",summary?.items],["Visit invoices",summary?.visitInvoices]].map(([label,value]) => <article key={label} className="rounded-xl border bg-white p-5 shadow-sm"><p className="text-slate-600">{label}</p><strong className="mt-2 block text-3xl">{value ?? "…"}</strong></article>)}
      </div><section className="mt-5 rounded-xl border bg-white p-6"><h2 className="text-xl font-semibold">Existing visit billing</h2><p className="mt-2 text-slate-600">{summary ? money(summary.visitInvoiceTotalPence) : "…"} in active visit invoice documents. This is issued document value, not money received.</p><Link className="mt-4 inline-block rounded-lg bg-[#0b294a] px-4 py-2 font-semibold text-white hover:bg-[#14517a]" to="/admin/finances">Open visit Finance</Link></section></>}
      {tab === "contacts" && <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]"><section className="rounded-xl border bg-white p-5"><h2 className="mb-4 text-xl font-semibold">Billing contacts</h2><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b text-slate-600"><th className="p-2">Name</th><th className="p-2">Role</th><th className="p-2">Email</th><th className="p-2">Actions</th></tr></thead><tbody>{contacts.map(c => <tr key={c.id} className="border-b"><td className="p-2 font-medium">{c.displayName}</td><td className="p-2">{c.role.toLowerCase()}</td><td className="p-2">{c.email || "—"}</td><td className="whitespace-nowrap p-2"><button onClick={() => startContact(c)} className="mr-3 text-blue-700 underline">Edit</button><button disabled={busy} onClick={() => archive("contacts",c.id)} className="text-red-700 underline">Archive</button></td></tr>)}</tbody></table>{contacts.length===0 && <p className="p-4 text-slate-600">No billing contacts yet.</p>}</div></section>
      <form onSubmit={e => { e.preventDefault(); save("contact"); }} className="self-start rounded-xl border bg-white p-5"><h2 className="mb-4 text-xl font-semibold">{editing?"Edit contact":"Add contact"}</h2>
        {[["displayName","Display name",true],["legalName","Legal name"],["contactPerson","Contact person"],["email","Email"],["phone","Phone"],["companyNumber","Company number"],["vatNumber","VAT number"]].map(([key,label,required]) => <label key={key} className="mb-3 block text-sm font-medium">{label}<input className="mt-1 w-full rounded border border-slate-300 p-2" type={key==="email"?"email":"text"} required={!!required} maxLength={160} value={contact[key]} onChange={e => setContact({...contact,[key]:e.target.value})}/></label>)}
        <label className="mb-3 block text-sm font-medium">Billing address<textarea className="mt-1 w-full rounded border border-slate-300 p-2" value={contact.billingAddress} onChange={e => setContact({...contact,billingAddress:e.target.value})}/></label>
        <label className="mb-3 block text-sm font-medium">Role<select className="mt-1 w-full rounded border border-slate-300 p-2" value={contact.role} onChange={e => setContact({...contact,role:e.target.value})}><option value="CUSTOMER">Customer</option><option value="SUPPLIER">Supplier</option><option value="BOTH">Both</option></select></label>
        <label className="mb-4 block text-sm font-medium">Payment terms (days)<input className="mt-1 w-full rounded border border-slate-300 p-2" type="number" min="0" max="365" value={contact.paymentTermsDays} onChange={e => setContact({...contact,paymentTermsDays:Number(e.target.value)})}/></label>
        <button disabled={busy} type="submit" className="rounded-lg bg-[#0b294a] px-4 py-2 font-semibold text-white hover:bg-[#14517a] disabled:opacity-50">{editing?"Save changes":"Add contact"}</button>{editing && <button type="button" onClick={() => {setEditing(null);setContact(emptyContact);}} className="ml-3 underline">Cancel</button>}
      </form></div>}
      {tab === "catalogue" && <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]"><section className="rounded-xl border bg-white p-5"><h2 className="mb-4 text-xl font-semibold">Products and services</h2><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b text-slate-600"><th className="p-2">Name</th><th className="p-2">Unit</th><th className="p-2">Price</th><th className="p-2">Actions</th></tr></thead><tbody>{items.map(i => <tr key={i.id} className="border-b"><td className="p-2 font-medium">{i.name}</td><td className="p-2">{i.unit}</td><td className="p-2">{money(i.unitPricePence)}</td><td className="whitespace-nowrap p-2"><button onClick={() => startItem(i)} className="mr-3 text-blue-700 underline">Edit</button><button disabled={busy} onClick={() => archive("items",i.id)} className="text-red-700 underline">Archive</button></td></tr>)}</tbody></table>{items.length===0 && <p className="p-4 text-slate-600">No catalogue items yet.</p>}</div></section>
      <form onSubmit={e => { e.preventDefault(); save("item"); }} className="self-start rounded-xl border bg-white p-5"><h2 className="mb-4 text-xl font-semibold">{editing?"Edit item":"Add item"}</h2>
        <label className="mb-3 block text-sm font-medium">Name<input required maxLength="160" className="mt-1 w-full rounded border border-slate-300 p-2" value={item.name} onChange={e => setItem({...item,name:e.target.value})}/></label>
        <label className="mb-3 block text-sm font-medium">Description<textarea maxLength="500" className="mt-1 w-full rounded border border-slate-300 p-2" value={item.description} onChange={e => setItem({...item,description:e.target.value})}/></label>
        <label className="mb-3 block text-sm font-medium">Unit<input required maxLength="30" className="mt-1 w-full rounded border border-slate-300 p-2" value={item.unit} onChange={e => setItem({...item,unit:e.target.value})}/></label>
        <label className="mb-4 block text-sm font-medium">Unit price (£, before VAT)<input required type="number" min="0" max="1000000" step="0.01" className="mt-1 w-full rounded border border-slate-300 p-2" value={priceInput} onChange={e => setPriceInput(e.target.value)}/></label>
        <button disabled={busy} type="submit" className="rounded-lg bg-[#0b294a] px-4 py-2 font-semibold text-white hover:bg-[#14517a] disabled:opacity-50">{editing?"Save changes":"Add item"}</button>{editing && <button type="button" onClick={() => {setEditing(null);setItem(emptyItem);}} className="ml-3 underline">Cancel</button>}
      </form></div>}
      {tab === "tax" && <section className="max-w-2xl rounded-xl border bg-white p-6"><h2 className="text-xl font-semibold">VAT registration</h2><p className="mt-2 text-sm text-slate-600">These details belong only to your signed-in organisation. Saving them does not enable VAT calculations, VAT invoices or HMRC submissions.</p>
        <p className="mt-4 text-sm font-semibold">Status: {taxSettings ? "Recorded, not independently verified" : "Not configured"}</p>
        <form onSubmit={saveTax} className="mt-5 grid gap-4">
          <label className="text-sm font-medium">UK VAT registration number<input required inputMode="numeric" pattern="[0-9]{9}" maxLength="9" className="mt-1 block w-full rounded border border-slate-300 p-2" value={taxForm.vatNumber} onChange={e => setTaxForm({...taxForm,vatNumber:e.target.value})}/></label>
          <label className="text-sm font-medium">Effective registration date<input required type="date" className="mt-1 block w-full rounded border border-slate-300 p-2" value={taxForm.vatEffectiveDate} onChange={e => setTaxForm({...taxForm,vatEffectiveDate:e.target.value})}/></label>
          <button disabled={busy} type="submit" className="w-fit rounded-lg bg-[#0b294a] px-4 py-2 font-semibold text-white hover:bg-[#14517a] disabled:opacity-50">Save VAT details</button>
        </form><p className="mt-5 text-sm text-slate-600">Before VAT can be applied, the registration must be checked and the accounting scheme and tax treatment agreed for each service.</p>
      </section>}
    </div>
  </main>;
}
