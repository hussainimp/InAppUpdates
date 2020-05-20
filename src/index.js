import DeviceInfo from 'react-native-device-info';
// import NetInfo from '@react-native-community/netinfo';
import {
    DeviceEventEmitter,
    Platform
} from 'react-native';

const ITUNES_URL = 'https://itunes.apple.com/lookup?bundleId='
class AppUpdateManager {

    /*
      *Initiate the version check for iOS & Android.
      *Provide Callbacks if update is available or if error occurred
    */
    static checkForUpdates(mockURL) {
        if (Platform.OS == 'ios') {
            this.checkIOSAppLatestVersion(mockURL);
        }
        else {
            this.checkAndroidAppLatestVersion()
        }
    }

    static checkAndroidAppLatestVersion = async () => {
    }


    static checkIOSAppLatestVersion = async (mockURL) => {
        // const internetState = await NetInfo.fetch()
        // if (internetState.isInternetReachable) {


        let URL = ITUNES_URL + DeviceInfo.getBundleId()
        if (mockURL && mockURL.length > 0) {
            URL = mockURL
        }
        try {
            let response = await (await fetch(URL)).json()
            this.processNewIosVersionData(response)
        }
        catch (error) {
            DeviceEventEmitter.emit('ForceUpdateEventError', { error: 'Failed to get details for force update' });
            console.log(error)
        }
        // }
    };


    static processNewIosVersionData = async (data) => {
        if (data.resultCount < 1) {
            DeviceEventEmitter.emit('ForceUpdateEventError', { error: 'No Version details are available for your app' });
            console.log("checkIOSAppLatestVersion - No Version details are available for your app");
            return;
        }
        const result = data.results[0];
        const latestVersion = result.version;
        const releaseNotes = result.releaseNotes;
        let currentVersion = await DeviceInfo.getVersion();
        if (currentVersion < latestVersion) {
            if (currentVersion < latestVersion) {
                let currentVSplit = currentVersion.split(".");
                let latestVSplit = latestVersion.split(".");
                if (latestVSplit[0] > currentVSplit[0]) {
                    DeviceEventEmitter.emit('ForceUpdateEventSuccess', { isMajor: true, latestVersion: latestVersion, releaseNotes: releaseNotes });
                }
                else {
                    DeviceEventEmitter.emit('ForceUpdateEventSuccess', { isMajor: false, latestVersion: latestVersion, releaseNotes: releaseNotes });
                }
            }
        }
    }
}
export default AppUpdateManager;

