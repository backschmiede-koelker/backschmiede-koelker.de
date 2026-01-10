// app/admin/about/components/option-select.tsx
"use client";

import { useMemo } from "react";
import SelectBox from "@/app/components/select-box";

export type Opt<V extends string = string> = { value: V; label: string };

export default function OptionSelect<V extends string>({
  value,
  onChange,
  options,
  placeholder,
  disabled,
}: {
  value: V;
  onChange: (v: V) => void;
  options: readonly Opt<V>[]; // ✅ readonly erlaubt
  placeholder?: string;
  disabled?: boolean;
}) {
  const labelByValue = useMemo(() => {
    const m = new Map<V, string>();
    for (const o of options) m.set(o.value, o.label);
    return m;
  }, [options]);

  const valueByLabel = useMemo(() => {
    const m = new Map<string, V>();
    for (const o of options) m.set(o.label, o.value);
    return m;
  }, [options]);

  const selectedLabel = value ? labelByValue.get(value) ?? "" : "";
  const labelOptions = useMemo(() => options.map((o) => o.label), [options]);

  return (
    <div className={disabled ? "opacity-60 cursor-not-allowed" : ""}>
      <SelectBox
        value={selectedLabel}
        onChange={(pickedLabel) => {
          const nextValue = valueByLabel.get(pickedLabel);
          if (nextValue !== undefined) onChange(nextValue);
        }}
        options={labelOptions}
        placeholder={placeholder}
        disabled={disabled}
      />
    </div>
  );
}
