const STORAGE_KEY = "study_dice_weekly_tracker_single_file_v2";
const DEFAULT_TASKS = [
  "Linux 驱动学习",
  "STM32 单片机学习",
  "PCB 设计",
  "C 语言与数据结构",
  "英语学习",
  "数学学习",
  "项目实战"
];

const MAO_QUOTES = [
  "世界上怕就怕“认真”二字。",
  "学习的敌人是自己的满足。",
  "谦虚使人进步，骄傲使人落后。",
  "多少事，从来急；天地转，光阴迫。",
  "一万年太久，只争朝夕。",
  "世上无难事，只要肯登攀。",
  "星星之火，可以燎原。",
  "实践出真知。",
  "读书是学习，使用也是学习，而且是更重要的学习。",
  "情况是在不断变化，要使自己的思想适应新的情况。",
  "下定决心，不怕牺牲，排除万难，去争取胜利。",
  "自力更生，艰苦奋斗。",
  "前途是光明的，道路是曲折的。",
  "抓而不紧，等于不抓。",
  "办法总比困难多。",
  "团结就是力量。",
  "好好学习，天天向上。",
  "青年人朝气蓬勃，好像早晨八九点钟的太阳。",
  "与其坐而论道，不如起而行之。",
  "事情总是要人做的，问题总是要人解决的。"
];

const MOTION_LEVELS = ["full", "reduced", "off"];
const MOTION_LEVEL_HINTS = {
  full: "完整模式显示大雪、鼠标雪痕和雪团打屏四溅。",
  reduced: "减弱模式显示暴雨、闪电、玻璃水渍与下滑雨痕。",
  off: "关闭模式会停用全局天气动效，只保留静态界面。"
};
const MOTION_LEVEL_LABELS = {
  full: "完整：大雪纷飞",
  reduced: "减弱：雨水闪电",
  off: "关闭：静态界面"
};
const MAIN_PANELS = ["dashboard", "tasks", "week", "summary", "info"];
const SUMMARY_SCOPES = ["week", "month", "quarter"];
const PANEL_LABELS = {
  intro: "初始界面",
  dashboard: "今日任务",
  tasks: "任务池",
  week: "本周星海记录",
  summary: "全局结算",
  info: "设置 / 说明"
};
const WEEKDAY_LABELS = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
const WEEK_HEAT_LABELS = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
const WEATHER_APP_API_KEY = "f01d87a035c3bd4f3a9dddd4bc75d599";
const WEATHER_APP_API_URL = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";
const DEFAULT_WEATHER_CITY = "Shanghai";
const WEATHER_ICON_MAP = {
  Clouds: "./weather-app/images/clouds.png",
  Clear: "./weather-app/images/clear.png",
  Rain: "./weather-app/images/rain.png",
  Drizzle: "./weather-app/images/drizzle.png",
  Mist: "./weather-app/images/mist.png",
  Snow: "./weather-app/images/snow.png"
};
const WEATHER_STATUS_MAP = {
  Clouds: "多云",
  Clear: "晴朗",
  Rain: "降雨",
  Drizzle: "小雨",
  Mist: "薄雾",
  Snow: "降雪"
};
const CHINA_LEGAL_HOLIDAYS = [
  { date: "2026-01-01", name: "元旦" },
  { date: "2026-02-15", name: "春节" },
  { date: "2026-04-04", name: "清明节" },
  { date: "2026-05-01", name: "劳动节" },
  { date: "2026-06-19", name: "端午节" },
  { date: "2026-09-25", name: "中秋节" },
  { date: "2026-10-01", name: "国庆节" },
  { date: "2027-01-01", name: "元旦" },
  { date: "2027-02-05", name: "春节" },
  { date: "2027-04-05", name: "清明节" },
  { date: "2027-05-01", name: "劳动节" },
  { date: "2027-06-09", name: "端午节" },
  { date: "2027-09-15", name: "中秋节" },
  { date: "2027-10-01", name: "国庆节" }
];

const $ = selector => document.querySelector(selector);
const $$ = selector => Array.from(document.querySelectorAll(selector));

function pad(value) {
  return String(value).padStart(2, "0");
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  }[char]));
}

function dateKey(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function parseDateKey(key) {
  const [year, month, day] = String(key || "").split("-").map(Number);
  return new Date(year || 1970, (month || 1) - 1, day || 1);
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function startOfDayLocal(date = new Date()) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function startOfWeek(date = new Date()) {
  const next = startOfDayLocal(date);
  const day = next.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  next.setDate(next.getDate() + diff);
  return next;
}

function dayDiff(fromDate, toDate) {
  return Math.round((startOfDayLocal(toDate).getTime() - startOfDayLocal(fromDate).getTime()) / 86400000);
}

function formatSeconds(total) {
  const seconds = Math.max(0, Math.floor(total || 0));
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

function formatDateTime(input) {
  if(!input) return "无记录";
  const date = input instanceof Date ? input : new Date(input);
  if(Number.isNaN(date.getTime())) return "无记录";
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function formatDurationWords(totalSeconds) {
  const seconds = Math.max(0, Math.floor(totalSeconds || 0));
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const parts = [];
  if(h) parts.push(`${h} 小时`);
  if(m) parts.push(`${m} 分钟`);
  if(s || !parts.length) parts.push(`${s} 秒`);
  return parts.join("");
}

function timezoneLabel(date = new Date()) {
  const minutes = -date.getTimezoneOffset();
  const sign = minutes >= 0 ? "+" : "-";
  const abs = Math.abs(minutes);
  return `UTC${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`;
}

function createEmptyDay(date = new Date()) {
  return {
    date: dateKey(date),
    workSeconds: 0,
    completedCount: 0,
    taskCompletions: {},
    sessions: [],
    firstStartedAt: null,
    lastEndedAt: null
  };
}

function createDefaultState() {
  return {
    permanentTasks: [...DEFAULT_TASKS],
    temporaryTasksToday: [],
    dailyLogs: {},
    selectedDayKey: dateKey(),
    uiPreferences: {
      skipIntro: false,
      motionLevel: "full",
      weatherSoundEnabled: false,
      themeMode: "default",
      lastMainPanel: "dashboard"
    },
    todaySession: {
      started: false,
      running: false,
      pausedAt: null,
      finishedToday: false,
      accumulatedSeconds: 0,
      currentRunStartedAt: null,
      currentTask: "",
      countdownTotalSeconds: 3600,
      countdownRemainingSeconds: 3600,
      countdownActive: false,
      taskCompletedThisRound: false,
      currentQuoteIndex: 0
    },
    lastOpenedDate: dateKey()
  };
}

function normalizeMotionLevel(value) {
  return MOTION_LEVELS.includes(value) ? value : "full";
}

function safeState(input) {
  const fallback = createDefaultState();
  if(!input || typeof input !== "object") return fallback;

  const todaySession = input.todaySession || {};
  const safe = {
    ...fallback,
    permanentTasks: Array.isArray(input.permanentTasks) ? input.permanentTasks.filter(Boolean) : [...fallback.permanentTasks],
    temporaryTasksToday: Array.isArray(input.temporaryTasksToday) ? input.temporaryTasksToday.filter(Boolean) : [],
    dailyLogs: {},
    selectedDayKey: typeof input.selectedDayKey === "string" ? input.selectedDayKey : fallback.selectedDayKey,
    uiPreferences: {
      ...fallback.uiPreferences,
      ...(input.uiPreferences || {}),
      motionLevel: normalizeMotionLevel(input.uiPreferences?.motionLevel),
      weatherSoundEnabled: input.uiPreferences?.weatherSoundEnabled === true
    },
    todaySession: {
      ...fallback.todaySession,
      started: !!todaySession.started,
      running: !!todaySession.running,
      pausedAt: typeof todaySession.pausedAt === "string" ? todaySession.pausedAt : null,
      finishedToday: !!todaySession.finishedToday,
      accumulatedSeconds: Number(todaySession.accumulatedSeconds || 0),
      currentRunStartedAt: typeof todaySession.currentRunStartedAt === "string" ? todaySession.currentRunStartedAt : null,
      currentTask: typeof todaySession.currentTask === "string" ? todaySession.currentTask : "",
      countdownTotalSeconds: Number(todaySession.countdownTotalSeconds || fallback.todaySession.countdownTotalSeconds),
      countdownRemainingSeconds: Number(todaySession.countdownRemainingSeconds || fallback.todaySession.countdownRemainingSeconds),
      countdownActive: !!todaySession.countdownActive,
      taskCompletedThisRound: !!todaySession.taskCompletedThisRound,
      currentQuoteIndex: Number.isInteger(todaySession.currentQuoteIndex) ? todaySession.currentQuoteIndex : 0
    },
    lastOpenedDate: typeof input.lastOpenedDate === "string" ? input.lastOpenedDate : fallback.lastOpenedDate
  };

  Object.entries(input.dailyLogs || {}).forEach(([key, value]) => {
    safe.dailyLogs[key] = {
      ...createEmptyDay(parseDateKey(key)),
      ...(value || {}),
      taskCompletions: value && typeof value.taskCompletions === "object" ? value.taskCompletions : {},
      sessions: Array.isArray(value?.sessions) ? value.sessions : []
    };
  });

  safe.todaySession.currentQuoteIndex = clamp(safe.todaySession.currentQuoteIndex, 0, Math.max(0, MAO_QUOTES.length - 1));
  return safe;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? safeState(JSON.parse(raw)) : createDefaultState();
  } catch {
    return createDefaultState();
  }
}

let state = loadState();
let activePanel = "intro";
let summaryScope = "week";
let devNavOpen = false;
let modalPrimaryAction = null;
let modalSecondaryAction = null;
let introWeatherRequestId = 0;
let introWeatherState = {
  city: DEFAULT_WEATHER_CITY,
  tempText: "--°C",
  statusText: "输入城市后即可刷新天气",
  humidityText: "--%",
  windText: "-- km/h",
  icon: WEATHER_ICON_MAP.Clear,
  errorText: "",
  loading: false
};

const reducedMotionQuery = typeof window.matchMedia === "function"
  ? window.matchMedia("(prefers-reduced-motion: reduce)")
  : null;

const refs = {
  nav: $("#mainNav"),
  navToggle: $("#btnToggleDevNav"),
  tabs: $$(".tab"),
  panels: $$(".panel"),
  sceneButtons: $$("[data-scene-target]"),
  motionButtons: $$("[data-motion-option]"),
  summaryScopeButtons: $$("[data-summary-scope]"),
  introStart: $("#btnIntroStart"),
  introContinue: $("#btnIntroContinue"),
  introSummary: $("#btnIntroSummary"),
  introInfo: $("#btnIntroInfo"),
  introTasks: $("#btnIntroTasks"),
  introLastPanelLabel: $("#introLastPanelLabel"),
  introClockCard: $(".intro-module-clock"),
  introClockTime: $("#introClockTime"),
  introClockTimezone: $("#introClockTimezone"),
  introClockStatus: $("#introClockStatus"),
  introWeatherCard: $("#introWeatherCard"),
  introWeatherInput: $("#introWeatherInput"),
  introWeatherSearchBtn: $("#introWeatherSearchBtn"),
  introWeatherError: $("#introWeatherError"),
  introWeatherIcon: $("#introWeatherIcon"),
  introWeatherTemp: $("#introWeatherTemp"),
  introWeatherCity: $("#introWeatherCity"),
  introWeatherStatus: $("#introWeatherStatus"),
  introWeatherHumidity: $("#introWeatherHumidity"),
  introWeatherWind: $("#introWeatherWind"),
  introDateYear: $("#introDateYear"),
  introDateWeekLabel: $("#introDateWeekLabel"),
  introDateMonth: $("#introDateMonth"),
  introDateDay: $("#introDateDay"),
  introHolidayCountdown: $("#introHolidayCountdown"),
  introWeekdayName: $("#introWeekdayName"),
  introWeekdayCountdown: $("#introWeekdayCountdown"),
  introWeekMeta: $("#introWeekMeta"),
  weekdayLabels: $("#weekdayLabels"),
  infoMotionHint: $("#infoMotionHint"),
  infoMotionModeText: $("#infoMotionModeText"),
  infoWeatherSoundHint: $("#infoWeatherSoundHint"),
  infoWeatherSoundText: $("#infoWeatherSoundText"),
  weatherSoundToggle: $("#btnToggleWeatherSound"),
  infoThemeModeText: $("#infoThemeModeText"),
  summaryRangeLabel: $("#summaryRangeLabel"),
  summaryTotalTime: $("#summaryTotalTime"),
  summaryTotalDone: $("#summaryTotalDone"),
  summaryActiveDays: $("#summaryActiveDays"),
  summaryScopeTime: $("#summaryScopeTime"),
  summaryScopeDone: $("#summaryScopeDone"),
  summaryScopeActive: $("#summaryScopeActive"),
  summaryTaskRank: $("#summaryTaskRank"),
  summaryTrendChart: $("#summaryTrendChart"),
  summaryTrendNote: $("#summaryTrendNote"),
  summarySliderViewport: $("#summarySliderViewport"),
  summaryScrollPrev: $("#summaryScrollPrev"),
  summaryScrollNext: $("#summaryScrollNext")
};

const modalRefs = {
  root: $("#appModal"),
  title: $("#modalTitle"),
  lines: $("#modalLines"),
  quote: $("#modalQuote"),
  note: $("#modalNote"),
  primary: $("#modalPrimaryBtn"),
  secondary: $("#modalSecondaryBtn")
};

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function currentDateKey() {
  return dateKey(new Date());
}

function ensureCurrentDayState() {
  const todayKey = currentDateKey();
  if(!state.dailyLogs[todayKey]) state.dailyLogs[todayKey] = createEmptyDay(new Date());

  if(state.lastOpenedDate !== todayKey) {
    const currentQuoteIndex = state.todaySession.currentQuoteIndex;
    state.temporaryTasksToday = [];
    state.todaySession = {
      ...createDefaultState().todaySession,
      currentQuoteIndex
    };
    state.lastOpenedDate = todayKey;
    state.selectedDayKey = todayKey;
    if(!state.dailyLogs[todayKey]) state.dailyLogs[todayKey] = createEmptyDay(new Date());
  }
  return todayKey;
}

function todayLog() {
  return state.dailyLogs[ensureCurrentDayState()];
}

function yesterdayLog() {
  return state.dailyLogs[dateKey(addDays(new Date(), -1))] || null;
}

function allTasks() {
  return [...new Set([...state.permanentTasks, ...state.temporaryTasksToday])].filter(Boolean);
}

function safeMainPanel(name) {
  return MAIN_PANELS.includes(name) ? name : "dashboard";
}

function getLastMainPanel() {
  return safeMainPanel(state.uiPreferences?.lastMainPanel);
}

function currentQuote() {
  return MAO_QUOTES[state.todaySession.currentQuoteIndex] || MAO_QUOTES[0] || "";
}

function advanceQuote() {
  if(MAO_QUOTES.length <= 1) return currentQuote();
  let nextIndex = state.todaySession.currentQuoteIndex;
  while(nextIndex === state.todaySession.currentQuoteIndex) {
    nextIndex = Math.floor(Math.random() * MAO_QUOTES.length);
  }
  state.todaySession.currentQuoteIndex = nextIndex;
  return currentQuote();
}

function formatQuoteDisplay(quote) {
  return quote ? `“${quote}”` : "";
}

function showModal({
  title = "提示",
  lines = [],
  note = "",
  quote = "",
  primaryLabel = "知道了",
  secondaryLabel = "",
  onPrimary = null,
  onSecondary = null
} = {}) {
  if(!modalRefs.root) return;
  modalRefs.title.textContent = title;
  modalRefs.lines.innerHTML = lines.map(line => `<div class="modal-line">${line}</div>`).join("");
  modalRefs.quote.textContent = quote ? formatQuoteDisplay(quote) : "";
  modalRefs.quote.classList.toggle("hidden", !quote);
  modalRefs.note.textContent = note;
  modalRefs.note.classList.toggle("hidden", !note);
  modalRefs.primary.textContent = primaryLabel;
  modalRefs.secondary.textContent = secondaryLabel || "关闭";
  modalRefs.secondary.classList.toggle("hidden", !secondaryLabel);
  modalPrimaryAction = onPrimary;
  modalSecondaryAction = onSecondary;
  modalRefs.root.classList.remove("hidden");
}

function closeModal() {
  if(!modalRefs.root) return;
  modalRefs.root.classList.add("hidden");
  modalPrimaryAction = null;
  modalSecondaryAction = null;
}

if(modalRefs.primary) {
  modalRefs.primary.onclick = () => {
    const action = modalPrimaryAction;
    closeModal();
    if(typeof action === "function") action();
  };
}

if(modalRefs.secondary) {
  modalRefs.secondary.onclick = () => {
    const action = modalSecondaryAction;
    closeModal();
    if(typeof action === "function") action();
  };
}

if(modalRefs.root) {
  modalRefs.root.onclick = event => {
    if(event.target === modalRefs.root) closeModal();
  };
}

function getEffectiveMotionLevel() {
  return normalizeMotionLevel(state.uiPreferences?.motionLevel);
}

function getWeatherSoundHint(enabled, motionLevel) {
  if(!enabled) return "天气音效已关闭；视觉动效仍可独立运行。";
  if(motionLevel === "full") return "天气音效开启：播放柔和雪景底噪和雪花轻敲玻璃。";
  if(motionLevel === "reduced") return "天气音效开启：播放自然雨声、雨滴敲玻璃和偶发雷声。";
  return "天气音效开启；动效关闭时保持静音，避免无画面仍有天气声。";
}

function applyUiPreferences() {
  state.uiPreferences.motionLevel = normalizeMotionLevel(state.uiPreferences.motionLevel);
  document.body.dataset.motionLevel = state.uiPreferences.motionLevel;
  document.body.dataset.effectiveMotionLevel = getEffectiveMotionLevel();
  document.body.dataset.weatherSound = state.uiPreferences.weatherSoundEnabled ? "on" : "off";
  document.body.dataset.themeMode = state.uiPreferences.themeMode || "default";
  document.body.dataset.activePanel = activePanel;
}

function initGlobalWeatherEffects() {
  const backdropCanvas = $("#globalWeatherBackdrop");
  const snowCanvas = $("#globalSnowEffect");
  const rainCanvas = $("#globalRainEffect");
  if(!backdropCanvas || !snowCanvas || !rainCanvas) return;

  const backdropCtx = backdropCanvas.getContext("2d");
  const snowCtx = snowCanvas.getContext("2d");
  const rainCtx = rainCanvas.getContext("2d");
  if(!backdropCtx || !snowCtx || !rainCtx) return;

  const pointer = {
    x: window.innerWidth * 0.5,
    y: window.innerHeight * 0.5,
    targetX: window.innerWidth * 0.5,
    targetY: window.innerHeight * 0.5,
    lastX: window.innerWidth * 0.5,
    lastY: window.innerHeight * 0.5,
    velocityX: 0,
    velocityY: 0
  };
  let width = 0;
  let height = 0;
  let snowflakes = [];
  let snowTrails = [];
  let snowBursts = [];
  let snowImpactPoints = [];
  let rainDrops = [];
  let glassDrops = [];
  let mouseRainTrails = [];
  let splashRings = [];
  let lastTrailAt = 0;
  let lastSnowImpactAt = 0;
  let lastSplashAt = 0;
  let nextStormAt = 900;
  let stormUntil = 0;
  let stormPower = 1;
  let nextLightningAt = 0;
  let lightningUntil = 0;
  let lightningX = 0.5;
  let lightningSeed = 0;

  function level() {
    return document.body.dataset.effectiveMotionLevel || document.body.dataset.motionLevel || "full";
  }

  function setCanvasSize(canvas, ctx) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.floor(width * dpr));
    canvas.height = Math.max(1, Math.floor(height * dpr));
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function viewportSize() {
    const viewport = window.visualViewport;
    return {
      width: Math.ceil(viewport?.width || window.innerWidth || document.documentElement.clientWidth || 1),
      height: Math.ceil(viewport?.height || window.innerHeight || document.documentElement.clientHeight || 1)
    };
  }

  function snowTargetCount() {
    return Math.max(330, Math.round(width / 2.8));
  }

  function rainTargetCount() {
    return Math.max(230, Math.round(width / 5.6));
  }

  function limitList(list, max) {
    if(list.length > max) list.splice(0, list.length - max);
  }

  function createSnowflake(fromTop = false) {
    const layerRoll = Math.random();
    const layer = layerRoll > 0.94 ? 4 : layerRoll > 0.78 ? 3 : layerRoll > 0.4 ? 2 : 1;
    const radius = layer === 4 ? 12 + Math.random() * 16 : layer === 3 ? 6 + Math.random() * 9 : layer === 2 ? 3 + Math.random() * 5 : 1.4 + Math.random() * 2.8;
    return {
      x: Math.random() * width,
      y: fromTop ? -70 - Math.random() * height * 0.32 : Math.random() * height,
      layer,
      radius,
      speed: 1.2 + Math.random() * 2.4 + layer * 0.48,
      drift: -0.38 + Math.random() * 0.76,
      phase: Math.random() * Math.PI * 2,
      sway: 0.007 + Math.random() * 0.016,
      alpha: layer >= 3 ? 0.52 + Math.random() * 0.38 : 0.34 + Math.random() * 0.5,
      impactY: height * (0.34 + Math.random() * 0.52)
    };
  }

  function createRainDrop(fromTop = false) {
    const depth = 0.75 + Math.random() * 1.05;
    return {
      x: Math.random() * width,
      y: fromTop ? -130 - Math.random() * height * 0.36 : Math.random() * height,
      length: 64 + Math.random() * 94 * depth,
      depth,
      speed: 16 + Math.random() * 16 * depth,
      alpha: 0.32 + Math.random() * 0.34,
      width: 1.4 + Math.random() * 2.4 * depth
    };
  }

  function createGlassDrop(time, nearPointer = false, force = 1) {
    const spread = nearPointer ? Math.min(width, height) * 0.16 : width;
    const x = nearPointer ? pointer.x + (Math.random() - 0.5) * spread : Math.random() * width;
    const y = nearPointer ? pointer.y + (Math.random() - 0.5) * spread : Math.random() * height;
    const radius = (4.5 + Math.random() * 8.5) * force;
    return {
      x: Math.max(10, Math.min(width - 10, x)),
      y: Math.max(10, Math.min(height - 10, y)),
      radius,
      age: 0,
      life: 1050 + Math.random() * 980,
      slide: 0.24 + Math.random() * 0.46 + force * 0.12,
      trailLength: 38 + Math.random() * 70 * force,
      wobble: Math.random() * Math.PI * 2,
      born: time
    };
  }

  function createSplashRing(x, y, radius, time, force = 1) {
    splashRings.push({
      x,
      y,
      radius,
      force,
      age: 0,
      life: 480 + Math.random() * 360,
      born: time
    });
    limitList(splashRings, 64);
  }

  function createMouseRainTrail(time, dx = 0, dy = 0) {
    const speed = Math.hypot(dx, dy);
    const count = Math.min(5, 1 + Math.round(speed / 18));
    for(let i = 0; i < count; i += 1) {
      mouseRainTrails.push({
        x: pointer.x + (Math.random() - 0.5) * 20,
        y: pointer.y + (Math.random() - 0.5) * 20,
        vx: dx * 0.012 + (Math.random() - 0.5) * 0.32,
        vy: 0.24 + Math.random() * 0.54 + Math.max(0, dy) * 0.01,
        length: 18 + Math.random() * 34,
        radius: 1.6 + Math.random() * 3,
        born: time,
        life: 520 + Math.random() * 520,
        alpha: 0.42 + Math.random() * 0.32
      });
    }
    limitList(mouseRainTrails, 90);
  }

  function emitSnowTrail(time, dx = 0, dy = 0, count = 4) {
    for(let i = 0; i < count; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const spread = 5 + Math.random() * 18;
      snowTrails.push({
        x: pointer.x + Math.cos(angle) * spread,
        y: pointer.y + Math.sin(angle) * spread,
        vx: -dx * 0.035 + (Math.random() - 0.5) * 1.8,
        vy: -dy * 0.02 + (Math.random() - 0.5) * 1.4,
        radius: 1.2 + Math.random() * 3.6,
        born: time,
        life: 520 + Math.random() * 620,
        alpha: 0.5 + Math.random() * 0.38
      });
    }
    limitList(snowTrails, 150);
  }

  function spawnSnowBurst(x, y, force, time) {
    const count = 3 + Math.floor(Math.random() * 2);
    const points = [];
    for(let i = 0; i < count; i += 1) {
      let candidate = null;
      for(let attempt = 0; attempt < 18; attempt += 1) {
        const px = 44 + Math.random() * Math.max(1, width - 88);
        const py = 64 + Math.random() * Math.max(1, height - 128);
        const minDistance = Math.min(width, height) * 0.18;
        const overlaps = [...snowImpactPoints, ...points].some(point => Math.hypot(point.x - px, point.y - py) < minDistance);
        if(!overlaps) {
          candidate = { x: px, y: py };
          break;
        }
      }
      if(!candidate) {
        candidate = {
          x: Math.max(36, Math.min(width - 36, x + (Math.random() - 0.5) * 180)),
          y: Math.max(48, Math.min(height - 48, y + (Math.random() - 0.5) * 150))
        };
      }
      points.push(candidate);
    }

    points.forEach((point, index) => {
      snowImpactPoints.push({
        x: point.x,
        y: point.y,
        radius: 27 + Math.random() * 26 + force * 0.24,
        born: time + index * 80,
        life: 1100 + Math.random() * 620,
        alpha: 0.66 + Math.random() * 0.22,
        flakes: Array.from({ length: 5 + Math.floor(Math.random() * 5) }, () => {
          const angle = Math.random() * Math.PI * 2;
          const spread = 8 + Math.random() * 32;
          return {
            x: Math.cos(angle) * spread,
            y: Math.sin(angle) * spread,
            radius: 0.8 + Math.random() * 2.2,
            alpha: 0.4 + Math.random() * 0.36
          };
        })
      });
    });
    limitList(snowImpactPoints, 18);
    weatherAudio.playSnowTap?.(Math.min(1, force / 28));
  }

  function refillParticles() {
    while(snowflakes.length < snowTargetCount()) snowflakes.push(createSnowflake(false));
    while(snowflakes.length > snowTargetCount()) snowflakes.pop();
    while(rainDrops.length < rainTargetCount()) rainDrops.push(createRainDrop(false));
    while(rainDrops.length > rainTargetCount()) rainDrops.pop();
  }

  function resize() {
    const viewport = viewportSize();
    width = viewport.width;
    height = viewport.height;
    setCanvasSize(backdropCanvas, backdropCtx);
    setCanvasSize(snowCanvas, snowCtx);
    setCanvasSize(rainCanvas, rainCtx);
    snowflakes = Array.from({ length: snowTargetCount() }, () => createSnowflake(false));
    rainDrops = Array.from({ length: rainTargetCount() }, () => createRainDrop(false));
    snowTrails = [];
    snowBursts = [];
    snowImpactPoints = [];
    glassDrops = [];
    mouseRainTrails = [];
    splashRings = [];
  }

  function clear(ctx) {
    ctx.clearRect(0, 0, width, height);
  }

  function drawSnowParticle(ctx, particle, radius, alpha, glowScale = 0) {
    if(glowScale > 0) {
      const glow = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, radius * glowScale);
      glow.addColorStop(0, `rgba(255,255,255,${alpha * 0.72})`);
      glow.addColorStop(0.48, `rgba(220,236,255,${alpha * 0.34})`);
      glow.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, radius * glowScale, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = `rgba(255,255,255,${Math.min(0.96, alpha)})`;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawSnow(time) {
    clear(backdropCtx);
    clear(snowCtx);
    refillParticles();
    const pointerRatio = (pointer.x / Math.max(width, 1)) - 0.5;
    const wind = pointerRatio * 10.5;
    const verticalPull = ((pointer.y / Math.max(height, 1)) - 0.5) * 0.78;
    const pointerMove = Math.hypot(pointer.velocityX, pointer.velocityY);

    if(pointerMove > 1.2 && time - lastTrailAt > 22) {
      emitSnowTrail(time, pointer.velocityX, pointer.velocityY, Math.min(9, 3 + Math.round(pointerMove / 16)));
      lastTrailAt = time;
    }

    snowflakes.forEach(flake => {
      flake.phase += flake.sway;
      flake.x += flake.drift + Math.sin(time * 0.0014 + flake.phase) * (0.4 + flake.layer * 0.18) + wind * (0.12 + flake.layer * 0.09);
      flake.y += flake.speed + verticalPull;

      if(flake.layer === 4 && flake.y >= flake.impactY && time - lastSnowImpactAt > 2100) {
        spawnSnowBurst(flake.x, flake.y, flake.radius, time);
        lastSnowImpactAt = time;
        Object.assign(flake, createSnowflake(true));
        return;
      }
      if(flake.y - flake.radius > height + 32 || flake.x < -110 || flake.x > width + 110) {
        Object.assign(flake, createSnowflake(true));
        flake.x = Math.random() * width;
      }

      const coreRadius = Math.max(1.1, flake.radius * (flake.layer >= 3 ? 0.5 : 0.62));
      drawSnowParticle(backdropCtx, flake, coreRadius, Math.min(0.86, flake.alpha + 0.08), flake.layer >= 3 ? 3.2 : 0);
    });

    snowTrails = snowTrails.filter(trail => {
      const age = time - trail.born;
      if(age > trail.life) return false;
      const progress = age / trail.life;
      trail.x += trail.vx + wind * 0.018;
      trail.y += trail.vy + 0.18 + progress * 0.34;
      drawSnowParticle(snowCtx, trail, trail.radius * (1 - progress * 0.32), trail.alpha * (1 - progress), 2.4);
      return true;
    });

    snowImpactPoints = snowImpactPoints.filter(point => {
      const age = time - point.born;
      if(age < 0) return true;
      if(age > point.life) return false;
      const progress = age / point.life;
      const alpha = point.alpha * (1 - progress);
      const radius = point.radius * (0.72 + progress * 0.72);
      const halo = snowCtx.createRadialGradient(point.x, point.y, 0, point.x, point.y, radius * 1.65);
      halo.addColorStop(0, `rgba(255,255,255,${0.36 * alpha})`);
      halo.addColorStop(0.42, `rgba(226,238,255,${0.24 * alpha})`);
      halo.addColorStop(1, "rgba(255,255,255,0)");
      snowCtx.fillStyle = halo;
      snowCtx.beginPath();
      snowCtx.arc(point.x, point.y, radius * 1.65, 0, Math.PI * 2);
      snowCtx.fill();
      snowCtx.strokeStyle = `rgba(242,249,255,${0.42 * alpha})`;
      snowCtx.lineWidth = Math.max(0.8, 1.8 * (1 - progress));
      snowCtx.beginPath();
      snowCtx.arc(point.x, point.y, radius, 0, Math.PI * 2);
      snowCtx.stroke();
      point.flakes.forEach(flake => {
        const drift = 1 + progress * 1.25;
        drawSnowParticle(
          snowCtx,
          { x: point.x + flake.x * drift, y: point.y + flake.y * drift + progress * 8 },
          flake.radius * (1 - progress * 0.25),
          flake.alpha * (1 - progress),
          1.4
        );
      });
      return true;
    });
  }

  function drawLightning(time, slant) {
    const ctx = backdropCtx;
    if(time > nextLightningAt) {
      lightningUntil = time + 120 + Math.random() * 150;
      nextLightningAt = time + 1900 + Math.random() * 3600;
      lightningX = 0.22 + Math.random() * 0.56;
      lightningSeed = Math.random() * 999;
    }
    if(time > lightningUntil) return;

    const remaining = Math.max(0, lightningUntil - time);
    const intensity = Math.min(1, remaining / 170);
    ctx.fillStyle = `rgba(205,225,255,${0.18 + intensity * 0.28})`;
    ctx.fillRect(0, 0, width, height);

    const startX = width * lightningX;
    let x = startX;
    let y = 0;
    ctx.beginPath();
    ctx.moveTo(x, y);
    for(let i = 0; i < 8; i += 1) {
      x += Math.sin(lightningSeed + i * 2.7) * 54 + slant * 8;
      y += height / 7;
      ctx.lineTo(x, y);
    }
    ctx.strokeStyle = `rgba(246,251,255,${0.78 + intensity * 0.2})`;
    ctx.lineWidth = 3;
    ctx.shadowColor = "rgba(178,214,255,.78)";
    ctx.shadowBlur = 26;
    ctx.stroke();

    for(let branch = 0; branch < 4; branch += 1) {
      const by = height * (0.18 + branch * 0.12);
      const bx = startX + Math.sin(lightningSeed + branch) * 64;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bx + (branch % 2 ? -1 : 1) * (58 + branch * 18), by + 58 + branch * 10);
      ctx.strokeStyle = `rgba(232,244,255,${0.38 + intensity * 0.28})`;
      ctx.lineWidth = 1.4;
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
  }

  function maybeStartStorm(time) {
    if(time > nextStormAt) {
      stormUntil = time + 620 + Math.random() * 780;
      stormPower = 0.9 + Math.random() * 0.7;
      nextStormAt = time + 4200 + Math.random() * 6600;
    }
    return time < stormUntil ? Math.max(0, (stormUntil - time) / 900) * stormPower : 0;
  }

  function drawRain(time) {
    clear(backdropCtx);
    clear(rainCtx);
    refillParticles();
    const pointerRatio = (pointer.x / Math.max(width, 1)) - 0.5;
    const pointerYRatio = (pointer.y / Math.max(height, 1)) - 0.5;
    const slant = -16 + pointerRatio * 38;
    const storm = maybeStartStorm(time);
    const lightningBoost = time < lightningUntil ? 0.42 : 0;
    const brightnessBoost = storm * 0.2 + lightningBoost;

    const sheen = backdropCtx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, Math.max(width, height) * 0.44);
    sheen.addColorStop(0, `rgba(205,230,255,${0.2 + brightnessBoost * 0.16})`);
    sheen.addColorStop(0.42, `rgba(120,168,225,${0.08 + brightnessBoost * 0.08})`);
    sheen.addColorStop(1, "rgba(20,28,48,0)");
    backdropCtx.fillStyle = sheen;
    backdropCtx.fillRect(0, 0, width, height);

    backdropCtx.lineCap = "round";
    rainDrops.forEach(drop => {
      drop.x += slant * 0.13 * drop.depth + storm * pointerRatio * 2.4;
      drop.y += drop.speed + pointerYRatio * 1.4 + storm * 4.8;
      if(drop.y - drop.length > height + 40 || drop.x < -130 || drop.x > width + 130) {
        Object.assign(drop, createRainDrop(true));
        drop.x = Math.random() * width;
      }
      backdropCtx.beginPath();
      backdropCtx.strokeStyle = `rgba(198,226,255,${Math.min(0.82, drop.alpha + brightnessBoost * 0.28)})`;
      backdropCtx.lineWidth = drop.width + storm * 1.2 + lightningBoost * 0.55;
      backdropCtx.moveTo(drop.x, drop.y);
      backdropCtx.lineTo(drop.x + slant * (1 + storm * 0.16), drop.y - drop.length);
      backdropCtx.stroke();
    });

    if(storm > 0.08) {
      const curtainCount = Math.round(5 + storm * 8);
      for(let i = 0; i < curtainCount; i += 1) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        backdropCtx.beginPath();
        backdropCtx.strokeStyle = `rgba(225,242,255,${0.16 + storm * 0.18})`;
        backdropCtx.lineWidth = 2.1 + storm * 1.9;
        backdropCtx.moveTo(x, y);
        backdropCtx.lineTo(x + slant * 1.35, y + 82 + storm * 44);
        backdropCtx.stroke();
      }
    }

    const splashChance = storm > 0 ? 0.82 : 0.44;
    const minSplashDelay = storm > 0 ? 42 : 92;
    if(time - lastSplashAt > minSplashDelay && Math.random() < splashChance) {
      const force = storm > 0 ? 1.18 + Math.random() * 0.44 : 0.86 + Math.random() * 0.3;
      const drop = createGlassDrop(time, false, force);
      glassDrops.push(drop);
      createSplashRing(drop.x, drop.y, drop.radius * (0.86 + Math.random() * 0.28), time, force);
      lastSplashAt = time;
      limitList(glassDrops, 48);
      weatherAudio.playRainTap?.(force);
    }

    glassDrops = glassDrops.filter(drop => {
      drop.age = time - drop.born;
      if(drop.age > drop.life || drop.y > height + 80) return false;
      const progress = drop.age / drop.life;
      drop.y += drop.slide + progress * 0.62 + storm * 0.18;
      drop.x += Math.sin(progress * Math.PI * 4 + drop.wobble) * 0.09 + pointerRatio * 0.14;
      const alpha = Math.max(0, 1 - progress);
      const radius = drop.radius * (0.84 + progress * 0.12);

      rainCtx.strokeStyle = `rgba(218,240,255,${0.44 * alpha + brightnessBoost * 0.14})`;
      rainCtx.lineWidth = Math.max(0.92, radius * 0.24 * alpha);
      rainCtx.beginPath();
      rainCtx.moveTo(drop.x + Math.sin(progress * 7 + drop.wobble) * 1.6, drop.y - drop.trailLength * (0.46 + progress * 0.54));
      rainCtx.lineTo(drop.x, drop.y + radius * 0.8);
      rainCtx.stroke();

      rainCtx.strokeStyle = `rgba(255,255,255,${0.2 * alpha + brightnessBoost * 0.07})`;
      rainCtx.lineWidth = Math.max(0.42, radius * 0.075 * alpha);
      rainCtx.beginPath();
      rainCtx.moveTo(drop.x - radius * 0.28, drop.y - drop.trailLength * (0.28 + progress * 0.72));
      rainCtx.lineTo(drop.x - radius * 0.08, drop.y + radius * 0.45);
      rainCtx.stroke();

      const gleam = rainCtx.createRadialGradient(drop.x - radius * 0.24, drop.y - radius * 0.28, 0, drop.x, drop.y, radius * 1.15);
      gleam.addColorStop(0, `rgba(250,253,255,${0.38 * alpha + brightnessBoost * 0.08})`);
      gleam.addColorStop(0.5, `rgba(172,214,248,${0.18 * alpha})`);
      gleam.addColorStop(1, "rgba(255,255,255,0)");
      rainCtx.fillStyle = gleam;
      rainCtx.beginPath();
      rainCtx.arc(drop.x, drop.y, radius * 1.12, 0, Math.PI * 2);
      rainCtx.fill();
      rainCtx.strokeStyle = `rgba(246,252,255,${0.56 * alpha + brightnessBoost * 0.16})`;
      rainCtx.lineWidth = 1.45;
      rainCtx.beginPath();
      rainCtx.arc(drop.x, drop.y, radius, 0, Math.PI * 2);
      rainCtx.stroke();
      return true;
    });

    mouseRainTrails = mouseRainTrails.filter(trail => {
      const age = time - trail.born;
      if(age > trail.life) return false;
      const progress = age / trail.life;
      const alpha = trail.alpha * (1 - progress);
      trail.x += trail.vx + pointerRatio * 0.08;
      trail.y += trail.vy + progress * 0.38;
      rainCtx.strokeStyle = `rgba(224,243,255,${0.36 * alpha + brightnessBoost * 0.08})`;
      rainCtx.lineWidth = Math.max(0.55, trail.radius * 0.42 * (1 - progress));
      rainCtx.beginPath();
      rainCtx.moveTo(trail.x, trail.y - trail.length * (0.4 + progress * 0.5));
      rainCtx.lineTo(trail.x + trail.vx * 4, trail.y + trail.length * 0.32);
      rainCtx.stroke();

      const bead = rainCtx.createRadialGradient(trail.x, trail.y, 0, trail.x, trail.y, trail.radius * 2.2);
      bead.addColorStop(0, `rgba(250,253,255,${0.28 * alpha})`);
      bead.addColorStop(0.58, `rgba(170,214,248,${0.12 * alpha})`);
      bead.addColorStop(1, "rgba(255,255,255,0)");
      rainCtx.fillStyle = bead;
      rainCtx.beginPath();
      rainCtx.arc(trail.x, trail.y, trail.radius * 2.2, 0, Math.PI * 2);
      rainCtx.fill();
      return true;
    });

    splashRings = splashRings.filter(ring => {
      ring.age = time - ring.born;
      if(ring.age > ring.life) return false;
      const progress = ring.age / ring.life;
      const alpha = Math.max(0, 1 - progress);
      const radius = ring.radius + progress * (13 + ring.force * 9);
      rainCtx.strokeStyle = `rgba(232,247,255,${0.48 * alpha + brightnessBoost * 0.08})`;
      rainCtx.lineWidth = Math.max(0.55, 1.9 * alpha);
      rainCtx.beginPath();
      rainCtx.arc(ring.x + pointerRatio * 5 * progress, ring.y + progress * 5, radius, 0, Math.PI * 2);
      rainCtx.stroke();
      rainCtx.strokeStyle = `rgba(175,215,246,${0.22 * alpha})`;
      rainCtx.beginPath();
      rainCtx.arc(ring.x, ring.y, radius * 0.45, 0, Math.PI * 2);
      rainCtx.stroke();
      return true;
    });

    drawLightning(time, slant);
  }

  function clearInactiveEffects() {
    snowTrails = [];
    snowBursts = [];
    snowImpactPoints = [];
    glassDrops = [];
    mouseRainTrails = [];
    splashRings = [];
  }

  function render(time) {
    requestAnimationFrame(render);
    const viewport = viewportSize();
    if(viewport.width !== width || viewport.height !== height) resize();
    pointer.velocityX = pointer.targetX - pointer.x;
    pointer.velocityY = pointer.targetY - pointer.y;
    pointer.x += pointer.velocityX * 0.12;
    pointer.y += pointer.velocityY * 0.12;

    const current = level();
    if(current === "full") {
      clear(rainCtx);
      glassDrops = [];
      mouseRainTrails = [];
      splashRings = [];
      drawSnow(time);
    } else if(current === "reduced") {
      clear(snowCtx);
      snowTrails = [];
      snowBursts = [];
      snowImpactPoints = [];
      drawRain(time);
    } else {
      clear(backdropCtx);
      clear(snowCtx);
      clear(rainCtx);
      clearInactiveEffects();
    }
  }

  function handlePointer(event) {
    const point = event.touches?.[0] || event;
    const nextX = point.clientX;
    const nextY = point.clientY;
    const dx = nextX - pointer.lastX;
    const dy = nextY - pointer.lastY;
    pointer.targetX = nextX;
    pointer.targetY = nextY;
    pointer.lastX = nextX;
    pointer.lastY = nextY;

    const now = performance.now();
    if(level() === "full" && Math.hypot(dx, dy) > 2) {
      emitSnowTrail(now, dx, dy, Math.min(10, 4 + Math.round(Math.hypot(dx, dy) / 18)));
    } else if(level() === "reduced" && Math.hypot(dx, dy) > 8) {
      createMouseRainTrail(now, dx, dy);
    }
  }

  resize();
  window.addEventListener("resize", resize);
  window.visualViewport?.addEventListener("resize", resize);
  window.visualViewport?.addEventListener("scroll", resize);
  document.addEventListener("mousemove", handlePointer, { passive: true });
  document.addEventListener("touchmove", handlePointer, { passive: true });
  requestAnimationFrame(render);
}

function initWeatherAudio() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if(!AudioContextClass) {
    return {
      activate() {},
      setMode() {},
      disable() {},
      playSnowTap() {},
      playRainTap() {}
    };
  }

  const audioFiles = {
    rainLoop: ["assets/audio/rain-loop.mp3", "assets/audio/rain-loop.ogg"],
    snowLoop: [],
    thunder: ["assets/audio/thunder-01.mp3", "assets/audio/thunder-01.ogg"],
    rainTap: ["assets/audio/rain-tap-01.mp3", "assets/audio/rain-tap-01.ogg"],
    snowTap: "assets/audio/snow-tap-01.ogg"
  };
  let ctx = null;
  let masterGain = null;
  let snowGain = null;
  let rainGain = null;
  let snowSynthGain = null;
  let rainSynthGain = null;
  let snowSource = null;
  let rainSource = null;
  let snowLoopSource = null;
  let rainLoopSource = null;
  let thunderTimer = null;
  let activeMode = "off";
  let unlocked = false;
  let enabled = false;
  let localAudioLoading = false;
  let localAudioLoaded = false;
  const audioBuffers = {};

  function createNoiseBuffer(duration = 2) {
    const sampleRate = ctx.sampleRate;
    const buffer = ctx.createBuffer(1, Math.floor(sampleRate * duration), sampleRate);
    const data = buffer.getChannelData(0);
    let previous = 0;
    for(let i = 0; i < data.length; i += 1) {
      const white = Math.random() * 2 - 1;
      previous = previous * 0.86 + white * 0.14;
      data[i] = previous;
    }
    return buffer;
  }

  function createLoopingNoise(output, filterType, frequency, qValue) {
    const source = ctx.createBufferSource();
    source.buffer = createNoiseBuffer(2.8);
    source.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.value = frequency;
    filter.Q.value = qValue;
    source.connect(filter);
    filter.connect(output);
    source.start();
    return source;
  }

  async function loadAudioBuffer(key, urls) {
    const sourceList = Array.isArray(urls) ? urls : [urls].filter(Boolean);
    audioBuffers[key] = null;
    for(const url of sourceList) {
      try {
        const response = await fetch(url, { cache: "force-cache" });
        if(!response.ok) throw new Error(`${response.status} ${response.statusText}`);
        const data = await response.arrayBuffer();
        audioBuffers[key] = await ctx.decodeAudioData(data);
        return;
      } catch(error) {
        console.info(`Weather audio fallback for ${key}`, error);
      }
    }
  }

  function loadLocalAudio() {
    if(localAudioLoading) return;
    localAudioLoading = true;
    Promise.all(Object.entries(audioFiles).map(([key, url]) => loadAudioBuffer(key, url))).then(() => {
      localAudioLoaded = true;
      setMode(activeMode);
    });
  }

  function stopLoopSource(source) {
    if(!source) return;
    try {
      source.stop();
    } catch(error) {
      // Source may already be stopped by the browser.
    }
  }

  function startLocalLoop(key, currentSource, output) {
    if(!audioBuffers[key] || currentSource) return currentSource;
    const source = ctx.createBufferSource();
    source.buffer = audioBuffers[key];
    source.loop = true;
    source.connect(output);
    source.start();
    return source;
  }

  function playLocalShot(key, output, volume = 0.05) {
    if(!audioBuffers[key]) return false;
    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    const now = ctx.currentTime;
    source.buffer = audioBuffers[key];
    gain.gain.setValueAtTime(Math.max(0.001, volume), now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + Math.min(2.6, source.buffer.duration));
    source.connect(gain);
    gain.connect(output);
    source.start(now);
    source.stop(now + Math.min(3, source.buffer.duration));
    return true;
  }

  function ensureContext() {
    if(ctx) return;
    ctx = new AudioContextClass();
    masterGain = ctx.createGain();
    snowGain = ctx.createGain();
    rainGain = ctx.createGain();
    snowSynthGain = ctx.createGain();
    rainSynthGain = ctx.createGain();
    masterGain.gain.value = 0.42;
    snowGain.gain.value = 0;
    rainGain.gain.value = 0;
    snowSynthGain.gain.value = 1;
    rainSynthGain.gain.value = 1;
    snowSynthGain.connect(snowGain);
    rainSynthGain.connect(rainGain);
    snowGain.connect(masterGain);
    rainGain.connect(masterGain);
    masterGain.connect(ctx.destination);
    snowSource = createLoopingNoise(snowSynthGain, "lowpass", 1050, 0.5);
    rainSource = createLoopingNoise(rainSynthGain, "bandpass", 1850, 0.8);
    loadLocalAudio();
  }

  function fade(gainNode, value, seconds = 0.55) {
    if(!ctx || !gainNode) return;
    const now = ctx.currentTime;
    gainNode.gain.cancelScheduledValues(now);
    gainNode.gain.setTargetAtTime(value, now, seconds / 4);
  }

  function playThunder() {
    if(!ctx || !enabled || activeMode !== "reduced") return;
    if(playLocalShot("thunder", masterGain, 0.14)) return;
    const now = ctx.currentTime;
    const thunderGain = ctx.createGain();
    const rumble = ctx.createOscillator();
    const noise = ctx.createBufferSource();
    const noiseFilter = ctx.createBiquadFilter();

    thunderGain.gain.setValueAtTime(0.0001, now);
    thunderGain.gain.exponentialRampToValueAtTime(0.18, now + 0.05);
    thunderGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.45);

    rumble.type = "sine";
    rumble.frequency.setValueAtTime(54 + Math.random() * 22, now);
    rumble.frequency.exponentialRampToValueAtTime(30, now + 1.3);

    noise.buffer = createNoiseBuffer(1.4);
    noiseFilter.type = "lowpass";
    noiseFilter.frequency.setValueAtTime(210, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(70, now + 1.3);

    rumble.connect(thunderGain);
    noise.connect(noiseFilter);
    noiseFilter.connect(thunderGain);
    thunderGain.connect(masterGain);
    rumble.start(now);
    noise.start(now);
    rumble.stop(now + 1.5);
    noise.stop(now + 1.5);
  }

  function playSnowTap(intensity = 0.6) {
    if(!ctx || !unlocked || !enabled || activeMode !== "full") return;
    if(playLocalShot("snowTap", masterGain, 0.028 * Math.max(0.35, Math.min(1, intensity)))) return;
    const now = ctx.currentTime;
    const tapGain = ctx.createGain();
    const noise = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const level = Math.max(0.25, Math.min(1, intensity));

    noise.buffer = createNoiseBuffer(0.18);
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(760 + Math.random() * 520, now);
    filter.Q.value = 1.25;
    tapGain.gain.setValueAtTime(0.0001, now);
    tapGain.gain.exponentialRampToValueAtTime(0.032 * level, now + 0.012);
    tapGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
    noise.connect(filter);
    filter.connect(tapGain);
    tapGain.connect(masterGain);
    noise.start(now);
    noise.stop(now + 0.18);
  }

  function playRainTap(intensity = 0.7) {
    if(!ctx || !unlocked || !enabled || activeMode !== "reduced") return;
    if(playLocalShot("rainTap", masterGain, 0.035 * Math.max(0.35, Math.min(1.2, intensity)))) return;
    const now = ctx.currentTime;
    const tapGain = ctx.createGain();
    const noise = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const level = Math.max(0.25, Math.min(1.25, intensity));

    noise.buffer = createNoiseBuffer(0.12);
    filter.type = "highpass";
    filter.frequency.setValueAtTime(1200 + Math.random() * 900, now);
    tapGain.gain.setValueAtTime(0.0001, now);
    tapGain.gain.exponentialRampToValueAtTime(0.04 * level, now + 0.006);
    tapGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
    noise.connect(filter);
    filter.connect(tapGain);
    tapGain.connect(masterGain);
    noise.start(now);
    noise.stop(now + 0.12);
  }

  function scheduleThunder() {
    window.clearTimeout(thunderTimer);
    if(!unlocked || !enabled || activeMode !== "reduced") return;
    thunderTimer = window.setTimeout(() => {
      playThunder();
      scheduleThunder();
    }, 4200 + Math.random() * 7200);
  }

  async function activate(mode) {
    ensureContext();
    unlocked = true;
    enabled = true;
    try {
      if(ctx.state === "suspended") await ctx.resume();
    } catch(error) {
      console.warn("Weather audio could not resume", error);
    }
    setMode(mode);
  }

  function setMode(mode) {
    activeMode = normalizeMotionLevel(mode);
    if(!unlocked || !ctx || !enabled) return;
    const hasLocalSnow = localAudioLoaded && !!audioBuffers.snowLoop;
    const hasLocalRain = localAudioLoaded && !!audioBuffers.rainLoop;
    if(activeMode === "full") {
      snowLoopSource = startLocalLoop("snowLoop", snowLoopSource, snowGain);
      fade(snowSynthGain, hasLocalSnow ? 0 : 1, 0.35);
      fade(rainSynthGain, 0, 0.35);
      fade(snowGain, hasLocalSnow ? 0.075 : 0.055);
      fade(rainGain, 0);
      window.clearTimeout(thunderTimer);
    } else if(activeMode === "reduced") {
      rainLoopSource = startLocalLoop("rainLoop", rainLoopSource, rainGain);
      fade(snowSynthGain, 0, 0.35);
      fade(rainSynthGain, hasLocalRain ? 0 : 1, 0.35);
      fade(snowGain, 0);
      fade(rainGain, hasLocalRain ? 0.105 : 0.085);
      scheduleThunder();
    } else {
      fade(snowGain, 0);
      fade(rainGain, 0);
      window.clearTimeout(thunderTimer);
    }
  }

  function disable() {
    enabled = false;
    if(ctx) {
      fade(snowGain, 0);
      fade(rainGain, 0);
    }
    window.clearTimeout(thunderTimer);
  }

  return {
    activate,
    setMode,
    disable,
    playSnowTap,
    playRainTap
  };
}

const weatherAudio = initWeatherAudio();

function syncNavVisibility() {
  if(!refs.nav || !refs.navToggle) return;
  refs.nav.classList.toggle("nav-hidden", !devNavOpen);
  refs.navToggle.textContent = devNavOpen ? "收起开发导航" : "开发调试导航";
  refs.navToggle.setAttribute("aria-expanded", String(devNavOpen));
}

function renderSceneRails() {
  refs.sceneButtons.forEach(button => {
    const isCurrent = button.dataset.sceneTarget === activePanel;
    button.classList.toggle("is-current", isCurrent);
    if(isCurrent) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });
}

function renderTopStats() {
  ensureCurrentDayState();
  const stats = $$(".stats > div");
  const session = state.todaySession;
  const displaySeconds = (session.running || session.pausedAt) ? session.accumulatedSeconds : 0;
  if(stats[0]) stats[0].innerHTML = `今日日期：<span id="todayDate">${escapeHtml(currentDateKey())}</span>`;
  if(stats[1]) stats[1].innerHTML = `今日累计时长：<strong id="todayWorkTop">${formatSeconds(displaySeconds)}</strong>`;
  if(stats[2]) stats[2].innerHTML = `今日完成任务数：<strong id="todayDoneTop">${todayLog().completedCount}</strong>`;
}

function applyStaticCopy() {
  document.title = "任务骰子学习站 V5";
  const topTitle = document.querySelector(".top-copy .title");
  const topSub = document.querySelector(".top-copy .sub");
  const devNote = document.querySelector(".dev-nav-note");
  if(topTitle) topTitle.textContent = "任务骰子学习站";
  if(topSub) topSub.textContent = "欢迎你的到来。本网站为静态部署，所有数据只保存在当前浏览器的本地存储中。你可以在这里记录任务进度、周记录与完成情况。";
  if(devNote) devNote.textContent = "普通流程始终从 Intro 进入；顶部导航只保留为开发调试入口。";

  $$("[data-scene-target='intro']").forEach(button => { button.textContent = "返回初始界面"; });
  $$("[data-scene-target='dashboard']").forEach(button => { button.textContent = "进入今日任务"; });
  $$("[data-scene-target='tasks']").forEach(button => { button.textContent = "进入任务池"; });
  $$("[data-scene-target='week']").forEach(button => { button.textContent = "本周星海记录"; });
  $$("[data-scene-target='summary']").forEach(button => { button.textContent = "查看全局结算"; });
  $$("[data-scene-target='info']").forEach(button => { button.textContent = "设置 / 说明"; });

  const dashboardKicker = document.querySelector("#panel-dashboard .panel-kicker");
  if(dashboardKicker) dashboardKicker.textContent = "Today / Mission Console";
}

function getNextHolidayInfo(date = new Date()) {
  const next = CHINA_LEGAL_HOLIDAYS.find(item => dayDiff(date, parseDateKey(item.date)) >= 0);
  if(!next) {
    return {
      headline: "当前年份之后暂无节假日数据",
      meta: "当前节假日表仅覆盖到 2027 年"
    };
  }
  const days = dayDiff(date, parseDateKey(next.date));
  if(days === 0) {
    return {
      headline: `今天就是 ${next.name}`,
      meta: `${next.date} 开始`
    };
  }
  return {
    headline: `距下一个节假日 ${next.name} 还有 ${days} 天`,
    meta: `${next.date} 开始`
  };
}

function getNextRestDayInfo(date = new Date()) {
  const day = date.getDay();
  if(day === 0 || day === 6) {
    return {
      headline: "今天就是休息日",
      meta: "周末休息中"
    };
  }

  const daysUntilSaturday = 6 - day;
  return {
    headline: `还有 ${daysUntilSaturday} 天迎来休息日`,
    meta: daysUntilSaturday === 1 ? "下一个休息日：明天周六" : "下一个休息日：周六"
  };
}

function renderIntroWeather() {
  if(!refs.introWeatherCard) return;
  refs.introWeatherCard.classList.toggle("is-loading", !!introWeatherState.loading);
  refs.introWeatherCard.classList.toggle("is-error", !!introWeatherState.errorText);
  if(refs.introWeatherIcon) refs.introWeatherIcon.src = introWeatherState.icon;
  if(refs.introWeatherCity) refs.introWeatherCity.textContent = introWeatherState.city;
  if(refs.introWeatherTemp) refs.introWeatherTemp.textContent = introWeatherState.tempText;
  if(refs.introWeatherStatus) refs.introWeatherStatus.textContent = introWeatherState.statusText;
  if(refs.introWeatherHumidity) refs.introWeatherHumidity.textContent = introWeatherState.humidityText;
  if(refs.introWeatherWind) refs.introWeatherWind.textContent = introWeatherState.windText;
  if(refs.introWeatherError) {
    refs.introWeatherError.textContent = introWeatherState.errorText || "未找到对应城市，请检查拼写后重试。";
    refs.introWeatherError.classList.toggle("hidden", !introWeatherState.errorText);
  }
}

function setIntroWeatherState(patch) {
  introWeatherState = {
    ...introWeatherState,
    ...patch
  };
  renderIntroWeather();
}

function weatherIconFor(main) {
  return WEATHER_ICON_MAP[main] || WEATHER_ICON_MAP.Clear;
}

async function fetchIntroWeather(cityName) {
  const city = String(cityName || "").trim();
  if(!city) {
    setIntroWeatherState({
      errorText: "请输入城市名称后再搜索。",
      loading: false
    });
    return;
  }

  const requestId = ++introWeatherRequestId;
  setIntroWeatherState({
    city,
    loading: true,
    errorText: "",
    statusText: "正在连接天气服务",
    tempText: "--°C",
    humidityText: "--%",
    windText: "-- km/h"
  });

  try {
    const response = await fetch(`${WEATHER_APP_API_URL}${encodeURIComponent(city)}&appid=${WEATHER_APP_API_KEY}`);
    if(requestId !== introWeatherRequestId) return;

    if(response.status === 404) {
      setIntroWeatherState({
        loading: false,
        errorText: "未找到对应城市，请检查拼写后重试。",
        statusText: "天气搜索失败"
      });
      return;
    }

    if(!response.ok) {
      throw new Error(String(response.status));
    }

    const data = await response.json();
    if(requestId !== introWeatherRequestId) return;

    setIntroWeatherState({
      city: data.name || city,
      tempText: `${Math.round(Number(data?.main?.temp || 0))}°C`,
      statusText: data?.weather?.[0]?.main ? `当前天气：${WEATHER_STATUS_MAP[data.weather[0].main] || data.weather[0].main}` : "天气已同步",
      humidityText: `${Number(data?.main?.humidity || 0)}%`,
      windText: `${Number(data?.wind?.speed || 0)} km/h`,
      icon: weatherIconFor(data?.weather?.[0]?.main),
      errorText: "",
      loading: false
    });
  } catch {
    if(requestId !== introWeatherRequestId) return;
    setIntroWeatherState({
      loading: false,
      errorText: "天气接口暂时不可用，请稍后再试。",
      statusText: "天气接口暂不可用"
    });
  }
}

function renderIntroDashboard(now = new Date()) {
  if(refs.introClockTime) refs.introClockTime.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  if(refs.introClockTimezone) refs.introClockTimezone.textContent = timezoneLabel(now);
  if(refs.introClockStatus) refs.introClockStatus.textContent = activePanel === "intro" ? "北京时间同步中" : "北京时间已同步";
  if(refs.introClockCard) {
    const hourRotation = ((now.getHours() % 12) + now.getMinutes() / 60 + now.getSeconds() / 3600) * 30;
    const minuteRotation = (now.getMinutes() + now.getSeconds() / 60) * 6;
    refs.introClockCard.style.setProperty("--clock-hour-rotation", `${hourRotation}deg`);
    refs.introClockCard.style.setProperty("--clock-minute-rotation", `${minuteRotation}deg`);
  }

  if(refs.introDateYear) refs.introDateYear.textContent = String(now.getFullYear());
  if(refs.introDateWeekLabel) refs.introDateWeekLabel.textContent = WEEKDAY_LABELS[now.getDay()].replace("星期", "周");
  if(refs.introDateMonth) refs.introDateMonth.textContent = `${pad(now.getMonth() + 1)}月`;
  if(refs.introDateDay) refs.introDateDay.textContent = pad(now.getDate());

  const holidayInfo = getNextHolidayInfo(now);
  if(refs.introHolidayCountdown) refs.introHolidayCountdown.textContent = `${holidayInfo.headline} · ${holidayInfo.meta}`;

  const restDayInfo = getNextRestDayInfo(now);
  if(refs.introWeekdayName) refs.introWeekdayName.textContent = WEEKDAY_LABELS[now.getDay()];
  if(refs.introWeekdayCountdown) refs.introWeekdayCountdown.textContent = restDayInfo.headline;
  if(refs.introWeekMeta) refs.introWeekMeta.textContent = restDayInfo.meta;
}

function renderIntro() {
  const lastPanel = getLastMainPanel();
  if(refs.introLastPanelLabel) refs.introLastPanelLabel.textContent = PANEL_LABELS[lastPanel];
  if(refs.introContinue) refs.introContinue.textContent = `继续上次：${PANEL_LABELS[lastPanel]}`;
  renderIntroDashboard(new Date());
  renderIntroWeather();
}

function renderStatsList(entries, emptyText) {
  const list = Array.isArray(entries) ? [...entries] : [];
  if(!list.length) return `<div class="record-empty">${escapeHtml(emptyText)}</div>`;
  return list
    .sort((a, b) => Number(b[1]) - Number(a[1]))
    .map(([task, count]) => `
      <div class="item">
        <div>
          <strong>${escapeHtml(task)}</strong>
          <div class="meta">完成次数 ${Number(count || 0)}</div>
        </div>
        <div><strong>${Number(count || 0)}</strong></div>
      </div>
    `)
    .join("");
}

function renderSessionTable(sessions, emptyText) {
  const list = Array.isArray(sessions) ? sessions : [];
  if(!list.length) return `<div class="record-empty">${escapeHtml(emptyText)}</div>`;
  return `
    <div class="record-shell">
      <table class="record-table">
        <thead>
          <tr>
            <th>#</th>
            <th>任务</th>
            <th>完成时间</th>
            <th>计划</th>
            <th>实际</th>
          </tr>
        </thead>
        <tbody>
          ${list.map((item, index) => `
            <tr>
              <td>${index + 1}</td>
              <td><strong>${escapeHtml(item.task)}</strong></td>
              <td>${escapeHtml(item.completedAt)}</td>
              <td>${Number(item.plannedMinutes || 0)} 分钟</td>
              <td>${Number(item.usedMinutes || 0)} 分钟</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderTaskBadges() {
  const box = $("#allTaskBadges");
  if(!box) return;
  const tasks = allTasks();
  box.innerHTML = tasks.length
    ? tasks.map(task => `<span class="badge">${escapeHtml(task)}</span>`).join("")
    : `<span class="muted">当前任务池为空。</span>`;
}

function renderTaskLists() {
  const permanent = $("#permanentTaskList");
  const temporary = $("#temporaryTaskList");
  if(!permanent || !temporary) return;

  const renderItem = (type, task) => `
    <div class="item task-entry">
      <div class="task-entry-copy">
        <strong>${escapeHtml(task)}</strong>
        <div class="task-entry-meta">
          <span>分类：预留</span>
          <span>优先级：预留</span>
        </div>
      </div>
      <button class="btn danger" type="button" onclick='removeTask(${JSON.stringify(type)}, ${JSON.stringify(task)})'>删除</button>
    </div>
  `;

  permanent.innerHTML = state.permanentTasks.length
    ? state.permanentTasks.map(task => renderItem("permanent", task)).join("")
    : `<div class="record-empty">当前没有永久任务。</div>`;

  temporary.innerHTML = state.temporaryTasksToday.length
    ? state.temporaryTasksToday.map(task => renderItem("temporary", task)).join("")
    : `<div class="record-empty">今天还没有临时任务。</div>`;
}

function renderDashboard() {
  ensureCurrentDayState();
  const session = state.todaySession;
  const log = todayLog();
  const isPaused = !!session.pausedAt;
  const isRunning = !!session.running;
  const displaySeconds = isRunning || isPaused ? session.accumulatedSeconds : 0;

  const setText = (selector, text) => {
    const node = $(selector);
    if(node) node.textContent = text;
  };

  setText("#workSecondsText", formatSeconds(displaySeconds));
  setText("#currentTaskText", session.currentTask || "尚未抽取任务");
  setText("#countdownText", formatSeconds(session.countdownRemainingSeconds || 0));
  setText("#todayDoneBox", String(log.completedCount || 0));
  setText("#btnStartDay", session.finishedToday ? "重新开始今日" : "开始进入今日");
  setText("#btnPauseDay", "暂停计时");
  setText("#btnResumeDay", "返回继续计时");
  setText("#btnEndDay", "结束今日");
  setText("#btnRoll", "骰子抽取");
  setText("#btnComplete", "完成当前任务");
  setText("#btnResetCountdown", "重置倒计时");
  setText("#heroQuoteText", formatQuoteDisplay(currentQuote()));

  let status = "按下“开始进入今日”，开启今日学习记录。";
  if(isRunning) {
    status = session.currentTask
      ? `正在推进「${session.currentTask}」，计时与倒计时同步运行中。`
      : "今日计时已启动，等待抽取当前任务。";
  } else if(isPaused) {
    status = "当前已暂停计时，可以点击“返回继续计时”恢复。";
  } else if(session.finishedToday) {
    status = "今天这轮已经结束。点击“重新开始今日”即可开启新一轮。";
  }
  setText("#heroStatusText", status);

  const btnStart = $("#btnStartDay");
  const btnPause = $("#btnPauseDay");
  const btnResume = $("#btnResumeDay");
  const btnEnd = $("#btnEndDay");
  const btnRoll = $("#btnRoll");
  const btnComplete = $("#btnComplete");
  const btnResetCountdown = $("#btnResetCountdown");

  if(btnStart) btnStart.disabled = isRunning;
  if(btnPause) btnPause.disabled = !isRunning;
  if(btnResume) {
    btnResume.classList.toggle("hidden", !isPaused);
    btnResume.disabled = !isPaused;
  }
  if(btnEnd) btnEnd.disabled = !(isRunning || isPaused || session.finishedToday);
  if(btnRoll) btnRoll.disabled = !(isRunning || isPaused);
  if(btnComplete) btnComplete.disabled = !(isRunning || isPaused) || !session.currentTask;
  if(btnResetCountdown) btnResetCountdown.disabled = !(isRunning || isPaused);

  const statsBox = $("#todayTaskStats");
  const sessionsBox = $("#todaySessions");
  if(statsBox) statsBox.innerHTML = renderStatsList(Object.entries(log.taskCompletions || {}), "今日还没有完成记录。");
  if(sessionsBox) sessionsBox.innerHTML = renderSessionTable(log.sessions || [], "今日暂无完成流水。");
}

function contributionLevel(log) {
  const done = Number(log?.completedCount || 0);
  const seconds = Number(log?.workSeconds || 0);
  if(done <= 0 && seconds <= 0) return 0;
  if(seconds < 10 * 60 && done <= 1) return 1;
  if(seconds < 25 * 60 && done <= 2) return 2;
  if(seconds < 45 * 60 && done <= 3) return 3;
  if(seconds < 90 * 60 && done <= 4) return 4;
  if(seconds < 150 * 60 && done <= 6) return 5;
  return 6;
}

function recentWeeks(endDate = new Date(), weekCount = 18) {
  const currentWeekStart = startOfWeek(endDate);
  return Array.from({ length: weekCount }, (_, index) => {
    const weekStart = addDays(currentWeekStart, -7 * (weekCount - 1 - index));
    return Array.from({ length: 7 }, (_, dayIndex) => addDays(weekStart, dayIndex));
  });
}

function renderMonthLabels(weeks) {
  const node = $("#monthLabels");
  if(!node) return;
  const labels = [];
  let lastMonth = "";
  weeks.forEach(week => {
    const month = `${week[0].getMonth() + 1}月`;
    if(month !== lastMonth) {
      labels.push(`<span style="width:calc(var(--cell-size) + var(--cell-gap)); min-width:calc(var(--cell-size) + var(--cell-gap));">${month}</span>`);
      lastMonth = month;
    } else {
      labels.push(`<span style="width:calc(var(--cell-size) + var(--cell-gap)); min-width:calc(var(--cell-size) + var(--cell-gap));"></span>`);
    }
  });
  node.innerHTML = labels.join("");
}

function renderWeekdayLabels() {
  const node = refs.weekdayLabels;
  if(!node) return;
  node.innerHTML = `
    <div class="spacer"></div>
    ${WEEK_HEAT_LABELS.map(label => `<span>${label}</span>`).join("")}
  `;
}

function renderWeek() {
  const heat = $("#heatmap");
  const weekCards = $("#weekCards");
  if(!heat || !weekCards) return;

  const weeks = recentWeeks(new Date(), 18);
  renderMonthLabels(weeks);
  renderWeekdayLabels();

  heat.innerHTML = weeks.map(week => `
    <div class="week-col">
      ${week.map(day => {
        const key = dateKey(day);
        const log = state.dailyLogs[key] || createEmptyDay(day);
        const level = contributionLevel(log);
        const active = state.selectedDayKey === key ? "active" : "";
        const title = `${key}：完成 ${log.completedCount} 个任务，时长 ${formatSeconds(log.workSeconds)}`;
        return `<button class="heat-cell lv${level} ${active}" type="button" title="${escapeHtml(title)}" onclick='selectDay(${JSON.stringify(key)})'></button>`;
      }).join("")}
    </div>
  `).join("");

  const currentWeekStart = startOfWeek(new Date());
  const weekDates = Array.from({ length: 7 }, (_, index) => addDays(currentWeekStart, index));
  weekCards.innerHTML = weekDates.map(day => {
    const key = dateKey(day);
    const log = state.dailyLogs[key] || createEmptyDay(day);
    const active = state.selectedDayKey === key ? "active" : "";
    return `
      <button class="day-card ${active}" type="button" onclick='selectDay(${JSON.stringify(key)})'>
        <div class="muted">${WEEKDAY_LABELS[day.getDay()]} / ${key.slice(5)}</div>
        <div class="big-num">${log.completedCount}</div>
        <div class="muted">时长 ${formatSeconds(log.workSeconds)}</div>
      </button>
    `;
  }).join("");

  const selectedKey = state.selectedDayKey && /^\d{4}-\d{2}-\d{2}$/.test(state.selectedDayKey)
    ? state.selectedDayKey
    : currentDateKey();
  state.selectedDayKey = selectedKey;
  const log = state.dailyLogs[selectedKey] || createEmptyDay(parseDateKey(selectedKey));

  const titleNode = $("#selectedDayTitle");
  const doneNode = $("#selectedDayDone");
  const workNode = $("#selectedDayWork");
  const statsNode = $("#selectedDayStats");
  const sessionsNode = $("#selectedDaySessions");

  if(titleNode) titleNode.textContent = selectedKey;
  if(doneNode) doneNode.textContent = String(log.completedCount || 0);
  if(workNode) workNode.textContent = formatSeconds(log.workSeconds || 0);
  if(statsNode) statsNode.innerHTML = renderStatsList(Object.entries(log.taskCompletions || {}), "这一天还没有任务分布数据。");
  if(sessionsNode) sessionsNode.innerHTML = renderSessionTable(log.sessions || [], "这一天暂无完成流水。");
}

function startOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 1);
}

function startOfQuarter(date = new Date()) {
  const month = Math.floor(date.getMonth() / 3) * 3;
  return new Date(date.getFullYear(), month, 1);
}

function endOfQuarter(date = new Date()) {
  const start = startOfQuarter(date);
  return new Date(start.getFullYear(), start.getMonth() + 3, 1);
}

function startOfYear(date = new Date()) {
  return new Date(date.getFullYear(), 0, 1);
}

function endOfYear(date = new Date()) {
  return new Date(date.getFullYear() + 1, 0, 1);
}

function collectDailyEntries() {
  return Object.entries(state.dailyLogs || {})
    .filter(([key]) => /^\d{4}-\d{2}-\d{2}$/.test(key))
    .map(([key, value]) => ({
      key,
      date: parseDateKey(key),
      log: {
        ...createEmptyDay(parseDateKey(key)),
        ...(value || {}),
        taskCompletions: value && typeof value.taskCompletions === "object" ? value.taskCompletions : {},
        sessions: Array.isArray(value?.sessions) ? value.sessions : []
      }
    }))
    .sort((a, b) => a.date - b.date);
}

function isActiveLog(log) {
  return !!(log && ((log.workSeconds || 0) > 0 || (log.completedCount || 0) > 0 || (log.sessions || []).length));
}

function aggregateEntries(entries) {
  const totals = {
    workSeconds: 0,
    completedCount: 0,
    activeDays: 0,
    taskCompletions: {}
  };

  entries.forEach(({ log }) => {
    totals.workSeconds += Number(log.workSeconds || 0);
    totals.completedCount += Number(log.completedCount || 0);
    if(isActiveLog(log)) totals.activeDays += 1;
    Object.entries(log.taskCompletions || {}).forEach(([task, count]) => {
      totals.taskCompletions[task] = (totals.taskCompletions[task] || 0) + Number(count || 0);
    });
  });

  return totals;
}

function getSummaryScopeMeta(scope, anchorDate = new Date()) {
  if(scope === "week") {
    const start = startOfWeek(anchorDate);
    const end = addDays(start, 7);
    return {
      label: `${start.getMonth() + 1}月${start.getDate()}日 - ${addDays(end, -1).getMonth() + 1}月${addDays(end, -1).getDate()}日`,
      start,
      end,
      buckets: Array.from({ length: 7 }, (_, index) => {
        const bucketStart = addDays(start, index);
        const bucketEnd = addDays(start, index + 1);
        return {
          label: WEEK_HEAT_LABELS[index],
          start: bucketStart,
          end: bucketEnd
        };
      })
    };
  }

  if(scope === "quarter") {
    const start = startOfQuarter(anchorDate);
    const end = endOfQuarter(anchorDate);
    const quarter = Math.floor(anchorDate.getMonth() / 3) + 1;
    return {
      label: `${anchorDate.getFullYear()} Q${quarter}`,
      start,
      end,
      buckets: Array.from({ length: 3 }, (_, index) => {
        const bucketStart = new Date(start.getFullYear(), start.getMonth() + index, 1);
        const bucketEnd = new Date(start.getFullYear(), start.getMonth() + index + 1, 1);
        return {
          label: `${bucketStart.getMonth() + 1}月`,
          start: bucketStart,
          end: bucketEnd
        };
      })
    };
  }

  const start = startOfMonth(anchorDate);
  const end = endOfMonth(anchorDate);
  const buckets = [];
  let cursor = new Date(start);
  let weekIndex = 1;

  while(cursor < end) {
    const bucketStart = new Date(cursor);
    const naturalWeekEnd = addDays(startOfWeek(bucketStart), 7);
    const bucketEnd = naturalWeekEnd < end ? naturalWeekEnd : new Date(end);
    const labelEnd = addDays(bucketEnd, -1);
    buckets.push({
      label: `第 ${weekIndex} 周`,
      meta: `${bucketStart.getMonth() + 1}/${bucketStart.getDate()} - ${labelEnd.getMonth() + 1}/${labelEnd.getDate()}`,
      start: bucketStart,
      end: bucketEnd
    });
    cursor = new Date(bucketEnd);
    weekIndex += 1;
  }

  return {
    label: `${anchorDate.getFullYear()}-${pad(anchorDate.getMonth() + 1)}`,
    start,
    end,
    buckets
  };
}

function classifySummaryIntensity(workSeconds) {
  const seconds = Math.max(0, Number(workSeconds || 0));
  if(seconds <= 0) return { level: "empty", label: "未投入", description: "当前时间桶还没有形成有效记录。", progress: 0.02 };
  if(seconds < 60) return { level: "trace", label: "试开 / 擦过", description: "只有短暂启动，不进入高亮主结算等级。", progress: 0.08 };
  if(seconds < 10 * 60) return { level: "low", label: "低投入", description: "已经开始记录，但投入时长仍偏短。", progress: 0.26 };
  if(seconds < 30 * 60) return { level: "steady", label: "有效投入", description: "形成了清晰可见的有效学习段。", progress: 0.54 };
  if(seconds < 60 * 60) return { level: "high", label: "高投入", description: "当前时间桶已有稳定且持续的推进。", progress: 0.78 };
  return { level: "deep", label: "深度投入", description: "高强度积累，属于该周期的主力时段。", progress: 1 };
}

function summaryContributionPercent(item, maxima) {
  const timeScore = maxima.workSeconds > 0 ? item.workSeconds / maxima.workSeconds : 0;
  const taskScore = maxima.completedCount > 0 ? item.completedCount / maxima.completedCount : 0;
  const activeScore = maxima.activeDays > 0 ? item.activeDays / maxima.activeDays : 0;
  return Math.max(0, Math.min(100, Math.round((timeScore * 0.58 + taskScore * 0.27 + activeScore * 0.15) * 100)));
}

function renderSummary() {
  if(!refs.summaryTotalTime) return;

  const allEntries = collectDailyEntries();
  const totalStats = aggregateEntries(allEntries);
  const scopeMeta = getSummaryScopeMeta(summaryScope, new Date());
  const scopedEntries = allEntries.filter(({ date }) => date >= scopeMeta.start && date < scopeMeta.end);
  const scopeStats = aggregateEntries(scopedEntries);

  refs.summaryTotalTime.textContent = formatSeconds(totalStats.workSeconds);
  refs.summaryTotalDone.textContent = String(totalStats.completedCount);
  refs.summaryActiveDays.textContent = String(totalStats.activeDays);
  refs.summaryScopeTime.textContent = formatSeconds(scopeStats.workSeconds);
  refs.summaryScopeDone.textContent = String(scopeStats.completedCount);
  refs.summaryScopeActive.textContent = String(scopeStats.activeDays);
  refs.summaryRangeLabel.textContent = scopeMeta.label;

  refs.summaryScopeButtons.forEach(button => {
    button.classList.toggle("active", button.dataset.summaryScope === summaryScope);
  });

  const rankEntries = Object.entries(scopeStats.taskCompletions || {})
    .sort((a, b) => Number(b[1]) - Number(a[1]))
    .slice(0, 8);

  refs.summaryTaskRank.innerHTML = rankEntries.length
    ? rankEntries.map(([task, count], index) => `
        <div class="item">
          <div>
            <strong>#${index + 1} ${escapeHtml(task)}</strong>
            <div class="meta">完成 ${Number(count)} 次</div>
          </div>
          <div><strong>${Number(count)}</strong></div>
        </div>
      `).join("")
    : `<div class="record-empty">当前周期暂无任务完成数据。</div>`;

  const bucketStats = scopeMeta.buckets.map(bucket => {
    const entries = allEntries.filter(({ date }) => date >= bucket.start && date < bucket.end);
    const stats = aggregateEntries(entries);
    return {
      label: bucket.label,
      meta: bucket.meta || "",
      workSeconds: stats.workSeconds,
      completedCount: stats.completedCount,
      activeDays: stats.activeDays
    };
  });

  const maxima = {
    workSeconds: Math.max(1, ...bucketStats.map(item => item.workSeconds)),
    completedCount: Math.max(1, ...bucketStats.map(item => item.completedCount)),
    activeDays: Math.max(1, ...bucketStats.map(item => item.activeDays))
  };

  refs.summaryTrendChart.innerHTML = bucketStats.map(item => {
    const intensity = classifySummaryIntensity(item.workSeconds);
    const contribution = summaryContributionPercent(item, maxima);
    const progress = `${Math.max(4, Math.round(intensity.progress * 100))}%`;
    return `
      <article class="summary-settlement-card is-${intensity.level} ${intensity.level === "empty" ? "is-empty" : ""}">
        <div class="summary-settlement-head">
          <div>
            <div class="summary-settlement-label">${escapeHtml(item.label)}</div>
            ${item.meta ? `<div class="summary-settlement-meta">${escapeHtml(item.meta)}</div>` : ""}
            <div class="summary-settlement-level">${intensity.label}</div>
          </div>
          <div class="summary-settlement-contribution">${contribution}%</div>
        </div>
        <div class="summary-settlement-time">${formatSeconds(item.workSeconds)}</div>
        <div class="summary-settlement-meter"><span style="width:${progress}"></span></div>
        <div class="summary-settlement-grid">
          <div class="summary-settlement-stat">
            <span class="summary-settlement-stat-label">完成任务</span>
            <strong>${item.completedCount}</strong>
          </div>
          <div class="summary-settlement-stat">
            <span class="summary-settlement-stat-label">活跃天数</span>
            <strong>${item.activeDays}</strong>
          </div>
        </div>
        <div class="summary-settlement-desc">${intensity.description}</div>
      </article>
    `;
  }).join("");

  const scopeHint = summaryScope === "month"
    ? "月视图已按周分桶，可横向查看本月各周的累计结算。"
    : "支持横向滑动查看全部结算卡。";
  refs.summaryTrendNote.textContent = `${scopeMeta.label} ${scopeHint}59 秒内记为试开，10 分钟以上才计为有效投入。`;
}

function scrollSummaryTrack(direction) {
  if(!refs.summarySliderViewport) return;
  const distance = Math.max(260, Math.floor(refs.summarySliderViewport.clientWidth * 0.82));
  refs.summarySliderViewport.scrollBy({
    left: direction * distance,
    behavior: "smooth"
  });
}

function renderInfo() {
  const motionLevel = normalizeMotionLevel(state.uiPreferences.motionLevel);
  const soundEnabled = state.uiPreferences.weatherSoundEnabled === true;
  if(refs.infoMotionModeText) refs.infoMotionModeText.textContent = MOTION_LEVEL_LABELS[motionLevel];
  if(refs.infoThemeModeText) refs.infoThemeModeText.textContent = state.uiPreferences.themeMode || "default";
  if(refs.infoMotionHint) refs.infoMotionHint.textContent = MOTION_LEVEL_HINTS[motionLevel];
  if(refs.infoWeatherSoundText) refs.infoWeatherSoundText.textContent = soundEnabled ? "开启" : "关闭";
  if(refs.infoWeatherSoundHint) refs.infoWeatherSoundHint.textContent = getWeatherSoundHint(soundEnabled, motionLevel);
  if(refs.weatherSoundToggle) {
    refs.weatherSoundToggle.textContent = soundEnabled ? "关闭" : "开启";
    refs.weatherSoundToggle.classList.toggle("active", soundEnabled);
  }
  refs.motionButtons.forEach(button => {
    button.classList.toggle("active", button.dataset.motionOption === motionLevel);
  });
}

function renderAll() {
  ensureCurrentDayState();
  applyUiPreferences();
  applyStaticCopy();
  renderTopStats();
  renderSceneRails();
  renderIntro();
  renderTaskBadges();
  renderTaskLists();
  renderDashboard();
  renderWeek();
  renderSummary();
  renderInfo();
  saveState();
}

function openPanel(name, { remember = true } = {}) {
  const target = name === "intro" ? "intro" : safeMainPanel(name);
  activePanel = target;
  refs.panels.forEach(panel => {
    panel.classList.toggle("active", panel.id === `panel-${target}`);
  });
  refs.tabs.forEach(tab => {
    tab.classList.toggle("active", tab.dataset.tab === target);
  });
  if(remember && MAIN_PANELS.includes(target)) {
    state.uiPreferences.lastMainPanel = target;
  }
  renderAll();
}

function showYesterdayRange() {
  const log = yesterdayLog();
  if(log && log.firstStartedAt && log.lastEndedAt) {
    return `昨日首次开始：${formatDateTime(log.firstStartedAt)}<br>昨日最后结束：${formatDateTime(log.lastEndedAt)}`;
  }
  return "昨日无完整开始 / 结束记录";
}

function resetTodaySessionRuntime() {
  const quoteIndex = state.todaySession.currentQuoteIndex;
  state.todaySession = {
    ...createDefaultState().todaySession,
    currentQuoteIndex: quoteIndex
  };
}

function startTodaySession() {
  ensureCurrentDayState();
  const session = state.todaySession;
  const now = new Date();
  const log = todayLog();

  if(session.running) {
    showModal({
      title: "已经在计时中",
      lines: [
        `当前开始时间：${formatDateTime(session.currentRunStartedAt)}`,
        showYesterdayRange()
      ],
      quote: currentQuote()
    });
    return;
  }

  if(session.pausedAt) {
    showModal({
      title: "当前处于暂停状态",
      lines: [
        `暂停时间：${formatDateTime(session.pausedAt)}`,
        "请使用“返回继续计时”恢复本轮状态。"
      ],
      quote: currentQuote()
    });
    return;
  }

  if(session.finishedToday || !session.started) {
    resetTodaySessionRuntime();
  }

  state.todaySession.started = true;
  state.todaySession.running = true;
  state.todaySession.finishedToday = false;
  state.todaySession.pausedAt = null;
  state.todaySession.currentRunStartedAt = now.toISOString();
  if(!log.firstStartedAt) log.firstStartedAt = now.toISOString();

  const quote = advanceQuote();
  renderAll();
  showModal({
    title: "开始计时",
    lines: [
      `当前开始时间：${formatDateTime(now)}`,
      showYesterdayRange()
    ],
    quote,
    note: `今日日期：${currentDateKey()}`
  });
}

function pauseTodaySession() {
  const session = state.todaySession;
  if(!session.running) {
    showModal({
      title: "当前未在计时",
      lines: ["只有在正在运行时才能暂停计时。"],
      quote: currentQuote()
    });
    return;
  }

  const now = new Date();
  const startedAt = session.currentRunStartedAt ? new Date(session.currentRunStartedAt) : now;
  const usedSeconds = Math.max(0, Math.floor((now.getTime() - startedAt.getTime()) / 1000));

  session.running = false;
  session.pausedAt = now.toISOString();
  session.countdownActive = false;

  const quote = advanceQuote();
  renderAll();
  showModal({
    title: "暂停计时",
    lines: [
      `暂停时间：${formatDateTime(now)}`,
      `当前连续工作时长：${formatDurationWords(usedSeconds)}`
    ],
    quote,
    note: "点击“返回继续计时”可恢复本轮状态。"
  });
}

function resumeTodaySession() {
  const session = state.todaySession;
  if(!session.pausedAt) {
    showModal({
      title: "没有可恢复的暂停状态",
      lines: ["当前没有暂停中的记录。"],
      quote: currentQuote()
    });
    return;
  }

  const now = new Date();
  const pausedAt = new Date(session.pausedAt);
  const awaySeconds = Math.max(0, Math.floor((now.getTime() - pausedAt.getTime()) / 1000));

  session.running = true;
  session.pausedAt = null;
  session.started = true;
  session.finishedToday = false;
  session.currentRunStartedAt = now.toISOString();
  session.countdownActive = !!session.currentTask && session.countdownRemainingSeconds > 0;

  const quote = advanceQuote();
  renderAll();
  showModal({
    title: "返回继续计时",
    lines: [
      `现在时间：${formatDateTime(now)}`,
      `你已经离开：${formatDurationWords(awaySeconds)}`
    ],
    quote,
    note: "计时与当前轮倒计时已恢复。"
  });
}

function endTodaySession() {
  const session = state.todaySession;
  if(!(session.running || session.pausedAt || session.started || session.finishedToday)) {
    showModal({
      title: "今日尚未开始",
      lines: ["请先点击“开始进入今日”。"],
      quote: currentQuote()
    });
    return;
  }

  const now = new Date();
  const log = todayLog();
  log.workSeconds = session.accumulatedSeconds;
  log.lastEndedAt = now.toISOString();

  session.started = false;
  session.running = false;
  session.pausedAt = null;
  session.finishedToday = true;
  session.currentRunStartedAt = null;
  session.currentTask = "";
  session.countdownTotalSeconds = 3600;
  session.countdownRemainingSeconds = 3600;
  session.countdownActive = false;
  session.taskCompletedThisRound = false;
  session.accumulatedSeconds = 0;

  const quote = advanceQuote();
  renderAll();
  showModal({
    title: "结束今日",
    lines: [
      `结束时间：${formatDateTime(now)}`,
      `本轮已归档时长：${formatDurationWords(log.workSeconds)}`
    ],
    quote,
    note: "实时计时已归零；如需继续，可以直接点击“重新开始今日”。"
  });
}

function rollTodayTask() {
  ensureCurrentDayState();
  const session = state.todaySession;
  if(!(session.running || session.pausedAt)) {
    showModal({
      title: "请先开始今日",
      lines: ["先开启今日计时，再抽取当前任务。"],
      quote: currentQuote()
    });
    return;
  }

  const tasks = allTasks();
  if(!tasks.length) {
    showModal({
      title: "任务池为空",
      lines: ["请先在任务池中添加至少一个任务。"],
      quote: currentQuote()
    });
    return;
  }

  const minutes = clamp(parseInt($("#customMinutes")?.value || "60", 10) || 60, 1, 1440);
  const picked = tasks[Math.floor(Math.random() * tasks.length)];

  session.currentTask = picked;
  session.taskCompletedThisRound = false;
  session.countdownTotalSeconds = minutes * 60;
  session.countdownRemainingSeconds = minutes * 60;
  session.countdownActive = !!session.running;

  const quote = advanceQuote();
  renderAll();
  showModal({
    title: "任务已抽取",
    lines: [
      `当前任务：${escapeHtml(picked)}`,
      `本轮倒计时：${minutes} 分钟`
    ],
    quote,
    note: "当前任务区与倒计时已同步更新。"
  });
}

function completeCurrentTask() {
  const session = state.todaySession;
  if(!(session.running || session.pausedAt)) {
    showModal({
      title: "当前未进入任务流程",
      lines: ["请先开始今日并抽取当前任务。"],
      quote: currentQuote()
    });
    return;
  }
  if(!session.currentTask) {
    showModal({
      title: "尚未抽取任务",
      lines: ["请先点击“骰子抽取”。"],
      quote: currentQuote()
    });
    return;
  }
  if(session.taskCompletedThisRound) {
    showModal({
      title: "当前轮已登记",
      lines: ["当前轮任务已经记入完成记录。"],
      quote: currentQuote()
    });
    return;
  }

  const log = todayLog();
  log.completedCount += 1;
  log.taskCompletions[session.currentTask] = (log.taskCompletions[session.currentTask] || 0) + 1;
  log.sessions.unshift({
    task: session.currentTask,
    completedAt: formatDateTime(new Date()),
    plannedMinutes: Math.round(session.countdownTotalSeconds / 60),
    usedMinutes: Math.max(0, Math.round((session.countdownTotalSeconds - session.countdownRemainingSeconds) / 60))
  });

  session.taskCompletedThisRound = true;
  session.countdownActive = false;

  const quote = advanceQuote();
  renderAll();
  showModal({
    title: "任务已登记完成",
    lines: [
      `任务名称：${escapeHtml(session.currentTask)}`,
      `今日累计完成：${log.completedCount} 个`
    ],
    quote
  });
}

function resetCurrentCountdown() {
  const session = state.todaySession;
  if(!(session.running || session.pausedAt)) {
    showModal({
      title: "当前未进入任务流程",
      lines: ["请先开始今日后再重置倒计时。"],
      quote: currentQuote()
    });
    return;
  }

  const minutes = clamp(parseInt($("#customMinutes")?.value || "60", 10) || 60, 1, 1440);
  session.countdownTotalSeconds = minutes * 60;
  session.countdownRemainingSeconds = minutes * 60;
  session.countdownActive = !!session.running && !!session.currentTask;
  session.taskCompletedThisRound = false;

  const quote = advanceQuote();
  renderAll();
  showModal({
    title: "倒计时已重置",
    lines: [`当前轮已重置为 ${minutes} 分钟。`],
    quote
  });
}

function exportBackup() {
  const payload = {
    exportedAt: new Date().toISOString(),
    version: 2,
    data: state
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `task-dice-backup-${currentDateKey()}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function importBackup(file) {
  if(!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result || "{}"));
      state = safeState(parsed.data ?? parsed);
      const msg = $("#importMsg");
      if(msg) msg.innerHTML = `<div class="success">导入成功，当前页面数据已更新。</div>`;
      renderAll();
    } catch {
      const msg = $("#importMsg");
      if(msg) msg.innerHTML = `<div class="tip">导入失败：文件内容不是有效的备份数据。</div>`;
    }
  };
  reader.readAsText(file);
}

function clearStorage() {
  const ok = confirm("确认清空当前浏览器中的所有本地记录吗？此操作不可恢复，建议先导出备份。");
  if(!ok) return;
  localStorage.removeItem(STORAGE_KEY);
  state = createDefaultState();
  ensureCurrentDayState();
  const msg = $("#importMsg");
  if(msg) msg.innerHTML = `<div class="success">当前浏览器中的本地数据已清空，并恢复到默认状态。</div>`;
  renderAll();
}

function tickSession() {
  ensureCurrentDayState();
  const session = state.todaySession;

  if(session.running) {
    session.accumulatedSeconds += 1;
    todayLog().workSeconds = session.accumulatedSeconds;
  }

  if(session.countdownActive && session.countdownRemainingSeconds > 0) {
    session.countdownRemainingSeconds -= 1;
    if(session.countdownRemainingSeconds <= 0) {
      session.countdownRemainingSeconds = 0;
      session.countdownActive = false;
    }
  }

  renderTopStats();
  renderIntroDashboard(new Date());
  renderDashboard();
  if(activePanel === "week") renderWeek();
  if(activePanel === "summary") renderSummary();
  saveState();
}

function bindTabs() {
  refs.tabs.forEach(tab => {
    tab.onclick = () => openPanel(tab.dataset.tab);
  });
}

function bindIntroActions() {
  if(refs.introStart) refs.introStart.onclick = () => openPanel("dashboard");
  if(refs.introContinue) refs.introContinue.onclick = () => openPanel(getLastMainPanel());
  if(refs.introSummary) refs.introSummary.onclick = () => openPanel("summary");
  if(refs.introInfo) refs.introInfo.onclick = () => openPanel("info");
  if(refs.introTasks) refs.introTasks.onclick = () => openPanel("tasks");
}

function bindIntroWeatherActions() {
  const submit = () => fetchIntroWeather(refs.introWeatherInput?.value || DEFAULT_WEATHER_CITY);
  if(refs.introWeatherSearchBtn) refs.introWeatherSearchBtn.onclick = submit;
  if(refs.introWeatherInput) {
    refs.introWeatherInput.value = DEFAULT_WEATHER_CITY;
    refs.introWeatherInput.onkeydown = event => {
      if(event.key === "Enter") {
        event.preventDefault();
        submit();
      }
    };
  }
}

function bindSceneActions() {
  refs.sceneButtons.forEach(button => {
    button.onclick = () => openPanel(button.dataset.sceneTarget);
  });
}

function bindInfoActions() {
  refs.motionButtons.forEach(button => {
    button.onclick = () => {
      const nextMotionLevel = normalizeMotionLevel(button.dataset.motionOption);
      state.uiPreferences.motionLevel = nextMotionLevel;
      renderAll();
      weatherAudio.setMode(nextMotionLevel);
    };
  });
  if(refs.weatherSoundToggle) {
    refs.weatherSoundToggle.onclick = () => {
      const nextEnabled = state.uiPreferences.weatherSoundEnabled !== true;
      state.uiPreferences.weatherSoundEnabled = nextEnabled;
      renderAll();
      if(nextEnabled) {
        void weatherAudio.activate(state.uiPreferences.motionLevel);
      } else {
        weatherAudio.disable();
      }
    };
  }
}

function bindWeatherAudioUnlock() {
  if(state.uiPreferences.weatherSoundEnabled !== true) return;
  const unlock = () => {
    void weatherAudio.activate(state.uiPreferences.motionLevel);
    window.removeEventListener("pointerdown", unlock);
    window.removeEventListener("keydown", unlock);
  };
  window.addEventListener("pointerdown", unlock, { once: true });
  window.addEventListener("keydown", unlock, { once: true });
}

function bindSummaryActions() {
  refs.summaryScopeButtons.forEach(button => {
    button.onclick = () => {
      const nextScope = button.dataset.summaryScope;
      if(!SUMMARY_SCOPES.includes(nextScope)) return;
      summaryScope = nextScope;
      renderSummary();
      if(refs.summarySliderViewport) refs.summarySliderViewport.scrollTo({ left: 0, behavior: "smooth" });
      saveState();
    };
  });
  if(refs.summaryScrollPrev) refs.summaryScrollPrev.onclick = () => scrollSummaryTrack(-1);
  if(refs.summaryScrollNext) refs.summaryScrollNext.onclick = () => scrollSummaryTrack(1);
}

function bindDevNavToggle() {
  if(!refs.navToggle) return;
  refs.navToggle.onclick = () => {
    devNavOpen = !devNavOpen;
    syncNavVisibility();
  };
}

function bindDashboardActions() {
  const addTaskButton = $("#btnAddTask");
  if(addTaskButton) {
    addTaskButton.onclick = () => {
      const name = ($("#newTaskName")?.value || "").trim();
      const mode = $("#newTaskMode")?.value || "temporary";
      if(!name) {
        showModal({
          title: "任务名称为空",
          lines: ["请输入任务名称后再添加。"]
        });
        return;
      }

      if(mode === "permanent") {
        if(!state.permanentTasks.includes(name)) state.permanentTasks.push(name);
      } else {
        if(!state.temporaryTasksToday.includes(name)) state.temporaryTasksToday.push(name);
      }

      if($("#newTaskName")) $("#newTaskName").value = "";
      if($("#newTaskCategory")) $("#newTaskCategory").value = "未分类";
      if($("#newTaskPriority")) $("#newTaskPriority").value = "普通";
      renderTaskBadges();
      renderTaskLists();
      saveState();
    };
  }

  const startButton = $("#btnStartDay");
  const pauseButton = $("#btnPauseDay");
  const resumeButton = $("#btnResumeDay");
  const endButton = $("#btnEndDay");
  const rollButton = $("#btnRoll");
  const completeButton = $("#btnComplete");
  const resetButton = $("#btnResetCountdown");
  const exportButton = $("#btnExport");
  const importButton = $("#btnImport");
  const importFile = $("#importFile");
  const clearButton = $("#btnClearStorage");

  if(startButton) startButton.onclick = () => startTodaySession();
  if(pauseButton) pauseButton.onclick = () => pauseTodaySession();
  if(resumeButton) resumeButton.onclick = () => resumeTodaySession();
  if(endButton) endButton.onclick = () => endTodaySession();
  if(rollButton) rollButton.onclick = () => rollTodayTask();
  if(completeButton) completeButton.onclick = () => completeCurrentTask();
  if(resetButton) resetButton.onclick = () => resetCurrentCountdown();
  if(exportButton) exportButton.onclick = () => exportBackup();
  if(importButton && importFile) importButton.onclick = () => importFile.click();
  if(importFile) {
    importFile.onchange = event => {
      const file = event.target.files?.[0];
      importBackup(file);
      event.target.value = "";
    };
  }
  if(clearButton) clearButton.onclick = () => clearStorage();
}

function renderAppShell() {
  renderAll();
  syncNavVisibility();
}

window.removeTask = function removeTask(type, task) {
  if(type === "permanent") {
    state.permanentTasks = state.permanentTasks.filter(item => item !== task);
  } else {
    state.temporaryTasksToday = state.temporaryTasksToday.filter(item => item !== task);
  }
  renderTaskBadges();
  renderTaskLists();
  saveState();
};

window.selectDay = function selectDay(key) {
  state.selectedDayKey = key;
  renderWeek();
  saveState();
};

function init() {
  bindTabs();
  bindIntroActions();
  bindIntroWeatherActions();
  bindSceneActions();
  bindInfoActions();
  bindWeatherAudioUnlock();
  bindSummaryActions();
  bindDevNavToggle();
  bindDashboardActions();
  ensureCurrentDayState();
  initGlobalWeatherEffects();
  renderAppShell();
  openPanel("intro", { remember: false });
  void fetchIntroWeather(DEFAULT_WEATHER_CITY);
  requestAnimationFrame(() => {
    document.body.classList.add("app-ready");
  });
  window.setInterval(() => {
    try {
      tickSession();
    } catch(error) {
      console.error(error);
    }
  }, 1000);
}

init();
