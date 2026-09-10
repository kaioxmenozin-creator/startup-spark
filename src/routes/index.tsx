import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

import jacketRed from "@/assets/jacket-red.webp";
import jacketBlack from "@/assets/jacket-black.webp";
import jacketWhite from "@/assets/jacket-white.webp";
import { LoadingScreen } from "@/components/LoadingScreen";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DUHYPE — Showroom 3D de Jaquetas" },
      {
        name: "description",
        content:
          "Showroom imersivo DUHYPE: arraste para girar entre as jaquetas em camera lenta, com luz neon e nevoa cinematografica.",
      },
      { property: "og:title", content: "DUHYPE — Showroom 3D de Jaquetas" },
      {
        property: "og:description",
        content:
          "Arraste a peca central para o lado e veja a proxima jaqueta deslizar em camera lenta ate o centro.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const PRODUCTS = [
  {
    name: "DUHYPE Track Top",
    color: "Vermelho",
    img: jacketRed,
    scene: {
      "--show-neon": "oklch(0.62 0.25 27)",
      "--show-bg": "oklch(0.14 0.03 25)",
      "--show-glow": "oklch(0.55 0.22 25)",
      "--haze-a": "oklch(0.75 0.18 30 / 16%)",
      "--haze-b": "oklch(0.7 0.12 15 / 12%)",
      "--haze-speed": "18s",
      "--haze-strength": "1",
    },
  },
  {
    name: "DUHYPE Track Top",
    color: "Preto",
    img: jacketBlack,
    scene: {
      "--show-neon": "oklch(0.55 0.03 260)",
      "--show-bg": "oklch(0.09 0.006 260)",
      "--show-glow": "oklch(0.42 0.02 260)",
      "--haze-a": "oklch(0.7 0.02 260 / 10%)",
      "--haze-b": "oklch(0.6 0.01 260 / 8%)",
      "--haze-speed": "34s",
      "--haze-strength": "0.65",
    },
  },
  {
    name: "DUHYPE Track Top",
    color: "Branco",
    img: jacketWhite,
    scene: {
      "--show-neon": "oklch(0.93 0.01 250)",
      "--show-bg": "oklch(0.18 0.01 240)",
      "--show-glow": "oklch(0.8 0.04 230)",
      "--haze-a": "oklch(0.95 0.01 240 / 18%)",
      "--haze-b": "oklch(0.85 0.05 230 / 14%)",
      "--haze-speed": "12s",
      "--haze-strength": "1.35",
    },
  },
] as const;

const IMAGES = [jacketRed, jacketBlack, jacketWhite] as const;

function Index() {
  const [index, setIndex] = useState(0);
  const [drag, setDrag] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const active =
    PRODUCTS[((index % PRODUCTS.length) + PRODUCTS.length) % PRODUCTS.length] ?? PRODUCTS[0];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setIndex((i) => i + 1);
      if (e.key === "ArrowLeft") setIndex((i) => i - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const draggingRef = useRef(false);
  const dragRef = useRef(0);
  const stageRef = useRef<HTMLElement | null>(null);

  const travel = () => stageRef.current?.clientWidth || 390;

  const startDrag = (x: number) => {
    startX.current = x;
    dragRef.current = 0;
    draggingRef.current = true;
    setDragging(true);
  };
  const moveDrag = (x: number) => {
    if (!draggingRef.current) return;
    const max = travel();
    const raw = x - startX.current;
    dragRef.current = Math.max(-max, Math.min(max, raw));
    setDrag(dragRef.current);
  };
  const endDrag = () => {
    if (!draggingRef.current) return;
    const d = dragRef.current;
    const threshold = travel() * 0.32;
    if (d <= -threshold) setIndex((i) => i + 1);
    else if (d >= threshold) setIndex((i) => i - 1);
    draggingRef.current = false;
    dragRef.current = 0;
    setDrag(0);
    setDragging(false);
  };

  useEffect(() => {
    const move = (e: PointerEvent) => moveDrag(e.clientX);
    const up = () => endDrag();
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    window.addEventListener("blur", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      window.removeEventListener("blur", up);
    };
  }, []);

  const dragShiftNow = dragging ? drag / travel() : 0;
  const tilt = dragShiftNow * 14;
  const sceneIndex = Math.round(index - dragShiftNow);
  const current =
    PRODUCTS[((sceneIndex % PRODUCTS.length) + PRODUCTS.length) % PRODUCTS.length] ?? active;
  const scene = current.scene;

  return (
    <main
      ref={stageRef}
      style={scene as React.CSSProperties}
      className="stage relative min-h-screen w-full select-none overflow-hidden"
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture?.(e.pointerId);
        startDrag(e.clientX);
      }}
      onPointerMove={(e) => moveDrag(e.clientX)}
      onPointerUp={() => endDrag()}
      onPointerCancel={() => endDrag()}
      onLostPointerCapture={() => endDrag()}
    >
      <LoadingScreen sources={IMAGES} />

      <div className="pillars" aria-hidden="true">
        <span className="pillar pillar-stone" />
        <span className="pillar pillar-neon" />
        <span className="pillar pillar-light" />
      </div>

      <div className="haze" aria-hidden="true" />
      <div className="haze haze-slow" aria-hidden="true" />
      <div className="haze haze-fast" aria-hidden="true" />
      <div className="beam" aria-hidden="true" />
      <div className="vignette" aria-hidden="true" />

      <header className="relative z-30 flex items-center justify-between px-6 pt-8">
        <div className="flex items-center gap-4">
          <span className="brand-mark">III</span>
          <span className="brand-tag">DUHYPE</span>
        </div>
        <span className="menu-icon" aria-hidden="true">
          <i />
          <i />
        </span>
      </header>

      <section className="carousel relative z-20">
        <div className="carousel-track">
          {PRODUCTS.map((p, i) => {
            const raw = i - index;
            const len = PRODUCTS.length;
            let offset = ((raw % len) + len) % len;
            if (offset > len / 2) offset -= len;
            const pos = offset + dragShiftNow;
            const abs = Math.abs(pos);
            const sign = Math.sign(pos);
            const clamped = Math.min(abs, 1);
            const isCenter = abs < 0.5;
            return (
              <figure
                key={p.color}
                className={`piece${isCenter ? " piece-center" : ""}`}
                style={{
                  transform: `translate3d(${pos * 54}%, ${abs * 3}%, ${-abs * 300}px) rotateY(${-sign * clamped * 46 + (isCenter ? tilt : 0)}deg) rotateX(${-Math.abs(tilt) * 0.12}deg) rotateZ(${-pos * 2.4}deg) scale(${1.35 - clamped * 0.26})`,
                  opacity: abs > 1.6 ? 0 : 1 - abs * 0.28,
                  filter: `brightness(${1 - clamped * 0.52}) contrast(${1 + clamped * 0.1})${dragging ? "" : ` blur(${clamped * 2.2}px)`}`,
                  zIndex: 20 - Math.round(abs * 10),
                  transition: dragging
                    ? "transform 120ms linear"
                    : "transform 2400ms cubic-bezier(.18,.86,.16,1), opacity 2200ms cubic-bezier(.4,0,.2,1), filter 2200ms ease",
                }}
              >
                <div className="piece-body">
                  <img
                    src={p.img}
                    alt={`Jaqueta DUHYPE ${p.color}, vista das costas`}
                    width={760}
                    height={760}
                    draggable={false}
                    className="piece-img"
                  />
                  <span
                    className="piece-sheen"
                    aria-hidden="true"
                    style={{
                      maskImage: `url(${p.img})`,
                      WebkitMaskImage: `url(${p.img})`,
                      transform: `translateX(${-pos * 26 - tilt * 1.6}%)`,
                    }}
                  />
                  <span
                    className="piece-shade"
                    aria-hidden="true"
                    style={{
                      maskImage: `url(${p.img})`,
                      WebkitMaskImage: `url(${p.img})`,
                      opacity: 0.4 + clamped * 0.35,
                    }}
                  />
                </div>
                <img
                  src={p.img}
                  alt=""
                  aria-hidden="true"
                  width={760}
                  height={760}
                  draggable={false}
                  className="piece-reflection"
                />
              </figure>
            );
          })}
        </div>
      </section>

      <footer className="showfoot relative z-30 pb-6 text-center">
        <div className="title-frame">DUHYPE</div>
        <p className="subtitle">
          {current.color} — arraste para o lado para trocar
        </p>
        <nav className="legal">
          <span>© 2026 DUHYPE</span>
          <span>TERMOS</span>
          <span>PRIVACIDADE</span>
          <span>COOKIES</span>
        </nav>
      </footer>
    </main>
  );
}
