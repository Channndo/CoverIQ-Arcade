import type { CSSProperties } from 'react';
import './Tag.css';

interface TagProps {
  label: string;
  color?: string;
}

export function Tag({ label, color }: TagProps) {
  const style: CSSProperties | undefined = color
    ? ({ '--tag-color': color } as CSSProperties)
    : undefined;

  return (
    <span className="omni-tag" style={style}>
      {label}
    </span>
  );
}
