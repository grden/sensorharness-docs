(() => {
  let removeScrollListener = () => {};

  function synchronizeToc() {
    removeScrollListener();

    const toc = document.querySelector(
      ".md-sidebar--secondary [data-md-component='toc']",
    );
    if (!toc) return;

    const entries = [...toc.querySelectorAll("a[href^='#']")]
      .map((link) => {
        const id = decodeURIComponent(link.hash.slice(1));
        return { heading: document.getElementById(id), link };
      })
      .filter(({ heading }) => heading);

    if (!entries.length) return;

    let frame;
    const update = () => {
      const marker = window.innerHeight * 0.4;
      let current = entries[0];

      for (const entry of entries) {
        if (entry.heading.getBoundingClientRect().top > marker) break;
        current = entry;
      }

      if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 2) {
        current = entries.at(-1);
      }

      for (const { link } of entries) {
        link.classList.toggle("toc-sync-active", link === current.link);
      }
    };

    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    removeScrollListener = () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };

    update();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", synchronizeToc);
  } else {
    synchronizeToc();
  }

  if (typeof document$ !== "undefined") {
    document$.subscribe(synchronizeToc);
  }
})();
