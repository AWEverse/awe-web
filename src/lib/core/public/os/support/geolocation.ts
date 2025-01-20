/**
 * Checks if the browser supports Geolocation API.
 * Specifically, it checks if the `geolocation` object and its `getCurrentPosition` method are available.
 *
 * @returns {boolean} `true` if Geolocation API is supported, `false` otherwise.
 */
const IS_GEOLOCATION_SUPPORTED = !!navigator?.geolocation?.getCurrentPosition;

export default IS_GEOLOCATION_SUPPORTED;
