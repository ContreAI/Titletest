"use client";

interface OrbConfig {
  color: string;
  size: string;
  position: string;
  anim: string;
}

/* Neutral orbs — cool grays with barely-there blue undertone.
   Professional and understated. No distinctly colored blobs. */
const ORB_CONFIGS: Record<string, OrbConfig[]> = {
  title: [
    { color: "bg-river-stone-200/50", size: "w-[700px] h-[700px]", position: "top-[-15%] left-[-12%]", anim: "orb-1" },
    { color: "bg-grey-200/45", size: "w-[550px] h-[550px]", position: "top-[12%] right-[-10%]", anim: "orb-2" },
    { color: "bg-river-stone-300/35", size: "w-[480px] h-[480px]", position: "bottom-[2%] left-[12%]", anim: "orb-3" },
  ],
  agent: [
    { color: "bg-river-stone-200/50", size: "w-[650px] h-[650px]", position: "top-[-12%] right-[-10%]", anim: "orb-1" },
    { color: "bg-grey-200/40", size: "w-[530px] h-[530px]", position: "top-[8%] left-[-12%]", anim: "orb-2" },
    { color: "bg-river-stone-300/30", size: "w-[450px] h-[450px]", position: "bottom-[8%] left-[22%]", anim: "orb-3" },
  ],
  client: [
    { color: "bg-grey-200/50", size: "w-[650px] h-[650px]", position: "top-[-12%] left-[-2%]", anim: "orb-1" },
    { color: "bg-river-stone-200/40", size: "w-[500px] h-[500px]", position: "top-[8%] right-[-10%]", anim: "orb-2" },
    { color: "bg-river-stone-300/30", size: "w-[450px] h-[450px]", position: "bottom-[3%] right-[8%]", anim: "orb-3" },
  ],
  landing: [
    { color: "bg-river-stone-200/50", size: "w-[700px] h-[700px]", position: "top-[-15%] left-[-8%]", anim: "orb-1" },
    { color: "bg-grey-200/45", size: "w-[580px] h-[580px]", position: "top-[12%] right-[-8%]", anim: "orb-2" },
    { color: "bg-river-stone-300/35", size: "w-[480px] h-[480px]", position: "bottom-[3%] left-[18%]", anim: "orb-3" },
  ],
};

/* Neutral gradient bases — cool gray with minimal blue undertone.
   Clean, corporate, gender-neutral. */
const GRADIENT_BASES: Record<string, React.CSSProperties> = {
  title: {
    background: "linear-gradient(145deg, #e8eaed 0%, #eceef0 25%, #eff0f2 50%, #ecedef 75%, #e9ebee 100%)",
  },
  agent: {
    background: "linear-gradient(145deg, #eaecee 0%, #edeef0 25%, #f0f1f2 50%, #edeef0 75%, #eaecee 100%)",
  },
  client: {
    background: "linear-gradient(145deg, #ebecee 0%, #edeef1 25%, #f0f1f3 50%, #eeeef0 75%, #eaecef 100%)",
  },
  landing: {
    background: "linear-gradient(145deg, #e7e9ed 0%, #ebedf0 25%, #eef0f2 50%, #ecedf0 75%, #e8eaee 100%)",
  },
};

interface AmbientBackgroundProps {
  persona?: "title" | "agent" | "client" | "landing";
}

export default function AmbientBackground({ persona = "landing" }: AmbientBackgroundProps) {
  const orbs = ORB_CONFIGS[persona];
  const gradientStyle = GRADIENT_BASES[persona];

  return (
    <div className="ambient-bg">
      {/* Neutral gradient base */}
      <div className="absolute inset-0" style={gradientStyle} />
      {/* Subtle depth orbs */}
      {orbs.map((orb, i) => (
        <div
          key={i}
          className={`orb ${orb.color} ${orb.size} ${orb.position} ${orb.anim}`}
        />
      ))}
    </div>
  );
}
