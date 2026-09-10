import { useEffect, useMemo, useState } from "react";

type Props = {
  sources: readonly string[];
  onDone?: () => void;
};

const STEPS = [
  "Inicializando o showroom",
  "Carregando texturas",
  "Ajustando a luz neon",
  "Preparando as peças",
  "Quase pronto",
];

export function LoadingScreen({ sources, onDone }: Props) {
  const [progress, setProgress] = useState(0);
  const [hidden, setHidden] = useState(false);
  const [exit, setExit] = useState(false);

  const stepIndex = useMemo(
    () => Math.min(Math.floor((progress / 100) * STEPS.length), STEPS.length - 1),
    [progress]
  );

  useEffect(() => {
    let loaded = 0;
    let cancelled = false;
    const total = Math.max(sources.length, 1);

    const finish = () => {
      if (cancelled) return;
      setProgress(100);
      setExit(true);
      window.setTimeout(() => {
        if (cancelled) return;
        setHidden(true);
        onDone?.();
      }, 1200);
    };

    const bump = () => {
      loaded += 1;
      if (cancelled) return;
      const next = Math.round((loaded / total) * 100);
      setProgress(next);
      if (loaded >= total) finish();
    };

    sources.forEach((src) => {
      const img = new Image();
      img.onload = bump;
      img.onerror = bump;
      img.src = src;
    });

    const failsafe = window.setTimeout(() => {
      if (cancelled) return;
      finish();
    }, 5000);

    return () => {
      cancelled = true;
      window.clearTimeout(failsafe);
    };
  }, [sources, onDone]);

  return (
    <div
      className={`loader${hidden ? " loader-done" : ""}${exit ? " loader-exit" : ""}`}
      role="status"
      aria-live="polite"
      aria-label={`Carregando showroom DUHYPE, ${progress}%`}
    >
      <div className="loader-grid" aria-hidden="true" />
      <div className="loader-scan" aria-hidden="true" />
      <div className="loader-glow" aria-hidden="true" />

      <div className="loader-brand">
        <div className="loader-logo">
          <span className="loader-d">D</span>
          <span className="loader-u">U</span>
          <span className="loader-h">H</span>
          <span className="loader-y">Y</span>
          <span className="loader-p">P</span>
          <span className="loader-e">E</span>
        </div>
        <div className="loader-tagline">SHOWROOM</div>
      </div>

      <div className="loader-bar">
        <div className="loader-track" aria-hidden="true" />
        <span className="loader-fill" style={{ width: `${progress}%` }} />
        <span className="loader-spark" style={{ left: `${progress}%` }} aria-hidden="true" />
      </div>

      <p className="loader-text">
        <span className="loader-step">{STEPS[stepIndex]}</span>
        <span className="loader-percent">{progress}%</span>
      </p>

      <div className="loader-noise" aria-hidden="true" />
    </div>
  );
}
