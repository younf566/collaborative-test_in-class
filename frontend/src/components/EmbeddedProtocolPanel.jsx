import React from 'react';

export default function EmbeddedProtocolPanel({ userProto, setUserProto, partnerProto, setPartnerProto }) {
	const keys = ['emotional','material','energy','mental','physical','boundaryStrictness','focus'];
	return (
		<div style={{
			position:'fixed', top:20, right:20, background:'#ffffff',
			border:'1px solid #ddd', borderRadius:12, padding:12, width:320,
			boxShadow:'0 6px 24px rgba(0,0,0,0.08)', fontFamily:'Inter, system-ui, sans-serif',
			color:'#111', zIndex:1000
		}}>
			<div style={{fontWeight:600, marginBottom:8}}>Your Protocol</div>
			{keys.map((k)=> (
				<div key={'u-'+k} style={{display:'flex', alignItems:'center', gap:8, margin:'6px 0'}}>
					<label style={{flex:'0 0 160px', textTransform:'capitalize'}}>{k}</label>
					<input type="range" min={0} max={1} step={0.01}
						value={userProto[k]}
						onChange={(e)=> setUserProto(prev=> ({...prev, [k]: parseFloat(e.target.value)}))}
						style={{flex:1}} />
				</div>
			))}
			<div style={{height:12}}/>
			<div style={{fontWeight:600, marginBottom:8}}>Partner Protocol</div>
			{keys.map((k)=> (
				<div key={'p-'+k} style={{display:'flex', alignItems:'center', gap:8, margin:'6px 0'}}>
					<label style={{flex:'0 0 160px', textTransform:'capitalize'}}>{k}</label>
					<input type="range" min={0} max={1} step={0.01}
						value={partnerProto[k]}
						onChange={(e)=> setPartnerProto(prev=> ({...prev, [k]: parseFloat(e.target.value)}))}
						style={{flex:1}} />
				</div>
			))}
		</div>
	);
}
