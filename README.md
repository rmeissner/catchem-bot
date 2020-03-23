This repo requires Google Cloud services

#### Local Env
- `gcloud beta emulators datastore start --no-store-on-disk`
- `$(gcloud beta emulators datastore env-init)`
- `yarn`
- `yarn start:dev`

#### Deployment
- `yarn`
- `yarn deploy`
- `yarn cron` (Update cron jobs)