"use client";

import { useRef, useState } from "react";
import { Candle } from "@/components/candle";
import { useT } from "@/components/locale-provider";

/**
 * Memorial form for creating or editing an ancestor.
 *
 * Server actions handle the actual create/update via formData. The
 * photo upload, however, is an async XHR to /api/ancestors/upload-photo
 * because we need to show the upload result inline before the user
 * submits the form. The resulting public URL is written into a hidden
 * `photo_url` input that the server action reads on submit.
 */
export function MemorialForm({
  action,
  initial,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  initial?: {
    id?: string;
    name?: string;
    relation?: string | null;
    birth_date?: string | null;
    death_date?: string | null;
    dedication?: string | null;
    photo_url?: string | null;
    is_public?: boolean;
  };
  submitLabel?: string;
}) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(
    initial?.photo_url || null,
  );
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  // New memorials start dark and are lit by tapping the wick; an existing
  // memorial being edited is already lit, so we don't gate saving on it.
  const [lit, setLit] = useState(!!initial?.id);
  // For new memorials: fill the details, press "Light their flame" (which
  // sends you up to the candle), then tap the wick to light and place it.
  const [armed, setArmed] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const candleRef = useRef<HTMLDivElement>(null);
  const t = useT();
  const label = submitLabel ?? t("mem.lightFlame");

  function armAndScroll() {
    const f = formRef.current;
    if (!f) return;
    if (!f.checkValidity()) {
      f.reportValidity();
      return;
    }
    setArmed(true);
    candleRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function lightAndPlace() {
    setLit(true);
    setTimeout(() => formRef.current?.requestSubmit(), 650);
  }

  async function onPhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/ancestors/upload-photo", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) {
        setUploadError(data.error || t("mem.couldNotUpload"));
        return;
      }
      setPhotoUrl(data.url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : t("mem.uploadFailed"));
    } finally {
      setUploading(false);
    }
  }

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-6">
      {initial?.id && <input type="hidden" name="id" value={initial.id} />}
      <input type="hidden" name="photo_url" value={photoUrl || ""} />

      {/* Candle preview. For a new memorial, fill the details below first;
          "Light their flame" brings you up here to tap the wick, which lights
          and places it. (Editing an existing memorial starts already lit.) */}
      <div
        ref={candleRef}
        className="flex flex-col items-center text-center mb-2 scroll-mt-24"
      >
        <div
          className="relative inline-block"
          style={{
            filter: lit
              ? "drop-shadow(0 0 26px rgba(240, 176, 110, 0.5))"
              : "none",
            transition: "filter 1s ease",
          }}
        >
          <Candle size="large" lit={lit} photoUrl={photoUrl} alt={t("mem.candleAlt")} />
          {armed && !lit && (
            <button
              type="button"
              onClick={lightAndPlace}
              aria-label={t("mem.tapAria")}
              className="absolute left-1/2 -translate-x-1/2 rounded-full flex items-start justify-center"
              style={{
                top: -10,
                width: 90,
                height: 84,
                cursor: "pointer",
                background: "transparent",
              }}
            >
              <span
                aria-hidden
                className="block rounded-full animate-ping"
                style={{
                  marginTop: 6,
                  width: 18,
                  height: 18,
                  background: "rgba(240, 176, 110, 0.6)",
                }}
              />
            </button>
          )}
        </div>
        {!initial?.id && (
          <p
            className={`invocation mt-4 ${
              armed && !lit
                ? "text-[var(--accent)] text-lg md:text-xl font-medium animate-pulse"
                : "text-[var(--foreground-muted)] text-sm"
            }`}
          >
            {lit
              ? t("mem.flameLit")
              : armed
                ? t("mem.tapWick")
                : t("mem.fillFirst")}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="name" className="form-label">
          {t("mem.name")}
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={initial?.name || ""}
          className="form-input"
          placeholder={t("mem.namePh")}
        />
      </div>

      <div>
        <label htmlFor="relation" className="form-label">
          {t("mem.relation")}{" "}
          <span className="text-[var(--foreground-subtle)] normal-case tracking-normal">
            {t("mem.optional")}
          </span>
        </label>
        <input
          id="relation"
          name="relation"
          type="text"
          defaultValue={initial?.relation || ""}
          className="form-input"
          placeholder={t("mem.relationPh")}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="birth_date" className="form-label">
            {t("mem.born")}{" "}
            <span className="text-[var(--foreground-subtle)] normal-case tracking-normal">
              {t("mem.optional")}
            </span>
          </label>
          <input
            id="birth_date"
            name="birth_date"
            type="date"
            defaultValue={initial?.birth_date || ""}
            className="form-input"
          />
        </div>
        <div>
          <label htmlFor="death_date" className="form-label">
            {t("mem.passed")}{" "}
            <span className="text-[var(--foreground-subtle)] normal-case tracking-normal">
              {t("mem.optional")}
            </span>
          </label>
          <input
            id="death_date"
            name="death_date"
            type="date"
            defaultValue={initial?.death_date || ""}
            className="form-input"
          />
        </div>
      </div>

      <div>
        <label htmlFor="dedication" className="form-label">
          {t("mem.dedication")}{" "}
          <span className="text-[var(--foreground-subtle)] normal-case tracking-normal">
            {t("mem.optional")}
          </span>
        </label>
        <textarea
          id="dedication"
          name="dedication"
          rows={4}
          defaultValue={initial?.dedication || ""}
          className="form-input"
          placeholder={t("mem.dedicationPh")}
        />
      </div>

      <div>
        <p className="form-label">
          {t("mem.photo")}{" "}
          <span className="text-[var(--foreground-subtle)] normal-case tracking-normal">
            {t("mem.photoOptional")}
          </span>
        </p>
        {/* The native file control is hidden entirely (it renders its own
            boxed field, which differs per browser and showed an empty dark
            box on iOS); our own label is the button. No `name` on purpose —
            the file is uploaded via XHR in onPhotoChange and its URL stored in
            the hidden `photo_url` input, so the raw file is never POSTed with
            the server action (which broke creation past Next's 1MB limit). */}
        <input
          id="photo"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/heic"
          onChange={onPhotoChange}
          disabled={uploading}
          className="sr-only"
        />
        <label
          htmlFor="photo"
          className={`inline-flex items-center rounded-md border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-2 text-sm text-[var(--foreground)] cursor-pointer hover:border-[var(--accent)] transition-colors ${
            uploading ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          {photoUrl ? t("mem.chooseDifferent") : t("mem.choosePhoto")}
        </label>
        {uploading && (
          <p className="text-sm text-[var(--foreground-muted)] mt-2">
            {t("mem.uploading")}
          </p>
        )}
        {uploadError && <p className="form-error">{uploadError}</p>}
        {photoUrl && !uploading && (
          <div className="mt-3 flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoUrl}
              alt={t("mem.photoAlt")}
              className="w-16 h-16 rounded-full object-cover border border-[var(--border-strong)]"
            />
            <button
              type="button"
              onClick={() => setPhotoUrl(null)}
              className="nav-link text-[var(--foreground-muted)] hover:text-[var(--ember)]"
            >
              {t("mem.remove")}
            </button>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="is_public"
            defaultChecked={initial?.is_public !== false}
            className="mt-1"
          />
          <span className="text-sm text-[var(--foreground-muted)] leading-relaxed">
            <span className="text-[var(--foreground)] font-medium">
              {t("mem.allowFamily")}
            </span>{" "}
            {t("mem.allowFamilyBody")}
          </span>
        </label>
      </div>

      {lit ? (
        <button type="submit" className="btn-primary mt-2">
          {label}
        </button>
      ) : (
        <button
          type="button"
          onClick={armAndScroll}
          className="btn-primary mt-2"
        >
          {label}
        </button>
      )}
    </form>
  );
}
