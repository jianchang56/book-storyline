type SocialCardProps = {
  eyebrow: string;
  title: string;
  description: string;
  footer: string;
};

export function SocialCard({ eyebrow, title, description, footer }: SocialCardProps) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px",
        background: "#f2f5f4",
        color: "#172829",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "18px", fontSize: 30 }}>
          <div
            style={{
              width: 52,
              height: 52,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 16,
              background: "#b44735",
              color: "#fffaf2",
              fontWeight: 700,
            }}
          >
            书
          </div>
          <span style={{ fontWeight: 700, letterSpacing: "0.08em" }}>书脉</span>
        </div>
        <span style={{ color: "#b44735", fontSize: 24, letterSpacing: "0.16em" }}>{eyebrow}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "28px", maxWidth: 980 }}>
        <div
          style={{
            display: "flex",
            fontSize: title.length > 12 ? 66 : 82,
            lineHeight: 1.12,
            fontWeight: 700,
            letterSpacing: "0.04em",
          }}
        >
          {title}
        </div>
        <div style={{ display: "flex", color: "#526466", fontSize: 32, lineHeight: 1.45 }}>
          {description}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          borderTop: "2px solid #cbd6d4",
          paddingTop: "28px",
          color: "#526466",
          fontSize: 24,
        }}
      >
        <span>{footer}</span>
        <span>沿故事主线，读懂一本书</span>
      </div>
    </div>
  );
}
