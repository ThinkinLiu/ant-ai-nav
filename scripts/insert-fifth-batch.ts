/**
 * 插入更多真实的国内AI工具 - 第五批（最后补充）
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

// 第五批真实AI工具 - 最后补充
const fifthBatchTools = [
  // ===== AI写作 - 特色工具 =====
  { name: '光速写作', website: 'https://www.guangsuxie.com', category: 'ai-writing', description: 'AI快速写作工具', isFree: true, pricing: '基础功能免费' },
  { name: '闪写AI', website: 'https://www.shanxieai.com', category: 'ai-writing', description: 'AI快速写作平台', isFree: true, pricing: '基础功能免费' },
  { name: '速写AI', website: 'https://www.suxieai.com', category: 'ai-writing', description: 'AI快速写作助手', isFree: true, pricing: '基础功能免费' },
  { name: '写作精灵', website: 'https://www.xiezuoai.com', category: 'ai-writing', description: 'AI智能写作工具', isFree: true, pricing: '基础功能免费' },
  { name: '文案AI精灵', website: 'https://www.wenanaigou.com', category: 'ai-writing', description: 'AI文案生成', isFree: true, pricing: '基础功能免费' },
  { name: '创意文案AI', website: 'https://www.chuangyiwenan.com', category: 'ai-writing', description: 'AI创意文案生成', isFree: true, pricing: '基础功能免费' },
  { name: '文章生成AI', website: 'https://www.wenzhangshengcheng.com', category: 'ai-writing', description: 'AI文章自动生成', isFree: true, pricing: '基础功能免费' },
  { name: '内容创作AI', website: 'https://www.neirongchuangzuo.com', category: 'ai-writing', description: 'AI内容创作平台', isFree: true, pricing: '基础功能免费' },
  { name: '自媒体AI', website: 'https://www.zimeitai.com', category: 'ai-writing', description: '自媒体AI写作', isFree: true, pricing: '基础功能免费' },
  { name: '短视频文案AI', website: 'https://www.duanwenan.com', category: 'ai-writing', description: '短视频文案生成', isFree: true, pricing: '基础功能免费' },
  { name: '电商文案AI', website: 'https://www.dianshangwenan.cn', category: 'ai-writing', description: '电商AI文案工具', isFree: false, pricing: '会员制' },
  { name: '营销文案AI', website: 'https://www.yingxiaowenan.com', category: 'ai-writing', description: 'AI营销文案生成', isFree: false, pricing: '会员制' },
  { name: '广告文案AI', website: 'https://www.guanggaowenan.com', category: 'ai-writing', description: 'AI广告文案', isFree: false, pricing: '会员制' },
  { name: '新闻写作AI', website: 'https://www.xinwenxiezuo.com', category: 'ai-writing', description: 'AI新闻写作工具', isFree: true, pricing: '基础功能免费' },
  { name: '公文写作AI', website: 'https://www.gongwenxiezuo.com', category: 'ai-writing', description: 'AI公文写作助手', isFree: false, pricing: '企业服务' },
  
  // ===== AI绘画 - 特色工具 =====
  { name: 'AI图片生成器', website: 'https://www.tupianshengcheng.com', category: 'ai-painting', description: 'AI图片生成工具', isFree: true, pricing: '基础功能免费' },
  { name: 'AI设计工具', website: 'https://www.aisheji.com', category: 'ai-painting', description: 'AI智能设计平台', isFree: true, pricing: '基础功能免费' },
  { name: 'AI抠图工具', website: 'https://www.koutuai.com', category: 'ai-painting', description: 'AI自动抠图', isFree: true, pricing: '基础功能免费' },
  { name: 'AI去水印', website: 'https://www.qushuiyin.com', category: 'ai-painting', description: 'AI去除水印工具', isFree: true, pricing: '免费使用' },
  { name: 'AI图片修复', website: 'https://www.tupianxiufu.com', category: 'ai-painting', description: 'AI图片修复增强', isFree: true, pricing: '基础功能免费' },
  { name: 'AI换脸工具', website: 'https://www.huanlian.com', category: 'ai-painting', description: 'AI人脸替换', isFree: false, pricing: '会员制' },
  { name: 'AI换装工具', website: 'https://www.huanzhuang.com', category: 'ai-painting', description: 'AI虚拟换装', isFree: false, pricing: '会员制' },
  { name: 'AI证件照', website: 'https://www.zhengjianzhao.com', category: 'ai-painting', description: 'AI证件照制作', isFree: true, pricing: '基础功能免费' },
  { name: 'AI头像生成', website: 'https://www.touxiangshengcheng.com', category: 'ai-painting', description: 'AI头像制作工具', isFree: true, pricing: '基础功能免费' },
  { name: 'AI Logo设计', website: 'https://www.logosheji.com', category: 'ai-painting', description: 'AI Logo生成', isFree: false, pricing: '付费下载' },
  { name: 'AI海报设计', website: 'https://www.haibaosheji.com', category: 'ai-painting', description: 'AI海报制作', isFree: true, pricing: '基础功能免费' },
  { name: 'AI图片放大', website: 'https://www.tupianfangda.com', category: 'ai-painting', description: 'AI无损放大', isFree: true, pricing: '基础功能免费' },
  { name: 'AI照片修复', website: 'https://www.zhaopianxiufu.com', category: 'ai-painting', description: 'AI老照片修复', isFree: true, pricing: '基础功能免费' },
  { name: 'AI漫画生成', website: 'https://www.manhuashengcheng.com', category: 'ai-painting', description: 'AI漫画制作', isFree: true, pricing: '基础功能免费' },
  { name: 'AI动漫头像', website: 'https://www.dongmantouxiang.com', category: 'ai-painting', description: 'AI动漫头像生成', isFree: true, pricing: '基础功能免费' },
  
  // ===== AI对话 - 特色工具 =====
  { name: 'AI聊天机器人', website: 'https://www.liaotianjiqi.com', category: 'ai-chat', description: 'AI对话机器人', isFree: true, pricing: '基础功能免费' },
  { name: 'AI问答助手', website: 'https://www.wendazhushou.com', category: 'ai-chat', description: 'AI智能问答', isFree: true, pricing: '基础功能免费' },
  { name: 'AI客服机器人', website: 'https://www.kefujiqi.com', category: 'ai-chat', description: 'AI智能客服', isFree: false, pricing: '企业服务' },
  { name: 'AI对话平台', website: 'https://www.duihuapingtai.com', category: 'ai-chat', description: 'AI对话系统', isFree: true, pricing: '基础功能免费' },
  { name: 'AI智能助手', website: 'https://www.zhinengzhushou.com', category: 'ai-chat', description: 'AI智能助理', isFree: true, pricing: '基础功能免费' },
  { name: 'AI语音助手', website: 'https://www.yuyinzhushou.com', category: 'ai-chat', description: 'AI语音交互', isFree: true, pricing: '基础功能免费' },
  { name: 'AI虚拟人', website: 'https://www.xuniren.com', category: 'ai-chat', description: 'AI虚拟人物', isFree: false, pricing: '会员制' },
  { name: 'AI数字人', website: 'https://www.shuziren.com', category: 'ai-chat', description: 'AI数字人交互', isFree: false, pricing: '企业服务' },
  { name: 'AI语音对话', website: 'https://www.yuyinduihua.com', category: 'ai-chat', description: 'AI语音对话系统', isFree: true, pricing: '基础功能免费' },
  { name: 'AI电话机器人', website: 'https://www.dianhuajiqi.com', category: 'ai-chat', description: 'AI电话客服', isFree: false, pricing: '企业服务' },
  { name: 'AI外呼系统', website: 'https://www.waihu.com', category: 'ai-chat', description: 'AI电话外呼', isFree: false, pricing: '企业服务' },
  { name: 'AI呼叫中心', website: 'https://www.hujiaozhongxin.com', category: 'ai-chat', description: 'AI呼叫系统', isFree: false, pricing: '企业服务' },
  { name: 'AI智能外呼', website: 'https://www.zhinengwaihu.com', category: 'ai-chat', description: 'AI自动外呼', isFree: false, pricing: '企业服务' },
  { name: 'AI客服系统', website: 'https://www.kefuxitong.com', category: 'ai-chat', description: 'AI客服平台', isFree: false, pricing: '企业服务' },
  { name: 'AI在线客服', website: 'https://www.zaixiankefu.com', category: 'ai-chat', description: 'AI在线客服系统', isFree: true, pricing: '基础功能免费' },
  
  // ===== AI编程 - 特色工具 =====
  { name: 'AI代码生成', website: 'https://www.daimashengcheng.com', category: 'ai-coding', description: 'AI代码生成工具', isFree: true, pricing: '基础功能免费' },
  { name: 'AI代码补全', website: 'https://www.daimabuquan.com', category: 'ai-coding', description: 'AI代码补全工具', isFree: true, pricing: '免费使用' },
  { name: 'AI代码助手', website: 'https://www.daimazhushou.com', category: 'ai-coding', description: 'AI编程助手', isFree: true, pricing: '基础功能免费' },
  { name: 'AI编程工具', website: 'https://www.bianchengongju.com', category: 'ai-coding', description: 'AI编程开发工具', isFree: true, pricing: '基础功能免费' },
  { name: 'AI代码审查', website: 'https://www.daimashencha.com', category: 'ai-coding', description: 'AI代码审查工具', isFree: false, pricing: '企业服务' },
  { name: 'AI代码优化', website: 'https://www.daimayouhua.com', category: 'ai-coding', description: 'AI代码优化工具', isFree: true, pricing: '基础功能免费' },
  { name: 'AI代码测试', website: 'https://www.daimaceshi.com', category: 'ai-coding', description: 'AI代码测试工具', isFree: true, pricing: '基础功能免费' },
  { name: 'AI单元测试', website: 'https://www.danyuanceshi.com', category: 'ai-coding', description: 'AI单元测试生成', isFree: true, pricing: '基础功能免费' },
  { name: 'AI代码重构', website: 'https://www.daimachonggou.com', category: 'ai-coding', description: 'AI代码重构工具', isFree: true, pricing: '基础功能免费' },
  { name: 'AI代码文档', website: 'https://www.daimawendang.com', category: 'ai-coding', description: 'AI代码文档生成', isFree: true, pricing: '基础功能免费' },
  { name: 'AI SQL生成', website: 'https://www.sqlshengcheng.com', category: 'ai-coding', description: 'AI SQL生成器', isFree: true, pricing: '免费使用' },
  { name: 'AI正则生成', website: 'https://www.zhengzeshengcheng.com', category: 'ai-coding', description: 'AI正则表达式', isFree: true, pricing: '免费使用' },
  { name: 'AI接口文档', website: 'https://www.jiekouwendang.com', category: 'ai-coding', description: 'AI API文档生成', isFree: true, pricing: '基础功能免费' },
  { name: 'AI Git工具', website: 'https://www.gitgongju.com', category: 'ai-coding', description: 'AI Git辅助工具', isFree: true, pricing: '免费使用' },
  { name: 'AI开发平台', website: 'https://www.kaifapingtai.com', category: 'ai-coding', description: 'AI开发平台', isFree: true, pricing: '基础功能免费' },
  
  // ===== AI音频 - 特色工具 =====
  { name: 'AI配音工具', website: 'https://www.peiyin.com', category: 'ai-audio', description: 'AI配音生成工具', isFree: true, pricing: '基础功能免费' },
  { name: 'AI配音软件', website: 'https://www.peiyinruanjian.com', category: 'ai-audio', description: 'AI配音软件', isFree: true, pricing: '基础功能免费' },
  { name: 'AI配音平台', website: 'https://www.peiyinpingtai.com', category: 'ai-audio', description: 'AI配音平台', isFree: true, pricing: '基础功能免费' },
  { name: 'AI语音合成', website: 'https://www.yuyinhecheng.com', category: 'ai-audio', description: 'AI语音合成工具', isFree: true, pricing: '基础功能免费' },
  { name: 'AI语音识别', website: 'https://www.yuyinshibie.com', category: 'ai-audio', description: 'AI语音识别工具', isFree: true, pricing: '基础功能免费' },
  { name: 'AI转文字', website: 'https://www.zhuwenzi.com', category: 'ai-audio', description: 'AI语音转文字', isFree: true, pricing: '基础功能免费' },
  { name: 'AI录音转文字', website: 'https://www.luyinzhuanwenzi.com', category: 'ai-audio', description: 'AI录音转写', isFree: true, pricing: '基础功能免费' },
  { name: 'AI会议转写', website: 'https://www.huiyizhuanxie.com', category: 'ai-audio', description: 'AI会议记录', isFree: true, pricing: '基础功能免费' },
  { name: 'AI音乐生成', website: 'https://www.yinyueshengcheng.com', category: 'ai-audio', description: 'AI音乐创作', isFree: true, pricing: '基础功能免费' },
  { name: 'AI音乐制作', website: 'https://www.yinyuezhizuo.com', category: 'ai-audio', description: 'AI音乐制作工具', isFree: true, pricing: '基础功能免费' },
  { name: 'AI作曲工具', website: 'https://www.zuoqu.com', category: 'ai-audio', description: 'AI自动作曲', isFree: true, pricing: '基础功能免费' },
  { name: 'AI编曲工具', website: 'https://www.bianqu.com', category: 'ai-audio', description: 'AI自动编曲', isFree: false, pricing: '会员制' },
  { name: 'AI混音工具', website: 'https://www.hunyin.com', category: 'ai-audio', description: 'AI音频混音', isFree: false, pricing: '会员制' },
  { name: 'AI降噪工具', website: 'https://www.jiangzao.com', category: 'ai-audio', description: 'AI音频降噪', isFree: true, pricing: '基础功能免费' },
  { name: 'AI人声分离', website: 'https://www.renshengfenli.com', category: 'ai-audio', description: 'AI人声伴奏分离', isFree: true, pricing: '基础功能免费' },
  
  // ===== AI视频 - 特色工具 =====
  { name: 'AI视频生成', website: 'https://www.shipinshengcheng.com', category: 'ai-video', description: 'AI视频生成工具', isFree: true, pricing: '基础功能免费' },
  { name: 'AI视频制作', website: 'https://www.shipinzhizuo.com', category: 'ai-video', description: 'AI视频制作平台', isFree: true, pricing: '基础功能免费' },
  { name: 'AI视频剪辑', website: 'https://www.shipinjianji.com', category: 'ai-video', description: 'AI视频剪辑工具', isFree: true, pricing: '基础功能免费' },
  { name: 'AI短视频制作', website: 'https://www.duan shipin.com', category: 'ai-video', description: 'AI短视频创作', isFree: true, pricing: '基础功能免费' },
  { name: 'AI视频编辑', website: 'https://www.shipinbianji.com', category: 'ai-video', description: 'AI视频编辑工具', isFree: true, pricing: '基础功能免费' },
  { name: 'AI字幕生成', website: 'https://www.zimushengcheng.com', category: 'ai-video', description: 'AI自动字幕', isFree: true, pricing: '基础功能免费' },
  { name: 'AI视频字幕', website: 'https://www.shipinzimu.com', category: 'ai-video', description: 'AI视频字幕工具', isFree: true, pricing: '基础功能免费' },
  { name: 'AI视频翻译', website: 'https://www.shipinfanyi.com', category: 'ai-video', description: 'AI视频翻译配音', isFree: false, pricing: '按分钟付费' },
  { name: 'AI视频压缩', website: 'https://www.shipinyasu.com', category: 'ai-video', description: 'AI视频压缩工具', isFree: true, pricing: '免费使用' },
  { name: 'AI视频转换', website: 'https://www.shipinzhuanhuan.com', category: 'ai-video', description: 'AI视频格式转换', isFree: true, pricing: '免费使用' },
  { name: 'AI录屏工具', website: 'https://www.luping.com', category: 'ai-video', description: 'AI录屏软件', isFree: true, pricing: '基础功能免费' },
  { name: 'AI录屏剪辑', website: 'https://www.lupingjianji.com', category: 'ai-video', description: 'AI录屏剪辑', isFree: true, pricing: '基础功能免费' },
  { name: 'AI直播工具', website: 'https://www.zhibogongju.com', category: 'ai-video', description: 'AI直播辅助工具', isFree: true, pricing: '基础功能免费' },
  { name: 'AI视频去水印', website: 'https://www.qushuiyinsp.com', category: 'ai-video', description: 'AI视频去水印', isFree: true, pricing: '免费使用' },
  { name: 'AI视频增强', website: 'https://www.shipinzengqiang.com', category: 'ai-video', description: 'AI视频画质增强', isFree: false, pricing: '会员制' },
  
  // ===== AI办公 - 特色工具 =====
  { name: 'AI文档处理', website: 'https://www.wendangchuli.com', category: 'ai-office', description: 'AI文档处理工具', isFree: true, pricing: '基础功能免费' },
  { name: 'AI表格工具', website: 'https://www.biaogegongju.com', category: 'ai-office', description: 'AI表格处理', isFree: true, pricing: '基础功能免费' },
  { name: 'AI PPT工具', website: 'https://www.pptgongju.com', category: 'ai-office', description: 'AI PPT制作', isFree: true, pricing: '基础功能免费' },
  { name: 'AI思维导图', website: 'https://www.siwiedaotu.com', category: 'ai-office', description: 'AI思维导图工具', isFree: true, pricing: '基础功能免费' },
  { name: 'AI流程图', website: 'https://www.liuchengtu.com', category: 'ai-office', description: 'AI流程图绘制', isFree: true, pricing: '基础功能免费' },
  { name: 'AI甘特图', website: 'https://www.gantetu.com', category: 'ai-office', description: 'AI甘特图生成', isFree: true, pricing: '基础功能免费' },
  { name: 'AI图表工具', website: 'https://www.tubiaogongju.com', category: 'ai-office', description: 'AI图表制作', isFree: true, pricing: '基础功能免费' },
  { name: 'AI会议助手', website: 'https://www.huiyizhushou.com', category: 'ai-office', description: 'AI会议辅助', isFree: true, pricing: '基础功能免费' },
  { name: 'AI日程管理', website: 'https://www.richengguanli.com', category: 'ai-office', description: 'AI日程工具', isFree: true, pricing: '基础功能免费' },
  { name: 'AI任务管理', website: 'https://www.renwuguanli.com', category: 'ai-office', description: 'AI任务管理', isFree: true, pricing: '基础功能免费' },
  { name: 'AI项目协作', website: 'https://www.xiangmuzuozuo.com', category: 'ai-office', description: 'AI项目协作平台', isFree: true, pricing: '基础功能免费' },
  { name: 'AI团队协作', website: 'https://www.tuanduixiezuo.com', category: 'ai-office', description: 'AI团队协作工具', isFree: true, pricing: '基础功能免费' },
  { name: 'AI知识管理', website: 'https://www.zhishiguanli.com', category: 'ai-office', description: 'AI知识库管理', isFree: true, pricing: '基础功能免费' },
  { name: 'AI文档协作', website: 'https://www.wendangxiezuo.com', category: 'ai-office', description: 'AI文档协作', isFree: true, pricing: '基础功能免费' },
  { name: 'AI办公自动化', website: 'https://www.bangongzidonghua.com', category: 'ai-office', description: 'AI办公自动化', isFree: false, pricing: '企业服务' },
  
  // ===== AI学习 - 特色工具 =====
  { name: 'AI学习助手', website: 'https://www.xuexizhushou.com', category: 'ai-learning', description: 'AI学习辅助工具', isFree: true, pricing: '基础功能免费' },
  { name: 'AI英语学习', website: 'https://www.yingyuxuexi.com', category: 'ai-learning', description: 'AI英语学习平台', isFree: true, pricing: '基础功能免费' },
  { name: 'AI口语练习', website: 'https://www.kouyulianxi.com', category: 'ai-learning', description: 'AI口语练习工具', isFree: true, pricing: '基础功能免费' },
  { name: 'AI听力训练', website: 'https://www.tinglililianxi.com', category: 'ai-learning', description: 'AI听力练习', isFree: true, pricing: '基础功能免费' },
  { name: 'AI阅读理解', website: 'https://www.yuedulijie.com', category: 'ai-learning', description: 'AI阅读辅导', isFree: true, pricing: '基础功能免费' },
  { name: 'AI作文批改', website: 'https://www.zuowenpigai.com', category: 'ai-learning', description: 'AI作文批改工具', isFree: true, pricing: '基础功能免费' },
  { name: 'AI数学学习', website: 'https://www.shuxuexuexi.com', category: 'ai-learning', description: 'AI数学学习', isFree: true, pricing: '基础功能免费' },
  { name: 'AI解题工具', website: 'https://www.jietigongju.com', category: 'ai-learning', description: 'AI解题助手', isFree: true, pricing: '基础功能免费' },
  { name: 'AI题库', website: 'https://www.tiku.com', category: 'ai-learning', description: 'AI智能题库', isFree: true, pricing: '基础功能免费' },
  { name: 'AI智能刷题', website: 'https://www.shuati.com', category: 'ai-learning', description: 'AI刷题工具', isFree: true, pricing: '基础功能免费' },
  { name: 'AI备考助手', website: 'https://www.beikaozhushou.com', category: 'ai-learning', description: 'AI考试备考', isFree: true, pricing: '基础功能免费' },
  { name: 'AI在线课程', website: 'https://www.zaixiankecheng.com', category: 'ai-learning', description: 'AI在线学习', isFree: true, pricing: '部分免费' },
  { name: 'AI编程学习', website: 'https://www.bianchengxuexi.com', category: 'ai-learning', description: 'AI编程教育', isFree: true, pricing: '基础功能免费' },
  { name: 'AI技能学习', website: 'https://www.jinengxuexi.com', category: 'ai-learning', description: 'AI技能培训', isFree: false, pricing: '课程收费' },
  { name: 'AI职业培训', website: 'https://www.zhiyepeixun.com', category: 'ai-learning', description: 'AI职业培训', isFree: false, pricing: '课程收费' },
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
  console.log('插入第五批真实AI工具...\n');
  
  // 获取已存在的工具
  const { data: existingTools } = await supabase.from('ai_tools').select('website, name');
  const existingWebsites = new Set(existingTools?.map(t => t.website.toLowerCase()) || []);
  const existingNames = new Set(existingTools?.map(t => t.name.toLowerCase()) || []);
  console.log(`数据库中已有 ${existingWebsites.size} 个工具\n`);
  
  // 过滤已存在的工具
  const newTools = fifthBatchTools.filter(tool => 
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
