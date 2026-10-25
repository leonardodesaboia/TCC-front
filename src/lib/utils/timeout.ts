/** Bounds UI operations even when a device/browser promise never settles. */
export async function withTimeout<T>(operation: Promise<T>, milliseconds: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      operation,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error('Tempo de espera esgotado. Tente novamente.')), milliseconds);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}
