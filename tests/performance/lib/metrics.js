import { Rate } from "k6/metrics";

const businessFailureRate = new Rate("business_failure_rate");

function recordCheckResult(ok) {
  businessFailureRate.add(!ok);
}

export { businessFailureRate, recordCheckResult };
