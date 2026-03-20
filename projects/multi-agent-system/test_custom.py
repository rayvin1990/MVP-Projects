#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
DeepInsight Core - 自定义问题测试
"""

from deep_insight_core import DeepInsightCore
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

print("="*60)
print("DeepInsight Core - 自定义战略问题测试")
print("="*60)

# 创建系统实例
core = DeepInsightCore()

# 测试问题：AI 写作助手市场
question = "在 AI 工具爆发的背景下，我们是否应该进入 AI 写作助手市场？"

print(f"\n🎯 战略问题：{question}\n")

# 获取决策包
decision = core.ask(question)

# 打印详细结果
print("\n" + "="*60)
print("📦 决策包详细分析")
print("="*60)

print(f"\n【核心结论】")
print(f"  策略：{decision['strategy']}")
print(f"  建议：{decision['recommendation']}")
print(f"  置信度：{decision['confidence_level']}")
print(f"  平均成功概率：{decision['average_success_probability']}")

print(f"\n【场景推演】")
for scenario in decision['scenarios']:
    print(f"\n  {scenario['name']}:")
    print(f"    成功概率：{scenario['success_probability']*100:.1f}%")
    outcome = scenario['expected_outcome']
    print(f"    预期 ROI: {outcome['roi']}")
    print(f"    时间线：{outcome['timeline']}")
    if scenario['risks']:
        print(f"    主要风险：{scenario['risks'][0]['risk']}")

print(f"\n【反事实推理】")
cf = decision['counterfactual_analysis']
print(f"  关键假设：{cf['assumption']}")
print(f"  如果不成立：{cf['if_false']}")
print(f"  备用方案：{cf['backup_plan']}")
print(f"  预警信号：{cf['early_warning_signals'][:2]}")

print(f"\n【最终建议】")
print(f"  {decision['final_advice']}")

print("\n" + "="*60)
print("✅ 测试完成")
print("="*60)
