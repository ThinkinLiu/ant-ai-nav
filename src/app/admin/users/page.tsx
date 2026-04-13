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
import { toast } from 'sonner'
import { UserX, UserCheck, Loader2 } from 'lucide-react'

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
  const [statusFilter, setStatusFilter] = useState(() => searchParams.get('status') || 'all')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [filter, statusFilter])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter !== 'all') params.set('role', filter)
      if (statusFilter !== 'all') params.set('status', statusFilter)
      const url = `/api/admin/users?${params.toString()}`
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
        toast.success('角色更新成功')
        fetchUsers()
      } else {
        toast.error(data.error || '更新失败')
      }
    } catch (error) {
      console.error('更新角色失败:', error)
      toast.error('更新失败')
    }
  }

  const handleToggleStatus = async (user: User) => {
    setActionLoading(user.id)
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: user.id, isActive: !user.is_active }),
      })
      const data = await response.json()
      if (data.success) {
        toast.success(user.is_active ? '用户已停用' : '用户已启用')
        fetchUsers()
      } else {
        toast.error(data.error || '操作失败')
      }
    } catch (error) {
      console.error('更新用户状态失败:', error)
      toast.error('操作失败')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>用户管理</CardTitle>
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="全部状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="active">正常</SelectItem>
                <SelectItem value="inactive">已停用</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="全部角色" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部角色</SelectItem>
                <SelectItem value="user">普通用户</SelectItem>
                <SelectItem value="publisher">发布者</SelectItem>
                <SelectItem value="admin">管理员</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
                  className={`flex items-center justify-between p-4 border rounded-lg ${!user.is_active ? 'bg-muted/50' : ''}`}
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
                          <Badge variant="destructive">已停用</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <p className="text-xs text-muted-foreground">
                        注册于 {formatRelativeTime(user.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={user.is_active ? 'outline' : 'default'}
                      size="sm"
                      onClick={() => handleToggleStatus(user)}
                      disabled={actionLoading === user.id}
                      className={user.is_active ? 'text-orange-500 hover:text-orange-600' : ''}
                    >
                      {actionLoading === user.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : user.is_active ? (
                        <>
                          <UserX className="h-4 w-4 mr-1" />
                          停用
                        </>
                      ) : (
                        <>
                          <UserCheck className="h-4 w-4 mr-1" />
                          启用
                        </>
                      )}
                    </Button>
                    <Select
                      value={user.role}
                      onValueChange={(value) => handleRoleChange(user.id, value)}
                    >
                      <SelectTrigger className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">用户</SelectItem>
                        <SelectItem value="publisher">发布者</SelectItem>
                        <SelectItem value="admin">管理员</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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
