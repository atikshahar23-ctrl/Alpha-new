// Sparkline — lightweight SVG mini-charts for dashboards.
// Returns raw SVG strings that can be inlined anywhere.

export interface SparklineOpts {
  width?: number;
  height?: number;
  stroke?: string;
  fill?: string;
  strokeWidth?: number;
  showDots?: boolean;
  showArea?: boolean;
}

const defaults: Required<SparklineOpts> = {
  width: 120,
  height: 32,
  stroke: '#daa520',
  fill: 'rgba(218,165,32,.15)',
  strokeWidth: 1.5,
  showDots: false,
  showArea: true,
};

export function sparkline(data: number[], opts: SparklineOpts = {}): string {
  const o = { ...defaults, ...opts };
  if (!data.length) return '';
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const pad = 2;
  const w = o.width - pad * 2;
  const h = o.height - pad * 2;

  const points = data.map((v, i) => {
    const x = pad + (i / Math.max(data.length - 1, 1)) * w;
    const y = pad + h - ((v - min) / range) * h;
    return [x, y] as [number, number];
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');

  let areaPath = '';
  if (o.showArea && points.length > 1) {
    areaPath = `<path d="${pathD} L${points[points.length - 1][0].toFixed(1)},${(pad + h).toFixed(1)} L${points[0][0].toFixed(1)},${(pad + h).toFixed(1)} Z" fill="${o.fill}" stroke="none"/>`;
  }

  let dots = '';
  if (o.showDots) {
    dots = points.map(p => `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="2" fill="${o.stroke}"/>`).join('');
  }

  return `<svg width="${o.width}" height="${o.height}" viewBox="0 0 ${o.width} ${o.height}" xmlns="http://www.w3.org/2000/svg">${areaPath}<path d="${pathD}" fill="none" stroke="${o.stroke}" stroke-width="${o.strokeWidth}" stroke-linecap="round" stroke-linejoin="round"/>${dots}</svg>`;
}

export function miniBar(data: { label: string; value: number; color?: string }[], opts: { width?: number; height?: number; gap?: number } = {}): string {
  const w = opts.width || 120;
  const h = opts.height || 32;
  const gap = opts.gap || 2;
  if (!data.length) return '';
  const max = Math.max(...data.map(d => d.value), 1);
  const barW = (w - gap * (data.length - 1)) / data.length;

  const bars = data.map((d, i) => {
    const bh = Math.max(2, (d.value / max) * (h - 10));
    const x = i * (barW + gap);
    const y = h - 10 - bh;
    const color = d.color || '#daa520';
    return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barW.toFixed(1)}" height="${bh.toFixed(1)}" rx="1" fill="${color}"/>` +
      `<text x="${(x + barW / 2).toFixed(1)}" y="${h - 1}" text-anchor="middle" font-size="7" fill="#9a8e7a">${d.label}</text>`;
  }).join('');

  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">${bars}</svg>`;
}

export function progressRing(percent: number, opts: { size?: number; stroke?: string; bg?: string; width?: number } = {}): string {
  const size = opts.size || 40;
  const sw = opts.width || 3;
  const r = (size - sw) / 2;
  const c = size / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - Math.min(percent, 100) / 100);
  const color = opts.stroke || (percent >= 100 ? '#4dff91' : percent >= 50 ? '#daa520' : '#ff5d73');
  const bg = opts.bg || 'rgba(255,255,255,.06)';

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="${bg}" stroke-width="${sw}"/>
    <circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round"
      stroke-dasharray="${circumference.toFixed(1)}" stroke-dashoffset="${offset.toFixed(1)}"
      transform="rotate(-90 ${c} ${c})"/>
    <text x="${c}" y="${c + 4}" text-anchor="middle" font-size="11" font-weight="600" fill="${color}">${Math.round(percent)}%</text>
  </svg>`;
}
