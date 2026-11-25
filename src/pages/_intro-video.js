import React, { useEffect, useRef, useState } from 'react';
import Layout from '@theme/Layout';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './_intro-video.module.css';

export default function Intro() {
  const videoUrl = useBaseUrl('/files/ayah-intro.mp4');
  const videoRef = useRef(null);
  const [muted, setMuted] = useState(false);

  // Try to autoplay with sound; browsers block that unless the visitor has
  // already interacted with the site, so fall back to muted autoplay.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = false;
    video.play().catch(() => {
      video.muted = true;
      setMuted(true);
      video.play().catch(() => {});
    });
  }, []);

  const unmute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = false;
    setMuted(false);
    video.play().catch(() => {});
  };

  return (
    <Layout title="Intro" description="Introduction video" noFooter>
      <main className={styles.wrapper}>
        <video
          ref={videoRef}
          className={styles.video}
          src={videoUrl}
          controls
          autoPlay
          playsInline
          preload="auto"
          onVolumeChange={(e) => setMuted(e.currentTarget.muted)}
        >
          Your browser does not support the video tag.
        </video>
        {muted && (
          <button type="button" className={styles.unmute} onClick={unmute}>
            🔊 Tap for sound
          </button>
        )}
      </main>
    </Layout>
  );
}
