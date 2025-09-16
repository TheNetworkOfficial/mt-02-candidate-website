export const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Math.round(value));

const formatNumber = (value) =>
  new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(Math.round(value));

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const formatValueForElement = (element, value) => {
  const formatType = element.dataset.format || "currency";
  return formatType === "number" ? formatNumber(value) : formatCurrency(value);
};

const readDisplayedValue = (element) => {
  const stored = Number(element.dataset.displayValue);
  if (!Number.isNaN(stored)) {
    return stored;
  }

  const numericText = element.textContent
    ? Number(element.textContent.replace(/[^0-9.-]+/g, ""))
    : NaN;

  return Number.isNaN(numericText) ? 0 : numericText;
};

const animateValue = (element, startValue, targetValue, formatter, duration = 1600) => {
  if (startValue === targetValue) {
    element.textContent = formatter(targetValue);
    return;
  }

  const startTime = performance.now();
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

  const updateFrame = (currentTime) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeOutCubic(progress);
    const currentValue = startValue + (targetValue - startValue) * easedProgress;

    element.textContent = formatter(currentValue);

    if (progress < 1) {
      window.requestAnimationFrame(updateFrame);
    }
  };

  window.requestAnimationFrame(updateFrame);
};

const elementState = new WeakMap();
let statObserver;

const getState = (element) => {
  let state = elementState.get(element);
  if (!state) {
    state = {
      lastValue: readDisplayedValue(element),
      targetValue: Number(element.dataset.target) || 0,
      pendingAnimation: false,
      isVisible: false,
      formatter: (value) => formatValueForElement(element, value),
      duration: 1600,
    };
    elementState.set(element, state);
  }
  return state;
};

const runAnimationIfNeeded = (element) => {
  const state = getState(element);
  if (!state.pendingAnimation) {
    return;
  }

  const startValue =
    typeof state.animationStartValue === "number"
      ? state.animationStartValue
      : state.lastValue;

  state.pendingAnimation = false;
  state.lastValue = state.targetValue;
  animateValue(element, startValue, state.targetValue, state.formatter, state.duration);
};

const ensureObserver = () => {
  if (statObserver) {
    return statObserver;
  }

  statObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const { target, isIntersecting } = entry;
        const state = elementState.get(target);
        if (!state) {
          return;
        }

        state.isVisible = isIntersecting;
        if (isIntersecting && state.pendingAnimation) {
          runAnimationIfNeeded(target);
        }
      });
    },
    { threshold: 0.3 },
  );

  return statObserver;
};

export const updateCampaignStatValue = (
  element,
  targetValue,
  { animate = true, duration = 1600, startValue } = {},
) => {
  if (!element) {
    return;
  }

  const formatter = (value) => formatValueForElement(element, value);
  const sanitizedTarget = Number(targetValue);
  const resolvedTarget = Number.isFinite(sanitizedTarget) ? sanitizedTarget : 0;
  const state = getState(element);

  const effectiveStartValue =
    typeof startValue === "number" && Number.isFinite(startValue)
      ? startValue
      : state.lastValue;

  state.targetValue = resolvedTarget;
  state.formatter = formatter;
  state.duration = duration;

  element.dataset.displayValue = resolvedTarget;
  element.dataset.target = resolvedTarget;

  const shouldAnimate = animate && !prefersReducedMotion();

  if (!shouldAnimate) {
    state.lastValue = resolvedTarget;
    state.pendingAnimation = false;
    element.textContent = formatter(resolvedTarget);
    return;
  }

  state.animationStartValue = effectiveStartValue;
  state.pendingAnimation = true;

  if (state.isVisible) {
    runAnimationIfNeeded(element);
  }
};

const registerStatElement = (element) => {
  const observer = ensureObserver();
  observer.observe(element);
  const state = getState(element);
  element.textContent = state.formatter(state.lastValue || 0);
};

const initCampaignStats = ({
  animateOnInit = false,
  root = document,
  valueSelector = ".campaign-stats__value[data-summary-field]",
} = {}) => {
  const scope = root instanceof Element ? root : document;
  const valueElements = scope.querySelectorAll(valueSelector);

  valueElements.forEach((element) => {
    const fallback = Number(element.dataset.target);
    const initialValue = Number.isFinite(fallback) ? fallback : 0;

    updateCampaignStatValue(element, initialValue, {
      animate: animateOnInit,
      startValue: animateOnInit ? 0 : initialValue,
    });

    registerStatElement(element);
  });

  return valueElements;
};

export default initCampaignStats;
