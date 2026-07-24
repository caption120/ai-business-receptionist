export function FalconIcon({ size = 24, strokeWidth = 2, className, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M12 2.5c.7 2.4 1.9 4.1 3.7 5.3C18.4 9.6 22 10 22 10s-3.2 1.9-6.6 2.3c-1.3.15-2.2.7-2.7 1.6L12 21.5l-.7-7.6c-.5-.9-1.4-1.45-2.7-1.6C5.2 11.9 2 10 2 10s3.6-.4 6.3-2.2c1.8-1.2 3-2.9 3.7-5.3Z" />
      <path d="M12 13.5v4" />
    </svg>
  )
}
