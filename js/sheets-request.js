document.getElementById("sendData").addEventListener("click", function () {
    const data = {
        name: "Іван",
        email: "ivan@example.com",
        message: "Привіт, це тест!"
    };

    fetch("https://script.google.com/macros/s/AKfycbwZF5p8yudA9elKI3_-PvKtbMq4vqtccSov4Ux-dYehpGpIgakp1kFZMYqBakeprhFK/exec", {
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
