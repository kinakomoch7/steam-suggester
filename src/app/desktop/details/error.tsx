'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  useEffect(() => {
    // エラーログをコンソールに出力
    console.error(error)
  }, [error])

  return (
    <div>
      <h2>詳細情報の取得中にエラーが発生しました</h2>
      <p>{error.message}</p>
      <button onClick={() => reset()}>再試行する</button>
    </div>
  )
}