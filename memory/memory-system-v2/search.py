#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
记忆系统 2.0 - 搜索模块
Memory System V2 - Search Module
"""

import os
import re
from datetime import datetime, timedelta
from pathlib import Path
from typing import List, Dict, Optional, Tuple
from memory_core import MemoryCore


class MemorySearch:
    """记忆搜索类"""
    
    def __init__(self, core: MemoryCore = None):
        """初始化搜索模块"""
        self.core = core or MemoryCore()
        self.memory_dir = self.core.memory_dir
    
    def search_keyword(self, keyword: str, days: int = 90) -> List[Dict]:
        """
        关键词搜索
        
        Args:
            keyword: 搜索关键词
            days: 搜索最近 N 天
            
        Returns:
            匹配结果列表，每项包含：date, file, content, context
        """
        results = []
        today = datetime.now()
        
        for i in range(days):
            date = (today - timedelta(days=i)).strftime('%Y-%m-%d')
            path = self.memory_dir / f'{date}.md'
            
            if path.exists():
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # 不区分大小写搜索
                if keyword.lower() in content.lower():
                    # 提取上下文（关键词前后各 50 字）
                    matches = self._find_context(content, keyword)
                    for match in matches:
                        results.append({
                            'date': date,
                            'file': path.name,
                            'content': match,
                            'full_path': str(path)
                        })
        
        return results
    
    def _find_context(self, content: str, keyword: str, context_size: int = 50) -> List[str]:
        """提取关键词周围的上下文"""
        matches = []
        lines = content.split('\n')
        
        for line in lines:
            if keyword.lower() in line.lower():
                # 截取关键词周围的文本
                idx = line.lower().find(keyword.lower())
                start = max(0, idx - context_size)
                end = min(len(line), idx + len(keyword) + context_size)
                
                context = line[start:end]
                if start > 0:
                    context = '...' + context
                if end < len(line):
                    context = context + '...'
                
                matches.append(context.strip())
        
        return matches[:5]  # 最多返回 5 条匹配
    
    def search_by_date_range(self, start_date: str, end_date: str) -> List[Dict]:
        """
        按日期范围搜索
        
        Args:
            start_date: 开始日期 (YYYY-MM-DD)
            end_date: 结束日期 (YYYY-MM-DD)
            
        Returns:
            日期范围内的所有记忆文件内容
        """
        results = []
        start = datetime.strptime(start_date, '%Y-%m-%d')
        end = datetime.strptime(end_date, '%Y-%m-%d')
        
        current = start
        while current <= end:
            date = current.strftime('%Y-%m-%d')
            path = self.memory_dir / f'{date}.md'
            
            if path.exists():
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                results.append({
                    'date': date,
                    'file': path.name,
                    'content': content,
                    'full_path': str(path)
                })
            
            current += timedelta(days=1)
        
        return results
    
    def get_recent_memories(self, days: int = 7) -> List[Dict]:
        """获取最近 N 天的记忆"""
        return self.search_by_date_range(
            (datetime.now() - timedelta(days=days)).strftime('%Y-%m-%d'),
            datetime.now().strftime('%Y-%m-%d')
        )
    
    def search_by_tags(self, tags: List[str]) -> List[Dict]:
        """
        按标签搜索（支持多个标签）
        
        Args:
            tags: 标签列表，如 ['#重要', '#待办', '#决定']
            
        Returns:
            包含所有标签的记忆
        """
        results = []
        files = self.core.list_memory_files(90)
        
        for date in files:
            path = self.memory_dir / f'{date}.md'
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # 检查是否包含所有标签
            if all(tag in content for tag in tags):
                results.append({
                    'date': date,
                    'file': path.name,
                    'content': content,
                    'full_path': str(path)
                })
        
        return results
    
    def get_statistics(self, days: int = 30) -> Dict:
        """
        获取记忆统计信息
        
        Returns:
            统计信息字典
        """
        files = self.core.list_memory_files(days)
        
        stats = {
            'total_days': len(files),
            'total_files': len(files),
            'date_range': {
                'oldest': files[-1] if files else None,
                'newest': files[0] if files else None
            },
            'word_count': 0,
            'task_count': 0
        }
        
        # 统计字数和任务数
        for date in files:
            content = self.core.read_daily_memory(date)
            if content:
                stats['word_count'] += len(content)
                stats['task_count'] += content.count('[ ]') + content.count('[x]')
        
        return stats
    
    def export_memories(self, output_path: str, days: int = 30, format: str = 'markdown') -> bool:
        """
        导出记忆到文件
        
        Args:
            output_path: 输出文件路径
            days: 导出最近 N 天
            format: 导出格式 (markdown/text)
            
        Returns:
            是否成功
        """
        try:
            memories = self.get_recent_memories(days)
            
            with open(output_path, 'w', encoding='utf-8') as f:
                if format == 'markdown':
                    f.write('# 记忆导出 - Memory Export\n\n')
                    f.write(f'导出时间：{datetime.now().strftime("%Y-%m-%d %H:%M")}\n')
                    f.write(f'范围：最近 {days} 天\n\n')
                    f.write('---\n\n')
                    
                    for mem in memories:
                        f.write(f"## {mem['date']}\n\n")
                        f.write(mem['content'])
                        f.write('\n\n---\n\n')
                
                elif format == 'text':
                    for mem in memories:
                        f.write(f"[{mem['date']}]\n")
                        f.write(mem['content'])
                        f.write('\n\n')
            
            return True
        except Exception as e:
            print(f"导出失败：{e}")
            return False


# 测试入口
if __name__ == '__main__':
    import sys
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    
    print("[Memory System V2] Search Module Test")
    print("=" * 50)
    
    core = MemoryCore()
    search = MemorySearch(core)
    
    # 测试关键词搜索
    print("\nSearching for '记忆'...")
    results = search.search_keyword('记忆', days=30)
    print(f"Found {len(results)} results")
    for r in results[:3]:
        print(f"  - {r['date']}: {r['content'][:60]}...")
    
    # 测试统计
    print("\nStatistics (last 30 days):")
    stats = search.get_statistics(30)
    print(f"  Total days: {stats['total_days']}")
    print(f"  Word count: {stats['word_count']}")
    print(f"  Task count: {stats['task_count']}")
    
    print("\n[OK] Search module test completed")
