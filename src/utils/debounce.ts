export type DebouncedFunction<TArgs extends unknown[]> = ((...args: TArgs) => void) & {
  cancel: () => void
}

export const debounce = <TArgs extends unknown[]>(
  fn: (...args: TArgs) => void,
  wait = 120,
): DebouncedFunction<TArgs> => {
  let timer: ReturnType<typeof setTimeout> | null = null

  const debounced = ((...args: TArgs) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      timer = null
      fn(...args)
    }, wait)
  }) as DebouncedFunction<TArgs>

  debounced.cancel = () => {
    if (!timer) return
    clearTimeout(timer)
    timer = null
  }

  return debounced
}
