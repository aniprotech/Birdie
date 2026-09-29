import React from "react";
import { Text, View } from "react-native";
import Svg, { Circle, Path, Rect } from "react-native-svg";
import { styles } from "./ui";

type Region = "head" | "neck" | "shoulder" | "chest" | "abdomen" | "back" | "arm" | "hand" | "hip" | "thigh" | "knee" | "lower leg" | "foot";
type Site = { region:Region; side:"Left"|"Right"|"Centre"; view:"Front"|"Back"; label:string };

const regions: { region:Region; pattern:RegExp; y:number; x:number }[] = [
  {region:"head",pattern:/\b(head|face|scalp)\b/i,y:22,x:80},
  {region:"neck",pattern:/\bneck\b/i,y:48,x:80},
  {region:"shoulder",pattern:/\bshoulder\b/i,y:66,x:60},
  {region:"chest",pattern:/\b(chest|breast)\b/i,y:85,x:80},
  {region:"abdomen",pattern:/\b(abdomen|stomach|belly)\b/i,y:112,x:80},
  {region:"back",pattern:/\bback\b/i,y:91,x:80},
  {region:"arm",pattern:/\b(arm|forearm|elbow)\b/i,y:103,x:46},
  {region:"hand",pattern:/\b(hand|wrist|finger)\b/i,y:155,x:35},
  {region:"hip",pattern:/\b(hip|pelvis|buttock)\b/i,y:141,x:69},
  {region:"thigh",pattern:/\b(thigh|upper leg)\b/i,y:174,x:68},
  {region:"knee",pattern:/\bknee\b/i,y:207,x:68},
  {region:"lower leg",pattern:/\b(lower leg|calf|shin|leg)\b/i,y:233,x:68},
  {region:"foot",pattern:/\b(foot|feet|ankle|heel|toe)\b/i,y:267,x:67},
];

function parseSites(value:string):Site[] {
  return value.split(/[\n;]+/).flatMap(line=>{
    const text=line.trim();
    if(!text)return [];
    const match=regions.find(item=>item.pattern.test(text));
    if(!match)return [];
    const side=/\bleft\b/i.test(text)?"Left":/\bright\b/i.test(text)?"Right":"Centre";
    if(side==="Centre"&&["shoulder","arm","hand","hip","thigh","knee","lower leg","foot"].includes(match.region))return [];
    const view=/\b(back|rear|posterior)\b/i.test(text)||/\b(upper|lower) back\b/i.test(text)?"Back":"Front";
    return [{region:match.region,side,view,label:text}];
  });
}

function point(site:Site) {
  const base=regions.find(item=>item.region===site.region)!;
  const lateral=!["head","neck","chest","abdomen","back"].includes(site.region);
  const x=site.side==="Centre"?base.x:site.side==="Left"?(site.view==="Front"?160-base.x:base.x):(site.view==="Front"?base.x:160-base.x);
  return {x:lateral?x:site.side==="Centre"?80:site.side==="Left"?(site.view==="Front"?93:67):(site.view==="Front"?67:93),y:base.y};
}

export function BodyDiagram({site}:{site:Site}) {
  const {x,y}=point(site);
  return <View accessible accessibilityLabel={`Approximate ${site.view.toLowerCase()} body region: ${site.side.toLowerCase()} ${site.region}`} style={{alignItems:"center",paddingVertical:8}}>
    <Text style={styles.badge}>{site.view} · {site.side} {site.region}</Text>
    <Svg width={160} height={290} viewBox="0 0 160 290" role="img">
      <Circle cx={80} cy={24} r={17} fill="#dbeaf1" stroke="#7894a5" strokeWidth={2}/>
      <Rect x={75} y={42} width={10} height={13} rx={3} fill="#dbeaf1" stroke="#7894a5"/>
      <Path d="M55 55 Q80 50 105 55 L112 132 Q100 148 80 148 Q60 148 48 132 Z" fill="#dbeaf1" stroke="#7894a5" strokeWidth={2}/>
      <Path d="M55 61 L39 66 L27 150 Q26 158 34 159 L41 154 L59 72 Z" fill="#dbeaf1" stroke="#7894a5" strokeWidth={2}/>
      <Path d="M105 61 L121 66 L133 150 Q134 158 126 159 L119 154 L101 72 Z" fill="#dbeaf1" stroke="#7894a5" strokeWidth={2}/>
      <Path d="M57 137 L78 146 L76 258 L69 278 L56 278 L55 257 Z" fill="#dbeaf1" stroke="#7894a5" strokeWidth={2}/>
      <Path d="M103 137 L82 146 L84 258 L91 278 L104 278 L105 257 Z" fill="#dbeaf1" stroke="#7894a5" strokeWidth={2}/>
      <Circle cx={x} cy={y} r={9} fill="#e23d3d" stroke="white" strokeWidth={3}/>
    </Svg>
    <Text style={styles.muted}>Approximate region only. Follow the written care instructions for the exact site.</Text>
  </View>;
}

export function MedicationBodyMap({value}:{value:string}) {
  const sites=parseSites(value);
  return <View>
    {sites.map((site,index)=><BodyDiagram key={`${site.label}-${index}`} site={site}/>)}
    {!sites.length&&<Text style={styles.muted}>No region could be plotted. Read the written application site below.</Text>}
    <Text style={styles.text}>{value}</Text>
  </View>;
}

export function SkinBodyMap({side,region}:{side:string;region:string}) {
  if(!region)return <Text style={styles.muted}>Choose a body region to preview its approximate position.</Text>;
  const sites=parseSites(`${side} ${region}`);
  return sites[0]?<BodyDiagram site={sites[0]}/>:<Text style={styles.muted}>The selected region cannot be plotted; it will still be saved in the observation.</Text>;
}
