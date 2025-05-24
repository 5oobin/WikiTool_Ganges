// 온보딩
let currentStep = 1;
const totalSteps = 7;

function showStep(n) {
  // 모든 온보딩 step 숨기기
  for (let i = 1; i <= totalSteps; i++) {
    const stepEl = document.getElementById(`onboarding-step-${i}`);
    if (stepEl) stepEl.style.display = (i === n) ? 'block' : 'none';
  }
  const overlay = document.getElementById('onboarding-overlay');
  // 온보딩 끝 → 기존 UI 보여주기
  if (n > totalSteps) {
    document.getElementById('onboarding-overlay').style.display = 'none';
    // ✨ 살짝 딜레이 줘야 레이아웃 적용 타이밍이 맞음
    setTimeout(() => {
      const modal = document.getElementById('newModal');
      const aboutButton = document.querySelector('.about-button');
      modal.style.display = 'block';
      aboutButton.classList.add('active');
      showTab('summary');
    }, 50); // 50ms 정도면 충분
    return;
  }
  // 온보딩 계속 진행 중
  overlay.style.display = 'block';
}

document.addEventListener('DOMContentLoaded', () => {
  showStep(currentStep); // 페이지 진입 시 온보딩부터 시작

  document.querySelectorAll('.onboarding-next').forEach(btn => {
    btn.addEventListener('click', () => {
      currentStep++;
      showStep(currentStep);
    });
  });
});





// 링크 준비
function makeList(items) {
  if (!items || items.length === 0) return '';
  return '<ul>' + items.map(html => `<li>${html}</li>`).join('') + '</ul>';
}

function populateLinkSection(scope) {
  const bucket = linkData[scope] || linkData.all;
  document.getElementById('wiki-policies')   .innerHTML = makeList(bucket.wikiPolicies);
  document.getElementById('wiki-guidelines').innerHTML = makeList(bucket.wikiGuidelines);
  document.getElementById('wiki-essays').innerHTML = makeList(bucket.wikiEssays);
  document.getElementById('inter-wiki-links').innerHTML = makeList(bucket.interWikiLinks);
  document.getElementById('external-sources').innerHTML = makeList(bucket.externalSources);
}





// 모달 토글
function toggleModal(event) {
  const modal = document.getElementById('newModal');
  const modalContent = document.querySelector('.modal-content');
  const aboutButton = document.querySelector('.about-button');

  if (event.target === aboutButton) {
      const isModalVisible = modal.style.display === 'block';
      modal.style.display = isModalVisible ? 'none' : 'block';
      aboutButton.classList.toggle('active', !isModalVisible);
      return;
  }

  if (!modalContent.contains(event.target)) {
      modal.style.display = 'none';
      aboutButton.classList.remove('active');
  }
}
// 전체 문서에 클릭 이벤트 추가 (모달 바깥 클릭 감지)
document.addEventListener("click", toggleModal);





// 유저 툴팁 데이터 넣기, 위치 변경
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.user-tooltip[data-key]').forEach(el => {
    const key = el.getAttribute('data-key');
    if (tooltipUserContent[key]) {
      el.innerHTML = tooltipUserContent[key];
    }

    const parent = el.closest('.username');
    if (!parent) return;

    parent.addEventListener('mouseenter', () => {
      el.style.display = 'block';

      const tooltipRect = el.getBoundingClientRect();
      const parentRect = parent.getBoundingClientRect();
      const spaceAbove = parentRect.top;
      const spaceBelow = window.innerHeight - parentRect.bottom;

      el.classList.remove('user-tooltip-top', 'user-tooltip-bottom');

      if (spaceBelow < tooltipRect.height + 20 && spaceAbove > tooltipRect.height + 20) {
        el.classList.add('user-tooltip-top');
      } else {
        el.classList.add('user-tooltip-bottom');
      }

      el.style.display = '';
    });
  });
});





// tab 별로 내용 보이기
function showTab(tab) {
  document.querySelectorAll('.tab-button').forEach(btn => {
    const target = btn.getAttribute('onclick').match(/showTab\('(\w+)'\)/)[1];
    btn.classList.toggle('active', target === tab);
  });

  const sections = ['summary', 'link', 'unaddressed', 'ask'];
  sections.forEach(id => {
    const el = document.getElementById(id + '-section') || document.getElementById(id + '-section') || (id==='link' && document.getElementById('link-section'));
    if (!el) return;
    if ((id === 'link' && tab === 'summary') || id === tab) {
      el.style.display = id==='link' ? 'flex' : 'block';
    } else {
      el.style.display = 'none';
    }
  });
}





// 서머리 타입 정하기 (+체크박스 보이기)
document.addEventListener('DOMContentLoaded', () => {
  const scopeSelect = document.getElementById('summary-scope');
  const formatSelect = document.getElementById('summary-format');

  const allOptions = {
    single: 'a single paragraph',
    'single-username': 'a single paragraph with username',
    'per-user': 'separate summaries by user',
    'per-comment': 'separate summaries by comment',
  };

  const limitedThreads = ['thread2'];

  function updateFormatOptions() {
    const scope = scopeSelect.value;

    // Clear all existing options
    while (formatSelect.firstChild) {
      formatSelect.removeChild(formatSelect.firstChild);
    }

    if (limitedThreads.includes(scope)) {
      // Only per-comment
      const option = document.createElement('option');
      option.value = 'per-comment';
      option.textContent = allOptions['per-comment'];
      formatSelect.appendChild(option);
    } else {
      // Full options
      Object.entries(allOptions).forEach(([value, label]) => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = label;
        formatSelect.appendChild(option);
      });
    }
  }

  function toggleCommentCheckboxes() {
    const show = scopeSelect.value === 'selected';
    document.querySelectorAll('.comment-checkbox').forEach(cb => {
      cb.style.display = show ? 'inline-block' : 'none';
    });
  }

  // 이벤트 바인딩
  scopeSelect.addEventListener('change', () => {
    updateFormatOptions();
    toggleCommentCheckboxes();
  });

  // 초기 세팅
  updateFormatOptions();
  toggleCommentCheckboxes();
});





// 서머리 만들기
let hasRunSummarizeSelected = false;

function summarizeSelected() {
  if (!hasRunSummarizeSelected) {
    hasRunSummarizeSelected = true;
  }

  const scope = document.getElementById('summary-scope').value;
  const format = document.getElementById('summary-format').value;
  const summaryBox = document.getElementById('summary');

  let summaryHTML = '';

  if (scope === 'selected') {
      summaryHTML = summSelectedComment;

  } else if (scope === 'all') {
      if (format === 'single') {
          summaryHTML = summAllSingle;
      } else if (format === 'single-username') {
          summaryHTML = summAllUsername;
      } else if (format === 'per-user') {
          summaryHTML = summAllByUser;
      } else if (format === 'per-comment') {
          summaryHTML = summAllByComment;
      }

  } else if (scope === 'thread1') {
      if (format === 'single') {
          summaryHTML = summThread1Single;
      } else if (format === 'single-username') {
          summaryHTML = summThread1Username;
      } else if (format === 'per-user') {
          summaryHTML = summThread1ByUser;
      } else if (format === 'per-comment') {
          summaryHTML = summThread1ByComment;
      }

  } else if (['thread2'].includes(scope)) {
    summaryHTML = window[`summ${scope.charAt(0).toUpperCase() + scope.slice(1)}ByComment`];
  }

  summaryBox.innerHTML = summaryHTML;
  showTab('summary');
  populateLinkSection(
    document.getElementById('summary-scope').value
  );
}





//highlight text
function highlightText(elementIds) {
  document.querySelectorAll('.highlight').forEach(element => {
    element.classList.remove('highlight');
  });

  elementIds.forEach(id => {
    const element = document.getElementById(id);

    if (element && element.tagName === 'P' && id.startsWith('comment')) {
      element.classList.add('highlight');
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (element) {
      element.classList.add('highlight');
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
}





// 채팅
document.getElementById('chat-box').addEventListener('submit', function(e) {
  e.preventDefault();

  const chatInput = document.getElementById('chat-input');
  const message = chatInput.value.trim();
  if (message === "") return;

  const chatHistory = document.getElementById('chat-history');
  
  const messageElement = document.createElement('div');
  messageElement.classList.add('chat-message');
  messageElement.textContent = message;

  chatHistory.appendChild(messageElement);
  chatHistory.scrollTop = chatHistory.scrollHeight;
  chatInput.value = "";
});



