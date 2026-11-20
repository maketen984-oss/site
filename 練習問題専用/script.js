
// 練習問題専用サイト用の共通処理
let isRetryingWrongQuestions = false;
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

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

let currentPracticeQuestions = [];
let currentPracticeQuestion = 0;
let practiceQuestionOrder = [];
let practiceCorrectCount = 0;

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
    if (!question.type && Array.isArray(question.choices)) question.type = "選択式";

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

function backToStudyPlan() {
    const confirmed = confirm(
        "学習計画のサイトに戻りますか？"
    );

    if (!confirmed) return;

    window.location.href = "../サイト/index.html";
}

function returnToStudySite() { window.location.href = "../index.html"; }
