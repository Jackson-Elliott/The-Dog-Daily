"use client";

/**
 * Draft / Published toggle used on the admin upload form, editor, and
 * story list. White-on-black to match the rest of the admin chrome.
 */
export default function AdminPublishSwitch({
  id,
  published,
  onChange,
  disabled = false,
}: {
  id: string;
  published: boolean;
  onChange: (published: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div>
      <p className="block text-sm text-white">Status</p>
      <div className="mt-2 flex items-center gap-3">
        <span className={`text-sm ${published ? "text-white/40" : "text-white"}`}>Draft</span>
        <button
          type="button"
          id={id}
          role="switch"
          aria-checked={published}
          aria-label={published ? "Published" : "Draft"}
          disabled={disabled}
          onClick={() => onChange(!published)}
          className={`flex h-7 w-12 items-center rounded-full border border-white p-[3px] transition disabled:cursor-not-allowed disabled:opacity-40 ${
            published ? "justify-end bg-white" : "justify-start bg-transparent"
          }`}
        >
          <span
            className={`h-5 w-5 rounded-full ${published ? "bg-black" : "bg-white"}`}
          />
        </button>
        <span className={`text-sm ${published ? "text-white" : "text-white/40"}`}>Published</span>
      </div>
    </div>
  );
}
