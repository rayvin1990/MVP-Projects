#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
DeepInsight Core - 深度认知协同系统
统一入口模块

整合：
- Commander-X (指挥官)
- Dr. Insight (首席战略研究员)
- Strategic Sandbox (战略推演沙盘)
- Bvare AI Search (全球数据搜索)
- Heartbeat Monitor (心跳监控)
"""

import json
import os
from datetime import datetime
from typing import List, Dict, Optional

# 导入各模块
from dr_insight import DrInsight
from sandbox import StrategicSandbox
from bvare_search import BvareSearch
from heartbeat import HeartbeatMonitor


class DeepInsightCore:
    """
    DeepInsight Core - 深度认知协同系统
    
    核心流程：
    1. 接收战略问题
    2. 选择分析框架
    3. 数据狩猎
    4. 沙盘推演
    5. 交付决策包
    """
    
    def __init__(self, config_path: str = None):
        """
        初始化 DeepInsight Core
        
        Args:
            config_path: 配置文件路径
        """
        self.config = self._load_config(config_path)
        self.start_time = datetime.now()
        
        # 初始化各模块
        bvare_api_key = os.getenv('BVARE_API_KEY')
        self.dr_insight = DrInsight(bvare_api_key)
        self.sandbox = StrategicSandbox()
        self.bvare = BvareSearch(bvare_api_key, use_domestic_only=False)
        self.heartbeat = HeartbeatMonitor(self.config.get('heartbeat', {}))
        
        # 系统状态
        self.current_question = None
        self.decision_packages = []
        self.session_log = []
        
        # 初始化心跳
        self._system_init()
    
    def _load_config(self, config_path: str = None) -> dict:
        """加载配置文件"""
        if config_path is None:
            config_path = os.path.join(os.path.dirname(__file__), 'config_v3.json')
        
        if os.path.exists(config_path):
            with open(config_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {}
    
    def _system_init(self):
        """系统初始化"""
        self._log("🚀 DeepInsight Core 系统启动")
        self._log(f"📅 时间：{self.start_time.strftime('%Y-%m-%d %H:%M:%S')}")
        self._log(f"🔑 Bvare API: {'✅ 已配置' if self.bvare.is_available() else '⚠️ 未配置'}")
        self._log(f"💓 心跳监控：已启用")
        
        # 心跳检查
        pulse = self.heartbeat.pulse()
        self._log(f"💓 初始心跳：{pulse['status_code']}")
    
    def _log(self, message: str):
        """记录日志"""
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        log_entry = f"[{timestamp}] {message}"
        self.session_log.append(log_entry)
        print(log_entry)
    
    def ask(self, strategic_question: str) -> Dict:
        """
        提出战略问题（主入口）
        
        Args:
            strategic_question: 战略问题
            
        Returns:
            决策包
        """
        self._log("\n" + "="*60)
        self._log(f"🎯 接收战略问题：{strategic_question}")
        self._log("="*60)
        
        self.current_question = strategic_question
        self.heartbeat.record_action({
            "type": "strategic_question",
            "content": strategic_question
        })
        
        # 步骤 1: 接收问题并建议框架
        self._log("\n📋 步骤 1: 构建分析框架")
        framework_response = self.dr_insight.receive_strategic_question(strategic_question)
        self._log(f"建议框架：{framework_response['proposed_framework']['name']}")
        
        # 步骤 2: 确认框架
        self._log("\n📋 步骤 2: 确认分析框架")
        framework_name = framework_response['proposed_framework']['name']
        hunting_plan = self.dr_insight.confirm_framework(framework_name)
        self._log(f"搜索查询：{len(hunting_plan['search_queries'])} 个")
        self._log(f"初步假设：{len(hunting_plan['hypothesis'])} 个")
        
        # 心跳检查
        self.heartbeat.pulse()
        
        # 步骤 3: 数据狩猎
        self._log("\n📋 步骤 3: 数据狩猎")
        if self.bvare.is_available():
            self._log("✅ 使用 Bvare AI Search 搜索全球数据")
        else:
            self._log("⚠️ Bvare API 未配置，使用降级数据源")
        
        hunting_result = self.dr_insight.hunt_data()
        self._log(f"狩猎状态：{hunting_result['status']}")
        self._log(f"证据数量：{hunting_result.get('evidence_count', 0)}")
        
        # 心跳检查
        self.heartbeat.pulse()
        deadlock_check = self.heartbeat.check_deadlock()
        if deadlock_check['deadlock_detected']:
            self._log(f"⚠️ 检测到死锁：{deadlock_check['type']}")
            self._log(f"建议：{deadlock_check['suggested_action']}")
        
        # 步骤 4: 沙盘推演
        self._log("\n📋 步骤 4: 战略推演沙盘")
        
        # 从战略问题提取策略
        strategy = self._extract_strategy(strategic_question)
        sandbox_result = self.dr_insight.run_sandbox(strategy)
        
        self._log(f"推演策略：{strategy}")
        self._log(f"场景数量：{len(sandbox_result['scenarios'])}")
        
        for scenario in sandbox_result['scenarios']:
            self._log(f"  - {scenario['name']}: 成功概率 {scenario['success_probability']*100:.1f}%")
        
        # 心跳检查
        self.heartbeat.pulse()
        self_check = self.heartbeat.self_check()
        self._log(f"\n💭 系统自检：{self_check['status']} (自信度：{self_check['confidence_level']}%)")
        
        # 步骤 5: 生成决策包
        self._log("\n📋 步骤 5: 生成决策包")
        decision_package = self.dr_insight.deliver_decision_package(strategy)
        
        self._log(f"\n{'='*60}")
        self._log(f"📦 决策包")
        self._log(f"{'='*60}")
        self._log(f"策略：{decision_package['strategy']}")
        self._log(f"建议：{decision_package['recommendation']}")
        self._log(f"置信度：{decision_package['confidence_level']}")
        self._log(f"平均成功概率：{decision_package['average_success_probability']}")
        self._log(f"最终建议：{decision_package['final_advice']}")
        
        # 保存决策包
        self.decision_packages.append(decision_package)
        
        # 最终心跳
        self.heartbeat.pulse()
        self._log(f"\n{'='*60}")
        self._log(f"✅ 深度推理循环完成")
        self._log(f"{'='*60}")
        
        return decision_package
    
    def _extract_strategy(self, question: str) -> str:
        """从战略问题中提取策略"""
        # 简化实现，实际应使用 NLP 提取
        if "书签" in question or "bookmark" in question.lower():
            return "推出免费 + 付费增值模式的书签管理工具"
        elif "AI" in question:
            return "进入 AI 工具市场"
        else:
            return "基于问题定制的战略方案"
    
    def get_system_status(self) -> Dict:
        """获取系统状态"""
        return {
            "uptime": str(datetime.now() - self.start_time),
            "questions_asked": len(self.decision_packages),
            "bvare_available": self.bvare.is_available(),
            "heartbeat_status": self.heartbeat.pulse(),
            "recent_logs": self.session_log[-5:]
        }
    
    def print_session_summary(self):
        """打印会话总结"""
        self._log("\n" + "="*60)
        self._log("📊 会话总结")
        self._log("="*60)
        self._log(f"运行时长：{datetime.now() - self.start_time}")
        self._log(f"处理问题：{len(self.decision_packages)} 个")
        self._log(f"系统状态：正常")
        
        if self.decision_packages:
            self._log(f"\n决策包列表:")
            for i, pkg in enumerate(self.decision_packages, 1):
                self._log(f"  {i}. {pkg['strategy']}: {pkg['recommendation']}")


# 快速测试函数
def quick_test():
    """快速测试系统"""
    print("="*60)
    print("DeepInsight Core - 快速测试")
    print("="*60)
    
    # 创建系统实例
    core = DeepInsightCore()
    
    # 测试战略问题
    question = "在当前浏览器书签管理工具市场竞争中，我们应如何定位产品以构建护城河？"
    decision_package = core.ask(question)
    
    # 打印总结
    core.print_session_summary()
    
    return decision_package


# 主入口
if __name__ == '__main__':
    import sys
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    
    # 运行快速测试
    result = quick_test()
    
    print("\n" + "="*60)
    print("✅ DeepInsight Core 测试完成")
    print("="*60)
