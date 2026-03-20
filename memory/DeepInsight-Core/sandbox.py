#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
战略推演沙盘模块
Strategic Sandbox Module

功能：
- 多维度场景推演（乐观/中性/悲观）
- 反事实推理
- 风险评估
- 策略成功率计算
"""

import json
from typing import List, Dict, Optional
from datetime import datetime
import random


class StrategicSandbox:
    """战略推演沙盘"""
    
    def __init__(self):
        """初始化沙盘"""
        self.scenarios = []
        self.assumptions = []
        self.risks = []
        self.strategies = []
    
    def load_data(self, research_data: Dict):
        """
        加载研究数据
        
        Args:
            research_data: 博士研究员搜集的数据
        """
        self.research_data = research_data
        self._extract_assumptions()
    
    def _extract_assumptions(self):
        """从研究数据中提取关键假设"""
        # 自动识别数据中的假设
        self.assumptions = self.research_data.get("assumptions", [
            {"id": "A1", "content": "市场需求持续增长", "confidence": 0.8},
            {"id": "A2", "content": "技术可行性已验证", "confidence": 0.7},
            {"id": "A3", "content": "竞争格局稳定", "confidence": 0.6}
        ])
    
    def run_scenarios(self, strategy: str) -> List[Dict]:
        """
        运行多场景推演
        
        Args:
            strategy: 待推演的策略
            
        Returns:
            场景推演结果列表
        """
        self.scenarios = [
            self._build_scenario(strategy, "optimistic", "乐观场景"),
            self._build_scenario(strategy, "neutral", "中性场景"),
            self._build_scenario(strategy, "pessimistic", "悲观场景")
        ]
        
        return self.scenarios
    
    def _build_scenario(self, strategy: str, scenario_type: str, name: str) -> Dict:
        """构建单个场景"""
        # 场景参数
        params = {
            "optimistic": {"market_growth": 1.5, "competition": 0.8, "risk_factor": 0.3},
            "neutral": {"market_growth": 1.0, "competition": 1.0, "risk_factor": 0.5},
            "pessimistic": {"market_growth": 0.6, "competition": 1.3, "risk_factor": 0.8}
        }
        
        param = params[scenario_type]
        
        # 计算成功概率
        success_prob = self._calculate_success_probability(strategy, param)
        
        # 生成关键事件
        key_events = self._generate_key_events(scenario_type)
        
        return {
            "type": scenario_type,
            "name": name,
            "strategy": strategy,
            "success_probability": success_prob,
            "expected_outcome": self._calculate_outcome(strategy, param),
            "key_events": key_events,
            "risks": self._identify_risks(scenario_type),
            "mitigation": self._suggest_mitigation(scenario_type)
        }
    
    def _calculate_success_probability(self, strategy: str, param: Dict) -> float:
        """计算策略成功概率"""
        # 基础概率
        base_prob = 0.5
        
        # 根据假设置信度调整
        assumption_factor = sum(a["confidence"] for a in self.assumptions) / len(self.assumptions)
        
        # 根据场景参数调整
        market_factor = param["market_growth"]
        risk_factor = 1 - param["risk_factor"]
        
        # 综合计算
        probability = base_prob * assumption_factor * market_factor * risk_factor
        
        return min(0.95, max(0.05, probability))  # 限制在 5%-95%
    
    def _calculate_outcome(self, strategy: str, param: Dict) -> Dict:
        """计算预期结果"""
        # 简化计算（实际应基于具体业务模型）
        base_roi = 0.2
        roi = base_roi * param["market_growth"] * (2 - param["risk_factor"])
        
        return {
            "roi": f"{roi*100:.1f}%",
            "timeline": f"{int(12/param['market_growth'])} 个月",
            "market_share": f"{5*param['market_growth']:.1f}%"
        }
    
    def _generate_key_events(self, scenario_type: str) -> List[Dict]:
        """生成关键事件"""
        events = {
            "optimistic": [
                {"time": "M1", "event": "产品上线，用户增长超预期", "impact": "+30%"},
                {"time": "M3", "event": "获得首轮媒体报道", "impact": "+20%"},
                {"time": "M6", "event": "用户突破 10 万", "impact": "+50%"}
            ],
            "neutral": [
                {"time": "M1", "event": "产品上线，平稳增长", "impact": "+10%"},
                {"time": "M3", "event": "首批用户反馈良好", "impact": "+15%"},
                {"time": "M6", "event": "用户突破 5 万", "impact": "+25%"}
            ],
            "pessimistic": [
                {"time": "M1", "event": "产品上线，增长缓慢", "impact": "+5%"},
                {"time": "M3", "event": "竞品推出类似功能", "impact": "-20%"},
                {"time": "M6", "event": "用户增长停滞", "impact": "-10%"}
            ]
        }
        
        return events.get(scenario_type, [])
    
    def _identify_risks(self, scenario_type: str) -> List[Dict]:
        """识别风险"""
        risks = {
            "optimistic": [
                {"risk": "增长过快导致技术债务", "probability": "中", "impact": "中"}
            ],
            "neutral": [
                {"risk": "市场竞争加剧", "probability": "高", "impact": "中"},
                {"risk": "用户需求变化", "probability": "中", "impact": "高"}
            ],
            "pessimistic": [
                {"risk": "资金链断裂", "probability": "高", "impact": "高"},
                {"risk": "核心团队成员流失", "probability": "中", "impact": "高"},
                {"risk": "政策监管变化", "probability": "低", "impact": "极高"}
            ]
        }
        
        return risks.get(scenario_type, [])
    
    def _suggest_mitigation(self, scenario_type: str) -> List[Dict]:
        """建议风险缓解措施"""
        mitigations = {
            "optimistic": [
                "提前规划技术架构扩展性",
                "建立快速招聘渠道"
            ],
            "neutral": [
                "持续监控竞品动态",
                "建立用户反馈闭环",
                "保持现金流健康"
            ],
            "pessimistic": [
                "准备应急资金（6 个月运营）",
                "核心员工股权激励",
                "多元化收入来源",
                "准备 Pivot 方案"
            ]
        }
        
        return mitigations.get(scenario_type, [])
    
    def counterfactual_reasoning(self, assumption: str) -> Dict:
        """
        反事实推理
        
        Args:
            assumption: 要推翻的假设
            
        Returns:
            推理结果
        """
        # 如果某个假设不成立，会发生什么
        reasoning = {
            "assumption": assumption,
            "if_false": f"如果'{assumption}'不成立",
            "consequences": [
                "原有策略失效",
                "需要重新评估市场定位",
                "可能需要 Pivot"
            ],
            "backup_plan": "启动备用方案 B",
            "early_warning_signals": [
                "关键指标连续 3 周下降",
                "用户流失率超过 20%",
                "竞品推出颠覆性功能"
            ]
        }
        
        return reasoning
    
    def generate_decision_package(self, strategy: str) -> Dict:
        """
        生成决策包
        
        Args:
            strategy: 策略名称
            
        Returns:
            完整决策包
        """
        # 运行所有场景
        scenarios = self.run_scenarios(strategy)
        
        # 计算综合评分
        avg_success_prob = sum(s["success_probability"] for s in scenarios) / 3
        
        # 生成决策建议
        if avg_success_prob > 0.7:
            recommendation = "强烈推荐"
            confidence = "高"
        elif avg_success_prob > 0.5:
            recommendation = "推荐，但需注意风险"
            confidence = "中"
        elif avg_success_prob > 0.3:
            recommendation = "谨慎考虑"
            confidence = "中低"
        else:
            recommendation = "不推荐，建议重新设计策略"
            confidence = "低"
        
        # 反事实推理
        key_assumption = self.assumptions[0]["content"] if self.assumptions else "市场需求存在"
        counterfactual = self.counterfactual_reasoning(key_assumption)
        
        decision_package = {
            "strategy": strategy,
            "timestamp": datetime.now().isoformat(),
            "recommendation": recommendation,
            "confidence_level": confidence,
            "average_success_probability": f"{avg_success_prob*100:.1f}%",
            "scenarios": scenarios,
            "key_assumptions": self.assumptions,
            "counterfactual_analysis": counterfactual,
            "final_advice": self._generate_final_advice(scenarios)
        }
        
        return decision_package
    
    def _generate_final_advice(self, scenarios: List[Dict]) -> str:
        """生成最终建议"""
        optimistic_prob = scenarios[0]["success_probability"]
        pessimistic_prob = scenarios[2]["success_probability"]
        
        if optimistic_prob > 0.7 and pessimistic_prob > 0.3:
            return "建议推进，但需建立风险预警机制和备用方案"
        elif optimistic_prob > 0.5:
            return "可以推进，但建议小步快跑，快速验证关键假设"
        else:
            return "建议暂缓，先验证核心假设或重新设计策略"


# 测试入口
if __name__ == '__main__':
    import sys
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    
    print("=" * 60)
    print("战略推演沙盘测试")
    print("=" * 60)
    
    # 创建沙盘
    sandbox = StrategicSandbox()
    
    # 加载模拟研究数据
    research_data = {
        "assumptions": [
            {"id": "A1", "content": "书签管理市场需求增长", "confidence": 0.8},
            {"id": "A2", "content": "纯前端方案可行", "confidence": 0.9},
            {"id": "A3", "content": "用户愿意付费", "confidence": 0.6}
        ]
    }
    
    sandbox.load_data(research_data)
    
    # 测试场景推演
    print("\n测试 1: 多场景推演")
    print("-" * 60)
    strategy = "推出免费 + 付费增值模式的书签管理工具"
    scenarios = sandbox.run_scenarios(strategy)
    
    for scenario in scenarios:
        print(f"\n{scenario['name']}:")
        print(f"  成功概率：{scenario['success_probability']*100:.1f}%")
        print(f"  预期 ROI: {scenario['expected_outcome']['roi']}")
        print(f"  时间线：{scenario['expected_outcome']['timeline']}")
    
    # 测试反事实推理
    print("\n" + "=" * 60)
    print("测试 2: 反事实推理")
    print("-" * 60)
    counterfactual = sandbox.counterfactual_reasoning("书签管理市场需求增长")
    print(f"假设：{counterfactual['assumption']}")
    print(f"如果不成立：{counterfactual['if_false']}")
    print(f"后果：{counterfactual['consequences']}")
    
    # 测试决策包
    print("\n" + "=" * 60)
    print("测试 3: 生成决策包")
    print("-" * 60)
    decision_package = sandbox.generate_decision_package(strategy)
    
    print(f"策略：{decision_package['strategy']}")
    print(f"建议：{decision_package['recommendation']}")
    print(f"置信度：{decision_package['confidence_level']}")
    print(f"平均成功概率：{decision_package['average_success_probability']}")
    print(f"最终建议：{decision_package['final_advice']}")
    
    print("\n" + "=" * 60)
    print("[OK] 沙盘推演测试完成")
    print("=" * 60)
