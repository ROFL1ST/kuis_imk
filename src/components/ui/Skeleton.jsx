import React from "react";

const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={`animate-pulse bg-slate-200 rounded-xl ${className}`}
      {...props}
    />
  );
};

export default Skeleton;