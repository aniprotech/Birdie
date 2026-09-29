import React, { useCallback, useState } from "react";
import { Alert, RefreshControl, ScrollView, Text, View } from "react-native";
import { api, User } from "./api";
import { Button, Card, Input, styles, today, addDays } from "./ui";
import { DateInput } from "./pickers";

type Summary = {
  visitsToday: number;
  visitsTomorrow: number;
  clients: number;
  staff: number;
  alerts: number;
};

export function AdminHome({ user, navigate }: { user: User; navigate: (tab: string) => void }) {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const current = today();
      const next = addDays(current, 1);
      const [visits, clients, staff, alerts] = await Promise.all([
        api<{ visits: unknown[] }>(`/api/roster/visits?from=${current}&to=${next}`),
        api<{ totalCount: number }>("/api/client/get-all-clients", "POST", { page: 1, size: 1 }),
        api<{ totalCount: number }>("/api/team/get-all-users", "POST", { page: 1, size: 1 }),
        api<{ items: unknown[] }>("/api/inbox/items?filter=OPEN&page=1"),
      ]);
      setSummary({
        visitsToday: visits.visits.filter((visit: any) => String(visit.date || visit.visitDate).slice(0, 10) === current).length,
        visitsTomorrow: visits.visits.filter((visit: any) => String(visit.date || visit.visitDate).slice(0, 10) === next).length,
        clients: clients.totalCount,
        staff: staff.totalCount,
        alerts: alerts.items.length,
      });
    } catch (cause) {
      setError((cause as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);
  React.useEffect(() => { void refresh(); }, [refresh]);

  return <ScrollView contentContainerStyle={styles.page} refreshControl={<RefreshControl refreshing={loading} onRefresh={() => void refresh()} />}>
    <Text style={styles.title}>Admin workspace</Text>
    <Text style={styles.muted}>{user.firstName} {user.lastName} · {user.role.toLowerCase()}</Text>
    {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
    <Card>
      <Text style={styles.heading}>Care operations</Text>
      <Text style={styles.text}>Today: {summary?.visitsToday ?? "…"} visits · Tomorrow: {summary?.visitsTomorrow ?? "…"} visits</Text>
      <Text style={styles.text}>{summary?.clients ?? "…"} clients · {summary?.staff ?? "…"} staff · {summary?.alerts ?? "…"} open alerts</Text>
      <Button title="Manage rota and visits" onPress={() => navigate("Visits")} />
    </Card>
    <Card>
      <Text style={styles.heading}>People and care</Text>
      <Text style={styles.muted}>Open a client to review their care plan, risks, history and caregiver access. Add and update people within the mobile app.</Text>
      <View style={styles.row}>
        <Button title="Clients" onPress={() => navigate("Clients")} />
        <Button title="Team" onPress={() => navigate("Team")} />
      </View>
    </Card>
    <Card>
      <Text style={styles.heading}>Communication and management</Text>
      <View style={styles.row}>
        <Button title="Inbox" onPress={() => navigate("Inbox")} />
        <Button title="Alerts, reports and finance" onPress={() => navigate("More")} />
      </View>
    </Card>
  </ScrollView>;
}

const planSections = [
  ["administrative", "General care"], ["communication", "Communication"],
  ["personal-care", "Personal care"], ["nutrition-hydration", "Nutrition and hydration"],
  ["every-day-activity", "Daily activities"], ["medication", "Medication"],
  ["behaviour", "Behaviour"], ["environmental", "Environmental safety"],
  ["mental-capacity", "Mental capacity"], ["social-support", "Social support"],
  ["end-of-life", "End-of-life care"], ["condition-specific", "Condition-specific care"],
  ["control-substances", "Controlled substances"], ["covid", "Infection and COVID"],
  ["dysphagia", "Swallowing and dysphagia"], ["environment-fire", "Fire safety"],
  ["financial", "Financial support"], ["psychological", "Psychological support"],
] as const;

export function CarePlanManager({ clientId, onSaved }: { clientId: string; onSaved: () => void }) {
  const [key, setKey] = useState<string>("personal-care");
  const [plan, setPlan] = useState<any>(null);
  const [summary, setSummary] = useState("");
  const [risk, setRisk] = useState("");
  const [mitigation, setMitigation] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const reload = useCallback(async () => {
    setBusy(true); setError("");
    try {
      const result = await api<any>(`/api/client-care-plan/${key}/${clientId}`);
      setPlan(result);
      setSummary(result.assessmentSummaryOutcomes || "");
    } catch (cause) { setError((cause as Error).message); }
    finally { setBusy(false); }
  }, [clientId, key]);
  React.useEffect(() => { void reload(); }, [reload]);
  async function saveSummary() {
    setBusy(true); setError("");
    try {
      await api(`/api/client-care-plan/${key}/${clientId}`, "PUT", { assessmentSummaryOutcomes: summary.trim() });
      await reload(); onSaved();
      Alert.alert("Care plan saved", "The updated summary is available to assigned caregivers.");
    } catch (cause) { setError((cause as Error).message); }
    finally { setBusy(false); }
  }
  async function saveRisk() {
    setBusy(true); setError("");
    try {
      await api(`/api/client-care-plan/${key}/risk/${clientId}`, "POST", { risk: risk.trim(), mitigation: mitigation.trim() });
      setRisk(""); setMitigation(""); await reload(); onSaved();
      Alert.alert("Risk saved", "The precaution is available in the client's care record.");
    } catch (cause) { setError((cause as Error).message); }
    finally { setBusy(false); }
  }
  return <Card>
    <Text style={styles.heading}>Manage care plan and risks</Text>
    <Text style={styles.muted}>Choose an area to record guidance and risks for this client.</Text>
    <View style={styles.row}>{planSections.map(([section, title]) =>
      <Button key={section} title={title} variant="secondary" selected={key===section} onPress={()=>setKey(section)}/>
    )}</View>
    {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
    {busy && <Text style={styles.muted}>Loading…</Text>}
    {plan && <>
      {Object.hasOwn(plan, "assessmentSummaryOutcomes") && <>
        <Input label="Care guidance and outcomes" value={summary} onChangeText={setSummary} multiline maxLength={8000}/>
        <Button title="Save care guidance" disabled={busy} onPress={()=>void saveSummary()}/>
      </>}
      {plan.risks?.map((item:any)=><View key={item.id} style={{gap:4}}>
        <Text style={styles.text}>Risk: {item.risk}</Text>
        {!!item.mitigation&&<Text style={styles.muted}>Precaution: {item.mitigation}</Text>}
      </View>)}
      <Input label="New risk" value={risk} onChangeText={setRisk} multiline maxLength={4000}/>
      <Input label="Precaution or mitigation" value={mitigation} onChangeText={setMitigation} multiline maxLength={4000}/>
      <Button title="Add risk" disabled={busy||!risk.trim()} onPress={()=>void saveRisk()}/>
    </>}
  </Card>;
}

export function PrnLimitsManager({medications,onSaved}:{medications:any[];onSaved:()=>void}) {
  const [selected,setSelected]=useState<any>(null);
  const [interval,setIntervalValue]=useState("4"),[intervalUnit,setIntervalUnit]=useState("hours");
  const [maximum,setMaximum]=useState("1"),[period,setPeriod]=useState("24"),[periodUnit,setPeriodUnit]=useState("hours");
  const [busy,setBusy]=useState(false),[error,setError]=useState("");
  const prn=medications.filter((item)=>item.type==="PRN"&&!item.isStopped);
  function edit(item:any){setSelected(item);setIntervalValue(String(item.timeBetweenDoses||""));setIntervalUnit(item.timeBetweenUnit||"hours");setMaximum(String(item.maxDoseCount||""));setPeriod(String(item.maxDosePeriod||""));setPeriodUnit(item.maxDoseUnit||"hours");setError("")}
  async function save(){
    if(!selected)return;
    setBusy(true);setError("");
    try{
      await api(`/api/mobile/admin/medication/${selected.id}/prn-limits`,"PUT",{timeBetweenDoses:Number(interval),timeBetweenUnit:intervalUnit,maxDoseCount:Number(maximum),maxDosePeriod:Number(period),maxDoseUnit:periodUnit});
      setSelected(null);onSaved();Alert.alert("PRN limits saved","The updated limits now protect mobile administration records.");
    }catch(cause){setError((cause as Error).message)}finally{setBusy(false)}
  }
  return <Card><Text style={styles.heading}>PRN medication safety</Text>
    <Text style={styles.muted}>Configure the prescription's minimum time between doses and maximum number of doses. Caregivers cannot record a PRN administration until both limits are set.</Text>
    {!!error&&<Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
    {prn.map((item)=><View key={item.id} style={{marginTop:10}}><Text style={styles.text}>{item.medicationName} · {item.dose}</Text><Text style={styles.muted}>{item.timeBetweenDoses?`${item.timeBetweenDoses} ${item.timeBetweenUnit} apart`:"Interval missing"} · {item.maxDoseCount?`${item.maxDoseCount} dose(s) per ${item.maxDosePeriod} ${item.maxDoseUnit}`:"Maximum missing"}</Text><Button variant="secondary" title="Edit PRN limits" onPress={()=>edit(item)}/></View>)}
    {!prn.length&&<Text style={styles.muted}>No active PRN medication is recorded for this client.</Text>}
    {!!selected&&<><Text style={styles.heading}>Limits for {selected.medicationName}</Text>
      <Input label="Minimum number of time units between doses" value={interval} onChangeText={setIntervalValue} keyboardType="number-pad"/>
      <View style={styles.row}>{["minutes","hours","days"].map((unit)=><Button key={unit} variant="secondary" selected={intervalUnit===unit} title={unit} onPress={()=>setIntervalUnit(unit)}/>)}</View>
      <Input label="Maximum number of doses" value={maximum} onChangeText={setMaximum} keyboardType="number-pad"/>
      <Input label="Per number of time units" value={period} onChangeText={setPeriod} keyboardType="number-pad"/>
      <View style={styles.row}>{["hours","days","weeks"].map((unit)=><Button key={unit} variant="secondary" selected={periodUnit===unit} title={unit} onPress={()=>setPeriodUnit(unit)}/>)}</View>
      <Button title="Save PRN limits" disabled={busy||![interval,maximum,period].every((value)=>Number.isSafeInteger(Number(value))&&Number(value)>0)} onPress={()=>void save()}/>
      <Button variant="secondary" title="Cancel" onPress={()=>setSelected(null)}/>
    </>}
  </Card>;
}

export function TaskPlanManager({clientId,onSaved}:{clientId:string;onSaved:()=>void}) {
  const [plans,setPlans]=useState<any[]>([]),[library,setLibrary]=useState<any[]>([]),[search,setSearch]=useState("");
  const [taskId,setTaskId]=useState(""),[details,setDetails]=useState(""),[startDate,setStartDate]=useState(today()),[endDate,setEndDate]=useState("");
  const [frequency,setFrequency]=useState("DAILY"),[days,setDays]=useState<string[]>([]),[essential,setEssential]=useState(false);
  const [busy,setBusy]=useState(false),[error,setError]=useState("");
  async function load(){setBusy(true);setError("");try{
    const result=await api<{taskPlans:any[]}>(`/api/client-task-plan/getByClient/${clientId}?page=1&size=100`);
    setPlans(result.taskPlans||[]);
    const tasks=await api<{tasks:any[]}>(`/api/task-library?page=1&search=${encodeURIComponent(search)}`);
    setLibrary(tasks.tasks||[]);
  }catch(cause){setError((cause as Error).message)}finally{setBusy(false)}}
  React.useEffect(()=>{void load()},[clientId]);
  async function save(){setBusy(true);setError("");try{
    await api("/api/client-task-plan/create","POST",{userId:clientId,taskId,details:details.trim(),startDate,endDate:endDate||null,frequency,selectedDays:frequency==="WEEKLY"?days:[],isAnyTime:true,sessions:[],timesPerDay:1,isEssential:essential});
    setTaskId("");setDetails("");setEndDate("");setDays([]);await load();onSaved();
    Alert.alert("Task scheduled","The task is available on matching visits in Caremonitor.");
  }catch(cause){setError((cause as Error).message)}finally{setBusy(false)}}
  return <Card><Text style={styles.heading}>Client task planner</Text>
    {!!error&&<Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
    {plans.map(plan=><View key={plan.id} style={{marginTop:8}}><Text style={styles.text}>{plan.taskName} · {plan.frequency}{plan.isEssential?" · Essential":""}</Text><Text style={styles.muted}>{plan.startDate}{plan.endDate?` to ${plan.endDate}`:" onward"}{plan.details?` · ${plan.details}`:""}</Text></View>)}
    {!plans.length&&<Text style={styles.muted}>No task plan is scheduled.</Text>}
    <Input label="Find a care task" value={search} onChangeText={setSearch}/>
    <Button variant="secondary" disabled={busy} title="Search task library" onPress={()=>void load()}/>
    <View style={styles.row}>{library.map(task=><Button key={task.id} variant="secondary" selected={taskId===task.id} title={task.name} onPress={()=>setTaskId(task.id)}/>)}</View>
    <Input label="Instructions for this client" value={details} onChangeText={setDetails} multiline maxLength={20000}/>
    <DateInput label="Start date" value={startDate} onChangeText={setStartDate}/>
    <DateInput label="End date (optional)" value={endDate} onChangeText={setEndDate} optional minDate={startDate}/>
    <View style={styles.row}>{["DAILY","WEEKLY"].map(value=><Button key={value} variant="secondary" selected={frequency===value} title={value} onPress={()=>setFrequency(value)}/>)}</View>
    {frequency==="WEEKLY"&&<View style={styles.row}>{["MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY","SUNDAY"].map(day=><Button key={day} variant="secondary" selected={days.includes(day)} title={day.slice(0,3)} onPress={()=>setDays(current=>current.includes(day)?current.filter(value=>value!==day):[...current,day])}/>)}</View>}
    <Button variant="secondary" selected={essential} title={essential?"Essential task ✓":"Mark as essential"} onPress={()=>setEssential(value=>!value)}/>
    <Button title="Schedule task" disabled={busy||!taskId||!/^\d{4}-\d{2}-\d{2}$/.test(startDate)||!!endDate&&!/^\d{4}-\d{2}-\d{2}$/.test(endDate)||!!endDate&&endDate<startDate||frequency==="WEEKLY"&&!days.length} onPress={()=>void save()}/>
  </Card>;
}
