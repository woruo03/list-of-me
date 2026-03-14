pkgname=list-of-me
pkgver=0.1.0
pkgrel=1
pkgdesc="A personal task management desktop application built with Tauri + Vue 3"
arch=('x86_64')
depends=('webkit2gtk-4.1' 'glibc' 'gcc-libs' 'cairo' 'gdk-pixbuf2' 'glib2' 'gtk3' 'pango' 'sqlite')
makedepends=('rust' 'cargo' 'nodejs')
source=()
sha256sums=()

options=('!lto')
build() {
    cd "$srcdir/.."
    # 使用core自带的pnpm（通过nodejs-corepack提供）
    corepack enable pnpm
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
    
    # Install icons - ensure all required sizes are installed
    # Install pixmaps icon
    install -Dm644 "src-tauri/icons/128x128.png" "$pkgdir/usr/share/pixmaps/$pkgname.png"
    
    # Install hicolor theme icons
    for size in 32 64 128 256 512; do
        if [ -f "src-tauri/icons/${size}x${size}.png" ]; then
            install -Dm644 "src-tauri/icons/${size}x${size}.png" "$pkgdir/usr/share/icons/hicolor/${size}x${size}/apps/$pkgname.png"
        elif [ -f "src-tauri/icons/icon.png" ] && [ "$size" = "512" ]; then
            # Use icon.png as fallback for 512x512
            install -Dm644 "src-tauri/icons/icon.png" "$pkgdir/usr/share/icons/hicolor/512x512/apps/$pkgname.png"
        fi
    done
    
    # Ensure at least one icon is installed for the .desktop file
    if [ ! -f "$pkgdir/usr/share/icons/hicolor/128x128/apps/$pkgname.png" ]; then
        install -Dm644 "src-tauri/icons/128x128.png" "$pkgdir/usr/share/icons/hicolor/128x128/apps/$pkgname.png"
    fi

    # Create and install .desktop file with proper icon reference
    mkdir -p "$pkgdir/usr/share/applications"
    cat > "$pkgdir/usr/share/applications/$pkgname.desktop" << EOF
[Desktop Entry]
Name=List of Me
GenericName=Task Management Application
Exec=$pkgname
Icon=$pkgname
Type=Application
Categories=Utility;Office;
Terminal=false
Comment=A personal task management desktop application built with Tauri + Vue 3
Keywords=task;management;gtd;todo;productivity
StartupWMClass=list-of-me
EOF
}