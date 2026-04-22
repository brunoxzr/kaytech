/*==================== MENU SHOW Y HIDDEN ====================*/
const navMenu = document.getElementById("nav-menu"),
  navToggle = document.getElementById("nav-toggle"),
  navClose = document.getElementById("nav-close"),
  navLinks = document.querySelectorAll(".nav__link")

/*===== MENU SHOW =====*/
if (navToggle) {
  navToggle.addEventListener("click", () => {
    navMenu.classList.add("show-menu")
  })
}

/*===== MENU HIDDEN =====*/
if (navClose) {
  navClose.addEventListener("click", () => {
    navMenu.classList.remove("show-menu")
  })
}

/*===== REMOVE MENU MOBILE =====*/
navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    navMenu.classList.remove("show-menu")
  })
})

/*==================== SCROLL SECTIONS ACTIVE LINK ====================*/
const sections = document.querySelectorAll("section[id]")

function scrollActive() {
  const scrollY = window.pageYOffset

  sections.forEach((current) => {
    const sectionHeight = current.offsetHeight
    const sectionTop = current.offsetTop - 50
    const sectionId = current.getAttribute("id")
    const navLink = document.querySelector(`.nav__menu a[href*=${sectionId}]`)

    if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
      navLink?.classList.add("active-link")
    } else {
      navLink?.classList.remove("active-link")
    }
  })
}
window.addEventListener("scroll", scrollActive)

/*==================== SHOW SCROLL UP ====================*/
function showScrollTop() {
  const scrollTop = document.getElementById("scroll-top")
  if (window.scrollY >= 560) {
    scrollTop.classList.add("show")
  } else {
    scrollTop.classList.remove("show")
  }
}

window.addEventListener("scroll", showScrollTop)

const scrollTopButton = document.getElementById("scroll-top")
if (scrollTopButton) {
  scrollTopButton.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  })
}

/*==================== DARK LIGHT THEME ====================*/
const themeToggle = document.getElementById("theme-toggle")
const body = document.body

// Get theme from localStorage
const getCurrentTheme = () => (body.classList.contains("light-theme") ? "light" : "dark")

// Set theme from localStorage
const selectedTheme = localStorage.getItem("selected-theme")
if (selectedTheme === "light") {
  body.classList.add("light-theme")
  updateThemeIcon(true)
}

function updateThemeIcon(isLight) {
  const sunIcon = themeToggle.querySelector(".fa-sun")
  const moonIcon = themeToggle.querySelector(".fa-moon")

  if (isLight) {
    sunIcon.style.opacity = "0"
    sunIcon.style.transform = "rotate(180deg)"
    moonIcon.style.opacity = "1"
    moonIcon.style.transform = "rotate(0deg)"
  } else {
    sunIcon.style.opacity = "1"
    sunIcon.style.transform = "rotate(0deg)"
    moonIcon.style.opacity = "0"
    moonIcon.style.transform = "rotate(-180deg)"
  }
}

// Theme toggle functionality
themeToggle.addEventListener("click", () => {
  body.classList.toggle("light-theme")
  const isLight = body.classList.contains("light-theme")
  updateThemeIcon(isLight)
  localStorage.setItem("selected-theme", getCurrentTheme())
})

/*==================== CUSTOM PARTICLES SYSTEM ====================*/
class ParticleSystem {
  constructor() {
    this.canvas = document.getElementById("particles-canvas")
    this.ctx = this.canvas.getContext("2d")
    this.particles = []
    this.mouse = { x: 0, y: 0 }
    this.connections = []

    this.init()
    this.createParticles()
    this.animate()
    this.setupEvents()
  }

  init() {
    this.resizeCanvas()
    window.addEventListener("resize", () => this.resizeCanvas())
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
  }

  createParticles() {
    const particleCount = Math.min(80, Math.floor((this.canvas.width * this.canvas.height) / 15000))

    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.5 + 0.2,
        color: `rgba(0, 212, 255, ${Math.random() * 0.5 + 0.2})`,
      })
    }
  }

  updateParticles() {
    this.particles.forEach((particle) => {
      particle.x += particle.vx
      particle.y += particle.vy

      // Bounce off edges
      if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1
      if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1

      // Mouse interaction
      const dx = this.mouse.x - particle.x
      const dy = this.mouse.y - particle.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < 100) {
        const force = (100 - distance) / 100
        particle.x -= dx * force * 0.01
        particle.y -= dy * force * 0.01
        particle.opacity = Math.min(1, particle.opacity + force * 0.02)
      } else {
        particle.opacity = Math.max(0.2, particle.opacity - 0.01)
      }
    })
  }

  drawParticles() {
    this.particles.forEach((particle) => {
      this.ctx.beginPath()
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
      this.ctx.fillStyle = particle.color
      this.ctx.globalAlpha = particle.opacity
      this.ctx.fill()
    })
  }

  drawConnections() {
    this.particles.forEach((particle, i) => {
      this.particles.slice(i + 1).forEach((otherParticle) => {
        const dx = particle.x - otherParticle.x
        const dy = particle.y - otherParticle.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < 120) {
          const opacity = ((120 - distance) / 120) * 0.3
          this.ctx.beginPath()
          this.ctx.moveTo(particle.x, particle.y)
          this.ctx.lineTo(otherParticle.x, otherParticle.y)
          this.ctx.strokeStyle = `rgba(0, 212, 255, ${opacity})`
          this.ctx.globalAlpha = opacity
          this.ctx.lineWidth = 1
          this.ctx.stroke()
        }
      })
    })
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.ctx.globalAlpha = 1

    this.updateParticles()
    this.drawConnections()
    this.drawParticles()

    requestAnimationFrame(() => this.animate())
  }

  setupEvents() {
    document.addEventListener("mousemove", (e) => {
      this.mouse.x = e.clientX
      this.mouse.y = e.clientY
    })

    document.addEventListener("click", (e) => {
      // Add burst effect on click
      for (let i = 0; i < 5; i++) {
        this.particles.push({
          x: e.clientX + (Math.random() - 0.5) * 20,
          y: e.clientY + (Math.random() - 0.5) * 20,
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4,
          size: Math.random() * 4 + 2,
          opacity: 1,
          color: `rgba(0, 212, 255, 1)`,
          life: 60,
        })
      }
    })
  }
}

/*==================== LOADING SCREEN ====================*/
window.addEventListener("load", () => {
  const loadingScreen = document.getElementById("loading-screen")
  setTimeout(() => {
    loadingScreen.classList.add("hidden")
    // Initialize particles after loading
    new ParticleSystem()
  }, 2000)
})

/*==================== SCROLL REVEAL ANIMATION ====================*/
document.addEventListener("DOMContentLoaded", () => {
  const revealElements = document.querySelectorAll(".fade-in, .slide-in-left, .slide-in-right")
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible")
        }
      })
    },
    {
      threshold: 0.15,
      rootMargin: "0px 0px -50px 0px",
    },
  )

  revealElements.forEach((element) => {
    observer.observe(element)
  })
})

/*==================== SKILLS ANIMATION ====================*/
const skillsObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const skillBars = entry.target.querySelectorAll(".skill-progress")
        skillBars.forEach((bar, index) => {
          const width = bar.getAttribute("data-width")
          setTimeout(() => {
            bar.style.width = width + "%"
          }, index * 100)
        })
        skillsObserver.unobserve(entry.target)
      }
    })
  },
  { threshold: 0.5 },
)

document.querySelectorAll(".skill-category").forEach((category) => {
  skillsObserver.observe(category)
})

/*==================== COUNTER ANIMATION ====================*/
function animateCounter(element, target, duration = 2000) {
  let start = 0
  const increment = target / (duration / 16)

  function updateCounter() {
    start += increment
    if (start < target) {
      element.textContent = Math.floor(start)
      requestAnimationFrame(updateCounter)
    } else {
      element.textContent = target
    }
  }

  updateCounter()
}

const statsObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const statNumbers = entry.target.querySelectorAll(".stat-number")
        statNumbers.forEach((stat) => {
          const target = Number.parseInt(stat.getAttribute("data-target"))
          animateCounter(stat, target)
        })
        statsObserver.unobserve(entry.target)
      }
    })
  },
  { threshold: 0.5 },
)

document.querySelectorAll(".hero-stats").forEach((stats) => {
  statsObserver.observe(stats)
})

/*==================== SMOOTH SCROLLING ====================*/
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault()
    const targetId = this.getAttribute("href")
    const targetElement = document.querySelector(targetId)
    if (targetElement) {
      const offset = 80 // Header height
      const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - offset
      window.scrollTo({
        top: targetPosition,
        behavior: "smooth",
      })
    }
  })
})

/*==================== CONTACT FORM ====================*/
const contactForm = document.getElementById("contact-form")

if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault()

    const formData = new FormData(contactForm)
    const name = formData.get("name")
    const email = formData.get("email")
    const subject = formData.get("subject")
    const message = formData.get("message")

    // Basic validation
    if (!name || !email || !subject || !message) {
      showNotification("Por favor, preencha todos os campos.", "error")
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      showNotification("Por favor, insira um email válido.", "error")
      return
    }

    // Create mailto link
    const mailtoSubject = encodeURIComponent(`${subject} - Contato de ${name}`)
    const mailtoBody = encodeURIComponent(`Nome: ${name}\nEmail: ${email}\n\nMensagem:\n${message}`)
    const mailtoLink = `mailto:bruno.kay2304@gmail.com?subject=${mailtoSubject}&body=${mailtoBody}`

    // Open email client
    window.location.href = mailtoLink

    // Reset form
    contactForm.reset()

    // Show success message
    showNotification("Obrigado pelo contato! Seu cliente de email será aberto para enviar a mensagem.", "success")
  })
}

/*==================== NOTIFICATION SYSTEM ====================*/
function showNotification(message, type = "info") {
  const notification = document.createElement("div")
  notification.className = `notification notification-${type}`
  notification.innerHTML = `
    <div class="notification-content">
      <i class="fas ${type === "success" ? "fa-check-circle" : type === "error" ? "fa-exclamation-circle" : "fa-info-circle"}"></i>
      <span>${message}</span>
    </div>
    <button class="notification-close">
      <i class="fas fa-times"></i>
    </button>
  `

  // Add styles
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--bg-glass);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    padding: var(--space-4);
    backdrop-filter: blur(10px);
    z-index: 10000;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    max-width: 400px;
    box-shadow: var(--shadow-lg);
    color: var(--text-primary);
  `

  document.body.appendChild(notification)

  // Show notification
  setTimeout(() => {
    notification.style.transform = "translateX(0)"
  }, 100)

  // Auto hide
  setTimeout(() => {
    notification.style.transform = "translateX(100%)"
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification)
      }
    }, 300)
  }, 5000)

  // Close button
  notification.querySelector(".notification-close").addEventListener("click", () => {
    notification.style.transform = "translateX(100%)"
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification)
      }
    }, 300)
  })
}

/*==================== PERFORMANCE OPTIMIZATIONS ====================*/
// Debounce function
function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Apply debounce to scroll events
window.addEventListener("scroll", debounce(scrollActive, 10))
window.addEventListener("scroll", debounce(showScrollTop, 10))

/*==================== ACCESSIBILITY IMPROVEMENTS ====================*/
// Keyboard navigation
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    const navMenu = document.getElementById("nav-menu")
    if (navMenu.classList.contains("show-menu")) {
      navMenu.classList.remove("show-menu")
    }
  }
})

// Focus management
const navToggleBtn = document.getElementById("nav-toggle")
if (navToggleBtn) {
  navToggleBtn.addEventListener("click", () => {
    setTimeout(() => {
      const firstNavLink = document.querySelector(".nav__link")
      if (firstNavLink) {
        firstNavLink.focus()
      }
    }, 100)
  })
}

/*==================== MOUSE PARALLAX EFFECT ====================*/
let mouseX = 0
let mouseY = 0

document.addEventListener("mousemove", (e) => {
  mouseX = (e.clientX / window.innerWidth) * 100
  mouseY = (e.clientY / window.innerHeight) * 100

  // Move floating shapes
  const shapes = document.querySelectorAll(".shape")
  shapes.forEach((shape, index) => {
    const speed = (index + 1) * 0.5
    const x = (mouseX - 50) * speed * 0.02
    const y = (mouseY - 50) * speed * 0.02
    shape.style.transform = `translate(${x}px, ${y}px)`
  })

  // Move floating icons
  const icons = document.querySelectorAll(".floating-icon")
  icons.forEach((icon, index) => {
    const speed = (index + 1) * 0.3
    const x = (mouseX - 50) * speed * 0.01
    const y = (mouseY - 50) * speed * 0.01
    icon.style.transform = `translate(${x}px, ${y}px)`
  })
})

/*==================== CONSOLE MESSAGES ====================*/
console.log("🚀 Portfolio carregado com sucesso!")
console.log("💻 Desenvolvido por Bruno Yudi Kay")
console.log("📧 Contato: bruno.kay2304@gmail.com")
console.log("🎨 Tema escuro moderno ativado!")
console.log("✨ Sistema de partículas customizado funcionando!")
console.log("🎆 Animações e efeitos visuais ativos!")

/*==================== PERFORMANCE MONITOR ====================*/
if (window.performance) {
  window.addEventListener("load", () => {
    setTimeout(() => {
      const perfData = window.performance.timing
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart
      console.log(`⚡ Página carregada em ${pageLoadTime}ms`)
    }, 0)
  })
}
