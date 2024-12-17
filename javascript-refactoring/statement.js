module.exports = {
    statement,
    calculateAmount,
    calculateCredits
};

function statement(invoice, plays, playTypes) {
    let totalAmount = 0;
    let volumeCredits = 0;
    let result = `Statement for ${invoice.customer}\n`;
    const format = createFormatter();

    for (let perf of invoice.performances) {
        const play = plays[perf.playID];
        let thisAmount = calculateAmount(play, perf, playTypes);

        volumeCredits += calculateCredits(play, perf, playTypes);

        // print line for this order
        result += `    ${play.name}: ${format(thisAmount / 100)} (${perf.audience} seats)\n`;
        totalAmount += thisAmount;
    }
    result += `  Amount owed is ${format(totalAmount / 100)}\n`;
    result += `  You earned ${volumeCredits} credits`;
    return result;
}

function calculateAmount(play, perf, playTypes) {
    if (!playTypes[play.type]) {
        throw new Error(`unknown type: ${play.type}`);
    }
    const playParameters = playTypes[play.type];
    let thisAmount = playParameters.baseAmount;

    if (perf.audience > playParameters.audienceThreshold) {
        thisAmount += playParameters.extraBase + playParameters.extraPerAudience * (perf.audience - playParameters.audienceThreshold);
    }
    thisAmount += playParameters.perAudience * perf.audience;

    return thisAmount;
}

function calculateCredits(play, perf, playTypes) {
    const BASE_CREDITS_THRESHOLD = 30;
    if (!playTypes[play.type]) {
        throw new Error(`unknown type: ${play.type}`);
    }
    const playParameters = playTypes[play.type];
    
    let credits = Math.max(perf.audience - BASE_CREDITS_THRESHOLD, 0);
    if (playParameters.hasCreditsBonus) {
        credits += Math.floor(perf.audience / playParameters.creditsBonusDivisor);
    }
    return credits;
}

function createFormatter() {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
    }).format;
}