'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, AlertCircle, Database, Globe, Save, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface DatabaseConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceRoleKey?: string;
  siteUrl?: string;
  siteName?: string;
}

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<DatabaseConfig>({
    supabaseUrl: '',
    supabaseAnonKey: '',
    supabaseServiceRoleKey: '',
    siteUrl: '',
    siteName: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showKeys, setShowKeys] = useState(false);

  // 加载配置
  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await fetch('/api/config/database');
      const data = await response.json();

      if (data.config) {
        setConfig({
          supabaseUrl: data.config.supabaseUrl || '',
          supabaseAnonKey: '', // 不加载完整密钥，用户需要重新输入
          supabaseServiceRoleKey: '', // 不加载完整密钥
          siteUrl: data.config.siteUrl || '',
          siteName: data.config.siteName || '',
        });
      }

      setLoading(false);
    } catch (error) {
      console.error('加载配置失败:', error);
      toast.error('加载配置失败');
      setLoading(false);
    }
  };

  const validateField = (name: string, value: string): string | null => {
    if (!value && (name === 'supabaseUrl' || name === 'supabaseAnonKey')) {
      return '此项不能为空';
    }

    if (name === 'supabaseUrl' && value) {
      if (!value.startsWith('https://')) {
        return 'URL 必须以 https:// 开头';
      }
      try {
        new URL(value);
      } catch {
        return '请输入有效的 URL';
      }
    }

    if (name === 'supabaseAnonKey' && value && value.length < 50) {
      return '密钥格式不正确';
    }

    return null;
  };

  const handleInputChange = (name: keyof DatabaseConfig, value: string) => {
    setConfig((prev) => ({ ...prev, [name]: value }));
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
      } else {
        toast.error('保存失败，请检查输入');
      }
    } catch (error) {
      toast.error('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">系统配置</h1>
          <p className="text-muted-foreground mt-2">
            管理数据库连接和站点配置
          </p>
        </div>
        <Button variant="outline" onClick={loadConfig} disabled={loading}>
          <RefreshCw className="w-4 h-4 mr-2" />
          刷新
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            数据库配置
          </CardTitle>
          <CardDescription>
            Supabase 数据库连接信息
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
                type={showKeys ? "text" : "password"}
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
                type={showKeys ? "text" : "password"}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={config.supabaseServiceRoleKey || ''}
                onChange={(e) => handleInputChange('supabaseServiceRoleKey', e.target.value)}
                disabled={saving || validating}
              />
              <p className="text-xs text-muted-foreground">
                用于管理权限，在 Supabase 控制台的 Settings → API 中获取
              </p>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowKeys(!showKeys)}
            >
              {showKeys ? '隐藏密钥' : '显示密钥'}
            </Button>

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
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    保存配置
                  </>
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
            站点基本信息（可选）
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
          <strong>注意事项：</strong>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
            <li>修改数据库配置后，所有服务会重新连接数据库</li>
            <li>建议先验证连接，确认无误后再保存</li>
            <li>Service Role Key 是管理密钥，请妥善保管</li>
            <li>配置修改后会立即生效</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
}
