'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import ProductForm from '@/components/admin/ProductForm'

export default function EditProductPage() {
  const params = useParams()
  const id = params.id as string
  const [product, setProduct] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('products').select('*').eq('id', id).single().then(({ data }) => {
      setProduct(data)
      setLoading(false)
    })
  }, [id])

  if (loading) return (
    <div style={{ padding: '32px', color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-inter, system-ui)' }}>
      Cargando producto...
    </div>
  )

  if (!product) return (
    <div style={{ padding: '32px', color: '#EF4444', fontFamily: 'var(--font-inter, system-ui)' }}>
      Producto no encontrado
    </div>
  )

  return <ProductForm initialData={product as Parameters<typeof ProductForm>[0]['initialData'] & { id: string }} isEdit />
}
