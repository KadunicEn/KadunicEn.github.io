import type { Question } from '@/types/quiz'
import { ActionIcon, Group, Text } from '@mantine/core'
import { IconPlayerPause, IconPlayerPlay, IconPlayerStop } from '@tabler/icons-react'
import { useEffect, useRef, useState } from 'react'

function getYouTubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url)
    let videoId: string | null = null

    if (parsed.hostname === 'youtu.be') {
      videoId = parsed.pathname.slice(1)
    } else if (parsed.hostname === 'www.youtube.com' || parsed.hostname === 'youtube.com') {
      if (parsed.pathname === '/watch') {
        videoId = parsed.searchParams.get('v')
      } else if (parsed.pathname.startsWith('/shorts/')) {
        videoId = parsed.pathname.split('/shorts/')[1]
      } else if (parsed.pathname.startsWith('/embed/')) {
        videoId = parsed.pathname.split('/embed/')[1]
      }
    }

    if (!videoId) return null
    return videoId.split(/[?&/]/)[0]
  } catch {
    return null
  }
}

function buildEmbedUrl(videoId: string, options: { autoplay?: boolean } = {}) {
  const params = new URLSearchParams({
    rel: '0',
    modestbranding: '1',
    ...(options.autoplay ? { autoplay: '1' } : {}),
  })
  return `https://www.youtube-nocookie.com/embed/${videoId}?${params}`
}

// ---------------------------------------------------------------------------
// Load the YouTube IFrame API script exactly once across the page lifetime
// ---------------------------------------------------------------------------
let ytApiPromise: Promise<void> | null = null

function loadYouTubeApi(): Promise<void> {
  if (ytApiPromise) return ytApiPromise
  ytApiPromise = new Promise((resolve) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).YT?.Player) {
      resolve()
      return
    }
    // Chain on any existing callback so we don't overwrite another instance
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prev = (window as any).onYouTubeIframeAPIReady as (() => void) | undefined
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ; (window as any).onYouTubeIframeAPIReady = () => {
        prev?.()
        resolve()
      }
    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const script = document.createElement('script')
      script.src = 'https://www.youtube.com/iframe_api'
      document.head.appendChild(script)
    }
  })
  return ytApiPromise
}

// ---------------------------------------------------------------------------
// Audio-only YouTube player — iframe is off-screen, we show our own controls
// ---------------------------------------------------------------------------
function YouTubeAudioPlayer({ videoId }: { videoId: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef = useRef<any>(null)
  const [playing, setPlaying] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let destroyed = false

    loadYouTubeApi().then(() => {
      if (destroyed || !containerRef.current) return
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      playerRef.current = new (window as any).YT.Player(containerRef.current, {
        videoId,
        playerVars: { autoplay: 0, controls: 0, rel: 0, modestbranding: 1 },
        events: {
          onReady: () => { if (!destroyed) setReady(true) },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onStateChange: (e: any) => {
            if (!destroyed) setPlaying(e.data === 1 || e.data === 3)
          },
        },
      })
    })

    return () => {
      destroyed = true
      playerRef.current?.destroy()
      playerRef.current = null
    }
  }, [videoId])

  const handlePlayPause = () => {
    if (!playerRef.current) return
    playing ? playerRef.current.pauseVideo() : playerRef.current.playVideo()
  }

  const handleStop = () => {
    playerRef.current?.stopVideo()
    setPlaying(false)
  }

  return (
    <div style={{ marginTop: '16px' }}>
      {/* YT.Player replaces this div with an iframe; keep it off-screen */}
      <div
        ref={containerRef}
        style={{ position: 'fixed', top: -9999, left: -9999, width: 640, height: 360 }}
      />

      <Group justify="center" gap="md" align="center">
        <ActionIcon
          size="xl"
          variant="filled"
          onClick={handlePlayPause}
          disabled={!ready}
          aria-label={playing ? 'Pause' : 'Play'}
        >
          {playing ? <IconPlayerPause size={24} /> : <IconPlayerPlay size={24} />}
        </ActionIcon>
        <ActionIcon
          size="xl"
          variant="outline"
          onClick={handleStop}
          disabled={!ready}
          aria-label="Stop"
        >
          <IconPlayerStop size={24} />
        </ActionIcon>
        {!ready && <Text size="sm" c="dimmed">Laden…</Text>}
      </Group>
    </div>
  )
}

// ---------------------------------------------------------------------------

interface MediaContentProps {
  question: Question
}

export default function MediaContent({ question }: MediaContentProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    return () => {
      audioRef.current?.pause()
    }
  }, [question.mediaUrl])

  if (!question.mediaUrl) return null

  switch (question.type) {
    case 'audio': {
      const videoId = getYouTubeVideoId(question.mediaUrl)
      if (videoId) {
        return <YouTubeAudioPlayer videoId={videoId} />
      }
      return (
        <audio
          ref={audioRef}
          controls
          src={question.mediaUrl}
          style={{ display: 'block', margin: '16px auto', width: '100%' }}
        />
      )
    }
    case 'picture':
      return (
        <img
          src={question.mediaUrl}
          alt="Question media"
          style={{ width: '100%', marginTop: '12px', borderRadius: '8px' }}
        />
      )
    case 'video': {
      const videoId = getYouTubeVideoId(question.mediaUrl)
      if (videoId) {
        return (
          <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', marginTop: '12px', borderRadius: '8px', overflow: 'hidden' }}>
            <iframe
              src={buildEmbedUrl(videoId, { autoplay: true })}
              allow="autoplay; accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
            />
            {/* Cover the title bar YouTube renders at the top */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '40px', background: '#000', pointerEvents: 'none' }} />
          </div>
        )
      }
      return (
        <video controls style={{ width: '100%', marginTop: '12px', borderRadius: '8px' }}>
          <source src={question.mediaUrl} type="video/mp4" />
        </video>
      )
    }
    default:
      return null
  }
}
