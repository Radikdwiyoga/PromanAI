import React, { useEffect, useRef, useState } from 'react';

export type SentinelBotMode = 'idle' | 'typing' | 'loading' | 'success' | 'error' | 'info';

interface SentinelBotProps {
  mode?: SentinelBotMode;
  className?: string;
}

const STATUS: Record<SentinelBotMode, string> = {
  idle: 'SENTINEL // STANDBY',
  typing: 'SCANNING CREDENTIALS…',
  loading: 'AUTHENTICATING…',
  success: 'ACCESS GRANTED',
  error: 'ALERT: ACCESS DENIED',
  info: 'PENDING ADMIN REVIEW',
};

export const SentinelBot: React.FC<SentinelBotProps> = ({ mode = 'idle', className = '' }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [ack, setAck] = useState(false);

  /* Eyes track the cursor — maps mouse position to --eye-x / --eye-y CSS vars */
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const handler = (e: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = Math.max(-1, Math.min(1, (e.clientX - cx) / (rect.width * 1.1)));
        const dy = Math.max(-1, Math.min(1, (e.clientY - cy) / (rect.height * 1.1)));
        el.style.setProperty('--eye-x', `${(dx * 5).toFixed(2)}px`);
        el.style.setProperty('--eye-y', `${(dy * 3).toFixed(2)}px`);
      });
    };
    window.addEventListener('mousemove', handler);
    return () => {
      window.removeEventListener('mousemove', handler);
      cancelAnimationFrame(raf);
    };
  }, []);

  const scanning = mode === 'typing' || mode === 'loading';

  const handleClick = () => {
    setAck(true);
    window.setTimeout(() => setAck(false), 600);
  };

  const wrapperClass = [
    'sentinel-bot',
    `sentinel-bot--${mode}`,
    scanning ? 'sentinel-bot--scan' : '',
    ack ? 'sentinel-bot--ack' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div
      ref={ref}
      role="img"
      aria-label={`Robot penjaga sentinel: ${STATUS[mode]}`}
      onClick={handleClick}
      className={wrapperClass}
    >
      {/* Ambient halo rings */}
      <div className="sentinel-bot__halo" />
      <div className="sentinel-bot__halo sentinel-bot__halo--inner" />

      <svg className="sentinel-bot__svg" viewBox="0 0 140 140" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="sentinel-head-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
        </defs>

        {/* Antenna */}
        <line className="sentinel-bot__antenna" x1="70" y1="30" x2="70" y2="20" />
        <circle className="sentinel-bot__antenna-led" cx="70" cy="14" r="5" />

        {/* Side ears */}
        <rect className="sentinel-bot__ear" x="20" y="58" width="10" height="22" rx="5" />
        <rect className="sentinel-bot__ear" x="110" y="58" width="10" height="22" rx="5" />

        {/* Head shell */}
        <rect className="sentinel-bot__head" x="28" y="28" width="84" height="82" rx="22" />

        {/* Visor */}
        <rect className="sentinel-bot__visor" x="38" y="52" width="64" height="34" rx="14" />
        {/* Sweeping scanline (visible in scan mode) */}
        <rect className="sentinel-bot__scanline" x="40" y="55" width="60" height="9" rx="4.5" />

        {/* Eye track → blink → pupils (nested groups let blink + tracking coexist) */}
        <g className="sentinel-bot__eye-track">
          <g className="sentinel-bot__eye-blink">
            <circle className="sentinel-bot__eye" cx="54" cy="69" r="5.5" />
            <circle className="sentinel-bot__eye" cx="86" cy="69" r="5.5" />
          </g>
        </g>

        {/* Cheek LEDs */}
        <circle className="sentinel-bot__cheek" cx="42" cy="80" r="2" />
        <circle className="sentinel-bot__cheek" cx="98" cy="80" r="2" />

        {/* Mouth */}
        <rect className="sentinel-bot__mouth" x="60" y="98" width="20" height="3.5" rx="1.75" />
      </svg>

      {/* Status datastream chip */}
      <div className="sentinel-bot__status" aria-hidden="true">
        <span className="sentinel-bot__status-led" />
        <span className="sentinel-bot__status-text">{STATUS[mode]}</span>
        <span className="sentinel-bot__status-cursor" />
      </div>
    </div>
  );
};
