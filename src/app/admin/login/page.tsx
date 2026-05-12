'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      console.error('Login error:', error.message)
      toast.error(error.message === 'Email not confirmed' ? 'Debes confirmar tu email en Supabase primero.' : `Error: ${error.message}`)
      setLoading(false)
      return
    }
    toast.success('Bienvenido al panel de administración')
    router.refresh()
    router.push('/admin')
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0F1117 0%, #1a2035 50%, #0F1117 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: 'var(--font-inter, system-ui, sans-serif)',
    }}>
      <Toaster position="top-right" />

      {/* Decorative background */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', top: '-20%', left: '-10%',
          width: '500px', height: '500px',
          background: 'radial-gradient(circle, rgba(139,26,26,0.12) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />
        <div style={{
          position: 'absolute', bottom: '-20%', right: '-10%',
          width: '600px', height: '600px',
          background: 'radial-gradient(circle, rgba(201,168,92,0.08) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />
      </div>

      <div style={{ width: '100%', maxWidth: '400px', position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '64px', height: '64px',
            background: 'rgba(201,168,92,0.1)',
            border: '1px solid rgba(201,168,92,0.3)',
            borderRadius: '16px',
            marginBottom: '20px',
          }}>
            <span style={{ fontSize: '28px' }}>🥃</span>
          </div>
          <div style={{ color: 'white', fontSize: '22px', fontWeight: '800', letterSpacing: '3px', textTransform: 'uppercase' }}>
            WHISKY<span style={{ color: '#C9A85C' }}>BOOM</span>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', marginTop: '4px' }}>
            Panel de Administración
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px',
          padding: '36px 32px',
          backdropFilter: 'blur(20px)',
        }}>
          <h1 style={{ color: 'white', fontSize: '20px', fontWeight: '700', marginBottom: '8px', margin: '0 0 8px 0' }}>
            Iniciar Sesión
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', marginBottom: '28px', margin: '0 0 28px 0' }}>
            Accedé al panel de control de tu tienda
          </p>

          <form onSubmit={handleLogin}>
            {/* Email */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="admin@whiskyboom.com.ar"
                style={{
                  width: '100%', padding: '12px 14px', boxSizing: 'border-box',
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px', color: 'white', fontSize: '14px', outline: 'none',
                }}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>
                Contraseña
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  style={{
                    width: '100%', padding: '12px 44px 12px 14px', boxSizing: 'border-box',
                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px', color: 'white', fontSize: '14px', outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)',
                    display: 'flex', alignItems: 'center',
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '14px',
                background: loading ? 'rgba(201,168,92,0.5)' : 'linear-gradient(135deg, #C9A85C, #a8863c)',
                border: 'none', borderRadius: '8px',
                color: '#1a1a1a', fontSize: '14px', fontWeight: '700',
                textTransform: 'uppercase', letterSpacing: '1px',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                transition: 'all 0.2s',
              }}
            >
              {loading ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Verificando...</> : 'Ingresar al Panel'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '12px', marginTop: '24px' }}>
          Acceso restringido · Whiskyboom Admin
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
