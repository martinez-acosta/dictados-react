#!/bin/bash

# Script de deployment robusto para GitHub Pages
set -e  # Detener si hay algún error

echo "🔨 Construyendo el proyecto..."
npm run build

echo "📝 Preparando archivos para deployment..."
touch dist/.nojekyll

echo "📦 Agregando cambios de dist..."
git add dist -f

echo "💾 Creando commit (si hay cambios)..."
git diff-index --quiet --cached HEAD -- dist/ || git commit -m "Deploy to GitHub Pages"

echo "🚀 Desplegando a gh-pages..."
# Usar force push para evitar conflictos de non-fast-forward
SPLIT_HASH=$(git subtree split --prefix dist HEAD)
git push origin $SPLIT_HASH:refs/heads/gh-pages --force

echo "✅ Deployment completado exitosamente!"
echo "🌐 Los cambios estarán visibles en GitHub Pages en 1-2 minutos"
