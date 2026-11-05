import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { OrderItemsService } from './order_items.service.js';
import {
  CreateOrderItemDto,
  FindOrderItemsQueryDto,
  UpdateOrderItemDto,
} from './dto/order_items_dto.js';

@Controller('order-items')
export class OrderItemsController {
  constructor(private readonly orderItemsService: OrderItemsService) {}

  // GET /order-items?orderId=
  @Get()
  findAll(@Query() query: FindOrderItemsQueryDto) {
    return this.orderItemsService.findAll(query);
  }

  // GET /order-items/:id
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.orderItemsService.findOne(id);
  }

  // POST /order-items  (tambah buku ke pesanan pending)
  @Post()
  create(@Body() dto: CreateOrderItemDto) {
    return this.orderItemsService.create(dto);
  }

  // PATCH /order-items/:id  (ubah jumlah)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOrderItemDto,
  ) {
    return this.orderItemsService.update(id, dto);
  }

  // DELETE /order-items/:id
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.orderItemsService.remove(id);
  }
}