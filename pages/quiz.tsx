import JeopardyBoard from '@/components/JeopardyBoard/JeopardyBoard'
import type { QuizConfig } from '@/types/quiz'
import { STORAGE_KEYS } from '@/types/quiz'
import { Center, Loader } from '@mantine/core'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

export default function QuizPage() {
  const router = useRouter()
  const [config, setConfig] = useState<QuizConfig | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.config)
    if (!stored) {
      router.replace('/')
      return
    }
    try {
      setConfig(JSON.parse(stored))
    } catch {
      router.replace('/')
    }
  }, [router])

  if (!config) {
    return (
      <Center h="100vh">
        <Loader />
      </Center>
    )
  }

  return <JeopardyBoard config={config} />
}
