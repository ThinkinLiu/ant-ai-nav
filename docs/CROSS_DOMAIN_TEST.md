# 跨域登录测试指南

## 测试环境准备

### 1. 配置环境变量

根据你的场景选择配置方式：

#### 场景一：子域名共享测试

在 Coze 平台的环境变量中添加：

```env
NEXT_PUBLIC_MAIN_DOMAIN=dev.coze.site
```

#### 场景二：完全不同域名同步测试

在 Coze 平台的环境变量中添加：

```env
NEXT_PUBLIC_SHARED_DOMAINS=dev.coze.site,www.dev.coze.site,ai.dev.coze.site
```

### 2. 重新部署应用

配置完成后，重新部署应用以使环境变量生效。

---

## 测试步骤

### 测试子域名共享

#### 步骤 1：在主域名登录

1. 打开浏览器访问：`https://your-domain.dev.coze.site`
2. 点击登录
3. 输入邮箱和密码，完成登录
4. 验证登录成功

#### 步骤 2：在子域名验证登录状态

1. 在同一个浏览器中打开另一个子域名：`https://ai.your-domain.dev.coze.site`
2. 观察是否自动显示已登录状态
3. 如果未自动登录，刷新页面
4. 应该显示已登录状态

#### 步骤 3：测试登出同步

1. 在任意一个子域名点击登出
2. 切换到另一个子域名
3. 刷新页面
4. 应该显示未登录状态

### 测试完全不同域名同步

#### 前提条件

确保已在应用根组件中初始化跨域认证（参考 `/docs/CROSS_DOMAIN_SETUP.md`）。

#### 步骤 1：在第一个域名登录

1. 打开浏览器访问：`https://first-domain.dev.coze.site`
2. 点击登录
3. 输入邮箱和密码，完成登录
4. 验证登录成功

#### 步骤 2：在第二个域名验证登录状态

1. 在同一个浏览器中打开：`https://second-domain.dev.coze.site`
2. 等待 1-2 秒（同步需要时间）
3. 观察是否自动显示已登录状态
4. 如果未自动登录，刷新页面
5. 应该显示已登录状态

#### 步骤 3：测试登出同步

1. 在任意一个域名点击登出
2. 切换到另一个域名
3. 等待 1-2 秒
4. 刷新页面
5. 应该显示未登录状态

---

## 调试方法

### 1. 查看浏览器控制台

打开浏览器开发者工具（F12），查看控制台输出：

#### 正常情况应该看到：

```
跨域登录同步完成
```

#### 异常情况可能看到：

```
跨域登录同步失败: [错误信息]
跨域认证同步超时
无法同步到域名: [域名]
```

### 2. 查看 localStorage

在浏览器控制台执行：

```javascript
// 检查 token 是否保存
localStorage.getItem('auth_token')

// 检查活动时间
localStorage.getItem('last_activity_time')
```

### 3. 查看 Cookie

在浏览器开发者工具的 Application 面板中：

1. 选择 "Cookies"
2. 选择你的域名
3. 查找 `auth_token` Cookie
4. 检查 `Domain` 字段是否正确（子域名共享时应该是 `.example.com`）

### 4. 检查网络请求

在浏览器开发者工具的 Network 面板中：

1. 筛选 "Doc" 或 "XHR" 请求
2. 查找 `/api/auth/sync` 请求
3. 检查请求参数和响应

---

## 常见问题排查

### 问题 1：子域名无法自动登录

**检查清单：**

- [ ] 环境变量 `NEXT_PUBLIC_MAIN_DOMAIN` 是否正确配置
- [ ] 是否重新部署了应用
- [ ] 是否清除了浏览器缓存和 Cookie
- [ ] Cookie 的 Domain 字段是否正确

**调试命令：**

```javascript
// 检查环境变量
console.log(process.env.NEXT_PUBLIC_MAIN_DOMAIN)

// 检查主域名计算
import { getMainDomain } from '@/lib/auth/cross-domain'
console.log(getMainDomain(window.location.hostname))
```

### 问题 2：完全不同域名无法同步

**检查清单：**

- [ ] 环境变量 `NEXT_PUBLIC_SHARED_DOMAINS` 是否正确配置
- [ ] 是否调用了 `initCrossDomainAuth()`
- [ ] 是否重新部署了应用
- [ ] 浏览器控制台是否有跨域错误
- [ ] 目标域名是否可以正常访问

**调试命令：**

```javascript
// 检查环境变量
console.log(process.env.NEXT_PUBLIC_SHARED_DOMAINS)

// 检查共享域名列表
import { getSharedDomains } from '@/lib/auth/cross-domain'
console.log(getSharedDomains())
```

### 问题 3：同步超时

**检查清单：**

- [ ] 网络连接是否正常
- [ ] 目标域名是否可以访问
- [ ] 超时时间是否合理

**解决方案：**

增加超时时间：

```env
NEXT_PUBLIC_AUTH_SYNC_TIMEOUT=10000
```

### 问题 4：Cookie 无法设置

**检查清单：**

- [ ] 是否使用 HTTPS
- [ ] Cookie 域名格式是否正确
- [ ] 浏览器是否阻止了 Cookie

**调试命令：**

```javascript
// 手动测试 Cookie 设置
import { setCrossDomainCookie } from '@/lib/auth/cross-domain'
setCrossDomainCookie('test', 'value', {
  domain: '.example.com',
  maxAge: 3600
})

// 检查是否设置成功
document.cookie
```

---

## 自动化测试脚本

### 测试 Cookie 设置

```typescript
// test-cookie.ts
import { setCrossDomainCookie, removeCrossDomainCookie } from '@/lib/auth/cross-domain'

// 测试设置 Cookie
setCrossDomainCookie('test_token', 'test_value', {
  maxAge: 3600,
})

// 检查是否设置成功
const cookies = document.cookie
console.log('Cookies:', cookies)

// 测试删除 Cookie
removeCrossDomainCookie('test_token')
```

### 测试跨域同步

```typescript
// test-sync.ts
import { syncAuthTokenToDomains } from '@/lib/auth/cross-domain'

// 测试登录同步
syncAuthTokenToDomains('test_token_123', 'login')
  .then(() => console.log('登录同步成功'))
  .catch(err => console.error('登录同步失败:', err))

// 测试登出同步
syncAuthTokenToDomains('', 'logout')
  .then(() => console.log('登出同步成功'))
  .catch(err => console.error('登出同步失败:', err))
```

---

## 性能测试

### 测试多个域名同步

```typescript
// test-multi-domains.ts
import { getSharedDomains } from '@/lib/auth/cross-domain'

const domains = getSharedDomains()
console.log(`配置了 ${domains.length} 个共享域名`)

// 测试每个域名的响应时间
domains.forEach(domain => {
  const start = Date.now()
  fetch(`https://${domain}/api/health`)
    .then(() => {
      const duration = Date.now() - start
      console.log(`${domain} 响应时间: ${duration}ms`)
    })
    .catch(err => {
      console.error(`${domain} 不可访问:`, err)
    })
})
```

---

## 测试报告模板

```markdown
# 跨域登录测试报告

## 测试环境
- 测试日期：YYYY-MM-DD
- 浏览器：Chrome / Firefox / Safari
- 测试域名：domain1, domain2, domain3
- 配置方式：子域名共享 / 完全不同域名同步

## 测试结果

### 登录同步测试
- [ ] 域名1 登录成功
- [ ] 域名2 自动登录成功
- [ ] 域名3 自动登录成功

### 登出同步测试
- [ ] 域名1 登出成功
- [ ] 域名2 自动登出成功
- [ ] 域名3 自动登出成功

### Cookie 测试
- [ ] Cookie 正确设置
- [ ] Cookie Domain 字段正确
- [ ] Cookie 在所有域名间共享

### 性能测试
- 登录同步时间：X 秒
- 登出同步时间：X 秒
- 响应时间：X 秒

## 问题描述

（记录遇到的问题）

## 解决方案

（记录解决方案）
```

---

## 下一步

测试通过后，你可以：

1. 在生产环境配置跨域认证
2. 监控跨域同步的成功率
3. 根据实际使用情况调整超时时间
4. 定期检查浏览器兼容性

如有问题，请参考 `/docs/CROSS_DOMAIN_SETUP.md` 文档。
