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
import { CustomerAddressesService } from './customer_addresses.service.js';
import {
  CreateCustomerAddressDto,
  FindCustomerAddressesQueryDto,
  UpdateCustomerAddressDto,
} from './dto/customer_addresses_dto.js';

@Controller('customer-addresses')
export class CustomerAddressesController {
  constructor(
    private readonly customerAddressesService: CustomerAddressesService,
  ) {}

  // GET /customer-addresses?customerId=...
  @Get()
  findAll(@Query() query: FindCustomerAddressesQueryDto) {
    return this.customerAddressesService.findAll(query);
  }

  // GET /customer-addresses/:id
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.customerAddressesService.findOne(id);
  }

  // POST /customer-addresses
  @Post()
  create(@Body() dto: CreateCustomerAddressDto) {
    return this.customerAddressesService.create(dto);
  }

  // PATCH /customer-addresses/:id
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCustomerAddressDto,
  ) {
    return this.customerAddressesService.update(id, dto);
  }

  // DELETE /customer-addresses/:id
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.customerAddressesService.remove(id);
  }
}