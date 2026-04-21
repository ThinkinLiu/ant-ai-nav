'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { ToolLogoNext } from '@/components/tools/ToolLogo'
import { ExternalLink, Heart, Eye, Star } from 'lucide-react'

interface ToolFormData {
  name: string
  description: string
  longDescription: string
  website: string
  logo: string
  categoryId: string
  isFree: boolean
  pricingInfo: string
  tags: string[]
}

interface Category {
  id: number
  name: string
  color?: string
}

interface ToolPreviewProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  formData: ToolFormData
  categories: Category[]
}

export default function ToolPreview({ 
  open, 
  onOpenChange, 
  formData,
  categories 
}: ToolPreviewProps) {
  const selectedCategory = categories.find(c => c.id.toString() === formData.categoryId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>工具预览</DialogTitle>
        </DialogHeader>
        
        <div className="min-h-screen bg-muted/30 p-4 -mx-4 -mb-4">
          {/* Header */}
          <div className="bg-background rounded-lg border mb-6">
            <div className="p-4">
              <p className="text-sm text-muted-foreground">预览效果</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Tool Info */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <ToolLogoNext 
                    logo={formData.logo || null} 
                    name={formData.name || '工具名称'} 
                    website={formData.website}
                    size={64}
                    className="h-16 w-16 rounded-xl shrink-0"
                    fallbackBgColor={selectedCategory?.color || '#6366F1'}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h1 className="text-2xl font-bold">{formData.name || '工具名称'}</h1>
                    </div>
                    <p className="text-muted-foreground">{formData.description || '工具描述'}</p>
                    <div className="flex items-center gap-4 mt-4">
                      {selectedCategory ? (
                        <Badge
                          variant="outline"
                          style={{ borderColor: selectedCategory.color, color: selectedCategory.color }}
                        >
                          {selectedCategory.name}
                        </Badge>
                      ) : (
                        <Badge variant="outline">未选择分类</Badge>
                      )}
                      {formData.isFree ? (
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">免费</Badge>
                      ) : (
                        <Badge variant="secondary">付费</Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex flex-wrap gap-2 justify-end">
                  <Button 
                    className="gap-2 bg-blue-600 hover:bg-blue-700" 
                    disabled={!formData.website}
                    asChild={!!formData.website}
                  >
                    {formData.website ? (
                      <a href={formData.website} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                        访问官网
                      </a>
                    ) : (
                      <span>
                        <ExternalLink className="h-4 w-4" />
                        访问官网
                      </span>
                    )}
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Heart className="h-4 w-4" />
                    收藏
                  </Button>
                </div>

                <Separator className="my-6" />

                {/* Stats Placeholder */}
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    0 浏览
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    0 收藏
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    暂无评分
                  </span>
                </div>

                {/* Tags */}
                {formData.tags && formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {formData.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="cursor-pointer">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Long Description */}
            {formData.longDescription && (
              <Card>
                <CardHeader>
                  <CardTitle>详细介绍</CardTitle>
                </CardHeader>
                <CardContent>
                  <div 
                    className="text-muted-foreground prose prose-sm dark:prose-invert max-w-none long-description-content" 
                    dangerouslySetInnerHTML={{ __html: formData.longDescription }} 
                  />
                </CardContent>
              </Card>
            )}

            {/* Pricing Info */}
            {formData.pricingInfo && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">💰 定价信息</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{formData.pricingInfo}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
