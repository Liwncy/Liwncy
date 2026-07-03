import container from 'markdown-it-container'

export default function createTitle(klass: string) {
  return [
    container,
    klass,
    {
      render(tokens: any[], idx: number) {
        const token = tokens[idx]
        const info = token.info.trim().slice(klass.length).trim()
        return token.nesting === 1
          ? `<lay-field id="${info}" title="${info}" style="margin-top:21px;margin-bottom:20px;">`
          : '</lay-field>\n'
      },
    },
  ] as const
}
