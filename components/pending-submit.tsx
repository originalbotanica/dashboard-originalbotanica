"use client";

import { useFormStatus } from "react-dom";

/**
 * Submit button that carries a slow server action with grace: while the
 * action runs it disables itself and swaps to the pending label, so the
 * member knows the work is happening instead of staring at a still page.
 */
export function PendingSubmit({
  label,
  pendingLabel,
  className = "btn-primary",
  disabled = false,
}: {
  label: string;
  pendingLabel: string;
  className?: string;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  const off = pending || disabled;
  return (
    <button
      type="submit"
      disabled={off}
      aria-busy={pending}
      className={`${className} ${pending ? "opacity-70 cursor-wait" : ""} ${disabled && !pending ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {pending ? (
        <span className="animate-pulse">{pendingLabel}</span>
      ) : (
        label
      )}
    </button>
  );
}
