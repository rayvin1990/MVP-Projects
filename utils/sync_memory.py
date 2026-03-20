# 记忆区同步脚本
# 将 OpenClaw memory 同步到 Codex 记忆区

import os
import shutil
from datetime import datetime

# 源目录 (OpenClaw)
SRC = r"C:\Users\57684\.openclaw\workspace\memory"

# 目标目录 (Codex)
DEST = r"C:\Users\57684\saasfly\memory"

def sync_memory():
    """同步记忆区"""
    if not os.path.exists(SRC):
        print(f"❌ 源目录不存在: {SRC}")
        return False
    
    # 创建目标目录
    os.makedirs(DEST, exist_ok=True)
    
    # 同步文件
    synced = 0
    for root, dirs, files in os.walk(SRC):
        # 计算相对路径
        rel_path = os.path.relpath(root, SRC)
        dest_dir = os.path.join(DEST, rel_path) if rel_path != '.' else DEST
        
        # 创建目标子目录
        os.makedirs(dest_dir, exist_ok=True)
        
        # 复制文件
        for f in files:
            if f.endswith('.md') or f.endswith('.json'):
                src_file = os.path.join(root, f)
                dest_file = os.path.join(dest_dir, f)
                
                # 检查是否需要复制 (修改时间更新才复制)
                need_copy = True
                if os.path.exists(dest_file):
                    src_mtime = os.path.getmtime(src_file)
                    dest_mtime = os.path.getmtime(dest_file)
                    if src_mtime <= dest_mtime:
                        need_copy = False
                
                if need_copy:
                    shutil.copy2(src_file, dest_file)
                    print(f"✅ 同步: {rel_path}/{f}")
                    synced += 1
    
    print(f"\n📊 同步完成: {synced} 个文件")
    return True

if __name__ == "__main__":
    print(f"🕐 开始同步: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    sync_memory()
