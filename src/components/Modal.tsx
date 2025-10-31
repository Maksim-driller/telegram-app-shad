import type { ReactNode } from "react";

export function Modal({
  open,
  onClose,
  children,
  title,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}) {
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.4)",
        }}
        onClick={onClose}
      />
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "420px",
          backgroundColor: "var(--card)",
          border: "1px solid var(--card-stroke)",
          borderTopLeftRadius: "var(--radius)",
          borderTopRightRadius: "var(--radius)",
          padding: "20px",
          boxShadow: "var(--shadow)",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {title ? (
          <div
            style={{
              fontSize: "16px",
              fontWeight: 600,
              marginBottom: "12px",
              color: "var(--text)",
            }}
          >
            {title}
          </div>
        ) : null}
        {children}
      </div>
    </div>
  );
}
