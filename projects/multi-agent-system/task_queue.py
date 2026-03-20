#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
多 Agent 协作系统 - 任务队列管理
Multi-Agent System - Task Queue Manager
"""

import json
import os
from datetime import datetime, timedelta
from pathlib import Path
from typing import List, Dict, Optional, Any
from enum import Enum


class TaskStatus(Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    BLOCKED = "blocked"


class TaskPriority(Enum):
    P0 = "p0"      # 紧急
    P1 = "p1"      # 高
    P2 = "p2"      # 中
    P3 = "p3"      # 低


class TaskQueue:
    """任务队列管理类"""
    
    def __init__(self, config_path: str = None):
        """初始化任务队列"""
        self.config = self._load_config(config_path)
        self.workspace = Path(self.config.get('system', {}).get('workspace', '.'))
        self.data_file = self.workspace / 'projects' / 'multi-agent-system' / 'tasks.json'
        
        # 确保数据文件存在
        if not self.data_file.exists():
            self._init_data()
    
    def _load_config(self, config_path: str = None) -> dict:
        """加载配置文件"""
        if config_path is None:
            config_path = Path(__file__).parent / 'config.json'
        
        if os.path.exists(config_path):
            with open(config_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {}
    
    def _init_data(self):
        """初始化数据文件"""
        data = {
            "tasks": {},
            "queue": {
                "pending": [],
                "in_progress": [],
                "completed": [],
                "failed": []
            },
            "stats": {
                "total": 0,
                "completed": 0,
                "failed": 0
            }
        }
        self._save_data(data)
    
    def _load_data(self) -> dict:
        """加载数据"""
        if self.data_file.exists():
            with open(self.data_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {"tasks": {}, "queue": {"pending": [], "in_progress": [], "completed": [], "failed": []}}
    
    def _save_data(self, data: dict):
        """保存数据"""
        self.data_file.parent.mkdir(parents=True, exist_ok=True)
        with open(self.data_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    
    def create_task(self, title: str, description: str, 
                    assigned_to: str = None, priority: str = "p2",
                    due_hours: int = 24, dependencies: List[str] = None) -> str:
        """
        创建新任务
        
        Args:
            title: 任务标题
            description: 任务描述
            assigned_to: 分配给的 Agent ID
            priority: 优先级 (p0/p1/p2/p3)
            due_hours: 多少小时内完成
            dependencies: 依赖的任务 ID 列表
            
        Returns:
            任务 ID
        """
        data = self._load_data()
        
        task_id = f"task_{len(data['tasks']) + 1:04d}"
        
        now = datetime.now()
        task = {
            "id": task_id,
            "title": title,
            "description": description,
            "assigned_to": assigned_to,
            "priority": priority,
            "status": TaskStatus.PENDING.value,
            "created_at": now.isoformat(),
            "due_at": (now + timedelta(hours=due_hours)).isoformat(),
            "started_at": None,
            "completed_at": None,
            "dependencies": dependencies or [],
            "progress": 0,
            "result": None,
            "error": None,
            "retry_count": 0
        }
        
        data["tasks"][task_id] = task
        data["queue"]["pending"].append(task_id)
        data["stats"]["total"] += 1
        
        self._save_data(data)
        return task_id
    
    def start_task(self, task_id: str, agent_id: str) -> bool:
        """开始任务"""
        data = self._load_data()
        
        if task_id not in data["tasks"]:
            return False
        
        task = data["tasks"][task_id]
        task["status"] = TaskStatus.IN_PROGRESS.value
        task["assigned_to"] = agent_id
        task["started_at"] = datetime.now().isoformat()
        
        # 从 pending 移到 in_progress
        if task_id in data["queue"]["pending"]:
            data["queue"]["pending"].remove(task_id)
        if task_id not in data["queue"]["in_progress"]:
            data["queue"]["in_progress"].append(task_id)
        
        self._save_data(data)
        return True
    
    def update_progress(self, task_id: str, progress: int, notes: str = None) -> bool:
        """更新任务进度"""
        data = self._load_data()
        
        if task_id not in data["tasks"]:
            return False
        
        task = data["tasks"][task_id]
        task["progress"] = min(100, max(0, progress))
        if notes:
            task["notes"] = notes
        
        self._save_data(data)
        return True
    
    def complete_task(self, task_id: str, result: Dict = None) -> bool:
        """完成任务"""
        data = self._load_data()
        
        if task_id not in data["tasks"]:
            return False
        
        task = data["tasks"][task_id]
        task["status"] = TaskStatus.COMPLETED.value
        task["completed_at"] = datetime.now().isoformat()
        task["progress"] = 100
        task["result"] = result
        
        # 从 in_progress 移到 completed
        if task_id in data["queue"]["in_progress"]:
            data["queue"]["in_progress"].remove(task_id)
        data["queue"]["completed"].append(task_id)
        data["stats"]["completed"] += 1
        
        self._save_data(data)
        
        # 检查是否有依赖此任务的其他任务可以开始
        self._check_dependent_tasks(task_id)
        
        return True
    
    def fail_task(self, task_id: str, error: str, retry: bool = True) -> bool:
        """任务失败"""
        data = self._load_data()
        
        if task_id not in data["tasks"]:
            return False
        
        task = data["tasks"][task_id]
        task["error"] = error
        task["retry_count"] += 1
        
        max_retries = self.config.get('settings', {}).get('max_retries', 3)
        
        if retry and task["retry_count"] < max_retries:
            # 重试
            task["status"] = TaskStatus.PENDING.value
            task["progress"] = 0
            if task_id in data["queue"]["in_progress"]:
                data["queue"]["in_progress"].remove(task_id)
            data["queue"]["pending"].append(task_id)
        else:
            # 不再重试，标记为失败
            task["status"] = TaskStatus.FAILED.value
            if task_id in data["queue"]["in_progress"]:
                data["queue"]["in_progress"].remove(task_id)
            data["queue"]["failed"].append(task_id)
            data["stats"]["failed"] += 1
        
        self._save_data(data)
        return True
    
    def _check_dependent_tasks(self, completed_task_id: str):
        """检查依赖此任务的其他任务"""
        data = self._load_data()
        
        for task_id, task in data["tasks"].items():
            if task["status"] == TaskStatus.BLOCKED.value:
                if completed_task_id in task["dependencies"]:
                    # 检查是否所有依赖都完成了
                    all_completed = all(
                        data["tasks"].get(dep, {}).get("status") == TaskStatus.COMPLETED.value
                        for dep in task["dependencies"]
                    )
                    if all_completed:
                        task["status"] = TaskStatus.PENDING.value
                        if task_id not in data["queue"]["pending"]:
                            data["queue"]["pending"].append(task_id)
        
        self._save_data(data)
    
    def get_pending_tasks(self, agent_id: str = None) -> List[Dict]:
        """获取待处理任务"""
        data = self._load_data()
        tasks = []
        
        for task_id in data["queue"]["pending"]:
            task = data["tasks"].get(task_id)
            if task:
                # 检查依赖
                if task["dependencies"]:
                    all_completed = all(
                        data["tasks"].get(dep, {}).get("status") == TaskStatus.COMPLETED.value
                        for dep in task["dependencies"]
                    )
                    if not all_completed:
                        task["status"] = TaskStatus.BLOCKED.value
                        continue
                
                # 如果指定了 agent，只返回分配给该 agent 的任务
                if agent_id is None or task.get("assigned_to") == agent_id:
                    tasks.append(task)
        
        # 按优先级排序
        priority_order = {"p0": 0, "p1": 1, "p2": 2, "p3": 3}
        tasks.sort(key=lambda t: priority_order.get(t["priority"], 2))
        
        return tasks
    
    def get_in_progress_tasks(self) -> List[Dict]:
        """获取进行中的任务"""
        data = self._load_data()
        return [data["tasks"][tid] for tid in data["queue"]["in_progress"] if tid in data["tasks"]]
    
    def get_agent_load(self, agent_id: str) -> int:
        """获取 Agent 当前负载"""
        tasks = self.get_in_progress_tasks()
        return sum(1 for t in tasks if t.get("assigned_to") == agent_id)
    
    def get_best_agent(self, required_skills: List[str] = None) -> Optional[str]:
        """
        选择最合适的 Agent
        
        Args:
            required_skills: 需要的技能列表
            
        Returns:
            最佳 Agent ID
        """
        agents = self.config.get('agents', [])
        
        candidates = []
        for agent in agents:
            # 检查技能匹配
            if required_skills:
                agent_skills = agent.get('skills', [])
                if not any(s in agent_skills for s in required_skills):
                    continue
            
            # 检查状态
            if agent.get('status') != 'available':
                continue
            
            # 检查负载
            load = self.get_agent_load(agent['id'])
            capacity = agent.get('capacity', 5)
            if load >= capacity:
                continue
            
            candidates.append((agent['id'], load))
        
        if not candidates:
            return None
        
        # 选择负载最低的
        candidates.sort(key=lambda x: x[1])
        return candidates[0][0]
    
    def get_stats(self) -> Dict:
        """获取统计信息"""
        data = self._load_data()
        return data.get('stats', {})
    
    def get_queue_status(self) -> Dict:
        """获取队列状态"""
        data = self._load_data()
        return {
            "pending": len(data["queue"]["pending"]),
            "in_progress": len(data["queue"]["in_progress"]),
            "completed": len(data["queue"]["completed"]),
            "failed": len(data["queue"]["failed"])
        }


# 测试入口
if __name__ == '__main__':
    import sys
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    
    print("[Multi-Agent System] Task Queue Test")
    print("=" * 50)
    
    queue = TaskQueue()
    
    # 测试创建任务
    print("\n创建测试任务...")
    task1 = queue.create_task(
        title="实现记忆搜索功能",
        description="开发关键词搜索功能",
        priority="p1",
        due_hours=24
    )
    print(f"创建任务：{task1}")
    
    task2 = queue.create_task(
        title="编写测试用例",
        description="为搜索功能编写单元测试",
        priority="p2",
        due_hours=12,
        dependencies=[task1]
    )
    print(f"创建任务：{task2} (依赖 {task1})")
    
    # 测试获取待处理任务
    print("\n待处理任务:")
    pending = queue.get_pending_tasks()
    for t in pending:
        print(f"  - {t['id']}: {t['title']} (优先级：{t['priority']})")
    
    # 测试开始任务
    print("\n开始任务...")
    queue.start_task(task1, "agent_dev")
    
    # 测试获取进行中的任务
    print("\n进行中的任务:")
    in_progress = queue.get_in_progress_tasks()
    for t in in_progress:
        print(f"  - {t['id']}: {t['title']} (Agent: {t['assigned_to']})")
    
    # 测试统计
    print("\n队列状态:")
    status = queue.get_queue_status()
    print(f"  待处理：{status['pending']}")
    print(f"  进行中：{status['in_progress']}")
    print(f"  已完成：{status['completed']}")
    print(f"  失败：{status['failed']}")
    
    print("\n[OK] Task queue test completed")
