import { Navigate, Route, Routes } from 'react-router'
import { AppLayout } from './app/AppLayout'
import { MediaPage } from './pages/MediaPage'
import { MediaDetailsPage } from './pages/MediaDetailsPage'
import { NewMediaPage } from './pages/NewMediaPage'
import { NotFoundPage } from './pages/NotFoundPage'
import './App.css'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/media" replace />} />
        <Route path="media" element={<MediaPage />} />
        <Route path="media/new" element={<NewMediaPage />} />
        <Route path="media/:id" element={<MediaDetailsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}