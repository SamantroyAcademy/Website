"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { CheckCircleIcon, WarningCircleIcon, ArrowRightIcon } from "@phosphor-icons/react";
import {
  CONTACT_FORM,
  PHONE_DIAL_CODE,
  fullPhone,
  isValidPhone,
  phoneDigits,
  type ContactField,
  type ContactFormDoc,
} from "@/lib/form-defaults";
import Turnstile, { waitForTurnstile } from "@/components/ui/Turnstile";

type Status = "idle" | "sending" | "success" | "error";

/** Which fields a form shows: "Show" decides for both forms; the popup (which
 *  must fit one phone screen) also needs "In popup" (Admin, Enquiry Form). */
const visible = (f: ContactField, compact: boolean) => f.enabled && (!compact || f.popup !== false);

/** Enquiry form. Every label, placeholder, required flag, visibility toggle
 *  and dropdown list comes from the CMS (Admin -> Enquiry Form), and
 *  /api/contact validates against the same document. */
export default function ContactForm({
  compact = false,
  config = CONTACT_FORM,
  phone = "",
  presetEntry = "",
}: {
  compact?: boolean;
  config?: ContactFormDoc;
  /** Shown in the error message as a fallback way to reach the academy. */
  phone?: string;
  /** Pre-select the target exam (used on exam pages). */
  presetEntry?: string;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [phoneVal, setPhoneVal] = useState("");
  const [phoneTouched, setPhoneTouched] = useState(false);
  // Bumped after every attempt: Turnstile tokens are single-use.
  const [tries, setTries] = useState(0);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus("sending");
    setErrorMsg("");
    await waitForTurnstile(form);
    const data: Record<string, FormDataEntryValue> = { ...Object.fromEntries(new FormData(form).entries()), _form: compact ? "popup" : "full" };
    if ("phone" in data) data.phone = fullPhone(phoneVal);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Something went wrong.");
      setStatus("success");
      form.reset();
      setPhoneVal("");
      setPhoneTouched(false);
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setTries((t) => t + 1);
    }
  }

  const shown = config.fields.filter((f) => visible(f, compact));
  const phoneInvalid = phoneTouched && phoneVal !== "" && !isValidPhone(phoneVal);

  // Render helpers (plain functions, NOT components): defining components
  // inside render would remount the inputs on every keystroke and drop focus.
  const label = (f: ContactField) => (
    <label htmlFor={`cf-${f.key}`} className={`${compact ? "mb-1" : "mb-1.5"} block text-sm font-semibold text-ink`}>
      {f.label}
      {f.required ? <span className="ml-0.5 text-accent-ink" aria-hidden>*</span> : <span className="ml-1.5 text-xs font-normal text-muted">optional</span>}
    </label>
  );

  /** One field, in the order the admin set. Paragraphs take the full width. */
  const control = (f: ContactField): ReactNode => {
    const id = `cf-${f.key}`;
    switch (f.type) {
      case "phone":
        return (
          <>
            <div className="flex">
              <span className="flex shrink-0 items-center rounded-l-[var(--radius-field)] border-[1.5px] border-r-0 border-line bg-tint px-3 text-sm font-semibold text-ink-2">
                {PHONE_DIAL_CODE}
              </span>
              <input
                id={id}
                name={f.key}
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                maxLength={10}
                required={f.required}
                value={phoneVal}
                onChange={(e) => setPhoneVal(phoneDigits(e.target.value))}
                onBlur={() => setPhoneTouched(true)}
                onInvalid={() => setPhoneTouched(true)}
                pattern="[6-9][0-9]{9}"
                title="Enter a 10-digit Indian mobile number starting with 6, 7, 8 or 9"
                placeholder={f.placeholder}
                aria-invalid={phoneInvalid}
                aria-describedby={phoneInvalid ? "cf-phone-err" : undefined}
                className="field rounded-l-none"
              />
            </div>
            {phoneInvalid && (
              <p id="cf-phone-err" className="mt-1.5 text-sm font-medium text-accent-ink">
                Enter a 10-digit mobile number starting with 6, 7, 8 or 9.
              </p>
            )}
          </>
        );
      case "email":
        return <input id={id} name={f.key} type="email" required={f.required} autoComplete="email" placeholder={f.placeholder} className="field" />;
      case "select": {
        const options = f.options ?? [];
        const preset = f.key === "entry" && presetEntry && options.includes(presetEntry) ? presetEntry : "";
        return (
          <select id={id} name={f.key} required={f.required} defaultValue={preset} className="field">
            <option value="" disabled={f.required}>{f.placeholder || `Select ${f.label.toLowerCase()}`}</option>
            {options.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        );
      }
      case "textarea":
        return <textarea id={id} name={f.key} required={f.required} rows={compact ? 2 : 3} maxLength={2000} placeholder={f.placeholder} className="field resize-y" />;
      case "number":
        return <input id={id} name={f.key} type="number" inputMode="decimal" step="any" required={f.required} placeholder={f.placeholder} className="field" />;
      default:
        return (
          <input id={id} name={f.key} required={f.required} maxLength={f.key === "name" ? 80 : 200} minLength={f.key === "name" ? 2 : undefined}
            autoComplete={f.key === "name" ? "name" : "off"} placeholder={f.placeholder} className="field" />
        );
    }
  };

  if (status === "success") {
    return (
      <div className="rounded-[var(--radius-card)] bg-brand-50 p-6 text-center" aria-live="polite">
        <CheckCircleIcon size={40} weight="duotone" className="mx-auto text-brand-600" />
        <p className="mt-3 font-display text-2xl font-bold text-ink">Request received</p>
        <p className="mx-auto mt-2 max-w-sm text-ink-2">{config.successMessage}</p>
        <button type="button" onClick={() => setStatus("idle")} className="btn btn-ghost btn-sm mt-5">
          Send another enquiry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} aria-label="Enquiry form" className={compact ? "space-y-3" : "space-y-5"} noValidate={false}>
      <div className={`grid ${compact ? "grid-cols-1 gap-3 sm:grid-cols-2" : "gap-5 sm:grid-cols-2"}`}>
        {shown.map((f) => (
          <div key={f.key} className={`flex flex-col ${f.type === "textarea" ? "sm:col-span-2" : ""}`}>
            {label(f)}
            {control(f)}
          </div>
        ))}
      </div>

      {/* Honeypot: invisible to people, irresistible to bots. */}
      <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
      <Turnstile resetKey={tries} />

      {/* Never disabled for a bad number: tapping it shows what to fix. */}
      <button type="submit" disabled={status === "sending"} className="btn btn-primary group w-full">
        {status === "sending" ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink border-t-transparent" aria-hidden />
            Sending
          </>
        ) : (
          <>
            {config.submitLabel}
            <ArrowRightIcon size={18} weight="bold" className="arrow" />
          </>
        )}
      </button>

      <div aria-live="polite">
        {status === "error" && (
          <p className="flex items-start gap-2 rounded-[var(--radius-field)] bg-accent-50 px-4 py-3 text-sm font-medium text-accent-ink">
            <WarningCircleIcon size={18} weight="bold" className="mt-0.5 shrink-0" />
            <span>{errorMsg}{phone ? ` You can also call us on ${phone}.` : ""}</span>
          </p>
        )}
      </div>
      {!compact && <p className="text-center text-xs text-muted">{config.privacyNote}</p>}
    </form>
  );
}
