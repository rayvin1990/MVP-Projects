#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
多 Agent 协作系统 - 主协调器
Multi-Agent System - Main Coordinator
"""

import json
import os
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Optional, Any

from task_queue import TaskQueue, TaskStatus, TaskPriority


class AgentCoordinator:
    """Agent 协调器"""
    
    def __init__(self, config_path: str = None):
        """初始化协调器"""
        self.config = self._load_config(config_path)
        self.workspace = Path(self.config.get('system', {}).get('workspace', '.'))
        self.task_queue = TaskQueue(config_path)
        
        # 加载 Agent 信息
        self.agents = {a['id']: a for a in self.config.get('agents', [])}
    
    def _load_config(self, config_path: str = None) -> dict:
        """加载配置文件"""
        if config_path is None:
            config_path = Path(__file__).parent / 'config.json'
        
        if os.path.exists(config_path):
            with open(config_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {}
    
    def receive_task(self, title: str, description: str, 
                     priority: str = "p2", due_hours: int = 24) -> str:
        """
        接收新任务（从用户）
        
        Args:
            title: 任务标题
            description: 任务描述
            priority: 优先级
            due_hours: 完成时限
            
        Returns:
            任务 ID
        """
        print(f"📥 接收新任务：{title}")
        
        # 分析任务，确定需要的技能
        required_skills = self._analyze_task(description)
        
        # 选择最合适的 Agent
        best_agent = self.task_queue.get_best_agent(required_skills)
        
        if not best_agent:
            print("⚠️ 没有可用的 Agent，任务将进入等待队列")
        
        # 创建任务
        task_id = self.task_queue.create_task(
            title=title,
            description=description,
            assigned_to=best_agent,
            priority=priority,
            due_hours=due_hours
        )
        
        print(f"✅ 任务已创建：{task_id}")
        if best_agent:
            print(f"   分配给：{best_agent}")
        print(f"   优先级：{priority}")
        print(f"   截止：{due_hours}小时内")
        
        return task_id
    
    def _analyze_task(self, description: str) -> List[str]:
        """
        分析任务，确定需要的技能
        
        Args:
            description: 任务描述
            
        Returns:
            技能列表
        """
        skills = []
        desc_lower = description.lower()
        
        # 关键词匹配
        if any(kw in desc_lower for kw in ['代码', '开发', '实现', 'python', 'javascript']):
            skills.append('python')
            skills.append('development')
        
        if any(kw in desc_lower for kw in ['测试', 'test', 'bug', '验证']):
            skills.append('testing')
        
        if any(kw in desc_lower for kw in ['文档', 'doc', 'write', '报告']):
            skills.append('writing')
            skills.append('documentation')
        
        if any(kw in desc_lower for kw in ['设计', '架构', 'system', 'architecture']):
            skills.append('architecture')
        
        return skills if skills else ['general']
    
    def decompose_task(self, task_id: str, subtasks: List[Dict]) -> List[str]:
        """
        将任务分解为子任务
        
        Args:
            task_id: 主任务 ID
            subtasks: 子任务列表，每项包含 {title, description, assigned_to, priority}
            
        Returns:
            子任务 ID 列表
        """
        data = self.task_queue._load_data()
        main_task = data["tasks"].get(task_id)
        
        if not main_task:
            print(f"❌ 任务不存在：{task_id}")
            return []
        
        print(f"🔪 分解任务：{main_task['title']}")
        
        subtask_ids = []
        for i, subtask in enumerate(subtasks):
            sub_id = self.task_queue.create_task(
                title=subtask.get('title', f"子任务 {i+1}"),
                description=subtask.get('description', ''),
                assigned_to=subtask.get('assigned_to'),
                priority=subtask.get('priority', main_task['priority']),
                due_hours=subtask.get('due_hours', 24),
                dependencies=[task_id]  # 依赖主任务
            )
            subtask_ids.append(sub_id)
            print(f"   创建子任务：{sub_id} - {subtask.get('title')}")
        
        return subtask_ids
    
    def assign_task(self, task_id: str, agent_id: str) -> bool:
        """分配任务给 Agent"""
        if agent_id not in self.agents:
            print(f"❌ Agent 不存在：{agent_id}")
            return False
        
        success = self.task_queue.start_task(task_id, agent_id)
        
        if success:
            agent = self.agents[agent_id]
            print(f"📤 任务已分配：{task_id} → {agent['name']}")
        
        return success
    
    def get_progress(self, task_id: str = None) -> Dict:
        """获取任务进度"""
        if task_id:
            data = self.task_queue._load_data()
            task = data["tasks"].get(task_id)
            if task:
                return {
                    "id": task["id"],
                    "title": task["title"],
                    "status": task["status"],
                    "progress": task["progress"],
                    "assigned_to": task.get("assigned_to"),
                    "due_at": task.get("due_at")
                }
            return None
        else:
            # 返回所有任务概览
            return {
                "queue_status": self.task_queue.get_queue_status(),
                "stats": self.task_queue.get_stats(),
                "in_progress": self.task_queue.get_in_progress_tasks()
            }
    
    def complete_task(self, task_id: str, result: Dict = None) -> bool:
        """完成任务"""
        success = self.task_queue.complete_task(task_id, result)
        
        if success:
            data = self.task_queue._load_data()
            task = data["tasks"][task_id]
            print(f"✅ 任务已完成：{task['title']}")
        
        return success
    
    def get_daily_report(self) -> str:
        """生成日报"""
        data = self.task_queue._load_data()
        
        report = []
        report.append("# Agent 团队日报")
        report.append(f"日期：{datetime.now().strftime('%Y-%m-%d')}")
        report.append("")
        
        # 今日完成
        completed = []
        for task_id in data["queue"]["completed"]:
            task = data["tasks"].get(task_id)
            if task and task.get("completed_at"):
                completed_date = task["completed_at"][:10]
                if completed_date == datetime.now().strftime('%Y-%m-%d'):
                    completed.append(task)
        
        report.append("## 今日完成")
        if completed:
            for task in completed:
                agent_name = self.agents.get(task.get("assigned_to"), {}).get("name", "未知")
                report.append(f"- {agent_name}: {task['title']} (100%)")
        else:
            report.append("(暂无)")
        
        report.append("")
        
        # 进行中
        in_progress = self.task_queue.get_in_progress_tasks()
        report.append("## 进行中")
        if in_progress:
            for task in in_progress:
                agent_name = self.agents.get(task.get("assigned_to"), {}).get("name", "未知")
                report.append(f"- {agent_name}: {task['title']} ({task['progress']}%)")
        else:
            report.append("(暂无)")
        
        report.append("")
        
        # 统计
        stats = self.task_queue.get_stats()
        queue = self.task_queue.get_queue_status()
        
        report.append("## 统计")
        report.append(f"- 总任务数：{stats['total']}")
        report.append(f"- 已完成：{stats['completed']}")
        report.append(f"- 失败：{stats['failed']}")
        report.append(f"- 待处理：{queue['pending']}")
        report.append(f"- 进行中：{queue['in_progress']}")
        
        return "\n".join(report)
    
    def get_team_status(self) -> str:
        """获取团队状态"""
        lines = []
        lines.append("🏢 Agent 团队状态")
        lines.append("=" * 50)
        
        for agent_id, agent in self.agents.items():
            load = self.task_queue.get_agent_load(agent_id)
            capacity = agent.get('capacity', 5)
            status = agent.get('status', 'unknown')
            
            status_icon = {"available": "🟢", "busy": "🟡", "offline": "🔴"}.get(status, "⚪")
            
            lines.append(f"\n{status_icon} {agent['name']} ({agent['role']})")
            lines.append(f"   负载：{load}/{capacity}")
            lines.append(f"   技能：{', '.join(agent.get('skills', []))}")
            
            # 当前任务
            in_progress = self.task_queue.get_in_progress_tasks()
            current_tasks = [t for t in in_progress if t.get("assigned_to") == agent_id]
            if current_tasks:
                lines.append("   当前任务:")
                for task in current_tasks:
                    lines.append(f"     - {task['title']} ({task['progress']}%)")
        
        lines.append("\n" + "=" * 50)
        queue_status = self.task_queue.get_queue_status()
        lines.append(f"队列：待处理 {queue_status['pending']} | 进行中 {queue_status['in_progress']} | 已完成 {queue_status['completed']}")
        
        return "\n".join(lines)


# 测试入口
if __name__ == '__main__':
    import sys
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    
    print("[Multi-Agent System] Coordinator Test")
    print("=" * 50)
    
    coordinator = AgentCoordinator()
    
    # 测试团队状态
    print("\n" + coordinator.get_team_status())
    
    # 测试接收任务
    print("\n" + "=" * 50)
    task_id = coordinator.receive_task(
        title="开发记忆系统搜索功能",
        description="实现关键词搜索、日期范围搜索功能，使用 Python 开发",
        priority="p1",
        due_hours=24
    )
    
    # 测试任务分解
    print("\n" + "=" * 50)
    subtasks = coordinator.decompose_task(task_id, [
        {
            "title": "实现核心搜索算法",
            "description": "开发关键词匹配和上下文提取功能",
            "assigned_to": "agent_dev",
            "priority": "p1",
            "due_hours": 12
        },
        {
            "title": "编写单元测试",
            "description": "为搜索功能编写测试用例",
            "assigned_to": "agent_qa",
            "priority": "p2",
            "due_hours": 6
        }
    ])
    
    # 测试进度查询
    print("\n" + "=" * 50)
    progress = coordinator.get_progress()
    print(f"队列状态：{progress['queue_status']}")
    
    # 测试日报
    print("\n" + "=" * 50)
    report = coordinator.get_daily_report()
    print(report)
    
    print("\n[OK] Coordinator test completed")
