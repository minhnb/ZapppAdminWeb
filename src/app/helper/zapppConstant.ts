export const ZapppConstant = {
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token',
    EXPIRED_AT: 'expired_at',
    ROLE: 'role',
    USER_ROLE: {
        ADMIN: 'Admin',
        SENDER: 'Sender',
        DELIVERER: 'Deliverer'
    },
    PATTERN: {
        ONLY_DIGIT: '^[0-9]*$',
        VALID_USERNAME: '^[a-zA-Z][0-9a-zA-Z_.]+$'
    },
    KEYCODE: {
        UP: 38,
        DOWN: 40,
        ENTER: 13
    },
    FORMAT_DATETIME: 'MM/DD/YYYY HH:mm',
    FORMAT_DATETIME_WITH_SECOND: 'MM/DD/YYYY HH:mm:ss',
    FORMAT_DATE: 'MM/DD/YYYY',
    FORMAT_TIME: 'HH:mm',
    FORMAT_TIME_FULL: 'HH:mm:ss',
    SERVER_FORMAT_DATE: 'YYYY/MM/DD',
    TABLE_PAGINATION: {
        ITEM_PER_PAGE: 20
    },
    SENDER_APP: 'sender_app',
    DELIVERER_APP: 'deliverer_app',
    WEB_APP: 'web_app',
    LOCALIZATION_EXCEL_FILE: {
        ZAPPPER_SHEET: 'zappper',
        SENDER_RECEIVER_SHEET: 'sender_receiver',
        WEB_HOME_SHEET: 'web_home'
    }
};
