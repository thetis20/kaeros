!macro customUnInstall
  ${ifNot} ${isUpdated}
    ${ifNot} ${Silent}
      MessageBox MB_YESNO|MB_ICONEXCLAMATION "Supprimer aussi les sessions et médias Kaeros ?$\r$\nCette action est irréversible." IDNO kaerosKeepData
        # electron always uses per user app data
        ${if} $installMode == "all"
          SetShellVarContext current
        ${endif}
        !ifdef APP_PACKAGE_NAME
          RMDir /r "$APPDATA\${APP_PACKAGE_NAME}"
        !endif
        !ifdef APP_PRODUCT_FILENAME
          RMDir /r "$APPDATA\${APP_PRODUCT_FILENAME}"
        !endif
        ${if} $installMode == "all"
          SetShellVarContext all
        ${endif}
      kaerosKeepData:
    ${endIf}
  ${endIf}
!macroend
