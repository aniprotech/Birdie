import React, { useEffect, useState } from "react";
import { Alert, Text, View } from "react-native";
import { api } from "./api";
import { Button, Card, Input, currency, styles, today } from "./ui";
import { DateInput } from "./pickers";

type Row = Record<string, any>;
const monthStart = () => `${today().slice(0, 7)}-01`;

export function FinanceManager({ kind }: { kind: "INVOICE" | "PAYRUN" }) {
  const [people, setPeople] = useState<Row[]>([]);
  const [rates, setRates] = useState<Row[]>([]);
  const [documents, setDocuments] = useState<Row[]>([]);
  const [recipientId, setRecipientId] = useState("");
  const [from, setFrom] = useState(monthStart());
  const [to, setTo] = useState(today());
  const [rate, setRate] = useState("");
  const [rateDate, setRateDate] = useState(today());
  const [preview, setPreview] = useState<Row | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Row | null>(null);
  const [visits,setVisits]=useState<Row[]>([]);
  const [reviewVisit,setReviewVisit]=useState<Row|null>(null);
  const [reviewBasis,setReviewBasis]=useState("ACTUAL");
  const [reviewReason,setReviewReason]=useState("");
  const [travelRates,setTravelRates]=useState<Row[]>([]);
  const [mileageRate,setMileageRate]=useState("");
  const [travelHourlyRate,setTravelHourlyRate]=useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const rateKind = kind === "INVOICE" ? "BILLING" : "PAY";
  const eligible = people.filter(person => !!person.isClient === (kind === "INVOICE"));

  async function load() {
    setBusy(true); setError("");
    try {
      const [options, existingRates, existingDocuments, reviewable, travel] = await Promise.all([
        api<Row>("/api/finance/options"),
        api<Row[]>("/api/finance/rates"),
        api<Row[]>(`/api/finance/documents?kind=${kind}&from=${from}&to=${to}`),
        api<Row>(`/api/finance/visits?from=${from}&to=${to}`),
        kind==="PAYRUN"?api<Row[]>("/api/finance/travel-rates"):Promise.resolve([]),
      ]);
      setPeople(options.people || []); setRates(existingRates); setDocuments(existingDocuments);
      setVisits(reviewable.visits||[]);setTravelRates(travel);
    } catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }
  useEffect(() => { void load(); }, [kind]);
  async function saveRate() {
    setBusy(true); setError("");
    try {
      await api("/api/finance/rates", "POST", { userId:recipientId, kind:rateKind, effectiveFrom:rateDate, hourlyPence:Math.round(Number(rate)*100) });
      setPreview(null); await load();
    } catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }
  async function calculate() {
    setBusy(true); setError(""); setPreview(null);
    try {
      const query = `kind=${kind}&recipientId=${recipientId}&from=${from}&to=${to}`;
      setPreview(await api<Row>(`/api/finance/preview?${query}`));
    } catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }
  async function createDraft() {
    setBusy(true); setError("");
    try {
      await api("/api/finance/documents", "POST", { kind, recipientId, from, to });
      setPreview(null); await load();
      Alert.alert("Draft created", "Review the draft lines before issuing it.");
    } catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }
  async function openDocument(id:string) {
    setBusy(true); setError("");
    try { setSelectedDocument(await api<Row>(`/api/finance/documents/${id}`)); }
    catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }
  async function changeStatus(next:string) {
    if (!selectedDocument) return;
    setBusy(true); setError("");
    try {
      await api(`/api/finance/documents/${selectedDocument.id}/status`, "POST", { status:next, expectedStatus:selectedDocument.status });
      await openDocument(selectedDocument.id); await load();
    } catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }
  async function confirmVisit(){
    if(!reviewVisit)return;
    setBusy(true);setError("");
    try{
      const kindOfReview=kind==="INVOICE"?"BILLING":"PAY";
      const old=reviewVisit.reviews?.find((item:Row)=>item.kind===kindOfReview);
      await api("/api/finance/visits/review","POST",{items:[{id:reviewVisit.id,revision:reviewVisit.revision,reviewRevision:old?.revision||0}],kind:kindOfReview,state:"CONFIRMED",basis:reviewBasis,reason:reviewReason.trim()});
      setReviewVisit(null);setReviewReason("");setPreview(null);await load();
    }catch(e){setError((e as Error).message)}finally{setBusy(false)}
  }
  async function saveTravelRate(){
    setBusy(true);setError("");
    try{
      await api("/api/finance/travel-rates","POST",{userId:recipientId,effectiveFrom:rateDate,mileagePence:Math.round(Number(mileageRate)*100),hourlyPence:Math.round(Number(travelHourlyRate)*100)});
      setPreview(null);await load();
    }catch(e){setError((e as Error).message)}finally{setBusy(false)}
  }
  const approved = kind === "INVOICE" ? "ISSUED" : "APPROVED";
  const actions = selectedDocument?.status === "DRAFT" ? [approved, "VOID"] : selectedDocument?.status === approved ? ["PAID", "VOID"] : [];
  return <>
    <Text style={styles.heading}>{kind === "INVOICE" ? "Invoices" : "Staff pay"}</Text>
    <Text style={styles.muted}>Only confirmed completed visits enter a draft. Check its lines and total before changing status.</Text>
    {!!error && <Text style={styles.error}>{error}</Text>}
    {busy && <Text style={styles.muted}>Loading…</Text>}
    <Button variant="secondary" title="Refresh financial records" disabled={busy} onPress={()=>void load()}/>
    <Card><Text style={styles.heading}>Review completed visits</Text>
      {visits.filter(visit=>visit.status==="COMPLETED"&&(!recipientId||(kind==="INVOICE"?visit.clientId:visit.staffId)===recipientId)).slice(0,100).map(visit=>{
        const review=visit.reviews?.find((item:Row)=>item.kind===(kind==="INVOICE"?"BILLING":"PAY"));
        return <View key={visit.id} style={{marginTop:10}}><Text style={styles.text}>{visit.date} · {visit.client} · {visit.carer||"Unassigned"}</Text>
          <Text style={styles.muted}>Planned {visit.planned} min · Actual {visit.actual??"not recorded"} min · {review?.state||"Unreviewed"}{visit.locked?.length?" · Included in document":""}</Text>
          {!visit.locked?.length&&<Button variant="secondary" title="Review visit" onPress={()=>{setReviewVisit(visit);setReviewBasis(visit.actual==null?"PLANNED":"ACTUAL");setReviewReason("")}}/>}
        </View>;
      })}
      {reviewVisit&&<><Text style={styles.heading}>Confirm {reviewVisit.date} visit</Text>
        <View style={styles.row}><Button variant="secondary" selected={reviewBasis==="ACTUAL"} disabled={reviewVisit.actual==null} title={`Actual (${reviewVisit.actual??"missing"} min)`} onPress={()=>setReviewBasis("ACTUAL")}/><Button variant="secondary" selected={reviewBasis==="PLANNED"} title={`Planned (${reviewVisit.planned} min)`} onPress={()=>setReviewBasis("PLANNED")}/></View>
        <Input label="Reason for review (at least 5 characters)" value={reviewReason} onChangeText={setReviewReason} multiline maxLength={1000}/>
        <Button title="Confirm reviewed visit" disabled={busy||reviewReason.trim().length<5||(reviewBasis==="ACTUAL"&&reviewVisit.actual==null)} onPress={()=>Alert.alert("Confirm visit for finance?", `${reviewVisit.client} · ${reviewVisit.date} · ${reviewBasis.toLowerCase()} duration.`,[{text:"Cancel",style:"cancel"},{text:"Confirm",onPress:()=>void confirmVisit()}])}/>
        <Button variant="secondary" title="Cancel review" onPress={()=>setReviewVisit(null)}/>
      </>}
    </Card>
    <Card>
      <Text style={styles.heading}>Create a draft</Text>
      <Text style={styles.muted}>Choose {kind === "INVOICE" ? "a client" : "a team member"}</Text>
      <View style={styles.row}>{eligible.map(person => <Button key={person.id} variant="secondary" selected={recipientId===person.id} title={person.name} onPress={()=>{setRecipientId(person.id);setPreview(null)}} />)}</View>
      <DateInput label="From" value={from} onChangeText={value=>{setFrom(value);setPreview(null)}} />
      <DateInput label="To" value={to} onChangeText={value=>{setTo(value);setPreview(null)}} minDate={from} />
      <Button title="Preview confirmed visits" disabled={busy||!recipientId||!/^\d{4}-\d{2}-\d{2}$/.test(from)||!/^\d{4}-\d{2}-\d{2}$/.test(to)} onPress={()=>void calculate()} />
      {preview && <><Text style={styles.heading}>{preview.recipientName} · {currency(preview.totalPence)}</Text>
        <Text style={styles.muted}>{preview.lines?.length||0} line(s) · {preview.missingRates||0} missing rates</Text>
        {preview.lines?.map((line:Row,index:number)=><Text key={`${line.visitId}-${line.component}-${index}`} style={styles.text}>{line.date} · {line.title} · {line.component} · {line.amountPence===null?"Rate missing":currency(line.amountPence)}</Text>)}
        <Button title="Create draft" disabled={busy||!preview.lines?.length||!!preview.missingRates} onPress={()=>Alert.alert("Create financial draft?", `${preview.recipientName}: ${currency(preview.totalPence)}. Confirm that the visits and rates are correct.`, [{text:"Cancel",style:"cancel"},{text:"Create draft",onPress:()=>void createDraft()}])} />
      </>}
    </Card>
    <Card><Text style={styles.heading}>Hourly rates</Text>
      <Text style={styles.muted}>Select the person above. A new rate takes effect from its date and can change future document previews.</Text>
      <Input label="New hourly rate (£)" value={rate} onChangeText={setRate} keyboardType="decimal-pad" />
      <DateInput label="Effective from" value={rateDate} onChangeText={setRateDate} />
      <Button title="Save hourly rate" disabled={busy||!recipientId||!/^\d{4}-\d{2}-\d{2}$/.test(rateDate)||!/^\d+(?:\.\d{1,2})?$/.test(rate)} onPress={()=>Alert.alert("Save rate?", `Set ${currency(Math.round(Number(rate)*100))} per hour from ${rateDate}?`,[{text:"Cancel",style:"cancel"},{text:"Save",onPress:()=>void saveRate()}])}/>
      {rates.filter(entry=>entry.kind===rateKind).slice(0,20).map(entry=><Text key={entry.id} style={styles.muted}>{entry.name} · {currency(entry.hourlyPence)}/hour from {entry.effectiveFrom}</Text>)}
    </Card>
    {kind==="PAYRUN"&&<Card><Text style={styles.heading}>Staff travel rates</Text>
      <Text style={styles.muted}>Select a team member above. Set both mileage and travel-time rates before creating a pay draft that includes travel.</Text>
      <Input label="Mileage rate (£ per mile)" value={mileageRate} onChangeText={setMileageRate} keyboardType="decimal-pad"/>
      <Input label="Travel time rate (£ per hour)" value={travelHourlyRate} onChangeText={setTravelHourlyRate} keyboardType="decimal-pad"/>
      <Button title="Save travel rates" disabled={busy||!recipientId||!/^\d{4}-\d{2}-\d{2}$/.test(rateDate)||!/^\d+(?:\.\d{1,2})?$/.test(mileageRate)||!/^\d+(?:\.\d{1,2})?$/.test(travelHourlyRate)} onPress={()=>Alert.alert("Save travel rates?", `Mileage ${mileageRate} £/mile and travel time ${travelHourlyRate} £/hour from ${rateDate}?`,[{text:"Cancel",style:"cancel"},{text:"Save",onPress:()=>void saveTravelRate()}])}/>
      {travelRates.slice(0,20).map((entry:Row)=><Text key={entry.id} style={styles.muted}>{entry.name} · {currency(entry.mileage_pence)}/mile · {currency(entry.hourly_pence)}/hour from {String(entry.effective_from).slice(0,10)}</Text>)}
    </Card>}
    <Text style={styles.heading}>Documents for this period</Text>
    {documents.map(document=><Card key={document.id}><Text style={styles.heading}>#{document.number} · {document.recipientName}</Text><Text style={styles.text}>{currency(document.totalPence)} · {document.status}</Text><Text style={styles.muted}>{document.from} to {document.to}</Text><Button variant="secondary" title="Review lines and status" onPress={()=>void openDocument(document.id)}/></Card>)}
    {!documents.length&&!busy&&<Text style={styles.muted}>No documents in this period.</Text>}
    {selectedDocument&&<Card><Text style={styles.heading}>Document #{selectedDocument.number}</Text><Text style={styles.text}>{selectedDocument.recipientName} · {currency(selectedDocument.totalPence)} · {selectedDocument.status}</Text>
      {selectedDocument.lines?.map((line:Row)=><Text key={line.id} style={styles.text}>{line.date} · {line.title} · {currency(line.amountPence)}</Text>)}
      {actions.map(next=><Button key={next} variant="secondary" disabled={busy} title={next==="VOID"?"Void document":next==="PAID"?"Mark paid":kind==="INVOICE"?"Issue invoice":"Approve pay"} onPress={()=>Alert.alert("Confirm financial change", `Change document #${selectedDocument.number} from ${selectedDocument.status} to ${next}?`,[{text:"Cancel",style:"cancel"},{text:"Confirm",onPress:()=>void changeStatus(next)}])}/>)}
      <Button variant="secondary" title="Close document" onPress={()=>setSelectedDocument(null)}/>
    </Card>}
  </>;
}

export function AccountingManager() {
  const [summary,setSummary]=useState<Row|null>(null),[contacts,setContacts]=useState<Row[]>([]),[items,setItems]=useState<Row[]>([]);
  const [contactName,setContactName]=useState(""),[contactEmail,setContactEmail]=useState(""),[contactRole,setContactRole]=useState("CUSTOMER");
  const [itemName,setItemName]=useState(""),[itemPrice,setItemPrice]=useState("");
  const [error,setError]=useState(""),[busy,setBusy]=useState(false);
  async function load(){setBusy(true);setError("");try{const [s,c,i]=await Promise.all([api<Row>("/api/accounting/summary"),api<Row[]>("/api/accounting/contacts"),api<Row[]>("/api/accounting/items")]);setSummary(s);setContacts(c);setItems(i)}catch(e){setError((e as Error).message)}finally{setBusy(false)}}
  useEffect(()=>{void load()},[]);
  async function addContact(){setBusy(true);setError("");try{await api("/api/accounting/contacts","POST",{displayName:contactName.trim(),role:contactRole,email:contactEmail.trim()});setContactName("");setContactEmail("");await load()}catch(e){setError((e as Error).message)}finally{setBusy(false)}}
  async function addItem(){setBusy(true);setError("");try{await api("/api/accounting/items","POST",{name:itemName.trim(),unitPricePence:Math.round(Number(itemPrice)*100)});setItemName("");setItemPrice("");await load()}catch(e){setError((e as Error).message)}finally{setBusy(false)}}
  return <><Text style={styles.heading}>Accounting</Text>{busy&&<Text style={styles.muted}>Loading…</Text>}{!!error&&<Text style={styles.error}>{error}</Text>}
    {summary&&<Card><Text style={styles.heading}>Organisation summary</Text><Text style={styles.text}>{summary.contacts} contacts · {summary.items} items · {summary.visitInvoices} visit invoices</Text><Text style={styles.muted}>Invoice total: {currency(summary.visitInvoiceTotalPence)}</Text></Card>}
    <Card><Text style={styles.heading}>New contact</Text><Input label="Display name" value={contactName} onChangeText={setContactName} maxLength={160}/><Input label="Email (optional)" value={contactEmail} onChangeText={setContactEmail} keyboardType="email-address"/>
      <View style={styles.row}>{["CUSTOMER","SUPPLIER","BOTH"].map(role=><Button key={role} variant="secondary" selected={contactRole===role} title={role} onPress={()=>setContactRole(role)}/>)}</View>
      <Button title="Create contact" disabled={busy||!contactName.trim()||!!contactEmail&&!/^\S+@\S+\.\S+$/.test(contactEmail.trim())} onPress={()=>void addContact()}/></Card>
    <Card><Text style={styles.heading}>New item</Text><Input label="Item name" value={itemName} onChangeText={setItemName}/><Input label="Unit price (£)" value={itemPrice} onChangeText={setItemPrice} keyboardType="decimal-pad"/><Button title="Create item" disabled={busy||!itemName.trim()||!/^\d+(?:\.\d{1,2})?$/.test(itemPrice)} onPress={()=>void addItem()}/></Card>
    <Text style={styles.heading}>Contacts</Text>{contacts.map(contact=><Card key={contact.id}><Text style={styles.text}>{contact.displayName} · {contact.role}</Text><Text style={styles.muted}>{contact.email||"No email"}</Text></Card>)}
    <Text style={styles.heading}>Items</Text>{items.map(item=><Card key={item.id}><Text style={styles.text}>{item.name} · {currency(item.unitPricePence)} / {item.unit}</Text></Card>)}
  </>;
}
