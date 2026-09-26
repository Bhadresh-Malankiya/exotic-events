"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
export function WhatsAppContact() {
  const path = usePathname();
  const [number, setNumber] = useState("");
  useEffect(() => {
    let active = true;
    fetch("/api/contact-options")
      .then((r) => r.json())
      .then((d) => {
        if (active) setNumber(d.whatsapp || "");
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [path]);
  if (!number || path.startsWith("/admin") || path.startsWith("/documents"))
    return null;
  return (
    <a
      className="whatsapp-contact"
      href={`https://wa.me/${number}?text=${encodeURIComponent("Hello Exotic, I would like to plan an event.")}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with Exotic on WhatsApp"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M20 11.5a8.5 8.5 0 0 1-12.8 7.3L3 20l1.2-4.2A8.5 8.5 0 1 1 20 11.5Z"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M8 7.5c.5 4 2.5 6 6.5 7l1.5-2-2-1-1 1c-1.5-.6-2.4-1.5-3-3l1-1-1-2-2 1Z"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
      </svg>
      <span>Let’s talk</span>
    </a>
  );
}
