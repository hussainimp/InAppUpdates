# InAppUpdates
InAppUpdates



## Install 
npm install --save https://github.com/hussainimp/InAppUpdates/master

yarn add https://github.com/hussainimp/InAppUpdates/master


## ExampleProject

Refer to ExampleProject for refrence

## Usage

import AppUpdateManager from 'react-native-in-app-update';


const EVENT_EMITTER_KEYS = {
  APP_UPDATE_AVAILABLE_SUCCESS : 'AppUpdateAvailableSuccess',
  APP_UPDATE_ERROR : 'AppUpdateError',
  APP_UPDATE_SUCCESS : 'AppUpdateEvent'
}

import {
  DeviceEventEmitter
} from 'react-native';


  /*
   ** Check if any new updates are available
  */
  _checkForForceUpdate = () => {
    AppUpdateManager.checkForUpdates({
      useIosDefaultUi: false,
      iosAppID: IOS_APP_ID
    })
    this._setListenersForForceUpdate()
  }
  /*
   ** Enable iOS Mocking
  */
  enableiOSMocking() {
    AppUpdateManager.enableIosMocking('https://itunes.apple.com/lookup?id=422689480')//Pass any valid ios app url by changing the App id
  }
  /*
    ** Stop iOS Mocking
   */
  disableiOSMocking() {
    AppUpdateManager.disableIosMocking()
  }

  async _setListenersForForceUpdate() {
    DeviceEventEmitter.addListener(EVENT_EMITTER_KEYS.APP_UPDATE_AVAILABLE_SUCCESS, async (e) => {
      console.log(`New Version detected: ${JSON.stringify(e)}`)
      const isMajorUpdate = await AppUpdateManager.isUpdateMajor(e)
      console.log("Available update isMajorUpdate: " + isMajorUpdate);
      e.isMajorUpdate = isMajorUpdate;
      AppUpdateManager.processVersionUpdate(e)
      if (Platform.OS == 'ios') {
        // If you have disabled module
      }
    });
    DeviceEventEmitter.addListener(EVENT_EMITTER_KEYS.APP_UPDATE_ERROR, (e) => {
      console.log(`Detected force update error: ${e}`)
    });

    DeviceEventEmitter.addListener(EVENT_EMITTER_KEYS.APP_UPDATE_SUCCESS, (e) => {
      if (e.status) {
        console.log("Android app udate success: " + JSON.stringify(e))
      }
      else {
        console.log("Android app update error: " + JSON.stringify(e))
      }
    });
  }
