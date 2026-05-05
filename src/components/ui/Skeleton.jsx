import React from "react";

/**
 * Dark-theme aware Skeleton.
 * Shimmer pulse uses surface-800 base with a lighter surface-700 sheen.
 * Consumers can still pass inline style to override background if needed.
 */
const Skeleton = ({ className = "", style, ...props }) => {
  return (
    <div
      className={`rounded-xl ${className}`}
      style={{
        background:
          "linear-gradient(90deg, var(--color-surface-800) 25%, var(--color-surface-700) 50%, var(--color-surface-800) 75%)",
        backgroundSize: "200% 100%",
        animation: "skeletonShimmer 1.6s ease-in-out infinite",
        ...style,
      }}
      {...props}
    />
  );
};

export default Skeleton;
