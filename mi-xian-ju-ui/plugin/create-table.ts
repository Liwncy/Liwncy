import container from 'markdown-it-container'

export default function createTable(klass: string) {
  return [
    container,
    klass,
    {
      render(tokens: any[], idx: number) {
        const token = tokens[idx]
        const info = token.info.trim().slice(klass.length).trim()
        return token.nesting === 1 ? `<lay-table-box>${info}` : '</lay-table-box>\n'
      },
    },
  ] as const
}
