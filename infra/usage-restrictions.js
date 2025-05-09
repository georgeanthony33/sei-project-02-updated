const USAGE_RESTRICTIONS = {
    THROTTLING_RATE_LIMIT: 2,
    THROTTLING_BURST_LIMIT: 4,
    INVOCATION_THRESHOLD: {
        AGGREGATED: {COUNT: (5 * 30), PERIOD_IN_MINS: 5},
        INDIVIDUAL_IP: {COUNT: (5 * 10), PERIOD_IN_MINS: 5},
    },
}

module.exports = { USAGE_RESTRICTIONS };
