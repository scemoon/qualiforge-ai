import { Routes, Route, Navigate } from 'react-router-dom'
import PublicLayout from './components/layout/PublicLayout'
import AdminLayout from './components/layout/AdminLayout'
import MyLayout from './components/layout/MyLayout'
import StandaloneLayout from './components/layout/StandaloneLayout'
import { useAuthStore } from './store/authStore'

import Home from './pages/Home'
import Tags from './pages/Tags'
import ExpertProfile from './pages/ExpertProfile'
import Search from './pages/Search'
import Login from './pages/Login'
import Register from './pages/Register'
import ArticleDetail from './pages/ArticleDetail'
import AdminDashboard from './pages/Admin/AdminDashboard'
import AdminArticleList from './pages/Admin/AdminArticleList'
import AdminArticleReview from './pages/Admin/AdminArticleReview'
import AdminTag from './pages/Admin/AdminTag'
import AdminSkill from './pages/Admin/AdminSkill'
import AdminSection from './pages/Admin/AdminSection'
import AdminEvaluation from './pages/Admin/AdminEvaluation'
import AdminWxConfig from './pages/Admin/AdminWxConfig'
import MyDashboard from './pages/My/MyDashboard'
import MyArticleNew from './pages/My/MyArticleNew'
import MyCollection from './pages/My/MyCollection'
import MyNotifications from './pages/My/MyNotifications'
import MyArticleEdit from './pages/My/MyArticleEdit'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { isAdmin } = useAuthStore()
  return isAdmin ? children : <Navigate to="/" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/article/:id" element={<ArticleDetail />} />

      <Route element={<PublicLayout />}>
        <Route path="/tags" element={<Tags />} />
        <Route path="/search" element={<Search />} />
        <Route path="/expert/:id" element={<ExpertProfile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Article edit pages — standalone full-width (no sidebar) */}
      <Route path="/my/article/new" element={<RequireAuth><StandaloneLayout><MyArticleNew /></StandaloneLayout></RequireAuth>} />
      <Route path="/my/edit" element={<RequireAuth><StandaloneLayout><MyArticleEdit /></StandaloneLayout></RequireAuth>} />

      {/* Expert Center — sidebar layout */}
      <Route path="/my" element={<RequireAuth><MyLayout /></RequireAuth>}>
        <Route index element={<MyDashboard />} />
        <Route path="collection" element={<MyCollection />} />
        <Route path="notifications" element={<MyNotifications />} />
      </Route>

      {/* Admin — sidebar layout */}
      <Route path="/admin" element={<RequireAuth><RequireAdmin><AdminLayout /></RequireAdmin></RequireAuth>}>
        <Route index element={<AdminDashboard />} />
        <Route path="articles" element={<AdminArticleList />} />
        <Route path="articles/review" element={<AdminArticleReview />} />
        <Route path="evaluations" element={<AdminEvaluation />} />
        <Route path="skills" element={<AdminSkill />} />
        <Route path="sections" element={<AdminSection />} />
        <Route path="tags" element={<AdminTag />} />
        <Route path="wx-config" element={<AdminWxConfig />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
