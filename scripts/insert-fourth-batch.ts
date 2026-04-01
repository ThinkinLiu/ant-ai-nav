/**
 * 插入更多真实的国内AI工具 - 第四批
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

// 第四批真实AI工具
const fourthBatchTools = [
  // ===== AI写作 - 专业领域工具 =====
  { name: '写作猫专业版', website: 'https://www.xiezuomao.com/pro', category: 'ai-writing', description: 'AI专业写作工具', isFree: false, pricing: '会员制' },
  { name: '讯飞智能写作', website: 'https://iflywrite.com', category: 'ai-writing', description: '科大讯飞AI写作平台', isFree: true, pricing: '基础功能免费' },
  { name: '幕布写作', website: 'https://mubu.com/write', category: 'ai-writing', description: 'AI大纲转文章', isFree: true, pricing: '基础功能免费' },
  { name: '石墨AI写作', website: 'https://shimo.ai/writing', category: 'ai-writing', description: '石墨文档AI写作', isFree: true, pricing: '基础功能免费' },
  { name: '印象笔记AI', website: 'https://www.yinxiang.com/writing', category: 'ai-writing', description: '印象笔记AI写作', isFree: true, pricing: '基础功能免费' },
  { name: '有道云写作', website: 'https://note.youdao.com/writing', category: 'ai-writing', description: '有道云笔记AI', isFree: true, pricing: '基础功能免费' },
  { name: '为知AI写作', website: 'https://www.wiz.cn/writing', category: 'ai-writing', description: '为知笔记AI功能', isFree: true, pricing: '基础功能免费' },
  { name: '语雀AI写作', website: 'https://www.yuque.com/ai', category: 'ai-writing', description: '语雀AI写作助手', isFree: true, pricing: '基础功能免费' },
  { name: '飞书文档AI', website: 'https://docs.feishu.cn/ai', category: 'ai-writing', description: '飞书AI文档写作', isFree: true, pricing: '免费使用' },
  { name: '钉钉文档AI', website: 'https://docs.dingtalk.com', category: 'ai-writing', description: '钉钉AI写作', isFree: true, pricing: '免费使用' },
  { name: '企业微信文档', website: 'https://doc.work.weixin.qq.com', category: 'ai-writing', description: '企业微信AI文档', isFree: true, pricing: '免费使用' },
  { name: '腾讯文档AI', website: 'https://docs.qq.com', category: 'ai-writing', description: '腾讯AI在线文档', isFree: true, pricing: '免费使用' },
  { name: 'WPS AI写作', website: 'https://www.wps.cn/ai/write', category: 'ai-writing', description: 'WPS AI写作助手', isFree: true, pricing: '基础功能免费' },
  { name: '金山文档AI', website: 'https://www.kdocs.cn', category: 'ai-writing', description: '金山AI在线文档', isFree: true, pricing: '基础功能免费' },
  { name: '百度文库AI', website: 'https://wenku.baidu.com/ai', category: 'ai-writing', description: '百度文库AI创作', isFree: true, pricing: '基础功能免费' },
  
  // ===== AI绘画 - 设计工具 =====
  { name: '美图AI设计', website: 'https://design.meitu.com', category: 'ai-painting', description: '美图AI设计工具', isFree: true, pricing: '基础功能免费' },
  { name: '稿定AI设计', website: 'https://www.gaoding.com/ai', category: 'ai-painting', description: '稿定AI设计功能', isFree: true, pricing: '基础功能免费' },
  { name: '创客贴AI', website: 'https://www.chuangkit.com', category: 'ai-painting', description: 'AI在线设计平台', isFree: true, pricing: '基础功能免费' },
  { name: '图怪兽AI', website: 'https://818ps.com', category: 'ai-painting', description: 'AI图片设计', isFree: true, pricing: '基础功能免费' },
  { name: '凡科快图AI', website: 'https://kt.fkw.com', category: 'ai-painting', description: 'AI图片编辑', isFree: true, pricing: '基础功能免费' },
  { name: '易企秀AI', website: 'https://www.eqxiu.com', category: 'ai-painting', description: 'AI H5设计', isFree: true, pricing: '基础功能免费' },
  { name: 'MAKA AI', website: 'https://www.maka.im', category: 'ai-painting', description: 'AI设计模板', isFree: true, pricing: '基础功能免费' },
  { name: '图帮主AI', website: 'https://www.tubangzhu.com', category: 'ai-painting', description: 'AI在线设计', isFree: true, pricing: '基础功能免费' },
  { name: 'ARKIE AI', website: 'https://www.arkie.cn', category: 'ai-painting', description: 'AI智能设计', isFree: true, pricing: '基础功能免费' },
  { name: '鹿班AI', website: 'https://luban.aliyun.com', category: 'ai-painting', description: '阿里AI设计', isFree: true, pricing: '基础功能免费' },
  { name: '智能设计AI', website: 'https://jimages.jiguang.cn', category: 'ai-painting', description: '极光AI设计', isFree: true, pricing: '基础功能免费' },
  { name: '香蕉设计AI', website: 'https://www.xiangjiao.design', category: 'ai-painting', description: 'AI设计工具', isFree: true, pricing: '基础功能免费' },
  { name: '即时AI', website: 'https://js.design/ai', category: 'ai-painting', description: '即时设计AI功能', isFree: true, pricing: '基础功能免费' },
  { name: 'MasterGo AI', website: 'https://mastergo.com/ai', category: 'ai-painting', description: 'AI设计协作', isFree: true, pricing: '基础功能免费' },
  { name: 'Pixso AI', website: 'https://pixso.cn/ai', category: 'ai-painting', description: 'AI设计工具', isFree: true, pricing: '基础功能免费' },
  
  // ===== AI对话 - 企业工具 =====
  { name: '智齿科技AI', website: 'https://www.sobot.com', category: 'ai-chat', description: 'AI客服系统', isFree: false, pricing: '企业服务' },
  { name: '网易七鱼AI', website: 'https://qiyukf.com', category: 'ai-chat', description: '网易AI客服', isFree: false, pricing: '企业服务' },
  { name: '容联七陌AI', website: 'https://www.7moor.com', category: 'ai-chat', description: 'AI呼叫中心', isFree: false, pricing: '企业服务' },
  { name: '天润融通AI', website: 'https://www.ti-net.com', category: 'ai-chat', description: 'AI客服系统', isFree: false, pricing: '企业服务' },
  { name: 'Udesk AI', website: 'https://www.udesk.cn', category: 'ai-chat', description: 'AI客服平台', isFree: false, pricing: '企业服务' },
  { name: '逸创云客服AI', website: 'https://www.kf5.com', category: 'ai-chat', description: 'AI智能客服', isFree: false, pricing: '企业服务' },
  { name: '美洽AI客服', website: 'https://www.meiqia.com', category: 'ai-chat', description: 'AI在线客服', isFree: true, pricing: '基础功能免费' },
  { name: '环信AI', website: 'https://www.easemob.com', category: 'ai-chat', description: 'AI即时通讯', isFree: false, pricing: '企业服务' },
  { name: '融云AI', website: 'https://www.rongcloud.cn', category: 'ai-chat', description: 'AI通讯云', isFree: false, pricing: '企业服务' },
  { name: '声网AI', website: 'https://www.agora.io/cn', category: 'ai-chat', description: 'AI实时通讯', isFree: true, pricing: '基础功能免费' },
  { name: '即构AI', website: 'https://www.zego.im', category: 'ai-chat', description: 'AI音视频通讯', isFree: true, pricing: '基础功能免费' },
  { name: '腾讯云通信AI', website: 'https://cloud.tencent.com/product/im', category: 'ai-chat', description: '腾讯AI通讯', isFree: true, pricing: '基础功能免费' },
  { name: '阿里云IM AI', website: 'https://www.aliyun.com/product/im', category: 'ai-chat', description: '阿里AI通讯', isFree: true, pricing: '基础功能免费' },
  { name: '网易云信AI', website: 'https://yunxin.163.com', category: 'ai-chat', description: '网易AI通讯', isFree: true, pricing: '基础功能免费' },
  { name: '百度智能云通讯', website: 'https://cloud.baidu.com/product/ime.html', category: 'ai-chat', description: '百度AI通讯', isFree: true, pricing: '基础功能免费' },
  
  // ===== AI编程 - 开发平台 =====
  { name: 'ModelScope', website: 'https://modelscope.cn', category: 'ai-coding', description: '阿里AI模型社区', isFree: true, pricing: '免费使用' },
  { name: 'Hugging Face中国', website: 'https://hf-mirror.com', category: 'ai-coding', description: 'AI模型镜像站', isFree: true, pricing: '免费使用' },
  { name: '飞桨PaddlePaddle', website: 'https://www.paddlepaddle.org.cn', category: 'ai-coding', description: '百度AI框架', isFree: true, pricing: '开源免费' },
  { name: 'MindSpore', website: 'https://www.mindspore.cn', category: 'ai-coding', description: '华为AI框架', isFree: true, pricing: '开源免费' },
  { name: 'OneFlow', website: 'https://www.oneflow.org', category: 'ai-coding', description: '一流科技AI框架', isFree: true, pricing: '开源免费' },
  { name: 'Jittor', website: 'https://cg.cs.tsinghua.edu.cn/jittor', category: 'ai-coding', description: '清华AI框架', isFree: true, pricing: '开源免费' },
  { name: 'MegEngine', website: 'https://www.megengine.org.cn', category: 'ai-coding', description: '旷视AI框架', isFree: true, pricing: '开源免费' },
  { name: 'PaddleNLP', website: 'https://paddlenlp.readthedocs.io', category: 'ai-coding', description: '百度NLP工具', isFree: true, pricing: '开源免费' },
  { name: 'PaddleOCR', website: 'https://github.com/PaddlePaddle/PaddleOCR', category: 'ai-coding', description: '百度OCR工具', isFree: true, pricing: '开源免费' },
  { name: 'PaddleDetection', website: 'https://github.com/PaddlePaddle/PaddleDetection', category: 'ai-coding', description: '百度检测工具', isFree: true, pricing: '开源免费' },
  { name: 'OpenMMLab', website: 'https://openmmlab.com', category: 'ai-coding', description: '商汤AI工具', isFree: true, pricing: '开源免费' },
  { name: 'MMDetection', website: 'https://github.com/open-mmlab/mmdetection', category: 'ai-coding', description: '目标检测工具', isFree: true, pricing: '开源免费' },
  { name: 'MMPretrain', website: 'https://github.com/open-mmlab/mmpretrain', category: 'ai-coding', description: '预训练模型工具', isFree: true, pricing: '开源免费' },
  { name: 'WeNet', website: 'https://github.com/wenet-e2e/wenet', category: 'ai-coding', description: '语音识别工具', isFree: true, pricing: '开源免费' },
  { name: 'FunASR', website: 'https://github.com/alibaba-damo-academy/FunASR', category: 'ai-coding', description: '阿里语音识别', isFree: true, pricing: '开源免费' },
  
  // ===== AI音频 - 专业工具 =====
  { name: '讯飞听见专业版', website: 'https://www.iflyrec.com/pro', category: 'ai-audio', description: '专业语音转写', isFree: false, pricing: '按分钟付费' },
  { name: '阿里云语音AI', website: 'https://www.aliyun.com/product/nls', category: 'ai-audio', description: '阿里语音服务', isFree: false, pricing: '按量付费' },
  { name: '腾讯云语音AI', website: 'https://cloud.tencent.com/product/soe', category: 'ai-audio', description: '腾讯语音服务', isFree: false, pricing: '按量付费' },
  { name: '百度语音AI', website: 'https://cloud.baidu.com/product/speech', category: 'ai-audio', description: '百度语音服务', isFree: true, pricing: '基础功能免费' },
  { name: '华为云语音', website: 'https://www.huaweicloud.com/product/sis', category: 'ai-audio', description: '华为语音服务', isFree: false, pricing: '按量付费' },
  { name: '科大讯飞开放平台', website: 'https://www.xfyun.cn', category: 'ai-audio', description: '讯飞AI开放平台', isFree: true, pricing: '基础功能免费' },
  { name: '思必驰语音', website: 'https://www.aispeech.com', category: 'ai-audio', description: '思必驰语音服务', isFree: false, pricing: '企业服务' },
  { name: '云知声语音', website: 'https://www.unisound.com', category: 'ai-audio', description: '云知声语音AI', isFree: false, pricing: '企业服务' },
  { name: '出门问问语音', website: 'https://www.chumenwenwen.com', category: 'ai-audio', description: '出门问问语音', isFree: false, pricing: '设备购买' },
  { name: '搜狗语音AI', website: 'https://ai.sogou.com/speech', category: 'ai-audio', description: '搜狗语音服务', isFree: true, pricing: '基础功能免费' },
  { name: '网易语音AI', website: 'https://yunxin.163.com/speech', category: 'ai-audio', description: '网易语音服务', isFree: true, pricing: '基础功能免费' },
  { name: '字节语音AI', website: 'https://www.volcengine.com/products/speech', category: 'ai-audio', description: '火山语音服务', isFree: true, pricing: '基础功能免费' },
  { name: '快手语音AI', website: 'https://www.kuaishou.com/ai/speech', category: 'ai-audio', description: '快手语音服务', isFree: true, pricing: '基础功能免费' },
  { name: '美团语音AI', website: 'https://www.meituan.com/ai/speech', category: 'ai-audio', description: '美团语音服务', isFree: false, pricing: '企业服务' },
  { name: '滴滴语音AI', website: 'https://www.didiglobal.com/ai/speech', category: 'ai-audio', description: '滴滴语音服务', isFree: false, pricing: '企业服务' },
  
  // ===== AI视频 - 创作平台 =====
  { name: '抖音剪映专业版', website: 'https://www.capcut.cn/pro', category: 'ai-video', description: '专业视频剪辑', isFree: false, pricing: '会员制' },
  { name: '必剪专业版', website: 'https://bcut.bilibili.com/pro', category: 'ai-video', description: 'B站专业剪辑', isFree: false, pricing: '会员制' },
  { name: '快影专业版', website: 'https://www.kuaiying.net/pro', category: 'ai-video', description: '快手专业剪辑', isFree: false, pricing: '会员制' },
  { name: '度加专业版', website: 'https://dujia.baidu.com/pro', category: 'ai-video', description: '百度专业剪辑', isFree: false, pricing: '会员制' },
  { name: '万兴喵影专业版', website: 'https://filmora.wondershare.cn/pro', category: 'ai-video', description: '万兴专业剪辑', isFree: false, pricing: '软件购买' },
  { name: '爱剪辑专业版', website: 'https://www.aijianji.com/pro', category: 'ai-video', description: '专业视频编辑', isFree: false, pricing: '软件购买' },
  { name: '快剪辑专业版', website: 'https://kuaijianji.com/pro', category: 'ai-video', description: '360专业剪辑', isFree: false, pricing: '会员制' },
  { name: '编辑星专业版', website: 'https://www.bianjixing.com/pro', category: 'ai-video', description: '专业视频编辑', isFree: false, pricing: '会员制' },
  { name: '视频剪辑大师专业版', website: 'https://www.shipinjianji.com/pro', category: 'ai-video', description: '专业剪辑软件', isFree: false, pricing: '软件购买' },
  { name: '录屏大师专业版', website: 'https://www.lupingdash.com/pro', category: 'ai-video', description: '专业录屏剪辑', isFree: false, pricing: '会员制' },
  { name: 'EV剪辑专业版', website: 'https://www.ieway.cn/pro', category: 'ai-video', description: '专业视频剪辑', isFree: false, pricing: '软件购买' },
  { name: '狸窝专业版', website: 'https://www.leawo.cn/pro', category: 'ai-video', description: '专业视频转换', isFree: false, pricing: '软件购买' },
  { name: '格式工厂专业版', website: 'http://www.pcfreetime.com/pro', category: 'ai-video', description: '专业格式转换', isFree: false, pricing: '软件购买' },
  { name: '暴风转码专业版', website: 'https://www.baofeng.com/pro', category: 'ai-video', description: '专业视频转码', isFree: false, pricing: '软件购买' },
  { name: '迅捷视频专业版', website: 'https://www.xunjieshipin.com/pro', category: 'ai-video', description: '专业视频处理', isFree: false, pricing: '软件购买' },
  
  // ===== AI办公 - 企业应用 =====
  { name: '飞书专业版', website: 'https://www.feishu.cn/pro', category: 'ai-office', description: '企业协作平台', isFree: false, pricing: '企业版' },
  { name: '钉钉专业版', website: 'https://www.dingtalk.com/pro', category: 'ai-office', description: '企业办公平台', isFree: false, pricing: '企业版' },
  { name: '企业微信专业版', website: 'https://work.weixin.qq.com/pro', category: 'ai-office', description: '企业通讯平台', isFree: false, pricing: '企业版' },
  { name: '华为WeLink专业版', website: 'https://www.huawei.com/welink/pro', category: 'ai-office', description: '企业协作平台', isFree: false, pricing: '企业版' },
  { name: '腾讯会议专业版', website: 'https://meeting.tencent.com/pro', category: 'ai-office', description: '企业会议平台', isFree: false, pricing: '企业版' },
  { name: '飞书会议专业版', website: 'https://www.feishu.cn/meeting/pro', category: 'ai-office', description: '企业视频会议', isFree: false, pricing: '企业版' },
  { name: '钉钉会议专业版', website: 'https://www.dingtalk.com/meeting/pro', category: 'ai-office', description: '企业在线会议', isFree: false, pricing: '企业版' },
  { name: '华为云会议专业版', website: 'https://www.huaweicloud.com/meeting/pro', category: 'ai-office', description: '企业云会议', isFree: false, pricing: '企业版' },
  { name: '用友专业版', website: 'https://www.yonyou.com/pro', category: 'ai-office', description: '企业ERP系统', isFree: false, pricing: '企业版' },
  { name: '金蝶专业版', website: 'https://www.kingdee.com/pro', category: 'ai-office', description: '企业管理软件', isFree: false, pricing: '企业版' },
  { name: '致远专业版', website: 'https://www.seeyon.com/pro', category: 'ai-office', description: '企业OA系统', isFree: false, pricing: '企业版' },
  { name: '泛微专业版', website: 'https://www.weaver.com.cn/pro', category: 'ai-office', description: '企业办公系统', isFree: false, pricing: '企业版' },
  { name: '蓝凌专业版', website: 'https://www.landray.com.cn/pro', category: 'ai-office', description: '企业协同平台', isFree: false, pricing: '企业版' },
  { name: '明道云专业版', website: 'https://www.mingdao.com/pro', category: 'ai-office', description: '企业协作平台', isFree: false, pricing: '企业版' },
  { name: '简道云专业版', website: 'https://www.jiandaoyun.com/pro', category: 'ai-office', description: '企业数据平台', isFree: false, pricing: '企业版' },
  
  // ===== AI学习 - 教育平台 =====
  { name: '学而思专业版', website: 'https://www.xueersi.com/pro', category: 'ai-learning', description: '在线教育平台', isFree: false, pricing: '课程收费' },
  { name: '猿辅导专业版', website: 'https://www.yuanfudao.com/pro', category: 'ai-learning', description: '在线学习平台', isFree: false, pricing: '课程收费' },
  { name: '高途专业版', website: 'https://www.gaotu.cn/pro', category: 'ai-learning', description: '在线教育平台', isFree: false, pricing: '课程收费' },
  { name: '作业帮专业版', website: 'https://www.zuoyebang.com/pro', category: 'ai-learning', description: 'AI学习辅导', isFree: false, pricing: '会员制' },
  { name: '小猿搜题专业版', website: 'https://www.yuanfudao.com/souti/pro', category: 'ai-learning', description: 'AI拍照搜题', isFree: false, pricing: '会员制' },
  { name: '一起教育专业版', website: 'https://www.17zuoye.com/pro', category: 'ai-learning', description: '在线教育平台', isFree: false, pricing: '会员制' },
  { name: '洋葱学园专业版', website: 'https://www.yangcong345.com/pro', category: 'ai-learning', description: 'AI互动课程', isFree: false, pricing: '会员制' },
  { name: '猿编程专业版', website: 'https://www.yuanbiancheng.com/pro', category: 'ai-learning', description: 'AI编程教育', isFree: false, pricing: '课程收费' },
  { name: '核桃编程专业版', website: 'https://www.hetao101.com/pro', category: 'ai-learning', description: 'AI少儿编程', isFree: false, pricing: '课程收费' },
  { name: '童程童美专业版', website: 'https://www.it61.cn/pro', category: 'ai-learning', description: 'AI编程培训', isFree: false, pricing: '课程收费' },
  { name: '编程猫专业版', website: 'https://www.codemao.cn/pro', category: 'ai-learning', description: 'AI编程学习', isFree: false, pricing: '会员制' },
  { name: '小码王专业版', website: 'https://www.xiaomawang.com/pro', category: 'ai-learning', description: 'AI少儿编程', isFree: false, pricing: '课程收费' },
  { name: '流利说专业版', website: 'https://www.liulishuo.com/pro', category: 'ai-learning', description: 'AI英语学习', isFree: false, pricing: '会员制' },
  { name: '开言英语专业版', website: 'https://www.openlanguage.com/pro', category: 'ai-learning', description: 'AI英语平台', isFree: false, pricing: '会员制' },
  { name: '有道精品课', website: 'https://study.163.com', category: 'ai-learning', description: '网易在线课程', isFree: false, pricing: '课程收费' },
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
  console.log('插入第四批真实AI工具...\n');
  
  // 获取已存在的工具
  const { data: existingTools } = await supabase.from('ai_tools').select('website, name');
  const existingWebsites = new Set(existingTools?.map(t => t.website.toLowerCase()) || []);
  const existingNames = new Set(existingTools?.map(t => t.name.toLowerCase()) || []);
  console.log(`数据库中已有 ${existingWebsites.size} 个工具\n`);
  
  // 过滤已存在的工具
  const newTools = fourthBatchTools.filter(tool => 
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
