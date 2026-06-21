import type { TeamConfig } from '@/types/quiz'
import { Group, Text } from '@mantine/core'

interface ScoreBoardProps {
  teams: TeamConfig[]
  scores: number[]
}

export default function ScoreBoard({ teams, scores }: ScoreBoardProps) {
  return (
    <Group justify="space-around" w="100%" mt="xs">
      {teams.map((team, index) => (
        <Text key={index} fw={700} c={team.color} size="lg">
          {team.name}: {scores[index] ?? 0}
        </Text>
      ))}
    </Group>
  )
}
