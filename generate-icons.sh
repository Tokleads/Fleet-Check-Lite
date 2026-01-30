#!/bin/bash

# Generate PWA icons for Titan Fleet
# This script creates placeholder icons - replace with actual logo later

ICON_DIR="client/public/icons"
mkdir -p "$ICON_DIR"

# Icon sizes needed for PWA
SIZES=(72 96 128 144 152 192 384 512)

# Create SVG icon (placeholder - replace with actual logo)
cat > "$ICON_DIR/icon.svg" << 'EOF'
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#00a3ff;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0088cc;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="512" height="512" fill="#0f172a" rx="80"/>
  
  <!-- Truck icon -->
  <g transform="translate(128, 180)">
    <!-- Truck body -->
    <rect x="0" y="40" width="160" height="80" fill="url(#grad)" rx="8"/>
    <rect x="140" y="20" width="120" height="100" fill="url(#grad)" rx="8"/>
    
    <!-- Windows -->
    <rect x="150" y="30" width="40" height="40" fill="#0f172a" rx="4"/>
    <rect x="200" y="30" width="50" height="40" fill="#0f172a" rx="4"/>
    
    <!-- Wheels -->
    <circle cx="40" cy="130" r="20" fill="#334155"/>
    <circle cx="40" cy="130" r="12" fill="#64748b"/>
    <circle cx="220" cy="130" r="20" fill="#334155"/>
    <circle cx="220" cy="130" r="12" fill="#64748b"/>
  </g>
</svg>
EOF

echo "✓ Created SVG icon"

# Generate PNG icons using ImageMagick (if available)
if command -v convert &> /dev/null; then
  echo "Generating PNG icons..."
  
  for size in "${SIZES[@]}"; do
    convert -background none -resize "${size}x${size}" "$ICON_DIR/icon.svg" "$ICON_DIR/icon-${size}x${size}.png"
    echo "✓ Generated ${size}x${size} icon"
  done
  
  echo "✓ All icons generated successfully!"
else
  echo "⚠ ImageMagick not found. Using placeholder method..."
  
  # Create placeholder PNGs using base64 encoded 1x1 pixel
  for size in "${SIZES[@]}"; do
    # Create a simple colored square as placeholder
    cat > "$ICON_DIR/icon-${size}x${size}.png.txt" << EOF
This is a placeholder for icon-${size}x${size}.png
Please replace with actual icon using ImageMagick or online tool:
https://realfavicongenerator.net/
EOF
    echo "✓ Created placeholder for ${size}x${size}"
  done
  
  echo ""
  echo "📝 To generate actual icons:"
  echo "1. Install ImageMagick: sudo apt-get install imagemagick"
  echo "2. Run this script again"
  echo "3. Or use online tool: https://realfavicongenerator.net/"
fi

echo ""
echo "✅ Icon generation complete!"
