
fetch("https://jsonplaceholder.typicode.com/posts", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        title: "PaceUp Marathon",
        body: "Demo runner registration",
        userId: 1
    })
})
.then(response => response.json())
.then(data => console.log("Demo response:", data))
.catch(error => console.log("Request failed:", error));
