import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MatrixModule } from './matrix/matrix.module';
import { AdvancedModule } from './advanced/advanced.module';
import { MLModule } from './ml/ml.module';

@Module({
  imports: [MatrixModule, AdvancedModule, MLModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
