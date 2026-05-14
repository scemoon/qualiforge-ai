import {Routes, Route, Navigate} from 'react-router-dom'
import PublicLayout from './components/layout/PublicLayout'
import ArticleLayout from './components/layout/ArticleLayout'
import EvaluationLayout from './components/layout/EvaluationLayout'
import AdminLayout from './components/layout/AdminLayout'
import MyLayout from './components/layout/MyLayout'
import {useAuthStore} from './store/authStore'

import Home from './pages/Home'
import Tags from './pages/Tags'
import ExpertProfile from './pages/ExpertProfile'
import Search from './pages/Article/ArticleSearch'
import Login from './pages/Login'
import Register from './pages/Register'
import ArticleDetail from './pages/Article/ArticleDetail'
import AdminDashboard from './pages/Admin/AdminDashboard'
import AdminArticleList from './pages/Admin/AdminArticleList'
import AdminTag from './pages/Admin/AdminTag'
import AdminSection from './pages/Admin/AdminSection'
import AdminEvaluation from './pages/Admin/AdminEvaluation'
import AdminWxConfig from './pages/Admin/AdminWxConfig'
import MyDashboard from './pages/My/MyDashboard'
import MyArticleList from './pages/My/MyArticleList'
import ArticleNew from './pages/Article/ArticleNew'
import MyCollection from './pages/My/MyCollection'
import MyNotifications from './pages/My/MyNotifications'
import ArticleEdit from './pages/Article/ArticleEdit'
import EvaluationForm from './pages/Evaluation/EvaluationForm'
import EvaluationDetail from './pages/Evaluation/EvaluationDetail'
import EvaluationEdit from './pages/Evaluation/EvaluationEdit'
import NotFound from './pages/NotFound'

function RequireAuth({children}: { children: React.ReactNode }) {
    const {isAuthenticated} = useAuthStore()
    return isAuthenticated ? children : <Navigate to="/login" replace/>
}

function RequireAdmin({children}: { children: React.ReactNode }) {
    const {isAdmin} = useAuthStore()
    return isAdmin ? children : <Navigate to="/" replace/>
}

export default function App() {
    return (
        <Routes>
            <Route element={<PublicLayout/>}>
                <Route path="/" element={<Home/>}/>
                <Route path="/tags" element={<Tags/>}/>
                <Route path="/expert/:id" element={<ExpertProfile/>}/>
                <Route path="/login" element={<Login/>}/>
                <Route path="/register" element={<Register/>}/>
            </Route>

            <Route element={<ArticleLayout/>}>
                <Route path="/articles">
                    <Route path="search" element={<Search/>}/>
                    <Route path=":id" element={<ArticleDetail/>}/>
                    <Route path="new" element={<RequireAuth><ArticleNew/></RequireAuth>}/>
                    <Route path=":id/edit" element={<RequireAuth><ArticleEdit/></RequireAuth>}/>
                </Route>
            </Route>

            <Route element={<EvaluationLayout/>}>
                <Route path="/evaluations">
                    <Route path="new" element={<RequireAuth><EvaluationForm/></RequireAuth>}/>
                    <Route path=":id" element={<RequireAuth><EvaluationDetail/></RequireAuth>}/>
                    <Route path=":id/edit" element={<RequireAuth><EvaluationEdit/></RequireAuth>}/>
                </Route>
            </Route>

            {/* Expert Center — sidebar layout */}
            <Route path="/my" element={<RequireAuth><MyLayout/></RequireAuth>}>
                <Route index element={<MyDashboard/>}/>
                <Route path="articles" element={<MyArticleList/>}/>
                <Route path="articles/:id" element={<RequireAuth><EvaluationDetail/></RequireAuth>}/>
                <Route path="articles/new" element={<RequireAuth><ArticleNew/></RequireAuth>}/>
                <Route path="collection" element={<MyCollection/>}/>
                <Route path="notifications" element={<MyNotifications/>}/>
            </Route>

            {/* Admin — sidebar layout */}
            <Route path="/admin" element={<RequireAuth><RequireAdmin><AdminLayout/></RequireAdmin></RequireAuth>}>
                <Route index element={<AdminDashboard/>}/>
                <Route path="articles" element={<AdminArticleList/>}/>
                <Route path="articles/:id" element={<ArticleDetail/>}/>
                <Route path="articles/new" element={<RequireAuth><ArticleNew/></RequireAuth>}/>
                <Route path="evaluations" element={<AdminEvaluation/>}/>
                <Route path="evaluations/new" element={<RequireAuth><EvaluationForm/></RequireAuth>}/>
                <Route path="evaluations/:id" element={<RequireAuth><EvaluationDetail/></RequireAuth>}/>
                <Route path="sections" element={<AdminSection/>}/>
                <Route path="tags" element={<AdminTag/>}/>
                <Route path="wx-config" element={<AdminWxConfig/>}/>
            </Route>

            <Route path="*" element={<NotFound/>}/>
        </Routes>
    )
}
