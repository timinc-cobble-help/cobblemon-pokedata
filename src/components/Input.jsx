import { useCallback } from "react";

export default function Input({ label, btn, loading, children, ...props }) {
  const handleKeyDown = useCallback(
    (e) => {
      if (!btn?.onClick) return;
      if (e.key === "Enter") {
        btn.onClick();
      }
    },
    [btn?.onClick]
  );

  return (
    <>
      <label>{label}</label>
      <fieldset role={btn ? "group" : undefined}>
        <input
          disabled={loading}
          onKeyDown={btn?.onClick ? handleKeyDown : undefined}
          {...props}
        />
        {children}
        {btn && <InputButton loading={loading} {...btn} />}
      </fieldset>
    </>
  );
}

function InputButton({ onClick, label, loading }) {
  return (
    <button onClick={onClick} disabled={loading} aria-busy={loading}>
      {label}
    </button>
  );
}
