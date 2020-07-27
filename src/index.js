import DeviceInfo from 'react-native-device-info';
import NetInfo from '@react-native-community/netinfo';
import {
    DeviceEventEmitter,
    Platform,
    NativeModules,
    Linking,
    Alert
} from 'react-native';

const androidAppUpdater = NativeModules.AndroidAppUpdater;
const ITUNES_URL = 'https://itunes.apple.com/lookup?bundleId='
import AsyncStorageUtil from './utils/AsyncStorageUtil';
import { EVENT_EMITTER_KEYS, AsyncStorageKeys } from './utils/constant';


class AppUpdateManager {

    /*
      *Initiate the version check for iOS & Android.
      *Provide Callbacks if update is available or if error occurred
    */
    updateInitializationOptions = {
        useIosDefaultUi: true,
        iosMode: IOSModeType.live,
        iosAppID: ''
    };
    static checkForUpdates(initializationOptions) {
        if (initializationOptions) {
            this.updateInitializationOptions = initializationOptions;
        }
        if (Platform.OS == 'ios') {
            this.checkIOSAppLatestVersion();
        }
        else {
            androidAppUpdater.checkAppUpdate();
        }
    }


    static checkIOSAppLatestVersion = async () => {
        const internetState = await NetInfo.fetch()
        if (internetState.isInternetReachable) {
            let URL = ITUNES_URL + DeviceInfo.getBundleId()
            const mockURL = await this.getIosMockURL()
            if (mockURL && mockURL.length > 0) {
                if (mockURL && mockURL.length > 0) {
                    URL = mockURL
                }
            }
            this.checkIOSAppUpdateForUrl(URL)
        }
    };

    static checkIOSAppUpdateForUrl = async (URL) => {
        try {
            let response = await (await fetch(URL)).json()
            this.processNewIosVersionData(response)
        }
        catch (error) {
            DeviceEventEmitter.emit(EVENT_EMITTER_KEYS.APP_UPDATE_ERROR, { message: 'Failed to get details for force update' });
        }
    }


    static processNewIosVersionData = async (data) => {

        if (data.resultCount < 1) {
            DeviceEventEmitter.emit(EVENT_EMITTER_KEYS.APP_UPDATE_ERROR, { message: 'No Version details are available for your app' });
            console.log("checkIOSAppLatestVersion - No Version details are available for your app");
            return;
        }
        const result = data.results[0];
        const latestVersion = result.version;
        const releaseNotes = result.releaseNotes;
        const updateData = { latestVersion: latestVersion, releaseNotes: releaseNotes, useIosDefaultUi: this.updateInitializationOptions.useIosDefaultUi };

        DeviceEventEmitter.emit(EVENT_EMITTER_KEYS.APP_UPDATE_AVAILABLE_SUCCESS, updateData);
    }

    static displayAlertForUpdate(data) {
        let alertOption = [{
            text: 'Update',
            onPress: () => {
                Linking.openURL('https://itunes.apple.com/app/id' + '508036345')
            }
        }]
        if (!data.isMajor) {
            alertOption.push({
                text: 'Cancel',
                onPress: () => { }
            })
        }
        Alert.alert('Update Available!!', 'Update your app.', alertOption, { cancelable: false })
    }

    /*
    * Enable Mocking mode
    * used for ios
    * Pass mock URL
    */
    static enableIosMocking = async (mockURL) => {
        return new Promise((resolve, reject) => {
            AsyncStorageUtil.setAsyncStorage(AsyncStorageKeys.APP_UPGRADE_IOS, mockURL).then(() => {
                resolve(true);
            }).
                catch(err => {
                    reject(undefined);
                });
        })
    }
    
    /*
   * Disable Mocking mode
   * used for ios
   */
    static disableIosMocking() {
        AsyncStorageUtil.setAsyncStorage(AsyncStorageKeys.APP_UPGRADE_IOS, '')
    }

    /*
   * Get Stored Mock URL
   * used for ios
   */
    static getIosMockURL = async () => {
        return new Promise((resolve, reject) => {
            AsyncStorageUtil.getAsyncStorage(AsyncStorageKeys.APP_UPGRADE_IOS).then((mockURL) => {
                resolve(mockURL);
            }).
                catch(err => {
                    reject(undefined);
                });
        })
    }

    static isUpdateMajor = async (data) => {
        let latestVersion = data.latestVersion
        let currentVersion = await DeviceInfo.getVersion()
        if (latestVersion) {
            if (currentVersion < latestVersion) {
                let currentVSplit = currentVersion.split(".");
                let latestVSplit = latestVersion.split(".");
                return (latestVSplit[0] > currentVSplit[0]);
            }
        }
        else if (data.priority) {
            return (data.priority > 3)
        }
        else {
            return false;
        }
    }
    static processVersionUpdate(data) {
        if (Platform.OS == 'ios' && data.useIosDefaultUi) {
            this.displayAlertForUpdate(data);
        }
        else if (Platform.OS == 'android') {
            androidAppUpdater.startUpdatingApp(data.isMajorUpdate); //pass whether it is major update or not 
        }
    }
}
export default AppUpdateManager;
