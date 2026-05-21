import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Plugin => {
  const uploadProvider = env('UPLOAD_PROVIDER', 'local');

  if (uploadProvider === 'r2') {
    return {
      'users-permissions': {
        config: {
          jwtSecret: env('JWT_SECRET'),
        },
      },
      upload: {
        config: {
          provider: 'aws-s3',
          providerOptions: {
            baseUrl: env('R2_PUBLIC_URL'),
            rootPath: env('R2_ROOT_PATH', ''),
            s3Options: {
              credentials: {
                accessKeyId: env('R2_ACCESS_KEY_ID'),
                secretAccessKey: env('R2_SECRET_ACCESS_KEY'),
              },
              endpoint: env('R2_ENDPOINT'),
              forcePathStyle: true,
              region: env('R2_REGION', 'auto'),
              params: {
                Bucket: env('R2_BUCKET'),
              },
            },
            providerConfig: {
              preventOverwrite: true,
            },
          },
          actionOptions: {
            upload: {},
            uploadStream: {},
            delete: {},
          },
        },
      },
    };
  }

  return {
    'users-permissions': {
      config: {
        jwtSecret: env('JWT_SECRET'),
      },
    },
  };
};

export default config;
