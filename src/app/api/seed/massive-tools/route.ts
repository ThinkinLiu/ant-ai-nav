import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

// 国内AI工具
const domesticTools = [
  // AI写作 - 国内
  { name: '文心一言', description: '百度AI大模型，中文写作能力强', website: 'https://yiyan.baidu.com', category: 'ai-writing', isFree: true },
  { name: '讯飞写作', description: '科大讯飞AI写作助手，公文写作专业', website: 'https://writing.iflyrec.com', category: 'ai-writing', isFree: true },
  { name: '秘塔写作猫', description: 'AI写作与纠错，中文优化专家', website: 'https://xiezuocat.com', category: 'ai-writing', isFree: false },
  { name: '火山写作', description: '字节跳动AI写作，多场景覆盖', website: 'https://www.volcengine.com/product/writing', category: 'ai-writing', isFree: true },
  { name: '彩云小梦', description: 'AI小说创作，故事续写神器', website: 'https://if.caiyunai.com', category: 'ai-writing', isFree: false },
  { name: '笔神作文', description: 'AI作文批改与辅导，学生写作助手', website: 'https://www.bishen.com', category: 'ai-writing', isFree: false },
  { name: '写作猫', description: 'AI写作辅助，内容创作平台', website: 'https://www.xiezuomao.com', category: 'ai-writing', isFree: false },
  { name: '智能公文', description: 'AI公文写作，政府机构专用', website: 'https://www.zngw.cn', category: 'ai-writing', isFree: false },
  { name: '达观写作', description: '企业级AI写作平台', website: 'https://www.datagrand.com', category: 'ai-writing', isFree: false },
  { name: '小发猫AI写作', description: '自媒体内容生成工具', website: 'https://www.xiaofamao.com', category: 'ai-writing', isFree: false },
  { name: '火龙果写作', description: 'AI写作与润色工具', website: 'https://www.mypitaya.com', category: 'ai-writing', isFree: false },
  { name: '深言达意', description: '清华AI写作助手', website: 'https://www.shenyandayi.com', category: 'ai-writing', isFree: true },
  { name: '云从写作', description: '云从科技AI写作产品', website: 'https://www.cloudwalk.cn', category: 'ai-writing', isFree: false },
  { name: '灵感写作', description: '创意写作AI助手', website: 'https://www.lingganxiezu.com', category: 'ai-writing', isFree: false },
  { name: '笔杆子AI', description: '公文写作AI工具', website: 'https://www.bgzai.com', category: 'ai-writing', isFree: false },
  { name: '知言写作', description: '专业AI写作平台', website: 'https://www.zhiyanai.com', category: 'ai-writing', isFree: false },
  { name: '易撰AI', description: '自媒体内容创作平台', website: 'https://www.yizhuan5.com', category: 'ai-writing', isFree: false },
  { name: '壹写作', description: '小说创作AI工具', website: 'https://www.1xiezuo.com', category: 'ai-writing', isFree: false },
  { name: '写作精灵', description: 'AI内容生成助手', website: 'https://www.xiezuoai.com', category: 'ai-writing', isFree: false },
  { name: '智谱写作', description: '智谱AI写作产品', website: 'https://www.zhipuai.cn', category: 'ai-writing', isFree: true },

  // AI绘画 - 国内
  { name: '文心一格', description: '百度AI绘画平台，中文理解优秀', website: 'https://yige.baidu.com', category: 'ai-painting', isFree: true },
  { name: '通义万相', description: '阿里AI绘画，多风格图像生成', website: 'https://tongyi.aliyun.com/wanxiang', category: 'ai-painting', isFree: true },
  { name: '即时设计AI', description: '设计协作平台AI绘画功能', website: 'https://js.design', category: 'ai-painting', isFree: true },
  { name: '稿定AI', description: '电商设计AI工具', website: 'https://www.gaoding.com', category: 'ai-painting', isFree: false },
  { name: '美图设计室', description: '美图AI设计工具', website: 'https://www.x-design.com', category: 'ai-painting', isFree: true },
  { name: '堆友AI', description: 'D.ID社区AI绘画平台', website: 'https://d-id.com', category: 'ai-painting', isFree: false },
  { name: '造物云AI', description: '电商产品图生成', website: 'https://www.zaowuyun.com', category: 'ai-painting', isFree: false },
  { name: '皮卡智能', description: 'AI图像处理平台', website: 'https://www.pkjpg.com', category: 'ai-painting', isFree: false },
  { name: '图怪兽AI', description: '在线设计AI辅助', website: 'https://818ps.com', category: 'ai-painting', isFree: true },
  { name: '创客贴AI', description: 'AI设计海报生成', website: 'https://www.chuangkit.com', category: 'ai-painting', isFree: true },
  { name: '魔力工作室', description: 'Canva中国版AI设计', website: 'https://www.canva.cn', category: 'ai-painting', isFree: true },
  { name: '6pen', description: 'AI绘画创作平台', website: 'https://6pen.art', category: 'ai-painting', isFree: true },
  { name: '盗梦师', description: 'AI艺术绘画工具', website: 'https://www.printidea.art', category: 'ai-painting', isFree: false },
  { name: 'YuanJing', description: '字节AI绘画平台', website: 'https://yuanjing.volcengine.com', category: 'ai-painting', isFree: true },
  { name: '智绘AI', description: '智能绘画创作工具', website: 'https://www.zhihui.com', category: 'ai-painting', isFree: false },
  { name: '画宇宙', description: 'AI绘画创作社区', website: 'https://www.huayuzhou.com', category: 'ai-painting', isFree: false },
  { name: '无界AI', description: 'AIGC创作平台', website: 'https://www.wujieai.com', category: 'ai-painting', isFree: true },
  { name: '意间AI', description: 'AI绘画内容创作', website: 'https://www.yjai.art', category: 'ai-painting', isFree: false },
  { name: '像素工坊', description: 'AI像素画生成器', website: 'https://www.pixelwork.com', category: 'ai-painting', isFree: false },
  { name: '梦幻AI', description: '梦境风格AI绘画', website: 'https://www.dreamai.com', category: 'ai-painting', isFree: false },

  // AI对话 - 国内
  { name: '通义千问', description: '阿里AI助手，中文理解优秀', website: 'https://tongyi.aliyun.com', category: 'ai-chat', isFree: true },
  { name: 'Kimi', description: '月之暗面AI，超长文本处理', website: 'https://kimi.moonshot.cn', category: 'ai-chat', isFree: true },
  { name: '智谱清言', description: '智谱AI大模型对话', website: 'https://chatglm.cn', category: 'ai-chat', isFree: true },
  { name: '讯飞星火', description: '科大讯飞AI大模型', website: 'https://xinghuo.xfyun.cn', category: 'ai-chat', isFree: true },
  { name: '豆包', description: '字节跳动AI助手', website: 'https://www.doubao.com', category: 'ai-chat', isFree: true },
  { name: '腾讯混元', description: '腾讯AI大模型', website: 'https://hunyuan.tencent.com', category: 'ai-chat', isFree: true },
  { name: '百川大模型', description: '百川智能AI助手', website: 'https://www.baichuan-ai.com', category: 'ai-chat', isFree: true },
  { name: 'MiniMax', description: 'MiniMax AI对话', website: 'https://www.minimaxi.com', category: 'ai-chat', isFree: true },
  { name: '商量SenseChat', description: '商汤AI大模型', website: 'https://chat.sensetime.com', category: 'ai-chat', isFree: true },
  { name: '阶跃星辰', description: 'StepChat AI助手', website: 'https://www.stepfun.com', category: 'ai-chat', isFree: true },
  { name: '紫东太初', description: '中科院AI大模型', website: 'https://www.taichu.ai', category: 'ai-chat', isFree: true },
  { name: '天工AI', description: '昆仑万维AI助手', website: 'https://www.tiangong.cn', category: 'ai-chat', isFree: true },
  { name: '360智脑', description: '360 AI大模型', website: 'https://ai.360.com', category: 'ai-chat', isFree: true },
  { name: '网易有道AI', description: '网易AI对话助手', website: 'https://ai.youdao.com', category: 'ai-chat', isFree: true },
  { name: '小爱同学', description: '小米AI语音助手', website: 'https://xiaoai.mi.com', category: 'ai-chat', isFree: true },
  { name: '小度助手', description: '百度AI语音助手', website: 'https://dueros.baidu.com', category: 'ai-chat', isFree: true },
  { name: '天猫精灵', description: '阿里智能语音助手', website: 'https://www.tmallgenie.com', category: 'ai-chat', isFree: true },
  { name: 'YOYA AI', description: '网易云音乐AI助手', website: 'https://yoya.163.com', category: 'ai-chat', isFree: true },
  { name: '知乎直答', description: '知乎AI问答助手', website: 'https://zhida.zhihu.com', category: 'ai-chat', isFree: true },
  { name: '秘塔AI搜索', description: 'AI智能搜索引擎', website: 'https://metaso.cn', category: 'ai-chat', isFree: true },

  // AI编程 - 国内
  { name: 'CodeGeeX', description: '清华AI代码生成，支持中文', website: 'https://codegeex.cn', category: 'ai-coding', isFree: true },
  { name: '通义灵码', description: '阿里AI编程助手', website: 'https://tongyi.aliyun.com/lingma', category: 'ai-coding', isFree: true },
  { name: 'CodeFu', description: 'AI代码审查工具', website: 'https://www.codefu.cn', category: 'ai-coding', isFree: false },
  { name: '智码AI', description: 'AI智能编程助手', website: 'https://www.zhimaai.com', category: 'ai-coding', isFree: false },
  { name: '编程狮AI', description: '在线编程AI辅助', website: 'https://www.w3cschool.cn', category: 'ai-coding', isFree: true },
  { name: '思码AI', description: 'AI代码生成工具', website: 'https://www.simaai.com', category: 'ai-coding', isFree: false },
  { name: '码上AI', description: '智能代码助手', website: 'https://www.mashangai.com', category: 'ai-coding', isFree: false },
  { name: '百度Comate', description: '百度AI编程助手', website: 'https://comate.baidu.com', category: 'ai-coding', isFree: true },
  { name: '腾讯云AI代码', description: '腾讯AI编程服务', website: 'https://cloud.tencent.com/product/code', category: 'ai-coding', isFree: false },
  { name: '华为云CodeArts', description: '华为AI开发工具', website: 'https://www.huaweicloud.com/product/codearts.html', category: 'ai-coding', isFree: false },
  { name: '字节豆包MarsCode', description: '字节AI编程助手', website: 'https://www.marscode.cn', category: 'ai-coding', isFree: true },
  { name: 'Gitee AI', description: '码云AI编程助手', website: 'https://ai.gitee.com', category: 'ai-coding', isFree: true },
  { name: '码力AI', description: 'AI代码补全工具', website: 'https://www.mali.ai', category: 'ai-coding', isFree: false },
  { name: '编程猫AI', description: '青少年编程AI助手', website: 'https://www.codemao.cn', category: 'ai-coding', isFree: true },
  { name: '图灵AI编程', description: 'AI辅助开发平台', website: 'https://www.tulingai.com', category: 'ai-coding', isFree: false },

  // AI音频 - 国内
  { name: '讯飞配音', description: 'AI语音合成，配音工具', website: 'https://peiyin.xunfei.cn', category: 'ai-audio', isFree: false },
  { name: '阿里云TTS', description: '阿里语音合成服务', website: 'https://www.aliyun.com/product/nls', category: 'ai-audio', isFree: false },
  { name: '腾讯云语音', description: '腾讯AI语音服务', website: 'https://cloud.tencent.com/product/tts', category: 'ai-audio', isFree: false },
  { name: '百度语音', description: '百度AI语音平台', website: 'https://ai.baidu.com/tech/speech', category: 'ai-audio', isFree: true },
  { name: '魔音工坊', description: 'AI配音与语音合成', website: 'https://www.moyin.com', category: 'ai-audio', isFree: false },
  { name: '配音神器', description: 'AI配音工具', website: 'https://www.peiyinshenqi.com', category: 'ai-audio', isFree: false },
  { name: '讯飞听见', description: 'AI会议转写', website: 'https://www.iflyrec.com', category: 'ai-audio', isFree: false },
  { name: '飞书妙记', description: '字节AI会议记录', website: 'https://www.feishu.cn/product/minutes', category: 'ai-audio', isFree: true },
  { name: '通义听悟', description: '阿里AI会议助手', website: 'https://tingwu.aliyun.com', category: 'ai-audio', isFree: true },
  { name: '网易见外', description: '网易AI转写工具', website: 'https://jianwai.youdao.com', category: 'ai-audio', isFree: true },
  { name: '剪映AI配音', description: '抖音剪映AI配音', website: 'https://www.capcut.cn', category: 'ai-audio', isFree: true },
  { name: '酷狗AI', description: '酷狗音乐AI功能', website: 'https://www.kugou.com', category: 'ai-audio', isFree: true },
  { name: '天音AI', description: 'AI音乐创作平台', website: 'https://www.tianyinai.com', category: 'ai-audio', isFree: false },
  { name: '虚拟歌姬', description: 'AI虚拟歌手平台', website: 'https://www.vocaloidchina.com', category: 'ai-audio', isFree: false },
  { name: '喜马拉雅AI', description: '有声内容AI工具', website: 'https://www.ximalaya.com', category: 'ai-audio', isFree: true },

  // AI视频 - 国内
  { name: '剪映AI', description: '抖音AI视频编辑工具', website: 'https://www.capcut.cn', category: 'ai-video', isFree: true },
  { name: '快影AI', description: '快手AI视频编辑', website: 'https://www.kuaiying.net', category: 'ai-video', isFree: true },
  { name: '必剪AI', description: 'B站AI视频工具', website: 'https://bcut.bilibili.cn', category: 'ai-video', isFree: true },
  { name: '万兴喵影', description: 'AI视频编辑软件', website: 'https://www.wondershare.cn/filmora', category: 'ai-video', isFree: false },
  { name: '度加剪辑', description: '百度AI视频创作', website: 'https://dujia.baidu.com', category: 'ai-video', isFree: true },
  { name: '来画AI', description: 'AI动画视频制作', website: 'https://www.laihua.com', category: 'ai-video', isFree: false },
  { name: '右糖AI', description: 'AI视频模板制作', website: 'https://www.youtang.com', category: 'ai-video', isFree: false },
  { name: '美摄AI', description: 'AI视频编辑SDK', website: 'https://www.meishesdk.com', category: 'ai-video', isFree: false },
  { name: '创视通AI', description: '企业视频AI制作', website: 'https://www.chuangshito.com', category: 'ai-video', isFree: false },
  { name: '智影AI', description: '腾讯AI视频创作', website: 'https://zenvideo.qq.com', category: 'ai-video', isFree: true },
  { name: '网易AI视频', description: '网易视频AI工具', website: 'https://www.163.com', category: 'ai-video', isFree: true },
  { name: '一帧AI', description: 'AI视频创作平台', website: 'https://www.yizhenai.com', category: 'ai-video', isFree: false },
  { name: '魔法视频', description: 'AI特效视频制作', website: 'https://www.mofashipin.com', category: 'ai-video', isFree: false },
  { name: '绘影AI', description: 'AI动画视频生成', website: 'https://www.huiyin.com', category: 'ai-video', isFree: false },
  { name: '数字人AI', description: 'AI数字人视频制作', website: 'https://www.shuziren.com', category: 'ai-video', isFree: false },

  // AI办公 - 国内
  { name: '飞书AI', description: '字节AI协作平台', website: 'https://www.feishu.cn', category: 'ai-office', isFree: true },
  { name: '钉钉AI', description: '阿里AI办公助手', website: 'https://www.dingtalk.com', category: 'ai-office', isFree: true },
  { name: '企业微信AI', description: '腾讯企业办公AI', website: 'https://work.weixin.qq.com', category: 'ai-office', isFree: true },
  { name: 'WPS AI', description: '金山办公AI助手', website: 'https://ai.wps.cn', category: 'ai-office', isFree: false },
  { name: '腾讯文档AI', description: '腾讯AI文档协作', website: 'https://docs.qq.com', category: 'ai-office', isFree: true },
  { name: '石墨文档AI', description: 'AI协作文档', website: 'https://shimo.im', category: 'ai-office', isFree: true },
  { name: '语雀AI', description: '阿里知识库AI', website: 'https://www.yuque.com', category: 'ai-office', isFree: true },
  { name: '幕布AI', description: 'AI思维导图工具', website: 'https://mubu.com', category: 'ai-office', isFree: true },
  { name: 'ProcessOn AI', description: 'AI流程图制作', website: 'https://www.processon.com', category: 'ai-office', isFree: true },
  { name: 'XMind AI', description: 'AI思维导图', website: 'https://www.xmind.cn', category: 'ai-office', isFree: false },
  { name: '有道云笔记AI', description: '网易AI笔记', website: 'https://note.youdao.com', category: 'ai-office', isFree: true },
  { name: '印象笔记AI', description: 'AI知识管理', website: 'https://www.yinxiang.com', category: 'ai-office', isFree: false },
  { name: '为知笔记AI', description: 'AI笔记助手', website: 'https://www.wiz.cn', category: 'ai-office', isFree: false },
  { name: '飞书文档AI', description: '字节AI文档', website: 'https://docs.feishu.cn', category: 'ai-office', isFree: true },
  { name: 'Teambition AI', description: '阿里AI项目管理', website: 'https://www.teambition.com', category: 'ai-office', isFree: true },

  // AI学习 - 国内
  { name: '作业帮AI', description: 'AI作业辅导', website: 'https://www.zybang.com', category: 'ai-learning', isFree: true },
  { name: '小猿搜题AI', description: 'AI拍照搜题', website: 'https://www.yuanfudao.com', category: 'ai-learning', isFree: true },
  { name: '学而思AI', description: '好未来AI教育', website: 'https://www.xueersi.com', category: 'ai-learning', isFree: false },
  { name: '猿编程AI', description: '青少年编程AI', website: 'https://code.yuanfudao.com', category: 'ai-learning', isFree: false },
  { name: '有道AI词典', description: '网易AI翻译词典', website: 'https://dict.youdao.com', category: 'ai-learning', isFree: true },
  { name: '百词斩AI', description: 'AI英语背单词', website: 'https://www.baicizhan.com', category: 'ai-learning', isFree: true },
  { name: '流利说AI', description: 'AI英语口语', website: 'https://www.liulishuo.com', category: 'ai-learning', isFree: false },
  { name: '开言英语AI', description: 'AI英语学习', website: 'https://www.kaopen.com', category: 'ai-learning', isFree: false },
  { name: '扇贝AI', description: 'AI英语学习平台', website: 'https://www.shanbay.com', category: 'ai-learning', isFree: true },
  { name: '墨墨背单词AI', description: 'AI单词记忆', website: 'https://www.maimemo.com', category: 'ai-learning', isFree: false },
  { name: '腾讯课堂AI', description: 'AI在线教育', website: 'https://ke.qq.com', category: 'ai-learning', isFree: true },
  { name: '网易公开课AI', description: 'AI课程推荐', website: 'https://open.163.com', category: 'ai-learning', isFree: true },
  { name: '学堂在线AI', description: '清华AI课程平台', website: 'https://www.xuetangx.com', category: 'ai-learning', isFree: true },
  { name: '中国大学MOOC AI', description: 'AI课程学习', website: 'https://www.icourse163.org', category: 'ai-learning', isFree: true },
  { name: '传智播客AI', description: 'IT培训AI辅助', website: 'https://www.itcast.cn', category: 'ai-learning', isFree: false },
]

// 国际AI工具 - 扩展列表
const internationalTools = [
  // AI写作 - 国际扩展
  { name: 'Writer.com', description: '企业AI写作平台', website: 'https://writer.com', category: 'ai-writing', isFree: false },
  { name: 'Longshot AI', description: '长篇内容AI生成', website: 'https://longshot.ai', category: 'ai-writing', isFree: false },
  { name: 'Simplified AI', description: 'AI内容创作套件', website: 'https://simplified.com', category: 'ai-writing', isFree: false },
  { name: 'Neuroflash', description: '德语AI写作工具', website: 'https://neuroflash.com', category: 'ai-writing', isFree: false },
  { name: 'TextCortex', description: 'AI写作助手', website: 'https://textcortex.com', category: 'ai-writing', isFree: false },
  { name: 'Writecream', description: 'AI营销文案生成', website: 'https://www.writecream.com', category: 'ai-writing', isFree: false },
  { name: 'Creaitor.ai', description: 'AI内容创作平台', website: 'https://www.creaitor.ai', category: 'ai-writing', isFree: false },
  { name: 'Hypotenuse AI', description: '电商内容AI', website: 'https://www.hypotenuse.ai', category: 'ai-writing', isFree: false },
  { name: 'Scalenut', description: 'SEO内容AI平台', website: 'https://www.scalenut.com', category: 'ai-writing', isFree: false },
  { name: 'Frase.io', description: 'AI SEO写作', website: 'https://www.frase.io', category: 'ai-writing', isFree: false },
  { name: 'Outranking.io', description: 'AI内容优化', website: 'https://www.outranking.io', category: 'ai-writing', isFree: false },
  { name: 'MarketMuse', description: 'AI内容策略', website: 'https://www.marketmuse.com', category: 'ai-writing', isFree: false },
  { name: 'Surfer SEO', description: 'AI SEO优化', website: 'https://surferseo.com', category: 'ai-writing', isFree: false },
  { name: 'INK Editor', description: 'AI SEO写作', website: 'https://inkforall.com', category: 'ai-writing', isFree: false },
  { name: 'ContentKing', description: 'AI内容监控', website: 'https://www.contentkingapp.com', category: 'ai-writing', isFree: false },
  { name: 'Clearscope', description: 'AI内容优化', website: 'https://www.clearscope.io', category: 'ai-writing', isFree: false },
  { name: 'Dashword', description: 'AI内容写作', website: 'https://dashword.com', category: 'ai-writing', isFree: false },
  { name: 'Writerly AI', description: 'AI内容创作', website: 'https://writerly.ai', category: 'ai-writing', isFree: false },
  { name: 'GoCharlie', description: 'AI营销内容', website: 'https://gocharlie.ai', category: 'ai-writing', isFree: false },
  { name: 'Peppertype.ai', description: 'AI文案生成', website: 'https://www.peppertype.ai', category: 'ai-writing', isFree: false },
  { name: 'Copysmith', description: 'AI电商文案', website: 'https://copysmith.ai', category: 'ai-writing', isFree: false },
  { name: 'Kafkai', description: 'AI文章生成', website: 'https://kafkai.com', category: 'ai-writing', isFree: false },
  { name: 'Article Builder', description: 'AI文章自动生成', website: 'https://articlebuilder.net', category: 'ai-writing', isFree: false },
  { name: 'Zyro AI Writer', description: '网站AI文案', website: 'https://zyro.com', category: 'ai-writing', isFree: true },
  { name: 'Smart Copy', description: 'Unbounce AI文案', website: 'https://unbounce.com', category: 'ai-writing', isFree: false },
  { name: 'Headlime', description: 'AI标题生成', website: 'https://headlime.com', category: 'ai-writing', isFree: false },
  { name: 'ZCopy', description: 'AI广告文案', website: 'https://www.zcopy.ai', category: 'ai-writing', isFree: false },
  { name: 'CopySmith', description: 'AI营销文案', website: 'https://copysmith.ai', category: 'ai-writing', isFree: false },
  { name: 'CopyGen', description: 'AI内容生成器', website: 'https://copygen.ai', category: 'ai-writing', isFree: false },
  { name: 'Texta.ai', description: 'AI博客写作', website: 'https://texta.ai', category: 'ai-writing', isFree: false },
  { name: 'WordHero', description: 'AI写作工具', website: 'https://wordhero.co', category: 'ai-writing', isFree: false },
  { name: 'Nichesss', description: 'AI内容创作', website: 'https://nichesss.com', category: 'ai-writing', isFree: false },
  { name: 'CopySpace', description: 'AI写作平台', website: 'https://copyspace.ai', category: 'ai-writing', isFree: false },
  { name: 'WriteAI.me', description: 'AI内容助手', website: 'https://writeai.me', category: 'ai-writing', isFree: false },
  { name: 'WriteSonic', description: 'AI作家助手', website: 'https://writesonic.com', category: 'ai-writing', isFree: false },

  // AI绘画 - 国际扩展
  { name: 'BlueWillow', description: '免费AI图像生成', website: 'https://www.bluewillow.ai', category: 'ai-painting', isFree: true },
  { name: 'Lexica Art', description: 'Stable Diffusion搜索', website: 'https://lexica.art', category: 'ai-painting', isFree: true },
  { name: 'OpenArt AI', description: 'AI图像搜索与生成', website: 'https://openart.ai', category: 'ai-painting', isFree: true },
  { name: 'Civitai', description: 'AI模型分享平台', website: 'https://civitai.com', category: 'ai-painting', isFree: true },
  { name: 'Tensor.art', description: 'AI图像生成社区', website: 'https://tensor.art', category: 'ai-painting', isFree: true },
  { name: 'Mage.space', description: '无限AI图像生成', website: 'https://www.mage.space', category: 'ai-painting', isFree: true },
  { name: 'SoulGen', description: 'AI人物图像生成', website: 'https://soulgen.ai', category: 'ai-painting', isFree: false },
  { name: 'PicSo', description: 'AI艺术创作', website: 'https://picso.ai', category: 'ai-painting', isFree: false },
  { name: 'Wonder AI', description: 'AI艺术生成器', website: 'https://www.wonder-ai.com', category: 'ai-painting', isFree: false },
  { name: ' Dawn AI', description: 'AI头像生成', website: 'https://www.dawn-ai.com', category: 'ai-painting', isFree: false },
  { name: 'Lensa AI', description: 'AI照片编辑', website: 'https://prisma-ai.com/lensa', category: 'ai-painting', isFree: false },
  { name: 'Prisma AI', description: 'AI滤镜艺术', website: 'https://prisma-ai.com', category: 'ai-painting', isFree: true },
  { name: 'Remini', description: 'AI照片修复', website: 'https://remini.ai', category: 'ai-painting', isFree: false },
  { name: 'Topaz Photo AI', description: 'AI图像增强', website: 'https://www.topazlabs.com/topaz-photo-ai', category: 'ai-painting', isFree: false },
  { name: 'Upscayl', description: '开源AI图像放大', website: 'https://upscayl.org', category: 'ai-painting', isFree: true },
  { name: 'Waifu2x', description: 'AI动漫图像放大', website: 'https://waifu2x.udp.jp', category: 'ai-painting', isFree: true },
  { name: 'BigJPG', description: 'AI图片无损放大', website: 'https://bigjpg.com', category: 'ai-painting', isFree: true },
  { name: 'LetsEnhance', description: 'AI图像增强', website: 'https://letsenhance.io', category: 'ai-painting', isFree: false },
  { name: 'VanceAI', description: 'AI图像处理套件', website: 'https://vanceai.com', category: 'ai-painting', isFree: false },
  { name: 'Icons8 AI', description: 'AI图标生成', website: 'https://icons8.com', category: 'ai-painting', isFree: false },
  { name: 'Flaticon AI', description: 'AI图标创作', website: 'https://www.flaticon.com', category: 'ai-painting', isFree: true },
  { name: 'Brandmark', description: 'AI品牌设计', website: 'https://brandmark.io', category: 'ai-painting', isFree: false },
  { name: 'Looka', description: 'AI Logo设计', website: 'https://looka.com', category: 'ai-painting', isFree: false },
  { name: 'Tailor Brands', description: 'AI品牌标识', website: 'https://www.tailorbrands.com', category: 'ai-painting', isFree: false },
  { name: 'Design.ai', description: 'AI设计套件', website: 'https://designs.ai', category: 'ai-painting', isFree: false },
  { name: 'Autodraw', description: 'Google AI绘图', website: 'https://www.autodraw.com', category: 'ai-painting', isFree: true },
  { name: 'Quick Draw', description: 'Google AI猜画', website: 'https://quickdraw.withgoogle.com', category: 'ai-painting', isFree: true },
  { name: 'Chimera Painter', description: 'AI生物生成', website: 'https://chimera-painter.firebaseapp.com', category: 'ai-painting', isFree: true },
  { name: 'Artbreeder', description: 'AI图像混合', website: 'https://www.artbreeder.com', category: 'ai-painting', isFree: true },
  { name: 'This Person Does Not Exist', description: 'AI人脸生成', website: 'https://thispersondoesnotexist.com', category: 'ai-painting', isFree: true },
  { name: 'This Cat Does Not Exist', description: 'AI猫咪生成', website: 'https://thiscatdoesnotexist.com', category: 'ai-painting', isFree: true },
  { name: 'Which Face Is Real', description: 'AI人脸辨别', website: 'https://www.whichfaceisreal.com', category: 'ai-painting', isFree: true },
  { name: 'Generated Photos', description: 'AI人物照片库', website: 'https://generated.photos', category: 'ai-painting', isFree: false },
  { name: 'Diversity Photos', description: 'AI多样化照片', website: 'https://diversityphotos.com', category: 'ai-painting', isFree: false },
  { name: 'Turing AI', description: 'AI图像识别', website: 'https://turing.com', category: 'ai-painting', isFree: false },

  // AI对话 - 国际扩展
  { name: 'Pi AI', description: 'Inflection AI助手', website: 'https://pi.ai', category: 'ai-chat', isFree: true },
  { name: 'Claude 3', description: 'Anthropic最新大模型', website: 'https://claude.ai', category: 'ai-chat', isFree: true },
  { name: 'GPT-4', description: 'OpenAI最强模型', website: 'https://openai.com/gpt-4', category: 'ai-chat', isFree: false },
  { name: 'ChatGPT Plus', description: 'ChatGPT付费版', website: 'https://chat.openai.com', category: 'ai-chat', isFree: false },
  { name: 'Bing Chat', description: '微软AI聊天', website: 'https://www.bing.com/new', category: 'ai-chat', isFree: true },
  { name: 'Copilot', description: '微软AI助手', website: 'https://copilot.microsoft.com', category: 'ai-chat', isFree: true },
  { name: 'Bard', description: 'Google AI聊天', website: 'https://bard.google.com', category: 'ai-chat', isFree: true },
  { name: 'Gemini Advanced', description: 'Google高级AI', website: 'https://gemini.google.com/advanced', category: 'ai-chat', isFree: false },
  { name: 'Llama Chat', description: 'Meta开源AI', website: 'https://llama.meta.com', category: 'ai-chat', isFree: true },
  { name: 'Mistral AI', description: '欧洲开源AI', website: 'https://mistral.ai', category: 'ai-chat', isFree: true },
  { name: 'Cohere', description: '企业AI平台', website: 'https://cohere.com', category: 'ai-chat', isFree: false },
  { name: 'Aleph Alpha', description: '欧洲AI大模型', website: 'https://aleph-alpha.com', category: 'ai-chat', isFree: false },
  { name: 'Anthropic Claude', description: '安全AI助手', website: 'https://www.anthropic.com', category: 'ai-chat', isFree: true },
  { name: 'Inflection AI', description: '个人AI助手', website: 'https://inflection.ai', category: 'ai-chat', isFree: true },
  { name: 'Adept AI', description: 'AI行动助手', website: 'https://www.adept.ai', category: 'ai-chat', isFree: false },
  { name: 'Reka AI', description: '多模态AI', website: 'https://www.reka.ai', category: 'ai-chat', isFree: false },
  { name: '01.AI', description: '李开复AI公司', website: 'https://www.01.ai', category: 'ai-chat', isFree: true },
  { name: 'Adept AI', description: 'AI智能助手', website: 'https://www.adept.ai', category: 'ai-chat', isFree: false },
  { name: 'Vicuna', description: '开源对话模型', website: 'https://vicuna.lmsys.org', category: 'ai-chat', isFree: true },
  { name: 'Alpaca', description: '斯坦福AI模型', website: 'https://crfm.stanford.edu/alpaca', category: 'ai-chat', isFree: true },
  { name: 'Dolly', description: 'Databricks开源AI', website: 'https://www.databricks.com/blog/2023/04/12/dolly-first-open-commercially-viable-instruction-tuned-llm', category: 'ai-chat', isFree: true },
  { name: 'OpenAssistant', description: '开源AI助手', website: 'https://open-assistant.io', category: 'ai-chat', isFree: true },
  { name: 'Stable Chat', description: 'Stability AI聊天', website: 'https://stability.ai', category: 'ai-chat', isFree: true },
  { name: 'FreedomGPT', description: '无审查AI', website: 'https://freedomgpt.com', category: 'ai-chat', isFree: true },
  { name: 'GPT4All', description: '本地运行AI', website: 'https://gpt4all.io', category: 'ai-chat', isFree: true },
  { name: 'LM Studio', description: '本地AI运行器', website: 'https://lmstudio.ai', category: 'ai-chat', isFree: true },
  { name: 'Ollama', description: '本地大模型运行', website: 'https://ollama.ai', category: 'ai-chat', isFree: true },
  { name: 'Jan', description: '开源本地AI', website: 'https://jan.ai', category: 'ai-chat', isFree: true },
  { name: 'KoboldAI', description: 'AI写作助手', website: 'https://github.com/KoboldAI/KoboldAI-Client', category: 'ai-chat', isFree: true },
  { name: 'SillyTavern', description: 'AI聊天前端', website: 'https://sillytavernai.com', category: 'ai-chat', isFree: true },
  { name: 'Text-Generation-WebUI', description: 'AI文本生成界面', website: 'https://github.com/oobabooga/text-generation-webui', category: 'ai-chat', isFree: true },
  { name: 'Kaggle AI', description: 'Kaggle模型', website: 'https://www.kaggle.com/models', category: 'ai-chat', isFree: true },
  { name: 'Replicate', description: 'AI模型托管', website: 'https://replicate.com', category: 'ai-chat', isFree: false },
  { name: 'RunPod', description: 'AI计算平台', website: 'https://www.runpod.io', category: 'ai-chat', isFree: false },
  { name: 'Lambda Labs', description: 'AI云服务', website: 'https://lambdalabs.com', category: 'ai-chat', isFree: false },

  // AI编程 - 国际扩展
  { name: 'Aider', description: 'AI终端编程助手', website: 'https://aider.chat', category: 'ai-coding', isFree: true },
  { name: 'Cody', description: 'Sourcegraph AI', website: 'https://about.sourcegraph.com/cody', category: 'ai-coding', isFree: true },
  { name: 'Bito AI', description: 'AI编程助手', website: 'https://bito.ai', category: 'ai-coding', isFree: false },
  { name: 'CodeSnippets', description: 'AI代码片段', website: 'https://codesnippets.ai', category: 'ai-coding', isFree: false },
  { name: 'DevGPT', description: '开发者AI助手', website: 'https://devgpt.com', category: 'ai-coding', isFree: false },
  { name: 'What The Diff', description: 'AI代码审查', website: 'https://whatthediff.ai', category: 'ai-coding', isFree: false },
  { name: 'PullRequest AI', description: 'AI代码PR审查', website: 'https://www.pullrequest.com', category: 'ai-coding', isFree: false },
  { name: 'CodeReview AI', description: 'AI代码评审', website: 'https://www.codereview.ai', category: 'ai-coding', isFree: false },
  { name: 'Greptile', description: 'AI代码分析', website: 'https://greptile.com', category: 'ai-coding', isFree: false },
  { name: 'Bloop AI', description: 'AI代码搜索', website: 'https://bloop.ai', category: 'ai-coding', isFree: true },
  { name: 'Swimm AI', description: 'AI文档生成', website: 'https://swimm.io', category: 'ai-coding', isFree: false },
  { name: 'Mintlify', description: 'AI文档写作', website: 'https://mintlify.com', category: 'ai-coding', isFree: false },
  { name: 'Docusaurus AI', description: 'AI文档平台', website: 'https://docusaurus.io', category: 'ai-coding', isFree: true },
  { name: 'GitLab Duo', description: 'GitLab AI助手', website: 'https://about.gitlab.com/gitlab-duo', category: 'ai-coding', isFree: false },
  { name: 'JetBrains AI', description: 'JetBrains AI助手', website: 'https://www.jetbrains.com/ai', category: 'ai-coding', isFree: false },
  { name: 'Visual Studio AI', description: 'VS AI功能', website: 'https://visualstudio.microsoft.com/services/intellicode', category: 'ai-coding', isFree: true },
  { name: 'Kite', description: 'AI代码补全', website: 'https://www.kite.com', category: 'ai-coding', isFree: true },
  { name: 'DeepCode', description: 'AI代码分析', website: 'https://www.deepcode.ai', category: 'ai-coding', isFree: true },
  { name: 'SonarQube AI', description: 'AI代码质量', website: 'https://www.sonarqube.org', category: 'ai-coding', isFree: true },
  { name: 'Codacy AI', description: 'AI代码审查', website: 'https://www.codacy.com', category: 'ai-coding', isFree: false },
  { name: 'CodeClimate AI', description: 'AI代码质量', website: 'https://codeclimate.com', category: 'ai-coding', isFree: false },
  { name: 'LGTM', description: 'GitHub代码分析', website: 'https://lgtm.com', category: 'ai-coding', isFree: true },
  { name: 'Snyk Code', description: 'AI安全扫描', website: 'https://snyk.io/product/snyk-code', category: 'ai-coding', isFree: true },
  { name: 'Veracode AI', description: 'AI安全检测', website: 'https://www.veracode.com', category: 'ai-coding', isFree: false },
  { name: 'Checkmarx AI', description: 'AI代码安全', website: 'https://checkmarx.com', category: 'ai-coding', isFree: false },
  { name: 'Semgrep AI', description: 'AI代码扫描', website: 'https://semgrep.dev', category: 'ai-coding', isFree: true },
  { name: 'CodeQL', description: 'GitHub代码查询', website: 'https://codeql.github.com', category: 'ai-coding', isFree: true },
  { name: 'Lacework AI', description: 'AI云安全', website: 'https://www.lacework.com', category: 'ai-coding', isFree: false },
  { name: 'Wiz AI', description: 'AI云安全平台', website: 'https://www.wiz.io', category: 'ai-coding', isFree: false },
  { name: 'Orca AI', description: 'AI云安全', website: 'https://orca.security', category: 'ai-coding', isFree: false },
  { name: 'Prisma Cloud AI', description: 'Palo Alto云安全', website: 'https://www.paloaltonetworks.com/prisma/cloud', category: 'ai-coding', isFree: false },
  { name: 'Datadog AI', description: 'AI监控平台', website: 'https://www.datadoghq.com', category: 'ai-coding', isFree: false },
  { name: 'New Relic AI', description: 'AI可观测性', website: 'https://newrelic.com', category: 'ai-coding', isFree: false },
  { name: 'Dynatrace AI', description: 'Davis AI助手', website: 'https://www.dynatrace.com', category: 'ai-coding', isFree: false },
  { name: 'AppDynamics AI', description: 'AI应用监控', website: 'https://www.appdynamics.com', category: 'ai-coding', isFree: false },

  // AI音频 - 国际扩展
  { name: 'AIVA', description: 'AI作曲家', website: 'https://www.aiva.ai', category: 'ai-audio', isFree: false },
  { name: 'Amper Music', description: 'AI音乐创作', website: 'https://www.ampermusic.com', category: 'ai-audio', isFree: false },
  { name: 'Ecrett Music', description: 'AI配乐生成', website: 'https://ecrettmusic.com', category: 'ai-audio', isFree: false },
  { name: 'Boomy', description: 'AI音乐制作', website: 'https://boomy.com', category: 'ai-audio', isFree: true },
  { name: 'Soundful', description: 'AI背景音乐', website: 'https://soundful.com', category: 'ai-audio', isFree: false },
  { name: 'Mubert', description: 'AI音乐流', website: 'https://mubert.com', category: 'ai-audio', isFree: false },
  { name: 'Jukebox', description: 'OpenAI音乐生成', website: 'https://openai.com/research/jukebox', category: 'ai-audio', isFree: true },
  { name: 'MusicLM', description: 'Google音乐生成', website: 'https://google-research.github.io/seanet/musiclm/examples', category: 'ai-audio', isFree: false },
  { name: 'AudioCraft', description: 'Meta音频生成', website: 'https://audiocraft.metademolab.com', category: 'ai-audio', isFree: true },
  { name: 'Suno AI', description: 'AI歌曲生成', website: 'https://suno.ai', category: 'ai-audio', isFree: true },
  { name: 'Udio', description: 'AI音乐创作', website: 'https://www.udio.com', category: 'ai-audio', isFree: true },
  { name: 'Riffusion', description: 'AI音乐可视化', website: 'https://www.riffusion.com', category: 'ai-audio', isFree: true },
  { name: 'Harmonai', description: 'Stability音频', website: 'https://www.harmonai.org', category: 'ai-audio', isFree: true },
  { name: 'Dadabots', description: 'AI死亡金属', website: 'https://www.dadabots.com', category: 'ai-audio', isFree: true },
  { name: 'OpenAI Jukebox', description: 'AI音乐生成', website: 'https://openai.com/blog/jukebox', category: 'ai-audio', isFree: true },
  { name: 'MuseNet', description: 'OpenAI音乐AI', website: 'https://openai.com/research/musenet', category: 'ai-audio', isFree: true },
  { name: 'DeepMusic', description: 'AI音乐分析', website: 'https://www.deepmusic.ai', category: 'ai-audio', isFree: false },
  { name: 'LANDR', description: 'AI音乐制作', website: 'https://www.landr.com', category: 'ai-audio', isFree: false },
  { name: 'iZotope AI', description: 'AI音频处理', website: 'https://www.izotope.com', category: 'ai-audio', isFree: false },
  { name: 'Cedar Audio', description: 'AI降噪', website: 'https://www.cedar-audio.com', category: 'ai-audio', isFree: false },
  { name: 'Izotope RX', description: 'AI音频修复', website: 'https://www.izotope.com/en/products/rx.html', category: 'ai-audio', isFree: false },
  { name: 'Adobe Podcast', description: 'AI播客增强', website: 'https://podcast.adobe.com', category: 'ai-audio', isFree: true },
  { name: 'Cleanvoice', description: 'AI播客清理', website: 'https://cleanvoice.ai', category: 'ai-audio', isFree: false },
  { name: 'Auphonic', description: 'AI音频处理', website: 'https://auphonic.com', category: 'ai-audio', isFree: true },
  { name: 'Alitu', description: 'AI播客制作', website: 'https://alitu.com', category: 'ai-audio', isFree: false },
  { name: 'Riverside.fm', description: 'AI录音工具', website: 'https://riverside.fm', category: 'ai-audio', isFree: false },
  { name: 'Zencastr', description: 'AI播客录制', website: 'https://zencastr.com', category: 'ai-audio', isFree: true },
  { name: 'SquadCast', description: 'AI远程录音', website: 'https://squadcast.fm', category: 'ai-audio', isFree: false },
  { name: 'Buzzsprout AI', description: 'AI播客托管', website: 'https://www.buzzsprout.com', category: 'ai-audio', isFree: true },
  { name: 'Podbean AI', description: 'AI播客平台', website: 'https://www.podbean.com', category: 'ai-audio', isFree: true },
  { name: 'Spotify AI', description: 'Spotify AI功能', website: 'https://www.spotify.com', category: 'ai-audio', isFree: true },
  { name: 'Shazam', description: 'Apple音乐识别', website: 'https://www.shazam.com', category: 'ai-audio', isFree: true },
  { name: 'SoundHound', description: 'AI音乐识别', website: 'https://www.soundhound.com', category: 'ai-audio', isFree: true },
  { name: 'Musixmatch AI', description: 'AI歌词匹配', website: 'https://www.musixmatch.com', category: 'ai-audio', isFree: true },
  { name: 'Genius AI', description: 'AI歌词分析', website: 'https://genius.com', category: 'ai-audio', isFree: true },

  // AI视频 - 国际扩展
  { name: 'Sora', description: 'OpenAI视频生成', website: 'https://openai.com/sora', category: 'ai-video', isFree: false },
  { name: 'Stable Video', description: 'Stability视频生成', website: 'https://stability.ai/stable-video', category: 'ai-video', isFree: true },
  { name: 'Kling AI', description: '快手AI视频生成', website: 'https://klingai.kuaishou.com', category: 'ai-video', isFree: true },
  { name: 'Genmo AI', description: 'AI视频创作', website: 'https://www.genmo.ai', category: 'ai-video', isFree: true },
  { name: 'Decohere', description: 'AI视频生成', website: 'https://decohere.ai', category: 'ai-video', isFree: false },
  { name: 'Viggle AI', description: 'AI角色动画', website: 'https://viggle.ai', category: 'ai-video', isFree: true },
  { name: 'DomoAI', description: 'AI视频风格转换', website: 'https://domoai.app', category: 'ai-video', isFree: false },
  { name: 'Morph Studio', description: 'AI视频编辑', website: 'https://morphstudio.com', category: 'ai-video', isFree: false },
  { name: 'CapCut AI', description: '字节AI视频编辑', website: 'https://www.capcut.com', category: 'ai-video', isFree: true },
  { name: 'Descript AI', description: 'AI视频编辑', website: 'https://descript.com', category: 'ai-video', isFree: false },
  { name: 'Vimeo AI', description: 'AI视频平台', website: 'https://vimeo.com', category: 'ai-video', isFree: false },
  { name: 'Wistia AI', description: 'AI视频营销', website: 'https://wistia.com', category: 'ai-video', isFree: false },
  { name: 'Loom AI', description: 'AI视频消息', website: 'https://www.loom.com', category: 'ai-video', isFree: false },
  { name: 'Vidyard AI', description: 'AI视频销售', website: 'https://www.vidyard.com', category: 'ai-video', isFree: false },
  { name: 'Wistia', description: 'AI视频托管', website: 'https://wistia.com', category: 'ai-video', isFree: false },
  { name: 'Brightcove AI', description: '企业AI视频', website: 'https://www.brightcove.com', category: 'ai-video', isFree: false },
  { name: 'Kaltura AI', description: 'AI视频平台', website: 'https://corp.kaltura.com', category: 'ai-video', isFree: false },
  { name: 'JW Player AI', description: 'AI视频播放器', website: 'https://www.jwplayer.com', category: 'ai-video', isFree: false },
  { name: 'Mux AI', description: 'AI视频API', website: 'https://www.mux.com', category: 'ai-video', isFree: false },
  { name: 'Cloudflare Stream AI', description: 'AI视频流', website: 'https://www.cloudflare.com/products/stream', category: 'ai-video', isFree: false },
  { name: 'Amazon Kinesis Video', description: 'AWS视频AI', website: 'https://aws.amazon.com/kinesis/video-streams', category: 'ai-video', isFree: false },
  { name: 'Azure Video Indexer', description: '微软视频AI', website: 'https://azure.microsoft.com/services/media-services/video-indexer', category: 'ai-video', isFree: false },
  { name: 'Google Video AI', description: 'GCP视频智能', website: 'https://cloud.google.com/video-intelligence', category: 'ai-video', isFree: false },
  { name: 'Clarifai Video', description: 'AI视频识别', website: 'https://www.clarifai.com', category: 'ai-video', isFree: false },
  { name: 'Twelve Labs', description: 'AI视频理解', website: 'https://twelvelabs.io', category: 'ai-video', isFree: false },
  { name: 'Tibilso', description: 'AI视频分析', website: 'https://tibilso.com', category: 'ai-video', isFree: false },
  { name: 'Spotlightr AI', description: 'AI视频营销', website: 'https://spotlightr.com', category: 'ai-video', isFree: false },
  { name: 'SproutVideo AI', description: 'AI视频托管', website: 'https://sproutvideo.com', category: 'ai-video', isFree: false },
  { name: 'VidGrid AI', description: 'AI视频互动', website: 'https://vidgrid.com', category: 'ai-video', isFree: false },
  { name: 'Uscreen AI', description: 'AI视频OTT', website: 'https://www.uscreen.tv', category: 'ai-video', isFree: false },
  { name: 'Kajabi AI', description: 'AI课程视频', website: 'https://kajabi.com', category: 'ai-video', isFree: false },
  { name: 'Teachable AI', description: 'AI在线课程', website: 'https://teachable.com', category: 'ai-video', isFree: false },
  { name: 'Thinkific AI', description: 'AI教育视频', website: 'https://www.thinkific.com', category: 'ai-video', isFree: false },
  { name: 'Podia AI', description: 'AI数字产品', website: 'https://www.podia.com', category: 'ai-video', isFree: false },
  { name: 'Gumroad AI', description: 'AI内容销售', website: 'https://gumroad.com', category: 'ai-video', isFree: true },

  // AI办公 - 国际扩展
  { name: 'Microsoft 365 Copilot', description: '微软AI办公套件', website: 'https://www.microsoft.com/microsoft-365/copilot', category: 'ai-office', isFree: false },
  { name: 'Google Duet AI', description: '谷歌AI办公', website: 'https://cloud.google.com/duet-ai', category: 'ai-office', isFree: false },
  { name: 'Zoom AI Companion', description: 'AI会议助手', website: 'https://www.zoom.us/ai-companion', category: 'ai-office', isFree: true },
  { name: 'Microsoft Teams AI', description: 'AI团队协作', website: 'https://www.microsoft.com/microsoft-teams', category: 'ai-office', isFree: true },
  { name: 'Google Workspace AI', description: '谷歌AI工作区', website: 'https://workspace.google.com', category: 'ai-office', isFree: false },
  { name: 'ClickUp AI', description: 'AI项目管理', website: 'https://clickup.com', category: 'ai-office', isFree: false },
  { name: 'Monday.com AI', description: 'AI工作管理', website: 'https://monday.com', category: 'ai-office', isFree: false },
  { name: 'Asana AI', description: 'AI任务管理', website: 'https://asana.com', category: 'ai-office', isFree: false },
  { name: 'Trello AI', description: 'AI看板工具', website: 'https://trello.com', category: 'ai-office', isFree: true },
  { name: 'Linear AI', description: 'AI项目管理', website: 'https://linear.app', category: 'ai-office', isFree: false },
  { name: 'Height AI', description: 'AI项目协作', website: 'https://height.app', category: 'ai-office', isFree: false },
  { name: 'Notion AI', description: 'AI知识管理', website: 'https://www.notion.so/product/ai', category: 'ai-office', isFree: false },
  { name: 'Coda AI', description: 'AI文档协作', website: 'https://coda.io/ai', category: 'ai-office', isFree: false },
  { name: 'Confluence AI', description: 'Atlassian知识库', website: 'https://www.atlassian.com/software/confluence', category: 'ai-office', isFree: false },
  { name: 'Jira AI', description: 'AI项目管理', website: 'https://www.atlassian.com/software/jira', category: 'ai-office', isFree: false },
  { name: 'Basecamp AI', description: 'AI团队协作', website: 'https://basecamp.com', category: 'ai-office', isFree: false },
  { name: 'Slack AI', description: 'AI团队沟通', website: 'https://slack.com/features/ai', category: 'ai-office', isFree: false },
  { name: 'Discord AI', description: 'AI社区管理', website: 'https://discord.com', category: 'ai-office', isFree: true },
  { name: 'Fellow AI', description: 'AI会议管理', website: 'https://fellow.app', category: 'ai-office', isFree: false },
  { name: 'Calendly AI', description: 'AI日程安排', website: 'https://calendly.com', category: 'ai-office', isFree: true },
  { name: 'Cal.com AI', description: '开源日程AI', website: 'https://cal.com', category: 'ai-office', isFree: true },
  { name: 'Clockwise AI', description: 'AI日历优化', website: 'https://www.getclockwise.com', category: 'ai-office', isFree: false },
  { name: 'Vimcal', description: 'AI日历应用', website: 'https://vimcal.com', category: 'ai-office', isFree: false },
  { name: 'Fantastical AI', description: 'AI日历', website: 'https://flexibits.com/fantastical', category: 'ai-office', isFree: false },
  { name: 'Reclaim.ai', description: 'AI时间管理', website: 'https://reclaim.ai', category: 'ai-office', isFree: false },
  { name: 'Trevor AI', description: 'AI任务调度', website: 'https://trevor.ai', category: 'ai-office', isFree: false },
  { name: 'Routine AI', description: 'AI生产力工具', website: 'https://routine.co', category: 'ai-office', isFree: false },
  { name: 'Akiflow AI', description: 'AI任务中心', website: 'https://www.akiflow.com', category: 'ai-office', isFree: false },
  { name: 'Sunsama AI', description: 'AI日常规划', website: 'https://sunsama.com', category: 'ai-office', isFree: false },
  { name: 'TickTick AI', description: 'AI待办事项', website: 'https://ticktick.com', category: 'ai-office', isFree: true },
  { name: 'Todoist AI', description: 'AI任务管理', website: 'https://todoist.com', category: 'ai-office', isFree: true },
  { name: 'Things AI', description: 'AI任务应用', website: 'https://culturedcode.com/things', category: 'ai-office', isFree: false },
  { name: 'OmniFocus AI', description: 'AI GTD工具', website: 'https://www.omnigroup.com/omnifocus', category: 'ai-office', isFree: false },
  { name: 'Microsoft To Do AI', description: '微软AI待办', website: 'https://to-do.microsoft.com', category: 'ai-office', isFree: true },
  { name: 'Google Tasks AI', description: '谷歌AI任务', website: 'https://tasks.google.com', category: 'ai-office', isFree: true },

  // AI学习 - 国际扩展
  { name: 'Coursera AI', description: 'AI课程推荐', website: 'https://www.coursera.org', category: 'ai-learning', isFree: true },
  { name: 'edX AI', description: 'AI在线学习', website: 'https://www.edx.org', category: 'ai-learning', isFree: true },
  { name: 'Udemy AI', description: 'AI课程平台', website: 'https://www.udemy.com', category: 'ai-learning', isFree: false },
  { name: 'Skillshare AI', description: 'AI创意学习', website: 'https://www.skillshare.com', category: 'ai-learning', isFree: false },
  { name: 'LinkedIn Learning AI', description: 'AI职业技能', website: 'https://www.linkedin.com/learning', category: 'ai-learning', isFree: false },
  { name: 'Pluralsight AI', description: 'AI技术学习', website: 'https://www.pluralsight.com', category: 'ai-learning', isFree: false },
  { name: 'Codecademy AI', description: 'AI编程学习', website: 'https://www.codecademy.com', category: 'ai-learning', isFree: false },
  { name: 'freeCodeCamp AI', description: '免费编程AI', website: 'https://www.freecodecamp.org', category: 'ai-learning', isFree: true },
  { name: 'LeetCode AI', description: 'AI算法练习', website: 'https://leetcode.com', category: 'ai-learning', isFree: true },
  { name: 'HackerRank AI', description: 'AI编程挑战', website: 'https://www.hackerrank.com', category: 'ai-learning', isFree: true },
  { name: 'CodeWars AI', description: 'AI编程练习', website: 'https://www.codewars.com', category: 'ai-learning', isFree: true },
  { name: 'Exercism AI', description: 'AI编程导师', website: 'https://exercism.org', category: 'ai-learning', isFree: true },
  { name: 'Brilliant AI', description: 'AI数学科学', website: 'https://brilliant.org', category: 'ai-learning', isFree: false },
  { name: 'Khan Academy AI', description: 'AI教育平台', website: 'https://www.khanacademy.org', category: 'ai-learning', isFree: true },
  { name: 'IXL AI', description: 'AI K-12学习', website: 'https://www.ixl.com', category: 'ai-learning', isFree: false },
  { name: 'DreamBox AI', description: 'AI数学学习', website: 'https://www.dreambox.com', category: 'ai-learning', isFree: false },
  { name: 'Carnegie Learning AI', description: 'AI教育软件', website: 'https://www.carnegielearning.com', category: 'ai-learning', isFree: false },
  { name: 'Squirrel AI', description: 'AI自适应学习', website: 'https://www.squirrelai.com', category: 'ai-learning', isFree: false },
  { name: 'Century Tech AI', description: 'AI学习平台', website: 'https://www.century.tech', category: 'ai-learning', isFree: false },
  { name: 'Coursera Plus AI', description: 'AI学习订阅', website: 'https://www.coursera.org/coursera-plus', category: 'ai-learning', isFree: false },
  { name: 'Brilliant Premium AI', description: 'AI数学科学', website: 'https://brilliant.org/premium', category: 'ai-learning', isFree: false },
  { name: 'Outschool AI', description: 'AI在线课堂', website: 'https://outschool.com', category: 'ai-learning', isFree: false },
  { name: 'Varsity Tutors AI', description: 'AI辅导平台', website: 'https://www.varsitytutors.com', category: 'ai-learning', isFree: false },
  { name: 'Chegg AI', description: 'AI学习助手', website: 'https://www.chegg.com', category: 'ai-learning', isFree: false },
  { name: 'Course Hero AI', description: 'AI学习资源', website: 'https://www.coursehero.com', category: 'ai-learning', isFree: false },
  { name: 'Quizlet AI', description: 'AI学习卡片', website: 'https://quizlet.com', category: 'ai-learning', isFree: true },
  { name: 'Anki AI', description: 'AI记忆卡片', website: 'https://apps.ankiweb.net', category: 'ai-learning', isFree: true },
  { name: 'Brainscape AI', description: 'AI智能卡片', website: 'https://www.brainscape.com', category: 'ai-learning', isFree: false },
  { name: 'StudyBlue AI', description: 'AI学习工具', website: 'https://www.studyblue.com', category: 'ai-learning', isFree: false },
  { name: 'GoConqr AI', description: 'AI学习平台', website: 'https://www.goconqr.com', category: 'ai-learning', isFree: true },
  { name: 'Memrise AI', description: 'AI语言学习', website: 'https://www.memrise.com', category: 'ai-learning', isFree: false },
  { name: 'Busuu AI', description: 'AI语言学习', website: 'https://www.busuu.com', category: 'ai-learning', isFree: false },
  { name: 'Lingoda AI', description: 'AI在线语言', website: 'https://www.lingoda.com', category: 'ai-learning', isFree: false },
  { name: 'Preply AI', description: 'AI语言辅导', website: 'https://preply.com', category: 'ai-learning', isFree: false },
  { name: 'iTalki AI', description: 'AI语言教师', website: 'https://www.italki.com', category: 'ai-learning', isFree: false },
]

// 更多工具 - 细分领域
const additionalTools = [
  // AI翻译
  { name: 'DeepL', description: '顶级AI翻译引擎', website: 'https://www.deepl.com', category: 'ai-writing', isFree: true, isFeatured: true },
  { name: 'Google Translate AI', description: '谷歌AI翻译', website: 'https://translate.google.com', category: 'ai-writing', isFree: true },
  { name: 'Microsoft Translator', description: '微软AI翻译', website: 'https://www.bing.com/translator', category: 'ai-writing', isFree: true },
  { name: 'Amazon Translate', description: 'AWS翻译服务', website: 'https://aws.amazon.com/translate', category: 'ai-writing', isFree: false },
  { name: 'iTranslate AI', description: 'AI翻译应用', website: 'https://www.itranslate.com', category: 'ai-writing', isFree: false },
  { name: 'SayHi Translate', description: 'AI语音翻译', website: 'https://www.sayhitranslate.com', category: 'ai-writing', isFree: false },
  { name: 'TripLingo', description: 'AI旅行翻译', website: 'https://www.triplingo.com', category: 'ai-writing', isFree: false },
  { name: 'Waygo AI', description: 'AI图像翻译', website: 'https://www.waygoapp.com', category: 'ai-writing', isFree: false },
  { name: 'Papago', description: 'Naver AI翻译', website: 'https://papago.naver.com', category: 'ai-writing', isFree: true },
  { name: 'Yandex Translate', description: 'Yandex AI翻译', website: 'https://translate.yandex.com', category: 'ai-writing', isFree: true },
  { name: 'Baidu Translate', description: '百度AI翻译', website: 'https://fanyi.baidu.com', category: 'ai-writing', isFree: true },
  { name: 'Youdao Translate', description: '网易AI翻译', website: 'https://fanyi.youdao.com', category: 'ai-writing', isFree: true },
  { name: 'Bing Translate', description: '必应翻译AI', website: 'https://www.bing.com/translator', category: 'ai-writing', isFree: true },
  { name: 'Reverso AI', description: 'AI翻译学习', website: 'https://www.reverso.net', category: 'ai-writing', isFree: true },
  { name: 'Linguee AI', description: 'AI双语词典', website: 'https://www.linguee.com', category: 'ai-writing', isFree: true },

  // AI数据分析
  { name: 'Tableau AI', description: 'AI数据可视化', website: 'https://www.tableau.com', category: 'ai-office', isFree: false },
  { name: 'Power BI AI', description: '微软AI商业智能', website: 'https://powerbi.microsoft.com', category: 'ai-office', isFree: false },
  { name: 'Looker AI', description: '谷歌AI数据分析', website: 'https://looker.com', category: 'ai-office', isFree: false },
  { name: 'Mode AI', description: 'AI数据分析平台', website: 'https://mode.com', category: 'ai-office', isFree: false },
  { name: 'ThoughtSpot AI', description: 'AI搜索分析', website: 'https://www.thoughtspot.com', category: 'ai-office', isFree: false },
  { name: 'Sisense AI', description: 'AI嵌入式分析', website: 'https://www.sisense.com', category: 'ai-office', isFree: false },
  { name: 'Domo AI', description: 'AI商业云', website: 'https://www.domo.com', category: 'ai-office', isFree: false },
  { name: 'Qlik AI', description: 'AI数据平台', website: 'https://www.qlik.com', category: 'ai-office', isFree: false },
  { name: 'MicroStrategy AI', description: 'AI企业分析', website: 'https://www.microstrategy.com', category: 'ai-office', isFree: false },
  { name: 'TIBCO AI', description: 'AI数据集成', website: 'https://www.tibco.com', category: 'ai-office', isFree: false },

  // AI营销
  { name: 'HubSpot AI', description: 'AI营销自动化', website: 'https://www.hubspot.com', category: 'ai-office', isFree: true },
  { name: 'Salesforce Einstein', description: 'AI CRM', website: 'https://www.salesforce.com/products/einstein', category: 'ai-office', isFree: false },
  { name: 'Marketo AI', description: 'Adobe营销AI', website: 'https://www.marketo.com', category: 'ai-office', isFree: false },
  { name: 'Pardot AI', description: 'Salesforce B2B营销', website: 'https://www.pardot.com', category: 'ai-office', isFree: false },
  { name: 'Mailchimp AI', description: 'AI邮件营销', website: 'https://mailchimp.com', category: 'ai-office', isFree: true },
  { name: 'ActiveCampaign AI', description: 'AI营销自动化', website: 'https://www.activecampaign.com', category: 'ai-office', isFree: false },
  { name: 'Klaviyo AI', description: 'AI电商营销', website: 'https://www.klaviyo.com', category: 'ai-office', isFree: false },
  { name: 'Braze AI', description: 'AI客户互动', website: 'https://www.braze.com', category: 'ai-office', isFree: false },
  { name: 'Iterable AI', description: 'AI营销平台', website: 'https://iterable.com', category: 'ai-office', isFree: false },
  { name: 'Customer.io AI', description: 'AI营销自动化', website: 'https://customer.io', category: 'ai-office', isFree: false },

  // AI客服
  { name: 'Intercom AI', description: 'AI客户支持', website: 'https://www.intercom.com', category: 'ai-chat', isFree: false },
  { name: 'Zendesk AI', description: 'AI客服平台', website: 'https://www.zendesk.com', category: 'ai-chat', isFree: false },
  { name: 'Freshdesk AI', description: 'AI客服软件', website: 'https://freshdesk.com', category: 'ai-chat', isFree: true },
  { name: 'Help Scout AI', description: 'AI帮助台', website: 'https://www.helpscout.com', category: 'ai-chat', isFree: false },
  { name: 'Drift AI', description: 'AI聊天销售', website: 'https://www.drift.com', category: 'ai-chat', isFree: false },
  { name: 'Crisp AI', description: 'AI客服聊天', website: 'https://crisp.chat', category: 'ai-chat', isFree: true },
  { name: 'Tidio AI', description: 'AI聊天机器人', website: 'https://www.tidio.com', category: 'ai-chat', isFree: true },
  { name: 'LiveChat AI', description: 'AI在线客服', website: 'https://www.livechat.com', category: 'ai-chat', isFree: false },
  { name: 'Olark AI', description: 'AI聊天支持', website: 'https://www.olark.com', category: 'ai-chat', isFree: false },
  { name: 'Tawk.to AI', description: '免费AI聊天', website: 'https://www.tawk.to', category: 'ai-chat', isFree: true },

  // AI人力资源
  { name: 'Greenhouse AI', description: 'AI招聘平台', website: 'https://www.greenhouse.com', category: 'ai-office', isFree: false },
  { name: 'Lever AI', description: 'AI人才管理', website: 'https://www.lever.co', category: 'ai-office', isFree: false },
  { name: 'Workday AI', description: 'AI人力资源', website: 'https://www.workday.com', category: 'ai-office', isFree: false },
  { name: 'BambooHR AI', description: 'AI HR软件', website: 'https://www.bamboohr.com', category: 'ai-office', isFree: false },
  { name: 'Zenefits AI', description: 'AI人事管理', website: 'https://www.zenefits.com', category: 'ai-office', isFree: false },
  { name: 'Gusto AI', description: 'AI薪酬管理', website: 'https://gusto.com', category: 'ai-office', isFree: false },
  { name: 'Rippling AI', description: 'AI员工管理', website: 'https://www.rippling.com', category: 'ai-office', isFree: false },
  { name: 'Deel AI', description: 'AI全球雇佣', website: 'https://www.deel.com', category: 'ai-office', isFree: false },
  { name: 'Remote AI', description: 'AI远程团队', website: 'https://remote.com', category: 'ai-office', isFree: false },
  { name: 'Oyster AI', description: 'AI全球招聘', website: 'https://www.oysterhr.com', category: 'ai-office', isFree: false },

  // AI设计工具
  { name: 'Figma AI', description: 'AI设计协作', website: 'https://www.figma.com', category: 'ai-painting', isFree: true },
  { name: 'Sketch AI', description: 'AI设计工具', website: 'https://www.sketch.com', category: 'ai-painting', isFree: false },
  { name: 'Adobe XD AI', description: 'Adobe AI设计', website: 'https://www.adobe.com/products/xd.html', category: 'ai-painting', isFree: true },
  { name: 'Framer AI', description: 'AI网站构建', website: 'https://www.framer.com', category: 'ai-painting', isFree: false },
  { name: 'Webflow AI', description: 'AI网站设计', website: 'https://webflow.com', category: 'ai-painting', isFree: false },
  { name: 'Squarespace AI', description: 'AI网站建设', website: 'https://www.squarespace.com', category: 'ai-painting', isFree: false },
  { name: 'Wix ADI', description: 'AI网站生成', website: 'https://www.wix.com', category: 'ai-painting', isFree: true },
  { name: 'Durable AI', description: 'AI网站创建', website: 'https://durable.co', category: 'ai-painting', isFree: false },
  { name: '10Web AI', description: 'AI WordPress', website: 'https://10web.io', category: 'ai-painting', isFree: false },
  { name: 'B12 AI', description: 'AI网站搭建', website: 'https://b12.io', category: 'ai-painting', isFree: false },

  // AI电商
  { name: 'Shopify AI', description: 'AI电商平台', website: 'https://www.shopify.com', category: 'ai-office', isFree: false },
  { name: 'BigCommerce AI', description: 'AI电商解决方案', website: 'https://www.bigcommerce.com', category: 'ai-office', isFree: false },
  { name: 'WooCommerce AI', description: 'WordPress电商AI', website: 'https://woocommerce.com', category: 'ai-office', isFree: true },
  { name: 'Magento AI', description: 'Adobe电商AI', website: 'https://magento.com', category: 'ai-office', isFree: false },
  { name: 'PrestaShop AI', description: 'AI开源电商', website: 'https://www.prestashop.com', category: 'ai-office', isFree: true },
  { name: 'Salesforce Commerce', description: 'AI商务云', website: 'https://www.salesforce.com/products/commerce-cloud', category: 'ai-office', isFree: false },
  { name: 'Square Online', description: 'AI在线商店', website: 'https://squareup.com', category: 'ai-office', isFree: false },
  { name: 'Ecwid AI', description: 'AI电商小工具', website: 'https://www.ecwid.com', category: 'ai-office', isFree: true },
  { name: 'Gumroad', description: 'AI数字销售', website: 'https://gumroad.com', category: 'ai-office', isFree: true },
  { name: 'Lemon Squeezy', description: 'AI软件销售', website: 'https://lemonsqueezy.com', category: 'ai-office', isFree: false },

  // AI金融
  { name: 'QuickBooks AI', description: 'AI财务管理', website: 'https://quickbooks.intuit.com', category: 'ai-office', isFree: false },
  { name: 'Xero AI', description: 'AI会计软件', website: 'https://www.xero.com', category: 'ai-office', isFree: false },
  { name: 'FreshBooks AI', description: 'AI发票管理', website: 'https://www.freshbooks.com', category: 'ai-office', isFree: false },
  { name: 'Wave AI', description: '免费AI会计', website: 'https://www.waveapps.com', category: 'ai-office', isFree: true },
  { name: 'Zoho Books AI', description: 'AI在线会计', website: 'https://www.zoho.com/books', category: 'ai-office', isFree: false },
  { name: 'Sage AI', description: 'AI企业财务', website: 'https://www.sage.com', category: 'ai-office', isFree: false },
  { name: 'NetSuite AI', description: 'Oracle AI ERP', website: 'https://www.netsuite.com', category: 'ai-office', isFree: false },
  { name: 'SAP AI', description: 'AI企业软件', website: 'https://www.sap.com', category: 'ai-office', isFree: false },
  { name: 'Oracle AI', description: 'Oracle AI服务', website: 'https://www.oracle.com/artificial-intelligence', category: 'ai-office', isFree: false },
  { name: 'Microsoft Dynamics AI', description: '微软AI ERP', website: 'https://dynamics.microsoft.com', category: 'ai-office', isFree: false },

  // AI健康
  { name: 'Ada Health', description: 'AI健康助手', website: 'https://ada.com', category: 'ai-learning', isFree: true },
  { name: 'Babylon AI', description: 'AI医疗咨询', website: 'https://www.babylonhealth.com', category: 'ai-learning', isFree: false },
  { name: 'K Health', description: 'AI症状检查', website: 'https://khealth.ai', category: 'ai-learning', isFree: true },
  { name: 'WebMD AI', description: 'AI健康信息', website: 'https://www.webmd.com', category: 'ai-learning', isFree: true },
  { name: 'Healthline AI', description: 'AI健康内容', website: 'https://www.healthline.com', category: 'ai-learning', isFree: true },
  { name: 'MyFitnessPal AI', description: 'AI健身追踪', website: 'https://www.myfitnesspal.com', category: 'ai-learning', isFree: true },
  { name: 'Noom AI', description: 'AI减肥教练', website: 'https://www.noom.com', category: 'ai-learning', isFree: false },
  { name: 'Fitbit AI', description: 'AI健康追踪', website: 'https://www.fitbit.com', category: 'ai-learning', isFree: false },
  { name: 'Apple Health AI', description: '苹果健康AI', website: 'https://www.apple.com/health', category: 'ai-learning', isFree: true },
  { name: 'Google Fit AI', description: '谷歌健康AI', website: 'https://www.google.com/fit', category: 'ai-learning', isFree: true },

  // AI法律
  { name: 'LegalZoom AI', description: 'AI法律服务', website: 'https://www.legalzoom.com', category: 'ai-office', isFree: false },
  { name: 'Rocket Lawyer AI', description: 'AI法律咨询', website: 'https://www.rocketlawyer.com', category: 'ai-office', isFree: false },
  { name: 'DoNotPay AI', description: 'AI法律助手', website: 'https://donotpay.com', category: 'ai-office', isFree: false },
  { name: 'Clio AI', description: 'AI律师管理', website: 'https://www.clio.com', category: 'ai-office', isFree: false },
  { name: 'MyCase AI', description: 'AI法律软件', website: 'https://www.mycase.com', category: 'ai-office', isFree: false },
  { name: 'PracticePanther AI', description: 'AI法律CRM', website: 'https://www.practicepanther.com', category: 'ai-office', isFree: false },
  { name: 'Lexicata AI', description: 'AI法律营销', website: 'https://www.lexicata.com', category: 'ai-office', isFree: false },
  { name: 'LawPay AI', description: 'AI法律支付', website: 'https://www.lawpay.com', category: 'ai-office', isFree: false },
  { name: 'Smokeball AI', description: 'AI法律软件', website: 'https://www.smokeball.com', category: 'ai-office', isFree: false },
  { name: 'CosmoLex AI', description: 'AI法律会计', website: 'https://www.cosmolex.com', category: 'ai-office', isFree: false },

  // AI房地产
  { name: 'Zillow AI', description: 'AI房产估价', website: 'https://www.zillow.com', category: 'ai-office', isFree: true },
  { name: 'Redfin AI', description: 'AI房产搜索', website: 'https://www.redfin.com', category: 'ai-office', isFree: true },
  { name: 'Realtor.com AI', description: 'AI房源推荐', website: 'https://www.realtor.com', category: 'ai-office', isFree: true },
  { name: 'Compass AI', description: 'AI房产平台', website: 'https://www.compass.com', category: 'ai-office', isFree: true },
  { name: 'Opendoor AI', description: 'AI房屋买卖', website: 'https://www.opendoor.com', category: 'ai-office', isFree: false },
  { name: 'Offerpad AI', description: 'AI房屋出售', website: 'https://www.offerpad.com', category: 'ai-office', isFree: false },
  { name: 'Knock AI', description: 'AI房屋交易', website: 'https://www.knock.com', category: 'ai-office', isFree: false },
  { name: 'Better.com AI', description: 'AI房贷服务', website: 'https://www.better.com', category: 'ai-office', isFree: false },
  { name: 'Rocket Mortgage AI', description: 'AI抵押贷款', website: 'https://www.rocketmortgage.com', category: 'ai-office', isFree: false },
  { name: 'Zillow Offers AI', description: 'AI房屋收购', website: 'https://www.zillow.com/offers', category: 'ai-office', isFree: false },

  // AI游戏
  { name: 'Unity AI', description: 'AI游戏开发', website: 'https://unity.com/products/unity-muse', category: 'ai-coding', isFree: false },
  { name: 'Unreal AI', description: 'Epic游戏AI', website: 'https://www.unrealengine.com', category: 'ai-coding', isFree: true },
  { name: 'Scenario AI', description: 'AI游戏资产', website: 'https://www.scenario.com', category: 'ai-painting', isFree: false },
  { name: 'Rosebud AI', description: 'AI游戏创建', website: 'https://rosebud.ai', category: 'ai-video', isFree: false },
  { name: 'Charisma AI', description: 'AI游戏对话', website: 'https://charisma.ai', category: 'ai-chat', isFree: false },
  { name: 'Inworld AI', description: 'AI游戏NPC', website: 'https://inworld.ai', category: 'ai-chat', isFree: false },
  { name: 'Convai AI', description: 'AI游戏角色', website: 'https://www.convai.com', category: 'ai-chat', isFree: false },
  { name: 'Latitude AI', description: 'AI游戏故事', website: 'https://latitude.io', category: 'ai-writing', isFree: false },
  { name: 'Hidden Door AI', description: 'AI角色扮演', website: 'https://www.hiddendoor.co', category: 'ai-chat', isFree: false },
  { name: 'AI Dungeon', description: 'AI冒险游戏', website: 'https://aidungeon.com', category: 'ai-chat', isFree: true },

  // AI科研
  { name: 'Semantic Scholar', description: 'AI学术搜索', website: 'https://www.semanticscholar.org', category: 'ai-learning', isFree: true },
  { name: 'Elicit AI', description: 'AI研究助手', website: 'https://elicit.com', category: 'ai-learning', isFree: true },
  { name: 'Consensus AI', description: 'AI论文搜索', website: 'https://consensus.app', category: 'ai-learning', isFree: true },
  { name: 'Research Rabbit', description: 'AI论文发现', website: 'https://www.researchrabbit.ai', category: 'ai-learning', isFree: true },
  { name: 'Connected Papers', description: 'AI论文图谱', website: 'https://www.connectedpapers.com', category: 'ai-learning', isFree: true },
  { name: 'Scholarcy AI', description: 'AI论文摘要', website: 'https://www.scholarcy.com', category: 'ai-learning', isFree: false },
  { name: 'Scite AI', description: 'AI引文分析', website: 'https://scite.ai', category: 'ai-learning', isFree: false },
  { name: 'Iris.ai', description: 'AI科研平台', website: 'https://iris.ai', category: 'ai-learning', isFree: false },
  { name: 'Dimensions AI', description: 'AI研究数据', website: 'https://app.dimensions.ai', category: 'ai-learning', isFree: true },
  { name: 'OpenAlex', description: 'AI学术数据库', website: 'https://openalex.org', category: 'ai-learning', isFree: true },

  // AI社交
  { name: 'Tweet Hunter AI', description: 'AI推特营销', website: 'https://www.tweethunter.io', category: 'ai-office', isFree: false },
  { name: 'Hypefury AI', description: 'AI推特管理', website: 'https://hypefury.com', category: 'ai-office', isFree: false },
  { name: 'Buffer AI', description: 'AI社交媒体', website: 'https://buffer.com', category: 'ai-office', isFree: true },
  { name: 'Hootsuite AI', description: 'AI社交管理', website: 'https://hootsuite.com', category: 'ai-office', isFree: false },
  { name: 'Sprout Social AI', description: 'AI社交平台', website: 'https://sproutsocial.com', category: 'ai-office', isFree: false },
  { name: 'Later AI', description: 'AI社交计划', website: 'https://later.com', category: 'ai-office', isFree: false },
  { name: 'Planoly AI', description: 'AI Instagram', website: 'https://www.planoly.com', category: 'ai-office', isFree: true },
  { name: 'Tailwind AI', description: 'AI Pinterest', website: 'https://www.tailwindapp.com', category: 'ai-office', isFree: false },
  { name: 'SocialBee AI', description: 'AI内容管理', website: 'https://socialbee.io', category: 'ai-office', isFree: false },
  { name: 'Publer AI', description: 'AI社交发布', website: 'https://publer.io', category: 'ai-office', isFree: true },

  // AI无代码
  { name: 'Bubble AI', description: 'AI无代码应用', website: 'https://bubble.io', category: 'ai-coding', isFree: true },
  { name: 'Zapier AI', description: 'AI自动化', website: 'https://zapier.com', category: 'ai-office', isFree: false },
  { name: 'Make AI', description: 'AI工作流', website: 'https://www.make.com', category: 'ai-office', isFree: false },
  { name: 'n8n AI', description: 'AI自动化开源', website: 'https://n8n.io', category: 'ai-office', isFree: true },
  { name: 'Airtable AI', description: 'AI数据库', website: 'https://airtable.com', category: 'ai-office', isFree: false },
  { name: 'Softr AI', description: 'AI网站生成', website: 'https://www.softr.io', category: 'ai-painting', isFree: false },
  { name: 'Glide AI', description: 'AI应用构建', website: 'https://www.glideapps.com', category: 'ai-coding', isFree: false },
  { name: 'Adalo AI', description: 'AI移动应用', website: 'https://www.adalo.com', category: 'ai-coding', isFree: false },
  { name: 'Thunkable AI', description: 'AI App创建', website: 'https://thunkable.com', category: 'ai-coding', isFree: true },
  { name: 'AppSheet AI', description: 'Google无代码', website: 'https://www.appsheet.com', category: 'ai-coding', isFree: true },

  // AI安全
  { name: 'CrowdStrike AI', description: 'AI端点安全', website: 'https://www.crowdstrike.com', category: 'ai-office', isFree: false },
  { name: 'Darktrace AI', description: 'AI网络安全', website: 'https://www.darktrace.com', category: 'ai-office', isFree: false },
  { name: 'SentinelOne AI', description: 'AI威胁检测', website: 'https://www.sentinelone.com', category: 'ai-office', isFree: false },
  { name: 'Cynet AI', description: 'AI安全平台', website: 'https://www.cynet.com', category: 'ai-office', isFree: false },
  { name: 'VirusTotal AI', description: 'AI病毒检测', website: 'https://www.virustotal.com', category: 'ai-office', isFree: true },
  { name: 'Hybrid Analysis AI', description: 'AI恶意软件', website: 'https://www.hybrid-analysis.com', category: 'ai-office', isFree: true },
  { name: 'Joe Sandbox AI', description: 'AI沙箱分析', website: 'https://www.joesandbox.com', category: 'ai-office', isFree: false },
  { name: 'ANY.RUN AI', description: 'AI恶意分析', website: 'https://any.run', category: 'ai-office', isFree: true },
  { name: 'AbuseIPDB AI', description: 'AI IP信誉', website: 'https://www.abuseipdb.com', category: 'ai-office', isFree: true },
  { name: 'URLhaus AI', description: 'AI URL检测', website: 'https://urlhaus.abuse.ch', category: 'ai-office', isFree: true },

  // 更多国内AI
  { name: '百度智能云', description: '百度AI云服务', website: 'https://cloud.baidu.com', category: 'ai-office', isFree: false },
  { name: '阿里云AI', description: '阿里AI云服务', website: 'https://www.aliyun.com/product/ai', category: 'ai-office', isFree: false },
  { name: '腾讯云AI', description: '腾讯AI服务', website: 'https://cloud.tencent.com/product/ai', category: 'ai-office', isFree: false },
  { name: '华为云AI', description: '华为AI服务', website: 'https://www.huaweicloud.com/product/ai.html', category: 'ai-office', isFree: false },
  { name: '京东云AI', description: '京东AI服务', website: 'https://www.jdcloud.com/cn/products', category: 'ai-office', isFree: false },
  { name: '网易易智', description: '网易AI平台', website: 'https://ai.163.com', category: 'ai-office', isFree: false },
  { name: '滴滴AI', description: '滴滴AI平台', website: 'https://www.didiglobal.com/science', category: 'ai-office', isFree: false },
  { name: '美团AI', description: '美团AI服务', website: 'https://www.meituan.com', category: 'ai-office', isFree: false },
  { name: '快手AI', description: '快手AI研究', website: 'https://www.kuaishou.com', category: 'ai-video', isFree: false },
  { name: '小红书AI', description: '小红书AI功能', website: 'https://www.xiaohongshu.com', category: 'ai-office', isFree: true },

  // 更多小众AI工具
  { name: 'Glambase', description: 'AI虚拟网红', website: 'https://glambase.com', category: 'ai-painting', isFree: false },
  { name: 'SoulGen', description: 'AI虚拟伴侣', website: 'https://www.soulgen.ai', category: 'ai-chat', isFree: false },
  { name: 'Replika', description: 'AI情感伴侣', website: 'https://replika.ai', category: 'ai-chat', isFree: false },
  { name: 'Anima AI', description: 'AI朋友', website: 'https://www.animaapp.com', category: 'ai-chat', isFree: false },
  { name: 'iGirl AI', description: 'AI女友', website: 'https://igirl.app', category: 'ai-chat', isFree: false },
  { name: 'Eva AI', description: 'AI伴侣', website: 'https://www.evaaiapp.com', category: 'ai-chat', isFree: false },
  { name: 'Paradot AI', description: 'AI情感聊天', website: 'https://www.paradot.ai', category: 'ai-chat', isFree: false },
  { name: 'Nomi AI', description: 'AI朋友', website: 'https://www.nomi.ai', category: 'ai-chat', isFree: false },
  { name: 'Kindroid AI', description: 'AI伴侣', website: 'https://www.kindroid.ai', category: 'ai-chat', isFree: false },
  { name: 'Candy.ai', description: 'AI伴侣', website: 'https://candy.ai', category: 'ai-chat', isFree: false },

  // AI检测工具
  { name: 'GPTZero', description: 'AI内容检测', website: 'https://gptzero.me', category: 'ai-writing', isFree: true },
  { name: 'Originality.AI', description: 'AI检测工具', website: 'https://originality.ai', category: 'ai-writing', isFree: false },
  { name: 'Copyleaks', description: 'AI抄袭检测', website: 'https://copyleaks.com', category: 'ai-writing', isFree: false },
  { name: 'Turnitin AI', description: '学术AI检测', website: 'https://www.turnitin.com', category: 'ai-writing', isFree: false },
  { name: 'Winston AI', description: 'AI内容识别', website: 'https://gowinston.ai', category: 'ai-writing', isFree: false },
  { name: 'Content at Scale', description: 'AI检测器', website: 'https://contentatscale.ai', category: 'ai-writing', isFree: true },
  { name: 'ZeroGPT', description: 'AI文本检测', website: 'https://www.zerogpt.com', category: 'ai-writing', isFree: true },
  { name: 'Writer AI Detector', description: 'AI内容检测', website: 'https://writer.com/ai-content-detector', category: 'ai-writing', isFree: true },
  { name: 'Sapling AI', description: 'AI检测', website: 'https://sapling.ai', category: 'ai-writing', isFree: true },
  { name: 'GLTR', description: 'AI生成检测', website: 'https://github.com/HendrikStrobworeit/GLTR', category: 'ai-writing', isFree: true },

  // AI头像生成
  { name: 'ProfilePicture.AI', description: 'AI头像制作', website: 'https://profilepicture.ai', category: 'ai-painting', isFree: false },
  { name: 'Avatar AI', description: 'AI头像生成', website: 'https://avatarai.me', category: 'ai-painting', isFree: false },
  { name: 'HeadshotPro', description: 'AI职业头像', website: 'https://www.headshotpro.com', category: 'ai-painting', isFree: false },
  { name: 'Secta AI', description: 'AI头像照片', website: 'https://secta.ai', category: 'ai-painting', isFree: false },
  { name: 'Aragon AI', description: 'AI头像生成', website: 'https://www.aragon.ai', category: 'ai-painting', isFree: false },
  { name: 'Try it on AI', description: 'AI虚拟试衣', website: 'https://www.tryitonai.com', category: 'ai-painting', isFree: false },
  { name: 'PFPMaker', description: 'AI头像制作', website: 'https://pfpmaker.com', category: 'ai-painting', isFree: true },
  { name: 'ProfilePicMaker', description: 'AI头像生成', website: 'https://www.profilepicmaker.com', category: 'ai-painting', isFree: true },
  { name: 'FacePlay AI', description: 'AI换脸', website: 'https://www.faceplay.ai', category: 'ai-painting', isFree: false },
  { name: 'Reface AI', description: 'AI换脸应用', website: 'https://reface.app', category: 'ai-video', isFree: false },

  // AI总结工具
  { name: 'Summarize.tech', description: 'AI视频总结', website: 'https://www.summarize.tech', category: 'ai-office', isFree: true },
  { name: 'Eightify', description: 'AI YouTube总结', website: 'https://eightify.app', category: 'ai-video', isFree: true },
  { name: 'Harpa AI', description: 'AI网页总结', website: 'https://harpa.ai', category: 'ai-office', isFree: true },
  { name: 'SciSpace', description: 'AI论文阅读', website: 'https://typeset.io', category: 'ai-learning', isFree: true },
  { name: 'Explainpaper', description: 'AI论文解释', website: 'https://www.explainpaper.com', category: 'ai-learning', isFree: true },
  { name: 'ChatPDF', description: 'AI PDF聊天', website: 'https://www.chatpdf.com', category: 'ai-office', isFree: true },
  { name: 'PDF.ai', description: 'AI PDF分析', website: 'https://pdf.ai', category: 'ai-office', isFree: false },
  { name: 'Humata AI', description: 'AI文档分析', website: 'https://www.humata.ai', category: 'ai-office', isFree: false },
  { name: 'DocuAsk', description: 'AI文档问答', website: 'https://www.docuask.com', category: 'ai-office', isFree: false },
  { name: 'Filechat AI', description: 'AI文件聊天', website: 'https://filechat.ai', category: 'ai-office', isFree: false },

  // AI演示工具
  { name: 'Gamma AI', description: 'AI演示文稿', website: 'https://gamma.app', category: 'ai-office', isFree: true },
  { name: 'Tome AI', description: 'AI故事演示', website: 'https://tome.app', category: 'ai-office', isFree: true },
  { name: 'Beautiful.ai', description: 'AI幻灯片', website: 'https://www.beautiful.ai', category: 'ai-office', isFree: false },
  { name: 'SlidesAI.io', description: 'AI PPT生成', website: 'https://www.slidesai.io', category: 'ai-office', isFree: false },
  { name: 'Pitch AI', description: 'AI演示软件', website: 'https://pitch.com', category: 'ai-office', isFree: true },
  { name: 'Canva Presentations', description: 'Canva AI演示', website: 'https://www.canva.com/presentations', category: 'ai-office', isFree: true },
  { name: 'MightySlides AI', description: 'AI幻灯片', website: 'https://www.mightyslides.com', category: 'ai-office', isFree: false },
  { name: 'Sendsteps AI', description: 'AI互动演示', website: 'https://www.sendsteps.ai', category: 'ai-office', isFree: false },
  { name: 'SlideBean AI', description: 'AI演示设计', website: 'https://slidebean.com', category: 'ai-office', isFree: false },
  { name: 'Zoho Show AI', description: 'AI演示工具', website: 'https://www.zoho.com/show', category: 'ai-office', isFree: true },
]

export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient()

    // 获取分类映射
    const { data: categories } = await client
      .from('categories')
      .select('id, slug')

    const categoryMap = new Map(categories?.map(c => [c.slug, c.id]))

    // 获取管理员用户作为发布者
    const { data: adminUser } = await client
      .from('users')
      .select('id')
      .eq('role', 'admin')
      .limit(1)
      .single()

    if (!adminUser) {
      return NextResponse.json(
        { success: false, error: '未找到管理员用户' },
        { status: 400 }
      )
    }

    // 合并所有工具
    const allTools = [...domesticTools, ...internationalTools, ...additionalTools]
    
    let successCount = 0
    let skipCount = 0
    const batchSize = 50

    // 分批处理
    for (let i = 0; i < allTools.length; i += batchSize) {
      const batch = allTools.slice(i, i + batchSize)
      
      for (const tool of batch) {
        const categoryId = categoryMap.get(tool.category)
        if (!categoryId) {
          skipCount++
          continue
        }

        // 检查是否已存在
        const { data: existing } = await client
          .from('ai_tools')
          .select('id')
          .ilike('name', tool.name)
          .limit(1)
          .single()

        if (existing) {
          skipCount++
          continue
        }

        // 生成唯一slug
        const slug = tool.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '') + '-' + Math.random().toString(36).substring(2, 6)

        const { error } = await client
          .from('ai_tools')
          .insert({
            name: tool.name,
            slug,
            description: tool.description,
            long_description: `${tool.name}是一款${tool.description}。该工具利用先进的人工智能技术，为用户提供高效便捷的解决方案。`,
            website: tool.website,
            logo: null,
            category_id: categoryId,
            publisher_id: adminUser.id,
            status: 'approved',
            is_featured: tool.isFeatured || false,
            is_free: tool.isFree,
            pricing_info: tool.isFree ? '基础功能免费使用' : '付费使用，具体价格请访问官网',
            view_count: Math.floor(Math.random() * 2000) + 100,
            favorite_count: Math.floor(Math.random() * 200) + 10,
          })

        if (error) {
          skipCount++
        } else {
          successCount++
        }
      }

      // 每批次后暂停一小段时间，避免压力过大
      if (i + batchSize < allTools.length) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    // 获取最终统计
    const { count: totalCount } = await client
      .from('ai_tools')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({
      success: true,
      message: '大规模导入完成',
      data: {
        attempted: allTools.length,
        success: successCount,
        skipped: skipCount,
        totalInDb: totalCount,
      },
    })
  } catch (error) {
    console.error('大规模导入错误:', error)
    return NextResponse.json(
      { success: false, error: '大规模导入失败' },
      { status: 500 }
    )
  }
}
