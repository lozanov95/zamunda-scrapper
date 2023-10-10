import { useEffect, useState } from "react";

export default function useFetch(url: string, init?: RequestInit) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    setLoading(true);
    const controller = new AbortController();
    fetch(url, {
      ...init,
      signal: controller.signal,
    })
      .then((data) => {
        return data.json();
      })
      .then((val) => {
        setData(val);
      })
      .catch((err) => {
        setError(err);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [url]);

  return { data, loading, error };
}
