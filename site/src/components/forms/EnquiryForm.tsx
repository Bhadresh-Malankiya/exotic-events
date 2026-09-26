"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { emblem } from "@/lib/assets";
import {
  enquirySchema,
  occasionOptions,
  type EnquiryInput,
} from "@/lib/enquiry-schema";

type Status = "idle" | "pending" | "success" | "error";

const emptyValues: EnquiryInput = {
  name: "",
  contact: "",
  occasion: occasionOptions[0],
  eventDate: "",
  dateFlexible: false,
  city: "",
  guestCount: "",
  message: "",
};

const fieldLabel = "block text-sm font-medium text-ivory mb-2";
const fieldInput =
  "w-full rounded-lg border border-surface-line bg-ink px-4 py-3 text-ivory placeholder:text-muted focus:border-gold-bright";

export function EnquiryForm({
  defaultOccasion,
  initialMessage,
  className,
}: {
  defaultOccasion?: (typeof occasionOptions)[number];
  className?: string;
  initialMessage?: string;
}) {
  const [values, setValues] = useState<EnquiryInput>({
    ...emptyValues,
    occasion: defaultOccasion ?? emptyValues.occasion,
    message: initialMessage ?? "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof EnquiryInput, string>>
  >({});
  const [status, setStatus] = useState<Status>("idle");
  const [serverError, setServerError] = useState<string | null>(null);
  const successHeadingRef = useRef<HTMLHeadingElement>(null);
  const fieldRefs = useRef<
    Partial<Record<keyof EnquiryInput, HTMLElement | null>>
  >({});

  function update<K extends keyof EnquiryInput>(
    key: K,
    value: EnquiryInput[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setServerError(null);

    const parsed = enquirySchema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof EnquiryInput, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof EnquiryInput;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      const firstKey = Object.keys(fieldErrors)[0] as
        keyof EnquiryInput | undefined;
      if (firstKey) fieldRefs.current[firstKey]?.focus();
      return;
    }

    setErrors({});
    setStatus("pending");

    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      if (!response.ok) {
        throw new Error("request-failed");
      }

      setStatus("success");
      requestAnimationFrame(() => successHeadingRef.current?.focus());
    } catch {
      setStatus("error");
      setServerError(
        "That didn't send. Please try again, or call us using the contact details on this page.",
      );
    }
  }

  if (status === "success") {
    return (
      <div className={`text-center ${className ?? ""}`} role="status">
        <Image
          src={emblem.bookingSuccessPoster}
          alt=""
          width={96}
          height={96}
          className="mx-auto h-20 w-20"
        />
        <h3
          ref={successHeadingRef}
          tabIndex={-1}
          className="mt-4 font-display text-2xl text-ivory outline-none"
        >
          Enquiry sent
        </h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
          Thank you, {values.name.split(" ")[0]}. We&rsquo;ve received your
          enquiry and will be in touch to discuss your plans.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className={`space-y-6 ${className ?? ""}`}
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="enq-name" className={fieldLabel}>
            Your name
          </label>
          <input
            id="enq-name"
            ref={(node) => {
              fieldRefs.current.name = node;
            }}
            className={fieldInput}
            value={values.name}
            onChange={(e) => update("name", e.target.value)}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "enq-name-error" : undefined}
          />
          {errors.name ? (
            <p id="enq-name-error" className="mt-1.5 text-sm text-rose">
              {errors.name}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="enq-contact" className={fieldLabel}>
            Email or phone
          </label>
          <input
            id="enq-contact"
            ref={(node) => {
              fieldRefs.current.contact = node;
            }}
            className={fieldInput}
            value={values.contact}
            onChange={(e) => update("contact", e.target.value)}
            aria-invalid={Boolean(errors.contact)}
            aria-describedby={errors.contact ? "enq-contact-error" : undefined}
          />
          {errors.contact ? (
            <p id="enq-contact-error" className="mt-1.5 text-sm text-rose">
              {errors.contact}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="enq-occasion" className={fieldLabel}>
            Occasion
          </label>
          <select
            id="enq-occasion"
            ref={(node) => {
              fieldRefs.current.occasion = node;
            }}
            className={fieldInput}
            value={values.occasion}
            onChange={(e) =>
              update("occasion", e.target.value as EnquiryInput["occasion"])
            }
          >
            {occasionOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="enq-city" className={fieldLabel}>
            City
          </label>
          <input
            id="enq-city"
            ref={(node) => {
              fieldRefs.current.city = node;
            }}
            className={fieldInput}
            value={values.city}
            onChange={(e) => update("city", e.target.value)}
            aria-invalid={Boolean(errors.city)}
            aria-describedby={errors.city ? "enq-city-error" : undefined}
          />
          {errors.city ? (
            <p id="enq-city-error" className="mt-1.5 text-sm text-rose">
              {errors.city}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="enq-date" className={fieldLabel}>
            Event date
          </label>
          <input
            id="enq-date"
            type="date"
            className={fieldInput}
            value={values.eventDate}
            onChange={(e) => update("eventDate", e.target.value)}
          />
          <label className="mt-2 flex items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              checked={values.dateFlexible}
              onChange={(e) => update("dateFlexible", e.target.checked)}
              className="h-4 w-4 rounded border-surface-line accent-[#d6b76b]"
            />
            My date is flexible
          </label>
        </div>

        <div>
          <label htmlFor="enq-guests" className={fieldLabel}>
            Guest count{" "}
            <span className="font-normal text-muted">(optional)</span>
          </label>
          <input
            id="enq-guests"
            inputMode="numeric"
            className={fieldInput}
            value={values.guestCount}
            onChange={(e) => update("guestCount", e.target.value)}
          />
        </div>
      </div>

      <div>
        <label htmlFor="enq-message" className={fieldLabel}>
          Tell us about the event
        </label>
        <textarea
          id="enq-message"
          ref={(node) => {
            fieldRefs.current.message = node;
          }}
          rows={4}
          className={fieldInput}
          value={values.message}
          onChange={(e) => update("message", e.target.value)}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "enq-message-error" : undefined}
        />
        {errors.message ? (
          <p id="enq-message-error" className="mt-1.5 text-sm text-rose">
            {errors.message}
          </p>
        ) : null}
      </div>

      {serverError ? (
        <p role="alert" className="text-sm text-rose">
          {serverError}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === "pending"}
        className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-gold px-7 py-3.5 text-base font-medium text-ink transition-colors hover:bg-gold-bright disabled:opacity-70 sm:w-auto"
      >
        {status === "pending" ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element -- small inline SMIL loop for a genuine pending state */}
            <img src={emblem.loadingDotsAnimated} alt="" className="h-4 w-8" />
            Sending
          </>
        ) : (
          "Send Enquiry"
        )}
      </button>
    </form>
  );
}
