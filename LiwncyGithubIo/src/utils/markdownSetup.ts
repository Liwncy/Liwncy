import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import ClipboardJS from 'clipboard';

import container from "markdown-it-container";
import snippet from "@/plugin/snippet";
import highlight from "@/plugin/highlight";
import preWrapper from "@/plugin/pre-wrapper";
import demo from "@/plugin/create-demo";
import createTable from "@/plugin/create-table";
import createQuote from "@/plugin/create-quote";
import createTitle from "@/plugin/create-title";
import createDescribe from "@/plugin/create-describe";
import createAnchor from "@/plugin/create-anchor";
import createPreviousNext from "@/plugin/create-previous-next";
import createContributor from "@/plugin/create-contributor";

const md = new MarkdownIt({
        html: true,
        linkify: true,
        typographer: true,
        highlight,
    })
        .use(snippet)
        // .use(highlight)
        .use(preWrapper)
        .use(container, "demo", demo)
        .use(container, 'lay-button', {
            validate: function (params) {
                return params.trim().match(/^button\s+(.*)$/);
            },
            render: function (tokens, idx) {
                if (tokens[idx].nesting === 1) {
                    // opening tag
                    const match = tokens[idx].info.trim().match(/^button\s+(.*)$/);
                    return `<layui-button type="${match[1]}">`;
                } else {
                    // closing tag
                    return '</layui-button>\n';
                }
            }
        })
        .use(...createTable("table"))
        .use(...createQuote("quote"))
        .use(...createTitle("title"))
        .use(...createDescribe("describe"))
        .use(...createAnchor("anchor"))
        .use(...createPreviousNext("previousNext"))
        .use(...createContributor("contributor"))
        .use(container, 'spoiler', {

            validate: function (params) {
                return params.trim().match(/^spoiler\s+(.*)$/);
            },

            render: function (tokens, idx) {
                const m = tokens[idx].info.trim().match(/^spoiler\s+(.*)$/);

                if (tokens[idx].nesting === 1) {
                    // opening tag
                    return '<details><summary>' + md.utils.escapeHtml(m[1]) + '</summary>\n';

                } else {
                    // closing tag
                    return '</details>\n';
                }
            }
        })
;

// md.set({
//     highlight: function (str, lang) {
//         let highlighted = str; // 默认为原始字符串
//         if (lang && hljs.getLanguage(lang)) {
//             try {
//                 highlighted = hljs.highlight(str, {
//                     language: lang,
//                     ignoreIllegals: true,
//                 }).value;
//             } catch (__) {
//                 highlighted = md.utils.escapeHtml(str); // 确保对于高亮失败的情况进行处理
//             }
//         } else {
//             highlighted = md.utils.escapeHtml(str);
//         }
//
//         // 为代码块添加复制按钮，注意data-clipboard-text属性需要使用escapeHtml处理，避免HTML特殊字符导致的问题
//         // return `<div class="code-block"><pre class="hljs"><code>${highlighted}</code></pre><lay-button class="copy-btn">复制</lay-button></div>`;
//         // return `<div class="code-block"><pre class="hljs"><code>${highlighted}</code></pre><button class="copy-btn">复制</button></div>`;
//         return `<div class="code-block"><pre class="hljs"><code>${highlighted}</code></pre></div>`;
//     },
// });


function initClipboard() {
    console.log("initClipboard");
    // 选择所有的复制按钮
    document.querySelectorAll('.copy-btn').forEach((button) => {
        let timeoutId; // 用于存储定时器ID

        // 为每个按钮创建一个ClipboardJS实例
        const clipboard = new ClipboardJS(button, {
            // @ts-ignore
            text: function (trigger) {
                // 返回该按钮相邻的<pre>标签内的文本作为要复制的内容
                // @ts-ignore
                return trigger.previousElementSibling.textContent;
            },
        });

        clipboard
            .on('success', function (e) {
                // 清除之前的定时器（如果有）
                clearTimeout(timeoutId);

                // 设置复制成功的反馈
                const originalText = '复制'; // 假设原始按钮文本是"复制"
                e.trigger.textContent = '已复制'; // 更改按钮文本为“复制成功”

                // 设置定时器，3秒后恢复原始文本
                timeoutId = setTimeout(() => {
                    e.trigger.textContent = originalText; // 3秒后恢复原始文本
                }, 3000);

                e.clearSelection(); // 清除选中状态
            })
            .on('error', function (e) {
                console.error('复制失败！');
            });
    });
}

export {md, initClipboard};