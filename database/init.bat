@echo off
REM ============================================
REM 蚂蚁AI导航 - 数据库初始化脚本 (Windows)
REM ============================================
REM 使用方法:
REM   init.bat <数据库连接字符串>
REM 
REM 示例:
REM   init.bat postgresql://username:password@localhost:5432/ant_ai_nav
REM ============================================

setlocal enabledelayedexpansion

REM 检查参数
if "%~1"=="" (
    echo 错误: 缺少数据库连接字符串
    echo 使用方法: init.bat ^<数据库连接字符串^>
    echo 示例: init.bat postgresql://username:password@localhost:5432/ant_ai_nav
    exit /b 1
)

set DB_URL=%~1
set SCRIPT_DIR=%~dp0

echo ==========================================
echo 蚂蚁AI导航 - 数据库初始化
echo ==========================================
echo 数据库连接: %DB_URL%
echo 脚本目录: %SCRIPT_DIR%
echo ==========================================
echo.

REM 执行SQL文件
echo 步骤 1/14: 创建表结构...
psql "%DB_URL%" -f "%SCRIPT_DIR%00_schema.sql" >nul 2>&1
if !errorlevel! equ 0 (echo   ✓ 成功) else (echo   ✗ 失败 & exit /b 1)

echo 步骤 2/14: 导入分类数据...
psql "%DB_URL%" -f "%SCRIPT_DIR%01_categories.sql" >nul 2>&1
if !errorlevel! equ 0 (echo   ✓ 成功) else (echo   ✗ 失败 & exit /b 1)

echo 步骤 3/14: 导入标签数据...
psql "%DB_URL%" -f "%SCRIPT_DIR%02_tags.sql" >nul 2>&1
if !errorlevel! equ 0 (echo   ✓ 成功) else (echo   ✗ 失败 & exit /b 1)

echo 步骤 4/14: 导入用户数据...
psql "%DB_URL%" -f "%SCRIPT_DIR%04_users.sql" >nul 2>&1
if !errorlevel! equ 0 (echo   ✓ 成功) else (echo   ✗ 失败 & exit /b 1)

echo 步骤 5/14: 导入AI工具数据...
psql "%DB_URL%" -f "%SCRIPT_DIR%05_ai_tools.sql" >nul 2>&1
if !errorlevel! equ 0 (echo   ✓ 成功) else (echo   ✗ 失败 & exit /b 1)

echo 步骤 6/14: 导入AI名人堂数据...
psql "%DB_URL%" -f "%SCRIPT_DIR%03_ai_hall_of_fame.sql" >nul 2>&1
if !errorlevel! equ 0 (echo   ✓ 成功) else (echo   ✗ 失败 & exit /b 1)

echo 步骤 7/14: 导入AI大事纪数据...
psql "%DB_URL%" -f "%SCRIPT_DIR%06_ai_timeline.sql" >nul 2>&1
if !errorlevel! equ 0 (echo   ✓ 成功) else (echo   ✗ 失败 & exit /b 1)

echo 步骤 8/14: 导入工具标签关联数据...
psql "%DB_URL%" -f "%SCRIPT_DIR%07_tool_tags.sql" >nul 2>&1
if !errorlevel! equ 0 (echo   ✓ 成功) else (echo   ✗ 失败 & exit /b 1)

echo 步骤 9/14: 导入评论数据...
psql "%DB_URL%" -f "%SCRIPT_DIR%08_comments.sql" >nul 2>&1
if !errorlevel! equ 0 (echo   ✓ 成功) else (echo   ✗ 失败 & exit /b 1)

echo 步骤 10/14: 导入发布者申请数据...
psql "%DB_URL%" -f "%SCRIPT_DIR%09_publisher_applications.sql" >nul 2>&1
if !errorlevel! equ 0 (echo   ✓ 成功) else (echo   ✗ 失败 & exit /b 1)

echo 步骤 11/14: 导入排行榜数据...
psql "%DB_URL%" -f "%SCRIPT_DIR%10_ai_tool_rankings.sql" >nul 2>&1
if !errorlevel! equ 0 (echo   ✓ 成功) else (echo   ✗ 失败 & exit /b 1)

echo 步骤 12/14: 导入排行榜更新日志...
psql "%DB_URL%" -f "%SCRIPT_DIR%11_ranking_update_log.sql" >nul 2>&1
if !errorlevel! equ 0 (echo   ✓ 成功) else (echo   ✗ 失败 & exit /b 1)

echo 步骤 13/14: 导入系统设置...
psql "%DB_URL%" -f "%SCRIPT_DIR%12_seo_settings.sql" >nul 2>&1
if !errorlevel! equ 0 (echo   ✓ 成功) else (echo   ✗ 失败 & exit /b 1)

psql "%DB_URL%" -f "%SCRIPT_DIR%13_site_settings.sql" >nul 2>&1
if !errorlevel! equ 0 (echo   ✓ 成功) else (echo   ✗ 失败 & exit /b 1)

psql "%DB_URL%" -f "%SCRIPT_DIR%14_traffic_data_sources.sql" >nul 2>&1
if !errorlevel! equ 0 (echo   ✓ 成功) else (echo   ✗ 失败 & exit /b 1)

echo.
echo ==========================================
echo ✓ 数据库初始化完成！
echo ==========================================
echo.
echo 初始化完成时间: %date% %time%

endlocal
