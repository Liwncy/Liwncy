import { layer } from '@layui/layer-vue'

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    layer.msg('复制成功', { icon: 1, time: 2000 })
    return true
  } catch {
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-9999px'
    document.body.appendChild(textArea)
    textArea.select()
    try {
      document.execCommand('copy')
      layer.msg('复制成功', { icon: 1, time: 2000 })
      return true
    } catch {
      layer.msg('复制失败，请手动复制', { icon: 2, time: 2000 })
      return false
    } finally {
      document.body.removeChild(textArea)
    }
  }
}
