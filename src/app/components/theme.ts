// Example theme toggle function
function toggleTheme() {
  const isLight = document.documentElement.classList.contains("light");

  if (isLight) {
    document.documentElement.classList.remove("light");
    localStorage.setItem("theme", "dark"); // Since dark is the default, you might not need to store this
  } else {
    document.documentElement.classList.add("light");
    localStorage.setItem("theme", "light");
  }
}
