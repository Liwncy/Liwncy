import MarkdownIt from 'markdown-it'
import highlight from './highlight'

function getInnerString(
  string: string,
  prefix: string,
  postfix = '',
  type: 'i' | 'g' | 'm' = 'i',
): string | undefined {
  const result = new RegExp(`${prefix}(.*)${postfix}`, type)
  const match = string.match(result)
  return match ? match[1].trim() : undefined
}

function assignScript(script: string) {
  const dependencies = {} as Record<string, string[]>
  const attrs = {} as Record<string, string>
  const content = script
    .replace(/import\s?\{.*\}.*/g, (item) => {
      const key = getInnerString(item.replace(/'/g, '"'), '"', '"')
      const value = getInnerString(item.replace(/\s+/g, ''), '{', '}')
      const list = value ? value.split(',') : []
      if (key && dependencies[key]) {
        dependencies[key] = dependencies[key].concat(list)
      } else if (key) {
        dependencies[key] = list
      }
      return ''
    })
    .replace(/(const|let|var)\s\w*\s?=/g, (item) => {
      const attr = getInnerString(item, '\\s', '\\s?=')
      if (attr && !(attr in attrs)) {
        attrs[attr] = attr
        return `let ${attr} =`
      }
      return `${attr} =`
    })
    .replace(/\n+/gm, '\n')

  const imports = Object.keys(dependencies).reduce((all, item) => {
    const filterAttrs = [...new Set(dependencies[item])]
    return `${all}import {${filterAttrs.join(',')}} from '${item}';\n`
  }, '')

  return imports + content
}

let script = ''

export default {
  render: (tokens: any[], idx: number): string => {
    const htmlBlock = tokens.filter((item) => item.type === 'html_block')
    const { nesting, info = '', map } = tokens[idx]

    if (nesting === -1) return '</lay-code>'

    const matchedInfo = info.trim().match(/^demo\s+(.*)$/)
    const description = matchedInfo?.[1]
    const descTemplate = new MarkdownIt().render(description || '')
    let str = ''
    let lastLine = Number.NaN

    for (let i = 0; i < htmlBlock.length; i += 1) {
      const item = htmlBlock[i]
      if (item.map && map && item.map[0] >= map[0] && item.map[1] <= map[1]) {
        const delta = item.map[0] - (lastLine || item.map[1])
        if (delta > 0) str += '\n'.repeat(delta)
        str += item.content
        lastLine = item.map[1]
        if (i === 0) script = ''

        if (/^<template>/.test(item.content)) {
          const reContent = item.content.match(/^<template>((\s|\S)*)<\/template>/m)
          item.content = reContent?.[1] || ''
        }

        if (item.content.includes('<script')) {
          const reScript = item.content.match(/^<script\s?.*?>((\s|\S)*)<\/script>/m)
          script += reScript?.[1] || ''
          item.content = ''
        }

        if (i + 1 === htmlBlock.length) {
          item.content = `
          <script setup>
            ${assignScript(script)}
          </script>`
        }
      }
    }

    return `
    <lay-code>
      ${description ? `<template #description>${descTemplate}</template>` : ''}
      <template #code>${highlight(str, 'vue')}</template>
    `
  },
}
