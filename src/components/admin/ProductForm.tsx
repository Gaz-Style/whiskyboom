'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useDropzone } from 'react-dropzone'
import { supabase } from '@/lib/supabase'
import toast, { Toaster } from 'react-hot-toast'
import { Upload, X, Loader2, Save, ArrowLeft } from 'lucide-react'

const productSchema = z.object({
  name:           z.string().min(2, 'Nombre requerido'),
  slug:           z.string().min(2, 'Slug requerido').regex(/^[a-z0-9-]+$/, 'Solo letras minúsculas, números y guiones'),
  brand:          z.string().min(1, 'Marca requerida'),
  category:       z.string().min(1, 'Categoría requerida'),
  region:         z.string().min(1, 'Región requerida'),
  age:            z.coerce.number().int().positive().optional().or(z.literal('')),
  abv:            z.coerce.number().min(0).max(100),
  volume:         z.coerce.number().int().positive().default(700),
  price:          z.coerce.number().positive('Precio requerido'),
  original_price: z.coerce.number().positive().optional().or(z.literal('')),
  badge:          z.enum(['new', 'sale', 'limited', '']).optional(),
  description:    z.string().optional(),
  in_stock:       z.boolean().default(true),
  is_featured:    z.boolean().default(false),
  distillery:     z.string().optional(),
  stock_quantity: z.coerce.number().int().min(0).optional().or(z.literal('')),
  low_stock_threshold: z.coerce.number().int().min(1).optional().or(z.literal('')),
  tasting_notes:  z.string().optional(),
  pairing:        z.string().optional(),
  is_top_seller:  z.boolean().default(false),
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ProductForm = any

interface Props {
  initialData?: Record<string, unknown> & { id?: string; image?: string }
  isEdit?: boolean
}

function slugify(text: string) {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim()
}

export default function ProductForm({ initialData, isEdit }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [imageUrl, setImageUrl] = useState<string>(initialData?.image ?? '')
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string>(initialData?.image ?? '')

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: { in_stock: true, is_featured: false, volume: 700, ...initialData },
  })

  const nameValue = watch('name')

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `products/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('product-images').upload(path, file, { upsert: true })
    if (error) { toast.error('Error al subir imagen: ' + error.message); setUploading(false); return }
    const { data } = supabase.storage.from('product-images').getPublicUrl(path)
    setImageUrl(data.publicUrl)
    setPreview(data.publicUrl)
    toast.success('Imagen subida correctamente')
    setUploading(false)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] }, maxFiles: 1,
  })

  const onSubmit = async (data: ProductForm) => {
    setSaving(true)
    const payload = {
      ...data,
      age: data.age === '' ? null : data.age,
      original_price: data.original_price === '' ? null : data.original_price,
      badge: data.badge === '' ? null : data.badge,
      image: imageUrl || null,
      stock_quantity: data.stock_quantity === '' ? null : data.stock_quantity,
      low_stock_threshold: data.low_stock_threshold === '' ? 5 : data.low_stock_threshold,
    }

    let error
    if (isEdit && initialData?.id) {
      const res = await supabase.from('products').update(payload).eq('id', initialData.id)
      error = res.error
    } else {
      const res = await supabase.from('products').insert([payload])
      error = res.error
    }

    if (error) { toast.error('Error: ' + error.message); setSaving(false); return }
    toast.success(isEdit ? 'Producto actualizado' : 'Producto creado')
    setTimeout(() => router.push('/admin/productos'), 800)
  }

  const fieldStyle = {
    width: '100%', padding: '10px 14px', boxSizing: 'border-box' as const,
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px', color: 'white', fontSize: '13px', outline: 'none',
  }
  const labelStyle = {
    display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: '11px',
    fontWeight: '700', textTransform: 'uppercase' as const, letterSpacing: '0.8px', marginBottom: '6px',
  }
  const errorStyle = { color: '#EF4444', fontSize: '11px', marginTop: '4px' }
  const sectionTitle = { color: 'white', fontSize: '14px', fontWeight: '700', marginBottom: '16px', paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.07)' }

  return (
    <div style={{ padding: '32px', fontFamily: 'var(--font-inter, system-ui)', color: 'white', maxWidth: '900px' }}>
      <Toaster position="top-right" />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <button onClick={() => router.push('/admin/productos')} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', display: 'flex' }}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '800' }}>{isEdit ? 'Editar Producto' : 'Nuevo Producto'}</h1>
          <p style={{ margin: '2px 0 0', color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>
            {isEdit ? `Modificando: ${initialData?.name}` : 'Completá los datos del nuevo producto'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'start' }}>
          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Info básica */}
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '24px' }}>
              <h2 style={sectionTitle}>Información Básica</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Nombre del producto *</label>
                  <input {...register('name')} placeholder="The Macallan Double Cask 12 Years" style={fieldStyle}
                    onChange={e => { setValue('name', e.target.value); if (!isEdit) setValue('slug', slugify(e.target.value)) }}
                  />
                  {errors.name && <p style={errorStyle}>{String(errors.name.message)}</p>}
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Slug (URL) *</label>
                  <input {...register('slug')} placeholder="macallan-double-cask-12" style={fieldStyle} />
                  {errors.slug && <p style={errorStyle}>{String(errors.slug.message)}</p>}
                </div>
                <div>
                  <label style={labelStyle}>Marca *</label>
                  <input {...register('brand')} placeholder="The Macallan" style={fieldStyle} />
                  {errors.brand && <p style={errorStyle}>{String(errors.brand.message)}</p>}
                </div>
                <div>
                  <label style={labelStyle}>Categoría *</label>
                  <select {...register('category')} style={fieldStyle}>
                    <option value="" style={{ background: '#1a1a1a', color: 'white' }}>Seleccionar categoría</option>
                    <option value="Single Malt Escocés" style={{ background: '#1a1a1a', color: 'white' }}>Single Malt Escocés</option>
                    <option value="Blended Escocés" style={{ background: '#1a1a1a', color: 'white' }}>Blended Escocés</option>
                    <option value="Bourbon & Tennessee" style={{ background: '#1a1a1a', color: 'white' }}>Bourbon & Tennessee</option>
                    <option value="Whisky Japonés" style={{ background: '#1a1a1a', color: 'white' }}>Whisky Japonés</option>
                    <option value="Blended Malt" style={{ background: '#1a1a1a', color: 'white' }}>Blended Malt</option>
                    <option value="Irish Whiskey" style={{ background: '#1a1a1a', color: 'white' }}>Irish Whiskey</option>
                    <option value="Tennessee Whiskey" style={{ background: '#1a1a1a', color: 'white' }}>Tennessee Whiskey</option>
                  </select>
                  {errors.category && <p style={errorStyle}>{String(errors.category.message)}</p>}
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Descripción</label>
                  <textarea
                    {...register('description')}
                    rows={3}
                    placeholder="Descripción del producto..."
                    style={{ ...fieldStyle, resize: 'vertical' }}
                  />
                </div>
              </div>
            </div>

            {/* Detalles técnicos */}
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '24px' }}>
              <h2 style={sectionTitle}>Detalles Técnicos</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Región *</label>
                  <input {...register('region')} placeholder="Speyside" style={fieldStyle} />
                  {errors.region && <p style={errorStyle}>{String(errors.region.message)}</p>}
                </div>
                <div>
                  <label style={labelStyle}>Años de maduración</label>
                  <input {...register('age')} type="number" min={1} max={100} placeholder="12" style={fieldStyle} />
                </div>
                <div>
                  <label style={labelStyle}>ABV (%) *</label>
                  <input {...register('abv')} type="number" step="0.1" min={0} max={100} placeholder="40" style={fieldStyle} />
                  {errors.abv && <p style={errorStyle}>{String(errors.abv.message)}</p>}
                </div>
                <div>
                  <label style={labelStyle}>Volumen (ml) *</label>
                  <input {...register('volume')} type="number" placeholder="700" style={fieldStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Destilería</label>
                  <input {...register('distillery')} placeholder="The Macallan Distillery" style={fieldStyle} />
                </div>
              </div>
            </div>

            {/* Stock cuantitativo */}
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '24px' }}>
              <h2 style={sectionTitle}>Control de Stock</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Unidades disponibles</label>
                  <input {...register('stock_quantity')} type="number" min={0} placeholder="Dejar vacío = sin control" style={fieldStyle} />
                  <p style={{ margin: '4px 0 0', fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>Vacío = stock ilimitado</p>
                </div>
                <div>
                  <label style={labelStyle}>Umbral «Quedan pocos»</label>
                  <input {...register('low_stock_threshold')} type="number" min={1} placeholder="5" style={fieldStyle} />
                  <p style={{ margin: '4px 0 0', fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>Badge aparece cuando queden ≤ N unidades</p>
                </div>
              </div>
            </div>

            {/* Sommelier */}
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '24px' }}>
              <h2 style={sectionTitle}>Ficha de Cata</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Notas de cata</label>
                  <textarea {...register('tasting_notes')} rows={2} placeholder="Vainilla, caramelo toffee, especias suaves..." style={{ ...fieldStyle, resize: 'vertical' }} />
                </div>
                <div>
                  <label style={labelStyle}>Maridaje sugerido</label>
                  <textarea {...register('pairing')} rows={2} placeholder="Chocolate negro, quesos curados, habanos..." style={{ ...fieldStyle, resize: 'vertical' }} />
                </div>
              </div>
            </div>

            {/* Precios */}
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '24px' }}>
              <h2 style={sectionTitle}>Precios</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Precio (ARS) *</label>
                  <input {...register('price')} type="number" min={0} placeholder="89990" style={fieldStyle} />
                  {errors.price && <p style={errorStyle}>{String(errors.price.message)}</p>}
                </div>
                <div>
                  <label style={labelStyle}>Precio original (tachado)</label>
                  <input {...register('original_price')} type="number" min={0} placeholder="Dejar vacío si no hay descuento" style={fieldStyle} />
                </div>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'sticky', top: '24px' }}>

            {/* Image upload */}
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '24px' }}>
              <h2 style={sectionTitle}>Imagen del Producto</h2>
              {preview ? (
                <div style={{ position: 'relative', marginBottom: '12px' }}>
                  <img src={preview} alt="Preview" style={{ width: '100%', height: '200px', objectFit: 'contain', borderRadius: '8px', background: 'rgba(255,255,255,0.05)' }} />
                  <button
                    type="button"
                    onClick={() => { setPreview(''); setImageUrl('') }}
                    style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: '50%', padding: '4px', cursor: 'pointer', color: 'white', display: 'flex' }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : null}
              <div
                {...getRootProps()}
                style={{
                  border: `2px dashed ${isDragActive ? '#C9A85C' : 'rgba(255,255,255,0.15)'}`,
                  borderRadius: '8px', padding: '24px', textAlign: 'center', cursor: 'pointer',
                  background: isDragActive ? 'rgba(201,168,92,0.05)' : 'transparent',
                  transition: 'all 0.2s',
                }}
              >
                <input {...getInputProps()} />
                {uploading ? (
                  <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: '#C9A85C', margin: '0 auto 8px' }} />
                ) : (
                  <Upload size={24} style={{ color: 'rgba(255,255,255,0.3)', margin: '0 auto 8px', display: 'block' }} />
                )}
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', margin: 0 }}>
                  {uploading ? 'Subiendo...' : isDragActive ? 'Soltar imagen aquí' : 'Arrastrá una imagen o hacé clic'}
                </p>
                <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '11px', marginTop: '4px' }}>JPG, PNG, WebP · Max 5MB</p>
              </div>
            </div>

            {/* Estado y badge */}
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '24px' }}>
              <h2 style={sectionTitle}>Estado y Badge</h2>
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Badge</label>
                <select {...register('badge')} style={fieldStyle}>
                  <option value="" style={{ background: '#1a1a1a', color: 'white' }}>Sin badge</option>
                  <option value="new" style={{ background: '#1a1a1a', color: 'white' }}>🟢 Nuevo</option>
                  <option value="sale" style={{ background: '#1a1a1a', color: 'white' }}>🟡 Oferta</option>
                  <option value="limited" style={{ background: '#1a1a1a', color: 'white' }}>🟣 Limitado</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <input type="checkbox" {...register('in_stock')} style={{ width: '18px', height: '18px', accentColor: '#10B981' }} />
                  <div>
                    <div style={{ color: 'white', fontSize: '13px', fontWeight: '600' }}>En stock</div>
                    <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px' }}>Disponible para compra</div>
                  </div>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <input type="checkbox" {...register('is_featured')} style={{ width: '18px', height: '18px', accentColor: '#C9A85C' }} />
                  <div>
                    <div style={{ color: 'white', fontSize: '13px', fontWeight: '600' }}>Producto destacado</div>
                    <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px' }}>Aparece en la sección de inicio</div>
                  </div>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <input type="checkbox" {...register('is_top_seller')} style={{ width: '18px', height: '18px', accentColor: '#F59E0B' }} />
                  <div>
                    <div style={{ color: 'white', fontSize: '13px', fontWeight: '600' }}>🚀 Top Seller</div>
                    <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px' }}>Muestra badge dorado en el catálogo</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={saving}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                width: '100%', padding: '14px',
                background: saving ? 'rgba(201,168,92,0.5)' : 'linear-gradient(135deg, #C9A85C, #a8863c)',
                border: 'none', borderRadius: '10px', color: '#1a1a1a',
                fontSize: '14px', fontWeight: '700', cursor: saving ? 'not-allowed' : 'pointer',
              }}
            >
              {saving ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={16} />}
              {saving ? 'Guardando...' : isEdit ? 'Guardar Cambios' : 'Crear Producto'}
            </button>
          </div>
        </div>
      </form>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
