import container from 'markdown-it-container'

export default function createAnchor(klass: string) {
  return [
    container,
    klass,
    {
      render(tokens: any[], idx: number) {
        const token = tokens[idx]
        if (token.nesting === 1) {
          const anchors: string[] = []
          for (const item of tokens) {
            if (item.nesting === 1 && item.info?.trim().startsWith('title')) {
              anchors.push(item.info.trim().slice('title'.length).trim())
            }
          }
          return `<lay-anchor anchors="${anchors.join(',')}" :currIndex="-1" :show="true">`
        }
        return '</lay-anchor>\n'
      },
    },
  ] as const
}
