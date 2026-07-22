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
    img: string;
    imgCls: string;
  }[] = [
    { type: "water", label: t("off.water"), lineage: t("off.waterLin"), img: "/offerings/water.webp", imgCls: "h-12 w-auto" },
    { type: "flowers", label: t("off.flowers"), lineage: t("off.flowersLin"), img: "/offerings/flowers.webp", imgCls: "h-12 w-auto" },
    { type: "coffee", label: t("off.coffee"), lineage: t("off.coffeeLin"), img: "/offerings/coffee.webp", imgCls: "h-10 w-auto" },
    { type: "ancestor_money", label: t("off.money"), lineage: t("off.moneyLin"), img: "/offerings/money.webp", imgCls: "h-8 w-auto" },
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
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={o.img} alt="" className={o.imgCls} />
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

/* ── Ritual visuals ───────────────────────────────────────────────────
   Each offering is the real imagery settling onto the altar. Coffee gets
   steam wisps; the ancestor money — the real gold bills from the
   botanica — catches from below and burns upward with rising embers. */

function WaterRitual() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/offerings/water.webp" alt="" aria-hidden className="offer-settle h-40 w-auto" />
  );
}

function FlowersRitual() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/offerings/flowers.webp" alt="" aria-hidden className="offer-settle h-44 w-auto" />
  );
}

function CoffeeRitual() {
  return (
    <div className="relative">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/offerings/coffee.webp" alt="" aria-hidden className="offer-settle h-32 w-auto" />
      <svg
        viewBox="0 0 160 90"
        className="absolute -top-16 left-1/2 -translate-x-1/2 w-32 h-24"
        aria-hidden
      >
        <g stroke="rgba(230,223,210,0.55)" strokeWidth="3" fill="none" strokeLinecap="round">
          <path className="offer-steam" d="M62 86 Q56 66 64 50 Q70 38 64 22" />
          <path className="offer-steam" style={{ animationDelay: "0.5s" }} d="M82 86 Q88 64 80 48 Q74 36 80 20" />
          <path className="offer-steam" style={{ animationDelay: "1s" }} d="M100 86 Q94 68 102 52" />
        </g>
      </svg>
    </div>
  );
}

function MoneyRitual() {
  // The real gold bills catch from below and burn upward: the stack is
  // consumed (clip), a burn-front glow travels up it, embers rise.
  return (
    <div className="offer-money">
      <div className="offer-money-sheet">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/offerings/money.webp" alt="" aria-hidden className="w-full h-auto" />
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
