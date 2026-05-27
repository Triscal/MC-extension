const params = new URLSearchParams(window.location.search);
document.getElementById("msg").textContent = params.get("message") || "Error";
setTimeout(() => window.close(), 2000);