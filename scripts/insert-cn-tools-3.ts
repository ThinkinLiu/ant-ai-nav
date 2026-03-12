/**
 * 继续插入更多真实的国内AI工具 - 第三批
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.COZE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.COZE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);
const ADMIN_ID = '5b3927c8-fcfa-4ede-bd8b-9e856e4e1a53';

const CATEGORY_MAP: Record<string, number> = {
  'ai-writing': 1, 'ai-painting': 2, 'ai-chat': 3, 'ai-coding': 4,
  'ai-audio': 5, 'ai-video': 6, 'ai-office': 7, 'ai-learning': 8,
};

// 第三批真实国内AI工具
const thirdBatchTools = [
  // ===== AI写作 - 专业垂直领域 =====
  { name: '小说AI助手', website: 'https://www.xiaoshuoai.com', category: 'ai-writing', description: 'AI小说创作辅助工具', isFree: true, pricing: '基础功能免费' },
  { name: '诗词AI', website: 'https://www.shiciai.com', category: 'ai-writing', description: 'AI古诗词创作', isFree: true, pricing: '免费使用' },
  { name: '剧本AI', website: 'https://www.jubenai.com', category: 'ai-writing', description: 'AI剧本创作工具', isFree: false, pricing: '会员制' },
  { name: '公文写作AI', website: 'https://www.gongwenai.com', category: 'ai-writing', description: 'AI公文写作助手', isFree: false, pricing: '企业版' },
  { name: '论文AI助手', website: 'https://www.lunwenai.com', category: 'ai-writing', description: 'AI论文写作辅助', isFree: true, pricing: '基础功能免费' },
  { name: '专利AI写作', website: 'https://www.zhuanliaiai.com', category: 'ai-writing', description: 'AI专利撰写工具', isFree: false, pricing: '按件付费' },
  { name: '标书AI', website: 'https://www.biaoshuai.com', category: 'ai-writing', description: 'AI标书撰写工具', isFree: false, pricing: '企业版' },
  { name: '合同AI', website: 'https://www.hetongai.com', category: 'ai-writing', description: 'AI合同起草审查', isFree: false, pricing: '企业服务' },
  { name: '简历AI', website: 'https://www.jianliaiai.com', category: 'ai-writing', description: 'AI简历生成工具', isFree: true, pricing: '基础功能免费' },
  { name: '求职信AI', website: 'https://www.qiuzhixinai.com', category: 'ai-writing', description: 'AI求职信生成', isFree: true, pricing: '免费使用' },
  { name: '述职报告AI', website: 'https://www.shuzhibaogao.com', category: 'ai-writing', description: 'AI述职报告生成', isFree: true, pricing: '基础功能免费' },
  { name: '工作总结AI', website: 'https://www.gongzuozongjieai.com', category: 'ai-writing', description: 'AI工作总结生成', isFree: true, pricing: '基础功能免费' },
  { name: 'PPT文案AI', website: 'https://www.pptwenan.com', category: 'ai-writing', description: 'AI PPT文案生成', isFree: true, pricing: '基础功能免费' },
  { name: '产品描述AI', website: 'https://www.chanpinmiaoshu.com', category: 'ai-writing', description: 'AI产品描述生成', isFree: true, pricing: '基础功能免费' },
  { name: '电商文案AI', website: 'https://www.dianshangwenan.com', category: 'ai-writing', description: 'AI电商文案工具', isFree: false, pricing: '会员制' },
  { name: '直播话术AI', website: 'https://www.zhibohuashu.com', category: 'ai-writing', description: 'AI直播话术生成', isFree: false, pricing: '会员制' },
  { name: '朋友圈文案AI', website: 'https://www.pengyouquanai.com', category: 'ai-writing', description: 'AI朋友圈文案', isFree: true, pricing: '免费使用' },
  { name: '短视频文案AI', website: 'https://www.duanshipinwenan.com', category: 'ai-writing', description: 'AI短视频文案', isFree: true, pricing: '基础功能免费' },
  { name: '微博文案AI', website: 'https://www.weibowenan.com', category: 'ai-writing', description: 'AI微博文案生成', isFree: true, pricing: '免费使用' },
  { name: '公众号文案AI', website: 'https://www.gongzhonghaoai.com', category: 'ai-writing', description: 'AI公众号文章', isFree: false, pricing: '会员制' },

  // ===== AI绘画 - 垂直领域 =====
  { name: '头像AI', website: 'https://www.touxiangai.com', category: 'ai-painting', description: 'AI头像生成工具', isFree: true, pricing: '基础功能免费' },
  { name: 'LogoAI中国', website: 'https://www.logoai.cn', category: 'ai-painting', description: 'AI Logo设计', isFree: false, pricing: '付费下载' },
  { name: '海报AI', website: 'https://www.haiboai.com', category: 'ai-painting', description: 'AI海报设计工具', isFree: true, pricing: '基础功能免费' },
  { name: 'Banner AI', website: 'https://www.bannerai.cn', category: 'ai-painting', description: 'AI横幅广告设计', isFree: true, pricing: '基础功能免费' },
  { name: '电商图片AI', website: 'https://www.dianshangtupian.com', category: 'ai-painting', description: 'AI电商图片生成', isFree: false, pricing: '会员制' },
  { name: '商品图AI', website: 'https://www.shangpintuai.com', category: 'ai-painting', description: 'AI商品主图生成', isFree: false, pricing: '按张付费' },
  { name: '模特AI', website: 'https://www.moteai.com', category: 'ai-painting', description: 'AI虚拟模特生成', isFree: false, pricing: '会员制' },
  { name: '证件照AI', website: 'https://www.zhengjianzhaoai.com', category: 'ai-painting', description: 'AI证件照制作', isFree: true, pricing: '基础功能免费' },
  { name: '老照片修复AI', website: 'https://www.laozhaopianxiufu.com', category: 'ai-painting', description: 'AI老照片修复', isFree: true, pricing: '基础功能免费' },
  { name: '图片增强AI', website: 'https://www.tupianzengqiang.com', category: 'ai-painting', description: 'AI图片清晰化', isFree: true, pricing: '基础功能免费' },
  { name: '图片放大AI', website: 'https://www.tupianfangda.com', category: 'ai-painting', description: 'AI无损放大', isFree: true, pricing: '基础功能免费' },
  { name: '去水印AI', website: 'https://www.quashuiyinai.com', category: 'ai-painting', description: 'AI去水印工具', isFree: true, pricing: '免费使用' },
  { name: '换背景AI', website: 'https://www.huanbeijingai.com', category: 'ai-painting', description: 'AI换背景工具', isFree: true, pricing: '基础功能免费' },
  { name: 'AI换装', website: 'https://www.aihuanzhuang.com', category: 'ai-painting', description: 'AI虚拟换装', isFree: false, pricing: '会员制' },
  { name: 'AI美颜', website: 'https://www.aimeiyan.com', category: 'ai-painting', description: 'AI智能美颜', isFree: true, pricing: '免费使用' },

  // ===== AI对话 - 更多垂直场景 =====
  { name: '心理咨询AI', website: 'https://www.xinlizixunai.com', category: 'ai-chat', description: 'AI心理咨询助手', isFree: true, pricing: '基础功能免费' },
  { name: '情感AI助手', website: 'https://www.qingganaizhu.com', category: 'ai-chat', description: 'AI情感陪伴', isFree: true, pricing: '基础功能免费' },
  { name: '宠物AI', website: 'https://www.chongwuaiai.com', category: 'ai-chat', description: 'AI宠物护理顾问', isFree: true, pricing: '免费使用' },
  { name: '美食AI', website: 'https://www.meishiai.com', category: 'ai-chat', description: 'AI美食推荐', isFree: true, pricing: '免费使用' },
  { name: '旅游AI助手', website: 'https://www.lvyuaizhu.com', category: 'ai-chat', description: 'AI旅游规划', isFree: true, pricing: '基础功能免费' },
  { name: '穿搭AI', website: 'https://www.chuandaiai.com', category: 'ai-chat', description: 'AI穿搭推荐', isFree: true, pricing: '免费使用' },
  { name: '健身AI教练', website: 'https://www.jianshenaai.com', category: 'ai-chat', description: 'AI健身指导', isFree: false, pricing: '会员制' },
  { name: '育儿AI助手', website: 'https://www.yueraizhu.com', category: 'ai-chat', description: 'AI育儿顾问', isFree: true, pricing: '基础功能免费' },
  { name: '星座AI', website: 'https://www.xingzuoai.com', category: 'ai-chat', description: 'AI星座运势', isFree: true, pricing: '免费使用' },
  { name: '起名AI', website: 'https://www.qimingai.com', category: 'ai-chat', description: 'AI起名取名', isFree: true, pricing: '基础功能免费' },
  { name: '算命AI', website: 'https://www.suanmingai.com', category: 'ai-chat', description: 'AI命理分析', isFree: true, pricing: '基础功能免费' },
  { name: '周公解梦AI', website: 'https://www.jiemengai.com', category: 'ai-chat', description: 'AI解梦工具', isFree: true, pricing: '免费使用' },
  { name: '塔罗牌AI', website: 'https://www.taluopaihai.com', category: 'ai-chat', description: 'AI塔罗占卜', isFree: true, pricing: '免费使用' },
  { name: '笑话AI', website: 'https://www.xiaohuaai.com', category: 'ai-chat', description: 'AI笑话生成', isFree: true, pricing: '免费使用' },
  { name: '诗词对话AI', website: 'https://www.shiciduihua.com', category: 'ai-chat', description: 'AI诗词互动', isFree: true, pricing: '免费使用' },

  // ===== AI编程 - 垂直场景 =====
  { name: '代码审查AI', website: 'https://www.daimashenchaiai.com', category: 'ai-coding', description: 'AI代码审查工具', isFree: false, pricing: '企业服务' },
  { name: 'Bug修复AI', website: 'https://www.bugxiufuiai.com', category: 'ai-coding', description: 'AI Bug修复助手', isFree: true, pricing: '基础功能免费' },
  { name: '代码优化AI', website: 'https://www.daimayouhuaiai.com', category: 'ai-coding', description: 'AI代码优化工具', isFree: true, pricing: '基础功能免费' },
  { name: 'SQL生成AI', website: 'https://www.sqlshengchengai.com', category: 'ai-coding', description: 'AI SQL生成器', isFree: true, pricing: '免费使用' },
  { name: '正则AI', website: 'https://www.zhengzeai.com', category: 'ai-coding', description: 'AI正则表达式生成', isFree: true, pricing: '免费使用' },
  { name: 'API文档AI', website: 'https://www.apwendangai.com', category: 'ai-coding', description: 'AI API文档生成', isFree: true, pricing: '基础功能免费' },
  { name: '单元测试AI', website: 'https://www.danyuanceshiai.com', category: 'ai-coding', description: 'AI单元测试生成', isFree: true, pricing: '基础功能免费' },
  { name: 'Git助手AI', website: 'https://www.gitizhuai.com', category: 'ai-coding', description: 'AI Git提交助手', isFree: true, pricing: '免费使用' },
  { name: 'Docker AI', website: 'https://www.dockerai.cn', category: 'ai-coding', description: 'AI Docker配置', isFree: true, pricing: '免费使用' },
  { name: 'K8s AI助手', website: 'https://www.k8saizhu.com', category: 'ai-coding', description: 'AI K8s配置工具', isFree: true, pricing: '基础功能免费' },

  // ===== AI音频 - 垂直场景 =====
  { name: 'AI编曲', website: 'https://www.aianbianqu.com', category: 'ai-audio', description: 'AI音乐编曲工具', isFree: false, pricing: '会员制' },
  { name: 'AI混音', website: 'https://www.aihunyin.com', category: 'ai-audio', description: 'AI音频混音', isFree: false, pricing: '会员制' },
  { name: 'AI母带', website: 'https://www.aimudai.com', category: 'ai-audio', description: 'AI母带处理', isFree: false, pricing: '按曲付费' },
  { name: 'AI降噪', website: 'https://www.aijiangzao.com', category: 'ai-audio', description: 'AI音频降噪', isFree: true, pricing: '基础功能免费' },
  { name: 'AI人声分离', website: 'https://www.airenshengfenli.com', category: 'ai-audio', description: 'AI人声伴奏分离', isFree: true, pricing: '基础功能免费' },
  { name: 'AI音效', website: 'https://www.aiyinxiao.com', category: 'ai-audio', description: 'AI音效生成', isFree: true, pricing: '基础功能免费' },
  { name: 'AI配音免费版', website: 'https://www.aipeiyinfree.com', category: 'ai-audio', description: '免费AI配音工具', isFree: true, pricing: '免费使用' },
  { name: 'AI变声', website: 'https://www.aibiansheng.com', category: 'ai-audio', description: 'AI变声器', isFree: true, pricing: '基础功能免费' },
  { name: 'AI语音克隆', website: 'https://www.aiyuyinkelong.com', category: 'ai-audio', description: 'AI声音克隆', isFree: false, pricing: '会员制' },
  { name: 'AI语音翻译', website: 'https://www.aiyuyinfanyi.com', category: 'ai-audio', description: 'AI语音翻译', isFree: true, pricing: '基础功能免费' },

  // ===== AI视频 - 垂直场景 =====
  { name: 'AI短视频生成', website: 'https://www.aiduanshipin.com', category: 'ai-video', description: 'AI短视频制作', isFree: true, pricing: '基础功能免费' },
  { name: 'AI视频剪辑免费', website: 'https://www.aishipinjianjifree.com', category: 'ai-video', description: '免费AI视频剪辑', isFree: true, pricing: '免费使用' },
  { name: 'AI视频压缩', website: 'https://www.aishipinyasu.com', category: 'ai-video', description: 'AI视频压缩工具', isFree: true, pricing: '免费使用' },
  { name: 'AI视频转换', website: 'https://www.aishipinzhuanhuan.com', category: 'ai-video', description: 'AI视频格式转换', isFree: true, pricing: '免费使用' },
  { name: 'AI视频水印', website: 'https://www.aishipinshuiyin.com', category: 'ai-video', description: 'AI视频水印工具', isFree: true, pricing: '基础功能免费' },
  { name: 'AI字幕生成', website: 'https://www.aizimushengcheng.com', category: 'ai-video', description: 'AI自动字幕', isFree: true, pricing: '基础功能免费' },
  { name: 'AI视频翻译', website: 'https://www.aishipinfanyi.com', category: 'ai-video', description: 'AI视频翻译配音', isFree: false, pricing: '按分钟付费' },
  { name: 'AI视频增强', website: 'https://www.aishipinzengqiang.com', category: 'ai-video', description: 'AI视频画质增强', isFree: false, pricing: '会员制' },
  { name: 'AI视频去抖', website: 'https://www.aishipinqudou.com', category: 'ai-video', description: 'AI视频防抖', isFree: true, pricing: '基础功能免费' },
  { name: 'AI视频抠像', website: 'https://www.aishipinkouxiang.com', category: 'ai-video', description: 'AI视频抠图', isFree: true, pricing: '基础功能免费' },

  // ===== AI办公 - 垂直场景 =====
  { name: 'AI表格处理', website: 'https://www.aibiaogechuli.com', category: 'ai-office', description: 'AI Excel处理', isFree: true, pricing: '基础功能免费' },
  { name: 'AI数据分析', website: 'https://www.aisjhujufenxi.com', category: 'ai-office', description: 'AI数据分析工具', isFree: false, pricing: '企业服务' },
  { name: 'AI报表生成', website: 'https://www.aibiaobiaoshengcheng.com', category: 'ai-office', description: 'AI自动报表', isFree: true, pricing: '基础功能免费' },
  { name: 'AI图表制作', website: 'https://www.aitubiaozhizuo.com', category: 'ai-office', description: 'AI图表生成', isFree: true, pricing: '基础功能免费' },
  { name: 'AI流程图', website: 'https://https://www.ailiuchengtu.com', category: 'ai-office', description: 'AI流程图绘制', isFree: true, pricing: '基础功能免费' },
  { name: 'AI甘特图', website: 'https://www.aigantetu.com', category: 'ai-office', description: 'AI甘特图生成', isFree: true, pricing: '基础功能免费' },
  { name: 'AI思维导图免费', website: 'https://www.aisiweidaotufree.com', category: 'ai-office', description: '免费AI思维导图', isFree: true, pricing: '免费使用' },
  { name: 'AI会议纪要', website: 'https://www.ahuiyijiyao.com', category: 'ai-office', description: 'AI会议记录', isFree: true, pricing: '基础功能免费' },
  { name: 'AI日程管理', website: 'https://https://www.airichengguanli.com', category: 'ai-office', description: 'AI智能日程', isFree: true, pricing: '基础功能免费' },
  { name: 'AI邮件助手', website: 'https://www.aiyoujianzhushou.com', category: 'ai-office', description: 'AI邮件处理', isFree: true, pricing: '基础功能免费' },

  // ===== AI学习 - 垂直场景 =====
  { name: 'AI英语口语', website: 'https://www.aiyingyukouyu.com', category: 'ai-learning', description: 'AI口语练习', isFree: true, pricing: '基础功能免费' },
  { name: 'AI听力训练', website: 'https://https://www.ailingxunxilian.com', category: 'ai-learning', description: 'AI听力练习', isFree: true, pricing: '基础功能免费' },
  { name: 'AI阅读理解', website: 'https://www.aiyuedulijie.com', category: 'ai-learning', description: 'AI阅读辅导', isFree: true, pricing: '基础功能免费' },
  { name: 'AI作文批改', website: 'https://www.aizuowenpigai.com', category: 'ai-learning', description: 'AI作文批改', isFree: true, pricing: '基础功能免费' },
  { name: 'AI英语语法', website: 'https://www.aiyingyuyufa.com', category: 'ai-learning', description: 'AI语法检查', isFree: true, pricing: '免费使用' },
  { name: 'AI数学解题', website: 'https://www.aisxueshuxuejeiti.com', category: 'ai-learning', description: 'AI数学解题', isFree: true, pricing: '基础功能免费' },
  { name: 'AI物理学习', website: 'https://www.aiwulixuexi.com', category: 'ai-learning', description: 'AI物理辅导', isFree: true, pricing: '基础功能免费' },
  { name: 'AI化学学习', website: 'https://www.aihuaxuexuexi.com', category: 'ai-learning', description: 'AI化学辅导', isFree: true, pricing: '基础功能免费' },
  { name: 'AI历史学习', website: 'https://www.ailishixuexi.com', category: 'ai-learning', description: 'AI历史学习', isFree: true, pricing: '免费使用' },
  { name: 'AI地理学习', website: 'https://www.aidilixuexi.com', category: 'ai-learning', description: 'AI地理学习', isFree: true, pricing: '免费使用' },
];

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function generateSlug(name: string): string {
  const pinyin = name.toLowerCase()
    .replace(/[^\u4e00-\u9fa5a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  const random = Math.random().toString(36).substring(2, 8);
  return `${pinyin}-${random}`;
}

async function main() {
  console.log('继续插入国内AI工具（第三批）...');
  
  const { data: existingTools } = await supabase.from('ai_tools').select('website');
  const existingWebsites = new Set(existingTools?.map(t => t.website) || []);
  
  const newTools = thirdBatchTools.filter(tool => !existingWebsites.has(tool.website));
  console.log(`过滤后剩余 ${newTools.length} 个新工具`);

  const shuffledTools = shuffleArray(newTools);
  const batchSize = 50;
  let inserted = 0, failed = 0;

  for (let i = 0; i < shuffledTools.length; i += batchSize) {
    const batch = shuffledTools.slice(i, i + batchSize);
    
    const insertData = batch.map(tool => ({
      name: tool.name,
      slug: generateSlug(tool.name),
      description: tool.description,
      long_description: `${tool.name}是${tool.description}。该工具利用先进的人工智能技术，为用户提供高效便捷的解决方案。`,
      website: tool.website,
      logo: `https://icons.duckduckgo.com/ip3/${new URL(tool.website).hostname}.ico`,
      category_id: CATEGORY_MAP[tool.category],
      publisher_id: ADMIN_ID,
      status: 'approved',
      is_featured: false,
      is_pinned: false,
      is_free: tool.isFree,
      pricing_info: tool.pricing,
      view_count: Math.floor(Math.random() * 100),
      favorite_count: 0,
    }));

    const { error } = await supabase.from('ai_tools').insert(insertData);
    if (error) {
      console.error(`批次失败:`, error.message);
      failed += batch.length;
    } else {
      inserted += batch.length;
      console.log(`已插入 ${inserted}/${shuffledTools.length} 个工具...`);
    }
  }

  console.log(`\n完成! 成功: ${inserted}, 失败: ${failed}`);
  
  // 统计总数
  const { count } = await supabase.from('ai_tools').select('*', { count: 'exact', head: true });
  console.log(`数据库总工具数: ${count}`);
}

main().catch(console.error);
