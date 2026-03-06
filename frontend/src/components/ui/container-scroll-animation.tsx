import { useRef, type ReactNode } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from 'framer-motion';

interface ContainerScrollProps {
  titleComponent: ReactNode;
  children: ReactNode;
}

export function ContainerScroll({
  titleComponent,
  children,
}: ContainerScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const scaleDimensions = useTransform(scrollYProgress, [0.05, 0.35], [0.85, 1]);
  const rotate = useTransform(scrollYProgress, [0.05, 0.35], [20, 0]);
  const translateY = useTransform(scrollYProgress, [0.05, 0.35], [0, -80]);
  const opacity = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return (
    <div
      className="relative flex items-center justify-center py-20 md:py-40"
      ref={containerRef}
    >
      <div className="w-full max-w-6xl px-4 md:px-8" style={{ perspective: '1000px' }}>
        <Header titleComponent={titleComponent} translateY={translateY} opacity={opacity} />
        <Card rotate={rotate} scale={scaleDimensions}>
          {children}
        </Card>
      </div>
    </div>
  );
}

function Header({
  titleComponent,
  translateY,
  opacity,
}: {
  titleComponent: ReactNode;
  translateY: MotionValue<number>;
  opacity: MotionValue<number>;
}) {
  return (
    <motion.div
      style={{ translateY, opacity }}
      className="mx-auto max-w-4xl text-center"
    >
      {titleComponent}
    </motion.div>
  );
}

function Card({
  rotate,
  scale,
  children,
}: {
  rotate: MotionValue<number>;
  scale: MotionValue<number>;
  children: ReactNode;
}) {
  return (
    <motion.div
      style={{
        rotateX: rotate,
        scale,
      }}
      className="mx-auto mt-12 w-full max-w-5xl rounded-2xl border border-white/[0.08] bg-[#161b22] p-2 shadow-2xl md:p-4"
    >
      <div className="h-full w-full overflow-hidden rounded-xl bg-[#0d1117]">
        {children}
      </div>
    </motion.div>
  );
}
