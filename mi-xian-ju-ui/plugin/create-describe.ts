import MarkdownIt from 'markdown-it'
import container from 'markdown-it-container'

export default function createDescribe(klass: string) {
  return [
    container,
    klass,
    {
      render(tokens: any[], idx: number) {
        const token = tokens[idx]
        const matchedInfo = token.info.trim().match(/^describe\s+(.*)$/)
        const description = matchedInfo?.[1]
        const descTemplate = new MarkdownIt({ html: true }).render(description || '')

        return token.nesting === 1 && description
          ? `<div class="describe-plugin">${descTemplate}`
          : '</div>\n'
      },
    },
  ] as const
}
