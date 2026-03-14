import { DataProvider, ProviderFactory } from './provider';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'; // Example

export interface S3ProviderOptions {
  region: string;
  bucket: string;
}

class S3Provider implements DataProvider<any> {
  private client: S3Client;
  private bucket: string;

  constructor(options: S3ProviderOptions) {
    this.client = new S3Client({ region: options.region });
    this.bucket = options.bucket;
  }

  async get(key: string): Promise<any> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    const response = await this.client.send(command);
    return response.Body?.transformToString();
  }

  async put(key: string, data: any): Promise<any> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: data as any,
    });
    return this.client.send(command);
  }
}

export class S3ProviderFactory implements ProviderFactory {
  create<T>(options: S3ProviderOptions): DataProvider<T> {
    return new S3Provider(options) as DataProvider<T>;
  }
} 