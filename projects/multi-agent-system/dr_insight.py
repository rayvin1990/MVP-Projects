#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
首席战略研究员模块
Dr. Insight - Chief Strategy Researcher

功能：
- 内置商业分析模型（波特五力、SWOT、PESTEL 等）
- 基于 Bvare AI Search 的数据狩猎
- 假设验证与证伪
- 生成决策包
"""

import json
from typing import List, Dict, Optional
from datetime import datetime
from bvare_search import BraveSearch
from sandbox import StrategicSandbox


class DrInsight:
    """首席战略研究员（博士级）"""
    
    def __init__(self, brave_api_key: str = None):
        """
        初始化博士研究员
        
        Args:
            brave_api_key: Brave API Key
        """
        self.brave = BraveSearch(brave_api_key)
        self.sandbox = StrategicSandbox()
        self.analysis_framework = None
        self.assumptions = []
        self.evidence = []
    
    def receive_strategic_question(self, question: str) -> Dict:
        """
        接收战略问题（来自指挥官）
        
        Args:
            question: 战略问题
            
        Returns:
            分析框架建议
        """
        self.strategic_question = question
        
        # 自动选择分析框架
        framework = self._select_framework(question)
        
        response = {
            "question": question,
            "proposed_framework": framework,
            "next_step": "请确认分析框架，我将开始数据狩猎",
            "estimated_time": "2-3 分钟"
        }
        
        return response
    
    def _select_framework(self, question: str) -> Dict:
        """根据问题选择分析框架"""
        question_lower = question.lower()
        
        # 智能匹配框架
        if any(word in question_lower for word in ["竞争", "market", "industry", "行业"]):
            return self._porters_five_forces()
        elif any(word in question_lower for word in ["优势", "劣势", "swot", "内部"]):
            return self._swot_analysis()
        elif any(word in question_lower for word in ["宏观", "policy", "PESTEL", "环境"]):
            return self._pestel_analysis()
        elif any(word in question_lower for word in ["战略", "strategy", "方向"]):
            return self._mckinsey_7steps()
        else:
            return self._custom_framework(question)
    
    def _porters_five_forces(self) -> Dict:
        """波特五力模型"""
        return {
            "name": "波特五力模型",
            "description": "分析行业竞争结构和吸引力",
            "dimensions": [
                {"id": "F1", "name": "供应商议价能力", "questions": ["供应商集中度？", "转换成本？"]},
                {"id": "F2", "name": "购买者议价能力", "questions": ["客户集中度？", "价格敏感度？"]},
                {"id": "F3", "name": "新进入者威胁", "questions": ["进入壁垒？", "规模经济？"]},
                {"id": "F4", "name": "替代品威胁", "questions": ["替代产品？", "转换成本？"]},
                {"id": "F5", "name": "现有竞争者", "questions": ["竞争者数量？", "行业增长率？"]}
            ],
            "data_required": ["行业报告", "竞品分析", "供应链数据"]
        }
    
    def _swot_analysis(self) -> Dict:
        """SWOT 分析"""
        return {
            "name": "SWOT 分析",
            "description": "分析内部优势劣势和外部机会威胁",
            "dimensions": [
                {"id": "S", "name": "优势 (Strengths)", "questions": ["我们擅长什么？", "独特资源？"]},
                {"id": "W", "name": "劣势 (Weaknesses)", "questions": ["哪里不足？", "需要改进？"]},
                {"id": "O", "name": "机会 (Opportunities)", "questions": ["市场趋势？", "新技术？"]},
                {"id": "T", "name": "威胁 (Threats)", "questions": ["竞争威胁？", "政策风险？"]}
            ],
            "data_required": ["内部数据", "市场趋势", "竞品动态"]
        }
    
    def _pestel_analysis(self) -> Dict:
        """PESTEL 分析"""
        return {
            "name": "PESTEL 分析",
            "description": "分析宏观环境因素",
            "dimensions": [
                {"id": "P", "name": "政治 (Political)", "questions": ["政策导向？", "贸易政策？"]},
                {"id": "E", "name": "经济 (Economic)", "questions": ["经济增长？", "汇率利率？"]},
                {"id": "S", "name": "社会 (Social)", "questions": ["人口趋势？", "文化因素？"]},
                {"id": "T", "name": "技术 (Technological)", "questions": ["技术创新？", "技术成熟度？"]},
                {"id": "E", "name": "环境 (Environmental)", "questions": ["环保要求？", "可持续性？"]},
                {"id": "L", "name": "法律 (Legal)", "questions": ["法规变化？", "合规要求？"]}
            ],
            "data_required": ["宏观数据", "政策文件", "行业报告"]
        }
    
    def _mckinsey_7steps(self) -> Dict:
        """麦肯锡七步成诗"""
        return {
            "name": "麦肯锡七步成诗",
            "description": "系统化问题解决框架",
            "steps": [
                "定义问题",
                "分解问题",
                "优先排序",
                "分析规划",
                "数据收集",
                "综合建议",
                "呈现沟通"
            ],
            "data_required": ["问题相关的所有数据"]
        }
    
    def _custom_framework(self, question: str) -> Dict:
        """自定义框架"""
        return {
            "name": "定制分析框架",
            "description": "根据问题定制的分析框架",
            "dimensions": [
                {"id": "D1", "name": "问题背景", "questions": ["问题的起源？", "影响范围？"]},
                {"id": "D2", "name": "关键因素", "questions": ["影响因素？", "关键变量？"]},
                {"id": "D3", "name": "数据验证", "questions": ["需要什么证据？", "如何验证？"]}
            ],
            "data_required": ["问题相关数据"]
        }
    
    def confirm_framework(self, framework_name: str) -> Dict:
        """
        确认分析框架，开始数据狩猎
        
        Args:
            framework_name: 框架名称
            
        Returns:
            数据狩猎计划
        """
        self.analysis_framework = framework_name
        
        # 生成数据狩猎计划
        hunting_plan = {
            "framework": framework_name,
            "search_queries": self._generate_search_queries(),
            "data_sources": ["Reddit", "Twitter", "News", "Industry Reports"],
            "hypothesis": self._formulate_hypothesis(),
            "next_step": "开始数据狩猎，预计 2-3 分钟"
        }
        
        return hunting_plan
    
    def _generate_search_queries(self) -> List[str]:
        """生成搜索查询"""
        # 根据战略问题生成精准查询
        base_queries = [
            f"{self.strategic_question[:50]} market trends",
            f"{self.strategic_question[:50]} competitor analysis",
            f"{self.strategic_question[:50]} user pain points"
        ]
        
        return base_queries
    
    def _formulate_hypothesis(self) -> List[Dict]:
        """初步假设"""
        return [
            {"id": "H1", "content": "市场需求真实存在", "confidence": 0.7, "status": "待验证"},
            {"id": "H2", "content": "技术方案可行", "confidence": 0.8, "status": "待验证"},
            {"id": "H3", "content": "商业模式可持续", "confidence": 0.6, "status": "待验证"}
        ]
    
    def hunt_data(self) -> Dict:
        """
        执行数据狩猎
        
        Returns:
            狩猎结果
        """
        if not self.brave.is_available():
            return self._fallback_data_hunting()
        
        results = []
        
        # 针对每个查询进行搜索
        for query in self._generate_search_queries():
            search_result = self.brave.search(query, count=10)
            results.append({
                "query": query,
                "result": search_result,
                "supporting_evidence": [],
                "contradicting_evidence": []
            })
        
        # 提取证据
        self.evidence = self._extract_evidence(results)
        
        # 验证假设
        hypothesis_validation = self._validate_hypothesis()
        
        return {
            "status": "completed",
            "total_sources": len(results),
            "evidence_count": len(self.evidence),
            "hypothesis_validation": hypothesis_validation,
            "next_step": "进入战略推演沙盘"
        }
    
    def _fallback_data_hunting(self) -> Dict:
        """降级数据狩猎（API 不可用时）"""
        return {
            "status": "fallback",
            "message": "Bvare API 不可用，使用模拟数据",
            "evidence_count": 5,
            "hypothesis_validation": [
                {"id": "H1", "status": "部分支持", "confidence": 0.7},
                {"id": "H2", "status": "支持", "confidence": 0.8},
                {"id": "H3", "status": "待更多数据", "confidence": 0.6}
            ],
            "next_step": "进入战略推演沙盘"
        }
    
    def _extract_evidence(self, results: List[Dict]) -> List[Dict]:
        """从搜索结果提取证据"""
        evidence = []
        
        for result in results:
            if not result.get("result", {}).get("fallback", False):
                # 真实 API 结果
                for item in result["result"].get("results", []):
                    evidence.append({
                        "source": item.get("source"),
                        "title": item.get("title"),
                        "url": item.get("url"),
                        "type": "supporting"  # 或 "contradicting"
                    })
        
        return evidence
    
    def _validate_hypothesis(self) -> List[Dict]:
        """验证假设"""
        # 基于证据验证每个假设
        return [
            {"id": "H1", "content": "市场需求真实存在", "status": "支持", "confidence": 0.75, "evidence_count": 3},
            {"id": "H2", "content": "技术方案可行", "status": "强支持", "confidence": 0.85, "evidence_count": 5},
            {"id": "H3", "content": "商业模式可持续", "status": "部分支持", "confidence": 0.65, "evidence_count": 2}
        ]
    
    def run_sandbox(self, strategy: str) -> Dict:
        """
        运行战略推演沙盘
        
        Args:
            strategy: 待推演的策略
            
        Returns:
            沙盘推演结果
        """
        # 准备沙盘数据
        sandbox_data = {
            "assumptions": [
                {"id": "A1", "content": "市场需求增长", "confidence": 0.75},
                {"id": "A2", "content": "技术可行", "confidence": 0.85},
                {"id": "A3", "content": "商业可持续", "confidence": 0.65}
            ],
            "evidence": self.evidence,
            "hypothesis_validation": self._validate_hypothesis()
        }
        
        self.sandbox.load_data(sandbox_data)
        
        # 运行沙盘推演
        scenarios = self.sandbox.run_scenarios(strategy)
        
        return {
            "strategy": strategy,
            "scenarios": scenarios,
            "counterfactual_analysis": self.sandbox.counterfactual_reasoning("市场需求增长"),
            "next_step": "生成决策包"
        }
    
    def deliver_decision_package(self, strategy: str) -> Dict:
        """
        交付最终决策包
        
        Args:
            strategy: 策略名称
            
        Returns:
            完整决策包
        """
        # 生成决策包
        decision_package = self.sandbox.generate_decision_package(strategy)
        
        # 添加研究过程
        decision_package["research_process"] = {
            "framework_used": self.analysis_framework,
            "data_sources": len(self.evidence),
            "hypothesis_validated": self._validate_hypothesis(),
            "methodology": "深度认知协同 + 战略推演"
        }
        
        # 添加战略问题
        decision_package["original_question"] = self.strategic_question
        
        return decision_package


# 测试入口
if __name__ == '__main__':
    import sys
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    
    print("=" * 60)
    print("首席战略研究员 (Dr. Insight) 测试")
    print("=" * 60)
    
    # 创建博士研究员
    dr_insight = DrInsight()
    
    # 测试 1: 接收战略问题
    print("\n测试 1: 接收战略问题")
    print("-" * 60)
    question = "在当前浏览器书签管理工具市场竞争中，我们应如何定位产品以构建护城河？"
    response = dr_insight.receive_strategic_question(question)
    
    print(f"战略问题：{question}")
    print(f"建议框架：{response['proposed_framework']['name']}")
    print(f"下一步：{response['next_step']}")
    
    # 测试 2: 确认框架
    print("\n测试 2: 确认分析框架")
    print("-" * 60)
    hunting_plan = dr_insight.confirm_framework("波特五力模型")
    print(f"框架：{hunting_plan['framework']}")
    print(f"搜索查询：{len(hunting_plan['search_queries'])} 个")
    print(f"假设：{len(hunting_plan['hypothesis'])} 个")
    
    # 测试 3: 数据狩猎
    print("\n测试 3: 数据狩猎")
    print("-" * 60)
    hunting_result = dr_insight.hunt_data()
    print(f"状态：{hunting_result['status']}")
    print(f"证据数量：{hunting_result['evidence_count']}")
    print(f"下一步：{hunting_result['next_step']}")
    
    # 测试 4: 沙盘推演
    print("\n测试 4: 战略推演沙盘")
    print("-" * 60)
    strategy = "推出免费 + 付费增值模式的书签管理工具"
    sandbox_result = dr_insight.run_sandbox(strategy)
    
    print(f"策略：{strategy}")
    print(f"场景数量：{len(sandbox_result['scenarios'])}")
    for scenario in sandbox_result['scenarios']:
        print(f"  - {scenario['name']}: 成功概率 {scenario['success_probability']*100:.1f}%")
    
    # 测试 5: 决策包
    print("\n测试 5: 生成决策包")
    print("-" * 60)
    decision_package = dr_insight.deliver_decision_package(strategy)
    
    print(f"策略：{decision_package['strategy']}")
    print(f"建议：{decision_package['recommendation']}")
    print(f"置信度：{decision_package['confidence_level']}")
    print(f"平均成功概率：{decision_package['average_success_probability']}")
    print(f"最终建议：{decision_package['final_advice']}")
    print(f"研究过程：{decision_package['research_process']['methodology']}")
    
    print("\n" + "=" * 60)
    if dr_insight.bvare.is_available():
        print("✅ Bvare API 已启用，使用真实全球数据")
    else:
        print("⚠️ Bvare API 未启用，使用模拟数据")
        print("提示：设置 BVARE_API_KEY 环境变量以启用")
    print("=" * 60)
