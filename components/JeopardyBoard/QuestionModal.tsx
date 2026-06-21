import type { Question, TeamConfig } from '@/types/quiz'
import { Badge, Button, Group, Modal, Text } from '@mantine/core'
import { useEffect, useState } from 'react'
import MediaContent from './MediaContent'

interface QuestionModalProps {
  question: Question | null
  categoryName: string
  opened: boolean
  onClose: () => void
  teams: TeamConfig[]
  onTeamScore: (teamIndex: number) => void
  onTeamScoreReverted: (teamIndex: number) => void
}

export default function QuestionModal({
  question,
  categoryName,
  opened,
  onClose,
  teams,
  onTeamScore,
  onTeamScoreReverted,
}: QuestionModalProps) {
  const [showSolution, setShowSolution] = useState(false)
  const [scoredTeams, setScoredTeams] = useState<Set<number>>(new Set())

  // Reset state each time a new question opens
  useEffect(() => {
    if (opened) {
      setShowSolution(false)
      setScoredTeams(new Set())
    }
  }, [opened])

  const handleTeamClick = (index: number) => {
    if (scoredTeams.has(index)) {
      setScoredTeams((prev) => {
        const next = new Set(Array.from(prev))
        next.delete(index)
        return next
      })
      onTeamScoreReverted(index)
    } else {
      setScoredTeams((prev) => new Set(Array.from(prev).concat(index)))
      onTeamScore(index)
    }
  }

  return (
    <Modal
      size="xl"
      opened={opened}
      onClose={onClose}
      title={question ? `${categoryName} – ${question.value}` : ''}
      centered
    >
      {question && (
        <>
          <Text ta="center" size="lg">
            {question.question}
          </Text>

          <MediaContent question={question} />

          {!showSolution && question.solution && (
            <Button display="block" mx="auto" mt="md" onClick={() => setShowSolution(true)}>
              Lösung anzeigen
            </Button>
          )}

          {showSolution && question.solution && (
            <Text ta="center" mt="md" fs="italic" c="dimmed">
              {question.solution}
            </Text>
          )}

          <Group mt="lg" justify="center" wrap="wrap" gap="xs">
            {teams.map((team, index) => {
              const scored = scoredTeams.has(index)
              return (
                <Button
                  key={index}
                  color={team.color}
                  variant={scored ? 'filled' : 'outline'}
                  onClick={() => handleTeamClick(index)}
                  title={scored ? 'Klicken um Punkte zurückzunehmen' : undefined}
                  rightSection={scored ? <Badge color={team.color} size="xs">✓</Badge> : null}
                >
                  {team.name}
                </Button>
              )
            })}
          </Group>

          <Group mt="md" justify="center" gap="xs">
            <Button variant="light" color="gray" onClick={onClose}>
              Fertig
            </Button>
            <Button variant="outline" color="orange" onClick={() => { setScoredTeams(new Set()); onClose() }}>
              Niemand
            </Button>
          </Group>
        </>
      )}
    </Modal>
  )
}
