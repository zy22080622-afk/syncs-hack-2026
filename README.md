# TL Note — ACG Cultural Wiki

> Machine translation gives you the word. TL Note gives you what the word means to the people using it.

SYNCS Hack 2026 · Block 5（让信息对不同年龄、语言、数字素养的人可及）

面向 ACG 文化的**语境词典**：解释术语背后的文化含义，而不只是字面翻译。
目标用户是刚入坑的新人、看不懂孩子动态的家长、以及不懂日语但参与 ACG 社区的跨语言粉丝。

---

## 30 秒跑起来

```bash
# 前端（这一步就能完整演示，不需要后端）
cd frontend
npm install
npm run dev          # http://localhost:5173

# 后端（只负责 AI 起草，可选）
cd ../backend
pip install -r requirements.txt
cp .env.example .env # 填 API key
uvicorn main:app --reload --port 8000
```

前端 dev server 已经把 `/api` 代理到 `127.0.0.1:8000`，两边同时开着就能联通。
**后端没开也不影响**：搜索、词条页、分类浏览、Decode 的本地词典匹配全部在前端完成。

---

## 三个人怎么分工

| 谁 | 碰哪些文件 | 不要碰 |
|---|---|---|
| **内容** | `frontend/src/data/terms.json`（唯一） | 其他所有 |
| **前端 A** | `pages/Home.jsx` `pages/Term.jsx` `pages/Explore.jsx` `components/` | `terms.json` `lib/dict.js` |
| **前端 B / 后端** | `pages/Decode.jsx` `pages/Search.jsx` `lib/dict.js` `lib/api.js` `backend/` | 上面两栏 |

这样切分之后三个人几乎不会在同一个文件上冲突。`terms.json` 只有内容那个人改，
其他人要新词就口头说一声，别自己动手。

---

## 加一条词条

打开 `frontend/src/data/terms.json`，复制一条改。字段说明：

| 字段 | 说明 |
|---|---|
| `id` | 英文小写，URL 会用到（`/term/kusa`） |
| `term` | 原词 |
| `aliases` | **最重要的字段**。所有写法、别名、罗马音、英文误译都塞进来。搜索和 Decode 的命中率全靠它 |
| `reading` | 罗马音 / 读音 |
| `source_language` | `ja` / `zh` / `en` / `ko` |
| `machine_translation` | 机翻会给出的字面答案。**这是整个产品的论点，必须填** |
| `real_meaning` | 一句话说清实际含义，三语 |
| `explanation.simple` | 给家长和新人。**不许用另一个黑话解释黑话**，短句 |
| `explanation.full` | 给圈内人。来源、演变、用法边界 |
| `cross_culture` | 同一个词在中/日/英三个社区里的差异。竞品完全没有这块 |
| `example` | 真实用例 + 翻译 + 出处 |
| `category` | `fandom` `shipping` `character` `creation` `gaming` `slang` 六选一 |
| `sensitivity` | `safe` / `mild` / `adult`。家长模式只显示 `safe` |
| `status` | `verified`（人工写的）/ `ai-draft`（AI 起草未审核） |

改完存盘，Vite 会热更新，不需要重启。

**写 simple 那一层的纪律**：假设读者 60 岁、没用过 B 站。写完自己读一遍，
如果里面还有需要解释的词，就还没写完。

---

## 路由

| 路由 | 页面 |
|---|---|
| `/` | 首页：大搜索框 + 机翻陷阱词 + 六个分类 |
| `/decode` | 整句解码 —— demo 的主战场 |
| `/search?q=` | 搜索结果，空结果时可以让 AI 起草 |
| `/term/:id` | 词条页：机翻对比 → 实际含义 → 解释 → 例句 → 跨文化对比 → 相关词 |
| `/explore` `/explore/:cat` | 分类浏览 |
| `/about` | 方法论与 roadmap（评委会点进来看） |

---

## Decode 是怎么工作的

1. `lib/dict.js` 把每条词的 `term` 和所有 `aliases` 建成一张 `写法 → id` 的索引
2. 用**最长匹配**从左到右扫整段文本（中日文没有空格，不能按空格切）
3. 拉丁字母的词额外要求词边界，否则 `w` 会在 `wow` 里乱命中
4. 命中的词高亮 + 编号，下面生成译注列表；同一个词出现多次共用一个编号
5. **未收录的词**才发给后端 `/api/decode`，由 LLM 判断是不是 ACG 术语并起草

第 1–4 步全在浏览器里跑，断网也能演示。这是现场保命的设计。

---

## 部署

**前端 → Vercel**：根目录选 `frontend`，框架选 Vite，`vercel.json` 已经配好了 SPA rewrite。
如果后端部署在别处，加一个环境变量 `VITE_API_BASE=https://your-backend.example.com`。

**后端 → Render / Railway**：启动命令 `uvicorn main:app --host 0.0.0.0 --port $PORT`，
环境变量照 `.env.example` 填。

---

## 演示前的检查清单

- [ ] `.env` 里 `DEMO_MODE=1`，要演示的输入已经跑过真 API 并粘进 `backend/fixtures.json`
- [ ] 断网试一次：搜索、词条页、分类、Decode 本地匹配必须全部正常
- [ ] 三段固定演示输入准备好（中文弹幕 / 日文推文 / 家长看不懂的动态）
- [ ] 三语切换、Simple/Full 切换、家长模式各点一遍
- [ ] 12 个陷阱词的 Google Translate 截图已经拍好，放进视频
- [ ] Devpost 五项写完：问题 / 用户 / 原型是什么 / 怎么运作 / 怎么实现 + repo 链接 + 可打开的原型链接

---

## 关于内容准确性

`terms.json` 里的词条是人写的初稿，**上台前请团队里最懂圈的人通读一遍**。
特别检查：日文词条的假名和罗马音、词的出处年代、`sensitivity` 分级是否合适。
评委很可能会问「你们怎么保证词条不是编的」——答案是人工审核 + AI 草稿永远标注未审核，
这套流程本身就是加分项，前提是你们真的读过。
