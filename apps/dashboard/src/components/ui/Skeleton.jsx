import React from 'react';

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 p-4">
      <div className="w-10 h-10 bg-surface-container-highest rounded-full skeleton-shimmer" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-surface-container-highest rounded w-3/4 skeleton-shimmer" />
        <div className="h-2 bg-surface-container-highest rounded w-1/2 skeleton-shimmer" />
      </div>
      <div className="h-4 w-24 bg-surface-container-highest rounded skeleton-shimmer" />
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-surface-container p-8 rounded-xl">
      <div className="h-3 w-24 bg-surface-container-highest rounded mb-6 skeleton-shimmer" />
      <div className="h-8 w-48 bg-surface-container-highest rounded mb-2 skeleton-shimmer" />
      <div className="h-3 w-32 bg-surface-container-highest rounded skeleton-shimmer" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="space-y-1">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-6 px-6 py-5">
          <div className="h-3 w-20 bg-surface-container-highest rounded skeleton-shimmer" />
          <div className="h-3 flex-1 bg-surface-container-highest rounded skeleton-shimmer" />
          <div className="h-3 w-16 bg-surface-container-highest rounded skeleton-shimmer" />
          <div className="h-3 w-24 bg-surface-container-highest rounded skeleton-shimmer" />
        </div>
      ))}
    </div>
  );
}
