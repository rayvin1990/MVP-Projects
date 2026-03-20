#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
妆妹国内市场战略分析
使用 DeepInsight Core 系统分析妆妹项目是否值得做国内市场
"""

import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from deep_insight_core import DeepInsightCore

print("=" * 70)
print("DeepInsight Core - 妆妹国内市场战略分析")
print("=" * 70)

# 创建系统实例
core = DeepInsightCore()

# 战略问题
question = "妆妹 (AI 美妆闺蜜 App) 是否值得进入中国市场？目标用户是 18-35 岁女性，核心功能是语音交互 + 妆容建议 + 情感陪伴，定价¥29/月。请分析市场规模、竞争格局、用户痛点、进入策略和风险。"

print(f"\n🎯 战略问题：{question}\n")

# 执行分析
decision_package = core.ask(question)

# 打印总结
core.print_session_summary()

# 输出决策包详情
print("\n" + "=" * 70)
print("📦 最终决策包详情")
print("=" * 70)
print(f"策略：{decision_package['strategy']}")
print(f"建议：{decision_package['recommendation']}")
print(f"置信度：{decision_package['confidence_level']}")
# 处理可能的字符串类型
avg_prob = decision_package['average_success_probability']
if isinstance(avg_prob, (int, float)):
    print(f"平均成功概率：{avg_prob*100:.1f}%")
else:
    print(f"平均成功概率：{avg_prob}")
print(f"最终建议：{decision_package['final_advice']}")
print("=" * 70)
