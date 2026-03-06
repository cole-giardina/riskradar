import { type ReactNode } from 'react';

type GradientBorderProps = {
  children: ReactNode;
  className?: string;
  /** Animation duration in seconds (default: 3) */
  duration?: number;
  /** Show outer glow (default: true) */
  glow?: boolean;
  /** Border thickness in pixels (default: 2) */
  borderWidth?: number;
};

export function GradientBorder({
  children,
  className = '',
  duration = 3,
  glow = true,
  borderWidth = 2,
}: GradientBorderProps) {
  return (
    <div
      className={`relative rounded-lg ${className}`}
      style={{
        padding: `${borderWidth}px`,
        ...(glow
          ? {
              boxShadow:
                '0 0 15px -3px rgba(186, 66, 255, 0.3), 0 0 15px -3px rgba(0, 225, 255, 0.3)',
            }
          : {}),
      }}
    >
      <div
        className="absolute inset-0 rounded-lg overflow-hidden"
        aria-hidden
      >
        <div
          className="absolute inset-[-50%] w-[200%] h-[200%]"
          style={{
            background:
              'conic-gradient(from 0deg, rgb(186, 66, 255) 0%, rgb(0, 225, 255) 50%, rgb(186, 66, 255) 100%)',
            animation: `gradient-spin ${duration}s linear infinite`,
          }}
        />
      </div>
      <div className="relative rounded-[calc(0.5rem-1px)] bg-[#161b22] h-full">
        {children}
      </div>
    </div>
  );
}
