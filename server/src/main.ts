import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import helmet from "helmet";
import { AppModule } from "./app.module";
import { XssValidationPipe } from "./common/pipes/xss-validation.pipe";
import { ValidationPipe } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });

  const config = app.get(ConfigService);

  // Trust proxy for rate limiting (important for deployment behind Nginx/Vercel)
  app.set('trust proxy', 1);

  app.enableCors({
    origin: config.get("corsOrigins"),
    credentials: true,
  });

   // Global Validation Pipe
  app.useGlobalPipes(
    new XssValidationPipe(),
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );


  app.setGlobalPrefix("api/v1");

  // Explicit helmet configuration for API security
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https:", "wss:"],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }));


  const swaggerDoc = new DocumentBuilder()
    .setTitle("SnapPay API")
    .setDescription(
      "SnapPay is a real-time digital wallet API built with NestJS that lets users store, move, and track money instantly. It's a backend-first fintech platform designed for speed, security, and scalability.",
    )
    .setVersion("1.0")
    .addBearerAuth()
    .addTag("Auth")
    .addTag("Users")
    .addTag("Wallet")
    .addTag("Transactions")
    .addTag("Audit")
    .build();
  SwaggerModule.setup(
    "docs",
    app,
    SwaggerModule.createDocument(app, swaggerDoc),
  );


  const port = config.get("port")!;

  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(
    `Swagger Documentation is running on: http://localhost:${port}/docs`,
  );
}
bootstrap();
