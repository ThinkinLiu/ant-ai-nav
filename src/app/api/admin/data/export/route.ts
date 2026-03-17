import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

// 表结构定义：包含详细的字段信息
const TABLE_SCHEMAS: Record<string, {
  columns: Array<{
    name: string
    type: string
    nullable: boolean
    default?: string
    description?: string
    primaryKey?: boolean
    foreignKey?: { table: string; column: string }
  }>
  indexes: string[]
  description: string
}> = {
  users: {
    description: '用户表',
    columns: [
      { name: 'id', type: 'VARCHAR(36)', nullable: false, primaryKey: true, description: '用户唯一标识' },
      { name: 'email', type: 'VARCHAR(255)', nullable: false, description: '邮箱地址' },
      { name: 'name', type: 'VARCHAR(128)', nullable: true, description: '用户昵称' },
      { name: 'avatar', type: 'TEXT', nullable: true, description: '头像URL' },
      { name: 'role', type: 'VARCHAR(20)', nullable: false, default: "'user'", description: '角色: user/publisher/admin' },
      { name: 'bio', type: 'TEXT', nullable: true, description: '个人简介' },
      { name: 'website', type: 'VARCHAR(500)', nullable: true, description: '个人网站' },
      { name: 'is_active', type: 'BOOLEAN', nullable: false, default: 'true', description: '是否激活' },
      { name: 'created_at', type: 'TIMESTAMP WITH TIME ZONE', nullable: false, default: 'now()', description: '创建时间' },
      { name: 'updated_at', type: 'TIMESTAMP WITH TIME ZONE', nullable: true, description: '更新时间' },
    ],
    indexes: ['idx_users_email', 'idx_users_role'],
  },
  categories: {
    description: '工具分类表',
    columns: [
      { name: 'id', type: 'SERIAL', nullable: false, primaryKey: true, description: '分类ID' },
      { name: 'name', type: 'VARCHAR(100)', nullable: false, description: '分类名称' },
      { name: 'slug', type: 'VARCHAR(100)', nullable: false, description: 'URL别名' },
      { name: 'description', type: 'TEXT', nullable: true, description: '分类描述' },
      { name: 'icon', type: 'VARCHAR(100)', nullable: true, description: '图标名称' },
      { name: 'color', type: 'VARCHAR(20)', nullable: true, description: '颜色代码' },
      { name: 'parent_id', type: 'INTEGER', nullable: true, foreignKey: { table: 'categories', column: 'id' }, description: '父分类ID' },
      { name: 'sort_order', type: 'INTEGER', nullable: true, default: '0', description: '排序顺序' },
      { name: 'is_active', type: 'BOOLEAN', nullable: false, default: 'true', description: '是否启用' },
      { name: 'created_at', type: 'TIMESTAMP WITH TIME ZONE', nullable: false, default: 'now()', description: '创建时间' },
    ],
    indexes: ['idx_categories_slug', 'idx_categories_parent'],
  },
  tags: {
    description: '标签表',
    columns: [
      { name: 'id', type: 'SERIAL', nullable: false, primaryKey: true, description: '标签ID' },
      { name: 'name', type: 'VARCHAR(50)', nullable: false, description: '标签名称' },
      { name: 'slug', type: 'VARCHAR(50)', nullable: false, description: 'URL别名' },
      { name: 'created_at', type: 'TIMESTAMP WITH TIME ZONE', nullable: false, default: 'now()', description: '创建时间' },
    ],
    indexes: ['idx_tags_slug'],
  },
  ai_tools: {
    description: 'AI工具表',
    columns: [
      { name: 'id', type: 'SERIAL', nullable: false, primaryKey: true, description: '工具ID' },
      { name: 'name', type: 'VARCHAR(200)', nullable: false, description: '工具名称' },
      { name: 'slug', type: 'VARCHAR(200)', nullable: false, description: 'URL别名' },
      { name: 'description', type: 'TEXT', nullable: false, description: '简短描述' },
      { name: 'long_description', type: 'TEXT', nullable: true, description: '详细介绍' },
      { name: 'website', type: 'VARCHAR(500)', nullable: false, description: '官网地址' },
      { name: 'logo', type: 'TEXT', nullable: true, description: 'Logo URL' },
      { name: 'screenshots', type: 'JSONB', nullable: true, description: '截图列表' },
      { name: 'category_id', type: 'INTEGER', nullable: false, foreignKey: { table: 'categories', column: 'id' }, description: '分类ID' },
      { name: 'publisher_id', type: 'VARCHAR(36)', nullable: false, foreignKey: { table: 'users', column: 'id' }, description: '发布者ID' },
      { name: 'status', type: 'VARCHAR(20)', nullable: false, default: "'pending'", description: '状态: pending/approved/rejected' },
      { name: 'is_featured', type: 'BOOLEAN', nullable: true, default: 'false', description: '是否推荐' },
      { name: 'is_pinned', type: 'BOOLEAN', nullable: true, default: 'false', description: '是否置顶' },
      { name: 'is_free', type: 'BOOLEAN', nullable: true, default: 'true', description: '是否免费' },
      { name: 'pricing_info', type: 'TEXT', nullable: true, description: '定价信息' },
      { name: 'view_count', type: 'INTEGER', nullable: true, default: '0', description: '浏览次数' },
      { name: 'favorite_count', type: 'INTEGER', nullable: true, default: '0', description: '收藏次数' },
      { name: 'reject_reason', type: 'TEXT', nullable: true, description: '拒绝原因' },
      { name: 'created_at', type: 'TIMESTAMP WITH TIME ZONE', nullable: false, default: 'now()', description: '创建时间' },
      { name: 'updated_at', type: 'TIMESTAMP WITH TIME ZONE', nullable: true, description: '更新时间' },
    ],
    indexes: ['idx_ai_tools_slug', 'idx_ai_tools_category', 'idx_ai_tools_status', 'idx_ai_tools_publisher'],
  },
  tool_tags: {
    description: '工具标签关联表',
    columns: [
      { name: 'id', type: 'SERIAL', nullable: false, primaryKey: true, description: '关联ID' },
      { name: 'tool_id', type: 'INTEGER', nullable: false, foreignKey: { table: 'ai_tools', column: 'id' }, description: '工具ID' },
      { name: 'tag_id', type: 'INTEGER', nullable: false, foreignKey: { table: 'tags', column: 'id' }, description: '标签ID' },
      { name: 'created_at', type: 'TIMESTAMP WITH TIME ZONE', nullable: false, default: 'now()', description: '创建时间' },
    ],
    indexes: ['tool_id_tag_id_unique'],
  },
  comments: {
    description: '评论表',
    columns: [
      { name: 'id', type: 'SERIAL', nullable: false, primaryKey: true, description: '评论ID' },
      { name: 'tool_id', type: 'INTEGER', nullable: false, foreignKey: { table: 'ai_tools', column: 'id' }, description: '工具ID' },
      { name: 'user_id', type: 'VARCHAR(36)', nullable: false, foreignKey: { table: 'users', column: 'id' }, description: '用户ID' },
      { name: 'content', type: 'TEXT', nullable: false, description: '评论内容' },
      { name: 'rating', type: 'INTEGER', nullable: true, description: '评分(1-5)' },
      { name: 'parent_id', type: 'INTEGER', nullable: true, foreignKey: { table: 'comments', column: 'id' }, description: '父评论ID' },
      { name: 'is_hidden', type: 'BOOLEAN', nullable: true, default: 'false', description: '是否隐藏' },
      { name: 'is_featured', type: 'BOOLEAN', nullable: true, default: 'false', description: '是否精选' },
      { name: 'created_at', type: 'TIMESTAMP WITH TIME ZONE', nullable: false, default: 'now()', description: '创建时间' },
      { name: 'updated_at', type: 'TIMESTAMP WITH TIME ZONE', nullable: true, description: '更新时间' },
    ],
    indexes: ['idx_comments_tool', 'idx_comments_user'],
  },
  favorites: {
    description: '收藏表',
    columns: [
      { name: 'id', type: 'SERIAL', nullable: false, primaryKey: true, description: '收藏ID' },
      { name: 'tool_id', type: 'INTEGER', nullable: false, foreignKey: { table: 'ai_tools', column: 'id' }, description: '工具ID' },
      { name: 'user_id', type: 'VARCHAR(36)', nullable: false, foreignKey: { table: 'users', column: 'id' }, description: '用户ID' },
      { name: 'created_at', type: 'TIMESTAMP WITH TIME ZONE', nullable: false, default: 'now()', description: '创建时间' },
    ],
    indexes: ['idx_favorites_user', 'tool_id_user_id_unique'],
  },
  ai_hall_of_fame: {
    description: 'AI名人堂表',
    columns: [
      { name: 'id', type: 'SERIAL', nullable: false, primaryKey: true, description: '人物ID' },
      { name: 'name', type: 'VARCHAR(100)', nullable: false, description: '姓名' },
      { name: 'name_en', type: 'VARCHAR(100)', nullable: true, description: '英文名' },
      { name: 'photo', type: 'TEXT', nullable: true, description: '照片URL' },
      { name: 'title', type: 'VARCHAR(200)', nullable: true, description: '头衔' },
      { name: 'summary', type: 'TEXT', nullable: false, description: '简介' },
      { name: 'bio', type: 'TEXT', nullable: true, description: '详细介绍' },
      { name: 'achievements', type: 'JSONB', nullable: true, description: '成就列表' },
      { name: 'organization', type: 'VARCHAR(200)', nullable: true, description: '所属机构' },
      { name: 'organization_url', type: 'VARCHAR(500)', nullable: true, description: '机构网址' },
      { name: 'country', type: 'VARCHAR(50)', nullable: true, description: '国家' },
      { name: 'category', type: 'VARCHAR(50)', nullable: true, description: '类别' },
      { name: 'tags', type: 'JSONB', nullable: true, description: '标签' },
      { name: 'is_featured', type: 'BOOLEAN', nullable: true, default: 'false', description: '是否推荐' },
      { name: 'view_count', type: 'INTEGER', nullable: true, default: '0', description: '浏览次数' },
      { name: 'birth_year', type: 'INTEGER', nullable: true, description: '出生年份' },
      { name: 'death_year', type: 'INTEGER', nullable: true, description: '逝世年份' },
      { name: 'created_at', type: 'TIMESTAMP WITH TIME ZONE', nullable: false, default: 'now()', description: '创建时间' },
      { name: 'updated_at', type: 'TIMESTAMP WITH TIME ZONE', nullable: true, description: '更新时间' },
    ],
    indexes: ['idx_ai_hall_of_fame_category'],
  },
  ai_timeline: {
    description: 'AI大事纪表',
    columns: [
      { name: 'id', type: 'SERIAL', nullable: false, primaryKey: true, description: '事件ID' },
      { name: 'year', type: 'INTEGER', nullable: false, description: '年份' },
      { name: 'month', type: 'INTEGER', nullable: true, description: '月份' },
      { name: 'day', type: 'INTEGER', nullable: true, description: '日期' },
      { name: 'title', type: 'VARCHAR(200)', nullable: false, description: '事件标题' },
      { name: 'title_en', type: 'VARCHAR(200)', nullable: true, description: '英文标题' },
      { name: 'description', type: 'TEXT', nullable: false, description: '事件描述' },
      { name: 'category', type: 'VARCHAR(50)', nullable: true, description: '类别' },
      { name: 'importance', type: 'VARCHAR(20)', nullable: true, default: "'normal'", description: '重要性: landmark/important/normal' },
      { name: 'icon', type: 'VARCHAR(50)', nullable: true, description: '图标' },
      { name: 'image', type: 'TEXT', nullable: true, description: '图片URL' },
      { name: 'related_person_id', type: 'INTEGER', nullable: true, foreignKey: { table: 'ai_hall_of_fame', column: 'id' }, description: '相关人物ID' },
      { name: 'related_url', type: 'VARCHAR(500)', nullable: true, description: '相关链接' },
      { name: 'tags', type: 'JSONB', nullable: true, description: '标签' },
      { name: 'view_count', type: 'INTEGER', nullable: true, default: '0', description: '浏览次数' },
      { name: 'created_at', type: 'TIMESTAMP WITH TIME ZONE', nullable: false, default: 'now()', description: '创建时间' },
    ],
    indexes: ['idx_ai_timeline_year', 'idx_ai_timeline_category'],
  },
  ai_news: {
    description: 'AI资讯表',
    columns: [
      { name: 'id', type: 'SERIAL', nullable: false, primaryKey: true, description: '资讯ID' },
      { name: 'title', type: 'VARCHAR(300)', nullable: false, description: '标题' },
      { name: 'title_en', type: 'VARCHAR(300)', nullable: true, description: '英文标题' },
      { name: 'summary', type: 'TEXT', nullable: false, description: '摘要' },
      { name: 'content', type: 'TEXT', nullable: true, description: '内容' },
      { name: 'source', type: 'VARCHAR(100)', nullable: true, description: '来源' },
      { name: 'source_url', type: 'VARCHAR(500)', nullable: true, description: '来源URL' },
      { name: 'author', type: 'VARCHAR(100)', nullable: true, description: '作者' },
      { name: 'category', type: 'VARCHAR(50)', nullable: true, description: '分类' },
      { name: 'tags', type: 'JSONB', nullable: true, description: '标签' },
      { name: 'image', type: 'TEXT', nullable: true, description: '封面图' },
      { name: 'view_count', type: 'INTEGER', nullable: true, default: '0', description: '浏览次数' },
      { name: 'is_featured', type: 'BOOLEAN', nullable: true, default: 'false', description: '是否推荐' },
      { name: 'published_at', type: 'TIMESTAMP WITH TIME ZONE', nullable: true, description: '发布时间' },
      { name: 'created_at', type: 'TIMESTAMP WITH TIME ZONE', nullable: false, default: 'now()', description: '创建时间' },
      { name: 'updated_at', type: 'TIMESTAMP WITH TIME ZONE', nullable: true, description: '更新时间' },
    ],
    indexes: ['idx_ai_news_category', 'idx_ai_news_published'],
  },
  publisher_applications: {
    description: '发布者申请表',
    columns: [
      { name: 'id', type: 'SERIAL', nullable: false, primaryKey: true, description: '申请ID' },
      { name: 'user_id', type: 'VARCHAR(36)', nullable: false, foreignKey: { table: 'users', column: 'id' }, description: '用户ID' },
      { name: 'reason', type: 'TEXT', nullable: false, description: '申请理由' },
      { name: 'contact', type: 'VARCHAR(100)', nullable: true, description: '联系方式' },
      { name: 'website', type: 'VARCHAR(500)', nullable: true, description: '个人网站' },
      { name: 'status', type: 'VARCHAR(20)', nullable: false, default: "'pending'", description: '状态: pending/approved/rejected' },
      { name: 'reviewed_by', type: 'VARCHAR(36)', nullable: true, foreignKey: { table: 'users', column: 'id' }, description: '审核人ID' },
      { name: 'reviewed_at', type: 'TIMESTAMP WITH TIME ZONE', nullable: true, description: '审核时间' },
      { name: 'review_note', type: 'TEXT', nullable: true, description: '审核备注' },
      { name: 'created_at', type: 'TIMESTAMP WITH TIME ZONE', nullable: false, default: 'now()', description: '创建时间' },
      { name: 'updated_at', type: 'TIMESTAMP WITH TIME ZONE', nullable: true, description: '更新时间' },
    ],
    indexes: ['idx_publisher_applications_user', 'idx_publisher_applications_status'],
  },
  ai_tool_rankings: {
    description: 'AI工具排行榜表',
    columns: [
      { name: 'id', type: 'VARCHAR(36)', nullable: false, primaryKey: true, description: '排名ID' },
      { name: 'tool_id', type: 'INTEGER', nullable: false, foreignKey: { table: 'ai_tools', column: 'id' }, description: '工具ID' },
      { name: 'rank', type: 'INTEGER', nullable: false, description: '排名' },
      { name: 'previous_rank', type: 'INTEGER', nullable: true, description: '上次排名' },
      { name: 'monthly_visits', type: 'BIGINT', nullable: true, description: '月访问量' },
      { name: 'monthly_visits_change', type: 'DECIMAL(10,2)', nullable: true, description: '访问量变化' },
      { name: 'category_rank', type: 'INTEGER', nullable: true, description: '分类排名' },
      { name: 'category_id', type: 'INTEGER', nullable: true, foreignKey: { table: 'categories', column: 'id' }, description: '分类ID' },
      { name: 'ranking_date', type: 'DATE', nullable: false, description: '排名日期' },
      { name: 'created_at', type: 'TIMESTAMP WITH TIME ZONE', nullable: false, default: 'now()', description: '创建时间' },
      { name: 'updated_at', type: 'TIMESTAMP WITH TIME ZONE', nullable: true, description: '更新时间' },
    ],
    indexes: ['idx_ai_tool_rankings_date', 'idx_ai_tool_rankings_tool'],
  },
  ranking_update_log: {
    description: '排行榜更新日志表',
    columns: [
      { name: 'id', type: 'VARCHAR(36)', nullable: false, primaryKey: true, description: '日志ID' },
      { name: 'update_date', type: 'DATE', nullable: false, description: '更新日期' },
      { name: 'status', type: 'VARCHAR(20)', nullable: false, default: "'pending'", description: '状态: pending/completed/failed' },
      { name: 'created_at', type: 'TIMESTAMP WITH TIME ZONE', nullable: false, default: 'now()', description: '创建时间' },
      { name: 'completed_at', type: 'TIMESTAMP WITH TIME ZONE', nullable: true, description: '完成时间' },
    ],
    indexes: ['update_date_unique'],
  },
  seo_settings: {
    description: 'SEO设置表',
    columns: [
      { name: 'id', type: 'SERIAL', nullable: false, primaryKey: true, description: '设置ID' },
      { name: 'site_name', type: 'VARCHAR(100)', nullable: false, description: '站点名称' },
      { name: 'site_description', type: 'TEXT', nullable: true, description: '站点描述' },
      { name: 'site_keywords', type: 'TEXT', nullable: true, description: '站点关键词' },
      { name: 'site_url', type: 'VARCHAR(500)', nullable: true, description: '站点URL' },
      { name: 'og_title', type: 'VARCHAR(200)', nullable: true, description: 'OG标题' },
      { name: 'og_description', type: 'TEXT', nullable: true, description: 'OG描述' },
      { name: 'og_image', type: 'TEXT', nullable: true, description: 'OG图片' },
      { name: 'og_type', type: 'VARCHAR(50)', nullable: true, default: "'website'", description: 'OG类型' },
      { name: 'twitter_card', type: 'VARCHAR(50)', nullable: true, default: "'summary_large_image'", description: 'Twitter卡片类型' },
      { name: 'twitter_site', type: 'VARCHAR(100)', nullable: true, description: 'Twitter账号' },
      { name: 'twitter_creator', type: 'VARCHAR(100)', nullable: true, description: 'Twitter创建者' },
      { name: 'structured_data', type: 'JSONB', nullable: true, description: '结构化数据' },
      { name: 'robots_txt', type: 'TEXT', nullable: true, description: 'Robots.txt内容' },
      { name: 'google_site_verification', type: 'VARCHAR(100)', nullable: true, description: 'Google验证码' },
      { name: 'baidu_site_verification', type: 'VARCHAR(100)', nullable: true, description: '百度验证码' },
      { name: 'google_analytics_id', type: 'VARCHAR(50)', nullable: true, description: 'GA ID' },
      { name: 'baidu_analytics_id', type: 'VARCHAR(50)', nullable: true, description: '百度统计ID' },
      { name: 'la_analytics_id', type: 'VARCHAR(50)', nullable: true, description: 'LA统计ID' },
      { name: 'custom_head_scripts', type: 'TEXT', nullable: true, description: '自定义Head脚本' },
      { name: 'custom_body_scripts', type: 'TEXT', nullable: true, description: '自定义Body脚本' },
      { name: 'created_at', type: 'TIMESTAMP WITH TIME ZONE', nullable: false, default: 'now()', description: '创建时间' },
      { name: 'updated_at', type: 'TIMESTAMP WITH TIME ZONE', nullable: true, description: '更新时间' },
    ],
    indexes: [],
  },
  site_settings: {
    description: '网站功能设置表',
    columns: [
      { name: 'id', type: 'SERIAL', nullable: false, primaryKey: true, description: '设置ID' },
      { name: 'ranking_enabled', type: 'BOOLEAN', nullable: true, default: 'true', description: '是否启用排行榜' },
      { name: 'ranking_title', type: 'VARCHAR(100)', nullable: true, description: '排行榜标题' },
      { name: 'ranking_description', type: 'TEXT', nullable: true, description: '排行榜描述' },
      { name: 'comments_enabled', type: 'BOOLEAN', nullable: true, default: 'true', description: '是否启用评论' },
      { name: 'favorites_enabled', type: 'BOOLEAN', nullable: true, default: 'true', description: '是否启用收藏' },
      { name: 'created_at', type: 'TIMESTAMP WITH TIME ZONE', nullable: false, default: 'now()', description: '创建时间' },
      { name: 'updated_at', type: 'TIMESTAMP WITH TIME ZONE', nullable: true, description: '更新时间' },
    ],
    indexes: [],
  },
  traffic_data_sources: {
    description: '流量数据源配置表',
    columns: [
      { name: 'id', type: 'SERIAL', nullable: false, primaryKey: true, description: '数据源ID' },
      { name: 'name', type: 'VARCHAR(50)', nullable: false, description: '数据源名称' },
      { name: 'display_name', type: 'VARCHAR(100)', nullable: false, description: '显示名称' },
      { name: 'api_key', type: 'TEXT', nullable: true, description: 'API密钥' },
      { name: 'api_endpoint', type: 'VARCHAR(500)', nullable: true, description: 'API端点' },
      { name: 'is_active', type: 'BOOLEAN', nullable: true, default: 'false', description: '是否启用' },
      { name: 'priority', type: 'INTEGER', nullable: true, default: '0', description: '优先级' },
      { name: 'config', type: 'JSONB', nullable: true, description: '配置信息' },
      { name: 'last_sync_at', type: 'TIMESTAMP WITH TIME ZONE', nullable: true, description: '最后同步时间' },
      { name: 'sync_status', type: 'VARCHAR(20)', nullable: true, description: '同步状态' },
      { name: 'sync_error', type: 'TEXT', nullable: true, description: '同步错误' },
      { name: 'created_at', type: 'TIMESTAMP WITH TIME ZONE', nullable: false, default: 'now()', description: '创建时间' },
      { name: 'updated_at', type: 'TIMESTAMP WITH TIME ZONE', nullable: true, description: '更新时间' },
    ],
    indexes: ['name_unique'],
  },
  friend_links: {
    description: '友情链接表',
    columns: [
      { name: 'id', type: 'SERIAL', nullable: false, primaryKey: true, description: '链接ID' },
      { name: 'name', type: 'VARCHAR(100)', nullable: false, description: '网站名称' },
      { name: 'url', type: 'VARCHAR(500)', nullable: false, description: '网站地址' },
      { name: 'logo', type: 'TEXT', nullable: true, description: 'Logo URL' },
      { name: 'description', type: 'TEXT', nullable: true, description: '网站描述' },
      { name: 'sort_order', type: 'INTEGER', nullable: true, default: '0', description: '排序顺序' },
      { name: 'is_active', type: 'BOOLEAN', nullable: true, default: 'true', description: '是否启用' },
      { name: 'created_at', type: 'TIMESTAMP WITH TIME ZONE', nullable: false, default: 'now()', description: '创建时间' },
    ],
    indexes: [],
  },
}

// 表定义：包含表名、排序字段、分类、描述
const TABLE_DEFINITIONS = [
  // 内容数据
  { name: 'ai_tools', order: 'id', category: 'content', label: 'AI工具库', description: '工具基本信息' },
  { name: 'ai_news', order: 'id', category: 'content', label: 'AI资讯', description: '资讯文章' },
  { name: 'ai_hall_of_fame', order: 'id', category: 'content', label: 'AI名人堂', description: '人物信息' },
  { name: 'ai_timeline', order: 'id', category: 'content', label: 'AI大事纪', description: '历史事件' },
  
  // 分类标签
  { name: 'categories', order: 'id', category: 'taxonomy', label: '工具分类', description: '工具分类目录' },
  { name: 'tags', order: 'id', category: 'taxonomy', label: '标签', description: '标签列表' },
  { name: 'tool_tags', order: 'tool_id', category: 'taxonomy', label: '工具标签关联', description: '工具与标签的关联' },
  
  // 排名数据
  { name: 'ai_tool_rankings', order: 'id', category: 'ranking', label: '工具排名', description: '工具排名数据' },
  { name: 'ranking_update_log', order: 'id', category: 'ranking', label: '排名更新日志', description: '排名更新记录' },
  { name: 'traffic_data_sources', order: 'id', category: 'ranking', label: '流量数据源', description: '排行榜配置' },
  
  // 互动数据
  { name: 'comments', order: 'id', category: 'interaction', label: '评论', description: '用户评论' },
  { name: 'favorites', order: 'id', category: 'interaction', label: '收藏', description: '用户收藏' },
  
  // 友情链接
  { name: 'friend_links', order: 'sort_order', category: 'link', label: '友情链接', description: '友情链接' },
  
  // 系统设置
  { name: 'site_settings', order: 'id', category: 'system', label: '站点设置', description: '网站基本设置' },
  { name: 'smtp_settings', order: 'id', category: 'system', label: 'SMTP设置', description: '邮件服务配置' },
  { name: 'seo_settings', order: 'id', category: 'system', label: 'SEO设置', description: 'SEO配置' },
  
  // 用户数据
  { name: 'users', order: 'id', category: 'user', label: '用户', description: '用户账号信息' },
  { name: 'email_verification_codes', order: 'id', category: 'user', label: '验证码', description: '邮箱验证码' },
  { name: 'publisher_applications', order: 'id', category: 'user', label: '发布者申请', description: '发布者申请记录' },
]

// 导出模式对应的表
const EXPORT_MODES = {
  // 全部导出
  full: TABLE_DEFINITIONS.map(t => t.name),
  // 仅业务数据（不含用户信息）
  business: TABLE_DEFINITIONS.filter(t => t.category !== 'user').map(t => t.name),
  // 仅内容和设置
  content: ['ai_tools', 'ai_news', 'ai_hall_of_fame', 'ai_timeline', 'categories', 'tags', 'tool_tags'],
  // 仅设置
  settings: ['site_settings', 'smtp_settings', 'seo_settings', 'friend_links'],
}

// 获取表定义列表 - GET请求
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')

  // 返回表定义列表（用于前端选择）
  if (action === 'tables') {
    // 获取每个表的数据量
    const client = getSupabaseClient()
    const tablesWithCount = await Promise.all(
      TABLE_DEFINITIONS.map(async (table) => {
        const { count, error } = await client
          .from(table.name)
          .select('*', { count: 'exact', head: true })
        
        return {
          ...table,
          count: error ? 0 : (count || 0),
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: tablesWithCount,
      categories: [
        { id: 'content', label: '内容数据', description: 'AI工具、资讯、名人堂等核心内容' },
        { id: 'taxonomy', label: '分类标签', description: '分类和标签体系' },
        { id: 'ranking', label: '排名数据', description: '工具排名相关数据' },
        { id: 'interaction', label: '互动数据', description: '评论和收藏' },
        { id: 'link', label: '友情链接', description: '友情链接数据' },
        { id: 'system', label: '系统设置', description: '站点和系统配置' },
        { id: 'user', label: '用户数据', description: '用户账号相关信息' },
      ],
    })
  }

  // 导出表结构（JSON格式）
  if (action === 'schema') {
    const tables = searchParams.get('tables')
    const selectedTables = tables ? tables.split(',').filter(t => TABLE_SCHEMAS[t]) : Object.keys(TABLE_SCHEMAS)
    
    const schemaData: Record<string, typeof TABLE_SCHEMAS[string]> = {}
    selectedTables.forEach(tableName => {
      if (TABLE_SCHEMAS[tableName]) {
        schemaData[tableName] = TABLE_SCHEMAS[tableName]
      }
    })

    return NextResponse.json({
      success: true,
      data: schemaData,
      _meta: {
        exportedAt: new Date().toISOString(),
        totalTables: Object.keys(schemaData).length,
      },
    })
  }

  // 导出表结构（SQL格式）
  if (action === 'schema-sql') {
    const tables = searchParams.get('tables')
    const selectedTables = tables ? tables.split(',').filter(t => TABLE_SCHEMAS[t]) : Object.keys(TABLE_SCHEMAS)
    
    let sqlContent = `-- ============================================
-- 蚂蚁AI导航 数据库结构
-- 生成时间: ${new Date().toISOString()}
-- 数据库类型: PostgreSQL (Supabase)
-- ============================================\n\n`

    // 启用必要的扩展
    sqlContent += `-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";\n\n`

    // 生成每个表的 SQL
    selectedTables.forEach(tableName => {
      const schema = TABLE_SCHEMAS[tableName]
      if (!schema) return

      sqlContent += `-- ============================================
-- ${schema.description}
-- ============================================
CREATE TABLE IF NOT EXISTS ${tableName} (\n`

      // 生成列定义
      const columnDefs = schema.columns.map(col => {
        let def = `    ${col.name} ${col.type}`
        if (col.primaryKey) def += ' PRIMARY KEY'
        if (!col.nullable && !col.primaryKey) def += ' NOT NULL'
        if (col.default) def += ` DEFAULT ${col.default}`
        return def
      })
      sqlContent += columnDefs.join(',\n')
      sqlContent += '\n);\n\n'

      // 生成索引
      if (schema.indexes.length > 0) {
        schema.indexes.forEach(idx => {
          if (idx.endsWith('_unique')) {
            const col = idx.replace('_unique', '').replace(/_/g, '_')
            sqlContent += `CREATE UNIQUE INDEX IF NOT EXISTS ${idx} ON ${tableName}(${col});\n`
          } else {
            sqlContent += `CREATE INDEX IF NOT EXISTS ${idx} ON ${tableName}(${idx.replace('idx_' + tableName + '_', '')});\n`
          }
        })
        sqlContent += '\n'
      }
    })

    // 添加触发器函数
    sqlContent += `-- ============================================
-- 触发器：自动更新 updated_at 字段
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';\n\n`

    // 为有 updated_at 字段的表创建触发器
    selectedTables.forEach(tableName => {
      const schema = TABLE_SCHEMAS[tableName]
      if (schema && schema.columns.some(c => c.name === 'updated_at')) {
        sqlContent += `CREATE TRIGGER update_${tableName}_updated_at BEFORE UPDATE ON ${tableName}
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();\n\n`
      }
    })

    const dateStr = new Date().toISOString().split('T')[0]
    const filename = `ai-nav-schema-${dateStr}.sql`

    return new NextResponse(sqlContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  }

  return NextResponse.json(
    { success: false, error: '无效的操作' },
    { status: 400 }
  )
}

// 导出数据 - POST请求
export async function POST(request: NextRequest) {
  try {
    // 验证权限
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { mode = 'business', tables = [] } = body

    // 确定要导出的表
    let tablesToExport: string[] = []
    
    if (mode === 'custom' && tables.length > 0) {
      // 自定义模式：使用用户选择的表
      tablesToExport = tables
    } else if (EXPORT_MODES[mode as keyof typeof EXPORT_MODES]) {
      // 预设模式
      tablesToExport = EXPORT_MODES[mode as keyof typeof EXPORT_MODES]
    } else {
      return NextResponse.json(
        { success: false, error: '无效的导出模式' },
        { status: 400 }
      )
    }

    const client = getSupabaseClient()
    const exportData: Record<string, any[]> = {}
    const summary: Record<string, number> = {}

    // 获取表定义映射
    const tableMap = new Map(TABLE_DEFINITIONS.map(t => [t.name, t]))

    // 导出每个表的数据
    for (const tableName of tablesToExport) {
      const tableDef = tableMap.get(tableName)
      const orderField = tableDef?.order || 'id'

      const { data, error } = await client
        .from(tableName)
        .select('*')
        .order(orderField, { ascending: true })

      if (error) {
        console.error(`导出表 ${tableName} 失败:`, error)
        exportData[tableName] = []
        summary[tableName] = 0
      } else {
        exportData[tableName] = data || []
        summary[tableName] = data?.length || 0
      }
    }

    // 添加导出元信息
    const result = {
      _meta: {
        exportedAt: new Date().toISOString(),
        version: '1.0',
        mode,
        summary,
        totalRecords: Object.values(summary).reduce((a, b) => a + b, 0),
      },
      data: exportData,
    }

    // 生成文件名
    const modeNames: Record<string, string> = {
      full: '全部数据',
      business: '业务数据',
      content: '内容数据',
      settings: '设置数据',
      custom: '自定义',
    }
    const modeName = modeNames[mode] || '数据'
    const dateStr = new Date().toISOString().split('T')[0]
    const filename = `ai-nav-${modeName}-${dateStr}.json`

    // 返回JSON文件下载
    return new NextResponse(JSON.stringify(result, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
      },
    })
  } catch (error) {
    console.error('数据导出错误:', error)
    return NextResponse.json(
      { success: false, error: '导出失败，请稍后重试' },
      { status: 500 }
    )
  }
}
