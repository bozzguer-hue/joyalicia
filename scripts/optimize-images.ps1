<#
PowerShell helper to optimize and generate web-friendly image sizes using ImageMagick

Requirements:
- ImageMagick (magick)

Usage:
.
  .\scripts\optimize-images.ps1 -SourceDir .\assets -OutputDir .\assets\optimized

This script will create resized versions:
- og-image.jpg (1200x630)
- book-cover-1200.jpg, -800.jpg, -400.jpg
- headshot-800.jpg, -400.jpg

#>
param(
  [string]$SourceDir = "assets",
  [string]$OutputDir = "assets/optimized"
)

if(-not (Get-Command magick -ErrorAction SilentlyContinue)){
  Write-Error "ImageMagick not found. Install it from https://imagemagick.org and ensure 'magick' is on PATH."
  exit 1
}

New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null

function Get-FirstExisting($dir, $names){
  foreach($n in $names){
    $p = Join-Path $dir $n
    if(Test-Path $p){ return $p }
  }
  return $null
}

# Accept common source filenames and AVIF/PNG variants
$book = Get-FirstExisting $SourceDir @('book-cover.jpg','book-cover.png','book-cover.avif','Cover.avif','book.jpg')
$head = Get-FirstExisting $SourceDir @('headshot.jpg','headshot.png','headshot.avif','Joy.avif','joy.avif')
$pod = Get-FirstExisting $SourceDir @('podcast-cover.jpg','podcast-cover.png','podcast-cover.avif','podcast.png')

if(Test-Path $book){
  magick "$book" -resize 1200x1200\> "$OutputDir/book-cover-1200.jpg"
  magick "$book" -resize 800x800\> "$OutputDir/book-cover-800.jpg"
  magick "$book" -resize 400x400\> "$OutputDir/book-cover-400.jpg"
  # WebP variants
  magick "$book" -resize 1200x1200\> "$OutputDir/book-cover-1200.webp"
  magick "$book" -resize 800x800\> "$OutputDir/book-cover-800.webp"
  magick "$book" -resize 400x400\> "$OutputDir/book-cover-400.webp"
  # AVIF variants (if ImageMagick built with AVIF support)
  magick "$book" -resize 1200x1200\> "$OutputDir/book-cover-1200.avif"
  magick "$book" -resize 800x800\> "$OutputDir/book-cover-800.avif"
  magick "$book" -resize 400x400\> "$OutputDir/book-cover-400.avif"
} else { Write-Warning "$book not found. Place the book cover as book-cover.jpg in assets/" }

if(Test-Path $head){
  magick "$head" -resize 800x800\> "$OutputDir/headshot-800.jpg"
  magick "$head" -resize 400x400\> "$OutputDir/headshot-400.jpg"
  # WebP variants
  magick "$head" -resize 800x800\> "$OutputDir/headshot-800.webp"
  magick "$head" -resize 400x400\> "$OutputDir/headshot-400.webp"
  # AVIF variants
  magick "$head" -resize 800x800\> "$OutputDir/headshot-800.avif"
  magick "$head" -resize 400x400\> "$OutputDir/headshot-400.avif"
} else { Write-Warning "$head not found. Place the headshot as headshot.jpg in assets/" }

if(Test-Path $pod){
  magick "$pod" -resize 800x800\> "$OutputDir/podcast-cover-800.jpg"
  magick "$pod" -resize 400x400\> "$OutputDir/podcast-cover-400.jpg"
  magick "$pod" -resize 800x800\> "$OutputDir/podcast-cover-800.webp"
  magick "$pod" -resize 400x400\> "$OutputDir/podcast-cover-400.webp"
  # AVIF variants
  magick "$pod" -resize 800x800\> "$OutputDir/podcast-cover-800.avif"
  magick "$pod" -resize 400x400\> "$OutputDir/podcast-cover-400.avif"
} else { Write-Warning "$pod not found. (Optional) Place podcast-cover.jpg in assets/ to generate podcast variants." }

# Generate simple OG image by compositing headshot onto cover with accent bar (basic)
if(Test-Path $book -and Test-Path $head){
  $og = Join-Path $OutputDir "og-image.jpg"
  $tmpBase = Join-Path $OutputDir "__og-base.jpg"
  # create a centered, 1200x630 base from the book cover
  magick "$book" -resize 1200x1200\> -gravity center -background white -extent 1200x630 "$tmpBase"
  # composite the headshot resized onto the base
  magick "$tmpBase" "$head" -resize 240x240 -gravity southeast -geometry +40+40 -composite -fill "#ff2e83" -draw "rectangle 0,560 1200,630" "$og"
  Remove-Item $tmpBase -ErrorAction SilentlyContinue
  # create webp and avif OG
  $ogwebp = Join-Path $OutputDir "og-image.webp"
  magick "$og" "$ogwebp"
  $ogavif = Join-Path $OutputDir "og-image.avif"
  magick "$og" "$ogavif"
  Write-Output "OG image created: $og, $ogwebp and $ogavif"
} else { Write-Warning "Skipping OG image: source files missing." }

Write-Output "Optimization complete. Check $OutputDir for generated images."
