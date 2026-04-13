'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Megaphone, X, ExternalLink } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface Announcement {
  id: number
  title: string
  content: string | null
  link_url: string | null
}

export function AnnouncementBar() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null)

  useEffect(() => {
    // 使用 AbortController 取消之前的请求
    const controller = new AbortController()
    const signal = controller.signal

    const fetchAnnouncements = async () => {
      try {
        const response = await fetch('/api/announcements', { signal })
        const data = await response.json()
        if (data.success) {
          setAnnouncements(data.data)
        }
      } catch (error: any) {
        // 如果是中止错误或请求已中止，不显示错误
        if (error?.name === 'AbortError' || signal?.aborted) return
        console.error('获取公告失败:', error)
      }
    }

    fetchAnnouncements()

    // 组件卸载时取消请求
    return () => {
      controller.abort()
    }
  }, [])

  const handleViewDetail = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement)
    setDetailOpen(true)
  }

  const handleClick = (announcement: Announcement) => {
    if (announcement.link_url) {
      // 有链接且有内容时，显示详情弹窗
      if (announcement.content) {
        handleViewDetail(announcement)
      } else {
        // 只有链接无内容，直接跳转
        window.open(announcement.link_url, '_blank')
      }
    } else if (announcement.content) {
      // 只有内容无链接，显示详情
      handleViewDetail(announcement)
    }
  }

  if (!isVisible || announcements.length === 0) {
    return null
  }

  const currentAnnouncement = announcements[currentIndex]

  return (
    <>
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white py-2 px-4">
        <div className="container mx-auto flex items-center gap-3">
          <Megaphone className="h-4 w-4 shrink-0 animate-pulse" />
          
          <div className="flex-1 overflow-hidden">
            <div 
              className="flex items-center gap-2 cursor-pointer group"
              onClick={() => handleClick(currentAnnouncement)}
            >
              <div className="whitespace-nowrap overflow-hidden">
                <span className="font-medium">{currentAnnouncement.title}</span>
                {currentAnnouncement.link_url && (
                  <ExternalLink className="inline-block ml-1 h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                )}
              </div>
              
              {/* 多条公告指示器 */}
              {announcements.length > 1 && (
                <div className="flex items-center gap-1 ml-2">
                  {announcements.map((_, index) => (
                    <span
                      key={index}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        index === currentIndex 
                          ? 'bg-white w-3' 
                          : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <button
            onClick={() => setIsVisible(false)}
            className="shrink-0 p-1 hover:bg-white/20 rounded transition-colors"
            aria-label="关闭公告"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 详情弹窗 */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-orange-500" />
              {selectedAnnouncement?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedAnnouncement && (
            <div className="space-y-4 py-4">
              {selectedAnnouncement.content && (
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {selectedAnnouncement.content}
                </p>
              )}
              {selectedAnnouncement.link_url && (
                <div className="pt-2">
                  <Link
                    href={selectedAnnouncement.link_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary hover:underline"
                    onClick={() => setDetailOpen(false)}
                  >
                    <ExternalLink className="h-4 w-4" />
                    查看详情
                  </Link>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
