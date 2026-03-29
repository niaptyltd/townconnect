interface ToggleProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  disabled?: boolean;
}

export function Toggle({ checked, onChange, label, disabled = false }: ToggleProps) {
  return (
    <label
      className={`flex items-center justify-between gap-4 rounded-2xl border border-brand-line px-4 py-3 text-sm ${
        disabled ? "bg-slate-100 text-slate-400" : "bg-white"
      }`}
    >
      <span className={`font-medium ${disabled ? "text-slate-400" : "text-brand-ink"}`}>{label}</span>
      <button
        className={`relative h-7 w-12 rounded-full transition ${
          checked ? "bg-brand-emerald" : "bg-slate-300"
        } ${disabled ? "opacity-60" : ""}`}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        type="button"
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </button>
    </label>
  );
}
