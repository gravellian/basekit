(function (Drupal, once) {
  Drupal.behaviors.basekitStickyHeader = {
    attach(context) {
      const onceFn =
        typeof once === 'function'
          ? once
          : (id, selector, ctx) => ctx.querySelectorAll(selector);

      onceFn('basekitStickyHeader', '.page-header', context).forEach(
        (header) => {
          const stickyClass = 'is-sticky';
          const hysteresis = 8; // px buffer to avoid class thrash near threshold
          const measureOffset = () =>
            header.getBoundingClientRect().top + window.scrollY;
          let stickyStart = measureOffset();
          let isSticky = header.classList.contains(stickyClass);

          const setSticky = (nextState) => {
            if (isSticky === nextState) {
              return;
            }
            isSticky = nextState;
            header.classList.toggle(stickyClass, nextState);

            if (!nextState) {
              // Header just expanded back to its full height; recalibrate
              // after the browser applies the new styles to avoid reflow loops.
              requestAnimationFrame(() => {
                stickyStart = measureOffset();
              });
            }
          };

          const updateState = () => {
            const scrollTop = window.scrollY;

            if (scrollTop <= 0) {
              setSticky(false);
              stickyStart = measureOffset();
              return;
            }

            if (!isSticky && scrollTop > stickyStart + hysteresis) {
              setSticky(true);
            } else if (isSticky && scrollTop < stickyStart - hysteresis) {
              setSticky(false);
            }
          };

          const recalcThreshold = () => {
            if (!isSticky) {
              stickyStart = measureOffset();
            }
            updateState();
          };

          updateState();

          window.addEventListener('scroll', updateState, { passive: true });
          window.addEventListener('resize', recalcThreshold);
        }
      );
    },
  };
})(Drupal, window.once);
