'use client'

import { useState, useEffect, useRef } from 'react'
import { Monitor, Smartphone, Eye } from 'lucide-react'
import CMSBlocks from '@/components/cms/CMSBlocks'

interface CMSBlock {
  type: string
  data: any
}

interface CMSPreviewProps {
  blocks: CMSBlock[]
  pageTitle: string
  activeBlockIndex: number | null
}

export default function CMSPreview({ blocks, pageTitle, activeBlockIndex }: CMSPreviewProps) {
  const [viewport, setViewport] = useState<'desktop' | 'mobile'>('desktop')
  const previewAreaRef = useRef<HTMLDivElement>(null)

  // Auto-scroll logic when active block changes
  useEffect(() => {
    if (activeBlockIndex !== null && previewAreaRef.current) {
      setTimeout(() => {
        const el = document.getElementById(`preview-block-${activeBlockIndex}`)
        if (el) {
          el.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          })
        }
      }, 100) // Small delay to let React render the DOM node
    }
  }, [activeBlockIndex])

  const containerStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    background: '#12161D',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    overflow: 'hidden',
    position: 'sticky' as const,
    top: '32px',
    height: 'calc(100vh - 120px)',
    minHeight: '500px'
  }

  const toolbarStyle = {
    background: '#1A222D',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    padding: '10px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px'
  }

  const toggleBtnStyle = (active: boolean) => ({
    background: active ? 'rgba(201, 168, 92, 0.15)' : 'transparent',
    border: 'none',
    color: active ? '#C9A85C' : 'rgba(255, 255, 255, 0.4)',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    cursor: 'pointer'
  })

  const previewAreaStyle = {
    flex: 1,
    overflowY: 'auto' as const,
    padding: viewport === 'mobile' ? '32px 0' : '0',
    display: 'flex',
    justifyContent: 'center',
    background: viewport === 'mobile' ? '#0b0d12' : '#12161D',
    transition: 'background 0.2s'
  }

  const phoneFrameStyle = {
    width: '375px',
    minHeight: '667px',
    height: 'fit-content',
    background: '#12161D',
    border: '8px solid #2A323D',
    borderRadius: '32px',
    overflow: 'hidden',
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
    boxSizing: 'content-box' as const
  }

  return (
    <div style={containerStyle}>
      {/* Control bar */}
      <div style={toolbarStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white', fontSize: '12px', fontWeight: '700' }}>
          <Eye size={16} style={{ color: '#C9A85C' }} />
          <span>VISTA PREVIA EN VIVO</span>
        </div>

        {/* Viewport selectors */}
        <div style={{ display: 'flex', gap: '4px', background: 'rgba(0,0,0,0.2)', padding: '3px', borderRadius: '8px' }}>
          <button
            type="button"
            onClick={() => setViewport('desktop')}
            style={toggleBtnStyle(viewport === 'desktop')}
          >
            <Monitor size={14} /> Escritorio
          </button>
          <button
            type="button"
            onClick={() => setViewport('mobile')}
            style={toggleBtnStyle(viewport === 'mobile')}
          >
            <Smartphone size={14} /> Móvil
          </button>
        </div>
      </div>

      {/* Screen Frame */}
      <div style={previewAreaStyle} ref={previewAreaRef}>
        <div style={viewport === 'mobile' ? phoneFrameStyle : { width: '100%' }}>
          
          {/* Mock Storefront Header */}
          <div style={{
            background: '#12161D',
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <span style={{ color: '#C9A85C', fontSize: '12px', fontWeight: '800', letterSpacing: '0.5px' }}>WHISKY</span>
                <span style={{ color: 'white', fontSize: '12px', fontWeight: '800', border: '1px solid #8B1A1A', padding: '0 3px' }}>BOOM</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', fontSize: '10px', color: 'rgba(255,255,255,0.6)', fontWeight: '600' }}>
              <span>WHISKIES</span>
              <span>OFERTAS</span>
              <span style={{ color: '#C9A85C' }}>{pageTitle || 'NUEVA PÁGINA'}</span>
            </div>
          </div>

          {/* Dynamic Content blocks */}
          <div style={{ minHeight: '300px' }}>
            <CMSBlocks blocks={blocks} />
          </div>

          {/* Mock Storefront Footer */}
          <div style={{
            background: '#0B0D12',
            padding: '24px 20px',
            borderTop: '1px solid rgba(255,255,255,0.05)',
            textAlign: 'center',
            fontSize: '10px',
            color: 'rgba(255,255,255,0.4)',
            marginTop: '40px'
          }}>
            <p>© 2026 Whiskyboom. Todos los derechos reservados.</p>
            <p style={{ marginTop: '4px', fontSize: '8px' }}>Tienda Premium de Bebidas Destiladas</p>
          </div>

        </div>
      </div>
    </div>
  )
}
