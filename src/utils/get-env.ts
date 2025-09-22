const getEnv = <T extends string | number>(name: string, fallback: T): T => {
  const value = process.env[name];
  if (value === undefined) {
    return fallback;
  }
  if (typeof fallback === 'number') {
    const numValue = Number(value);
    return (isNaN(numValue) ? fallback : numValue) as T;
  }
  return value as T;
};

export default getEnv;
