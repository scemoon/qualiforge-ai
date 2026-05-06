import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import CodeBlock from '@tiptap/extension-code-block'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import { Markdown } from '@tiptap/markdown'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { useEffect, useCallback, useState } from 'react'

interface ArticleEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

type ToolbarBtn = {
  label: string
  title: string
  action: () => void
  active?: () => boolean
}

export default function ArticleEditor({ content, onChange, placeholder = '开始写文章...' }: ArticleEditorProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        heading: { levels: [1, 2, 3] },
      }),
      Link.configure({ openOnClick: false }),
      Image,
      Placeholder.configure({ placeholder }),
      CodeBlock,
      TaskList,
      TaskItem.configure({ nested: true }),
      Markdown.configure({
        indentation: { style: 'space', size: 2 },
      }),
    ],
    onUpdate: ({ editor }) => {
      const md = editor.storage.markdown.manager.serialize(editor.getJSON())
      onChange(md)
    },
    editorProps: {
      attributes: {
        class: 'prose max-w-none text-sm focus:outline-none min-h-[300px] px-4 py-3',
      },
    },
  })

  // Load content — detect HTML (old data) vs Markdown, convert HTML to Markdown if needed
  useEffect(() => {
    if (!editor || !content) return
    if (content.trim().startsWith('<')) {
      // Old HTML article → convert to Markdown then load
      const md = marked.parse(DOMPurify.sanitize(content)) as string
      const json = editor.storage.markdown.manager.parse(md)
      editor.commands.setContent(json, { emitUpdate: false })
    } else {
      // New Markdown article → parse and load directly
      const json = editor.storage.markdown.manager.parse(content)
      editor.commands.setContent(json, { emitUpdate: false })
    }
  }, [content, editor])

  const setLink = useCallback(() => {
    if (!editor) return
    const url = window.prompt('输入链接地址:')
    if (url) editor.chain().focus().setLink({ href: url }).run()
  }, [editor])

  const setImage = useCallback(() => {
    if (!editor) return
    const url = window.prompt('输入图片地址:')
    if (url) editor.chain().focus().setImage({ src: url }).run()
  }, [editor])

  const insertHorizontalRule = useCallback(() => {
    if (!editor) return
    editor.chain().focus().setHorizontalRule().run()
  }, [editor])

  const toggleFullscreen = useCallback(() => setIsFullscreen(f => !f), [])

  if (!editor) return null

  const toolbarGroups: Array<ToolbarBtn | '|'> = [
    { label: 'H1', title: '一级标题', action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), active: () => editor.isActive('heading', { level: 1 }) },
    { label: 'H2', title: '二级标题', action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: () => editor.isActive('heading', { level: 2 }) },
    { label: 'H3', title: '三级标题', action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), active: () => editor.isActive('heading', { level: 3 }) },
    '|',
    { label: 'B', title: '粗体', action: () => editor.chain().focus().toggleBold().run(), active: () => editor.isActive('bold') },
    { label: 'I', title: '斜体', action: () => editor.chain().focus().toggleItalic().run(), active: () => editor.isActive('italic') },
    { label: '❝', title: '引用', action: () => editor.chain().focus().toggleBlockquote().run(), active: () => editor.isActive('blockquote') },
    '|',
    { label: '•', title: '无序列表', action: () => editor.chain().focus().toggleBulletList().run(), active: () => editor.isActive('bulletList') },
    { label: '1.', title: '有序列表', action: () => editor.chain().focus().toggleOrderedList().run(), active: () => editor.isActive('orderedList') },
    '|',
    { label: '🔗', title: '链接', action: setLink, active: () => editor.isActive('link') },
    { label: '📷', title: '图片', action: setImage },
    { label: '```', title: '代码块', action: () => editor.chain().focus().toggleCodeBlock().run(), active: () => editor.isActive('codeBlock') },
    { label: '—', title: '分割线', action: insertHorizontalRule },
    '|',
    { label: '⛶', title: isFullscreen ? '退出全屏' : '全屏', action: toggleFullscreen },
  ]

  function renderToolbar() {
    return toolbarGroups.map((btn, idx) =>
      btn === '|'
        ? <span key={`sep-${idx}`} className="w-px h-5 bg-[#E5E7EB] self-center mx-0.5" />
        : (
          <button
            key={btn.label}
            type="button"
            title={btn.title}
            onClick={btn.action}
            className={`px-1.5 py-1 text-xs border rounded transition font-medium ${
              btn.active?.()
                ? 'bg-[#4F46E5] text-white border-[#4F46E5]'
                : 'border-[#E5E7EB] text-[#374151] hover:bg-[#F3F4F6]'
            }`}
          >
            {btn.label}
          </button>
        )
    )
  }

  const editorContent = (
    <div className="border border-[#E5E7EB] rounded-md bg-white flex flex-col" style={{ height: isFullscreen ? 'calc(100vh - 120px)' : 500 }}>
      <div className="flex flex-wrap gap-0.5 px-3 py-2 border-b border-[#E5E7EB]">
        {renderToolbar()}
      </div>
      <div className="flex-1 overflow-auto">
        <EditorContent editor={editor} className="h-full" />
      </div>
    </div>
  )

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E7EB] bg-white">
          <h1 className="text-lg font-bold text-[#111827]">富文本编辑</h1>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#9CA3AF]">{editor.storage.markdown.manager.serialize(editor.getJSON()).length} 字符</span>
            <button onClick={toggleFullscreen} className="px-3 py-1.5 text-sm border border-[#E5E7EB] rounded-md hover:bg-[#F9FAFB] text-[#4B5563]">退出全屏</button>
          </div>
        </div>
        <div className="flex-1 flex flex-col overflow-hidden px-3 py-2">
          {editorContent}
        </div>
      </div>
    )
  }

  return editorContent
}