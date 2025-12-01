# Kaeros
## Debug

 - In terminal type `lldb path/to/build.app`
 - In the opened debugger type `run --remote-debugging-port=8315`. It should open a window of your app.
 - Open Chrome at `http://localhost:8315/`
 - Click on the name of the app. For example, Webpack App.
 - If you don't see anything in the opened tab, focus on the window of your app.

## Build on Windows

Run 
```shell
docker run --rm -ti \            
 --env-file <(env | grep -iE 'DEBUG|NODE_|ELECTRON_|YARN_|NPM_|CI|CIRCLE|TRAVIS_TAG|TRAVIS|TRAVIS_REPO_|TRAVIS_BUILD_|TRAVIS_BRANCH|TRAVIS_PULL_REQUEST_|APPVEYOR_|CSC_|GH_|GITHUB_|BT_|AWS_|STRIP|BUILD_') \
 --env ELECTRON_CACHE="/root/.cache/electron" \
 --env ELECTRON_BUILDER_CACHE="/root/.cache/electron-builder" \
 -v ${PWD}:/project \
 -v ${PWD##*/}-node-modules:/project/node_modules \
 -v ~/.cache/electron:/root/.cache/electron \
 -v ~/.cache/electron-builder:/root/.cache/electron-builder \
 electronuserland/builder:wine
```

```shell
npm install --legacy-peer-deps
npm run electron-build:win
```