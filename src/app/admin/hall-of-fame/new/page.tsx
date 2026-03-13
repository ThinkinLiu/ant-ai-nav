import { Metadata } from 'next'
import HallOfFameForm from '@/components/hall-of-fame/HallOfFameForm'

export const metadata: Metadata = {
  title: '新增AI名人 - 管理后台',
}

export default function NewHallOfFamePage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">新增AI名人</h1>
        <p className="text-muted-foreground mt-2">
          添加一位为人工智能发展做出杰出贡献的人物
        </p>
      </div>

      <HallOfFameForm mode="create" />
    </div>
  )
}
