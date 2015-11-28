# snake_web


#Setup

It uses gulp for most tasks

Required programs:
* npm
* bower
* gulp
* bowser-installer

To install all required devDependencies:
```bash
npm install
bower install
```

## Update libs
1. run `bower install -D [package-name]`
1. add necessary entry for `installer.sources` in `bower.json`
1. run `bower-installer`

## Update compiled files
1. run `gulp build`
