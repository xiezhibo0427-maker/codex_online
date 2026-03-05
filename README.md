# 躲避陨石小游戏

一个纯前端小游戏：控制飞船躲避不断下落的陨石，存活越久分数越高。

## 本地运行

```bash
python3 -m http.server 8080
```

然后访问 <http://localhost:8080>

## 操作

- 键盘：`←` `→` 或 `A` `D`
- 手机：拖动底部滑块

## 部署（临时公网）

可以用 Cloudflare Quick Tunnel 暴露本地端口：

```bash
cloudflared tunnel --url http://localhost:8080
```

会得到一个 `https://xxxx.trycloudflare.com` 的临时网址。
