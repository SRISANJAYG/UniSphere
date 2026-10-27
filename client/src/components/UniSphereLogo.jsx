export const UniSphereIcon = ({ size = 36, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="currentColor"
    className={className}
    aria-hidden="true"
    style={{ flexShrink: 0 }}
  >
    <path d="M47 94C19 92 4 76 4 50V12l26 15c13 8 17 17 17 32v35Zm6 0c28-2 43-18 43-44V12L70 27C57 35 53 44 53 59v35ZM50 0c3 10 6 13 15 16-9 3-12 6-15 16-3-10-6-13-15-16C44 13 47 10 50 0Z" />
  </svg>
);
export const UniSphereLogo = ({
  size = 36,
  showTagline = false,
  variant = "horizontal",
  className = "",
}) =>
  variant === "icon" ? (
    <UniSphereIcon size={size} className={className} />
  ) : (
    <div
      className={className}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        flexDirection: variant === "stacked" ? "column" : "row",
        color: "inherit",
      }}
    >
      <UniSphereIcon size={size} />
      <div>
        <span
          style={{
            fontSize: Math.max(20, size * 0.65),
            fontWeight: 800,
            letterSpacing: "-.055em",
            lineHeight: 1.1,
          }}
        >
          UniSphere
        </span>
        {showTagline && (
          <span
            style={{
              display: "block",
              fontSize: 8,
              letterSpacing: 2.1,
              marginTop: 7,
              fontWeight: 600,
            }}
          >
            CONNECT LEARN GROW TOGETHER
          </span>
        )}
      </div>
    </div>
  );
export default UniSphereLogo;
