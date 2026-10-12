export type Health = {
  ok: boolean
  service: string
}

export async function fetchHealth(): Promise<Health> {
  const response = await fetch('/api/health')
  if (!response.ok) {
    throw new Error(`health ${response.status}`)
  }
  return response.json() as Promise<Health>
}
