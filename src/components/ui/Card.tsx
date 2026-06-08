import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Card.module.css";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: "none" | "sm" | "md" | "lg";
  elevated?: boolean;
}

export function Card({
  children,
  padding = "md",
  elevated = false,
  className = "",
  ...rest
}: CardProps) {
  return (
    <div
      className={[
        styles.card,
        styles[padding],
        elevated ? styles.elevated : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {children}
    </div>
  );
}
