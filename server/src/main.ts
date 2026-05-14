import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import helmet from "helmet";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });

  const config = app.get(ConfigService);

  app.enableCors({
    origin: config.get("corsOrigins"),
    credentials: true,
  });

  app.setGlobalPrefix("api/v1");

  app.use(helmet());


  const swaggerDoc = new DocumentBuilder()
    .setTitle("SnapPay API")
    .setDescription(
      "SnapPay is a real-time digital wallet API built with NestJS that lets users store, move, and track money instantly",
    )
    .setVersion("1.0")
    .addBearerAuth()
    .addTag("Auth")
    .addTag("Users")
    .addTag("Wallet")
    .addTag("Transactions")
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
