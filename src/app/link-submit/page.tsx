import { Metadata } from 'next'
import LinkSubmitClient from './client'

export const metadata: Metadata = {
  title: '申请友情链接 - 蚂蚁AI导航',
  description: '申请在蚂蚁AI导航网站添加友情链接，提交您的网站信息进行审核收录。',
}

export default function LinkSubmitPage() {
  return <LinkSubmitClient />
}
