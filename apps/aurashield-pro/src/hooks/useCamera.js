import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/**
 * Manages the webcam stream for the Kirlian feed.
 *
 * The same MediaStream is attached to two <video> elements — a base layer
 * and a blurred bloom layer composited over it — which is what produces
 * the corona glow without any per-frame pixel work.
 */
export function useCamera() {
  const streamRef = useRef(null);
  const [status, setStatus] = useState('idle'); // idle|requesting|live|denied|error|unsupported
  const [error, setError] = useState(null);
  const [facing, setFacing] = useState('user');
  const [track, setTrack] = useState(null);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setTrack(null);
    setStatus('idle');
  }, []);

  const start = useCallback(
    async (mode = facing) => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus('unsupported');
        setError('Camera API unavailable. Requires a secure origin (https).');
        return null;
      }

      setStatus('requesting');
      setError(null);
      streamRef.current?.getTracks().forEach((t) => t.stop());

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: mode,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
        streamRef.current = stream;
        setTrack(stream.getVideoTracks()[0] ?? null);
        setFacing(mode);
        setStatus('live');
        return stream;
      } catch (err) {
        // Map to something the operator can actually act on.
        const map = {
          NotAllowedError: 'Camera access refused. Enable it in site permissions and retry.',
          NotFoundError: 'No camera found on this device.',
          NotReadableError: 'Camera is in use by another application.',
          OverconstrainedError: 'Requested camera mode unavailable on this device.',
          SecurityError: 'Camera blocked. The page must be served over https.',
        };
        setError(map[err.name] ?? `Camera failed to initialise (${err.name}).`);
        setStatus(err.name === 'NotAllowedError' ? 'denied' : 'error');
        return null;
      }
    },
    [facing]
  );

  const flip = useCallback(
    () => start(facing === 'user' ? 'environment' : 'user'),
    [facing, start]
  );

  /** Attach the live stream to a video element ref. */
  const attach = useCallback((el) => {
    if (el && streamRef.current && el.srcObject !== streamRef.current) {
      el.srcObject = streamRef.current;
      el.play?.().catch(() => {});
    }
  }, []);

  useEffect(() => () => streamRef.current?.getTracks().forEach((t) => t.stop()), []);

  return useMemo(() => {
    const settings = track?.getSettings?.() ?? {};
    return { status, error, facing, start, stop, flip, attach, settings, stream: streamRef };
  }, [status, error, facing, start, stop, flip, attach, track]);
}
