; ─────────────────────────────────────────────────────────────────────────────
;  RAUSCH — NSIS Installer Script
;  Requires NSIS 3.x  (https://nsis.sourceforge.io)
; ─────────────────────────────────────────────────────────────────────────────

Unicode True

; ── Definitions ───────────────────────────────────────────────────────────────
; These are injected by package.ps1 via /D flags — do not hardcode here
!ifndef PRODUCT_NAME
  !define PRODUCT_NAME    "RAUSCH"
!endif
!ifndef PRODUCT_VERSION
  !define PRODUCT_VERSION "1.0.0"
!endif
!ifndef PUBLISHER
  !define PUBLISHER       "Sinuslabs"
!endif
!ifndef VST3_SRC
  !define VST3_SRC        "..\..\build\Windows\RAUSCH.vst3"
!endif
!ifndef OUTPUT_EXE
  !define OUTPUT_EXE      "RAUSCH-Windows.exe"
!endif

; ── General ───────────────────────────────────────────────────────────────────
Name            "${PRODUCT_NAME} ${PRODUCT_VERSION}"
OutFile         "${OUTPUT_EXE}"
InstallDir      "$COMMONFILES\VST3"
InstallDirRegKey HKLM "Software\${PUBLISHER}\${PRODUCT_NAME}" "InstallDir"
RequestExecutionLevel admin
SetCompressor   /SOLID lzma
ShowInstDetails show

; ── Modern UI ─────────────────────────────────────────────────────────────────
!include "MUI2.nsh"

!define MUI_ABORTWARNING
!define MUI_WELCOMEPAGE_TITLE   "Welcome to ${PRODUCT_NAME} ${PRODUCT_VERSION}"
!define MUI_WELCOMEPAGE_TEXT    "This wizard will install ${PRODUCT_NAME} ${PRODUCT_VERSION} on your computer.$\r$\n$\r$\nClick Next to continue."
!define MUI_FINISHPAGE_TITLE    "Installation Complete"
!define MUI_FINISHPAGE_TEXT     "${PRODUCT_NAME} ${PRODUCT_VERSION} has been installed.$\r$\n$\r$\nRescan your DAW's VST3 folder to find the plugin."
!define MUI_FINISHPAGE_LINK     "Visit sinuslabs.com"
!define MUI_FINISHPAGE_LINK_LOCATION "https://sinuslabs.com"

; Pages
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_LICENSE   "Resources\license.txt"
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

; Uninstall pages
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES

!insertmacro MUI_LANGUAGE "English"

; ── Installer ─────────────────────────────────────────────────────────────────
Section "VST3 Plugin" SecVST3
  SectionIn RO  ; required, cannot be deselected

  SetOutPath "$INSTDIR"
  File /r "${VST3_SRC}"

  ; Write install path to registry
  WriteRegStr HKLM "Software\${PUBLISHER}\${PRODUCT_NAME}" "InstallDir" "$INSTDIR"
  WriteRegStr HKLM "Software\${PUBLISHER}\${PRODUCT_NAME}" "Version"    "${PRODUCT_VERSION}"

  ; Add/Remove Programs entry
  WriteRegStr   HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" \
                "DisplayName"          "${PRODUCT_NAME} ${PRODUCT_VERSION}"
  WriteRegStr   HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" \
                "DisplayVersion"       "${PRODUCT_VERSION}"
  WriteRegStr   HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" \
                "Publisher"            "${PUBLISHER}"
  WriteRegStr   HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" \
                "UninstallString"      '"$INSTDIR\Uninstall-${PRODUCT_NAME}.exe"'
  WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" \
                "NoModify"             1
  WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" \
                "NoRepair"             1

  ; Write uninstaller
  WriteUninstaller "$INSTDIR\Uninstall-${PRODUCT_NAME}.exe"
SectionEnd

; ── Uninstaller ───────────────────────────────────────────────────────────────
Section "Uninstall"
  ; Remove plugin bundle
  RMDir /r "$INSTDIR\${PRODUCT_NAME}.vst3"

  ; Remove uninstaller itself
  Delete "$INSTDIR\Uninstall-${PRODUCT_NAME}.exe"

  ; Clean up registry
  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}"
  DeleteRegKey HKLM "Software\${PUBLISHER}\${PRODUCT_NAME}"
SectionEnd
