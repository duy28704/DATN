import { useEffect } from 'react'

const SEO = ({ title, description, keywords, schema }) => {
  useEffect(() => {
    // 1. Update document title
    if (title) {
      document.title = `${title} | NEXUS Tech - Đồ Công Nghệ Premium`
    } else {
      document.title = 'NEXUS Tech | Thế Giới Đồ Công Nghệ Cao Cấp & Hiện Đại'
    }

    // 2. Update meta description
    if (description) {
      let metaDesc = document.querySelector('meta[name="description"]')
      if (!metaDesc) {
        metaDesc = document.createElement('meta')
        metaDesc.name = 'description'
        document.head.appendChild(metaDesc)
      }
      metaDesc.content = description
    }

    // 3. Update meta keywords
    if (keywords) {
      let metaKeywords = document.querySelector('meta[name="keywords"]')
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta')
        metaKeywords.name = 'keywords'
        document.head.appendChild(metaKeywords)
      }
      metaKeywords.content = keywords
    }

    // 4. Handle JSON-LD Structured Schema
    let schemaScript = document.getElementById('nexus-jsonld-schema')
    if (schemaScript) {
      schemaScript.remove()
    }

    if (schema) {
      schemaScript = document.createElement('script')
      schemaScript.id = 'nexus-jsonld-schema'
      schemaScript.type = 'application/ld+json'
      schemaScript.innerHTML = JSON.stringify(schema)
      document.head.appendChild(schemaScript)
    }

    // Cleanup schema on unmount to prevent duplicates
    return () => {
      const scriptToRemove = document.getElementById('nexus-jsonld-schema')
      if (scriptToRemove) {
        scriptToRemove.remove()
      }
    }
  }, [title, description, keywords, schema])

  return null // This is a non-visual utility component
}

export default SEO
