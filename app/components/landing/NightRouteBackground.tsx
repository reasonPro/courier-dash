const foregroundMarks = [
  { left: "8%", top: "18%", delay: "-1.2s", duration: "7.6s" },
  { left: "19%", top: "72%", delay: "-4.8s", duration: "9.2s" },
  { left: "36%", top: "39%", delay: "-2.6s", duration: "8.4s" },
  { left: "55%", top: "14%", delay: "-6.1s", duration: "10.1s" },
  { left: "72%", top: "66%", delay: "-3.4s", duration: "7.9s" },
  { left: "88%", top: "31%", delay: "-5.5s", duration: "9.7s" },
];

export function NightRouteBackground() {
  return (
    <div aria-hidden="true" className="night-route-background pointer-events-none fixed inset-0 overflow-hidden">
      <div className="night-mesh-layer absolute -inset-[12%]">
        <span className="night-mesh-orb night-mesh-orb-a" />
        <span className="night-mesh-orb night-mesh-orb-b" />
        <span className="night-mesh-orb night-mesh-orb-c" />
      </div>

      <svg className="night-map-layer absolute -inset-[6%] size-[112%]" viewBox="0 0 1440 1000" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="route-main-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#38bdf8" stopOpacity="0" />
            <stop offset="0.28" stopColor="#38bdf8" stopOpacity="0.64" />
            <stop offset="0.64" stopColor="#a78bfa" stopOpacity="0.8" />
            <stop offset="1" stopColor="#f472b6" stopOpacity="0" />
          </linearGradient>
          <filter id="route-glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="7" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <pattern id="route-grid" width="72" height="72" patternUnits="userSpaceOnUse">
            <path d="M72 0H0V72" fill="none" stroke="#c4b5fd" strokeOpacity="0.055" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="1440" height="1000" fill="url(#route-grid)" />
        <g className="night-map-streets" fill="none" stroke="#94a3b8" strokeOpacity="0.07" strokeWidth="1.2">
          <path d="M-80 190C180 100 250 290 520 210S930 90 1510 220" />
          <path d="M-30 720C230 570 430 760 670 640S1020 500 1500 710" />
          <path d="M160 -60C210 210 90 420 300 1060" />
          <path d="M1090 -80C960 230 1160 470 1040 1080" />
          <path d="M-90 430C290 360 560 500 870 390S1230 270 1510 430" />
        </g>
        <path className="night-route-shadow" d="M-70 850C160 770 165 535 390 570S620 800 800 610 955 235 1175 310 1320 610 1510 455" fill="none" stroke="url(#route-main-gradient)" strokeWidth="12" strokeOpacity="0.12" filter="url(#route-glow)" />
        <path className="night-route-line" d="M-70 850C160 770 165 535 390 570S620 800 800 610 955 235 1175 310 1320 610 1510 455" fill="none" stroke="url(#route-main-gradient)" strokeWidth="2.2" strokeLinecap="round" />
        <path className="night-route-trail" d="M-70 850C160 770 165 535 390 570S620 800 800 610 955 235 1175 310 1320 610 1510 455" fill="none" stroke="#e0f2fe" strokeWidth="3.4" strokeLinecap="round" strokeDasharray="3 120" filter="url(#route-glow)" />
        {["390,570", "800,610", "1175,310"].map((point) => {
          const [cx, cy] = point.split(",");
          return <circle key={point} cx={cx} cy={cy} r="5" fill="#7dd3fc" fillOpacity="0.9" filter="url(#route-glow)" />;
        })}
      </svg>

      <div className="night-foreground-layer absolute inset-0">
        {foregroundMarks.map((mark, index) => (
          <span
            key={mark.left}
            className={`night-speed-mark ${index % 2 ? "night-speed-mark-streak" : ""}`}
            style={{ left: mark.left, top: mark.top, animationDelay: mark.delay, animationDuration: mark.duration }}
          />
        ))}
      </div>
      <div className="night-vignette absolute inset-0" />
    </div>
  );
}
