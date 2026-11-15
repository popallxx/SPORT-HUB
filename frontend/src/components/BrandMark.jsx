export default function BrandMark({ size = 34 }) {
  return (
    <img
      src="/sporthub-logo.svg"
      alt=""
      width={size}
      height={size}
      className="brand-mark"
      style={{ width: size, height: size }}
      aria-hidden="true"
      draggable="false"
    />
  )
}
