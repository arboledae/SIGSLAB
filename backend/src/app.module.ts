import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { TicketsModule } from './tickets/tickets.module';
import { User } from './auth/entities/user.entity';
import { Ticket } from './tickets/entities/ticket.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      ...(process.env.DATABASE_URL
        ? { url: process.env.DATABASE_URL }
        : {
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '5432', 10),
            username: process.env.DB_USER || 'sigslab',
            password: process.env.DB_PASSWORD || 'sigslab_pass',
            database: process.env.DB_NAME || 'sigslab',
          }),
      entities: [User, Ticket],
      synchronize: true, // Automatic schema sync for development
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
    }),
    AuthModule,
    TicketsModule
  ],
  controllers: [],
  providers: []
})
export class AppModule {}
