import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CreateInventoryItemDto } from '../../application/dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from '../../application/dto/update-inventory-item.dto';
import { RegisterStockMovementDto } from '../../application/dto/register-stock-movement.dto';
import { CreateInventoryItemUseCase } from '../../application/use-cases/create-inventory-item.use-case';
import { UpdateInventoryItemUseCase } from '../../application/use-cases/update-inventory-item.use-case';
import { FindInventoryItemsUseCase } from '../../application/use-cases/find-inventory-items.use-case';
import { FindLowStockItemsUseCase } from '../../application/use-cases/find-low-stock-items.use-case';
import { RegisterStockMovementUseCase } from '../../application/use-cases/register-stock-movement.use-case';
import { FindItemMovementsUseCase } from '../../application/use-cases/find-item-movements.use-case';
import { JwtAuthGuard } from 'src/shared/security/jwt-auth.guard';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { Role } from 'src/shared/enums/role.enum';
import { CurrentUserId } from 'src/shared/decorators/current-user-id.decorator';
import { FindInventoryItemsQueryDto } from '../../application/dto/find-inventory-items-query.dto';

// Inventario es logística, no encaja exactamente en "administrativo"
// (patient) ni "clínico" (clinical-record) — se decide alinearlo con
// patient's WRITE_ROLES (RECEPTIONIST ya maneja dinero en billing, es
// razonable que también maneje insumos). Decisión de negocio nueva, no una
// copia mecánica de un caso ya resuelto. Lectura = todo el staff, cualquiera
// debería poder chequear si hay stock de algo.
const READ_ROLES = [
  Role.SUPER_ADMIN,
  Role.CLINIC_ADMIN,
  Role.RECEPTIONIST,
  Role.DENTIST,
  Role.HYGIENIST,
  Role.DENTAL_ASSISTANT,
];
const WRITE_ROLES = [Role.SUPER_ADMIN, Role.CLINIC_ADMIN, Role.RECEPTIONIST];

@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Inventario')
@Controller('inventory')
export class InventoryController {
  constructor(
    private readonly createInventoryItemUseCase: CreateInventoryItemUseCase,
    private readonly updateInventoryItemUseCase: UpdateInventoryItemUseCase,
    private readonly findInventoryItemsUseCase: FindInventoryItemsUseCase,
    private readonly findLowStockItemsUseCase: FindLowStockItemsUseCase,
    private readonly registerStockMovementUseCase: RegisterStockMovementUseCase,
    private readonly findItemMovementsUseCase: FindItemMovementsUseCase,
  ) {}

  @Post('items')
  @Roles(...WRITE_ROLES)
  @ApiOperation({ summary: 'Crear un insumo con su stock inicial' })
  @ApiResponse({ status: 201, description: 'Insumo creado correctamente' })
  createItem(@Body() dto: CreateInventoryItemDto) {
    return this.createInventoryItemUseCase.execute(dto);
  }

  @Get('items')
  @Roles(...READ_ROLES)
  @ApiOperation({ summary: 'Listar todos los insumos' })
  @ApiResponse({ status: 200, description: 'Listado de insumos' })
  findItems(@Query() query: FindInventoryItemsQueryDto) {
    return this.findInventoryItemsUseCase.execute(query);
  }

  @Get('low-stock')
  @Roles(...READ_ROLES)
  @ApiOperation({ summary: 'Listar insumos con stock igual o menor al umbral de alerta' })
  @ApiResponse({ status: 200, description: 'Listado de insumos con stock bajo' })
  findLowStock() {
    return this.findLowStockItemsUseCase.execute();
  }

  @Patch('items/:id')
  @Roles(...WRITE_ROLES)
  @ApiOperation({ summary: 'Editar nombre/unidad/umbral de un insumo (no el stock directo)' })
  @ApiResponse({ status: 200, description: 'Insumo actualizado correctamente' })
  @ApiResponse({ status: 404, description: 'Insumo no encontrado' })
  @ApiParam({ name: 'id', description: 'ID del insumo' })
  updateItem(@Param('id') id: string, @Body() dto: UpdateInventoryItemDto) {
    return this.updateInventoryItemUseCase.execute(id, dto);
  }

  @Post('items/:id/movements')
  @Roles(...WRITE_ROLES)
  @ApiOperation({ summary: 'Registrar un movimiento de stock (entrada o salida)' })
  @ApiResponse({ status: 201, description: 'Movimiento registrado correctamente' })
  @ApiResponse({ status: 400, description: 'Stock insuficiente para la salida' })
  @ApiResponse({ status: 404, description: 'Insumo no encontrado' })
  @ApiParam({ name: 'id', description: 'ID del insumo' })
  registerMovement(
    @Param('id') id: string,
    @Body() dto: RegisterStockMovementDto,
    @CurrentUserId() userId: string,
  ) {
    return this.registerStockMovementUseCase.execute(id, {
      ...dto,
      registeredBy: userId,
    });
  }

  @Get('items/:id/movements')
  @Roles(...READ_ROLES)
  @ApiOperation({ summary: 'Historial de movimientos de un insumo' })
  @ApiResponse({ status: 200, description: 'Listado de movimientos' })
  @ApiResponse({ status: 404, description: 'Insumo no encontrado' })
  @ApiParam({ name: 'id', description: 'ID del insumo' })
  findMovements(@Param('id') id: string) {
    return this.findItemMovementsUseCase.execute(id);
  }
}
