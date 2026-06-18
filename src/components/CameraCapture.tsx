import { useState, useRef, useCallback, useEffect } from "react";
import { Camera, SwitchCamera, X, Check, RotateCcw, Aperture } from "lucide-react";

interface CameraCaptureProps {
  onCapture: (file: File, dataUrl: string) => void;
  onClose: () => void;
}

export function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [shutterFlash, setShutterFlash] = useState(false);

  const startCamera = useCallback(async (facing: "environment" | "user") => {
    // Stop existing stream first
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    setIsReady(false);
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsReady(true);
        };
      }
    } catch (err: any) {
      console.error("Camera error:", err);
      if (err.name === "NotAllowedError") {
        setError("Akses kamera ditolak. Mohon izinkan akses kamera di pengaturan browser.");
      } else if (err.name === "NotFoundError") {
        setError("Kamera tidak ditemukan pada perangkat ini.");
      } else if (err.name === "NotReadableError") {
        setError("Kamera sedang digunakan oleh aplikasi lain.");
      } else {
        setError("Tidak dapat membuka kamera. Pastikan browser mendukung akses kamera.");
      }
    }
  }, []);

  useEffect(() => {
    startCamera(facingMode);

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const switchCamera = useCallback(() => {
    const next = facingMode === "environment" ? "user" : "environment";
    setFacingMode(next);
    startCamera(next);
  }, [facingMode, startCamera]);

  const takePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Mirror if front camera
    if (facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0);

    // Shutter animation
    setShutterFlash(true);
    setTimeout(() => setShutterFlash(false), 150);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setCapturedImage(dataUrl);

    // Stop camera
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, [facingMode]);

  const retake = useCallback(() => {
    setCapturedImage(null);
    startCamera(facingMode);
  }, [facingMode, startCamera]);

  const confirmPhoto = useCallback(() => {
    if (!capturedImage) return;

    // Convert dataURL to File
    const arr = capturedImage.split(",");
    const mime = arr[0].match(/:(.*?);/)?.[1] || "image/jpeg";
    const bstr = atob(arr[1]);
    const n = bstr.length;
    const u8arr = new Uint8Array(n);
    for (let i = 0; i < n; i++) u8arr[i] = bstr.charCodeAt(i);

    const file = new File([u8arr], `camera_${Date.now()}.jpg`, { type: mime });
    onCapture(file, capturedImage);
  }, [capturedImage, onCapture]);

  return (
    <div className="camera-capture-overlay">
      <canvas ref={canvasRef} className="hidden" />

      {/* Shutter flash effect */}
      {shutterFlash && <div className="camera-shutter-flash" />}

      {/* Top bar */}
      <div className="camera-top-bar">
        <button onClick={onClose} className="camera-btn-icon" aria-label="Tutup kamera">
          <X className="size-5" />
        </button>
        <span className="camera-title">
          <Camera className="size-4" />
          Kamera
        </span>
        <button onClick={switchCamera} className="camera-btn-icon" aria-label="Ganti kamera">
          <SwitchCamera className="size-5" />
        </button>
      </div>

      {/* Viewfinder */}
      <div className="camera-viewfinder">
        {error ? (
          <div className="camera-error">
            <Camera className="size-10 opacity-40" />
            <p>{error}</p>
            <button onClick={() => startCamera(facingMode)} className="camera-retry-btn">
              <RotateCcw className="size-4" />
              Coba Lagi
            </button>
          </div>
        ) : capturedImage ? (
          <img src={capturedImage} alt="Foto yang diambil" className="camera-preview-img" />
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`camera-video ${facingMode === "user" ? "camera-mirrored" : ""}`}
            />
            {!isReady && (
              <div className="camera-loading">
                <div className="camera-spinner" />
                <p>Memulai kamera...</p>
              </div>
            )}
            {/* Viewfinder frame overlay */}
            {isReady && <div className="camera-frame" />}
          </>
        )}
      </div>

      {/* Bottom controls */}
      <div className="camera-bottom-bar">
        {capturedImage ? (
          <>
            <button onClick={retake} className="camera-action-btn camera-action-retake">
              <RotateCcw className="size-5" />
              <span>Ulangi</span>
            </button>
            <button onClick={confirmPhoto} className="camera-action-btn camera-action-confirm">
              <Check className="size-5" />
              <span>Gunakan</span>
            </button>
          </>
        ) : (
          <button
            onClick={takePhoto}
            disabled={!isReady}
            className="camera-shutter-btn"
            aria-label="Ambil foto"
          >
            <Aperture className="size-7" />
          </button>
        )}
      </div>
    </div>
  );
}
