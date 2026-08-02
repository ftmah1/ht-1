export async function withRetry<T extends { statusCode: number }>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 200,
) {
  let result = await fn();
  for (let attempt = 1; attempt < maxRetries; attempt++) {
    if (result.statusCode === 200) {
      return result;
    }
    await new Promise((resolve) => setTimeout(resolve, delay));
    result = await fn();
  }
  return result;
}
