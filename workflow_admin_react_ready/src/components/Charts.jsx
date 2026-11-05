import {useRef,useState} from "react";

function tooltipPosition(_container,clientX,clientY) {
  const width=210,height=110;
  let left=clientX+14;
  if(left+width>window.innerWidth) left=clientX-width-14;
  left=Math.max(8,Math.min(left,Math.max(8,window.innerWidth-width-8)));
  let top=clientY-height-10;
  if(top<8) top=clientY+14;
  top=Math.max(8,Math.min(top,Math.max(8,window.innerHeight-height-8)));
  return {left,top};
}

function ChartTooltip({tip}) {
  if(!tip) return null;
  return <div className="chart-tip" style={{left:tip.left,top:tip.top}} aria-hidden="true">
    <b>{tip.title}</b>
    {tip.rows.map(row=><div className="tip-row" key={row.name}>
      <i style={{background:row.color}}/><span>{row.name}</span><strong>{row.value}</strong>
    </div>)}
  </div>
}

export function DonutChart({items,centerLabel="Projets",size=176,thickness=20}) {
  const containerRef=useRef(null);
  const [tip,setTip]=useState(null);
  const total=items.reduce((a,b)=>a+b.value,0)||1;
  const r=(size-thickness)/2, circumference=2*Math.PI*r, mid=size/2;
  let offset=0;
  return <div className="donut-layout chart-hover" ref={containerRef}>
    <div className="donut" style={{"--s":`${size}px`}}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${centerLabel}: ${total}`}>
        <circle cx={mid} cy={mid} r={r} fill="none" strokeWidth={thickness} stroke="var(--surface-3)"/>
        {items.map(item=>{
          const len=item.value/total*circumference;
          const gap=items.length>1&&item.value?3:0;
          const visible=Math.max(0,len-gap);
          const currentOffset=offset;
          offset+=len;
          return <circle key={item.label} cx={mid} cy={mid} r={r} fill="none" strokeWidth={thickness}
            stroke={item.color} strokeDasharray={`${visible} ${circumference-visible}`}
            strokeDashoffset={-currentOffset} transform={`rotate(-90 ${mid} ${mid})`}
            onPointerMove={event=>setTip({...tooltipPosition(containerRef.current,event.clientX,event.clientY),title:item.label,rows:[{name:centerLabel,value:item.value,color:item.color}]})}
            onPointerLeave={()=>setTip(null)}>
          </circle>
        })}
      </svg>
      <div className="donut-center"><strong>{total}</strong><span>{centerLabel}</span></div>
    </div>

    {/* Modification demandée : légende verticale, une information par ligne. */}
    <ul className="donut-legend-vertical">
      {items.map(i=><li key={i.label}><i style={{background:i.color}}/><span>{i.label}</span><strong>{i.value}</strong></li>)}
    </ul>
    <ChartTooltip tip={tip}/>
  </div>
}

export function Sparkline({data,color="var(--accent)",labels=[],name="Valeur"}) {
  const containerRef=useRef(null);
  const [hoverIndex,setHoverIndex]=useState(null);
  const max=Math.max(...data),min=Math.min(...data),range=max-min||1;
  const pointX=i=>i/(data.length-1||1)*100;
  const pointY=i=>32-(data[i]-min)/range*24-4;
  const points=data.map((v,i)=>`${pointX(i)},${pointY(i)}`).join(" ");
  const handleMove=event=>{
    const bounds=event.currentTarget.getBoundingClientRect();
    const ratio=Math.max(0,Math.min(1,(event.clientX-bounds.left)/bounds.width));
    setHoverIndex(Math.round(ratio*(data.length-1)));
  };
  const svgBounds=containerRef.current?.querySelector("svg")?.getBoundingClientRect();
  const tip=hoverIndex===null||!svgBounds?null:{...tooltipPosition(containerRef.current,
    svgBounds.left+pointX(hoverIndex)/100*svgBounds.width,svgBounds.top+pointY(hoverIndex)/32*svgBounds.height),
    title:labels[hoverIndex]||name,rows:[{name,value:data[hoverIndex],color}]};
  return <div className="sparkline-hover chart-hover" ref={containerRef} onMouseLeave={()=>setHoverIndex(null)}>
    <svg className="sparkline" viewBox="0 0 100 32" preserveAspectRatio="none" onMouseMove={handleMove}>
      <polyline fill="none" stroke={color} strokeWidth="2" points={points}/>
      {hoverIndex!==null&&<circle cx={pointX(hoverIndex)} cy={pointY(hoverIndex)} r="2.5" fill={color} stroke="var(--surface)" strokeWidth="1.5"/>}
    </svg>
    <ChartTooltip tip={tip}/>
  </div>
}

export function HealthGauge({value}) {
  const containerRef=useRef(null);
  const [tip,setTip]=useState(null);
  const radius=54, circumference=2*Math.PI*radius, dash=value/100*circumference;
  const handleMove=event=>{
    const bounds=event.currentTarget.getBoundingClientRect();
    const x=(event.clientX-bounds.left)/bounds.width*140-70;
    const y=(event.clientY-bounds.top)/bounds.height*140-70;
    const distance=Math.hypot(x,y);
    if(distance<47||distance>61){setTip(null);return;}
    setTip({...tooltipPosition(containerRef.current,event.clientX,event.clientY),title:"Santé globale",rows:[{name:"Santé",value:`${value}%`,color:"var(--accent)"}]});
  };
  return <div className="health-gauge chart-hover" ref={containerRef} onMouseLeave={()=>setTip(null)}>
    <svg viewBox="0 0 140 140" onMouseMove={handleMove}>
      <circle cx="70" cy="70" r={radius} fill="none" stroke="var(--surface-3)" strokeWidth="12"/>
      <circle cx="70" cy="70" r={radius} fill="none" stroke="var(--accent)" strokeWidth="12"
        strokeDasharray={`${dash} ${circumference-dash}`} strokeLinecap="round" transform="rotate(-90 70 70)"/>
    </svg>
    <div><strong>{value}%</strong><span>Santé</span></div>
    <ChartTooltip tip={tip}/>
  </div>
}

export function SimpleBars({items,max=100,unit="%",name="Avancement"}) {
  const containerRef=useRef(null);
  const [tip,setTip]=useState(null);
  return <div className="chart-hover simple-bars" ref={containerRef} onMouseLeave={()=>setTip(null)}><ul className="hbars">{items.map(i=><li key={i.label}>
    <div className="hbar-top"><span>{i.label}</span><strong>{i.value}{unit}</strong></div>
    <div className="simple-bar-track" onMouseMove={event=>setTip({...tooltipPosition(containerRef.current,event.clientX,event.clientY),title:i.label,rows:[{name,value:`${i.value}${unit}`,color:i.color||"var(--accent)"}]})} onMouseLeave={()=>setTip(null)}>
      <div className="progress"><i style={{"--v":`${Math.min(100,i.value/max*100)}%`,background:i.color||"var(--accent)"}}/></div>
    </div>
  </li>)}</ul><ChartTooltip tip={tip}/></div>
}

export function LineChart({labels,series,height=260,unit=""}) {
  const containerRef=useRef(null);
  const [hoverIndex,setHoverIndex]=useState(null);
  const width=700, left=38,right=12,top=12,bottom=30;
  const all=series.flatMap(s=>s.data), min=Math.min(...all,0), max=Math.max(...all)*1.1||1;
  const x=i=>left+i*(width-left-right)/(labels.length-1);
  const y=v=>top+(height-top-bottom)-(v-min)/(max-min)*(height-top-bottom);
  const points=s=>s.data.map((v,i)=>`${x(i)},${y(v)}`).join(" ");
  const handleMove=event=>{
    const bounds=event.currentTarget.getBoundingClientRect();
    const chartX=(event.clientX-bounds.left)/bounds.width*width;
    const chartY=(event.clientY-bounds.top)/bounds.height*height;
    if(chartX<left||chartX>width-right||chartY<top||chartY>height-bottom){setHoverIndex(null);return;}
    setHoverIndex(Math.max(0,Math.min(labels.length-1,Math.round((chartX-left)/(width-left-right)*(labels.length-1)))));
  };
  const svgBounds=containerRef.current?.querySelector("svg")?.getBoundingClientRect();
  const tip=hoverIndex===null||!svgBounds?null:{...tooltipPosition(containerRef.current,
    svgBounds.left+x(hoverIndex)/width*svgBounds.width,
    svgBounds.top+Math.min(...series.map(s=>y(s.data[hoverIndex])))/height*svgBounds.height),
    title:labels[hoverIndex],rows:series.map(s=>({name:s.name,value:`${s.data[hoverIndex]}${unit}`,color:s.color}))};
  return <div className="chart-hover chart-svg-wrap" ref={containerRef} onMouseLeave={()=>setHoverIndex(null)}>
    <svg className="chart-svg" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" onMouseMove={handleMove}>
    {[0,1,2,3,4].map(i=>{
      const yy=top+i*(height-top-bottom)/4;
      return <line key={i} x1={left} x2={width-right} y1={yy} y2={yy} className="chart-grid"/>
    })}
    {hoverIndex!==null&&<rect className="chart-hover-band" x={Math.max(left,x(hoverIndex)-12)} y={top} width="24" height={height-top-bottom}/>}
    {series.map(s=><polyline key={s.name} points={points(s)} fill="none" stroke={s.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>)}
    {labels.map((l,i)=><text key={l} x={x(i)} y={height-7} textAnchor="middle" className="chart-axis">{l}</text>)}
    {hoverIndex!==null&&<><line className="chart-hover-guide" x1={x(hoverIndex)} x2={x(hoverIndex)} y1={top} y2={height-bottom}/>{series.map(s=><circle key={s.name} className="chart-hover-dot" cx={x(hoverIndex)} cy={y(s.data[hoverIndex])} r="4" fill={s.color}/>)}</>}
    </svg>
    <ChartTooltip tip={tip}/>
  </div>
}

export function BarChart({labels,series,height=260}) {
  const containerRef=useRef(null);
  const [hoverIndex,setHoverIndex]=useState(null);
  const width=700,left=38,right=12,top=12,bottom=30;
  const max=Math.max(...series.flatMap(s=>s.data),1)*1.1;
  const groupW=(width-left-right)/labels.length;
  const barW=Math.min(18,groupW/(series.length+1));
  const barHeight=value=>(value/max)*(height-top-bottom);
  const handleMove=event=>{
    const bounds=event.currentTarget.getBoundingClientRect();
    const chartX=(event.clientX-bounds.left)/bounds.width*width;
    const chartY=(event.clientY-bounds.top)/bounds.height*height;
    if(chartX<left||chartX>width-right||chartY<top||chartY>height-bottom){setHoverIndex(null);return;}
    setHoverIndex(Math.max(0,Math.min(labels.length-1,Math.floor((chartX-left)/groupW))));
  };
  const svgBounds=containerRef.current?.querySelector("svg")?.getBoundingClientRect();
  const tip=hoverIndex===null||!svgBounds?null:{...tooltipPosition(containerRef.current,
    svgBounds.left+(left+hoverIndex*groupW+groupW/2)/width*svgBounds.width,
    svgBounds.top+(top+(height-top-bottom)-Math.max(...series.map(s=>barHeight(s.data[hoverIndex]))))/height*svgBounds.height),
    title:labels[hoverIndex],rows:series.map(s=>({name:s.name,value:s.data[hoverIndex],color:s.color}))};
  return <div className="chart-hover chart-svg-wrap" ref={containerRef} onMouseLeave={()=>setHoverIndex(null)}>
    <svg className="chart-svg" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" onMouseMove={handleMove}>
    {labels.map((l,i)=><text key={l} x={left+i*groupW+groupW/2} y={height-7} textAnchor="middle" className="chart-axis">{l}</text>)}
    {hoverIndex!==null&&<rect className="chart-hover-band" x={left+hoverIndex*groupW} y={top} width={groupW} height={height-top-bottom}/>}
    {series.map((s,k)=>s.data.map((v,i)=>{
      const h=barHeight(v);
      return <rect key={`${s.name}-${i}`} x={left+i*groupW+groupW/2-(series.length*barW)/2+k*barW}
        y={top+(height-top-bottom)-h} width={barW-3} height={h} rx="4" fill={s.color}/>
    }))}
    {hoverIndex!==null&&<line className="chart-hover-guide" x1={left+hoverIndex*groupW+groupW/2} x2={left+hoverIndex*groupW+groupW/2} y1={top} y2={height-bottom}/>}
    </svg>
    <ChartTooltip tip={tip}/>
  </div>
}
