import { useState } from 'react';

interface ShareCardProps {
  score: number;
  skinAge: number;
  date: string;
}

export default function ShareCard({ score, skinAge, date }: ShareCardProps) {
  const [copied, setCopied] = useState(false);

  const shareText = `My SkinPulse score is ${score}. What's yours? 🌿`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 400;
    const ctx = canvas.getContext('2d')!;

    // Background
    ctx.fillStyle = '#f5f0eb';
    ctx.beginPath();
    ctx.roundRect(0, 0, 600, 400, 24);
    ctx.fill();

    // Brand
    ctx.fillStyle = '#6ba3a0';
    ctx.font = 'bold 20px -apple-system, sans-serif';
    ctx.fillText('SkinPulse', 40, 50);

    // Score
    ctx.fillStyle = '#2a2a2a';
    ctx.font = 'bold 72px -apple-system, sans-serif';
    ctx.fillText(String(score), 40, 160);

    ctx.fillStyle = '#6b6b6b';
    ctx.font = '18px -apple-system, sans-serif';
    ctx.fillText('Skin Health Score', 40, 195);

    // Skin age
    ctx.fillStyle = '#2a2a2a';
    ctx.font = 'bold 36px -apple-system, sans-serif';
    ctx.fillText(`${skinAge} yrs`, 40, 270);
    ctx.fillStyle = '#6b6b6b';
    ctx.font = '16px -apple-system, sans-serif';
    ctx.fillText('Estimated Skin Age', 40, 300);

    // Date
    ctx.fillStyle = '#999';
    ctx.font = '14px -apple-system, sans-serif';
    ctx.fillText(date, 40, 370);

    // Download
    const link = document.createElement('a');
    link.download = 'skinpulse-score.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="glass-card">
      <h3 className="text-section-title mb-4">Share Your Results</h3>

      {/* Preview card */}
      <div className="mb-5 rounded-2xl p-6" style={{ background: 'hsl(var(--background))' }}>
        <p className="text-micro font-medium mb-1" style={{ color: 'hsl(var(--teal))' }}>SkinPulse</p>
        <p className="text-display mb-1">{score}</p>
        <p className="text-micro text-muted-foreground">Skin Health Score</p>
        <div className="mt-3 flex items-center gap-2">
          <span className="text-section-title">{skinAge} yrs</span>
          <span className="text-micro text-muted-foreground">Estimated Skin Age</span>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={handleDownload} className="btn-secondary flex-1 text-sm">
          📥 Download Image
        </button>
        <button onClick={handleCopy} className="btn-secondary flex-1 text-sm">
          {copied ? '✓ Copied!' : '📋 Copy Text'}
        </button>
      </div>
    </div>
  );
}
