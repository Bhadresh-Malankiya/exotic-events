"use client";

import { useRef, useState } from "react";
import { EnquiryForm } from "./EnquiryForm";
import { Icon } from "@/components/ui/Icon";

export function EnquiryDialog({
  triggerLabel,
  triggerClassName,
  initialMessage,
}: {
  triggerLabel: string;
  triggerClassName?: string;
  initialMessage?: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  function close() {
    dialogRef.current?.close();
    setOpen(false);
    triggerRef.current?.focus();
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={triggerClassName}
        onClick={() => {
          dialogRef.current?.showModal();
          setOpen(true);
        }}
      >
        {triggerLabel}
      </button>

      <dialog
        ref={dialogRef}
        onClose={() => setOpen(false)}
        onCancel={() => setOpen(false)}
        aria-label="Quick enquiry"
        className="m-auto w-full max-w-xl rounded-card border border-surface-line bg-ink p-0 text-ivory backdrop:bg-ink/80 open:animate-none"
      >
        {open ? (
          <div className="max-h-[85vh] overflow-y-auto p-8">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl text-ivory">
                  Discuss your ideas
                </h2>
                <p className="mt-1 text-sm text-muted">
                  A few details and we&rsquo;ll be in touch to talk it through.
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close dialog"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-surface-line"
              >
                <Icon name="close" className="h-4 w-4" />
              </button>
            </div>
            <EnquiryForm initialMessage={initialMessage} />
          </div>
        ) : null}
      </dialog>
    </>
  );
}
