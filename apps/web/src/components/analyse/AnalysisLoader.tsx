const STEPS = [
  { label:"Saving song details",            threshold:20  },
  { label:"Generating SATB harmonisation",  threshold:55  },
  { label:"Generating voice audio",         threshold:85  },
  { label:"Storing results",                threshold:100 },
];

export function AnalysisLoader({ progress, step }: { progress:number; step:string }) {
  return (
    <div className="space-y-5 py-2">
      <div className="flex justify-center gap-1 h-10">
        {["#7F77DD","#2DA882","#D4820A","#185FA5"].map((c,pi) => (
          <div key={pi} className="flex items-end gap-px">
            {[3,5,4,6,3].map((h,i) => (
              <div key={i} className="w-1 rounded-full"
                   style={{ height:`${h*4}px`, background:c, animation:`waveform 0.8s ease-in-out ${(pi*5+i)*0.08}s infinite` }}/>
            ))}
          </div>
        ))}
      </div>
      <p className="text-center text-sm text-[#7F77DD] font-medium">{step||"Processing…"}</p>
      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div className="h-full bg-[#7F77DD] rounded-full transition-all duration-500" style={{width:`${progress}%`}}/>
      </div>
      <div className="space-y-2.5">
        {STEPS.map((s,i) => {
          const prev = STEPS[i-1];
          const done   = progress >= s.threshold;
          const active = !done && progress >= (prev?.threshold ?? 0);
          return (
            <div key={s.label} className="flex items-center gap-3 text-sm">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold
                ${done?"bg-green-500":"active:bg-[#7F77DD]"}`}
                   style={done?{}:{background:active?"#7F77DD22":"rgba(255,255,255,0.05)"}}>
                {done ? "✓" : <span className="w-1.5 h-1.5 rounded-full" style={{background:active?"#7F77DD":"rgba(255,255,255,0.15)"}}/>}
              </div>
              <span className={done?"text-white":active?"text-[#7F77DD]":"text-white/20"}>{s.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
