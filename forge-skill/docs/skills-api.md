# Skills API

## 调用格式

```javascript
forgeSkill.main({
  skill: 'skillName',
  action: 'actionName',
  params: { ... }
}, context)
```

## 返回格式

```json
{
  "code": 0,
  "message": "success message",
  "data": { ... }
}
```

## Auth Skill

### login
- params: email, password
- returns: user, token

### register
- params: email, password, nickname
- returns: userId

### logout
- params: (none)
- returns: success message

### resetPassword
- params: email, code, newPassword
- returns: success message

## Article Skill

### create
- params: title, content, authorId, tags
- returns: articleId

### read
- params: articleId
- returns: article

### update
- params: articleId, title, content, tags
- returns: success message

### delete
- params: articleId
- returns: success message

### list
- params: page, pageSize, authorId, status
- returns: list, total, page, pageSize

### publish
- params: articleId
- returns: success message

## Evaluation Skill

### create
- params: title, description, evaluatorId, criteria
- returns: evalId

### list
- params: page, pageSize, status, evaluatorId
- returns: list, total, page, pageSize

### get
- params: evalId
- returns: evaluation

### approve
- params: evalId, approved, comment
- returns: success message

## Tag Skill

### create
- params: name, description, color
- returns: tagId

### list
- params: page, pageSize
- returns: list, total

### delete
- params: tagId
- returns: success message

## Skill Skill

### register
- params: skillName, skillPath
- returns: success message

### list
- params: (none)
- returns: skills, total

### invoke
- params: skillName, action, params
- returns: action result