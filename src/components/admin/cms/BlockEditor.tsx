'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { 
  ArrowUp, ArrowDown, Trash2, Plus, 
  ImageIcon, FileText, Image as ImageIcon2,
  Upload, Loader2, GripVertical, ChevronDown, ChevronRight
} from 'lucide-react'
import RichTextEditor from './RichTextEditor'

interface CMSBlock {
  type: string
  data: any
}

interface BlockEditorProps {
  blocks: CMSBlock[]
  onChange: (updatedBlocks: CMSBlock[]) => void
  activeBlockIndex: number | null
  setActiveBlockIndex: (index: number | null) => void
}

export default function BlockEditor({ 
  blocks, 
  onChange, 
  activeBlockIndex, 
  setActiveBlockIndex 
}: BlockEditorProps) {
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null)

  const addBlock = (type: string) => {
    let defaultData = {}
    if (type === 'hero_banner') {
      defaultData = { title: 'Nuevo Banner', subtitle: 'Subtítulo descriptivo', image_url: '', cta_text: 'Ver catálogo', cta_link: '/productos', dark: true }
    } else if (type === 'text_section') {
      defaultData = { content: '<h2>Nuevo título</h2><p>Escribí el texto acá...</p>' }
    } else if (type === 'image_gallery') {
      defaultData = { images: [] }
    }

    const newBlock = { type, data: defaultData }
    const updated = [...blocks, newBlock]
    onChange(updated)
    setActiveBlockIndex(updated.length - 1)
    toast.success('Sección agregada')
  }

  const removeBlock = (index: number) => {
    if (!confirm('¿Eliminar esta sección?')) return
    const updated = blocks.filter((_, i) => i !== index)
    onChange(updated)
    if (activeBlockIndex === index) {
      setActiveBlockIndex(null)
    } else if (activeBlockIndex !== null && activeBlockIndex > index) {
      setActiveBlockIndex(activeBlockIndex - 1)
    }
    toast.success('Sección eliminada')
  }

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === blocks.length - 1) return

    const targetIndex = direction === 'up' ? index - 1 : index + 1
    const updated = [...blocks]
    const temp = updated[index]
    updated[index] = updated[targetIndex]
    updated[targetIndex] = temp

    onChange(updated)
    setActiveBlockIndex(targetIndex)
  }

  const updateBlockData = (index: number, key: string, value: any) => {
    const updated = [...blocks]
    updated[index] = {
      ...updated[index],
      data: {
        ...updated[index].data,
        [key]: value
      }
    }
    onChange(updated)
  }

  const handleImageUpload = async (index: number, file: File, galleryImageIndex?: number) => {
    setUploadingIndex(index)
    try {
      const ext = file.name.split('.').pop()
      const path = `cms/${Date.now()}-${Math.random().toString(36).substr(2, 5)}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(path, file, { upsert: true })

      if (uploadError) {
        toast.error('Error al subir imagen: ' + uploadError.message)
        return
      }

      const { data } = supabase.storage.from('product-images').getPublicUrl(path)
      const url = data.publicUrl

      if (galleryImageIndex !== undefined) {
        // Update specific image inside gallery block array
        const currentImages = [...(blocks[index].data.images || [])]
        currentImages[galleryImageIndex] = url
        updateBlockData(index, 'images', currentImages)
      } else {
        // Update single hero image url
        updateBlockData(index, 'image_url', url)
      }

      toast.success('Imagen cargada con éxito')
    } catch (e) {
      toast.error('Ocurrió un error al subir la imagen')
    } finally {
      setUploadingIndex(null)
    }
  }

  const addImageToGallery = (index: number) => {
    const currentImages = [...(blocks[index].data.images || [])]
    updateBlockData(index, 'images', [...currentImages, ''])
  }

  const removeImageFromGallery = (blockIndex: number, imgIndex: number) => {
    const currentImages = [...(blocks[blockIndex].data.images || [])]
    const updatedImages = currentImages.filter((_, i) => i !== imgIndex)
    updateBlockData(blockIndex, 'images', updatedImages)
  }

  const getBlockSummary = (block: CMSBlock) => {
    if (block.type === 'hero_banner') {
      return block.data.title || 'Sin título'
    } else if (block.type === 'text_section') {
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = block.data.content || ''
      const text = tempDiv.textContent || tempDiv.innerText || ''
      return text.substring(0, 40) + (text.length > 40 ? '...' : '') || 'Vacío'
    } else if (block.type === 'image_gallery') {
      const count = (block.data.images || []).length
      return `${count} imagen${count !== 1 ? 'es' : ''}`
    }
    return ''
  }

  const inputStyle = {
    width: '100%',
    padding: '8px 12px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '6px',
    color: 'white',
    fontSize: '13px',
    outline: 'none',
    boxSizing: 'border-box' as const,
    marginTop: '4px'
  }

  const labelStyle = {
    fontSize: '10px',
    fontWeight: '700',
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.8px'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Block List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {blocks.map((block, index) => {
          const isExpanded = activeBlockIndex === index

          return (
            <div key={index} style={{
              background: 'rgba(255,255,255,0.03)',
              border: isExpanded ? '1px solid rgba(201, 168, 92, 0.4)' : '1px solid rgba(255,255,255,0.07)',
              borderRadius: '10px',
              overflow: 'hidden',
              transition: 'border-color 0.2s'
            }}>
              
              {/* Header / Actions bar */}
              <div 
                onClick={() => setActiveBlockIndex(isExpanded ? null : index)}
                style={{
                  background: isExpanded ? 'rgba(201, 168, 92, 0.05)' : 'rgba(255,255,255,0.02)',
                  borderBottom: isExpanded ? '1px solid rgba(255,255,255,0.07)' : '1px solid transparent',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                  {isExpanded ? <ChevronDown size={16} style={{ color: '#C9A85C' }} /> : <ChevronRight size={16} style={{ color: 'rgba(255,255,255,0.4)' }} />}
                  <GripVertical size={16} style={{ color: 'rgba(255,255,255,0.2)' }} />
                  
                  {/* Title of Section type */}
                  <span style={{
                    fontSize: '11px',
                    fontWeight: '800',
                    color: isExpanded ? '#C9A85C' : 'rgba(255,255,255,0.6)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>
                    {block.type === 'hero_banner' && 'Banner Principal'}
                    {block.type === 'text_section' && 'Sección de Texto'}
                    {block.type === 'image_gallery' && 'Galería'}
                  </span>

                  {/* Summary / Subtitle preview of collapsed content */}
                  {!isExpanded && (
                    <span style={{
                      fontSize: '11px',
                      color: 'rgba(255, 255, 255, 0.35)',
                      marginLeft: '12px',
                      fontStyle: 'italic',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '220px'
                    }}>
                      — {getBlockSummary(block)}
                    </span>
                  )}
                </div>

                {/* Order Controls & Delete */}
                <div style={{ display: 'flex', gap: '4px' }} onClick={e => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => moveBlock(index, 'up')}
                    disabled={index === 0}
                    style={{ background: 'none', border: 'none', color: index === 0 ? 'rgba(255,255,255,0.1)' : 'white', cursor: index === 0 ? 'default' : 'pointer', padding: '4px' }}
                  >
                    <ArrowUp size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveBlock(index, 'down')}
                    disabled={index === blocks.length - 1}
                    style={{ background: 'none', border: 'none', color: index === blocks.length - 1 ? 'rgba(255,255,255,0.1)' : 'white', cursor: index === blocks.length - 1 ? 'default' : 'pointer', padding: '4px' }}
                  >
                    <ArrowDown size={15} />
                  </button>
                  <div style={{ width: '1px', background: 'rgba(255,255,255,0.07)', margin: '0 8px' }} />
                  <button
                    type="button"
                    onClick={() => removeBlock(index)}
                    style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px' }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Block Body / Custom Form Fields (Only rendered when expanded!) */}
              {isExpanded && (
                <div style={{ padding: '20px 16px' }} onClick={e => e.stopPropagation()}>
                  
                  {/* Form: Hero Banner */}
                  {block.type === 'hero_banner' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={labelStyle}>Título del Banner</label>
                        <input
                          type="text"
                          value={block.data.title || ''}
                          onChange={e => updateBlockData(index, 'title', e.target.value)}
                          onFocus={() => setActiveBlockIndex(index)}
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>Subtítulo</label>
                        <input
                          type="text"
                          value={block.data.subtitle || ''}
                          onChange={e => updateBlockData(index, 'subtitle', e.target.value)}
                          onFocus={() => setActiveBlockIndex(index)}
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>Texto del Botón (CTA)</label>
                        <input
                          type="text"
                          value={block.data.cta_text || ''}
                          onChange={e => updateBlockData(index, 'cta_text', e.target.value)}
                          onFocus={() => setActiveBlockIndex(index)}
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>Enlace del Botón</label>
                        <input
                          type="text"
                          value={block.data.cta_link || ''}
                          onChange={e => updateBlockData(index, 'cta_link', e.target.value)}
                          onFocus={() => setActiveBlockIndex(index)}
                          style={inputStyle}
                        />
                      </div>
                      
                      {/* Image upload */}
                      <div style={{ gridColumn: '1 / -1' }}>
                        <label style={labelStyle}>Imagen de Fondo</label>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '6px' }}>
                          <input
                            type="text"
                            placeholder="Sin imagen seleccionada"
                            value={block.data.image_url || ''}
                            readOnly
                            style={{ ...inputStyle, marginTop: 0, flex: 1, opacity: 0.7, cursor: 'not-allowed' }}
                          />
                          <input
                            type="file"
                            id={`hero-img-${index}`}
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={e => {
                              const file = e.target.files?.[0]
                              if (file) handleImageUpload(index, file)
                            }}
                          />
                          <button
                            type="button"
                            disabled={uploadingIndex === index}
                            onClick={() => document.getElementById(`hero-img-${index}`)?.click()}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '6px',
                              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                              borderRadius: '6px', color: 'white', padding: '8px 14px', fontSize: '12px',
                              fontWeight: '700', cursor: 'pointer'
                            }}
                          >
                            {uploadingIndex === index ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Upload size={14} />}
                            Subir Foto
                          </button>
                        </div>
                      </div>

                      {/* Dark Mode toggle */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', gridColumn: '1/-1' }}>
                        <input
                          type="checkbox"
                          id={`dark-${index}`}
                          checked={block.data.dark !== false}
                          onChange={e => updateBlockData(index, 'dark', e.target.checked)}
                          style={{ cursor: 'pointer', width: '15px', height: '15px', accentColor: '#C9A85C' }}
                        />
                        <label htmlFor={`dark-${index}`} style={{ fontSize: '12px', cursor: 'pointer', color: 'rgba(255,255,255,0.8)' }}>
                          Tema oscuro de fondo (Letras blancas, fondo sombreado)
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Form: Text Section */}
                  {block.type === 'text_section' && (
                    <div onClick={() => setActiveBlockIndex(index)} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div>
                        <label style={labelStyle}>Etiqueta Superior (Opcional)</label>
                        <input
                          type="text"
                          placeholder="Ej. Información, Nuestra Historia, Destilería (Dejar vacío para ocultar)"
                          value={block.data.label || ''}
                          onChange={e => updateBlockData(index, 'label', e.target.value)}
                          onFocus={() => setActiveBlockIndex(index)}
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <label style={labelStyle}>Contenido de Texto Visual</label>
                          <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>
                            Escribí y dale formato a tu texto directamente
                          </span>
                        </div>
                        <RichTextEditor
                          value={block.data.content || ''}
                          onChange={html => updateBlockData(index, 'content', html)}
                        />
                      </div>
                    </div>
                  )}

                  {/* Form: Image Gallery */}
                  {block.type === 'image_gallery' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }} onClick={() => setActiveBlockIndex(index)}>
                      <label style={labelStyle}>Imágenes de la Galería</label>
                      
                      {/* Gallery Items */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
                        {(block.data.images || []).map((imgUrl: string, imgIdx: number) => (
                          <div key={imgIdx} style={{
                            background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.06)',
                            borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px',
                            position: 'relative'
                          }}>
                            {imgUrl ? (
                              <img src={imgUrl} alt="" style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '4px' }} />
                            ) : (
                              <div style={{ height: '100px', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>Sin Imagen</span>
                              </div>
                            )}
                            
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <input
                                type="file"
                                id={`gal-img-${index}-${imgIdx}`}
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={e => {
                                  const file = e.target.files?.[0]
                                  if (file) handleImageUpload(index, file, imgIdx)
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => document.getElementById(`gal-img-${index}-${imgIdx}`)?.click()}
                                style={{
                                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                  borderRadius: '4px', color: 'white', padding: '6px', fontSize: '11px', cursor: 'pointer'
                                }}
                              >
                                <Upload size={12} /> Subir
                              </button>
                              <button
                                type="button"
                                onClick={() => removeImageFromGallery(index, imgIdx)}
                                style={{
                                  background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                                  borderRadius: '4px', color: '#EF4444', padding: '6px 10px', fontSize: '11px', cursor: 'pointer'
                                }}
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        ))}
                        
                        {/* Add Image Card */}
                        <button
                          type="button"
                          onClick={() => addImageToGallery(index)}
                          style={{
                            height: '146px', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)',
                            borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center',
                            justifyContent: 'center', color: 'rgba(255,255,255,0.4)', gap: '8px', cursor: 'pointer',
                            transition: 'border-color 0.2s, background 0.2s'
                          }}
                          className="add-gallery-btn"
                        >
                          <Plus size={20} />
                          <span style={{ fontSize: '11px', fontWeight: 'bold' }}>Agregar Imagen</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Selector: Add New Blocks */}
      <div style={{
        background: 'rgba(201,168,92,0.05)',
        border: '1px dashed rgba(201,168,92,0.25)',
        borderRadius: '12px',
        padding: '24px',
        textAlign: 'center'
      }}>
        <h4 style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', color: '#C9A85C' }}>
          Agregar nueva sección
        </h4>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => addBlock('hero_banner')}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', background: '#1E2530', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px', color: 'white', padding: '10px 18px', fontSize: '13px', fontWeight: '700', cursor: 'pointer'
            }}
          >
            <ImageIcon2 size={16} style={{ color: '#C9A85C' }} /> Banner Principal
          </button>
          <button
            type="button"
            onClick={() => addBlock('text_section')}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', background: '#1E2530', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px', color: 'white', padding: '10px 18px', fontSize: '13px', fontWeight: '700', cursor: 'pointer'
            }}
          >
            <FileText size={16} style={{ color: '#C9A85C' }} /> Sección de Texto
          </button>
          <button
            type="button"
            onClick={() => addBlock('image_gallery')}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', background: '#1E2530', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px', color: 'white', padding: '10px 18px', fontSize: '13px', fontWeight: '700', cursor: 'pointer'
            }}
          >
            <ImageIcon size={16} style={{ color: '#C9A85C' }} /> Galería de Fotos
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .add-gallery-btn:hover {
          border-color: rgba(201,168,92,0.4) !important;
          background: rgba(201,168,92,0.02) !important;
          color: white !important;
        }
      `}</style>
    </div>
  )
}
