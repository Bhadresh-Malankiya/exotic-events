import "server-only";
import { cache } from "react";
import { getDocument } from "@/lib/cms/storage";
import { getWorkspace } from "./store";
import type { SiteContent } from "@/lib/cms/schema";
// One contact source keeps WhatsApp, email and phone consistent across the site.
export const getPublicDocument = cache(async () => {
  const [doc, workspace] = await Promise.all([getDocument(), getWorkspace()]);
  const { phone, email, whatsapp } = workspace.value.settings;
  const merge = (c: SiteContent) => ({
    ...c,
    brand: { ...c.brand, phone, email, whatsapp },
  });
  return {
    ...doc,
    value: {
      ...doc.value,
      draft: merge(doc.value.draft),
      published: merge(doc.value.published),
    },
  };
});
