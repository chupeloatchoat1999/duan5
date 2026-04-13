const body = document.body;
const toggleBtn = document.getElementById("darkToggle");
const scrollBtn = document.getElementById("scrollTopBtn");
const fabMenu = document.querySelector(".fab-menu");
const fabMain = document.getElementById("fabMain");
const courseForm = document.querySelector(".course-form");

/* DARK MODE */
function applyTheme(isDark) {
  body.classList.toggle("dark", isDark);

  if (toggleBtn) {
    toggleBtn.checked = isDark;
  }

  localStorage.setItem("darkMode", isDark ? "on" : "off");
}

(function initTheme() {
  const savedTheme = localStorage.getItem("darkMode");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark = savedTheme ? savedTheme === "on" : prefersDark;
  applyTheme(isDark);
})();

if (toggleBtn) {
  toggleBtn.addEventListener("change", () => {
    applyTheme(toggleBtn.checked);
  });
}

/* SCROLL TO TOP */
function handleScrollButton() {
  if (!scrollBtn) return;

  if (window.scrollY > 240) {
    scrollBtn.classList.add("show");
  } else {
    scrollBtn.classList.remove("show");
  }
}

window.addEventListener("scroll", handleScrollButton);

if (scrollBtn) {
  scrollBtn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
}

handleScrollButton();

/* FAB MENU */
if (fabMain && fabMenu) {
  fabMain.addEventListener("click", (event) => {
    event.stopPropagation();
    fabMenu.classList.toggle("open");
  });

  document.addEventListener("click", (event) => {
    const isClickInsideFab = fabMenu.contains(event.target);

    if (!isClickInsideFab) {
      fabMenu.classList.remove("open");
    }
  });
}

/* REVEAL ON SCROLL */
const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.14,
      rootMargin: "0px 0px -40px 0px",
    },
  );

  revealElements.forEach((element) => {
    revealObserver.observe(element);
  });
} else {
  revealElements.forEach((element) => element.classList.add("show"));
}

/* TOAST MESSAGE */
function showToast(message, type = "success") {
  const oldToast = document.querySelector(".custom-toast");
  if (oldToast) {
    oldToast.remove();
  }

  const toast = document.createElement("div");
  toast.className = `custom-toast toast-${type}`;
  toast.textContent = message;

  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add("show");
  });

  setTimeout(() => {
    toast.classList.remove("show");

    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 2600);
}

/* FORM SUBMIT WITH FORMSPREE */
if (courseForm) {
  courseForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const submitBtn = courseForm.querySelector('button[type="submit"]');
    const action = courseForm.getAttribute("action");
    const formData = new FormData(courseForm);

    if (!action || action.includes("YOUR_FORM_ID")) {
      showToast("Bạn chưa gắn Formspree ID vào form.", "error");
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.dataset.originalText = submitBtn.textContent;
      submitBtn.textContent = "Đang gửi...";
    }

    try {
      const response = await fetch(action, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      if (response.ok) {
        courseForm.reset();
        showToast(
          "Đăng ký thành công! Mình sẽ liên hệ với bạn sớm nhé.",
          "success",
        );
      } else {
        let errorMessage = "Gửi đăng ký chưa thành công. Bạn thử lại nhé.";

        try {
          const data = await response.json();
          if (data.errors && data.errors.length > 0) {
            errorMessage = data.errors[0].message;
          }
        } catch (jsonError) {
          // giữ nguyên message mặc định
        }

        showToast(errorMessage, "error");
      }
    } catch (error) {
      showToast("Có lỗi kết nối. Bạn kiểm tra mạng rồi thử lại nhé.", "error");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = submitBtn.dataset.originalText || "Gửi đăng ký";
      }
    }
  });
}
