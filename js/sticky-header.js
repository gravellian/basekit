(function (Drupal, once) {
  Drupal.behaviors.basekitStickyHeader = {
    attach(context) {
      const onceFn =
        typeof once === 'function'
          ? once
          : (id, selector, ctx) => ctx.querySelectorAll(selector);

      onceFn('basekitStickyHeader', '.page-header', context).forEach((header) => {
        const stickyClass = 'is-sticky';
        let stickyStart =
          header.getBoundingClientRect().top + window.scrollY;

        const updateState = () => {
          if (window.scrollY > stickyStart) {
            header.classList.add(stickyClass);
          } else {
            header.classList.remove(stickyClass);
          }
        };

        const recalcThreshold = () => {
          stickyStart =
            header.getBoundingClientRect().top + window.scrollY;
          updateState();
        };

        updateState();

        window.addEventListener('scroll', updateState, { passive: true });
        window.addEventListener('resize', recalcThreshold);
      });
    },
  };
})(Drupal, window.once);
