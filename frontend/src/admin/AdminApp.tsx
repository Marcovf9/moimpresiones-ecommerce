import { Route, Routes } from 'react-router-dom'
import { AdminLayout } from './AdminLayout'
import { AuthProvider, useAuth } from './AuthContext'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { QuotesPage } from './pages/QuotesPage'
import { ReportesPage } from './pages/ReportesPage'
import { ProductsPage } from './pages/ProductsPage'
import { ProductEditorPage } from './pages/ProductEditorPage'
import { CategoriesPage } from './pages/CategoriesPage'
import { FinishingsPage } from './pages/FinishingsPage'

/** Panel de administracion. Todo lo de aca adentro exige sesion iniciada. */
export function AdminApp() {
  return (
    <AuthProvider>
      <AdminRoutes />
    </AuthProvider>
  )
}

function AdminRoutes() {
  const { session } = useAuth()

  // Sin sesion no hay rutas internas: cualquier direccion muestra el login.
  if (!session) return <LoginPage />

  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="reportes" element={<ReportesPage />} />
        <Route path="cotizaciones" element={<QuotesPage />} />
        <Route path="productos" element={<ProductsPage />} />
        <Route path="productos/nuevo" element={<ProductEditorPage />} />
        <Route path="productos/:slug" element={<ProductEditorPage />} />
        <Route path="rubros" element={<CategoriesPage />} />
        <Route path="terminaciones" element={<FinishingsPage />} />
      </Route>
    </Routes>
  )
}
