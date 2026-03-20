#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
记忆系统 2.0 - 核心模块
Memory System V2 - Core Module
"""

import json
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any, Dict, List, Optional


class MemoryCore:
    """记忆系统核心类。"""

    def __init__(self, config_path: str = None):
        self.config_path = Path(config_path) if config_path else Path(__file__).parent / 'config.json'
        self.base_dir = self.config_path.parent.resolve()
        self.workspace = self._resolve_workspace()
        self.config = self._load_config(self.config_path)
        self.memory_dir = self.workspace / self.config.get('memoryDir', 'memory')
        self.memory_dir.mkdir(parents=True, exist_ok=True)

    def _resolve_workspace(self) -> Path:
        if self.config_path.exists():
            with open(self.config_path, 'r', encoding='utf-8') as f:
                raw = json.load(f)
            configured = raw.get('workspace')
            if configured:
                candidate = Path(configured)
                if not candidate.is_absolute():
                    candidate = (self.base_dir / candidate).resolve()
                return candidate
        return self.base_dir.parent.parent.parent.resolve()

    def _load_config(self, config_path: Path) -> dict:
        if config_path.exists():
            with open(config_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {}

    def get_today_memory_path(self) -> Path:
        today = datetime.now().strftime('%Y-%m-%d')
        return self.memory_dir / f'{today}.md'

    def ensure_daily_memory(self, date: str = None) -> Path:
        target_date = date or datetime.now().strftime('%Y-%m-%d')
        path = self.memory_dir / f'{target_date}.md'
        if not path.exists():
            template = (
                f'# {target_date} - 记忆日志\n\n'
                '## 今日重点\n\n'
                '## 重要决定\n\n'
                '## 待办事项\n\n'
                '## 经验教训\n'
            )
            path.write_text(template, encoding='utf-8')
        return path

    def read_daily_memory(self, date: str = None) -> Optional[str]:
        target_date = date or datetime.now().strftime('%Y-%m-%d')
        path = self.memory_dir / f'{target_date}.md'
        if path.exists():
            return path.read_text(encoding='utf-8')
        return None

    def write_daily_memory(self, content: str, date: str = None) -> bool:
        target_date = date or datetime.now().strftime('%Y-%m-%d')
        path = self.memory_dir / f'{target_date}.md'
        try:
            path.write_text(content, encoding='utf-8')
            return True
        except Exception as e:
            print(f'写入记忆失败：{e}')
            return False

    def append_daily_memory(self, content: str, date: str = None) -> bool:
        path = self.ensure_daily_memory(date)
        try:
            with open(path, 'a', encoding='utf-8') as f:
                if path.stat().st_size > 0:
                    f.write('\n')
                f.write(content.rstrip() + '\n')
            return True
        except Exception as e:
            print(f'追加记忆失败：{e}')
            return False

    def read_long_term_memory(self) -> Optional[str]:
        path = self.workspace / self.config.get('longTermMemory', 'MEMORY.md')
        if path.exists():
            return path.read_text(encoding='utf-8')
        return None

    def write_long_term_memory(self, content: str) -> bool:
        path = self.workspace / self.config.get('longTermMemory', 'MEMORY.md')
        try:
            path.write_text(content, encoding='utf-8')
            return True
        except Exception as e:
            print(f'写入长期记忆失败：{e}')
            return False

    def append_long_term_memory(self, content: str) -> bool:
        path = self.workspace / self.config.get('longTermMemory', 'MEMORY.md')
        try:
            if not path.exists():
                header = (
                    '# 长期记忆 - Long Term Memory\n\n'
                    '_Curated memories, decisions, and important context._\n\n'
                    '---\n\n'
                )
                path.write_text(header, encoding='utf-8')
            with open(path, 'a', encoding='utf-8') as f:
                f.write(content.rstrip() + '\n')
            return True
        except Exception as e:
            print(f'追加长期记忆失败：{e}')
            return False

    def list_memory_files(self, days: int = 30) -> List[str]:
        files = []
        today = datetime.now()
        for i in range(days):
            date = (today - timedelta(days=i)).strftime('%Y-%m-%d')
            path = self.memory_dir / f'{date}.md'
            if path.exists():
                files.append(date)
        return files

    def get_tasks(self) -> Dict[str, Any]:
        tasks_path = self.workspace / self.config.get('tasksFile', 'memory/tasks.json')
        if tasks_path.exists():
            with open(tasks_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {'tasks': []}

    def save_tasks(self, tasks_data: Dict[str, Any]) -> bool:
        tasks_path = self.workspace / self.config.get('tasksFile', 'memory/tasks.json')
        tasks_path.parent.mkdir(parents=True, exist_ok=True)
        try:
            with open(tasks_path, 'w', encoding='utf-8') as f:
                json.dump(tasks_data, f, ensure_ascii=False, indent=2)
            return True
        except Exception as e:
            print(f'保存任务失败：{e}')
            return False

    def add_task(self, title: str, description: str = '', due_date: str = None, priority: str = 'medium') -> bool:
        tasks_data = self.get_tasks()
        existing_ids = {task['id'] for task in tasks_data['tasks']}
        next_index = 1
        while f'task_{next_index:03d}' in existing_ids:
            next_index += 1

        new_task = {
            'id': f'task_{next_index:03d}',
            'title': title,
            'description': description,
            'dueDate': due_date or datetime.now().strftime('%Y-%m-%d'),
            'priority': priority,
            'status': 'pending',
            'createdAt': datetime.now().isoformat(),
            'reminded': False,
        }
        tasks_data['tasks'].append(new_task)
        return self.save_tasks(tasks_data)

    def complete_task(self, task_id: str) -> bool:
        tasks_data = self.get_tasks()
        for task in tasks_data['tasks']:
            if task['id'] == task_id:
                task['status'] = 'completed'
                task['completedAt'] = datetime.now().isoformat()
                return self.save_tasks(tasks_data)
        return False

    def get_pending_tasks(self) -> List[Dict[str, Any]]:
        return [task for task in self.get_tasks()['tasks'] if task['status'] == 'pending']

    def get_overdue_tasks(self) -> List[Dict[str, Any]]:
        today = datetime.now().strftime('%Y-%m-%d')
        return [
            task for task in self.get_tasks()['tasks']
            if task['status'] == 'pending' and task.get('dueDate', '') < today
        ]

    def append_agent_note(self, agent: str, message: str, date: str = None, category: str = '协作记录') -> bool:
        timestamp = datetime.now().strftime('%H:%M:%S')
        entry = f'## [{timestamp}] {category}\n- Agent: {agent}\n- 内容: {message}'
        return self.append_daily_memory(entry, date)


if __name__ == '__main__':
    print('[Memory System V2] Core Module Test')
    print('=' * 50)
    core = MemoryCore()
    print(f'Workspace: {core.workspace}')
    print(f'Memory dir: {core.memory_dir}')
    print(f'Today path: {core.get_today_memory_path()}')
    print(f'Pending tasks: {len(core.get_pending_tasks())}')
    print('[OK] Core module test completed')
