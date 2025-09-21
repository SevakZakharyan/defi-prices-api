import { Module } from '@nestjs/common';
import { EthereumProvider } from './ethereum.provider';

@Module({
  providers: [EthereumProvider],
  exports: [EthereumProvider],
})
export class ProvidersModule {}
