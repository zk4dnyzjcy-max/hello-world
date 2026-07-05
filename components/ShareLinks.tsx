"use client";

import { useEffect, useState } from "react";

function CopyRow({ label, description, url }: { label: string; description: string; url: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API unavailable; the user can still select & copy the text field
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-stone-700 dark:text-stone-300">{label}</label>
      <p className="text-sm text-stone-500 dark:text-stone-400">{description}</p>
      <div className="flex gap-2">
        <input
          readOnly
          value={url}
          onFocus={(e) => e.target.select()}
          className="flex-1 truncate rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-sm text-stone-700 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
        />
        <button
          type="button"
          onClick={copy}
          className="shrink-0 rounded-lg bg-stone-900 px-3 py-2 text-sm font-medium text-white hover:bg-stone-700 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  );
}

export default function ShareLinks({
  planId,
  editToken,
  shareToken,
}: {
  planId: string;
  editToken?: string;
  shareToken: string;
}) {
  const [origin, setOrigin] = useState("");
  useEffect(() => {
    // window.location isn't available during SSR; fill it in after mount so
    // the copy links are correct without causing a hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOrigin(window.location.origin);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100">Sharing</h3>
        <p className="text-sm text-stone-600 dark:text-stone-400">
          No sign-up needed. Anyone with a link below gets that level of access &mdash; keep the
          edit link to yourself.
        </p>
      </div>
      {editToken && (
        <CopyRow
          label="Edit link"
          description="Full access: edit meals, ingredients, recipes, notes, start date, and skips."
          url={`${origin}/plan/${planId}/edit/${editToken}`}
        />
      )}
      <CopyRow
        label="View & shopping link"
        description="Read-only calendar, plus the ability to check off grocery items. Perfect for a spouse or partner."
        url={`${origin}/plan/${planId}/view/${shareToken}`}
      />
    </div>
  );
}
