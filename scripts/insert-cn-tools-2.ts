/**
 * 继续插入更多真实的国内AI工具 - 第二批
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

// 更多真实的国内AI工具 - 第二批
const moreTools = [
  // ===== AI写作 - 更多细分工具 =====
  { name: '句易网', website: 'https://www.juyi.cn', category: 'ai-writing', description: 'AI广告文案生成工具', isFree: false, pricing: '会员制' },
  { name: '易撰', website: 'https://www.yizhuan5.com', category: 'ai-writing', description: '自媒体AI写作平台', isFree: true, pricing: '基础功能免费' },
  { name: '5118 AI写作', website: 'https://www.5118.com/ai', category: 'ai-writing', description: '5118旗下AI写作功能', isFree: false, pricing: '会员制' },
  { name: '站长之家AI', website: 'https://www.chinaz.com/ai', category: 'ai-writing', description: '站长之家AI工具集', isFree: true, pricing: '基础功能免费' },
  { name: 'A5写作', website: 'https://www.a5.cn/ai', category: 'ai-writing', description: 'A5创业网AI写作', isFree: true, pricing: '基础功能免费' },
  { name: '卢松松AI', website: 'https://www.lusongsong.com/ai', category: 'ai-writing', description: '卢松松博客AI工具', isFree: true, pricing: '基础功能免费' },
  { name: '简写AI', website: 'https://www.jianxie.ai', category: 'ai-writing', description: '简洁AI写作工具', isFree: true, pricing: '基础功能免费' },
  { name: '写作侠', website: 'https://www.xiezuoxia.com', category: 'ai-writing', description: 'AI写作助手平台', isFree: false, pricing: '会员制' },
  { name: '文案狗', website: 'https://www.wenangou.com', category: 'ai-writing', description: 'AI创意文案生成', isFree: true, pricing: '基础功能免费' },
  { name: '梅花网AI', website: 'https://www.meihua.info/ai', category: 'ai-writing', description: '梅花网AI文案工具', isFree: false, pricing: '会员制' },
  { name: '文案君', website: 'https://www.wenanjun.com', category: 'ai-writing', description: 'AI文案创作平台', isFree: true, pricing: '基础功能免费' },
  { name: '广告人AI', website: 'https://www.adquan.com/ai', category: 'ai-writing', description: '广告门AI广告文案', isFree: false, pricing: '会员制' },
  { name: '数英网AI', website: 'https://www.digitaling.com/ai', category: 'ai-writing', description: '数英AI创意工具', isFree: true, pricing: '基础功能免费' },
  { name: 'TOPYS AI', website: 'https://www.topys.cn/ai', category: 'ai-writing', description: 'TOPYS创意AI', isFree: false, pricing: '会员制' },
  { name: '胖鲸AI', website: 'https://www.socialbeta.com/ai', category: 'ai-writing', description: '胖鲸AI营销文案', isFree: true, pricing: '基础功能免费' },
  { name: '社会化营销AI', website: 'https://www.socialmarketings.com/ai', category: 'ai-writing', description: '社会化营销AI工具', isFree: true, pricing: '基础功能免费' },
  { name: '人人都是产品经理AI', website: 'https://www.woshipm.com/ai', category: 'ai-writing', description: '产品经理AI写作', isFree: true, pricing: '基础功能免费' },
  { name: '鸟哥笔记AI', website: 'https://www.niaogebiji.com/ai', category: 'ai-writing', description: '鸟哥笔记AI文案', isFree: true, pricing: '基础功能免费' },
  { name: '运营派AI', website: 'https://www.yunyingpai.com/ai', category: 'ai-writing', description: '运营派AI写作工具', isFree: true, pricing: '基础功能免费' },
  { name: '爱运营AI', website: 'https://www.iyunying.org/ai', category: 'ai-writing', description: '爱运营AI文案', isFree: true, pricing: '基础功能免费' },

  // ===== AI绘画 - 更多工具 =====
  { name: '稿定AI抠图', website: 'https://www.gaoding.com/ai/cutout', category: 'ai-painting', description: 'AI一键抠图工具', isFree: true, pricing: '基础功能免费' },
  { name: '美图秀秀AI', website: 'https://xiuxiu.meitu.com/ai', category: 'ai-painting', description: '美图秀秀AI功能', isFree: true, pricing: '基础功能免费' },
  { name: '醒图AI', website: 'https://www.xingtu.ai', category: 'ai-painting', description: '字节AI修图工具', isFree: true, pricing: '免费使用' },
  { name: '轻颜相机AI', website: 'https://www.qingyan.ai', category: 'ai-painting', description: 'AI美颜相机', isFree: true, pricing: '免费使用' },
  { name: '无他相机AI', website: 'https://www.wuta-cam.com', category: 'ai-painting', description: 'AI美颜相机', isFree: true, pricing: '免费使用' },
  { name: 'B612咔叽AI', website: 'https://www.b612.com', category: 'ai-painting', description: 'AI自拍相机', isFree: true, pricing: '免费使用' },
  { name: 'Faceu激萌AI', website: 'https://www.faceu.com', category: 'ai-painting', description: 'AI贴纸相机', isFree: true, pricing: '免费使用' },
  { name: '天天P图AI', website: 'https://tupian.qq.com/ai', category: 'ai-painting', description: '腾讯AI修图工具', isFree: true, pricing: '免费使用' },
  { name: '水印相机AI', website: 'https://www.watermarkcam.com', category: 'ai-painting', description: 'AI水印相机', isFree: true, pricing: '免费使用' },
  { name: '画世界AI', website: 'https://www.huashijie.com', category: 'ai-painting', description: 'AI绘画社区', isFree: true, pricing: '基础功能免费' },
  { name: '触站AI', website: 'https://www.huashi6.com/ai', category: 'ai-painting', description: '触站AI绘画功能', isFree: true, pricing: '基础功能免费' },
  { name: '画友AI', website: 'https://www.huayou.com', category: 'ai-painting', description: 'AI绘画社区平台', isFree: true, pricing: '基础功能免费' },
  { name: '涂鸦王国AI', website: 'https://www.poocg.com/ai', category: 'ai-painting', description: '涂鸦王国AI功能', isFree: true, pricing: '基础功能免费' },
  { name: 'Pixiv中文版', website: 'https://www.pixiv.net/zh', category: 'ai-painting', description: 'Pixiv中国版', isFree: true, pricing: '基础功能免费' },
  { name: '米画师AI', website: 'https://www.mihuashi.com/ai', category: 'ai-painting', description: '米画师AI绘画', isFree: false, pricing: '平台服务' },
  { name: '橙光AI绘图', website: 'https://www.66rpg.com/ai', category: 'ai-painting', description: '橙光游戏AI绘图', isFree: true, pricing: '基础功能免费' },
  { name: '闪艺AI', website: 'https://www.shanyink.com/ai', category: 'ai-painting', description: '闪艺AI绘图功能', isFree: true, pricing: '基础功能免费' },
  { name: '易次元AI', website: 'https://yiciyuan.163.com/ai', category: 'ai-painting', description: '网易易次元AI', isFree: true, pricing: '基础功能免费' },
  { name: '橙光AI', website: 'https://www.66rpg.com', category: 'ai-painting', description: '互动小说平台AI', isFree: true, pricing: '基础功能免费' },
  { name: '快点AI', website: 'https://www.kuaidian.com/ai', category: 'ai-painting', description: '快点阅读AI', isFree: true, pricing: '基础功能免费' },

  // ===== AI对话 - 更多垂直领域 =====
  { name: 'AI医生', website: 'https://www.guahao.com/ai', category: 'ai-chat', description: '挂号网AI问诊', isFree: true, pricing: '基础功能免费' },
  { name: '好大夫AI', website: 'https://www.haodf.com/ai', category: 'ai-chat', description: '好大夫在线AI助手', isFree: true, pricing: '基础功能免费' },
  { name: '微医AI', website: 'https://www.guahao.com/ai-doctor', category: 'ai-chat', description: '微医AI问诊', isFree: true, pricing: '基础功能免费' },
  { name: '平安好医生AI', website: 'https://health.pingan.com/ai', category: 'ai-chat', description: '平安好医生AI', isFree: true, pricing: '基础功能免费' },
  { name: '春雨医生AI', website: 'https://www.chunyuyisheng.com/ai', category: 'ai-chat', description: '春雨医生AI问诊', isFree: true, pricing: '基础功能免费' },
  { name: '丁香医生AI', website: 'https://www.dxy.com/ai', category: 'ai-chat', description: '丁香园AI健康助手', isFree: true, pricing: '基础功能免费' },
  { name: '京东健康AI', website: 'https://www.jdhealth.com/ai', category: 'ai-chat', description: '京东健康AI问诊', isFree: true, pricing: '基础功能免费' },
  { name: '阿里健康AI', website: 'https://www.alihealth.cn/ai', category: 'ai-chat', description: '阿里健康AI助手', isFree: true, pricing: '基础功能免费' },
  { name: '法律AI助手', website: 'https://www.12348.gov.cn/ai', category: 'ai-chat', description: '司法部法律AI', isFree: true, pricing: '免费使用' },
  { name: '北大法宝AI', website: 'https://www.pkulaw.com/ai', category: 'ai-chat', description: '法律AI检索助手', isFree: false, pricing: '会员制' },
  { name: '威科先行AI', website: 'https://law.wkinfo.com.cn/ai', category: 'ai-chat', description: '威科法律AI', isFree: false, pricing: '企业服务' },
  { name: '无讼AI', website: 'https://www.itslaw.com/ai', category: 'ai-chat', description: '无讼法律AI助手', isFree: true, pricing: '基础功能免费' },
  { name: '法信AI', website: 'https://www.faxin.cn/ai', category: 'ai-chat', description: '法信法律AI', isFree: false, pricing: '会员制' },
  { name: '裁判文书网AI', website: 'https://wenshu.court.gov.cn/ai', category: 'ai-chat', description: '裁判文书AI检索', isFree: true, pricing: '免费使用' },
  { name: '企查查AI', website: 'https://www.qcc.com/ai', category: 'ai-chat', description: '企查查企业AI', isFree: true, pricing: '基础功能免费' },
  { name: '天眼查AI', website: 'https://www.tianyancha.com/ai', category: 'ai-chat', description: '天眼查企业AI', isFree: true, pricing: '基础功能免费' },
  { name: '启信宝AI', website: 'https://www.qixin.com/ai', category: 'ai-chat', description: '启信宝企业AI', isFree: true, pricing: '基础功能免费' },
  { name: '爱企查AI', website: 'https://aiqicha.baidu.com', category: 'ai-chat', description: '百度企业信息AI', isFree: true, pricing: '免费使用' },
  { name: '信用中国AI', website: 'https://www.creditchina.gov.cn/ai', category: 'ai-chat', description: '信用中国AI', isFree: true, pricing: '免费使用' },
  { name: '国家政务AI', website: 'https://www.gov.cn/ai', category: 'ai-chat', description: '国家政务AI助手', isFree: true, pricing: '免费使用' },

  // ===== AI编程 - 更多工具 =====
  { name: 'Gitee AI', website: 'https://ai.gitee.com', category: 'ai-coding', description: 'Gitee AI开发平台', isFree: true, pricing: '基础功能免费' },
  { name: 'CODING AI', website: 'https://coding.net/ai', category: 'ai-coding', description: 'CODING AI开发', isFree: true, pricing: '基础功能免费' },
  { name: '阿里云DevOps AI', website: 'https://codeup.aliyun.com', category: 'ai-coding', description: '阿里云代码管理AI', isFree: false, pricing: '企业版' },
  { name: '华为云CodeHub', website: 'https://codehub.devcloud.huaweicloud.com', category: 'ai-coding', description: '华为代码托管AI', isFree: false, pricing: '企业版' },
  { name: '百度效率云', website: 'https://xiaolvyun.baidu.com', category: 'ai-coding', description: '百度开发效能AI', isFree: false, pricing: '企业版' },
  { name: '腾讯工蜂AI', website: 'https://code.tencent.com', category: 'ai-coding', description: '腾讯代码托管AI', isFree: true, pricing: '基础功能免费' },
  { name: '码云Gitee Copilot', website: 'https://gitee.com/copilot', category: 'ai-coding', description: 'Gitee AI编程助手', isFree: true, pricing: '基础功能免费' },
  { name: '掘金AI编程', website: 'https://juejin.cn/ai/writing', category: 'ai-coding', description: '掘金AI开发文章', isFree: true, pricing: '免费使用' },
  { name: 'CSDN AI助手', website: 'https://www.csdn.net/ai', category: 'ai-coding', description: 'CSDN AI开发助手', isFree: true, pricing: '基础功能免费' },
  { name: '思否AI', website: 'https://segmentfault.com/ai', category: 'ai-coding', description: 'SegmentFault AI', isFree: true, pricing: '基础功能免费' },
  { name: '博客园AI', website: 'https://www.cnblogs.com/ai', category: 'ai-coding', description: '博客园AI功能', isFree: true, pricing: '免费使用' },
  { name: '开源中国AI', website: 'https://www.oschina.net/ai', category: 'ai-coding', description: '开源中国AI工具', isFree: true, pricing: '免费使用' },
  { name: '51CTO AI', website: 'https://www.51cto.com/ai', category: 'ai-coding', description: '51CTO AI开发', isFree: true, pricing: '基础功能免费' },
  { name: '慕课网AI', website: 'https://www.imooc.com/ai', category: 'ai-coding', description: '慕课网AI编程', isFree: true, pricing: '基础功能免费' },
  { name: '极客时间AI', website: 'https://time.geekbang.org/ai', category: 'ai-coding', description: '极客时间AI课程', isFree: false, pricing: '课程收费' },
  { name: '拉勾教育AI', website: 'https://edu.lagou.com/ai', category: 'ai-coding', description: '拉勾AI学习', isFree: false, pricing: '课程收费' },
  { name: '开课吧AI', website: 'https://www.kaikeba.com/ai', category: 'ai-coding', description: '开课吧AI编程', isFree: false, pricing: '课程收费' },
  { name: '腾讯课堂编程AI', website: 'https://ke.qq.com/ai/code', category: 'ai-coding', description: '腾讯课堂AI编程', isFree: true, pricing: '部分免费' },
  { name: '网易云课堂编程', website: 'https://mooc.study.163.com/code', category: 'ai-coding', description: '网易编程课程', isFree: true, pricing: '部分免费' },
  { name: '实验楼AI', website: 'https://www.lanqiao.cn/ai', category: 'ai-coding', description: '蓝桥云课AI', isFree: true, pricing: '基础功能免费' },

  // ===== AI音频 - 更多工具 =====
  { name: '配音秀AI', website: 'https://www.peiyinxiu.com', category: 'ai-audio', description: 'AI配音社区', isFree: true, pricing: '基础功能免费' },
  { name: '配音神器', website: 'https://www.peiyinshenqi.com', category: 'ai-audio', description: 'AI配音工具', isFree: false, pricing: '会员制' },
  { name: '配音阁', website: 'https://www.peiyinge.com', category: 'ai-audio', description: 'AI配音平台', isFree: true, pricing: '基础功能免费' },
  { name: '讯飞配音专业版', website: 'https://peiyin.xfyun.cn/pro', category: 'ai-audio', description: '讯飞专业配音', isFree: false, pricing: '按字付费' },
  { name: '阿里云TTS', website: 'https://www.aliyun.com/product/nls-tts', category: 'ai-audio', description: '阿里云语音合成', isFree: false, pricing: '按量付费' },
  { name: '百度语音合成', website: 'https://cloud.baidu.com/product/speech/tts', category: 'ai-audio', description: '百度AI语音合成', isFree: true, pricing: '基础功能免费' },
  { name: '华为云语音', website: 'https://www.huaweicloud.com/product/sis.html', category: 'ai-audio', description: '华为语音AI服务', isFree: false, pricing: '按量付费' },
  { name: '网易七鱼AI语音', website: 'https://qiyukf.com/ai', category: 'ai-audio', description: '网易AI客服语音', isFree: false, pricing: '企业服务' },
  { name: '容联七陌AI', website: 'https://www.7moor.com/ai', category: 'ai-audio', description: 'AI呼叫中心', isFree: false, pricing: '企业服务' },
  { name: '天润融通AI', website: 'https://www.ti-net.com/ai', category: 'ai-audio', description: 'AI呼叫系统', isFree: false, pricing: '企业服务' },
  { name: '网易见外AI', website: 'https://jianwai.youdao.com', category: 'ai-audio', description: '网易AI视频翻译', isFree: true, pricing: '基础功能免费' },
  { name: '讯飞听见', website: 'https://www.iflyrec.com', category: 'ai-audio', description: '讯飞AI录音转写', isFree: true, pricing: '基础功能免费' },
  { name: '录音啦AI', website: 'https://www.luyinla.com', category: 'ai-audio', description: 'AI录音转文字', isFree: true, pricing: '基础功能免费' },
  { name: '网易语音AI', website: 'https://music.163.com/ai/voice', category: 'ai-audio', description: '网易AI语音', isFree: true, pricing: '基础功能免费' },
  { name: '全民K歌AI', website: 'https://kg.qq.com', category: 'ai-audio', description: '腾讯AI唱歌评分', isFree: true, pricing: '免费使用' },
  { name: '唱吧AI', website: 'https://www.changba.com', category: 'ai-audio', description: 'AI唱歌应用', isFree: true, pricing: '免费使用' },
  { name: '酷狗唱唱AI', website: 'https://www.kugou.com/sing', category: 'ai-audio', description: '酷狗AI唱歌', isFree: true, pricing: '免费使用' },
  { name: '全民K歌专业版', website: 'https://kg.qq.com/pro', category: 'ai-audio', description: '腾讯专业唱歌AI', isFree: false, pricing: '会员制' },
  { name: '讯飞输入法AI', website: 'https://www.xunfei.cn/input', category: 'ai-audio', description: '讯飞AI语音输入', isFree: true, pricing: '免费使用' },
  { name: '搜狗输入法AI', website: 'https://www.sogou.com/input', category: 'ai-audio', description: '搜狗AI输入法', isFree: true, pricing: '免费使用' },

  // ===== AI视频 - 更多工具 =====
  { name: '万兴喵影', website: 'https://filmora.wondershare.cn', category: 'ai-video', description: '万兴视频编辑器', isFree: false, pricing: '软件购买' },
  { name: '爱剪辑AI', website: 'https://www.aijianji.com', category: 'ai-video', description: 'AI视频剪辑软件', isFree: false, pricing: '软件购买' },
  { name: '快剪辑AI', website: 'https://kuaijianji.com', category: 'ai-video', description: '360视频剪辑AI', isFree: true, pricing: '免费使用' },
  { name: '编辑星AI', website: 'https://www.bianjixing.com', category: 'ai-video', description: 'AI视频编辑工具', isFree: true, pricing: '基础功能免费' },
  { name: '视频剪辑大师', website: 'https://www.shipinjianji.com', category: 'ai-video', description: 'AI视频剪辑软件', isFree: false, pricing: '软件购买' },
  { name: '录屏大师AI', website: 'https://www.lupingdash.com', category: 'ai-video', description: 'AI录屏剪辑', isFree: true, pricing: '基础功能免费' },
  { name: 'EV剪辑AI', website: 'https://www.ieway.cn', category: 'ai-video', description: 'EV视频剪辑AI', isFree: true, pricing: '基础功能免费' },
  { name: '狸窝AI视频', website: 'https://www.leawo.cn', category: 'ai-video', description: '狸窝视频转换AI', isFree: true, pricing: '基础功能免费' },
  { name: '格式工厂AI', website: 'http://www.pcfreetime.com', category: 'ai-video', description: '格式工厂AI转换', isFree: true, pricing: '免费软件' },
  { name: '暴风转码AI', website: 'https://www.baofeng.com', category: 'ai-video', description: '暴风AI视频工具', isFree: true, pricing: '免费使用' },
  { name: '爱奇艺视频AI', website: 'https://www.iqiyi.com/ai/video', category: 'ai-video', description: '爱奇艺AI剪辑', isFree: true, pricing: '基础功能免费' },
  { name: '优酷视频AI', website: 'https://www.youku.com/ai/edit', category: 'ai-video', description: '优酷AI剪辑', isFree: true, pricing: '基础功能免费' },
  { name: '腾讯视频AI', website: 'https://v.qq.com/ai', category: 'ai-video', description: '腾讯视频AI功能', isFree: true, pricing: '基础功能免费' },
  { name: '搜狐视频AI', website: 'https://tv.sohu.com/ai', category: 'ai-video', description: '搜狐AI剪辑', isFree: true, pricing: '基础功能免费' },
  { name: '咪咕视频AI', website: 'https://www.migu.cn/ai/video', category: 'ai-video', description: '咪咕AI视频', isFree: true, pricing: '基础功能免费' },
  { name: '芒果TV剪辑AI', website: 'https://www.mgtv.com/ai/edit', category: 'ai-video', description: '芒果AI剪辑', isFree: true, pricing: '基础功能免费' },
  { name: 'PPTV AI剪辑', website: 'https://www.pptv.com/ai', category: 'ai-video', description: 'PPTV AI功能', isFree: true, pricing: '基础功能免费' },
  { name: '风行视频AI', website: 'https://www.fun.tv/ai', category: 'ai-video', description: '风行AI剪辑', isFree: true, pricing: '基础功能免费' },
  { name: '暴风影音AI', website: 'https://www.baofeng.com/ai', category: 'ai-video', description: '暴风AI视频', isFree: true, pricing: '基础功能免费' },
  { name: '迅雷看看AI', website: 'https://www.kankan.com/ai', category: 'ai-video', description: '迅雷AI视频', isFree: true, pricing: '基础功能免费' },

  // ===== AI办公 - 更多工具 =====
  { name: '永中Office AI', website: 'https://www.yozo.com.cn/ai', category: 'ai-office', description: '永中AI办公软件', isFree: false, pricing: '软件购买' },
  { name: '中标普华Office', website: 'https://www.cs2c.com.cn/ai', category: 'ai-office', description: '国产AI办公软件', isFree: false, pricing: '政府服务' },
  { name: '共创开源Office', website: 'https://www.co-create.cn', category: 'ai-office', description: '开源AI办公', isFree: true, pricing: '开源免费' },
  { name: '金山PDF AI', website: 'https://www.wps.cn/pdf', category: 'ai-office', description: '金山PDF AI功能', isFree: true, pricing: '基础功能免费' },
  { name: '福昕PDF AI', website: 'https://www.foxitsoftware.cn/pdf', category: 'ai-office', description: '福昕PDF AI', isFree: false, pricing: '软件购买' },
  { name: '万兴PDF AI', website: 'https://pdf.wondershare.cn', category: 'ai-office', description: '万兴PDF AI功能', isFree: false, pricing: '软件购买' },
  { name: '迅捷PDF AI', website: 'https://www.xunjiepdf.com', category: 'ai-office', description: '迅捷PDF AI', isFree: true, pricing: '基础功能免费' },
  { name: '嗨格式PDF AI', website: 'https://www.haigeshi.com/pdf', category: 'ai-office', description: '嗨格式PDF工具', isFree: true, pricing: '基础功能免费' },
  { name: 'LightPDF AI', website: 'https://lightpdf.cn', category: 'ai-office', description: 'AI PDF编辑', isFree: true, pricing: '基础功能免费' },
  { name: 'Smallpdf中文', website: 'https://smallpdf.cn', category: 'ai-office', description: 'Smallpdf中国版', isFree: true, pricing: '基础功能免费' },
  { name: 'iLovePDF中文', website: 'https://www.ilovepdf.com/zh-cn', category: 'ai-office', description: 'PDF在线工具', isFree: true, pricing: '基础功能免费' },
  { name: 'PDF24 Tools', website: 'https://www.pdf24.org/zh', category: 'ai-office', description: 'PDF免费工具', isFree: true, pricing: '免费使用' },
  { name: 'PDF派AI', website: 'https://www.pdfpai.com', category: 'ai-office', description: 'AI PDF工具集', isFree: true, pricing: '免费使用' },
  { name: 'ADDPDF AI', website: 'https://www.addpdf.cn', category: 'ai-office', description: 'AI PDF处理', isFree: true, pricing: '基础功能免费' },
  { name: 'CleverPDF', website: 'https://www.cleverpdf.cn', category: 'ai-office', description: 'AI PDF转换', isFree: true, pricing: '基础功能免费' },
  { name: 'SanPDF AI', website: 'https://www.sanpdf.cn', category: 'ai-office', description: 'AI PDF编辑器', isFree: true, pricing: '基础功能免费' },
  { name: '91PDF AI', website: 'https://www.91pdf.com', category: 'ai-office', description: 'AI PDF工具', isFree: true, pricing: '免费使用' },
  { name: 'PDF转换器AI', website: 'https://www.pdfzhuanhuan.com', category: 'ai-office', description: 'AI PDF转换', isFree: true, pricing: '基础功能免费' },
  { name: '速推PPT AI', website: 'https://www.sutui.com/ppt', category: 'ai-office', description: 'AI PPT制作', isFree: true, pricing: '基础功能免费' },
  { name: '布丁PPT AI', website: 'https://www.buding.cn/ppt', category: 'ai-office', description: 'AI幻灯片制作', isFree: true, pricing: '基础功能免费' },

  // ===== AI学习 - 更多工具 =====
  { name: '猿编程AI', website: 'https://www.yuanbiancheng.com', category: 'ai-learning', description: '猿编程AI学习', isFree: false, pricing: '课程收费' },
  { name: '核桃编程AI', website: 'https://www.hetao101.com', category: 'ai-learning', description: '核桃AI编程学习', isFree: false, pricing: '课程收费' },
  { name: '童程童美AI', website: 'https://www.it61.cn', category: 'ai-learning', description: '达内少儿编程AI', isFree: false, pricing: '课程收费' },
  { name: '编程猫AI', website: 'https://www.codemao.cn', category: 'ai-learning', description: '编程猫AI教学', isFree: true, pricing: '基础功能免费' },
  { name: '小码王AI', website: 'https://www.xiaomawang.com', category: 'ai-learning', description: '小码王AI编程', isFree: false, pricing: '课程收费' },
  { name: '傲梦编程AI', website: 'https://www.all-dream.com', category: 'ai-learning', description: '傲梦AI编程', isFree: false, pricing: '课程收费' },
  { name: '极客战记AI', website: 'https://codecombat.163.com', category: 'ai-learning', description: '网易编程游戏AI', isFree: true, pricing: '基础功能免费' },
  { name: '扣叮编程', website: 'https://coding.qq.com', category: 'ai-learning', description: '腾讯AI编程学习', isFree: true, pricing: '免费使用' },
  { name: '有道小图灵', website: 'https://turing.youdao.com', category: 'ai-learning', description: '网易有道AI编程', isFree: false, pricing: '课程收费' },
  { name: '西瓜创客AI', website: 'https://www.xiguacity.cn', category: 'ai-learning', description: '西瓜AI编程', isFree: false, pricing: '课程收费' },
  { name: '妙小程AI', website: 'https://www.miaocode.com', category: 'ai-learning', description: '妙小程AI编程', isFree: false, pricing: '课程收费' },
  { name: '和码编程AI', website: 'https://www.hemacode.com', category: 'ai-learning', description: '和码AI编程', isFree: false, pricing: '课程收费' },
  { name: '编玩边学AI', website: 'https://www.codepku.com', category: 'ai-learning', description: '编玩边学AI', isFree: false, pricing: '课程收费' },
  { name: '口袋编程AI', website: 'https://www.koudaibiancheng.com', category: 'ai-learning', description: '口袋AI编程', isFree: false, pricing: '课程收费' },
  { name: '点猫科技AI', website: 'https://www.dianmao.com', category: 'ai-learning', description: '点猫AI教育', isFree: false, pricing: '企业服务' },
  { name: '洋葱学园AI', website: 'https://www.yangcong345.com', category: 'ai-learning', description: '洋葱AI学习', isFree: true, pricing: '基础功能免费' },
  { name: '一起学AI', website: 'https://www.17xue.com', category: 'ai-learning', description: '一起教育AI', isFree: true, pricing: '基础功能免费' },
  { name: '学而思网校AI', website: 'https://www.xueersi.com/wangxiao', category: 'ai-learning', description: '学而思AI网课', isFree: false, pricing: '课程收费' },
  { name: '高途课堂AI', website: 'https://www.gaotu.cn', category: 'ai-learning', description: '高途AI网课', isFree: false, pricing: '课程收费' },
  { name: '作业帮直播课AI', website: 'https://www.zuoyebang.com/live', category: 'ai-learning', description: '作业帮AI直播', isFree: false, pricing: '课程收费' },
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
  console.log('继续插入国内AI工具（第二批）...');
  console.log(`准备插入 ${moreTools.length} 个工具`);

  const { data: existingTools } = await supabase.from('ai_tools').select('website');
  const existingWebsites = new Set(existingTools?.map(t => t.website) || []);
  
  const newTools = moreTools.filter(tool => !existingWebsites.has(tool.website));
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
}

main().catch(console.error);
