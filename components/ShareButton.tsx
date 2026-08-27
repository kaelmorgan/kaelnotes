"use client";

import { useEffect, useId, useRef, useState } from "react";

type ShareButtonProps = {
  title: string;
  url: string;
  excerpt?: string;
  align?: "start" | "end";
  menuSide?: "bottom" | "top";
};

type ShareTarget = {
  label: string;
  href: (url: string, title: string, excerpt: string) => string;
};

const socialTargets: ShareTarget[] = [
  {
    label: "X",
    href: (url, title) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
  {
    label: "Facebook",
    href: (url) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    label: "LinkedIn",
    href: (url) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  {
    label: "WhatsApp",
    href: (url, title) =>
      `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
  },
  {
    label: "Email",
    href: (url, title, excerpt) =>
      `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(
        [excerpt, url].filter(Boolean).join("\n\n"),
      )}`,
  },
];

export function ShareButton({
  title,
  url,
  excerpt = "",
  align = "start",
  menuSide = "bottom",
}: ShareButtonProps) {
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    setCanNativeShare(typeof navigator !== "undefined" && "share" in navigator);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      window.prompt("Copy this link", url);
    }
  }

  async function shareNatively() {
    try {
      await navigator.share({ title, text: excerpt, url });
      setOpen(false);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
        className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 font-sans text-sm transition-colors ${
          open
            ? "border-accent bg-accent-soft text-accent"
            : "border-line bg-paper-raised text-muted hover:border-accent hover:text-ink"
        }`}
      >
        <ShareIcon />
        Share
      </button>
      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label="Share this article"
          className={`absolute z-30 min-w-[11.5rem] rounded-xl border border-line bg-paper-raised py-1.5 shadow-[0_10px_30px_rgba(28,25,23,0.08)] ${
            align === "end" ? "right-0" : "left-0"
          } ${
            menuSide === "top"
              ? "bottom-[calc(100%+0.4rem)]"
              : "top-[calc(100%+0.4rem)]"
          }`}
        >
          {canNativeShare ? (
            <button
              type="button"
              role="menuitem"
              onClick={shareNatively}
              className="block w-full px-3.5 py-2 text-left font-sans text-sm text-ink hover:bg-accent-soft"
            >
              Share via…
            </button>
          ) : null}
          <button
            type="button"
            role="menuitem"
            onClick={copyLink}
            className="block w-full px-3.5 py-2 text-left font-sans text-sm text-ink hover:bg-accent-soft"
          >
            {copied ? "Copied" : "Copy link"}
          </button>
          {socialTargets.map((target) => (
            <a
              key={target.label}
              role="menuitem"
              href={target.href(url, title, excerpt)}
              target={target.label === "Email" ? undefined : "_blank"}
              rel={target.label === "Email" ? undefined : "noreferrer"}
              onClick={() => setOpen(false)}
              className="block px-3.5 py-2 font-sans text-sm text-ink hover:bg-accent-soft"
            >
              {target.label}
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ShareIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
    >
      <path d="M10.2 4.4 5.8 6.6M10.2 11.6 5.8 9.4" />
      <circle cx="11.4" cy="3.4" r="1.8" />
      <circle cx="11.4" cy="12.6" r="1.8" />
      <circle cx="4.2" cy="8" r="1.8" />
    </svg>
  );
}
