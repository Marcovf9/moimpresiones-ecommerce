import { Suspense, lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ScrollToTop } from './components/ScrollToTop'
import { HomePage } from './pages/HomePage'
import { ProductsPage } from './pages/ProductsPage'
import { ProductDetailPage } from './pages/ProductDetailPage'
import { FinishingsPage } from './pages/FinishingsPage'
import { QuotePage } from './pages/QuotePage'
import { ConfirmacionPage } from './pages/ConfirmacionPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { TerminosPage } from './pages/TerminosPage'
import { PrivacidadPage } from './pages/PrivacidadPage'
import { PreguntasPage } from './pages/PreguntasPage'

/**
 * El panel se carga aparte y solo al entrar a /admin. Venía en el mismo
 * paquete que el sitio público, así que cada visitante descargaba el tablero,
 * los reportes y los editores sin usarlos nunca.
 */
const AdminApp = lazy(() =>
  import('./admin/AdminApp').then((m) => ({ default: m.AdminApp })),
)
import { PresupuestoProvider } from './hooks/usePresupuesto'

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* El panel corre aparte: tiene su propio layout y su propia sesión. */}
        <Route
          path="/admin/*"
          element={
            <Suspense fallback={<CargandoPanel />}>
              <AdminApp />
            </Suspense>
          }
        />

        <Route
          element={
            <PresupuestoProvider>
              <Layout />
            </PresupuestoProvider>
          }
        >
          <Route path="/" element={<HomePage />} />
          <Route path="/productos" element={<ProductsPage />} />
          <Route path="/productos/:slug" element={<ProductDetailPage />} />
          <Route path="/terminaciones" element={<FinishingsPage />} />
          <Route path="/cotiza" element={<QuotePage />} />
          <Route path="/cotizacion-enviada" element={<ConfirmacionPage />} />
          <Route path="/preguntas-frecuentes" element={<PreguntasPage />} />
          <Route path="/terminos" element={<TerminosPage />} />
          <Route path="/privacidad" element={<PrivacidadPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  )
}

/** Espera mientras llega el paquete del panel. Dura una sola vez por visita. */
function CargandoPanel() {
  return (
    <div className="grid min-h-dvh place-items-center bg-ink-900">
      <p role="status" className="text-sm tracking-[0.3em] text-ink-300 uppercase">
        Cargando el panel...
      </p>
    </div>
  )
}
