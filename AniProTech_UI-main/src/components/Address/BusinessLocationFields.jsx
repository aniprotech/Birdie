import { useEffect, useId, useMemo, useState } from "react";

const inputClass = "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-customBlue focus:ring-2 focus:ring-customBlue/20";
const postalRules = {
  GB: { pattern:"[A-Za-z]{1,2}[0-9][A-Za-z0-9]? ?[0-9][A-Za-z]{2}", hint:"Example: SW1A 1AA" },
  IN: { pattern:"[1-9][0-9]{5}", hint:"6-digit PIN code" },
  US: { pattern:"[0-9]{5}(-[0-9]{4})?", hint:"Example: 10001 or 10001-1234" },
  CA: { pattern:"[A-Za-z][0-9][A-Za-z] ?[0-9][A-Za-z][0-9]", hint:"Example: A1A 1A1" },
  AU: { pattern:"[0-9]{4}", hint:"4-digit postcode" },
};

export default function BusinessLocationFields({ form, setForm }) {
  const uid=useId().replaceAll(":","");
  const [locationApi,setLocationApi]=useState(null);
  useEffect(()=>{ import("country-state-city").then(setLocationApi); },[]);
  const countries=useMemo(()=>locationApi?.Country.getAllCountries().sort((a,b)=>a.name.localeCompare(b.name))||[],[locationApi]);
  const country=useMemo(()=>countries.find(c=>c.name===form.country)||countries.find(c=>c.isoCode===form.countryCode)||null,[countries,form.country,form.countryCode]);
  const states=useMemo(()=>country&&locationApi?locationApi.State.getStatesOfCountry(country.isoCode):[],[country,locationApi]);
  const state=useMemo(()=>states.find(s=>s.name===form.state)||states.find(s=>s.isoCode===form.stateCode)||null,[states,form.state,form.stateCode]);
  const cities=useMemo(()=>country&&state&&locationApi?locationApi.City.getCitiesOfState(country.isoCode,state.isoCode):[],[country,state,locationApi]);
  const timezones=country?.timezones?.map(t=>t.zoneName).filter(Boolean)||[];
  const postal=postalRules[country?.isoCode];
  const chooseCountry=(iso)=>{
    const next=countries.find(c=>c.isoCode===iso);
    const local=Intl.DateTimeFormat().resolvedOptions().timeZone;
    const zones=next?.timezones?.map(t=>t.zoneName).filter(Boolean)||[];
    setForm({...form,country:next?.name||"",countryCode:next?.isoCode||"",state:"",stateCode:"",city:"",timezone:zones.includes(local)?local:(zones[0]||local)});
  };
  const chooseState=(name)=>{
    const next=states.find(s=>s.name===name);
    setForm({...form,state:name,stateCode:next?.isoCode||"",city:""});
  };
  return <>
    <label className="block text-left text-sm font-medium text-gray-700">Country <span className="text-red-500">*</span><select required disabled={!locationApi} value={country?.isoCode||""} onChange={e=>chooseCountry(e.target.value)} className={inputClass}><option value="">{locationApi?"Select a country":"Loading countries…"}</option>{countries.map(c=><option key={c.isoCode} value={c.isoCode}>{c.name}</option>)}</select></label>
    <label className="block text-left text-sm font-medium text-gray-700">State or region <span className="text-red-500">*</span><input required list={`${uid}-states`} value={form.state||""} onChange={e=>chooseState(e.target.value)} placeholder={states.length?"Choose or type a state/region":"Type state or region"} className={inputClass}/><datalist id={`${uid}-states`}>{states.map(s=><option key={s.isoCode} value={s.name}/>)}</datalist></label>
    <label className="block text-left text-sm font-medium text-gray-700">Town or city <span className="text-red-500">*</span><input required list={`${uid}-cities`} value={form.city||""} onChange={e=>setForm({...form,city:e.target.value})} placeholder={state?"Choose or type a city":"Select a state first"} className={inputClass}/><datalist id={`${uid}-cities`}>{cities.map(c=><option key={`${c.name}-${c.latitude}-${c.longitude}`} value={c.name}/>)}</datalist></label>
    <label className="block text-left text-sm font-medium text-gray-700">Postcode <span className="text-red-500">*</span><input required value={form.postcode||""} pattern={postal?.pattern} onChange={e=>setForm({...form,postcode:e.target.value})} placeholder={postal?.hint||"Postal or ZIP code"} className={inputClass}/>{postal&&<span className="mt-1 block text-xs text-gray-500">{postal.hint}</span>}</label>
    <label className="block text-left text-sm font-medium text-gray-700">Timezone <span className="text-red-500">*</span><input required list={`${uid}-timezones`} value={form.timezone||""} onChange={e=>setForm({...form,timezone:e.target.value})} className={inputClass}/><datalist id={`${uid}-timezones`}>{timezones.map(zone=><option key={zone} value={zone}/>)}</datalist><span className="mt-1 block text-xs text-gray-500">Set automatically from the country; editable when the country has multiple timezones.</span></label>
  </>;
}
