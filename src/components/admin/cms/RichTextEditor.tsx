'use client'

import { useRef, useEffect } from 'react'
import { Bold, Italic, Heading2, Heading3, List, Heading1 } from 'lucide-react'

interface RichTextEditorProps {
  value: string
  onChange: (htmlContent: string) => void
}

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)

  // Initialize content only once or if it diverges significantly to prevent cursor jumps
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '<p><br></p>'
    }
  }, [])

  const executeCommand = (command: string, arg: string = '') => {
    document.execCommand(command, false, arg)
    handleInput()
  }

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML
      onChange(html)
    }
  }

  const btnStyle = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '4px',
    color: 'white',
    padding: '6px 10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'background 0.2s, border-color 0.2s'
  }

  return (
    <div style={{
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '8px',
      overflow: 'hidden',
      background: 'rgba(255,255,255,0.03)',
      marginTop: '6px'
    }}>
      {/* Toolbar */}
      <div style={{
        background: 'rgba(255,255,255,0.02)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '8px 12px',
        display: 'flex',
        gap: '6px',
        flexWrap: 'wrap'
      }}>
        <button
          type="button"
          title="Negrita"
          onClick={() => executeCommand('bold')}
          style={btnStyle}
          className="toolbar-btn"
        >
          <Bold size={14} />
        </button>
        <button
          type="button"
          title="Itálica"
          onClick={() => executeCommand('italic')}
          style={btnStyle}
          className="toolbar-btn"
        >
          <Italic size={14} />
        </button>
        <div style={{ width: '1px', background: 'rgba(255,255,255,0.08)', margin: '0 4px' }} />
        <button
          type="button"
          title="Título Grande"
          onClick={() => executeCommand('formatBlock', '<h2>')}
          style={btnStyle}
          className="toolbar-btn"
        >
          <Heading2 size={14} />
        </button>
        <button
          type="button"
          title="Subtítulo"
          onClick={() => executeCommand('formatBlock', '<h3>')}
          style={btnStyle}
          className="toolbar-btn"
        >
          <Heading3 size={14} />
        </button>
        <button
          type="button"
          title="Párrafo normal"
          onClick={() => executeCommand('formatBlock', '<p>')}
          style={{ ...btnStyle, fontSize: '11px', fontWeight: 'bold' }}
          className="toolbar-btn"
        >
          P
        </button>
        <div style={{ width: '1px', background: 'rgba(255,255,255,0.08)', margin: '0 4px' }} />
        <button
          type="button"
          title="Lista de viñetas"
          onClick={() => executeCommand('insertUnorderedList')}
          style={btnStyle}
          className="toolbar-btn"
        >
          <List size={14} />
        </button>
      </div>

      {/* Editable Area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onBlur={handleInput}
        style={{
          minHeight: '200px',
          padding: '16px',
          color: '#D1D5DB',
          outline: 'none',
          lineHeight: '1.6',
          fontSize: '14px',
          boxSizing: 'border-box'
        }}
        className="editor-content-area"
      />

      <style>{`
        .toolbar-btn:hover {
          background: rgba(201, 168, 92, 0.15) !important;
          border-color: rgba(201, 168, 92, 0.3) !important;
          color: #C9A85C !important;
        }
        .editor-content-area h2 {
          font-size: 20px;
          font-weight: 800;
          color: #C9A85C;
          margin-top: 18px;
          margin-bottom: 8px;
        }
        .editor-content-area h3 {
          font-size: 16px;
          font-weight: 700;
          color: #ffffff;
          margin-top: 14px;
          margin-bottom: 6px;
        }
        .editor-content-area p {
          margin-bottom: 12px;
        }
        .editor-content-area ul, .editor-content-area ol {
          margin-bottom: 12px;
          padding-left: 20px;
        }
      `}</style>
    </div>
  )
}
