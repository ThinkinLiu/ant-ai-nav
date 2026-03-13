import { Metadata } from 'next'
import TimelineForm from '@/components/timeline/TimelineForm'

export const metadata: Metadata = {
  title: '新增AI大事纪 - 管理后台',
}

export default function NewTimelinePage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">新增AI大事纪</h1>
        <p className="text-muted-foreground mt-2">
          记录AI发展史上的重要事件
        </p>
      </div>

      <TimelineForm mode="create" />
    </div>
  )
}
