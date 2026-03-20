#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
心跳与健康自检模块
Heartbeat & Health Check Module

功能：
1. 基础心跳信号 (Pulse)
2. 逻辑死锁检测 (Logic Deadlock Detection)
3. 情绪与状态自检 (Mood & Status Self-Check)
4. 资源消耗预警 (Resource Monitor)
"""

import json
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from collections import Counter


class HeartbeatMonitor:
    """心跳监控器"""
    
    def __init__(self, config: dict = None):
        """初始化心跳监控"""
        self.config = config or {}
        self.enabled = self.config.get('enabled', True)
        
        # 基础心跳配置
        pulse_config = self.config.get('pulse', {})
        self.pulse_frequency = pulse_config.get('frequency_interactions', 5)
        self.pulse_timeout = pulse_config.get('timeout_seconds', 10)
        
        # 死锁检测配置
        deadlock_config = self.config.get('deadlock_detection', {})
        self.max_duplicate_responses = deadlock_config.get('max_duplicate_responses', 3)
        self.max_same_assignment = deadlock_config.get('max_same_assignment', 3)
        self.max_reasoning_tokens = deadlock_config.get('max_reasoning_tokens', 500)
        
        # 自检配置
        self_check_config = self.config.get('self_check', {})
        self.self_check_interval = self_check_config.get('interval_interactions', 5)
        
        # 资源监控配置
        resource_config = self.config.get('resource_monitor', {})
        self.token_limit_warning = resource_config.get('token_limit_warning_percent', 80)
        self.tool_call_limit = resource_config.get('tool_call_frequency_limit', 5)
        self.tool_call_window = resource_config.get('tool_call_window_seconds', 60)
        
        # 状态追踪
        self.interaction_count = 0
        self.last_pulse_time = datetime.now()
        self.recent_actions = []  # 最近行动记录
        self.reasoning_token_count = 0
        self.confidence_level = 100  # 自信度 0-100
        self.token_usage = 0
        self.tool_call_history = []  # 工具调用历史
        self.assignment_history = []  # 任务分配历史
        
        # 日志
        self.heartbeat_log = []
    
    def pulse(self) -> dict:
        """
        基础心跳信号
        
        Returns:
            心跳状态字典
        """
        now = datetime.now()
        time_since_last_pulse = (now - self.last_pulse_time).total_seconds()
        
        status = {
            "alive": True,
            "timestamp": now.isoformat(),
            "time_since_last_pulse": time_since_last_pulse,
            "interaction_count": self.interaction_count,
            "status_code": "OK"
        }
        
        # 检查是否超时
        if time_since_last_pulse > self.pulse_timeout:
            status["status_code"] = "TIMEOUT"
            status["warning"] = f"超过 {self.pulse_timeout} 秒无响应"
        
        self.last_pulse_time = now
        self._log(f"💓 心跳：{status['status_code']}")
        
        return status
    
    def record_action(self, action: dict):
        """
        记录行动（用于死锁检测）
        
        Args:
            action: 行动记录，包含 type, content, timestamp 等
        """
        self.recent_actions.append({
            "type": action.get("type"),
            "content": action.get("content", "")[:100],  # 只记录前 100 字
            "timestamp": datetime.now().isoformat()
        })
        
        # 只保留最近 10 条记录
        if len(self.recent_actions) > 10:
            self.recent_actions = self.recent_actions[-10:]
        
        self.interaction_count += 1
    
    def check_deadlock(self) -> dict:
        """
        逻辑死锁检测
        
        Returns:
            检测结果字典
        """
        result = {
            "deadlock_detected": False,
            "type": None,
            "description": None,
            "suggested_action": None
        }
        
        if len(self.recent_actions) < 3:
            return result
        
        # 1. 检测重复回复
        recent_contents = [a["content"] for a in self.recent_actions[-self.max_duplicate_responses:]]
        if len(set(recent_contents)) == 1:  # 所有内容都一样
            result["deadlock_detected"] = True
            result["type"] = "DUPLICATE_RESPONSE"
            result["description"] = f"连续 {self.max_duplicate_responses} 次生成相同内容"
            result["suggested_action"] = "强制中断，重新规划路线"
            self._log(f"⚠️ 死锁检测：{result['description']}")
            return result
        
        # 2. 检测重复任务分配
        recent_assignments = [
            a for a in self.recent_actions[-self.max_same_assignment:]
            if a.get("type") == "task_assignment"
        ]
        if len(recent_assignments) >= self.max_same_assignment:
            # 检查是否指派给同一个 Agent 做同一件事
            agent_task_pairs = [
                (a.get("to_agent"), a.get("task_type"))
                for a in recent_assignments
            ]
            if len(set(agent_task_pairs)) == 1:
                result["deadlock_detected"] = True
                result["type"] = "REPEATED_ASSIGNMENT"
                result["description"] = f"连续 {self.max_same_assignment} 次指派同一 Agent 做同一任务"
                result["suggested_action"] = "更换 Agent 或重新拆解任务"
                self._log(f"⚠️ 死锁检测：{result['description']}")
                return result
        
        # 3. 检测思考过长
        if self.reasoning_token_count > self.max_reasoning_tokens:
            result["deadlock_detected"] = True
            result["type"] = "OVER_THINKING"
            result["description"] = f"思考过程超过 {self.max_reasoning_tokens} 字仍未下达指令"
            result["suggested_action"] = "立即停止思考，总结卡点并行动"
            self._log(f"⚠️ 死锁检测：{result['description']}")
            return result
        
        return result
    
    def self_check(self) -> dict:
        """
        情绪与状态自检
        
        Returns:
            自检结果字典
        """
        now = datetime.now()
        
        result = {
            "timestamp": now.isoformat(),
            "confidence_level": self.confidence_level,
            "status": "NORMAL",
            "issues": [],
            "suggestions": []
        }
        
        # 检查自信度
        if self.confidence_level < 50:
            result["status"] = "LOW_CONFIDENCE"
            result["issues"].append(f"自信度过低：{self.confidence_level}%")
            result["suggestions"].append("重新评估当前策略，考虑寻求用户帮助")
        
        # 检查交互频率
        time_since_start = (now - self.last_pulse_time).total_seconds()
        if time_since_start > 0:
            interactions_per_minute = self.interaction_count / (time_since_start / 60)
            if interactions_per_minute > 20:  # 每分钟超过 20 次交互
                result["status"] = "HIGH_FREQUENCY"
                result["issues"].append(f"交互频率过高：{interactions_per_minute:.1f} 次/分钟")
                result["suggestions"].append("放慢节奏，避免盲目尝试")
        
        self._log(f"🔍 自检完成：{result['status']} (自信度：{self.confidence_level}%)")
        
        return result
    
    def record_tool_call(self, tool_name: str):
        """
        记录工具调用
        
        Args:
            tool_name: 工具名称
        """
        now = datetime.now()
        self.tool_call_history.append({
            "tool": tool_name,
            "timestamp": now.isoformat()
        })
        
        # 只保留最近 1 分钟的记录
        cutoff = now - timedelta(seconds=self.tool_call_window)
        self.tool_call_history = [
            t for t in self.tool_call_history
            if datetime.fromisoformat(t["timestamp"]) > cutoff
        ]
    
    def check_tool_usage(self) -> dict:
        """
        检查工具使用频率
        
        Returns:
            检查结果字典
        """
        result = {
            "warning": False,
            "tool": None,
            "count": 0,
            "suggestion": None
        }
        
        # 统计最近 1 分钟内各工具调用次数
        tool_counts = Counter([t["tool"] for t in self.tool_call_history])
        
        for tool, count in tool_counts.items():
            if count > self.tool_call_limit:
                result["warning"] = True
                result["tool"] = tool
                result["count"] = count
                result["suggestion"] = f"{tool} 调用过于频繁（{count} 次/分钟），请反思是否关键词或策略有问题"
                self._log(f"⚠️ 工具预警：{result['suggestion']}")
                return result
        
        return result
    
    def update_token_usage(self, tokens: int):
        """
        更新 Token 使用量
        
        Args:
            tokens: Token 数量
        """
        self.token_usage = tokens
    
    def check_token_limit(self, max_tokens: int) -> dict:
        """
        检查 Token 使用是否接近限制
        
        Args:
            max_tokens: 最大 Token 限制
            
        Returns:
            检查结果字典
        """
        usage_percent = (self.token_usage / max_tokens) * 100
        
        result = {
            "warning": False,
            "usage_percent": usage_percent,
            "suggestion": None
        }
        
        if usage_percent > self.token_limit_warning:
            result["warning"] = True
            result["suggestion"] = f"Token 使用已达 {usage_percent:.1f}%，建议触发记忆压缩机制"
            self._log(f"⚠️ Token 预警：{result['suggestion']}")
        
        return result
    
    def adjust_confidence(self, delta: int):
        """
        调整自信度
        
        Args:
            delta: 变化值（正数增加，负数减少）
        """
        self.confidence_level = max(0, min(100, self.confidence_level + delta))
        self._log(f"自信度调整：{self.confidence_level}% ({'+' if delta > 0 else ''}{delta})")
    
    def reset_reasoning_tokens(self):
        """重置思考 Token 计数"""
        self.reasoning_token_count = 0
    
    def add_reasoning_tokens(self, count: int):
        """
        增加思考 Token 计数
        
        Args:
            count: Token 数量
        """
        self.reasoning_token_count += count
    
    def _log(self, message: str):
        """记录日志"""
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        log_entry = f"[{timestamp}] {message}"
        self.heartbeat_log.append(log_entry)
        
        # 只保留最近 100 条日志
        if len(self.heartbeat_log) > 100:
            self.heartbeat_log = self.heartbeat_log[-100:]
    
    def get_status_report(self) -> dict:
        """
        获取完整状态报告
        
        Returns:
            状态报告字典
        """
        return {
            "heartbeat": self.pulse(),
            "deadlock_check": self.check_deadlock(),
            "self_check": self.self_check(),
            "tool_usage": self.check_tool_usage(),
            "confidence_level": self.confidence_level,
            "interaction_count": self.interaction_count,
            "token_usage": self.token_usage,
            "recent_actions_count": len(self.recent_actions)
        }


# 测试入口
if __name__ == '__main__':
    import sys
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    
    print("=" * 60)
    print("心跳与健康自检模块测试")
    print("=" * 60)
    
    # 创建监控器
    config = {
        "enabled": True,
        "pulse": {"frequency_interactions": 5, "timeout_seconds": 10},
        "deadlock_detection": {"max_duplicate_responses": 3, "max_same_assignment": 3},
        "self_check": {"interval_interactions": 5},
        "resource_monitor": {"tool_call_frequency_limit": 5}
    }
    
    monitor = HeartbeatMonitor(config)
    
    # 测试心跳
    print("\n测试 1: 基础心跳")
    pulse = monitor.pulse()
    print(f"状态：{pulse['status_code']}")
    print(f"交互次数：{pulse['interaction_count']}")
    
    # 测试行动记录
    print("\n测试 2: 记录行动")
    for i in range(5):
        monitor.record_action({
            "type": "task_assignment",
            "content": f"任务 {i}",
            "to_agent": "engineer",
            "task_type": "coding"
        })
    
    # 测试死锁检测
    print("\n测试 3: 死锁检测")
    deadlock = monitor.check_deadlock()
    if deadlock["deadlock_detected"]:
        print(f"⚠️ 检测到死锁：{deadlock['type']}")
        print(f"建议：{deadlock['suggested_action']}")
    else:
        print("✅ 无死锁")
    
    # 测试自检
    print("\n测试 4: 状态自检")
    self_check = monitor.self_check()
    print(f"状态：{self_check['status']}")
    print(f"自信度：{self_check['confidence_level']}%")
    
    # 测试工具调用
    print("\n测试 5: 工具调用频率")
    for i in range(7):
        monitor.record_tool_call("web_search")
    
    tool_warning = monitor.check_tool_usage()
    if tool_warning["warning"]:
        print(f"⚠️ 工具预警：{tool_warning['suggestion']}")
    else:
        print("✅ 工具使用正常")
    
    # 测试自信度调整
    print("\n测试 6: 自信度调整")
    print(f"当前自信度：{monitor.confidence_level}%")
    monitor.adjust_confidence(-20)
    print(f"失败后自信度：{monitor.confidence_level}%")
    monitor.adjust_confidence(10)
    print(f"成功后自信度：{monitor.confidence_level}%")
    
    # 完整状态报告
    print("\n测试 7: 完整状态报告")
    report = monitor.get_status_report()
    print(f"心跳：{report['heartbeat']['status_code']}")
    print(f"死锁：{'检测到' if report['deadlock_check']['deadlock_detected'] else '无'}")
    print(f"自检：{report['self_check']['status']}")
    print(f"自信度：{report['confidence_level']}%")
    
    print("\n" + "=" * 60)
    print("[OK] 心跳模块测试完成")
    print("=" * 60)
