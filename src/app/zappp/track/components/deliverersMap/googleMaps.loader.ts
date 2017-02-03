import { AppConfig } from '../../../../app.config';

export const GoogleMapsLoader = require('google-maps');
GoogleMapsLoader.KEY = AppConfig.GOOGLE_BROWSER_API_KEY;
