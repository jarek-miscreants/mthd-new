export default function MobileMenuIndicator({ ...props }) {
  return (
    <div {...props}>
      <svg
        className="menu-icon-open"
        style={{ display: "none" }}
        width="100%"
        height="100%"
        viewBox="0 0 25 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <line
          x1="1.29289"
          y1="23.2132"
          x2="23.2132"
          y2="1.29289"
          stroke="currentColor"
          strokeWidth="2"
        />
        <line
          x1="1.70711"
          y1="1.29289"
          x2="23.6274"
          y2="23.2132"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
      <svg
        className="menu-icon-closed"
        style={{ display: "block" }}
        width="100%"
        height="100%"
        viewBox="0 0 31 13"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <line
          y1="1.00021"
          x2="31"
          y2="1.00021"
          stroke="currentColor"
          strokeWidth="2"
        />
        <line
          y1="11.1328"
          x2="31"
          y2="11.1328"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
}
