import React, { useEffect, useState } from "react";
import { Alert, Text, View } from "react-native";
import { api } from "./api";
import { Button, Card, Input, styles } from "./ui";

type Row = Record<string, any>;
type Account = { user: Row; organisation: Row };
const businessTypes = ["HOME_CARE", "LIVE_IN_CARE", "SUPPORTED_LIVING", "CARE_HOME", "OTHER"];

export function OrganisationSettings() {
  const [account, setAccount] = useState<Account | null>(null);
  const [form, setForm] = useState<Row>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function load() {
    setBusy(true); setError("");
    try {
      const result = await api<Account>("/api/account");
      setAccount(result);
      const organisation = result.organisation;
      setForm({
        organisationName: organisation.name || "", legalName: organisation.legal_name || "",
        businessType: organisation.business_type || "HOME_CARE", registrationNumber: organisation.registration_number || "",
        organisationPhone: organisation.phone || "", website: organisation.website || "",
        addressLine1: organisation.address_line1 || "", addressLine2: organisation.address_line2 || "",
        state: organisation.state || "", city: organisation.city || "", postcode: organisation.postcode || "",
        country: organisation.country || "", timezone: organisation.timezone || "",
        supportEmail: organisation.support_email || "", supportPhone: organisation.support_phone || "",
        carerAppMessage: organisation.carer_app_message || "",
        allowPhotoUploads: organisation.carer_app_settings?.allowPhotoUploads !== false,
        requireLocationForCheckIn: organisation.carer_app_settings?.requireLocationForCheckIn !== false,
        allowVoiceNotes: organisation.carer_app_settings?.allowVoiceNotes !== false,
        notifyClientOnArrival: organisation.carer_app_settings?.notifyClientOnArrival !== false,
      });
    } catch (cause) { setError((cause as Error).message); }
    finally { setBusy(false); }
  }
  useEffect(() => { void load(); }, []);
  function change(name:string, value:string|boolean) { setForm(current => ({ ...current, [name]:value })); }
  async function save() {
    if (!account) return;
    setBusy(true); setError("");
    try {
      await api("/api/account", "PUT", {
        ...form,
        firstName:account.user.first_name, lastName:account.user.last_name,
        email:account.user.email, primaryPhone:account.user.primary_phone || "",
        carerAppSettings:JSON.stringify({
          allowPhotoUploads:form.allowPhotoUploads,
          requireLocationForCheckIn:form.requireLocationForCheckIn,
          allowVoiceNotes:form.allowVoiceNotes,
          notifyClientOnArrival:form.notifyClientOnArrival,
        }),
      });
      await load();
      Alert.alert("Organisation saved", "The mobile and web applications now use the updated organisation settings.");
    } catch (cause) { setError((cause as Error).message); }
    finally { setBusy(false); }
  }
  const fields:[string,string,number?][] = [
    ["organisationName","Organisation name",160],["legalName","Legal name",160],
    ["registrationNumber","Registration number",80],["organisationPhone","Organisation phone",30],
    ["website","Website",300],["addressLine1","Address line 1",200],["addressLine2","Address line 2",200],
    ["city","City",100],["state","County or region",100],["postcode","Postcode",20],
    ["country","Country",80],["timezone","Time zone",80],
    ["supportEmail","Support email",254],["supportPhone","Support phone",30],
  ];
  return <>
    <Text style={styles.heading}>Organisation settings</Text>
    <Text style={styles.muted}>Changes here also update the web application. Review the address and contact details before saving.</Text>
    {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
    {busy && <Text style={styles.muted}>Loading…</Text>}
    {account && <Card>
      {fields.map(([name,label,maxLength]) => <Input key={name} label={label} value={String(form[name] || "")} onChangeText={value=>change(name,value)} maxLength={maxLength} />)}
      <Text style={styles.heading}>Business type</Text>
      <View style={styles.row}>{businessTypes.map(type=><Button key={type} variant="secondary" selected={form.businessType===type} title={type.replaceAll("_"," ")} onPress={()=>change("businessType",type)}/>)}</View>
      <Input label="Message shown to caregivers" value={String(form.carerAppMessage||"")} onChangeText={value=>change("carerAppMessage",value)} multiline maxLength={1000}/>
      {([
        ["allowPhotoUploads","Allow visit photos"],
        ["requireLocationForCheckIn","Require location for check-in"],
        ["allowVoiceNotes","Allow voice dictation"],
      ] as const).map(([name,label])=><Button key={name} variant="secondary" selected={!!form[name]} title={`${label}: ${form[name]?"On":"Off"}`} onPress={()=>change(name,!form[name])}/>)}
      <Button title="Save organisation settings" disabled={busy||!form.organisationName?.trim()||!form.organisationPhone?.trim()||!form.addressLine1?.trim()||!form.city?.trim()||!form.state?.trim()||!form.postcode?.trim()||!form.country?.trim()||!form.timezone?.trim()} onPress={()=>Alert.alert("Save organisation settings?","These changes affect everyone in this organisation.",[{text:"Cancel",style:"cancel"},{text:"Save",onPress:()=>void save()}])}/>
    </Card>}
  </>;
}
