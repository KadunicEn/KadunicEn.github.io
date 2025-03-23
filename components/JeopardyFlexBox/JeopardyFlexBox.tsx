/* eslint-disable jsx-a11y/media-has-caption */
import { Button, Container, Grid, Modal, Paper, Text, Title } from '@mantine/core'
import { useHotkeys } from '@mantine/hooks'
import { useEffect, useState } from 'react'

interface Question {
  question: string
  category: string
  value: number
  type?: 'audio' | 'picture' | 'video'
  mediaUrl?: string
}

interface Category {
  name: string
  questions: Question[]
}

export default function JeopardyGrid() {
  const [categories, setCategories] = useState<Category[]>([])
  const [opened, setOpened] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
  const [hoveredQuestionIndex, setHoveredQuestionIndex] = useState<{
    categoryIndex: number
    questionIndex: number
  } | null>(null)

  const handlePaperClick = (question: Question) => {
    setSelectedQuestion(question)
    setOpened(true)
  }

  const renderMediaContent = (question: Question) => {
    if (!question.mediaUrl) {
      return null
    }

    switch (question.type) {
      case 'audio':
        return <Button onClick={() => new Audio(question.mediaUrl).play()}>Play Audio</Button>
      case 'picture':
        return (
          <img
            src={question.mediaUrl}
            alt="Question media"
            style={{ width: '100%', marginTop: '10px' }}
          />
        )
      case 'video':
        return (
          <video controls style={{ width: '100%', marginTop: '10px' }}>
            <source src={question.mediaUrl} type="video/mp4" />
            Sicher dass es n mp4 ist?.
          </video>
        )
      default:
        return null
    }
  }
  useHotkeys([['mod+l', () => new Audio('/media/loser.mp3').play()]])
  useHotkeys([['mod+ö', () => new Audio('/media/winner.mp3').play()]])

  useEffect(() => {
    fetch('/questions.json')
      .then((res) => res.json())
      .then((data) => setCategories(data.categories))
  }, [])

  return (
    <>
      <Container
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          minHeight: '100vh'
        }}
      >
        <Grid align="center" justify="center" style={{ marginBottom: '20px' }}>
          {' '}
          {/* Add margin to separate from the grid */}
          <Grid.Col
            span={12}
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'column'
            }}
          >
            <img
              src="/media/logo.jpg"
              alt="Logo"
              style={{
                width: '20%',
                marginBottom: '20px',
                height: 'auto',
                maxWidth: '300px',
                borderRadius: '100%'
              }}
            />
            <Title order={1} style={{ textAlign: 'center' }}>
              Quizshow Stumic
            </Title>
          </Grid.Col>
        </Grid>
        <Grid align="center" justify="center">
          {categories.map((category, index) => (
            <Grid.Col key={index} span={2}>
              <Paper
                shadow="xs"
                p="md"
                withBorder
                style={{
                  marginBottom: '10px',
                  textAlign: 'center',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%'
                }}
              >
                <Text>{category.name}</Text>
              </Paper>
            </Grid.Col>
          ))}
        </Grid>

        <Grid align="center" justify="center">
          {categories.map((category, categoryIndex) => (
            <Grid.Col key={categoryIndex} span={2}>
              {category.questions.map((question, questionIndex) => (
                <Paper
                  key={questionIndex}
                  shadow="xs"
                  p="md"
                  withBorder
                  style={{
                    textAlign: 'center',
                    marginBottom: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    transition: 'background-color 0.2s ease-in-out',
                    backgroundColor:
                      hoveredQuestionIndex?.categoryIndex === categoryIndex &&
                      hoveredQuestionIndex?.questionIndex === questionIndex
                        ? '#2a2a2a'
                        : '#242424'
                  }}
                  onClick={() => handlePaperClick(question)}
                  onMouseEnter={() => setHoveredQuestionIndex({ categoryIndex, questionIndex })}
                  onMouseLeave={() => setHoveredQuestionIndex(null)}
                >
                  <p>{`${question.value}`}</p>
                </Paper>
              ))}
            </Grid.Col>
          ))}
        </Grid>

        <Modal opened={opened} onClose={() => setOpened(false)} title={selectedQuestion.category} centered>
          <Text>{selectedQuestion?.question}</Text>
          {selectedQuestion && renderMediaContent(selectedQuestion)}
        </Modal>
      </Container>
    </>
  )
}
