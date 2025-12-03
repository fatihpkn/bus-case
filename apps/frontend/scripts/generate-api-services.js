import fs from 'fs'
import { execSync } from 'child_process'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import YAML from 'yaml'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Define paths
const sourceOpenApiPath = path.resolve(__dirname, '../../backend/.manifest/openapi.yml')
const localOpenApiDir = path.resolve(__dirname, '../openapi')
const localOpenApiPath = path.resolve(localOpenApiDir, 'openapi.yml')
const outputPath = path.resolve(__dirname, '../src/api/types.d.ts')

console.log('🚀 Starting API services generation...')

try {
  // 1. Ensure local directory exists and copy the openapi.yml file
  console.log(`Copying ${sourceOpenApiPath} to ${localOpenApiPath}...`)
  fs.mkdirSync(localOpenApiDir, { recursive: true })
  fs.copyFileSync(sourceOpenApiPath, localOpenApiPath)
  console.log('✅ File copied successfully.')

  // 2. Read the local copy
  console.log(`Reading local copy at ${localOpenApiPath}...`)
  let content = fs.readFileSync(localOpenApiPath, 'utf8')

  // 3. Fix the broken reference in the local copy
  const brokenRef = "$ref: '#/components/schemas/Admin'"
  const correctRef = "$ref: '#/components/securitySchemes/Admin'"

  // Escape special characters in brokenRef for RegExp
  const escapedBrokenRef = brokenRef.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

  if (content.includes(brokenRef)) {
    console.log('Found and fixing broken Admin $ref in memory...')
    content = content.replace(new RegExp(escapedBrokenRef, 'g'), correctRef)
  } else {
    console.log('No broken Admin $ref found. Skipping fix.')
  }

  // 3b. Enhance relation-based filters for collection endpoints (e.g. /collections/trips)
  try {
    const openapi = YAML.parse(content)

    enhanceRelationFilters(openapi)

    content = YAML.stringify(openapi)
  } catch (e) {
    console.warn('⚠️ Failed to enhance relation-based filters:', e?.message)
  }

  console.log(`Saving modified content to ${localOpenApiPath}...`)
  fs.writeFileSync(localOpenApiPath, content)

  console.log(`Generating TypeScript types to ${outputPath}...`)
  execSync(`npx -y openapi-typescript --output ${outputPath}`, {
    input: content,
    stdio: ['pipe', 'inherit', 'inherit'],
  })

  console.log('Post-processing generated types to override Paginator.data...')
  const generatedTypes = fs.readFileSync(outputPath, 'utf8')
  const paginatorPattern = /("application\/json": )components\["schemas"\]\["Paginator"\] & \{\s*data\?: ([^;]+);\s*\}/g
  const fixedTypes = generatedTypes.replace(paginatorPattern, '$1Omit<components["schemas"]["Paginator"], "data"> & { data?: $2 }')
  if (generatedTypes !== fixedTypes) {
    fs.writeFileSync(outputPath, fixedTypes)
    console.log('✅ Paginator.data overrides applied.')
  } else {
    console.log('ℹ️ No Paginator intersections found to fix.')
  }

  console.log('🎉 API services generated successfully!')
} catch (error) {
  console.error('❌ Failed to generate API services:')
  console.error(error.message)
  process.exit(1)
}

function enhanceRelationFilters(openapi) {
  if (!openapi || !openapi.paths || !openapi.components || !openapi.components.schemas) {
    return
  }

  const paths = openapi.paths
  const schemas = openapi.components.schemas
  const filterSuffixes = ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'like', 'in']

  // Helper to singularize schema names from tags/paths
  const singularize = (name) => {
    if (name.endsWith('ies')) return name.slice(0, -3) + 'y'
    if (name.endsWith('s')) return name.slice(0, -1)
    return name
  }

  for (const [pathKey, pathItem] of Object.entries(paths)) {
    if (!pathItem.get) continue

    const operation = pathItem.get
    if (!operation.parameters) continue

    // Only enhance endpoints that have a 'relations' parameter
    if (!operation.parameters.some((p) => p.name === 'relations')) continue

    // Determine schema name
    let schemaName = null

    // Try from tags first (e.g. "Trips", "SeatSchemas")
    if (operation.tags && operation.tags.length > 0) {
      schemaName = singularize(operation.tags[0])
    }

    // Fallback: Try from path (e.g. "/collections/seat-schemas")
    if ((!schemaName || !schemas[schemaName]) && pathKey.startsWith('/collections/')) {
      const collectionName = pathKey.split('/')[2] // "seat-schemas"
      const pascalName = collectionName
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join('')
      schemaName = singularize(pascalName)
    }

    const mainSchema = schemas[schemaName]
    if (!mainSchema || !mainSchema.properties) {
      console.warn(`Skipping relation enhancement for ${pathKey}: Schema '${schemaName}' not found.`)
      continue
    }

    const existingParamNames = new Set(operation.parameters.map((p) => p.name))

    // Relation alanlarını bul: doğrudan $ref veya items.$ref içeren property'ler
    const relationEntries = Object.entries(mainSchema.properties).filter(([, value]) => {
      if (!value || typeof value !== 'object') return false
      if (typeof value.$ref === 'string') return true
      if (value.items && typeof value.items.$ref === 'string') return true
      return false
    })

    for (const [relationName, relationSchema] of relationEntries) {
      const ref = relationSchema.$ref || (relationSchema.items && relationSchema.items.$ref)
      const refMatch = /^#\/components\/schemas\/(.+)$/.exec(ref)
      if (!refMatch) continue

      const relatedSchemaName = refMatch[1]
      const relatedSchema = schemas[relatedSchemaName]
      if (!relatedSchema || !relatedSchema.properties) continue

      const relatedProps = Object.entries(relatedSchema.properties)

      for (const [propName, propSchema] of relatedProps) {
        // Sadece scalar alanlar için filtre üret (ref veya items içeren nested relation'ları atla)
        if (!propSchema || typeof propSchema !== 'object') continue
        if (propSchema.$ref || propSchema.items) continue

        // İlişki bazlı filtre key'i: relation.property_suffix
        for (const suffix of filterSuffixes) {
          const paramName = `${relationName}.${propName}_${suffix}`
          if (existingParamNames.has(paramName)) continue

          operation.parameters.push({
            name: paramName,
            in: 'query',
            description: `Filter by ${relationName}.${propName} (${suffix})`,
            required: false,
            schema: {
              type: 'string',
            },
          })

          existingParamNames.add(paramName)
        }
      }
    }
  }
}
