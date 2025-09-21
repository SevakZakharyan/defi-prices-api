import { Module } from '@nestjs/common';
import { QuoterService } from './quoter.service';
import { QuoterController } from './quoter.controller';
import { ProvidersModule } from '../providers/providers.module';

@Module({
  imports: [ProvidersModule],
  controllers: [QuoterController],
  providers: [QuoterService],
})
export class QuoterModule {}
