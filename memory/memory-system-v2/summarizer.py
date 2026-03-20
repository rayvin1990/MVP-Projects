#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
记忆系统 2.0 - 自动提炼模块
Memory System V2 - Auto Summarizer Module

功能：自动从每日记忆中提取重要内容，追加到长期记忆
"""

import re
from datetime import datetime, timedelta
from pathlib import Path
from typing import List, Dict, Optional, Tuple
from memory_core import MemoryCore


class MemorySummarizer:
    """记忆自动提炼类"""
    
    def __init__(self, core: MemoryCore = None):
        """初始化提炼模块"""
        self.core = core or MemoryCore()
        
        # 关键词配置
        self.important_keywords = [
            '重要', '决定', '必须', '关键', '核心',
            '完成', '解决', '发现', '学到', '记住',
            '问题', '错误', '教训', '改进', '优化'
        ]
        
        # 需要提取的内容模式
        self.patterns = {
            'decisions': [r'决定 [：:]\s*(.+)', r'decided [tT]o\s+(.+)'],
            'tasks': [r'待办 [：:]\s*(.+)', r'\[ \]\s*(.+)', r'todo [：:]\s*(.+)'],
            'completed': [r'完成 [：:]\s*(.+)', r'\[x\]\s*(.+)', r'completed [：:]\s*(.+)'],
            'lessons': [r'学到 [：:]\s*(.+)', r'教训 [：:]\s*(.+)', r'learned [：:]\s*(.+)'],
            'issues': [r'问题 [：:]\s*(.+)', r'错误 [：:]\s*(.+)', r'issue [：:]\s*(.+)']
        }
    
    def extract_important_content(self, content: str, date: str) -> Dict:
        """
        从每日记忆中提取重要内容
        
        Args:
            content: 记忆内容
            date: 日期
            
        Returns:
            提取的内容字典
        """
        extracted = {
            'date': date,
            'decisions': [],
            'tasks': [],
            'completed': [],
            'lessons': [],
            'issues': [],
            'highlights': []
        }
        
        lines = content.split('\n')
        
        for line in lines:
            line = line.strip()
            if not line or line.startswith('#'):
                continue
            
            # 检查是否包含重要关键词
            is_important = any(kw in line for kw in self.important_keywords)
            
            # 按模式匹配
            for category, patterns in self.patterns.items():
                for pattern in patterns:
                    match = re.search(pattern, line, re.IGNORECASE)
                    if match:
                        extracted[category].append(match.group(1).strip())
                        is_important = True
                        break
            
            # 如果是重要内容但没有匹配到具体模式，加入 highlights
            if is_important and len(line) > 10:
                # 避免重复
                if line not in extracted['highlights']:
                    extracted['highlights'].append(line)
        
        return extracted
    
    def generate_summary(self, extracted: Dict) -> str:
        """
        生成提炼总结
        
        Args:
            extracted: 提取的内容字典
            
        Returns:
            格式化的总结文本
        """
        summary = []
        date = extracted.get('date', 'Unknown')
        
        summary.append(f"### {date}")
        summary.append("")
        
        # 决定
        if extracted['decisions']:
            summary.append("**决定**:")
            for item in extracted['decisions']:
                summary.append(f"- {item}")
            summary.append("")
        
        # 完成事项
        if extracted['completed']:
            summary.append("**完成**:")
            for item in extracted['completed']:
                summary.append(f"- {item}")
            summary.append("")
        
        # 经验教训
        if extracted['lessons']:
            summary.append("**经验**:")
            for item in extracted['lessons']:
                summary.append(f"- {item}")
            summary.append("")
        
        # 问题/错误
        if extracted['issues']:
            summary.append("**问题**:")
            for item in extracted['issues']:
                summary.append(f"- {item}")
            summary.append("")
        
        # 其他重点
        if extracted['highlights']:
            # 过滤掉已经归类的内容
            other = []
            for h in extracted['highlights']:
                is_categorized = any(
                    h in extracted[cat] 
                    for cat in ['decisions', 'completed', 'lessons', 'issues']
                )
                if not is_categorized:
                    other.append(h)
            
            if other:
                summary.append("**其他**:")
                for item in other[:5]:  # 最多 5 条
                    summary.append(f"- {item}")
                summary.append("")
        
        summary.append("---")
        summary.append("")
        
        return '\n'.join(summary)
    
    def summarize_day(self, date: str = None) -> Optional[str]:
        """
        提炼指定日期的记忆
        
        Args:
            date: 日期 (YYYY-MM-DD)，默认为昨天
            
        Returns:
            生成的总结，失败返回 None
        """
        if date is None:
            # 默认提炼昨天
            date = (datetime.now() - timedelta(days=1)).strftime('%Y-%m-%d')
        
        content = self.core.read_daily_memory(date)
        if not content:
            return None
        
        extracted = self.extract_important_content(content, date)
        summary = self.generate_summary(extracted)
        
        return summary
    
    def summarize_period(self, start_date: str, end_date: str) -> str:
        """
        提炼一段时间的记忆
        
        Args:
            start_date: 开始日期
            end_date: 结束日期
            
        Returns:
            合并的总结
        """
        summaries = []
        start = datetime.strptime(start_date, '%Y-%m-%d')
        end = datetime.strptime(end_date, '%Y-%m-%d')
        
        current = start
        while current <= end:
            date = current.strftime('%Y-%m-%d')
            summary = self.summarize_day(date)
            if summary:
                summaries.append(summary)
            current += timedelta(days=1)
        
        if not summaries:
            return "期间无记忆内容"
        
        header = f"## 期间总结 ({start_date} ~ {end_date})\n\n"
        return header + '\n'.join(summaries)
    
    def auto_summarize_to_longterm(self, days: int = 7) -> int:
        """
        自动提炼最近 N 天的记忆到长期记忆
        
        Args:
            days: 提炼最近 N 天
            
        Returns:
            成功提炼的天数
        """
        success_count = 0
        today = datetime.now()
        
        for i in range(1, days + 1):  # 从今天往前，不包括今天
            date = (today - timedelta(days=i)).strftime('%Y-%m-%d')
            summary = self.summarize_day(date)
            
            if summary:
                # 检查是否已经提炼过（避免重复）
                longterm = self.core.read_long_term_memory()
                if longterm and date in longterm:
                    continue
                
                self.core.append_long_term_memory(summary)
                success_count += 1
        
        return success_count
    
    def get_suggested_memories(self) -> List[Dict]:
        """
        获取建议写入长期记忆的内容
        
        Returns:
            建议列表
        """
        suggestions = []
        today = datetime.now()
        
        # 检查最近 7 天
        for i in range(1, 8):
            date = (today - timedelta(days=i)).strftime('%Y-%m-%d')
            content = self.core.read_daily_memory(date)
            
            if content:
                # 检查内容长度，太短的可能不值得提炼
                if len(content) > 100:
                    extracted = self.extract_important_content(content, date)
                    
                    # 计算重要性分数
                    score = (
                        len(extracted['decisions']) * 3 +
                        len(extracted['lessons']) * 2 +
                        len(extracted['completed']) * 1 +
                        len(extracted['issues']) * 2
                    )
                    
                    if score > 0:
                        suggestions.append({
                            'date': date,
                            'score': score,
                            'preview': self.generate_summary(extracted)[:200] + '...'
                        })
        
        # 按分数排序
        suggestions.sort(key=lambda x: x['score'], reverse=True)
        return suggestions


# 测试入口
if __name__ == '__main__':
    import sys
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    
    print("[Memory System V2] Summarizer Module Test")
    print("=" * 50)
    
    core = MemoryCore()
    summarizer = MemorySummarizer(core)
    
    # 测试提炼 2026-03-05
    print("\nSummarizing 2026-03-05...")
    summary = summarizer.summarize_day('2026-03-05')
    if summary:
        print(summary)
    else:
        print("No content to summarize")
    
    # 测试获取建议
    print("\nSuggested memories for long-term:")
    suggestions = summarizer.get_suggested_memories()
    for s in suggestions[:3]:
        print(f"  {s['date']} (score: {s['score']})")
        print(f"    {s['preview'][:80]}...")
    
    print("\n[OK] Summarizer module test completed")
