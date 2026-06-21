import type { Category, QuizConfig, TeamConfig } from '@/types/quiz'
import { STORAGE_KEYS, TEAM_COLORS } from '@/types/quiz'
import {
  ActionIcon,
  Alert,
  Button,
  ColorSwatch,
  Container,
  Divider,
  FileButton,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip,
} from '@mantine/core'
import { IconAlertCircle, IconPlus, IconTrash, IconUpload } from '@tabler/icons-react'
import { useRouter } from 'next/router'
import { useState } from 'react'

const DEFAULT_TEAMS: TeamConfig[] = [
  { name: 'Team 1', color: 'red' },
  { name: 'Team 2', color: 'blue' },
]

function validateQuizData(data: unknown): Category[] {
  if (!data || typeof data !== 'object') {
    throw new Error('Ungültiges JSON-Format')
  }
  const obj = data as Record<string, unknown>
  if (!Array.isArray(obj.categories) || obj.categories.length === 0) {
    throw new Error('JSON muss ein nicht-leeres "categories"-Array enthalten')
  }
  return obj.categories.map((cat: unknown, i: number) => {
    if (!cat || typeof cat !== 'object') {
      throw new Error(`Kategorie ${i + 1} ist ungültig`)
    }
    const c = cat as Record<string, unknown>
    if (typeof c.name !== 'string' || !c.name) {
      throw new Error(`Kategorie ${i + 1} benötigt einen Namen`)
    }
    if (!Array.isArray(c.questions) || c.questions.length === 0) {
      throw new Error(`Kategorie "${c.name}" benötigt mindestens eine Frage`)
    }
    return cat as Category
  })
}

export default function Setup() {
  const router = useRouter()
  const [quizTitle, setQuizTitle] = useState('Jeopardy Quiz')
  const [teams, setTeams] = useState<TeamConfig[]>(DEFAULT_TEAMS)
  const [categories, setCategories] = useState<Category[] | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleFileUpload = (file: File | null) => {
    if (!file) return
    setError(null)
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        const validated = validateQuizData(data)
        setCategories(validated)
        setFileName(file.name)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Fehler beim Lesen der Datei')
        setCategories(null)
        setFileName(null)
      }
    }
    reader.readAsText(file)
  }

  const loadExample = async () => {
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/questions.json')
      if (!res.ok) throw new Error('Beispieldatei nicht gefunden')
      const data = await res.json()
      const validated = validateQuizData(data)
      setCategories(validated)
      setFileName('questions.json (Beispiel)')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Beispieldaten konnten nicht geladen werden')
    } finally {
      setLoading(false)
    }
  }

  const addTeam = () => {
    if (teams.length >= TEAM_COLORS.length) return
    const usedColors = new Set(teams.map((t) => t.color))
    const nextColor = TEAM_COLORS.find((c) => !usedColors.has(c)) ?? TEAM_COLORS[0]
    setTeams([...teams, { name: `Team ${teams.length + 1}`, color: nextColor }])
  }

  const removeTeam = (index: number) => {
    setTeams(teams.filter((_, i) => i !== index))
  }

  const updateTeamName = (index: number, name: string) => {
    setTeams(teams.map((t, i) => (i === index ? { ...t, name } : t)))
  }

  const updateTeamColor = (index: number, color: TeamConfig['color']) => {
    setTeams(teams.map((t, i) => (i === index ? { ...t, color } : t)))
  }

  const startQuiz = () => {
    setError(null)
    if (!quizTitle.trim()) {
      setError('Bitte gib einen Titel ein')
      return
    }
    if (teams.length === 0) {
      setError('Mindestens ein Team wird benötigt')
      return
    }
    if (teams.some((t) => !t.name.trim())) {
      setError('Alle Teams benötigen einen Namen')
      return
    }
    if (!categories || categories.length === 0) {
      setError('Bitte lade eine Fragendatei hoch oder nutze das Beispiel-Quiz')
      return
    }

    const config: QuizConfig = {
      title: quizTitle.trim(),
      teams,
      categories,
    }
    localStorage.setItem(STORAGE_KEYS.config, JSON.stringify(config))
    localStorage.removeItem(STORAGE_KEYS.scores)
    localStorage.removeItem(STORAGE_KEYS.answeredQuestions)
    router.push('/quiz')
  }

  return (
    <Container size="sm" py="xl">
      <Stack gap="xl">
        <Title order={1} ta="center">
          Quiz einrichten
        </Title>

        {/* Quiz title */}
        <Stack gap="xs">
          <Text fw={600}>Quiz-Titel</Text>
          <TextInput
            value={quizTitle}
            onChange={(e) => setQuizTitle(e.currentTarget.value)}
            placeholder="z. B. Stumic Quizshow"
          />
        </Stack>

        {/* Teams */}
        <Stack gap="xs">
          <Group justify="space-between">
            <Text fw={600}>Teams</Text>
            <Button
              size="xs"
              variant="light"
              leftSection={<IconPlus size={14} />}
              onClick={addTeam}
              disabled={teams.length >= TEAM_COLORS.length}
            >
              Team hinzufügen
            </Button>
          </Group>

          {teams.map((team, index) => (
            <Paper key={index} p="sm" withBorder>
              <Group gap="sm" align="center" wrap="nowrap">
                <TextInput
                  flex={1}
                  value={team.name}
                  onChange={(e) => updateTeamName(index, e.currentTarget.value)}
                  placeholder={`Team ${index + 1}`}
                />
                <Group gap={4} wrap="wrap">
                  {TEAM_COLORS.map((color) => (
                    <Tooltip key={color} label={color} withArrow>
                      <ColorSwatch
                        color={`var(--mantine-color-${color}-6)`}
                        size={22}
                        style={{
                          cursor: 'pointer',
                          outline: team.color === color ? '2px solid white' : 'none',
                          outlineOffset: '2px',
                        }}
                        onClick={() => updateTeamColor(index, color)}
                      />
                    </Tooltip>
                  ))}
                </Group>
                <ActionIcon
                  variant="subtle"
                  color="red"
                  onClick={() => removeTeam(index)}
                  disabled={teams.length <= 1}
                  aria-label="Team entfernen"
                >
                  <IconTrash size={16} />
                </ActionIcon>
              </Group>
            </Paper>
          ))}
        </Stack>

        <Divider />

        {/* Questions */}
        <Stack gap="xs">
          <Text fw={600}>Fragen</Text>
          <Text size="sm" c="dimmed">
            Lade eine eigene JSON-Datei hoch oder nutze das eingebaute Beispiel-Quiz. Die Datei muss
            dem{' '}
            <a href="/questions.json" target="_blank" rel="noopener noreferrer">
              Jeopardy-Format
            </a>{' '}
            entsprechen. Für Videos und Audios einfach einen YouTube-Link verwenden. Für Bilder den Link zum Bild. Wichtig ist es in der JSON immer den korrekten Typen anzugeben.
          </Text>

          <Group>
            <FileButton onChange={handleFileUpload} accept="application/json,.json">
              {(props) => (
                <Button {...props} variant="outline" leftSection={<IconUpload size={16} />}>
                  JSON hochladen
                </Button>
              )}
            </FileButton>
            <Button variant="outline" onClick={loadExample} loading={loading}>
              Beispiel verwenden
            </Button>
          </Group>

          {fileName && categories && (
            <Text size="sm" c="teal">
              ✓ {fileName} – {categories.length}{' '}
              {categories.length === 1 ? 'Kategorie' : 'Kategorien'} geladen
            </Text>
          )}
        </Stack>

        {error && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" title="Fehler">
            {error}
          </Alert>
        )}

        <Button size="lg" onClick={startQuiz} disabled={!categories}>
          Quiz starten
        </Button>
      </Stack>
    </Container>
  )
}
