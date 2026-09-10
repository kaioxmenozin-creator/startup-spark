import { useEffect, useState } from "react";

type Props = {
  sources: readonly string[];
  onDone?: () => void;
};

export function LoadingScreen({ sources, onDone }: Props) {
  const [progress, setProgress] = useState(0);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let loaded = 0;
    let cancelled = false;
    const total = Math.max(sources.length, 1);

    const bump = () => {
      loaded += 1;
      if (cancelled) return;
      setProgress(Math.round((loaded / total) * 100));
      if (loaded >= total) {
        window.setTimeout(() => {
          if (cancelled) return;
          setHidden(true);
          onDone?.();
        }, 450);
      }
    };

    sources.forEach((src) => {
      const img = new Image();
      img.onload = bump;
      img.onerror = bump;
      img.src = src;
    });

    // safety net: never trap the visitor on the loader
    const failsafe = window.setTimeout(() => {
      if (cancelled) return;
      setProgress(100);
      setHidden(true);
      onDone?.();
    }, 6000);

    return () => {
      cancelled = true;
      window.clearTimeout(failsafe);
    };
  }, [sources, onDone]);

  return (
    <div className={`loader${hidden ? " loader-done" : ""}`} role="status" aria-live="polite">
      <div className="loader-mark">CHILE 20</div>
      <div className="loader-bar">
        <span className="loader-fill" style={{ width: `${progress}%` }} />
      </div>
      <p className="loader-text">Preparando o showroom · {progress}%</p>
    </div>
  );
}
