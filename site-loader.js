
(async function () {
  const app = document.getElementById("app");
  const svg = document.documentElement;

  try {
    const response = await fetch(
      "https://cdn.jsdelivr.net/gh/supernova-fx/humanities-vocab@main/index.html"
    );

    if (!response.ok) {
      throw new Error("Could not load the website HTML.");
    }

    const html = await response.text();
    const parsed = new DOMParser().parseFromString(html, "text/html");

    // Save the original inline scripts before removing them from the markup.
    const scripts = Array.from(parsed.querySelectorAll("script"))
      .map(script => ({
        src: script.getAttribute("src"),
        code: script.textContent
      }));

    parsed.querySelectorAll("script").forEach(script => script.remove());

    // Transfer styles and adapt page-level selectors to the app container.
    parsed.querySelectorAll("style").forEach(oldStyle => {
      const style = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "style"
      );

      style.textContent = oldStyle.textContent
        .replace(/\bhtml\s*,\s*body\b/g, "#app")
        .replace(/\bhtml\b/g, "#app")
        .replace(/\bbody\b/g, "#app");

      svg.appendChild(style);
    });

    // Preserve any linked stylesheets from the original HTML.
    parsed.querySelectorAll('link[rel~="stylesheet"]').forEach(oldLink => {
      const link = document.createElementNS(
        "http://www.w3.org/1999/xhtml",
        "link"
      );
      link.rel = "stylesheet";
      link.href = oldLink.href;
      app.appendChild(link);
    });

    app.innerHTML = parsed.body.innerHTML;
    app.style.cssText +=
      ";width:100%;height:100vh;min-height:100vh;" +
      "overflow-y:auto;overflow-x:hidden;";

    // Make the app available to the original scroll-handling code.
    window.__vocabApp = app;

    for (const item of scripts) {
      if (item.src) {
        const script = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "script"
        );
        script.setAttribute("href", item.src);
        svg.appendChild(script);
      } else if (item.code.trim()) {
        const code = item.code
          .replace(
            /window\.addEventListener\((['"])scroll\1/g,
            "window.__vocabApp.addEventListener('scroll'"
          )
          .replace(/\bwindow\.scrollY\b/g, "window.__vocabApp.scrollTop");

        (0, eval)(code);
      }
    }
  } catch (error) {
    app.innerHTML = "";
    const message = document.createElementNS(
      "http://www.w3.org/1999/xhtml",
      "p"
    );
    message.style.cssText =
      "font-family:Arial,sans-serif;padding:24px;color:#b91c1c";
    message.textContent =
      "The site could not load. Please check that jsDelivr can access " +
      "the repository files and that the browser allows SVG scripts.";
    app.appendChild(message);
    console.error(error);
  }
})();
