import { Route } from 'react-router-dom'
import { DashboardPage } from '../../pages/app/@custom/DashboardPage'
import { AnalyticsDashboardPage } from '../../pages/app/@custom/AnalyticsDashboardPage'
import { FunnelsPage } from '../../pages/app/@custom/FunnelsPage'
import { UserSessionsPage } from '../../pages/app/@custom/UserSessionsPage'
import { ErrorTrackingPage } from '../../pages/app/@custom/ErrorTrackingPage'
import { CollaboratorsPage } from '../../pages/app/@custom/CollaboratorsPage'
import { TeamsPage } from '../../pages/app/@custom/TeamsPage'
import { TeamDetailPage } from '../../pages/app/@custom/TeamDetailPage'
import { EventsPage } from '../../pages/app/@custom/EventsPage'
import { EmbedScriptPage } from '../../pages/app/@custom/EmbedScriptPage'
import ApiAccessPage from '../../pages/app/@custom/ApiAccessPage'
import { PrivateRoute } from '@/app/components/@system/PrivateRoute/PrivateRoute'

// @custom — add your product-specific routes here.
// Wrap with <PrivateRoute> for authenticated pages.
export const customRoutes = [
  <Route
    key="dashboard"
    path="/app/dashboard"
    element={
      <PrivateRoute>
        <DashboardPage />
      </PrivateRoute>
    }
  />,
  <Route
    key="analytics-overview"
    path="/app/analytics"
    element={
      <PrivateRoute>
        <AnalyticsDashboardPage />
      </PrivateRoute>
    }
  />,
  <Route
    key="events"
    path="/app/events"
    element={
      <PrivateRoute>
        <EventsPage />
      </PrivateRoute>
    }
  />,
  <Route
    key="funnels"
    path="/app/funnels"
    element={
      <PrivateRoute>
        <FunnelsPage />
      </PrivateRoute>
    }
  />,
  <Route
    key="error-tracking"
    path="/app/errors"
    element={
      <PrivateRoute>
        <ErrorTrackingPage />
      </PrivateRoute>
    }
  />,
  <Route
    key="user-sessions"
    path="/app/sessions"
    element={
      <PrivateRoute>
        <UserSessionsPage />
      </PrivateRoute>
    }
  />,
  <Route
    key="embed"
    path="/app/embed"
    element={
      <PrivateRoute>
        <EmbedScriptPage />
      </PrivateRoute>
    }
  />,
  <Route
    key="api-access"
    path="/app/api-access"
    element={
      <PrivateRoute>
        <ApiAccessPage />
      </PrivateRoute>
    }
  />,
  <Route
    key="teams"
    path="/app/teams"
    element={
      <PrivateRoute>
        <TeamsPage />
      </PrivateRoute>
    }
  />,
  <Route
    key="team-detail"
    path="/app/teams/:id"
    element={
      <PrivateRoute>
        <TeamDetailPage />
      </PrivateRoute>
    }
  />,
  <Route
    key="collaborators"
    path="/app/collaborators"
    element={
      <PrivateRoute>
        <CollaboratorsPage />
      </PrivateRoute>
    }
  />,
]
