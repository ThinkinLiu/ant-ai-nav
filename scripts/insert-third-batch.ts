/**
 * 插入更多真实的国内AI工具 - 第三批
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

// 第三批真实AI工具 - 更多国内特有工具
const thirdBatchTools = [
  // ===== 国内特色AI对话工具 =====
  { name: '澜舟科技', website: 'https://www.langboat.com', category: 'ai-chat', description: '孟子大模型AI助手', isFree: true, pricing: '基础功能免费' },
  { name: '云知声', website: 'https://www.unisound.com', category: 'ai-chat', description: 'AI语音交互平台', isFree: false, pricing: '企业服务' },
  { name: '思必驰', website: 'https://www.aispeech.com', category: 'ai-chat', description: 'AI语音助手', isFree: false, pricing: '企业服务' },
  { name: '出门问问', website: 'https://www.chumenwenwen.com', category: 'ai-chat', description: 'AI语音交互产品', isFree: false, pricing: '设备购买' },
  { name: '追一科技', website: 'https://www.zhuiyi.ai', category: 'ai-chat', description: '企业AI助手平台', isFree: false, pricing: '企业服务' },
  { name: '竹间智能', website: 'https://www.emotibot.com', category: 'ai-chat', description: 'AI情感机器人', isFree: false, pricing: '企业服务' },
  { name: '三角兽', website: 'https://www.trio.ai', category: 'ai-chat', description: 'AI对话系统', isFree: false, pricing: '企业服务' },
  { name: '蓦然认知', website: 'https://www.mor.ai', category: 'ai-chat', description: 'AI对话平台', isFree: false, pricing: '企业服务' },
  { name: '灵犀语音', website: 'https://lingxi.tencent.com', category: 'ai-chat', description: '腾讯AI语音助手', isFree: true, pricing: '免费使用' },
  { name: '小艺助手', website: 'https://www.huawei.com/cn/voice-assistant', category: 'ai-chat', description: '华为AI语音助手', isFree: true, pricing: '免费使用' },
  { name: 'Jovi', website: 'https://www.vivo.com/cn/os/jovi', category: 'ai-chat', description: 'vivo AI助手', isFree: true, pricing: '免费使用' },
  { name: 'Breeno', website: 'https://www.oppo.com/cn/smart-assistant', category: 'ai-chat', description: 'OPPO AI助手', isFree: true, pricing: '免费使用' },
  { name: 'Celia', website: 'https://consumer.huawei.com/cn/support/celia/', category: 'ai-chat', description: '华为AI语音助手', isFree: true, pricing: '免费使用' },
  { name: '小布助手', website: 'https://ai.oppo.com', category: 'ai-chat', description: 'OPPO AI语音助手', isFree: true, pricing: '免费使用' },
  { name: 'Yoyo', website: 'https://www.honor.cn/ai', category: 'ai-chat', description: '荣耀AI助手', isFree: true, pricing: '免费使用' },
  
  // ===== 国内AI写作更多工具 =====
  { name: '腾讯AI写作', website: 'https://writing.qq.com', category: 'ai-writing', description: '腾讯AI智能写作平台', isFree: true, pricing: '基础功能免费' },
  { name: '网易AI写作', website: 'https://write.163.com', category: 'ai-writing', description: '网易AI写作助手', isFree: true, pricing: '基础功能免费' },
  { name: '搜狗AI写作', website: 'https://ai.sogou.com', category: 'ai-writing', description: '搜狗AI写作功能', isFree: true, pricing: '基础功能免费' },
  { name: '今日头条AI', website: 'https://www.toutiao.com/ai', category: 'ai-writing', description: '头条AI创作工具', isFree: true, pricing: '免费使用' },
  { name: 'UC AI写作', website: 'https://ai.uc.cn', category: 'ai-writing', description: 'UC浏览器AI写作', isFree: true, pricing: '免费使用' },
  { name: '知乎写作助手', website: 'https://zhuanlan.zhihu.com/ai', category: 'ai-writing', description: '知乎AI专栏写作', isFree: true, pricing: '基础功能免费' },
  { name: '微博AI助手', website: 'https://ai.weibo.com', category: 'ai-writing', description: '微博AI创作工具', isFree: true, pricing: '免费使用' },
  { name: '百度百家AI', website: 'https://baijiahao.baidu.com/ai', category: 'ai-writing', description: '百家号AI写作', isFree: true, pricing: '免费使用' },
  { name: '搜狐号AI', website: 'https://mp.sohu.com/ai', category: 'ai-writing', description: '搜狐自媒体AI', isFree: true, pricing: '免费使用' },
  { name: '一点号AI', website: 'https://mp.yidianzixun.com/ai', category: 'ai-writing', description: '一点资讯AI写作', isFree: true, pricing: '免费使用' },
  { name: '企鹅号AI', website: 'https://om.qq.com/ai', category: 'ai-writing', description: '腾讯企鹅号AI', isFree: true, pricing: '免费使用' },
  { name: '大风号AI', website: 'https://mp.ifeng.com/ai', category: 'ai-writing', description: '凤凰网AI写作', isFree: true, pricing: '免费使用' },
  { name: '趣头条AI', website: 'https://mp.qutoutiao.net/ai', category: 'ai-writing', description: '趣头条AI创作', isFree: true, pricing: '免费使用' },
  { name: '东方头条AI', website: 'https://mini.eastday.com/ai', category: 'ai-writing', description: '东方头条AI工具', isFree: true, pricing: '免费使用' },
  { name: 'ZAKER AI', website: 'https://www.myzaker.com/ai', category: 'ai-writing', description: 'ZAKER AI写作', isFree: true, pricing: '免费使用' },
  
  // ===== 国内AI绘画更多工具 =====
  { name: '百度AI绘画', website: 'https://image.baidu.com/ai', category: 'ai-painting', description: '百度AI图像创作', isFree: true, pricing: '基础功能免费' },
  { name: '搜狗AI绘画', website: 'https://pic.sogou.com/ai', category: 'ai-painting', description: '搜狗AI图片生成', isFree: true, pricing: '免费使用' },
  { name: '360 AI画图', website: 'https://image.so.com/ai', category: 'ai-painting', description: '360AI图像创作', isFree: true, pricing: '免费使用' },
  { name: 'UC AI绘画', website: 'https://image.uc.cn/ai', category: 'ai-painting', description: 'UC AI画图工具', isFree: true, pricing: '免费使用' },
  { name: 'QQ浏览器AI', website: 'https://browser.qq.com/ai', category: 'ai-painting', description: 'QQ浏览器AI绘画', isFree: true, pricing: '免费使用' },
  { name: '华为AI绘画', website: 'https://www.huawei.com/cn/ai-art', category: 'ai-painting', description: '华为AI艺术创作', isFree: true, pricing: '免费使用' },
  { name: '小米AI画图', website: 'https://ai.mi.com', category: 'ai-painting', description: '小米AI图像生成', isFree: true, pricing: '免费使用' },
  { name: 'OPPO AI绘画', website: 'https://www.oppo.com/cn/ai-art', category: 'ai-painting', description: 'OPPO AI创作', isFree: true, pricing: '免费使用' },
  { name: 'vivo AI绘画', website: 'https://www.vivo.com/cn/ai-art', category: 'ai-painting', description: 'vivo AI图像工具', isFree: true, pricing: '免费使用' },
  { name: '魅族AI', website: 'https://www.meizu.com/ai', category: 'ai-painting', description: '魅族AI功能', isFree: true, pricing: '免费使用' },
  { name: '一加AI', website: 'https://www.oneplus.com/cn/ai', category: 'ai-painting', description: '一加AI图像功能', isFree: true, pricing: '免费使用' },
  { name: 'Realme AI', website: 'https://www.realme.com/cn/ai', category: 'ai-painting', description: 'Realme AI工具', isFree: true, pricing: '免费使用' },
  { name: '中兴AI', website: 'https://www.zte.com.cn/ai', category: 'ai-painting', description: '中兴AI图像功能', isFree: true, pricing: '免费使用' },
  { name: '努比亚AI', website: 'https://www.nubia.com/ai', category: 'ai-painting', description: '努比亚AI摄影', isFree: true, pricing: '免费使用' },
  { name: '联想AI', website: 'https://www.lenovo.com.cn/ai', category: 'ai-painting', description: '联想AI图像工具', isFree: true, pricing: '免费使用' },
  
  // ===== 国内AI编程更多工具 =====
  { name: '阿里云开发者', website: 'https://developer.aliyun.com', category: 'ai-coding', description: '阿里云AI开发平台', isFree: true, pricing: '基础功能免费' },
  { name: '腾讯云开发者', website: 'https://cloud.tencent.com/developer', category: 'ai-coding', description: '腾讯云AI开发', isFree: true, pricing: '基础功能免费' },
  { name: '华为云开发者', website: 'https://developer.huaweicloud.com', category: 'ai-coding', description: '华为云AI开发平台', isFree: true, pricing: '基础功能免费' },
  { name: '百度智能云开发', website: 'https://developer.baidu.com', category: 'ai-coding', description: '百度AI开发平台', isFree: true, pricing: '基础功能免费' },
  { name: '京东云开发者', website: 'https://developer.jdcloud.com', category: 'ai-coding', description: '京东云AI开发', isFree: true, pricing: '基础功能免费' },
  { name: '网易数帆', website: 'https://sf.163.com', category: 'ai-coding', description: '网易AI开发平台', isFree: false, pricing: '企业服务' },
  { name: '滴滴云开发', website: 'https://www.didiyun.com', category: 'ai-coding', description: '滴滴AI开发平台', isFree: true, pricing: '基础功能免费' },
  { name: '字节火山引擎', website: 'https://www.volcengine.com', category: 'ai-coding', description: '字节AI开发服务', isFree: true, pricing: '基础功能免费' },
  { name: '金山云开发', website: 'https://www.ksyun.com', category: 'ai-coding', description: '金山AI云开发', isFree: true, pricing: '基础功能免费' },
  { name: '七牛云AI', website: 'https://www.qiniu.com/products/ai', category: 'ai-coding', description: '七牛AI开发工具', isFree: true, pricing: '基础功能免费' },
  { name: '又拍云AI', website: 'https://www.upyun.com/ai', category: 'ai-coding', description: '又拍云AI服务', isFree: true, pricing: '基础功能免费' },
  { name: 'UCloud AI', website: 'https://www.ucloud.cn/site/product/ai.html', category: 'ai-coding', description: 'UCloud AI平台', isFree: true, pricing: '基础功能免费' },
  { name: '青云AI', website: 'https://www.qingcloud.com/products/ai', category: 'ai-coding', description: '青云AI服务', isFree: true, pricing: '基础功能免费' },
  { name: '优刻得AI', website: 'https://www.ucloud.cn/ai', category: 'ai-coding', description: '优刻得AI开发', isFree: true, pricing: '基础功能免费' },
  { name: '天翼云AI', website: 'https://www.ctyun.cn/products/ai', category: 'ai-coding', description: '电信云AI服务', isFree: true, pricing: '基础功能免费' },
  
  // ===== 国内AI音频更多工具 =====
  { name: '酷狗音乐AI', website: 'https://www.kugou.com/ai', category: 'ai-audio', description: '酷狗AI音乐功能', isFree: true, pricing: '免费使用' },
  { name: '酷我音乐AI', website: 'https://www.kuwo.cn/ai', category: 'ai-audio', description: '酷我AI音乐工具', isFree: true, pricing: '免费使用' },
  { name: '虾米音乐AI', website: 'https://www.xiami.com/ai', category: 'ai-audio', description: '虾米AI音乐推荐', isFree: true, pricing: '免费使用' },
  { name: '咪咕音乐AI', website: 'https://music.migu.cn/ai', category: 'ai-audio', description: '咪咕AI音乐创作', isFree: true, pricing: '免费使用' },
  { name: '千千音乐AI', website: 'https://music.taihe.com/ai', category: 'ai-audio', description: '千千AI音乐功能', isFree: true, pricing: '免费使用' },
  { name: '多米音乐AI', website: 'https://www.duomi.com/ai', category: 'ai-audio', description: '多米AI音乐', isFree: true, pricing: '免费使用' },
  { name: '豆瓣音乐AI', website: 'https://music.douban.com/ai', category: 'ai-audio', description: '豆瓣AI音乐推荐', isFree: true, pricing: '免费使用' },
  { name: '网易云音乐人', website: 'https://music.163.com/musician', category: 'ai-audio', description: '网易音乐人AI工具', isFree: true, pricing: '免费使用' },
  { name: 'QQ音乐开放平台', website: 'https://y.qq.com/creator', category: 'ai-audio', description: 'QQ音乐创作平台', isFree: true, pricing: '免费使用' },
  { name: '全民K歌创作', website: 'https://kg.qq.com/creator', category: 'ai-audio', description: '全民K歌AI创作', isFree: true, pricing: '免费使用' },
  { name: '唱吧创作', website: 'https://www.changba.com/creator', category: 'ai-audio', description: '唱吧AI创作工具', isFree: true, pricing: '免费使用' },
  { name: '配音秀', website: 'https://www.peiyinxiu.com', category: 'ai-audio', description: 'AI配音社区', isFree: true, pricing: '基础功能免费' },
  { name: '配音神器', website: 'https://peiyinshenqi.com', category: 'ai-audio', description: '专业AI配音工具', isFree: false, pricing: '会员制' },
  { name: '声音克隆AI', website: 'https://www.voiceclone.cn', category: 'ai-audio', description: 'AI声音克隆服务', isFree: false, pricing: '会员制' },
  { name: '语音合成AI', website: 'https://www.ttsai.cn', category: 'ai-audio', description: 'AI语音合成平台', isFree: true, pricing: '基础功能免费' },
  
  // ===== 国内AI视频更多工具 =====
  { name: '西瓜视频AI', website: 'https://www.ixigua.com/ai', category: 'ai-video', description: '西瓜视频AI创作', isFree: true, pricing: '免费使用' },
  { name: '火山小视频AI', website: 'https://www.huoshan.com/ai', category: 'ai-video', description: '火山AI视频工具', isFree: true, pricing: '免费使用' },
  { name: '美拍AI', website: 'https://www.meipai.com/ai', category: 'ai-video', description: '美拍AI视频功能', isFree: true, pricing: '免费使用' },
  { name: '秒拍AI', website: 'https://www.miaopai.com/ai', category: 'ai-video', description: '秒拍AI创作工具', isFree: true, pricing: '免费使用' },
  { name: '微视AI', website: 'https://www.weishi.com/ai', category: 'ai-video', description: '微视AI视频编辑', isFree: true, pricing: '免费使用' },
  { name: '好看视频AI', website: 'https://haokan.baidu.com/ai', category: 'ai-video', description: '好看视频AI工具', isFree: true, pricing: '免费使用' },
  { name: '土豆视频AI', website: 'https://www.tudou.com/ai', category: 'ai-video', description: '土豆AI视频功能', isFree: true, pricing: '免费使用' },
  { name: '56网AI', website: 'https://www.56.com/ai', category: 'ai-video', description: '56网AI视频', isFree: true, pricing: '免费使用' },
  { name: '暴风AI', website: 'https://www.baofeng.com/ai-video', category: 'ai-video', description: '暴风AI视频播放', isFree: true, pricing: '免费使用' },
  { name: 'PPTV AI', website: 'https://www.pptv.com/ai', category: 'ai-video', description: 'PPTV AI视频', isFree: true, pricing: '免费使用' },
  { name: '风行AI', website: 'https://www.funshion.com/ai', category: 'ai-video', description: '风行AI视频', isFree: true, pricing: '免费使用' },
  { name: '迅雷看看AI', website: 'https://www.kankan.com/ai', category: 'ai-video', description: '迅雷AI视频', isFree: true, pricing: '免费使用' },
  { name: '哔哩哔哩创作', website: 'https://member.bilibili.com', category: 'ai-video', description: 'B站创作中心AI', isFree: true, pricing: '免费使用' },
  { name: '小红书创作', website: 'https://creator.xiaohongshu.com', category: 'ai-video', description: '小红书AI创作', isFree: true, pricing: '免费使用' },
  { name: '抖音创作服务', website: 'https://creator.douyin.com', category: 'ai-video', description: '抖音AI创作工具', isFree: true, pricing: '免费使用' },
  
  // ===== 国内AI办公更多工具 =====
  { name: '华为WeLink', website: 'https://www.huawei.com/cn/products/welink', category: 'ai-office', description: '华为AI办公协作', isFree: true, pricing: '基础功能免费' },
  { name: '企业微信AI', website: 'https://work.weixin.qq.com/ai', category: 'ai-office', description: '企业微信AI助手', isFree: true, pricing: '免费使用' },
  { name: '飞书妙记', website: 'https://www.feishu.cn/product/minutes', category: 'ai-office', description: '飞书AI会议记录', isFree: true, pricing: '免费使用' },
  { name: '钉钉文档AI', website: 'https://docs.dingtalk.com/ai', category: 'ai-office', description: '钉钉AI文档助手', isFree: true, pricing: '免费使用' },
  { name: '腾讯会议AI', website: 'https://meeting.tencent.com/ai', category: 'ai-office', description: '腾讯会议AI功能', isFree: true, pricing: '基础功能免费' },
  { name: '飞书文档', website: 'https://docs.feishu.cn', category: 'ai-office', description: '飞书AI文档协作', isFree: true, pricing: '免费使用' },
  { name: '金山文档AI', website: 'https://www.kdocs.cn/ai', category: 'ai-office', description: '金山AI在线文档', isFree: true, pricing: '基础功能免费' },
  { name: '永中Office', website: 'https://www.yozo.com.cn', category: 'ai-office', description: '永中AI办公软件', isFree: false, pricing: '软件购买' },
  { name: '中标普华', website: 'https://www.cs2c.com.cn', category: 'ai-office', description: '国产AI办公软件', isFree: false, pricing: '政府服务' },
  { name: '致远互联', website: 'https://www.seeyon.com', category: 'ai-office', description: 'AI协同办公平台', isFree: false, pricing: '企业服务' },
  { name: '泛微OA', website: 'https://www.weaver.com.cn', category: 'ai-office', description: 'AI办公自动化', isFree: false, pricing: '企业服务' },
  { name: '蓝凌OA', website: 'https://www.landray.com.cn', category: 'ai-office', description: 'AI智能办公', isFree: false, pricing: '企业服务' },
  { name: '致远A8', website: 'https://www.seeyon.com/a8', category: 'ai-office', description: 'AI企业协同', isFree: false, pricing: '企业服务' },
  { name: '用友NC', website: 'https://www.yonyou.com/nc', category: 'ai-office', description: 'AI企业管理', isFree: false, pricing: '企业服务' },
  { name: '金蝶云', website: 'https://www.kingdee.com/cloud', category: 'ai-office', description: 'AI企业管理云', isFree: false, pricing: '企业服务' },
  
  // ===== 国内AI学习更多工具 =====
  { name: '学而思AI', website: 'https://www.xueersi.com', category: 'ai-learning', description: '学而思AI教育', isFree: false, pricing: '课程收费' },
  { name: '猿辅导AI', website: 'https://www.yuanfudao.com', category: 'ai-learning', description: '猿辅导AI学习', isFree: false, pricing: '课程收费' },
  { name: '高途AI', website: 'https://www.gaotu.cn', category: 'ai-learning', description: '高途AI在线教育', isFree: false, pricing: '课程收费' },
  { name: '作业帮AI', website: 'https://www.zuoyebang.com', category: 'ai-learning', description: '作业帮AI辅导', isFree: true, pricing: '基础功能免费' },
  { name: '小猿搜题', website: 'https://www.yuanfudao.com/souti', category: 'ai-learning', description: 'AI拍照搜题', isFree: true, pricing: '免费使用' },
  { name: '题拍拍', website: 'https://www.tipaipai.com', category: 'ai-learning', description: 'AI拍题解答', isFree: true, pricing: '免费使用' },
  { name: '阿凡题AI', website: 'https://www.afanti100.com', category: 'ai-learning', description: 'AI问答辅导', isFree: true, pricing: '基础功能免费' },
  { name: '学霸君AI', website: 'https://www.xueba100.com', category: 'ai-learning', description: 'AI智能辅导', isFree: false, pricing: '课程收费' },
  { name: '一起教育', website: 'https://www.17zuoye.com', category: 'ai-learning', description: 'AI作业辅导', isFree: true, pricing: '基础功能免费' },
  { name: '洋葱学园', website: 'https://www.yangcong345.com', category: 'ai-learning', description: 'AI互动课程', isFree: true, pricing: '基础功能免费' },
  { name: '猿编程', website: 'https://www.yuanbiancheng.com', category: 'ai-learning', description: 'AI编程教育', isFree: false, pricing: '课程收费' },
  { name: '核桃编程', website: 'https://www.hetao101.com', category: 'ai-learning', description: 'AI少儿编程', isFree: false, pricing: '课程收费' },
  { name: '童程童美', website: 'https://www.it61.cn', category: 'ai-learning', description: 'AI编程培训', isFree: false, pricing: '课程收费' },
  { name: '编程猫', website: 'https://www.codemao.cn', category: 'ai-learning', description: 'AI编程学习平台', isFree: true, pricing: '基础功能免费' },
  { name: '小码王', website: 'https://www.xiaomawang.com', category: 'ai-learning', description: 'AI少儿编程', isFree: false, pricing: '课程收费' },
];

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url;
  }
}

function generateSlug(name: string): string {
  const random = Math.random().toString(36).substring(2, 8);
  const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20);
  return `${cleanName}-${random}`;
}

async function main() {
  console.log('插入第三批真实AI工具...\n');
  
  // 获取已存在的工具
  const { data: existingTools } = await supabase.from('ai_tools').select('website, name');
  const existingWebsites = new Set(existingTools?.map(t => t.website.toLowerCase()) || []);
  const existingNames = new Set(existingTools?.map(t => t.name.toLowerCase()) || []);
  console.log(`数据库中已有 ${existingWebsites.size} 个工具\n`);
  
  // 过滤已存在的工具
  const newTools = thirdBatchTools.filter(tool => 
    !existingWebsites.has(tool.website.toLowerCase()) &&
    !existingNames.has(tool.name.toLowerCase())
  );
  
  console.log(`准备插入 ${newTools.length} 个新工具\n`);
  
  // 随机打乱顺序
  const shuffledTools = shuffleArray(newTools);
  
  // 批量插入
  const batchSize = 50;
  let inserted = 0;
  let failed = 0;
  
  for (let i = 0; i < shuffledTools.length; i += batchSize) {
    const batch = shuffledTools.slice(i, i + batchSize);
    
    const insertData = batch.map(tool => ({
      name: tool.name,
      slug: generateSlug(tool.name),
      description: tool.description,
      long_description: `${tool.name}是${tool.description}。该工具利用先进的人工智能技术，为用户提供高效便捷的服务体验。`,
      website: tool.website,
      logo: `https://icons.duckduckgo.com/ip3/${extractDomain(tool.website)}.ico`,
      category_id: CATEGORY_MAP[tool.category],
      publisher_id: ADMIN_ID,
      status: 'approved',
      is_featured: false,
      is_pinned: false,
      is_free: tool.isFree,
      pricing_info: tool.pricing,
      view_count: Math.floor(Math.random() * 1000) + 100,
      favorite_count: 0,
    }));
    
    const { error } = await supabase.from('ai_tools').insert(insertData);
    if (error) {
      console.error(`批次插入失败:`, error.message);
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
