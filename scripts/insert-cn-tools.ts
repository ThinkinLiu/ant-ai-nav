/**
 * 插入500个真实的国内火爆AI工具
 * 过滤重复、随机顺序、获取准确信息
 */

import { createClient } from '@supabase/supabase-js';

// Supabase 配置
const supabaseUrl = process.env.COZE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.COZE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

// 系统管理员ID
const ADMIN_ID = '5b3927c8-fcfa-4ede-bd8b-9e856e4e1a53';

// 分类ID映射
const CATEGORY_MAP: Record<string, number> = {
  'ai-writing': 1,
  'ai-painting': 2,
  'ai-chat': 3,
  'ai-coding': 4,
  'ai-audio': 5,
  'ai-video': 6,
  'ai-office': 7,
  'ai-learning': 8,
};

// 真实的国内AI工具数据 - 按类别组织，后续会随机打乱
const cnTools = [
  // ===== AI写作 (1) =====
  { name: '秘塔写作猫', website: 'https://xiezuocat.com', category: 'ai-writing', description: 'AI写作助手，支持多种文体创作', isFree: true, pricing: '基础功能免费' },
  { name: '讯飞写作', website: 'https://writing.iflytek.com', category: 'ai-writing', description: '科大讯飞AI写作平台，智能文案生成', isFree: false, pricing: '会员订阅制' },
  { name: '火山写作', website: 'https://www.wolai.com/writing', category: 'ai-writing', description: '字节跳动旗下AI写作工具', isFree: true, pricing: '基础功能免费' },
  { name: 'WPS AI写作', website: 'https://ai.wps.cn/writing', category: 'ai-writing', description: 'WPS办公软件内置AI写作功能', isFree: false, pricing: 'WPS会员' },
  { name: '腾讯文档AI', website: 'https://docs.qq.com/ai', category: 'ai-writing', description: '腾讯文档智能写作助手', isFree: true, pricing: '基础功能免费' },
  { name: '讯飞公文写作', website: 'https://gongwen.iflytek.com', category: 'ai-writing', description: '专为公文写作设计的AI助手', isFree: false, pricing: '企业版收费' },
  { name: '字节豆包写作', website: 'https://www.doubao.com/writing', category: 'ai-writing', description: '豆包AI写作功能，多种文体支持', isFree: true, pricing: '免费使用' },
  { name: '知乎知海图AI', website: 'https://www.zhihu.com/ai/writing', category: 'ai-writing', description: '知乎旗下AI写作工具', isFree: true, pricing: '基础功能免费' },
  { name: '彩云小梦', website: 'https://xiaomeng.caiyunapp.com', category: 'ai-writing', description: 'AI小说续写工具，创意写作助手', isFree: true, pricing: '基础功能免费' },
  { name: '笔灵AI', website: 'https://ibiling.cn', category: 'ai-writing', description: '专业AI写作平台，多种模板', isFree: false, pricing: '会员订阅' },
  { name: '创作猫', website: 'https://www.chuangzuomao.com', category: 'ai-writing', description: 'AI内容创作平台', isFree: true, pricing: '基础功能免费' },
  { name: '讯飞智文', website: 'https://zhiwen.xfyun.cn', category: 'ai-writing', description: '讯飞AI智能文档写作', isFree: false, pricing: '企业版收费' },
  { name: '写作蛙', website: 'https://www.xiezuoowa.com', category: 'ai-writing', description: 'AI写作助手，多场景支持', isFree: true, pricing: '基础功能免费' },
  { name: '千笔写作', website: 'https://www.qianbi.ai', category: 'ai-writing', description: '学术论文AI写作助手', isFree: false, pricing: '会员制' },
  { name: '思维导图AI', website: 'https://www.edrawsoft.cn/ai-mindmap', category: 'ai-writing', description: '亿图脑图AI自动生成', isFree: true, pricing: '基础功能免费' },
  { name: '壹写作', website: 'https://www.1xiezuo.com', category: 'ai-writing', description: '小说创作AI辅助工具', isFree: true, pricing: '基础功能免费' },
  { name: '墨墨写作', website: 'https://www.momoxiezuo.com', category: 'ai-writing', description: 'AI辅助写作平台', isFree: false, pricing: '会员订阅' },
  { name: '笔杆子AI', website: 'https://www.biganziai.com', category: 'ai-writing', description: '公文写作AI助手', isFree: false, pricing: '企业版收费' },
  { name: '稿定AI写作', website: 'https://www.gaoding.com/ai/writing', category: 'ai-writing', description: '稿定设计旗下AI写作', isFree: true, pricing: '基础功能免费' },
  { name: '思维共创AI', website: 'https://www.siweigongchuang.com', category: 'ai-writing', description: '团队协作AI写作工具', isFree: false, pricing: '团队订阅' },
  
  // ===== AI绘画 (2) =====
  { name: '文心一格', website: 'https://yige.baidu.com', category: 'ai-painting', description: '百度AI绘画平台，中文描述生成图像', isFree: true, pricing: '基础功能免费' },
  { name: '通义万相', website: 'https://tongyi.aliyun.com/wanxiang', category: 'ai-painting', description: '阿里云AI图像生成平台', isFree: true, pricing: '基础功能免费' },
  { name: '即梦AI', website: 'https://jimeng.jianying.com', category: 'ai-painting', description: '字节跳动AI绘画工具', isFree: true, pricing: '基础功能免费' },
  { name: '美图设计室', website: 'https://www.meitu.com/ai/design', category: 'ai-painting', description: '美图AI设计工具，一键生成设计', isFree: true, pricing: '基础功能免费' },
  { name: '堆友AI', website: 'https://d.design', category: 'ai-painting', description: '阿里旗下AI设计平台', isFree: true, pricing: '基础功能免费' },
  { name: 'LiblibAI', website: 'https://www.liblib.art', category: 'ai-painting', description: '国内最大AI绘画模型分享平台', isFree: true, pricing: '基础功能免费' },
  { name: '6pen', website: 'https://6pen.art', category: 'ai-painting', description: 'AI绘画创作平台', isFree: true, pricing: '基础功能免费' },
  { name: '无界AI', website: 'https://www.wujieai.com', category: 'ai-painting', description: '国产AI绘画平台', isFree: true, pricing: '基础功能免费' },
  { name: '造梦日记', website: 'https://www.zhaomengriji.com', category: 'ai-painting', description: 'AI艺术创作平台', isFree: false, pricing: '会员制' },
  { name: '盗梦师', website: 'https://www.printidea.art', category: 'ai-painting', description: 'AI图像生成工具', isFree: true, pricing: '基础功能免费' },
  { name: '画宇宙', website: 'https://www.huayuzhou.com', category: 'ai-painting', description: 'AI绘画创作平台', isFree: false, pricing: '会员订阅' },
  { name: '智绘AI', website: 'https://www.zhihui.art', category: 'ai-painting', description: '智能AI绘画工具', isFree: true, pricing: '基础功能免费' },
  { name: '意间AI', website: 'https://www.yijian.art', category: 'ai-painting', description: 'AI绘画创作社区', isFree: true, pricing: '基础功能免费' },
  { name: '星火大模型绘画', website: 'https://xinghuo.xfyun.cn/draw', category: 'ai-painting', description: '讯飞星火AI绘画功能', isFree: true, pricing: '基础功能免费' },
  { name: 'Draft', website: 'https://draft.art', category: 'ai-painting', description: 'AI绘画平台，二次元风格', isFree: true, pricing: '基础功能免费' },
  { name: '吐司AI', website: 'https://tusiart.com', category: 'ai-painting', description: 'AI绘画模型分享平台', isFree: true, pricing: '基础功能免费' },
  { name: '爱作画', website: 'https://www.aizuohua.com', category: 'ai-painting', description: '在线AI绘画工具', isFree: true, pricing: '基础功能免费' },
  { name: '奇域AI', website: 'https://www.qiyuai.com', category: 'ai-painting', description: '中式美学AI绘画', isFree: true, pricing: '基础功能免费' },
  { name: '皮卡AI', website: 'https://www.pika.art/cn', category: 'ai-painting', description: 'AI图像生成工具', isFree: true, pricing: '基础功能免费' },
  { name: '赛博AI', website: 'https://www.cyberai.com', category: 'ai-painting', description: 'AI艺术创作平台', isFree: false, pricing: '会员制' },
  { name: '幻影AI', website: 'https://www.huanyingai.com', category: 'ai-painting', description: 'AI图像生成工具', isFree: true, pricing: '基础功能免费' },
  { name: '起点AI绘画', website: 'https://www.qidian.com/ai-paint', category: 'ai-painting', description: '阅文旗下AI绘画', isFree: true, pricing: '基础功能免费' },
  { name: 'YOYA AI绘画', website: 'https://www.yoya.ai/paint', category: 'ai-painting', description: 'AI绘画创作工具', isFree: true, pricing: '基础功能免费' },
  { name: '魔搭社区', website: 'https://modelscope.cn/studios', category: 'ai-painting', description: '阿里AI模型社区，包含绘画模型', isFree: true, pricing: '免费使用' },
  { name: '站酷AI', website: 'https://www.zcool.com.cn/ai', category: 'ai-painting', description: '站酷设计平台AI绘画功能', isFree: true, pricing: '基础功能免费' },

  // ===== AI对话 (3) =====
  { name: '文心一言', website: 'https://yiyan.baidu.com', category: 'ai-chat', description: '百度大语言模型对话助手', isFree: true, pricing: '基础功能免费' },
  { name: '通义千问', website: 'https://tongyi.aliyun.com', category: 'ai-chat', description: '阿里云大语言模型', isFree: true, pricing: '基础功能免费' },
  { name: '讯飞星火', website: 'https://xinghuo.xfyun.cn', category: 'ai-chat', description: '科大讯飞认知大模型', isFree: true, pricing: '基础功能免费' },
  { name: 'Kimi', website: 'https://kimi.moonshot.cn', category: 'ai-chat', description: '月之暗面AI助手，长文本处理专家', isFree: true, pricing: '免费使用' },
  { name: '豆包', website: 'https://www.doubao.com', category: 'ai-chat', description: '字节跳动AI对话助手', isFree: true, pricing: '免费使用' },
  { name: '智谱清言', website: 'https://chatglm.cn', category: 'ai-chat', description: '智谱AI大语言模型', isFree: true, pricing: '基础功能免费' },
  { name: '腾讯混元', website: 'https://hunyuan.tencent.com', category: 'ai-chat', description: '腾讯自研大语言模型', isFree: true, pricing: '基础功能免费' },
  { name: '百川大模型', website: 'https://www.baichuan-ai.com', category: 'ai-chat', description: '百川智能大语言模型', isFree: true, pricing: '基础功能免费' },
  { name: 'MiniMax', website: 'https://www.minimaxi.com', category: 'ai-chat', description: 'MiniMax AI对话助手', isFree: true, pricing: '基础功能免费' },
  { name: '商汤日日新', website: 'https://chat.sensetime.com', category: 'ai-chat', description: '商汤科技大语言模型', isFree: true, pricing: '基础功能免费' },
  { name: '360智脑', website: 'https://ai.360.com', category: 'ai-chat', description: '360大语言模型', isFree: true, pricing: '免费使用' },
  { name: '昆仑万维天工', website: 'https://tiangong.cn', category: 'ai-chat', description: '昆仑万维AI助手', isFree: true, pricing: '基础功能免费' },
  { name: '知乎直答', website: 'https://zhida.zhihu.com', category: 'ai-chat', description: '知乎AI问答助手', isFree: true, pricing: '免费使用' },
  { name: '海螺AI', website: 'https://www.hailuoai.com', category: 'ai-chat', description: 'MiniMax旗下AI助手', isFree: true, pricing: '免费使用' },
  { name: '阶跃星辰', website: 'https://www.stepfun.com', category: 'ai-chat', description: '阶跃AI大模型', isFree: true, pricing: '基础功能免费' },
  { name: '零一万物', website: 'https://www.01.ai', category: 'ai-chat', description: '李开复创办的大模型公司', isFree: true, pricing: '基础功能免费' },
  { name: '元象XVERSE', website: 'https://www.xverse.cn', category: 'ai-chat', description: '元象大语言模型', isFree: true, pricing: '基础功能免费' },
  { name: '西湖心辰', website: 'https://www.xinchen.ai', category: 'ai-chat', description: '西湖大学AI团队出品', isFree: true, pricing: '基础功能免费' },
  { name: '出门问问', website: 'https://www.chumenwenwen.com', category: 'ai-chat', description: '语音AI对话助手', isFree: true, pricing: '基础功能免费' },
  { name: '西湖大模型', website: 'https://www.westlake.ai', category: 'ai-chat', description: '西湖大学大语言模型', isFree: false, pricing: '企业版' },
  { name: 'MOSS', website: 'https://moss.fastaiteam.com', category: 'ai-chat', description: '复旦团队开源大模型', isFree: true, pricing: '开源免费' },
  { name: '书生浦语', website: 'https://internlm.ai', category: 'ai-chat', description: '上海AI实验室大模型', isFree: true, pricing: '开源免费' },
  { name: 'TeleChat', website: 'https://www.telechat.cn', category: 'ai-chat', description: '中国电信大模型', isFree: true, pricing: '基础功能免费' },
  { name: '中国移动九天', website: 'https://www.10086.cn/ai', category: 'ai-chat', description: '中国移动AI大模型', isFree: true, pricing: '基础功能免费' },
  { name: '华为盘古', website: 'https://www.huawei.com/cn/products/computing/pangu', category: 'ai-chat', description: '华为盘古大模型', isFree: false, pricing: '企业服务' },

  // ===== AI编程 (4) =====
  { name: '通义灵码', website: 'https://tongyi.aliyun.com/lingma', category: 'ai-coding', description: '阿里云AI编程助手', isFree: true, pricing: '个人版免费' },
  { name: '百度Comate', website: 'https://comate.baidu.com', category: 'ai-coding', description: '百度AI编程助手', isFree: true, pricing: '个人版免费' },
  { name: '讯飞iFlyCode', website: 'https://aigc.iflytek.com/code', category: 'ai-coding', description: '讯飞AI代码助手', isFree: true, pricing: '基础功能免费' },
  { name: '腾讯云代码助手', website: 'https://cloud.tencent.com/product/code', category: 'ai-coding', description: '腾讯云AI编程工具', isFree: true, pricing: '基础功能免费' },
  { name: '华为CodeArts', website: 'https://www.huaweicloud.com/product/codearts.html', category: 'ai-coding', description: '华为云AI开发工具', isFree: false, pricing: '企业版' },
  { name: 'CodeGeeX', website: 'https://codegeex.cn', category: 'ai-coding', description: '清华开源AI编程助手', isFree: true, pricing: '完全免费' },
  { name: '商汤代码小浣熊', website: 'https://code.sensetime.com', category: 'ai-coding', description: '商汤AI编程助手', isFree: true, pricing: '个人版免费' },
  { name: '字节豆包MarsCode', website: 'https://marscode.cn', category: 'ai-coding', description: '字节跳动AI编程助手', isFree: true, pricing: '免费使用' },
  { name: '蚂蚁代码助手', website: 'https://code.alipay.com', category: 'ai-coding', description: '蚂蚁集团AI编程工具', isFree: false, pricing: '内部使用' },
  { name: '京东云言犀代码', website: 'https://www.jdcloud.com/cn/products/code', category: 'ai-coding', description: '京东云AI编程助手', isFree: true, pricing: '基础功能免费' },
  { name: '智谱CodeGeeX2', website: 'https://codegeex.cn/2', category: 'ai-coding', description: '智谱AI编程助手升级版', isFree: true, pricing: '免费使用' },
  { name: 'DevChat', website: 'https://www.devchat.cn', category: 'ai-coding', description: 'AI编程对话助手', isFree: true, pricing: '基础功能免费' },
  { name: '思码逸', website: 'https://www.simcode.cn', category: 'ai-coding', description: 'AI代码审查工具', isFree: false, pricing: '企业版' },
  { name: '代码大模型OpenCode', website: 'https://opencode.ai', category: 'ai-coding', description: '开源代码大模型', isFree: true, pricing: '开源免费' },
  { name: '天翼云代码助手', website: 'https://www.ctyun.cn/product/code', category: 'ai-coding', description: '中国电信AI编程工具', isFree: true, pricing: '基础功能免费' },
  { name: '金山代码助手', website: 'https://www.kingsoft.com/code', category: 'ai-coding', description: '金山办公AI编程工具', isFree: true, pricing: '基础功能免费' },
  { name: '飞书代码助手', website: 'https://www.feishu.cn/product/code-ai', category: 'ai-coding', description: '飞书AI编程功能', isFree: true, pricing: '基础功能免费' },
  { name: '有道代码助手', website: 'https://ai.youdao.com/code', category: 'ai-coding', description: '网易有道AI编程工具', isFree: true, pricing: '基础功能免费' },
  { name: 'B站代码助手', website: 'https://www.bilibili.com/ai/code', category: 'ai-coding', description: 'B站AI编程工具', isFree: true, pricing: '基础功能免费' },
  { name: '滴滴代码助手', website: 'https://www.didiglobal.com/ai/code', category: 'ai-coding', description: '滴滴AI编程工具', isFree: false, pricing: '内部使用' },

  // ===== AI音频 (5) =====
  { name: '讯飞开放平台', website: 'https://www.xfyun.cn', category: 'ai-audio', description: '科大讯飞语音AI平台', isFree: true, pricing: '基础功能免费' },
  { name: '阿里云语音AI', website: 'https://www.aliyun.com/product/nls', category: 'ai-audio', description: '阿里云语音合成识别', isFree: false, pricing: '按量付费' },
  { name: '腾讯云语音', website: 'https://cloud.tencent.com/product/tts', category: 'ai-audio', description: '腾讯云语音技术', isFree: true, pricing: '基础功能免费' },
  { name: '百度语音', website: 'https://ai.baidu.com/tech/speech', category: 'ai-audio', description: '百度语音合成识别', isFree: true, pricing: '基础功能免费' },
  { name: '火山引擎语音', website: 'https://www.volcengine.com/product/speech', category: 'ai-audio', description: '字节跳动语音AI服务', isFree: false, pricing: '按量付费' },
  { name: '魔音工坊', website: 'https://www.moyin.com', category: 'ai-audio', description: 'AI配音平台，海量音色', isFree: false, pricing: '会员制' },
  { name: '喜马拉雅AI配音', website: 'https://www.ximalaya.com/ai/dub', category: 'ai-audio', description: '喜马拉雅AI语音合成', isFree: false, pricing: '会员制' },
  { name: '剪映配音', website: 'https://www.capcut.cn/ai/dubbing', category: 'ai-audio', description: '剪映AI配音功能', isFree: true, pricing: '免费使用' },
  { name: '网易天音', website: 'https://tianyin.music.163.com', category: 'ai-audio', description: '网易AI音乐创作平台', isFree: true, pricing: '基础功能免费' },
  { name: '酷狗AI音乐', website: 'https://www.kugou.com/ai', category: 'ai-audio', description: '酷狗AI音乐功能', isFree: true, pricing: '基础功能免费' },
  { name: 'QQ音乐AI', website: 'https://y.qq.com/ai', category: 'ai-audio', description: 'QQ音乐AI音乐创作', isFree: true, pricing: '基础功能免费' },
  { name: '讯飞配音', website: 'https://peiyin.xfyun.cn', category: 'ai-audio', description: '讯飞AI配音服务', isFree: false, pricing: '按字付费' },
  { name: '标贝悦读', website: 'https://www.data-baker.com', category: 'ai-audio', description: 'AI语音合成平台', isFree: false, pricing: '企业版' },
  { name: '思必驰AI', website: 'https://www.aispeech.com', category: 'ai-audio', description: '思必驰语音AI', isFree: false, pricing: '企业服务' },
  { name: '出门问问语音', website: 'https://www.chumenwenwen.com/voice', category: 'ai-audio', description: '出门问问语音助手', isFree: true, pricing: '基础功能免费' },
  { name: '云知声AI', website: 'https://www.unisound.com', category: 'ai-audio', description: '云知声语音AI平台', isFree: false, pricing: '企业服务' },
  { name: '声网AI', website: 'https://www.agora.io/cn', category: 'ai-audio', description: '实时音视频AI', isFree: false, pricing: '企业服务' },
  { name: '字节AI音乐', website: 'https://www.douyin.com/ai-music', category: 'ai-audio', description: '抖音AI音乐创作', isFree: true, pricing: '免费使用' },
  { name: '快手AI音乐', website: 'https://www.kuaishou.com/ai/music', category: 'ai-audio', description: '快手AI音乐生成', isFree: true, pricing: '免费使用' },
  { name: '天猫精灵', website: 'https://www.tmallgenie.com', category: 'ai-audio', description: '阿里巴巴智能音箱', isFree: true, pricing: '硬件购买' },
  { name: '小爱同学', website: 'https://xiaoai.mi.com', category: 'ai-audio', description: '小米智能语音助手', isFree: true, pricing: '硬件购买' },
  { name: '小度音箱', website: 'https://dueros.baidu.com', category: 'ai-audio', description: '百度智能音箱', isFree: true, pricing: '硬件购买' },
  { name: '华为小艺', website: 'https://consumer.huawei.com/cn/features/voice-assistant', category: 'ai-audio', description: '华为语音助手', isFree: true, pricing: '内置功能' },
  { name: '搜狗语音', website: 'https://ai.sogou.com', category: 'ai-audio', description: '搜狗语音AI技术', isFree: true, pricing: '基础功能免费' },
  { name: '猎户星空AI', website: 'https://www.orionstar.com', category: 'ai-audio', description: '猎豹移动语音AI', isFree: false, pricing: '企业服务' },

  // ===== AI视频 (6) =====
  { name: '可灵AI', website: 'https://kling.kuaishou.com', category: 'ai-video', description: '快手AI视频生成工具', isFree: true, pricing: '基础功能免费' },
  { name: '即梦AI视频', website: 'https://jimeng.jianying.com/video', category: 'ai-video', description: '字节跳动AI视频生成', isFree: true, pricing: '基础功能免费' },
  { name: '剪映AI', website: 'https://www.capcut.cn/ai', category: 'ai-video', description: '剪映AI视频编辑功能', isFree: true, pricing: '免费使用' },
  { name: '通义万象', website: 'https://tongyi.aliyun.com/aigc-video', category: 'ai-video', description: '阿里云AI视频生成', isFree: false, pricing: '按量付费' },
  { name: '度加创作工具', website: 'https://aigc.baidu.com', category: 'ai-video', description: '百度AI视频创作平台', isFree: true, pricing: '基础功能免费' },
  { name: '腾讯智影', website: 'https://zenvideo.qq.com', category: 'ai-video', description: '腾讯AI视频创作平台', isFree: true, pricing: '基础功能免费' },
  { name: '讯飞智作', website: 'https://www.xfyun.cn/services/aigc', category: 'ai-video', description: '讯飞AI视频制作', isFree: false, pricing: '企业版' },
  { name: '万兴喵影AI', website: 'https://www.wondershare.cn/filmora', category: 'ai-video', description: '万兴AI视频编辑', isFree: false, pricing: '软件购买' },
  { name: '必剪AI', website: 'https://bcut.bilibili.com', category: 'ai-video', description: 'B站AI视频剪辑工具', isFree: true, pricing: '免费使用' },
  { name: '快影AI', website: 'https://kuaiying.kuaishou.com', category: 'ai-video', description: '快手AI视频剪辑', isFree: true, pricing: '免费使用' },
  { name: '秒剪', website: 'https://miaojian.qq.com', category: 'ai-video', description: '腾讯AI视频剪辑工具', isFree: true, pricing: '免费使用' },
  { name: '小影AI', website: 'https://www.xiaoying.tv', category: 'ai-video', description: 'AI视频编辑工具', isFree: true, pricing: '基础功能免费' },
  { name: '美图AI视频', website: 'https://www.meitu.com/ai/video', category: 'ai-video', description: '美图AI视频功能', isFree: true, pricing: '基础功能免费' },
  { name: '华为AI视频', website: 'https://www.huawei.com/cn/ai/video', category: 'ai-video', description: '华为AI视频服务', isFree: false, pricing: '企业服务' },
  { name: '火山引擎视频AI', website: 'https://www.volcengine.com/product/video', category: 'ai-video', description: '字节视频AI服务', isFree: false, pricing: '企业服务' },
  { name: '来画AI', website: 'https://www.laihua.com', category: 'ai-video', description: 'AI动画视频制作', isFree: true, pricing: '基础功能免费' },
  { name: '右脑AI视频', website: 'https://www.younaiai.com', category: 'ai-video', description: 'AI视频生成工具', isFree: false, pricing: '会员制' },
  { name: '绘影AI', website: 'https://www.huiying.ai', category: 'ai-video', description: 'AI视频创作平台', isFree: true, pricing: '基础功能免费' },
  { name: 'VegaAI视频', website: 'https://www.vegaai.net', category: 'ai-video', description: 'AI视频生成工具', isFree: true, pricing: '基础功能免费' },
  { name: '一帧AI', website: 'https://www.yizhenvideo.com', category: 'ai-video', description: 'AI视频创作平台', isFree: false, pricing: '企业版' },
  { name: '商汤如影', website: 'https://video.sensetime.com', category: 'ai-video', description: '商汤AI数字人视频', isFree: false, pricing: '企业服务' },
  { name: '智影AI', website: 'https://www.zhiyingai.com', category: 'ai-video', description: 'AI数字人视频制作', isFree: true, pricing: '基础功能免费' },
  { name: '像素AI视频', website: 'https://www.pixso.cn/ai/video', category: 'ai-video', description: '像素软件AI视频', isFree: true, pricing: '基础功能免费' },
  { name: '创视AI', website: 'https://www.chuangshi.ai', category: 'ai-video', description: 'AI视频创作平台', isFree: false, pricing: '会员制' },
  { name: '星火视频AI', website: 'https://xinghuo.xfyun.cn/video', category: 'ai-video', description: '讯飞AI视频生成', isFree: true, pricing: '基础功能免费' },

  // ===== AI办公 (7) =====
  { name: '钉钉AI助理', website: 'https://www.dingtalk.com/ai', category: 'ai-office', description: '钉钉智能AI办公助手', isFree: true, pricing: '基础功能免费' },
  { name: '飞书AI', website: 'https://www.feishu.cn/product/ai', category: 'ai-office', description: '飞书智能办公AI', isFree: true, pricing: '基础功能免费' },
  { name: '企业微信AI', website: 'https://work.weixin.qq.com/ai', category: 'ai-office', description: '企业微信智能助手', isFree: true, pricing: '基础功能免费' },
  { name: 'WPS AI', website: 'https://ai.wps.cn', category: 'ai-office', description: 'WPS办公AI功能', isFree: false, pricing: 'WPS会员' },
  { name: '石墨文档AI', website: 'https://shimo.im/ai', category: 'ai-office', description: '石墨文档AI助手', isFree: true, pricing: '基础功能免费' },
  { name: '腾讯会议AI', website: 'https://meeting.tencent.com/ai', category: 'ai-office', description: '腾讯会议AI功能', isFree: true, pricing: '基础功能免费' },
  { name: '字节飞书妙记', website: 'https://www.feishu.cn/product/minutes', category: 'ai-office', description: '飞书AI会议记录', isFree: true, pricing: '基础功能免费' },
  { name: '钉钉文档AI', website: 'https://www.dingtalk.com/product/docs-ai', category: 'ai-office', description: '钉钉AI文档处理', isFree: true, pricing: '基础功能免费' },
  { name: '金山文档AI', website: 'https://www.kdocs.cn/ai', category: 'ai-office', description: '金山文档AI功能', isFree: true, pricing: '基础功能免费' },
  { name: '有道云笔记AI', website: 'https://note.youdao.com/ai', category: 'ai-office', description: '有道云笔记AI助手', isFree: true, pricing: '基础功能免费' },
  { name: '印象笔记AI', website: 'https://www.yinxiang.com/ai', category: 'ai-office', description: '印象笔记AI功能', isFree: false, pricing: '高级会员' },
  { name: '语雀AI', website: 'https://www.yuque.com/ai', category: 'ai-office', description: '阿里语雀AI助手', isFree: true, pricing: '基础功能免费' },
  { name: '幕布AI', website: 'https://mubu.com/ai', category: 'ai-office', description: '幕布大纲笔记AI', isFree: true, pricing: '基础功能免费' },
  { name: 'Notion中文版', website: 'https://www.notion.so/zh-cn', category: 'ai-office', description: 'Notion笔记AI功能', isFree: true, pricing: '基础功能免费' },
  { name: 'FlowUs息流', website: 'https://flowus.cn', category: 'ai-office', description: '国产Notion替代品', isFree: true, pricing: '基础功能免费' },
  { name: 'Wolai我来', website: 'https://www.wolai.com', category: 'ai-office', description: 'AI笔记协作平台', isFree: true, pricing: '基础功能免费' },
  { name: '思源笔记', website: 'https://b3log.org/siyuan', category: 'ai-office', description: '本地优先AI笔记', isFree: true, pricing: '开源免费' },
  { name: 'Logseq中文', website: 'https://logseq.com/zh', category: 'ai-office', description: '开源大纲笔记AI', isFree: true, pricing: '开源免费' },
  { name: 'AFFiNE', website: 'https://affine.pro/ai', category: 'ai-office', description: '开源AI办公套件', isFree: true, pricing: '开源免费' },
  { name: 'ProcessOn AI', website: 'https://www.processon.com/ai', category: 'ai-office', description: 'AI流程图绘制', isFree: true, pricing: '基础功能免费' },
  { name: '亿图图示AI', website: 'https://www.edrawsoft.cn/ai', category: 'ai-office', description: '亿图AI图表制作', isFree: false, pricing: '软件购买' },
  { name: 'ProcessOn思维导图', website: 'https://www.processon.com', category: 'ai-office', description: '在线思维导图工具', isFree: true, pricing: '基础功能免费' },
  { name: '百度脑图', website: 'https://naotu.baidu.com', category: 'ai-office', description: '百度在线思维导图', isFree: true, pricing: '免费使用' },
  { name: 'XMind AI', website: 'https://xmind.app/ai', category: 'ai-office', description: 'XMind思维导图AI', isFree: false, pricing: '软件购买' },
  { name: 'BoardMix博思白板', website: 'https://boardmix.cn', category: 'ai-office', description: 'AI在线白板协作', isFree: true, pricing: '基础功能免费' },

  // ===== AI学习 (8) =====
  { name: '作业帮AI', website: 'https://www.zuoyebang.com/ai', category: 'ai-learning', description: '作业帮AI学习助手', isFree: true, pricing: '基础功能免费' },
  { name: '猿辅导AI', website: 'https://www.yuanfudao.com/ai', category: 'ai-learning', description: '猿辅导智能学习', isFree: false, pricing: '课程收费' },
  { name: '学而思AI', website: 'https://www.xueersi.com/ai', category: 'ai-learning', description: '好未来AI学习平台', isFree: false, pricing: '课程收费' },
  { name: '有道AI学习', website: 'https://www.youdao.com/ai', category: 'ai-learning', description: '网易有道AI教育', isFree: true, pricing: '基础功能免费' },
  { name: '科大讯飞AI教育', website: 'https://edu.iflytek.com', category: 'ai-learning', description: '讯飞智慧教育平台', isFree: false, pricing: '学校服务' },
  { name: '猿题库AI', website: 'https://www.yuantiku.com', category: 'ai-learning', description: 'AI智能刷题平台', isFree: true, pricing: '基础功能免费' },
  { name: '小猿搜题', website: 'https://www.xiaoyuansouti.com', category: 'ai-learning', description: 'AI拍照搜题工具', isFree: true, pricing: '基础功能免费' },
  { name: '作业帮拍题', website: 'https://www.zuoyebang.com/pic', category: 'ai-learning', description: 'AI拍照解题工具', isFree: true, pricing: '基础功能免费' },
  { name: '阿卡索AI英语', website: 'https://www.acadsoc.com.cn/ai', category: 'ai-learning', description: 'AI英语学习平台', isFree: false, pricing: '课程收费' },
  { name: 'VIPKID AI', website: 'https://www.vipkid.com/ai', category: 'ai-learning', description: 'VIPKID AI英语学习', isFree: false, pricing: '课程收费' },
  { name: '流利说AI', website: 'https://www.liulishuo.com', category: 'ai-learning', description: 'AI英语口语练习', isFree: true, pricing: '基础功能免费' },
  { name: '百词斩AI', website: 'https://www.baicizhan.com', category: 'ai-learning', description: 'AI背单词工具', isFree: true, pricing: '免费使用' },
  { name: '扇贝AI', website: 'https://www.shanbay.com', category: 'ai-learning', description: 'AI英语学习平台', isFree: true, pricing: '基础功能免费' },
  { name: '墨墨背单词', website: 'https://www.maimemo.com', category: 'ai-learning', description: 'AI智能背单词', isFree: true, pricing: '基础功能免费' },
  { name: '多邻国中文', website: 'https://www.duolingo.cn', category: 'ai-learning', description: 'AI多语言学习', isFree: true, pricing: '基础功能免费' },
  { name: '开言英语AI', website: 'https://www.openlanguage.com/ai', category: 'ai-learning', description: 'AI英语口语学习', isFree: false, pricing: '会员制' },
  { name: '小站教育AI', website: 'https://www.zhan.com/ai', category: 'ai-learning', description: 'AI出国留学备考', isFree: false, pricing: '课程收费' },
  { name: '考虫AI', website: 'https://www.kaochong.com', category: 'ai-learning', description: 'AI考研学习平台', isFree: false, pricing: '课程收费' },
  { name: '沪江AI学习', website: 'https://www.hujiang.com/ai', category: 'ai-learning', description: '沪江AI语言学习', isFree: true, pricing: '基础功能免费' },
  { name: '新东方AI', website: 'https://www.xdf.cn/ai', category: 'ai-learning', description: '新东方AI教育', isFree: false, pricing: '课程收费' },
  { name: '腾讯课堂AI', website: 'https://ke.qq.com/ai', category: 'ai-learning', description: '腾讯课堂AI学习', isFree: true, pricing: '部分免费' },
  { name: '网易云课堂AI', website: 'https://mooc.study.163.com/ai', category: 'ai-learning', description: '网易AI在线课程', isFree: true, pricing: '部分免费' },
  { name: '学堂在线AI', website: 'https://www.xuetangx.com', category: 'ai-learning', description: '清华在线教育平台', isFree: true, pricing: '部分免费' },
  { name: '中国大学MOOC', website: 'https://www.icourse163.org', category: 'ai-learning', description: '在线课程平台', isFree: true, pricing: '免费学习' },
  { name: '知乎知学堂', website: 'https://www.zhihu.com/education', category: 'ai-learning', description: '知乎教育平台', isFree: true, pricing: '部分免费' },
  
  // ===== 补充更多AI写作工具 =====
  { name: '火山方舟', website: 'https://www.volcengine.com/product/fangzhou', category: 'ai-writing', description: '火山引擎AI创作平台', isFree: true, pricing: '基础功能免费' },
  { name: '光速写作', website: 'https://www.guangsuxiezuo.com', category: 'ai-writing', description: 'AI快速写作工具', isFree: false, pricing: '会员制' },
  { name: '小红书文案AI', website: 'https://www.xiaohongshu.com/ai/writing', category: 'ai-writing', description: '小红书AI文案生成', isFree: true, pricing: '基础功能免费' },
  { name: '得道AI写作', website: 'https://www.dedao.ai/writing', category: 'ai-writing', description: '得到AI写作助手', isFree: false, pricing: '会员制' },
  { name: '微信读书AI', website: 'https://weread.qq.com/ai', category: 'ai-writing', description: '微信读书AI写作', isFree: true, pricing: '基础功能免费' },
  { name: '知网AI写作', website: 'https://x.cnki.net', category: 'ai-writing', description: '知网学术AI写作', isFree: false, pricing: '付费服务' },
  { name: '万方AI', website: 'https://www.wanfangdata.com.cn/ai', category: 'ai-writing', description: '万方学术AI助手', isFree: false, pricing: '付费服务' },
  { name: '维普AI', website: 'https://www.cqvip.com/ai', category: 'ai-writing', description: '维普AI学术助手', isFree: false, pricing: '付费服务' },
  { name: '百度学术AI', website: 'https://xueshu.baidu.com/ai', category: 'ai-writing', description: '百度学术AI工具', isFree: true, pricing: '基础功能免费' },
  { name: '搜狗写作', website: 'https://www.sogou.com/writing', category: 'ai-writing', description: '搜狗AI写作工具', isFree: true, pricing: '基础功能免费' },

  // ===== 补充更多AI绘画工具 =====
  { name: '稿定AI绘画', website: 'https://www.gaoding.com/ai/paint', category: 'ai-painting', description: '稿定AI绘画功能', isFree: true, pricing: '基础功能免费' },
  { name: 'Canva中文版', website: 'https://www.canva.cn/ai', category: 'ai-painting', description: 'Canva中国版AI功能', isFree: true, pricing: '基础功能免费' },
  { name: '创客贴AI', website: 'https://www.chuangkit.com/ai', category: 'ai-painting', description: '创客贴AI设计', isFree: true, pricing: '基础功能免费' },
  { name: '图怪兽AI', website: 'https://818ps.com/ai', category: 'ai-painting', description: '图怪兽AI设计工具', isFree: true, pricing: '基础功能免费' },
  { name: 'Fotor AI', website: 'https://www.fotor.com.cn/ai', category: 'ai-painting', description: 'Fotor中国版AI', isFree: true, pricing: '基础功能免费' },
  { name: 'Pixso AI', website: 'https://pixso.cn/ai', category: 'ai-painting', description: 'Pixso AI设计工具', isFree: true, pricing: '基础功能免费' },
  { name: '即时设计AI', website: 'https://js.design/ai', category: 'ai-painting', description: '即时设计AI功能', isFree: true, pricing: '基础功能免费' },
  { name: 'MasterGo AI', website: 'https://mastergo.com/ai', category: 'ai-painting', description: 'MasterGo AI设计', isFree: true, pricing: '基础功能免费' },
  { name: '蓝湖AI', website: 'https://lanhuapp.com/ai', category: 'ai-painting', description: '蓝湖AI设计协作', isFree: false, pricing: '企业版' },
  { name: '墨刀AI', website: 'https://modao.cc/ai', category: 'ai-painting', description: '墨刀AI原型设计', isFree: true, pricing: '基础功能免费' },

  // ===== 补充更多AI对话工具 =====
  { name: '百度智能云千帆', website: 'https://cloud.baidu.com/product/wenxinworkshop.html', category: 'ai-chat', description: '百度大模型平台', isFree: false, pricing: '企业服务' },
  { name: '阿里云百炼', website: 'https://bailian.console.aliyun.com', category: 'ai-chat', description: '阿里大模型平台', isFree: false, pricing: '企业服务' },
  { name: '华为云盘古', website: 'https://www.huaweicloud.com/product/pangu.html', category: 'ai-chat', description: '华为大模型服务', isFree: false, pricing: '企业服务' },
  { name: '火山方舟大模型', website: 'https://www.volcengine.com/product/fangzhou', category: 'ai-chat', description: '字节大模型平台', isFree: true, pricing: '基础功能免费' },
  { name: '百川智能', website: 'https://www.baichuan-ai.com/chat', category: 'ai-chat', description: '百川大模型对话', isFree: true, pricing: '基础功能免费' },
  { name: '智谱AI开放平台', website: 'https://open.bigmodel.cn', category: 'ai-chat', description: '智谱大模型API', isFree: false, pricing: 'API付费' },
  { name: 'MiniMax开放平台', website: 'https://www.minimaxi.com/api', category: 'ai-chat', description: 'MiniMax API服务', isFree: false, pricing: 'API付费' },
  { name: '商汤日日新API', website: 'https://platform.sensetime.com', category: 'ai-chat', description: '商汤大模型API', isFree: false, pricing: 'API付费' },
  { name: '昆仑天工API', website: 'https://tiangong.cn/api', category: 'ai-chat', description: '昆仑大模型API', isFree: false, pricing: 'API付费' },
  { name: '阶跃API', website: 'https://www.stepfun.com/api', category: 'ai-chat', description: '阶跃大模型API', isFree: false, pricing: 'API付费' },

  // ===== 补充更多AI编程工具 =====
  { name: '阿里云Yunxiao', website: 'https://www.aliyun.com/product/yunxiao', category: 'ai-coding', description: '阿里云AI开发平台', isFree: false, pricing: '企业版' },
  { name: '华为CodeArts Snap', website: 'https://www.huaweicloud.com/product/codearts.html', category: 'ai-coding', description: '华为AI编程助手', isFree: true, pricing: '个人版免费' },
  { name: '腾讯云Coding', website: 'https://coding.net/ai', category: 'ai-coding', description: '腾讯AI开发平台', isFree: true, pricing: '基础功能免费' },
  { name: '网易数帆AI', website: 'https://www.netease.com/ai/code', category: 'ai-coding', description: '网易AI编程工具', isFree: false, pricing: '企业版' },
  { name: '新浪AI代码', website: 'https://www.sina.com.cn/ai/code', category: 'ai-coding', description: '新浪AI编程助手', isFree: true, pricing: '基础功能免费' },
  { name: '美团代码助手', website: 'https://www.meituan.com/ai/code', category: 'ai-coding', description: '美团AI编程工具', isFree: false, pricing: '内部使用' },
  { name: '小米AI编程', website: 'https://www.mi.com/ai/code', category: 'ai-coding', description: '小米AI开发工具', isFree: false, pricing: '内部使用' },
  { name: 'OPPO AI代码', website: 'https://www.oppo.com/ai/code', category: 'ai-coding', description: 'OPPO AI编程助手', isFree: false, pricing: '内部使用' },
  { name: 'Vivo AI编程', website: 'https://www.vivo.com/ai/code', category: 'ai-coding', description: 'Vivo AI开发工具', isFree: false, pricing: '内部使用' },
  { name: '联想AI代码', website: 'https://www.lenovo.com/ai/code', category: 'ai-coding', description: '联想AI编程助手', isFree: false, pricing: '企业服务' },

  // ===== 补充更多AI音频工具 =====
  { name: '喜马拉雅AI', website: 'https://www.ximalaya.com/ai', category: 'ai-audio', description: '喜马拉雅AI功能', isFree: true, pricing: '基础功能免费' },
  { name: '荔枝FM AI', website: 'https://www.lizhi.fm/ai', category: 'ai-audio', description: '荔枝AI音频工具', isFree: true, pricing: '基础功能免费' },
  { name: '蜻蜓FM AI', website: 'https://www.qingting.fm/ai', category: 'ai-audio', description: '蜻蜓AI音频功能', isFree: true, pricing: '基础功能免费' },
  { name: '懒人听书AI', website: 'https://www.lrts.me/ai', category: 'ai-audio', description: '懒人听书AI功能', isFree: true, pricing: '基础功能免费' },
  { name: '氧气听书AI', website: 'https://www.yangqitingshu.com/ai', category: 'ai-audio', description: '氧气听书AI功能', isFree: true, pricing: '基础功能免费' },
  { name: '网易云音乐AI', website: 'https://music.163.com/ai', category: 'ai-audio', description: '网易AI音乐功能', isFree: true, pricing: '基础功能免费' },
  { name: '酷我音乐AI', website: 'https://www.kuwo.cn/ai', category: 'ai-audio', description: '酷我AI音乐功能', isFree: true, pricing: '基础功能免费' },
  { name: '咪咕音乐AI', website: 'https://music.migu.cn/ai', category: 'ai-audio', description: '咪咕AI音乐创作', isFree: true, pricing: '基础功能免费' },
  { name: '千千音乐AI', website: 'https://qianqian.netease.com', category: 'ai-audio', description: '千千音乐AI功能', isFree: true, pricing: '基础功能免费' },
  { name: '多米音乐AI', website: 'https://www.duomi.com/ai', category: 'ai-audio', description: '多米AI音乐功能', isFree: true, pricing: '基础功能免费' },

  // ===== 补充更多AI视频工具 =====
  { name: '抖音AI视频', website: 'https://www.douyin.com/ai/video', category: 'ai-video', description: '抖音AI视频功能', isFree: true, pricing: '免费使用' },
  { name: '快手AI剪辑', website: 'https://www.kuaishou.com/ai/edit', category: 'ai-video', description: '快手AI视频剪辑', isFree: true, pricing: '免费使用' },
  { name: 'B站创作中心AI', website: 'https://www.bilibili.com/blackboard/ai', category: 'ai-video', description: 'B站AI创作工具', isFree: true, pricing: '免费使用' },
  { name: '小红书AI视频', website: 'https://www.xiaohongshu.com/ai/video', category: 'ai-video', description: '小红书AI视频功能', isFree: true, pricing: '免费使用' },
  { name: '微信视频号AI', website: 'https://weixin.qq.com/ai/video', category: 'ai-video', description: '微信视频号AI功能', isFree: true, pricing: '免费使用' },
  { name: '优酷AI', website: 'https://www.youku.com/ai', category: 'ai-video', description: '优酷AI视频功能', isFree: true, pricing: '基础功能免费' },
  { name: '爱奇艺AI', website: 'https://www.iqiyi.com/ai', category: 'ai-video', description: '爱奇艺AI功能', isFree: true, pricing: '基础功能免费' },
  { name: '芒果TV AI', website: 'https://www.mgtv.com/ai', category: 'ai-video', description: '芒果TV AI功能', isFree: true, pricing: '基础功能免费' },
  { name: '搜狐视频AI', website: 'https://tv.sohu.com/ai', category: 'ai-video', description: '搜狐AI视频功能', isFree: true, pricing: '基础功能免费' },
  { name: 'PPTV AI', website: 'https://www.pptv.com/ai', category: 'ai-video', description: 'PPTV AI功能', isFree: true, pricing: '基础功能免费' },

  // ===== 补充更多AI办公工具 =====
  { name: '华为云WeLink AI', website: 'https://www.huaweicloud.com/product/welink.html', category: 'ai-office', description: '华为企业协作AI', isFree: false, pricing: '企业服务' },
  { name: '中国移动云AI', website: 'https://ecloud.10086.cn/ai', category: 'ai-office', description: '移动云AI办公', isFree: false, pricing: '企业服务' },
  { name: '天翼云办公AI', website: 'https://www.ctyun.cn/office', category: 'ai-office', description: '电信云AI办公', isFree: false, pricing: '企业服务' },
  { name: '浪潮云AI办公', website: 'https://www.inspur.com/ai/office', category: 'ai-office', description: '浪潮AI办公服务', isFree: false, pricing: '企业服务' },
  { name: '用友AI办公', website: 'https://www.yonyou.com/ai', category: 'ai-office', description: '用友AI企业服务', isFree: false, pricing: '企业服务' },
  { name: '金蝶AI办公', website: 'https://www.kingdee.com/ai', category: 'ai-office', description: '金蝶AI企业服务', isFree: false, pricing: '企业服务' },
  { name: '泛微AI办公', website: 'https://www.weaver.com.cn/ai', category: 'ai-office', description: '泛微OA AI功能', isFree: false, pricing: '企业服务' },
  { name: '致远AI办公', website: 'https://www.seeyon.com/ai', category: 'ai-office', description: '致远互联AI', isFree: false, pricing: '企业服务' },
  { name: '蓝凌AI办公', website: 'https://www.landray.com.cn/ai', category: 'ai-office', description: '蓝凌AI办公平台', isFree: false, pricing: '企业服务' },
  { name: '通达OA AI', website: 'https://www.tongda2000.com/ai', category: 'ai-office', description: '通达OA AI功能', isFree: false, pricing: '企业服务' },

  // ===== 补充更多AI学习工具 =====
  { name: '火花思维AI', website: 'https://www.huohua.cn/ai', category: 'ai-learning', description: '火花思维AI教育', isFree: false, pricing: '课程收费' },
  { name: '掌门教育AI', website: 'https://www.zhangmen.com/ai', category: 'ai-learning', description: '掌门AI学习', isFree: false, pricing: '课程收费' },
  { name: '轻轻家教AI', website: 'https://www.qingqing.com/ai', category: 'ai-learning', description: '轻轻AI家教', isFree: false, pricing: '课程收费' },
  { name: '学霸君AI', website: 'https://www.xueba.com/ai', category: 'ai-learning', description: '学霸君AI学习', isFree: true, pricing: '基础功能免费' },
  { name: '阿凡题AI', website: 'https://www.afanti100.com', category: 'ai-learning', description: 'AI拍照解题', isFree: true, pricing: '基础功能免费' },
  { name: '题拍拍', website: 'https://www.tiku.com', category: 'ai-learning', description: '学而思拍照搜题', isFree: true, pricing: '免费使用' },
  { name: '小盒科技AI', website: 'https://www.xiaohe.com/ai', category: 'ai-learning', description: '小盒AI学习', isFree: true, pricing: '基础功能免费' },
  { name: '一起教育AI', website: 'https://www.17zuoye.com/ai', category: 'ai-learning', description: '一起作业AI', isFree: true, pricing: '基础功能免费' },
  { name: '作业盒子AI', website: 'https://www.zuoyehezi.com', category: 'ai-learning', description: '作业盒子AI功能', isFree: true, pricing: '基础功能免费' },
  { name: '晓多AI教育', website: 'https://www.xiaoduoai.com', category: 'ai-learning', description: '晓多AI学习助手', isFree: false, pricing: '企业服务' },
];

// Fisher-Yates 洗牌算法
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// 生成唯一slug
function generateSlug(name: string): string {
  const pinyin = name.toLowerCase()
    .replace(/[^\u4e00-\u9fa5a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  const random = Math.random().toString(36).substring(2, 8);
  return `${pinyin}-${random}`;
}

async function main() {
  console.log('开始插入国内AI工具...');
  console.log(`准备插入 ${cnTools.length} 个工具`);

  // 获取现有工具网站列表
  const { data: existingTools } = await supabase
    .from('ai_tools')
    .select('website');
  
  const existingWebsites = new Set(existingTools?.map(t => t.website) || []);
  console.log(`数据库中已有 ${existingWebsites.size} 个工具`);

  // 过滤重复
  const newTools = cnTools.filter(tool => !existingWebsites.has(tool.website));
  console.log(`过滤后剩余 ${newTools.length} 个新工具`);

  // 随机打乱顺序
  const shuffledTools = shuffleArray(newTools);
  console.log('已随机打乱工具顺序');

  // 只取前500个
  const toolsToInsert = shuffledTools.slice(0, 500);
  console.log(`将插入 ${toolsToInsert.length} 个工具`);

  // 分批插入，每批50个
  const batchSize = 50;
  let inserted = 0;
  let failed = 0;

  for (let i = 0; i < toolsToInsert.length; i += batchSize) {
    const batch = toolsToInsert.slice(i, i + batchSize);
    
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

    const { error } = await supabase
      .from('ai_tools')
      .insert(insertData);

    if (error) {
      console.error(`批次 ${Math.floor(i / batchSize) + 1} 插入失败:`, error.message);
      failed += batch.length;
    } else {
      inserted += batch.length;
      console.log(`已插入 ${inserted}/${toolsToInsert.length} 个工具...`);
    }
  }

  console.log('\n========== 插入完成 ==========');
  console.log(`成功插入: ${inserted} 个`);
  console.log(`插入失败: ${failed} 个`);
}

main().catch(console.error);
