
type Runner = {
    name: string;
    race: string;
    fee: number;
};

function showRunner(runner: Runner): void {
    console.log("Runner Name: " + runner.name);
    console.log("Race: " + runner.race);
    console.log("Fee: ₹" + runner.fee);
}

const runner: Runner = {
    name: "Ananya",
    race: "10K Run",
    fee: 500
};

showRunner(runner);
