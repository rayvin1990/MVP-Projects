#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
妆妹国内市场快速调研
直接使用 Brave Search API 搜索真实数据
"""

import sys
import io
import os
import json
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from bvare_search import BraveSearch

print("=" * 70)
print("妆妹国内市场快速调研 - Brave Search API")
print("=" * 70)

# 初始化 API
brave = BraveSearch(os.getenv('BRAVE_API_KEY'))

print(f"\n✅ API 状态：{'可用' if brave.is_available() else '不可用'}\n")

# 搜索查询列表
queries = [
    ("中国美妆 App 市场规模", "market size beauty app China 2025 2026"),
    ("AI 美妆 竞品分析", "AI makeup app China competitors"),
    ("美妆博主 陪伴需求", "makeup tutorial loneliness companion"),
    ("语音交互 美妆应用", "voice interaction beauty app"),
    ("Z 世代 美妆消费习惯", "Gen Z beauty spending habits China"),
]

results = {}

for name, query in queries:
    print(f"🔍 搜索：{name}")
    result = brave.search(query, count=10)
    results[name] = result
    print(f"   结果数：{result.get('total_results', 0)}")
    print()

# 输出总结
print("=" * 70)
print("📊 搜索结果总结")
print("=" * 70)

for name, result in results.items():
    print(f"\n【{name}】")
    print(f"结果数：{result.get('total_results', 0)}")
    
    # 显示前 3 条结果
    for i, item in enumerate(result.get('results', [])[:3], 1):
        print(f"  {i}. {item.get('title', 'N/A')}")
        print(f"     URL: {item.get('url', 'N/A')[:80]}...")
        print()

print("=" * 70)
print("✅ 调研完成")
print("=" * 70)
