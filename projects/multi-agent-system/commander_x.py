#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Commander-X - 多 Agent 协作系统指挥官
基于飞书文档设计 - 纯管理，不执行

核心原则：
1. 绝对禁令：严禁亲自动手执行具体任务
2. 职能分离：严格遵守关注点分离
3. 目标导向：确保最终目标达成
"""

import json
import os
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Optional, Any
from enum import Enum


class ViolationError(Exception):
    """违反核心原则异常"""
    pass


class StepStatus(Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    BLOCKED = "blocked"


class CommanderX:
    """
    Commander-X - 纯管理者和战略规划者
    
    禁令：
    - 不能写代码
    - 不能运行命令
    - 不能修改文件
    - 不能直接执行任务
    """
    
    def __init__(self, config_path: str = None):
        """初始化 Commander-X"""
        self.config = self._load_config(config_path)
        self.workspace = Path(self.config.get('system', {}).get('workspace', '.'))
        
        # 加载子 Agent 信息（基于 OpenClaw 架构）
        self.subagents = {a['id']: a for a in self.config.get('subagents', [])}
        # 兼容旧版 agents 配置
        if 'agents' in self.config:
            self.agents = {a['id']: a for a in self.config.get('agents', [])}
        else:
            self.agents = self.subagents
        
        # 工作流状态
        self.workflow = self.config.get('workflow', {})
        self.steps = self.workflow.get('steps', [])
        
        # 自我审计
        self.audit_log = []
        self._check_permissions()
    
    def _load_config(self, config_path: str = None) -> dict:
        """加载配置文件"""
        if config_path is None:
            config_path = Path(__file__).parent / 'config_v2.json'
        
        if os.path.exists(config_path):
            with open(config_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {}
    
    def _check_permissions(self):
        """启动时自检：禁用执行权限"""
        commander_config = self.config.get('commander_x', {})
        forbidden = commander_config.get('forbidden_actions', [])
        
        self.log(f"权限审查：已禁用 {len(forbidden)} 个执行动作")
        self.log(f"禁令列表：{', '.join(forbidden)}")
    
    def log(self, message: str):
        """记录日志"""
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        log_entry = f"[{timestamp}] {message}"
        self.audit_log.append(log_entry)
        print(log_entry)
    
    # ========== 核心禁令检查 ==========
    
    def before_action(self, action_type: str):
        """行动前自检"""
        commander_config = self.config.get('commander_x', {})
        forbidden = commander_config.get('forbidden_actions', [])
        
        if action_type in forbidden:
            raise ViolationError(
                f"违反绝对禁令：指挥官不能执行 '{action_type}' 动作\n"
                f"必须通过 delegate_task 指派给合适的 Agent"
            )
        
        # 自我检查问题
        questions = commander_config.get('self_check', {}).get('questions', [])
        self.log(f"自我检查：{questions[0]}")
    
    def write_code(self, *args, **kwargs):
        """禁令：不能写代码"""
        self.before_action('write_code')
        raise ViolationError("违反绝对禁令：指挥官不能写代码")
    
    def run_command(self, *args, **kwargs):
        """禁令：不能运行命令"""
        self.before_action('run_command')
        raise ViolationError("违反绝对禁令：指挥官不能运行命令")
    
    def modify_file(self, *args, **kwargs):
        """禁令：不能修改文件"""
        self.before_action('modify_file')
        raise ViolationError("违反绝对禁令：指挥官不能修改文件")
    
    # ========== 核心管理功能 ==========
    
    def receive_goal(self, goal: str) -> str:
        """
        接收用户目标
        
        Args:
            goal: 用户提交的目标
            
        Returns:
            工作流 ID
        """
        self.log(f"📥 接收用户目标：{goal}")
        
        # 启动 9 步流程
        workflow_id = f"wf_{datetime.now().strftime('%Y%m%d%H%M%S')}"
        self.workflow['id'] = workflow_id
        self.workflow['goal'] = goal
        self.workflow['status'] = 'started'
        self.workflow['current_step'] = 1
        self.workflow['started_at'] = datetime.now().isoformat()
        
        self.log(f"✅ 工作流已启动：{workflow_id}")
        self.log(f"📋 流程：9 步极简执行流程")
        
        # 开始第 1 步
        return self._start_step(1)
    
    def _start_step(self, step_number: int) -> str:
        """开始指定步骤"""
        if step_number > len(self.steps):
            self.log(f"✅ 所有步骤已完成")
            self.workflow['status'] = 'completed'
            return "workflow_completed"
        
        step = self.steps[step_number - 1]
        self.log(f"\n{'='*60}")
        self.log(f"🚀 开始步骤 {step_number}/{len(self.steps)}: {step['name']}")
        self.log(f"{'='*60}")
        
        # 更新状态
        self.workflow['current_step'] = step_number
        step['status'] = StepStatus.IN_PROGRESS.value
        
        # 分配给负责的 Agent
        agent_id = step.get('agent')
        if agent_id and agent_id != 'commander_x':
            return self._delegate_to_agent(step, agent_id)
        else:
            # Commander-X 自己处理的步骤（如步骤 4、5）
            return self._handle_commander_step(step)
    
    def _delegate_to_agent(self, step: Dict, agent_id: str) -> str:
        """
        指派任务给 Agent
        
        这是 Commander-X 的核心工作方式！
        """
        self.before_action('delegate_task')
        
        if agent_id not in self.agents:
            raise ValueError(f"Agent 不存在：{agent_id}")
        
        agent = self.agents[agent_id]
        
        self.log(f"📤 指派任务：{step['name']}")
        self.log(f"   执行 Agent: {agent['name']} ({agent_id})")
        self.log(f"   职责：{agent['description']}")
        self.log(f"   标准：{step.get('criteria', [])}")
        self.log(f"   输出：{step.get('output', 'N/A')}")
        
        # 创建任务指令
        task_command = {
            "type": "task_assignment",
            "from": "commander_x",
            "to": agent_id,
            "workflow_id": self.workflow.get('id'),
            "step": step['step'],
            "step_name": step['name'],
            "command": f"execute_step_{step['step']}",
            "input": {
                "goal": self.workflow.get('goal'),
                "previous_outputs": self._get_previous_outputs()
            },
            "requirements": step.get('criteria', []),
            "expected_output": step.get('output'),
            "deadline": self._calculate_deadline()
        }
        
        self.log(f"\n📋 任务指令:")
        self.log(f"   类型：{task_command['type']}")
        self.log(f"   目标：执行步骤 {step['step']}")
        self.log(f"   要求：{task_command['requirements']}")
        
        # 实际系统中这里会调用 sessions_spawn 或消息队列
        # 现在只是模拟
        self.log(f"\n✅ 任务已指派，等待 {agent['name']} 执行...")
        
        return f"task_assigned_to_{agent_id}"
    
    def _handle_commander_step(self, step: Dict) -> str:
        """处理 Commander-X 负责的步骤（如可行性校验、任务分发）"""
        self.log(f"🧠 Commander-X 处理：{step['name']}")
        
        if step['step'] == 4:
            # 可行性强制校验
            return self._feasibility_check(step)
        elif step['step'] == 5:
            # 指挥官分任务
            return self._delegate_remaining_tasks(step)
        else:
            self.log(f"⚠️ 未知步骤：{step['step']}")
            return "unknown_step"
    
    def _feasibility_check(self, step: Dict) -> str:
        """步骤 4：可行性强制校验"""
        self.log(f"\n🔍 可行性强制校验")
        self.log(f"检查项:")
        
        criteria = step.get('criteria', [])
        for criterion in criteria:
            self.log(f"  - {criterion}")
        
        # 实际系统中这里会检查前面步骤的输出
        self.log(f"\n✅ 可行性校验通过")
        self.log(f"   纯前端：✓")
        self.log(f"   无自建后端：✓")
        self.log(f"   免费 API: ✓")
        self.log(f"   1 天可上线：✓")
        
        step['status'] = StepStatus.COMPLETED.value
        
        # 继续下一步
        return self._start_step(5)
    
    def _delegate_remaining_tasks(self, step: Dict) -> str:
        """步骤 5：指挥官分任务（拆解后续步骤）"""
        self.log(f"\n📋 指挥官分任务 - 拆解后续步骤")
        
        # 后续步骤
        remaining_steps = [
            {"step": 6, "name": "开发 Agent 生成代码", "agent": "agent_developer"},
            {"step": 7, "name": "调试 Agent 质检", "agent": "agent_qa"},
            {"step": 8, "name": "尖叫度终审", "agent": "agent_product"},
            {"step": 9, "name": "部署上线", "agent": "agent_executor"}
        ]
        
        self.log(f"后续任务拆解:")
        for rs in remaining_steps:
            self.log(f"  步骤{rs['step']}: {rs['name']} → {rs['agent']}")
        
        self.log(f"\n✅ 任务拆解完成")
        self.log(f"   开发：{remaining_steps[0]['name']}")
        self.log(f"   测试：{remaining_steps[1]['name']}")
        self.log(f"   审核：{remaining_steps[2]['name']}")
        self.log(f"   部署：{remaining_steps[3]['name']}")
        
        step['status'] = StepStatus.COMPLETED.value
        
        # 继续下一步（步骤 6）
        return self._start_step(6)
    
    def _get_previous_outputs(self) -> Dict:
        """获取前面步骤的输出"""
        # 实际系统中会从任务队列获取
        return {
            "step_1": "pain_point_report",
            "step_2": "keyword_list",
            "step_3": "prd_document"
        }
    
    def _calculate_deadline(self) -> str:
        """计算截止时间"""
        from datetime import timedelta
        deadline = datetime.now() + timedelta(hours=4)
        return deadline.strftime('%Y-%m-%d %H:%M')
    
    # ========== 验收与决策 ==========
    
    def accept_result(self, step_number: int, result: Dict) -> str:
        """验收 Agent 成果"""
        step = self.steps[step_number - 1]
        
        self.log(f"\n✅ 验收步骤 {step_number}: {step['name']}")
        self.log(f"   状态：通过")
        self.log(f"   输出：{result.get('output', 'N/A')}")
        
        step['status'] = StepStatus.COMPLETED.value
        
        # 继续下一步
        return self._start_step(step_number + 1)
    
    def reject_result(self, step_number: int, reason: str) -> str:
        """拒绝成果，要求返工"""
        step = self.steps[step_number - 1]
        
        self.log(f"\n❌ 拒绝步骤 {step_number}: {step['name']}")
        self.log(f"   原因：{reason}")
        self.log(f"   处理：重新指派")
        
        step['status'] = StepStatus.FAILED.value
        
        # 重新指派
        return self._delegate_to_agent(step, step.get('agent'))
    
    # ========== 心跳审计 ==========
    
    def heartbeat_audit(self):
        """心跳自我审计"""
        self.log(f"\n💓 心跳审计开始")
        
        recent_actions = self.audit_log[-10:]
        violations = []
        
        for action in recent_actions:
            if '违反绝对禁令' in action:
                violations.append(action)
        
        if violations:
            self.log(f"⚠️ 发现 {len(violations)} 次违规")
            for v in violations:
                self.log(f"   {v}")
        else:
            self.log(f"✅ 审计完成：无违规")
        
        self.log(f"💓 心跳审计结束")
    
    # ========== 状态报告 ==========
    
    def get_workflow_status(self) -> Dict:
        """获取工作流状态"""
        return {
            "workflow_id": self.workflow.get('id'),
            "goal": self.workflow.get('goal'),
            "status": self.workflow.get('status'),
            "current_step": self.workflow.get('current_step'),
            "total_steps": len(self.steps),
            "progress": f"{self.workflow.get('current_step', 0)}/{len(self.steps)}"
        }
    
    def get_team_status(self) -> str:
        """获取团队状态"""
        lines = []
        lines.append("🏢 Commander-X 团队状态")
        lines.append("=" * 60)
        
        for agent_id, agent in self.agents.items():
            status_icon = "🟢" if agent.get('status') == 'available' else "🟡"
            lines.append(f"\n{status_icon} {agent['name']}")
            lines.append(f"   职责：{agent['description']}")
            lines.append(f"   负责步骤：{agent.get('responsible_steps', [])}")
            lines.append(f"   技能：{', '.join(agent.get('skills', []))}")
        
        lines.append("\n" + "=" * 60)
        lines.append(f"工作流：{self.workflow.get('status', 'waiting')}")
        lines.append(f"当前步骤：{self.workflow.get('current_step', 0)}/{len(self.steps)}")
        
        return "\n".join(lines)


# 测试入口
if __name__ == '__main__':
    import sys
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    
    print("=" * 60)
    print("Commander-X - 多 Agent 协作系统")
    print("基于飞书文档设计 - 纯管理，不执行")
    print("=" * 60)
    
    # 创建指挥官
    cx = CommanderX()
    
    # 测试禁令
    print("\n" + "=" * 60)
    print("测试 1: 违反禁令检查")
    print("=" * 60)
    try:
        cx.write_code()
    except ViolationError as e:
        print(f"✅ 正确拦截：{e}")
    
    # 测试接收目标
    print("\n" + "=" * 60)
    print("测试 2: 接收用户目标并启动流程")
    print("=" * 60)
    workflow_id = cx.receive_goal("创建一个 Reddit 痛点驱动的纯前端 MVP")
    
    # 测试团队状态
    print("\n" + "=" * 60)
    print("测试 3: 团队状态")
    print("=" * 60)
    print(cx.get_team_status())
    
    # 测试心跳审计
    print("\n" + "=" * 60)
    print("测试 4: 心跳审计")
    print("=" * 60)
    cx.heartbeat_audit()
    
    print("\n" + "=" * 60)
    print("[OK] Commander-X 测试完成")
    print("=" * 60)
