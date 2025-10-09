export default function LinkIndicator({ ...props }) {
  return (
    <svg
      data-link-indicator
      width="49"
      height="30"
      viewBox="0 0 49 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      overflow="visible"
      {...props}
    >
      <path
        data-path-open
        d="M7.32784 30L0 22.638V7.36196L7.32784 0L8.86086 1.56442L2.29953 8.15951V21.8098L8.89152 28.4049L7.32784 30Z"
        fill="currentColor"
      />

      <path
        data-path-arrow
        d="M17.9746 7.07886L29.4636 18.5732V10.9295H31.589V22.1365H20.4447V20.125H28.1136L16.5098 8.54439L17.9746 7.07886Z"
        fill="currentColor"
      />

      <path
        data-path-close
        d="M41.6721 30L40.1084 28.4049L46.7004 21.8098V8.15951L40.1391 1.56442L41.6721 0L48.9999 7.36196V22.638L41.6721 30Z"
        fill="currentColor"
      />
    </svg>
  );
}
