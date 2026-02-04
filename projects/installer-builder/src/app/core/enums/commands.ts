export enum ProjectStateCommands {
    UPDATE_PROJECT_STATE_COMMAND = 'update_project_state_command',
    LOAD_PROJECT_STATE_COMMAND = 'load_project_state_command',
}

export enum ProjectManagerCommands {
    CREATE_TUNINSTALLER_PROJECT_COMMAND = 'create_tuninstaller_project_command',
    SAVE_INSTALLER_CONFIG_COMMAND = 'save_installer_config_command',
    LOAD_INSTALLER_DOCUMENT_CONFIG_COMMAND = 'load_installer_document_config_command',
    READ_SUBFOLDERS_COMMAND = 'read_subfolders_command',
    READ_FILES_IN_FOLDER_COMMAND = 'read_files_in_folder_command',
    OPEN_TUNINSTALLER_PROJECT_COMMAND = 'open_tuninstaller_project_command',
    GET_PREREQUISITES_COMMAND = 'get_prerequisites_command'
}

export enum CompressCommands {
    COMPRESS_INSTALLER_COMMAND = 'compress_installer_command',
    CANCEL_COMPRESS_COMMAND = 'cancel_compress_command',
    CANCEL_EXTRACT_COMMAND = 'cancel_extract_command',
}

export enum HtmlEngineCommands {
    PREVIEW_INSTALLER_UI_COMMAND = 'preview_installer_ui_command',
    LOAD_HTML_FIRST_TIME_INSTALL_PAGES_COMMAND = 'load_html_first_time_install_pages_command',
    LOAD_HTML_MAINTENANCE_PAGES_COMMAND = 'load_html_maintenance_pages_command',
}
