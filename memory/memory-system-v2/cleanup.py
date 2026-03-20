#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
记忆清理模块
Memory Cleanup Module

功能：
- 自动清理过期记忆
- 记忆分级管理
- 定期归档
"""

import os
import json
from datetime import datetime, timedelta
from pathlib import Path
from typing import List, Dict, Tuple


class MemoryCleanup:
    """记忆清理管理器"""
    
    def __init__(self, workspace: str = None):
        """
        初始化清理管理器
        
        Args:
            workspace: 工作区路径
        """
        self.workspace = Path(workspace) if workspace else Path(__file__).parent.parent.parent
        self.memory_dir = self.workspace / "memory"
        self.config_path = Path(__file__).parent / "config.json"
        self.config = self._load_config()
    
    def _load_config(self) -> dict:
        """加载配置文件"""
        if self.config_path.exists():
            with open(self.config_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {}
    
    def get_memory_age(self, file_path: Path) -> int:
        """
        获取记忆文件年龄（天数）
        
        Args:
            file_path: 文件路径
            
        Returns:
            文件年龄（天数）
        """
        if not file_path.exists():
            return -1
        
        # 从文件名解析日期
        try:
            date_str = file_path.stem  # 如 "2026-03-10"
            file_date = datetime.strptime(date_str, '%Y-%m-%d')
            age = (datetime.now() - file_date).days
            return age
        except ValueError:
            # 不是日期格式的文件名
            return -1
    
    def classify_memory(self, content: str) -> str:
        """
        分类记忆内容（重要程度）
        
        Args:
            content: 记忆内容
            
        Returns:
            分类：longTerm, mediumTerm, shortTerm
        """
        importance_keywords = self.config.get('importanceRules', {})
        
        # 检查长期记忆关键词
        for keyword in importance_keywords.get('longTerm', []):
            if keyword in content:
                return 'longTerm'
        
        # 检查短期记忆关键词
        for keyword in importance_keywords.get('shortTerm', []):
            if keyword in content:
                return 'shortTerm'
        
        # 默认中期记忆
        return 'mediumTerm'
    
    def get_cleanup_candidates(self, retention_days: int) -> List[Path]:
        """
        获取待清理文件列表
        
        Args:
            retention_days: 保留天数
            
        Returns:
            待清理文件列表
        """
        candidates = []
        
        if not self.memory_dir.exists():
            return candidates
        
        # 扫描记忆文件
        for file in self.memory_dir.glob("*.md"):
            # 跳过特殊文件
            if file.name in ['tasks.json', 'heartbeat-state.json']:
                continue
            
            age = self.get_memory_age(file)
            if age > retention_days:
                candidates.append(file)
        
        return candidates
    
    def cleanup_short_term(self, days: int = 7) -> Dict:
        """
        清理短期记忆
        
        Args:
            days: 保留天数
            
        Returns:
            清理结果
        """
        print(f"🧹 清理短期记忆（>{days} 天）...")
        
        # 确保 daily 目录存在
        daily_dir = self.memory_dir / "daily"
        if not daily_dir.exists():
            print("ℹ️ 短期记忆目录不存在，跳过")
            return {"deleted": 0, "archived": 0}
        
        deleted = 0
        for file in daily_dir.glob("*.md"):
            age = self.get_memory_age(file)
            if age > days:
                file.unlink()
                deleted += 1
                print(f"  🗑️  已删除：{file.name}")
        
        result = {"deleted": deleted, "archived": 0}
        print(f"✅ 清理完成：删除 {deleted} 个文件")
        return result
    
    def cleanup_medium_term(self, days: int = 30) -> Dict:
        """
        清理中期记忆
        
        Args:
            days: 保留天数
            
        Returns:
            清理结果
        """
        print(f"🧹 清理中期记忆（>{days} 天）...")
        
        candidates = self.get_cleanup_candidates(days)
        
        if not candidates:
            print("ℹ️ 无需清理")
            return {"summarized": 0, "archived": 0}
        
        summarized = 0
        archived = 0
        
        for file in candidates:
            age = self.get_memory_age(file)
            
            if age > days and age <= 60:
                # 30-60 天：提炼后归档
                print(f"  📝 提炼并归档：{file.name} ({age} 天)")
                # TODO: 调用提炼模块
                summarized += 1
                
            elif age > 60:
                # >60 天：直接归档
                print(f"  📦 归档：{file.name} ({age} 天)")
                # TODO: 移动到归档目录
                archived += 1
        
        result = {"summarized": summarized, "archived": archived}
        print(f"✅ 清理完成：提炼 {summarized} 个，归档 {archived} 个")
        return result
    
    def auto_cleanup(self) -> Dict:
        """
        自动清理（根据配置）
        
        Returns:
            清理结果
        """
        print("="*60)
        print("🤖 自动记忆清理")
        print("="*60)
        
        cleanup_config = self.config.get('autoCleanup', {})
        
        if not cleanup_config.get('enabled', False):
            print("ℹ️ 自动清理未启用")
            return {}
        
        results = {
            "timestamp": datetime.now().isoformat(),
            "short_term": {},
            "medium_term": {},
            "total": {}
        }
        
        # 清理短期记忆
        short_term_config = cleanup_config['actions'][0]
        short_result = self.cleanup_short_term(short_term_config['olderThan'])
        results['short_term'] = short_result
        
        # 清理中期记忆
        medium_term_config = cleanup_config['actions'][1]
        medium_result = self.cleanup_medium_term(medium_term_config['olderThan'])
        results['medium_term'] = medium_result
        
        # 统计
        total_deleted = short_result.get('deleted', 0)
        total_summarized = medium_result.get('summarized', 0)
        total_archived = medium_result.get('archived', 0)
        
        results['total'] = {
            "deleted": total_deleted,
            "summarized": total_summarized,
            "archived": total_archived
        }
        
        print("\n" + "="*60)
        print("📊 清理总结")
        print("="*60)
        print(f"删除：{total_deleted} 个文件")
        print(f"提炼：{total_summarized} 个文件")
        print(f"归档：{total_archived} 个文件")
        
        return results
    
    def create_archive_dir(self) -> Path:
        """创建归档目录"""
        archive_dir = self.workspace / "memory_archive"
        archive_dir.mkdir(exist_ok=True)
        return archive_dir
    
    def archive_file(self, file_path: Path) -> bool:
        """
        归档文件
        
        Args:
            file_path: 文件路径
            
        Returns:
            是否成功
        """
        try:
            archive_dir = self.create_archive_dir()
            
            # 生成归档文件名（带日期）
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            archive_name = f"archived_{file_path.stem}_{timestamp}.md"
            archive_path = archive_dir / archive_name
            
            # 移动文件
            file_path.rename(archive_path)
            
            print(f"  ✅ 已归档：{archive_name}")
            return True
            
        except Exception as e:
            print(f"  ❌ 归档失败：{e}")
            return False
    
    def get_cleanup_preview(self) -> Dict:
        """
        预览清理结果（不实际执行）
        
        Returns:
            预览结果
        """
        print("="*60)
        print("🔍 清理预览（不会实际删除）")
        print("="*60)
        
        cleanup_config = self.config.get('autoCleanup', {})
        
        preview = {
            "short_term": [],
            "medium_term": []
        }
        
        # 短期记忆预览
        daily_dir = self.memory_dir / "daily"
        if daily_dir.exists():
            for file in daily_dir.glob("*.md"):
                age = self.get_memory_age(file)
                if age > 7:
                    preview['short_term'].append({
                        "file": file.name,
                        "age": age,
                        "action": "delete"
                    })
        
        # 中期记忆预览
        for file in self.memory_dir.glob("*.md"):
            if file.name in ['tasks.json', 'heartbeat-state.json']:
                continue
            
            age = self.get_memory_age(file)
            if age > 30:
                action = "summarize" if age <= 60 else "archive"
                preview['medium_term'].append({
                    "file": file.name,
                    "age": age,
                    "action": action
                })
        
        # 显示预览
        print("\n🗑️  短期记忆（删除）:")
        for item in preview['short_term']:
            print(f"  - {item['file']} ({item['age']} 天) → {item['action']}")
        
        print("\n📝 中期记忆（提炼/归档）:")
        for item in preview['medium_term']:
            print(f"  - {item['file']} ({item['age']} 天) → {item['action']}")
        
        total = len(preview['short_term']) + len(preview['medium_term'])
        print(f"\n总计：{total} 个文件将被处理")
        
        return preview


# 测试入口
if __name__ == '__main__':
    import sys
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    
    print("="*60)
    print("记忆清理模块测试")
    print("="*60)
    
    cleanup = MemoryCleanup()
    
    # 测试 1: 预览清理
    print("\n测试 1: 清理预览")
    print("-"*60)
    preview = cleanup.get_cleanup_preview()
    
    # 测试 2: 自动清理
    print("\n测试 2: 自动清理")
    print("-"*60)
    result = cleanup.auto_cleanup()
    
    print("\n" + "="*60)
    print("✅ 测试完成")
    print("="*60)
