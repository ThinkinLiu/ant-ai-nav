'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatRelativeTime } from '@/lib/utils'

interface User {
  id: string
  email: string
  name: string | null
  avatar: string | null
  role: string
  created_at: string
  is_active: boolean
}

export default function AdminUsersPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <AdminUsersContent />
    </Suspense>
  )
}

function AdminUsersContent() {
  const { token } = useAuth()
  const searchParams = useSearchParams()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState(() => searchParams.get('role') || 'all')

  useEffect(() => {
    fetchUsers()
  }, [filter])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const url = filter !== 'all' ? `/api/admin/users?role=${filter}` : '/api/admin/users'
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (data.success) {
        setUsers(data.data.data)
      }
    } catch (error) {
      console.error('获取用户列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, role: newRole }),
      })
      const data = await response.json()
      if (data.success) {
        fetchUsers()
      }
    } catch (error) {
      console.error('更新角色失败:', error)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>用户管理</CardTitle>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="全部角色" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部角色</SelectItem>
              <SelectItem value="user">普通用户</SelectItem>
              <SelectItem value="publisher">发布者</SelectItem>
              <SelectItem value="admin">管理员</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={user.avatar || undefined} />
                      <AvatarFallback>{user.name?.[0] || user.email[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{user.name || '未设置昵称'}</span>
                        <Badge
                          variant={
                            user.role === 'admin'
                              ? 'default'
                              : user.role === 'publisher'
                              ? 'secondary'
                              : 'outline'
                          }
                        >
                          {user.role === 'admin'
                            ? '管理员'
                            : user.role === 'publisher'
                            ? '发布者'
                            : '用户'}
                        </Badge>
                        {!user.is_active && (
                          <Badge variant="destructive">已禁用</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <p className="text-xs text-muted-foreground">
                        注册于 {formatRelativeTime(user.created_at)}
                      </p>
                    </div>
                  </div>
                  <Select
                    value={user.role}
                    onValueChange={(value) => handleRoleChange(user.id, value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">用户</SelectItem>
                      <SelectItem value="publisher">发布者</SelectItem>
                      <SelectItem value="admin">管理员</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ))}
              {users.length === 0 && (
                <p className="text-center text-muted-foreground py-12">暂无用户</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
