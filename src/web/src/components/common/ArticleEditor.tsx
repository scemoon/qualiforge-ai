import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import CodeBlock from '@tiptap/extension-code-block'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import { Markdown } from '@tiptap/markdown'
import { useEffect, useCallback, useState } from 'react'

interface ArticleEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

export default function ArticleEditor({ content, onChange, placeholder = '开始写文章...' }: ArticleEditorProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [charCount, setCharCount] = useState(0)

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
      Markdown.configure({ indentation: { style: 'space', size: 2 } }),
    ],
    onUpdate: ({ editor }) => {
      onChange(editor.getMarkdown())
      setCharCount(editor.getMarkdown().length)
    },
    onCreate: ({ editor }) => {
      setCharCount(editor.getMarkdown().length)
    },
    editorProps: {
      attributes: {
        class: 'prose max-w-none text-sm focus:outline-none min-h-[300px] px-4 py-3',
      },
    },
  })

  useEffect(() => {
    if (!editor || !content) return
    editor.commands.setContent(content, { contentType: 'markdown' })
    setCharCount(editor.getMarkdown().length)
  }, [content, editor])

  const toggleFullscreen = useCallback(() => setIsFullscreen(f => !f), [])

  if (!editor) return null

  // 工具栏按钮样式
  const btn = (label: string, active: boolean, action: () => void, title: string) => (
    <button
      key={label + title}
      type="button"
      title={title}
      onClick={action}
      className={`px-2 py-1 text-xs border rounded transition font-medium flex-shrink-0 ${
        active ? 'bg-[#4F46E5] text-white border-[#4F46E5]' : 'border-[#E5E7EB] text-[#374151] hover:bg-[#F3F4F6]'
      }`}
    >
      {label}
    </button>
  )

  const sep = (key: string) => <span key={key} className="w-px h-5 bg-[#E5E7EB] mx-0.5 self-center flex-shrink-0" />

  // 分组工具栏渲染
  const renderToolbar = () => (
    <div className="flex items-center gap-1 flex-wrap">
      {btn('H1', editor.isActive('heading', { level: 1 }), () => editor.chain().focus().toggleHeading({ level: 1 }).run(), '一级标题')}
      {btn('H2', editor.isActive('heading', { level: 2 }), () => editor.chain().focus().toggleHeading({ level: 2 }).run(), '二级标题')}
      {btn('H3', editor.isActive('heading', { level: 3 }), () => editor.chain().focus().toggleHeading({ level: 3 }).run(), '三级标题')}
      {sep('sep1')}
      {btn('B', editor.isActive('bold'), () => editor.chain().focus().toggleBold().run(), '粗体')}
      {btn('I', editor.isActive('italic'), () => editor.chain().focus().toggleItalic().run(), '斜体')}
      {btn('❝', editor.isActive('blockquote'), () => editor.chain().focus().toggleBlockquote().run(), '引用')}
      {sep('sep2')}
      {btn('•', editor.isActive('bulletList'), () => editor.chain().focus().toggleBulletList().run(), '无序列表')}
      {btn('1.', editor.isActive('orderedList'), () => editor.chain().focus().toggleOrderedList().run(), '有序列表')}
      {sep('sep3')}
      {btn('🔗', editor.isActive('link'), () => { const u = window.prompt('链接地址:'); if (u) editor.chain().focus().setLink({ href: u }).run() }, '链接')}
      {btn('📷', false, () => { const u = window.prompt('图片地址:'); if (u) editor.chain().focus().setImage({ src: u }).run() }, '图片')}
      {btn('```', editor.isActive('codeBlock'), () => editor.chain().focus().toggleCodeBlock().run(), '代码块')}
      {btn('—', false, () => editor.chain().focus().setHorizontalRule().run(), '分割线')}
    </div>
  )

  const editorToolbar = (
    <div className="flex items-center justify-between px-3 py-2 border-b border-[#E5E7EB]">
      <div className="flex items-center gap-1 flex-wrap">{renderToolbar()}</div>
      <div className="flex items-center gap-2 ml-3 flex-shrink-0">
        <span className="text-xs text-[#9CA3AF] whitespace-nowrap">{charCount} 字</span>
        <button onClick={toggleFullscreen} className="text-xs text-[#6B7280] hover:text-[#374151] transition px-2 py-1 border border-[#E5E7EB] rounded whitespace-nowrap">⛶ 全屏</button>
      </div>
    </div>
  )

  const editorBody = (
    <div className="flex-1 overflow-auto">
      <EditorContent editor={editor} />
    </div>
  )

  // 全屏模式
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E7EB]">
          <h1 className="text-lg font-bold text-[#111827]">富文本编辑</h1>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#9CA3AF]">{charCount} 字符</span>
            <button onClick={toggleFullscreen} className="px-3 py-1.5 text-sm border border-[#E5E7EB] rounded-md hover:bg-[#F9FAFB] text-[#4B5563]">退出全屏</button>
          </div>
        </div>
        <div className="flex items-center gap-1 px-3 py-2 border-b border-[#E5E7EB] bg-[#FAFAFA]">
          {renderToolbar()}
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="border border-[#E5E7EB] rounded-md bg-white flex flex-col flex-1 mx-4 my-3">
            <div className="flex-1 overflow-auto">
              <EditorContent editor={editor} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 普通模式
  return (
    <div className="border border-[#E5E7EB] rounded-md bg-white flex flex-col" style={{ height: 500 }}>
      {editorToolbar}
      {editorBody}
    </div>
  )
}