'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { Loader2, HardDrive, Cloud, FolderOpen, Save } from 'lucide-react'

interface StorageSettings {
  id?: number
  storage_type: string
  // S3 配置
  s3_endpoint?: string
  s3_bucket?: string
  s3_access_key?: string
  s3_secret_key?: string
  s3_region?: string
  s3_public_domain?: string
  // 七牛云配置
  qiniu_access_key?: string
  qiniu_secret_key?: string
  qiniu_bucket?: string
  qiniu_domain?: string
  qiniu_region?: string
  qiniu_is_private?: boolean
  qiniu_public_domain?: string
  // 本地存储配置
  local_upload_dir?: string
  local_public_path?: string
  local_base_url?: string
  // 通用设置
  max_file_size?: number
  allowed_extensions?: string[]
}

const storageTypes = [
  {
    value: 's3',
    name: 'S3 兼容存储',
    icon: Cloud,
    description: '支持阿里云 OSS、腾讯云 COS、AWS S3、MinIO 等',
  },
  {
    value: 'qiniu',
    name: '七牛云存储',
    icon: HardDrive,
    description: '使用七牛云对象存储服务',
  },
  {
    value: 'local',
    name: '本地存储',
    icon: FolderOpen,
    description: '存储到服务器本地文件系统',
  },
]

export default function StorageSettingsPage() {
  const [settings, setSettings] = useState<StorageSettings>({
    storage_type: 's3',
    s3_endpoint: '',
    s3_bucket: '',
    s3_access_key: '',
    s3_secret_key: '',
    s3_region: 'cn-beijing',
    s3_public_domain: '',
    qiniu_access_key: '',
    qiniu_secret_key: '',
    qiniu_bucket: '',
    qiniu_domain: '',
    qiniu_region: 'z0',
    qiniu_is_private: false,
    qiniu_public_domain: '',
    local_upload_dir: 'public/uploads',
    local_public_path: '/uploads',
    local_base_url: '',
    max_file_size: 10485760,
    allowed_extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        toast.error('请先登录')
        return
      }
      const response = await fetch('/api/admin/storage-settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (data.success && data.data) {
        setSettings({
          ...settings,
          ...data.data,
        })
      }
    } catch (error) {
      console.error('获取存储配置失败:', error)
      toast.error('获取存储配置失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        toast.error('请先登录')
        return
      }

      const response = await fetch('/api/admin/storage-settings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })

      const data = await response.json()
      if (data.success) {
        toast.success('存储配置已保存')
      } else {
        toast.error(data.error || '保存失败')
      }
    } catch (error) {
      console.error('保存存储配置失败:', error)
      toast.error('保存失败')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">存储设置</h1>
        <p className="text-muted-foreground mt-2">配置图片上传的存储方式</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>存储类型</CardTitle>
          <CardDescription>选择图片存储的方式</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {storageTypes.map((type) => {
              const Icon = type.icon
              return (
                <div
                  key={type.value}
                  className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all ${
                    settings.storage_type === type.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setSettings({ ...settings, storage_type: type.value })}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      settings.storage_type === type.value ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    }`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-medium">{type.name}</p>
                      <p className="text-xs text-muted-foreground">{type.description}</p>
                    </div>
                  </div>
                  {settings.storage_type === type.value && (
                    <div className="absolute top-2 right-2">
                      <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-primary-foreground" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Tabs value={settings.storage_type} onValueChange={(v) => setSettings({ ...settings, storage_type: v })}>
        <TabsList className="hidden">
          <TabsTrigger value="s3">S3</TabsTrigger>
          <TabsTrigger value="qiniu">七牛云</TabsTrigger>
          <TabsTrigger value="local">本地</TabsTrigger>
        </TabsList>

        {/* S3 配置 */}
        <TabsContent value="s3" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>S3 兼容存储配置</CardTitle>
              <CardDescription>适用于阿里云 OSS、腾讯云 COS、AWS S3、MinIO 等支持 S3 协议的对象存储服务</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="s3_endpoint">存储端点 *</Label>
                  <Input
                    id="s3_endpoint"
                    placeholder="https://oss-cn-beijing.aliyuncs.com"
                    value={settings.s3_endpoint || ''}
                    onChange={(e) => setSettings({ ...settings, s3_endpoint: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">对象存储服务的 API 端点地址</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="s3_bucket">存储桶名称 *</Label>
                  <Input
                    id="s3_bucket"
                    placeholder="my-bucket"
                    value={settings.s3_bucket || ''}
                    onChange={(e) => setSettings({ ...settings, s3_bucket: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="s3_access_key">Access Key</Label>
                  <Input
                    id="s3_access_key"
                    placeholder="访问密钥 AccessKey ID"
                    value={settings.s3_access_key || ''}
                    onChange={(e) => setSettings({ ...settings, s3_access_key: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="s3_secret_key">Secret Key</Label>
                  <Input
                    id="s3_secret_key"
                    type="password"
                    placeholder="访问密钥 AccessKey Secret"
                    value={settings.s3_secret_key || ''}
                    onChange={(e) => setSettings({ ...settings, s3_secret_key: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">留空则不修改当前密钥，填写 ****** 表示保留当前密钥</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="s3_region">区域</Label>
                  <Input
                    id="s3_region"
                    placeholder="cn-beijing"
                    value={settings.s3_region || 'cn-beijing'}
                    onChange={(e) => setSettings({ ...settings, s3_region: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="s3_public_domain">公共访问域名</Label>
                  <Input
                    id="s3_public_domain"
                    placeholder="https://cdn.example.com"
                    value={settings.s3_public_domain || ''}
                    onChange={(e) => setSettings({ ...settings, s3_public_domain: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">用于生成图片访问 URL，留空则使用端点地址</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 七牛云配置 */}
        <TabsContent value="qiniu" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>七牛云存储配置</CardTitle>
              <CardDescription>使用七牛云对象存储服务进行文件存储</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="qiniu_access_key">Access Key *</Label>
                  <Input
                    id="qiniu_access_key"
                    placeholder="七牛云 AccessKey"
                    value={settings.qiniu_access_key || ''}
                    onChange={(e) => setSettings({ ...settings, qiniu_access_key: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="qiniu_secret_key">Secret Key *</Label>
                  <Input
                    id="qiniu_secret_key"
                    type="password"
                    placeholder="七牛云 SecretKey"
                    value={settings.qiniu_secret_key || ''}
                    onChange={(e) => setSettings({ ...settings, qiniu_secret_key: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">留空则不修改当前密钥</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="qiniu_bucket">存储桶名称 *</Label>
                  <Input
                    id="qiniu_bucket"
                    placeholder="my-bucket"
                    value={settings.qiniu_bucket || ''}
                    onChange={(e) => setSettings({ ...settings, qiniu_bucket: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="qiniu_domain">绑定域名 *</Label>
                  <Input
                    id="qiniu_domain"
                    placeholder="https://img.example.com"
                    value={settings.qiniu_domain || ''}
                    onChange={(e) => setSettings({ ...settings, qiniu_domain: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">七牛云存储空间绑定的域名</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="qiniu_region">区域</Label>
                  <Input
                    id="qiniu_region"
                    placeholder="z0"
                    value={settings.qiniu_region || 'z0'}
                    onChange={(e) => setSettings({ ...settings, qiniu_region: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">可选值: z0 (华东), z1 (华北), z2 (华南), na0 (北美), as0 (东南亚)</p>
                </div>
                <div className="space-y-2 flex items-center gap-3">
                  <Switch
                    id="qiniu_is_private"
                    checked={settings.qiniu_is_private || false}
                    onCheckedChange={(checked) => setSettings({ ...settings, qiniu_is_private: checked })}
                  />
                  <Label htmlFor="qiniu_is_private" className="cursor-pointer">私有空间</Label>
                  <p className="text-xs text-muted-foreground">开启后，访问文件需要带签名</p>
                </div>
              </div>
              
              {settings.qiniu_is_private && (
                <div className="mt-4 p-4 bg-muted/50 rounded-lg space-y-4">
                  <div className="text-sm font-medium">私有空间配置</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="qiniu_public_domain">公共访问域名</Label>
                      <Input
                        id="qiniu_public_domain"
                        placeholder="https://cdn.example.com"
                        value={settings.qiniu_public_domain || ''}
                        onChange={(e) => setSettings({ ...settings, qiniu_public_domain: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground">
                        用于实际访问的域名（如 nginx 代理域名）。留空则使用绑定域名。
                        <br />
                        示例：绑定域名为 http://img.example.com，公共访问域名为 https://cdn.example.com
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 本地存储配置 */}
        <TabsContent value="local" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>本地存储配置</CardTitle>
              <CardDescription>将文件存储到服务器的本地文件系统</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="local_upload_dir">上传目录</Label>
                  <Input
                    id="local_upload_dir"
                    placeholder="public/uploads"
                    value={settings.local_upload_dir || 'public/uploads'}
                    onChange={(e) => setSettings({ ...settings, local_upload_dir: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">相对于项目根目录的上传目录</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="local_public_path">公共访问路径</Label>
                  <Input
                    id="local_public_path"
                    placeholder="/uploads"
                    value={settings.local_public_path || '/uploads'}
                    onChange={(e) => setSettings({ ...settings, local_public_path: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">用于访问上传文件的 URL 路径</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="local_base_url">自定义基础 URL</Label>
                  <Input
                    id="local_base_url"
                    placeholder="https://cdn.example.com"
                    value={settings.local_base_url || ''}
                    onChange={(e) => setSettings({ ...settings, local_base_url: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">留空则使用相对路径</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 通用设置 */}
      <Card>
        <CardHeader>
          <CardTitle>通用设置</CardTitle>
          <CardDescription>文件上传的通用限制</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="max_file_size">最大文件大小 (字节)</Label>
              <Input
                id="max_file_size"
                type="number"
                placeholder="10485760"
                value={settings.max_file_size || 10485760}
                onChange={(e) => setSettings({ ...settings, max_file_size: parseInt(e.target.value) || 10485760 })}
              />
              <p className="text-xs text-muted-foreground">默认 10MB (10485760 字节)</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="allowed_extensions">允许的文件扩展名</Label>
              <Input
                id="allowed_extensions"
                placeholder="jpg, jpeg, png, gif, webp"
                value={settings.allowed_extensions?.join(', ') || 'jpg, jpeg, png, gif, webp'}
                onChange={(e) => setSettings({
                  ...settings,
                  allowed_extensions: e.target.value.split(',').map(ext => ext.trim()).filter(Boolean)
                })}
              />
              <p className="text-xs text-muted-foreground">用英文逗号分隔</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              保存中...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              保存配置
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
