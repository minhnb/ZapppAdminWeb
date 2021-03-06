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
        VALID_USERNAME: '^[a-zA-Z][0-9a-zA-Z_.]+$',
        VALID_SWIFTCODE: '^[a-zA-Z]{6}[a-zA-Z0-9]{2}([a-zA-Z0-9]{3})?$'
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
    SERVER_FORMAT_DATE: 'YYYY-MM-DD',
    SERVER_FORMAT_DATE_WITH_SPLASH: 'YYYY/MM/DD',
    TABLE_PAGINATION: {
        ITEM_PER_PAGE: 20
    },
    SENDER_APP: 'sender_app',
    DELIVERER_APP: 'deliverer_app',
    WEB_APP: 'web_app',
    SERVER: 'server',
    LOCALIZATION_EXCEL_FILE: {
        ZAPPPER_SHEET: 'zappper',
        SENDER_RECEIVER_SHEET: 'sender_receiver',
        WEB_HOME_SHEET: 'web_home',
        SERVER_SHEET: 'server'
    },
    VEHICLE: {
        BICYCLING: "bicycling",
        WALKING: "walking",
        DRIVING: "driving"
    },
    NO_PICTURE: 'assets/img/theme/no-photo.png',
    NO_PICTURE_WITH_ADD_BUTTON: 'assets/img/zappp/no-photo.png',
    PICTURE_MAX_SIZE_MB: 5,
    DELIVERY_STATUS: {
        ACCEPTED: "Accepted",
        CANCELED: "Canceled",
        COMPLETED: "Completed",
        EXPIRED: "Expired",
        NEW: "New",
        DELIVERING: "Delivering",
        PENDING: "Pending",
        REJECTED: "Rejected",
        TIMEOUT: "Timeout"
    },
    PAYMENT_STATUS: {
        FAILED: "failed",
        PENDING: "pending",
        SETTLED: "settled",
		SUCCEEDED: "succeeded"
    }
};
