# dji-fly-updates

Apify actor for checking DJI Fly app updates

This will check for updates of Android version of DJI Fly app (it is not on Play store). When there is new version, 
it will send notification e-mail with link to donwload new APK file. It also sends link to Android 12 Beta build.

## Input

```json
{
  "postmarkToken": "xxx-xxx",
  "toEmail": "you@example.com"
}
```

To run this actor you'll need [postmark.com](https://www.postmark.com) account, to get your `postmarkToken`.
You'll also need account on [Apify](https://apify.com), to schedule Actor runs.

You can run this actor locally:

```bash
yarn install
yarn run apify --purge
```
