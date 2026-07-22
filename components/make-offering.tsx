"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useT } from "./locale-provider";
import {
  makeOfferingAction,
  makeGuestOfferingAction,
  type OfferingType,
} from "@/app/ancestors/actions";

/**
 * "Make an offering" — the second devotional act on a memorial, beside
 * the candle. The member (or a family visitor on the public page)
 * chooses what to set on the altar: fresh water, flowers, black coffee,
 * or ancestor money. Each option names its own lineage plainly; ancestor
 * money is presented as a practice from Chinese folk religion embraced
 * by many modern practitioners — its own shelf, never folded into the
 * Lucumí or Espiritismo frame.
 *
 * The ritual borrows the theatrical grammar of charging the flame: the
 * room dims, the offering appears and lives its moment (water fills,
 * blossoms open, steam rises, the golden sheet catches and burns), and
 * a quiet line confirms it was received.
 */

const RITUAL_MS = 3400;
const DONE_MS = 5600;

type Phase =
  | { k: "idle" }
  | { k: "choosing" }
  | { k: "ritual"; type: OfferingType }
  | { k: "done"; type: OfferingType }
  | { k: "today" }
  | { k: "error" };

export function MakeOffering({
  name,
  ancestorId,
  hash,
  offeredToday = false,
}: {
  name: string;
  /** Owner mode: the memorial id (member's own page). */
  ancestorId?: string;
  /** Guest mode: the public memorial hash (/candle/[hash]). */
  hash?: string;
  /** Server-known: this person already offered in the last day. */
  offeredToday?: boolean;
}) {
  const t = useT();
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>(
    offeredToday ? { k: "today" } : { k: "idle" },
  );

  const options: {
    type: OfferingType;
    label: string;
    lineage: string;
    icon: React.ReactNode;
  }[] = [
    { type: "water", label: t("off.water"), lineage: t("off.waterLin"), icon: <WaterIcon /> },
    { type: "flowers", label: t("off.flowers"), lineage: t("off.flowersLin"), icon: <FlowersIcon /> },
    { type: "coffee", label: t("off.coffee"), lineage: t("off.coffeeLin"), icon: <CoffeeIcon /> },
    { type: "ancestor_money", label: t("off.money"), lineage: t("off.moneyLin"), icon: <MoneyIcon /> },
  ];

  async function offer(type: OfferingType) {
    setPhase({ k: "ritual", type });
    const write = ancestorId
      ? makeOfferingAction(ancestorId, type)
      : makeGuestOfferingAction(hash || "", type);
    // Let the ritual play out fully even if the write returns fast.
    const [res] = await Promise.all([
      write,
      new Promise((r) => setTimeout(r, RITUAL_MS)),
    ]);
    if (!res.ok) {
      setPhase({ k: res.code === "today" ? "today" : "error" });
      return;
    }
    setPhase({ k: "done", type });
    setTimeout(() => {
      setPhase({ k: "today" });
      router.refresh();
    }, DONE_MS - RITUAL_MS);
  }

  const doneKey: Record<OfferingType, string> = {
    water: "off.doneWater",
    flowers: "off.doneFlowers",
    coffee: "off.doneCoffee",
    ancestor_money: "off.doneMoney",
  };

  return (
    <div className="text-center">
      {phase.k === "idle" && (
        <button
          type="button"
          onClick={() => setPhase({ k: "choosing" })}
          className="btn-ghost inline-flex"
        >
          {t("off.btn")}
        </button>
      )}

      {phase.k === "choosing" && (
        <div>
          <p className="sublabel mb-4">{t("off.choose")}</p>
          <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
            {options.map((o) => (
              <button
                key={o.type}
                type="button"
                onClick={() => offer(o.type)}
                className="flex flex-col items-center gap-2 border border-[var(--border)] rounded-lg p-4 hover:border-[var(--accent)] hover:bg-[var(--surface)] transition-colors"
              >
                <span className="h-12 flex items-end" aria-hidden>
                  {o.icon}
                </span>
                <span className="text-sm text-[var(--foreground)]">{o.label}</span>
                <span className="text-[11px] leading-snug text-[var(--foreground-subtle)]">
                  {o.lineage}
                </span>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setPhase({ k: "idle" })}
            className="nav-link text-xs text-[var(--foreground-subtle)] hover:text-[var(--accent)] mt-4"
          >
            {t("off.notNow")}
          </button>
        </div>
      )}

      {(phase.k === "ritual" || phase.k === "done") && (
        <OfferingRitual
          type={phase.k === "ritual" ? phase.type : phase.type}
          doneLine={
            phase.k === "done" ? t(doneKey[phase.type], { name }) : null
          }
        />
      )}

      {phase.k === "today" && (
        <p className="text-sm text-[var(--foreground-muted)] leading-relaxed max-w-sm mx-auto">
          {t("off.today")}
        </p>
      )}

      {phase.k === "error" && (
        <p className="form-error inline-block">{t("off.error")}</p>
      )}
    </div>
  );
}

/** Full-screen dimmed ritual moment. */
function OfferingRitual({
  type,
  doneLine,
}: {
  type: OfferingType;
  doneLine: string | null;
}) {
  return (
    <div className="offer-overlay" role="status">
      <div className="offer-stage">
        {type === "water" && <WaterRitual />}
        {type === "flowers" && <FlowersRitual />}
        {type === "coffee" && <CoffeeRitual />}
        {type === "ancestor_money" && <MoneyRitual />}
      </div>
      {doneLine && <p className="offer-done-line invocation">{doneLine}</p>}
    </div>
  );
}

/* ── Ritual visuals ──────────────────────────────────────────────── */

function WaterRitual() {
  return (
    <svg viewBox="0 0 120 160" className="w-28 h-40" aria-hidden>
      {/* water, clipped to the glass, rising */}
      <defs>
        <clipPath id="off-glass-clip">
          <path d="M34 30 L40 138 Q41 146 50 146 L70 146 Q79 146 80 138 L86 30 Z" />
        </clipPath>
      </defs>
      <g clipPath="url(#off-glass-clip)">
        <g className="offer-water">
          <rect x="30" y="52" width="60" height="100" fill="rgba(148,190,222,0.34)" />
          <ellipse cx="60" cy="52" rx="26" ry="4" fill="rgba(196,224,244,0.5)" />
        </g>
      </g>
      {/* glass outline on top */}
      <path
        d="M34 30 L40 138 Q41 146 50 146 L70 146 Q79 146 80 138 L86 30 Z"
        fill="rgba(255,255,255,0.05)"
        stroke="rgba(220,228,236,0.75)"
        strokeWidth="2.5"
      />
      <ellipse cx="60" cy="30" rx="26" ry="5" fill="none" stroke="rgba(220,228,236,0.75)" strokeWidth="2.5" />
    </svg>
  );
}

function FlowersRitual() {
  return (
    <svg viewBox="0 0 160 160" className="w-36 h-36" aria-hidden>
      <Bloom cx={50} cy={70} r={16} delay={0} />
      <Bloom cx={84} cy={52} r={20} delay={0.45} />
      <Bloom cx={116} cy={76} r={15} delay={0.9} />
      {/* stems */}
      <g stroke="rgba(126,148,104,0.8)" strokeWidth="3" fill="none" className="offer-stems">
        <path d="M50 86 Q54 118 62 146" />
        <path d="M84 72 Q82 112 78 146" />
        <path d="M116 91 Q106 120 94 146" />
      </g>
    </svg>
  );
}

function Bloom({ cx, cy, r, delay }: { cx: number; cy: number; r: number; delay: number }) {
  const petals = Array.from({ length: 8 }, (_, i) => (i * 360) / 8);
  return (
    <g className="offer-bloom" style={{ animationDelay: `${delay}s`, transformOrigin: `${cx}px ${cy}px` }}>
      {petals.map((a) => (
        <ellipse
          key={a}
          cx={cx}
          cy={cy - r * 0.62}
          rx={r * 0.34}
          ry={r * 0.62}
          fill="#e0913f"
          opacity="0.92"
          transform={`rotate(${a} ${cx} ${cy})`}
        />
      ))}
      <circle cx={cx} cy={cy} r={r * 0.34} fill="#b0611f" />
    </g>
  );
}

function CoffeeRitual() {
  return (
    <svg viewBox="0 0 160 160" className="w-32 h-32" aria-hidden>
      {/* steam */}
      <g stroke="rgba(230,223,210,0.55)" strokeWidth="3" fill="none" strokeLinecap="round">
        <path className="offer-steam" d="M62 66 Q56 52 64 40 Q70 30 64 18" />
        <path className="offer-steam" style={{ animationDelay: "0.5s" }} d="M82 66 Q88 50 80 38 Q74 28 80 16" />
        <path className="offer-steam" style={{ animationDelay: "1s" }} d="M100 66 Q94 54 102 42" />
      </g>
      {/* cup */}
      <path
        d="M42 78 L48 132 Q49 140 58 140 L104 140 Q113 140 114 132 L120 78 Z"
        fill="#2a2019"
        stroke="rgba(212,181,120,0.7)"
        strokeWidth="2.5"
      />
      <ellipse cx="81" cy="78" rx="39" ry="7" fill="#1a120c" stroke="rgba(212,181,120,0.7)" strokeWidth="2.5" />
      <ellipse cx="81" cy="79" rx="32" ry="5" fill="#3d2517" className="offer-coffee-surface" />
    </svg>
  );
}

function MoneyRitual() {
  // The golden sheet catches from below and burns upward: the paper is
  // consumed (clip), a burn-front glow travels up it, embers rise.
  return (
    <div className="offer-money">
      <div className="offer-money-sheet">
        <svg viewBox="0 0 120 168" className="w-28 h-40" aria-hidden>
          <rect x="6" y="6" width="108" height="156" rx="4" fill="#caa050" stroke="#8a6a2e" strokeWidth="3" />
          <rect x="16" y="16" width="88" height="136" fill="none" stroke="#8a6a2e" strokeWidth="1.5" />
          {/* red seal */}
          <rect x="42" y="58" width="36" height="36" fill="#a5372a" opacity="0.9" />
          {/* gold ingot mark */}
          <path d="M48 118 Q60 106 72 118 L68 128 L52 128 Z" fill="#f0d488" stroke="#8a6a2e" strokeWidth="1.5" />
          <circle cx="60" cy="40" r="9" fill="none" stroke="#8a6a2e" strokeWidth="2" />
        </svg>
      </div>
      <div className="offer-burn-front" aria-hidden />
      {Array.from({ length: 10 }).map((_, i) => (
        <span
          key={i}
          className="offer-ember"
          style={{
            left: `${18 + ((i * 37) % 70)}%`,
            animationDelay: `${0.5 + i * 0.24}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ── Chooser icons (small, static) ───────────────────────────────── */

function WaterIcon() {
  return (
    <svg viewBox="0 0 40 48" className="w-7 h-9" aria-hidden>
      <path d="M11 8 L13 41 Q13 44 17 44 L23 44 Q27 44 27 41 L29 8 Z" fill="rgba(148,190,222,0.28)" stroke="rgba(220,228,236,0.8)" strokeWidth="2" />
      <ellipse cx="20" cy="8" rx="9" ry="2.5" fill="none" stroke="rgba(220,228,236,0.8)" strokeWidth="2" />
    </svg>
  );
}

function FlowersIcon() {
  return (
    <svg viewBox="0 0 48 48" className="w-9 h-9" aria-hidden>
      <g fill="#e0913f" opacity="0.92">
        {Array.from({ length: 6 }, (_, i) => (
          <ellipse key={i} cx="24" cy="14" rx="4.5" ry="8" transform={`rotate(${i * 60} 24 22)`} />
        ))}
      </g>
      <circle cx="24" cy="22" r="4.5" fill="#b0611f" />
      <path d="M24 30 Q25 38 24 45" stroke="rgba(126,148,104,0.85)" strokeWidth="2.5" fill="none" />
    </svg>
  );
}

function CoffeeIcon() {
  return (
    <svg viewBox="0 0 48 48" className="w-9 h-9" aria-hidden>
      <path d="M10 20 L13 41 Q13 44 17 44 L31 44 Q35 44 35 41 L38 20 Z" fill="#2a2019" stroke="rgba(212,181,120,0.75)" strokeWidth="2" />
      <ellipse cx="24" cy="20" rx="14" ry="3" fill="#3d2517" stroke="rgba(212,181,120,0.75)" strokeWidth="2" />
      <path d="M18 14 Q16 10 19 6 M27 14 Q29 10 26 6" stroke="rgba(230,223,210,0.5)" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function MoneyIcon() {
  return (
    <svg viewBox="0 0 40 48" className="w-7 h-9" aria-hidden>
      <rect x="4" y="4" width="32" height="40" rx="2" fill="#caa050" stroke="#8a6a2e" strokeWidth="2" />
      <rect x="13" y="17" width="14" height="14" fill="#a5372a" opacity="0.9" />
    </svg>
  );
}
