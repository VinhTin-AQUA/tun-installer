@REM build exe template
call npm run tauri:build:template

@REM copy target\x86_64-pc-windows-msvc\release\installer_template.exe vào projects\installer-builder\src-tauri\resources với tên là exe_template_v1.0.0.exe
copy /Y "target\x86_64-pc-windows-msvc\release\installer_template.exe" "projects\installer-builder\src-tauri\resources\exe_template_v1.0.0.exe"

@REM build installer builder
call npm run tauri:build:builder

@REM  C:\Users\tinhv\Desktop\f\tun-installer\target\release\bundle\nsis\Tun Installer_0.1.0_x64-setup.exe