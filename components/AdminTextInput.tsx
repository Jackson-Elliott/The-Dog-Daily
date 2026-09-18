"use client";

import {
  useLayoutEffect,
  useRef,
  type ChangeEvent,
  type InputHTMLAttributes,
} from "react";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> & {
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

/**
 * Controlled text input that restores the caret after React re-renders.
 * Without this, some admin fields (especially those next to a button) put
 * each new character at index 0, which looks like typing backwards.
 */
export default function AdminTextInput({ value, onChange, ...props }: Props) {
  const nodeRef = useRef<HTMLInputElement>(null);
  const caretRef = useRef<[number, number] | null>(null);

  useLayoutEffect(() => {
    const el = nodeRef.current;
    const caret = caretRef.current;
    if (!el || !caret || document.activeElement !== el) return;
    el.setSelectionRange(caret[0], caret[1]);
  }, [value]);

  return (
    <input
      {...props}
      ref={nodeRef}
      value={value}
      dir={props.dir ?? "ltr"}
      onChange={(event) => {
        const start = event.target.selectionStart ?? event.target.value.length;
        const end = event.target.selectionEnd ?? start;
        caretRef.current = [start, end];
        onChange(event);
      }}
    />
  );
}
