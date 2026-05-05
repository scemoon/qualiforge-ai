# QualiForge AI — 前台路由设计

> **文档版本**: v1.0  
> **最后更新**: 2026-04-30

---

## 路由清单

| # | 路径 | 组件 | 布局 | 权限 |
|---|------|------|------|------|
| 1 | `/` | `Home` | `PublicLayout` | 公开 |
| 2 | `/leaderboard` | `Leaderboard` | `PublicLayout` | 公开 |
| 3 | `/article/search` | `ArticleSearch` | `PublicLayout` | 公开 |
| 4 | `/article/:id` | `ArticleDetail` | `PublicLayout` | 公开 |
| 5 | `/tags` | `Tags` | `PublicLayout` | 公开 |
| 6 | `/expert/:id` | `ExpertProfile` | `PublicLayout` | 公开 |
| 7 | `/login` | `Login` | `AuthLayout` | 公开（已登录跳转首页） |
| 8 | `/register` | `Register` | `AuthLayout` | 公开（已登录跳转首页） |
| 9 | `/my` | `MyDashboard` | `MyLayout` | 需 expert+ |
| 10 | `/my/article/new` | `MyArticleNew` | `MyLayout` | 需 expert+ |
| 11 | `/my/article/:id/edit` | `MyArticleEdit` | `MyLayout` | 需 expert+ |
| 12 | `/my/collection` | `MyCollection` | `MyLayout` | 需 expert+ |
| 13 | `/my/notifications` | `MyNotifications` | `MyLayout` | 需 expert+ |
| 14 | `/my/profile` | `MyProfile` | `MyLayout` | 需 expert+ |
| 15 | `/admin` | `AdminDashboard` | `AdminLayout` | 需 admin |
| 16 | `/admin/articles` | `AdminArticleList` | `AdminLayout` | 需 admin |
| 17 | `/admin/articles/review` | `AdminArticleReview` | `AdminLayout` | 需 admin |
| 18 | `/admin/articles/new` | `AdminArticleNew` | `AdminLayout` | 需 admin |
| 19 | `/admin/skills` | `AdminSkill` | `AdminLayout` | 需 admin |
| 20 | `/admin/evaluations` | `AdminEvaluation` | `AdminLayout` | 需 admin |
| 21 | `/admin/sections` | `AdminSection` | `AdminLayout` | 需 admin |
| 22 | `/admin/tags` | `AdminTag` | `AdminLayout` | 需 admin |
| 23 | `/admin/users` | `AdminUser` | `AdminLayout` | 需 admin |
| 24 | `/admin/official` | `AdminOfficial` | `AdminLayout` | 需 admin |
| 25 | `/admin/wechat` | `AdminWechat` | `AdminLayout` | 需 admin |

---

## 路由守卫逻辑

```typescript
// router/index.tsx

// 公开路由：无限制
const publicRoutes = ['/', '/leaderboard', '/article/search', '/article/:id', '/tags', '/expert/:id']

// 需登录路由
function RequireAuth({ children }) {
  const { isAuthenticated } = useAuthStore()
  const location = useLocation()
  
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  return children
}

// 需管理员路由
function RequireAdmin({ children }) {
  const { isAdmin } = useAuthStore()
  
  if (!isAdmin) {
    return <Navigate to="/" replace />
  }
  return children
}
```

---

## URL 设计规范

| 场景 | URL 格式 | 示例 |
|------|---------|------|
| 文章列表（带筛选） | `/article/search?tag=:tagId&keyword=:kw&page=:p` | `/article/search?tag=理念` |
| 文章详情 | `/article/:id` | `/article/abc123` |
| 专家主页 | `/expert/:id` | `/expert/user_xyz` |
| 评测榜单（特定Skill） | `/leaderboard?skill=:skillId` | `/leaderboard?skill=代码生成` |

---

## Breadcrumb 导航

每个页面设置对应的面包屑：

```
首页                    → /
  └─ 评测榜单           → /leaderboard
       └─ [Skill名称]   → /leaderboard?skill=:id
  └─ 文章详情           → /article/:id
       └─ [文章标题]    → (当前页)
  └─ 专家主页           → /expert/:id
       └─ [专家昵称]    → (当前页)
```
