document.getElementById("sendData").addEventListener("click", function () {
    const data = {
        name: "Іван",
        email: "ivan@example.com",
        message: "Привіт, це тест!"
    };

    fetch("AKfycbwKIKf1aYFnWgIat-V7ngMdeiV8qx0VpRc1AuxymuHdJVIal6CMKnyTEdnOZVrMmjdB", {
        method: "POST",
        mode: "no-cors",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
        .then(() => alert("Дані відправлено!"))
        .catch(error => console.error("Помилка:", error));
});
