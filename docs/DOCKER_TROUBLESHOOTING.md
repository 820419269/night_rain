# Docker Desktop 无法启动排查指南

## 一、快速检查清单

### 1.1 基础环境检查

| 检查项 | 操作 | 预期结果 |
|--------|------|----------|
| WSL 2 是否已安装 | `wsl --version` | 版本 ≥ 1.0.0 |
| WSL 状态 | `wsl --status` | Default Distribution 已设置 |
| Hyper-V 是否已启用 | `systeminfo | findstr Hyper-V` | Hyper-V Requirements: 是 |
| 虚拟化是否开启 | 任务管理器 → 性能 → CPU | 虚拟化: 已启用 |

### 1.2 Docker 服务检查

```powershell
# 检查 Docker 服务状态
Get-Service -Name com.docker.service

# 检查相关进程
Get-Process -Name Docker* -ErrorAction SilentlyContinue
Get-Process -Name wsl* -ErrorAction SilentlyContinue
```

---

## 二、逐步排查步骤

### 步骤 1：使用内置故障排除工具

1. 打开 Docker Desktop
2. 点击右上角齿轮图标 → **Troubleshoot**
3. 尝试以下操作（按顺序）：
   - **Restart Docker Desktop**
   - **Clean / Purge Data**（注意：会清除所有镜像和容器）
   - **Reset to factory defaults**

### 步骤 2：检查 WSL 2 状态

```powershell
# 1. 检查 WSL 版本
wsl --version

# 2. 列出已安装的发行版
wsl --list --verbose

# 3. 确保默认版本为 WSL 2
wsl --set-default-version 2

# 4. 测试 WSL 是否正常工作
wsl -d Ubuntu-22.04 -e echo "WSL is working"
```

### 步骤 3：检查 Docker 服务

```powershell
# 停止所有 Docker 相关服务
Stop-Service -Name com.docker.service -Force -ErrorAction SilentlyContinue
Stop-Service -Name DockerDesktopService -Force -ErrorAction SilentlyContinue

# 终止残留进程
Get-Process -Name Docker* -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process -Name wsl* -ErrorAction SilentlyContinue | Stop-Process -Force

# 重启 WSL
wsl --shutdown

# 重新启动 Docker 服务
Start-Service -Name com.docker.service
```

### 步骤 4：检查日志文件

Docker Desktop 日志位置：
- **Windows**: `%APPDATA%\Docker\log\vm\docker.log`
- **WSL**: `/var/log/docker.log`

```powershell
# 查看最新日志
Get-Content "$env:APPDATA\Docker\log\vm\docker.log" -Tail 50

# 检查 WSL 内 Docker 日志（需要进入 WSL）
wsl -d Ubuntu-22.04 -e cat /var/log/docker.log
```

### 步骤 5：检查资源配置

1. 打开 Docker Desktop 设置
2. 进入 **Resources** 页面
3. 确保分配了足够资源：
   - **Memory**: 至少 4GB（推荐 8GB）
   - **CPUs**: 至少 2 核（推荐 4 核）
   - **Swap**: 至少 1GB

---

## 三、常见错误及解决方案

### 错误 1：WSL 2 installation is incomplete

**原因**：WSL 2 未正确安装或更新

**解决方案**：
```powershell
# 更新 WSL
wsl --update

# 如果更新失败，手动下载安装
# https://wslstorestorage.blob.core.windows.net/wslblob/wsl_update_x64.msi
```

### 错误 2：Docker Desktop requires a newer WSL kernel version

**解决方案**：
```powershell
# 检查并更新 WSL 内核
wsl --update

# 如果仍有问题，手动安装最新内核
wsl --install --web-download
```

### 错误 3：Failed to start docker service

**解决方案**：
```powershell
# 检查 Windows 事件查看器
eventvwr.msc

# 查看 Docker 相关错误日志
# 事件查看器 → Windows 日志 → 应用程序 → 筛选来源为 Docker
```

### 错误 4：Port is already in use

**解决方案**：
```powershell
# 查找占用 80 端口的进程
netstat -ano | findstr ":80"

# 停止占用进程（替换 <PID>）
taskkill /PID <PID> /F

# 或修改 docker-compose.yml 中的端口映射
```

### 错误 5：Docker Desktop unexpectedly stopped

**解决方案**：
```powershell
# 清理 Docker 状态缓存（保留镜像）
Remove-Item -Path "$env:APPDATA\Docker\settings.json" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "$env:APPDATA\Docker\config.json" -Force -ErrorAction SilentlyContinue

# 重启 Docker Desktop
```

---

## 四、进阶排查

### 4.1 检查虚拟化设置

1. 重启电脑并进入 BIOS/UEFI
2. 确保以下选项已启用：
   - **Intel VT-x** 或 **AMD-V**（CPU 虚拟化）
   - **VT-d** 或 **IOMMU**（I/O 虚拟化）
   - **Secure Boot**（如果启用，需确保 Docker 签名正确）

### 4.2 检查 Windows 版本

```powershell
# 检查 Windows 版本
winver

# 需要 Windows 10 2004 或更高版本
# 需要 Windows 11 21H2 或更高版本
```

### 4.3 重新安装 Docker Desktop

如果以上方法都无效，尝试完全卸载并重新安装：

1. **卸载 Docker Desktop**
   - 控制面板 → 程序和功能 → 卸载 Docker Desktop
   - 删除残留文件：
     ```powershell
     Remove-Item -Path "$env:APPDATA\Docker" -Recurse -Force -ErrorAction SilentlyContinue
     Remove-Item -Path "$env:LOCALAPPDATA\Docker" -Recurse -Force -ErrorAction SilentlyContinue
     ```

2. **清理 WSL**（可选，会删除所有 WSL 发行版）
   ```powershell
   wsl --unregister Ubuntu-22.04
   ```

3. **重新安装 Docker Desktop**
   - 从官网下载最新版本：https://www.docker.com/products/docker-desktop/

---

## 五、验证修复

```powershell
# 验证 Docker 是否正常工作
docker --version
docker run --rm hello-world

# 验证 Compose 是否正常工作
docker compose version
```

---

## 六、预防措施

| 操作 | 说明 |
|------|------|
| **定期更新** | 保持 Docker Desktop 和 WSL 最新 |
| **资源监控** | 确保 Docker 有足够的内存和 CPU |
| **日志备份** | 定期备份 Docker 日志以便排查 |
| **配置备份** | 导出 Docker 设置（Settings → Export/Import） |

---

## 七、日志收集

如果问题仍未解决，收集以下信息用于进一步排查：

```powershell
# 1. 系统信息
systeminfo > system_info.txt

# 2. Docker 版本
docker --version >> system_info.txt
docker compose version >> system_info.txt

# 3. WSL 信息
wsl --version >> system_info.txt
wsl --list --verbose >> system_info.txt

# 4. Docker 日志
Get-Content "$env:APPDATA\Docker\log\vm\docker.log" -Tail 100 > docker_log.txt

# 5. Windows 事件日志
Get-WinEvent -LogName Application -MaxEvents 50 | Where-Object { $_.ProviderName -like "*Docker*" } > docker_events.txt
```

---

## 附录：常用命令速查表

| 命令 | 功能 |
|------|------|
| `wsl --update` | 更新 WSL 内核 |
| `wsl --shutdown` | 关闭所有 WSL 实例 |
| `wsl --list --verbose` | 列出 WSL 发行版 |
| `Get-Service com.docker.service` | 检查 Docker 服务状态 |
| `Start-Service com.docker.service` | 启动 Docker 服务 |
| `docker info` | 显示 Docker 系统信息 |
| `docker run --rm hello-world` | 测试 Docker 是否正常 |
