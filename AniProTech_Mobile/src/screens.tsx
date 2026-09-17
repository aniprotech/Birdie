import React, { useEffect, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  RefreshControl,
  Alert,
  Pressable,
} from "react-native";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import { api, apiOrQueue, clientEventId, flushPendingMutations, pendingMutationSummary, upload, User, SyncSummary } from "./api";
import {
  Button,
  Input,
  Card,
  styles,
  today,
  addDays,
  currency,
  timestamp,
} from "./ui";
type Row = Record<string, any>;
function useData<T>(path: string, method = "GET", body?: unknown) {
  const [data, setData] = useState<T>(),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true),
    [tick, setTick] = useState(0);
  const encoded = JSON.stringify(body);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    api<T>(path, method, encoded ? JSON.parse(encoded) : undefined)
      .then((d) => {
        if (active) setData(d);
      })
      .catch((e) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [path, method, encoded, tick]);
  return { data, error, loading, refresh: () => setTick((n) => n + 1) };
}
function ErrorText({ error }: { error: string }) {
  return error ? (
    <Text accessibilityRole="alert" style={styles.error}>
      {error}
    </Text>
  ) : null;
}
function Empty({ text }: { text: string }) {
  return (
    <Card>
      <Text style={styles.muted}>{text}</Text>
    </Card>
  );
}
export function Visits({user}:{user:User}) {
  const [date, setDate] = useState(today),
    [selected, setSelected] = useState<Row | null>(null),
    [busy, setBusy] = useState(false),
    [detail, setDetail] = useState<Row | null>(null),
    [note, setNote] = useState(""),
    [incident, setIncident] = useState(""),
    [caption, setCaption] = useState(""),
    [listening, setListening] = useState<"note"|"incident"|null>(null),
    [creating,setCreating]=useState(false),
    [clientId,setClientId]=useState(""),
    [staffId,setStaffId]=useState(""),
    [startTime,setStartTime]=useState("09:00"),
    [endTime,setEndTime]=useState("10:00"),
    [visitTitle,setVisitTitle]=useState("Care visit"),
    [visitNotes,setVisitNotes]=useState(""),
    [selectedMedication,setSelectedMedication]=useState<Row|null>(null),
    [medicationOutcome,setMedicationOutcome]=useState("ADMINISTERED"),
    [medicationSlot,setMedicationSlot]=useState(""),
    [medicationReason,setMedicationReason]=useState(""),
    [medicationNote,setMedicationNote]=useState(""),
    [medicationQuantity,setMedicationQuantity]=useState("1"),
    [medicationWitness,setMedicationWitness]=useState(""),
    [medicationAllergyAcknowledged,setMedicationAllergyAcknowledged]=useState(false),
    [syncSummary,setSyncSummary]=useState<SyncSummary>({pending:0,blocked:0,sent:0,lastSyncAt:null,items:[]});
  const { data, error, loading, refresh } = useData<{ visits: Row[] }>(
    `/api/roster/visits?from=${date}&to=${date}`,
  );
  const options=useData<{canManage:boolean;clients:Row[];staff:Row[]}>("/api/roster/options");
  useEffect(()=>{void pendingMutationSummary(user.id).then(setSyncSummary)},[user.id]);
  async function synchroniseNow(){setBusy(true);try{const result=await flushPendingMutations(user.id);setSyncSummary(await pendingMutationSummary(user.id));if(!result.pending)Alert.alert("Synchronisation complete",`${result.sent} pending visit record${result.sent===1?"":"s"} sent successfully.`);else Alert.alert("Synchronisation needs attention",`${result.pending} record${result.pending===1?"":"s"} remain on this device. Review the reason below and resolve it before completing care records.`);}catch(e){Alert.alert("Synchronisation unavailable",(e as Error).message)}finally{setBusy(false)}}
  async function createVisit(){
    setBusy(true);
    try{
      await api("/api/roster/visits","POST",{clientId,staffId:staffId||null,date,startTime,endTime,title:visitTitle,notes:visitNotes,status:"SCHEDULED",repeatWeeks:1});
      setCreating(false);setClientId("");setStaffId("");setVisitNotes("");refresh();
      Alert.alert("Visit created","The visit is now available in the web roster and the assigned caregiver's mobile app.");
    }catch(e){Alert.alert("Visit could not be created",(e as Error).message)}finally{setBusy(false)}
  }
  async function openVisit(v: Row) {
    setSelected(v); setBusy(true);
    try { const sync=await flushPendingMutations(user.id); setSyncSummary(await pendingMutationSummary(user.id)); if(sync.pending) Alert.alert("Offline records need attention",`${sync.pending} visit record${sync.pending===1?"":"s"} could not be synchronised. Review the sync status before completing the visit.`); setDetail(await api(`/api/mobile/visits/${v.id}`)); }
    catch(e) { Alert.alert("Visit could not be opened",(e as Error).message); setSelected(null); }
    finally { setBusy(false); }
  }
  async function recordMedication() {
    if(!selected||!selectedMedication)return;
    setBusy(true);
    try {
      const outcome=medicationOutcome;
      const result=await apiOrQueue(`/api/mobile/visits/${selected.id}/medication-administrations`,{
        clientEventId:clientEventId(),medicationId:selectedMedication.id,outcome,
        slot:medicationSlot.trim()||selectedMedication.slots?.[0]||selectedMedication.exactTimes&&Object.values(selectedMedication.exactTimes)[0]||"During visit",
        doseGiven:["ADMINISTERED","PRN_ADMINISTERED"].includes(outcome)?selectedMedication.dose||"As prescribed":"",
        reason:medicationReason.trim(),note:medicationNote.trim(),prnEffect:"",witnessedBy:medicationWitness||null,quantityGiven:selectedMedication.stockTrackingEnabled?Number(medicationQuantity):null,allergyAcknowledged:!detail?.allergyInformation||medicationAllergyAcknowledged,occurredAt:new Date().toISOString()
      },user.id,`Medication: ${selectedMedication.name}`);
      if(result.queued) {setSyncSummary(await pendingMutationSummary(user.id));Alert.alert("Saved securely for synchronisation","The phone is offline. This medication record is encrypted on this device and will be sent in order when a connection is available. Please follow your organisation's offline escalation procedure.");}
      else { Alert.alert("Medication recorded","The eMAR record has been saved and added to the visit audit history."); setDetail(await api(`/api/mobile/visits/${selected.id}`)); }
      setSelectedMedication(null);setMedicationReason("");setMedicationNote("");setMedicationOutcome("ADMINISTERED");setMedicationSlot("");setMedicationQuantity("1");setMedicationWitness("");setMedicationAllergyAcknowledged(false);
    } catch(e){Alert.alert("Medication could not be recorded",(e as Error).message)} finally{setBusy(false)}
  }
  async function attendance(event: "CHECK_IN" | "CHECK_OUT") {
    if (!selected) return;
    setBusy(true);
    try {
      let coordinates = { latitude:null as number|null, longitude:null as number|null, accuracy:null as number|null };
      const servicesEnabled=await Location.hasServicesEnabledAsync();
      if(!servicesEnabled) throw new Error("Turn on location services before checking in or out.");
      const permission=await Location.requestForegroundPermissionsAsync();
      if(permission.status !== "granted") throw new Error("Location permission is required to verify visit attendance.");
      const p=await Location.getCurrentPositionAsync({accuracy:Location.Accuracy.High});
      coordinates={latitude:p.coords.latitude,longitude:p.coords.longitude,accuracy:p.coords.accuracy};
      const result=await apiOrQueue(`/api/mobile/visits/${selected.id}/attendance`,{clientEventId:clientEventId(),event,...coordinates},user.id,event==="CHECK_IN"?"Visit check-in":"Visit check-out");
      if(result.queued){setSyncSummary(await pendingMutationSummary(user.id));const status=event==="CHECK_IN"?"IN_PROGRESS":"COMPLETED";setDetail((current)=>current?{...current,visit:{...current.visit,status}}:current);setSelected({...selected,status});Alert.alert("Attendance saved securely",`${event==="CHECK_IN"?"Check-in":"Check-out"} is pending synchronisation. Keep the app installed and review sync status when connectivity returns.`);}
      else {const attendanceResult=result.data as Row;if(event==="CHECK_IN") Alert.alert("Check-in recorded",attendanceResult.withinRadius===true?`Client location verified${attendanceResult.distanceMetres!=null?` (${attendanceResult.distanceMetres} m)`:""}. The arrival notification has been created.`:attendanceResult.withinRadius===false?`You appear to be ${attendanceResult.distanceMetres} m from the configured client location. The admin has been notified for review.`:"The client location is not configured, so proximity could not be verified. The admin has been notified.");const updated=await api<Row>(`/api/mobile/visits/${selected.id}`);setDetail(updated);setSelected({...selected,status:updated.visit.status});}
      refresh();
    } catch (e) {
      Alert.alert("Attendance could not be recorded", (e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function record(kind:string,title:string,body:string,status:string,category="") {
    if(!selected) return; setBusy(true);
    try { const result=await apiOrQueue(`/api/mobile/visits/${selected.id}/entries`,{clientEventId:clientEventId(),kind,title,body,category,status},user.id,kind==="ACTIVITY"?`Care task: ${title}`:kind==="ALERT"?"Incident alert":"Visit note"); if(result.queued){setSyncSummary(await pendingMutationSummary(user.id));Alert.alert("Saved securely for synchronisation",`${title} is pending and will be sent in order when connectivity returns.`);}else setDetail(await api(`/api/mobile/visits/${selected.id}`)); setNote(""); setIncident(""); }
    catch(e){Alert.alert("Record could not be saved",(e as Error).message)} finally{setBusy(false)}
  }
  async function addPhoto() {
    if(!selected) return;
    const permission=await ImagePicker.requestCameraPermissionsAsync(); if(!permission.granted){Alert.alert("Camera permission needed","Allow camera access to add a visit photo.");return;}
    const result=await ImagePicker.launchCameraAsync({mediaTypes:["images"],quality:.75}); if(result.canceled)return;
    setBusy(true); try{await upload(`/api/mobile/visits/${selected.id}/photos`,result.assets[0].uri,caption);setDetail(await api(`/api/mobile/visits/${selected.id}`));setCaption("");}catch(e){Alert.alert("Photo could not be uploaded",(e as Error).message)}finally{setBusy(false)}
  }
  async function dictate(target:"note"|"incident") {
    try {
      const {ExpoSpeechRecognitionModule}=await import("expo-speech-recognition");
      if(!ExpoSpeechRecognitionModule.isRecognitionAvailable()) throw new Error("Speech recognition is not enabled on this device.");
      const permission=await ExpoSpeechRecognitionModule.requestPermissionsAsync(); if(!permission.granted)throw new Error("Microphone and speech recognition permission are required.");
      setListening(target);
      const result=ExpoSpeechRecognitionModule.addListener("result",(event:any)=>{const text=event.results?.[0]?.transcript?.trim();if(!text)return;const update=(previous:string)=>`${previous}${previous.trim()?" ":""}${text}`;target==="note"?setNote(update):setIncident(update);});
      const end=ExpoSpeechRecognitionModule.addListener("end",()=>{setListening(null);result.remove();end.remove();error.remove();});
      const error=ExpoSpeechRecognitionModule.addListener("error",(event:any)=>{setListening(null);if(event.error!=="aborted"&&event.error!=="no-speech")Alert.alert("Voice dictation stopped",event.message||"Speech was not recognised.");result.remove();end.remove();error.remove();});
      ExpoSpeechRecognitionModule.start({lang:"en-GB",interimResults:false,continuous:false,contextualStrings:["medication","care plan","check in","check out","wellbeing","hydration"]});
    } catch(e) { setListening(null); Alert.alert("Voice dictation unavailable",(e as Error).message+" A development build is required; the phone keyboard's dictation remains available in Expo Go."); }
  }
  return (
    <ScrollView
      contentContainerStyle={styles.page}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={refresh} />
      }
    >
      <Text style={styles.title}>Visits</Text>
      <Text style={styles.muted}>All visit times are Europe/London.</Text>
      {user.role!=="CAREGIVER"&&!selected&&<Button title={creating?"Cancel new visit":"Add visit"} onPress={()=>setCreating(v=>!v)}/>} 
      {creating&&<Card>
        <Text style={styles.heading}>New scheduled visit</Text>
        <Text style={styles.muted}>Client</Text>
        {options.data?.clients.map(p=><Card key={p.id} onPress={()=>setClientId(p.id)}><Text style={styles.text}>{clientId===p.id?"✓ ":""}{p.name}</Text></Card>)}
        <Text style={styles.muted}>Assign caregiver (optional)</Text>
        {options.data?.staff.map(p=><Card key={p.id} onPress={()=>setStaffId(staffId===p.id?"":p.id)}><Text style={styles.text}>{staffId===p.id?"✓ ":""}{p.name}</Text></Card>)}
        <Input label="Date (YYYY-MM-DD)" value={date} onChangeText={setDate}/>
        <View style={styles.row}><View style={{flex:1}}><Input label="Starts (HH:MM)" value={startTime} onChangeText={setStartTime}/></View><View style={{flex:1}}><Input label="Ends (HH:MM)" value={endTime} onChangeText={setEndTime}/></View></View>
        <Input label="Visit title" value={visitTitle} onChangeText={setVisitTitle} maxLength={160}/>
        <Input label="Instructions" value={visitNotes} onChangeText={setVisitNotes} multiline maxLength={4000}/>
        <Button title={busy?"Saving…":"Create visit"} disabled={busy||!clientId||!visitTitle.trim()} onPress={()=>void createVisit()}/>
      </Card>}
      <View style={styles.row}>
        <Button
          title="Previous"
          onPress={() => {
            setDate(addDays(date, -1));
            setSelected(null);
          }}
        />
        <Button
          title="Today"
          onPress={() => {
            setDate(today());
            setSelected(null);
          }}
        />
        <Button
          title="Next"
          onPress={() => {
            setDate(addDays(date, 1));
            setSelected(null);
          }}
        />
      </View>
      <Text style={styles.heading}>{date}</Text>
      <ErrorText error={error} />
      {selected ? (
        <>
          <Button title="Back to visits" onPress={() => {setSelected(null);setDetail(null)}} />
          {(syncSummary.pending>0||syncSummary.lastSyncAt)&&<Card><Text style={styles.heading}>Offline sync status</Text><Text style={syncSummary.blocked?styles.error:styles.badge}>{syncSummary.pending?`${syncSummary.pending} pending · ${syncSummary.blocked} need attention`:`Up to date${syncSummary.lastSyncAt?` · ${timestamp(syncSummary.lastSyncAt)}`:""}`}</Text>{syncSummary.items.slice(0,5).map(item=><Text key={item.id} style={item.lastError?styles.error:styles.muted}>{item.label||"Visit record"} · {item.lastError||"Waiting to send"}</Text>)}<Button disabled={busy} title={busy?"Synchronising…":"Synchronise now"} onPress={()=>void synchroniseNow()}/></Card>}
          <Card>
          <Text style={styles.heading}>{selected.clientName}</Text>
          <Text style={styles.text}>{selected.title}</Text>
          <Text style={styles.badge}>
            {selected.startTime} – {selected.endTime}
          </Text>
          <Text style={styles.muted}>
            {selected.staffName || "Unassigned"} ·{" "}
            {selected.status.replaceAll("_", " ")}
          </Text>
          <Text style={styles.text}>{selected.notes || "No visit notes."}</Text>
          {detail?.address && <Text style={styles.text}>{[detail.address.addressLine1,detail.address.city,detail.address.postCode].filter(Boolean).join(", ")}</Text>}
          {detail?.visit?.clientPhone && <Text style={styles.text}>Phone: {detail.visit.clientPhone}</Text>}
          {detail?.visit?.status === "SCHEDULED" && (
            <Button
              disabled={busy}
              title="Check in"
              onPress={() => void attendance("CHECK_IN")}
            />
          )}
          {detail?.visit?.status === "IN_PROGRESS" && (
            <Button
              disabled={busy}
              title="Check out and complete"
              onPress={() => void attendance("CHECK_OUT")}
            />
          )}
          </Card>
          <Text style={styles.heading}>Care tasks</Text>
          {detail?.tasks?.map((t:Row)=><Card key={t.id}><Text style={styles.heading}>{t.essential?"Essential · ":""}{t.name}</Text><Text style={styles.muted}>{t.details||"No additional instructions"}</Text><Text style={styles.badge}>{t.status.replaceAll("_"," ")}</Text>{t.status==="PENDING"&&<View style={styles.row}><Button disabled={busy} title="Done" onPress={()=>void record("ACTIVITY",t.name,"Completed during visit","COMPLETED",t.id)}/><Button disabled={busy} title="Not done" onPress={()=>void record("ACTIVITY",t.name,"Not completed during visit","NOT_COMPLETED",t.id)}/></View>}</Card>)}
          {!detail?.tasks?.length&&<Empty text="No care tasks are due for this visit."/>}
          <Text style={styles.heading}>Medication checklist</Text>
          {detail?.medication?.map((m:Row)=>{const records=(detail.medicationAdministrations||[]).filter((a:Row)=>a.medicationId===m.id),pending=(m.dueSlots||[]).filter((slot:string)=>!records.some((a:Row)=>a.slot===slot)),complete=m.dueSlots?.length?pending.length===0:records.length>0;return <Card key={m.id}><Text style={styles.heading}>{m.name}</Text>{m.dose&&<Text style={styles.text}>Dose: {m.dose}</Text>}{m.route&&<Text style={styles.text}>Route: {m.route}</Text>}<Text style={styles.muted}>{m.instructions||"Follow the medication record instructions."}</Text>{m.type==="PRN"&&<Text style={styles.badge}>PRN · Minimum interval {m.timeBetweenDoses||"as prescribed"} {m.timeBetweenUnit||""}</Text>}{m.dueSlots?.length>0&&<Text style={styles.badge}>Due during visit: {m.dueSlots.join(", ")}</Text>}{records.map((record:Row)=><Text key={record.id} style={styles.badge}>Recorded: {record.outcome.replaceAll("_"," ")} · {record.slot}</Text>)}{!complete&&detail?.visit?.status==="IN_PROGRESS"?<Button disabled={busy} title="Record medication" onPress={()=>{setSelectedMedication(m);setMedicationAllergyAcknowledged(false);setMedicationOutcome(m.type==="PRN"?"PRN_ADMINISTERED":"ADMINISTERED");setMedicationSlot(pending[0]||m.slots?.[0]||"")}}/>:!complete?<Text style={styles.muted}>Check in before recording administration.</Text>:null}</Card>})}
          {!detail?.medication?.length&&<Empty text="No active medication schedule is listed."/>}
          {selectedMedication&&<Card>
            <Text style={styles.heading}>Record {selectedMedication.name}</Text>
            <Text style={styles.muted}>Select one outcome. Exceptions automatically create an alert for review.</Text>
            {!!detail?.allergyInformation&&['ADMINISTERED','PRN_ADMINISTERED'].includes(medicationOutcome)&&<Card><Text style={styles.error}>Recorded allergy information: {detail.allergyInformation}</Text><Button title={`${medicationAllergyAcknowledged?"✓ ":""}I reviewed this allergy information`} onPress={()=>setMedicationAllergyAcknowledged(value=>!value)}/></Card>}
            <View style={styles.row}>{(selectedMedication.type==="PRN"?["PRN_ADMINISTERED","REFUSED","NOT_AVAILABLE","OMITTED"]:["ADMINISTERED","REFUSED","NOT_AVAILABLE","OMITTED"]).map(outcome=><Button key={outcome} title={`${medicationOutcome===outcome?"✓ ":""}${outcome.replaceAll("_"," ")}`} onPress={()=>setMedicationOutcome(outcome)}/>)}</View>
            <Input label="MAR time slot" value={medicationSlot} onChangeText={setMedicationSlot} maxLength={80}/>
            {!['ADMINISTERED','PRN_ADMINISTERED'].includes(medicationOutcome)&&<Input label="Reason (required)" value={medicationReason} onChangeText={setMedicationReason} maxLength={500}/>}
            <Input label={medicationOutcome==="PRN_ADMINISTERED"?"Why was PRN medication needed?":"Medication note (optional)"} value={medicationNote} onChangeText={setMedicationNote} multiline maxLength={2000}/>
            {selectedMedication.stockTrackingEnabled&&['ADMINISTERED','PRN_ADMINISTERED'].includes(medicationOutcome)&&<><Text style={styles.badge}>Recorded stock: {selectedMedication.stockQuantity} {selectedMedication.stockUnit}</Text><Input label={`Quantity given (${selectedMedication.stockUnit})`} keyboardType="decimal-pad" value={medicationQuantity} onChangeText={setMedicationQuantity}/></>}
            {(selectedMedication.isControlledDrug||selectedMedication.requiresWitness)&&<><Text style={styles.muted}>A second active team member must witness this record.</Text>{detail?.witnesses?.map((witness:Row)=><Card key={witness.id} onPress={()=>setMedicationWitness(witness.id)}><Text style={styles.text}>{medicationWitness===witness.id?"✓ ":""}{witness.name}</Text></Card>)}</>}
            <View style={styles.row}><Button title="Cancel" onPress={()=>{setSelectedMedication(null);setMedicationAllergyAcknowledged(false)}}/><Button disabled={busy||(!!detail?.allergyInformation&&['ADMINISTERED','PRN_ADMINISTERED'].includes(medicationOutcome)&&!medicationAllergyAcknowledged)||(!['ADMINISTERED','PRN_ADMINISTERED'].includes(medicationOutcome)&&medicationReason.trim().length<3)||(medicationOutcome==="PRN_ADMINISTERED"&&medicationNote.trim().length<3)||(selectedMedication.stockTrackingEnabled&&['ADMINISTERED','PRN_ADMINISTERED'].includes(medicationOutcome)&&!(Number(medicationQuantity)>0))||((selectedMedication.isControlledDrug||selectedMedication.requiresWitness)&&!medicationWitness)} title={busy?"Saving…":"Confirm eMAR record"} onPress={()=>void recordMedication()}/></View>
          </Card>}
          <Text style={styles.heading}>Visit notes</Text>
          <Input label="What happened during the visit?" multiline maxLength={10000} value={note} onChangeText={setNote}/>
          <Button disabled={!!listening} title={listening==="note"?"Listening…":"Dictate visit note"} onPress={()=>void dictate("note")}/>
          <View style={styles.row}><Button disabled={busy||note.trim().length<2} title="Save note" onPress={()=>void record("NOTE","Visit note",note,"RECORDED")}/><Button disabled={busy||note.trim().length<10} title="Assist summary" onPress={async()=>{try{const x=await api<Row>("/api/mobile/note-assist","POST",{text:note});Alert.alert("Review this summary",x.summary+(x.attention?.length?"\n\nNeeds attention:\n"+x.attention.join("\n"):""));}catch(e){Alert.alert("Summary unavailable",(e as Error).message)}}}/></View>
          <Text style={styles.heading}>Report an incident</Text>
          <Input label="Incident details" multiline maxLength={10000} value={incident} onChangeText={setIncident}/>
          <Button disabled={!!listening} title={listening==="incident"?"Listening…":"Dictate incident details"} onPress={()=>void dictate("incident")}/>
          <Button disabled={busy||incident.trim().length<2} title="Submit incident alert" onPress={()=>void record("ALERT","Incident reported",incident,"OPEN","INCIDENT")}/>
          <Text style={styles.heading}>Photos</Text>
          <Input label="Photo caption (optional)" maxLength={500} value={caption} onChangeText={setCaption}/><Button disabled={busy} title="Take and upload photo" onPress={()=>void addPhoto()}/>
          {detail?.attachments?.map((a:Row)=><Card key={a.id}><Text style={styles.text}>{a.caption||a.name}</Text><Text style={styles.muted}>{timestamp(a.created_at)}</Text></Card>)}
          <Text style={styles.heading}>Recorded activity</Text>
          {detail?.entries?.map((e:Row)=><Card key={e.id}><Text style={styles.badge}>{e.kind} · {e.status}</Text><Text style={styles.heading}>{e.title}</Text>{e.body?<Text style={styles.text}>{e.body}</Text>:null}</Card>)}
        </>
      ) : data?.visits.length ? (
        data.visits.map((v) => (
          <Card key={v.id} onPress={() => void openVisit(v)}>
            <Text style={styles.badge}>
              {v.startTime} – {v.endTime}
            </Text>
            <Text style={styles.heading}>{v.clientName}</Text>
            <Text style={styles.text}>{v.title}</Text>
            <Text style={styles.muted}>
              {v.staffName || "Unassigned"} · {v.status.replaceAll("_", " ")}
            </Text>
          </Card>
        ))
      ) : (
        !loading && <Empty text="No visits scheduled for this date." />
      )}
    </ScrollView>
  );
}
export function People({ kind }: { kind: "clients" | "team" }) {
  const [search, setSearch] = useState(""),
    [page, setPage] = useState(1),
    [selected, setSelected] = useState<Row | null>(null),
    [feed,setFeed]=useState<Row[]>([]),
    [feedBody,setFeedBody]=useState(""),
    [feedKind,setFeedKind]=useState(kind==="clients"?"NOTE":"NOTE"),
    [feedBusy,setFeedBusy]=useState(false);
  const path =
    kind === "clients"
      ? "/api/client/get-all-clients"
      : "/api/team/get-all-users";
  const { data, error, loading, refresh } = useData<{
    users: Row[];
    totalCount: number;
  }>(path, "POST", { search, page, size: 20, isActive: true });
  async function open(id: string) {
    try {
      const [profile,history]=await Promise.all([
        api<Row>(
          kind === "clients"
            ? `/api/client/get-client/${id}`
            : `/api/team/get-user/${id}`,
        ),
        api<Row>(kind==="clients"?`/api/clients/${id}/feed?page=1`:`/api/team/${id}/feed?page=1`)
      ]);
      setSelected(profile);setFeed(kind==="clients"?(history.items||[]):(history.entries||[]));
    } catch (e) {
      Alert.alert("Unable to open profile", (e as Error).message);
    }
  }
  async function addFeed(){
    if(!selected)return;setFeedBusy(true);
    try{
      if(kind==="clients") await api(`/api/clients/${selected.id}/entries`,"POST",{kind:feedKind,visitId:null,title:feedKind==="NOTE"?"Mobile note":feedKind==="ALERT"?"Mobile concern":"Mobile action",body:feedBody,category:"Mobile",status:feedKind==="NOTE"?"RECORDED":"OPEN"});
      else await api(`/api/team/${selected.id}/feed`,"POST",{kind:feedKind,body:feedBody});
      setFeedBody("");await open(selected.id);
    }catch(e){Alert.alert("Entry could not be saved",(e as Error).message)}finally{setFeedBusy(false)}
  }
  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.page}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={refresh} />
      }
    >
      <Text style={styles.title}>
        {kind === "clients" ? "Clients" : "Team"}
      </Text>
      <ErrorText error={error} />
      {selected ? (
        <>
        <Card>
          <Button title="Back to list" onPress={() => setSelected(null)} />
          <Text style={styles.heading}>
            {selected.firstName} {selected.lastName}
          </Text>
          {[
            ["Email", selected.email],
            ["Phone", selected.primaryPhone],
            ["Date of birth", selected.dateOfBirth],
            ["Groups", selected.groups],
          ]
            .filter(([, v]) => v)
            .map(([k, v]) => (
              <Text key={k} style={styles.text}>
                {k}: {String(v)}
              </Text>
            ))}
          {selected.addresses?.map((a: Row, i: number) => (
            <Text key={i} style={styles.text}>
              {[a.addressLine1, a.addressLine2, a.city, a.postCode]
                .filter(Boolean)
                .join(", ")}
            </Text>
          ))}
          {selected.keyContacts?.map((c: Row, i: number) => (
            <Text key={i} style={styles.text}>
              Contact:{" "}
              {[c.firstName, c.lastName, c.name, c.phone, c.primaryPhone]
                .filter(Boolean)
                .join(" ")}
            </Text>
          ))}
        </Card>
        <Card>
          <Text style={styles.heading}>{kind==="clients"?"Client history":"Team history"}</Text>
          <View style={styles.row}>{(kind==="clients"?["NOTE","ALERT","ACTION"]:["NOTE","CONCERN","ACTION"]).map(k=><Button key={k} title={(feedKind===k?"✓ ":"")+k.toLowerCase()} onPress={()=>setFeedKind(k)}/>)}</View>
          <Input label={kind==="clients"?"Add a note, concern or action":"Add a staff note, concern or action"} value={feedBody} onChangeText={setFeedBody} multiline maxLength={4000}/>
          <Button title={feedBusy?"Saving…":"Add to history"} disabled={feedBusy||!feedBody.trim()} onPress={()=>void addFeed()}/>
        </Card>
        {feed.map(item=><Card key={item.id}><Text style={styles.badge}>{item.kind} · {item.status||"RECORDED"}</Text><Text style={styles.heading}>{item.title||item.author||"History entry"}</Text><Text style={styles.text}>{item.body||item.notes||"No details recorded"}</Text><Text style={styles.muted}>{timestamp(item.occurred_at||item.createdAt||item.created_at)}</Text></Card>)}
        {!feed.length&&<Empty text="No history has been recorded yet."/>}
        </>
      ) : (
        <>
          <Input
            label="Search name or email"
            value={search}
            onChangeText={(v) => {
              setSearch(v);
              setPage(1);
            }}
          />
          {data?.users.map((p) => (
            <Card key={p.id} onPress={() => void open(p.id)}>
              <Text style={styles.heading}>
                {p.firstName} {p.lastName}
              </Text>
              <Text style={styles.muted}>{p.email}</Text>
            </Card>
          ))}
          {!loading && !data?.users.length && (
            <Empty text="No matching people. Client access is controlled by care-team assignment." />
          )}
          <View style={styles.row}>
            <Button
              title="Previous"
              disabled={page === 1}
              onPress={() => setPage((p) => p - 1)}
            />
            <Text style={styles.muted}>Page {page}</Text>
            <Button
              title="Next"
              disabled={page * 20 >= (data?.totalCount || 0)}
              onPress={() => setPage((p) => p + 1)}
            />
          </View>
        </>
      )}
    </ScrollView>
  );
}
export function Inbox() {
  const [selected, setSelected] = useState<Row | null>(null),
    [compose, setCompose] = useState(false),
    [recipient, setRecipient] = useState(""),
    [subject, setSubject] = useState(""),
    [body, setBody] = useState(""),
    [busy, setBusy] = useState(false),
    [page, setPage] = useState(1);
  const list = useData<{ threads: Row[]; hasMore: boolean }>(
      `/api/inbox/threads?page=${page}`,
    ),
    people = useData<Row[]>("/api/inbox/people");
  const [messages, setMessages] = useState<Row[]>([]),
    [error, setError] = useState("");
  useEffect(() => {
    if (!selected) return;
    let active = true;
    async function load() {
      try {
        const result = await api<{ messages: Row[] }>(
          `/api/inbox/threads/${selected!.id}/messages`,
        );
        if (active) setMessages(result.messages);
        if (result.messages.length)
          await api(`/api/inbox/threads/${selected!.id}/read`, "POST", {
            throughSeq: result.messages.at(-1)!.seq,
          });
      } catch (e) {
        if (active) setError((e as Error).message);
      }
    }
    void load();
    const timer = setInterval(() => void load(), 15000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [selected]);
  async function send() {
    setBusy(true);
    setError("");
    try {
      if (compose) {
        const thread = await api<Row>("/api/inbox/threads", "POST", {
          subject,
          body,
          participantIds: [recipient],
        });
        setSelected(thread);
        setCompose(false);
        setSubject("");
      } else {
        await api(`/api/inbox/threads/${selected!.id}/messages`, "POST", {
          body,
        });
        setSelected({ ...selected });
      }
      setBody("");
      list.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.page}
      refreshControl={
        <RefreshControl refreshing={list.loading} onRefresh={list.refresh} />
      }
    >
      <Text style={styles.title}>Inbox</Text>
      <ErrorText error={error || list.error} />
      {compose ? (
        <>
          <Button title="Cancel" onPress={() => setCompose(false)} />
          <Text style={styles.muted}>Choose recipient</Text>
          {people.data?.map((p) => (
            <Card key={p.id} onPress={() => setRecipient(p.id)}>
              <Text style={styles.text}>
                {recipient === p.id ? "✓ " : ""}
                {p.name}
              </Text>
            </Card>
          ))}
          {!people.data?.length && (
            <Empty text="There are no other active staff members yet." />
          )}
          <Input
            label="Subject"
            value={subject}
            onChangeText={setSubject}
            maxLength={160}
          />
          <Input
            label="Message"
            value={body}
            onChangeText={setBody}
            maxLength={6000}
            multiline
          />
          <Button
            title="Send"
            disabled={busy || !recipient || !subject.trim() || !body.trim()}
            onPress={() => void send()}
          />
        </>
      ) : selected ? (
        <>
          <Button
            title="Back to inbox"
            onPress={() => {
              setSelected(null);
              setMessages([]);
              setBody("");
              list.refresh();
            }}
          />
          <Text style={styles.heading}>{selected.subject}</Text>
          <Text style={styles.muted}>
            Latest 50 messages. Refreshes every 15 seconds.
          </Text>
          {messages.map((m) => (
            <Card key={m.id}>
              <Text style={styles.badge}>{m.sender}</Text>
              <Text style={styles.text}>{m.body}</Text>
              <Text style={styles.muted}>{timestamp(m.createdAt)}</Text>
            </Card>
          ))}
          <Input
            label="Reply"
            multiline
            maxLength={6000}
            value={body}
            onChangeText={setBody}
          />
          <Button
            title="Send reply"
            disabled={busy || !body.trim()}
            onPress={() => void send()}
          />
        </>
      ) : (
        <>
          <Button
            title="New conversation"
            onPress={() => {
              setCompose(true);
              setRecipient("");
              setBody("");
              setSubject("");
            }}
          />
          {list.data?.threads.map((t) => (
            <Card
              key={t.id}
              onPress={() => {
                setSelected(t);
                setMessages([]);
                setError("");
              }}
            >
              <Text style={styles.heading}>
                {t.subject}
                {t.unread ? " (" + t.unread + ")" : ""}
              </Text>
              <Text style={styles.muted}>{t.preview}</Text>
            </Card>
          ))}
          {!list.loading && !list.data?.threads.length && (
            <Empty text="No conversations yet." />
          )}
          <View style={styles.row}>
            <Button
              title="Previous"
              disabled={page === 1}
              onPress={() => setPage((p) => p - 1)}
            />
            <Button
              title="Next"
              disabled={!list.data?.hasMore}
              onPress={() => setPage((p) => p + 1)}
            />
          </View>
        </>
      )}
    </ScrollView>
  );
}
export function More({ user, logout }: { user: User; logout: () => void }) {
  const [section, setSection] = useState(""),
    [data, setData] = useState<any>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const from = today().slice(0, 8) + "01",
    to = today();
  async function open(name: string) {
    setBusy(true);
    setError("");
    setSection(name);
    setData(null);
    try {
      const path =
        name === "Reporting"
          ? `/api/reports/summary?from=${from}&to=${to}`
          : name === "Log"
            ? `/api/activity?from=${from}&to=${to}`
            : `/api/finance/documents?kind=${name === "Staff pay" ? "PAYRUN" : "INVOICE"}&from=${from}&to=${to}`;
      setData(await api(path));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Text style={styles.title}>More</Text>
      <Text style={styles.muted}>{user.email}</Text>
      <ErrorText error={error} />
      {user.role !== "CAREGIVER" && (
        <>
          <View style={styles.row}>
            {["Reporting", "Invoices", "Staff pay", "Log"].map((n) => (
              <Button key={n} title={n} onPress={() => void open(n)} />
            ))}
          </View>
          <Text style={styles.muted}>
            This month: {from} to {to}. Financial summaries are read-only on
            mobile; manage rates and documents on the web.
          </Text>
          {busy && <Text style={styles.muted}>Loading...</Text>}
          {section === "Reporting" && data && (
            <>
              {data.byStatus.map((s: Row) => (
                <Card key={s.status}>
                  <Text style={styles.heading}>
                    {s.status.replaceAll("_", " ")}
                  </Text>
                  <Text style={styles.text}>
                    {s.visits} visits · {(s.minutes / 60).toFixed(1)} scheduled
                    hours
                  </Text>
                </Card>
              ))}
              {!data.byStatus.length && (
                <Empty text="No visits to report this month." />
              )}
            </>
          )}
          {["Invoices", "Staff pay"].includes(section) &&
            Array.isArray(data) && (
              <>
                {data.map((d: Row) => (
                  <Card key={d.id}>
                    <Text style={styles.heading}>{d.recipientName}</Text>
                    <Text style={styles.text}>
                      {currency(d.totalPence)} · {d.status}
                    </Text>
                    <Text style={styles.muted}>
                      {d.from} to {d.to}
                    </Text>
                  </Card>
                ))}
                {!data.length && <Empty text="No documents this month." />}
              </>
            )}
          {section === "Log" &&
            data?.entries?.map((e: Row) => (
              <Card key={e.id}>
                <Text style={styles.badge}>{e.actor}</Text>
                <Text style={styles.text}>
                  {e.path
                    .replace("/api/", "")
                    .split("/")
                    .filter((s: string) => !/[0-9a-f]{8}-/.test(s))
                    .join(" / ")}
                </Text>
                <Text style={styles.muted}>{timestamp(e.createdAt)}</Text>
              </Card>
            ))}
        </>
      )}
      <Card>
        <Text style={styles.heading}>Your session</Text>
        <Text style={styles.muted}>
          Sign out when using a shared device. The app needs an internet
          connection and does not store client records offline.
        </Text>
        <Button title="Sign out" onPress={logout} />
      </Card>
    </ScrollView>
  );
}
