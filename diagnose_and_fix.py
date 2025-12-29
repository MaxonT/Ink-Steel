#!/usr/bin/env python3
"""
全面诊断和修复网站路径问题
运行: python3 diagnose_and_fix.py
"""

import os
import re
import sys
from pathlib import Path

# 确定frontend目录
FRONTEND_DIR = Path(__file__).parent / 'frontend'
if not FRONTEND_DIR.exists():
    # 尝试从当前目录查找
    FRONTEND_DIR = Path('frontend')
    if not FRONTEND_DIR.exists():
        print("错误: 找不到 frontend 目录")
        sys.exit(1)

print(f"Frontend 目录: {FRONTEND_DIR.absolute()}")

HTML_FILES = [
    'index.html', 'about.html', 'blog.html', 'brands.html',
    'care.html', 'compare.html', 'contact.html', 'favorites.html',
    'history.html', 'inks.html', 'pen-detail.html', 'ink-detail.html',
    'stats.html', '404.html', 'offline.html'
]

def fix_manifest_path(content):
    """修复manifest.json路径"""
    # /manifest.json -> public/manifest.json
    # manifest.json -> public/manifest.json
    patterns = [
        (r'<link\s+rel=["\']manifest["\']\s+href=["\']/?manifest\.json["\']', 
         '<link rel="manifest" href="public/manifest.json"'),
        (r'<link\s+rel=["\']manifest["\']\s+href=["\']/public/manifest\.json["\']', 
         '<link rel="manifest" href="public/manifest.json"'),
    ]
    for pattern, replacement in patterns:
        content = re.sub(pattern, replacement, content, flags=re.IGNORECASE)
    return content

def fix_service_worker_registration(content):
    """修复service worker注册路径"""
    patterns = [
        (r'serviceWorker\.register\(["\']/?service-worker\.js["\']',
         "serviceWorker.register('public/service-worker.js'"),
        (r'navigator\.serviceWorker\.register\(["\']/?service-worker\.js["\']',
         "navigator.serviceWorker.register('public/service-worker.js'"),
        (r'\.register\(["\']/public/service-worker\.js["\']',
         ".register('public/service-worker.js'"),
    ]
    for pattern, replacement in patterns:
        content = re.sub(pattern, replacement, content, flags=re.IGNORECASE)
    return content

def fix_asset_paths(content):
    """修复资源路径"""
    # CSS路径
    content = re.sub(r'href=["\']/?assets/styles/', 'href="assets/styles/', content)
    content = re.sub(r'href=["\']\.\./assets/styles/', 'href="assets/styles/', content)
    
    # JS路径
    content = re.sub(r'src=["\']/?assets/scripts/', 'src="assets/scripts/', content)
    content = re.sub(r'src=["\']\.\./assets/scripts/', 'src="assets/scripts/', content)
    
    return content

def fix_data_paths(content):
    """修复数据文件路径"""
    content = re.sub(r'["\']/data/', '"data/', content)
    content = re.sub(r'["\']\.\./data/', '"data/', content)
    return content

def fix_public_paths(content):
    """修复public文件夹路径"""
    # 将 /public/ 改为 public/（相对路径）
    content = re.sub(r'["\']/public/', '"public/', content)
    return content

def process_html_file(file_path):
    """处理单个HTML文件"""
    print(f"处理: {file_path.name}")
    
    try:
        content = file_path.read_text(encoding='utf-8')
        original = content
        
        # 应用所有修复
        content = fix_manifest_path(content)
        content = fix_service_worker_registration(content)
        content = fix_asset_paths(content)
        content = fix_data_paths(content)
        content = fix_public_paths(content)
        
        if content != original:
            file_path.write_text(content, encoding='utf-8')
            print(f"  ✓ 已修复")
            return True
        else:
            print(f"  - 无需修复")
            return False
    except Exception as e:
        print(f"  ✗ 错误: {e}")
        return False

def fix_service_worker():
    """修复Service Worker文件"""
    sw_path = FRONTEND_DIR / 'public' / 'service-worker.js'
    
    if not sw_path.exists():
        print(f"Service Worker 不存在: {sw_path}")
        return False
    
    print(f"处理 Service Worker: {sw_path.name}")
    
    try:
        content = sw_path.read_text(encoding='utf-8')
        original = content
        
        # 修复路径（移除不必要的/public/前缀，但需要小心处理）
        # 只修复明显错误的路径
        lines = content.split('\n')
        fixed_lines = []
        for line in lines:
            # 修复 STATIC_ASSETS 中的路径
            # 如果路径以 /public/ 开头且不是 BASE_PATH + '/public/'，则移除
            if '/public/' in line and 'STATIC_ASSETS' in line:
                # 检查是否是路径定义
                if any(x in line for x in ["'/", '"/', "',", '",']):
                    line = line.replace("/public/", "/")
            fixed_lines.append(line)
        
        fixed_content = '\n'.join(fixed_lines)
        
        if fixed_content != original:
            sw_path.write_text(fixed_content, encoding='utf-8')
            print(f"  ✓ Service Worker 已修复")
            return True
        else:
            print(f"  - Service Worker 无需修复")
            return False
    except Exception as e:
        print(f"  ✗ Service Worker 错误: {e}")
        return False

def fix_js_files():
    """修复JS文件中的路径"""
    scripts_dir = FRONTEND_DIR / 'assets' / 'scripts'
    
    if not scripts_dir.exists():
        print(f"Scripts 目录不存在: {scripts_dir}")
        return 0
    
    fixed_count = 0
    
    def process_js_file(file_path):
        nonlocal fixed_count
        try:
            content = file_path.read_text(encoding='utf-8')
            original = content
            
            content = fix_data_paths(content)
            content = fix_public_paths(content)
            
            if content != original:
                file_path.write_text(content, encoding='utf-8')
                rel_path = file_path.relative_to(FRONTEND_DIR)
                print(f"  ✓ {rel_path}")
                fixed_count += 1
        except Exception as e:
            print(f"  ✗ {file_path}: {e}")
    
    for js_file in scripts_dir.rglob('*.js'):
        process_js_file(js_file)
    
    return fixed_count

def diagnose():
    """诊断问题"""
    print("\n=== 诊断问题 ===\n")
    
    issues = []
    
    # 检查manifest.json
    manifest_path = FRONTEND_DIR / 'public' / 'manifest.json'
    if not manifest_path.exists():
        issues.append("❌ public/manifest.json 不存在")
    else:
        print("✓ public/manifest.json 存在")
    
    # 检查service-worker.js
    sw_path = FRONTEND_DIR / 'public' / 'service-worker.js'
    if not sw_path.exists():
        issues.append("❌ public/service-worker.js 不存在")
    else:
        print("✓ public/service-worker.js 存在")
    
    # 检查HTML文件中的manifest链接
    print("\n检查HTML文件中的manifest链接...")
    for html_file in HTML_FILES:
        file_path = FRONTEND_DIR / html_file
        if file_path.exists():
            content = file_path.read_text(encoding='utf-8')
            if 'manifest' in content.lower():
                if '/manifest.json' in content and 'public/manifest.json' not in content:
                    issues.append(f"⚠ {html_file}: manifest路径可能不正确")
                elif 'manifest.json' in content and '/public/' not in content and 'public/' not in content:
                    issues.append(f"⚠ {html_file}: manifest路径可能不正确")
    
    # 检查service worker注册
    print("\n检查Service Worker注册...")
    for html_file in HTML_FILES:
        file_path = FRONTEND_DIR / html_file
        if file_path.exists():
            content = file_path.read_text(encoding='utf-8')
            if 'serviceWorker' in content or 'service-worker' in content:
                if '/service-worker.js' in content and 'public/service-worker.js' not in content:
                    issues.append(f"⚠ {html_file}: service worker路径可能不正确")
    
    if issues:
        print("\n发现的问题:")
        for issue in issues:
            print(f"  {issue}")
    else:
        print("\n✓ 未发现明显问题")
    
    return issues

def main():
    print("=== 网站路径问题诊断和修复工具 ===\n")
    
    # 首先诊断
    issues = diagnose()
    
    print("\n" + "="*50)
    print("开始修复...")
    print("="*50 + "\n")
    
    fixed_count = 0
    
    # 修复HTML文件
    print("1. 修复HTML文件...\n")
    for html_file in HTML_FILES:
        file_path = FRONTEND_DIR / html_file
        if file_path.exists():
            if process_html_file(file_path):
                fixed_count += 1
        else:
            print(f"跳过不存在的文件: {html_file}")
    
    # 修复Service Worker
    print("\n2. 修复Service Worker...\n")
    if fix_service_worker():
        fixed_count += 1
    
    # 修复JS文件
    print("\n3. 修复JS文件...\n")
    js_fixed = fix_js_files()
    fixed_count += js_fixed
    
    print(f"\n=== 修复完成，共修复 {fixed_count} 个文件 ===")

if __name__ == '__main__':
    main()

