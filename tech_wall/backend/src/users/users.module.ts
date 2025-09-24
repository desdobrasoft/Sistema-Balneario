import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MeController } from './me.controller';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [PrismaModule],
  providers: [UsersService],
  controllers: [UsersController, MeController],
  exports: [UsersService],
})
export class UsersModule {}
