import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell.tsx'
import { MainMenu } from '@/screens/MainMenu.tsx'
import { Spinner } from '@/components/ui/Spinner.tsx'

const Dashboard = lazy(() => import('@/screens/Dashboard.tsx').then(m => ({ default: m.Dashboard })))
const Actions = lazy(() => import('@/screens/Actions.tsx').then(m => ({ default: m.Actions })))
const Strategy = lazy(() => import('@/screens/Strategy.tsx').then(m => ({ default: m.Strategy })))
const Polls = lazy(() => import('@/screens/Polls.tsx').then(m => ({ default: m.Polls })))
const Finance = lazy(() => import('@/screens/Finance.tsx').then(m => ({ default: m.Finance })))
const Settings = lazy(() => import('@/screens/Settings.tsx').then(m => ({ default: m.Settings })))
const EventScreen = lazy(() => import('@/screens/EventScreen.tsx').then(m => ({ default: m.EventScreen })))
const DebateScreen = lazy(() => import('@/screens/DebateScreen.tsx').then(m => ({ default: m.DebateScreen })))
const ElectionNight = lazy(() => import('@/screens/ElectionNight.tsx').then(m => ({ default: m.ElectionNight })))
const PostGame = lazy(() => import('@/screens/PostGame.tsx').then(m => ({ default: m.PostGame })))
const NewGame = lazy(() => import('@/screens/NewGame.tsx').then(m => ({ default: m.NewGame })))

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Spinner />}>
        <Routes>
          <Route path="/" element={<MainMenu />} />
          <Route path="/new-game" element={<NewGame />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/election" element={<ElectionNight />} />
          <Route path="/postgame" element={<PostGame />} />
          <Route path="/game" element={<AppShell />}>
            <Route index element={<Dashboard />} />
            <Route path="actions" element={<Actions />} />
            <Route path="strategy" element={<Strategy />} />
            <Route path="polls" element={<Polls />} />
            <Route path="finance" element={<Finance />} />
            <Route path="events" element={<EventScreen />} />
            <Route path="debate" element={<DebateScreen />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
