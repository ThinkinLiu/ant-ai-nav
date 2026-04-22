// Banner图片配置
// 用于文章没有封面图时随机展示

export const BANNER_IMAGES = [
  '/banners/banner-1.jpg',
  '/banners/banner-2.jpg',
  '/banners/banner-3.jpg',
  '/banners/banner-4.jpg',
  '/banners/banner-5.jpg',
  '/banners/banner-6.jpg',
  '/banners/banner-7.jpg',
  '/banners/banner-8.jpg',
  '/banners/banner-9.jpg',
  '/banners/banner-10.jpg',
]

// 根据ID获取稳定的随机banner（同一文章每次刷新显示同一张banner）
export function getBannerById(id: number): string {
  const index = Math.abs(id) % BANNER_IMAGES.length
  return BANNER_IMAGES[index]
}

// 获取随机banner（每次调用返回不同banner）
export function getRandomBanner(): string {
  const index = Math.floor(Math.random() * BANNER_IMAGES.length)
  return BANNER_IMAGES[index]
}
