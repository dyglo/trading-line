export const loadTradingViewScript = (
  containerId: string,
  widgetConfig: any
): (() => void) => {
  if (typeof window === 'undefined') return () => {};

  const container = document.getElementById(containerId);
  if (!container) return () => {};

  // Clear container
  container.innerHTML = '';

  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.async = true;
  script.innerHTML = JSON.stringify(widgetConfig);

  const scriptSrc = document.createElement('script');
  scriptSrc.type = 'text/javascript';
  scriptSrc.src = widgetConfig.src;
  scriptSrc.async = true;

  container.appendChild(script);
  container.appendChild(scriptSrc);

  return () => {
    if (container) {
      container.innerHTML = '';
    }
  };
};
