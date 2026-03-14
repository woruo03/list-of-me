pkgname=list-of-me
pkgver=0.1.0
pkgrel=1
pkgdesc="A Vue + Tauri application"
arch=('x86_64')
depends=('webkit2gtk-4.1' 'glibc' 'gcc-libs' 'cairo' 'gdk-pixbuf2' 'glib2' 'gtk3' 'pango' 'sqlite')
makedepends=()
source=()

options=('!lto')
build() {
    cd "$srcdir/.."
    pnpm install
    pnpm tauri build
}

package() {
    cd "$srcdir/.."
    
    # Install the binary
    if [ -f "src-tauri/target/x86_64-unknown-linux-gnu/release/$pkgname" ]; then
        install -Dm755 "src-tauri/target/x86_64-unknown-linux-gnu/release/$pkgname" "$pkgdir/usr/bin/$pkgname"
    else
        install -Dm755 "src-tauri/target/release/$pkgname" "$pkgdir/usr/bin/$pkgname"
    fi
    
    # Install icons
    install -Dm644 "src-tauri/icons/128x128.png" "$pkgdir/usr/share/pixmaps/$pkgname.png"
    for size in 32 64 128 256 512; do
        if [ -f "src-tauri/icons/${size}x${size}.png" ]; then
            install -Dm644 "src-tauri/icons/${size}x${size}.png" "$pkgdir/usr/share/icons/hicolor/${size}x${size}/apps/$pkgname.png"
        fi
    done
    install -Dm644 "src-tauri/icons/icon.png" "$pkgdir/usr/share/icons/hicolor/512x512/apps/$pkgname.png"

    # Create and install .desktop file
    mkdir -p "$pkgdir/usr/share/applications"
    cat > "$pkgdir/usr/share/applications/$pkgname.desktop" << EOF
[Desktop Entry]
Name=List of Me
Exec=$pkgname
Icon=$pkgname
Type=Application
Categories=Utility;
Terminal=false
Comment=A Vue + Tauri application
EOF
}