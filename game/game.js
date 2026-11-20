
/* ===================================================
       STATE & INITIAL DATA
       =================================================== */
let state = {
  user: {
    name: "ユーザー名",
    level: 1,
    exp: 0,
    maxExp: 100,
    apples: 0,
    coins: 0
  },

  inventory: [],
  // ログイン管理
  login: {
    firstLoginDate: null,
    lastLoginDate: null,
    loginStreak: 0,
    lastBonusDate: null,
    totalBonusCoins: 0
  },

  // 初回設定の管理
  tutorial: {
    completed: false,
    starterTreeSelected: false,
    starterAnimalSelected: false,
    starterTree: null,
    starterAnimal: null
  },

  // デイリー更新管理
  daily: {
    lastResetDate: null,
    correctAnswers: 0,
    rewardedMissions: [],
    rewardDate: null
  },

  // 🌱 初心者ミッション
  beginner: {
    completed: false,
    claimed: false,
    progress: {
      login: false,
      plan: false,
      quiz: false,
      garden: false
    }
  },

  missions: [
    { id: 1, title: "英語を30分勉強する", progress: "0/30分", done: false, rewardCoins: 50 },
    { id: 2, title: "問題を5問解く", progress: "0/5問", done: false, rewardCoins: 40 },
    { id: 3, title: "学習記録をつける", progress: "0/1回", done: false, rewardCoins: 30 }
  ],

  todayTasks: [],
  achievements: []
};

/* =========================================
   アチーブメント一覧
   ========================================= */

const ACHIEVEMENT_DATA = [
  // 📚 学習時間
  ["study_1", "はじめの一歩", "初めて学習を記録", "study", "bronze", 10],
  ["time_1", "1時間の挑戦", "累計1時間の学習", "time", "bronze", 20],
  ["time_3", "コツコツ学習者", "累計3時間の学習", "time", "silver", 30],
  ["time_5", "勉強の習慣", "累計5時間の学習", "time", "silver", 40],
  ["time_10", "時間の達人", "累計10時間の学習", "time", "gold", 70],

  // 📝 練習問題
  ["quiz_1", "初めての正解", "練習問題を1問正解", "study", "bronze", 10],
  ["quiz_5", "問題に挑戦！", "累計5問正解", "study", "bronze", 20],
  ["quiz_10", "小さな積み重ね", "累計10問正解", "study", "silver", 30],
  ["quiz_20", "問題好き", "累計20問正解", "study", "silver", 40],
  ["quiz_50", "問題マスター", "累計50問正解", "study", "gold", 70],
  ["quiz_75", "知識の探検家", "累計75問正解", "study", "gold", 90],
  ["quiz_100", "クイズ博士", "累計100問正解", "study", "gold", 100],

  // 🍎 収穫
  ["harvest_1", "はじめての収穫", "初めてリンゴを収穫", "harvest", "bronze", 20],
  ["harvest_5", "りんごいっぱい", "累計5個収穫", "harvest", "silver", 30],
  ["harvest_10", "収穫上手", "累計10個収穫", "harvest", "silver", 50],
  ["harvest_20", "果樹園の達人", "累計20個収穫", "harvest", "gold", 100],

  // 🎯 ミッション
  ["mission_1", "ミッション初心者", "初めてミッション達成", "mission", "bronze", 10],
  ["mission_daily", "今日も頑張った！", "デイリー全達成1回", "mission", "silver", 30],
  ["mission_3", "3日連続", "3日連続で学習ミッション達成", "mission", "silver", 50],
  ["mission_7", "1週間継続", "7日連続で学習ミッション達成", "mission", "gold", 100],

  // 📅 学習計画・テスト
  ["plan_1", "計画の第一歩", "初めて学習計画を作成", "plan", "bronze", 10],
  ["plan_done", "計画達成！", "初めて計画を完了", "plan", "silver", 30],
  ["plan_5", "計画上手", "累計5件の計画を完了", "plan", "gold", 70],
  ["test_3", "テスト記録の達人", "テスト結果を3回記録", "plan", "silver", 50],

  // 🛍️ ショップ
  ["shop_1", "はじめてのお買い物", "ショップで初めて購入", "shop", "bronze", 20],

  // 💎 条件公開のダイヤ
  ["diamond_moon", "月の達人", "1か月学習を継続", "diamond_moon_master", "diamond", 150],
  ["diamond_garden", "ガーデナー", "お庭にアイテムを10個配置", "diamond_gardener", "diamond", 150],
  ["diamond_coins", "富豪学者", "累計1000コイン獲得", "diamond_wealthy_scholar", "diamond", 200],
  
  
  // 🌱 初心者ミッション限定
  ["beginner_gardener","小さな庭師","初心者ミッションをすべて達成する","beginner_gardener","gold",0],


  // 💎 隠し実績
  ["secret_squirrel", "森の小さな友達", "アチーブメントを20個獲得", "diamond_squirrel", "diamond", 0, true, "リス"],
  ["secret_fox", "白銀のお客様", "アチーブメントを25個獲得", "diamond_white_fox", "diamond", 0, true, "白いキツネ"],
  ["secret_star", "星降る庭", "小さなドラゴンを手に入れる", "diamond_star_tree", "diamond", 0, true, "星の木の苗"],
  ["secret_dragon", "小さな竜の訪問", "テスト後にログインする", "diamond_dragon", "diamond", 0, true, "小さなドラゴン"],
  ["secret_lantern", "秘密の庭師", "ショップのものをすべて買う", "diamond_mushroom_lantern", "diamond", 0, true, "特別なキノコランタン"]
].map(([id, name, desc, motif, rank, coins, hidden = false, item = null]) => ({
  id,
  name,
  desc,
  rank,
  coins,
  hidden,
  item,
  image: `images/achievements/${
    rank === "diamond" ? motif : `${motif}_${rank}`
  }.png`,
  unlocked: false,
  claimed: false
}));

/* 保存済みの実績状態を引き継ぐ */
function syncAchievements() {
  const saved = Array.isArray(state.achievements)
    ? state.achievements
    : [];

  state.achievements = ACHIEVEMENT_DATA.map(a => {
    const old = saved.find(x => x.id === a.id);

    return {
      ...a,
      unlocked: old?.unlocked === true,
      claimed: old?.claimed === true
    };
  });
}

const shopCatalog = [
  // 🌳 木
  { id: "apple_tree", name: "りんごの木", price: 70, currency: "coin", image: "images/trees/apple.png", desc: "赤い実がなる木", type: "tree" },
  { id: "orange_tree", name: "オレンジの木", price: 70, currency: "coin", image: "images/trees/orange.png", desc: "元気なオレンジ色の実", type: "tree" },
  { id: "momiji", name: "もみじの木", price: 70, currency: "coin", image: "images/trees/maple.png", desc: "秋の彩りを添える木", type: "tree" },
  { id: "palm_tree", name: "ココナッツの木", price: 80, currency: "coin", image: "images/trees/palm.png", desc: "南国のかわいい木", type: "tree" },
  { id: "sakura", name: "さくらの木", price: 50, currency: "coin", image: "images/trees/sakura.png", desc: "春らしい綺麗な木", type: "tree" },
  { id: "wisteria", name: "ふじの木", price: 90, currency: "coin", image: "images/trees/wisteria.png", desc: "しだれる紫の花びら", type: "tree" },

  // 🌸 お花
  { id: "tulip", name: "チューリップ", price: 20, currency: "coin", image: "images/flowers/tulip.png", desc: "赤・白・黄色のお花", type: "flower" },
  { id: "cosmos", name: "コスモス", price: 20, currency: "coin", image: "images/flowers/cosmos.png", desc: "ピンクと白のお花", type: "flower" },
  { id: "sunflower", name: "ひまわり", price: 20, currency: "coin", image: "images/flowers/sunflower.png", desc: "オレンジ色の元気なお花", type: "flower" },
  { id: "aster", name: "アスター", price: 20, currency: "coin", image: "images/flowers/aster.png", desc: "紫と薄紫のお花", type: "flower" },
  { id: "pansy", name: "パンジー", price: 20, currency: "coin", image: "images/flowers/pansy.png", desc: "紫と黄色のお花", type: "flower" },
  { id: "lavender", name: "ラベンダー", price: 20, currency: "coin", image: "images/flowers/lavender.png", desc: "優しい紫のお花", type: "flower" },

  // 🪴 プランター
  { id: "planter_white", name: "白いプランター", price: 30, currency: "coin",image: "images/flowers/planter-white-front.png", desc: "白い木製プランター", type: "planter" },
  { id: "planter_brown", name: "茶色いプランター", price: 30, currency: "coin", image: "images/flowers/planter-brown-front.png", desc: "濃いブラウンの木製プランター", type: "planter" },

  // 🐶 動物
  { id: "dog", name: "柴犬", price: 100, currency: "coin", image: "images/animals/dog.png", desc: "ちょこんと座る柴犬", type: "animal" },
  { id: "cat", name: "猫", price: 100, currency: "coin", image: "images/animals/cat.png", desc: "もちもちの猫ちゃん", type: "animal" },
  { id: "rabbit", name: "たれ耳ウサギ", price: 100, currency: "coin", image: "images/animals/rabbit.png", desc: "ふわふわのたれ耳ちゃん", type: "animal" },
  { id: "bird", name: "小鳥", price: 80, currency: "coin", image: "images/animals/bird.png", desc: "小さな青い鳥", type: "animal" },

  // 🍄 小物
  { id: "birdhouse", name: "鳥の巣箱", price: 50, currency: "coin", image: "images/accessories/birdhouse.png", desc: "森の小さなお家", type: "decor" },
  { id: "watering_can", name: "じょうろ", price: 30, currency: "coin", image: "images/accessories/watering-can.png", desc: "お花のお世話に", type: "decor" },
  { id: "mushroom_lantern", name: "キノコランタン", price: 60, currency: "coin", image: "images/accessories/mushroom-lantern.png", desc: "優しく光るランタン", type: "decor" },
  { id: "pond", name: "小さな池", price: 80, currency: "coin", image: "images/accessories/pond.png", desc: "きらきらした小さな池", type: "decor" },
  { id: "picnic_sheet", name: "ピクニックシート", price: 50, currency: "coin", image: "images/accessories/picnic-sheet.png", desc: "のんびり休憩しよう", type: "decor" },
  { id: "stump", name: "切り株", price: 30, currency: "coin", image: "images/accessories/stump.png", desc: "森のかわいい切り株", type: "decor" },

  // 🍎 リンゴ限定
  { id: "upright_rabbit", name: "たち耳ウサギ", price: 10, currency: "apple", image: "images/animals/erect-eared-rabbit.png", desc: "リンゴでお迎えできる特別な子", type: "animal" }
];


    const quizzes = [
      {
        subject: "数学",
        question: "次の式を展開・計算しなさい。<br><b>(2x + 3)²</b>",
        options: ["2x² + 9", "4x² + 12x + 9", "4x² + 6x + 9", "2x² + 12x + 9"],
        answer: 1
      },
      {
        subject: "英語",
        question: "「私は毎日英語を勉強します」の正しい英文を選びなさい。",
        options: [
          "I study English every day.",
          "I studying English every day.",
          "I studied English every day.",
          "I am study English every day."
        ],
        answer: 0
      },
      {
        subject: "物理",
        question: "速度 $v$、時間 $t$ のとき、移動距離 $s$ を表す正しい公式は？",
        options: ["s = v / t", "s = v + t", "s = v × t", "s = v² × t"],
        answer: 2
      }
    ];

    let currentQuizIndex = 0;
    let quizAnswered = false;

/* ===================================================
   LOGIN BONUS（将来GAS連携しやすい構成）
   =================================================== */

// ★ 将来GASと連携するときは true に変更する
const USE_GAS_LOGIN_BONUS = true;

// 7日間の報酬コイン設定（すべて30コイン）
const LOGIN_BONUS_REWARDS = [30, 30, 30, 30, 30, 30, 100];

// state.login の不足プロパティを安全に補完
function ensureLoginState() {
  if (!state.login || typeof state.login !== "object") {
    state.login = {};
  }
  state.login.firstLoginDate = state.login.firstLoginDate ?? null;
  state.login.lastLoginDate = state.login.lastLoginDate ?? null;
  state.login.loginStreak = Number(state.login.loginStreak) || 0;
  state.login.lastBonusDate = state.login.lastBonusDate ?? null;
  state.login.totalBonusCoins = Number(state.login.totalBonusCoins) || 0;
}

// 昨日の日付文字列 (YYYY-MM-DD) を取得
function getGameYesterday() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * 1. ログインボーナス状態を取得する（データ取得層）
 * 将来GASと連携する際は、USE_GAS_LOGIN_BONUS = true にして
 * gameGasRequest("getLoginBonusStatus", { token }) の返り値を返すだけでOK
 */
async function fetchLoginBonusStatus() {
  if (USE_GAS_LOGIN_BONUS) {
    const token = localStorage.getItem("sessionToken");
    if (!token) return null;

    const result = await gameGasRequest("getLoginBonusStatus", { token });
    if (!result.success) return null;

    
return {
  canClaim: !result.alreadyClaimed,
  currentDay: Number(result.day) ||
    ((Number(result.streak) - 1) % 7) + 1,
  streak: Number(result.streak) || 1,
  rewards: Array.isArray(result.coinRewards)
    ? result.coinRewards
    : LOGIN_BONUS_REWARDS,
  appleRewards: Array.isArray(result.appleRewards)
    ? result.appleRewards
    : [0, 0, 0, 0, 0, 0, 3]
};

  }

  // --- ローカル保存（現在はこちらで動作） ---
  ensureLoginState();
  const today = getGameToday();
  const yesterday = getGameYesterday();

  const alreadyClaimed = state.login.lastBonusDate === today;

  let nextStreak = 1;
  if (alreadyClaimed) {
    nextStreak = Math.max(1, state.login.loginStreak);
  } else if (state.login.lastBonusDate === yesterday) {
    nextStreak = (state.login.loginStreak || 0) + 1;
  } else {
    // 初回または1日以上空いた場合は1日目から
    nextStreak = 1;
  }

  const currentDay = ((nextStreak - 1) % 7) + 1;

  return {
    canClaim: !alreadyClaimed,
    currentDay,
    streak: nextStreak,
    rewards: LOGIN_BONUS_REWARDS
  };
}

/**
 * 2. ログインボーナスを受け取る（確定・保存層）
 * 将来GASと連携する際は、gameGasRequest("claimLoginBonus", { token }) を呼ぶ
 */
async function executeClaimLoginBonus(bonusStatus) {
  const rewardCoins = bonusStatus.rewards[bonusStatus.currentDay - 1] ?? 30;

  if (USE_GAS_LOGIN_BONUS) {
    const token = localStorage.getItem("sessionToken");
    if (!token) throw new Error("ログイン情報がありません");

    const result = await gameGasRequest("claimLoginBonus", { token });
    if (!result.success) {
      throw new Error(result.message || "ログインボーナスの受け取りに失敗しました");
    }

  
    // GASが確定した報酬と残高を反映
    const rewardCoins = Number(result.coinBonus) || 0;
    const rewardApples = Number(result.appleBonus) || 0;

    if (typeof result.coins === "number") {
      state.user.coins = result.coins;
    }

    if (typeof result.apples === "number") {
      state.user.apples = result.apples;
    }

    state.login.loginStreak =
      Number(result.streak) || bonusStatus.streak;

    state.login.lastBonusDate = getGameToday();

    // ブラウザのデータだけ更新する
    // GASへの再保存はしない
    saveData();
    renderStatus();

    return {
      rewardCoins,
      rewardApples,
      streak: state.login.loginStreak
    };
}

  // --- ローカル保存（現在はこちらで動作） ---
  ensureLoginState();
  const today = getGameToday();

  if (!state.login.firstLoginDate) {
    state.login.firstLoginDate = today;
  }
  state.login.lastLoginDate = today;
  state.login.lastBonusDate = today;
  state.login.loginStreak = bonusStatus.streak;
  state.login.totalBonusCoins += rewardCoins;

  // コイン付与＆保存＆ステータスバー更新
  addReward(0, rewardCoins, 0);

  return {
    rewardCoins,
    streak: bonusStatus.streak
  };
}

let activeLoginBonusStatus = null;
let isClaimingLoginBonus = false;

/**
 * 3. 初回ログイン時に自動でモーダルを表示する
 */
async function checkAndShowLoginBonus() {
  // 初回チュートリアル（最初の住人・木選択）が未完了なら、完了後に表示する
  if (!state.tutorial?.completed) return;

  try {
    const status = await fetchLoginBonusStatus();
    if (!status || !status.canClaim) return;

    activeLoginBonusStatus = status;
    openLoginBonusModal(false);
  } catch (error) {
    console.error("ログインボーナス確認エラー:", error);
  }
}

/**
 * モーダルを開く（forceShow = true のときは受取済みでも閲覧用に開く）
 */
async function openLoginBonusModal(forceShow = false) {
  const modal = document.getElementById("login-bonus-modal");
  if (!modal) return;

  if (!activeLoginBonusStatus || forceShow) {
    activeLoginBonusStatus = await fetchLoginBonusStatus();
  }
  if (!activeLoginBonusStatus) return;

  renderLoginBonusCards(activeLoginBonusStatus, !activeLoginBonusStatus.canClaim);

  const btn = document.getElementById("login-bonus-claim-btn");
  if (btn) {
    const todayCoins =
      activeLoginBonusStatus.rewards[activeLoginBonusStatus.currentDay - 1] ?? 30;

    if (activeLoginBonusStatus.canClaim) {
      btn.disabled = false;
      btn.textContent =
  activeLoginBonusStatus.currentDay === 7
    ? "🎁 宝箱を受け取る！"
    : `🎁 ${todayCoins}コインをもらう！`;
    } else {
      btn.disabled = true;
      btn.textContent = "✨ 本日分は受け取り済みです ✨";
    }
  }

  modal.classList.remove("hidden");
}

function closeLoginBonusModal() {
  const modal = document.getElementById("login-bonus-modal");
  if (modal) modal.classList.add("hidden");
}

/**
 * 7日分のカード（上段4枚・下段3枚）を描画
 */
function renderLoginBonusCards(status, isTodayClaimed = false) {
  const grid = document.getElementById("login-bonus-grid");
  if (!grid) return;

  const makeCardHTML = (dayNum) => {
    const coins = status.rewards[dayNum - 1] ?? 30;
    const isPastClaimed = dayNum < status.currentDay;
    const isToday = dayNum === status.currentDay;
    const showCheck = isPastClaimed || (isToday && isTodayClaimed);

    let stateClass = "is-future";
    if (showCheck) {
      stateClass = "is-claimed";
    } else if (isToday) {
      stateClass = "is-today";
    }

    return `
      <div class="bonus-day-card ${stateClass}">
        ${isToday && !isTodayClaimed ? '<span class="bonus-today-tag">TODAY!</span>' : ""}
        <span class="bonus-day-badge">DAY${dayNum}</span>
        
<div class="bonus-coin-circle">
  <span>${dayNum === 7 ? "🎁" : "C"}</span>
  ${showCheck
    ? '<div class="bonus-check-mark">✔</div>'
    : ""}
</div>

<span class="text-[11px] font-black text-amber-950">
  ${dayNum === 7
    ? "100コイン＋🍎3個"
    : `${coins}コイン`}
</span>
</div>

`;
  };

  // 上段：DAY1〜DAY4（4列）
  const topRow = [1, 2, 3, 4].map(makeCardHTML).join("");
  // 下段：DAY5〜DAY7（中央寄せ3列）
  const bottomRow = [5, 6, 7].map(makeCardHTML).join("");

  grid.innerHTML = `
    <div class="grid grid-cols-4 gap-2">
      ${topRow}
    </div>
    <div class="grid grid-cols-3 gap-2 max-w-[78%] mx-auto">
      ${bottomRow}
    </div>
  `;
}

/**
 * 「もらう」ボタン押下時の処理
 */
async function handleClaimLoginBonus() {
  if (isClaimingLoginBonus || !activeLoginBonusStatus?.canClaim) return;

  isClaimingLoginBonus = true;
  const btn = document.getElementById("login-bonus-claim-btn");
  if (btn) btn.disabled = true;

  try {
    const result = await executeClaimLoginBonus(activeLoginBonusStatus);
    activeLoginBonusStatus.canClaim = false;

    // 今日のカードにチェックマークを付ける
    renderLoginBonusCards(activeLoginBonusStatus, true);

   const rewardMessage = result.rewardApples > 0
  ? `${result.rewardCoins}コイン＋🍎${result.rewardApples}個`
  : `${result.rewardCoins}コイン`;

if (btn) {
  btn.textContent = `🎉 ${rewardMessage}を獲得しました！`;
}

    // お知らせ欄にも履歴を追加
    addGameNotification(
      `login-bonus-${getGameToday()}`,
      `ログインボーナス（${result.streak}日目）`,
      `ログインボーナスとして ${rewardMessage}を獲得しました！`,
      "🎁"
    );

    // スタンプ演出を見せたあと自動で閉じる
    setTimeout(() => {
      closeLoginBonusModal();
    }, 1100);

  } catch (error) {
    console.error("ログインボーナス受取エラー:", error);
    alert(error.message || "受け取りに失敗しました");
    if (btn) btn.disabled = false;
  } finally {
    isClaimingLoginBonus = false;
  }
}


/* ===================================================
   GAS CONNECTION
   =================================================== */

// 通常モードの script.js と同じGAS URLを入れる
const GAME_GAS_URL = "https://script.google.com/macros/s/AKfycbz9957OLdGKzmxSg4BlTvh53HZsAYIW60CoecZbDetPemG04IDmYxKhpcey2x9m9FRl/exec";
// GASにリクエストを送信
async function gameGasRequest(action, data = {}) {
	const startTime = performance.now();
  const response = await fetch(GAME_GAS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify({
      action,
      ...data
    })
  });

  if (!response.ok) {
    throw new Error("GASとの通信に失敗しました");
  }

  const result = await response.json();

console.log(
    `GAS通信 ${action}: ${((performance.now() - startTime) / 1000).toFixed(2)}秒`
);

return result;
}

/* =========================================
   実績・ミッションをGASから取得
   ========================================= */
async function loadMissionAchievementsFromGAS() {
  const token = localStorage.getItem("sessionToken");

  if (!token) {
    console.warn("実績・ミッション：ログイン情報がありません");
    return null;
  }

  try {
    const result = await gameGasRequest(
      "loadMissionAchievements",
      { token }
    );

    if (!result.success) {
      throw new Error(
        result.message || "実績・ミッションの読み込みに失敗しました"
      );
    }

    const records = Array.isArray(result.records)
      ? result.records
      : [];

    console.log("GASから実績・ミッションを取得しました", records);

    return records;

  } catch (error) {
    console.error("実績・ミッションの読み込みエラー:", error);
    return null;
  }
}

/* =========================================
   一括読み込みの通信テスト
   ========================================= */
async function testGameBundle() {
  const token = localStorage.getItem("sessionToken");
  if (!token) return;

  try {
    const result = await gameGasRequest("loadGameBundle", { token });

    console.log("一括読み込みテスト結果:", result);

    if (!result.success) {
      console.error("一括読み込み失敗:", result.message);
      return;
    }

    console.log("一括読み込み成功！");
  } catch (error) {
    console.error("一括読み込み通信エラー:", error);
  }
}

/* =========================================
   ゲームデータの一括取得
   ========================================= */
async function loadGameBundleFromGAS(token) {
    const result = await gameGasRequest(
        "loadGameBundle",
        { token }
    );

    if (!result?.success) {
        throw new Error(
            result?.message || "一括読み込みに失敗しました"
        );
    }

    const keys = [
        "gameData",
        "inventory",
        "garden",
        "plan",
        "studyRecords",
        "studyAchievements",
        "missionAchievements"
    ];

    // 7種類のデータがすべて正常に返っているか確認
    for (const key of keys) {
        if (!result[key] || result[key].success !== true) {
            throw new Error(
                `${key} の取得に失敗しました`
            );
        }
    }

    console.log("ゲームデータ7種類の一括取得成功！");

    return result;
}

let normalStudyPlan = null;
let gamePlanVersion = null;


let gameStudyRecords = [];

let gamePlanAchievements = [];

async function loadGamePlanAchievements(bundledResult = null) {
  const token = localStorage.getItem("sessionToken");

  if (!token) return false;

  try {
    const result =bundledResult ?? await gameGasRequest("loadStudyAchievements", {
      token
    });

    if (!result.success) {
      throw new Error(result.message || "学習実績の読み込みに失敗しました");
    }

    gamePlanAchievements = Array.isArray(result.records)
      ? result.records
      : [];
      
// 🌱 初心者ミッション：学習計画達成
if (gamePlanAchievements.length > 0) {
    completeBeginnerMission("plan");
}

    console.log("計画完了の学習実績:", gamePlanAchievements);

    renderAchievements();
    renderMissions();
    updateGardenGrowth();
    return true;

  } catch (error) {
    console.error("計画実績の読み込みエラー:", error);
    return false;
  }
}


async function loadGameStudyRecords(bundledResult = null) {
  const token = localStorage.getItem("sessionToken");

  if (!token) {
    console.warn("学習記録：ログイン情報がありません");
    return false;
  }

  try {
    const result = bundledResult ?? await gameGasRequest("loadStudyRecords", {
      token
    });

    if (!result.success) {
      throw new Error(result.message || "読み込みに失敗しました");
    }

    gameStudyRecords = Array.isArray(result.records)
      ? result.records
      : [];

    console.log("学習記録を読み込みました", gameStudyRecords);

    renderTodaySchedule();
    renderMissions();
    updateGardenGrowth();
    return true;

  } catch (error) {
    console.error("学習記録の読み込みエラー:", error);
    return false;
  }
}


// 通常版の学習計画をGASから読み込む

async function loadNormalStudyPlan(bundledResult = null) {
    const token = localStorage.getItem("sessionToken");

    if (!token) {
        console.warn("ログイン情報がありません");
        return false;
    }

    try {
        const result = bundledResult ?? await gameGasRequest("loadPlan", { token });
        gamePlanVersion = result.planVersion ?? null;

        if (!result.success) {
            console.error("計画の読み込み失敗:", result.message);
            return false;
        }

        // 保存済みの計画がない場合
        if (!result.planJson) {
            console.log("保存済みの学習計画はありません");

            normalStudyPlan = { daysArray: [] };
            updateManualLogSubjects();

            renderMissions();
            renderTodaySchedule();
            renderCalendar();

            return true;
        }

        const plan = JSON.parse(result.planJson);

        if (!Array.isArray(plan.daysArray)) {
            console.error("学習計画の形式が正しくありません");
            return false;
        }

        normalStudyPlan = plan;
        updateManualLogSubjects();

        console.log("通常版の学習計画を読み込みました", plan);

        renderMissions();
        renderTodaySchedule();
        renderCalendar();

        return true;

    } catch (error) {
        console.error("学習計画の読み込みエラー:", error);
        return false;
    }
}

// ログイン状態の確認
async function checkGameLogin() {
  const token = localStorage.getItem("sessionToken");

  if (!token) {
    alert("ログインが必要です。通常モードからログインしてください。");
    backToNormalMode();
    return null;
  }

  const result = await gameGasRequest("checkSession", {
    token
  });

  if (!result.success) {
    alert("ログインの有効期限が切れています。");
    backToNormalMode();
    return null;
  }

  state.user.name = result.name;

  return token;
}


async function loadGameDataFromGAS(token, bundledResult = null) {
    const result = bundledResult ?? await gameGasRequest("loadGameData", { token });

    if (!result.success) {
        throw new Error(
            result.message || "ゲーム情報の読み込みに失敗しました"
        );
    }

    if (!result.found || !result.game) {
        console.log("GASにゲーム情報はまだありません");
        return false;
    }

    const game = result.game;

    state.user.level = game.level;
    state.user.exp = game.exp;
    state.user.maxExp = game.maxExp;
    state.user.coins = game.coins;
    state.user.apples = game.apples;

    state.tutorial.completed = game.tutorialCompleted;
    state.tutorial.starterAnimal = game.starterAnimal;
    state.tutorial.starterTree = game.starterTree;

    console.log("GASからゲーム情報を読み込みました");
    return true;
}


async function saveGameDataToGAS() {
    const token = localStorage.getItem("sessionToken");

    if (!token) {
        throw new Error("ログイン情報がありません");
    }

    const game = {
        level: state.user.level,
        exp: state.user.exp,
        maxExp: state.user.maxExp,
        coins: state.user.coins,
        apples: state.user.apples,
        tutorialCompleted: state.tutorial?.completed === true,
        starterAnimal: state.tutorial?.starterAnimal || "",
        starterTree: state.tutorial?.starterTree || "",
        displayName: state.user.name || ""
    };

    const result = await gameGasRequest("saveGameData", {
        token,
        game
    });

    if (!result.success) {
        throw new Error(
            result.message || "ゲーム情報の保存に失敗しました"
        );
    }

    console.log("GASへのゲーム情報保存成功！", game);
    return true;
}

/* =========================================
   所持アイテムをGASに保存
   ========================================= */


let inventorySaveQueue = Promise.resolve();

function saveGameInventoryToGAS() {
    // 保存を順番待ちにして、同時実行を防ぐ
    const saveTask = inventorySaveQueue
        .catch(() => {})
        .then(async () => {
            const token = localStorage.getItem("sessionToken");

            if (!token) {
                throw new Error("ログイン情報がありません");
            }

            const inventory = {};

            for (const item of state.inventory) {
                const count = Number(item.count);

                if (
                    typeof item.id === "string" &&
                    Number.isSafeInteger(count) &&
                    count > 0
                ) {
                    inventory[item.id] =
                        (inventory[item.id] || 0) + count;
                }
            }

            const result = await gameGasRequest(
                "saveGameInventory",
                { token, inventory }
            );

            if (!result.success) {
                throw new Error(
                    result.message || "持ち物の保存に失敗しました"
                );
            }

            console.log("持ち物をGASに保存しました");
            return true;
        });

    inventorySaveQueue = saveTask.catch(() => {});
    return saveTask;
}



/* =========================================
   所持アイテムをGASから読み込む
   ========================================= */

async function 	loadGameInventoryFromGAS(bundledResult = null) {
    const token = localStorage.getItem("sessionToken");

    if (!token) {
        throw new Error("ログイン情報がありません");
    }

    const result =bundledResult ?? await gameGasRequest(
        "loadGameInventory",
        { token }
    );

    if (!result.success) {
        throw new Error(
            result.message || "持ち物の読み込みに失敗しました"
        );
    }

    // GASに保存データがない場合は、
    // ブラウザにある持ち物をそのまま残す
    if (!result.found) {
        console.log("GASに持ち物データはまだありません");
        return false;
    }

    const inventory = result.inventory;

    if (
        !inventory ||
        typeof inventory !== "object" ||
        Array.isArray(inventory)
    ) {
        throw new Error("持ち物データの形式が正しくありません");
    }

    // GASのアイテムIDから、ゲーム用の配列を復元
    const loadedItems = [];

    for (const [itemId, rawCount] of Object.entries(inventory)) {
        const product = shopCatalog.find(
            item => item.id === itemId
        );

        const count = Number(rawCount);

        if (!product || !Number.isSafeInteger(count) || count <= 0) {
            continue;
        }

        loadedItems.push({
            id: product.id,
            name: product.name,
            type: product.type,
            count
        });
    }

    state.inventory = loadedItems;

    console.log("GASから持ち物を読み込みました");
    return true;
}


/* =========================================
   お庭の配置データをGASに保存
   ========================================= */

let gardenSaveQueue = Promise.resolve();

let gardenSyncReady = false;

let gardenSaveTimer = null;

function autoSaveGardenToGAS() {
    // 初期読み込み中は保存しない
    if (!gardenSyncReady) return;

    // 連続した保存要求を1回にまとめる
    clearTimeout(gardenSaveTimer);

    gardenSaveTimer = setTimeout(() => {
        saveGardenDataToGAS().catch(error => {
            console.error("お庭の自動保存エラー:", error);
            alert("お庭のGAS保存に失敗しました。");
        });
    }, 800);
}

function saveGardenDataToGAS() {
    const saveTask = gardenSaveQueue
        .catch(() => {})
        .then(async () => {
            const token = localStorage.getItem("sessionToken");

            if (!token) {
                throw new Error("ログイン情報がありません");
            }

            const placements = [];

            // 🌳 木：成長情報も保存
            gardenTrees.forEach(tree => {
                if (tree.slotIndex === null) return;

                placements.push({
                    placeId: `tree_${tree.slotIndex}`,
                    itemId: tree.id,
                    stage: tree.stage,
                    points: tree.growth
                });
            });

            // 🌸 花壇：花とプランターをまとめて保存
            Object.entries(gardenFlowerPlacements).forEach(
                ([slotIndex, placement]) => {
                    placements.push({
                        placeId: `flower_${slotIndex}`,
                        itemId: JSON.stringify(placement),
                        stage: 0,
                        points: 0
                    });
                }
            );

            // 🍄 小物
            Object.entries(gardenDecorPlacements).forEach(
                ([slotIndex, itemId]) => {
                    placements.push({
                        placeId: `decor_${slotIndex}`,
                        itemId,
                        stage: 0,
                        points: 0
                    });
                }
            );

            // 🐰 動物
            if (gardenAnimalPlacement) {
                placements.push({
                    placeId: "animal_7",
                    itemId: gardenAnimalPlacement,
                    stage: 0,
                    points: 0
                });
            }

            const result = await gameGasRequest(
                "saveGardenData",
                { token, placements }
            );

            if (!result.success) {
                throw new Error(
                    result.message || "お庭の保存に失敗しました"
                );
            }

            console.log("お庭データをGASに保存しました");
            return true;
        });

    gardenSaveQueue = saveTask.catch(() => {});
    return saveTask;
}


/* =========================================
   GASからお庭の配置データを読み込む
   ========================================= */

async function loadGardenDataFromGAS(bundledResult = null) {
    const token = localStorage.getItem("sessionToken");
    if (!token) throw new Error("ログイン情報がありません");

    const result = bundledResult ?? await gameGasRequest("loadGardenData", { token });

    if (!result.success) {
        throw new Error(
            result.message || "お庭の読み込みに失敗しました"
        );
    }

    // 初回はブラウザの配置を残す
    if (!result.found) {
        console.log("GASにお庭データはまだありません");
        return false;
    }

    if (!Array.isArray(result.placements)) {
        throw new Error("お庭データの形式が正しくありません");
    }

    // GASの配置を優先して復元
    gardenTrees.forEach(tree => {
        tree.slotIndex = null;
    });

    gardenFlowerPlacements = {};
    gardenDecorPlacements = {};
    gardenAnimalPlacement = null;

    for (const p of result.placements) {
        if (!p || typeof p.placeId !== "string") continue;

        const match = /^(tree|flower|decor)_(\d+)$/.exec(p.placeId);

        if (match) {
            const type = match[1];
            const slotIndex = Number(match[2]);

            if (gardenSlots[slotIndex]?.type !== type) continue;

            if (type === "tree") {
                const tree = gardenTrees.find(t => t.id === p.itemId);
                if (!tree) continue;

                tree.slotIndex = slotIndex;
                tree.stage = Math.max(1, Math.min(3, Number(p.stage) || 1));
                tree.growth = Math.max(0, Number(p.points) || 0);
            }

            if (type === "flower") {
                try {
                    const placement = JSON.parse(p.itemId);

                    if (
                        placement &&
                        Array.isArray(placement.flowers)
                    ) {
                        gardenFlowerPlacements[slotIndex] = {
                            flowers: placement.flowers,
                            planter: placement.planter || null
                        };
                    }
                } catch (error) {
                    console.warn("花壇データの復元失敗:", error);
                }
            }

            if (type === "decor") {
                gardenDecorPlacements[slotIndex] = p.itemId;
            }
        }

        if (p.placeId === "animal_7") {
            gardenAnimalPlacement = p.itemId;
        }
    }

    // 復元した配置をブラウザにも保存
    saveGardenPlacements();
    saveGardenFlowerPlacements();
    saveGardenDecorPlacements();
    saveGardenAnimalPlacement();

    console.log("GASからお庭を復元しました");
    return true;
}

    /* ===================================================
       INITIALIZATION
       =================================================== */



window.onload = async function() {
    try {
        // トークンを取得
        const token = localStorage.getItem("sessionToken");

        // ログイン情報がない場合は通常モードへ
        if (!token) {
            await checkGameLogin();
            return;
        }

        // ログイン確認と一括読み込みを同時開始
        const [loginResult, bundleResult] = await Promise.allSettled([
            checkGameLogin(),
            loadGameBundleFromGAS(token)
        ]);

        // ログイン確認が失敗した場合は終了
        if (
            loginResult.status !== "fulfilled" ||
            !loginResult.value
        ) {
            console.error("ログイン確認に失敗しました");
            return;
        }

        const loginName = state.user.name;

        // 一括取得が失敗した場合は個別読み込みへ
        const bundle = bundleResult.status === "fulfilled"
            ? bundleResult.value
            : null;

        if (!bundle) {
            console.warn(
                "一括取得失敗。個別読み込みに切り替えます:",
                bundleResult.reason
            );
        }

        loadSavedData();

        // 🌱 初心者ミッション：ログイン達成
        if (!state.beginner.progress.login) {
            state.beginner.progress.login = true;
            saveData();
        }


// GASに保存済みのゲーム情報があれば反映
await loadGameDataFromGAS(token, bundle?.gameData);

// 最初のログイン確認で取得した名前を保持
state.user.name = loginName;

syncAchievements();

// GASから持ち物を読み込む
const inventoryLoaded = await loadGameInventoryFromGAS(bundle?.inventory);

if (inventoryLoaded) {
    // 保存済みの持ち物を優先し、初期アイテムの二重配布を防ぐ
    state.tutorial.inventoryGranted = true;
    saveData();
}


// ③ ブラウザのお庭を読み込む
loadGardenPlacements();
loadGardenDecorPlacements();
loadGardenAnimalPlacement();
loadGardenFlowerPlacements();

// GASに保存済みのお庭があれば復元
const gardenLoaded = await loadGardenDataFromGAS(bundle?.garden);

// 初回のみ、ブラウザのお庭をGASに登録
if (!gardenLoaded) {
    const hasGarden =
        gardenTrees.some(tree => tree.slotIndex !== null) ||
        Object.keys(gardenFlowerPlacements).length > 0 ||
        Object.keys(gardenDecorPlacements).length > 0 ||
        gardenAnimalPlacement !== null;

    if (!hasGarden || confirm(
        "このブラウザのお庭をGASに保存しますか？\n" +
        "別の人のお庭が表示されている場合はキャンセルしてください。"
    )) {
        await saveGardenDataToGAS();
    }
}

        // ④ 初期アイテムを補完
        if (state.tutorial?.completed && !state.tutorial.inventoryGranted) {
            const animal = state.tutorial.starterAnimal;
            const tree = state.tutorial.starterTree;

            if (animal && !state.inventory.some(item => item.id === animal)) {
                addInventoryItem(animal);
            }

            const treeId = tree === "apple" ? "apple_tree" :
                (tree === "palm" || tree === "coconut") ? "palm_tree" : tree;

            if (treeId && !state.inventory.some(item => item.id === treeId)) {
                addInventoryItem(treeId);
            }

            state.tutorial.inventoryGranted = true;
            saveData();
        }

        // GASにまだ持ち物がない場合、初回保存を確認
        if (!inventoryLoaded) {
            const hasItems = state.inventory.some(
                item => Number(item.count) > 0
            );

            if (!hasItems || confirm(
                "このブラウザの持ち物を、ログイン中のアカウントに保存しますか？\n" +
                "別の人の持ち物が表示されている場合はキャンセルしてください。"
            )) {
                await saveGameInventoryToGAS();
            }
        }

        // ⑤ 画面を表示
        renderAll();

        // ⑥ 通常モードの学習データをGASから取得
        await Promise.all([
    loadNormalStudyPlan(bundle?.plan),
    loadGameStudyRecords(bundle?.studyRecords),
    loadGamePlanAchievements(bundle?.studyAchievements)
]);

		// 学習記録・成長情報の復元が終わったので自動保存を許可
			gardenSyncReady = true;
			
        // ⑦ 初回設定
        if (!state.tutorial?.completed) {
            document.getElementById("first-setup-modal")
                .classList.remove("hidden");
        }

        // ⑧ お知らせとログインボーナス
        initializeGameNotifications();
        await checkAndShowLoginBonus();
        
        // 日付が変わったらミッションを更新
        let lastMissionCheckDate = getGameToday();

        setInterval(() => {
            const today = getGameToday();

            if (today !== lastMissionCheckDate) {
                lastMissionCheckDate = today;

                
normalStudyPlan = null;

// 最新の学習計画をGASから取得する
loadNormalStudyPlan().then(success => {
    if (success) {
        renderMissions();
        renderTodaySchedule();
        renderCalendar();
    } else {
        console.warn("学習計画を取得できなかったため、ミッションの更新を保留しました");
    }
});


                console.log("日付が変わったのでミッションを更新しました");
            }
        }, 60000);


        console.log("ゲームモードの初期化が完了しました");

    } catch (error) {
        console.error("ゲームモード初期化エラー:", error);
        alert("ゲームモードの読み込み中にエラーが発生しました");
    }
};



    function renderAll() {
	renderStarterAnimal();
    renderStatus();
    renderMissions();
    renderGarden();
    renderCalendar();
    renderTodaySchedule();
    renderShop();
    renderAchievements();
    renderGameQuizSubjects();
}

    /* ===================================================
       TAB SWITCHING
       =================================================== */
    
function switchTab(tabName) {
    const tabs = ['home', 'garden', 'planner', 'shop', 'inventory', 'achievements', 'quiz'];

    tabs.forEach(t => {
        const view = document.getElementById(`view-${t}`);
        const btn = document.getElementById(`tab-${t}`);

        if (t === tabName) {
            view.classList.remove('hidden');
            btn.classList.add('active');
        } else {
            view.classList.add('hidden');
            btn.classList.remove('active');
        }
    });

    // もちもの画面を開いたら一覧を更新
    if (tabName === 'inventory') {
        renderInventory();
    }
   
    // お庭を開いたら、今日の訪問を記録する
    if (tabName === 'garden') {
		
		// 🌱 初心者ミッション：お庭を確認
		completeBeginnerMission("garden");

        const today = getGameToday();

        resetDailyMissionsIfNeeded();

        if (state.daily.gardenVisitedDate !== today) {
            state.daily.gardenVisitedDate = today;
            saveData();
        }

        renderMissions();
    }

}

    /* ===================================================
       RENDER FUNCTIONS
       =================================================== */
       
function renderStarterAnimal() {
    const animal = state.tutorial?.starterAnimal || "rabbit";

    const animalImages = {
        dog: "images/animals/dog.png",
        cat: "images/animals/cat.png",
        rabbit: "images/animals/rabbit.png"
    };

    const imagePath = animalImages[animal] || animalImages.rabbit;

    const userIcon = document.getElementById("user-animal-icon");
    const homeIcon = document.getElementById("home-animal-icon");

    if (userIcon) userIcon.src = imagePath;
    if (homeIcon) homeIcon.src = imagePath;
}

    function renderStatus() {
      document.getElementById('user-name').innerText = state.user.name;
      document.getElementById('user-level').innerText = state.user.level;
      document.querySelectorAll('.quiz-lv-text').forEach(e => e.innerText = state.user.level);
      document.getElementById('apple-count').innerText = state.user.apples;
      document.getElementById('coin-count').innerText = state.user.coins;

      const expPct = Math.min(100, Math.floor((state.user.exp / state.user.maxExp) * 100));
      document.getElementById('exp-bar-inner').style.width = expPct + '%';
      document.getElementById('exp-text').innerText = `${state.user.exp} / ${state.user.maxExp}`;
    }

    function addReward(expGained, coinsGained, applesGained = 0) {
      state.user.exp += expGained;
      state.user.coins += coinsGained;
      state.user.apples += applesGained;

      if (state.user.exp >= state.user.maxExp) {
        state.user.level += 1;
        state.user.exp -= state.user.maxExp;
        state.user.maxExp = Math.floor(state.user.maxExp * 1.2);
        alert(`🎉 レベルアップ！ Lv.${state.user.level} になりました！`);
      }
     saveData();
renderStatus();

saveGameDataToGAS().catch(error => {
    console.error("ゲーム情報の自動保存に失敗しました:", error);
});
    }

    /* --- HOME: MISSIONS --- */
    
    
/* =========================================
   🌱 初心者ミッション
   ========================================= */

function completeBeginnerMission(type) {
    if (!state.beginner?.progress) return;
    if (!(type in state.beginner.progress)) return;
    if (state.beginner.progress[type]) return;

    state.beginner.progress[type] = true;
    saveData();

    renderBeginnerMissions();
}

function checkBeginnerCompletion() {
    const beginner = state.beginner;
    if (!beginner?.progress) return;

    const allDone = [
        "login", "plan", "quiz", "garden"
    ].every(key => beginner.progress[key] === true);

    if (!allDone || beginner.completed) return;

    beginner.completed = true;

    const achievement = state.achievements.find(
        a => a.id === "beginner_gardener"
    );

    if (achievement && !achievement.unlocked) {
        achievement.unlocked = true;
    }

    saveData();

    addGameNotification(
        "beginner-gardener-complete",
        "初心者ミッション達成！",
        "限定アチーブメント「小さな庭師」を獲得しました！",
        "🌱"
    );

    renderAchievements();
}

function renderBeginnerMissions() {
    const dailyList = document.getElementById(
        "daily-missions-list"
    );

    if (!dailyList || !state.beginner?.progress) return;

    let container = document.getElementById(
        "beginner-missions-section"
    );

    if (!container) {
        container = document.createElement("section");
        container.id = "beginner-missions-section";
        container.className = "mt-5";

        dailyList.insertAdjacentElement(
            "afterend", container
        );
    }

    const progress = state.beginner.progress;

    const missions = [
        ["login", "ゲームモードにログインする"],
        ["plan", "学習計画を1回達成する"],
        ["quiz", "練習問題を3問解く"],
        ["garden", "お庭で木の成長を確認する"]
    ];

    const completedCount = missions.filter(
        ([key]) => progress[key]
    ).length;

    container.innerHTML = `
        <div class="bg-emerald-50 border-2 border-emerald-300 rounded-xl p-4">
            <h3 class="font-black text-emerald-900 mb-2">
                🌱 初心者ミッション
                <span class="text-sm">
                    ${completedCount}/4
                </span>
            </h3>

            <div class="space-y-2">
                ${missions.map(([key, title]) => `
                    <div class="flex items-center gap-2 bg-white rounded-lg p-2">
                        <input
                            type="checkbox"
                            disabled
                            ${progress[key] ? "checked" : ""}
                            class="accent-emerald-500"
                        >
                        <span class="text-sm font-bold ${
                            progress[key]
                                ? "line-through text-slate-400"
                                : "text-emerald-950"
                        }">
                            ${title}
                        </span>
                    </div>
                `).join("")}
            </div>

            <p class="mt-3 text-xs font-bold text-emerald-800">
                ${
                    state.beginner.completed
                        ? "🎉 全ミッション達成！「小さな庭師」獲得！"
                        : "🎁 全達成で限定アチーブメント「小さな庭師」"
                }
            </p>
        </div>
    `;

    checkBeginnerCompletion();
}

function getGameToday() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}



function resetDailyMissionsIfNeeded() {
    const today = getGameToday();

    if (!state.daily) state.daily = {};

    // 日付が変わったら進捗と受取履歴をリセット
    if (state.daily.lastResetDate !== today) {
        state.daily.correctAnswers = 0;
        state.daily.rewardedMissions = [];
        state.daily.rewardDate = today;
        state.daily.lastResetDate = today;
        state.daily.missionDate = null;
        saveData();
    }

    // 学習計画が読み込まれるまでは生成しない
    if (!normalStudyPlan) return;

    // 同じ日に生成済みなら変更しない
    if (state.daily.missionDate === today) return;

    const todayPlan = normalStudyPlan.daysArray.find(
        day => day.dateStr === today
    );

    const tasks = Array.isArray(todayPlan?.tasks)
        ? todayPlan.tasks.filter(task => task.subject)
        : [];

    // お庭ミッションは毎日ある
    const missions = [{
        id: 4,
        title: "お庭を見に行く",
        progress: "0/1回",
        done: false,
        rewardCoins: 20
    }];

    if (tasks.length > 0) {
        // 計画からランダムに1科目選ぶ
        const selected = tasks[
            Math.floor(Math.random() * tasks.length)
        ];

        // 計画の時間を取得
        const minutes = Number.parseInt(
            String(selected.time ?? selected.minutes ?? "60"),
            10
        );

        const targetMinutes =
            Number.isFinite(minutes) && minutes > 0
                ? minutes
                : 60;

        // 問題数は5〜10問
        const questionCount =
            Math.floor(Math.random() * 6) + 5;

        missions.unshift(
            {
                id: 1,
                title: `${selected.subject}を${targetMinutes}分勉強する`,
                subject: selected.subject,
                targetMinutes,
                progress: `0/${targetMinutes}分`,
                done: false,
                rewardCoins: 50
            },
            {
                id: 2,
                title: `問題を${questionCount}問解く`,
                targetCount: questionCount,
                progress: `0/${questionCount}問`,
                done: false,
                rewardCoins: 40
            },
            {
                id: 3,
                title: "学習記録を1件つける",
                progress: "0/1回",
                done: false,
                rewardCoins: 30
            }
        );
    }

    state.missions = missions;
    state.daily.missionDate = today;
    saveData();
}




function updateDailyMissionProgress() {
    resetDailyMissionsIfNeeded();

    const today = getGameToday();

    
const manualRecords = gameStudyRecords.filter(
    record => record.date === today
);

const planRecords = gamePlanAchievements.filter(
    record => record.date === today
);

// 同じ科目が両方にある場合は、
// 二重計上を避けるため多い方の時間を採用する
function getStudiedMinutes(subject) {
    const sumMinutes = records => records
        .filter(record => String(record.subject || "") === subject)
        .reduce(
            (sum, record) => sum + (Number(record.minutes) || 0),
            0
        );

    return Math.max(
        sumMinutes(manualRecords),
        sumMinutes(planRecords)
    );
}


    const studyRecordCount = gameStudyRecords.filter(
        record => record.date === today
    ).length;

    const correctAnswers =
        Number(state.daily.correctAnswers) || 0;

    state.missions.forEach(m => {

        // ① 選ばれた科目の学習時間
        
if (m.id === 1) {
    const target = Number(m.targetMinutes) || 60;

    const studiedMinutes = getStudiedMinutes(String(m.subject));

    m.progress =
        `${Math.min(studiedMinutes, target)}/${target}分`;

    m.done = studiedMinutes >= target;
}


        // ② 問題を指定数解く
        if (m.id === 2) {
            const target = Number(m.targetCount) || 5;

            m.progress =
                `${Math.min(correctAnswers, target)}/${target}問`;

            m.done = correctAnswers >= target;
        }

        // ③ 学習記録を1件つける
        if (m.id === 3) {
            m.progress =
                `${Math.min(studyRecordCount, 1)}/1回`;

            m.done = studyRecordCount >= 1;
        }

        // ④ お庭を見に行く
        if (m.id === 4) {
            const visited =
                state.daily.gardenVisitedDate === today;

            m.progress = visited ? "1/1回" : "0/1回";
            m.done = visited;
        }
    });
}


function renderMissions() {
	  updateDailyMissionProgress();
  const container = document.getElementById('daily-missions-list');

  container.innerHTML = state.missions.map(m => `
    <li class="flex items-center justify-between bg-white p-2.5 rounded-lg border border-amber-200">
      <div class="flex items-center gap-2">

        <input
          type="checkbox"
          disabled
          ${m.done ? 'checked' : ''}
          class="w-4 h-4 accent-emerald-500 rounded"
        >

        <span class="${m.done ? 'line-through text-slate-400 font-bold' : 'font-bold text-amber-950'}">
          ${m.title}
        </span>

      </div>

      <div class="flex items-center gap-2">
        <span class="text-xs text-amber-600 font-bold">
          ${m.progress}
        </span>

        <span class="bg-amber-100 text-amber-900 text-[10px] px-1.5 py-0.5 rounded border border-amber-300 font-bold"> 
			+${m.rewardCoins} <i class="fa-solid fa-coins"></i>
        </span>
      </div>
    </li>
  `).join('');
    // 🌱 初心者ミッションも表示
  renderBeginnerMissions();
}


    function toggleMission(id) {
      const m = state.missions.find(x => x.id === id);
      if (m && !m.done) {
        m.done = true;
        addReward(30, m.rewardCoins);
        renderMissions();
      }
    }

    
function completeAllMissions() {
  updateDailyMissionProgress();

  const today = getGameToday();

  if (state.daily.rewardDate !== today) {
    state.daily.rewardedMissions = [];
    state.daily.rewardDate = today;
  }

  const claimed = state.daily.rewardedMissions || [];

  const rewards = state.missions.filter(
    m => m.done && !claimed.includes(m.id)
  );

  if (rewards.length === 0) {
    alert("🎁 受け取れる報酬はまだないよ！");
    return;
  }

  const coins = rewards.reduce(
    (sum, m) => sum + m.rewardCoins, 0
  );

  const exp = rewards.length * 30;

  const message = rewards.map(
    m => `✅ ${m.title}：${m.rewardCoins}コイン`
  ).join("\n");

  rewards.forEach(m => {
    claimed.push(m.id);
  });

  state.daily.rewardedMissions = claimed;
  saveData();

  addReward(exp, coins);

  alert(
    "🎁 ミッション報酬を受け取りました！\n\n" +
    message +
    `\n\n合計：${coins}コイン ＋ ${exp} EXP`
  );

  renderMissions();
}


    /* --- GARDEN VIEW --- */

let isGardenEditing = false;

// 配置場所（位置はお庭の横幅・高さに対する％）
const gardenSlots = [
    // 木：3か所
    { type: 'tree', x: 19, y: 30 },
    { type: 'tree', x: 51, y: 25 },
    { type: 'tree', x: 77, y: 30 },

 // 花壇：2か所（それぞれお花を2種類選べる）
{ type: 'flower', x: 18, y: 55 },
{ type: 'flower', x: 76, y: 55 },

    // 小物：2か所
    { type: 'decor', x: 28, y: 82 },
    { type: 'decor', x: 82, y: 77 },

    // 動物：1か所
    { type: 'animal', x: 57, y: 83 }
];


/* ===== 花壇の配置データ ===== */

const GARDEN_FLOWER_KEY = 'garden_flower_placements';

// 花壇ごとに、花2種類とプランター1種類を保存
let gardenFlowerPlacements = {};

// 保存した花壇を読み込む
function loadGardenFlowerPlacements() {
    try {
        const saved = localStorage.getItem(GARDEN_FLOWER_KEY);

        gardenFlowerPlacements = saved
            ? JSON.parse(saved)
            : {};
    } catch (error) {
        console.error('花壇の配置データを読み込めませんでした', error);
        gardenFlowerPlacements = {};
    }
}

// 花壇の配置を保存する
function saveGardenFlowerPlacements() {
    localStorage.setItem(
        GARDEN_FLOWER_KEY,
        JSON.stringify(gardenFlowerPlacements)
    );
    autoSaveGardenToGAS();
}

/* ===== 動物の配置データ ===== */

const GARDEN_ANIMAL_KEY = 'garden_animal_placement';

// 動物は1か所だけ
let gardenAnimalPlacement = null;

// 保存した動物を読み込む
function loadGardenAnimalPlacement() {
    try {
        const saved = localStorage.getItem(GARDEN_ANIMAL_KEY);
        gardenAnimalPlacement = saved || null;
    } catch (error) {
        console.error('動物の配置データを読み込めませんでした', error);
        gardenAnimalPlacement = null;
    }
}

// 動物の配置を保存する
function saveGardenAnimalPlacement() {
    if (gardenAnimalPlacement) {
        localStorage.setItem(
            GARDEN_ANIMAL_KEY,
            gardenAnimalPlacement
        );
    } else {
        localStorage.removeItem(GARDEN_ANIMAL_KEY);
    }
    autoSaveGardenToGAS();
}

/* ===== 小物の配置データ ===== */

const GARDEN_DECOR_KEY = 'garden_decor_placements';

// 小物1・小物2に何を置いているか
let gardenDecorPlacements = {};

// 保存済みの配置を読み込む
function loadGardenDecorPlacements() {
    try {
        const saved = localStorage.getItem(GARDEN_DECOR_KEY);
        gardenDecorPlacements = saved ? JSON.parse(saved) : {};
    } catch (error) {
        console.error('小物の配置データを読み込めませんでした', error);
        gardenDecorPlacements = {};
    }
}

// 小物の配置を保存する
function saveGardenDecorPlacements() {
    localStorage.setItem(
        GARDEN_DECOR_KEY,
        JSON.stringify(gardenDecorPlacements)
    );
    autoSaveGardenToGAS();
}

function toggleGardenEdit() {
    isGardenEditing = !isGardenEditing;

    const button = document.getElementById('garden-edit-btn');
    const status = document.getElementById('garden-edit-status');
    const garden = document.getElementById('garden-canvas');

    if (isGardenEditing) {
        button.innerHTML = '<i class="fa-solid fa-check"></i> 模様替え終了';
        status.classList.remove('hidden');
        garden.classList.add('garden-editing');
    } else {
        button.innerHTML = '<i class="fa-solid fa-paintbrush"></i> 模様替え';
        status.classList.add('hidden');
        saveGardenPlacements();
        garden.classList.remove('garden-editing');
        closeGardenPanel();
    }

    renderGarden();
}
// お庭のアイテム選択パネルを開く

function openGardenPanel(slotIndex) {

    const slot = gardenSlots[slotIndex];
    if (!slot) return;

    // 小物の配置場所なら専用パネルを開く
    if (slot.type === 'decor') {
        openDecorGardenPanel(slotIndex);
        return;
    }
    // 動物の配置場所なら専用パネルを開く
    if (slot.type === 'animal') {
        openAnimalGardenPanel(slotIndex);
        return;
    }
    
    // 花壇の配置場所なら専用パネルを開く
	if (slot.type === 'flower') {
		openFlowerGardenPanel(slotIndex);
		return;
	}


    // 木の配置処理は今までどおり
    if (slot.type !== 'tree') return;
    
    const panel = document.getElementById('garden-item-panel');

    const title = document.getElementById('garden-panel-title');
    const items = document.getElementById('garden-panel-items');

   const treeNumber = gardenSlots
    .slice(0, slotIndex + 1)
    .filter(slot => slot.type === 'tree').length;

title.textContent = `木${treeNumber}を設定`;
    items.innerHTML = '';

// この場所に植わっている木を探す
const currentTree = gardenTrees.find(tree =>
    tree.slotIndex === slotIndex
);

if (currentTree) {
    // 現在の配置情報
    const currentInfo = document.createElement('div');
    currentInfo.className =
        'bg-green-50 border-2 border-green-300 rounded-xl p-3 mb-3';

    currentInfo.innerHTML = `
        <div class="font-bold text-green-900 text-sm mb-1">
            🌱 現在の配置
        </div>
        <div class="text-xs text-green-800">
            ${currentTree.name}・成長中（木${treeNumber}）
        </div>
    `;

    items.appendChild(currentInfo);

    // 配置を外すボタン
    const removeButton = document.createElement('button');

    removeButton.type = 'button';
    removeButton.className =
        'w-full bg-amber-100 hover:bg-amber-200 ' +
        'border-2 border-amber-400 rounded-xl ' +
        'py-2 mb-3 text-sm font-bold text-amber-900';

    removeButton.textContent = '↩ 配置を外す';

removeButton.addEventListener('click', () => {
  currentTree.slotIndex = null;

  saveGardenPlacements();
  closeGardenPanel();
  renderGarden();
});

    items.appendChild(removeButton);
}
    // 所持している木を表示
    state.inventory
        .filter(item => item.type === 'tree' && item.count > 0)
        .forEach(item => {
            const button = document.createElement('button');

            button.type = 'button';
            button.className = 'garden-item-choice';

const product = shopCatalog.find(p => p.id === item.id);

const image = document.createElement('img');
image.src = product?.image || '';
image.alt = product?.name || item.name;
image.className = 'garden-choice-image';

            const info = document.createElement('div');

            const name = document.createElement('div');
            name.className = 'garden-choice-name';
            name.textContent = item.name;

            const count = document.createElement('div');
            count.className = 'garden-choice-count';
           const plantedTree = gardenTrees.find(tree =>
    tree.name === item.name && tree.slotIndex !== null
);

if (plantedTree) {
	if (plantedTree.slotIndex === slotIndex) {
    button.classList.add('garden-choice-selected');
}
    const plantedSlot = gardenSlots
        .slice(0, plantedTree.slotIndex + 1)
        .filter(slot => slot.type === 'tree').length;

    count.textContent =
        `所持 ${item.count}本・木${plantedSlot}で成長中`;

    count.classList.add('planted');

} else {
    count.textContent = `所持 ${item.count}本・未配置`;

    count.classList.add('not-planted');
}

            info.appendChild(name);
            info.appendChild(count);

            button.appendChild(image);
            button.appendChild(info);

            // 配置機能は次に追加する
button.addEventListener('click', () => {
  const tree = gardenTrees.find(t => t.name === item.name);

  if (!tree) {
    alert('この木はまだ配置に対応していません');
    return;
  }

  const occupyingTree = gardenTrees.find(t =>
    t.slotIndex === slotIndex && t.id !== tree.id
  );

  if (occupyingTree) {
    alert('この場所には別の木があります。先に配置を外してね！');
    return;
  }

  // 同じ種類の木を複数持っていても、今回は1本だけ配置
  tree.slotIndex = slotIndex;

  saveGardenPlacements();
  closeGardenPanel();
  renderGarden();
});

            items.appendChild(button);
        });

    panel.classList.remove('hidden');
	}


/* ===== 花壇の設定パネル ===== */

function openFlowerGardenPanel(slotIndex) {
    const panel = document.getElementById('garden-item-panel');
    const title = document.getElementById('garden-panel-title');
    const items = document.getElementById('garden-panel-items');

    if (!panel || !title || !items) return;

    const flowerNumber = gardenSlots
        .slice(0, slotIndex + 1)
        .filter(slot => slot.type === 'flower').length;

    title.textContent = `花壇${flowerNumber}を設定`;
    items.innerHTML = '';

    // この花壇の現在の配置
    const placement = gardenFlowerPlacements[slotIndex] || {
        flowers: [],
        planter: null
    };

    const selectedFlowers = Array.isArray(placement.flowers)
        ? placement.flowers
        : [];

    // 保存と画面更新
    function updateFlowerPlacement() {
        gardenFlowerPlacements[slotIndex] = {
            flowers: [...selectedFlowers],
            planter: placement.planter || null
        };

        saveGardenFlowerPlacements();
        renderGarden();
        openFlowerGardenPanel(slotIndex);
    }

// ===== 現在配置しているお花 =====
if (selectedFlowers.length > 0) {

    const currentInfo = document.createElement('div');
    currentInfo.className =
        'bg-green-50 border-2 border-green-300 rounded-xl p-3 mb-3';

    const heading = document.createElement('div');
    heading.className = 'font-bold text-green-900 text-sm mb-2';
    heading.textContent = '🌷 現在の配置';
    currentInfo.appendChild(heading);

    selectedFlowers.forEach((flowerId, index) => {
        const product = shopCatalog.find(p => p.id === flowerId);

        const row = document.createElement('div');
        row.className = 'text-xs text-green-800 mb-1';
        row.textContent =
            `${index === 0 ? '左' : '右'}：${product?.name || 'お花'}`;

        currentInfo.appendChild(row);
    });

    items.appendChild(currentInfo);

    // 左・右のお花を個別に解除
    selectedFlowers.forEach((flowerId, index) => {

        const removeButton = document.createElement('button');
        removeButton.type = 'button';

        removeButton.className =
            'w-full bg-amber-100 hover:bg-amber-200 ' +
            'border-2 border-amber-400 rounded-xl ' +
            'p-3 mb-2 font-bold text-amber-900';

        removeButton.textContent =
            `↩ ${index === 0 ? '左' : '右'}のお花を外す`;

        removeButton.addEventListener('click', () => {
            selectedFlowers.splice(index, 1);
            updateFlowerPlacement();
        });

        items.appendChild(removeButton);
    });
}

    function addHeading(text, iconPath = null) {
        const heading = document.createElement('div');
        heading.className = 'garden-flower-heading';

        if (iconPath) {
            const icon = document.createElement('img');
            icon.src = iconPath;
            icon.alt = '';
            icon.className = 'garden-heading-icon';
            heading.appendChild(icon);
        }

        const label = document.createElement('span');
        label.textContent = text;
        heading.appendChild(label);

        items.appendChild(heading);
    }

    function addChoices(type) {
        const owned = state.inventory.filter(item => {
            const product = shopCatalog.find(p => p.id === item.id);

            return product?.type === type &&
                Number(item.count) > 0;
        });

        if (owned.length === 0) {
            const message = document.createElement('p');
            message.className = 'garden-panel-description';
            message.textContent = type === 'flower'
                ? 'まだお花を持っていないよ。ショップで購入してね！'
                : 'まだプランターを持っていないよ。ショップで購入してね！';

            items.appendChild(message);
            return;
        }

        owned.forEach(item => {
            const product = shopCatalog.find(p => p.id === item.id);
            if (!product) return;

            const selected = type === 'flower'
                ? selectedFlowers.includes(item.id)
                : placement.planter === item.id;

            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'garden-item-choice';

            if (selected) {
                button.classList.add('garden-choice-selected');
            }

            const image = document.createElement('img');
            image.src = product.image;
            image.alt = product.name;
            image.className = 'garden-choice-image';

            const info = document.createElement('div');

            const name = document.createElement('div');
            name.className = 'garden-choice-name';
            name.textContent = product.name;

            const count = document.createElement('div');
            count.className = 'garden-choice-count';
            count.textContent =
                `所持 ${item.count}個${selected ? '・配置中' : ''}`;

            info.appendChild(name);
            info.appendChild(count);

            button.appendChild(image);
            button.appendChild(info);

            button.addEventListener('click', () => {
if (type === 'flower') {
    const usedHere = selectedFlowers.filter(
        id => id === item.id
    ).length;

    // 他の花壇で使用している数
    const usedElsewhere = Object.entries(
        gardenFlowerPlacements
    ).reduce((total, [index, data]) => {
        if (Number(index) === slotIndex) return total;

        return total + (data.flowers || []).filter(
            id => id === item.id
        ).length;
    }, 0);

    if (usedHere > 0 && (
        selectedFlowers.length >= 2 ||
        usedHere + usedElsewhere >= Number(item.count)
    )) {
        // もう一度押すと、この種類のお花を取り外す
        for (let i = selectedFlowers.length - 1; i >= 0; i--) {
            if (selectedFlowers[i] === item.id) {
                selectedFlowers.splice(i, 1);
            }
        }
    } else {
        if (selectedFlowers.length >= 2) {
            alert('お花は1つの花壇に2つまでだよ！');
            return;
        }

        if (usedHere + usedElsewhere >= Number(item.count)) {
            alert('このお花はすべて配置済みだよ！');
            return;
        }

        selectedFlowers.push(item.id);
  }
                } else {
                    if (selected) {
                        placement.planter = null;
                    } else {
                        const usedElsewhere = Object.entries(
                            gardenFlowerPlacements
                        ).filter(([index, data]) =>
                            Number(index) !== slotIndex &&
                            data.planter === item.id
                        ).length;

                        if (usedElsewhere >= Number(item.count)) {
                            alert('このプランターはすべて配置済みだよ！');
                            return;
                        }

                        placement.planter = item.id;
                    }
                }

                updateFlowerPlacement();
            });

            items.appendChild(button);
        });
    }

    addHeading(`お花を選ぶ（${selectedFlowers.length}/2種類）`);
    addChoices('flower');
    
addHeading(
    'プランターを選ぶ',
    'images/flowers/planter-white-front.png'
);
    addChoices('planter');

    panel.classList.remove('hidden');
}

function openDecorGardenPanel(slotIndex) {
    const panel = document.getElementById('garden-item-panel');
    const title = document.getElementById('garden-panel-title');
    const items = document.getElementById('garden-panel-items');

    if (!panel || !title || !items) return;

    const decorNumber = gardenSlots
        .slice(0, slotIndex + 1)
        .filter(slot => slot.type === 'decor').length;

    title.textContent = `小物${decorNumber}を設定`;
    items.innerHTML = '';

    // ===== 現在配置している小物 =====
    const currentId = gardenDecorPlacements[slotIndex];

    if (currentId) {
        const currentProduct = shopCatalog.find(
            product => product.id === currentId
        );

        // 現在の配置情報
        const currentInfo = document.createElement('div');
        currentInfo.className =
            'bg-green-50 border-2 border-green-300 rounded-xl p-3 mb-3';

        currentInfo.innerHTML = `
            <div class="font-bold text-green-900 text-sm mb-1">
                🌷 現在の配置
            </div>
            <div class="text-xs text-green-800">
                ${currentProduct?.name || '小物'}・小物${decorNumber}
            </div>
        `;

        items.appendChild(currentInfo);

        // 配置を外すボタン
        const removeButton = document.createElement('button');

        removeButton.type = 'button';
        removeButton.className =
            'w-full bg-amber-100 hover:bg-amber-200 ' +
            'border-2 border-amber-400 rounded-xl ' +
            'py-2 mb-3 text-sm font-bold text-amber-900';

        removeButton.textContent = '↩ 配置を外す';

        removeButton.addEventListener('click', () => {
            delete gardenDecorPlacements[slotIndex];

            saveGardenDecorPlacements();
            closeGardenPanel();
            renderGarden();
        });

        items.appendChild(removeButton);
    }

    // 所持している小物を探す
    const ownedDecor = (state.inventory || []).filter(item => {
        const product = shopCatalog.find(p => p.id === item.id);
        const type = product?.type || item.type;
        return type === 'decor' && Number(item.count) > 0;
    });

    if (ownedDecor.length === 0) {
        items.innerHTML = `
            <p class="garden-panel-description">
                まだ小物を持っていないよ。
                ショップでお迎えしてみてね！
            </p>
        `;
    }

    ownedDecor.forEach(item => {
        const product = shopCatalog.find(p => p.id === item.id);

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'garden-item-choice';
        if (gardenDecorPlacements[slotIndex] === item.id) {
    button.classList.add('garden-choice-selected');
}

        // ショップと同じ画像を使う
        const image = document.createElement('img');
        image.src = product?.image || '';
        image.alt = product?.name || item.name;
		image.className = 'garden-choice-image';

        const info = document.createElement('div');

        const name = document.createElement('div');
        name.className = 'garden-choice-name';
        name.textContent = product?.name || item.name;

        const count = document.createElement('div');
        count.className = 'garden-choice-count';
        count.textContent = `所持 ${item.count}個`;

        info.appendChild(name);
        info.appendChild(count);

        button.appendChild(image);
        button.appendChild(info);


button.addEventListener('click', () => {

    // 同じ小物を何個配置しているか
    const placedCount = Object.values(gardenDecorPlacements)
        .filter(id => id === item.id).length;

    // 所持数を超えて配置できないようにする
    const currentId = gardenDecorPlacements[slotIndex];

    if (currentId !== item.id && placedCount >= item.count) {
        alert('この小物はすべて配置済みだよ！');
        return;
    }

    // 選んだ場所に配置
    gardenDecorPlacements[slotIndex] = item.id;

    saveGardenDecorPlacements();
    closeGardenPanel();
    renderGarden();
});


        items.appendChild(button);
    });

    panel.classList.remove('hidden');
}

/* ===== 動物の配置パネル ===== */

function openAnimalGardenPanel(slotIndex) {
    const panel = document.getElementById('garden-item-panel');
    const title = document.getElementById('garden-panel-title');
    const items = document.getElementById('garden-panel-items');

    if (!panel || !title || !items) return;

    title.textContent = '動物1を設定';
    items.innerHTML = '';

    // 現在配置している動物
    if (gardenAnimalPlacement) {
        const currentProduct = shopCatalog.find(
            p => p.id === gardenAnimalPlacement
        );

        const currentInfo = document.createElement('div');
        currentInfo.className =
            'bg-green-50 border-2 border-green-300 rounded-xl p-3 mb-3';

        currentInfo.textContent =
            `🐾 現在の配置：${currentProduct?.name || '動物'}`;

        items.appendChild(currentInfo);

        // 配置を外す
        const removeButton = document.createElement('button');
        removeButton.type = 'button';
        removeButton.className =
            'w-full bg-amber-100 hover:bg-amber-200 ' +
            'border-2 border-amber-400 rounded-xl ' +
            'py-2 mb-3 text-sm font-bold text-amber-900';

        removeButton.textContent = '↩ 配置を外す';

        removeButton.addEventListener('click', () => {
            gardenAnimalPlacement = null;
            saveGardenAnimalPlacement();
            closeGardenPanel();
            renderGarden();
        });

        items.appendChild(removeButton);
    }

    // 所持している動物
    const ownedAnimals = (state.inventory || []).filter(item => {
        const product = shopCatalog.find(p => p.id === item.id);
        return (product?.type || item.type) === 'animal'
            && Number(item.count) > 0;
    });

    if (ownedAnimals.length === 0) {
        const message = document.createElement('p');
        message.className = 'garden-panel-description';
        message.textContent =
            'まだ動物を持っていないよ。ショップでお迎えしてみてね！';
        items.appendChild(message);
    }

    ownedAnimals.forEach(item => {
        const product = shopCatalog.find(p => p.id === item.id);

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'garden-item-choice';

if (gardenAnimalPlacement === item.id) {
    button.classList.add('garden-choice-selected');
}

        const image = document.createElement('img');
        image.src = product?.image || '';
        image.alt = product?.name || item.name;
        image.className = 'garden-choice-image';

        const info = document.createElement('div');

        const name = document.createElement('div');
        name.className = 'garden-choice-name';
        name.textContent = product?.name || item.name;

        const count = document.createElement('div');
        count.className = 'garden-choice-count';
        count.textContent =
            gardenAnimalPlacement === item.id
                ? `所持 ${item.count}匹・配置中`
                : `所持 ${item.count}匹`;

        info.appendChild(name);
        info.appendChild(count);

        button.appendChild(image);
        button.appendChild(info);

        button.addEventListener('click', () => {
            gardenAnimalPlacement = item.id;

            saveGardenAnimalPlacement();
            closeGardenPanel();
            renderGarden();
        });

        items.appendChild(button);
    });

    panel.classList.remove('hidden');
}

// 選択パネルを閉じる
function closeGardenPanel() {
    document.getElementById('garden-item-panel')
        .classList.add('hidden');
}

// お庭の木の育成データ（仮）
const gardenTrees = [
  { id: 'apple-001', type: 'apple', name: 'りんごの木', icon: '🌱', stage: 1, growth: 0, slotIndex: null },
  { id: 'sakura-001', type: 'sakura', name: 'さくらの木', icon: '🌸', stage: 1, growth: 0, slotIndex: null },
  { id: 'maple-001', type: 'maple', name: 'もみじの木', icon: '🍁', stage: 1, growth: 0, slotIndex: null },
  { id: 'orange-001', type: 'orange', name: 'オレンジの木', icon: '🍊', stage: 1, growth: 0, slotIndex: null },
  { id: 'palm-001', type: 'palm', name: 'ココナッツの木', icon: '🌴', stage: 1, growth: 0, slotIndex: null }
];

// ページを開いたときに保存済みの配置を復元
// お庭の配置を保存する
function saveGardenPlacements() {
    const data = gardenTrees.map(tree => ({
        id: tree.id,
        slotIndex: tree.slotIndex,
        stage: tree.stage,
        growth: tree.growth
    }));

    localStorage.setItem(
        'garden_tree_placements',
        JSON.stringify(data)
    );
    autoSaveGardenToGAS();
}

// 保存した配置を読み込む
function loadGardenPlacements() {
    const saved = localStorage.getItem('garden_tree_placements');
    if (!saved) return;

    try {
        const data = JSON.parse(saved);

        if (!Array.isArray(data)) return;

        data.forEach(savedTree => {
            const tree = gardenTrees.find(t => t.id === savedTree.id);
            if (!tree) return;

            const slot = gardenSlots[savedTree.slotIndex];

            if (
                savedTree.slotIndex === null ||
                (Number.isInteger(savedTree.slotIndex) &&
                 slot?.type === 'tree')
            ) {
                tree.slotIndex = savedTree.slotIndex;
            }

            if (Number.isInteger(savedTree.stage)) {
                tree.stage = Math.max(0, Math.min(3, savedTree.stage));
            }

            if (typeof savedTree.growth === 'number' &&
                Number.isFinite(savedTree.growth)) {
                tree.growth = Math.max(0, savedTree.growth);
            }
        });

    } catch (error) {
        console.error('お庭の読み込みに失敗しました', error);
    }
}


function updateGardenGrowth() {
  const records = [
    ...gameStudyRecords,
    ...gamePlanAchievements
  ];

  const totalMinutes = records.reduce(
    (sum, record) => sum + (Number(record.minutes) || 0),
    0
  );

  let changed = false;

  gardenTrees.forEach(tree => {
    if (tree.slotIndex === null) return;

    const newStage =
      totalMinutes >= 180 ? 3 :
      totalMinutes >= 60 ? 2 : 1;

    if (tree.stage !== newStage) {
      tree.stage = newStage;
      changed = true;
    }

    if (tree.growth !== totalMinutes) {
      tree.growth = totalMinutes;
      changed = true;
    }
  });

  if (changed) {
    saveGardenPlacements();
    renderGarden();

    // 起動時の復元中はGAS保存を予約しない
    // 通常操作中は従来どおり自動保存される
}
}

function renderGarden() {
    const canvas = document.getElementById('garden-canvas');
    canvas.innerHTML = '';

// 配置した木を表示する
gardenTrees.forEach(tree => {
    if (tree.slotIndex === null) return;

    const slot = gardenSlots[tree.slotIndex];
    if (!slot) return;

    if (isGardenEditing) {
        // 模様替え中：カードで表示
        const card = document.createElement('div');
        card.className = 'garden-tree-card';

        card.style.left = slot.x + '%';
        card.style.top = slot.y + '%';

        card.innerHTML = `
            <div class="text-3xl">${tree.icon}</div>
            <span>${tree.name === 'りんごの木' ? 'リンゴの苗' : tree.name}</span>
        `;

        card.title = 'クリックして木を変更';

        card.addEventListener('click', () => {
            openGardenPanel(tree.slotIndex);
        });

        canvas.appendChild(card);

    } else {
        // 通常のお庭：成長段階に合わせた画像を表示
        const img = document.createElement('img');

        let imagePath = 'images/trees/sprout.png';

        if (tree.stage === 2) {
            const saplingImages = {
                apple: 'sapling-common.png',
                palm: 'sapling-palm.png',
                sakura: 'sapling-common.png',
                maple: 'sapling-maple.png',
                orange: 'sapling-common.png',
                wisteria: 'sapling-wisteria.png',
                star: 'sapling-star.png'
            };

            imagePath = 'images/trees/' +
                (saplingImages[tree.type] || 'sapling-common.png');

        } else if (tree.stage >= 3) {
            imagePath = `images/trees/${tree.type}.png`;
        }

img.src = imagePath;
img.alt = tree.name;
img.className = 'garden-tree-image';

if (tree.stage === 1) {
    img.classList.add('tree-sprout');
}

img.style.left = slot.x + '%';
img.style.top = slot.y + '%';

        canvas.appendChild(img);
    }
});


// ===== 配置済みの花壇を表示 =====

Object.entries(gardenFlowerPlacements).forEach(([index, placement]) => {
    const slotIndex = Number(index);
    const slot = gardenSlots[slotIndex];

    if (!slot || slot.type !== 'flower') return;

    const flowers = Array.isArray(placement.flowers)
        ? placement.flowers
        : [];

    const planter = shopCatalog.find(
        p => p.id === placement.planter && p.type === 'planter'
    );

    if (flowers.length === 0 && !planter) return;

    const container = document.createElement('div');
    container.className = isGardenEditing
        ? 'garden-flower-display garden-flower-editing'
        : 'garden-flower-display';

    container.style.left = slot.x + '%';
container.style.top = (slot.y + (isGardenEditing ? 5 : 0)) + '%';

    // プランターの奥側
if (planter) {
    const back = document.createElement('img');

	back.src = planter.image.replace('-front.png', '-back.png');
    back.alt = '';
    back.className = 'garden-flower-planter-back';

    container.appendChild(back);
}

    // お花2種類
    
    // 同じ種類のお花が2個あるか判定
const sameFlowers =
    flowers.length === 2 &&
    flowers[0] === flowers[1];

if (sameFlowers) {
    container.classList.add('garden-flower-full');

    const product = shopCatalog.find(
        p => p.id === flowers[0] && p.type === 'flower'
    );

    if (product) {
        const extraFlower = document.createElement('img');

        extraFlower.src = product.image;
        extraFlower.alt = '';
        extraFlower.className =
            'garden-flower-sprite garden-flower-extra flower-' + flowers[0];

        container.appendChild(extraFlower);
    }
}
    flowers.forEach((flowerId, flowerIndex) => {
        const product = shopCatalog.find(
            p => p.id === flowerId && p.type === 'flower'
        );

        if (!product) return;

        const image = document.createElement('img');
        image.src = product.image;
        image.alt = product.name;
        image.className =
    'garden-flower-sprite garden-flower-' + flowerIndex +
    ' flower-' + flowerId;

        container.appendChild(image);
    });

// プランターの手前側
if (planter) {
    const front = document.createElement('img');

front.src = planter.image;
    front.alt = planter.name;
    front.className = 'garden-flower-planter-front';

    container.appendChild(front);
}

    if (isGardenEditing) {
        container.title = 'クリックして花壇を変更';
        container.addEventListener('click', () => {
            openGardenPanel(slotIndex);
        });
    }

    canvas.appendChild(container);
});

// ===== 配置済みの動物を表示 =====

if (gardenAnimalPlacement) {
    const slotIndex = gardenSlots.findIndex(
        slot => slot.type === 'animal'
    );

    const slot = gardenSlots[slotIndex];

    const product = shopCatalog.find(
        item => item.id === gardenAnimalPlacement
    );

    if (slot && product) {
        if (isGardenEditing) {
            // 模様替え中はカード表示
            const card = document.createElement('button');
            card.type = 'button';
            card.className = 'garden-tree-card';

            card.style.left = slot.x + '%';
            card.style.top = slot.y + '%';

            const img = document.createElement('img');
            img.src = product.image;
            img.alt = product.name;
            img.className = 'garden-edit-animal-image';

            const name = document.createElement('span');
            name.textContent = product.name;

            card.appendChild(img);
            card.appendChild(name);

            card.title = 'クリックして動物を変更';

            card.addEventListener('click', () => {
                openGardenPanel(slotIndex);
            });

            canvas.appendChild(card);

        } else {
            // 通常のお庭は画像のみ
            const img = document.createElement('img');

            img.src = product.image;
            img.alt = product.name;
            img.className = 'garden-tree-image garden-animal-image';

            img.classList.add('animal-' + product.id);

            img.style.left = slot.x + '%';
            img.style.top = slot.y + '%';

            canvas.appendChild(img);
        }
    }
}

// 小物ごとの表示調整
const gardenDecorStyle = {
    birdhouse:       { width: 140, x: 55, y: 15 },
    watering_can:    { width: 150, x: 0, y: 0 },
    mushroom_lantern:{ width: 120, x: 15, y: 25 },
    pond:            { width: 250, x: 0, y: 25 },
    picnic_sheet:    { width: 200, x: 0, y: 10 },
    stump:           { width: 160, x: 0, y: 20}
};

    // ===== 配置済みの小物を表示 =====
    Object.entries(gardenDecorPlacements).forEach(([index, itemId]) => {
        const slotIndex = Number(index);
        const slot = gardenSlots[slotIndex];
        const product = shopCatalog.find(item => item.id === itemId);

        if (!slot || slot.type !== 'decor' || !product) return;

        if (isGardenEditing) {
            // 模様替え中：リンゴの苗と同じカードで表示
            const card = document.createElement('button');
            card.type = 'button';
            card.className = 'garden-tree-card';

            card.style.left = slot.x + '%';
            card.style.top = slot.y + '%';

            const img = document.createElement('img');
            img.src = product.image;
            img.alt = product.name;
            img.style.width = '90px';
			img.style.height = '90px';
            img.style.objectFit = 'contain';
            img.style.imageRendering = 'pixelated';

            const name = document.createElement('span');
            name.textContent = product.name;

            card.appendChild(img);
            card.appendChild(name);

            card.title = 'クリックして小物を変更';

            card.addEventListener('click', () => {
                openGardenPanel(slotIndex);
            });

            canvas.appendChild(card);

        } else {
            // 通常のお庭：画像だけ表示
            const img = document.createElement('img');

img.src = product.image;
img.alt = product.name;

img.className = 'garden-tree-image garden-decor-image';
img.classList.add('decor-' + product.id);

           const style = gardenDecorStyle[product.id] || {
    width: 70, x: 0, y: 0
};

img.style.left = slot.x + '%';
img.style.top = slot.y + '%';

img.style.width = style.width + 'px';
img.style.height = 'auto';

// 元のCSSのtransformを維持して位置を微調整
img.style.translate = `${style.x}px ${style.y}px`;

canvas.appendChild(img);
        }
    });


    if (isGardenEditing) {
        gardenSlots.forEach((slot, index) => {

// 木が配置されている場所には＋を表示しない
const placedTree = gardenTrees.find(tree =>
    tree.slotIndex === index
);

if (placedTree) return;

// 小物が配置されている場所にも＋を表示しない
if (slot.type === 'decor' && gardenDecorPlacements[index]) {
    return;
}
// 動物が配置されている場所にも＋を表示しない
if (slot.type === 'animal' && gardenAnimalPlacement) {
    return;
}
// 花壇に何か配置されていたら＋を隠す
if (slot.type === 'flower') {
    const placement = gardenFlowerPlacements[index];

    if (
        placement &&
        (
            placement.flowers?.length > 0 ||
            placement.planter
        )
    ) {
        return;
    }
}

            const el = document.createElement('button');

            el.type = 'button';
          el.className = 'garden-slot ' + slot.type;
el.style.left = slot.x + '%';
el.style.top = slot.y + '%';

const labels = {
    tree: '木',
    flower: '花壇',
    decor: '小物',
    animal: '動物'
};

const number = gardenSlots
    .slice(0, index + 1)
    .filter(s => s.type === slot.type).length;

el.innerHTML = `
    <span class="garden-slot-plus">
        ${slot.type === 'flower'
            ? '<span>＋</span><span>＋</span>'
            : '＋'}
    </span>
    <span class="garden-slot-label">${labels[slot.type]}${number}</span>
`;

            const names = {
                tree: '木',
                flower: '花壇',
                decor: '小物',
                animal: '動物'
            };

            el.title = names[slot.type] + 'の配置場所';
            el.setAttribute('aria-label', names[slot.type] + 'の配置場所 ' + (index + 1));
           

// 木・小物・動物の＋を押したら選択パネルを開く
if (
    slot.type === 'tree' ||
    slot.type === 'decor' ||
    slot.type === 'animal' ||
    slot.type === 'flower'
) {
    el.addEventListener('click', () => {
        openGardenPanel(index);
    });
}
            canvas.appendChild(el);
        });
    }

    // 所持アイテムの数を集計
    const counts = { tree: 0, flower: 0, decor: 0, animal: 0 };

    state.inventory.forEach(item => {
        counts[item.type] += item.count;
    });

    document.getElementById('stat-tree-count').innerText = '木（最大3本）';
document.getElementById('stat-flower-count').innerText = '花壇（2か所・花4枠）';
document.getElementById('stat-decor-count').innerText = '小物（最大2個）';
document.getElementById('stat-animal-count').innerText = '動物（最大1匹）';
}


    /* --- PLANNER & CALENDAR --- */
    
    // カレンダーで表示している月
let calendarMonthOffset = 0;

// 前月・翌月に移動
function changeCalendarMonth(direction) {
    calendarMonthOffset += direction;
    renderCalendar();
}

function renderCalendar() {
    const grid = document.getElementById('calendar-days-grid');
    if (!grid) return;

    grid.innerHTML = '';

    const today = new Date();

// 表示する年月を計算
const displayDate = new Date(
    today.getFullYear(),
    today.getMonth() + calendarMonthOffset,
    1
);

const year = displayDate.getFullYear();
const month = displayDate.getMonth();
const monthTitle = document.getElementById('calendar-month-title');

if (monthTitle) {
    monthTitle.textContent = `${year}年${month + 1}月`;
}

    // 今月の日数
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // 月初の曜日（日曜=0）
    const firstDay = new Date(year, month, 1).getDay();

    // 月初までの空白
    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement('div');
        grid.appendChild(empty);
    }

    // 日付を作成
    for (let day = 1; day <= daysInMonth; day++) {
       const isToday =
    year === today.getFullYear() &&
    month === today.getMonth() &&
    day === today.getDate();
    
    // テスト当日かどうか
const isTestDay = normalStudyPlan?.testDate ===
    `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        const cell = document.createElement('div');

        cell.className = `
    p-1 rounded-lg border
    ${isTestDay
        ? 'bg-rose-200 text-rose-900 border-rose-500 font-black shadow'
        : isToday
            ? 'bg-amber-400 text-amber-950 border-amber-800 font-black scale-105 shadow'
            : 'bg-amber-50/50 border-amber-200 text-amber-900 hover:bg-amber-100'}
    flex flex-col items-center justify-center h-14
`;

       
const dateStr =
    `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

// 通常版の計画から、この日の予定を探す
const dayPlan = normalStudyPlan?.daysArray?.find(
    plan => plan.dateStr === dateStr
);

const tasks = Array.isArray(dayPlan?.tasks)
    ? dayPlan.tasks
    : [];

const hours = tasks.length;

// 日付
const dayNumber = document.createElement('span');
dayNumber.textContent = day;
cell.appendChild(dayNumber);

// テスト当日の表示
if (isTestDay) {
    const testLabel = document.createElement('span');
    testLabel.textContent = '📝テスト';
    testLabel.className = 'text-[9px] font-black text-rose-700';
    cell.appendChild(testLabel);
}

// 予定時間を丸で表示
if (hours > 0) {
    const dots = document.createElement('div');
    dots.className = 'flex items-center justify-center gap-0.5 mt-1';

    const visibleDots = Math.min(hours, 3);

    for (let i = 0; i < visibleDots; i++) {
        const dot = document.createElement('span');
        dot.className = 'w-1.5 h-1.5 rounded-full bg-emerald-600';
        dots.appendChild(dot);
    }

    if (hours > 3) {
        const extra = document.createElement('span');
        extra.className = 'text-[9px] font-bold text-emerald-800';
        extra.textContent = `+${hours - 3}`;
        dots.appendChild(extra);
    }

    cell.appendChild(dots);
    cell.title = `${dateStr}：学習予定 ${hours}時間`;
}


        if (isToday) {
            cell.title = '今日';
        }

        grid.appendChild(cell);
    }
}

function updateTodayStudyDate() {
const dateElement = document.getElementById('planner-today-date');
    if (!dateElement) return;

    const today = new Date();
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];

    const month = today.getMonth() + 1;
    const day = today.getDate();
    const weekday = weekdays[today.getDay()];

    dateElement.textContent = `${month}/${day}（${weekday}）`;
}

 
let normalTaskSaving = false;
let customTaskSaving = false;

async function completeNormalTask(dateStr, taskIndex, subject) {
  if (normalTaskSaving) return;

  const token = localStorage.getItem("sessionToken");

  if (!token) {
    alert("ログインし直してください");
    return;
  }

  normalTaskSaving = true;
  renderTodaySchedule();

  try {
    const result = await gameGasRequest("completePlanTask", {
      token,
      date: dateStr,
      taskIndex,
      subject
    });

    if (!result.success) {
      throw new Error(result.message || "保存に失敗しました");
    }

    // GASから返ってきた最新の計画を反映
    normalStudyPlan = JSON.parse(result.planJson);
	renderManualLogSubjects();
    renderCalendar();

    // 完了した学習時間を再取得
    await loadGamePlanAchievements();

  } catch (error) {
    console.error("通常版の予定の完了エラー:", error);
    alert(error.message || "保存に失敗しました");

    // 保存状態を確認し直す
    await loadNormalStudyPlan();

  } finally {
    normalTaskSaving = false;
    renderTodaySchedule();
  }
}


function renderTodaySchedule() {
  updateTodayStudyDate();

  const container = document.getElementById("today-schedule-list");
  if (!container) return;

  container.innerHTML = "";

  const today = new Date();
  const todayStr =
    today.getFullYear() + "-" +
    String(today.getMonth() + 1).padStart(2, "0") + "-" +
    String(today.getDate()).padStart(2, "0");

  // 通常版の学習予定
  const todayPlan = normalStudyPlan?.daysArray?.find(
    day => day.dateStr === todayStr
  );

  const plannedTasks = Array.isArray(todayPlan?.tasks)
    ? todayPlan.tasks
    : [];

  // 今日の手動学習記録
  const todayRecords = gameStudyRecords.filter(
    record => record.date === todayStr
  );

  // ゲームモードで追加した予定
const extraTasks = (state.todayTasks || []).filter(
  task => task.date === todayStr
);

  // 共通の表示関数
function addScheduleRow(subject, minutes, checked, badgeText, taskId = null, normalIndex = null) {
    const row = document.createElement("div");
    row.className =
      "flex items-center justify-between bg-white p-2 " +
      "rounded-lg border border-emerald-200 text-xs gap-2";

    const left = document.createElement("div");
    left.className = "flex items-center gap-2 min-w-0";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = checked;
    if (taskId !== null) {
  checkbox.dataset.taskId = String(taskId);
}

checkbox.disabled =
  normalTaskSaving ||
  customTaskSaving ||
  (
    badgeText !== "追加した予定" &&
    badgeText !== "通常版の計画" &&
    !(taskId !== null && checked)
  ) ||
  (normalIndex !== null && checked);

if (!checkbox.disabled) {
  checkbox.addEventListener("change", async () => {

if (!checkbox.checked) {
  // 通常版の予定はまだ取り消し非対応
  if (normalIndex !== null) {
    renderTodaySchedule();
    return;
  }

  const task = (state.todayTasks || []).find(t =>
    String(t.id) === checkbox.dataset.taskId
  );

  if (!task || !task.done) {
    renderTodaySchedule();
    return;
  }

  const confirmed = confirm(
    `「${task.subject}（${task.time || "30分"}）」の完了を取り消しますか？\n\n` +
    "取り消すと、アチーブメントの学習時間も減ります。"
  );

  if (!confirmed) {
    renderTodaySchedule();
    return;
  }

  const token = localStorage.getItem("sessionToken");

  if (!token) {
    alert("ログインし直してください");
    renderTodaySchedule();
    return;
  }

  customTaskSaving = true;
  checkbox.disabled = true;

  try {
    const result = await gameGasRequest(
      "cancelGameCustomTask",
      {
        token,
        taskId: String(task.id)
      }
    );

    if (!result.success) {
      throw new Error(
        result.message || "取り消しに失敗しました"
      );
    }

    // GASでの取り消し成功後にチェックを外す
    task.done = false;
    saveData();

    // アチーブメントの学習時間を更新
    await loadGamePlanAchievements();

  } catch (error) {
    console.error("予定の取り消しエラー:", error);
    alert(error.message || "取り消しに失敗しました");

  } finally {
    customTaskSaving = false;
    renderTodaySchedule();
  }

  return;
}

    // 通常版の予定
    if (normalIndex !== null) {
      await completeNormalTask(todayStr, normalIndex, subject);
      return;
    }

    // ゲームモードで追加した予定
    const task = (state.todayTasks || []).find(t =>
      String(t.id) === checkbox.dataset.taskId
    );

    if (!task || task.done) {
      renderTodaySchedule();
      return;
    }

    
if (customTaskSaving) {
  renderTodaySchedule();
  return;
}

const token = localStorage.getItem("sessionToken");

if (!token) {
  alert("ログインし直してください");
  renderTodaySchedule();
  return;
}

// 「30分」などの入力から分数を取り出す
const timeText = String(task.time || "").trim();
const match = timeText.match(/^(\d+)\s*分?$/);
const studyMinutes = match ? Number(match[1]) : NaN;

if (
  !Number.isInteger(studyMinutes) ||
  studyMinutes < 1 ||
  studyMinutes > 1440
) {
  alert("学習時間を「30分」のように入力してください");
  renderTodaySchedule();
  return;
}

customTaskSaving = true;
checkbox.disabled = true;

try {
  const result = await gameGasRequest(
    "completeGameCustomTask",
    {
      token,
      taskId: String(task.id),
      date: task.date || todayStr,
      subject: task.subject,
      minutes: studyMinutes
    }
  );

  if (!result.success) {
    throw new Error(
      result.message || "学習実績の保存に失敗しました"
    );
  }

  // GASへの保存が成功してから完了にする
  task.done = true;
  saveData();

  // アチーブメントの学習時間を更新
  await loadGamePlanAchievements();

} catch (error) {
  console.error("追加予定の保存エラー:", error);
  alert(error.message || "保存に失敗しました");

} finally {
  customTaskSaving = false;
  renderTodaySchedule();
}

  });
}

    checkbox.className =
      "w-4 h-4 accent-emerald-500 rounded flex-shrink-0";

    const label = document.createElement("span");
    label.textContent = `${subject} ${minutes}`;
    label.className = checked
      ? "font-bold text-slate-500"
      : "font-bold text-amber-950";

    const badge = document.createElement("span");
    badge.textContent = badgeText;
    badge.className =
      "text-[10px] font-bold text-emerald-700 " +
      "bg-emerald-50 px-1.5 py-0.5 rounded " +
      "border border-emerald-200 flex-shrink-0";

    left.appendChild(checkbox);
    left.appendChild(label);

    row.appendChild(left);
    row.appendChild(badge);

    container.appendChild(row);
  }

  // ① 通常版の予定
plannedTasks.forEach((task, index) => {
  addScheduleRow(
    task.subject || "未設定",
    "60分",
    task.done === true,
    task.done ? "完了" : "通常版の計画",
    null,
    index
  );
});

  // ② ゲームモードで追加した予定
extraTasks.forEach(task => {
  addScheduleRow(
    task.subject || "未設定",
    task.time || "30分",
    task.done === true,
    task.done ? "完了" : "追加した予定",
    task.id
  );
});


  // ③ 手動で登録した学習記録
  const manualRecords = todayRecords.filter(
    record => record.method === "手動"
  );

  manualRecords.forEach(record => {
    addScheduleRow(
      record.subject || "未設定",
      `${record.minutes}分`,
      true,
      "記録済み"
    );
  });

if (
  plannedTasks.length === 0 &&
  extraTasks.length === 0 &&
  manualRecords.length === 0
) {
    const message = document.createElement("p");
    message.className = "text-xs text-slate-500 p-2";
    message.textContent =
      "今日はまだ学習予定がないよ 🌱";

    container.appendChild(message);
  }

}

    function toggleTask(id) {
      const t = state.todayTasks.find(x => x.id === id);
      if (t) {
        t.done = !t.done;
        if (t.done) addReward(20, 20);
        renderTodaySchedule();
      }
    }

    function addNewCustomTask() {
  const sub = prompt("教科を入力してください (例: 数学)", "英語");
  if (!sub || !sub.trim()) return;

  const time = prompt("時間を入力してください (例: 30分)", "30分");
  if (!time || !time.trim()) return;

  const today = new Date();
  const date =
    today.getFullYear() + "-" +
    String(today.getMonth() + 1).padStart(2, "0") + "-" +
    String(today.getDate()).padStart(2, "0");

  state.todayTasks.push({
    id: crypto.randomUUID(),
    date,
    subject: sub.trim(),
    time: time.trim(),
    done: false
  });

  saveData();
  renderTodaySchedule();
}


    
let studyLogSaving = false;
let pendingStudyRecord = null;
// 手動記録の科目を学習計画から取得
function updateManualLogSubjects() {

    const select = document.getElementById("log-subject");
    if (!select) return;

    // 学習計画に登録されている科目
    let subjects = normalStudyPlan?.baseSubjects || [];

    // 配列でない場合は空にする
    if (!Array.isArray(subjects)) {
        subjects = [];
    }

    // 重複を削除
    subjects = [...new Set(
        subjects
            .map(s => String(s).trim())
            .filter(Boolean)
    )];

    // 計画がない場合の初期選択肢
    if (subjects.length === 0) {
        subjects = ["数学", "英語", "物理", "国語", "歴史"];
    }

    select.innerHTML = "";

    subjects.forEach(subject => {
        const option = document.createElement("option");
        option.value = subject;
        option.textContent = subject;
        select.appendChild(option);
    });

    // その他
    const otherOption = document.createElement("option");
    otherOption.value = "__other__";
    otherOption.textContent = "その他（自由入力）";
    select.appendChild(otherOption);

    toggleOtherLogSubject();
}


// その他の入力欄の表示切り替え
function toggleOtherLogSubject() {

    const select = document.getElementById("log-subject");
    const input = document.getElementById("log-other-subject");

    if (!select || !input) return;

    if (select.value === "__other__") {
        input.classList.remove("hidden");
    } else {
        input.classList.add("hidden");
        input.value = "";
    }
}

async function saveStudyLog() {
    if (studyLogSaving) return;

    const subjectElement = document.getElementById("log-subject");
    const minutesElement = document.getElementById("log-minutes");
    const memoElement = document.getElementById("log-memo");

    if (!subjectElement || !minutesElement) {
        alert("入力欄が見つかりません");
        return;
    }

    let subject = subjectElement.value.trim();
    let memo = memoElement ? memoElement.value.trim() : "";

    if (subject === "__other__") {
        subject = memo;
        memo = "";
    }

    if (!subject) {
        alert("科目を選択または入力してください");
        return;
    }

    const minutes = Number(minutesElement.value);

    if (!Number.isSafeInteger(minutes) ||
        minutes < 1 || minutes > 1440) {
        alert("勉強時間は1〜1440分で入力してください");
        return;
    }

    const token = localStorage.getItem("sessionToken");

    if (!token) {
        alert("ログイン情報がありません。ログインし直してください");
        return;
    }

    const date = new Intl.DateTimeFormat("sv-SE", {
        timeZone: "Asia/Tokyo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).format(new Date());

    const recordData = {
        date,
        subject,
        minutes,
        method: "手動",
        memo,
        planId: ""
    };

    const fingerprint = JSON.stringify(recordData);

    if (!pendingStudyRecord ||
        pendingStudyRecord.fingerprint !== fingerprint) {
        pendingStudyRecord = {
            fingerprint,
            recordId: crypto.randomUUID()
        };
    }

    const recordId = pendingStudyRecord.recordId;
    studyLogSaving = true;

    try {
        const result = await gameGasRequest("saveStudyRecord", {
            token,
            recordId,
            ...recordData
        });

        if (!result.success) {
            throw new Error(
                result.message || "学習記録の保存に失敗しました"
            );
        }

        const rewardKey = "study_reward_" + recordId;

        if (!localStorage.getItem(rewardKey)) {
            localStorage.setItem(rewardKey, "claimed");

            if (!result.alreadySaved) {
                addReward(Math.floor(minutes * 1.5), minutes);
            }
        }

        await loadGameStudyRecords();

        alert("📖 学習記録を保存しました！");

        minutesElement.value = "30";

        if (memoElement) {
            memoElement.value = "";
        }

        pendingStudyRecord = null;

    } catch (error) {
        console.error("学習記録の保存エラー:", error);
        alert(
            "保存結果を確認できませんでした。\n" +
            "同じ内容でもう一度保存を押すと再確認できます。"
        );
    } finally {
        studyLogSaving = false;
    }
}

// =====================================
// 手動学習記録：科目の自動取得
// =====================================

function renderManualLogSubjects() {

    const select = document.getElementById("log-subject");

    if (!select) return;

    // 学習計画から科目を取得
    let subjects = [];

    if (normalStudyPlan) {

        // 基本科目
        if (Array.isArray(normalStudyPlan.baseSubjects)) {
            subjects.push(...normalStudyPlan.baseSubjects);
        }

        // 実際の計画に登録されている科目も取得
        if (Array.isArray(normalStudyPlan.daysArray)) {
            normalStudyPlan.daysArray.forEach(day => {
                if (Array.isArray(day.tasks)) {
                    day.tasks.forEach(task => {
                        if (task.subject) {
                            subjects.push(task.subject);
                        }
                    });
                }
            });
        }
    }

    // 重複を削除
    subjects = [...new Set(
        subjects.map(s => String(s).trim()).filter(Boolean)
    )];

    select.innerHTML = "";

    // 科目がない場合
    if (subjects.length === 0) {
        const option = document.createElement("option");
        option.value = "";
        option.textContent = "科目がありません";
        select.appendChild(option);
    }

    // 学習計画の科目を追加
    subjects.forEach(subject => {
        const option = document.createElement("option");
        option.value = subject;
        option.textContent = subject;
        select.appendChild(option);
    });

    // その他
    const otherOption = document.createElement("option");
    otherOption.value = "__other__";
    otherOption.textContent = "その他（自由入力）";
    select.appendChild(otherOption);
}


// その他の入力欄を表示・非表示
function toggleOtherLogSubject() {

    const select = document.getElementById("log-subject");
    const input = document.getElementById("log-other-subject");

    if (!select || !input) return;

    if (select.value === "__other__") {
        input.classList.remove("hidden");
        input.focus();
    } else {
        input.classList.add("hidden");
        input.value = "";
    }
}
    /* --- SHOP VIEW --- */
  

let currentShopCategory = "all";

function changeShopCategory(category) {
    currentShopCategory = category;
    renderShop();
}

function renderShop() {
    const container = document.getElementById("shop-items-container");
    if (!container) return;

const categories = [
    { id: "all", name: "すべて" },
    { id: "tree", name: "木" },
    { id: "flower", name: "お花" },
    { id: "item", name: "アイテム" },
    { id: "animal", name: "動物" },
    { id: "apple", name: "🍎 リンゴ限定" }
];

const filteredItems = shopCatalog.filter(item => {
    if (currentShopCategory === "apple") {
        return item.currency === "apple";
    }

    // リンゴ限定商品は通常カテゴリーから除外
    if (item.currency === "apple") {
        return false;
    }

    if (currentShopCategory === "all") {
        return true;
    }

    if (currentShopCategory === "flower") {
        return item.type === "flower" || item.type === "planter";
    }

    if (currentShopCategory === "item") {
        return item.type === "decor";
    }

    return item.type === currentShopCategory;
});

    const categoryButtons = categories.map(category => `
        <button
            type="button"
            onclick="changeShopCategory('${category.id}')"
            class="px-4 py-2 rounded-xl font-bold text-sm border-2 transition"
            style="
                background: ${currentShopCategory === category.id ? '#fbbf24' : '#fffaf0'};
                border-color: #8b5e3c;
                color: #5c351a;
            "
        >
            ${category.name}
        </button>
    `).join("");

    const itemCards = filteredItems.map(item => {
        const owned = state.inventory.some(
            inv => inv.id === item.id && inv.count > 0
        );

const currencyIcon = item.currency === "apple"
    ? "🍎"
    : '<span class="shop-coin-icon">C</span>';
    
        return `
           <div class="game-box p-3 bg-white flex flex-col items-center text-center justify-start gap-2">

                <div class="w-full rounded-xl bg-emerald-50 flex items-center justify-center p-3"
                     style="min-height:130px;">
                    <img
                        src="${item.image}"
                        alt="${item.name}"
                        style="width:115px;height:115px;object-fit:contain;image-rendering:pixelated;"
                    >
                </div>

                <div>
                    <div class="font-black text-sm text-amber-950">
                        ${item.name}
                    </div>
                    <div class="text-xs text-amber-700">
                        ${item.desc}
                    </div>
                </div>

                <button
                    type="button"
                    onclick="buyShopItem('${item.id}')"
                    class="w-full py-2 bg-amber-400 hover:bg-amber-500 text-amber-950 font-black rounded-lg border border-amber-800 text-xs shadow-sm"
                >
                    ${currencyIcon} ${item.price} で購入
                </button>

                ${owned
                    ? '<span class="text-xs text-emerald-700 font-bold">✓ 所持中</span>'
                    : ''}
            </div>
        `;
    }).join("");

    container.innerHTML = `
        <div class="col-span-full flex flex-wrap gap-2 mb-4">
            ${categoryButtons}
        </div>
        ${itemCards}
    `;
}




function buyShopItem(itemId) {
    const product = shopCatalog.find(item => item.id === itemId);
    if (!product) return;

    const wallet = product.currency === 'apple' ? 'apples' : 'coins';

    if (state.user[wallet] < product.price) {
        alert(product.currency === 'apple'
            ? '🍎 リンゴが足りないよ！'
            : '🪙 コインが足りないよ！');
        return;
    }

    state.user[wallet] -= product.price;

    addInventoryItem(itemId);

    
    saveData();

    // 購入後の持ち物とコイン・リンゴをGASへ保存
    Promise.all([
        saveGameInventoryToGAS(),
        saveGameDataToGAS()
    ]).catch(error => {
        console.error("購入データの保存エラー:", error);
        alert("購入データのGAS保存に失敗しました。");
    });

    renderStatus();
    renderShop();

    renderInventory();
    renderGarden();

    alert(`🎉 ${product.name} を購入したよ！もちものに入ったよ。`);
}



/* --- もちもの画面 --- */

let currentInventoryCategory = 'all';

// カテゴリー切り替え
function changeInventoryCategory(category) {
    currentInventoryCategory = category;
    renderInventory();
}

// 所持品一覧
function renderInventory() {
    const container = document.getElementById('inventory-items-container');
    const tabs = document.getElementById('inventory-categories');

    if (!container || !tabs) return;

    const categories = [
        ['all', 'すべて'],
        ['tree', '木'],
        ['flower', 'お花'],
        ['item', 'アイテム'],
        ['animal', '動物']
    ];

    tabs.innerHTML = categories.map(([id, name]) => `
        <button type="button"
          onclick="changeInventoryCategory('${id}')"
          class="px-4 py-2 rounded-xl border-2 border-amber-800 font-bold text-sm"
          style="background:${currentInventoryCategory === id ? '#fbbf24' : '#fffaf0'};color:#5c351a">
          ${name}
        </button>
    `).join('');

 
const owned = (Array.isArray(state.inventory) ? state.inventory : [])
    .filter(item => Number(item.count) > 0)
    .filter(item => {
        const catalog = shopCatalog.find(product => product.id === item.id);
        const type = catalog?.type || item.type;

        if (currentInventoryCategory === 'all') {
            return true;
        }

        if (currentInventoryCategory === 'flower') {
            return type === 'flower' || type === 'planter';
        }

        if (currentInventoryCategory === 'item') {
            return type === 'decor';
        }

        return type === currentInventoryCategory;
    });

    if (!owned.length) {
        container.innerHTML =
            '<p class="col-span-full game-box p-5 text-center text-amber-900 font-bold">まだもちものがないよ。ショップをのぞいてみよう！</p>';
        return;
    }

    container.innerHTML = owned.map(item => {
       
const catalog = shopCatalog.find(product => product.id === item.id);
const name = catalog?.name || item.name || 'アイテム';
const image = catalog?.image || '';
const count = Number(item.count) || 0;


const displayImage = image
    ? `<img src="${image}" alt="${name}"
         style="
             width:128px;
             height:128px;
             object-fit:contain;
             image-rendering:pixelated;
         ">`
    : `<span style="font-size:48px">${item.icon || '📦'}</span>`;



        const planted = item.type === 'tree' &&
            gardenTrees.some(tree =>
                tree.slotIndex !== null && tree.name === name
            );

        return `
          <div class="game-box p-3 bg-white flex flex-col items-center text-center gap-2">
            <div class="w-full rounded-xl bg-emerald-50 flex items-center justify-center p-3"
                 style="min-height:130px">
              ${displayImage}
            </div>

            <div class="font-black text-sm text-amber-950">${name}</div>
            <div class="text-xs font-bold text-amber-800">
              所持数：${count}
            </div>

            ${planted
              ? '<span class="text-xs font-bold text-emerald-700">🌱 お庭に配置中</span>'
              : ''}
          </div>
        `;
    }).join('');
}

// 所持品を追加する共通処理
function addInventoryItem(itemId, quantity = 1) {
    const product = shopCatalog.find(item => item.id === itemId);
    if (!product) return;

    if (!Array.isArray(state.inventory)) {
        state.inventory = [];
    }

    const existing = state.inventory.find(item => item.id === itemId);

    if (existing) {
        existing.count = (Number(existing.count) || 0) + quantity;
    } else {
        state.inventory.push({
            id: product.id,
            name: product.name,
            type: product.type,
            count: quantity
        });
    }
}


/* --- ACHIEVEMENTS VIEW --- */

const ACHIEVEMENT_RANK_STYLES = {
  bronze: {
    border: "#C88B72",
    background: "#FFF0E8"
  },
  silver: {
    border: "#A9B8D0",
    background: "#F0F4FA"
  },
  gold: {
    border: "#E5B64E",
    background: "#FFF5D8"
  },
  diamond: {
    border: "#8F86D8",
    background: "#F1EDFF"
  }
};


const GAME_NOTICE_KEY = "game_notifications_v1";

function getGameNotifications() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(GAME_NOTICE_KEY) || "[]"
    );
    return Array.isArray(saved) ? saved : [];
  } catch (error) {
    return [];
  }
}

function addGameNotification(id, title, message, icon = "🔔") {
  const notices = getGameNotifications();

  // 同じお知らせを重複して登録しない
  if (notices.some(n => n.id === id)) return;

  notices.unshift({
    id,
    title,
    message,
    icon,
    createdAt: new Date().toISOString()
  });

  localStorage.setItem(
    GAME_NOTICE_KEY,
    JSON.stringify(notices.slice(0, 50))
  );

  renderGameNotifications();
}

function renderGameNotifications() {
  const container = document.getElementById(
    "game-notifications"
  );

  if (!container) return;

  container.innerHTML = "";

  const notices = getGameNotifications().slice(0, 5);

  if (notices.length === 0) {
    container.textContent = "まだお知らせはありません。";
    return;
  }

  notices.forEach(notice => {
    const card = document.createElement("div");
    card.className =
      "bg-white p-2.5 rounded-lg border border-amber-200 flex gap-2";

    const icon = document.createElement("span");
    icon.className = "text-xl";
    icon.textContent = notice.icon;

    const content = document.createElement("div");

    const title = document.createElement("div");
    title.className = "font-bold text-amber-950";
    title.textContent = notice.title;

    const message = document.createElement("div");
    message.className = "text-amber-700 text-[11px]";
    message.textContent = notice.message;

    content.appendChild(title);
    content.appendChild(message);

    card.appendChild(icon);
    card.appendChild(content);
    container.appendChild(card);
  });
}

function initializeGameNotifications() {
	// 同じ日のログインボーナス通知を1件に整理
const notices = getGameNotifications();
const seen = new Set();

const cleaned = notices.filter(notice => {
  if (!notice.title?.startsWith("ログインボーナス（")) {
    return true;
  }

  const key = `${notice.title}-${notice.createdAt?.slice(0, 10)}`;

  if (seen.has(key)) return false;
  seen.add(key);
  return true;
});

localStorage.setItem(
  GAME_NOTICE_KEY,
  JSON.stringify(cleaned)
);

  addGameNotification(
    "shop-rabbit-wisteria-v1",
    "新しい仲間が登場！",
    "ショップに「うさぎ」と「ふじの木」が入荷しました。",
    "🐰"
  );
  addGameNotification(
  "shop-new-trees-v1",
  "新しい木が入荷しました！",
  "ショップに「さくらの木」と「もみじの木」が登場しました！",
  "🌸"
);

  renderGameNotifications();
}

// ログインボーナスのお知らせを1件だけ残す
const notices = getGameNotifications();
let foundLoginBonus = false;

const cleaned = notices.filter(n => {
  if (!n.title?.startsWith("ログインボーナス（")) {
    return true;
  }

  if (foundLoginBonus) {
    return false;
  }

  foundLoginBonus = true;
  return true;
});

localStorage.setItem(
  GAME_NOTICE_KEY,
  JSON.stringify(cleaned)
);

function updateTimeAchievements() {
  let changed = false;

  state.achievements.forEach(a => {
    if (a.unlocked) return;

    // 初めて学習を記録
    if (a.id === "study_1") {
      if (gameStudyRecords.length > 0) {
        a.unlocked = true;
changed = true;

addGameNotification(
  `achievement-${a.id}`,
  "新しいアチーブメント達成！",
  `「${a.name}」を達成しました！`,
  "🏅"
);
      }
      return;
    }

    // 累計学習時間
    if (a.id.startsWith("time_")) {
      const progress = getAchievementProgress(a);

      if (progress && progress.current >= progress.goal) {
        a.unlocked = true;
changed = true;

addGameNotification(
  `achievement-${a.id}`,
  "新しいアチーブメント達成！",
  `「${a.name}」を達成しました！`,
  "🏅"
);
      }
    }
  });

  if (changed) saveData();
}


function renderAchievements() {
  updateTimeAchievements();
  const container = document.getElementById("achievements-container");
  if (!container) return;

  const achievements = state.achievements || [];
  const unlockedCount = achievements.filter(a => a.unlocked).length;

  container.innerHTML = achievements.map(a => {
    const hidden = a.hidden && !a.unlocked;

const rankStyle = ACHIEVEMENT_RANK_STYLES[a.rank]
  || ACHIEVEMENT_RANK_STYLES.bronze;
  
    return `
      
<button
  type="button"
  class="game-box p-3 flex flex-col items-center
         text-center justify-center gap-1 w-full
         transition hover:brightness-95"
  style="
    border: 3px solid ${rankStyle.border};
    background-color: ${rankStyle.background};
    box-shadow: 0 4px 0 ${rankStyle.border};
  "
  onclick="showAchievementDetail('${a.id}')"
>

        <div class="relative w-16 h-16 flex items-center justify-center">
          <img
            src="${a.image}"
            alt=""
            class="w-full h-full object-contain
                   ${a.unlocked ? "" : "brightness-0 opacity-30"}"
            style="image-rendering: pixelated;"
          >

          ${a.unlocked ? "" : `
            <span class="absolute text-2xl">🔒</span>
          `}
        </div>

        <div class="font-black text-xs text-amber-950">
          ${hidden ? "？？？" : a.name}
        </div>

        <div class="text-[10px] text-amber-800">
          ${hidden ? "条件は秘密です" : a.desc}
        </div>
      </button>
    `;
  }).join("");

  const ratio = document.getElementById("achievement-ratio");
  if (ratio) {
    ratio.innerText = `${unlockedCount} / ${achievements.length}`;
  }
}


function getAchievementProgress(a) {
  // 現時点では、実績ごとの目標値を設定する
  const goals = {
    time_1: 60,
    time_3: 180,
    time_5: 300,
    time_10: 600,

    quiz_1: 1,
    quiz_5: 5,
    quiz_10: 10,
    quiz_20: 20,
    quiz_50: 50,
    quiz_75: 75,
    quiz_100: 100,

    harvest_1: 1,
    harvest_5: 5,
    harvest_10: 10,
    harvest_20: 20,

    mission_1: 1,
    mission_3: 3,
    mission_7: 7,

    plan_5: 5,
    test_3: 3,

    diamond_coins: 1000,
    diamond_garden: 10
  };

  const goal = goals[a.id];

  if (!goal) return null;

 
const manualMinutes = gameStudyRecords.reduce(
  (sum, record) => sum + (Number(record.minutes) || 0),
  0
);

const planMinutes = gamePlanAchievements.reduce(
  (sum, record) => sum + (Number(record.minutes) || 0),
  0
);

// 手動・タイマー記録 ＋ 完了した学習計画
const totalMinutes = manualMinutes + planMinutes;


let current = 0;

// 学習時間のアチーブメント
if (a.id.startsWith("time_")) {
  current = totalMinutes;
}

  return {
    current,
    goal,
    percent: Math.min(100, Math.round(current / goal * 100))
  };
}


function claimAchievement(id) {
  const a = state.achievements.find(item => item.id === id);

  if (!a || !a.unlocked || a.claimed) return;

  // 今回は学習時間アチーブメントのみ対応
if (!a.id.startsWith("time_") && a.id !== "study_1") return;

  a.claimed = true;

  // コインを付与
  state.user.coins += a.coins;

  saveData();
  renderStatus();
  renderAchievements();
  showAchievementDetail(id);

  alert(`🎉「${a.name}」を獲得！\n${a.coins}コインを受け取りました！`);
}

/* --- 選択したバッジの詳細 --- */
function showAchievementDetail(id) {
  const a = state.achievements.find(item => item.id === id);
  const detail = document.getElementById("achievement-detail");

  if (!a || !detail) return;

  const hidden = a.hidden && !a.unlocked;
  const progress = getAchievementProgress(a);
  const rankStyle = ACHIEVEMENT_RANK_STYLES[a.rank]
  || ACHIEVEMENT_RANK_STYLES.bronze;

  const rankNames = {
    bronze: "🥉 ブロンズ",
    silver: "🥈 シルバー",
    gold: "🥇 ゴールド",
    diamond: "💎 ダイヤ"
  };

  detail.innerHTML = `
<div
  class="flex flex-col items-center text-center gap-3
         rounded-xl p-3"
  style="
    background-color: ${rankStyle.background};
    border: 2px solid ${rankStyle.border};
  "
>

      <img
        src="${a.image}"
        alt=""
        class="w-32 h-32 object-contain
               ${a.unlocked ? "" : "brightness-0 opacity-30"}"
        style="image-rendering: pixelated;"
      >

      <div class="font-black text-lg text-amber-950">
        ${hidden ? "？？？" : a.name}
      </div>

      <div class="text-xs font-bold text-amber-700">
        ${rankNames[a.rank] || ""}
      </div>

      <div class="text-sm text-amber-900">
        ${hidden ? "達成条件は秘密です" : a.desc}
      </div>

      <div class="text-sm font-bold text-amber-800">
        ${
          hidden
            ? "報酬：？？？"
            : a.item
              ? `報酬：${a.item}`
              : `報酬：${a.coins} コイン`
        }
      </div>

      
${progress && !hidden ? `
  <div class="w-full mt-2">
    <div class="flex justify-between text-xs font-bold text-amber-800 mb-2">
      <span>達成までの進捗</span>
      <span>${progress.current} / ${progress.goal}</span>
    </div>

    <div class="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
      <div
        class="h-full rounded-full transition-all duration-300"
        style="
          width: ${progress.percent}%;
          background-color: ${rankStyle.border};
        "
      ></div>
    </div>

    <div class="text-right text-xs text-amber-700 mt-1">
      ${progress.percent}%
    </div>
  </div>
` : ""}

<div
  class="w-full rounded-xl p-3 font-bold text-sm"
  style="
    background-color: ${a.unlocked ? "#E5F5E8" : "rgba(255,255,255,0.55)"};
    color: ${a.unlocked ? "#287A48" : "#8B7868"};
    border: 1px solid ${rankStyle.border};
  "
>
  
${
  a.claimed
    ? "🏅 受取済み"
    : a.unlocked
      ? "🎉 達成！"
      : "🔒 未達成"
}


</div>

${a.unlocked && !a.claimed &&
  (a.id.startsWith("time_") || a.id === "study_1") ?  `

  <button
    type="button"
    onclick="claimAchievement('${a.id}')"
    class="w-full bg-emerald-500 text-white font-black rounded-xl p-3 border-2 border-emerald-700"
  >
    🎁 報酬を受け取る
  </button>

` : ""}

    </div>
  `;
}



    /* --- QUIZ VIEW --- */

let gameQuizQuestions = [];
let gameQuizIndex = 0;
let gameQuizAnswered = false;
let gameQuizSubject = "";

// 教科選択ボタンを作る
function renderGameQuizSubjects() {
    const container = document.getElementById("game-quiz-subjects");
    if (!container) return;
    
    // 🌱 教科を選ぶまでは問題欄を隠す
    const questionArea = document.getElementById("quiz-card-content");
    if (questionArea && gameQuizQuestions.length === 0) {
        questionArea.style.display = "none";
    }
    container.innerHTML = "";

    Object.keys(practiceQuestionData).forEach(subject => {
        const button = document.createElement("button");

        button.textContent = subject;
        button.className =
            "p-3 rounded-xl border-2 border-emerald-500 " +
            "bg-emerald-100 text-emerald-900 font-bold " +
            "hover:bg-emerald-200";

        button.onclick = () => startGameQuiz(subject);

        container.appendChild(button);
    });
}

// 選んだ教科の問題を開始

function startGameQuiz(subject) {
    const questions = practiceQuestionData[subject] || [];

    if (questions.length === 0) {
        alert("この教科の問題はまだ準備中だよ！");
        return;
    }

    // 教科を選択したら、前の問題を隠す
    gameQuizQuestions = [];
    gameQuizSubject = subject;

    const questionArea =
        document.getElementById("quiz-card-content");

    if (questionArea) {
        questionArea.style.display = "none";
    }

    // 教科選択ボタンの下に問題数選択を表示
    const subjectArea =
        document.getElementById("game-quiz-subjects");

    let panel = document.getElementById("quiz-count-panel");

    if (!panel) {
        panel = document.createElement("div");
        panel.id = "quiz-count-panel";
        subjectArea.insertAdjacentElement("afterend", panel);
    }

    panel.className =
        "mt-4 p-4 bg-emerald-50 border-2 " +
        "border-emerald-400 rounded-xl";

    panel.innerHTML = `
        <div class="font-black text-emerald-900 mb-3">
            📚 選択中の教科：
            <span id="selected-quiz-subject"></span>
        </div>

        <p class="font-bold text-emerald-900 mb-2">
            ✏️ 何問解く？
            <span class="text-xs">
                （この教科は全${questions.length}問）
            </span>
        </p>

        <div id="quiz-count-buttons"
             class="grid grid-cols-2 sm:grid-cols-4 gap-2">
        </div>

        <button id="quiz-start-button"
                class="mt-4 w-full p-3 rounded-xl
                       bg-emerald-500 text-white font-black
                       hover:bg-emerald-600">
            🌱 問題スタート！
        </button>
    `;

    document.getElementById(
        "selected-quiz-subject"
    ).textContent = subject;

    let selectedCount = Math.min(5, questions.length);

    const buttonArea =
        document.getElementById("quiz-count-buttons");

    const countOptions = [3, 5, 10, "全問"];

    const countButtons = [];

    countOptions.forEach(option => {
        const button = document.createElement("button");

        const count = option === "全問"
            ? questions.length
            : Math.min(option, questions.length);

        button.textContent =
            option === "全問" ? "全問" : `${option}問`;

        const updateStyle = () => {
            const active = selectedCount === count;

            button.className =
                "p-3 rounded-xl border-2 font-bold " +
                (active
                    ? "bg-emerald-500 text-white border-emerald-600"
                    : "bg-emerald-100 text-emerald-900 " +
                      "border-emerald-400 hover:bg-emerald-200");
        };

        button.onclick = () => {
            selectedCount = count;
            countButtons.forEach(b => b.updateStyle());
        };

        button.updateStyle = updateStyle;
        countButtons.push(button);
        buttonArea.appendChild(button);
    });

    countButtons.forEach(button => button.updateStyle());

    document.getElementById("quiz-start-button").onclick = () => {
        gameQuizQuestions = [...questions]
            .sort(() => Math.random() - 0.5)
            .slice(0, selectedCount);

        gameQuizIndex = 0;

        // 選択パネルを閉じて問題を表示
        panel.remove();
        renderQuiz();
    };
}


// 問題を表示
function renderQuiz() {
    const questionArea =
        document.getElementById("quiz-card-content");

    if (gameQuizQuestions.length === 0) {
        questionArea.style.display = "none";
        return;
    }

    questionArea.style.display = "block";
    gameQuizAnswered = false;

    const q = gameQuizQuestions[gameQuizIndex];

    document.getElementById("quiz-progress-text").textContent =
        `問題 ${gameQuizIndex + 1} / ${gameQuizQuestions.length}`;

    document.getElementById("quiz-subject-badge").textContent =
        gameQuizSubject;

    document.getElementById("quiz-question-text").innerHTML =
        q.question;

    const container =
        document.getElementById("quiz-options-container");

    container.innerHTML = "";

    if (Array.isArray(q.choices)) {
        const choices = [...q.choices].sort(
            () => Math.random() - 0.5
        );

        choices.forEach(choice => {
            const button = document.createElement("button");

            button.className =
                "w-full text-left p-3 rounded-xl border-2 " +
                "border-emerald-300 bg-emerald-50 " +
                "hover:bg-emerald-100 font-bold";

            button.innerHTML = choice;

            button.onclick = () => checkAnswer(choice);

            container.appendChild(button);
        });
    } else {
        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = "答えを入力";
        input.className = "w-full p-3 border-2 rounded-xl";

        const button = document.createElement("button");
        button.textContent = "回答する";
        button.className =
            "p-3 bg-emerald-500 text-white rounded-xl font-bold";

        button.onclick = () => {
            if (!input.value.trim()) return;
            checkAnswer(input.value);
        };

        container.appendChild(input);
        container.appendChild(button);
    }

    document.getElementById("quiz-feedback")
        .classList.add("hidden");

    const nextButton = document.getElementById("quiz-next-btn");
    nextButton.classList.add("hidden");
    nextButton.textContent = "次の問題へ ➔";

    if (window.MathJax?.typesetPromise) {
        MathJax.typesetPromise();
    }
}

// 正誤判定
function checkAnswer(answer) {
    if (gameQuizAnswered) return;

    gameQuizAnswered = true;

	// 🌱 初心者ミッション：練習問題3問
if (!state.beginner.progress.quiz) {
    state.beginner.quizAnsweredCount++;

    if (state.beginner.quizAnsweredCount >= 3) {
        completeBeginnerMission("quiz");
    } else {
        saveData();
    }
}

    const q = gameQuizQuestions[gameQuizIndex];

    const correct =
        String(answer).trim().toLowerCase() ===
        String(q.answer).trim().toLowerCase();

    const feedback = document.getElementById("quiz-feedback");
    feedback.classList.remove("hidden");

    const buttons = document.querySelectorAll(
        "#quiz-options-container button"
    );

    buttons.forEach(button => button.disabled = true);

    if (correct) {
        feedback.className =
            "p-3 rounded-xl font-bold text-center " +
            "bg-emerald-200 text-emerald-950";

        feedback.innerHTML = "⭕ 正解！";

        // デイリーの正解数を更新
        resetDailyMissionsIfNeeded();

        state.daily.correctAnswers =
            (Number(state.daily.correctAnswers) || 0) + 1;

        saveData();
        renderMissions();

    } else {
        feedback.className =
            "p-3 rounded-xl font-bold text-center " +
            "bg-rose-200 text-rose-950";

        feedback.innerHTML =
            `❌ 不正解！<br>正解：${q.answer}`;
    }

    if (q.explanation) {
        feedback.innerHTML +=
            `<div class="mt-3 text-left">📖 解説：<br>${q.explanation}</div>`;
    }

    if (window.MathJax?.typesetPromise) {
        MathJax.typesetPromise();
    }

    const nextButton = document.getElementById("quiz-next-btn");
    nextButton.classList.remove("hidden");

    if (gameQuizIndex === gameQuizQuestions.length - 1) {
        nextButton.textContent = "結果を見る ➔";
    }
}

// 次の問題
function nextQuizQuestion() {
    gameQuizIndex++;

    if (gameQuizIndex >= gameQuizQuestions.length) {
        document.getElementById("quiz-question-text").textContent =
            "🎉 お疲れさま！ 全問終了！";

        document.getElementById("quiz-options-container").innerHTML = "";
        document.getElementById("quiz-feedback")
            .classList.add("hidden");

        document.getElementById("quiz-next-btn")
            .classList.add("hidden");

        return;
    }

    renderQuiz();
}

    /* ===================================================
       MODAL CONTROLS & STORAGE
       =================================================== */
    function openPlanModal() { document.getElementById('plan-modal').classList.remove('hidden'); }
    function closePlanModal() { document.getElementById('plan-modal').classList.add('hidden'); }
    function openSettingsModal() { document.getElementById('settings-modal').classList.remove('hidden'); }
    function closeSettingsModal() { document.getElementById('settings-modal').classList.add('hidden'); }

    
async function generatePlanSchedule() {

    // 入力内容を取得
    const testDateVal =
        document.getElementById("plan-target-date").value;

    const subjStr =
        document.getElementById("plan-subjects").value;

    const dailyMinutes =
        Number(document.getElementById("plan-daily-mins").value);

    const subjects = subjStr
        .split(/[,、]/)
        .map(s => s.trim())
        .filter(Boolean);

    // 入力チェック
    if (!testDateVal) {
        alert("テスト日を入力してください");
        return;
    }

    if (subjects.length === 0) {
        alert("教科を入力してください");
        return;
    }

    if (!Number.isFinite(dailyMinutes) || dailyMinutes < 1) {
        alert("1日あたりの学習時間を正しく入力してください");
        return;
    }

    // 今日の日付
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const testDate = new Date(testDateVal + "T00:00:00");

    if (isNaN(testDate.getTime()) || testDate <= today) {
        alert("テスト日は明日以降の日付にしてください");
        return;
    }

    const token = localStorage.getItem("sessionToken");

    if (!token) {
        alert("ログインし直してください");
        return;
    }

    // 1日あたりの学習タスク数
    // 1タスクを60分として計算
    const tasksPerDay = Math.max(
        1,
        Math.floor(dailyMinutes / 60)
    );

    // 日付ごとの計画を作成
    const daysArray = [];

    let subjectIndex = 0;

    const currentDate = new Date(today);

    while (currentDate <= testDate) {

        const year = currentDate.getFullYear();
        const month = String(
            currentDate.getMonth() + 1
        ).padStart(2, "0");

        const day = String(
            currentDate.getDate()
        ).padStart(2, "0");

        const dateStr = `${year}-${month}-${day}`;

        const isTestDay =
            dateStr === testDateVal;

        const tasks = [];

        // テスト当日以外に学習予定を割り当てる
        if (!isTestDay) {

            for (let i = 0; i < tasksPerDay; i++) {

                const subject =
                    subjects[subjectIndex % subjects.length];

                tasks.push({
                    subject: subject,
                    done: false
                });

                subjectIndex++;
            }
        }

        daysArray.push({
            dateStr: dateStr,
            isTestDay: isTestDay,
            isOffDay: false,
            customHours: undefined,
            tasks: tasks
        });

        currentDate.setDate(
            currentDate.getDate() + 1
        );
    }

    // 通常モードと同じ形式の保存データ
    const dataToSave = {
        daysArray: daysArray,
        testDate: testDateVal,
        baseSubjects: subjects,
        weakSubjects: [],
        defaultDailyHours: dailyMinutes / 60,
        selectedOffDays: [],
        planType: "transfer",
        displayMode: "game",
        weakRatio: "2.0",
        subjectInputValue: subjStr
    };

    try {

        // GASに学習計画を保存
        const result = await gameGasRequest("savePlan", {

            token: token,

            mode: "ゲーム",
            displayMode: "game",

            testDate: testDateVal,

            offDays: [],
            subjects: subjects,
            weakSubjects: [],
            weakRatio: "2.0",

            defaultDailyHours: dailyMinutes / 60,

            planJson: JSON.stringify(dataToSave),

            planVersion: gamePlanVersion
        });

        if (!result.success) {

            if (result.conflict) {
                alert(
                    "別の画面で学習計画が更新されています。\n" +
                    "ページを再読み込みしてください。"
                );

                return;
            }

            throw new Error(
                result.message || "学習計画の保存に失敗しました"
            );
        }

        // 保存成功
        gamePlanVersion = result.planVersion ?? gamePlanVersion;

        normalStudyPlan = dataToSave;

        // 画面を更新
        renderCalendar();
        renderTodaySchedule();
        renderMissions();

        // 学習実績も更新
        await loadGamePlanAchievements();

        closePlanModal();

        alert("✨ 学習計画を自動生成しました！");

    } catch (error) {

        console.error("学習計画の生成エラー:", error);

        alert(
            error.message ||
            "学習計画の生成に失敗しました"
        );
    }
}


    function saveSettings() {
      state.user.name = document.getElementById('setting-username').value || "ユーザー名";
      saveData();
      renderStatus();
      closeSettingsModal();
    }

    function saveData() {
      localStorage.setItem('game_study_app_state', JSON.stringify(state));
    }

    
function loadSavedData() {
  const saved = localStorage.getItem('game_study_app_state');

  if (saved) {
    try {
      state = JSON.parse(saved);
    } catch (error) {
      console.error("ゲームデータの読み込みエラー:", error);
    }
  }

  // 🌱 初心者ミッションの保存データを補完
  if (!state.beginner) {
    state.beginner = {};
  }

  state.beginner.completed ??= false;
  state.beginner.claimed ??= false;

  if (!state.beginner.progress) {
    state.beginner.progress = {};
  }

  const progress = state.beginner.progress;

  progress.login ??= false;
  progress.plan ??= false;
  progress.quiz ??= false;
  progress.garden ??= false;
  state.beginner.quizAnsweredCount ??= 0;

  saveData();
}



function resetData() {
    const confirmed = confirm(
        "ゲームデータを初期化しますか？\n" +
        "レベル・コイン・リンゴ・お庭の配置がリセットされます。\n" +
        "通常モードの学習計画は削除されません。"
    );

    if (!confirmed) return;

    // ゲーム本体の保存データ
    localStorage.removeItem("game_study_app_state");

    // お庭の木の配置データ
    localStorage.removeItem("garden_tree_placements");
    
	// お庭の小物の配置データ
	localStorage.removeItem("garden_decor_placements");
	localStorage.removeItem("garden_animal_placement");
	
    // 初期状態で再読み込み
    location.reload();
}

 
// 通常モードに戻る
function backToNormalMode() {
    const confirmed = confirm("通常モードに戻りますか？");

    if (!confirmed) return;

    // 通常モードのトップページへ移動
    window.location.href = "../サイト/index.html";
}

function completeFirstSetup() {
    // 選択された住人と木を取得
    const animal = document.querySelector(
        'input[name="starter-animal"]:checked'
    );

    const tree = document.querySelector(
        'input[name="starter-tree"]:checked'
    );

    // 両方選択していない場合
    if (!animal || !tree) {
        alert("住人と木を両方選んでね！");
        return;
    }

    // 選択内容を保存
    if (!state.tutorial) {
        state.tutorial = {};
    }

    state.tutorial.starterAnimal = animal.value;
    state.tutorial.starterTree = tree.value;

    state.tutorial.starterAnimalSelected = true;
    state.tutorial.starterTreeSelected = true;
    state.tutorial.completed = true;

    // 最初に選んだ動物と木をもちものに入れる
    addInventoryItem(animal.value);

    addInventoryItem(
        tree.value === 'apple' ? 'apple_tree' :
        (tree.value === 'palm' || tree.value === 'coconut')
            ? 'palm_tree'
            : tree.value
    );

    state.tutorial.inventoryGranted = true;

    saveData();

    Promise.all([
        saveGameInventoryToGAS(),
        saveGameDataToGAS()
    ]).catch(error => {
        console.error("初回設定の保存エラー:", error);
        alert("初回設定のGAS保存に失敗しました。");
    });

    // 初回設定画面を閉じる
    document.getElementById("first-setup-modal")
        .classList.add("hidden");

    renderAll();

    // 初回設定が終わった直後に1日目のログインボーナスを表示
    checkAndShowLoginBonus();
}
