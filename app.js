
const fees = {
    "5K Fun Run": 300,
    "10K Run": 500,
    "Half Marathon": 800,
    "Full Marathon": 1200
};

function getRegistration() {
    try {
        return JSON.parse(localStorage.getItem("paceUpRegistration") || "null");
    } catch {
        return null;
    }
}

function saveRegistration(data) {
    localStorage.setItem("paceUpRegistration", JSON.stringify(data));
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

function getPassNumber(data) {
    if (!data.passNumber) {
        data.passNumber = "PU-" + Date.now().toString().slice(-8);
        saveRegistration(data);
    }
    return data.passNumber;
}

/* RACE CATALOGUE AND FETCH API */

const raceList = document.getElementById("raceList");

if (raceList) {
    fetch("races.json")
        .then(response => {
            if (!response.ok) throw new Error("Race data unavailable");
            return response.json();
        })
        .then(races => {
            function showRaces(searchText = "") {
                const filtered = races.filter(race =>
                    race.name.toLowerCase().includes(searchText.toLowerCase())
                );

                raceList.innerHTML = "";

                if (filtered.length === 0) {
                    raceList.textContent = "No races found.";
                    return;
                }

                filtered.forEach(race => {
                    const card = document.createElement("article");
                    card.className = "card";

                    const title = document.createElement("h3");
                    title.textContent = race.name;

                    const distance = document.createElement("p");
                    distance.textContent = race.distance;

                    const price = document.createElement("p");
                    price.textContent = "Registration Fee: ₹" + race.fee;

                    const link = document.createElement("a");
                    link.href = "register.html";
                    link.textContent = "Register now →";

                    card.append(title, distance, price, link);
                    raceList.appendChild(card);
                });
            }

            showRaces();

            document.getElementById("search").addEventListener("input", event => {
                showRaces(event.target.value);
            });
        })
        .catch(() => {
            raceList.textContent =
                "Unable to load races. Please run the website with Live Server.";
        });
}

/* REGISTRATION FORM AND FEE CALCULATION */

const raceSelect = document.getElementById("race");

if (raceSelect) {
    const fee = document.getElementById("fee");
    const form = document.getElementById("registrationForm");
    const message = document.getElementById("formMessage");

    raceSelect.addEventListener("change", () => {
        fee.textContent = "₹" + (fees[raceSelect.value] || 0);
    });

    form.addEventListener("submit", event => {
        event.preventDefault();

        const data = {
            name: document.getElementById("name").value.trim(),
            email: document.getElementById("email").value.trim(),
            age: Number(document.getElementById("age").value),
            race: raceSelect.value,
            shirt: document.getElementById("shirt").value,
            fee: fees[raceSelect.value],
            paid: false
        };

        if (
            !data.name ||
            !data.email ||
            !data.race ||
            !data.shirt ||
            !Number.isFinite(data.age) ||
            data.age < 10 ||
            data.age > 100
        ) {
            message.textContent = "Please enter valid details in all fields.";
            return;
        }

        saveRegistration(data);
        window.location.href = "payment.html";
    });
}

/* DEMO PAYMENT */

const paymentDetails = document.getElementById("paymentDetails");

if (paymentDetails) {
    const data = getRegistration();
    const confirmButton = document.getElementById("confirmPayment");
    const paymentMessage = document.getElementById("paymentMessage");

    if (data) {
        paymentDetails.textContent =
            data.name + " — " + data.race + " — ₹" + data.fee;
    } else {
        paymentDetails.textContent =
            "No registration found. Please register first.";
        confirmButton.disabled = true;
    }

    confirmButton.addEventListener("click", () => {
        const registration = getRegistration();

        if (!registration) return;

        registration.paid = true;
        getPassNumber(registration);
        saveRegistration(registration);

        paymentMessage.textContent =
            "Demo confirmation complete! Opening your race pass...";

        confirmButton.disabled = true;

        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 700);
    });
}

/* DIGITAL RACE PASS */

const passContainer = document.getElementById("passContainer");

if (passContainer) {
    const data = getRegistration();
    const actions = document.getElementById("passActions");
    const downloadButton = document.getElementById("downloadPass");
    const saveButton = document.getElementById("savePass");
    const message = document.getElementById("passMessage");

    if (data && data.paid) {
        const passNumber = getPassNumber(data);

        passContainer.innerHTML = `
            <article class="pass-ticket">
                <div class="ticket-top">
                    <div class="ticket-brand">
                        <div class="ticket-logo">Pace<span>Up</span></div>
                        <span class="ticket-label">OFFICIAL RACE PASS</span>
                    </div>
                    <div class="ticket-event">
                        <p class="ticket-kicker">YOUR RACE. YOUR ACHIEVEMENT.</p>
                        <h2>${escapeHTML(data.race)}</h2>
                        <p>PaceUp Marathon • Runner Entry Pass</p>
                    </div>
                </div>

                <div class="ticket-runner">
                    <p class="ticket-small-label">Registered Runner</p>
                    <h3>${escapeHTML(data.name)}</h3>

                    <div class="ticket-details">
                        <div class="ticket-detail">
                            <span class="ticket-small-label">Email Address</span>
                            <strong>${escapeHTML(data.email)}</strong>
                        </div>
                        <div class="ticket-detail">
                            <span class="ticket-small-label">Race Category</span>
                            <strong>${escapeHTML(data.race)}</strong>
                        </div>
                        <div class="ticket-detail">
                            <span class="ticket-small-label">T-Shirt Size</span>
                            <strong>${escapeHTML(data.shirt)}</strong>
                        </div>
                        <div class="ticket-detail">
                            <span class="ticket-small-label">Registration Fee</span>
                            <strong>₹${escapeHTML(data.fee)}</strong>
                        </div>
                    </div>
                </div>

                <div class="ticket-divider"></div>

                <div class="ticket-bottom">
                    <div>
                        <span class="ticket-status">✓ DEMO CONFIRMED</span>
                        <p class="ticket-number">
                            PASS ID: ${escapeHTML(passNumber)}
                        </p>
                    </div>
                    <div class="ticket-mark" aria-label="Running icon">🏃</div>
                </div>
            </article>
        `;

        actions.hidden = false;
    }

    function makePassText() {
        const registration = getRegistration();

        if (!registration || !registration.paid) return null;

        const passNumber = getPassNumber(registration);

        return {
            name: registration.name,
            email: registration.email,
            race: registration.race,
            shirt: registration.shirt,
            fee: registration.fee,
            passNumber
        };
    }

    downloadButton.addEventListener("click", () => {
        const pass = makePassText();

        if (!pass) {
            message.textContent = "Please complete registration first.";
            return;
        }

        const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>PaceUp Digital Race Pass</title>
<style>
body{font-family:Arial,sans-serif;background:#eef3f8;padding:25px;color:#082747}
.ticket{max-width:650px;margin:20px auto;background:white;border-radius:18px;overflow:hidden;box-shadow:0 8px 25px #0002}
.top{background:#082747;color:white;padding:28px}
.logo{font-size:27px;font-weight:bold}.logo span{color:#ff7900}
h1{font-size:32px;margin-bottom:8px}
.content{padding:28px}.row{padding:12px 0;border-bottom:1px solid #ddd}
.label{color:#68788a;font-size:12px;text-transform:uppercase}
strong{display:block;margin-top:5px;overflow-wrap:anywhere}
.status{color:#087443;font-weight:bold;margin-top:25px}
.id{color:#68788a;font-size:12px;margin-top:12px}
</style>
</head>
<body>
<div class="ticket">
<div class="top">
<div class="logo">Pace<span>Up</span> Marathon</div>
<p>YOUR RACE. YOUR PACE. YOUR ACHIEVEMENT.</p>
<h1>${escapeHTML(pass.race)}</h1>
<p>Official Digital Race Pass</p>
</div>
<div class="content">
<h2>${escapeHTML(pass.name)}</h2>
<div class="row"><span class="label">Email</span><strong>${escapeHTML(pass.email)}</strong></div>
<div class="row"><span class="label">Race Category</span><strong>${escapeHTML(pass.race)}</strong></div>
<div class="row"><span class="label">T-Shirt Size</span><strong>${escapeHTML(pass.shirt)}</strong></div>
<div class="row"><span class="label">Registration Fee</span><strong>₹${escapeHTML(pass.fee)}</strong></div>
<p class="status">✓ DEMO CONFIRMED</p>
<p class="id">PASS ID: ${escapeHTML(pass.passNumber)}</p>
</div>
</div>
</body>
</html>`;

        const blob = new Blob([html], { type: "text/html;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "PaceUp-Race-Pass.html";
        document.body.appendChild(link);
        link.click();
        link.remove();

        setTimeout(() => URL.revokeObjectURL(url), 1000);
        message.textContent = "Your race pass has been downloaded.";
    });

    saveButton.addEventListener("click", () => {
        const pass = makePassText();

        if (!pass) {
            message.textContent = "Please complete registration first.";
            return;
        }

        localStorage.setItem("paceUpSavedPass", JSON.stringify(pass));
        message.textContent = "Your race pass is saved in this browser.";
    });
}
