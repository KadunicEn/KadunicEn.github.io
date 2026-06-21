import { Question, QuizConfig, STORAGE_KEYS } from '@/types/quiz'
import { Button, Container, Group, Paper, SimpleGrid, Stack, Text, Title } from '@mantine/core'
import { useHotkeys } from '@mantine/hooks'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import QuestionModal from './QuestionModal'
import ScoreBoard from './ScoreBoard'

interface SelectedQuestion {
  question: Question
  categoryIndex: number
  questionIndex: number
  categoryName: string
}

interface JeopardyBoardProps {
  config: QuizConfig
}

export default function JeopardyBoard({ config }: JeopardyBoardProps) {
  const { title, teams, categories } = config

  const [scores, setScores] = useState<number[]>(teams.map(() => 0))
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<string>>(new Set())
  const [opened, setOpened] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState<SelectedQuestion | null>(null)

  useHotkeys([
    ['mod+l', () => new Audio('/media/loser.mp3').play()],
    ['mod+ö', () => new Audio('/media/winner.mp3').play()],
  ])

  // Restore persisted state on mount
  useEffect(() => {
    const storedScores = localStorage.getItem(STORAGE_KEYS.scores)
    const storedAnswered = localStorage.getItem(STORAGE_KEYS.answeredQuestions)

    if (storedScores) {
      try {
        const parsed = JSON.parse(storedScores)
        if (Array.isArray(parsed) && parsed.length === teams.length) {
          setScores(parsed)
        }
      } catch {
        // ignore malformed data
      }
    }
    if (storedAnswered) {
      try {
        setAnsweredQuestions(new Set(JSON.parse(storedAnswered)))
      } catch {
        // ignore malformed data
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.scores, JSON.stringify(scores))
  }, [scores])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.answeredQuestions, JSON.stringify(Array.from(answeredQuestions)))
  }, [answeredQuestions])

  const handlePaperClick = (
    question: Question,
    categoryIndex: number,
    questionIndex: number,
    categoryName: string,
  ) => {
    setSelectedQuestion({ question, categoryIndex, questionIndex, categoryName })
    setOpened(true)
  }

  const handleTeamScore = (teamIndex: number) => {
    if (!selectedQuestion || teamIndex < 0) return
    setScores((prev) => {
      const next = [...prev]
      next[teamIndex] = (next[teamIndex] ?? 0) + selectedQuestion.question.value
      return next
    })
  }

  const handleTeamScoreReverted = (teamIndex: number) => {
    if (!selectedQuestion || teamIndex < 0) return
    setScores((prev) => {
      const next = [...prev]
      next[teamIndex] = (next[teamIndex] ?? 0) - selectedQuestion.question.value
      return next
    })
  }

  const handleClose = () => {
    if (selectedQuestion) {
      const key = `${selectedQuestion.categoryIndex}-${selectedQuestion.questionIndex}`
      setAnsweredQuestions((prev) => new Set(Array.from(prev).concat(key)))
    }
    setOpened(false)
  }

  const resetGame = () => {
    setScores(teams.map(() => 0))
    setAnsweredQuestions(new Set())
    localStorage.removeItem(STORAGE_KEYS.scores)
    localStorage.removeItem(STORAGE_KEYS.answeredQuestions)
  }

  const isAnswered = (categoryIndex: number, questionIndex: number) =>
    answeredQuestions.has(`${categoryIndex}-${questionIndex}`)

  const colCount = categories.length

  return (
    <Container size="xl" py="md">
      {/* Header */}
      <Stack align="center" gap="xs" mb="lg">
        <Title order={1}>{title}</Title>
        <ScoreBoard teams={teams} scores={scores} />
        <Group gap="xs" mt="xs">
          <Button variant="outline" color="gray" size="xs" onClick={resetGame}>
            Zurücksetzen
          </Button>
          <Button variant="outline" color="gray" size="xs" component={Link} href="/">
            Neues Quiz einrichten
          </Button>
        </Group>
      </Stack>

      {/* Category headers */}
      <SimpleGrid cols={colCount} spacing="xs">
        {categories.map((category, i) => (
          <Paper
            key={i}
            shadow="xs"
            p="sm"
            withBorder
            style={{ textAlign: 'center' }}
          >
            <Text fw={700} size="sm">
              {category.name}
            </Text>
          </Paper>
        ))}
      </SimpleGrid>

      {/* Question cards */}
      <SimpleGrid cols={colCount} spacing="xs" mt="xs">
        {categories.map((category, categoryIndex) => (
          <Stack key={categoryIndex} gap="xs">
            {category.questions.map((question, questionIndex) => {
              const answered = isAnswered(categoryIndex, questionIndex)
              return (
                <Paper
                  key={questionIndex}
                  shadow="xs"
                  p="md"
                  withBorder
                  onClick={() =>
                    !answered &&
                    handlePaperClick(question, categoryIndex, questionIndex, category.name)
                  }
                  onMouseEnter={(e) => {
                    if (!answered) e.currentTarget.style.backgroundColor = '#1a1a1a'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = answered ? '#111' : '#242424'
                  }}
                  style={{
                    textAlign: 'center',
                    cursor: answered ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '64px',
                    transition: 'background-color 0.15s ease-in-out',
                    backgroundColor: answered ? '#111' : '#242424',
                    opacity: answered ? 0.35 : 1,
                  }}
                >
                  {!answered && (
                    <Text fw={700} size="xl">
                      {question.value}
                    </Text>
                  )}
                </Paper>
              )
            })}
          </Stack>
        ))}
      </SimpleGrid>

      <QuestionModal
        question={selectedQuestion?.question ?? null}
        categoryName={selectedQuestion?.categoryName ?? ''}
        opened={opened}
        onClose={handleClose}
        teams={teams}
        onTeamScore={handleTeamScore}
        onTeamScoreReverted={handleTeamScoreReverted}
      />
    </Container>
  )
}
