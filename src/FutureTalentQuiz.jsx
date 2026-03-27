import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import { toPng } from "html-to-image";
import { QRCodeSVG } from "qrcode.react";

const supabase = createClient(
  "https://pcrktcgzqqqzgjgnohpj.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjcmt0Y2d6cXFxemdqZ25vaHBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4OTc2ODcsImV4cCI6MjA4OTQ3MzY4N30.kfLYMeWqX5PL5U8zZQJji6CILRgKxrqarHoedQ1aRyY"
);

// ========== 韦斯安德森配色 ==========
const C = {
  cream: "#F9F5E7", paper: "#F4EDD9", cardBg: "#FFFDF5",
  pink: "#D4738C", pinkPale: "#F2D4DC", pinkDeep: "#A8445E",
  blue: "#5B8FA8", bluePale: "#C9DEE8", blueDeep: "#2E5F78",
  green: "#6B9A6B", greenPale: "#D2E4C8", greenDeep: "#3D6B3D",
  mustard: "#C8963E", mustardPale: "#F0E0BA", mustardDeep: "#8B6620",
  accent: "#BF3B3B", navy: "#2C3E5A",
  ink: "#2C2416", inkLight: "#5A4E3C", inkMuted: "#8A7E6E",
  border: "#C8BBAA", borderDark: "#9A8E7C",
};

const font = "'Helvetica Neue', 'PingFang SC', 'Noto Sans SC', 'Microsoft YaHei', sans-serif";
const fontTitle = "'Futura', 'Helvetica Neue', 'PingFang SC', sans-serif";

// ========== 维度定义 ==========
const dimensions = [
  {
    key: "bias", name: "偏见力",
    poleA: { code: "锐", label: "挑剔型", desc: "你对平庸有天然的排斥反应。一堆「都还行」的选项里，你总能瞬间挑出那个有灵魂的——同时毫不犹豫地毙掉剩下的。" },
    poleB: { code: "宽", label: "包容型", desc: "你能在「不够完美」里看到价值。别人嫌弃的东西，你能看见被忽略的好。这让你拥有更多可能性的入口。" },
    color: C.pink, pale: C.pinkPale, deep: C.pinkDeep
  },
  {
    key: "define", name: "定义力",
    poleA: { code: "宏", label: "全局型", desc: "你习惯先退一步看全貌。面对乱局，你的第一反应不是动手，而是问「我们到底在解决什么问题」。在你看来，问对问题比找对答案重要十倍。" },
    poleB: { code: "实", label: "拆解型", desc: "你习惯卷起袖子找突破口。面对乱局，你的第一反应是把大问题拆成小问题，逐个击破。在你看来，一个能执行的计划胜过十个漂亮的框架。" },
    color: C.blue, pale: C.bluePale, deep: C.blueDeep
  },
  {
    key: "orchestrate", name: "调度力",
    poleA: { code: "选", label: "选配型", desc: "你的第一反应是盘牌——哪个人合适、哪个 AI 能跑、哪个工具顺手、哪个资源能借。你相信选对东西比怎么用更重要。" },
    poleB: { code: "编", label: "编排型", desc: "你的第一反应是连线——谁先谁后、哪些并行、AI 输出怎么接给人审、人的判断怎么回流到系统。你相信好的编排让一堆零件变成一台机器。" },
    color: C.green, pale: C.greenPale, deep: C.greenDeep
  },
  {
    key: "resonate", name: "共鸣力",
    poleA: { code: "心", label: "走心型", desc: "你先读懂人，再处理事。你能感知对方没说出口的需求，用情感建立信任。你打动人的方式是让对方觉得「这个人真的懂我」。" },
    poleB: { code: "理", label: "讲理型", desc: "你先讲清事，再连接人。你用逻辑和事实建立可信度，让对方因为「这件事值得做」而被打动。你赢得信任的方式是清晰和诚实。" },
    color: C.mustard, pale: C.mustardPale, deep: C.mustardDeep
  }
];

// ========== 16道题（每维度4题） ==========
const questions = [
  // 偏见力 ×4
  { dim: "bias", scenario: "朋友推荐了一部「所有人都说好」的电影", a: { text: "所有人都说好？那我得准备好失望。", pole: "A" }, b: { text: "那多半真的不错，今晚就看。", pole: "B" } },
  { dim: "bias", scenario: "AI 生成了 5 个方案，质量都在 80 分以上", a: { text: "都能用，但没有一个让我兴奋。", pole: "A" }, b: { text: "效率真高，挑一个最合适的就行。", pole: "B" } },
  { dim: "bias", scenario: "团队在讨论一个「安全但平庸」的方案", a: { text: "我会直接说：这个方案没有灵魂。", pole: "A" }, b: { text: "先肯定方向，再找机会加入新想法。", pole: "B" } },
  { dim: "bias", scenario: "你收到一份简历，经历丰富但没有突出亮点", a: { text: "没有一项让我眼前一亮，pass。", pole: "A" }, b: { text: "全面发展也是一种能力，值得聊聊。", pole: "B" } },
  // 定义力 ×4
  { dim: "define", scenario: "项目遇到瓶颈，团队陷入争论", a: { text: "退一步——我们到底在解决什么问题？", pole: "A" }, b: { text: "先拆解当前卡点，逐个击破。", pole: "B" } },
  { dim: "define", scenario: "有人问「我们的目标是什么」", a: { text: "让用户离不开我们。", pole: "A" }, b: { text: "下个月日活到 5000。", pole: "B" } },
  { dim: "define", scenario: "面对一个从没见过的复杂问题", a: { text: "先找到最本质的矛盾是什么。", pole: "A" }, b: { text: "先搞清楚涉及哪些人和哪些环节。", pole: "B" } },
  { dim: "define", scenario: "老板说「把这个产品做好」，没有更多指示", a: { text: "我会先定义「好」到底意味着什么。", pole: "A" }, b: { text: "我会先列出能改进的具体点，逐项推进。", pole: "B" } },
  // 调度力 ×4
  { dim: "orchestrate", scenario: "接到一个新任务，你第一反应是", a: { text: "盘一下手上有什么牌——哪个人能用、哪个 AI 能跑、哪个工具顺手。", pole: "A" }, b: { text: "画一下流程——先做什么、后做什么、哪些能并行、谁的输出接给谁。", pole: "B" } },
  { dim: "orchestrate", scenario: "项目出了问题，进度落后", a: { text: "大概率是资源选错了——换个人、换个工具，问题就解了。", pole: "A" }, b: { text: "大概率是配合出了问题——调整一下顺序和衔接方式就好。", pole: "B" } },
  { dim: "orchestrate", scenario: "AI 工具越来越多，你的应对方式是", a: { text: "挑几个最趁手的深度用好，不贪多。", pole: "A" }, b: { text: "设计一套工作流，让不同工具各管一段、串起来跑。", pole: "B" } },
  { dim: "orchestrate", scenario: "团队要启动一个跨部门合作项目", a: { text: "先想清楚每个部门谁最靠谱，把人选定下来。", pole: "A" }, b: { text: "先画协作流程图，明确信息怎么流转、决策在哪里汇合。", pole: "B" } },
  // 共鸣力 ×4
  { dim: "resonate", scenario: "同事情绪低落，但嘴上说「没事」", a: { text: "找机会私下陪他聊聊，不急着解决问题。", pole: "A" }, b: { text: "尊重他的话，等他准备好了自然会说。", pole: "B" } },
  { dim: "resonate", scenario: "谈判桌上，对方提出你不同意的条件", a: { text: "先理解他为什么这样提，再回应。", pole: "A" }, b: { text: "用数据说明为什么这个条件不合理。", pole: "B" } },
  { dim: "resonate", scenario: "想说服一个人加入你的项目", a: { text: "让他觉得「这群人懂我」。", pole: "A" }, b: { text: "让他看到「这件事值得做」。", pole: "B" } },
  { dim: "resonate", scenario: "给客户做一场重要汇报", a: { text: "先讲一个他们能共情的故事，再带出方案。", pole: "A" }, b: { text: "先亮核心数据和结论，让事实说话。", pole: "B" } },
];

// ========== 类型命名 ==========
const archetypes = {
  "锐宏选心": { name: "理想主义船长", tagline: "眼光毒辣，手里永远攥着最好的牌，带着一群被他打动的人去没人去过的地方" },
  "锐宏选理": { name: "孤独先知", tagline: "看得最远，选得最准，用清醒的逻辑说服值得同行的人" },
  "锐宏编心": { name: "浪漫建筑师", tagline: "用挑剔的审美画蓝图，用精密的流程让所有人住进来，还觉得温暖" },
  "锐宏编理": { name: "秩序革命者", tagline: "用逻辑编排规则，用品味淘汰平庸，最硬核的理想主义者" },
  "锐实选心": { name: "偏执匠人", tagline: "只用最好的料，在每个细节里倾注情感，交付的东西自己先得看得上" },
  "锐实选理": { name: "冷面猎手", tagline: "选最快的刀、走最短的路，一击命中，不废话" },
  "锐实编心": { name: "温柔工头", tagline: "用最挑剔的标准排工序，然后确保每个环节的人都舒服" },
  "锐实编理": { name: "精密钟表匠", tagline: "标准高到令人发指，流程细到滴水不漏" },
  "宽宏选心": { name: "篝火守护者", tagline: "看得远又容得下人，总能找到那个被所有人忽略的关键资源" },
  "宽宏选理": { name: "灰度战略家", tagline: "接受世界的不完美，选最合适而非最完美的牌，用逻辑找到最优解" },
  "宽宏编心": { name: "织网人", tagline: "用耐心编排所有人和事的协作关系，织出比任何个人都持久的网" },
  "宽宏编理": { name: "幕后总设计师", tagline: "不着急表态，但编排出来的系统所有人都在用" },
  "宽实选心": { name: "社区灵魂人物", tagline: "脚踩实地，心装别人，总能在身边找到对的人和对的工具" },
  "宽实选理": { name: "老江湖", tagline: "不追风口，不挑活，手上的家伙事儿永远够用，什么局面都接得住" },
  "宽实编心": { name: "润滑剂", tagline: "让流程不伤人，让衔接不卡壳，你在的地方摩擦最少" },
  "宽实编理": { name: "铁面管家", tagline: "流程清楚，交付准时，不靠灵感靠纪律，不靠魅力靠信用" }
};

// ========== 个性化建议 ==========
function getAdvice(results) {
  const [b, d, o, r] = results.map(r => r.code);
  return [
    b === "锐"
      ? "你的挑剔是天然的质量过滤器——在人机协作中，AI 负责量产，你负责毙稿。把审美标准变成可传达的 prompt，让 AI 理解你的「不要」比「要」更重要。"
      : "你的包容是创新的入口——AI 输出的「半成品」在你手里能看到别人看不到的可能性。你适合做 AI 的「第一个读者」，从粗糙里打捞价值。",
    d === "宏"
      ? "你擅长定义问题，这在 AI 时代是最稀缺的能力。AI 能回答任何问题，但不会提问。你的角色是：在所有人埋头跑之前，先确认方向是对的。"
      : "你擅长把大目标拆成可执行的步骤——这正是 AI 最需要的指令格式。你天然会写好的 prompt，因为你本能地把模糊需求翻译成具体动作。",
    o === "选"
      ? "你的选配直觉让你能快速识别哪个 AI 模型、哪个工具、哪个人最适合当前任务。在工具爆炸的时代，「选对」比「会用」重要，你有这个眼光。"
      : "你的编排能力是 AI 时代的核心竞争力。单个 AI 只是零件，你能把多个 AI、人、数据源编成一条流水线。未来的生产力属于「能编排工作流的人」。",
    r === "心"
      ? "AI 能替代大多数理性沟通，但替代不了你「读懂人」的能力。在团队里，你是把 AI 产出转化为人类共识的桥梁——机器给答案，你给意义。"
      : "你用逻辑建立信任，这在 AI 辅助决策中极为关键。当团队面对 AI 的多个建议犹豫不决时，你是那个能用清晰推理拍板的人。"
  ];
}

// ========== 互补类型推荐 ==========
function getComplementaryTypes(typeCode) {
  // 互补逻辑：每个维度取对立面
  const codes = typeCode.split("");
  const dimPoles = [
    { a: "锐", b: "宽" },
    { a: "宏", b: "实" },
    { a: "选", b: "编" },
    { a: "心", b: "理" }
  ];

  // 完全互补：四个维度全部对立
  const fullComplement = codes.map((c, i) =>
    c === dimPoles[i].a ? dimPoles[i].b : dimPoles[i].a
  ).join("");

  // 部分互补：翻转其中2个维度，选差异最大的组合
  const partials = [];
  for (let i = 0; i < 4; i++) {
    for (let j = i + 1; j < 4; j++) {
      const flipped = [...codes];
      flipped[i] = codes[i] === dimPoles[i].a ? dimPoles[i].b : dimPoles[i].a;
      flipped[j] = codes[j] === dimPoles[j].a ? dimPoles[j].b : dimPoles[j].a;
      const key = flipped.join("");
      if (key !== fullComplement && archetypes[key]) {
        partials.push(key);
      }
    }
  }

  // 返回：完全互补 + 2个部分互补
  const result = [fullComplement];
  // 优先选翻转 dim0+dim3（偏见力+共鸣力） 和 dim1+dim2（定义力+调度力）
  const preferred = [
    [0, 3], [1, 2], [0, 1], [2, 3]
  ];
  for (const [i, j] of preferred) {
    const flipped = [...codes];
    flipped[i] = codes[i] === dimPoles[i].a ? dimPoles[i].b : dimPoles[i].a;
    flipped[j] = codes[j] === dimPoles[j].a ? dimPoles[j].b : dimPoles[j].a;
    const key = flipped.join("");
    if (key !== fullComplement && archetypes[key] && !result.includes(key)) {
      result.push(key);
    }
    if (result.length >= 3) break;
  }

  return result.slice(0, 3).map(code => ({
    code,
    name: archetypes[code]?.name || "探索者"
  }));
}

const SITE_URL = "https://ai-mbti.biasmoat.com";

// ========== Supabase 数据层 ==========
async function submitToSupabase(data) {
  try {
    const { data: row, error } = await supabase
      .from("quiz_submissions")
      .insert({
        type_code: data.typeCode,
        archetype_name: data.archetypeName,
        challenge_count: data.challengeCount,
        tally: data.tally,
        answers: data.answers,
      })
      .select("id")
      .single();
    if (error) throw error;
    // 把暂存的质疑关联到这条提交
    if (data.challenges?.length > 0) {
      const rows = data.challenges.map(c => ({
        submission_id: row.id,
        question_index: c.questionIndex,
        challenge_text: c.text,
      }));
      await supabase.from("quiz_challenges").insert(rows);
    }
    return row.id;
  } catch (e) {
    console.error("[Supabase] submit error:", e);
    return null;
  }
}

async function submitSingleChallenge(challenge) {
  // 答题过程中的质疑先不提交，等最终一起提交
  // 这个函数保留用于未来独立提交场景
  console.log("[challenge queued]", challenge);
}

async function fetchDistribution() {
  try {
    const { data, error } = await supabase
      .from("quiz_submissions")
      .select("type_code, archetype_name");
    if (error) throw error;
    if (!data || data.length === 0) return null;
    // 统计每种类型的数量
    const counts = {};
    data.forEach(row => {
      const key = row.type_code;
      if (!counts[key]) counts[key] = { count: 0, name: row.archetype_name };
      counts[key].count++;
    });
    return { counts, total: data.length };
  } catch (e) {
    console.error("[Supabase] fetch distribution error:", e);
    return null;
  }
}

// ========== 装饰组件 ==========
function Divider({ color = C.border }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
      <div style={{ flex: 1, height: 1, background: color }} />
      <div style={{ width: 6, height: 6, borderRadius: "50%", background: color }} />
      <div style={{ flex: 1, height: 1, background: color }} />
    </div>
  );
}

function FramedCard({ children, style = {}, borderColor = C.border }) {
  return (
    <div style={{ border: `2px solid ${borderColor}`, borderRadius: 4, padding: 4, ...style }}>
      <div style={{ border: `1px solid ${borderColor}`, borderRadius: 2, padding: "20px 24px", background: C.cardBg }}>
        {children}
      </div>
    </div>
  );
}

// ========== 欢迎页 ==========
function WelcomePage({ onStart }) {
  return (
    <div style={{ textAlign: "center", paddingTop: 60 }}>
      <div style={{
        display: "inline-block", padding: "8px 32px",
        border: `2px solid ${C.navy}`, borderRadius: 2,
        marginBottom: 28, background: C.navy, color: C.cream,
        fontFamily: fontTitle, fontSize: 11, letterSpacing: 6,
        textTransform: "uppercase"
      }}>
        AI SYNTYPE · 16
      </div>

      <h1 style={{
        fontSize: 28, fontWeight: 800, fontFamily: fontTitle,
        lineHeight: 1.5, marginBottom: 8, color: C.ink, letterSpacing: 1
      }}>
        AI 协同16型人格
      </h1>

      <Divider color={C.accent} />

      <p style={{
        color: C.inkLight, fontSize: 14, lineHeight: 2.2,
        maxWidth: 300, margin: "0 auto 36px", fontFamily: font
      }}>
        AI 重新定义了「有用」。<br />
        这份测评不打分——<br />
        它画出你在四个维度的倾向。
      </p>

      {/* 四维度卡片：只显示名称，无副标题 */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10,
        maxWidth: 340, margin: "0 auto 36px"
      }}>
        {dimensions.map(d => (
          <FramedCard key={d.key} borderColor={d.color}>
            <p style={{
              fontSize: 15, fontWeight: 700, color: d.deep,
              fontFamily: fontTitle, textAlign: "center", margin: 0
            }}>
              {d.name}
            </p>
          </FramedCard>
        ))}
      </div>

      <button onClick={onStart} style={{
        padding: "14px 56px", background: C.accent, color: "#fff",
        fontSize: 15, fontWeight: 700, border: "none", borderRadius: 2,
        cursor: "pointer", fontFamily: fontTitle, letterSpacing: 2,
        boxShadow: `3px 3px 0 ${C.navy}`
      }}>
        开 始 测 评
      </button>

      <p style={{ color: C.inkMuted, fontSize: 11, marginTop: 16, fontFamily: font }}>
        16 道题 · 约 3 分钟 · 没有对错
      </p>
    </div>
  );
}

// ========== 答题页 ==========
function QuestionCard({ question, index, total, onAnswer, onChallenge }) {
  const dim = dimensions.find(d => d.key === question.dim);
  const [hovered, setHovered] = useState(null);
  const [showChallenge, setShowChallenge] = useState(false);
  const [challengeText, setChallengeText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitChallenge = () => {
    if (!challengeText.trim()) return;
    onChallenge(index, challengeText.trim());
    setSubmitted(true);
    setTimeout(() => {
      setShowChallenge(false);
      setSubmitted(false);
      setChallengeText("");
    }, 1500);
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto" }}>
      {/* 进度条 */}
      <div style={{ display: "flex", gap: 3, marginBottom: 28 }}>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} style={{
            flex: 1, height: 4, borderRadius: 0,
            background: i < index ? dim.color : i === index ? dim.deep : C.border,
            transition: "background 0.3s"
          }} />
        ))}
      </div>

      {/* 编号标签 */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <span style={{
          display: "inline-block", padding: "4px 20px",
          background: dim.color, color: "#fff", borderRadius: 2,
          fontSize: 12, fontWeight: 700, fontFamily: fontTitle, letterSpacing: 2
        }}>
          № {String(index + 1).padStart(2, "0")} / {total}
        </span>
      </div>

      {/* 场景 */}
      <FramedCard borderColor={dim.color} style={{ marginBottom: 20 }}>
        <p style={{
          fontSize: 16, color: C.ink, fontFamily: font,
          lineHeight: 1.9, textAlign: "center", fontWeight: 600
        }}>
          {question.scenario}
        </p>
      </FramedCard>

      {/* 两个选项 */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {[question.a, question.b].map((opt, i) => (
          <div
            key={i}
            onClick={() => onAnswer(opt.pole)}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={{
              padding: "18px 24px", borderRadius: 2, cursor: "pointer",
              background: hovered === i ? dim.pale : C.cardBg,
              border: hovered === i ? `2px solid ${dim.color}` : `2px solid ${C.border}`,
              fontSize: 15, color: C.ink, fontFamily: font,
              lineHeight: 1.8, transition: "all 0.15s",
              boxShadow: hovered === i ? `2px 2px 0 ${dim.color}` : "none"
            }}
          >
            {opt.text}
          </div>
        ))}
      </div>

      {/* 质疑入口 */}
      <div style={{ textAlign: "center", marginTop: 16 }}>
        {!showChallenge ? (
          <button
            onClick={() => setShowChallenge(true)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: C.inkMuted, fontSize: 12, fontFamily: font,
              textDecoration: "underline", textUnderlineOffset: 3
            }}
          >
            这道题有问题？点击质疑
          </button>
        ) : (
          <div style={{
            marginTop: 8, padding: 16, background: C.paper,
            border: `1px solid ${C.border}`, borderRadius: 4
          }}>
            {submitted ? (
              <p style={{ color: C.green, fontSize: 13, fontFamily: font, fontWeight: 600 }}>
                ✓ 收到你的反馈
              </p>
            ) : (
              <>
                <textarea
                  value={challengeText}
                  onChange={e => setChallengeText(e.target.value)}
                  placeholder="这道题哪里不对？你觉得应该怎么改？"
                  style={{
                    width: "100%", minHeight: 60, padding: 10, fontSize: 13,
                    fontFamily: font, border: `1px solid ${C.border}`, borderRadius: 2,
                    background: C.cardBg, color: C.ink, resize: "vertical",
                    boxSizing: "border-box", lineHeight: 1.8
                  }}
                />
                <div style={{ display: "flex", gap: 8, marginTop: 8, justifyContent: "flex-end" }}>
                  <button
                    onClick={() => { setShowChallenge(false); setChallengeText(""); }}
                    style={{
                      padding: "6px 16px", fontSize: 12, background: "none",
                      border: `1px solid ${C.border}`, borderRadius: 2,
                      cursor: "pointer", color: C.inkMuted, fontFamily: font
                    }}
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSubmitChallenge}
                    style={{
                      padding: "6px 16px", fontSize: 12, background: C.navy,
                      color: "#fff", border: "none", borderRadius: 2,
                      cursor: "pointer", fontFamily: fontTitle, fontWeight: 700
                    }}
                  >
                    提交质疑
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ========== 双向生长条（结果页） ==========
function DualGrowBar({ dim, aCount, bCount }) {
  const maxPerSide = 4; // 每维度4题
  const aPct = (aCount / maxPerSide) * 100;
  const bPct = (bCount / maxPerSide) * 100;

  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{
          fontSize: 12, fontWeight: 700, fontFamily: fontTitle,
          color: aCount >= bCount ? dim.deep : C.inkMuted, width: 56, textAlign: "right"
        }}>
          {dim.poleA.label}
        </span>

        <div style={{
          flex: 1, height: 14, borderRadius: 2,
          background: C.border, position: "relative",
          border: `1px solid ${C.borderDark}`, overflow: "hidden"
        }}>
          {/* 中线 */}
          <div style={{
            position: "absolute", left: "50%", top: -1, bottom: -1, width: 2,
            background: C.ink, zIndex: 2, transform: "translateX(-1px)"
          }} />

          {/* A 方向：从中线向左长 */}
          <div style={{
            position: "absolute", right: "50%", top: 0, bottom: 0,
            width: `${aPct / 2}%`,
            background: dim.color,
            borderRadius: "2px 0 0 2px",
            transition: "width 0.8s ease",
            opacity: 0.85
          }} />

          {/* B 方向：从中线向右长 */}
          <div style={{
            position: "absolute", left: "50%", top: 0, bottom: 0,
            width: `${bPct / 2}%`,
            background: dim.deep,
            borderRadius: "0 2px 2px 0",
            transition: "width 0.8s ease",
            opacity: 0.85
          }} />
        </div>

        <span style={{
          fontSize: 12, fontWeight: 700, fontFamily: fontTitle,
          color: bCount > aCount ? dim.deep : C.inkMuted, width: 56
        }}>
          {dim.poleB.label}
        </span>
      </div>
      {/* 无数字计数 */}
    </div>
  );
}

// ========== 破壁力展示 ==========
function WallBreakerScore({ challengeCount }) {
  const hammers = Math.min(16, challengeCount);

  return (
    <FramedCard borderColor={C.navy} style={{ marginTop: 20, textAlign: "left" }}>
      <div style={{ marginBottom: 12 }}>
        <span style={{
          display: "inline-block", padding: "3px 12px",
          background: C.navy, color: C.cream, borderRadius: 2,
          fontSize: 11, fontWeight: 700, fontFamily: fontTitle, letterSpacing: 2
        }}>
          破壁力
        </span>
      </div>

      {/* 锤子展示 */}
      <div style={{ fontSize: 28, lineHeight: 1.6, marginBottom: 8, minHeight: 40 }}>
        {hammers > 0
          ? Array.from({ length: hammers }).map((_, i) => <span key={i}>🔨</span>)
          : <span style={{ fontSize: 14, color: C.inkMuted, fontFamily: font }}>—— 尚未破壁</span>
        }
      </div>

      {hammers > 0 && (
        <p style={{ fontSize: 14, color: C.accent, fontWeight: 700, fontFamily: font, margin: "0 0 8px" }}>
          你的提问，打破了 {hammers} 层框架。
        </p>
      )}

      <p style={{ fontSize: 11, color: C.inkMuted, lineHeight: 1.8, fontFamily: font, margin: 0 }}>
        题目是墙，预设框架是围城。质疑就是在墙上打孔——孔洞越多，光才能照进来。
        {hammers >= 8 ? " 你是天生的破壁人。" : hammers >= 3 ? " 你已经开始在墙上打孔。" : " 每一次质疑都是一束光。"}
      </p>
    </FramedCard>
  );
}

// ========== 分布页（占位，接 Supabase 后填充） ==========
function DistributionPage({ userType, onBack }) {
  const [distribution, setDistribution] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDistribution().then(data => {
      setDistribution(data);
      setLoading(false);
    });
  }, []);

  // 所有16种类型
  const allTypes = Object.entries(archetypes);

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", textAlign: "center" }}>
      <div style={{
        display: "inline-block", padding: "6px 24px",
        background: C.navy, color: C.cream, borderRadius: 2,
        fontSize: 11, fontWeight: 700, fontFamily: fontTitle,
        letterSpacing: 4, marginBottom: 20
      }}>
        TYPE DISTRIBUTION
      </div>

      <h2 style={{ fontSize: 22, fontWeight: 800, fontFamily: fontTitle, color: C.ink, marginBottom: 8 }}>
        16 型人格分布
      </h2>

      <p style={{ fontSize: 13, color: C.inkLight, fontFamily: font, marginBottom: 24 }}>
        你是 <strong style={{ color: C.accent }}>{userType}</strong>
      </p>

      <Divider color={C.accent} />

      {loading ? (
        <p style={{ color: C.inkMuted, fontSize: 13, fontFamily: font, padding: "40px 0" }}>
          加载中...
        </p>
      ) : (
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8,
          textAlign: "left", marginTop: 20
        }}>
          {allTypes.map(([code, arch]) => {
            const count = distribution?.counts?.[code]?.count || 0;
            const pct = distribution?.total ? Math.round((count / distribution.total) * 100) : 0;
            const isMe = code === userType;
            return (
              <div key={code} style={{
                padding: "10px 14px", borderRadius: 4,
                background: isMe ? C.accent : C.cardBg,
                color: isMe ? "#fff" : C.ink,
                border: `1px solid ${isMe ? C.accent : C.border}`,
                transition: "all 0.2s",
                position: "relative"
              }}>
                <p style={{ fontSize: 12, fontWeight: 700, fontFamily: fontTitle, margin: 0 }}>
                  {code} {isMe && "← 你"}
                </p>
                <p style={{ fontSize: 11, margin: "2px 0 0", opacity: 0.8, fontFamily: font }}>
                  {arch.name}
                </p>
                {distribution?.total > 0 && (
                  <p style={{ fontSize: 10, margin: "4px 0 0", opacity: 0.6, fontFamily: font }}>
                    {count} 人 · {pct}%
                  </p>
                )}
              </div>
            );
          })}
          {distribution?.total > 0 && (
            <p style={{ gridColumn: "1 / -1", textAlign: "center", fontSize: 11, color: C.inkMuted, fontFamily: font, marginTop: 8 }}>
              共 {distribution.total} 人参与测评
            </p>
          )}
        </div>
      )}

      <button onClick={onBack} style={{
        marginTop: 24, padding: "12px 40px", background: C.navy, color: "#fff",
        fontSize: 14, fontWeight: 700, border: "none", borderRadius: 2,
        cursor: "pointer", fontFamily: fontTitle, letterSpacing: 1,
        boxShadow: `2px 2px 0 ${C.borderDark}`
      }}>
        返回我的结果
      </button>
    </div>
  );
}

// ========== 结果页 ==========
function ResultPage({ tally, challengeCount }) {
  const [showDist, setShowDist] = useState(false);
  const [saving, setSaving] = useState(false);
  const resultRef = useRef(null);

  const results = dimensions.map(d => {
    const aCount = tally[d.key]?.A || 0;
    const bCount = tally[d.key]?.B || 0;
    const leansA = aCount >= bCount;
    return {
      ...d, aCount, bCount, leansA,
      code: leansA ? d.poleA.code : d.poleB.code,
      activePole: leansA ? d.poleA : d.poleB
    };
  });

  const typeCode = results.map(r => r.code).join("");
  const archetype = archetypes[typeCode] || { name: "探索者", tagline: "你的组合独一无二" };
  const adviceList = getAdvice(results);
  const complementary = getComplementaryTypes(typeCode);

  const handleSaveImage = async () => {
    if (!resultRef.current || saving) return;
    setSaving(true);
    try {
      const dataUrl = await toPng(resultRef.current, {
        backgroundColor: C.cream,
        pixelRatio: 2,
        style: { padding: "40px 24px" }
      });
      const link = document.createElement("a");
      link.download = `AI协同16型-${archetype.name}-${typeCode}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error("Save image failed:", e);
    }
    setSaving(false);
  };

  if (showDist) {
    return <DistributionPage userType={typeCode} onBack={() => setShowDist(false)} />;
  }

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", textAlign: "center" }}>
      {/* 可保存区域 */}
      <div ref={resultRef} style={{ background: C.cream, paddingBottom: 20 }}>
        {/* 顶部标签 */}
        <div style={{
          display: "inline-block", padding: "6px 24px",
          background: C.navy, color: C.cream, borderRadius: 2,
          fontSize: 11, fontWeight: 700, fontFamily: fontTitle,
          letterSpacing: 4, marginBottom: 20
        }}>
          YOUR RESULT
        </div>

        {/* 四字代码 */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 16 }}>
          {results.map(r => (
            <div key={r.key} style={{
              width: 52, height: 52, borderRadius: 2,
              background: r.color, color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 24, fontFamily: fontTitle, fontWeight: 800,
              boxShadow: `2px 2px 0 ${r.deep}`
            }}>
              {r.code}
            </div>
          ))}
        </div>

        {/* 角色名 */}
        <h1 style={{
          fontSize: 28, fontWeight: 800, fontFamily: fontTitle,
          color: C.ink, marginBottom: 6, letterSpacing: 1
        }}>
          {archetype.name}
        </h1>

        {/* 破壁锤子数（tag 下方） */}
        {challengeCount > 0 && (
          <p style={{
            fontSize: 16, fontFamily: font, marginBottom: 4, lineHeight: 1.6
          }}>
            <span style={{ color: C.accent, fontWeight: 800, fontSize: 20 }}>{challengeCount}</span>
            <span style={{ color: C.inkLight }}> 把🔨的{archetype.name}</span>
          </p>
        )}
        <p style={{ fontSize: 14, color: C.inkLight, fontFamily: font, lineHeight: 1.8, marginBottom: 8 }}>
          {archetype.tagline}
        </p>

        <Divider color={C.accent} />

        {/* 四个维度：双向生长条 + 描述 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, textAlign: "left" }}>
          {results.map((r, idx) => (
            <FramedCard key={r.key} borderColor={r.color}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.ink, fontFamily: fontTitle, letterSpacing: 1 }}>
                  {r.name}
                </span>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: "3px 12px",
                  borderRadius: 2, background: r.color, color: "#fff", fontFamily: fontTitle
                }}>
                  {r.activePole.label}
                </span>
              </div>

              <DualGrowBar dim={r} aCount={r.aCount} bCount={r.bCount} />

              <p style={{ fontSize: 13, color: C.inkLight, lineHeight: 2, fontFamily: font, marginTop: 10 }}>
                {r.activePole.desc}
              </p>
            </FramedCard>
          ))}
        </div>

        {/* 破壁力 */}
        <WallBreakerScore challengeCount={challengeCount} />

        <Divider color={C.navy} />

        {/* 个性化建议 */}
        <FramedCard borderColor={C.accent} style={{ textAlign: "left" }}>
          <div style={{
            display: "inline-block", padding: "3px 14px",
            background: C.accent, color: "#fff", borderRadius: 2,
            fontSize: 11, fontWeight: 700, fontFamily: fontTitle,
            letterSpacing: 2, marginBottom: 14
          }}>
            你的人机共生策略
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {results.map((r, idx) => (
              <div key={r.key}>
                <p style={{ fontSize: 12, fontWeight: 700, color: r.deep, fontFamily: fontTitle, marginBottom: 4 }}>
                  {r.name}·{r.activePole.label}
                </p>
                <p style={{ fontSize: 13, color: C.inkLight, lineHeight: 2, fontFamily: font }}>
                  {adviceList[idx]}
                </p>
              </div>
            ))}
          </div>
        </FramedCard>

        {/* 互补类型推荐 */}
        <FramedCard borderColor={C.navy} style={{ marginTop: 20, textAlign: "center" }}>
          <div style={{
            display: "inline-block", padding: "3px 14px",
            background: C.navy, color: C.cream, borderRadius: 2,
            fontSize: 11, fontWeight: 700, fontFamily: fontTitle,
            letterSpacing: 2, marginBottom: 14
          }}>
            最佳互补
          </div>
          <div style={{
            display: "flex", justifyContent: "center", gap: 10,
            flexWrap: "wrap", marginBottom: 14
          }}>
            {complementary.map((ct, i) => (
              <div key={ct.code} style={{
                padding: "8px 16px", borderRadius: 2,
                border: `2px solid ${i === 0 ? C.accent : C.border}`,
                background: i === 0 ? C.accent : C.cardBg,
                color: i === 0 ? "#fff" : C.ink,
                boxShadow: i === 0 ? `2px 2px 0 ${C.navy}` : "none"
              }}>
                <p style={{ fontSize: 12, fontWeight: 700, fontFamily: fontTitle, margin: 0 }}>
                  {ct.code}
                </p>
                <p style={{ fontSize: 11, margin: "2px 0 0", fontFamily: font, opacity: 0.85 }}>
                  {ct.name}
                </p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 13, color: C.inkLight, fontFamily: font, lineHeight: 1.8, margin: 0 }}>
            <strong style={{ color: C.ink }}>{complementary.map(c => c.name).join("、")}</strong>
            <br />和我最互补相配，邀请朋友快来测一测他的匹配度。
          </p>
        </FramedCard>

        {/* 二维码 + 底部 */}
        <div style={{ marginTop: 24, textAlign: "center" }}>
          <QRCodeSVG value={SITE_URL} size={80} fgColor={C.navy} bgColor={C.cream} />
          <p style={{ fontSize: 10, color: C.inkMuted, fontFamily: font, marginTop: 6 }}>
            扫码测测你的 AI 协同人格
          </p>
        </div>

      </div>
      {/* /可保存区域 end */}

      {/* 操作按钮 */}
      <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 20, flexWrap: "wrap" }}>
        <button onClick={handleSaveImage} disabled={saving} style={{
          padding: "12px 32px", background: C.accent, color: "#fff",
          fontSize: 14, fontWeight: 700, border: "none", borderRadius: 2,
          cursor: saving ? "wait" : "pointer", fontFamily: fontTitle,
          letterSpacing: 1, boxShadow: `2px 2px 0 ${C.navy}`,
          opacity: saving ? 0.6 : 1
        }}>
          {saving ? "保存中..." : "📸 保存结果图片"}
        </button>

        <button onClick={() => setShowDist(true)} style={{
          padding: "12px 32px",
          background: C.cardBg, color: C.ink,
          fontSize: 14, fontWeight: 700, border: `2px solid ${C.navy}`,
          borderRadius: 2, cursor: "pointer", fontFamily: fontTitle,
          letterSpacing: 1, boxShadow: `2px 2px 0 ${C.border}`
        }}>
          看看其他人
        </button>
      </div>

      {/* 底部说明 */}
      <div style={{
        marginTop: 24, padding: "14px 20px", borderRadius: 2,
        background: C.paper, border: `1px solid ${C.border}`, textAlign: "center"
      }}>
        <p style={{ fontSize: 11, color: C.inkMuted, lineHeight: 2, fontFamily: font }}>
          这不是考试成绩。每个维度的两极都有独特力量——「锐」不比「宽」好，「宏」不比「实」高。<br />
          你的四字组合就是你在 AI 时代的独特坐标。
        </p>
      </div>
    </div>
  );
}

// ========== GitHub Footer ==========
function Footer() {
  return (
    <div style={{
      textAlign: "center", marginTop: 40, paddingTop: 20,
      borderTop: `1px solid ${C.border}`
    }}>
      <a
        href="https://github.com/isaac3203"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          color: C.inkMuted, fontSize: 12, fontFamily: font,
          textDecoration: "none", display: "inline-flex",
          alignItems: "center", gap: 6
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
        </svg>
        isaac3203 · 给个 Star
      </a>
    </div>
  );
}

// ========== 主组件 ==========
export default function FutureTalentQuiz() {
  const [started, setStarted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [tally, setTally] = useState({
    bias: { A: 0, B: 0 }, define: { A: 0, B: 0 },
    orchestrate: { A: 0, B: 0 }, resonate: { A: 0, B: 0 }
  });
  const [done, setDone] = useState(false);
  const [challengeCount, setChallengeCount] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [challenges, setChallenges] = useState([]);

  const handleAnswer = (pole) => {
    const q = questions[currentQ];
    setTally(prev => ({
      ...prev, [q.dim]: { ...prev[q.dim], [pole]: prev[q.dim][pole] + 1 }
    }));
    setAnswers(prev => [...prev, { questionIndex: currentQ, dim: q.dim, pole }]);

    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      setDone(true);
      // 计算最终结果并提交
      const finalTally = {
        ...tally, [q.dim]: { ...tally[q.dim], [pole]: tally[q.dim][pole] + 1 }
      };
      const finalResults = dimensions.map(d => {
        const aCount = finalTally[d.key]?.A || 0;
        const bCount = finalTally[d.key]?.B || 0;
        return aCount >= bCount ? d.poleA.code : d.poleB.code;
      });
      const typeCode = finalResults.join("");
      const arch = archetypes[typeCode] || { name: "探索者" };
      submitToSupabase({
        typeCode,
        archetypeName: arch.name,
        challengeCount,
        tally: finalTally,
        answers: [...answers, { questionIndex: currentQ, dim: q.dim, pole }],
        challenges,
      });
    }
  };

  const handleChallenge = (questionIndex, text) => {
    setChallengeCount(prev => prev + 1);
    const newChallenge = { questionIndex, text, timestamp: new Date().toISOString() };
    setChallenges(prev => [...prev, newChallenge]);
  };

  return (
    <div data-app-ready="true" style={{
      minHeight: "100vh", background: C.cream, color: C.ink,
      fontFamily: font, padding: "40px 24px",
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`,
    }}>
      <div style={{ maxWidth: 520, margin: "0 auto" }}>
        {!started && <WelcomePage onStart={() => setStarted(true)} />}
        {started && !done && (
          <QuestionCard
            question={questions[currentQ]}
            index={currentQ}
            total={questions.length}
            onAnswer={handleAnswer}
            onChallenge={handleChallenge}
          />
        )}
        {done && <ResultPage tally={tally} challengeCount={challengeCount} />}
        <Footer />
      </div>
    </div>
  );
}
