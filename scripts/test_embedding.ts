import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env', override: true });

const supabase = createClient(process.env.PAPER_SUPABASE_URL!, process.env.PAPER_SUPABASE_SERVICE_ROLE_KEY!);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Stress test configuration
const CONCURRENT_REQUESTS = 10;
const TOTAL_REQUESTS = 100;
const BATCH_SIZE = 10;

// Sample abstracts for stress testing
const sampleAbstracts = [
  "Machine learning approaches for protein structure prediction using deep neural networks",
  "Quantum computing algorithms for cryptographic applications in distributed systems",
  "Climate change impact on biodiversity in tropical rainforest ecosystems",
  "Natural language processing techniques for sentiment analysis in social media",
  "Genomic sequencing methods for early cancer detection and diagnosis",
  "Renewable energy optimization using reinforcement learning algorithms",
  "Blockchain technology applications in supply chain management systems",
  "Neuroscience research on memory formation and cognitive decline",
  "Materials science advances in superconductor development at room temperature",
  "Epidemiological modeling of infectious disease spread in urban populations",
];

interface StressTestResult {
  requestId: number;
  embeddingLatency: number;
  searchLatency: number;
  totalLatency: number;
  success: boolean;
  error?: string;
  resultsCount: number;
}

async function runSingleRequest(requestId: number): Promise<StressTestResult> {
  const startTime = performance.now();
  const abstract = sampleAbstracts[requestId % sampleAbstracts.length];

  try {
    // Generate embedding
    const embeddingStart = performance.now();
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: abstract,
    });
    const embeddingLatency = performance.now() - embeddingStart;

    // Find similar papers
    const searchStart = performance.now();
    const { data, error } = await supabase.rpc('match_papers', {
      query_embedding: embeddingResponse.data[0].embedding,
      match_threshold: 0.0,
      match_count: 10,
    });
    const searchLatency = performance.now() - searchStart;

    if (error) {
      return {
        requestId,
        embeddingLatency,
        searchLatency,
        totalLatency: performance.now() - startTime,
        success: false,
        error: error.message,
        resultsCount: 0,
      };
    }

    return {
      requestId,
      embeddingLatency,
      searchLatency,
      totalLatency: performance.now() - startTime,
      success: true,
      resultsCount: data?.length || 0,
    };
  } catch (err) {
    return {
      requestId,
      embeddingLatency: 0,
      searchLatency: 0,
      totalLatency: performance.now() - startTime,
      success: false,
      error: err instanceof Error ? err.message : String(err),
      resultsCount: 0,
    };
  }
}

async function runBatch(startId: number, batchSize: number): Promise<StressTestResult[]> {
  const promises: Promise<StressTestResult>[] = [];
  for (let i = 0; i < batchSize; i++) {
    promises.push(runSingleRequest(startId + i));
  }
  return Promise.all(promises);
}

async function runStressTest() {
  console.log('='.repeat(60));
  console.log('EMBEDDING + VECTOR SEARCH STRESS TEST');
  console.log('='.repeat(60));
  console.log(`Configuration:`);
  console.log(`  - Total requests: ${TOTAL_REQUESTS}`);
  console.log(`  - Concurrent requests per batch: ${CONCURRENT_REQUESTS}`);
  console.log(`  - Batch size: ${BATCH_SIZE}`);
  console.log('='.repeat(60));
  console.log();

  const allResults: StressTestResult[] = [];
  const overallStart = performance.now();

  const totalBatches = Math.ceil(TOTAL_REQUESTS / BATCH_SIZE);

  for (let batch = 0; batch < totalBatches; batch++) {
    const startId = batch * BATCH_SIZE;
    const currentBatchSize = Math.min(BATCH_SIZE, TOTAL_REQUESTS - startId);

    console.log(`Running batch ${batch + 1}/${totalBatches} (requests ${startId + 1}-${startId + currentBatchSize})...`);

    const batchStart = performance.now();
    const batchResults = await runBatch(startId, currentBatchSize);
    const batchDuration = performance.now() - batchStart;

    allResults.push(...batchResults);

    const batchSuccesses = batchResults.filter(r => r.success).length;
    const batchAvgLatency = batchResults.reduce((sum, r) => sum + r.totalLatency, 0) / batchResults.length;

    console.log(`  Batch completed in ${batchDuration.toFixed(0)}ms | Success: ${batchSuccesses}/${currentBatchSize} | Avg latency: ${batchAvgLatency.toFixed(0)}ms`);
  }

  const overallDuration = performance.now() - overallStart;

  // Calculate statistics
  const successfulResults = allResults.filter(r => r.success);
  const failedResults = allResults.filter(r => !r.success);

  const embeddingLatencies = successfulResults.map(r => r.embeddingLatency).sort((a, b) => a - b);
  const searchLatencies = successfulResults.map(r => r.searchLatency).sort((a, b) => a - b);
  const totalLatencies = successfulResults.map(r => r.totalLatency).sort((a, b) => a - b);

  const percentile = (arr: number[], p: number) => {
    if (arr.length === 0) return 0;
    const index = Math.ceil((p / 100) * arr.length) - 1;
    return arr[Math.max(0, index)];
  };

  const avg = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

  console.log();
  console.log('='.repeat(60));
  console.log('STRESS TEST RESULTS');
  console.log('='.repeat(60));
  console.log();
  console.log(`Total Duration: ${(overallDuration / 1000).toFixed(2)}s`);
  console.log(`Throughput: ${(TOTAL_REQUESTS / (overallDuration / 1000)).toFixed(2)} requests/sec`);
  console.log();
  console.log(`Success Rate: ${successfulResults.length}/${TOTAL_REQUESTS} (${((successfulResults.length / TOTAL_REQUESTS) * 100).toFixed(1)}%)`);
  console.log(`Failed: ${failedResults.length}`);
  console.log();

  if (successfulResults.length > 0) {
    console.log('Embedding Latency (OpenAI API):');
    console.log(`  Min:    ${Math.min(...embeddingLatencies).toFixed(0)}ms`);
    console.log(`  Avg:    ${avg(embeddingLatencies).toFixed(0)}ms`);
    console.log(`  P50:    ${percentile(embeddingLatencies, 50).toFixed(0)}ms`);
    console.log(`  P95:    ${percentile(embeddingLatencies, 95).toFixed(0)}ms`);
    console.log(`  P99:    ${percentile(embeddingLatencies, 99).toFixed(0)}ms`);
    console.log(`  Max:    ${Math.max(...embeddingLatencies).toFixed(0)}ms`);
    console.log();

    console.log('Vector Search Latency (Supabase):');
    console.log(`  Min:    ${Math.min(...searchLatencies).toFixed(0)}ms`);
    console.log(`  Avg:    ${avg(searchLatencies).toFixed(0)}ms`);
    console.log(`  P50:    ${percentile(searchLatencies, 50).toFixed(0)}ms`);
    console.log(`  P95:    ${percentile(searchLatencies, 95).toFixed(0)}ms`);
    console.log(`  P99:    ${percentile(searchLatencies, 99).toFixed(0)}ms`);
    console.log(`  Max:    ${Math.max(...searchLatencies).toFixed(0)}ms`);
    console.log();

    console.log('Total End-to-End Latency:');
    console.log(`  Min:    ${Math.min(...totalLatencies).toFixed(0)}ms`);
    console.log(`  Avg:    ${avg(totalLatencies).toFixed(0)}ms`);
    console.log(`  P50:    ${percentile(totalLatencies, 50).toFixed(0)}ms`);
    console.log(`  P95:    ${percentile(totalLatencies, 95).toFixed(0)}ms`);
    console.log(`  P99:    ${percentile(totalLatencies, 99).toFixed(0)}ms`);
    console.log(`  Max:    ${Math.max(...totalLatencies).toFixed(0)}ms`);
  }

  if (failedResults.length > 0) {
    console.log();
    console.log('Errors:');
    const errorCounts = new Map<string, number>();
    failedResults.forEach(r => {
      const err = r.error || 'Unknown error';
      errorCounts.set(err, (errorCounts.get(err) || 0) + 1);
    });
    errorCounts.forEach((count, error) => {
      console.log(`  ${error}: ${count} occurrences`);
    });
  }

  console.log();
  console.log('='.repeat(60));
}

runStressTest().catch(console.error);
