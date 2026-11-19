const state = {
  calories: 1280,
  goal: 2000,
  protein: 92,
  carbs: 145,
  fat: 48,
};

const modal = document.getElementById("modal");
const foodForm = document.getElementById("food-form");
const dateLabel = document.querySelector("#date-label span");
let dayOffset = 0;

function formatNumber(value) {
  return new Intl.NumberFormat("es-ES").format(value);
}

function updateDashboard() {
  const remaining = Math.max(state.goal - state.calories, 0);
  const progress = Math.min(Math.round((state.calories / state.goal) * 100), 100);

  document.getElementById("consumed").textContent = formatNumber(state.calories);
  document.getElementById("consumed-detail").textContent = `${formatNumber(state.calories)} kcal`;
  document.getElementById("remaining-detail").textContent = `${formatNumber(remaining)} kcal`;
  document.getElementById("calorie-ring").style.setProperty("--progress", progress);

  document.getElementById("protein-text").textContent = `${state.protein} g`;
  document.getElementById("carbs-text").textContent = `${state.carbs} g`;
  document.getElementById("fat-text").textContent = `${state.fat} g`;
  document.getElementById("protein-bar").style.setProperty("--value", `${Math.min(state.protein / 120 * 100, 100)}%`);
  document.getElementById("carbs-bar").style.setProperty("--value", `${Math.min(state.carbs / 250 * 100, 100)}%`);
  document.getElementById("fat-bar").style.setProperty("--value", `${Math.min(state.fat / 67 * 100, 100)}%`);
}

function openModal(mealName) {
  if (mealName) document.getElementById("meal-name").value = mealName;
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  setTimeout(() => document.getElementById("food-name").focus(), 50);
}

function closeModal() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  foodForm.reset();
}

document.getElementById("open-add").addEventListener("click", () => openModal());
document.getElementById("open-add-secondary").addEventListener("click", () => openModal());
document.getElementById("close-modal").addEventListener("click", closeModal);
modal.addEventListener("click", (event) => {
  if (event.target === modal) closeModal();
});

document.querySelectorAll(".meal-add").forEach((button) => {
  button.addEventListener("click", () => {
    const meal = button.closest(".meal").dataset.meal;
    openModal(meal);
  });
});

foodForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = document.getElementById("food-name").value.trim();
  const mealName = document.getElementById("meal-name").value;
  const calories = Number(document.getElementById("food-calories").value);
  const protein = Number(document.getElementById("food-protein").value) || 0;
  const carbs = Number(document.getElementById("food-carbs").value) || 0;
  const fat = Number(document.getElementById("food-fat").value) || 0;

  if (!name || calories <= 0) return;

  state.calories += calories;
  state.protein += protein;
  state.carbs += carbs;
  state.fat += fat;

  const meal = [...document.querySelectorAll(".meal")].find((item) => item.dataset.meal === mealName);
  if (meal) {
    const paragraph = meal.querySelector(".meal-info p");
    const placeholder = paragraph.querySelector("span");
    if (placeholder && placeholder.textContent === "Sin registrar") placeholder.textContent = name;
    else {
      const item = document.createElement("span");
      item.textContent = name;
      paragraph.appendChild(item);
    }

    const calorieElement = meal.querySelector(".meal-calories");
    const current = Number(calorieElement.textContent.replace(/\D/g, "")) || 0;
    calorieElement.textContent = `${formatNumber(current + calories)} kcal`;
  }

  updateDashboard();
  closeModal();
});

document.querySelectorAll(".nav-item").forEach((item) => {
  item.addEventListener("click", () => {
    document.querySelectorAll(".nav-item").forEach((navItem) => navItem.classList.remove("active"));
    item.classList.add("active");
    document.getElementById("page-title").textContent = item.dataset.section;
  });
});

function updateDate() {
  if (dayOffset === 0) {
    dateLabel.textContent = "Hoy, 19 nov";
    return;
  }
  const date = new Date(2026, 10, 19 + dayOffset);
  const formatted = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short" }).format(date);
  dateLabel.textContent = formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

document.getElementById("prev-day").addEventListener("click", () => {
  dayOffset -= 1;
  updateDate();
});

document.getElementById("next-day").addEventListener("click", () => {
  dayOffset += 1;
  updateDate();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal.classList.contains("open")) closeModal();
});

updateDashboard();
