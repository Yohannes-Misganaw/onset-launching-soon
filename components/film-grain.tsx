const MARK_PATH =
  "M87 4.88A96 96 0 0 0 87 195.12L87 154.47A56 56 0 0 1 87 45.53ZM113 4.88A96 96 0 0 1 113 195.12L113 154.47A56 56 0 0 0 113 45.53Z";

function GlassMark() {
  return (
    <div className="film-mark">
      <div className="film-mark-glass" />
      <svg className="film-mark-edge" viewBox="0 0 200 200">
        <defs>
          <linearGradient id="film-mark-fill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f9f2e0" stopOpacity=".2" />
            <stop offset=".5" stopColor="#b9d39a" stopOpacity=".06" />
            <stop offset="1" stopColor="#f9f2e0" stopOpacity=".03" />
          </linearGradient>
          <linearGradient id="film-mark-edge" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f9f2e0" stopOpacity=".65" />
            <stop offset=".45" stopColor="#f9f2e0" stopOpacity=".08" />
            <stop offset="1" stopColor="#b9d39a" stopOpacity=".35" />
          </linearGradient>
        </defs>
        <path
          fill="url(#film-mark-fill)"
          stroke="url(#film-mark-edge)"
          vectorEffect="non-scaling-stroke"
          d={MARK_PATH}
        />
      </svg>
    </div>
  );
}

export function FilmGrain() {
  return (
    <div aria-hidden="true" className="film-grain">
      <div className="film-glow" />
      <div className="film-beam film-beam-wide" />
      <div className="film-beam film-beam-core" />
      <div className="film-pool" />
      <div className="film-vignette" />
      <div className="film-lamp" />
      <GlassMark />
      <div className="film-noise" />
    </div>
  );
}
