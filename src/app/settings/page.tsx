'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, AlertCircle, Settings, Database, Globe } from 'lucide-react';
import { toast } from 'sonner';

interface DatabaseConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceRoleKey?: string;
  siteUrl?: string;
  siteName?: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [configured, setConfigured] = useState(false);
  const [validating, setValidating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<DatabaseConfig>({
    supabaseUrl: '',
    supabaseAnonKey: '',
    supabaseServiceRoleKey: '',
    siteUrl: typeof window !== 'undefined' ? window.location.origin : '',
    siteName: '蚂蚁AI导航',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [validationError, setValidationError] = useState<string | null>(null);

  // 检查是否已配置
  useEffect(() => {
    checkConfiguration();
  }, []);

  const checkConfiguration = async () => {
    try {
      const response = await fetch('/api/config/database');
      const data = await response.json();

      if (data.configured) {
        // 已配置，跳转到首页
        router.replace('/');
        return;
      }

      setConfigured(false);
      setLoading(false);
    } catch (error) {
      console.error('检查配置失败:', error);
      setLoading(false);
    }
  };

  const validateField = (name: string, value: string): string | null => {
    if (!value) return '此项不能为空';

    if (name === 'supabaseUrl') {
      if (!value.startsWith('https://')) {
        return 'URL 必须以 https:// 开头';
      }
      if (!value.includes('.supabase.co')) {
        return '请输入正确的 Supabase URL';
      }
    }

    if (name === 'supabaseAnonKey') {
      if (value.length < 50) {
        return '密钥格式不正确';
      }
    }

    return null;
  };

  const handleInputChange = (name: keyof DatabaseConfig, value: string) => {
    setConfig((prev) => ({ ...prev, [name]: value }));

    // 清除错误
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setValidationError(null);
  };

  const handleBlur = (name: keyof DatabaseConfig, value: string) => {
    const error = validateField(name, value);
    if (error) {
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleValidate = async () => {
    // 先验证表单
    const newErrors: Record<string, string> = {};

    const urlError = validateField('supabaseUrl', config.supabaseUrl);
    if (urlError) newErrors.supabaseUrl = urlError;

    const keyError = validateField('supabaseAnonKey', config.supabaseAnonKey);
    if (keyError) newErrors.supabaseAnonKey = keyError;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setValidating(true);
    setValidationError(null);

    try {
      const response = await fetch('/api/config/database/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supabaseUrl: config.supabaseUrl,
          supabaseAnonKey: config.supabaseAnonKey,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('数据库连接成功！');
      } else {
        setValidationError(data.error || '数据库连接失败');
      }
    } catch (error) {
      setValidationError('网络错误，请重试');
    } finally {
      setValidating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 验证所有字段
    const newErrors: Record<string, string> = {};

    const urlError = validateField('supabaseUrl', config.supabaseUrl);
    if (urlError) newErrors.supabaseUrl = urlError;

    const keyError = validateField('supabaseAnonKey', config.supabaseAnonKey);
    if (keyError) newErrors.supabaseAnonKey = keyError;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);

    try {
      const response = await fetch('/api/config/database/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('配置保存成功！');
        // 稍等一下后跳转到首页
        setTimeout(() => {
          router.replace('/');
        }, 1500);
      } else {
        setErrors(data.errors?.reduce((acc: Record<string, string>, err: string) => {
          acc['general'] = err;
          return acc;
        }, {}) || {});
      }
    } catch (error) {
      toast.error('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Settings className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">系统配置</h1>
          <p className="text-muted-foreground">
            首次使用需要配置数据库连接信息
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              数据库配置
            </CardTitle>
            <CardDescription>
              请输入您的 Supabase 数据库连接信息
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="supabaseUrl">
                  Supabase URL <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="supabaseUrl"
                  type="url"
                  placeholder="https://your-project.supabase.co"
                  value={config.supabaseUrl}
                  onChange={(e) => handleInputChange('supabaseUrl', e.target.value)}
                  onBlur={(e) => handleBlur('supabaseUrl', e.target.value)}
                  disabled={saving || validating}
                />
                {errors.supabaseUrl && (
                  <p className="text-sm text-destructive">{errors.supabaseUrl}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="supabaseAnonKey">
                  Supabase Anonymous Key <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="supabaseAnonKey"
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={config.supabaseAnonKey}
                  onChange={(e) => handleInputChange('supabaseAnonKey', e.target.value)}
                  onBlur={(e) => handleBlur('supabaseAnonKey', e.target.value)}
                  disabled={saving || validating}
                />
                {errors.supabaseAnonKey && (
                  <p className="text-sm text-destructive">{errors.supabaseAnonKey}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="supabaseServiceRoleKey">
                  Supabase Service Role Key <span className="text-muted-foreground">(可选)</span>
                </Label>
                <Input
                  id="supabaseServiceRoleKey"
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={config.supabaseServiceRoleKey || ''}
                  onChange={(e) => handleInputChange('supabaseServiceRoleKey', e.target.value)}
                  disabled={saving || validating}
                />
                <p className="text-xs text-muted-foreground">
                  用于管理权限，在 Supabase 控制台的 Settings → API 中获取
                </p>
              </div>

              {validationError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{validationError}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleValidate}
                  disabled={saving || validating || !config.supabaseUrl || !config.supabaseAnonKey}
                  className="flex-1"
                >
                  {validating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      验证中...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      验证连接
                    </>
                  )}
                </Button>
                <Button
                  type="submit"
                  disabled={saving || validating}
                  className="flex-1"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      保存中...
                    </>
                  ) : (
                    '保存配置'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              站点配置
            </CardTitle>
            <CardDescription>
              配置站点基本信息（可选）
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="siteUrl">站点 URL</Label>
              <Input
                id="siteUrl"
                type="url"
                placeholder="https://your-domain.com"
                value={config.siteUrl || ''}
                onChange={(e) => handleInputChange('siteUrl', e.target.value)}
                disabled={saving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="siteName">站点名称</Label>
              <Input
                id="siteName"
                placeholder="蚂蚁AI导航"
                value={config.siteName || ''}
                onChange={(e) => handleInputChange('siteName', e.target.value)}
                disabled={saving}
              />
            </div>
          </CardContent>
        </Card>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>配置说明：</strong>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
              <li>Supabase URL 和 Anonymous Key 是必填项</li>
              <li>在 Supabase 控制台的 Settings → API 中获取</li>
              <li>Service Role Key 是管理密钥，建议填写以获得完整功能</li>
              <li>配置文件保存在服务器，不会暴露给前端</li>
            </ul>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
