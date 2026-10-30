import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import Joi from 'joi';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { CustomersModule } from './customers/customers.module.js';
import { CustomerAddressesModule } from './customer_addresses/customer_addresses.module.js';
import { CategoriesModule } from './categories/categories.module.js';
import { PublishersModule } from './publishers/publishers.module.js';
import { BooksModule } from './books/books.module.js';
import { AuthorsModule } from './authors/authors.module.js';
import { BookAuthorsModule } from './book_authors/book_authors.module.js';
import { OrdersModule } from './orders/orders.module.js';
import { OrderItemsModule } from './order_items/order_items.module.js';
import { PaymentsModule } from './payments/payments.module.js';
import { ShipmentsModule } from './shipments/shipments.module.js';

// FATIH

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().default(3000),
        NODE_ENV: Joi.string()
          .valid('development', 'staging', 'production')
          .default('development'),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().default(5432),
        DB_USERNAME: Joi.string().default('postgres'),
        DB_PASSWORD: Joi.string().default('fatih'),
        DB_DATABASE: Joi.string().default('bookstore'),
      }),
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres' as const,
        host: configService.getOrThrow<string>('DB_HOST'),
        port: configService.getOrThrow<number>('DB_PORT'),
        username: configService.getOrThrow<string>('DB_USERNAME'),
        password: configService.getOrThrow<string>('DB_PASSWORD'),
        database: configService.getOrThrow<string>('DB_DATABASE'),
        autoLoadEntities: true,
        synchronize: configService.get<string>('NODE_ENV') === 'development',
      }),
    }),

    CustomersModule,
    CustomerAddressesModule,
    CategoriesModule,
    PublishersModule,
    BooksModule,
    AuthorsModule,
    BookAuthorsModule,
    OrdersModule,
    OrderItemsModule,
    PaymentsModule,
    ShipmentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}