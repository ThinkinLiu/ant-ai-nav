'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Plus, Edit, Trash2, GripVertical, Save, LayoutGrid,
  Flame, Globe, Home, Star, Eye, EyeOff, ChevronDown,
  // 新增图标
  TrendingUp, Clock, Zap, Award, Crown, Diamond, Gem, Sparkles,
  Rocket, Target, Flag, Bookmark, Tag, Hash, Layers, Grid3X3,
  Newspaper, BookOpen, FileText, MessageSquare, MessagesSquare,
  Users, User, UserCircle, Heart, ThumbsUp, Medal, Trophy,
  Image, Camera, Video, Music, Mic, Headphones,
  Code, Terminal, Cpu, Database, Server, Cloud,
  Sun, Moon, Sunrise, Sunset, CloudSun,
  MapPin, Compass, Navigation, Send, Plane,
  Droplets, Leaf, Flower2,
  Gift, Package, ShoppingCart, Wallet,
  Bell, BellRing, Calendar, Timer, Hourglass,
  Lock, Key, Shield, ShieldCheck,
  BarChart3, LineChart, PieChart,
  Search, Filter, Settings, Wrench,
  Puzzle, Lightbulb, Brain, Bot,
  Wifi, Radio, Signal, Satellite,
  Monitor, Smartphone, Laptop, HardDrive,
  FolderOpen, Folder, File, Files, Archive,
  Link2, ExternalLink, Share2,
  Download, Upload, CloudUpload, CloudDownload,
  Play, Pause, SkipForward, Rewind,
  ChevronUp, ChevronLeft,
  ArrowRight, ArrowDown, ArrowUp, ArrowLeft,
  Check, X, Minus, CheckCircle, XCircle, AlertTriangle, HelpCircle,
  Maximize, Minimize, Expand, Shrink, ZoomIn, ZoomOut,
  Menu, MoreHorizontal, MoreVertical, RefreshCw, RotateCw, Repeat, Shuffle,
} from 'lucide-react'
import { toast } from 'sonner'

interface Tab {
  id: number
  name: string
  slug: string
  type: string
  source_id: number | null
  icon: string | null
  color: string | null
  sort_order: number
  is_default: boolean
  is_system: boolean
  is_visible: boolean
  created_at: string
}

interface Category {
  id: number
  name: string
  slug: string
}

interface Tag {
  id: number
  name: string
  slug: string
}

const TAB_TYPES = [
  { value: 'hot_tools', label: '火爆工具', description: '按浏览量排序的热门工具' },
  { value: 'domestic_tools', label: '国内火爆', description: '国内热门AI工具' },
  { value: 'foreign_tools', label: '国外火爆', description: '国外热门AI工具' },
  { value: 'lobster_tools', label: '龙虾专区', description: '名称包含"龙虾"或"OpenClaw"的工具' },
  { value: 'category', label: '分类工具', description: '指定分类下的工具' },
  { value: 'tag', label: '标签工具', description: '指定标签下的工具' },
  { value: 'news', label: 'AI资讯', description: 'AI资讯列表' },
  { value: 'fame', label: 'AI名人堂', description: 'AI名人堂列表' },
  { value: 'timeline', label: 'AI大事纪', description: 'AI大事纪列表' },
  { value: 'ranking', label: 'AI排行榜', description: 'AI排行榜列表' },
]

const ICON_OPTIONS = [
  // 热门推荐类
  { value: 'Flame', label: '火焰', icon: Flame },
  { value: 'TrendingUp', label: '上升趋势', icon: TrendingUp },
  { value: 'Zap', label: '闪电', icon: Zap },
  { value: 'Sparkles', label: '闪耀', icon: Sparkles },
  
  // 星级评分类
  { value: 'Star', label: '星星', icon: Star },
  { value: 'Award', label: '奖章', icon: Award },
  { value: 'Crown', label: '皇冠', icon: Crown },
  { value: 'Diamond', label: '钻石', icon: Diamond },
  { value: 'Gem', label: '宝石', icon: Gem },
  { value: 'Medal', label: '勋章', icon: Medal },
  { value: 'Trophy', label: '奖杯', icon: Trophy },
  
  // 内容资讯类
  { value: 'Newspaper', label: '报纸', icon: Newspaper },
  { value: 'BookOpen', label: '打开的书', icon: BookOpen },
  { value: 'FileText', label: '文本文件', icon: FileText },
  { value: 'MessageSquare', label: '消息框', icon: MessageSquare },
  { value: 'MessagesSquare', label: '消息', icon: MessagesSquare },
  
  // 人物用户类
  { value: 'Users', label: '用户组', icon: Users },
  { value: 'User', label: '用户', icon: User },
  { value: 'UserCircle', label: '用户圈', icon: UserCircle },
  { value: 'Heart', label: '爱心', icon: Heart },
  { value: 'ThumbsUp', label: '点赞', icon: ThumbsUp },
  
  // 多媒体类
  { value: 'Image', label: '图片', icon: Image },
  { value: 'Camera', label: '相机', icon: Camera },
  { value: 'Video', label: '视频', icon: Video },
  { value: 'Music', label: '音乐', icon: Music },
  { value: 'Mic', label: '麦克风', icon: Mic },
  { value: 'Headphones', label: '耳机', icon: Headphones },
  
  // 技术开发类
  { value: 'Code', label: '代码', icon: Code },
  { value: 'Terminal', label: '终端', icon: Terminal },
  { value: 'Cpu', label: 'CPU', icon: Cpu },
  { value: 'Database', label: '数据库', icon: Database },
  { value: 'Server', label: '服务器', icon: Server },
  { value: 'Cloud', label: '云', icon: Cloud },
  
  // AI智能类
  { value: 'Brain', label: '大脑', icon: Brain },
  { value: 'Bot', label: '机器人', icon: Bot },
  { value: 'Lightbulb', label: '灯泡', icon: Lightbulb },
  { value: 'Puzzle', label: '拼图', icon: Puzzle },
  
  // 地理导航类
  { value: 'Globe', label: '地球', icon: Globe },
  { value: 'MapPin', label: '定位', icon: MapPin },
  { value: 'Compass', label: '指南针', icon: Compass },
  { value: 'Navigation', label: '导航', icon: Navigation },
  { value: 'Rocket', label: '火箭', icon: Rocket },
  { value: 'Target', label: '目标', icon: Target },
  { value: 'Flag', label: '旗帜', icon: Flag },
  
  // 分类标签类
  { value: 'Home', label: '首页', icon: Home },
  { value: 'Tag', label: '标签', icon: Tag },
  { value: 'Hash', label: '井号', icon: Hash },
  { value: 'Layers', label: '图层', icon: Layers },
  { value: 'Grid3X3', label: '网格', icon: Grid3X3 },
  { value: 'Bookmark', label: '书签', icon: Bookmark },
  
  // 时间日期类
  { value: 'Clock', label: '时钟', icon: Clock },
  { value: 'Calendar', label: '日历', icon: Calendar },
  { value: 'Timer', label: '计时器', icon: Timer },
  { value: 'Hourglass', label: '沙漏', icon: Hourglass },
  
  // 天气自然类
  { value: 'Sun', label: '太阳', icon: Sun },
  { value: 'Moon', label: '月亮', icon: Moon },
  { value: 'Sunrise', label: '日出', icon: Sunrise },
  { value: 'Sunset', label: '日落', icon: Sunset },
  { value: 'CloudSun', label: '多云', icon: CloudSun },
  { value: 'Droplets', label: '水滴', icon: Droplets },
  { value: 'Leaf', label: '叶子', icon: Leaf },
  { value: 'Flower2', label: '花朵', icon: Flower2 },
  
  // 礼物购物类
  { value: 'Gift', label: '礼物', icon: Gift },
  { value: 'Package', label: '包裹', icon: Package },
  { value: 'ShoppingCart', label: '购物车', icon: ShoppingCart },
  { value: 'Wallet', label: '钱包', icon: Wallet },
  
  // 通知提醒类
  { value: 'Bell', label: '铃铛', icon: Bell },
  { value: 'BellRing', label: '响铃', icon: BellRing },
  
  // 图表统计类
  { value: 'BarChart3', label: '柱状图', icon: BarChart3 },
  { value: 'LineChart', label: '折线图', icon: LineChart },
  { value: 'PieChart', label: '饼图', icon: PieChart },
  
  // 搜索设置类
  { value: 'Search', label: '搜索', icon: Search },
  { value: 'Filter', label: '过滤', icon: Filter },
  { value: 'Settings', label: '设置', icon: Settings },
  { value: 'Wrench', label: '扳手', icon: Wrench },
  
  // 安全保护类
  { value: 'Lock', label: '锁', icon: Lock },
  { value: 'Key', label: '钥匙', icon: Key },
  { value: 'Shield', label: '盾牌', icon: Shield },
  { value: 'ShieldCheck', label: '安全盾', icon: ShieldCheck },
  
  // 网络连接类
  { value: 'Wifi', label: 'WiFi', icon: Wifi },
  { value: 'Radio', label: '无线电', icon: Radio },
  { value: 'Signal', label: '信号', icon: Signal },
  { value: 'Satellite', label: '卫星', icon: Satellite },
  
  // 设备硬件类
  { value: 'Monitor', label: '显示器', icon: Monitor },
  { value: 'Smartphone', label: '手机', icon: Smartphone },
  { value: 'Laptop', label: '笔记本', icon: Laptop },
  { value: 'HardDrive', label: '硬盘', icon: HardDrive },
  
  // 文件文件夹类
  { value: 'FolderOpen', label: '打开文件夹', icon: FolderOpen },
  { value: 'Folder', label: '文件夹', icon: Folder },
  { value: 'File', label: '文件', icon: File },
  { value: 'Files', label: '多文件', icon: Files },
  { value: 'Archive', label: '归档', icon: Archive },
  
  // 链接分享类
  { value: 'Link2', label: '链接', icon: Link2 },
  { value: 'ExternalLink', label: '外部链接', icon: ExternalLink },
  { value: 'Share2', label: '分享', icon: Share2 },
  
  // 上传下载类
  { value: 'Download', label: '下载', icon: Download },
  { value: 'Upload', label: '上传', icon: Upload },
  { value: 'CloudUpload', label: '云上传', icon: CloudUpload },
  { value: 'CloudDownload', label: '云下载', icon: CloudDownload },
  
  // 媒体控制类
  { value: 'Play', label: '播放', icon: Play },
  { value: 'Pause', label: '暂停', icon: Pause },
  { value: 'SkipForward', label: '快进', icon: SkipForward },
  { value: 'Rewind', label: '快退', icon: Rewind },
  
  // 箭头方向类
  { value: 'ChevronDown', label: '下箭头', icon: ChevronDown },
  { value: 'ChevronUp', label: '上箭头', icon: ChevronUp },
  { value: 'ChevronLeft', label: '左箭头', icon: ChevronLeft },
  { value: 'ArrowRight', label: '右向箭头', icon: ArrowRight },
  { value: 'ArrowUp', label: '上向箭头', icon: ArrowUp },
  { value: 'ArrowDown', label: '下向箭头', icon: ArrowDown },
  { value: 'ArrowLeft', label: '左向箭头', icon: ArrowLeft },
  
  // 状态指示类
  { value: 'Check', label: '勾选', icon: Check },
  { value: 'X', label: '关闭', icon: X },
  { value: 'Minus', label: '减号', icon: Minus },
  { value: 'CheckCircle', label: '成功圈', icon: CheckCircle },
  { value: 'XCircle', label: '错误圈', icon: XCircle },
  { value: 'AlertTriangle', label: '警告三角', icon: AlertTriangle },
  { value: 'HelpCircle', label: '帮助圈', icon: HelpCircle },
  
  // 视图操作类
  { value: 'Maximize', label: '最大化', icon: Maximize },
  { value: 'Minimize', label: '最小化', icon: Minimize },
  { value: 'Expand', label: '展开', icon: Expand },
  { value: 'Shrink', label: '收缩', icon: Shrink },
  { value: 'ZoomIn', label: '放大', icon: ZoomIn },
  { value: 'ZoomOut', label: '缩小', icon: ZoomOut },
  
  // 其他常用
  { value: 'Menu', label: '菜单', icon: Menu },
  { value: 'MoreHorizontal', label: '更多横', icon: MoreHorizontal },
  { value: 'MoreVertical', label: '更多竖', icon: MoreVertical },
  { value: 'RefreshCw', label: '刷新', icon: RefreshCw },
  { value: 'RotateCw', label: '顺时针', icon: RotateCw },
  { value: 'Repeat', label: '重复', icon: Repeat },
  { value: 'Shuffle', label: '随机', icon: Shuffle },
  { value: 'Send', label: '发送', icon: Send },
  { value: 'Plane', label: '飞机', icon: Plane },
]

export default function HomeTabsAdminPage() {
  const { token } = useAuth()
  const [tabs, setTabs] = useState<Tab[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [currentTab, setCurrentTab] = useState<Tab | null>(null)
  const [iconSearch, setIconSearch] = useState('')
  
  // 表单数据
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    type: 'category',
    source_id: '',
    icon: 'Star',
    color: '#6366F1',
    sort_order: 0,
    is_default: false,
    is_visible: true,
  })

  useEffect(() => {
    fetchTabs()
    fetchCategories()
    fetchTags()
  }, [token])

  const fetchTabs = async () => {
    try {
      const response = await fetch('/api/admin/home-tabs', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (data.success) {
        setTabs(data.data)
      }
    } catch (error) {
      console.error('获取Tab配置失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      if (data.success) {
        setCategories(data.data)
      }
    } catch (error) {
      console.error('获取分类失败:', error)
    }
  }

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/tags')
      const data = await response.json()
      if (data.success) {
        setTags(data.data)
      }
    } catch (error) {
      console.error('获取标签失败:', error)
    }
  }

  const handleEdit = (tab: Tab) => {
    setCurrentTab(tab)
    setFormData({
      name: tab.name,
      slug: tab.slug,
      type: tab.type,
      source_id: tab.source_id?.toString() || '',
      icon: tab.icon || 'Star',
      color: tab.color || '#6366F1',
      sort_order: tab.sort_order,
      is_default: tab.is_default,
      is_visible: tab.is_visible,
    })
    setEditDialogOpen(true)
  }

  const handleAdd = () => {
    setCurrentTab(null)
    setFormData({
      name: '',
      slug: '',
      type: 'category',
      source_id: '',
      icon: 'Star',
      color: '#6366F1',
      sort_order: tabs.length,
      is_default: false,
      is_visible: true,
    })
    setAddDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.name || !formData.slug) {
      toast.error('请填写必填项')
      return
    }

    // 类型为分类或标签时，必须选择数据源
    if ((formData.type === 'category' || formData.type === 'tag') && !formData.source_id) {
      toast.error('请选择数据源')
      return
    }

    setSaving(true)
    try {
      const url = currentTab 
        ? `/api/admin/home-tabs/${currentTab.id}`
        : '/api/admin/home-tabs'
      const method = currentTab ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          source_id: formData.source_id ? parseInt(formData.source_id) : null,
        }),
      })

      const data = await response.json()
      if (data.success) {
        toast.success(currentTab ? '保存成功' : '创建成功')
        setEditDialogOpen(false)
        setAddDialogOpen(false)
        fetchTabs()
      } else {
        toast.error(data.error || '操作失败')
      }
    } catch (error) {
      console.error('保存失败:', error)
      toast.error('操作失败')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (tab: Tab) => {
    if (tab.is_system) {
      toast.error('系统默认Tab不能删除')
      return
    }

    if (!confirm(`确定要删除"${tab.name}"吗？`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/home-tabs/${tab.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = await response.json()
      if (data.success) {
        toast.success('删除成功')
        fetchTabs()
      } else {
        toast.error(data.error || '删除失败')
      }
    } catch (error) {
      console.error('删除失败:', error)
      toast.error('删除失败')
    }
  }

  const toggleVisibility = async (tab: Tab) => {
    try {
      const response = await fetch(`/api/admin/home-tabs/${tab.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...tab,
          is_visible: !tab.is_visible,
        }),
      })

      const data = await response.json()
      if (data.success) {
        toast.success(tab.is_visible ? '已隐藏' : '已显示')
        fetchTabs()
      } else {
        toast.error(data.error || '操作失败')
      }
    } catch (error) {
      console.error('切换显示状态失败:', error)
      toast.error('操作失败')
    }
  }

  const getTypeLabel = (type: string) => {
    return TAB_TYPES.find(t => t.value === type)?.label || type
  }

  const getSourceName = (tab: Tab) => {
    if (tab.type === 'category' && tab.source_id) {
      return categories.find(c => c.id === tab.source_id)?.name || ''
    }
    if (tab.type === 'tag' && tab.source_id) {
      return tags.find(t => t.id === tab.source_id)?.name || ''
    }
    return null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">首页Tab管理</h1>
          <p className="text-muted-foreground mt-1">
            管理首页展示的Tab配置，可添加、编辑、删除Tab
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          添加Tab
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LayoutGrid className="h-5 w-5" />
            Tab列表
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tabs.map((tab, index) => (
              <div
                key={tab.id}
                className={`flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 ${!tab.is_visible ? 'opacity-60' : ''}`}
              >
                <div className="flex items-center gap-2 text-muted-foreground">
                  <GripVertical className="h-4 w-4" />
                  <span className="text-sm font-medium w-6">{index + 1}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{tab.name}</span>
                    {tab.is_default && (
                      <Badge variant="default">默认</Badge>
                    )}
                    {tab.is_system && (
                      <Badge variant="secondary">系统</Badge>
                    )}
                    {!tab.is_visible && (
                      <Badge variant="outline" className="text-muted-foreground">已隐藏</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                    <span>类型: {getTypeLabel(tab.type)}</span>
                    {getSourceName(tab) && (
                      <>
                        <span>•</span>
                        <span>数据源: {getSourceName(tab)}</span>
                      </>
                    )}
                    <span>•</span>
                    <span>排序: {tab.sort_order}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleVisibility(tab)}
                    title={tab.is_visible ? '点击隐藏' : '点击显示'}
                  >
                    {tab.is_visible ? (
                      <Eye className="h-4 w-4 text-green-600" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(tab)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  {!tab.is_system && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(tab)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {tabs.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                暂无Tab配置
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 编辑对话框 */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑Tab</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>名称 *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Tab名称"
              />
            </div>

            {currentTab && !currentTab.is_system && (
              <>
                <div className="space-y-2">
                  <Label>类型 *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value, source_id: '' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TAB_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {(formData.type === 'category' || formData.type === 'tag') && (
                  <div className="space-y-2">
                    <Label>数据源 *</Label>
                    <Select
                      value={formData.source_id}
                      onValueChange={(value) => setFormData({ ...formData, source_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择数据源" />
                      </SelectTrigger>
                      <SelectContent>
                        {formData.type === 'category' ? (
                          categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id.toString()}>
                              {cat.name}
                            </SelectItem>
                          ))
                        ) : (
                          tags.map((tag) => (
                            <SelectItem key={tag.id} value={tag.id.toString()}>
                              {tag.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </>
            )}

            <div className="space-y-2">
              <Label>图标</Label>
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-10 h-10 border rounded-md bg-muted">
                  {(() => {
                    const iconOption = ICON_OPTIONS.find(i => i.value === formData.icon)
                    if (iconOption) {
                      const IconComponent = iconOption.icon
                      return <IconComponent className="h-5 w-5" style={{ color: formData.color }} />
                    }
                    return <Star className="h-5 w-5" />
                  })()}
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="flex-1 justify-between">
                      <span>{ICON_OPTIONS.find(i => i.value === formData.icon)?.label || '选择图标'}</span>
                      <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0" align="start">
                    <div className="p-3 border-b">
                      <Input
                        placeholder="搜索图标..."
                        value={iconSearch}
                        onChange={(e) => setIconSearch(e.target.value)}
                        className="h-8"
                      />
                    </div>
                    <div className="max-h-[300px] overflow-y-auto p-2">
                      <div className="grid grid-cols-5 gap-1">
                        {ICON_OPTIONS
                          .filter(icon => 
                            icon.label.toLowerCase().includes(iconSearch.toLowerCase()) ||
                            icon.value.toLowerCase().includes(iconSearch.toLowerCase())
                          )
                          .map((icon) => (
                            <Tooltip key={icon.value}>
                              <TooltipTrigger asChild>
                                <button
                                  type="button"
                                  onClick={() => setFormData({ ...formData, icon: icon.value })}
                                  className={`flex flex-col items-center justify-center p-2 rounded-md hover:bg-muted transition-colors ${
                                    formData.icon === icon.value ? 'bg-primary/10 ring-1 ring-primary' : ''
                                  }`}
                                >
                                  <icon.icon className="h-5 w-5" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="text-xs">
                                {icon.label}
                              </TooltipContent>
                            </Tooltip>
                          ))}
                      </div>
                      {ICON_OPTIONS.filter(icon => 
                        icon.label.toLowerCase().includes(iconSearch.toLowerCase()) ||
                        icon.value.toLowerCase().includes(iconSearch.toLowerCase())
                      ).length === 0 && (
                        <div className="text-center py-4 text-muted-foreground text-sm">
                          未找到匹配的图标
                        </div>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label>颜色</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-12 h-10 p-1"
                />
                <Input
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="#6366F1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>排序</Label>
              <Input
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_default"
                checked={formData.is_default}
                onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                className="rounded border-gray-300"
              />
              <Label htmlFor="is_default">设为默认Tab</Label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_visible"
                checked={formData.is_visible}
                onChange={(e) => setFormData({ ...formData, is_visible: e.target.checked })}
                className="rounded border-gray-300"
              />
              <Label htmlFor="is_visible">在首页显示</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 添加对话框 */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加Tab</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>名称 *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Tab名称"
              />
            </div>

            <div className="space-y-2">
              <Label>标识 *</Label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="唯一标识（英文）"
              />
            </div>

            <div className="space-y-2">
              <Label>类型 *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value, source_id: '' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TAB_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <div>{type.label}</div>
                        <div className="text-xs text-muted-foreground">{type.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {(formData.type === 'category' || formData.type === 'tag') && (
              <div className="space-y-2">
                <Label>数据源 *</Label>
                <Select
                  value={formData.source_id}
                  onValueChange={(value) => setFormData({ ...formData, source_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择数据源" />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.type === 'category' ? (
                      categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          {cat.name}
                        </SelectItem>
                      ))
                    ) : (
                      tags.map((tag) => (
                        <SelectItem key={tag.id} value={tag.id.toString()}>
                          {tag.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>图标</Label>
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-10 h-10 border rounded-md bg-muted">
                  {(() => {
                    const iconOption = ICON_OPTIONS.find(i => i.value === formData.icon)
                    if (iconOption) {
                      const IconComponent = iconOption.icon
                      return <IconComponent className="h-5 w-5" style={{ color: formData.color }} />
                    }
                    return <Star className="h-5 w-5" />
                  })()}
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="flex-1 justify-between">
                      <span>{ICON_OPTIONS.find(i => i.value === formData.icon)?.label || '选择图标'}</span>
                      <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0" align="start">
                    <div className="p-3 border-b">
                      <Input
                        placeholder="搜索图标..."
                        value={iconSearch}
                        onChange={(e) => setIconSearch(e.target.value)}
                        className="h-8"
                      />
                    </div>
                    <div className="max-h-[300px] overflow-y-auto p-2">
                      <div className="grid grid-cols-5 gap-1">
                        {ICON_OPTIONS
                          .filter(icon => 
                            icon.label.toLowerCase().includes(iconSearch.toLowerCase()) ||
                            icon.value.toLowerCase().includes(iconSearch.toLowerCase())
                          )
                          .map((icon) => (
                            <Tooltip key={icon.value}>
                              <TooltipTrigger asChild>
                                <button
                                  type="button"
                                  onClick={() => setFormData({ ...formData, icon: icon.value })}
                                  className={`flex flex-col items-center justify-center p-2 rounded-md hover:bg-muted transition-colors ${
                                    formData.icon === icon.value ? 'bg-primary/10 ring-1 ring-primary' : ''
                                  }`}
                                >
                                  <icon.icon className="h-5 w-5" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="text-xs">
                                {icon.label}
                              </TooltipContent>
                            </Tooltip>
                          ))}
                      </div>
                      {ICON_OPTIONS.filter(icon => 
                        icon.label.toLowerCase().includes(iconSearch.toLowerCase()) ||
                        icon.value.toLowerCase().includes(iconSearch.toLowerCase())
                      ).length === 0 && (
                        <div className="text-center py-4 text-muted-foreground text-sm">
                          未找到匹配的图标
                        </div>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label>颜色</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-12 h-10 p-1"
                />
                <Input
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="#6366F1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>排序</Label>
              <Input
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_default_new"
                checked={formData.is_default}
                onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                className="rounded border-gray-300"
              />
              <Label htmlFor="is_default_new">设为默认Tab</Label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_visible_new"
                checked={formData.is_visible}
                onChange={(e) => setFormData({ ...formData, is_visible: e.target.checked })}
                className="rounded border-gray-300"
              />
              <Label htmlFor="is_visible_new">在首页显示</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              创建
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
