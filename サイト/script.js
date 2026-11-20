
let originalDaysLeft = 0;
let daysArray = []; 
let studyPool = []; 
let defaultDailyHours = 2; 
let selectedOffDays = []; 
let testDateGlobal = null;
let baseSubjectsGlobal = []; 
let weakSubjectsGlobal = []; 
let totalCompletedCount = 0;
let totalExtraCount = 0;
let currentPlanVersion = "";
let isRetryingWrongQuestions = false;

function goToGameMode() {
    const gameUrl = new URL("../game/game.(2).html", window.location.href);
    console.log("ゲームの移動先:", gameUrl.href);
    window.location.href = gameUrl.href;
}

// 現在の表示画面を管理 ("study" | "practice" | "mypage")
let currentScreen = "study";

// タイマー用変数
let timerInterval = null;
let timerSeconds = 25 * 60;
let isTimerRunning = false;

function getLocalDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// 表示モードの選択状態を取得する関数

// 現在のモードを取得
function getSelectedDisplayMode() {
    const selected = document.querySelector(
        'input[name="displayMode"]:checked'
    );
    return selected ? selected.value : "normal";
}

// ユーザー別の設定保存キー
function getGameModeStorageKey() {
    const userId = localStorage.getItem("loginUserId");
    return userId ? `gameModeEnabled_${userId}` : null;
}

// 保存済み設定を読み込む
function loadGameModeSetting() {
    const key = getGameModeStorageKey();
    const enabled = key && localStorage.getItem(key) === "true";

    const radio = document.querySelector(
        `input[name="displayMode"][value="${enabled ? "game" : "normal"}"]`
    );

    if (radio) radio.checked = true;

    updateDisplayModeUI(false);
}

// 表示更新と設定保存
function updateDisplayModeUI(shouldSave = true) {
    const mode = getSelectedDisplayMode();

    document.getElementById("card-mode-normal")
        ?.classList.toggle("selected", mode === "normal");

    document.getElementById("card-mode-game")
        ?.classList.toggle("selected", mode === "game");

    const gameButton = document.getElementById("game-mode-nav-btn");

    if (gameButton) {
        gameButton.style.display =
            mode === "game" ? "" : "none";
    }

    if (shouldSave) {
        const key = getGameModeStorageKey();

        if (key) {
            localStorage.setItem(key, String(mode === "game"));
        }

        recordSelectedMode();
    }
}



async function recordSelectedMode() {
    const token = localStorage.getItem("sessionToken");

    if (!token) return;

    const mode = getSelectedDisplayMode() === "game"
        ? "ゲーム"
        : "通常";

    try {
        const result = await gasRequest("recordModeChange", {
            token: token,
            mode: mode
        });

        if (result.success) {
            console.log("利用モードを記録しました:", mode);
        } else {
            console.error("モード記録失敗:", result.message);
        }
    } catch (error) {
        console.error("モード記録エラー:", error);
    }
}

window.onload = function () {
    const today = new Date();
    today.setDate(today.getDate() + 14);

    document.getElementById("test-date").value =
        getLocalDateString(today);

    updateWeakSubjectOptions();
    renderMiniCalendarPicker();
   loadGameModeSetting();
    

    // 学習計画の読み込みは
    // 新GASの保存・読み込み機能を実装してから追加する
};

/* --- ローカルストレージ保存 & 復元 --- */
function loadData() {
    const savedStr = localStorage.getItem('studyPlanData');
    if (!savedStr) return false;

    try {
        const data = JSON.parse(savedStr);
        daysArray = data.daysArray || [];
        if (data.testDate) testDateGlobal = new Date(data.testDate);
        baseSubjectsGlobal = data.baseSubjects || [];
        weakSubjectsGlobal = data.weakSubjects || [];
        defaultDailyHours = data.defaultDailyHours || 2;
        selectedOffDays = data.selectedOffDays || [];

        if (data.testDate) document.getElementById('test-date').value = data.testDate;
        if (data.subjectInputValue) document.getElementById('subject-input').value = data.subjectInputValue;
        if (data.defaultDailyHours) document.getElementById('daily-hours').value = data.defaultDailyHours;

        if (data.weakRatio) {
            const radio = document.querySelector(`input[name="weakRatio"][value="${data.weakRatio}"]`);
            if (radio) radio.checked = true;
        }

		loadGameModeSetting();

        updateWeakSubjectOptions();

        const checkboxes = document.querySelectorAll('#weak-subjects-checkboxes input');
        checkboxes.forEach(cb => {
            if (weakSubjectsGlobal.includes(cb.value)) cb.checked = true;
        });

        renderMiniCalendarPicker();
        
        // 学習計画画面の時だけ表示
        if (currentScreen === "study") {
            document.getElementById('result-layout').style.setProperty("display", "grid", "important");
        } else {
            document.getElementById('result-layout').style.setProperty("display", "none", "important");
        }
        document.getElementById('reset-plan-btn').style.display = 'block';
        
        renderCalendar();
        renderChecker();
        updateDashboard();
        updateSettingVisibility();

        return true;
    } catch (e) {
        console.error("データのロードに失敗しました", e);
        return false;
    }
}

// ===============================
// ステータスをGASから読み込み
// ===============================

async function loadStatusFromGAS() {
    const token = localStorage.getItem("sessionToken");
    if (!token) return;

    try {
        const result = await gasRequest("loadStatus", {
            token: token
        });

        if (result.success) {
            totalCompletedCount =
                Number(result.completedCount) || 0;

            totalExtraCount =
                Number(result.extraCount) || 0;

            renderChecker();
            renderMyPage();

            console.log("ステータスを新GASから読み込みました！");
        } else {
            console.error("ステータス読み込み失敗:", result.message);
        }
    } catch (error) {
        console.error("ステータス読み込みエラー:", error);
    }
}


// ===============================
// 連続学習日数をGASから読み込み
// ===============================

async function loadStreakFromGAS() {
    const token = localStorage.getItem("sessionToken");
    if (!token) return;

    try {
        const result = await gasRequest("loadStreak", {
            token: token
        });

        if (result.success) {
            const element = document.getElementById("dash-streak");

            if (element) {
                element.textContent = ` ${result.streak}日`;
            }

            console.log("連続学習日数:", result.streak);
        } else {
            console.error("連続学習日数の取得失敗:", result.message);
        }
    } catch (error) {
        console.error("連続学習日数の読み込みエラー:", error);
    }
}


// ===============================
// GASから保存済みの計画表を読み込み
// ===============================

async function loadPlanFromGAS() {
    const token = localStorage.getItem("sessionToken");
    if (!token) return false;

    try {
        const result = await gasRequest("loadPlan", {
            token: token
        });

        if (!result.success || !result.planJson) {
            return false;
        }

        const data = JSON.parse(result.planJson);
        currentPlanVersion = result.planVersion;

        if (!Array.isArray(data.daysArray)) {
            return false;
        }

        daysArray = data.daysArray;
        testDateGlobal = data.testDate
            ? new Date(data.testDate)
            : null;

        baseSubjectsGlobal = data.baseSubjects || [];
        weakSubjectsGlobal = data.weakSubjects || [];
        defaultDailyHours = data.defaultDailyHours || 2;
        selectedOffDays = data.selectedOffDays || [];

        if (data.testDate) {
            document.getElementById("test-date").value =
                data.testDate;
        }

        if (data.subjectInputValue) {
            document.getElementById("subject-input").value =
                data.subjectInputValue;
        }

        document.getElementById("daily-hours").value =
            defaultDailyHours;

        if (data.weakRatio) {
            const radio = document.querySelector(
                `input[name="weakRatio"][value="${data.weakRatio}"]`
            );
            if (radio) radio.checked = true;
        }

        updateWeakSubjectOptions();

        document.querySelectorAll(
            "#weak-subjects-checkboxes input"
        ).forEach(cb => {
            cb.checked = weakSubjectsGlobal.includes(cb.value);
        });

        // 画面の見た目だけを更新する
        // 読み込み直後の不要な再保存を防ぐ
        const mode = getSelectedDisplayMode();
        const cardNormal =
            document.getElementById("card-mode-normal");
        const cardGame =
            document.getElementById("card-mode-game");

        if (cardNormal && cardGame) {
            cardNormal.classList.toggle(
                "selected", mode === "normal"
            );
            cardGame.classList.toggle(
                "selected", mode === "game"
            );
        }

        const resultLayout =
            document.getElementById("result-layout");
        const resetButton =
            document.getElementById("reset-plan-btn");

        if (daysArray.length > 0) {
            resultLayout.style.setProperty(
                "display",
                currentScreen === "study" ? "grid" : "none",
                "important"
            );
            resetButton.style.display = "block";
        } else {
            resultLayout.style.setProperty(
                "display", "none", "important"
            );
            resetButton.style.display = "none";
        }

        renderMiniCalendarPicker();
        renderCalendar();
        renderChecker();
        updateDashboard();
        updateSettingVisibility();

        console.log("新GASから学習計画を読み込みました！");
        return true;

    } catch (error) {
        console.error("学習計画の読み込みエラー:", error);
        return false;
    }
}


async function saveAllLearningHistoryToGAS() {
    const promises = [];
    for (const d of daysArray) {
        const counts = getLearningCountsForDate(d.dateStr);
        if (counts.normalCount > 0 || counts.extraCount > 0) {
            promises.push(saveLearningHistoryToGAS(d.dateStr));
        }
    }
    await Promise.all(promises);
}

function updateTodayPlan() {
    if (daysArray.length === 0) return;
    const todayStr = getLocalDateString(new Date());
    const todayObj = daysArray.find(d => d.dateStr === todayStr);

    if (!todayObj) {
        renderChecker();
        updateDashboard();
        return;
    }

    renderChecker();
    renderCalendar();
    updateDashboard();
}

function resetSavedPlan() {
    if (confirm("保存されている計画と進捗履歴を削除してやり直しますか？")) {
        localStorage.removeItem('studyPlanData');
        location.reload();
    }
}

/* --- タイマー機能 --- */
function updateTimerDisplay() {
    const mins = Math.floor(timerSeconds / 60);
    const secs = timerSeconds % 60;
    document.getElementById('timer-display').innerText = 
        `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function startTimer() {
    if (isTimerRunning) return;
    isTimerRunning = true;
    timerInterval = setInterval(() => {
        if (timerSeconds > 0) {
            timerSeconds--;
            updateTimerDisplay();
        } else {
            clearInterval(timerInterval);
            isTimerRunning = false;
            alert("25分間の集中タイムが終了しました！休憩しましょう。");
        }
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
    isTimerRunning = false;
}

function resetTimer() {
    stopTimer();
    timerSeconds = 25 * 60;
    updateTimerDisplay();
}

/* --- ガイド（使い方）を開いて移動 --- */
function openGuide() {
    if (currentScreen !== "study") {
        showStudyPage();
    }
    const guideBox = document.getElementById('guide-box');
    const guideToggle = document.getElementById('guide-toggle');
    
    if (guideBox) {
        guideBox.style.display = 'block';
    }
    if (guideToggle) {
        guideToggle.scrollIntoView({ behavior: 'smooth' });
    }
}

/* --- ガイド表示切替（ボタン用） --- */
function toggleGuide() {
    const guide = document.getElementById('guide-box');
    guide.style.display = (guide.style.display === 'none' || guide.style.display === '') ? 'block' : 'none';
}

/* --- 設定エリアを開いて移動 --- */
function openSettings() {
    if (currentScreen !== "study") {
        showStudyPage();
    }
    const modeSec = document.getElementById('display-mode-section');
    const formSec = document.getElementById('form-section');
    const btn = document.getElementById('setting-toggle-btn');

    if (modeSec) modeSec.style.display = 'block';
    if (formSec) formSec.style.display = 'block';
    if (btn && btn.style.display !== 'none') {
        btn.textContent = '▲ 学習条件の設定を閉じる';
    }

    const target = (btn && btn.style.display !== 'none') ? btn : (modeSec || formSec);
    if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
    }
}

/* --- 設定エリアの折りたたみ開閉 --- */
function toggleSettings() {
    const modeSec = document.getElementById('display-mode-section');
    const formSec = document.getElementById('form-section');
    const btn = document.getElementById('setting-toggle-btn');
    
    if (!formSec || !btn) return;

    if (formSec.style.display === 'none' || formSec.style.display === '') {
        if (modeSec) modeSec.style.display = 'block';
        formSec.style.display = 'block';
        btn.textContent = '▲ 学習条件の設定を閉じる';
    } else {
        if (modeSec) modeSec.style.display = 'none';
        formSec.style.display = 'none';
        btn.textContent = '▼ 学習条件の設定（計画の変更）を開く';
    }
}

/* 計画の有無に応じた設定エリアの初期表示制御 */
function updateSettingVisibility() {
    const modeSec = document.getElementById('display-mode-section');
    const formSec = document.getElementById('form-section');
    const btn = document.getElementById('setting-toggle-btn');

    if (!btn || !formSec) return;

    // 学習計画（study）画面以外のときは絶対に非表示
    if (currentScreen !== "study") {
        btn.style.display = 'none';
        if (modeSec) modeSec.style.display = 'none';
        formSec.style.display = 'none';
        return;
    }

    if (daysArray && daysArray.length > 0) {
        btn.style.display = 'block';
        if (modeSec) modeSec.style.display = 'none';
        formSec.style.display = 'none';
        btn.textContent = '▼ 学習条件の設定（計画の変更）を開く';
    } else {
        btn.style.display = 'none';
        if (modeSec) modeSec.style.display = 'block';
        formSec.style.display = 'block';
    }
}

function updateWeakSubjectOptions() {
    const rawInput = document.getElementById('subject-input').value;
    const subjects = rawInput.split(/[,、]/).map(s => s.trim()).filter(s => s.length > 0);
    const container = document.getElementById('weak-subjects-checkboxes');
    
    const checked = [];
    container.querySelectorAll('input:checked').forEach(cb => checked.push(cb.value));

    container.innerHTML = '';
    subjects.forEach(sub => {
        const label = document.createElement('label');
        label.className = 'checkbox-item';
        
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.value = sub;
        if (checked.includes(sub) || weakSubjectsGlobal.includes(sub)) cb.checked = true;

        label.appendChild(cb);
        label.appendChild(document.createTextNode(` ${sub}`));
        container.appendChild(label);
    });
}

function renderMiniCalendarPicker() {
    const container = document.getElementById('mini-calendar-picker');
    container.innerHTML = '';

    const testDateVal = document.getElementById('test-date').value;
    if (!testDateVal) return;

    const testDate = new Date(testDateVal);
    const today = new Date();
    today.setHours(0,0,0,0);

    let current = new Date(today.getFullYear(), today.getMonth(), 1);
    const endMonth = new Date(testDate.getFullYear(), testDate.getMonth(), 1);
    const testDateStr = getLocalDateString(testDate);

    while (current <= endMonth) {
        const year = current.getFullYear();
        const month = current.getMonth();

        const monthHeader = document.createElement('div');
        monthHeader.className = 'mini-month-header';
        monthHeader.innerText = `${year}年 ${month + 1}月`;
        container.appendChild(monthHeader);

        const grid = document.createElement('div');
        grid.className = 'mini-calendar-grid';

        const weekDays = ['日', '月', '火', '水', '木', '金', '土'];
        weekDays.forEach(wd => {
            const head = document.createElement('div');
            head.className = 'mini-header-day';
            head.innerText = wd;
            grid.appendChild(head);
        });

        const firstDayIndex = new Date(year, month, 1).getDay();
        const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

        for (let i = 0; i < firstDayIndex; i++) {
            const empty = document.createElement('div');
            empty.className = 'mini-day empty';
            grid.appendChild(empty);
        }

        for (let day = 1; day <= totalDaysInMonth; day++) {
            const cellDate = new Date(year, month, day);
            const cellDateStr = getLocalDateString(cellDate);
            const dayCell = document.createElement('div');
            dayCell.className = 'mini-day';

            const isTest = cellDateStr === testDateStr;
            const isOff = selectedOffDays.includes(cellDateStr);
            const isOutOfRange = cellDate < today || cellDate > testDate;

            dayCell.innerText = `${day}`;

            if (isOutOfRange) {
                dayCell.classList.add('disabled');
            } else if (isTest) {
                dayCell.classList.add('test-day');
                dayCell.innerText += ' (テスト)';
            } else {
                if (isOff) dayCell.classList.add('off');

                dayCell.onclick = function() {
                    if (selectedOffDays.includes(cellDateStr)) {
                        selectedOffDays = selectedOffDays.filter(d => d !== cellDateStr);
                        dayCell.classList.remove('off');
                    } else {
                        selectedOffDays.push(cellDateStr);
                        dayCell.classList.add('off');
                    }
                };
            }

            grid.appendChild(dayCell);
        }

        container.appendChild(grid);
        current.setMonth(current.getMonth() + 1);
    }
}

function updateDashboard() {
    const testDateVal = document.getElementById('test-date').value;
    const daysLeftElem = document.getElementById('dash-days-left');
    const todayTasksElem = document.getElementById('dash-today-tasks');

    if (testDateVal) {
        const today = new Date();
        today.setHours(0,0,0,0);
        const target = new Date(testDateVal);
        const diffTime = target - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        daysLeftElem.innerText = diffDays > 0 ? `${diffDays} 日` : "本日本番！";
    } else {
        daysLeftElem.innerText = "-- 日";
    }
    
    const todayStr = getLocalDateString(new Date());
    const todayObj = daysArray.find(d => d.dateStr === todayStr);

    if (todayObj && todayObj.tasks) {
        todayTasksElem.innerText = `${todayObj.tasks.length} コマ`;
    } else {
        todayTasksElem.innerText = "0 コマ";
    }
}

/* --- 計画表の自動生成ボタン --- */
async function generatePlan() {
    const testDateVal = document.getElementById('test-date').value;
    if (!testDateVal) {
        alert("テスト日を入力してください。");
        return;
    }

    testDateGlobal = new Date(testDateVal);
    const today = new Date();
    today.setHours(0,0,0,0);

    if (testDateGlobal <= today) {
        alert("テスト日は明日以降の日付を設定してください。");
        return;
    }

    const rawSubjects = document.getElementById('subject-input').value;
    baseSubjectsGlobal = rawSubjects.split(/[,、]/).map(s => s.trim()).filter(s => s.length > 0);
    
    if (baseSubjectsGlobal.length === 0) {
        alert("教科を1つ以上入力してください。");
        return;
    }

    weakSubjectsGlobal = [];
    document.querySelectorAll('#weak-subjects-checkboxes input:checked').forEach(cb => {
        weakSubjectsGlobal.push(cb.value);
    });

    defaultDailyHours = parseInt(document.getElementById('daily-hours').value) || 2;

    daysArray = [];
    let curr = new Date(today);
    while (curr <= testDateGlobal) {
        const dateStr = getLocalDateString(curr);
        const isTest = dateStr === getLocalDateString(testDateGlobal);
        const isOff = selectedOffDays.includes(dateStr);

        daysArray.push({
            dateStr: dateStr,
            isTestDay: isTest,
            isOffDay: isOff,
            customHours: undefined,
            tasks: []
        });

        curr.setDate(curr.getDate() + 1);
    }

    reallocatePlan(true);

    document.getElementById('result-layout')
        .style.setProperty('display', 'grid', 'important');
    document.getElementById('reset-plan-btn').style.display = 'block';
    renderCalendar();
    renderChecker();
    updateDashboard();

  const saved = await saveData();

updateSettingVisibility();

if (!saved) {
    alert("計画表を保存できませんでした。もう一度試してください。");
    return;
}

document.getElementById('result-layout')
    .scrollIntoView({ behavior: 'smooth' });
}

/* --- 計画の割り当て処理 --- */
function reallocatePlan(isNewPlan = false) {
    const planType = 'transfer';
    const weakRatioInput = document.querySelector('input[name="weakRatio"]:checked');
    const weakMultiplier = weakRatioInput ? parseFloat(weakRatioInput.value) : 2.0;

    const weights = {};
    let totalWeight = 0;
    baseSubjectsGlobal.forEach(sub => {
        const weight = weakSubjectsGlobal.includes(sub) ? weakMultiplier : 1;
        weights[sub] = weight;
        totalWeight += weight;
    });

    const availableDays = daysArray.filter(d => !d.isTestDay && !d.isOffDay);
    const totalDaysCount = daysArray.filter(d => !d.isTestDay).length;

    let totalTargetSlots = totalDaysCount * defaultDailyHours;

    if (isNewPlan || studyPool.length === 0) {
        let allocatedSlots = {};
        if (totalTargetSlots >= baseSubjectsGlobal.length) {
            let remaining = totalTargetSlots - baseSubjectsGlobal.length;
            baseSubjectsGlobal.forEach(sub => {
                allocatedSlots[sub] = 1;
            });

            if (remaining > 0) {
                let extraSum = 0;
                baseSubjectsGlobal.forEach(sub => {
                    const ratio = weights[sub] / totalWeight;
                    const extra = Math.round(remaining * ratio);
                    allocatedSlots[sub] += extra;
                    extraSum += extra;
                });

                let diff = (baseSubjectsGlobal.length + extraSum) - totalTargetSlots;
                if (diff !== 0 && baseSubjectsGlobal.length > 0) {
                    allocatedSlots[baseSubjectsGlobal[0]] -= diff;
                }
            }
        } else {
            baseSubjectsGlobal.forEach(sub => {
                allocatedSlots[sub] = 1;
            });
        }

        studyPool = [];
        baseSubjectsGlobal.forEach(sub => {
            const count = allocatedSlots[sub] || 1;
            for (let i = 0; i < count; i++) {
                studyPool.push(sub);
            }
        });

        shuffleArray(studyPool);
    }

    let poolIndex = 0;

    daysArray.forEach(d => {
        if (d.isTestDay) {
            d.tasks = [{ subject: '★ テスト本番！', done: false, isTest: true }];
            return;
        }

        if (d.isOffDay) {
            d.tasks = [];
            return;
        }

        let hours = defaultDailyHours;
        if (availableDays.length > 0) {
            const baseH = Math.floor(totalTargetSlots / availableDays.length);
            const remainder = totalTargetSlots % availableDays.length;
            const dayIndex = availableDays.indexOf(d);
            hours = dayIndex < remainder ? baseH + 1 : baseH;
        }

        if (d.customHours !== undefined) {
            hours = d.customHours;
        }

        const oldDoneMap = {};
        if (d.tasks) {
            d.tasks.forEach(t => { 
                oldDoneMap[t.subject] = t.done;
            });
        }

        let randomSubjects = shuffleArray([...baseSubjectsGlobal]);

        d.tasks = [];
        for (let h = 0; h < hours; h++) {
            let sub = "";

            if (poolIndex < studyPool.length) {
                sub = studyPool[poolIndex];
                poolIndex++;
            } else {
                sub = randomSubjects[h % randomSubjects.length];
            }

            d.tasks.push({
                subject: sub,
                done: oldDoneMap[sub] !== undefined ? oldDoneMap[sub] : false
            });
        }
    });
}

/* --- チェッカーのチェック切り替え --- */
async function toggleTaskDone(dateStr, taskIndex) {
    const dayObj = daysArray.find(d => d.dateStr === dateStr);

    if (dayObj && dayObj.tasks[taskIndex]) {
        const task = dayObj.tasks[taskIndex];
        const wasDone = task.done;

        task.done = !task.done;

        if (!wasDone && task.done) {
            if (task.isExtra) {
                totalExtraCount++;
            } else {
                totalCompletedCount++;
            }
        }

        if (wasDone && !task.done) {
            if (task.isExtra) {
                totalExtraCount--;
            } else {
                totalCompletedCount--;
            }
        }

        renderChecker();
		renderCalendar();
		renderMyPage();

		const planSaved = await saveData();

if (!planSaved) {
    // 保存できなかったので、GASの最新状態に戻す
    await loadPlanFromGAS();
    await loadStatusFromGAS();
    return;
}

await saveStatusToGAS();
		
        const historySaved = await saveLearningHistoryToGAS(dateStr);

        if (historySaved) {
            await loadStreakFromGAS();
        }
    }
}


function addExtraStudy() {
    const todayStr = getLocalDateString(new Date());
    const todayObj = daysArray.find(d => d.dateStr === todayStr);

    if (!todayObj) {
        alert("今日の学習計画がありません！");
        return;
    }

    if (todayObj.isTestDay) {
        alert("今日はテスト本番なので、追加の勉強はできません！");
        return;
    }

    if (todayObj.isOffDay) {
        alert("今日はお休みの日です！");
        return;
    }

    const todaySubjects = todayObj.tasks
        .filter(task => !task.isTest)
        .map(task => task.subject);

    let candidates = baseSubjectsGlobal.filter(
        subject => !todaySubjects.includes(subject)
    );

    if (candidates.length === 0) {
        candidates = [...baseSubjectsGlobal];
    }

    const subject = candidates[
        Math.floor(Math.random() * candidates.length)
    ];

    todayObj.tasks.push({
        subject: subject,
        done: false,
        isExtra: true
    });

    renderChecker();
    renderCalendar();
    updateDashboard();

    saveData();

    alert(`${subject}を追加しました！`);
}

function renderChecker() {
    const todayStr = getLocalDateString(new Date());
    
    const todayBox = document.getElementById('today-tasks-box');
    const upcomingBox = document.getElementById('upcoming-tasks-box');
    const pastBox = document.getElementById('past-tasks-box');

    if (todayBox) todayBox.innerHTML = '';
    if (upcomingBox) upcomingBox.innerHTML = '';
    if (pastBox) pastBox.innerHTML = '';

    let totalTasks = 0;
    let checkedTasks = 0;

    daysArray.forEach(d => {
        if (d.isTestDay) return;

        d.tasks.forEach((task, idx) => {
            totalTasks++;
            if (task.done) checkedTasks++;

            const item = document.createElement('div');
            item.className = 'checker-item';

            const label = document.createElement('label');
            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.checked = task.done;
            cb.onchange = () => toggleTaskDone(d.dateStr, idx);

            const dateBadge = document.createElement('span');
            dateBadge.className = 'task-date-badge';
            dateBadge.innerText = d.dateStr;

            const subjectText = document.createElement('span');
            subjectText.className = 'task-subject-text';
            if (task.done) subjectText.classList.add('done');
            subjectText.innerText = task.subject;

            label.appendChild(cb);
            label.appendChild(dateBadge);
            label.appendChild(subjectText);
            item.appendChild(label);

            if (d.dateStr === todayStr) {
                if (todayBox) todayBox.appendChild(item);
            } else if (d.dateStr > todayStr) {
                if (upcomingBox) upcomingBox.appendChild(item);
            } else {
                if (pastBox) pastBox.appendChild(item);
            }
        });
    });

    if (todayBox && todayBox.children.length === 0) {
        todayBox.innerHTML = '<p class="empty-msg">今日の勉強タスクはありません（お休みまたはテスト日）</p>';
    }

    const percent = totalTasks > 0 ? Math.round((checkedTasks / totalTasks) * 100) : 0;
    const percentDisp = document.getElementById('percent-disp');
    const barFillDisp = document.getElementById('bar-fill-disp');
    if (percentDisp) percentDisp.innerText = `${checkedTasks} / ${totalTasks} コマ (${percent}%)`;
    if (barFillDisp) barFillDisp.style.width = `${percent}%`;

    const level = Math.floor(
        (totalCompletedCount + totalExtraCount) / 3
    ) + 1;

    let title = "のび太級";
    if (level >= 15) title = "勉強神級";
    else if (level >= 10) title = "天才級";
    else if (level >= 7) title = "秀才級";
    else if (level >= 4) title = "努力家級";
    else if (level >= 2) title = "見習い級";

    const levelDisp = document.getElementById('level-disp');
    if (levelDisp) levelDisp.innerText = `Lv.${level}`;

    const titleDisp = document.getElementById('title-disp');
    if (titleDisp) titleDisp.innerText = title;
}


function toggleUpcomingSchedule() {
    const section = document.querySelector(".upcoming-section");
    const button = document.getElementById("upcoming-toggle-btn");
    const text = document.getElementById("upcoming-toggle-text");

    if (!section || !button || !text) return;

    const isOpen = section.classList.toggle("is-open");

    button.setAttribute("aria-expanded", String(isOpen));

    text.textContent = isOpen
        ? "－ これからの予定を閉じる"
        : "＋ これからの予定を見る";
}


function renderCalendar() {
    const container = document.getElementById('calendar-container');
    if (!container) return;
    container.innerHTML = '';

    if (!testDateGlobal || daysArray.length === 0) return;

    const testDateStr = getLocalDateString(testDateGlobal);
    const todayStr = getLocalDateString(new Date());
    const startDate = new Date(daysArray[0].dateStr);
    const endDate = new Date(testDateGlobal);

    let current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const endMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

    while (current <= endMonth) {
        const year = current.getFullYear();
        const month = current.getMonth();

        const monthHeader = document.createElement('div');
        monthHeader.className = 'calendar-month-header';
        monthHeader.innerText = `${year}年 ${month + 1}月`;
        container.appendChild(monthHeader);

        const grid = document.createElement('div');
        grid.className = 'calendar-grid';

        const weekDays = ['日', '月', '火', '水', '木', '金', '土'];
        weekDays.forEach(wd => {
            const head = document.createElement('div');
            head.className = 'calendar-header-day';
            head.innerText = wd;
            grid.appendChild(head);
        });

        const firstDayIndex = new Date(year, month, 1).getDay();
        const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

        for (let i = 0; i < firstDayIndex; i++) {
            const empty = document.createElement('div');
            empty.className = 'calendar-day empty';
            grid.appendChild(empty);
        }

        for (let day = 1; day <= totalDaysInMonth; day++) {
            const cellDate = new Date(year, month, day);
            const cellDateStr = getLocalDateString(cellDate);
            const dayCell = document.createElement('div');
            dayCell.className = 'calendar-day';

            const dayObj = daysArray.find(d => d.dateStr === cellDateStr);

            if (cellDateStr === todayStr) dayCell.classList.add('today');
            if (cellDateStr === testDateStr) dayCell.classList.add('test-day-cell');
            if (dayObj && dayObj.isOffDay) dayCell.classList.add('off-day');

            if (dayObj && cellDateStr >= todayStr && cellDateStr !== testDateStr) {
                dayCell.onclick = function() {
                    let currentHours = dayObj.isOffDay ? 0 : (dayObj.customHours !== undefined ? dayObj.customHours : defaultDailyHours);
                    let nextHours = (currentHours + 1) % 11;

                    if (nextHours === 0) {
                        dayObj.isOffDay = true;
                        dayObj.customHours = 0;
                        dayObj.tasks = [];
                    } else {
                        dayObj.isOffDay = false;
                        dayObj.customHours = nextHours;

                        let newSubjects = shuffleArray([...baseSubjectsGlobal]);
                        dayObj.tasks = [];
                        for (let h = 0; h < nextHours; h++) {
                            dayObj.tasks.push({
                                subject: newSubjects[h % newSubjects.length],
                                done: false
                            });
                        }
                    }

                    reallocatePlan(false);
                    renderCalendar();
                    renderChecker();
                    updateDashboard();
                    saveData();
                };
            }

            const numLabel = document.createElement('div');
            numLabel.className = 'day-num';
            if (cellDateStr === todayStr) numLabel.classList.add('today-label');
            if (cellDateStr === testDateStr) numLabel.classList.add('test-label');

            let labelText = `${day}`;
            if (cellDateStr === todayStr) labelText += " (今日)";
            numLabel.innerText = labelText;

            if (dayObj && !dayObj.isOffDay && cellDateStr !== testDateStr) {
                const hours = dayObj.tasks ? dayObj.tasks.length : defaultDailyHours;
                const badge = document.createElement('span');
                badge.className = 'hours-badge';
                badge.innerText = `${hours}h枠`;
                numLabel.appendChild(badge);
            }
            dayCell.appendChild(numLabel);

            const taskContainer = document.createElement('div');
            taskContainer.className = 'task-container';

            if (dayObj) {
                if (dayObj.isOffDay) {
                    const el = document.createElement('div');
                    el.className = 'task-item no-study-day';
                    el.innerText = "用事（お休み）";
                    taskContainer.appendChild(el);
                } else {
                    dayObj.tasks.forEach(task => {
                        const el = document.createElement('div');
                        el.className = task.done ? 'task-item done' : 'task-item todo';
                        el.innerText = `${task.subject} (1h)`;
                        taskContainer.appendChild(el);
                    });
                }
            } else if (cellDateStr === testDateStr) {
                const el = document.createElement('div');
                el.className = 'task-item test-day';
                el.innerText = "★ テスト本番！";
                taskContainer.appendChild(el);
            }

            dayCell.appendChild(taskContainer);
            grid.appendChild(dayCell);
        }

        container.appendChild(grid);
        current.setMonth(current.getMonth() + 1);
    }
}

/* ログイン、新規登録、パスワード変更処理 */

window.addEventListener("DOMContentLoaded", async function () {
    const token = localStorage.getItem("sessionToken");

    const gradePage = document.getElementById("grade-select-page");
    const loginPage = document.getElementById("login-page");
    const mainPage = document.getElementById("main-page");

    // 認証確認中はメイン画面を表示しない
    gradePage.style.display = "none";
    loginPage.style.display = "none";
    mainPage.style.display = "none";

    if (!token) {
        clearLoginData();
        gradePage.style.display = "flex";
        return;
    }

    try {
        const result = await gasRequest("checkSession", {
            token: token
        });

        if (!result.success) {
            clearLoginData();
            gradePage.style.display = "flex";
            return;
        }

        localStorage.setItem("loginUserId", result.userId);
        localStorage.setItem("loginUserName", result.name);
        localStorage.setItem("selectedGrade", result.grade);

        mainPage.style.display = "block";
        showLoginStatus();
        loadGameModeSetting();
        await loadPlanFromGAS();
        await loadStatusFromGAS();
        await loadStreakFromGAS();

    } catch (error) {
        console.error("自動ログイン確認エラー:", error);

        // 通信エラーの場合はトークンを消さずに残す
        gradePage.style.display = "flex";
    }
});


// ===============================
// 学年ごとのGAS URL
// ===============================
let GAS_URL = "";

const NEW_GAS_URL = "https://script.google.com/macros/s/AKfycbz9957OLdGKzmxSg4BlTvh53HZsAYIW60CoecZbDetPemG04IDmYxKhpcey2x9m9FRl/exec";

async function gasRequest(action, data = {}) {
    const response = await fetch(NEW_GAS_URL, {
        method: "POST",
        headers: {
            "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify({
            ...data,
            action
        })
    });

    if (!response.ok) {
        throw new Error("通信エラー：" + response.status);
    }

    return await response.json();
}

function showMessage(elementId, message, isError = false) {
    const element = document.getElementById(elementId);
    if (!element) return;

    element.textContent = message;

    element.classList.remove(
        "message-success",
        "message-error"
    );

    element.classList.add(
        isError ? "message-error" : "message-success"
    );
}

// ===============================
// 学年を選択
// ===============================
function selectGrade(grade) {
    localStorage.setItem("selectedGrade", grade);

    document.getElementById("grade-select-page").style.display = "none";
    document.getElementById("login-page").style.display = "flex";
}



async function login() {
    const userId = document.getElementById("login-id").value.trim();
    const password = document.getElementById("login-password").value;
    const grade = localStorage.getItem("selectedGrade");

    // 前のメッセージを消す
    showMessage("login-error", "");

    if (!grade || !userId || !password) {
        showMessage(
            "login-error",
            "学年・ユーザーID・パスワードを確認してね。",
            true
        );
        return;
    }

    try {
        const result = await gasRequest("login", {
            grade,
            userId,
            password
        });

        if (!result.success) {
            showMessage(
                "login-error",
                result.message || "ログインできませんでした。",
                true
            );
            return;
        }

        // ログイン情報を保存
        localStorage.setItem("loginUserId", result.userId);
        localStorage.setItem("loginUserName", result.name);
        localStorage.setItem("selectedGrade", result.grade);
        localStorage.setItem("sessionToken", result.token);

        // メイン画面へ移動
        document.getElementById("login-page").style.display = "none";
        document.getElementById("main-page").style.display = "block";
        document.getElementById("login-password").value = "";

        showLoginStatus();
        loadGameModeSetting();

       await loadPlanFromGAS();
       await loadStatusFromGAS();
       await loadStreakFromGAS();

    } catch (error) {
        console.error("ログインエラー:", error);

        showMessage(
            "login-error",
            "通信に失敗しました。",
            true
        );
    }
}



function hideAllAuthPages() {
    document.getElementById("login-page").style.display = "none";
    document.getElementById("register-page").style.display = "none";
    document.getElementById("reset-page").style.display = "none";
}

function showLogin() {
    hideAllAuthPages();
    document.getElementById("login-page").style.display = "flex";
}

function showRegister() {
    hideAllAuthPages();
    document.getElementById("register-page").style.display = "flex";
}

function showResetPassword() {
    hideAllAuthPages();
    document.getElementById("reset-page").style.display = "flex";
}



async function registerUser() {
    const name = document.getElementById("register-name").value.trim();
    const userId = document.getElementById("register-id").value.trim();
    const password = document.getElementById("register-password").value;
    const grade = localStorage.getItem("selectedGrade");

    // 前のメッセージを消す
    showMessage("register-error", "");

    if (!grade || !name || !userId || !password) {
        showMessage(
            "register-error",
            "すべての項目を入力してね。",
            true
        );
        return;
    }

    if (password.length < 8) {
        showMessage(
            "register-error",
            "パスワードは8文字以上にしてね。",
            true
        );
        return;
    }

    try {
        const result = await gasRequest("register", {
            grade,
            name,
            userId,
            password
        });

        if (!result.success) {
            showMessage(
                "register-error",
                result.message || "登録に失敗しました。",
                true
            );
            return;
        }

        // 登録成功後はログイン画面へ移動
        document.getElementById("register-password").value = "";
        document.getElementById("login-id").value = userId;

        showLogin();

        // 成功メッセージは緑色
        showMessage(
            "login-error",
            "登録できたよ！パスワードを入力してログインしてね。",
            false
        );

    } catch (error) {
        console.error("新規登録エラー:", error);

        showMessage(
            "register-error",
            "通信に失敗しました。",
            true
        );
    }
}



function showLoginStatus() {
    const userName = localStorage.getItem("loginUserName");
    const status = document.getElementById("login-status");

    if (userName) {
        status.textContent = `ログイン中：${userName}さん`;
    } else {
        status.textContent = "ログイン中";
    }
}


function clearLoginData() {
    localStorage.removeItem("loginUserId");
    localStorage.removeItem("loginUserName");
    localStorage.removeItem("selectedGrade");
    localStorage.removeItem("sessionToken");

    // 以前の共通保存データを表示しないようにする
    localStorage.removeItem("studyPlanData");

    daysArray = [];
    studyPool = [];
    totalCompletedCount = 0;
    totalExtraCount = 0;
}


async function logout() {
    const token = localStorage.getItem("sessionToken");

    // 先に端末のログイン状態を消す
    clearLoginData();

    document.getElementById("main-page").style.display = "none";
    document.getElementById("login-page").style.display = "none";
    document.getElementById("register-page").style.display = "none";
    document.getElementById("reset-page").style.display = "none";
    document.getElementById("grade-select-page").style.display = "flex";

    document.getElementById("login-id").value = "";
    document.getElementById("login-password").value = "";
    document.getElementById("login-status").textContent = "";

    if (token) {
        try {
            await gasRequest("logout", { token });
        } catch (error) {
            console.error("GASログアウトエラー:", error);
        }
    }
}


// ===============================
// ステータスをGASに保存
// ===============================

async function saveStatusToGAS() {
    const token = localStorage.getItem("sessionToken");
    if (!token) return;

    try {
        const result = await gasRequest("saveStatus", {
            token: token,
            completedCount: totalCompletedCount,
            extraCount: totalExtraCount
        });

        if (result.success) {
            console.log("ステータスを新GASに保存しました！");
        } else {
            console.error("ステータス保存失敗:", result.message);
        }
    } catch (error) {
        console.error("ステータス保存エラー:", error);
    }
}


// ===============================
// 指定した日の学習コマ数を取得
// ===============================
function getLearningCountsForDate(dateStr) {
    const dayObj = daysArray.find(d => d.dateStr === dateStr);

    if (!dayObj || !dayObj.tasks) {
        return { normalCount: 0, extraCount: 0 };
    }

    let normalCount = 0;
    let extraCount = 0;

    dayObj.tasks.forEach(task => {
        if (!task.done || task.isTest) return;

        if (task.isExtra) {
            extraCount++;
        } else {
            normalCount++;
        }
    });

    return { normalCount, extraCount };
}

// ===============================
// 今日の学習コマ数を取得
// ===============================
function getTodayLearningCounts() {
    const todayStr = getLocalDateString(new Date());
    return getLearningCountsForDate(todayStr);
}

// ===============================
// 学習履歴をGASに保存
// ===============================

async function saveLearningHistoryToGAS(dateStr) {
    const token = localStorage.getItem("sessionToken");
    if (!token) return;

    const counts = getLearningCountsForDate(dateStr);

    try {
        const result = await gasRequest("saveLearningHistory", {
            token: token,
            date: dateStr,
            normalCount: counts.normalCount,
            extraCount: counts.extraCount
        });

        if (result.success) {
            console.log(dateStr + "の学習履歴を保存しました！");
        } else {
            console.error("学習履歴保存失敗:", result.message);
        }

        return result.success;
    } catch (error) {
        console.error("学習履歴保存エラー:", error);
        return false;
    }
}


// ===============================
// 学習計画を保存
// ===============================


async function saveData() {
   if (daysArray.length === 0) return false;

    const weakRatioElem = document.querySelector(
        'input[name="weakRatio"]:checked'
    );

    const weakRatioVal = weakRatioElem
        ? weakRatioElem.value
        : "2.0";

    const dataToSave = {
        daysArray: daysArray,
        testDate: testDateGlobal
            ? getLocalDateString(testDateGlobal)
            : null,
        baseSubjects: baseSubjectsGlobal,
        weakSubjects: weakSubjectsGlobal,
        defaultDailyHours: defaultDailyHours,
        selectedOffDays: selectedOffDays,
        planType: "transfer",
        displayMode: getSelectedDisplayMode(),
        weakRatio: weakRatioVal,
        subjectInputValue:
            document.getElementById("subject-input").value
    };

    const userId = localStorage.getItem("loginUserId");
    const token = localStorage.getItem("sessionToken");

if (!userId || !token) {
    console.warn("ログインしていないため保存できません");
    return false;
}

    try {
        const result = await gasRequest("savePlan", {
            token: token,
            mode: getSelectedDisplayMode() === "game"
                ? "ゲーム"
                : "通常",
            displayMode: getSelectedDisplayMode(),
            testDate: dataToSave.testDate,
            offDays: selectedOffDays,
            subjects: baseSubjectsGlobal,
            weakSubjects: weakSubjectsGlobal,
            weakRatio: weakRatioVal,
            defaultDailyHours: defaultDailyHours,
            planJson: JSON.stringify(dataToSave),
			planVersion: currentPlanVersion
        });

        if (result.success) {
			currentPlanVersion = result.planVersion;
            localStorage.setItem(
                "studyPlanData_" + userId,
                JSON.stringify(dataToSave)
            );

            console.log("新しいスプレッドシートに保存しました！");
            return true;
  } else {
    if (result.conflict) {
        alert(
            "別の画面で学習計画が更新されています。\n" +
            "古い計画で上書きしないよう、保存を中止しました。\n" +
            "ページを再読み込みしてください。"
        );
    }

    console.error("学習計画の保存失敗:", result.message);
    return false;
}

    } catch (error) {
        console.error("学習計画の保存エラー:", error);
        return false;
    }
}



function renderMyPage() {
    const userName = localStorage.getItem("loginUserName") || "ゲスト";
    document.getElementById("mypage-name").textContent = userName;

    document.getElementById("stat-completed").textContent = `${totalCompletedCount} コマ`;
    document.getElementById("stat-extra").textContent = `${totalExtraCount} コマ`;

    const totalStudyMinutes = (totalCompletedCount + totalExtraCount) * 60;
    const totalStudyHours = Math.floor(totalStudyMinutes / 60);
    const totalStudyMinutesRest = totalStudyMinutes % 60;

    document.getElementById("stat-study-time").textContent =
        totalStudyMinutesRest === 0
            ? `${totalStudyHours}時間`
            : `${totalStudyHours}時間${totalStudyMinutesRest}分`;

    const totalCount = totalCompletedCount + totalExtraCount;
    const level = Math.floor(totalCount / 3) + 1;

    document.getElementById("mypage-level-disp").textContent = `Lv.${level}`;

    let title = "のび太級";
    if (level >= 15) title = "勉強神級";
    else if (level >= 10) title = "天才級";
    else if (level >= 7) title = "秀才級";
    else if (level >= 4) title = "努力家級";
    else if (level >= 2) title = "見習い級";

    document.getElementById("mypage-title-disp").textContent = title;

    const currentLevelCount = totalCount % 3;
    const percent = Math.round((currentLevelCount / 3) * 100);

    document.getElementById("mypage-bar-fill-disp").style.width = `${percent}%`;
    document.getElementById("mypage-percent-disp").textContent = `${totalCount} コマ`;

    renderLearningHistory();
}

// ===============================
// マイページ：学習記録を表示
// ===============================
function renderLearningHistory() {
    const container = document.getElementById("learning-history-list");
    if (!container) return;

    container.innerHTML = "";
    const records = [];

    daysArray.forEach(day => {
        if (!day.tasks || day.tasks.length === 0) return;

        const completedTasks = day.tasks.filter(task =>
            task.done && !task.isTest
        );

        if (completedTasks.length === 0) return;

        const subjectCounts = {};

        completedTasks.forEach(task => {
            if (!subjectCounts[task.subject]) {
                subjectCounts[task.subject] = { normal: 0, extra: 0 };
            }

            if (task.isExtra) {
                subjectCounts[task.subject].extra++;
            } else {
                subjectCounts[task.subject].normal++;
            }
        });

        records.push({
            date: day.dateStr,
            subjects: subjectCounts,
            totalCount: completedTasks.length
        });
    });

    records.sort((a, b) => b.date.localeCompare(a.date));

    if (records.length === 0) {
        container.innerHTML = '<p class="empty-msg">まだ学習記録がありません。</p>';
        return;
    }

    records.forEach(record => {
        const dateBox = document.createElement("div");
        dateBox.className = "learning-history-item";

        const dateTitle = document.createElement("h4");
        const dateParts = record.date.split("-");
        dateTitle.textContent = `${Number(dateParts[1])}月${Number(dateParts[2])}日`;
        dateBox.appendChild(dateTitle);

        Object.entries(record.subjects).forEach(([subject, counts]) => {
            const row = document.createElement("div");
            row.className = "learning-history-subject";

            let text = `${subject} ${counts.normal + counts.extra}コマ`;
            if (counts.extra > 0) {
                text += `（追加 ${counts.extra}コマ）`;
            }

            row.textContent = text;
            dateBox.appendChild(row);
        });

        const dailyMinutes = record.totalCount * 60;
        const dailyHours = Math.floor(dailyMinutes / 60);
        const dailyMinutesRest = dailyMinutes % 60;

        const timeRow = document.createElement("div");
        timeRow.className = "learning-history-total";

        if (dailyMinutesRest === 0) {
            timeRow.textContent = `勉強時間：${dailyHours}時間`;
        } else {
            timeRow.textContent = `勉強時間：${dailyHours}時間${dailyMinutesRest}分`;
        }

        dateBox.appendChild(timeRow);
        container.appendChild(dateBox);
    });
}


/* =========================
   点数比較機能
========================= */

let scoreComparisonChart = null;

// 学習計画で設定した教科を取得
function getScoreComparisonSubjects() {
    const subjectSet = new Set();

    // 学習計画の教科入力欄から取得
    const subjectInput = document.getElementById("subjects");

    if (subjectInput && subjectInput.value.trim()) {
        subjectInput.value
            .split(/[,，、\n]/)
            .map(subject => subject.trim())
            .filter(Boolean)
            .forEach(subject => subjectSet.add(subject));
    }

    // 作成済みの学習計画からも取得
    if (typeof daysArray !== "undefined" && Array.isArray(daysArray)) {
        daysArray.forEach(day => {
            if (!Array.isArray(day.tasks)) return;

            day.tasks.forEach(task => {
                if (task.subject && !task.isTest) {
                    subjectSet.add(task.subject.trim());
                }
            });
        });
    }

    return [...subjectSet].filter(Boolean);
}

// マイページを開いたときに教科の入力欄を作成
function renderScoreComparison() {
    const container = document.getElementById("score-input-list");
    if (!container) return;

    const subjects = getScoreComparisonSubjects();

    container.innerHTML = "";

    if (subjects.length === 0) {
        container.innerHTML =
            '<p class="score-chart-message">' +
            '先に学習計画で教科を設定してください。' +
            '</p>';
        return;
    }

    subjects.forEach((subject, index) => {
        const card = document.createElement("div");
        card.className = "score-input-card";

        const name = document.createElement("div");
        name.className = "score-subject-name";
        name.textContent = subject;

        const myField = document.createElement("div");
        myField.className = "score-input-field";

        const myLabel = document.createElement("label");
        myLabel.textContent = "自分の点数";

        const myInput = document.createElement("input");
        myInput.type = "number";
        myInput.min = "0";
        myInput.max = "100";
        myInput.step = "1";
        myInput.placeholder = "0～100";
        myInput.id = `my-score-${index}`;
        myInput.setAttribute("aria-label", subject + "の自分の点数");

        myField.appendChild(myLabel);
        myField.appendChild(myInput);

        const averageField = document.createElement("div");
        averageField.className = "score-input-field";

        const averageLabel = document.createElement("label");
        averageLabel.textContent = "平均点";

        const averageInput = document.createElement("input");
        averageInput.type = "number";
        averageInput.min = "0";
        averageInput.max = "100";
        averageInput.step = "1";
        averageInput.placeholder = "0～100";
        averageInput.id = `average-score-${index}`;
        averageInput.setAttribute("aria-label", subject + "の平均点");

        averageField.appendChild(averageLabel);
        averageField.appendChild(averageInput);

        card.appendChild(name);
        card.appendChild(myField);
        card.appendChild(averageField);

        container.appendChild(card);
    });

    // 教科の変更後に古いチャートを残さない
    if (scoreComparisonChart) {
        scoreComparisonChart.destroy();
        scoreComparisonChart = null;
    }

    const message = document.getElementById("score-chart-message");
    if (message) {
        message.textContent =
            "点数を入力してチャートを表示してね。";
    }
}

// チャートを表示
function showScoreChart() {
    if (typeof Chart === "undefined") {
        alert("グラフ機能を読み込めませんでした。インターネット接続を確認してください。");
        return;
    }

    const subjects = getScoreComparisonSubjects();

    if (subjects.length === 0) {
        alert("学習計画で教科を設定してください。");
        return;
    }

    const myScores = [];
    const averageScores = [];

    for (let i = 0; i < subjects.length; i++) {
        const myInput = document.getElementById(`my-score-${i}`);
        const averageInput = document.getElementById(`average-score-${i}`);

        if (!myInput || !averageInput) {
            renderScoreComparison();
            alert("教科一覧を更新しました。点数をもう一度入力してください。");
            return;
        }

        const myValue = myInput.value.trim();
        const averageValue = averageInput.value.trim();

        if (myValue === "" || averageValue === "") {
            alert(`${subjects[i]}の自分の点数と平均点を入力してください。`);
            return;
        }

        const myScore = Number(myValue);
        const averageScore = Number(averageValue);

        if (
            !Number.isFinite(myScore) ||
            !Number.isFinite(averageScore) ||
            myScore < 0 || myScore > 100 ||
            averageScore < 0 || averageScore > 100
        ) {
            alert("点数は0～100の範囲で入力してください。");
            return;
        }

        myScores.push(myScore);
        averageScores.push(averageScore);
    }
	// 先にチャート画面を表示する
document.getElementById("score-input-view").hidden = true;
document.getElementById("score-chart-view").hidden = false;

    const canvas = document.getElementById("score-comparison-chart");
    const context = canvas.getContext("2d");

    if (scoreComparisonChart) {
        scoreComparisonChart.destroy();
    }

    scoreComparisonChart = new Chart(context, {
        type: "radar",
        data: {
            labels: subjects,
            datasets: [
                {
                    label: "自分の点数",
                    data: myScores,
                    borderColor: "#4285f4",
                    backgroundColor: "rgba(66, 133, 244, 0.15)",
                    pointBackgroundColor: "#4285f4",
                    borderWidth: 2
                },
                {
                    label: "平均点",
                    data: averageScores,
                    borderColor: "#22c55e",
                    backgroundColor: "rgba(34, 197, 94, 0.12)",
                    pointBackgroundColor: "#22c55e",
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 1,
            scales: {
                r: {
                    min: 0,
                    max: 100,
                    ticks: {
                        stepSize: 20,
                        backdropColor: "transparent",
                        font: {
                            size: 10
                        }
                    },
                    pointLabels: {
                        font: {
                            size: window.innerWidth <= 480 ? 10 : 12
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    position: "bottom",
                    labels: {
                        boxWidth: 14,
                        padding: 12,
                        font: {
                            size: 12
                        }
                    }
                }
            }
        }
    });

const message = document.getElementById("score-chart-message");
if (message) {
    message.textContent = "自分の点数と平均点を比較しています。";
}
}

function editScoreInputs() {
    const inputView = document.getElementById("score-input-view");
    const chartView = document.getElementById("score-chart-view");

    if (!inputView || !chartView) return;

    // チャートを隠して入力画面に戻る
    chartView.hidden = true;
    inputView.hidden = false;
}



function showMyPage() {
    currentScreen = "mypage";

    document.getElementById("practice-page").style.display = "none";

    document.querySelector(".main-title").style.display = "none";
    document.querySelector(".nav-menu").style.display = "none";
    document.getElementById("hero").style.display = "none";
    document.querySelector(".guide-toggle-btn").style.display = "none";
    document.getElementById("guide-box").style.display = "none";

    // 設定エリアと開閉ボタンを完全に非表示
    updateSettingVisibility();

    document.getElementById("result-layout").style.setProperty("display", "none", "important");
    document.getElementById("mypage").style.display = "block";

    renderMyPage();
    initializeManualStudyRecords();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function showStudyPage() {
    currentScreen = "study";

    document.getElementById("practice-page").style.display = "none";
    document.getElementById("mypage").style.display = "none";

    document.querySelector(".main-title").style.display = "block";
    document.querySelector(".nav-menu").style.display = "flex";
    document.getElementById("hero").style.display = "block";
    document.querySelector(".guide-toggle-btn").style.display = "block";

    updateSettingVisibility();

    if (daysArray.length > 0) {
        document.getElementById("result-layout")
            .style.setProperty("display", "grid", "important");
    } else {
        document.getElementById("result-layout")
            .style.setProperty("display", "none", "important");
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// ==========================================
// 練習問題
// ==========================================
let selectedSubject = "";
let selectedQuestionCount = 0;

function selectSubject(subject, btn) {
    selectedSubject = subject;

    const buttons = document.querySelectorAll('.subject-buttons button');
    buttons.forEach(b => b.classList.remove('selected'));
    if (btn) {
        btn.classList.add('selected');
    }

    updatePracticeSetting();
}

function selectQuestionCount(count, btn) {
    selectedQuestionCount = count;

    const buttons = document.querySelectorAll('.question-count-buttons button');
    buttons.forEach(b => b.classList.remove('selected'));
    if (btn) {
        btn.classList.add('selected');
    }

    updatePracticeSetting();
}

function updatePracticeSetting() {
    const startButton = document.getElementById("practice-start-btn");

    if (selectedSubject && selectedQuestionCount) {
        startButton.disabled = false;
    } else {
        startButton.disabled = true;
    }
}

function startSelectedPractice() {
    if (!selectedSubject || !selectedQuestionCount) {
        return;
    }

    const questionData = practiceQuestionData[selectedSubject];

    if (!questionData || questionData.length === 0) {
        alert(`${selectedSubject}の問題はまだ準備中です！`);
        return;
    }

    currentPracticeQuestions = questionData;

    document.getElementById("practice-setting").style.display = "none";
    document.getElementById("practice-question-area").style.display = "block";

    startPractice();
}

const practiceQuestions = [ 
    {
        question: "国王を処刑して専制君主制を廃し、共和制を打ち立てた革命は何というか？",
        answer: "ピューリタン革命",
        choices: [
            "ピューリタン革命",
            "名誉革命",
            "七月革命",
            "二月革命"
        ]
    }
];

const englishQuestions = [
    {
        type: "選択式",
        level: "★☆☆",
        question: "次の文の Playing basketball の用法として正しいものはどれですか。Playing basketball is fun.",
        choices: [
            "主語",
            "補語",
            "目的語",
            "前置詞の目的語"
        ],
        answer: "主語",
        explanation: "Playing basketball は「バスケットボールをすること」という意味で、文の主語になっています。"
    }
];

const mathAQuestions = [
    {
        type: "選択式",
        level: "★☆☆",
        question: "1個のサイコロを1回投げるとき、3の倍数の目が出る確率を求めなさい。",
        choices: ["1/6", "1/3", "1/2", "2/3"],
        answer: "1/3",
        explanation: "3の倍数の目は3、6の2通り。全体は6通りなので、2/6=1/3。"
    }
];

const mathIIIQuestions = [
    {
        type: "選択式",
        level: "★☆☆",
        question: "関数 \\(y=x\\sqrt{x}\\)$ の導関数として正しいものはどれですか。",
        choices: [
            "\\(y'=\\sqrt{x}\\)",
            "\\(y'=\\frac{3}{2}\\sqrt{x}\\)",
            "\\(y'=2\\sqrt{x}\\)",
            "\\(y'=3x\\)"
        ],
        answer: "\\(y'=\\frac{3}{2}\\sqrt{x}\\)",
        explanation: "\\(x\\sqrt{x}=x^{\\frac{3}{2}}\\) と変形すると、\\(y'=\\frac{3}{2}x^{\\frac{1}{2}}=\\frac{3}{2}\\sqrt{x}\\) となります。"
    }
];



const electronicMeasurementControlQuestions = [
    // ==========================================
    // 1節 フィードバック制御の基礎
    // ==========================================
    {
        type: "選択式",
        level: "★☆☆",
        question: "(1) フィードバック制御の説明として、最も適切なものはどれですか。",
        choices: [
            "A. 制御対象の状態を確認せず、決められた順序だけで動作する",
            "B. 目標値と現在の状態を比較し、その差に応じて制御動作を調整する",
            "C. 目標値を設定せず、常に最大出力で動作する",
            "D. 外乱が発生したときだけ動作する"
        ],
        answer: "B. 目標値と現在の状態を比較し、その差に応じて制御動作を調整する",
        explanation: "フィードバック制御は、目標値と実際の状態を比較し、その偏差に応じて操作を調整します。"
    },
    {
        type: "選択式",
        level: "★☆☆",
        question: "(2) 制御対象の状態を検出する役割を持つものはどれですか。",
        choices: [
            "A. 比較要素",
            "B. 操作部",
            "C. 検出部",
            "D. 制御対象"
        ],
        answer: "C. 検出部",
        explanation: "検出部は、温度や水位などの状態を検出し、フィードバック信号を得る役割を持ちます。"
    },
    {
        type: "選択式",
        level: "★☆☆",
        question: "(3) 制御対象を除いた、制御に関わる各要素を何と呼びますか。",
        choices: [
            "A. 制御装置",
            "B. 外乱",
            "C. 操作量",
            "D. 目標値"
        ],
        answer: "A. 制御装置",
        explanation: "この節では、制御対象以外の制御に関わる要素を制御装置としています。"
    },
    {
        type: "選択式",
        level: "★☆☆",
        question: "(4) 制御対象を除いた、制御に関わる各要素を何と呼びますか。",
        choices: [
            "A. 制御装置",
            "B. 外乱",
            "C. 操作量",
            "D. 目標値"
        ],
        answer: "A. 制御装置",
        explanation: "この節では、制御対象以外の制御に関わる要素を制御装置としています。"
    },
    {
        type: "選択式",
        level: "★★☆",
        question: "(5) 目標値Vs=0.80V、フィードバック信号Vp=0.65Vのとき、偏差e=Vs-Vpはいくらですか。",
        choices: [
            "A. 0.15 V",
            "B. 1.45 V",
            "C. -0.15 V",
            "D. 0.65 V"
        ],
        answer: "A. 0.15 V",
        explanation: "偏差は目標値からフィードバック信号を引きます。e=0.80-0.65=0.15Vです。"
    },
    {
        type: "選択式",
        level: "★★☆",
        question: "(6) プロセス制御の対象として正しい組み合わせはどれですか。",
        choices: [
            "A. 液位・温度・pH",
            "B. 液位・温度・ロボットアームの角度",
            "C. 温度・ロボットアームの角度・pH",
            "D. 液位・ロボットアームの角度・pH"
        ],
        answer: "A. 液位・温度・pH",
        explanation: "液位・温度・pHはプロセス制御の例です。ロボットアームの角度制御はサーボ制御の例です。"
    },
    {
        type: "選択式",
        level: "★☆☆",
        question: "(7) 追値制御とは、時間とともに変化する目標値に追従させる制御方式である。",
        choices: ["○", "×"],
        answer: "○",
        explanation: "追値制御では、目標値が時間とともに変化し、その変化に制御対象を追従させます。"
    },
    {
        type: "選択式",
        level: "★★☆",
        question: "(8) 水位が目標水位より低くなり、偏差e=Vs-Vpが正になりました。このときの動作として適切なものはどれですか。",
        choices: [
            "A. 給水弁を開き、流入量を増やす",
            "B. 給水弁を閉じ、流入量を減らす",
            "C. 目標値を必ずゼロにする",
            "D. 検出部を停止する"
        ],
        answer: "A. 給水弁を開き、流入量を増やす",
        explanation: "水位が目標より低いときは、給水弁を開いて水の流入量を増やし、目標水位に近づけます。"
    },
    {
        type: "選択式",
        level: "★☆☆",
        question: "(9) 電気カーペットの温度制御で、制御したい量に当たるものはどれですか。",
        choices: [
            "A. 実際のカーペットの温度",
            "B. 設定温度と実際の温度の差だけ",
            "C. 時計の時刻",
            "D. 温度センサの種類"
        ],
        answer: "A. 実際のカーペットの温度",
        explanation: "制御したい量はカーペットの実際の温度です。設定温度と比較して加熱を調整します。"
    },
    {
        type: "選択式",
        level: "★☆☆",
        question: "(10) プログラム制御では、目標値をあらかじめ定めたプログラムに従って変化させる。",
        choices: ["○", "×"],
        answer: "○",
        explanation: "プログラム制御では、あらかじめ決めた目標値の変化に沿って制御します。加熱炉の温度制御が例です。"
    },
    {
        type: "選択式",
        level: "★★☆",
        question: "(11) ロボットアームの角度制御で、目標角度を設定するものはどれですか。",
        choices: [
            "A. P2",
            "B. 差動増幅器",
            "C. P1",
            "D. サーボモータ"
        ],
        answer: "C. P1",
        explanation: "P1は目標角度を設定して目標値の電圧Vsを与えます。P2は実際の角度を検出します。"
    },
    {
        type: "選択式",
        level: "★★☆",
        question: "(12) 制御方式と対象の組み合わせとして正しいものはどれですか。",
        choices: [
            "A. サーボ制御―位置や角度、自動調整―電圧や電流",
            "B. 定値制御―時間とともに変化する目標値、プロセス制御―ロボットアームの角度",
            "C. サーボ制御―電圧や電流、自動調整―位置や角度",
            "D. 定値制御―時間とともに変化する目標値、自動調整―液位だけ"
        ],
        answer: "A. サーボ制御―位置や角度、自動調整―電圧や電流",
        explanation: "サーボ制御は位置や角度、自動調整は電圧・電流・速度・周波数などが例です。定値制御は目標値が一定の場合です。"
    },
    {
        type: "選択式",
        level: "★★☆",
        question: "(13) 目標値Vs=3.0V、フィードバック信号Vp=2.4Vのとき、偏差e=Vs-Vpはいくらですか。",
        choices: [
            "A. 5.4 V",
            "B. -0.6 V",
            "C. 2.4 V",
            "D. 0.6 V"
        ],
        answer: "D. 0.6 V",
        explanation: "e=3.0-2.4=0.6Vです。目標値からフィードバック信号を引きます。"
    },
    {
        type: "選択式",
        level: "★☆☆",
        question: "(14) 制御対象の状態に影響を与える外部からの要因を何と呼びますか。",
        choices: [
            "A. 目標値",
            "B. 外乱",
            "C. 操作量",
            "D. フィードバック信号"
        ],
        answer: "B. 外乱",
        explanation: "外乱は、制御対象の状態に影響を与え、制御を難しくする要因です。"
    },
    {
        type: "選択式",
        level: "★★☆",
        question: "(15) フィードバック制御について正しい説明の組み合わせはどれですか。",
        choices: [
            "A. 目標値とフィードバック信号を比較し、偏差に応じて制御動作を調整する",
            "B. 現在の状態を検出せず、目標値を必ずゼロにする",
            "C. 偏差はフィードバック信号から目標値を引いて求める",
            "D. 外乱が発生したときだけ検出部が動作する"
        ],
        answer: "A. 目標値とフィードバック信号を比較し、偏差に応じて制御動作を調整する",
        explanation: "フィードバック制御では現在の状態を検出し、目標値と比較します。偏差はe=Vs-Vpで求め、その結果に応じて制御動作を調整します。"
    },

    // ==========================================
    // 2節 信号の伝達と伝達関数
    // ==========================================
    {
        type: "選択式",
        level: "★☆☆",
        question: "(16) ブロック線図を用いる目的として、最も適切なものはどれですか。",
        choices: [
            "A. 制御システムの外観を実物と同じように描くため",
            "B. 制御システムの構成要素の結合や信号の流れを分かりやすく表すため",
            "C. 制御システムの電力消費量だけを求めるため",
            "D. 制御システムからセンサをなくすため"
        ],
        answer: "B. 制御システムの構成要素の結合や信号の流れを分かりやすく表すため",
        explanation: "ブロック線図は、制御システムの構成要素や、それらの結合のしかた、信号の流れを分かりやすく表すために用います。"
    },
    {
        type: "選択式",
        level: "★☆☆",
        question: "(17) 入力信号をX、出力信号をYとしたとき、伝達関数Hを表す式として正しいものはどれですか。",
        choices: [
            "A. H = X + Y",
            "B. H = X - Y",
            "C. H = Y / X",
            "D. H = X * Y"
        ],
        answer: "C. H = Y / X",
        explanation: "この問題で扱う伝達関数は、出力信号を入力信号で割った比です。したがってH=Y/Xとなります。"
    },
    {
        type: "選択式",
        level: "★★☆",
        question: "(18) ある比例要素の比例ゲインがK=4、入力信号がX=3のとき、出力信号Yの値はいくつですか。",
        choices: [
            "A. 1",
            "B. 7",
            "C. 12",
            "D. 16"
        ],
        answer: "C. 12",
        explanation: "比例要素の出力信号はY=K*Xです。Y=4*3=12となります。"
    },
    {
        type: "選択式",
        level: "★☆☆",
        question: "(19) 伝達関数がH1、H2の2つのブロックを直列接続した場合、全体の伝達関数はH1+H2となる。",
        choices: ["○", "×"],
        answer: "×",
        explanation: "直列接続では、各ブロックの伝達関数を掛け合わせます。全体の伝達関数はH=H1*H2となります。"
    },
    {
        type: "選択式",
        level: "★★☆",
        question: "(20) 伝達関数がH1=2、H2=5の2つのブロックを直列接続しました。全体の伝達関数はいくつですか。",
        choices: [
            "A. 3",
            "B. 7",
            "C. 10",
            "D. 25"
        ],
        answer: "C. 10",
        explanation: "直列接続の全体の伝達関数は各ブロックの伝達関数の積です。H=2*5=10となります。"
    },
    {
        type: "選択式",
        level: "★★☆",
        question: "(21) ブロック線図の接続について正しい説明はどれですか。",
        choices: [
            "A. 直列接続では積、並列接続で加算する場合は和、等価変換はブロックを整理すること",
            "B. 直列接続では和、並列接続で加算する場合は積、等価変換はブロックを削除すること",
            "C. 直列接続では差、並列接続で加算する場合は積、等価変換は信号を止めること",
            "D. 直列接続では積、並列接続で加算する場合は差、等価変換はセンサをなくすこと"
        ],
        answer: "A. 直列接続では積、並列接続で加算する場合は和、等価変換はブロックを整理すること",
        explanation: "直列接続の伝達関数は積です。並列接続で信号を加算する場合は和、減算する場合は差です。複数のブロックを統合して扱いやすく整理することを等価変換といいます。"
    },
    {
        type: "選択式",
        level: "★☆☆",
        question: "(22) ブロック線図におけるフィードバック接続の説明として正しいものはどれですか。",
        choices: [
            "A. 入力信号を必ずゼロにする接続",
            "B. 出力信号を入力側に帰還させる接続",
            "C. すべてのブロックを並列に接続する方式",
            "D. 信号を伝達せず、出力だけを表示する方式"
        ],
        answer: "B. 出力信号を入力側に帰還させる接続",
        explanation: "フィードバック接続は、出力信号を伝達関数などを通して入力側に帰還させる接続方式です。"
    },
    {
        type: "選択式",
        level: "★★☆",
        question: "(23) 負帰還のフィードバック接続で、順方向の伝達関数P=4、帰還側の伝達関数H=1とします。閉ループ伝達関数Y/Xはいくつですか。式：Y/X=P/(1+P*H)",
        choices: [
            "A. 1 / 5",
            "B. 4 / 5",
            "C. 4",
            "D. 5"
        ],
        answer: "B. 4 / 5",
        explanation: "Y/X=4/(1+4*1)=4/5=0.8です。"
    },
    {
        type: "選択式",
        level: "★☆☆",
        question: "(24) 入力信号に比例した量を出力する要素を何といいますか。",
        choices: [
            "A. 微分要素",
            "B. 積分要素",
            "C. 比例要素",
            "D. フィードバック要素"
        ],
        answer: "C. 比例要素",
        explanation: "比例要素は、入力信号を一定の比例定数K倍して出力する要素です。関係式はY=K*Xです。"
    },
    {
        type: "選択式",
        level: "★☆☆",
        question: "(25) 微分要素は、入力信号を時間について微分した量に比例する出力を得る要素である。",
        choices: ["○", "×"],
        answer: "○",
        explanation: "微分要素は、入力信号の時間的な変化率に比例した出力を得る要素です。例えば、変位を時間について微分すると速度が得られます。"
    },
    {
        type: "選択式",
        level: "★★☆",
        question: "(26) 台車の変位がX(t)=4*t-t^2で表されます。速度は変位を時間について微分して求めます。t=1秒のときの速度はいくらですか。",
        choices: [
            "A. 1 m/s",
            "B. 2 m/s",
            "C. 3 m/s",
            "D. 4 m/s"
        ],
        answer: "B. 2 m/s",
        explanation: "変位を時間について微分するとV(t)=4-2*tです。t=1を代入するとV(1)=4-2*1=2m/sとなります。"
    },
    {
        type: "選択式",
        level: "★★☆",
        question: "(27) 積分要素について正しい説明の組み合わせはどれですか。",
        choices: [
            "A. 入力信号の時間積分に比例する出力を得る。流量の積分で体積、電流の積分で電荷量を求められる",
            "B. 入力信号を時間について微分する。流量の積分で速度を求められる",
            "C. 入力信号を一定倍する。電流の積分で抵抗値を求められる",
            "D. 入力信号を時間について積分することはなく、変位の微分で移動距離を求められる"
        ],
        answer: "A. 入力信号の時間積分に比例する出力を得る。流量の積分で体積、電流の積分で電荷量を求められる",
        explanation: "積分要素は入力信号の時間積分に比例する出力を得ます。流量を積分すると体積、電流を積分すると電荷量を求められます。変位を微分すると速度が得られます。"
    },
    {
        type: "選択式",
        level: "★☆☆",
        question: "(28) 台車が一定の速度V=3m/sで5秒間移動しました。移動距離Xはいくらですか。",
        choices: [
            "A. 8 m",
            "B. 10 m",
            "C. 15 m",
            "D. 20 m"
        ],
        answer: "C. 15 m",
        explanation: "一定速度の場合、移動距離はX=V*tで求められます。X=3*5=15mです。"
    },
    {
        type: "選択式",
        level: "★★☆",
        question: "(29) ばね定数をKp、ばねの変位をX、ばねが受ける力をFとします。正しい関係式はどれですか。",
        choices: [
            "A. F = X / Kp",
            "B. F = Kp * X",
            "C. F = Kp + X",
            "D. F = Kp - X"
        ],
        answer: "B. F = Kp * X",
        explanation: "ばねが受ける力は、ばねの変位にばね定数を掛けた値です。F=Kp*Xとなります。"
    },
    {
        type: "選択式",
        level: "★★☆",
        question: "(30) 電気系モデルと機械系モデルの対応関係について正しい説明の組み合わせはどれですか。",
        choices: [
            "A. 電圧は力やトルク、電流は速度や角速度、インダクタンスは質量や慣性モーメントに対応する",
            "B. 電圧は速度や角速度、電流は力やトルク、インダクタンスは変位に対応する",
            "C. 電圧は変位、電流は質量、インダクタンスは力に対応する",
            "D. 電圧は電荷、電流は変位、インダクタンスは速度に対応する"
        ],
        answer: "A. 電圧は力やトルク、電流は速度や角速度、インダクタンスは質量や慣性モーメントに対応する",
        explanation: "電圧は直線運動では力、回転運動ではトルクに対応します。電流は速度や角速度、インダクタンスは質量や慣性モーメントに対応します。"
    }
];


const practiceQuestionData = {
    "歴史": practiceQuestions,
    "英語（文法）": englishQuestions,
    "数学A": mathAQuestions,
    "数学III": mathIIIQuestions,
    "計測制御": electronicMeasurementControlQuestions
    
};

let currentPracticeQuestions = [];
let currentPracticeQuestion = 0;
let practiceQuestionOrder = [];
let practiceCorrectCount = 0;

function showPracticePage() {
    currentScreen = "practice";

    const mainTitle = document.querySelector(".main-title");
    const navMenu = document.querySelector(".nav-menu");
    const hero = document.getElementById("hero");
    const guideButton = document.querySelector(".guide-toggle-btn");
    const guideBox = document.getElementById("guide-box");
    const resultLayout = document.getElementById("result-layout");
    const mypage = document.getElementById("mypage");

    if (mainTitle) mainTitle.style.display = "none";
    if (navMenu) navMenu.style.display = "none";
    if (hero) hero.style.display = "none";
    if (guideButton) guideButton.style.display = "none";
    if (guideBox) guideBox.style.display = "none";

    // 設定エリアと開閉ボタンを完全に非表示
    updateSettingVisibility();

    if (resultLayout) resultLayout.style.setProperty("display", "none", "important");
    if (mypage) mypage.style.display = "none";

    const practicePage = document.getElementById("practice-page");
    if (practicePage) practicePage.style.display = "block";

    const setting = document.getElementById("practice-setting");
    if (setting) setting.style.display = "block";

    const questionArea = document.getElementById("practice-question-area");
    if (questionArea) questionArea.style.display = "none";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

let practiceWrongQuestions = [];

function startPractice() {
    document.getElementById("practice-retry-label").style.display = "none";

    isRetryingWrongQuestions = false;
    currentPracticeQuestion = 0;
    practiceCorrectCount = 0;
    practiceWrongQuestions = [];

    practiceQuestionOrder = currentPracticeQuestions.map((_, index) => index);
    shuffleArray(practiceQuestionOrder);

    practiceQuestionOrder = practiceQuestionOrder.slice(
        0,
        selectedQuestionCount
    );

    showPracticeQuestion();
}

function showPracticeQuestion() {
    const questionIndex = practiceQuestionOrder[currentPracticeQuestion];
    const question = currentPracticeQuestions[questionIndex];

    document.getElementById("practice-question-number").textContent =
        `第${currentPracticeQuestion + 1}問 / ${practiceQuestionOrder.length}問`;

    document.getElementById("practice-question").innerHTML = question.question;

    const choicesContainer = document.getElementById("practice-choices");
    choicesContainer.innerHTML = "";

    const result = document.getElementById("practice-result");
    result.textContent = "";
    result.className = "practice-result";

    document.getElementById("practice-next-btn").style.display = "none";

    if (question.type === "選択式") {
        const shuffledChoices = shuffleArray([...question.choices]);

        shuffledChoices.forEach(choice => {
            const button = document.createElement("button");
            button.className = "practice-choice";
            button.innerHTML = choice;

            button.onclick = function() {
                answerPracticeQuestion(
                    button,
                    choice,
                    question
                );
            };

            choicesContainer.appendChild(button);
        });
    } else if (question.type === "記述式") {
        const input = document.createElement("input");
        input.type = "text";
        input.id = "practice-answer-input";
        input.className = "practice-answer-input";
        input.placeholder = "答えを入力してください";

        const answerButton = document.createElement("button");
        answerButton.textContent = "回答する";
        answerButton.className = "practice-submit-btn";

        answerButton.onclick = function() {
            const userAnswer = input.value.trim();

            if (userAnswer === "") {
                alert("答えを入力してください。");
                return;
            }

            answerPracticeQuestion(
                input,
                userAnswer,
                question
            );
        };

        input.addEventListener("keydown", function(event) {
            if (event.key === "Enter") {
                event.preventDefault();
                answerButton.click();
            }
        });

        choicesContainer.appendChild(input);
        choicesContainer.appendChild(answerButton);
    }

    if (window.MathJax) {
        MathJax.typesetPromise();
    }
}

function answerPracticeQuestion(
    selectedElement,
    selectedAnswer,
    question
) {
    const result = document.getElementById("practice-result");

    if (result.classList.contains("answered")) {
        return;
    }

    result.classList.add("answered");

    const userAnswer = selectedAnswer.trim().toLowerCase();
    const correctAnswer = question.answer.trim().toLowerCase();

    if (question.type === "選択式") {
        const buttons = document.querySelectorAll(".practice-choice");
        buttons.forEach(button => {
            button.disabled = true;
            button.classList.add("disabled");
        });
    } else if (question.type === "記述式") {
        const input = document.getElementById("practice-answer-input");
        const submitButton = document.querySelector(".practice-submit-btn");

        if (input) input.disabled = true;
        if (submitButton) submitButton.disabled = true;
    }

    if (userAnswer === correctAnswer) {
        practiceCorrectCount++;

        if (question.type === "選択式") {
            selectedElement.classList.add("correct");
        }

        let resultHTML = "正解！";
        if (question.explanation) {
            resultHTML += `<br><br><strong>解説：</strong><br>${question.explanation}`;
        }

        result.innerHTML = resultHTML;
        result.className = "practice-result correct-result answered";
    } else {
        if (!isRetryingWrongQuestions) {
            const questionIndex = practiceQuestionOrder[currentPracticeQuestion];

            if (!practiceWrongQuestions.includes(questionIndex)) {
                practiceWrongQuestions.push(questionIndex);
            }
        }

        if (question.type === "選択式") {
            selectedElement.classList.add("incorrect");

            const buttons = document.querySelectorAll(".practice-choice");
            buttons.forEach(button => {
                if (button.textContent.trim() === question.answer.trim()) {
                    button.classList.add("correct");
                }
            });
        }

        result.innerHTML = `不正解！<br>正解は「${question.answer}」です。`;

        if (question.explanation) {
            result.innerHTML += `<br><br><strong>解説：</strong><br>${question.explanation}`;
        }

        result.className = "practice-result incorrect-result answered";
    }

    const nextButton = document.getElementById("practice-next-btn");
    nextButton.style.display = "block";

    if (currentPracticeQuestion === practiceQuestionOrder.length - 1) {
        nextButton.textContent = "結果を見る";
    } else {
        nextButton.textContent = "次の問題 →";
    }

    if (window.MathJax) {
        MathJax.typesetPromise();
    }
}

function nextPracticeQuestion() {
    currentPracticeQuestion++;

    if (currentPracticeQuestion >= practiceQuestionOrder.length) {
        showPracticeResult();
        return;
    }

    showPracticeQuestion();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function showPracticeResult() {
    const percentage = Math.round(
        (practiceCorrectCount / practiceQuestionOrder.length) * 100
    );

    document.getElementById("practice-question-number").textContent = "練習問題終了！";

    document.getElementById("practice-question").innerHTML =
        `お疲れさまでした！<br>あなたの正解数は <strong>${practiceCorrectCount} / ${practiceQuestionOrder.length}問</strong> です。<br>正答率：<strong>${percentage}%</strong>`;

    document.getElementById("practice-choices").innerHTML = "";

    document.getElementById("practice-result").textContent = "もう一度挑戦してみよう！";
    document.getElementById("practice-result").className = "practice-result correct-result";

    const nextButton = document.getElementById("practice-next-btn");
    nextButton.style.display = "block";
    nextButton.textContent = "もう一度挑戦する";

    nextButton.onclick = function() {
        startPractice();
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    const wrongButton = document.getElementById("practice-wrong-btn");
    if (practiceWrongQuestions.length > 0) {
        wrongButton.style.display = "block";
    } else {
        wrongButton.style.display = "none";
    }
}

function retryWrongQuestions() {
    currentPracticeQuestion = 0;
    practiceCorrectCount = 0;
    isRetryingWrongQuestions = true;

    practiceQuestionOrder = [...practiceWrongQuestions];

    document.getElementById("practice-retry-label").style.display = "block";

    document.getElementById("practice-next-btn").onclick = nextPracticeQuestion;
    document.getElementById("practice-next-btn").style.display = "none";

    showPracticeQuestion();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =====================================
   手動学習記録
===================================== */

// ログインユーザーごとに保存場所を分ける
function getManualRecordKey() {
    const userId = localStorage.getItem("loginUserId");
    return "manualStudyRecords_" + (userId || "guest");
}

// 記録を読み込む
function getManualStudyRecords() {
    try {
        return JSON.parse(
            localStorage.getItem(getManualRecordKey()) || "[]"
        );
    } catch (error) {
        console.error("学習記録の読み込みエラー", error);
        return [];
    }
}

// 教科の選択肢を更新
function updateRecordSubjects() {
    const select = document.getElementById("record-subject");
    if (!select) return;

    const current = select.value;

    const subjects = [
        ...new Set(
            [
                ...baseSubjectsGlobal,
                ...document.getElementById("subject-input")
                    .value.split(/[,、]/)
            ]
            .map(s => s.trim())
            .filter(Boolean)
        )
    ];

    select.replaceChildren(
        new Option("教科を選択してください", "")
    );

    subjects.forEach(subject => {
        select.add(new Option(subject, subject));
    });

    if (subjects.includes(current)) {
        select.value = current;
    }
}

// 新しい学習記録を保存
function saveManualStudyRecord() {
    const date = document.getElementById("record-date").value;
    const subject = document.getElementById("record-subject").value;
    const hours = Number(
        document.getElementById("record-hours").value
    );
    const minutes = Number(
        document.getElementById("record-minutes").value
    );
    const memo = document.getElementById("record-memo").value.trim();

    if (!date || !subject) {
        alert("日付と教科を入力してね！");
        return;
    }

    if (
        !Number.isInteger(hours) ||
        !Number.isInteger(minutes) ||
        hours < 0 || hours > 24 ||
        minutes < 0 || minutes > 59 ||
        (hours === 24 && minutes > 0)
    ) {
        alert("勉強時間を正しく入力してね！");
        return;
    }

    const totalMinutes = hours * 60 + minutes;

    if (totalMinutes === 0) {
        alert("勉強時間を入力してね！");
        return;
    }

    const records = getManualStudyRecords();

    records.push({
        id: crypto.randomUUID(),
        date: date,
        subject: subject,
        minutes: totalMinutes,
        memo: memo
    });

    try {
        localStorage.setItem(
            getManualRecordKey(),
            JSON.stringify(records)
        );
    } catch (error) {
        alert("保存できませんでした。");
        return;
    }

    document.getElementById("record-memo").value = "";
    renderManualStudyRecords();

    alert("勉強記録を保存したよ！");
}

// 記録を表示
function renderManualStudyRecords() {
    const container = document.getElementById("manual-study-list");
    const totalElement = document.getElementById("manual-study-total");

    if (!container || !totalElement) return;

    const records = getManualStudyRecords();
    records.sort((a, b) => b.date.localeCompare(a.date));

    container.replaceChildren();

    const totalMinutes = records.reduce(
        (sum, record) => sum + record.minutes, 0
    );

    totalElement.textContent =
        `手入力の累計：${Math.floor(totalMinutes / 60)}時間` +
        `${totalMinutes % 60}分`;

    if (records.length === 0) {
        container.textContent = "まだ記録がありません。";
        return;
    }

    records.forEach(record => {
        const card = document.createElement("div");
        card.className = "manual-record-card";

        const title = document.createElement("strong");
        title.textContent = `${record.date}｜${record.subject}`;

        const time = document.createElement("p");
        time.textContent =
            `勉強時間：${Math.floor(record.minutes / 60)}時間` +
            `${record.minutes % 60}分`;

        const memo = document.createElement("p");
        memo.textContent = record.memo || "メモなし";

        const button = document.createElement("button");
        button.type = "button";
        button.textContent = "削除";

        button.addEventListener("click", () => {
            deleteManualStudyRecord(record.id);
        });

        card.append(title, time, memo, button);
        container.appendChild(card);
    });
}

// 記録を削除
function deleteManualStudyRecord(id) {
    if (!confirm("この勉強記録を削除する？")) return;

    const records = getManualStudyRecords()
        .filter(record => record.id !== id);

    localStorage.setItem(
        getManualRecordKey(),
        JSON.stringify(records)
    );

    renderManualStudyRecords();
}

// マイページを開いたときの準備
function initializeManualStudyRecords() {
    const dateInput = document.getElementById("record-date");

    if (dateInput && !dateInput.value) {
        dateInput.value = getLocalDateString(new Date());
    }

    updateRecordSubjects();
    renderManualStudyRecords();
}

function goToGameMode() {
    const confirmed = confirm(
        "ゲームモードに移動しますか？"
    );

    if (!confirmed) return;

    const overlay = document.getElementById("game-transition");

    if (overlay) {
        overlay.classList.add("active");
    }

    setTimeout(() => {
        window.location.href = "../game/game.(2).html";
    }, 850);
}
// PWA: Service Workerの登録
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./sw.js')
      .then((reg) => console.log('Service Worker 登録成功:', reg.scope))
      .catch((err) => console.error('Service Worker 登録失敗:', err));
  });
}