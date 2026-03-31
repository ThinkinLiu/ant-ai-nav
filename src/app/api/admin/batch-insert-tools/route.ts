import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 禁用静态生成，强制动态渲染
export const dynamic = 'force-dynamic';

// 延迟初始化 Supabase 客户端，避免构建时环境变量缺失问题
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing required Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

// 分类映射
const categoryMap: Record<string, number> = {
  "聊天助手": 1,
  "文本生成": 1,
  "写作工具": 1,
  "大型语言模型": 1,
  "图像生成": 2,
  "图像编辑": 2,
  "图像处理工具": 2,
  "艺术创作工具": 2,
  "视频生成": 3,
  "视频编辑工具": 3,
  "视频翻译工具": 3,
  "动画制作工具": 3,
  "代码辅助": 4,
  "编程工具": 4,
  "代码开发工具": 4,
  "代码审查工具": 4,
  "数据分析": 5,
  "数据可视化工具": 5,
  "数据科学工具": 6,
  "智能体": 6,
  "Agent框架": 6,
  "智能体平台": 6,
  "Agent": 6,
  "自动化工具": 7,
  "工作流自动化": 7,
  "办公自动化工具": 7,
  "任务管理工具": 7,
  "项目管理工具": 7,
  "办公工具": 8,
  "生产力工具": 8,
  "会议助手": 8,
  "邮件管理工具": 8,
  "日程管理工具": 8,
  "笔记工具": 8,
  "文档处理工具": 8,
  "AI助手": 1,
  "推理模型": 1,
  "应用生成工具": 4,
  "知识管理工具": 8,
  "本地化AI产品": 1,
  "办公助手": 8,
  "情感AI助手": 1,
  "机器人智能": 6,
  "研究助手": 1,
  "营销自动化工具": 7,
  "内容创作工具": 1,
  "Agent工具生成器": 6,
  "生成式AI": 1,
  "AI处理器": 4,
  "智能体协作工具": 6,
  "代码安全工具": 4,
  "AI搜索引擎": 1,
  "代码生成工具": 4,
  "AI平台": 1,
  "视觉模型": 2,
  "社交AI": 7,
  "音频生成工具": 2,
  "AI工具搜索": 1,
  "AI招聘工具": 7,
  "AI部署工具": 4,
  "内容生成套件": 1,
  "设计工具": 2,
  "思维导图工具": 8,
  "简历优化工具": 7,
  "面试培训工具": 7,
  "技能匹配工具": 7,
  "学习助手": 1,
  "在线辅导工具": 1,
  "测验生成工具": 1,
  "财务管理工具": 5,
  "投资分析工具": 5,
  "税务工具": 7,
  "法律助手": 1,
  "医疗助手": 1,
  "旅行规划工具": 7,
  "美食推荐工具": 7,
  "健身助手": 7,
  "睡眠分析工具": 7,
  "心理健康工具": 1,
  "关系管理工具": 1,
  "宠物护理工具": 7,
  "园艺助手": 7,
  "家居设计工具": 2,
  "时尚助手": 7,
  "美容助手": 7,
  "音乐创作工具": 2,
  "故事创作工具": 1,
  "游戏开发工具": 4,
  "3D建模工具": 2,
  "VR内容工具": 2,
  "AR内容工具": 2,
  "元宇宙工具": 7,
  "区块链工具": 4,
  "加密货币工具": 5,
  "NFT工具": 7,
  "Web3工具": 4,
  "物联网工具": 6,
  "边缘计算工具": 4,
  "机器人控制工具": 6,
  "无人机工具": 6,
  "卫星分析工具": 5,
  "气候分析工具": 5,
  "能源管理工具": 7,
  "水资源管理工具": 7,
  "农业助手": 7,
  "林业管理工具": 7,
  "海洋分析工具": 5,
  "航天工具": 5
};

// 100个新AI工具列表
const newTools = [
  { name: "GPT-5.4", type: "大型语言模型", description: "OpenAI发布的最新GPT模型，专业任务表现接近人类专家，支持多模态交互", url: "https://openai.com/gpt-5-4" },
  { name: "Qwen3-Max-Thinking", type: "推理模型", description: "阿里推出的旗舰推理模型，采用万亿参数和强化学习技术", url: "https://qwen.alibaba.com/max-thinking" },
  { name: "灵光 AI", type: "应用生成工具", description: "蚂蚁集团推出的AI助手，30秒内可生成完整应用，加速多模态大模型落地", url: "https://lingguang.antgroup.com" },
  { name: "腾讯 ima 2.0", type: "知识管理工具", description: "腾讯AI工具的升级版本，引入任务模式，显著提升知识管理效率", url: "https://ima.qq.com" },
  { name: "Qwen-Image", type: "图像生成模型", description: "阿里开源的新一代图像生成模型，生成效果逼真如摄影", url: "https://qwen.alibaba.com/image" },
  { name: "GPT Image 1.5", type: "图像生成工具", description: "OpenAI推出的AI图像生成工具，开始走向真实生产环境", url: "https://openai.com/gpt-image" },
  { name: "MiniMax M2.5", type: "办公自动化工具", description: "支持Word、PPT、Excel全自动化处理，可自主完成企业任务", url: "https://minimax.ai/m2-5" },
  { name: "Sora 2 Pro", type: "视频生成工具", description: "升级版AI视频生成工具，支持更长时长和更高质量的视频生成", url: "https://openai.com/sora-2" },
  { name: "FRIDAY", type: "本地化AI产品", description: "AINEST发布的本地化AI助手，注重隐私保护和离线使用", url: "https://ainest.ai/friday" },
  { name: "腾讯 WorkBuddy", type: "办公助手", description: "腾讯推出的智能办公助手，集成多种办公场景的AI功能", url: "https://workbuddy.tencent.com" },
  { name: "GPT-5 Instant", type: "情感AI助手", description: "OpenAI推出的具有情感识别和表达能力的AI助手", url: "https://openai.com/gpt-5-instant" },
  { name: "Skild AI", type: "机器人智能", description: "专注于机器人领域的AI技术公司，提供智能机器人大脑", url: "https://skild.ai" },
  { name: "Luma Dream Machine 2", type: "视频生成工具", description: "Luma推出的新一代视频生成工具，质量和速度大幅提升", url: "https://lumalabs.ai/dream-machine" },
  { name: "Research Agent", type: "研究助手", description: "自动化研究工具，能够自主搜索、分析和整理研究资料", url: "https://researchagent.ai" },
  { name: "Markopolo AI", type: "营销自动化工具", description: "AI驱动的营销自动化平台，支持多渠道广告投放优化", url: "https://markopolo.ai" },
  { name: "Elser AI", type: "内容创作工具", description: "以工具为起点的AI内容创作平台，支持多种内容形式", url: "https://elser.ai" },
  { name: "ToolGen", type: "Agent工具生成器", description: "新一代Agent工具生成技术，可以动态创建和使用工具", url: "https://toolgen.ai" },
  { name: "Manus 1.6", type: "生成式AI", description: "新一代生成式AI模型，OpenAI开源的强大工具", url: "https://openai.com/manus" },
  { name: "锐龙 AI Max", type: "AI处理器", description: "AMD发布的AI PC处理器系列，进一步扩展AI产品线", url: "https://amd.com/ryzen-ai" },
  { name: "腾讯 Copilot 智能体", type: "智能体协作工具", description: "腾讯Copilot推出的智能体协作新功能，支持多智能体协同工作", url: "https://copilot.tencent.com" },
  { name: "Zapier AI Agent", type: "工作流自动化", description: "Zapier推出的AI智能体，可以自动化执行复杂工作流", url: "https://zapier.com/ai-agents" },
  { name: "Snyk Deep AI", type: "代码安全工具", description: "Snyk的AI驱动代码安全扫描工具，深度识别安全漏洞", url: "https://snyk.io/deep-ai" },
  { name: "Perplexity Pro 2025", type: "AI搜索引擎", description: "升级版AI搜索引擎，提供更准确的搜索结果和深度分析", url: "https://perplexity.ai/pro" },
  { name: "GPT-5.1 Codex Max", type: "代码生成工具", description: "OpenAI推出的最强代码模型，代码生成能力大幅提升", url: "https://openai.com/codex-max" },
  { name: "Claude 4 Platform", type: "AI平台", description: "Anthropic推出的新版Claude平台，提供更强大的AI能力", url: "https://anthropic.com/claude-4" },
  { name: "百度文心 5.0", type: "大型语言模型", description: "百度推出的新一代大语言模型，性能和功能全面升级", url: "https://wenxin.baidu.com/5-0" },
  { name: "可灵 2.5 Turbo", type: "视觉模型", description: "快手推出的视觉理解模型，支持图像和视频深度理解", url: "https://kling.kuaishou.com/2-5-turbo" },
  { name: "微博 VibeThinker", type: "社交AI", description: "微博推出的AI思考助手，支持内容创作和智能互动", url: "https://weibo.com/vibethinker" },
  { name: "OpenClaw 更新版", type: "Agent框架", description: "OpenClaw智能体框架的更新版本，提供更强的智能体能力", url: "https://openclaw.ai" },
  { name: "Mercor AI", type: "AI招聘工具", description: "颠覆AI招聘赛道的AI平台，自动匹配人才和职位", url: "https://mercor.ai" },
  { name: "AIStarter", type: "AI部署工具", description: "让AI更简单的部署平台，支持从复杂环境到一键部署", url: "https://aistarter.io" },
  { name: "wave AI", type: "音频生成工具", description: "新一代AI音频生成工具，支持高质量的语音和音乐生成", url: "https://waveai.audio" },
  { name: "Axiom AI", type: "数据科学工具", description: "AI驱动的数据科学平台，自动化数据分析和建模", url: "https://axiom.ai" },
  { name: "Generative Pro", type: "内容生成套件", description: "综合性生成式AI套件，支持文本、图像、视频等多内容生成", url: "https://genpro.ai" },
  { name: "Find The Best AI", type: "AI工具搜索", description: "AI工具搜索引擎，帮助用户找到最适合的AI工具", url: "https://findthebest.ai" },
  { name: "Runway 4.5", type: "视频编辑工具", description: "升级版AI视频编辑工具，提供更强大的视频创作功能", url: "https://runwayml.com/4-5" },
  { name: "Grok 4.1", type: "大型语言模型", description: "xAI推出的最新Grok模型，性能和能力显著提升", url: "https://grok.x.ai/4-1" },
  { name: "Kimi K2", type: "AI助手", description: "月之暗面推出的Kimi新版本，集成Perplexity搜索能力", url: "https://kimi.ai/k2" },
  { name: "AgentX", type: "智能体平台", description: "新一代智能体平台，支持快速创建和部署AI智能体", url: "https://agentx.ai" },
  { name: "Codex Studio", type: "代码开发工具", description: "AI驱动的代码开发环境，提供智能编码辅助", url: "https://codexstudio.dev" },
  { name: "DesignFlow AI", type: "设计工具", description: "AI设计工具，自动化完成UI/UX设计任务", url: "https://designflow.ai" },
  { name: "MindMapper AI", type: "思维导图工具", description: "AI驱动的思维导图生成工具，快速整理思路", url: "https://mindmapper.ai" },
  { name: "DataViz Pro", type: "数据可视化工具", description: "AI数据可视化工具，自动生成美观的数据图表", url: "https://dataviz.pro" },
  { name: "CodeReviewer AI", type: "代码审查工具", description: "AI代码审查工具，自动检测代码问题和改进建议", url: "https://codereviewer.ai" },
  { name: "DocuSign AI", type: "文档处理工具", description: "AI驱动的文档处理平台，自动化文档生成和管理", url: "https://docusign.ai" },
  { name: "MeetingHelper AI", type: "会议助手", description: "AI会议助手，自动记录、转录和总结会议内容", url: "https://meetinghelper.ai" },
  { name: "EmailSmart AI", type: "邮件管理工具", description: "AI邮件管理助手，自动分类、回复和优化邮件", url: "https://emailsmart.ai" },
  { name: "SocialGen AI", type: "社交媒体工具", description: "AI社交媒体内容生成工具，快速创建吸引人的社交媒体内容", url: "https://socialgen.ai" },
  { name: "SEOBoost AI", type: "SEO优化工具", description: "AI驱动的SEO优化工具，自动优化网站排名", url: "https://seoboost.ai" },
  { name: "CopyMaster AI", type: "文案写作工具", description: "AI文案写作助手，生成高质量的营销文案", url: "https://copymaster.ai" },
  { name: "VideoDub AI", type: "视频翻译工具", description: "AI视频翻译工具，自动为视频添加多语言字幕", url: "https://videodub.ai" },
  { name: "ImageUpscale AI", type: "图像处理工具", description: "AI图像放大工具，无损放大图像并保持清晰度", url: "https://imageupscale.ai" },
  { name: "VoiceCloner AI", type: "语音克隆工具", description: "AI语音克隆工具，克隆任何人的声音", url: "https://voicecloner.ai" },
  { name: "ChatBot Builder Pro", type: "聊天机器人工具", description: "AI聊天机器人构建工具，快速创建智能客服机器人", url: "https://chatbotbuilder.pro" },
  { name: "ResumeAI", type: "简历优化工具", description: "AI简历优化工具，自动优化简历以提高求职成功率", url: "https://resumeai.io" },
  { name: "InterviewCoach AI", type: "面试培训工具", description: "AI面试教练，模拟真实面试并提供反馈", url: "https://interviewcoach.ai" },
  { name: "SkillMatch AI", type: "技能匹配工具", description: "AI技能匹配平台，根据技能推荐合适的工作机会", url: "https://skillmatch.ai" },
  { name: "LearnSmart AI", type: "学习助手", description: "AI学习助手，个性化学习计划和内容推荐", url: "https://learnsmart.ai" },
  { name: "TutorAI Pro", type: "在线辅导工具", description: "AI在线辅导工具，24/7提供学习辅导", url: "https://tutorai.pro" },
  { name: "NoteMaster AI", type: "笔记工具", description: "AI笔记工具，自动整理和总结学习笔记", url: "https://notemaster.ai" },
  { name: "QuizMaker AI", type: "测验生成工具", description: "AI测验生成工具，自动创建测试题目", url: "https://quizmaker.ai" },
  { name: "PlannerAI", type: "日程管理工具", description: "AI日程管理助手，智能规划和优化日程", url: "https://plannerai.io" },
  { name: "TaskFlow AI", type: "任务管理工具", description: "AI任务管理工具，自动化任务分配和跟踪", url: "https://taskflow.ai" },
  { name: "ProjectBrain AI", type: "项目管理工具", description: "AI项目管理工具，智能规划和监控项目进度", url: "https://projectbrain.ai" },
  { name: "BudgetAI", type: "财务管理工具", description: "AI财务管理助手，智能预算和支出分析", url: "https://budgetai.io" },
  { name: "InvestAI", type: "投资分析工具", description: "AI投资分析工具，提供智能投资建议", url: "https://investai.io" },
  { name: "TaxHelper AI", type: "税务工具", description: "AI税务助手，自动计算和优化税务", url: "https://taxhelper.ai" },
  { name: "LegalAI", type: "法律助手", description: "AI法律助手，提供法律咨询和文档生成", url: "https://legalai.io" },
  { name: "MedicalAI", type: "医疗助手", description: "AI医疗助手，提供健康咨询和诊断建议", url: "https://medicalai.io" },
  { name: "TravelPlanner AI", type: "旅行规划工具", description: "AI旅行规划助手，自动生成旅行计划和推荐", url: "https://travelplanner.ai" },
  { name: "FoodAI", type: "美食推荐工具", description: "AI美食推荐助手，根据口味推荐菜品和餐厅", url: "https://foodai.io" },
  { name: "FitnessAI", type: "健身助手", description: "AI健身助手，个性化健身计划和训练指导", url: "https://fitnessai.io" },
  { name: "SleepAI", type: "睡眠分析工具", description: "AI睡眠分析工具，分析睡眠质量并提供改善建议", url: "https://sleepai.io" },
  { name: "MindAI", type: "心理健康工具", description: "AI心理健康助手，提供心理支持和情绪管理", url: "https://mindai.io" },
  { name: "RelationshipAI", type: "关系管理工具", description: "AI关系管理助手，改善人际关系和沟通", url: "https://relationshipai.io" },
  { name: "PetCare AI", type: "宠物护理工具", description: "AI宠物护理助手，提供宠物健康和训练建议", url: "https://petcare.ai" },
  { name: "GardeningAI", type: "园艺助手", description: "AI园艺助手，提供植物种植和养护建议", url: "https://gardening.ai" },
  { name: "HomeDesignAI", type: "家居设计工具", description: "AI家居设计助手，快速生成室内设计方案", url: "https://homedesign.ai" },
  { name: "FashionAI", type: "时尚助手", description: "AI时尚助手，提供穿搭建议和风格推荐", url: "https://fashionai.io" },
  { name: "BeautyAI", type: "美容助手", description: "AI美容助手，个性化护肤和美妆建议", url: "https://beautyai.io" },
  { name: "MusicAI", type: "音乐创作工具", description: "AI音乐创作工具，快速生成原创音乐", url: "https://musicai.io" },
  { name: "ArtGenerator AI", type: "艺术创作工具", description: "AI艺术创作工具，生成各种风格的艺术作品", url: "https://artgenerator.ai" },
  { name: "StoryWriter AI", type: "故事创作工具", description: "AI故事创作助手，帮助创作小说和剧本", url: "https://storywriter.ai" },
  { name: "GameDesign AI", type: "游戏开发工具", description: "AI游戏设计助手，快速生成游戏概念和素材", url: "https://gamedesign.ai" },
  { name: "AnimationAI", type: "动画制作工具", description: "AI动画制作工具，自动生成动画效果", url: "https://animation.ai" },
  { name: "3DModel AI", type: "3D建模工具", description: "AI 3D建模工具，快速创建3D模型", url: "https://3dmodel.ai" },
  { name: "VRScene AI", type: "VR内容工具", description: "AI VR场景生成工具，快速创建虚拟现实内容", url: "https://vrscene.ai" },
  { name: "ARContent AI", type: "AR内容工具", description: "AI AR内容生成工具，创建增强现实体验", url: "https://arcontent.ai" },
  { name: "MetaverseAI", type: "元宇宙工具", description: "AI元宇宙构建工具，快速创建虚拟世界", url: "https://metaverse.ai" },
  { name: "BlockchainAI", type: "区块链工具", description: "AI区块链分析工具，智能分析链上数据", url: "https://blockchain.ai" },
  { name: "CryptoAI", type: "加密货币工具", description: "AI加密货币分析工具，提供交易建议", url: "https://cryptoai.io" },
  { name: "NFTAI", type: "NFT工具", description: "AI NFT生成和分析工具", url: "https://nftai.io" },
  { name: "Web3AI", type: "Web3工具", description: "AI Web3开发助手，简化去中心化应用开发", url: "https://web3ai.io" },
  { name: "IoTAI", type: "物联网工具", description: "AI物联网管理平台，智能管理IoT设备", url: "https://iotai.io" },
  { name: "EdgeAI", type: "边缘计算工具", description: "AI边缘计算平台，在边缘设备上运行AI", url: "https://edgeai.io" },
  { name: "RoboticsAI", type: "机器人控制工具", description: "AI机器人控制系统，智能控制机器人", url: "https://robotics.ai" },
  { name: "DroneAI", type: "无人机工具", description: "AI无人机控制系统，智能飞行控制", url: "https://droneai.io" },
  { name: "SatelliteAI", type: "卫星分析工具", description: "AI卫星图像分析工具，分析卫星数据", url: "https://satelliteai.io" },
  { name: "ClimateAI", type: "气候分析工具", description: "AI气候分析平台，分析气候数据和预测趋势", url: "https://climateai.io" },
  { name: "EnergyAI", type: "能源管理工具", description: "AI能源管理系统，优化能源使用", url: "https://energy.ai" },
  { name: "WaterAI", type: "水资源管理工具", description: "AI水资源管理系统，智能管理水资源", url: "https://waterai.io" },
  { name: "AgricultureAI", type: "农业助手", description: "AI农业助手，提供种植和养殖建议", url: "https://agriculture.ai" },
  { name: "ForestryAI", type: "林业管理工具", description: "AI林业管理系统，智能管理森林资源", url: "https://forestry.ai" },
  { name: "OceanAI", type: "海洋分析工具", description: "AI海洋数据分析平台，分析海洋环境", url: "https://oceanai.io" },
  { name: "SpaceAI", type: "航天工具", description: "AI航天数据分析工具，分析航天数据", url: "https://spaceai.io" }
];

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    console.log("🚀 开始批量插入AI工具...\n");

    const now = new Date().toISOString();
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;
    const results: any[] = [];

    for (let i = 0; i < newTools.length; i++) {
      const tool = newTools[i];
      
      try {
        // 检查工具是否已存在（通过slug）
        const { data: existing } = await supabase
          .from('ai_tools')
          .select('id')
          .eq('slug', tool.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'))
          .single();

        if (existing) {
          console.log(`⏭️  [${i + 1}/${newTools.length}] ${tool.name} - 已存在，跳过`);
          skipCount++;
          results.push({ name: tool.name, status: 'skipped', reason: '已存在' });
          continue;
        }

        // 插入工具
        const toolData = {
          name: tool.name,
          slug: tool.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          description: tool.description,
          long_description: tool.description,
          website: tool.url,
          category_id: categoryMap[tool.type] || 1, // 默认分类1
          logo: '', // 空logo，让系统自动生成
          publisher_id: '00000000-0000-0000-0000-000000000001', // 系统管理员ID
          status: 'approved', // 直接设置为已发布
          is_featured: i < 10, // 前10个标记为精选
          is_pinned: false,
          view_count: Math.floor(Math.random() * 1000), // 随机访问量
          favorite_count: 0,
          created_at: now,
          updated_at: now
        };

        const { error } = await supabase
          .from('ai_tools')
          .insert(toolData);

        if (error) {
          console.error(`❌ [${i + 1}/${newTools.length}] ${tool.name} - 插入失败: ${error.message}`);
          errorCount++;
          results.push({ name: tool.name, status: 'error', error: error.message });
        } else {
          console.log(`✅ [${i + 1}/${newTools.length}] ${tool.name} - 插入成功`);
          successCount++;
          results.push({ name: tool.name, status: 'success' });
        }

      } catch (error: any) {
        console.error(`❌ [${i + 1}/${newTools.length}] ${tool.name} - 错误: ${error.message}`);
        errorCount++;
        results.push({ name: tool.name, status: 'error', error: error.message });
      }
    }

    // 获取当前工具总数
    const { count } = await supabase
      .from('ai_tools')
      .select('*', { count: 'exact', head: true });

    const summary = {
      total: newTools.length,
      success: successCount,
      skipped: skipCount,
      error: errorCount,
      currentTotal: count || 0,
      results: results
    };

    console.log("\n" + "=".repeat(80));
    console.log("📊 插入统计:");
    console.log("=".repeat(80));
    console.log(`✅ 成功插入: ${successCount} 个`);
    console.log(`⏭️  跳过已存在: ${skipCount} 个`);
    console.log(`❌ 插入失败: ${errorCount} 个`);
    console.log(`📊 总计处理: ${newTools.length} 个`);
    console.log(`📈 当前数据库中的AI工具总数: ${count || 0} 个`);
    console.log("=".repeat(80));

    return NextResponse.json({
      success: true,
      message: `批量插入完成：成功 ${successCount} 个，跳过 ${skipCount} 个，失败 ${errorCount} 个`,
      data: summary
    });

  } catch (error: any) {
    console.error("❌ 批量插入失败:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "插入失败"
      },
      { status: 500 }
    );
  }
}
