'use client'

import Script from 'next/script'

interface JsonLdProps {
  data: object | object[]
}

// JSON-LD结构化数据组件
export function JsonLd({ data }: JsonLdProps) {
  const jsonLdData = Array.isArray(data) ? data : [data]
  
  return (
    <>
      {jsonLdData.map((item, index) => (
        <Script
          key={index}
          id={`json-ld-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(item),
          }}
        />
      ))}
    </>
  )
}
