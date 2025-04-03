import { useEffect, useState } from 'react'
import {
  Button,
  ButtonGroup,
  Container,
  Grid,
  Modal,
  Paper,
  Text,
  Title,
  useMantineColorScheme
} from '@mantine/core'
import { useHotkeys } from '@mantine/hooks'

interface Question {
  question: string
  category: string
  value: number
  type?: 'audio' | 'picture' | 'video'
  mediaUrl?: string
  solution?: string
}

interface Category {
  name: string
  questions: Question[]
}

export default function JeopardyGrid() {
  const { setColorScheme } = useMantineColorScheme()
  const [categories, setCategories] = useState<Category[]>([])
  const [opened, setOpened] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState<{
    question: Question
    categoryIndex: number
    questionIndex: number
  } | null>(null)
  const [questionColors, setQuestionColors] = useState<{ [key: string]: string }>({})
  const [teamScores, setTeamScores] = useState<{ [team: string]: number }>({
    red: 0,
    green: 0,
    blue: 0
  })
  const [showSolution, setShowSolution] = useState(false)
  const teamOne = 'red'
  const teamTwo = 'green'
  const teamThree = 'blue'

  const handlePaperClick = (question: Question, categoryIndex: number, questionIndex: number) => {
    setSelectedQuestion({ question, categoryIndex, questionIndex })
    setShowSolution(false)
    setOpened(true)
  }

  const handleButtonClick = (color: string) => {
    if (selectedQuestion) {
      const key = `${selectedQuestion.categoryIndex}-${selectedQuestion.questionIndex}`
      setQuestionColors((prevColors) => ({
        ...prevColors,
        [key]: '#000000'
      }))
      setTeamScores((prevScores) => ({
        ...prevScores,
        [color]: prevScores[color] + selectedQuestion.question.value
      }))
    }
  }

  const renderMediaContent = (question: Question) => {
    if (!question.mediaUrl) {
      return null
    }

    switch (question.type) {
      case 'audio': {
        const audio = new Audio(question.mediaUrl)
        return (
          <ButtonGroup style={{ display: 'flex', justifySelf: 'center' }}>
            <Button onClick={() => audio.play()}>Play Audio</Button>
            <Button
              style={{ display: 'flex', justifySelf: 'center' }}
              onClick={() => audio.pause()}
            >
              Pause Audio
            </Button>
          </ButtonGroup>
        )
      }
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
    setColorScheme('dark')
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
              Stumic Quizshow
            </Title>
            <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%' }}>
              <Text bg="red">
                {teamOne}: {teamScores.red}
              </Text>
              <Text bg="green">
                {teamTwo}: {teamScores.green}
              </Text>
              <Text bg="blue">
                {teamThree}: {teamScores.blue}
              </Text>
            </div>
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
              {category.questions.map((question, questionIndex) => {
                const key = `${categoryIndex}-${questionIndex}`
                return (
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
                      backgroundColor: questionColors[key] || '#242424'
                    }}
                    onClick={() => handlePaperClick(question, categoryIndex, questionIndex)}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1a1a1a')}
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = questionColors[key] || '#242424')
                    }
                  >
                    <p>{`${question.value}`}</p>
                  </Paper>
                )
              })}
            </Grid.Col>
          ))}
        </Grid>

        <Modal
          opened={opened}
          onClose={() => setOpened(false)}
          title={`${selectedQuestion?.question.category} - ${selectedQuestion?.question.value}`}
          centered
        >
          <Text style={{ textAlign: 'center' }}>{selectedQuestion?.question.question}</Text>
          {selectedQuestion && renderMediaContent(selectedQuestion.question)}
          {!showSolution && selectedQuestion?.question.solution && (
            <Button
              style={{ display: 'block', margin: '10px auto' }}
              onClick={() => setShowSolution(true)}
            >
              Lösung
            </Button>
          )}
          {showSolution && (
            <Text style={{ marginTop: '10px', textAlign: 'center' }}>
              {selectedQuestion?.question.solution}
            </Text>
          )}
          <ButtonGroup mt={10} style={{ display: 'flex', justifyContent: 'center' }}>
            <Button bg="red" onClick={() => handleButtonClick('red')}>
              Team Rot
            </Button>
            <Button bg="green" onClick={() => handleButtonClick('green')}>
              Team Grün
            </Button>
            <Button bg="blue" onClick={() => handleButtonClick('blue')}>
              Team Blau
            </Button>
          </ButtonGroup>
        </Modal>
      </Container>
    </>
  )
}
