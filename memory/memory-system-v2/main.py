#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
记忆系统 2.0 - 主入口（增强版）
Memory System V2 - Main Entry Point (Enhanced)
"""

import io
import json
import sys
from datetime import datetime, timedelta

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from memory_core import MemoryCore
from search import MemorySearch
from summarizer import MemorySummarizer


def print_help():
    help_text = """
🧠 记忆系统 2.0 - 增强版

用法:
    python main.py <command> [options]

命令:
    search <keyword> [days]            关键词搜索（默认 90 天）
    summarize [date]                   提炼指定日期（默认昨天）
    auto-summarize [days]              自动提炼最近 N 天到长期记忆（默认 7 天）
    stats [days]                       显示统计信息（默认 30 天）
    tasks                              显示待办任务
    add-task <title> [--due YYYY-MM-DD] [--priority high|medium|low]
                                       添加任务
    complete-task <task_id>            完成任务
    log <message> [--agent NAME] [--date YYYY-MM-DD] [--category LABEL]
                                       追加一条 Agent 协作记录到每日记忆
    check                              检查遗忘风险
    heartbeat                          心跳检查（集成 OpenClaw）
    cleanup                            自动清理过期记忆
    cleanup-preview                    预览清理结果（不执行）
    export [days]                      导出记忆到 markdown 文件
    help                               显示此帮助信息
"""
    print(help_text)


def parse_options(args):
    positional = []
    options = {}
    i = 0
    while i < len(args):
        token = args[i]
        if token.startswith('--') and i + 1 < len(args):
            options[token[2:]] = args[i + 1]
            i += 2
        else:
            positional.append(token)
            i += 1
    return positional, options


def cmd_search(args):
    positional, _ = parse_options(args)
    if not positional:
        print('❌ 请提供搜索关键词')
        return

    keyword = positional[0]
    days = int(positional[1]) if len(positional) > 1 else 90
    search = MemorySearch(MemoryCore())

    print(f"🔍 搜索关键词：'{keyword}'（最近 {days} 天）")
    print('-' * 50)
    results = search.search_keyword(keyword, days)

    if not results:
        print('❌ 未找到匹配结果')
        return

    print(f'✅ 找到 {len(results)} 条结果')
    print()
    for index, result in enumerate(results, 1):
        print(f"{index}. 📅 {result['date']}")
        print(f"   {result['content'][:100]}...")
        print()


def cmd_auto_summarize(args):
    positional, _ = parse_options(args)
    days = int(positional[0]) if positional else 7
    core = MemoryCore()
    summarizer = MemorySummarizer(core)

    print(f'🧾 自动提炼最近 {days} 天到长期记忆...')
    print('-' * 50)
    count = summarizer.auto_summarize_to_longterm(days)
    print(f'✅ 成功提炼 {count} 天')
    print(f"📁 长期记忆文件：{core.workspace / core.config.get('longTermMemory', 'MEMORY.md')}")


def cmd_stats(args):
    positional, _ = parse_options(args)
    days = int(positional[0]) if positional else 30
    stats = MemorySearch(MemoryCore()).get_statistics(days)

    print(f'📊 记忆统计（最近 {days} 天）')
    print('-' * 50)
    print(f"✅ 记忆天数：{stats['total_days']}")
    print(f"📁 文件数量：{stats['total_files']}")
    print(f"📝 总字数：{stats['word_count']}")
    print(f"📌 任务数量：{stats['task_count']}")
    if stats['date_range']['oldest']:
        print(f"📅 最早记录：{stats['date_range']['oldest']}")
    if stats['date_range']['newest']:
        print(f"📅 最新记录：{stats['date_range']['newest']}")


def cmd_tasks(args):
    core = MemoryCore()
    print('📌 待办任务')
    print('-' * 50)
    tasks = core.get_pending_tasks()

    if not tasks:
        print('✅ 暂无待办任务')
        return

    for task in tasks:
        priority_icon = {'high': '🔴', 'medium': '🟡', 'low': '🟢'}.get(task.get('priority', 'medium'), '🟡')
        due = task.get('dueDate', '')
        overdue = ' ⏰ 已过期' if due and due < datetime.now().strftime('%Y-%m-%d') else ''
        print(f"{priority_icon} {task['id']}: {task['title']}{overdue}")
        if due:
            print(f'   📅 截止：{due}')
        if task.get('description'):
            print(f"   📝 说明：{task['description']}")
        print()

    overdue_tasks = core.get_overdue_tasks()
    if overdue_tasks:
        print(f'⏰ 警告：有 {len(overdue_tasks)} 个任务已过期')


def cmd_check(args):
    core = MemoryCore()
    print('🔍 检查遗忘风险...')
    print('-' * 50)

    memory_file = core.workspace / core.config.get('longTermMemory', 'MEMORY.md')
    if not memory_file.exists():
        print('⚠️ 长期记忆文件不存在：MEMORY.md')
        print("   建议：运行 'python main.py auto-summarize 7' 创建长期记忆")
    else:
        print('✅ 长期记忆文件存在')

    today = datetime.now()
    has_recent = False
    for i in range(3):
        date_str = (today - timedelta(days=i)).strftime('%Y-%m-%d')
        daily_file = core.memory_dir / f'{date_str}.md'
        if daily_file.exists():
            print(f'✅ {date_str} 记忆文件存在')
            has_recent = True
        else:
            print(f'⚠️ {date_str} 记忆文件缺失')

    if not has_recent:
        print()
        print('⚠️ 警告：最近 3 天没有记忆记录')

    tasks_file = core.workspace / core.config.get('tasksFile', 'memory/tasks.json')
    if tasks_file.exists():
        print()
        print('✅ 任务文件存在')
    else:
        print()
        print('⚠️ 任务文件不存在：tasks.json')

    pending = core.get_pending_tasks()
    overdue = core.get_overdue_tasks()
    if pending:
        print()
        print(f'⚠️ 当前有 {len(pending)} 个待办任务')
    if overdue:
        print(f'⚠️ 其中 {len(overdue)} 个已过期')

    print()
    print('=' * 50)
    print('💡 建议:')
    print('1. 每天记录 memory/YYYY-MM-DD.md')
    print("2. 每周运行 'python main.py auto-summarize 7'")
    print("3. 定期检查 'python main.py tasks'")
    print('4. 使用 log 命令记录多 Agent 协作结论')


def cmd_heartbeat(args):
    core = MemoryCore()
    print('💓 记忆系统心跳检查...')
    print('-' * 50)

    today = datetime.now().strftime('%Y-%m-%d')
    today_file = core.memory_dir / f'{today}.md'
    if today_file.exists():
        print(f'✅ 今日记忆文件已创建：{today}')
    else:
        print(f'⚠️ 今日记忆文件未创建：{today}')
        print('   建议：记录今日重要事项')

    tasks = core.get_pending_tasks()
    high_priority = [task for task in tasks if task.get('priority') == 'high']
    overdue = core.get_overdue_tasks()

    if high_priority:
        print()
        print(f'🔴 高优先级任务：{len(high_priority)} 个')
        for task in high_priority[:3]:
            print(f"   - {task['title']} (截止：{task.get('dueDate', '无')})")

    if overdue:
        print()
        print(f'⏰ 过期任务：{len(overdue)} 个')
        for task in overdue[:3]:
            print(f"   - {task['title']} (过期：{task.get('dueDate', '无')})")

    memory_file = core.workspace / core.config.get('longTermMemory', 'MEMORY.md')
    days_since_update = None
    if memory_file.exists():
        mtime = datetime.fromtimestamp(memory_file.stat().st_mtime)
        days_since_update = (datetime.now() - mtime).days
        if days_since_update > 7:
            print()
            print(f'⚠️ 长期记忆已 {days_since_update} 天未更新')
        else:
            print()
            print(f'✅ 长期记忆最近已更新（{days_since_update} 天前）')

    report = {
        'timestamp': datetime.now().isoformat(),
        'status': 'OK',
        'workspace': str(core.workspace),
        'today_memory': today_file.exists(),
        'pending_tasks': len(tasks),
        'high_priority_tasks': len(high_priority),
        'overdue_tasks': len(overdue),
        'longterm_memory_updated': days_since_update is not None and days_since_update <= 7,
    }
    report_file = core.memory_dir / 'heartbeat-memory-report.json'
    with open(report_file, 'w', encoding='utf-8') as f:
        json.dump(report, f, ensure_ascii=False, indent=2)

    print()
    print('=' * 50)
    print('💓 心跳状态：OK')
    print(f'📁 报告已保存：{report_file}')


def cmd_add_task(args):
    positional, options = parse_options(args)
    if not positional:
        print('❌ 请提供任务标题')
        return

    title = positional[0]
    due_date = options.get('due')
    priority = options.get('priority', 'medium')
    success = MemoryCore().add_task(title, due_date=due_date, priority=priority)

    if success:
        print(f'✅ 任务已添加：{title}')
        if due_date:
            print(f'   📅 截止：{due_date}')
        print(f'   🎯 优先级：{priority}')
    else:
        print('❌ 添加任务失败')


def cmd_complete_task(args):
    positional, _ = parse_options(args)
    if not positional:
        print('❌ 请提供任务 ID')
        return

    task_id = positional[0]
    if MemoryCore().complete_task(task_id):
        print(f'✅ 任务已完成：{task_id}')
    else:
        print(f'❌ 未找到任务：{task_id}')


def cmd_log(args):
    positional, options = parse_options(args)
    if not positional:
        print('❌ 请提供要记录的消息')
        return

    message = positional[0]
    agent = options.get('agent', 'unknown-agent')
    date = options.get('date')
    category = options.get('category', '协作记录')
    core = MemoryCore()
    target_date = date or datetime.now().strftime('%Y-%m-%d')

    if core.append_agent_note(agent=agent, message=message, date=date, category=category):
        print(f'✅ 已写入共享记忆：agent={agent}, category={category}')
        print(f"📁 文件：{core.memory_dir / f'{target_date}.md'}")
    else:
        print('❌ 写入共享记忆失败')


def cmd_export(args):
    positional, _ = parse_options(args)
    days = int(positional[0]) if positional else 30
    core = MemoryCore()
    output_path = core.workspace / f"memory-export-{datetime.now().strftime('%Y%m%d')}.md"

    print(f'📤 导出最近 {days} 天的记忆...')
    if MemorySearch(core).export_memories(str(output_path), days):
        print(f'✅ 导出成功：{output_path}')
    else:
        print('❌ 导出失败')


def cmd_summarize(args):
    positional, _ = parse_options(args)
    date = positional[0] if positional else None
    summary = MemorySummarizer(MemoryCore()).summarize_day(date)

    if date:
        print(f'🧾 提炼日期：{date}')
    else:
        print('🧾 提炼日期：昨天')
    print('-' * 50)
    print(summary or '无内容可提炼')


def cmd_cleanup_preview(args):
    from cleanup import MemoryCleanup
    MemoryCleanup(workspace=str(MemoryCore().workspace)).get_cleanup_preview()


def cmd_cleanup(args):
    from cleanup import MemoryCleanup
    cleanup = MemoryCleanup(workspace=str(MemoryCore().workspace))
    if not args or args[0] != '--force':
        print('⚠️ 即将执行自动清理')
        print("   建议先运行 'python main.py cleanup-preview' 查看预览")
        print()
        print('确认执行？(y/N): ', end='')
        try:
            if input().strip().lower() != 'y':
                print('❌ 已取消')
                return
        except Exception:
            print('❌ 已取消')
            return

    result = cleanup.auto_cleanup()
    print('\n✅ 清理完成' if result else '\n❌ 清理失败')


def main():
    if len(sys.argv) < 2:
        print_help()
        return

    command = sys.argv[1]
    args = sys.argv[2:]
    commands = {
        'help': lambda _: print_help(),
        'search': cmd_search,
        'summarize': cmd_summarize,
        'auto-summarize': cmd_auto_summarize,
        'stats': cmd_stats,
        'tasks': cmd_tasks,
        'check': cmd_check,
        'heartbeat': cmd_heartbeat,
        'cleanup': cmd_cleanup,
        'cleanup-preview': cmd_cleanup_preview,
        'add-task': cmd_add_task,
        'complete-task': cmd_complete_task,
        'export': cmd_export,
        'log': cmd_log,
    }

    handler = commands.get(command)
    if handler is None:
        print(f'❌ 未知命令：{command}')
        print_help()
        return

    handler(args)


if __name__ == '__main__':
    main()
