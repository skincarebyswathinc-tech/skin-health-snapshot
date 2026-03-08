import { useRef, useState, useEffect, useCallback } from 'react';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

type FaceStatus = 'no-face' | 'too-far' | 'too-close' | 'off-center' | 'good';

interface FaceRect {
  x: number;
  y: number;
  w: number;
  h: number;
  skinRatio: number;
}

export default function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);

  const [status, setStatus] = useState<FaceStatus>('no-face');
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [flash, setFlash] = useState(false);

  // Start camera
  useEffect(() => {
    let cancelled = false;

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setReady(true);
        }
      } catch {
        setError('Camera access denied. Please allow camera permissions and try again.');
      }
    }

    start();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach(t => t.stop());
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Face detection loop
  useEffect(() => {
    if (!ready) return;

    const video = videoRef.current!;
    const canvas = canvasRef.current!;
    const overlay = overlayRef.current!;
    const ctx = canvas.getContext('2d')!;
    const oCtx = overlay.getContext('2d')!;

    let lastCheck = 0;
    let currentStatus: FaceStatus = 'no-face';

    function loop(time: number) {
      rafRef.current = requestAnimationFrame(loop);

      // Resize canvases to match video
      const vw = video.videoWidth;
      const vh = video.videoHeight;
      if (!vw || !vh) return;

      if (canvas.width !== vw) canvas.width = vw;
      if (canvas.height !== vh) canvas.height = vh;
      if (overlay.width !== overlay.clientWidth) overlay.width = overlay.clientWidth;
      if (overlay.height !== overlay.clientHeight) overlay.height = overlay.clientHeight;

      // Run detection at ~10fps
      if (time - lastCheck > 100) {
        lastCheck = time;

        // Draw video to hidden canvas at reduced size for speed
        const sampleW = 160;
        const sampleH = Math.round(vh * (sampleW / vw));
        canvas.width = sampleW;
        canvas.height = sampleH;
        ctx.drawImage(video, 0, 0, sampleW, sampleH);

        const imageData = ctx.getImageData(0, 0, sampleW, sampleH);
        const face = detectFaceRegion(imageData, sampleW, sampleH);

        if (!face) {
          currentStatus = 'no-face';
        } else {
          // Evaluate position relative to ideal oval
          const faceCx = (face.x + face.w / 2) / sampleW;
          const faceCy = (face.y + face.h / 2) / sampleH;
          const faceSize = (face.w * face.h) / (sampleW * sampleH);

          const offCenterX = Math.abs(faceCx - 0.5);
          const offCenterY = Math.abs(faceCy - 0.45);

          if (offCenterX > 0.15 || offCenterY > 0.15) {
            currentStatus = 'off-center';
          } else if (faceSize < 0.08) {
            currentStatus = 'too-far';
          } else if (faceSize > 0.55) {
            currentStatus = 'too-close';
          } else {
            currentStatus = 'good';
          }
        }

        setStatus(currentStatus);
      }

      // Draw overlay
      drawOverlay(oCtx, overlay.width, overlay.height, currentStatus);
    }

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [ready]);

  // Capture photo
  const capturePhoto = useCallback(() => {
    if (status !== 'good' || !videoRef.current) return;

    // Countdown
    setCountdown(3);
    let count = 3;
    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdown(count);
      } else {
        clearInterval(interval);
        setCountdown(null);
        doCapture();
      }
    }, 700);
  }, [status]);

  const doCapture = useCallback(() => {
    const video = videoRef.current!;
    const captureCanvas = document.createElement('canvas');
    captureCanvas.width = video.videoWidth;
    captureCanvas.height = video.videoHeight;
    const ctx = captureCanvas.getContext('2d')!;

    // Mirror the image (front camera is mirrored)
    ctx.translate(captureCanvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);

    // Flash effect
    setFlash(true);
    setTimeout(() => setFlash(false), 300);

    captureCanvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `selfie-${Date.now()}.jpg`, { type: 'image/jpeg' });
        // Stop camera
        streamRef.current?.getTracks().forEach(t => t.stop());
        cancelAnimationFrame(rafRef.current);
        onCapture(file);
      }
    }, 'image/jpeg', 0.92);
  }, [onCapture]);

  const statusMessages: Record<FaceStatus, { text: string; color: string }> = {
    'no-face': { text: 'Position your face in the oval', color: 'hsl(var(--destructive))' },
    'too-far': { text: 'Move closer to the camera', color: 'hsl(var(--accent))' },
    'too-close': { text: 'Move back a little', color: 'hsl(var(--accent))' },
    'off-center': { text: 'Center your face in the oval', color: 'hsl(var(--accent))' },
    'good': { text: 'Perfect! Hold still', color: 'hsl(var(--teal))' },
  };

  if (error) {
    return (
      <div className="glass-panel flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: 'hsl(var(--destructive) / 0.1)' }}>
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="hsl(var(--destructive))" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
          </svg>
        </div>
        <p className="text-card-title mb-1">Camera Unavailable</p>
        <p className="text-micro text-muted-foreground mb-5">{error}</p>
        <button onClick={onClose} className="btn-secondary">Go Back</button>
      </div>
    );
  }

  return (
    <div className="glass-panel overflow-hidden p-0">
      {/* Camera viewport */}
      <div className="relative w-full" style={{ aspectRatio: '4/3' }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 h-full w-full object-cover"
          style={{ transform: 'scaleX(-1)' }}
        />

        {/* Face guide overlay */}
        <canvas
          ref={overlayRef}
          className="absolute inset-0 h-full w-full"
          style={{ pointerEvents: 'none' }}
        />

        {/* Hidden analysis canvas */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Flash effect */}
        {flash && (
          <div className="absolute inset-0 bg-white animate-pulse" style={{ animation: 'flash 0.3s ease-out' }} />
        )}

        {/* Countdown */}
        {countdown !== null && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="text-7xl font-bold text-white drop-shadow-lg"
              style={{ animation: 'countdown-pop 0.7s ease-out' }}
              key={countdown}
            >
              {countdown}
            </span>
          </div>
        )}

        {/* Loading state */}
        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'hsl(var(--muted))' }}>
            <div className="text-center">
              <div className="mx-auto mb-3 h-8 w-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'hsl(var(--teal))', borderTopColor: 'transparent' }} />
              <p className="text-micro text-muted-foreground">Starting camera...</p>
            </div>
          </div>
        )}
      </div>

      {/* Status bar + controls */}
      <div className="p-5">
        {/* Status message */}
        <div className="mb-4 flex items-center justify-center gap-2">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full transition-colors duration-300"
            style={{ background: statusMessages[status].color }}
          />
          <p className="text-card-title text-sm" style={{ color: statusMessages[status].color }}>
            {statusMessages[status].text}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button
            onClick={capturePhoto}
            disabled={status !== 'good' || countdown !== null}
            className="btn-primary flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {countdown !== null ? `Capturing in ${countdown}...` : '📸 Capture'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Lightweight skin-color face detection ────────────────────

function detectFaceRegion(
  imageData: ImageData,
  w: number,
  h: number,
): FaceRect | null {
  const d = imageData.data;
  let skinCount = 0;
  let minX = w, maxX = 0, minY = h, maxY = 0;
  let sumX = 0, sumY = 0;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const r = d[i], g = d[i + 1], b = d[i + 2];

      if (isSkinPixel(r, g, b)) {
        skinCount++;
        sumX += x;
        sumY += y;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  const totalPixels = w * h;
  const skinRatio = skinCount / totalPixels;

  // Need at least 5% skin pixels
  if (skinRatio < 0.05) return null;

  // Use centroid for more stable positioning
  const cx = sumX / skinCount;
  const cy = sumY / skinCount;

  // Build bounding box around centroid
  const bw = maxX - minX;
  const bh = maxY - minY;

  // Reject implausible shapes
  if (bw < w * 0.1 || bh < h * 0.1) return null;

  return { x: minX, y: minY, w: bw, h: bh, skinRatio };
}

function isSkinPixel(r: number, g: number, b: number): boolean {
  if (r <= 80 || g <= 30 || b <= 15) return false;
  if (r <= g || r <= b) return false;
  if (Math.abs(r - g) < 15) return false;

  const y = 0.299 * r + 0.587 * g + 0.114 * b;
  const cb = 128 - 0.169 * r - 0.331 * g + 0.500 * b;
  const cr = 128 + 0.500 * r - 0.419 * g - 0.081 * b;

  if (y < 60) return false;
  if (cb < 77 || cb > 127) return false;
  if (cr < 133 || cr > 173) return false;

  return true;
}

// ── Overlay drawing ─────────────────────────────────────────

function drawOverlay(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  status: FaceStatus,
) {
  ctx.clearRect(0, 0, w, h);

  // Dim the area outside the oval
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.fillRect(0, 0, w, h);

  // Cut out an oval in the center
  const ovalCx = w / 2;
  const ovalCy = h * 0.44;
  const ovalRx = w * 0.32;
  const ovalRy = h * 0.38;

  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.ellipse(ovalCx, ovalCy, ovalRx, ovalRy, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Draw oval border
  const colors: Record<FaceStatus, string> = {
    'no-face': 'rgba(255, 255, 255, 0.4)',
    'too-far': 'rgba(180, 160, 220, 0.7)',
    'too-close': 'rgba(180, 160, 220, 0.7)',
    'off-center': 'rgba(180, 160, 220, 0.7)',
    'good': 'rgba(100, 200, 180, 0.9)',
  };

  ctx.strokeStyle = colors[status];
  ctx.lineWidth = status === 'good' ? 3 : 2;
  ctx.beginPath();
  ctx.ellipse(ovalCx, ovalCy, ovalRx, ovalRy, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Animated pulse when good
  if (status === 'good') {
    ctx.strokeStyle = 'rgba(100, 200, 180, 0.3)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.ellipse(ovalCx, ovalCy, ovalRx + 4, ovalRy + 4, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Corner guides
  drawCornerGuides(ctx, ovalCx, ovalCy, ovalRx, ovalRy, colors[status]);
}

function drawCornerGuides(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  color: string,
) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';

  const guideLen = 16;
  const positions = [
    { angle: -Math.PI * 0.3 },
    { angle: -Math.PI * 0.7 },
    { angle: Math.PI * 0.3 },
    { angle: Math.PI * 0.7 },
  ];

  for (const { angle } of positions) {
    const x = cx + rx * Math.cos(angle);
    const y = cy + ry * Math.sin(angle);

    // Tangent direction
    const tx = -Math.sin(angle) * rx;
    const ty = Math.cos(angle) * ry;
    const len = Math.sqrt(tx * tx + ty * ty);

    ctx.beginPath();
    ctx.moveTo(x - (tx / len) * guideLen, y - (ty / len) * guideLen);
    ctx.lineTo(x, y);
    ctx.lineTo(x + (tx / len) * guideLen, y + (ty / len) * guideLen);
    ctx.stroke();
  }
}
