/**
 * PM2 生态系统配置文件
 * 
 * 使用方法：
 *   pm2 start ecosystem.config.js --env production
 *   pm2 restart ecosystem.config.js --env production
 *   pm2 stop ecosystem.config.js
 */

module.exports = {
  apps: [
    {
      name: 'ant-ai-nav',
      
      // 启动命令
      script: 'pnpm',
      args: 'start',
      
      // 工作目录（部署时请修改为实际路径）
      cwd: '/www/wwwroot/ant-ai-nav',
      
      // 实例数量
      // 'max' 表示使用所有 CPU 核心
      // 数字表示具体实例数量
      instances: 1,
      
      // 自动重启
      autorestart: true,
      
      // 文件监视（生产环境建议关闭）
      watch: false,
      
      // 忽略监视的文件
      ignore_watch: ['node_modules', 'logs', '.next'],
      
      // 内存超限自动重启
      max_memory_restart: '1G',
      
      // 生产环境变量
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      
      // 开发环境变量
      env_development: {
        NODE_ENV: 'development',
        PORT: 5000,
      },
      
      // 日志配置
      error_file: '/www/wwwroot/ant-ai-nav/logs/error.log',
      out_file: '/www/wwwroot/ant-ai-nav/logs/out.log',
      log_file: '/www/wwwroot/ant-ai-nav/logs/combined.log',
      
      // 日志时间戳
      time: true,
      
      // 合并日志（集群模式）
      merge_logs: true,
      
      // 日志日期格式
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // 启动等待时间（毫秒）
      listen_timeout: 10000,
      
      // 强制关闭等待时间（毫秒）
      kill_timeout: 5000,
      
      // 异常重启延迟（毫秒）
      restart_delay: 1000,
      
      // 最大重启次数
      max_restarts: 10,
      
      // 最小运行时间（毫秒），小于此时间重启视为异常
      min_uptime: '10s',
      
      // 异常重启判定：在 min_uptime 内重启多少次视为异常
      unstable_restarts: 5,
      
      // cron 定时重启（可选）
      // 例如每天凌晨 3 点重启：'0 3 * * *'
      // cron_restart: '0 3 * * *',
      
      // 源码映射支持
      source_map_support: true,
      
      // 实例启动间隔（集群模式）
      instance_var: 'NODE_APP_INSTANCE',
      
      // 环境变量文件
      env_file: '.env.local',
    },
  ],
  
  // 部署配置（可选，用于远程部署）
  deploy: {
    production: {
      user: 'root',
      host: ['your-server-ip'],
      ref: 'origin/main',
      repo: 'git@github.com:your-username/ant-ai-nav.git',
      path: '/www/wwwroot/ant-ai-nav',
      'pre-deploy-local': '',
      'post-deploy': 'pnpm install && pnpm build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': 'apt-get install git -y',
    },
    
    staging: {
      user: 'root',
      host: ['your-staging-server-ip'],
      ref: 'origin/develop',
      repo: 'git@github.com:your-username/ant-ai-nav.git',
      path: '/www/wwwroot/ant-ai-nav-staging',
      'post-deploy': 'pnpm install && pnpm build && pm2 reload ecosystem.config.js --env development',
    },
  },
};
