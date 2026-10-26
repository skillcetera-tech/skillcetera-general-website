/**
 * Skillcetera Flagship Duel Mini-Game: Team ESC (Blue) vs Team TEDx (Red)
 * Intermission interactive challenge separating ESC and TEDx stages.
 */

const QUESTIONS = [
  {
    text: "Đấu trường tranh biện tiếng Anh học thuật với 200+ thí sinh đến từ 20+ trường đại học toàn quốc?",
    answer: "esc",
    clue: "HỌC THUẬT & TRANH BIỆN",
    detail: "Chính xác! ESC là cuộc thi tiếng Anh học thuật thường niên lớn nhất của CLB Skillcetera.",
  },
  {
    text: "Sân khấu diễn thuyết được cấp phép chính thức, đạt hơn 2.5 triệu lượt xem trên YouTube?",
    answer: "tedx",
    clue: "Ý TƯỞNG & LAN TỎA",
    detail: "Chuẩn xác! TEDxFPTUniversityHCMC đã lan tỏa hơn 2.5 triệu lượt xem qua các bài diễn thuyết truyền cảm hứng.",
  },
  {
    text: "Mùa giải 'Break The Norm' quy tụ những màn đối kháng 1v1 trực tiếp với tổng giải thưởng 50+ triệu VNĐ?",
    answer: "esc",
    clue: "MÙA GIẢI 2025 · GIẢI THƯỞNG",
    detail: "Đúng rồi! ESC 2025 mang thông điệp Break The Norm với giải thưởng kỷ lục 50+ triệu đồng.",
  },
  {
    text: "Quy tụ 19 diễn giả đa lĩnh vực cùng 50+ đối tác đồng hành qua 5 mùa tổ chức liên tiếp (2021–2025)?",
    answer: "tedx",
    clue: "5 MÙA SỰ KIỆN · ĐỐI TÁC",
    detail: "Xuất sắc! TEDxFPTUniversityHCMC được Skillcetera tổ chức liên tục 5 mùa với 19 diễn giả ấn tượng.",
  },
  {
    text: "Khẳng định bản lĩnh phản biện cá nhân với thông điệp: 'Your voice. Your impact.'?",
    answer: "esc",
    clue: "THÔNG ĐIỆP SÂN KHẤU",
    detail: "Chính xác! 'Your voice. Your impact.' là thông điệp xuyên suốt các mùa của ESC.",
  },
  {
    text: "Kênh TikTok 55K+ followers cùng khẩu hiệu toàn cầu: 'Ideas worth spreading'?",
    answer: "tedx",
    clue: "SOCIAL MEDIA & KHẨU HIỆU",
    detail: "Chuẩn xác! TEDxFPTUniversityHCMC sở hữu cộng đồng đông đảo và khẩu hiệu lan tỏa ý tưởng.",
  },
];

export function initGame() {
  const container = document.getElementById('flagship-game');
  if (!container) return;

  const card = document.getElementById('game-card');
  const cardClue = document.getElementById('game-card-clue');
  const cardText = document.getElementById('game-card-text');
  const stampEsc = card?.querySelector('.stamp-esc');
  const stampTedx = card?.querySelector('.stamp-tedx');

  const roundEl = document.getElementById('game-round');
  const progressFill = document.getElementById('game-progress');
  const scoreEl = document.getElementById('game-score');
  const streakEl = document.getElementById('game-streak');

  const feedbackEl = document.getElementById('game-feedback');
  const feedbackBadge = document.getElementById('feedback-badge');
  const feedbackDetail = document.getElementById('feedback-detail');

  const actionsEl = document.getElementById('game-actions');
  const btnEsc = document.getElementById('btn-pick-esc');
  const btnTedx = document.getElementById('btn-pick-tedx');

  const resultEl = document.getElementById('game-result');
  const resultTitle = document.getElementById('result-title');
  const resultDesc = document.getElementById('result-desc');
  const resultTrophy = document.getElementById('result-trophy');
  const resultFinalScore = document.getElementById('result-final-score');
  const resultAccuracy = document.getElementById('result-accuracy');
  const btnReplay = document.getElementById('btn-replay');

  let currentIndex = 0;
  let score = 0;
  let streak = 0;
  let correctCount = 0;
  let isLocked = false;

  // Pointer drag state
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let currentX = 0;

  function renderQuestion(index) {
    if (index >= QUESTIONS.length) {
      showResult();
      return;
    }

    const q = QUESTIONS[index];
    if (cardClue) cardClue.textContent = q.clue;
    if (cardText) cardText.textContent = q.text;
    if (roundEl) roundEl.textContent = `Câu ${index + 1} / ${QUESTIONS.length}`;
    if (progressFill) progressFill.style.width = `${((index + 1) / QUESTIONS.length) * 100}%`;

    // Reset card visuals
    if (card) {
      card.style.transition = 'transform 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28), opacity 0.3s ease';
      card.style.transform = 'translate(0px, 0px) rotate(0deg) scale(1)';
      card.style.opacity = '1';
    }
    if (stampEsc) stampEsc.style.opacity = '0';
    if (stampTedx) stampTedx.style.opacity = '0';
    if (feedbackEl) feedbackEl.hidden = true;
    isLocked = false;
  }

  function handleAnswer(choice) {
    if (isLocked || currentIndex >= QUESTIONS.length) return;
    isLocked = true;

    const q = QUESTIONS[currentIndex];
    const isCorrect = choice === q.answer;

    if (isCorrect) {
      correctCount++;
      const multiplier = streak > 0 ? 1.5 : 1;
      const pts = Math.round(100 * multiplier);
      score += pts;
      streak++;
      if (feedbackBadge) {
        feedbackBadge.textContent = streak > 1 ? `Chính xác! +${pts} (x${streak} Combo 🔥)` : `Chính xác! +${pts} 🎉`;
        feedbackBadge.className = 'feedback-badge correct';
      }
      if (streakEl) {
        if (streak > 1) {
          streakEl.hidden = false;
          streakEl.textContent = `🔥 x${streak}`;
        } else {
          streakEl.hidden = true;
        }
      }
    } else {
      streak = 0;
      if (feedbackBadge) {
        feedbackBadge.textContent = `Chưa đúng rồi! Sự kiện là ${q.answer.toUpperCase()}`;
        feedbackBadge.className = 'feedback-badge incorrect';
      }
      if (streakEl) streakEl.hidden = true;
    }

    if (scoreEl) scoreEl.textContent = score;
    if (feedbackDetail) feedbackDetail.textContent = q.detail;
    if (feedbackEl) feedbackEl.hidden = false;

    // Fly card away in direction of choice
    if (card) {
      card.style.transition = 'transform 0.45s ease-in, opacity 0.45s ease-in';
      const flyX = choice === 'esc' ? -420 : 420;
      const rotate = choice === 'esc' ? -22 : 22;
      card.style.transform = `translate(${flyX}px, -20px) rotate(${rotate}deg)`;
      card.style.opacity = '0';
    }

    setTimeout(() => {
      currentIndex++;
      renderQuestion(currentIndex);
    }, 1200);
  }

  function showResult() {
    if (actionsEl) actionsEl.hidden = true;
    if (card) card.hidden = true;
    if (feedbackEl) feedbackEl.hidden = true;
    if (resultEl) resultEl.hidden = false;

    const accuracy = Math.round((correctCount / QUESTIONS.length) * 100);
    if (resultFinalScore) resultFinalScore.textContent = score;
    if (resultAccuracy) resultAccuracy.textContent = `${accuracy}%`;

    if (accuracy === 100) {
      if (resultTrophy) resultTrophy.textContent = '🏆';
      if (resultTitle) resultTitle.textContent = 'Skillcetera Grandmaster!';
      if (resultDesc) resultDesc.textContent = 'Tuyệt đối 6/6! Bạn hiểu tường tận từng cột mốc và tinh thần của cả hai sự kiện ESC và TEDx.';
    } else if (accuracy >= 66) {
      if (resultTrophy) resultTrophy.textContent = '🌟';
      if (resultTitle) resultTitle.textContent = 'Savvy Flagship Insider!';
      if (resultDesc) resultDesc.textContent = `Rất ấn tượng! Bạn đúng ${correctCount}/${QUESTIONS.length} câu, thể hiện sự am hiểu sâu sắc về hoạt động của CLB.`;
    } else {
      if (resultTrophy) resultTrophy.textContent = '🌱';
      if (resultTitle) resultTitle.textContent = 'Curious Explorer!';
      if (resultDesc) resultDesc.textContent = `Bạn đã hoàn thành thử thách với ${correctCount}/${QUESTIONS.length} câu đúng. Hãy thử lại để chinh phục điểm số tuyệt đối nhé!`;
    }
  }

  function resetGame() {
    currentIndex = 0;
    score = 0;
    streak = 0;
    correctCount = 0;
    isLocked = false;

    if (scoreEl) scoreEl.textContent = '0';
    if (streakEl) streakEl.hidden = true;
    if (resultEl) resultEl.hidden = true;
    if (actionsEl) actionsEl.hidden = false;
    if (card) card.hidden = false;

    renderQuestion(0);
  }

  // Button clicks
  btnEsc?.addEventListener('click', () => handleAnswer('esc'));
  btnTedx?.addEventListener('click', () => handleAnswer('tedx'));
  btnReplay?.addEventListener('click', resetGame);

  // Keyboard navigation (Left / Right Arrow)
  window.addEventListener('keydown', (e) => {
    if (isLocked || currentIndex >= QUESTIONS.length) return;
    const rect = container.getBoundingClientRect();
    const inView = rect.top < window.innerHeight && rect.bottom > 0;
    if (!inView) return;

    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handleAnswer('esc');
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleAnswer('tedx');
    }
  });

  // Touch & Pointer Drag / Swipe on Card
  if (card) {
    const onPointerDown = (e) => {
      if (isLocked) return;
      isDragging = true;
      startX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      startY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
      currentX = startX;
      card.style.transition = 'none';
      card.setPointerCapture?.(e.pointerId);
    };

    const onPointerMove = (e) => {
      if (!isDragging || isLocked) return;
      currentX = e.clientX || (e.touches && e.touches[0].clientX) || currentX;
      const deltaX = currentX - startX;
      const rotate = deltaX * 0.08;

      card.style.transform = `translate(${deltaX}px, 0px) rotate(${rotate}deg)`;

      // Stamp indicator opacity based on drag distance
      const progress = Math.min(Math.abs(deltaX) / 80, 1);
      if (deltaX < 0) {
        if (stampEsc) stampEsc.style.opacity = String(progress);
        if (stampTedx) stampTedx.style.opacity = '0';
      } else {
        if (stampTedx) stampTedx.style.opacity = String(progress);
        if (stampEsc) stampEsc.style.opacity = '0';
      }
    };

    const onPointerUp = (e) => {
      if (!isDragging) return;
      isDragging = false;
      const deltaX = currentX - startX;

      if (deltaX < -70) {
        handleAnswer('esc');
      } else if (deltaX > 70) {
        handleAnswer('tedx');
      } else {
        // Snap back
        card.style.transition = 'transform 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28)';
        card.style.transform = 'translate(0px, 0px) rotate(0deg)';
        if (stampEsc) stampEsc.style.opacity = '0';
        if (stampTedx) stampTedx.style.opacity = '0';
      }
    };

    card.addEventListener('pointerdown', onPointerDown);
    card.addEventListener('pointermove', onPointerMove);
    card.addEventListener('pointerup', onPointerUp);
    card.addEventListener('pointercancel', onPointerUp);
  }

  // Initialize first question
  renderQuestion(0);
}
