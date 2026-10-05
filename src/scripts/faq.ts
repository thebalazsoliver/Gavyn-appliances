export function initializeFaqAccordion() {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  document.querySelectorAll<HTMLDetailsElement>('.faq-item').forEach((item) => {
    const summary = item.querySelector<HTMLElement>('summary');
    const answer = item.querySelector<HTMLElement>('.faq-answer');
    const copy = answer?.querySelector<HTMLParagraphElement>('p');
    if (!summary || !answer || !copy) return;

    let expanded = item.open;
    let heightAnimation: Animation | null = null;
    let textAnimation: Animation | null = null;

    const updateExpanded = (next: boolean) => {
      expanded = next;
      item.dataset.expanded = String(next);
      summary.setAttribute('aria-expanded', String(next));
    };

    const finish = () => {
      item.open = expanded;
      heightAnimation?.cancel();
      textAnimation?.cancel();
      heightAnimation = null;
      textAnimation = null;
      item.classList.remove('is-animating');
    };

    updateExpanded(expanded);

    summary.addEventListener('click', (event) => {
      event.preventDefault();

      // Capture the visible position before cancelling, so quick clicks reverse smoothly.
      const wasOpen = item.open;
      const currentHeight = item.getBoundingClientRect().height;
      const textStyle = window.getComputedStyle(copy);
      const currentOpacity = wasOpen ? textStyle.opacity : '0';
      const currentTransform = wasOpen ? textStyle.transform : 'translateY(8px)';
      heightAnimation?.cancel();
      textAnimation?.cancel();
      updateExpanded(!expanded);

      if (reducedMotion.matches || typeof item.animate !== 'function') {
        finish();
        return;
      }

      // Keep native details open until the closing animation completes.
      item.open = true;
      const itemStyle = window.getComputedStyle(item);
      const borderHeight =
        parseFloat(itemStyle.borderTopWidth) + parseFloat(itemStyle.borderBottomWidth);
      const targetHeight =
        summary.getBoundingClientRect().height +
        borderHeight +
        (expanded ? answer.getBoundingClientRect().height : 0);
      item.classList.add('is-animating');

      heightAnimation = item.animate(
        [{ height: `${currentHeight}px` }, { height: `${targetHeight}px` }],
        {
          duration: expanded ? 380 : 280,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          fill: 'both',
        },
      );

      textAnimation = copy.animate(
        [
          { opacity: currentOpacity, transform: currentTransform },
          {
            opacity: expanded ? '1' : '0',
            transform: expanded ? 'translateY(0)' : 'translateY(8px)',
          },
        ],
        {
          duration: expanded ? 240 : 150,
          delay: expanded && !wasOpen ? 50 : 0,
          easing: 'ease-out',
          fill: 'both',
        },
      );

      const activeAnimation = heightAnimation;
      activeAnimation.onfinish = () => {
        if (heightAnimation === activeAnimation) finish();
      };
    });

    item.addEventListener('toggle', () => {
      if (!heightAnimation) updateExpanded(item.open);
    });
  });
}
