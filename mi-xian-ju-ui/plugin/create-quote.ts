import container from 'markdown-it-container'

export default function createQuote(klass: string) {
  return [
    container,
    klass,
    {
      render(tokens: any[], idx: number) {
        const token = tokens[idx]
        const info = token.info.trim().slice(klass.length).trim()
        return token.nesting === 1
          ? `<lay-quote style="margin-left:0;margin-right:0;margin-top:20px;margin-bottom:40px;">${info}`
          : '</lay-quote>\n'
      },
    },
  ] as const
}
