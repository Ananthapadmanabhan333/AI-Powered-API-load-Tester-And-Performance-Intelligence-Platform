import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';

// Custom metrics to track specific AI-inferred bottlenecks
const dbQueryLatency = new Trend('db_query_latency', true);
const errorRate = new Rate('errors');

// This script is dynamically modified by the Load Generation Agent
export const options = {
  stages: [
    { duration: '30s', target: 500 },  // Ramp-up
    { duration: '1m', target: 5000 },  // Spike
    { duration: '30s', target: 0 },    // Cool-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    errors: ['rate<0.01'],            // Error rate must be less than 1%
  },
};

const BASE_URL = __ENV.TARGET_URL || 'http://localhost:8080/api';

export default function () {
  // Simulate an AI-generated user session
  
  // 1. Fetch products
  const productsRes = http.get(`${BASE_URL}/products`);
  check(productsRes, { 'status was 200': (r) => r.status == 200 });
  
  if (productsRes.status !== 200) {
    errorRate.add(1);
  }

  sleep(Math.random() * 0.5);

  // 2. Add to cart (Simulating heavy POST request)
  const payload = JSON.stringify({
    productId: 123,
    quantity: 1,
  });
  
  const headers = { 'Content-Type': 'application/json' };
  const cartRes = http.post(`${BASE_URL}/cart`, payload, { headers });
  
  check(cartRes, { 'added to cart': (r) => r.status === 201 });
  
  if (cartRes.status !== 201) {
      errorRate.add(1);
  }

  // The latency of this specific endpoint might indicate DB write locks
  dbQueryLatency.add(cartRes.timings.duration);
  
  sleep(Math.random() * 0.5);
}
