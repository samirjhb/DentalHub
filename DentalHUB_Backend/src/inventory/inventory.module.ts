import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  InventoryItem,
  InventoryItemSchema,
} from './infrastructure/persistence/mongo/inventory-item.schema';
import {
  StockMovement,
  StockMovementSchema,
} from './infrastructure/persistence/mongo/stock-movement.schema';
import { AuthSchema } from 'src/auth/infrastructure/persistence/mongo/auth.schema';
import { InventoryController } from './infrastructure/controllers/inventory.controller';
import { InventoryRepository } from './domain/repositories/inventory.repository';
import { InventoryMongoRepository } from './infrastructure/persistence/mongo/inventory-mongo.repository';
import { CreateInventoryItemUseCase } from './application/use-cases/create-inventory-item.use-case';
import { UpdateInventoryItemUseCase } from './application/use-cases/update-inventory-item.use-case';
import { FindInventoryItemsUseCase } from './application/use-cases/find-inventory-items.use-case';
import { FindLowStockItemsUseCase } from './application/use-cases/find-low-stock-items.use-case';
import { RegisterStockMovementUseCase } from './application/use-cases/register-stock-movement.use-case';
import { FindItemMovementsUseCase } from './application/use-cases/find-item-movements.use-case';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: InventoryItem.name, schema: InventoryItemSchema },
      { name: StockMovement.name, schema: StockMovementSchema },
      // 'registeredBy' solo se popula para mostrar el nombre en el historial
      // de movimientos (proyección explícita name/email — nunca un populate
      // "pelado" contra 'Auth', que expondría el hash de password).
      { name: 'Auth', schema: AuthSchema },
    ]),
  ],
  controllers: [InventoryController],
  providers: [
    { provide: InventoryRepository, useClass: InventoryMongoRepository },
    CreateInventoryItemUseCase,
    UpdateInventoryItemUseCase,
    FindInventoryItemsUseCase,
    FindLowStockItemsUseCase,
    RegisterStockMovementUseCase,
    FindItemMovementsUseCase,
  ],
})
export class InventoryModule {}
