import { useState, type FormEvent } from 'react'
import { ApiError } from '../../api/client'
import { useAuth } from '../AuthContext'
import { Banner, Button, TextField } from '../components/AdminUI'

export function LoginPage() {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSending(true)
    setError(null)
    try {
      await login(username, password)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No pudimos iniciar sesión.')
      setSending(false)
    }
  }

  return (
    <div className="grid min-h-dvh place-items-center bg-ink-900 px-6">
      <div className="w-full max-w-sm">
        <p className="text-center font-display text-sm tracking-[0.3em] text-ink-300 uppercase">
          MO Impresiones
        </p>
        <h1 className="mt-2 text-center font-display text-2xl font-semibold text-white">
          Panel de administración
        </h1>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-2xl bg-white p-6">
          <TextField label="Usuario" value={username} onChange={setUsername} required />
          <TextField
            label="Contraseña"
            type="password"
            value={password}
            onChange={setPassword}
            required
          />
          {error && <Banner kind="error">{error}</Banner>}
          <Button type="submit" disabled={sending} className="w-full">
            {sending ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
      </div>
    </div>
  )
}
