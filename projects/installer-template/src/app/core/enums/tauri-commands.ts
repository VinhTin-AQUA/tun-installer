export enum InstallerDocumentCommands {
    GET_INSTALLER_DOCUMENT_COMMAND = 'get_installer_document_command',
}

export enum ProjectStateCommands {
    GET_PROJECT_STATE_COMMAND = 'get_project_state_command',
}

export enum HtmlEngineCommands {
    PREVIEW_INSTALLER_UI_COMMAND = 'preview_installer_ui_command',
    LOAD_HTML_FIRST_TIME_INSTALL_PAGES_COMMAND = 'load_html_first_time_install_pages_command',
    LOAD_HTML_MAINTENANCE_PAGES_COMMAND = 'load_html_maintenance_pages_command',
}

export enum CompressCommands {
    EXTRACT_INSTALLER_COMMAND = 'extract_installer_command',
    CANCEL_EXTRACT_COMMAND = 'cancel_extract_command',
    IS_CANCELLED_COMMAND = 'is_cancelled_command',
}


export enum InstallCommands {
    INSTALL = 'install',
}
