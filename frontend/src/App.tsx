import { Navigate, Route, Routes } from 'react-router'
import { AppLayout } from './app/AppLayout'
import { MediaPage } from './pages/MediaPage'
import { MediaDetailsPage } from './pages/MediaDetailsPage'
import { NewMediaPage } from './pages/NewMediaPage'
import { NotFoundPage } from './pages/NotFoundPage'
import './App.css'
import { useState } from 'react'
import type { MediaItem, MediaDraft } from './types/media'
import { mediaItems as initialItems } from './data/media'
import { EditMediaPage } from './pages/EditMediaPage'

export default function App() {
  const [items, setItems] = useState<MediaItem[]>(() =>
    initialItems.map((item) => ({ ...item }))
  )

  function createItem(draft: MediaDraft): string {
    const id = crypto.randomUUID()
    setItems((current) => [...current, { ...draft, id }])
    return id
  }

  function updateItem(id: string, draft: MediaDraft): void {
    setItems((current) => current.map((item) =>
      item.id === id ? { ...draft, id: item.id } : item
    ))
  }

  function deleteItem(id: string): void {
    setItems((current) => current.filter((item) => item.id !== id))
  }

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/media" replace />} />
        <Route path="media" element={<MediaPage items={items} />} />
        <Route path="media/new" element={<NewMediaPage onCreate={createItem} />} />
        <Route path="media/:id" element={
          <MediaDetailsPage items={items} onDelete={deleteItem} />
        } />
        <Route path="media/:id/edit" element={
          <EditMediaPage items={items} onUpdate={updateItem} />
        } />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
