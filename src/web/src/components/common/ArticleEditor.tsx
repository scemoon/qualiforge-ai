import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import CodeBlock from '@tiptap/extension-code-block'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import { Markdown } from '@tiptap/markdown'
import { useEffect, useState, useCallback, useRef } from 'react'
interface ArticleEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

interface ToolbarButtonProps {
  label: string
  title: string
  active?: boolean
  onClick: () => void
  className?: string
}

function ToolbarBtn({ label, title, active, onClick, className = '' }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`
        flex-shrink-0 w-8 h-8 flex items-center justify-center rounded text-sm
        transition-colors duration-150
        ${active
          ? 'bg-[#4F46E5] text-white'
          : 'text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#111827]'
        }
        focus:outline-none focus:ring-1 focus:ring-[#4F46E5]
        ${className}
      `}
    >
      {label}
    </button>
  )
}

function ToolbarSep() {
  return <span className="w-px h-5 bg-[#E5E7EB] mx-0.5 flex-shrink-0" />
}

export default function ArticleEditor({ content, onChange, placeholder = '开始写文章...' }: ArticleEditorProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [charCount, setCharCount] = useState(0)
  const [wordCount, setWordCount] = useState(0)
  const [toolbarSticky, setToolbarSticky] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        heading: { levels: [1, 2, 3] },
      }),
      Link.configure({ openOnClick: false, autolink: true }),
      Image.configure({ inline: false, allowBase64: true }),
      Placeholder.configure({ placeholder }),
      CodeBlock,
      TaskList,
      TaskItem.configure({ nested: true }),
      Markdown.configure({ indentation: { style: 'space', size: 2 } }),
    ],
    onUpdate: ({ editor }) => {
      const md = editor.getMarkdown()
      onChange(md)
      setCharCount(md.length)
      setWordCount(editor.getText().split(/\s+/).filter(Boolean).length)
    },
    onCreate: ({ editor }) => {
      const md = editor.getMarkdown()
      setCharCount(md.length)
      setWordCount(editor.getText().split(/\s+/).filter(Boolean).length)
    },
    editorProps: {
      attributes: {
        class: 'prose max-w-none focus:outline-none min-h-[200px] px-4 py-3 text-[#111827] leading-relaxed',
      },
    },
  })

  useEffect(() => {
    if (!editor || !content) return
    if (editor.isEmpty && content) {
      editor.commands.setContent(content, { contentType: 'markdown' })
    }
  }, [content, editor])

  // Scroll shadow for toolbar
  useEffect(() => {
    const el = editorRef.current
    if (!el) return
    const onScroll = () => setToolbarSticky(el.scrollTop > 10)
    el.addEventListener('scroll', onScroll)
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  const toggleFullscreen = useCallback(() => setIsFullscreen(f => !f), [])

  if (!editor) return null

  // 5 groups:
  // G1: 文本格式 B I S
  // G2: 标题 H1 H2 H3
  // G3: 列表 • 1. ☑
  // G4: 块引用 > | ``` | —
  // G5: 链接 🔗 | 图片 📷

  const setLink = useCallback(() => {
    const prev = editor.getAttributes('link').href
    const url = window.prompt('输入链接地址', prev || 'https://')
    if (url === null) return
    if (url === '') { editor.chain().focus().unsetLink().run(); return }
    editor.chain().focus().setLink({ href: url }).run()
  }, [editor])

  const setImage = useCallback(() => {
    const url = window.prompt('输入图片地址', 'https://')
    if (!url || url === 'https://') return
    editor.chain().focus().setImage({ src: url }).run()
  }, [editor])

  const ToolbarContent = () => (
    <>
      {/* G1: 文本格式 */}
      <ToolbarBtn label="B" title="粗体 (Ctrl+B)" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} className="font-bold" />
      <ToolbarBtn label="I" title="斜体 (Ctrl+I)" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} className="italic" />
      <ToolbarBtn label="S" title="删除线" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()} className="line-through" />
      <ToolbarBtn label="`" title="行内代码" active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()} className="font-mono text-xs" />
      <ToolbarSep />

      {/* G2: 标题 */}
      <ToolbarBtn label="H1" title="一级标题" active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className="font-bold text-xs w-9" />
      <ToolbarBtn label="H2" title="二级标题" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className="font-bold text-xs w-9" />
      <ToolbarBtn label="H3" title="三级标题" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className="font-bold text-xs w-9" />
      <ToolbarSep />

      {/* G3: 列表 */}
      <ToolbarBtn label="•" title="无序列表" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} />
      <ToolbarBtn label="1." title="有序列表" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} />
      <ToolbarBtn label="☑" title="任务列表" active={editor.isActive('taskList')} onClick={() => editor.chain().focus().toggleTaskList().run()} />
      <ToolbarSep />

      {/* G4: 块 */}
      <ToolbarBtn label="❝" title="引用" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()} />
      <ToolbarBtn label="</>" title="代码块" active={editor.isActive('codeBlock')} onClick={() => editor.chain().focus().toggleCodeBlock().run()} className="font-mono text-xs" />
      <ToolbarBtn label="—" title="分割线" active={false} onClick={() => editor.chain().focus().setHorizontalRule().run()} />
      <ToolbarSep />

      {/* G5: 媒体 */}
      <ToolbarBtn label="🔗" title="添加链接" active={editor.isActive('link')} onClick={setLink} />
      <ToolbarBtn label="📷" title="添加图片" active={false} onClick={setImage} />
    </>
  )

  const StatusBar = () => (
    <div className="flex items-center justify-between px-3 py-1.5 border-t border-[#E5E7EB] bg-[#FAFAFA] text-xs text-[#9CA3AF]">
      <div className="flex items-center gap-3">
        <span>{charCount} 字</span>
        <span className="hidden sm:inline">{wordCount} 词</span>
      </div>
      <button
        type="button"
        onClick={toggleFullscreen}
        className="flex items-center gap-1 hover:text-[#4F46E5] transition-colors"
      >
        <span>⛶</span>
        <span className="hidden sm:inline">全屏编辑</span>
      </button>
    </div>
  )

  // 全屏模式
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-[9999] bg-white flex flex-col">
        {/* 全屏顶部栏 */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#E5E7EB] bg-white">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-[#111827]">富文本编辑器</h2>
            <span className="text-xs text-[#9CA3AF]">{charCount} 字 · {wordCount} 词</span>
          </div>
          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-[#E5E7EB] rounded-md hover:bg-[#F9FAFB] text-[#4B5563] transition"
          >
            <span>✕</span>
            <span>退出全屏</span>
          </button>
        </div>

        {/* 全屏工具栏 — 横向滚动 */}
        <div className="flex items-center gap-0.5 px-3 py-2 border-b border-[#E5E7EB] bg-[#FAFAFA] overflow-x-auto">
          <ToolbarContent />
        </div>

        {/* 全屏编辑器区域 */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <EditorContent editor={editor} className="min-h-[60vh]" />
          </div>
        </div>

        {/* 全屏底部状态栏 */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-[#E5E7EB] bg-[#FAFAFA]">
          <div className="flex items-center gap-3 text-xs text-[#9CA3AF]">
            <span>{charCount} 字</span>
            <span>{wordCount} 词</span>
          </div>
          <button
            onClick={toggleFullscreen}
            className="text-xs text-[#9CA3AF] hover:text-[#EF4444] transition"
          >
            退出全屏
          </button>
        </div>
      </div>
    )
  }

  // 普通模式
  return (
    <div
      ref={editorRef}
      className="border border-[#E5E7EB] rounded-lg bg-white flex flex-col overflow-hidden"
      style={{ height: 520 }}
    >
      {/* 工具栏 — 横向滚动 */}
      <div className={`
        flex items-center gap-0.5 px-2 py-2 border-b border-[#E5E7EB] bg-white
        overflow-x-auto scrollbar-none
        ${toolbarSticky ? 'shadow-sm' : ''}
      `}>
        <ToolbarContent />
      </div>

      {/* 编辑区 */}
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>

      {/* 状态栏 */}
      <StatusBar />
    </div>
  )
}
