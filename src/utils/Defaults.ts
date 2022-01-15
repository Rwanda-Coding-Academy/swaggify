import { PathString } from '../typings';

/**
 * Class containing all global Defaults and Constants
 */
export class Defaults {
    /**
     * Default Swagger Endpoint Url
     */
    public static SWAGGER_ENDPOINT_URL: PathString = '/api-docs';

    /**
     * Default Swagger Config File Path
     */
    public static SWAGGER_DEFINITION_FILE: string = './swagger/swagger.json';

        /**
     * Default Swaggify Configuration File
     */
    public static SWAGGIFY_CONFIG_FILE: string = './swagger.config.json';    
}