"use client";
import { LineIcon } from "@/components/ui/LineIcon";
import { useEffect, useState, type FormEvent } from "react";
import type { EnquiryInput } from "@/lib/enquiry-schema";
export function EnquiryForm({
  defaultOccasion,
  initialMessage,
  className,
}: {
  defaultOccasion?: EnquiryInput["occasion"];
  initialMessage?: string;
  className?: string;
}) {
  const [name, setName] = useState(""),
    [phone, setPhone] = useState(""),
    [email, setEmail] = useState(""),
    [message, setMessage] = useState(initialMessage || ""),
    [busy, setBusy] = useState(false),
    [done, setDone] = useState(false),
    [error, setError] = useState("");
  const [options, setOptions] = useState({
    whatsapp: "",
    email: "",
    phone: "",
  });
  useEffect(() => {
    fetch("/api/contact-options")
      .then((r) => r.json())
      .then(setOptions)
      .catch(() => {});
  }, []);
  const contact = [phone, email].filter(Boolean).join(" · ");
  const text = `Hello Exotic, I'm ${name}.\nContact: ${contact}\n${message}`;
  const whatsapp = options.whatsapp
    ? `https://wa.me/${options.whatsapp}?text=${encodeURIComponent(text)}`
    : "";
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!phone.trim() && !email.trim()) {
      setError("Please add a phone number or email so we can reply.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          email,
          message,
          occasion: defaultOccasion || "Something else",
        }),
      });
      const result = await r.json();
      if (!r.ok)
        throw Error(result.error || "Please check your details and try again.");
      if (result.whatsapp)
        setOptions((o) => ({ ...o, whatsapp: result.whatsapp }));
      setDone(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  if (done)
    return (
      <div className="contact-success" role="status">
        <span>✓</span>
        <h3>Your enquiry is with us.</h3>
        <p>Our team will get in touch using the details you shared.</p>
        {whatsapp && (
          <>
            <a
              className="contact-whatsapp"
              href={whatsapp}
              target="_blank"
              rel="noreferrer"
            >
              Continue in WhatsApp <LineIcon name="diagonal" />
            </a>
            <small>Your message opens in WhatsApp for you to send.</small>
          </>
        )}
      </div>
    );
  return (
    <form className={`simple-contact ${className || ""}`} onSubmit={submit}>
      <label>
        Your name
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          required
          minLength={2}
          maxLength={100}
          placeholder="How should we address you?"
        />
      </label>
      <fieldset className="contact-details">
        <legend>
          How can we reach you? <small>Add at least one</small>
        </legend>
        <div>
          <label>
            Phone / WhatsApp
            <input
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Your phone number"
              maxLength={30}
              required={!email.trim()}
            />
          </label>
          <label>
            Email
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              maxLength={200}
              required={!phone.trim()}
            />
          </label>
        </div>
      </fieldset>
      <label>
        What are you planning?
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          minLength={2}
          maxLength={4000}
          rows={4}
          placeholder="A wedding, a celebration, a corporate event… Share whatever you know."
        />
      </label>
      <p className="contact-hint">
        That’s enough to start. We’ll discuss dates, guests, and budget
        together.
      </p>
      <button type="submit" className="contact-submit" disabled={busy}>
        {busy ? (
          "Sending your enquiry…"
        ) : (
          <>
            Send My Enquiry <LineIcon />
          </>
        )}
      </button>
      {error && (
        <p role="alert" className="contact-error">
          {error}
        </p>
      )}
      <div className="contact-alternatives">
        {options.phone && (
          <a href={`tel:${options.phone.replace(/[^+\d]/g, "")}`}>
            Prefer a call? <LineIcon name="diagonal" />
          </a>
        )}
        {options.email && (
          <a href={`mailto:${options.email}`}>
            Email our team <LineIcon name="diagonal" />
          </a>
        )}
        {options.whatsapp && (
          <a
            href={`https://wa.me/${options.whatsapp}?text=${encodeURIComponent("Hello Exotic, I would like to plan an event.")}`}
            target="_blank"
            rel="noreferrer"
          >
            Chat on WhatsApp <LineIcon name="diagonal" />
          </a>
        )}
      </div>
    </form>
  );
}
