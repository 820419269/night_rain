# WSL 2 内核未找到问题解决方案

## 问题分析

你遇到的错误信息表明：
1. WSL 2 内核文件缺失或损坏
2. 系统设置阻止了自动内核更新

## 解决方案

### 方案一：手动更新 WSL 内核（推荐）

```powershell
# 以管理员身份打开 PowerShell

# 1. 尝试标准更新命令
wsl --update

# 2. 如果标准命令失败，尝试在线安装
wsl --install --web-download

# 3. 如果仍失败，手动下载并安装
# 打开浏览器访问：https://wslstorestorage.blob.core.windows.net/wslblob/wsl_update_x64.msi
```

### 方案二：手动下载并安装内核

1. **下载内核安装包**
   - 访问：https://wslstorestorage.blob.core.windows.net/wslblob/wsl_update_x64.msi
   - 保存到本地（例如：`C:\Downloads\wsl_update_x64.msi`）

2. **安装内核**
```powershell
# 以管理员身份运行
Start-Process -FilePath "msiexec.exe" -ArgumentList "/i C:\Downloads\wsl_update_x64.msi /quiet" -Wait
```

3. **验证安装**
```powershell
wsl --version
```

### 方案三：启用自动更新（推荐长期解决方案）

1. **打开 Windows 更新设置**
```powershell
# 打开 Windows 更新设置
ms-settings:windowsupdate
```

2. **启用“接收其他 Microsoft 产品更新”**
   - 在 Windows 更新设置中，找到 **高级选项**
   - 勾选 **"在更新 Windows 时接收其他 Microsoft 产品的更新"**
   - 点击 **"检查更新"**

### 方案四：使用离线内核包（适用于网络受限环境）

```powershell
# 1. 从微软官网下载内核包
# URL: https://aka.ms/wsl2kernel

# 2. 使用 PowerShell 下载
$url = "https://wslstorestorage.blob.core.windows.net/wslblob/wsl_update_x64.msi"
$output = "$env:TEMP\wsl_update_x64.msi"
Invoke-WebRequest -Uri $url -OutFile $output

# 3. 安装
Start-Process -FilePath "msiexec.exe" -ArgumentList "/i $output /quiet" -Wait
```

## 完整修复流程

```powershell
# Step 1: 关闭所有 WSL 实例
wsl --shutdown

# Step 2: 尝试更新
wsl --update

# Step 3: 如果失败，手动下载安装
try {
    wsl --update
} catch {
    Write-Host "标准更新失败，尝试在线安装..."
    wsl --install --web-download
}

# Step 4: 验证
wsl --version
wsl --status
```

## 验证修复

```powershell
# 1. 检查 WSL 版本
wsl --version

# 2. 检查状态
wsl --status

# 3. 测试运行
wsl -d Ubuntu-22.04 -e echo "WSL 2 is working!"

# 4. 验证 Docker 是否正常
docker --version
docker run --rm hello-world
```

## 常见错误处理

### 错误：权限不足

**解决方案**：
```powershell
# 以管理员身份运行 PowerShell
Start-Process powershell -Verb RunAs
```

### 错误：网络下载失败

**解决方案**：
```powershell
# 使用代理（如果需要）
$env:HTTP_PROXY="http://proxy:port"
$env:HTTPS_PROXY="http://proxy:port"
wsl --update
```

### 错误：安装后仍无法启动

**解决方案**：
```powershell
# 重置 WSL
wsl --shutdown
wsl --set-default-version 2

# 如果问题依旧，重新注册发行版
wsl --unregister Ubuntu-22.04
wsl --install -d Ubuntu-22.04
```

## 预防措施

| 设置 | 说明 |
|------|------|
| 启用 Windows 更新 | 确保接收自动内核更新 |
| 定期检查更新 | `wsl --update` |
| 启用快速更新通道 | 获取最新功能和修复 |

## 参考链接

- [WSL 2 内核更新](https://docs.microsoft.com/en-us/windows/wsl/wsl2-kernel)
- [WSL 安装指南](https://docs.microsoft.com/en-us/windows/wsl/install)
- [Docker Desktop WSL 2 后端](https://docs.docker.com/desktop/windows/wsl/)
